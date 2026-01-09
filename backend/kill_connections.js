const { Pool } = require('pg');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function kill() {
    console.log("💣 Killing active connections...");
    const client = await pool.connect();
    try {
        // Note: Suapbase pgbouncer might block this, or user might not have superuser.
        // We try to kill connections to our specific database.
        const res = await client.query(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE pid <> pg_backend_pid() 
      AND datname = current_database()
      AND state != 'idle';
    `);
        console.log(`💀 Terminated ${res.rowCount} connections.`);
    } catch (err) {
        console.log("Failed to kill (probably permissions):", err.message);
    } finally {
        client.release();
        pool.end();
    }
}

kill();
