
const pool = require("../config/db");

exports.addAnnouncement = async (req, res) => {
  try {
    const { title, message, is_active } = req.body;
    // is_active is boolean in JSON, convert to 1 or 0
    const activeVal = is_active ? 1 : 0;

    await pool.query(
      "INSERT INTO announcements (title, message, is_active) VALUES (?, ?, ?)",
      [title, message, activeVal]
    );
    res.json({ message: "Announcement posted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post announcement" });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, is_active } = req.body;
    const activeVal = is_active ? 1 : 0;

    await pool.query(
      "UPDATE announcements SET title=?, message=?, is_active=? WHERE id=?",
      [title, message, activeVal, id]
    );
    res.json({ message: "Announcement updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update announcement" });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM announcements WHERE id=?", [id]);
    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
};
