const pool = require("../config/db");

const getAdminDashboard = async () => {

    const result = await pool.query(`
        SELECT

        (SELECT COUNT(*) FROM users)
            AS total_users,

        (SELECT COUNT(*)
         FROM users
         WHERE role_id = 6)
            AS total_students,

        (SELECT COUNT(*)
         FROM users
         WHERE role_id = 2)
            AS total_hods,

        (SELECT COUNT(*)
         FROM users
         WHERE role_id = 3)
            AS total_faculty,

        (SELECT COUNT(*)
         FROM users
         WHERE role_id IN (4,5))
            AS total_club_coordinators,

        (SELECT COUNT(*)
         FROM events)
            AS total_events,

        (SELECT COUNT(*)
         FROM events
         WHERE status='Published')
            AS published_events,

        (SELECT COUNT(*)
         FROM event_proposals
         WHERE status='Pending')
            AS pending_proposals,

        (SELECT COUNT(*)
         FROM event_proposals
         WHERE status='Approved')
            AS approved_proposals,

        (SELECT COUNT(*)
         FROM event_registrations)
            AS total_registrations
    `);

    return result.rows[0];
};
const getStudentProfile = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            u.user_id,
            u.first_name,
            u.last_name,
            u.email,
            d.department_name
        FROM users u
        LEFT JOIN departments d
            ON u.department_id = d.department_id
        WHERE u.user_id = $1
        `,
        [userId]
    );

    return result.rows[0];

};
const countMyRegistrations = async (userId) => {

    const result = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM event_registrations
        WHERE student_id = $1
        `,
        [userId]
    );

    return result.rows[0].total;

};
const getUpcomingEvents = async () => {

    const result = await pool.query(
        `
        SELECT
            event_id,
            title,
            start_datetime,
            venue
        FROM events
        WHERE status='Published'
        AND start_datetime >= CURRENT_DATE
        ORDER BY start_datetime
        LIMIT 5
        `
    );

    return result.rows;

};
const getStudentRegistrations = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            er.registration_id,
            e.title,
            er.status
        FROM event_registrations er
        JOIN events e
            ON er.event_id = e.event_id
        WHERE er.student_id = $1
        ORDER BY er.registration_date DESC
        `,
        [userId]
    );

    return result.rows;

};
const countPendingProposals = async () => {

    const result = await pool.query(`
        SELECT COUNT(*) AS total
        FROM event_proposals
        WHERE status IN (
            'Pending',
            'Under Faculty Review',
            'Under HOD Review'
        )
    `);

    return Number(result.rows[0].total);
};
const countApprovedProposals = async () => {

    const result = await pool.query(`
        SELECT COUNT(*) AS total
        FROM event_proposals
        WHERE status = 'Approved'
    `);

    return Number(result.rows[0].total);
};
const countFacultyEvents = async (userId) => {

    const result = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM events
        WHERE created_by = $1
        `,
        [userId]
    );

    return Number(result.rows[0].total);
};
const getRecentRegistrations = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            er.registration_id,
            CONCAT(u.first_name,' ',u.last_name) AS student_name,
            e.title AS event_title,
            er.registration_date
        FROM event_registrations er
        JOIN users u
            ON er.student_id = u.user_id
        JOIN events e
            ON er.event_id = e.event_id
        WHERE e.created_by = $1
        ORDER BY er.registration_date DESC
        LIMIT 5
        `,
        [userId]
    );

    return result.rows;
};

const getMyProposalsCount = async (userId) => {

    const result = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM event_proposals
        WHERE created_by = $1
        `,
        [userId]
    );

    return result.rows[0];

};
const getProposalStatus = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
            COUNT(*) FILTER (WHERE status = 'Approved') AS approved,
            COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected
        FROM event_proposals
        WHERE created_by = $1
        `,
        [userId]
    );

    return result.rows[0];

};
const getMyEventsCount = async (userId) => {

    const result = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM events
        WHERE created_by = $1
        `,
        [userId]
    );

    return result.rows[0];

};
const getMyEventRegistrationCount = async (userId) => {

    const result = await pool.query(
        `
        SELECT COUNT(er.registration_id) AS total
        FROM event_registrations er
        JOIN events e
            ON er.event_id = e.event_id
        WHERE e.created_by = $1
        `,
        [userId]
    );

    return result.rows[0];

};

const countCertificates = async (studentId) => {
    const result = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM event_registrations er
        JOIN events e ON er.event_id = e.event_id
        WHERE er.student_id = $1
          AND er.status = 'Registered'
          AND e.end_datetime < NOW()
        `,
        [studentId]
    );
    return Number(result.rows[0].total);
};

const countReviewsPerformed = async (roleId, departmentId) => {
    const role = Number(roleId);
    if (role === 3) {
        const result = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM event_proposals ep
            JOIN clubs c ON ep.club_id = c.club_id
            WHERE c.department_id = $1
              AND (ep.status IN ('Under HOD Review', 'Pending', 'Approved') OR (ep.status = 'Rejected' AND ep.rejected_by_role = 3))
            `,
            [departmentId]
        );
        return Number(result.rows[0].total);
    }
    if (role === 2) {
        const result = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM event_proposals ep
            JOIN clubs c ON ep.club_id = c.club_id
            WHERE c.department_id = $1
              AND (ep.status IN ('Pending', 'Approved') OR (ep.status = 'Rejected' AND ep.rejected_by_role = 2))
            `,
            [departmentId]
        );
        return Number(result.rows[0].total);
    }
    if (role === 1) {
        const result = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM event_proposals ep
            WHERE ep.status = 'Approved' OR (ep.status = 'Rejected' AND ep.rejected_by_role = 1)
            `
        );
        return Number(result.rows[0].total);
    }
    return 0;
};

module.exports = {
    getAdminDashboard,getStudentProfile,countMyRegistrations,getUpcomingEvents,getStudentRegistrations,countPendingProposals,countApprovedProposals,countFacultyEvents,getRecentRegistrations,getMyProposalsCount,getProposalStatus,getMyEventsCount,getMyEventRegistrationCount,countCertificates,countReviewsPerformed
};
