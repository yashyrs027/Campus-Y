const express = require("express");
const router = express.Router();

const clubController = require("../controllers/club.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const ROLES = require("../constants/roles");

router.get(
    "/",
    authenticate,
    clubController.getAllClubs
);

router.post(
    "/",
    authenticate,
    authorize([ROLES.ADMIN]),
    clubController.createClub
);

router.put(
    "/:id",
    authenticate,
    authorize([ROLES.ADMIN]),
    clubController.updateClub
);

module.exports = router;
