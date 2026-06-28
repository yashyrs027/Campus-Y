const express = require("express");

const router = express.Router();

const eventController =
require("../controllers/event.controller");

const authenticate =
require("../middlewares/auth.middleware");

const authorize =
require("../middlewares/rbac.middleware");

const ROLES =
require("../constants/roles");

router.post(
    "/",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY
    ]),
    eventController.createEvent
);
router.get(
    "/",
    authenticate,
    eventController.getAllEvents
);
router.get(
    "/:id",
    authenticate,
    eventController.getEventById
);
router.put(
    "/:id",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY
    ]),
    eventController.updateEvent
);
router.delete(
    "/:id",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY
    ]),
    eventController.deleteEvent
);  

module.exports = router;