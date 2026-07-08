const catalogService = require("../services/catalog.service");
const { sendSuccess } = require("../utils/response");

const getCatalog = async (req, res, next) => {
    try {
        const catalog = await catalogService.getCatalog();

        return sendSuccess(
            res,
            200,
            "Catalog fetched successfully.",
            catalog
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCatalog
};
