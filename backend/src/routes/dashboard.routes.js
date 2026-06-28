const express = require("express");

const router = express.Router();

const dashboardController =
require("../controllers/dashboard.controller");

const authenticate =
require("../middlewares/auth.middleware");

const authorize =
require("../middlewares/rbac.middleware");

const ROLES =
require("../constants/roles");

router.get(
    "/admin",
    authenticate,
    authorize([ROLES.ADMIN]),
    dashboardController.getAdminDashboard
);
router.get(
    "/student",
    authenticate,
    authorize([ROLES.STUDENT]),
    dashboardController.getStudentDashboard
);
router.get(
    "/faculty",
    authenticate,
    authorize("3"),
    dashboardController.getFacultyDashboard
);
router.get(
    "/club",
    authenticate,
    authorize([ROLES.CLUB_PRESIDENT]),
    dashboardController.getClubDashboard
);

module.exports = router;