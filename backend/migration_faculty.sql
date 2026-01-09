-- 0. Ensure Primary Keys Exist (Fixes generic linking errors)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey') THEN
        ALTER TABLE users ADD PRIMARY KEY (id);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subjects_pkey') THEN
        ALTER TABLE subjects ADD PRIMARY KEY (id);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 1. Update Users Table: Allow 'faculty' role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'admin', 'faculty'));

-- 2. Create Schedule Table
CREATE TABLE IF NOT EXISTS schedule (
    id SERIAL PRIMARY KEY,
    day_of_week VARCHAR(10) CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id INTEGER, -- REFERENCES subjects(id) removed for stability
    faculty_id INTEGER, -- REFERENCES users(id) removed for stability
    room_number VARCHAR(20),
    department VARCHAR(50) DEFAULT 'CSE',
    semester INTEGER DEFAULT 1,
    section VARCHAR(10) DEFAULT 'A',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Faculty Details (Optional extra info)
CREATE TABLE IF NOT EXISTS faculty_profiles (
    user_id INTEGER PRIMARY KEY, -- Linked loosely to users(id)
    department VARCHAR(50),
    designation VARCHAR(50) DEFAULT 'Assistant Professor',
    joining_date DATE DEFAULT CURRENT_DATE
);

-- 4. (Removed automatic insert to avoid constraint errors)
-- Use the App to sign up a faculty member.
