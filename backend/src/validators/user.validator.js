const { body,validationResult} = require("express-validator");

const updateUserValidation = [
    body("first_name").notEmpty(),
    body("last_name").notEmpty(),
    body("phone").notEmpty(),
    body("gender").isIn(["Male", "Female", "Other"]),
    body("department_id").isInt(),
    body("role_id").isInt(),
    body("is_active").isBoolean(),
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
module.exports={updateUserValidation}