const express = require("express")
const router = express.Router()
const adminAuth = require("../middleware/adminAuth")
const { uploadImage, uploadAudio, uploadSongFiles } = require("../utils/fileUpload")
const multer = require("multer")
const Song = require("../models/Song")
const Playlist = require("../models/Playlist")
const User = require("../models/User")
const fs = require("fs")
const path = require("path")

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Admin only
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const user = req.user;

    const songCount = await Song.countDocuments()
    const playlistCount = await Playlist.countDocuments()
    const userCount = await User.countDocuments()
    const adminCount = await User.countDocuments({ isAdmin: true })

    const recentSongs = await Song.find().sort({ createdAt: -1 }).limit(5).populate("createdBy", "name email")
    const recentPlaylists = await Playlist.find().sort({ createdAt: -1 }).limit(5).populate("createdBy", "name email")

    res.json({
      counts: {
        songs: songCount,
        playlists: playlistCount,
        users: userCount,
        admins: adminCount,
      },
      recentSongs,
      recentPlaylists,
    })
  } catch (err) {
    console.error("Error in admin dashboard:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/admin/songs
// @desc    Create a new song
// @access  Admin only
router.post(
  "/songs",
  adminAuth,
  uploadSongFiles.fields([
    { name: "cover", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const user = req.user

      const { title, artist, album, duration,date, genre, releaseYear } = req.body

      if (!req.files || !req.files.cover || !req.files.audio) {
        return res.status(400).json({ message: "Cover image and audio file are required" })
      }

      const coverUrl = `/uploads/images/${req.files.cover[0].filename}`
      const audioUrl = `/uploads/audio/${req.files.audio[0].filename}`

      const newSong = new Song({
        title,
        artist,
        album,
        duration: Number.parseInt(duration),
        date,
        genre,
        releaseYear: Number.parseInt(releaseYear),
        
        coverUrl,
        audioUrl,
        createdBy: user.id,
      })

      await newSong.save()

      res.status(201).json({
        message: "Song created successfully",
        song: newSong,
      })
    } catch (err) {
      console.error("Error creating song:", err.message)
      res.status(500).json({ message: "Server error: " + err.message })
    }
  }
)

// @route   GET /api/admin/songs
// @desc    Get all songs
// @access  Admin only
router.get("/songs", adminAuth, async (req, res) => {
  try {
    const user = req.user

    const songs = await Song.find().sort({ createdAt: -1 }).populate("createdBy", "name email")

    res.json(songs)
  } catch (err) {
    console.error("Error getting songs:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/admin/songs/:id
// @desc    Get a song by ID
// @access  Admin only
router.get("/songs/:id", adminAuth, async (req, res) => {
  try {
    const user = req.user

    const song = await Song.findById(req.params.id).populate("createdBy", "name email")

    if (!song) {
      return res.status(404).json({ message: "Song not found" })
    }

    res.json(song)
  } catch (err) {
    console.error("Error getting song:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/admin/songs/:id
// @desc    Update a song (including cover/audio)
// @access  Admin only
router.put(
  "/songs/:id",
  adminAuth,
  uploadSongFiles.fields([
    { name: "cover", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const song = await Song.findById(req.params.id)
      if (!song) {
        return res.status(404).json({ message: "Song not found" })
      }

      const { title, artist, album, duration,date, genre, releaseYear } = req.body

      if (title) song.title = title
      if (artist) song.artist = artist
      if (album) song.album = album
      if (duration) song.duration = Number.parseInt(duration)
      if (date) song.date = date
      if (genre) song.genre = genre
      if (releaseYear) song.releaseYear = Number.parseInt(releaseYear)
        if (religious) song.religious =religious
      // Handle cover image update
      if (req.files && req.files.cover) {
        if (song.coverUrl) {
          const oldImagePath = path.join(__dirname, "..", song.coverUrl)
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath)
        }
        song.coverUrl = `/uploads/images/${req.files.cover[0].filename}`
      }

      // Handle audio file update
      if (req.files && req.files.audio) {
        if (song.audioUrl) {
          const oldAudioPath = path.join(__dirname, "..", song.audioUrl)
          if (fs.existsSync(oldAudioPath)) fs.unlinkSync(oldAudioPath)
        }
        song.audioUrl = `/uploads/audio/${req.files.audio[0].filename}`
      }

      song.updatedAt = Date.now()
      await song.save()

      res.json({
        message: "Song updated successfully",
        song,
      })
    } catch (err) {
      console.error("Error updating song:", err.message)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// @route   PUT /api/admin/songs/:id/cover
// @desc    Update a song's cover image
// @access  Admin only
router.put("/songs/:id/cover", adminAuth, async (req, res) => {
  try {
    const user = req.user

    uploadImage.single("cover")(req, res, async (err) => {
      if (err) {
        console.error("Error uploading image:", err)
        return res.status(500).json({ message: "Error uploading image" })
      }

      const song = await Song.findById(req.params.id)

      if (!song) {
        return res.status(404).json({ message: "Song not found" })
      }

      if (!req.file) {
        return res.status(400).json({ message: "Cover image is required" })
      }

      if (song.coverUrl) {
        const oldImagePath = path.join(__dirname, "..", song.coverUrl)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }

      song.coverUrl = `/uploads/images/${req.file.filename}`
      song.updatedAt = Date.now()

      await song.save()

      res.json({
        message: "Song cover updated successfully",
        song,
      })
    })
  } catch (err) {
    console.error("Error updating song cover:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/admin/songs/:id/audio
// @desc    Update a song's audio file
// @access  Admin only
router.put("/songs/:id/audio", adminAuth, async (req, res) => {
  try {
    const user = req.user

    uploadAudio.single("audio")(req, res, async (err) => {
      if (err) {
        console.error("Error uploading audio:", err)
        return res.status(500).json({ message: "Error uploading audio" })
      }

      const song = await Song.findById(req.params.id)

      if (!song) {
        return res.status(404).json({ message: "Song not found" })
      }

      if (!req.file) {
        return res.status(400).json({ message: "Audio file is required" })
      }

      if (song.audioUrl) {
        const oldAudioPath = path.join(__dirname, "..", song.audioUrl)
        if (fs.existsSync(oldAudioPath)) {
          fs.unlinkSync(oldAudioPath)
        }
      }

      song.audioUrl = `/uploads/audio/${req.file.filename}`
      song.updatedAt = Date.now()

      await song.save()

      res.json({
        message: "Song audio updated successfully",
        song,
      })
    })
  } catch (err) {
    console.error("Error updating song audio:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/admin/songs/:id
// @desc    Delete a song
// @access  Admin only
router.delete("/songs/:id", adminAuth, async (req, res) => {
  try {
    const user = req.user

    const song = await Song.findById(req.params.id)

    if (!song) {
      return res.status(404).json({ message: "Song not found" })
    }

    if (song.coverUrl) {
      const imagePath = path.join(__dirname, "..", song.coverUrl)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    if (song.audioUrl) {
      const audioPath = path.join(__dirname, "..", song.audioUrl)
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath)
      }
    }

    await Playlist.updateMany({ songs: song._id }, { $pull: { songs: song._id } })

    await song.deleteOne()

    res.json({ message: "Song deleted successfully" })
  } catch (err) {
    console.error("Error deleting song:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/admin/playlists
// @desc    Create a new playlist
// @access  Admin only
router.post("/playlists", adminAuth, uploadImage.single("cover"), async (req, res) => {
  try {
    const user = req.user

    const { name, description, songs, isPublic, isFeatured } = req.body

    if (!req.file) {
      return res.status(400).json({ message: "Cover image is required" })
    }

    const coverUrl = `/uploads/images/${req.file.filename}`

    const newPlaylist = new Playlist({
      name,
      description,
      coverUrl,
      songs: songs ? JSON.parse(songs) : [],
      createdBy: user.id,
      isPublic: isPublic === "true",
      isFeatured: isFeatured === "true", // Set featured flag for admin playlists
    })

    await newPlaylist.save()

    res.status(201).json({
      message: "Playlist created successfully",
      playlist: newPlaylist,
    })
  } catch (err) {
    console.error("Error creating playlist:", err.message)
    res.status(500).json({ message: "Server error: " + err.message })
  }
})

// @route   GET /api/admin/playlists
// @desc    Get all playlists
// @access  Admin only
router.get("/playlists", adminAuth, async (req, res) => {
  try {
    const user = req.user

    const playlists = await Playlist.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("songs", "title artist album coverUrl")

    res.json(playlists)
  } catch (err) {
    console.error("Error getting playlists:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/admin/playlists/:id
// @desc    Get a playlist by ID
// @access  Admin only
router.get("/playlists/:id", adminAuth, async (req, res) => {
  try {
    const user = req.user

    const playlist = await Playlist.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("songs", "title artist album coverUrl duration")

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" })
    }

    res.json(playlist)
  } catch (err) {
    console.error("Error getting playlist:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/admin/playlists/:id
// @desc    Update a playlist (including cover image)
// @access  Admin only
router.put(
  "/playlists/:id",
  adminAuth,
  uploadImage.single("cover"),
  async (req, res) => {
    try {
      const playlist = await Playlist.findById(req.params.id)
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" })
      }

      const { name, description, songs, isPublic, isFeatured } = req.body

      if (name) playlist.name = name
      if (description) playlist.description = description
      if (songs) playlist.songs = JSON.parse(songs)
      if (isPublic !== undefined) playlist.isPublic = isPublic === "true"
      if (isFeatured !== undefined) playlist.isFeatured = isFeatured === "true"

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

// @route   PUT /api/admin/playlists/:id/cover
// @desc    Update a playlist's cover image
// @access  Admin only
router.put("/playlists/:id/cover", adminAuth, async (req, res) => {
  try {
    const user = req.user

    uploadImage.single("cover")(req, res, async (err) => {
      if (err) {
        console.error("Error uploading image:", err)
        return res.status(500).json({ message: "Error uploading image" })
      }

      const playlist = await Playlist.findById(req.params.id)

      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" })
      }

      if (!req.file) {
        return res.status(400).json({ message: "Cover image is required" })
      }

      if (playlist.coverUrl) {
        const oldImagePath = path.join(__dirname, "..", playlist.coverUrl)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }

      playlist.coverUrl = `/uploads/images/${req.file.filename}`
      playlist.updatedAt = Date.now()

      await playlist.save()

      res.json({
        message: "Playlist cover updated successfully",
        playlist,
      })
    })
  } catch (err) {
    console.error("Error updating playlist cover:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/admin/playlists/:id
// @desc    Delete a playlist
// @access  Admin only
router.delete("/playlists/:id", adminAuth, async (req, res) => {
  try {
    const user = req.user

    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" })
    }

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

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin only
router.get("/users", adminAuth, async (req, res) => {
  try {
    const user = req.user

    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    console.error("Error getting users:", err.message)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/admin/users/:id/role
// @desc    Toggle admin role for a user
// @access  Admin only
router.put("/users/:id/role", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    if (user.isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true });

      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot remove admin role from the last admin user",
        });
      }
    }

  
    user.isAdmin = !user.isAdmin;
    user.updatedAt = Date.now();

    await user.save();

    res.json({
      message: `User is ${user.isAdmin ? "now an admin" : "no longer an admin"}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("Error updating user role:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin only
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deletion of the last admin
    if (userToDelete.isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: "Cannot delete the last admin user" 
        });
      }
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});
// GET only admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ isAdmin: true });
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router
