const pool = require("../config/db");

const getDepartments = async () => {
    const result = await pool.query(`
        SELECT department_id, department_name, department_code
        FROM departments
        ORDER BY department_name
    `);

    return result.rows;
};

const getClubs = async () => {
    const result = await pool.query(`
        SELECT club_id, club_name, department_id, faculty_coordinator_id
        FROM clubs
        WHERE is_active = true
        ORDER BY club_name
    `);

    return result.rows;
};

const getEventCategories = async () => {
    const result = await pool.query(`
        SELECT category_id, category_name, description
        FROM event_categories
        WHERE is_active = true
        ORDER BY category_name
    `);

    return result.rows;
};

module.exports = {
    getDepartments,
    getClubs,
    getEventCategories
};
