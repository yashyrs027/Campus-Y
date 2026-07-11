const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const reportController = require("../controllers/report.controller");
const ROLES = require("../constants/roles");

const router = express.Router();

router.get(
    "/events",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.HOD,
        ROLES.FACULTY,
        ROLES.CLUB_COORDINATOR,
        ROLES.VICE_PRESIDENT,
    ]),
    reportController.getRegistrationReportEvents
);

router.get(
    "/events/:eventId/registrations",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.HOD,
        ROLES.FACULTY,
        ROLES.CLUB_COORDINATOR,
        ROLES.VICE_PRESIDENT,
    ]),
    reportController.getEventRegistrationReport
);

module.exports = router;
