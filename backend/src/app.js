const errorHandler = require("./middlewares/error.middleware");
const express = require("express");

const app = express();

// Middleware
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const departmentRoutes = require("./routes/department.routes");
const eventRoutes = require("./routes/event.routes");
const proposalRoutes = require("./routes/proposal.routes");


// Root Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Campus-Y Backend API"
    });
});

// Auth Routes
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/proposals", proposalRoutes);
// app.use("/api/events",eventRoutes);

app.use(errorHandler);
module.exports = app;