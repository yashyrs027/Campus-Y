const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.ulkjagzlhxqxaizmpwsh:zxcqwe123098mnb@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
});
async function run() {
  try {
    console.log("Adding banner column to event_proposals...");
    await pool.query("ALTER TABLE event_proposals ADD COLUMN IF NOT EXISTS banner TEXT;");
    console.log("✅ Column banner added successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await pool.end();
  }
}
run();
