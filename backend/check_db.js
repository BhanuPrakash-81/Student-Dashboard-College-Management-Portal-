const { Pool } = require('pg');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkData() {
    console.log("🔍 Checking Database Content...");
    const client = await pool.connect();

    try {
        // 1. Check Row Counts
        const attCount = await client.query('SELECT COUNT(*) FROM attendance');
        const gradeCount = await client.query('SELECT COUNT(*) FROM grades');
        const userCount = await client.query('SELECT COUNT(*) FROM users');

        console.log(`\n📊 Row Counts:`);
        console.log(`   Users: ${userCount.rows[0].count}`);
        console.log(`   Attendance: ${attCount.rows[0].count}`);
        console.log(`   Grades: ${gradeCount.rows[0].count}`);

        // 2. Check Sequence Status (Why were inserts failing?)
        // We try one dummy insert
        if (attCount.rows[0].count === '0') {
            console.log("\n⚠️ Attendance is EMPTY. Attempting Debug Insert...");
            try {
                await client.query(`
                INSERT INTO attendance (student_id, subject_id, date, status)
                VALUES (7, 1, '2025-01-01', 'Present')
                RETURNING id;
            `);
                console.log("✅ Debug Insert SUCCEEDED! (Sequence is working)");
            } catch (e) {
                console.log("❌ Debug Insert FAILED:", e.message);
            }
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        client.release();
        pool.end();
    }
}

checkData();
