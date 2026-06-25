const proposalService = require("../services/proposal.service");

const createProposal = async (req, res, next) => {

    try {

        const proposalData = {
            ...req.body,
            created_by: req.user.user_id
        };

        const proposal =
            await proposalService.createProposal(
                proposalData
            );

        return res.status(201).json({
            success: true,
            message: "Proposal created successfully.",
            data: proposal
        });

    } catch (error) {
        next(error);
    }

};

const getAllProposals = async (req, res, next) => {

    try {

        const proposals =
            await proposalService.getAllProposals();

        return res.status(200).json({
            success: true,
            message: "Proposals fetched successfully.",
            data: proposals
        });

    } catch (error) {
        next(error);
    }

};
const getProposalById = async (req, res, next) => {

    try {

        const proposal =
            await proposalService.getProposalById(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Proposal fetched successfully.",
            data: proposal
        });

    } catch (error) {
        next(error);
    }

};

const updateProposal = async (req, res, next) => {

    try {

        const proposal = await proposalService.updateProposal(
    req.params.id,
    req.body,
    req.user.user_id
);

        return res.status(200).json({
            success: true,
            message: "Proposal updated successfully.",
            data: proposal
        });

    } catch (error) {
        next(error);
    }

};

const deleteProposal = async (req, res, next) => {

    try {

        await proposalService.deleteProposal(
            req.params.id,
            req.user.user_id
        );

        return res.status(200).json({
            success: true,
            message: "Proposal deleted successfully."
        });

    } catch (error) {
        next(error);
    }

};
const approveProposal = async (req, res, next) => {

    try {

        const proposal =
            await proposalService.approveProposal(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Proposal approved successfully.",
            data: proposal
        });

    } catch (error) {
        next(error);
    }

};
const rejectProposal = async (req, res, next) => {

    try {

        const proposal =
            await proposalService.rejectProposal(
                req.params.id,
                req.body.rejection_reason
            );

        return res.status(200).json({
            success: true,
            message: "Proposal rejected successfully.",
            data: proposal
        });

    } catch (error) {
        next(error);
    }

};

module.exports = {
    createProposal,getAllProposals,getProposalById,updateProposal,deleteProposal
    ,approveProposal,rejectProposal
};