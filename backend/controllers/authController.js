
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const { first_name, middle_name, last_name, email, password, branch, gender } = req.body;
    console.log("Signup Request:", { email, hasFile: !!req.file });
    const profileImage = req.file ? req.file.buffer : null;

    // Check if user exists
    const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.length > 0) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // Temporarily disable image for debugging
    // const profileImage = req.file ? req.file.buffer : null;
    // const safeImage = profileImage || null;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO users (first_name, middle_name, last_name, email, password, role, approved, profile_image, branch, gender, department)
      VALUES ($1, $2, $3, $4, $5, 'student', false, $6, $7, $8, $9)
    `;
    const safeImage = req.file ? req.file.buffer : null;

    await pool.query(query, [first_name, middle_name, last_name, email, hashed, safeImage, branch, gender, branch]);

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Signup error", details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);

    if (rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ error: "Wrong password" });
    if (user.role === "student" && user.approved === false) return res.status(403).json({ error: "Awaiting admin approval" });

    res.json({
      message: "Login success",
      role: user.role,
      user_id: user.id,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.pendingStudents = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, middle_name, last_name, email, profile_image, branch, gender 
       FROM users WHERE role='student' AND approved=false`
    );
    const formatted = rows.map(s => ({
      id: s.id,
      full_name: `${s.first_name} ${s.middle_name || ""} ${s.last_name}`.trim(),
      email: s.email,
      branch: s.branch,
      gender: s.gender,
      profile_image: s.profile_image ? Buffer.from(s.profile_image).toString("base64") : null
    }));
    res.json(formatted);
  } catch (err) {
    console.error("Pending Students Error:", err);
    res.status(500).json({ error: "Error loading pending students" });
  }
};

exports.approveStudent = async (req, res) => {
  try {
    const { student_id } = req.body;
    await pool.query(`UPDATE users SET approved=true WHERE id=$1`, [student_id]);
    res.json({ message: "Student approved!" });
  } catch (err) {
    res.status(500).json({ error: "Approve failed" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { email } = req.query;
    // Updated to select ALL details, not just image
    const { rows } = await pool.query(`SELECT id, first_name, middle_name, last_name, email, role, profile_image FROM users WHERE email=$1`, [email]);

    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = rows[0];
    const image = user.profile_image ? Buffer.from(user.profile_image).toString("base64") : null;

    res.json({
      ...user,
      profile_image: image
    });
  } catch (err) {
    res.status(500).json({ error: "Error loading profile" });
  }
};

exports.updateDetails = async (req, res) => {
  try {
    const { user_id, first_name, middle_name, last_name } = req.body;

    await pool.query(
      "UPDATE users SET first_name=$1, middle_name=$2, last_name=$3 WHERE id=$4",
      [first_name, middle_name, last_name, user_id]
    );

    res.json({ message: "Details updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update details" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { user_id, old_password, new_password } = req.body;

    const { rows } = await pool.query("SELECT password FROM users WHERE id=$1", [user_id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    const currentHash = rows[0].password;
    const match = await bcrypt.compare(old_password, currentHash);

    if (!match) return res.status(400).json({ error: "Incorrect old password" });

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [newHash, user_id]);

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update password" });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    const { user_id } = req.body;
    const image = req.file ? req.file.buffer : null;

    if (!image) return res.status(400).json({ error: "No image provided" });

    await pool.query("UPDATE users SET profile_image=$1 WHERE id=$2", [image, user_id]);

    res.json({ message: "Profile image updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update image" });
  }
};
