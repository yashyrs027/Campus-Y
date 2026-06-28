const departmentRepository = require("../repositories/department.repository");
const ApiError = require("../utils/ApiError");

const getAllDepartments = async () => {
    return await departmentRepository.getAllDepartments();
};

const createDepartment = async (departmentData) => {

    const existingDepartment =
        await departmentRepository.findDepartment(
            departmentData.department_name,
            departmentData.department_code
        );

    if (existingDepartment) {
        throw new ApiError(
            409,
            "Department already exists."
        );
    }

    const department =
        await departmentRepository.createDepartment(departmentData);

    if (!department) {
        throw new ApiError(
            500,
            "Department could not be created."
        );
    }

    return department;
};

const updateDepartment = async (
    departmentId,
    departmentData
) => {

    // Check duplicate (excluding current department)
    const existingDepartment =
        await departmentRepository.findDepartmentForUpdate(
            departmentId,
            departmentData.department_name,
            departmentData.department_code
        );

    if (existingDepartment) {
        throw new ApiError(
            409,
            "Department already exists."
        );
    }

    // Update department
    const department =
        await departmentRepository.updateDepartment(
            departmentId,
            departmentData
        );

    if (!department) {
        throw new ApiError(
            404,
            "Department not found."
        );
    }

    return department;
};

const deleteDepartment = async (departmentId) => {

    const department =
        await departmentRepository.deleteDepartment(departmentId);

    if (!department) {
        throw new ApiError(
            404,
            "Department not found."
        );
    }

    return department;
};

module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,deleteDepartment
};