const { Pool } = require('pg');
const fs = require('fs');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const connectionString = "postgres://postgres.bxdeezxpceeofgmdmojm:Bhanu%402003%23%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const TOTAL_STUDENTS = 200;
const HASH = bcrypt.hashSync("12345", 10);

const IMG_MALE = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_1_1767971149159.png";
const IMG_FEMALE = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/student_avatar_2_1767971189255.png";
const IMG_TECH = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/tech_event_banner_1767970874927.png";
const IMG_CULT = "C:/Users/chimm/.gemini/antigravity/brain/2b27380d-ffb9-4c48-86e4-29e570aa2e36/cultural_fest_banner_1767970900736.png";

const DEPTS = ['CSE', 'ECE', 'AI&DS', 'MECH'];
const SEMS = [1, 3, 5, 7];
const SUBS = {
    'CSE': ['Data Structures', 'Database', 'Computer Networks', 'Operating Systems', 'AI Fundamentals'],
    'ECE': ['Signals', 'VLSI Design', 'Control Systems', 'Embedded Systems', 'Microcontrollers'],
    'AI&DS': ['Machine Learning', 'Big Data', 'Information Retrieval', 'Cloud Computing', 'Data Mining'],
    'MECH': ['Fluid Dynamics', 'Heat Transfer', 'Manufacturing', 'Machine Design', 'Auto CAD']
};

async function seed() {
    console.log("🚀 Starting COMPLETION Seeding (Portal Style IDs, Full Sem Details)...");
    const client = await pool.connect();

    try {
        const bufM = fs.readFileSync(IMG_MALE);
        const bufF = fs.readFileSync(IMG_FEMALE);
        const bufT = fs.readFileSync(IMG_TECH);
        const bufC = fs.readFileSync(IMG_CULT);

        await client.query('TRUNCATE TABLE users, subjects, schedule, events, announcements, attendance, grades RESTART IDENTITY CASCADE;');

        // 1. Faculty (Format: 9000 + Index)
        console.log("Creating Faculty...");
        const faculty = [];
        let fBaseId = 900000;
        for (let i = 0; i < 15; i++) {
            const id = fBaseId + i;
            const dept = DEPTS[i % DEPTS.length];
            const email = `fac${id}@klu.edu`;
            await client.query(`
                INSERT INTO users (id, first_name, last_name, email, password, role, approved, department, profile_image)
                VALUES ($1, $2, $3, $4, $5, 'faculty', TRUE, $6, $7)
            `, [id, `Dr. ${['Alan', 'Grace', 'Barbara', 'Donald', 'Linus'][i % 5]}`, ['Turing', 'Hopper', 'Liskov', 'Knuth', 'Torvalds'][i % 5], email, HASH, dept, bufM]);

            await client.query("INSERT INTO faculty_profiles (user_id, department, designation) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING", [id, dept, i < 4 ? 'Professor' : 'Asst. Professor']);
            faculty.push({ id, dept });
        }

        // 2. Subjects
        console.log("Creating Subjects...");
        const subjects = [];
        for (const dept of DEPTS) {
            for (let i = 0; i < SUBS[dept].length; i++) {
                const name = SUBS[dept][i];
                const code = `${dept}${i + 101}`;
                const res = await client.query(`
                    INSERT INTO subjects (subject_name, subject_code, credits)
                    VALUES ($1, $2, $3) RETURNING id
                `, [name, code, 4]);
                subjects.push({ id: res.rows[0].id, dept, name, code });
            }
        }

        // 3. Students (Format: 2100 + Index)
        console.log("Creating Students...");
        const students = [];
        let sBaseId = 21000000;
        for (let i = 1; i <= TOTAL_STUDENTS; i++) {
            const id = sBaseId + i;
            const dept = DEPTS[i % DEPTS.length];
            const sem = SEMS[i % SEMS.length];
            const sec = (i % 2 === 0) ? 'A' : 'B';
            const gender = (i % 2 === 0) ? 'F' : 'M';
            await client.query(`
                INSERT INTO users (id, first_name, last_name, email, password, role, approved, department, branch, semester, section, profile_image, gender)
                VALUES ($1, $2, $3, $4, $5, 'student', TRUE, $6, $7, $8, $9, $10, $11)
            `, [id, `Student_${i}`, 'KL', `${id}@klu.edu`, HASH, dept, dept, sem, sec, gender === 'F' ? bufF : bufM, gender === 'F' ? 'Female' : 'Male']);
            students.push({ id, dept, sem, sec });
        }

        // 4. Schedule & Attendance (8 weeks, full routine)
        console.log("Building Schedule & Historical Attendance...");
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        for (const dept of DEPTS) {
            const dStus = students.filter(s => s.dept === dept);
            const dSubs = subjects.filter(s => s.dept === dept);
            const dFacs = faculty.filter(f => f.dept === dept);

            for (let i = 0; i < dSubs.length; i++) {
                const sub = dSubs[i];
                const fac = dFacs[i % dFacs.length];
                const day = days[i % 5];

                await client.query(`
                    INSERT INTO schedule (day_of_week, start_time, end_time, subject_id, faculty_id, room_number, department)
                    VALUES ($1, '09:00', '10:00', $2, $3, $4, $5)
                `, [day, sub.id, fac.id, `Room-${dept}-${i + 1}`, dept]);

                // Full Sem Attendance (16 weeks)
                for (let w = 0; w < 16; w++) {
                    const date = dayjs().subtract(w, 'week').day(days.indexOf(day) + 1).format('YYYY-MM-DD');
                    const chunkSize = 50;
                    for (let k = 0; k < dStus.length; k += chunkSize) {
                        const chunk = dStus.slice(k, k + chunkSize);
                        let v = [], p = [], pIdx = 1;
                        for (const st of chunk) {
                            v.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`);
                            p.push(st.id, sub.id, date, Math.random() > 0.1 ? 'Present' : 'Absent');
                        }
                        await client.query(`INSERT INTO attendance (student_id, subject_id, date, status) VALUES ${v.join(', ')} ON CONFLICT DO NOTHING`, p);
                    }
                }
            }
        }

        // 5. Grades (Full Semester: MID1, MID2, LAB, END) - BATCHED
        console.log("Generating Full Semester Grade Details (Batched)...");
        const types = ['MID1', 'MID2', 'LAB', 'END'];
        const gradeChunkSize = 25; // 25 students * 5 subs * 4 types = 500 records per query
        for (let i = 0; i < students.length; i += gradeChunkSize) {
            const chunk = students.slice(i, i + gradeChunkSize);
            let v = [], p = [], pIdx = 1;

            for (const st of chunk) {
                const dSubs = subjects.filter(s => s.dept === st.dept);
                for (const sub of dSubs) {
                    for (const t of types) {
                        const marks = (t === 'END' ? 40 : 20) + Math.floor(Math.random() * (t === 'END' ? 60 : 10));
                        const max = (t === 'END' ? 100 : 30);
                        const gp = (marks / max) * 10;
                        const gr = marks / max > 0.9 ? 'O' : marks / max > 0.8 ? 'A+' : 'A';

                        v.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`);
                        p.push(st.id, sub.id, st.sem, t, marks, max, gr, gp);
                    }
                }
            }
            if (v.length > 0) {
                await client.query(`INSERT INTO grades (student_id, subject_id, semester, assessment_type, marks, max_marks, grade, grade_point) VALUES ${v.join(', ')}`, p);
                console.log(`   Processed grades for ${i + chunk.length} students...`);
            }
        }

        // 6. Admin, Events & Announcements
        console.log("Finalizing Extras...");
        await client.query("INSERT INTO users (id, first_name, email, password, role, approved) VALUES (1, 'KLU', 'admin@klu.edu', $1, 'admin', TRUE)", [HASH]);
        await client.query(`INSERT INTO events (title, type, date, location, description, image) VALUES 
            ('Tech Fest 2026', 'Technical', '2026-03-20', 'Open Theater', 'KLU Annual Tech Fest', $1),
            ('Cultural Night', 'Cultural', '2026-04-10', 'Indoor Stadium', 'Cultural extravaganza', $2)
        `, [bufT, bufC]);
        await client.query("INSERT INTO announcements (title, message, created_by) VALUES ('Semester Results', 'All results for 2025-26 have been published.', 1)");

        console.log("✅ SEEDING COMPLETE! PORTAL IDs LOADED.");
    } finally {
        client.release();
        pool.end();
    }
}

seed();
