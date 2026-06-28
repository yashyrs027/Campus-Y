const proposalRepository = require("../repositories/proposal.repository");
const ApiError = require("../utils/ApiError");

const createProposal = async (proposalData) => {

    const proposal = await proposalRepository.createProposal(
        proposalData
    );

    if (!proposal) {
        throw new ApiError(
            500,
            "Proposal could not be created."
        );
    }

    return proposal;

};
const getAllProposals = async () => {
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
const approveProposal = async (proposalId) => {

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
            "Only pending proposals can be approved."
        );
    }

    return await proposalRepository.approveProposal(proposalId);
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