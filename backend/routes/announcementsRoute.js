
const express = require("express");
const router = express.Router();
const { addAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcementsController");

router.post("/add", addAnnouncement);
router.get("/", getAnnouncements);
router.put("/update/:id", updateAnnouncement);
router.delete("/delete/:id", deleteAnnouncement);

module.exports = router;
