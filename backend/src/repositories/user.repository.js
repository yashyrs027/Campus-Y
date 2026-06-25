const pool = require("../config/db");

const getAllUsers = async () => {

    const query = `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            phone,
            gender,
            role_id,
            department_id,
            is_active,
            created_at
        FROM users
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    return result.rows;
};
const getUserById = async (userId) => {

    const query = `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            phone,
            gender,
            role_id,
            department_id,
            student_id,
            employee_id,
            is_active,
            created_at
        FROM users
        WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];
};

const updateUser = async (userId, userData) => {

    const query = `
        UPDATE users
        SET
            first_name = $1,
            last_name = $2,
            phone = $3,
            gender = $4,
            department_id = $5,
            role_id = $6,
            is_active = $7,
            updated_at = NOW()
        WHERE user_id = $8
        RETURNING
            user_id,
            first_name,
            last_name,
            email,
            phone,
            gender,
            role_id,
            department_id,
            is_active,
            updated_at;
    `;

    const values = [
        userData.first_name,
        userData.last_name,
        userData.phone,
        userData.gender,
        userData.department_id,
        userData.role_id,
        userData.is_active,
        userId
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const deleteUser = async (userId) => {

    const query = `
        UPDATE users
        SET
            is_active = false,
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING
            user_id,
            first_name,
            last_name,
            email,
            is_active;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];
};

module.exports = {getAllUsers, getUserById,updateUser,deleteUser};