const { body, validationResult } = require("express-validator");

const createDepartmentValidation = [

    body("department_name")
        .notEmpty(),

    body("department_code")
        .notEmpty(),

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        next();

    }

];
const updateDepartmentValidation = [

    body("department_name")
        .notEmpty(),

    body("department_code")
        .notEmpty(),

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        next();

    }

];

module.exports = {
    createDepartmentValidation,updateDepartmentValidation
};