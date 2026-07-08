const catalogRepository = require("../repositories/catalog.repository");

const getCatalog = async () => {
    const [departments, clubs, eventCategories] = await Promise.all([
        catalogRepository.getDepartments(),
        catalogRepository.getClubs(),
        catalogRepository.getEventCategories()
    ]);

    return {
        departments,
        clubs,
        event_categories: eventCategories
    };
};

module.exports = {
    getCatalog
};
