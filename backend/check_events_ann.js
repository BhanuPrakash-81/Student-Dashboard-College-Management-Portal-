const { Pool } = require('pg');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function check() {
    const client = await pool.connect();
    try {
        const events = await client.query('SELECT title, type, date, location FROM events');
        const anns = await client.query('SELECT title, message, is_active FROM announcements');

        console.log("--- EVENTS ---");
        console.table(events.rows);
        console.log("\n--- ANNOUNCEMENTS ---");
        console.table(anns.rows);
    } finally {
        client.release();
        pool.end();
    }
}
check();
