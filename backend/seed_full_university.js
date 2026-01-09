const { Pool } = require('pg');
const fs = require('fs');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

// --- CONFIGURATION ---
const TOTAL_STUDENTS = 200; // > 150
const PASSWORD_PLAIN = "12345";
let PASSWORD_HASH = ""; // Will calc

// Paths to existing AI images
const IMG_MALE = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_1_1767971149159.png";
const IMG_FEMALE = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_2_1767971189255.png";
const IMG_EVENT_1 = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/tech_event_banner_1767970874927.png";
const IMG_EVENT_2 = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/cultural_fest_banner_1767970900736.png";

// Data Arrays
const DEPARTMENTS = ['CSE', 'ECE', 'AI&DS', 'MECH'];
const SEMESTERS = [1, 3, 5, 7];
const SECTIONS = ['A', 'B'];

const SUBJECTS_POOL = {
    'CSE': ['Data Structures', 'Algorithms', 'Database Management', 'OS', 'Networks', 'AI/ML', 'Compiler Design'],
    'ECE': ['Signals & Systems', 'Digital Electronics', 'Microprocessors', 'Analog Circuits', 'Control Systems'],
    'AI&DS': ['Python Programming', 'Machine Learning', 'Big Data', 'Statistics', 'Deep Learning'],
    'MECH': ['Thermodynamics', 'Fluid Mechanics', 'Solid Mechanics', 'Kinematics', 'Robotics']
};

async function seedMassive() {
    console.log("🚀 Starting MASSIVE University Seeding...");
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 0. PREPARE ASSETS
        PASSWORD_HASH = await bcrypt.hash(PASSWORD_PLAIN, 10);
        const bufMale = fs.readFileSync(IMG_MALE);
        const bufFemale = fs.readFileSync(IMG_FEMALE);
        const bufEvent1 = fs.readFileSync(IMG_EVENT_1);
        const bufEvent2 = fs.readFileSync(IMG_EVENT_2);

        // 1. WIPE DATABASE
        console.log("🧹 Wiping Tables...");
        await client.query(`
            TRUNCATE TABLE users, subjects, schedule, events, announcements, attendance, grades RESTART IDENTITY CASCADE;
        `);

        // 2. CREATE FACULTY (IDs 1000+)
        console.log("👨‍🏫 Creating Faculty...");
        const facultyIds = [];
        let fId = 1000;

        for (const dept of DEPARTMENTS) {
            for (let i = 1; i <= 5; i++) { // 5 Faculty per dept
                fId++;
                const name = `Prof_${dept}_${i}`;
                const email = `${name.toLowerCase()}@kl.edu`;

                await client.query(`
                    INSERT INTO users (id, first_name, last_name, email, password, role, approved, department, profile_image)
                    VALUES ($1, $2, $3, $4, $5, 'faculty', TRUE, $6, $7)
                `, [fId, name, 'Faculty', email, PASSWORD_HASH, dept, bufMale]);

                facultyIds.push({ id: fId, dept });

                // Add Profile Details
                await client.query(`
                    INSERT INTO faculty_profiles (user_id, department, designation)
                    VALUES ($1, $2, 'Assistant Professor')
                `, [fId, dept]);
            }
        }

        // 3. CREATE SUBJECTS
        console.log("📚 Creating Subjects...");
        const subjectMap = []; // { id, dept, sem, name }

        for (const dept of DEPARTMENTS) {
            const subs = SUBJECTS_POOL[dept];
            for (let i = 0; i < subs.length; i++) {
                const res = await client.query(`
                    INSERT INTO subjects (subject_name, subject_code, faculty_name, credits)
                    VALUES ($1, $2, $3, 4) RETURNING id
                `, [subs[i], `${dept}10${i + 1}`, `Prof_${dept}_${(i % 5) + 1}`]); // Assign mockup name context

                subjectMap.push({
                    id: res.rows[0].id,
                    name: subs[i],
                    dept: dept
                });
            }
        }

        // 4. CREATE STUDENTS (IDs 230000+)
        console.log(`👨‍🎓 Creating ${TOTAL_STUDENTS} Students...`);
        const students = [];
        let sId = 230000;

        for (let i = 0; i < TOTAL_STUDENTS; i++) {
            sId++;
            const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
            const sem = SEMESTERS[Math.floor(Math.random() * SEMESTERS.length)];
            const sec = SECTIONS[Math.floor(Math.random() * SECTIONS.length)];
            const gender = Math.random() > 0.5 ? 'Male' : 'Female';
            const pic = gender === 'Male' ? bufMale : bufFemale;
            const fname = `Student${i}`;
            const email = `${sId}@student.kl.edu`; // ID ID like portal

            await client.query(`
                INSERT INTO users (id, first_name, last_name, email, password, role, approved, department, semester, section, profile_image)
                VALUES ($1, $2, $3, $4, $5, 'student', TRUE, $6, $7, $8, $9)
            `, [sId, fname, 'KL', email, PASSWORD_HASH, dept, sem, sec, pic]);

            students.push({ id: sId, dept, sem, sec });
        }

        // Add Admin
        await client.query(`
             INSERT INTO users (id, first_name, last_name, email, password, role, approved)
             VALUES (1, 'Admin', 'User', 'admin@kl.edu', $1, 'admin', TRUE)
        `, [PASSWORD_HASH]);

        // Fix Sequence
        await client.query("SELECT setval('users_id_seq', 300000)");

        // 5. CREATE SCHEDULE & ATTENDANCE
        console.log("📅 creating Schedule & Attendance...");
        // For each Dept-Sem-Sec, create a routine
        // We'll just define that each subject in the dept is taught once a week for simplicity

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        for (const dept of DEPARTMENTS) {
            const deptSubjects = subjectMap.filter(s => s.dept === dept);
            const deptFaculty = facultyIds.filter(f => f.dept === dept);

            if (deptSubjects.length === 0 || deptFaculty.length === 0) continue;

            // For semi-realistic schedule, assume all sems map to these subjects randomly
            for (const sem of SEMESTERS) {
                for (const sec of SECTIONS) {

                    // Create 5 slots per week
                    for (let d = 0; d < 5; d++) {
                        const sub = deptSubjects[d % deptSubjects.length];
                        const fac = deptFaculty[d % deptFaculty.length];

                        // Insert Schedule
                        await client.query(`
                           INSERT INTO schedule (day_of_week, start_time, end_time, subject_id, faculty_id, room_number, department, semester, section)
                           VALUES ($1, '09:00', '10:00', $2, $3, $4, $5, $6, $7)
                       `, [days[d], sub.id, fac.id, `Room-${dept}-${sem}`, dept, sem, sec]);

                        // --- GENERATE ATTENDANCE HISTORY (Past 30 days) ---
                        // Find students in this class
                        const classStudents = students.filter(s => s.dept === dept && s.sem === sem && s.sec === sec);

                        for (let w = 0; w < 4; w++) { // Last 4 weeks
                            const date = dayjs().subtract(w, 'week').day(d + 1).format('YYYY-MM-DD'); // d+1 matches Monday index usually

                            for (const st of classStudents) {
                                const status = Math.random() > 0.15 ? 'Present' : 'Absent';
                                // IDK if schedule loop matches real dates perfectly but close enough for sample
                                await client.query(`
                                   INSERT INTO attendance (student_id, subject_id, date, status)
                                   VALUES ($1, $2, $3, $4)
                                   ON CONFLICT DO NOTHING
                               `, [st.id, sub.id, date, status]);
                            }
                        }
                    }
                }
            }
        }

        // 6. GRADES & EVENTS
        console.log("📝 Posting Grades & Events...");
        // Grades
        for (const st of students) {
            const deptSubjects = subjectMap.filter(s => s.dept === st.dept);
            for (const sub of deptSubjects) {
                const marks = 40 + Math.floor(Math.random() * 60);
                await client.query(`
                     INSERT INTO grades (student_id, subject_id, semester, assessment_type, marks, max_marks, grade, grade_point)
                     VALUES ($1, $2, $3, 'MID1', $4, 100, $5, $6)
                 `, [st.id, sub.id, st.sem, marks, marks > 90 ? 'O' : marks > 80 ? 'A+' : 'A', marks / 10]);
            }
        }

        // Events
        await client.query(`
            INSERT INTO events (title, type, date, location, description, image)
            VALUES 
            ('Tech Fest 2026', 'Technical', '2026-03-01', 'Auditorium', 'The biggest tech fest.', $1),
            ('Cultural Night', 'Cultural', '2026-04-15', 'OAT', 'Dance and Music.', $2)
        `, [bufEvent1, bufEvent2]);

        await client.query('COMMIT');
        console.log("✅ MASSIVE SEEDING COMPLETE!");

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ SEED FAILED:", err);
    } finally {
        client.release();
        pool.end();
    }
}

seedMassive();
