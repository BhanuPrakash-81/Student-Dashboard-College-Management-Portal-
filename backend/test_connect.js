const { Pool } = require('pg');

// The working credentials found earlier
const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function debugAttendance() {
    console.log("Connecting to DB...");
    const client = await pool.connect();
    console.log("Connected.");

    const student_id = 7; // As per your error log
    const last30Days = '2025-12-01'; // Mock date

    try {
        console.log("Testing Student Query...");
        // 1. Check Student
        const studRes = await client.query('SELECT id, email, role FROM users WHERE id = $1', [student_id]);
        console.log("Student found:", studRes.rows);

        if (studRes.rows.length === 0) {
            console.log("WARNING: Student ID 7 does not exist! This explains the 404/500 if unhandled.");
            // Try to find ANY student
            const anyStud = await client.query('SELECT id, email FROM users WHERE role=\'student\' LIMIT 1');
            console.log("Alternative existing student:", anyStud.rows);
        }

        console.log("Testing Recent Attendance Query...");
        // 2. Run the big query
        const query = `
        SELECT
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
        ORDER BY DATE(a.date) DESC
    `;
        const res = await client.query(query, [student_id, last30Days]);
        console.log("Recent Attendance Query Success! Rows:", res.rows.length);

    } catch (err) {
        console.error("SQL ERROR:", err);
        console.error("Code:", err.code);
        console.error("Detail:", err.detail);
    } finally {
        client.release();
        pool.end();
    }
}

debugAttendance();
