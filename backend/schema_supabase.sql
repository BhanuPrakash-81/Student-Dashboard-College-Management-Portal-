CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('student','admin')) DEFAULT 'student',
  approved BOOLEAN DEFAULT FALSE,
  profile_image BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  subject_code VARCHAR(32) UNIQUE,
  subject_name VARCHAR(255),
  faculty_name VARCHAR(255),
  credits INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_by INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Present','Absent','OnLeave','Holiday')) DEFAULT 'Absent',
  note VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, subject_id, date),
  FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('Workshop','Cultural','Sports','Technical')) DEFAULT 'Technical',
  date DATE NOT NULL,
  time VARCHAR(50),
  location VARCHAR(255),
  description TEXT,
  image BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  assessment_type VARCHAR(20) CHECK (assessment_type IN ('MID1','MID2','LAB','END','ASSIGNMENT','QUIZ','PRACTICAL')),
  marks FLOAT,
  max_marks FLOAT,
  grade VARCHAR(8),
  grade_point FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
);
