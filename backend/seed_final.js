const { Pool } = require('pg');
const fs = require('fs');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const TOTAL_STUDENTS = 200;
const PASSWORD_HASH = bcrypt.hashSync("12345", 10);

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

async function runStep(name, callback) {
    console.log(`\n🔹 [Step] ${name}...`);
    try {
        await callback();
        console.log(`✅ [Step] ${name} complete.`);
    } catch (err) {
        console.error(`❌ [Step] ${name} failed:`, err.message);
        throw err;
    }
}

async function seedFinal() {
    console.log("🚀 Starting Granular Seeding...");
    const bufMale = fs.readFileSync(IMG_MALE);
    const bufFemale = fs.readFileSync(IMG_FEMALE);
    const bufEvent1 = fs.readFileSync(IMG_EVENT_1);
    const bufEvent2 = fs.readFileSync(IMG_EVENT_2);

    const client = await pool.connect();

    try {
        await runStep("Wiping Database", async () => {
            await client.query('TRUNCATE TABLE users, subjects, schedule, events, announcements, attendance, grades RESTART IDENTITY CASCADE;');
        });

        const facultyIds = [];
        const subjectMap = [];

        await runStep("Creating Faculty & Subjects", async () => {
            let fId = 1000;
            for (const dept of DEPARTMENTS) {
                // Create 3 Faculty per dept (Total 12)
                for (let i = 1; i <= 3; i++) {
                    fId++;
                    const email = `prof_${dept.toLowerCase()}_${i}@kl.edu`;
                    await client.query(`
                        INSERT INTO users (id, first_name, last_name, email, password, role, approved, department, profile_image)
                        VALUES ($1, $2, 'Faculty', $3, $4, 'faculty', TRUE, $5, $6)
                    `, [fId, `Prof.${dept}.${i}`, email, PASSWORD_HASH, dept, bufMale]);

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
        });

        const students = [];
        await runStep("Creating Students", async () => {
            let sId = 230000;
            for (let i = 1; i <= TOTAL_STUDENTS; i++) {
                sId++;
                const dept = DEPARTMENTS[i % DEPARTMENTS.length];
                const sem = SEMESTERS[i % SEMESTERS.length];
                const sec = SECTIONS[i % SECTIONS.length];
                const pic = (i % 2 === 0) ? bufMale : bufFemale;

                await client.query(`
                    INSERT INTO users (id, first_name, last_name, email, password, role, approved, department, semester, section, profile_image)
                    VALUES ($1, $2, 'KL', $3, $4, 'student', TRUE, $5, $6, $7, $8)
                `, [sId, `Student_${i}`, `${sId}@student.kl.edu`, PASSWORD_HASH, dept, sem, sec, pic]);

                students.push({ id: sId, dept, sem, sec });
            }
            await client.query("SELECT setval('users_id_seq', 300000)");
        });

        await runStep("Setting up Schedule & Attendance (4 weeks only)", async () => {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            for (const dept of DEPARTMENTS) {
                const dSubs = subjectMap.filter(s => s.dept === dept);
                const dFac = facultyIds.filter(f => f.dept === dept);
                const dStus = students.filter(s => s.dept === dept);

                for (let i = 0; i < dSubs.length; i++) {
                    const day = days[i % 5];
                    const fac = dFac[i % dFac.length];
                    const sub = dSubs[i];

                    // Create Schedule Slot
                    await client.query(`
                        INSERT INTO schedule (day_of_week, start_time, end_time, subject_id, faculty_id, room_number, department)
                        VALUES ($1, '09:00', '10:00', $2, $3, $4, $5)
                    `, [day, sub.id, fac.id, `R-${dept}-${i + 1}`, dept]);

                    // Attendance History (4 weeks)
                    for (let w = 0; w < 4; w++) {
                        const date = dayjs().subtract(w, 'week').day(days.indexOf(day) + 1).format('YYYY-MM-DD');
                        const chunkSize = 100;
                        for (let k = 0; k < dStus.length; k += chunkSize) {
                            const chunk = dStus.slice(k, k + chunkSize);
                            let values = [];
                            let params = [];
                            let pIdx = 1;
                            for (const st of chunk) {
                                values.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`);
                                params.push(st.id, sub.id, date, Math.random() > 0.15 ? 'Present' : 'Absent');
                            }
                            await client.query(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES ${values.join(', ')} ON CONFLICT DO NOTHING`, params);
                        }
                    }
                }
            }
        });

        await runStep("Creating Grades", async () => {
            const chunkSize = 50;
            for (let i = 0; i < students.length; i += chunkSize) {
                const chunk = students.slice(i, i + chunkSize);
                for (const st of chunk) {
                    const mySubs = subjectMap.filter(s => s.dept === st.dept).slice(0, 3);
                    for (const sub of mySubs) {
                        const marks = 45 + Math.floor(Math.random() * 50);
                        await client.query(`
                            INSERT INTO grades (student_id, subject_id, semester, assessment_type, marks, max_marks, grade, grade_point)
                            VALUES ($1, $2, $3, 'MID1', $4, 100, $5, $6)
                        `, [st.id, sub.id, st.sem, marks, marks > 90 ? 'O' : marks > 80 ? 'A+' : 'A', marks / 10]);
                    }
                }
            }
        });

        await runStep("Admin & Events", async () => {
            await client.query(`INSERT INTO users (id, first_name, email, password, role, approved) VALUES (1, 'Admin', 'admin@kl.edu', $1, 'admin', TRUE) ON CONFLICT DO NOTHING`, [PASSWORD_HASH]);
            await client.query(`INSERT INTO events (title, type, date, location, description, image) VALUES ('Final Showcase', 'Technical', '2026-06-12', 'KL Auditorium', 'Project showcase.', $1)`, [bufEvent1]);
            await client.query(`INSERT INTO events (title, type, date, location, description, image) VALUES ('Spring Fest', 'Cultural', '2026-07-20', 'Open Ground', 'Annual cultural fest.', $2)`, [bufEvent2]);
            await client.query(`INSERT INTO announcements (title, message, created_by) VALUES ('Welcome', 'Welcome to the New Portal', 1)`);
        });

        console.log("\n✨✨ ALL STEPS COMPLETE! ✨✨");
    } catch (e) {
        console.error("\n💥 GLOBAL FAILURE:", e.message);
    } finally {
        client.release();
        pool.end();
    }
}

seedFinal();
