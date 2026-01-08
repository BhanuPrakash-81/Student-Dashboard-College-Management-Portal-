const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function fixSchema() {
    try {
        console.log('Creating sequence for users_id...');
        // Create sequence if not exists
        await pool.query("CREATE SEQUENCE IF NOT EXISTS users_id_seq");

        // Set default value for id to use sequence
        console.log('Altering table to use sequence...');
        await pool.query("ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq')");

        // Sync sequence with max id
        console.log('Syncing sequence...');
        await pool.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");

        console.log('Fix applied successfully!');
    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        pool.end();
    }
}

fixSchema();
