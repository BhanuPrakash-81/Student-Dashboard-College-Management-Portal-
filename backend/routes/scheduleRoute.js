const express = require("express");
const router = express.Router();
const {
    createSchedule,
    getAllSchedules,
    getFacultySchedule,
    getStudentSchedule,
    generateAISchedule,
    deleteSchedule
} = require("../controllers/scheduleController");

// Admin Routes
router.post("/create", createSchedule); // Should be protected
router.post("/generate", generateAISchedule);
router.get("/all", getAllSchedules);
router.delete("/:id", deleteSchedule);

// Faculty Routes
router.get("/faculty/:faculty_id", getFacultySchedule);

// Student Routes
router.get("/student", getStudentSchedule);

module.exports = router;
