const pool = require("../config/db");

const getEventById = async (eventId) => {

    const result = await pool.query(
        `SELECT *
         FROM events
         WHERE event_id = $1`,
        [eventId]
    );

    return result.rows[0];
};

const findRegistration = async (eventId, studentId) => {

    const result = await pool.query(
        `SELECT *
         FROM event_registrations
         WHERE event_id = $1
         AND student_id = $2`,
        [eventId, studentId]
    );

    return result.rows[0];
};

const registrationCount = async (eventId) => {

    const result = await pool.query(
        `SELECT COUNT(*) AS total
         FROM event_registrations
         WHERE event_id = $1
         AND status = 'Registered'`,
        [eventId]
    );

    return Number(result.rows[0].total);
};

const createRegistration = async (
    eventId,
    studentId,
    status
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `INSERT INTO event_registrations
            (
                event_id,
                student_id,
                status
            )
            VALUES ($1,$2,$3)
            RETURNING *`,
            [
                eventId,
                studentId,
                status
            ]
        );

        if (status === "Registered") {
            await client.query(
                `UPDATE events
                 SET
                    current_registrations = COALESCE(current_registrations, 0) + 1,
                    updated_at = NOW()
                 WHERE event_id = $1`,
                [eventId]
            );
        }

        await client.query("COMMIT");
        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
const getMyRegistrations = async (studentId) => {

    const result = await pool.query(
        `
        SELECT
            er.registration_id,
            er.registration_date,
            er.status,

            e.event_id,
            e.title,
            e.description,
            e.venue,
            e.start_datetime,
            e.end_datetime,
            e.capacity

        FROM event_registrations er

        JOIN events e
        ON er.event_id = e.event_id

        WHERE er.student_id = $1

        ORDER BY er.registration_date DESC
        `,
        [studentId]
    );

    return result.rows;

};
const findRegistrationById = async (registrationId) => {

    const result = await pool.query(
        `
        SELECT
            er.*,
            e.registration_deadline
        FROM event_registrations er
        JOIN events e
        ON er.event_id = e.event_id
        WHERE er.registration_id = $1
        `,
        [registrationId]
    );

    return result.rows[0];
};
const deleteRegistration = async (registrationId) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `DELETE FROM event_registrations
             WHERE registration_id = $1
             RETURNING *`,
            [registrationId]
        );

        const registration = result.rows[0];

        if (registration?.status === "Registered") {
            await client.query(
                `UPDATE events
                 SET
                    current_registrations = GREATEST(COALESCE(current_registrations, 0) - 1, 0),
                    updated_at = NOW()
                 WHERE event_id = $1`,
                [registration.event_id]
            );
        }

        await client.query("COMMIT");
        return registration;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
const getEventRegistrations = async (eventId) => {

    const result = await pool.query(
        `
        SELECT
            er.registration_id,
            er.registration_date,
            er.status,
            u.user_id,
            u.first_name,
            u.last_name,
            u.email
            
        FROM event_registrations er
        JOIN users u
        ON er.student_id = u.user_id
        WHERE er.event_id = $1
        ORDER BY er.registration_date ASC
        `,
        [eventId]
    );

    return result.rows;

};
const getRegistrationCount = async (eventId) => {

    const result = await pool.query(
        `
        SELECT
            e.event_id,
            e.capacity,
            COUNT(er.registration_id) AS registered
        FROM events e
        LEFT JOIN event_registrations er
            ON e.event_id = er.event_id
            AND er.status = 'Registered'
        WHERE e.event_id = $1
        GROUP BY e.event_id, e.capacity
        `,
        [eventId]
    );

    return result.rows[0];

};


module.exports = {
    getEventById,
    findRegistration,
    registrationCount,
    createRegistration,getMyRegistrations,findRegistrationById,deleteRegistration
    ,getEventRegistrations,getRegistrationCount
};
