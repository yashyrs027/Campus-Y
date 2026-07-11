const pool = require("../config/db");

const createProposal = async (proposalData) => {

    const query = `
        INSERT INTO event_proposals
        (
            club_id,
            created_by,
            category_id,
            title,
            description,
            venue,
            start_date,
            end_date,
            start_time,
            end_time,
            registration_deadline,
            expected_participants,
            status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,COALESCE($13, 'Pending')::proposal_status_enum
        )
        RETURNING *;
    `;

    const values = [
        proposalData.club_id,
        proposalData.created_by,
        proposalData.category_id,
        proposalData.title,
        proposalData.description,
        proposalData.venue,
        proposalData.start_date,
        proposalData.end_date,
        proposalData.start_time,
        proposalData.end_time,
        proposalData.registration_deadline,
        proposalData.expected_participants,
        proposalData.status || null
    ];

    const result = await pool.query(query, values);

    return result.rows[0];

};

const getAllProposals = async () => {
    const query = `
        SELECT
            proposal_id,
            club_id,
            created_by,
            category_id,
            title,
            description,
            venue,
            start_date,
            end_date,
            start_time,
            end_time,
            registration_deadline,
            expected_participants,
            status,
            rejection_reason,
            rejected_by_role,
            created_at
        FROM event_proposals
        ORDER BY created_at DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
};
const getProposalById = async (proposalId) => {

    const query = `
        SELECT
            proposal_id,
            club_id,
            created_by,
            category_id,
            title,
            description,
            venue,
            start_date,
            end_date,
            start_time,
            end_time,
            registration_deadline,
            expected_participants,
            status,
            rejection_reason,
            rejected_by_role,
            created_at,
            updated_at
        FROM event_proposals
        WHERE proposal_id = $1;
    `;

    const result = await pool.query(query, [proposalId]);

    return result.rows[0];
};
const updateProposal = async (proposalId, proposalData) => {

    const query = `
        UPDATE event_proposals
        SET
            club_id = $1,
            category_id = $2,
            title = $3,
            description = $4,
            venue = $5,
            start_date = $6,
            end_date = $7,
            start_time = $8,
            end_time = $9,
            registration_deadline = $10,
            expected_participants = $11,
            updated_at = NOW()
        WHERE proposal_id = $12
        RETURNING *;
    `;

    const values = [
        proposalData.club_id,
        proposalData.category_id,
        proposalData.title,
        proposalData.description,
        proposalData.venue,
        proposalData.start_date,
        proposalData.end_date,
        proposalData.start_time,
        proposalData.end_time,
        proposalData.registration_deadline,
        proposalData.expected_participants,
        proposalId
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const deleteProposal = async (proposalId) => {

    const query = `
        DELETE FROM event_proposals
        WHERE proposal_id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [proposalId]);

    return result.rows[0];
};
const approveProposal = async (proposalId) => {

    const query = `
        UPDATE event_proposals
        SET
            status = 'Approved',
            rejection_reason = NULL,
            updated_at = NOW()
        WHERE proposal_id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [proposalId]);

    return result.rows[0];
};

const rejectProposal = async (proposalId, rejectionReason, rejectedByRole) => {

    const query = `
        UPDATE event_proposals
        SET
            status = 'Rejected',
            rejection_reason = $1,
            rejected_by_role = $2,
            updated_at = NOW()
        WHERE proposal_id = $3
        RETURNING *;
    `;

    const result = await pool.query(query, [
        rejectionReason,
        rejectedByRole,
        proposalId
    ]);

    return result.rows[0];
};

const getProposalsByUserId = async (userId) => {
    const query = `
        SELECT
            proposal_id,
            club_id,
            created_by,
            category_id,
            title,
            description,
            venue,
            start_date,
            end_date,
            start_time,
            end_time,
            registration_deadline,
            expected_participants,
            status,
            rejection_reason,
            rejected_by_role,
            created_at
        FROM event_proposals
        WHERE created_by = $1
        ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};
const updateProposalStatus = async (proposalId, status) => {
    const query = `
        UPDATE event_proposals
        SET
            status = $1::proposal_status_enum,
            rejection_reason = NULL,
            updated_at = NOW()
        WHERE proposal_id = $2
        RETURNING *;
    `;
    const result = await pool.query(query, [status, proposalId]);
    return result.rows[0];
};

const getApprovedProposalsWithoutEvents = async () => {
    const query = `
        SELECT
            p.proposal_id,
            p.club_id,
            p.created_by,
            p.category_id,
            p.title,
            p.description,
            p.venue,
            p.start_date,
            p.end_date,
            p.start_time,
            p.end_time,
            p.registration_deadline,
            p.expected_participants,
            p.status,
            p.rejection_reason,
            p.rejected_by_role,
            p.created_at
        FROM event_proposals p
        LEFT JOIN events e ON e.proposal_id = p.proposal_id
        WHERE p.status = 'Approved'
          AND e.event_id IS NULL
        ORDER BY p.created_at DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    createProposal,
    getAllProposals,
    getProposalById,
    updateProposal,
    deleteProposal,
    approveProposal,
    rejectProposal,
    getProposalsByUserId,
    updateProposalStatus,
    getApprovedProposalsWithoutEvents
};