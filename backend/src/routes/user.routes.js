const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const ROLES = require("../constants/roles");
const {updateUserValidation,validate}=require("../validators/user.validator");


router.get(
    "/",
    authenticate,
    authorize([ROLES.ADMIN, ROLES.FACULTY]),
    userController.getAllUsers
);
router.get(
    "/:id",
    authenticate,
    authorize([ROLES.ADMIN, ROLES.FACULTY]),
    userController.getUserById
);
router.put(
    "/assign-role",
    authenticate,
    authorize([ROLES.ADMIN]),
    userController.assignRole
);

router.put(
    "/:id",
    authenticate,
    authorize([ROLES.ADMIN]),
    updateUserValidation,
    userController.updateUser
);
router.delete(
    "/:id",
    authenticate,
    authorize([ROLES.ADMIN]),
    userController.deleteUser
);


module.exports = router;