
const express = require('express');
const router = express.Router();
const { getStudentAttendance } = require('../controllers/attendanceController');

router.get('/student/:student_id', getStudentAttendance);

module.exports = router;
