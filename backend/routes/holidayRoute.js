
const express = require("express");
const router = express.Router();
const { getAllHolidays, addHoliday, deleteHoliday } = require("../controllers/holidayController");

router.get("/", getAllHolidays);
router.post("/add", addHoliday);
router.delete("/:id", deleteHoliday);

module.exports = router;
