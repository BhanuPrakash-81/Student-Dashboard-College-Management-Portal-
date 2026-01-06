
const pool = require("../config/db");

exports.addEvent = async (req, res) => {
  try {
    const { title, type, date, time, location, description } = req.body;
    const image = req.file ? req.file.buffer : null;

    await pool.query(
      `INSERT INTO events (title, type, date, time, location, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, type, date, time, location, image, description]
    );

    res.json({ message: "Event added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Event upload failed" });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM events ORDER BY date ASC");
    const formatted = rows.map(e => ({
      ...e,
      image: e.image ? Buffer.from(e.image).toString("base64") : ""
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Event loading failed" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, date, time, location, description } = req.body;
    const image = req.file ? req.file.buffer : null;

    if (image) {
      await pool.query(
        `UPDATE events SET title=?, type=?, date=?, time=?, location=?, description=?, image=? WHERE id=?`,
        [title, type, date, time, location, description, image, id]
      );
    } else {
      await pool.query(
        `UPDATE events SET title=?, type=?, date=?, time=?, location=?, description=? WHERE id=?`,
        [title, type, date, time, location, description, id]
      );
    }

    res.json({ message: "Event updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM events WHERE id=?", [id]);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};
