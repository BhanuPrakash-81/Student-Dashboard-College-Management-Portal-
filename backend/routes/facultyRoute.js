const express = require("express");
const router = express.Router();
const {
    getDashboardStats,
    getClassList,
    markBulkAttendance
} = require("../controllers/facultyController");

router.get("/dashboard/:faculty_id", getDashboardStats);
router.get("/class-list", getClassList); // ?department=...&semester=...
router.post("/mark-attendance", markBulkAttendance);

module.exports = router;
