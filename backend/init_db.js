require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initDB() {
    try {
        const sqlPath = path.join(__dirname, 'schema_supabase.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Connecting to database...');
        const client = await pool.connect();

        console.log('Running schema migration...');
        try {
            await client.query(sql);
            console.log('Schema setup completed successfully!');
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.log('Some tables already exist, continuing...');
            } else {
                throw err;
            }
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await pool.end();
    }
}

initDB();
