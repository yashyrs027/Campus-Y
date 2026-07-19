const pool = require("../config/db");

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT *
        FROM users
        WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};

/**
 * Create new user
 */
const createUser = async (userData) => {
    const query = `
        INSERT INTO users (
            department_id,
            role_id,
            first_name,
            last_name,
            email,
            password_hash,
            phone,
            gender,
            student_id,
            employee_id
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        RETURNING
            user_id,
            department_id,
            role_id,
            first_name,
            last_name,
            email,
            phone,
            gender,
            student_id,
            employee_id,
            is_verified,
            is_active,
            created_at;
    `;

    const values = [
        userData.department_id,
        userData.role_id,
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.password_hash,
        userData.phone || null,
        userData.gender || null,
        userData.student_id || null,
        userData.employee_id || null
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const findUserById = async (userId) => {
    const query = `
        SELECT
            user_id,
            department_id,
            role_id,
            first_name,
            last_name,
            email,
            phone,
            profile_image,
            gender,
            student_id,
            employee_id,
            is_verified,
            is_active,
            created_at,
            updated_at
        FROM users
        WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];
};

const updateProfile = async (userId, userData) => {
    const query = `
        UPDATE users
        SET
            first_name = $1,
            last_name = $2,
            phone = $3,
            gender = $4,
            profile_image = $5,
            student_id = COALESCE($6, student_id),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $7
        RETURNING
            user_id,
            first_name,
            last_name,
            email,
            phone,
            gender,
            student_id,
            profile_image,
            updated_at;
    `;

    const values = [
        userData.first_name,
        userData.last_name,
        userData.phone,
        userData.gender,
        userData.profile_image,
        userData.student_id || null,
        userId
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const findPasswordByUserId = async (userId) => {
    const query = `
        SELECT password_hash
        FROM users
        WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];
};

const updatePassword = async (userId, passwordHash) => {
    const query = `
        UPDATE users
        SET
            password_hash = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
    `;

    await pool.query(query, [passwordHash, userId]);
};

module.exports = {
    findUserByEmail,
    createUser,
    findUserById,
    updateProfile,
    findPasswordByUserId,
    updatePassword
};
