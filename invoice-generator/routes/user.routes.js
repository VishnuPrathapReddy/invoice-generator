const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/auth");

const router = express.Router();

// Get profile (protected)
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
