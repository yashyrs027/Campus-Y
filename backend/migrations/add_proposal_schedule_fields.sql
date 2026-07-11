-- Reference schema for event_proposals schedule fields and checks.
-- Your database should already match this if the table was created from your DDL.

ALTER TABLE event_proposals
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP,
  ADD COLUMN IF NOT EXISTS rejected_by_role INTEGER;

-- Proposal schedule rules enforced in PostgreSQL:
-- chk_dates: end_date >= start_date
-- chk_times: end_time > start_time
-- chk_registration_deadline: registration_deadline <= (start_date + start_time)
-- chk_expected_participants: expected_participants > 0
