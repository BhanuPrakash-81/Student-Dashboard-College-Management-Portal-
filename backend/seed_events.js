const { Pool } = require('pg');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

// Helper: Base64 to Buffer
const b64ToBuf = (str) => Buffer.from(str, 'base64');

// Sample 1x1 PNGs (Red, Blue, Green, Yellow)
const IMAGES = {
    red: b64ToBuf('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),
    blue: b64ToBuf('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
    green: b64ToBuf('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='),
    yellow: b64ToBuf('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')
};

async function seedEvents() {
    console.log("🎉 Seeding Events...");
    const client = await pool.connect();

    try {
        // 1. Fix Sequence (Just in case)
        await client.query(`
      CREATE SEQUENCE IF NOT EXISTS events_id_seq;
      ALTER TABLE events ALTER COLUMN id SET DEFAULT nextval('events_id_seq');
      SELECT setval('events_id_seq', (SELECT COALESCE(MAX(id), 0) FROM events) + 1);
    `);

        // 2. Check if events exist
        const check = await client.query("SELECT COUNT(*) FROM events");
        if (check.rows[0].count > 0) {
            console.log("Events already exist. Skipping seed.");
            // Uncomment below line to FORCE clean slate
            // await client.query("DELETE FROM events");
            // console.log("Cleared existing events.");
        }

        // 3. Insert Events
        const events = [
            {
                title: "Tech Innovation Summit 2026",
                type: "Technical",
                date: "2026-03-15",
                time: "10:00 AM",
                location: "Main Auditorium",
                description: "Annual showcase of student projects and guest lectures from industry leaders.",
                image: IMAGES.blue
            },
            {
                title: "Cultural Night: Rhythms",
                type: "Cultural",
                date: "2026-02-28",
                time: "06:00 PM",
                location: "Open Air Theatre",
                description: "A night of music, dance, and drama performances by the student clubs.",
                image: IMAGES.red
            },
            {
                title: "Inter-College Cricket Tournament",
                type: "Sports",
                date: "2026-04-10",
                time: "09:00 AM",
                location: "University Ground",
                description: "Cheer for your team as they compete against 10 other colleges.",
                image: IMAGES.green
            },
            {
                title: "Web Development Workshop",
                type: "Workshop",
                date: "2026-01-20",
                time: "02:00 PM",
                location: "Lab Complex 3",
                description: "Hands-on session on React and Node.js for beginners.",
                image: IMAGES.yellow
            }
        ];

        for (const evt of events) {
            await client.query(`
            INSERT INTO events (title, type, date, time, location, description, image)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [evt.title, evt.type, evt.date, evt.time, evt.location, evt.description, evt.image]);
        }

        console.log(`✅ Added ${events.length} events with images.`);

    } catch (err) {
        console.error("❌ Seed Failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

seedEvents();
