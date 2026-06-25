const departmentService = require("../services/department.service");

const getAllDepartments = async (req, res, next) => {

    try {

        const departments = await departmentService.getAllDepartments();

        return res.status(200).json({
            success: true,
            message: "Departments fetched successfully.",
            data: departments
        });

    } catch (error) {
        next(error);
    }

};
const createDepartment = async (req, res, next) => {

    try {

        const department =
            await departmentService.createDepartment(req.body);

        return res.status(201).json({
            success: true,
            message: "Department created successfully.",
            data: department
        });

    } catch (error) {
        next(error);
    }

};
const updateDepartment = async (req, res, next) => {

    try {

        const department =
            await departmentService.updateDepartment(
                req.params.id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: "Department updated successfully.",
            data: department
        });

    } catch (error) {
        next(error);
    }

};
const deleteDepartment = async (req, res, next) => {

    try {

        await departmentService.deleteDepartment(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully."
        });

    } catch (error) {
        next(error);
    }

};

module.exports = {
    getAllDepartments,createDepartment,updateDepartment,deleteDepartment
};