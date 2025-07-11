const User = require("../models/User")

const adminAuth = async (req, res, next) => {
  try {
    // Get user ID from request body, query, or params
    const userId = req.body.userId || req.query.userId || req.params.userId
    console.log("User ID:", userId)
    // Check if no user ID
    if (!userId) {
      return res.status(401).json({ message: "No user ID, authorization denied" })
    }

    // Get user from database
    const user = await User.findById(userId)

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required" })
    }

    // Set user in request
    req.user = user
    next()
  } catch (err) {
    console.error("Error in admin authentication:", err.message)
    res.status(401).json({ message: "Authentication failed" })
  }
}

module.exports = adminAuth