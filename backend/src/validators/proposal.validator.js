const { body, validationResult } = require("express-validator");

const createProposalValidation = [

    body("club_id").isInt(),

    body("category_id").isInt(),

    body("title").notEmpty(),

    body("description").notEmpty(),

    body("venue").notEmpty(),

    body("start_date").isDate(),

    body("end_date").isDate(),

    body("start_time")
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
        .withMessage("Start time must be in HH:MM format"),

    body("end_time")
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
        .withMessage("End time must be in HH:MM format"),

    body("registration_deadline").isISO8601(),

    body("expected_participants")
        .isInt({ min: 1 })
        .withMessage("Expected participants must be greater than 0"),

    body("banner")
        .optional({ checkFalsy: true }),

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
    createProposalValidation
};