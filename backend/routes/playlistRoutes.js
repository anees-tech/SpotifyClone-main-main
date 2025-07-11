const express = require("express")
const router = express.Router()
const Playlist = require("../models/Playlist")
const auth = require("../middleware/auth")

// @route   GET /api/playlists
// @desc    Get all public playlists
// @access  Public
router.get("/", async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate("songs", "title artist album coverUrl")

    res.json(playlists)
  } catch (err) {
    console.error("Error getting playlists:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/playlists/:id
// @desc    Get a playlist by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate(
      "songs",
      "title artist album coverUrl duration audioUrl",
    )

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" })
    }

    // Check if playlist is public or belongs to the user
    if (!playlist.isPublic) {
      return res.status(403).json({ message: "This playlist is private" })
    }

    res.json(playlist)
  } catch (err) {
    console.error("Error getting playlist:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
