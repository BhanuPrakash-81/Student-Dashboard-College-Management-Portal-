
const { Pool } = require('pg');
const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function migrate() {
    const client = await pool.connect();
    try {
        console.log("Creating holidays table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS holidays (
                id SERIAL PRIMARY KEY,
                date DATE UNIQUE NOT NULL,
                reason VARCHAR(255),
                is_recurring BOOLEAN DEFAULT FALSE
            );
        `);

        // Add weekly_hours to subjects if not exists
        console.log("Adding weekly_hours to subjects...");
        await client.query(`
            ALTER TABLE subjects ADD COLUMN IF NOT EXISTS weekly_hours INTEGER DEFAULT 3;
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
