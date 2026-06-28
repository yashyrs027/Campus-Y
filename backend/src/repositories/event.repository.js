const pool = require("../config/db");

const findProposalById = async (proposalId) => {
    const result = await pool.query(
        `SELECT proposal_id, status
         FROM event_proposals
         WHERE proposal_id=$1`,
        [proposalId]
    );

    return result.rows[0];
};

const findEventByProposal = async (proposalId) => {
    const result = await pool.query(
        `SELECT event_id
         FROM events
         WHERE proposal_id=$1`,
        [proposalId]
    );

    return result.rows[0];
};

const createEvent = async (eventData) => {
    const {
        proposal_id,
        category_id,
        created_by,
        title,
        description,
        venue,
        start_datetime,
        end_datetime,
        capacity,
        registration_deadline,
        status
    } = eventData;

    const result = await pool.query(
        `INSERT INTO events
        (
            proposal_id,
            category_id,
            created_by,
            title,
            description,
            venue,
            start_datetime,
            end_datetime,
            capacity,
            registration_deadline,
            status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
        )
        RETURNING *`,
        [
            proposal_id,
            category_id,
            created_by,
            title,
            description,
            venue,
            start_datetime,
            end_datetime,
            capacity,
            registration_deadline,
            status
        ]
    );

    return result.rows[0];
};
const getAllEvents = async () => {
    const result = await pool.query(`
        SELECT *
        FROM events
        ORDER BY start_datetime ASC
    `);

    return result.rows;
};

const getEventById = async (eventId) => {
    const result = await pool.query(
        `SELECT *
         FROM events
         WHERE event_id = $1`,
        [eventId]
    );

    return result.rows[0];
};
const updateEvent = async (eventId, eventData) => {

    const {
        category_id,
        title,
        description,
        venue,
        start_datetime,
        end_datetime,
        capacity,
        registration_deadline,
        status,
        banner
    } = eventData;

    const result = await pool.query(
        `UPDATE events
         SET
            category_id = $1,
            title = $2,
            description = $3,
            venue = $4,
            banner = $5,
            start_datetime = $6,
            end_datetime = $7,
            capacity = $8,
            registration_deadline = $9,
            status = $10
         WHERE event_id = $11
         RETURNING *`,
        [
            category_id,
            title,
            description,
            venue,
            banner,
            start_datetime,
            end_datetime,
            capacity,
            registration_deadline,
            status,
            eventId
        ]
    );

    return result.rows[0];
};

const deleteEvent = async (eventId) => {

    const result = await pool.query(
        `DELETE FROM events
         WHERE event_id = $1
         RETURNING *`,
        [eventId]
    );

    return result.rows[0];
};

module.exports = {
    findProposalById,
    findEventByProposal,
    createEvent,getAllEvents,getEventById,updateEvent,deleteEvent
};