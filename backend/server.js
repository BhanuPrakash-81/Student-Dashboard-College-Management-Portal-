
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/events", require("./routes/eventsRoute"));
app.use("/api/attendance", require("./routes/attendanceRoute"));
app.use("/api/grades", require("./routes/gradesRoute"));
app.use("/api/announcements", require("./routes/announcementsRoute"));

// Health check
app.get('/', (req, res) => {
  res.send('KL University API is running with MySQL...');
});

// Use port 5000 to avoid conflict with React or stuck processes on 3000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
