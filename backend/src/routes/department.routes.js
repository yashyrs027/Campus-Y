const express = require("express");

const router = express.Router();

const departmentController = require("../controllers/department.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const ROLES = require("../constants/roles");
const {
    createDepartmentValidation,
    updateDepartmentValidation
} = require("../validators/department.validator");

router.get(
    "/",
    authenticate,
    authorize([
        ROLES.ADMIN,
        ROLES.FACULTY,
        ROLES.CLUB_COORDINATOR,
        ROLES.STUDENT
    ]),
    departmentController.getAllDepartments
);

router.post(
    "/",
    authenticate,
    authorize([ROLES.ADMIN]),
    createDepartmentValidation,
    departmentController.createDepartment
);
router.put(
    "/:id",
    authenticate,
    authorize([ROLES.ADMIN]),
    updateDepartmentValidation,
    departmentController.updateDepartment
);
router.delete(
    "/:id",
    authenticate,
    authorize([ROLES.ADMIN]),
    departmentController.deleteDepartment
);

module.exports = router;