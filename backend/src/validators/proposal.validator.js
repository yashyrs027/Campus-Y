const { body, validationResult } = require("express-validator");

const createProposalValidation = [

    body("club_id").isInt(),

    body("category_id").isInt(),

    body("title").notEmpty(),

    body("description").notEmpty(),

    body("venue").notEmpty(),

    body("start_date").isDate(),

    body("end_date").isDate(),

    body("expected_participants")
        .isInt({ min: 1 }),

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