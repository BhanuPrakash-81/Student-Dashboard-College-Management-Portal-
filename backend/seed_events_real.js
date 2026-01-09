const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

// Paths to our AI Generated Images
const IMAGE_PATHS = {
    technical: "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/tech_event_banner_1767970874927.png",
    cultural: "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/cultural_fest_banner_1767970900736.png",
    sports: "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/sports_event_banner_1767970926305.png",
    workshop: "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/workshop_event_banner_1767970952943.png"
};

async function seedRealEvents() {
    console.log("🎨 Seeding Real AI-Generated Event Images...");
    const client = await pool.connect();

    try {
        // 1. Clear Old Data
        console.log("Clearing old placeholder events...");
        await client.query("DELETE FROM events");

        // 2. Read Images
        const images = {
            tech: fs.readFileSync(IMAGE_PATHS.technical),
            cult: fs.readFileSync(IMAGE_PATHS.cultural),
            sport: fs.readFileSync(IMAGE_PATHS.sports),
            work: fs.readFileSync(IMAGE_PATHS.workshop)
        };
        console.log("Loaded images from disk.");

        // 3. Define New Events
        const events = [
            {
                title: "National Hackathon 2026",
                type: "Technical",
                date: "2026-03-20",
                time: "09:00 AM",
                location: "Convention Center",
                description: "A 24-hour coding marathon to solve real-world problems. Prizes worth $10k.",
                image: images.tech
            },
            {
                title: "Surabhi 2026: Cultural Fest",
                type: "Cultural",
                date: "2026-02-14",
                time: "05:00 PM",
                location: "Open Air Theatre",
                description: "Celebrate music, dance, and art featuring celebrity performances.",
                image: images.cult
            },
            {
                title: "Inter-University Football Cup",
                type: "Sports",
                date: "2026-04-05",
                time: "04:00 PM",
                location: "Main Stadium",
                description: "Cheer for our university team in the finals against rivals.",
                image: images.sport
            },
            {
                title: "Generative AI Workshop",
                type: "Workshop",
                date: "2026-01-25",
                time: "10:00 AM",
                location: "C-Block Seminar Hall",
                description: "Learn to build LLM applications using OpenAI and LangChain.",
                image: images.work
            }
        ];

        // 4. Insert
        for (const evt of events) {
            await client.query(`
            INSERT INTO events (title, type, date, time, location, description, image)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [evt.title, evt.type, evt.date, evt.time, evt.location, evt.description, evt.image]);
        }

        console.log(`✅ Successfully seeded ${events.length} events with REAL images.`);

    } catch (err) {
        console.error("❌ Seed Failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

seedRealEvents();
