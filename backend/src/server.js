const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;


// Test Database Connection
pool.query("SELECT NOW()")
    .then((result) => {
        console.log("✅ Database Connected");
        console.log("Database Time:", result.rows[0].now);

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Failed to connect to database:", err.message);
    });