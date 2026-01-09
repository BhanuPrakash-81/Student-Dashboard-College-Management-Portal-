const { Pool } = require('pg');
const fs = require('fs');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const IMG_MALE = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_1_1767971149159.png";
const IMG_FEMALE = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_2_1767971189255.png";
const IMG_EVENT_1 = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/tech_event_banner_1767970874927.png";
const IMG_EVENT_2 = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/cultural_fest_banner_1767970900736.png";

async function addImages() {
    console.log("🖼️  Adding images to profiles and events...");
    const bufMale = fs.readFileSync(IMG_MALE);
    const bufFemale = fs.readFileSync(IMG_FEMALE);
    const bufEvent1 = fs.readFileSync(IMG_EVENT_1);
    const bufEvent2 = fs.readFileSync(IMG_EVENT_2);

    const client = await pool.connect();

    try {
        // Update Students
        console.log("Updating student avatars...");
        const students = await client.query("SELECT id FROM users WHERE role = 'student'");
        for (let i = 0; i < students.rows.length; i++) {
            const pic = (i % 2 === 0) ? bufMale : bufFemale;
            await client.query("UPDATE users SET profile_image = $1 WHERE id = $2", [pic, students.rows[i].id]);
            if (i % 50 === 0) console.log(`   Processed ${i} students...`);
        }

        // Update Faculty
        console.log("Updating faculty avatars...");
        await client.query("UPDATE users SET profile_image = $1 WHERE role = 'faculty'", [bufMale]);

        // Update Events
        console.log("Updating event images...");
        await client.query("UPDATE events SET image = $1 WHERE id = 1", [bufEvent1]);
        await client.query("UPDATE events SET image = $2 WHERE id = 2", [bufEvent2]);

        console.log("✅ Images added successfully!");
    } catch (err) {
        console.error("❌ Image update failed:", err.message);
    } finally {
        client.release();
        pool.end();
    }
}

addImages();
