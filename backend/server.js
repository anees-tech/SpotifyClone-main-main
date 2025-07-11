const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require("path")

dotenv.config()

const app = express()

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
}

app.use(express.json())
app.use(cors(corsOptions))

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

mongoose
  .connect("mongodb+srv://spotifyClone:1234@cluster0.ccbpy.mongodb.net/spotifyClone" )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err))

// Routes
app.use("/api/auth", require("./routes/userRoutes"))
app.use("/api/songs", require("./routes/songRoutes"))
app.use("/api/playlists", require("./routes/playlistRoutes"))
app.use("/api/admin", require("./routes/adminRoutes"))
app.use("/api/user", require("./routes/userRoutes")) // Add this line
app.use('/api/password-reset', require('./routes/passwordResetRoutes')); // Add this line

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"))
  })
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))



