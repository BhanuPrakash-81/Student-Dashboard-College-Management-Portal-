const pool = require("../config/db");
const dayjs = require('dayjs');

// 1. Faculty Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const { faculty_id } = req.params;
        const todayDay = dayjs().format('dddd'); // Monday, Tuesday...

        // Count Total Subjects assigned (distinct in schedule)
        const subRes = await pool.query(
            "SELECT COUNT(DISTINCT subject_id) FROM schedule WHERE faculty_id = $1",
            [faculty_id]
        );

        // Count Classes Today
        const todayRes = await pool.query(
            "SELECT COUNT(*) FROM schedule WHERE faculty_id = $1 AND day_of_week = $2",
            [faculty_id, todayDay]
        );

        // Get My Classes Detailed List
        const { rows: myClasses } = await pool.query(
            `SELECT DISTINCT s.subject_id, sub.subject_name, sub.subject_code, 
                s.department, s.semester, s.section, s.room_number
         FROM schedule s
         JOIN subjects sub ON s.subject_id = sub.id
         WHERE s.faculty_id = $1`,
            [faculty_id]
        );

        res.json({
            totalSubjects: subRes.rows[0].count,
            classesToday: todayRes.rows[0].count,
            myClasses: myClasses
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load dashboard" });
    }
};

// 2. Get Students for a Class (Dept/Sem/Sec)
exports.getClassList = async (req, res) => {
    try {
        const { department, semester, section } = req.query;

        // Validate
        if (!department || !semester || !section) {
            return res.status(400).json({ error: "Context required" });
        }

        const { rows } = await pool.query(
            `SELECT id, first_name, last_name, email, profile_image 
       FROM users 
       WHERE role = 'student' 
       AND department = $1 AND semester = $2 AND section = $3
       ORDER BY first_name`,
            [department, semester, section]
        );

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch student list" });
    }
};

// 3. Mark Bulk Attendance
exports.markBulkAttendance = async (req, res) => {
    const client = await pool.connect();
    try {
        const { date, subject_id, students } = req.body;
        // students: [ { student_id: 1, status: 'Present' }, ... ]

        await client.query('BEGIN');

        for (const s of students) {
            await client.query(
                `INSERT INTO attendance (student_id, subject_id, date, status)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (student_id, subject_id, date) 
                 DO UPDATE SET status = EXCLUDED.status`,
                [s.student_id, subject_id, date, s.status]
            );
        }

        await client.query('COMMIT');
        res.json({ message: "Attendance Marked Successfully" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: "Failed to mark attendance" });
    } finally {
        client.release();
    }
};
