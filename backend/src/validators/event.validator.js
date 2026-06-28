const { body } = require("express-validator");

const createEventValidator = [

    body("proposal_id")
        .isInt(),

    body("category_id")
        .isInt(),

    body("title")
        .notEmpty(),

    body("description")
        .notEmpty(),

    body("venue")
        .notEmpty(),

    body("start_datetime")
        .isISO8601(),

    body("end_datetime")
        .isISO8601(),

    body("capacity")
        .isInt({ min: 1 }),

    body("registration_deadline")
        .isISO8601()
];

module.exports = {
    createEventValidator
};