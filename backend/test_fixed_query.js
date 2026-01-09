const { Pool } = require('pg');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function testAttendanceQuery() {
    console.log("Testing FIXED Attendance Query...");
    const client = await pool.connect();
    const student_id = 7;
    const last30Days = '2024-01-01'; // Very old date to catch everything

    try {
        // This is the query currently in your controller (with GROUP BY fixes)
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
        GROUP BY DATE(a.date), a.subject_id, s.subject_code, s.subject_name
        ORDER BY DATE(a.date) DESC
    `;

        console.log(`Running query for student ${student_id}...`);
        const res = await client.query(query, [student_id, last30Days]);
        console.log(`✅ Success! Found ${res.rows.length} records.`);
        if (res.rows.length > 0) {
            console.log("Sample Row:", res.rows[0]);
        } else {
            console.log("⚠️ No records found for this student. Are you sure ID 7 has data?");
            const count = await client.query("SELECT COUNT(*) FROM attendance WHERE student_id=$1", [student_id]);
            console.log(`Actual count in table for ID ${student_id}:`, count.rows[0].count);
        }

    } catch (err) {
        console.error("❌ Query FAILED:", err.message);
        console.error("Code:", err.code);
    } finally {
        client.release();
        pool.end();
    }
}

testAttendanceQuery();
