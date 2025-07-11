const express = require("express")
const router = express.Router()
const Song = require("../models/Song")
const auth = require("../middleware/auth")

// @route   GET /api/songs
// @desc    Get all songs
// @access  Public
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 })
    res.json(songs)
  } catch (err) {
    console.error("Error getting songs:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/songs/:id
// @desc    Get a song by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)

    if (!song) {
      return res.status(404).json({ message: "Song not found" })
    }

    res.json(song)
  } catch (err) {
    console.error("Error getting song:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
