const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
    console.log("✅ Connected to PostgreSQL Database");
});

pool.on("error", (err) => {
    console.error("❌ Database Connection Error:", err.message);
});

module.exports = pool;