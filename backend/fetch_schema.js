const fs = require('fs');
const pool = require('./config/db');

async function generateSchema() {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        let sqlContent = '';
        const tableNames = tables.map(t => Object.values(t)[0]);

        for (const tableName of tableNames) {
            const [createResult] = await pool.query(`SHOW CREATE TABLE ${tableName}`);
            sqlContent += createResult[0]['Create Table'] + ';\n\n';

            // Check announcements columns specifically
            if (tableName === 'announcements') {
                const [columns] = await pool.query(`DESCRIBE ${tableName}`);
                console.log('Announcements Columns:', columns.map(c => c.Field));
            }
        }

        fs.writeFileSync('schema.sql', sqlContent);
        console.log('Schema saved to schema.sql');
        process.exit(0);
    } catch (err) {
        console.error('Error fetching schema:', err);
        process.exit(1);
    }
}

generateSchema();
