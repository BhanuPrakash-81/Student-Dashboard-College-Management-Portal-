const { Pool } = require('pg');
const fs = require('fs');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const IMG_EVENT_1 = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/tech_event_banner_1767970874927.png";
const IMG_EVENT_2 = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/cultural_fest_banner_1767970900736.png";

async function seedExtras() {
    console.log("📢 Seeding Events and Announcements...");
    const client = await pool.connect();

    try {
        const bufTech = fs.readFileSync(IMG_EVENT_1);
        const bufCult = fs.readFileSync(IMG_EVENT_2);

        // Clear existing to avoid confusion
        await client.query('TRUNCATE TABLE events, announcements RESTART IDENTITY;');

        // 1. ANNOUNCEMENTS
        console.log("Adding announcements...");
        const adminId = 1; // From our users seed
        const announcements = [
            ['📅 End-Semester Exam Schedule', 'The mid-semester exam schedule for all departments has been uploaded. Please check the departmental notice board for details.', adminId],
            ['🎉 Annual Cultural Fest - Surabhi 2026', 'Registrations for surabhi 2026 are now open! Join us for a week of dance, music, and art.', adminId],
            ['🛡️ Cybersecurity Workshop', 'A three-day workshop on cybersecurity and ethical hacking starts this Monday at 10:00 AM in Lab 4.', adminId],
            ['⚽ Inter-University Sports Selection', 'Selection trials for the university football and basketball teams will take place this Saturday.', adminId],
            ['💼 Placement Drive: Tech Giants', 'Top-tier tech companies are visiting the campus next month for the 2026 recruitment drive.', adminId]
        ];

        for (const [title, msg, author] of announcements) {
            await client.query(
                'INSERT INTO announcements (title, message, created_by, is_active) VALUES ($1, $2, $3, TRUE)',
                [title, msg, author]
            );
        }

        // 2. EVENTS
        console.log("Adding events...");
        const events = [
            ['National Level Hackathon', 'Technical', '2026-02-15', 'Main Auditorium', 'A 24-hour hackathon to solve real-world problems. Prizes worth 2 Lakhs!', bufTech],
            ['Surabhi Cultural Gala', 'Cultural', '2026-03-10', 'OAT Grounds', 'The flagship cultural evening featuring celebrity performances.', bufCult],
            ['AI & Robotics Expo', 'Technical', '2026-04-05', 'Exhibition Hall', 'Showcasing the latest student projects in AI and Robotics.', bufTech],
            ['Sports Meet 2026', 'Sports', '2026-05-12', 'University Campus', 'Annual athletic meet for all branches.', bufCult]
        ];

        for (const [title, type, date, loc, desc, img] of events) {
            await client.query(
                'INSERT INTO events (title, type, date, location, description, image) VALUES ($1, $2, $3, $4, $5, $6)',
                [title, type, date, loc, desc, img]
            );
        }

        console.log("✅ Announcements and Events Seeded Successfully!");
    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
    } finally {
        client.release();
        pool.end();
    }
}

seedExtras();
