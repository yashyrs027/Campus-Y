    const proposalRepository = require("../repositories/proposal.repository");
    const eventRepository = require("../repositories/event.repository");
    const ApiError = require("../utils/ApiError");
    const { validateProposalSchedule } = require("../utils/proposalSchedule");

const createEventFromProposal = async (proposal) => {
    const existing = await eventRepository.findEventByProposal(proposal.proposal_id);
    if (existing) {
        return;
    }

    const { start, end, registrationDeadline } = validateProposalSchedule(proposal);

    await eventRepository.createEvent({
        proposal_id: proposal.proposal_id,
        category_id: proposal.category_id,
        created_by: proposal.created_by,
        title: proposal.title?.trim() || "Untitled Event",
        description: proposal.description?.trim() || "No description provided.",
        venue: proposal.venue?.trim() || "Main Campus",
        start_datetime: start,
        end_datetime: end,
        capacity: Number(proposal.expected_participants) || 100,
        registration_deadline: registrationDeadline,
        status: "Published"
    });
};

    const createProposal = async (proposalData, creator) => {
        validateProposalSchedule(proposalData);

        if (creator && Number(creator.role_id) === 1) {
            proposalData.status = 'Pending';
        } else {
            proposalData.status = 'Under Faculty Review';
        }

        const proposal = await proposalRepository.createProposal(
            proposalData
        );

        if (!proposal) {
            throw new ApiError(
                500,
                "Proposal could not be created."
            );
        }

        if (creator && Number(creator.role_id) === 1) {
            await createEventFromProposal(proposal);
            return await proposalRepository.approveProposal(proposal.proposal_id);
        }

        return proposal;
    };
    const getAllProposals = async (user) => {
        if (!user) {
            return [];
        }

        const roleId = Number(user.role_id);

        if ([4, 5].includes(roleId)) {
            return await proposalRepository.getProposalsByUserId(user.user_id);
        }

        const allProposals = await proposalRepository.getAllProposals();

        // Faculty (role 3)
        if (roleId === 3) {
            return allProposals.filter(p => {
                if (p.status === 'Under Faculty Review' || p.status === 'Approved') {
                    return true;
                }
                if (p.status === 'Rejected') {
                    return p.rejected_by_role === 3;
                }
                return false;
            });
        }

        // HOD (role 2)
        if (roleId === 2) {
            return allProposals.filter(p => {
                if (p.status === 'Under HOD Review' || p.status === 'Approved') {
                    return true;
                }
                if (p.status === 'Rejected') {
                    return p.rejected_by_role === 2;
                }
                return false;
            });
        }

        // Admin (role 1) — sees full pipeline for monitoring
        if (roleId === 1) {
            return allProposals;
        }

        return allProposals;
    };

    const getProposalById = async (proposalId) => {

        const proposal =
            await proposalRepository.getProposalById(proposalId);

        if (!proposal) {
            throw new ApiError(
                404,
                "Proposal not found."
            );
        }

        return proposal;
    };

    const updateProposal = async (
        proposalId,
        proposalData,
        userId
    ) => {

        const proposal =
            await proposalRepository.getProposalById(proposalId);

        if (!proposal) {
            throw new ApiError(404, "Proposal not found.");
        }

        if (proposal.created_by != userId) {
            throw new ApiError(
                403,
                "You can only update your own proposal."
            );
        }

        if (proposal.status !== "Under Faculty Review") {
            throw new ApiError(
                400,
                "Only club presidents can update proposals awaiting faculty review."
            );
        }

        return await proposalRepository.updateProposal(
            proposalId,
            proposalData
        );
    };
    const deleteProposal = async (proposalId, userId) => {

        const proposal =
            await proposalRepository.getProposalById(proposalId);

        if (!proposal) {
            throw new ApiError(
                404,
                "Proposal not found."
            );
        }

        if (proposal.created_by != userId) {
            throw new ApiError(
                403,
                "You can only delete your own proposal."
            );
        }

        if (proposal.status !== "Under Faculty Review") {
            throw new ApiError(
                400,
                "Only proposals awaiting faculty review can be deleted."
            );
        }

        await proposalRepository.deleteProposal(proposalId);

    };
    const approveProposal = async (proposalId, user) => {

        const proposal =
            await proposalRepository.getProposalById(proposalId);

        if (!proposal) {
            throw new ApiError(
                404,
                "Proposal not found."
            );
        }

        const reviewerRole = Number(user.role_id);

        // Level 1: Faculty Approval (role 3)
        if (reviewerRole === 3) {
            if (proposal.status !== "Under Faculty Review") {
                throw new ApiError(
                    400,
                    "Proposal is not awaiting Faculty approval."
                );
            }
            return await proposalRepository.updateProposalStatus(proposalId, "Under HOD Review");
        }

        // Level 2: HOD Approval (role 2)
        if (reviewerRole === 2) {
            if (proposal.status !== "Under HOD Review") {
                throw new ApiError(
                    400,
                    "Proposal is not awaiting HOD approval."
                );
            }
            return await proposalRepository.updateProposalStatus(proposalId, "Pending");
        }

        // Level 3: Admin Approval (role 1)
        if (reviewerRole === 1) {
            if (proposal.status !== "Pending") {
                throw new ApiError(
                    400,
                    "Proposal is not awaiting Admin approval."
                );
            }

            validateProposalSchedule(proposal);
            await createEventFromProposal(proposal);

            const approvedProposal = await proposalRepository.approveProposal(proposalId);

            return approvedProposal;
        }

        throw new ApiError(
            403,
            "You do not have permission to approve proposals."
        );
    };
    const rejectProposal = async (proposalId, rejectionReason, user) => {

        const proposal =
            await proposalRepository.getProposalById(proposalId);

        if (!proposal) {
            throw new ApiError(
                404,
                "Proposal not found."
            );
        }

        const reviewerRole = Number(user.role_id);
        const allowedStatusByRole = {
            3: "Under Faculty Review",
            2: "Under HOD Review",
            1: "Pending",
        };

        const requiredStatus = allowedStatusByRole[reviewerRole];
        if (!requiredStatus || proposal.status !== requiredStatus) {
            throw new ApiError(
                400,
                "Proposal is not in your review queue."
            );
        }

        return await proposalRepository.rejectProposal(
            proposalId,
            rejectionReason,
            Number(user.role_id)
        );
    };

    const publishMissingApprovedEvents = async () => {
        const proposals = await proposalRepository.getApprovedProposalsWithoutEvents();

        for (const proposal of proposals) {
            try {
                await createEventFromProposal(proposal);
            } catch (error) {
                console.error(
                    `Failed to publish approved proposal ${proposal.proposal_id}:`,
                    error.message
                );
            }
        }
    };

    module.exports = {
        createProposal,getAllProposals,getProposalById,updateProposal,deleteProposal,
        approveProposal,rejectProposal,publishMissingApprovedEvents
    };