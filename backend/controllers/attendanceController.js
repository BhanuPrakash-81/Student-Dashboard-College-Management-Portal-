const db = require('../config/db');
const dayjs = require('dayjs');

/* =======================================================
   GET STUDENT ATTENDANCE (SUMMARY + SUBJECT-WISE)
======================================================= */
exports.getStudentAttendance = async (req, res) => {
  try {
    const { student_id } = req.params;

    // Validate student
    const { rows: student } = await db.query(
      'SELECT id FROM users WHERE id = $1 AND role = \'student\'',
      [student_id]
    );
    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    /* ------------------------ Recent (last 30 days) ------------------------ */
    const last30Days = dayjs().subtract(30, 'days').format('YYYY-MM-DD');

    const { rows: recentAttendance } = await db.query(
      `SELECT
         DATE(a.date) AS date,
         s.id AS subject_id,
         s.subject_code,
         s.subject_name,
         CASE
           WHEN SUM(CASE WHEN a.status='Present' THEN 1 ELSE 0 END) > 0 THEN 'Present'
           WHEN SUM(CASE WHEN a.status='Absent' THEN 1 ELSE 0 END) > 0 THEN 'Absent'
           ELSE MAX(a.status)
         END AS status
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.student_id = $1 AND DATE(a.date) >= $2
       GROUP BY DATE(a.date), a.subject_id
       ORDER BY DATE(a.date) DESC`,
      [student_id, last30Days]
    );

    /* -------------------- Subject-wise Attendance -------------------- */
    const { rows: subjectAttendance } = await db.query(
      `SELECT
         s.id AS subject_id,
         s.subject_code,
         s.subject_name,
         s.faculty_name,
         COUNT(DISTINCT DATE(a.date)) AS total_days,
         COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN DATE(a.date) END) AS present_days,
         ROUND(
           (COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN DATE(a.date) END)::decimal
            / NULLIF(COUNT(DISTINCT DATE(a.date)), 0)
           ) * 100
         , 1) AS percentage
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.student_id = $1
       GROUP BY a.subject_id
       ORDER BY s.subject_name`,
      [student_id]
    );

    /* -------------------- Summary (overall) -------------------- */
    let totalPresent = 0;
    let totalClasses = 0;

    subjectAttendance.forEach(sub => {
      totalPresent += Number(sub.present_days || 0);
      totalClasses += Number(sub.total_days || 0);
    });

    const overallPercentage =
      totalClasses > 0
        ? Number(((totalPresent / totalClasses) * 100).toFixed(1))
        : 0;

    res.json({
      summary: {
        totalPresent,
        totalClasses,
        overallPercentage
      },
      subjectAttendance: subjectAttendance.map(s => ({
        subject_id: s.subject_id,
        subject_code: s.subject_code,
        subject_name: s.subject_name,
        faculty_name: s.faculty_name,
        total_days: Number(s.total_days || 0),
        present_days: Number(s.present_days || 0),
        percentage: Number((s.percentage === null ? 0 : s.percentage))
      })),
      recentAttendance: recentAttendance.map(r => ({
        date: r.date,
        subject_id: r.subject_id,
        subject_code: r.subject_code,
        subject_name: r.subject_name,
        status: r.status
      }))
    });

  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* =======================================================
   MARK ATTENDANCE
======================================================= */
exports.markAttendance = async (req, res) => {
  try {
    const { student_id, subject_id, date, status, note } = req.body;
    if (!student_id || !subject_id || !date || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.query(
      `INSERT INTO attendance (student_id, subject_id, date, status, note)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, subject_id, date) DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note`,
      [student_id, subject_id, date, status, note || null]
    );

    res.json({ success: true, message: 'Attendance saved' });
  } catch (err) {
    console.error('Error saving attendance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};