const { Pool } = require('pg');
const fs = require('fs');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const TOTAL_STUDENTS = 200;
const BATCH_SIZE = 50; // Insert 50 rows per query if possible or run 50 promises

// ... (Same Configs)
const IMG_MALE = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_1_1767971149159.png";
const IMG_FEMALE = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_2_1767971189255.png";
const IMG_EVENT_1 = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/tech_event_banner_1767970874927.png";
const IMG_EVENT_2 = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/cultural_fest_banner_1767970900736.png";

const DEPARTMENTS = ['CSE', 'ECE', 'AI&DS', 'MECH'];
const SEMESTERS = [1, 3, 5, 7];
const SECTIONS = ['A', 'B'];

const SUBJECTS_POOL = {
    'CSE': ['Data Structures', 'Algorithms', 'Database Management', 'OS', 'Networks', 'AI/ML', 'Compiler Design'],
    'ECE': ['Signals & Systems', 'Digital Electronics', 'Microprocessors', 'Analog Circuits', 'Control Systems'],
    'AI&DS': ['Python Programming', 'Machine Learning', 'Big Data', 'Statistics', 'Deep Learning'],
    'MECH': ['Thermodynamics', 'Fluid Mechanics', 'Solid Mechanics', 'Kinematics', 'Robotics']
};

async function seedFast() {
    console.log("🚀 Starting OPTIMIZED Seeding...");
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Transaction

        const hash = await bcrypt.hash("12345", 10);
        const bufMale = fs.readFileSync(IMG_MALE);
        const bufFemale = fs.readFileSync(IMG_FEMALE);
        const bufEvent1 = fs.readFileSync(IMG_EVENT_1);
        const bufEvent2 = fs.readFileSync(IMG_EVENT_2);

        // 1. Wipe
        console.log("🧹 Wiping Tables...");
        await client.query('TRUNCATE TABLE users, subjects, schedule, events, announcements, attendance, grades RESTART IDENTITY CASCADE;');

        // 2. Faculty & Subjects (Small data, standard await is fine)
        console.log("👨‍🏫 Creating Faculty & Subjects...");
        const facultyIds = [];
        const subjectMap = [];
        let fId = 1000;

        for (const dept of DEPARTMENTS) {
            // Create 5 Faculty
            for (let i = 1; i <= 5; i++) {
                fId++;
                await client.query(`
                    INSERT INTO users (id, first_name, last_name, email, password, role, approved, department, profile_image)
                    VALUES ($1, $2, 'Faculty', $3, $4, 'faculty', TRUE, $5, $6)
                `, [fId, `Prof_${dept}_${i}`, `prof_${dept.toLowerCase()}_${i}@kl.edu`, hash, dept, bufMale]);

                await client.query("INSERT INTO faculty_profiles (user_id, department) VALUES ($1, $2)", [fId, dept]);
                facultyIds.push({ id: fId, dept });
            }

            // Create Subjects
            const subs = SUBJECTS_POOL[dept];
            for (let i = 0; i < subs.length; i++) {
                const res = await client.query(`
                    INSERT INTO subjects (subject_name, subject_code, credits)
                    VALUES ($1, $2, 4) RETURNING id
                `, [subs[i], `${dept}10${i + 1}`]);
                subjectMap.push({ id: res.rows[0].id, name: subs[i], dept });
            }
        }

        // 3. Students (Batch Insert using helper?) 
        // We will loop but commit every 50 to avoid massive log
        console.log(`👨‍🎓 Creating ${TOTAL_STUDENTS} Students...`);
        let sId = 230000;
        const students = [];

        for (let i = 0; i < TOTAL_STUDENTS; i++) {
            sId++;
            const dept = DEPARTMENTS[i % DEPARTMENTS.length];
            const sem = SEMESTERS[i % SEMESTERS.length];
            const sec = SECTIONS[i % SECTIONS.length];
            const pic = (i % 2 === 0) ? bufMale : bufFemale;

            // Just fire and forget? No, too many conns. Use sequential for safety but simple query.
            await client.query(`
                INSERT INTO users (id, first_name, last_name, email, password, role, approved, department, semester, section, profile_image)
                VALUES ($1, $2, 'KL', $3, $4, 'student', TRUE, $5, $6, $7, $8)
            `, [sId, `Student${i}`, `${sId}@student.kl.edu`, hash, dept, sem, sec, pic]);

            students.push({ id: sId, dept, sem, sec });
        }
        await client.query("SELECT setval('users_id_seq', 300000)");

        // 4. Schedule & Attendance (The Heavy Part)
        console.log("📅 Scheduling & Attendance...");
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        // Prepare Attendance Batch
        // Generating millions of distinct attendance records takes time.
        // We will generate attendance ONLY for 2 subjects per student to save time, 
        // and only for 10 days.

        for (const dept of DEPARTMENTS) {
            const dSubs = subjectMap.filter(s => s.dept === dept);
            const dFac = facultyIds.filter(f => f.dept === dept);
            const dStus = students.filter(s => s.dept === dept);
            if (!dSubs.length) continue;

            // Schedule: 1 slot per subject per week
            for (let i = 0; i < dSubs.length; i++) {
                const day = days[i % 5];
                const fac = dFac[i % dFac.length];
                const sub = dSubs[i]; // Correct subject

                // Create Schedule Slot
                await client.query(`
                   INSERT INTO schedule (day_of_week, start_time, end_time, subject_id, faculty_id, room_number, department)
                   VALUES ($1, '09:00', '10:00', $2, $3, $4, $5)
               `, [day, sub.id, fac.id, `Room-${dept}-${i}`, dept]);

                // Attendance for this Subject (Batch insert for all students in dept)
                // Only for last 10 occurrences of this day
                for (let w = 0; w < 8; w++) { // 8 weeks of data
                    const date = dayjs().subtract(w, 'week').day(days.indexOf(day) + 1).format('YYYY-MM-DD');

                    // Insert 50 students at a time
                    // We construct a large INSERT ... VALUES (), (), ()
                    // Postgres limit ~65k params. 

                    const chunkSize = 50;
                    for (let k = 0; k < dStus.length; k += chunkSize) {
                        const chunk = dStus.slice(k, k + chunkSize);
                        // Build query
                        let values = [];
                        let params = [];
                        let pIdx = 1;

                        chunk.forEach(st => {
                            const status = Math.random() > 0.2 ? 'Present' : 'Absent';
                            values.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`);
                            params.push(st.id, sub.id, date, status);
                        });

                        if (values.length > 0) {
                            await client.query(`
                               INSERT INTO attendance (student_id, subject_id, date, status)
                               VALUES ${values.join(', ')}
                               ON CONFLICT DO NOTHING
                           `, params);
                        }
                    }
                }
            }
        }

        // 5. Grades (Batch similar to Attendance)
        console.log("📝 Grades...");
        for (const st of students) {
            // Give grades for 3 random subjects in their dept
            const mySubs = subjectMap.filter(s => s.dept === st.dept).slice(0, 4);
            for (const sub of mySubs) {
                const marks = 30 + Math.floor(Math.random() * 70);
                await client.query(`
                     INSERT INTO grades (student_id, subject_id, semester, assessment_type, marks, max_marks, grade, grade_point)
                     VALUES ($1, $2, $3, 'MID1', $4, 100, 'A', $5)
                 `, [st.id, sub.id, st.sem, marks, marks / 10]);
            }
        }

        // 6. Admin & Events
        await client.query(`INSERT INTO users (id, first_name, email, password, role, approved) VALUES (1, 'Admin', 'admin@kl.edu', $1, 'admin', TRUE) ON CONFLICT DO NOTHING`, [hash]);
        await client.query(`INSERT INTO events (title, type, date, location, description, image) VALUES ('Tech Comp', 'Technical', '2026-05-01', 'Hall A', 'Coding.', $1)`, [bufEvent1]);

        await client.query('COMMIT');
        console.log("✅ SEED DONE (Optimized)");

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ ERROR:", e);
    } finally {
        client.release();
        pool.end();
    }
}

seedFast();
