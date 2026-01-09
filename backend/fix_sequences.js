const { Pool } = require('pg');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function fixSequences() {
    console.log("🛠️  Fixing table sequences...");
    const client = await pool.connect();
    try {
        const tables = ['announcements', 'events', 'users', 'subjects', 'attendance', 'grades', 'schedule'];

        for (const table of tables) {
            console.log(`Fixing ${table}...`);
            await client.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = '${table}_id_seq' AND n.nspname = 'public') THEN
                        CREATE SEQUENCE ${table}_id_seq;
                    END IF;
                    ALTER TABLE ${table} ALTER COLUMN id SET DEFAULT nextval('${table}_id_seq');
                    SELECT setval('${table}_id_seq', COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1);
                END $$;
            `);
        }
        console.log("✅ Sequences fixed!");
    } catch (err) {
        console.error("❌ Fix failed:", err.message);
    } finally {
        client.release();
        pool.end();
    }
}

fixSequences();
