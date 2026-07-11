const express = require("express");

const router = express.Router();

const proposalController =
require("../controllers/proposal.controller");

const authenticate =
require("../middlewares/auth.middleware");

const authorize =
require("../middlewares/rbac.middleware");

const ROLES =
require("../constants/roles");

const {
    createProposalValidation
} = require("../validators/proposal.validator");

router.post(
    "/",
    authenticate,
    authorize([
        ROLES.CLUB_COORDINATOR,
        ROLES.VICE_PRESIDENT,
        ROLES.ADMIN
    ]),
    createProposalValidation,
    proposalController.createProposal
);
router.get(
    "/",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY,
        ROLES.HOD,
        ROLES.CLUB_COORDINATOR,
        ROLES.VICE_PRESIDENT
    ]),
    proposalController.getAllProposals
);

router.get(
    "/:id",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY,
        ROLES.CLUB_COORDINATOR,
        ROLES.VICE_PRESIDENT
    ]),
    proposalController.getProposalById
);

router.put(
    "/:id",
    authenticate,
    authorize([
        ROLES.CLUB_COORDINATOR,
        ROLES.VICE_PRESIDENT
    ]),
    proposalController.updateProposal
);

router.delete(
    "/:id",
    authenticate,
    authorize([
        ROLES.CLUB_COORDINATOR,
        ROLES.VICE_PRESIDENT
    ]),
    proposalController.deleteProposal
);

router.put(
    "/:id/approve",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY,
        ROLES.HOD
    ]),
    proposalController.approveProposal
);
router.put(
    "/:id/reject",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY,
        ROLES.HOD
    ]),
    proposalController.rejectProposal
);
module.exports = router;