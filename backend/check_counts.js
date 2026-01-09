const { Pool } = require('pg');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkData() {
    console.log("🔍 Checking Massive Seed Progress...");
    const client = await pool.connect();

    try {
        const users = await client.query('SELECT role, COUNT(*) FROM users GROUP BY role');
        const att = await client.query('SELECT COUNT(*) FROM attendance');
        const grades = await client.query('SELECT COUNT(*) FROM grades');
        const schedule = await client.query('SELECT COUNT(*) FROM schedule');
        const events = await client.query('SELECT COUNT(*) FROM events');

        console.log("\n📊 Current Database Stats:");
        users.rows.forEach(r => console.log(`   Users (${r.role}): ${r.count}`));
        console.log(`   Attendance: ${att.rows[0].count}`);
        console.log(`   Grades: ${grades.rows[0].count}`);
        console.log(`   Schedule Slots: ${schedule.rows[0].count}`);
        console.log(`   Events: ${events.rows[0].count}`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        client.release();
        pool.end();
    }
}

checkData();
