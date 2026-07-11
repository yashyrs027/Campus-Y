const pool = require("../config/db");

const getUserContext = async (userId) => {
    const result = await pool.query(
        `SELECT user_id, role_id, department_id
         FROM users
         WHERE user_id = $1`,
        [userId]
    );

    return result.rows[0];
};

const getEventsWithRegistrationCounts = async (userId, roleId) => {
    const user = await getUserContext(userId);
    if (!user) return [];

    const params = [];
    let accessFilter = "";

    if (roleId === 1) {
        accessFilter = "";
    } else if (roleId === 2) {
        params.push(user.department_id);
        accessFilter = `AND c.department_id = $${params.length}`;
    } else if (roleId === 3) {
        params.push(userId, user.department_id);
        accessFilter = `AND (c.faculty_coordinator_id = $1 OR c.department_id = $2)`;
    } else if ([4, 5].includes(roleId)) {
        params.push(userId);
        accessFilter = `AND ep.created_by = $${params.length}`;
    } else {
        return [];
    }

    const result = await pool.query(
        `
        SELECT
            e.event_id,
            e.title,
            e.venue,
            e.start_datetime,
            e.end_datetime,
            e.capacity,
            e.status,
            ec.category_name,
            c.club_id,
            c.club_name,
            COUNT(er.registration_id) FILTER (
                WHERE er.status = 'Registered'
            )::int AS registered
        FROM events e
        LEFT JOIN event_categories ec
            ON e.category_id = ec.category_id
        LEFT JOIN event_proposals ep
            ON e.proposal_id = ep.proposal_id
        LEFT JOIN clubs c
            ON ep.club_id = c.club_id
        LEFT JOIN event_registrations er
            ON e.event_id = er.event_id
        WHERE e.status = 'Published'
        ${accessFilter}
        GROUP BY
            e.event_id,
            ec.category_name,
            c.club_id,
            c.club_name
        ORDER BY e.start_datetime DESC
        `,
        params
    );

    return result.rows;
};

const canAccessEvent = async (eventId, userId, roleId) => {
    const user = await getUserContext(userId);
    if (!user) return false;

    const params = [eventId];
    let accessFilter = "";

    if (roleId === 1) {
        accessFilter = "";
    } else if (roleId === 2) {
        params.push(user.department_id);
        accessFilter = `AND c.department_id = $${params.length}`;
    } else if (roleId === 3) {
        params.push(userId, user.department_id);
        accessFilter = `AND (c.faculty_coordinator_id = $2 OR c.department_id = $3)`;
    } else if ([4, 5].includes(roleId)) {
        params.push(userId);
        accessFilter = `AND ep.created_by = $${params.length}`;
    } else {
        return false;
    }

    const result = await pool.query(
        `
        SELECT e.event_id
        FROM events e
        LEFT JOIN event_proposals ep
            ON e.proposal_id = ep.proposal_id
        LEFT JOIN clubs c
            ON ep.club_id = c.club_id
        WHERE e.event_id = $1
        ${accessFilter}
        `,
        params
    );

    return Boolean(result.rows[0]);
};

const getEventRegistrationDetails = async (eventId) => {
    const result = await pool.query(
        `
        SELECT
            er.registration_id,
            er.registration_date,
            er.status,
            u.user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            u.student_id,
            d.department_name
        FROM event_registrations er
        JOIN users u
            ON er.student_id = u.user_id
        LEFT JOIN departments d
            ON u.department_id = d.department_id
        WHERE er.event_id = $1
        ORDER BY er.registration_date ASC
        `,
        [eventId]
    );

    return result.rows;
};

module.exports = {
    getEventsWithRegistrationCounts,
    canAccessEvent,
    getEventRegistrationDetails,
};
