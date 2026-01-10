
const pool = require("../config/db");

exports.getAllHolidays = async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM holidays ORDER BY date ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch holidays" });
    }
};

exports.addHoliday = async (req, res) => {
    try {
        const { date, reason, is_recurring } = req.body;
        await pool.query(
            "INSERT INTO holidays (date, reason, is_recurring) VALUES ($1, $2, $3) ON CONFLICT (date) DO UPDATE SET reason=$2, is_recurring=$3",
            [date, reason, is_recurring]
        );
        res.json({ message: "Holiday added successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add holiday" });
    }
};

exports.deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM holidays WHERE id = $1", [id]);
        res.json({ message: "Holiday deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete holiday" });
    }
};
