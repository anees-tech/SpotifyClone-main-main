const mongoose = require("mongoose")

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  coverUrl: { type: String, required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Playlist", PlaylistSchema)
