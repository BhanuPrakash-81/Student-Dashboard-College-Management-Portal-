
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const { addEvent, getEvents, updateEvent, deleteEvent } = require("../controllers/eventsController");

router.post("/add", upload.single("image"), addEvent);
router.get("/", getEvents);
router.put("/update/:id", upload.single("image"), updateEvent);
router.delete("/delete/:id", deleteEvent);

module.exports = router;
