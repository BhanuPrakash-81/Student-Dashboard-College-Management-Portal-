const { Pool } = require('pg');
const fs = require('fs');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runStudentMigration() {
    console.log("🚀 Running Student Class Migration...");
    const client = await pool.connect();
    try {
        const sql = fs.readFileSync('backend/migration_students.sql', 'utf8');
        await client.query(sql);
        console.log("✅ Student Columns Added!");
    } catch (err) {
        console.error("❌ Migration Failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

runStudentMigration();
