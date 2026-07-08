const pool = require("../config/db");

const getAllClubs = async () => {
    const query = `
        SELECT
            c.club_id,
            c.club_name,
            c.description,
            c.is_active,
            c.department_id,
            c.faculty_coordinator_id,
            d.department_name
        FROM clubs c
        LEFT JOIN departments d ON c.department_id = d.department_id
        ORDER BY c.club_name ASC;
    `;
    const result = await pool.query(query);
    return result.rows;
};

const createClub = async (clubData) => {
    const query = `
        INSERT INTO clubs
        (
            club_name,
            description,
            department_id,
            faculty_coordinator_id,
            is_active
        )
        VALUES
        (
            $1, $2, $3, $4, true
        )
        RETURNING *;
    `;
    const values = [
        clubData.club_name,
        clubData.description || null,
        clubData.department_id,
        clubData.faculty_coordinator_id || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateClub = async (clubId, clubData) => {
    const query = `
        UPDATE clubs
        SET
            club_name = $1,
            description = $2,
            department_id = $3,
            faculty_coordinator_id = $4,
            is_active = $5,
            updated_at = NOW()
        WHERE club_id = $6
        RETURNING *;
    `;
    const values = [
        clubData.club_name,
        clubData.description || null,
        clubData.department_id,
        clubData.faculty_coordinator_id || null,
        clubData.is_active !== undefined ? clubData.is_active : true,
        clubId
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    getAllClubs,
    createClub,
    updateClub
};
