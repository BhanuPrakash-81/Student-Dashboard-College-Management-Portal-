const { Pool } = require('pg');
const fs = require('fs');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const IMG_MALE = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_1_1767971149159.png";
const IMG_EVENT_1 = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/tech_event_banner_1767970874927.png";
const IMG_EVENT_2 = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/cultural_fest_banner_1767970900736.png";

async function fixImages() {
    console.log("🛠️  Fixing Faculty and Event images...");
    const bufMale = fs.readFileSync(IMG_MALE);
    const bufEvent1 = fs.readFileSync(IMG_EVENT_1);
    const bufEvent2 = fs.readFileSync(IMG_EVENT_2);

    const client = await pool.connect();
    try {
        console.log("Updating faculty avatars...");
        // Fetch all faculty and update individually to avoid data type issues with bulk role update
        const faculty = await client.query("SELECT id FROM users WHERE role = 'faculty'");
        for (const f of faculty.rows) {
            await client.query("UPDATE users SET profile_image = $1 WHERE id = $2", [bufMale, f.id]);
        }

        console.log("Updating event images...");
        const events = await client.query("SELECT id FROM events");
        if (events.rows[0]) await client.query("UPDATE events SET image = $1 WHERE id = $2", [bufEvent1, events.rows[0].id]);
        if (events.rows[1]) await client.query("UPDATE events SET image = $1 WHERE id = $2", [bufEvent2, events.rows[1].id]);

        console.log("✅ All fixed!");
    } catch (err) {
        console.error("❌ Fix failed:", err.message);
    } finally {
        client.release();
        pool.end();
    }
}
fixImages();
