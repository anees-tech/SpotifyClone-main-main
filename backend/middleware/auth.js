const User = require("../models/User")

module.exports = async (req, res, next) => {
  try {
    // Get user ID from request body, query, or params
    const userId = req.body.userId || req.query.userId || req.params.userId
    console.log("User ID:", userId)

    // Check if no user ID
    if (!userId) {
      return res.status(401).json({ message: "No user ID, authorization denied" })
    }

    // Find user in database
    const user = await User.findById(userId)

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid user ID" })
    }

    // Set user in request
    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: "Authorization failed" })
  }
}
