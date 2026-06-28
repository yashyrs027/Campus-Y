const express = require("express");

const router = express.Router();

const authenticate =
require("../middlewares/auth.middleware");

const authorize =
require("../middlewares/rbac.middleware");

const ROLES =
require("../constants/roles");

const registrationController =
require("../controllers/registration.controller");

router.post(
    "/events/:id/register",
    authenticate,
    authorize([
        ROLES.STUDENT
    ]),
    registrationController.registerEvent
);
router.get(
    "/registrations/my",
    authenticate,
    authorize([
        ROLES.STUDENT
    ]),
    registrationController.getMyRegistrations
);
router.delete(
    "/registrations/:registrationId",
    authenticate,
    authorize([
        ROLES.STUDENT
    ]),
    registrationController.cancelRegistration
);
router.get(
    "/events/:eventId/registrations",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY
    ]),
    registrationController.getEventRegistrations
);
router.get(
    "/events/:eventId/registrations/count",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY
    ]),
    registrationController.getRegistrationCount
);

module.exports = router;