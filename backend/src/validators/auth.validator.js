const { body, validationResult } = require("express-validator");

// Validation rules
const registerValidation = [
    body("first_name")
        .trim()
        .notEmpty()
        .withMessage("First name is required"),

    body("last_name")
        .trim()
        .notEmpty()
        .withMessage("Last name is required"),

    body("email")
        .isEmail()
        .withMessage("Please provide a valid email"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),

    body("department_id")
        .notEmpty()
        .withMessage("Department is required"),

    body("role_id")
        .custom((value) => Number(value) === 6)
        .withMessage("Public registration is available for students only"),

    body("gender")
        .isIn(["Male", "Female", "Other"])
        .withMessage("Gender is required")
];

const loginValidation = [
    body("email")
        .isEmail()
        .withMessage("Valid email is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
];
// Validation middleware
const validate = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

const updateProfileValidation = [

    body("first_name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("First name cannot be empty"),

    body("last_name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Last name cannot be empty"),

    body("phone")
        .optional()
        .isMobilePhone()
        .withMessage("Invalid phone number"),

    body("gender")
        .optional()
        .isIn(["Male", "Female", "Other"])
        .withMessage("Invalid gender"),

    body("profile_image")
        .optional({ checkFalsy: true })
        .custom((value) => {
            const isHttp = value.startsWith('http://') || value.startsWith('https://');
            const isDataUri = value.startsWith('data:image/');
            if (!isHttp && !isDataUri) {
                throw new Error("Profile image must be a valid URL or base64 image data URI");
            }
            return true;
        })

];
const changePasswordValidation = [

    body("old_password")
        .notEmpty()
        .withMessage("Old password is required"),

    body("new_password")
        .isLength({ min: 8 })
        .withMessage("New password must be at least 8 characters")

];

module.exports = {
    registerValidation,loginValidation,updateProfileValidation,changePasswordValidation,validate
};
