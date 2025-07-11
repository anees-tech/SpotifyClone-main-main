const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, required: true },
 
  date: { type: String},
  genre: { type: String, required: true },
  releaseYear: { type: Number },
  
  coverUrl: { type: String, required: true },
  audioUrl: { type: String, required: true },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Song", SongSchema);
