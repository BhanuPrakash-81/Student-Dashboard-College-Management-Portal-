const express = require("express");
const router = express.Router();
const {
    createSchedule,
    getAllSchedules,
    getFacultySchedule,
    getStudentSchedule
} = require("../controllers/scheduleController");

// Admin Routes
router.post("/create", createSchedule); // Should be protected
router.get("/all", getAllSchedules);

// Faculty Routes
router.get("/faculty/:faculty_id", getFacultySchedule);

// Student Routes
router.get("/student", getStudentSchedule);

module.exports = router;
