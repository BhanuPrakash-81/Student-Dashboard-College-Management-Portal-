
const db = require('../config/db');

exports.getStudentGrades = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    // Get grades
    const [grades] = await db.query(
      `SELECT g.*, s.subject_code, s.subject_name, s.faculty_name, s.credits
       FROM grades g JOIN subjects s ON g.subject_id = s.id
       WHERE g.student_id = ? ORDER BY s.subject_name`,
      [student_id]
    );
    
    // Calculate CGPA
    const [cgpaRows] = await db.query(
      `SELECT AVG(g.grade_point) as cgpa FROM grades g WHERE g.student_id = ?`,
      [student_id]
    );
    const cgpa = cgpaRows[0]?.cgpa || 0;

    // Grouping
    const subjectMap = {};
    grades.forEach(g => {
        if(!subjectMap[g.subject_id]) {
            subjectMap[g.subject_id] = {
                subject_id: g.subject_id,
                subject_code: g.subject_code,
                subject_name: g.subject_name,
                faculty_name: g.faculty_name,
                credits: g.credits,
                assessments: []
            };
        }
        subjectMap[g.subject_id].assessments.push({
            assessment_type: g.assessment_type,
            marks: g.marks,
            max_marks: g.max_marks,
            grade: g.grade,
            grade_point: g.grade_point
        });
    });

    res.json({
        student_id,
        cgpa: cgpa,
        subjects: Object.values(subjectMap)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
