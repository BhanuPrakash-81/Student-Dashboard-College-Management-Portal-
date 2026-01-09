const { Pool } = require('pg');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function fixSequencesSimplified() {
    console.log("🛠️  Fixing table sequences (Simplified)...");
    const client = await pool.connect();
    try {
        const tables = ['announcements', 'events', 'users', 'subjects', 'attendance', 'grades', 'schedule'];

        for (const table of tables) {
            console.log(`Fixing ${table}...`);
            await client.query(`CREATE SEQUENCE IF NOT EXISTS ${table}_id_seq`);
            await client.query(`ALTER TABLE ${table} ALTER COLUMN id SET DEFAULT nextval('${table}_id_seq')`);
            await client.query(`SELECT setval('${table}_id_seq', COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1)`);
        }
        console.log("✅ Sequences fixed!");
    } catch (err) {
        console.error("❌ Fix failed:", err.message);
    } finally {
        client.release();
        pool.end();
    }
}

fixSequencesSimplified();
