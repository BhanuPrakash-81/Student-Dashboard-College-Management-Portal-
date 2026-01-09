const { Pool } = require('pg');
const fs = require('fs');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const AVATAR_PATHS = [
    "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_1_1767971149159.png",
    "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_2_1767971189255.png",
    "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_3_1767971226364.png",
    "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_4_1767971266267.png"
];

async function seedProfiles() {
    console.log("👤 Updating Student Profiles with AI Avatars...");
    const client = await pool.connect();

    try {
        // 1. Read Images
        const avatars = AVATAR_PATHS.map(p => fs.readFileSync(p));
        console.log(`Loaded ${avatars.length} avatars.`);

        // 2. Get Students
        const { rows: students } = await client.query("SELECT id, first_name FROM users WHERE role = 'student'");
        console.log(`Found ${students.length} students to update.`);

        // 3. Update Each Student
        for (const student of students) {
            // Pick random avatar
            const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

            await client.query(
                "UPDATE users SET profile_image = $1 WHERE id = $2",
                [randomAvatar, student.id]
            );
            console.log(`  -> Updated ${student.first_name} (ID: ${student.id})`);
        }

        console.log("✅ All student profiles updated successfully!");

    } catch (err) {
        console.error("❌ Update Failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

seedProfiles();
