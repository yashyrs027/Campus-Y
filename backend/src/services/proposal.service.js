const proposalRepository = require("../repositories/proposal.repository");
const eventRepository = require("../repositories/event.repository");
const ApiError = require("../utils/ApiError");

const createEventFromProposal = async (proposal) => {
    const existing = await eventRepository.findEventByProposal(proposal.proposal_id);
    if (existing) {
        return;
    }

    await eventRepository.createEvent({
        proposal_id: proposal.proposal_id,
        category_id: proposal.category_id,
        created_by: proposal.created_by,
        title: proposal.title,
        description: proposal.description,
        venue: proposal.venue,
        start_datetime: proposal.start_date,
        end_datetime: proposal.end_date,
        capacity: Number(proposal.expected_participants) || 100,
        registration_deadline: proposal.start_date,
        status: "Published"
    });
};

const createProposal = async (proposalData, creator) => {
    if (creator && Number(creator.role_id) === 1) {
        proposalData.status = 'Approved';
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

    if (proposal.status === 'Approved') {
        await createEventFromProposal(proposal);
    }

    return proposal;
};
const getAllProposals = async (user) => {
    if (user && [4, 5].includes(Number(user.role_id))) {
        return await proposalRepository.getProposalsByUserId(user.user_id);
    }
    return await proposalRepository.getAllProposals();
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

    if (proposal.status !== "Pending") {
        throw new ApiError(
            400,
            "Only pending proposals can be updated."
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

    if (proposal.status !== "Pending") {
        throw new ApiError(
            400,
            "Only pending proposals can be deleted."
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
        if (proposal.status !== "Under Faculty Review" && proposal.status !== "Pending") {
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
        if (!["Pending", "Under Faculty Review", "Under HOD Review"].includes(proposal.status)) {
            throw new ApiError(
                400,
                "Proposal is not awaiting Admin approval."
            );
        }

        const approvedProposal = await proposalRepository.approveProposal(proposalId);

        // Automatically add to the public 'Events' page
        await createEventFromProposal(approvedProposal);

        return approvedProposal;
    }

    throw new ApiError(
        403,
        "You do not have permission to approve proposals."
    );
};
const rejectProposal = async (
    proposalId,
    rejectionReason
) => {

    const proposal =
        await proposalRepository.getProposalById(proposalId);

    if (!proposal) {
        throw new ApiError(
            404,
            "Proposal not found."
        );
    }

    if (proposal.status !== "Pending") {
        throw new ApiError(
            400,
            "Only pending proposals can be rejected."
        );
    }

    return await proposalRepository.rejectProposal(
        proposalId,
        rejectionReason
    );

};

module.exports = {
    createProposal,getAllProposals,getProposalById,updateProposal,deleteProposal,
    approveProposal,rejectProposal
};