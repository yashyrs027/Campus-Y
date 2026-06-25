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
        ROLES.CLUB_COORDINATOR
    ]),
    createProposalValidation,
    proposalController.createProposal
);
router.get(
    "/",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY
    ]),
    proposalController.getAllProposals
);

router.get(
    "/:id",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY,
        ROLES.CLUB_COORDINATOR
    ]),
    proposalController.getProposalById
);

router.put(
    "/:id",
    authenticate,
    authorize([ROLES.CLUB_COORDINATOR]),
    proposalController.updateProposal
);

router.delete(
    "/:id",
    authenticate,
    authorize([ROLES.CLUB_COORDINATOR]),
    proposalController.deleteProposal
);

router.put(
    "/:id/approve",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY
    ]),
    proposalController.approveProposal
);
router.put(
    "/:id/reject",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY
    ]),
    proposalController.rejectProposal
);
module.exports = router;