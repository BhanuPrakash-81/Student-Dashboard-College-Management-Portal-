
const express = require('express');
const router = express.Router();
const { getStudentGrades } = require('../controllers/gradesController');

router.get('/student/:student_id', getStudentGrades);

module.exports = router;
