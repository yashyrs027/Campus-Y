const dashboardService =
require("../services/dashboard.service");

const { sendSuccess } =
require("../utils/response");

const getAdminDashboard = async (
    req,
    res,
    next
) => {

    try {

        const data =
            await dashboardService.getAdminDashboard();

        return sendSuccess(
            res,
            200,
            "Dashboard fetched successfully.",
            data
        );

    } catch (error) {

        next(error);

    }

};

const getStudentDashboard = async (
    req,
    res,
    next
) => {

    try {

        const dashboard =
            await dashboardService.getStudentDashboard(
                req.user.user_id
            );

        return sendSuccess(
            res,
            200,
            "Student dashboard fetched successfully.",
            dashboard
        );

    } catch (error) {

        next(error);

    }

};
const getFacultyDashboard = async (
    req,
    res,
    next
) => {

    try {

        const dashboard =
            await dashboardService.getFacultyDashboard(
                req.user.user_id
            );

        return sendSuccess(
            res,
            200,
            "Faculty dashboard fetched successfully.",
            dashboard
        );

    } catch (error) {

        next(error);

    }

};

const getClubDashboard = async (req,res,next)=>{

    try{

        const dashboard =
            await dashboardService.getClubDashboard(
                req.user.user_id
            );

        return sendSuccess(
            res,
            200,
            "Club dashboard fetched successfully.",
            dashboard
        );

    }catch(error){

        next(error);

    }

};
module.exports = {
    getAdminDashboard,getStudentDashboard,getFacultyDashboard,getClubDashboard
};