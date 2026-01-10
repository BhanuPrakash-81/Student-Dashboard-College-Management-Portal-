
const { Pool } = require('pg');
const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function migrate() {
    const client = await pool.connect();
    try {
        console.log("Adding branch and gender columns to users...");
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS branch VARCHAR(50),
            ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other'));
        `);
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
