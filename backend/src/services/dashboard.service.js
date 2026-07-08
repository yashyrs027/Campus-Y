const dashboardRepository = require("../repositories/dashboard.repository");

const getAdminDashboard = async () => {

    const data =
        await dashboardRepository.getAdminDashboard();

    return {
        total_users: Number(data.total_users),
        total_students: Number(data.total_students),
        total_hods: Number(data.total_hods),
        total_faculty: Number(data.total_faculty),
        total_club_coordinators: Number(data.total_club_coordinators),
        total_events: Number(data.total_events),
        published_events: Number(data.published_events),
        pending_proposals: Number(data.pending_proposals),
        approved_proposals: Number(data.approved_proposals),
        total_registrations: Number(data.total_registrations)
    };

};
const getStudentDashboard = async (userId) => {

    const profile =
        await dashboardRepository.getStudentProfile(userId);

    const registeredEvents =
        await dashboardRepository.countMyRegistrations(userId);

    const upcomingEvents =
        await dashboardRepository.getUpcomingEvents();

    const myRegistrations =
        await dashboardRepository.getStudentRegistrations(userId);

    return {

        profile,

        registered_events:
            Number(registeredEvents),

        upcoming_events:
            upcomingEvents,

        my_registrations:
            myRegistrations

    };

};
const getFacultyDashboard = async (userId) => {

    const pending =
        await dashboardRepository.countPendingProposals();

    const approved =
        await dashboardRepository.countApprovedProposals();

    const events =
        await dashboardRepository.countFacultyEvents(userId);

    const registrations =
        await dashboardRepository.getRecentRegistrations(userId);

    return {
        pending_proposals: pending,
        approved_proposals: approved,
        events_created: events,
        recent_registrations: registrations
    };

};


const getClubDashboard = async (userId) => {

    const myProposals =
        await dashboardRepository.getMyProposalsCount(userId);

    const proposalStatus =
        await dashboardRepository.getProposalStatus(userId);

    const myEvents =
        await dashboardRepository.getMyEventsCount(userId);

    const studentRegistrations =
        await dashboardRepository.getMyEventRegistrationCount(userId);

    return {

        my_proposals: Number(myProposals.total),

        proposal_status: {

            pending: Number(proposalStatus.pending),

            approved: Number(proposalStatus.approved),

            rejected: Number(proposalStatus.rejected)

        },

        my_events: Number(myEvents.total),

        student_registrations:
            Number(studentRegistrations.total)

    };

};

module.exports = {
    getAdminDashboard,
    getStudentDashboard,getFacultyDashboard,getClubDashboard
};
