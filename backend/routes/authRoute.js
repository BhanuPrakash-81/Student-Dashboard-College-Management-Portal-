
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const { 
  signup, 
  login, 
  pendingStudents, 
  approveStudent, 
  getProfile, 
  changePassword, 
  updateProfileImage,
  updateDetails
} = require("../controllers/authController");

router.post("/signup", upload.single("profile_image"), signup);
router.post("/login", login);
router.get("/pending-students", pendingStudents);
router.post("/approve", approveStudent);
router.get("/profile", getProfile);
router.post("/change-password", changePassword);
router.post("/update-image", upload.single("image"), updateProfileImage);
router.put("/update-details", updateDetails);

module.exports = router;
