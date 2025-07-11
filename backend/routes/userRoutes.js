const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Playlist = require("../models/Playlist")
const auth = require("../middleware/auth")
const { uploadImage } = require("../utils/fileUpload")
const path = require("path")
const fs = require("fs")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Register a new user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body

  try {
    // Check if user exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create user
    user = new User({
      name,
      email,
      password, // Store plain text password
    })

    await user.save()

    // Create token
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        })
      }
    )
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    // Check if user exists
    let user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password (plain text comparison)
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create token
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        })
      }
    )
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
      },
    })
  } catch (err) {
    console.error("Error fetching user:", err.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// Add a new route to get user by ID
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    })
  } catch (err) {
    console.error("Error fetching user:", err.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route   POST /api/user/playlists
// @desc    Create a new playlist
// @access  Private
router.post(
  "/playlists",
  auth,
  uploadImage.single("cover"),
  async (req, res) => {
    try {
      const { name, description, songs, isPublic } = req.body

      if (!req.file) {
        return res.status(400).json({ message: "Cover image is required" })
      }

      const coverUrl = `/uploads/images/${req.file.filename}`

      const newPlaylist = new Playlist({
        name,
        description,
        coverUrl,
        songs: songs ? JSON.parse(songs) : [],
        createdBy: req.user.id,
        isPublic: isPublic === "true",
      })

      await newPlaylist.save()

      await newPlaylist.populate("songs", "title artist album coverUrl duration")

      res.status(201).json({
        message: "Playlist created successfully",
        playlist: newPlaylist,
      })
    } catch (err) {
      console.error("Error creating playlist:", err.message)
      res.status(500).json({ message: "Server error: " + err.message })
    }
  }
)

// @route   GET /api/user/playlists
// @desc    Get user's playlists
// @access  Private
router.get("/playlists", auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate("songs", "title artist album coverUrl duration audioUrl")

    res.json(playlists)
  } catch (err) {
    console.error("Error getting user playlists:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/user/playlists/:id
// @desc    Update a playlist
// @access  Private
router.put(
  "/playlists/:id",
  auth,
  uploadImage.single("cover"),
  async (req, res) => {
    try {
      const playlist = await Playlist.findById(req.params.id)

      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" })
      }

      // Check if user owns the playlist
      if (playlist.createdBy.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to edit this playlist" })
      }

      const { name, description, songs, isPublic } = req.body

      if (name) playlist.name = name
      if (description) playlist.description = description
      if (songs) playlist.songs = JSON.parse(songs)
      if (isPublic !== undefined) playlist.isPublic = isPublic === "true"

      // Handle cover image update
      if (req.file) {
        if (playlist.coverUrl) {
          const oldImagePath = path.join(__dirname, "..", playlist.coverUrl)
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath)
        }
        playlist.coverUrl = `/uploads/images/${req.file.filename}`
      }

      playlist.updatedAt = Date.now()
      await playlist.save()

      await playlist.populate("songs", "title artist album coverUrl duration audioUrl")

      res.json({
        message: "Playlist updated successfully",
        playlist,
      })
    } catch (err) {
      console.error("Error updating playlist:", err.message)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// @route   DELETE /api/user/playlists/:id
// @desc    Delete a playlist
// @access  Private
router.delete("/playlists/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" })
    }

    // Check if user owns the playlist
    if (playlist.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this playlist" })
    }

    // Delete cover image file
    if (playlist.coverUrl) {
      const imagePath = path.join(__dirname, "..", playlist.coverUrl)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await playlist.deleteOne()

    res.json({ message: "Playlist deleted successfully" })
  } catch (err) {
    console.error("Error deleting playlist:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/user/playlists/:id/songs
// @desc    Add a song to a playlist
// @access  Private
router.post("/playlists/:id/songs", auth, async (req, res) => {
  try {
    const { songId } = req.body
    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" })
    }

    // Check if user owns the playlist
    if (playlist.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this playlist" })
    }

    // Check if song is already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: "Song already in playlist" })
    }

    playlist.songs.push(songId)
    playlist.updatedAt = Date.now()
    await playlist.save()

    await playlist.populate("songs", "title artist album coverUrl duration audioUrl")

    res.json({
      message: "Song added to playlist successfully",
      playlist,
    })
  } catch (err) {
    console.error("Error adding song to playlist:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/user/playlists/:id/songs/:songId
// @desc    Remove a song from a playlist
// @access  Private
router.delete("/playlists/:id/songs/:songId", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" })
    }

    // Check if user owns the playlist
    if (playlist.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this playlist" })
    }

    // Remove song from playlist
    playlist.songs = playlist.songs.filter(
      (songId) => songId.toString() !== req.params.songId
    )

    playlist.updatedAt = Date.now()
    await playlist.save()

    await playlist.populate("songs", "title artist album coverUrl duration audioUrl")

    res.json({
      message: "Song removed from playlist successfully",
      playlist,
    })
  } catch (err) {
    console.error("Error removing song from playlist:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// Add song to user's library (without auth middleware)
router.post("/library", async (req, res) => {
  try {
    const { songId, userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    if (!songId) {
      return res.status(400).json({ message: "Song ID is required" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Initialize savedSongs array if it doesn't exist
    if (!user.savedSongs) {
      user.savedSongs = []
    }

    // Check if song is already in library
    if (user.savedSongs.includes(songId)) {
      return res.status(400).json({ message: "Song already in library" })
    }

    // Add song to library
    user.savedSongs.push(songId)
    await user.save()

    res.json({
      message: "Song added to library",
      savedSongs: user.savedSongs,
    })
  } catch (error) {
    console.error("Add to library error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Remove song from user's library (without auth middleware)
router.delete("/library/:songId", async (req, res) => {
  try {
    const { songId } = req.params
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Initialize savedSongs array if it doesn't exist
    if (!user.savedSongs) {
      user.savedSongs = []
    }

    // Remove song from library
    user.savedSongs = user.savedSongs.filter(
      (id) => id.toString() !== songId
    )
    await user.save()

    res.json({
      message: "Song removed from library",
      savedSongs: user.savedSongs,
    })
  } catch (error) {
    console.error("Remove from library error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user's library (without auth middleware)
router.get("/library", async (req, res) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    const user = await User.findById(userId).populate("savedSongs")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ savedSongs: user.savedSongs || [] })
  } catch (error) {
    console.error("Get library error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
