const pool = require("../config/db");

const getAllDepartments = async () => {

    const query = `
        SELECT
            department_id,
            department_name,
            department_code,
            created_at
        FROM departments
        ORDER BY department_name;
    `;

    const result = await pool.query(query);

    return result.rows;
};
const findDepartment = async (department_name, department_code) => {

    const query = `
        SELECT *
        FROM departments
        WHERE department_name = $1
           OR department_code = $2
    `;

    const result = await pool.query(query, [
        department_name,
        department_code
    ]);

    return result.rows[0];
};
const createDepartment = async (departmentData) => {

    const query = `
        INSERT INTO departments
        (
            department_name,
            department_code
        )
        VALUES
        (
            $1,
            $2
        )
        RETURNING *;
    `;

    const values = [
        departmentData.department_name,
        departmentData.department_code
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};
const findDepartmentForUpdate = async (
    departmentId,
    department_name,
    department_code
) => {

    const query = `
        SELECT *
        FROM departments
        WHERE
        (
            LOWER(department_name)=LOWER($1)
            OR LOWER(department_code)=LOWER($2)
        )
        AND department_id <> $3
    `;

    const result = await pool.query(query, [
        department_name,
        department_code,
        departmentId
    ]);

    return result.rows[0];

};
const updateDepartment = async (
    departmentId,
    departmentData
) => {

    const query = `
        UPDATE departments
        SET
            department_name = $1,
            department_code = $2
        WHERE department_id = $3
        RETURNING *;
    `;

    const result = await pool.query(query, [
        departmentData.department_name,
        departmentData.department_code,
        departmentId
    ]);

    return result.rows[0];

};

const deleteDepartment = async (departmentId) => {

    const query = `
        DELETE FROM departments
        WHERE department_id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [departmentId]);

    return result.rows[0];
};

module.exports = {
    getAllDepartments,findDepartment,createDepartment,findDepartmentForUpdate,updateDepartment,deleteDepartment
};