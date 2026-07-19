const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.ulkjagzlhxqxaizmpwsh:zxcqwe123098mnb@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
});
async function run() {
  console.log("--- EVENT PROPOSALS COLUMNS ---");
  let res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'event_proposals'");
  for (const row of res.rows) {
      console.log(`Column: ${row.column_name} | Type: ${row.data_type}`);
  }
  console.log("\n--- EVENTS COLUMNS ---");
  res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'events'");
  for (const row of res.rows) {
      console.log(`Column: ${row.column_name} | Type: ${row.data_type}`);
  }
  await pool.end();
}
run().catch(console.error);
