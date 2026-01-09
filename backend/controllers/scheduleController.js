const pool = require("../config/db");

// 1. Create Schedule Slot
exports.createSchedule = async (req, res) => {
    try {
        const { day, start_time, end_time, subject_id, faculty_id, room, department, semester, section } = req.body;

        // Basic Validation
        if (!day || !start_time || !end_time || !subject_id || !faculty_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check Conflicts (Faculty or Room busy at this time)
        const conflict = await pool.query(
            `SELECT * FROM schedule 
       WHERE day_of_week = $1 
       AND ((start_time < $2 AND end_time > $3)) -- Overlap logic
       AND (faculty_id = $4 OR room_number = $5)`,
            [day, end_time, start_time, faculty_id, room]
        );

        if (conflict.rows.length > 0) {
            return res.status(409).json({
                error: "Scheduling Conflict detected!",
                details: "Faculty or Room is already booked for this time slot."
            });
        }

        // Insert
        const result = await pool.query(
            `INSERT INTO schedule 
       (day_of_week, start_time, end_time, subject_id, faculty_id, room_number, department, semester, section)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [day, start_time, end_time, subject_id, faculty_id, room, department || 'CSE', semester || 1, section || 'A']
        );

        res.status(201).json({ message: "Schedule created", schedule: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create schedule" });
    }
};

// 2. Get Full Schedule (For Admin)
exports.getAllSchedules = async (req, res) => {
    try {
        // Join with Subjects and Faculty(Users) to get names
        const query = `
      SELECT s.*, 
             sub.subject_name, sub.subject_code, 
             u.first_name || ' ' || u.last_name as faculty_name
      FROM schedule s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN users u ON s.faculty_id = u.id
      ORDER BY 
        CASE 
          WHEN day_of_week = 'Monday' THEN 1
          WHEN day_of_week = 'Tuesday' THEN 2
          WHEN day_of_week = 'Wednesday' THEN 3
          WHEN day_of_week = 'Thursday' THEN 4
          WHEN day_of_week = 'Friday' THEN 5
          WHEN day_of_week = 'Saturday' THEN 6
          ELSE 7
        END,
        s.start_time ASC
    `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch schedule" });
    }
};

// 3. Get Faculty Schedule (For Faculty Dashboard)
exports.getFacultySchedule = async (req, res) => {
    try {
        const { faculty_id } = req.params;
        const query = `
      SELECT s.*, sub.subject_name, sub.subject_code 
      FROM schedule s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.faculty_id = $1
      ORDER BY s.day_of_week, s.start_time
    `;
        const { rows } = await pool.query(query, [faculty_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch faculty schedule" });
    }
};

// 4. Get Student Schedule (For Student Dashboard)
// Assumes student is in specific Dept/Sem/Section (Logic needed to fetch student details first)
// For now, we accept query params
exports.getStudentSchedule = async (req, res) => {
    try {
        const { department, semester, section } = req.query; // e.g. ?department=CSE&semester=3&section=A

        // In real app, fetch these from student profile if logged in
        // For demo, we filter strictly
        const query = `
      SELECT s.*, sub.subject_name, sub.subject_code, u.first_name as faculty_name
      FROM schedule s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN users u ON s.faculty_id = u.id
      WHERE ($1::text IS NULL OR s.department = $1)
      AND ($2::int IS NULL OR s.semester = $2)
      AND ($3::text IS NULL OR s.section = $3)
    `;

        const { rows } = await pool.query(query, [department, semester, section]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch student schedule" });
    }
};
