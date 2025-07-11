"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/Auth.css"
import spotifyLogo from "../assets/spotify-logo.png"

function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { handleLogin } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("") // Clear previous errors
    setLoading(true)

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    try {
      const result = await handleLogin(formData.email, formData.password)

      if (result.success) {
        // Redirect based on user role
        if (result.isAdmin) {
          navigate("/admin")
        } else {
          navigate("/")
        }
      } else {
        setError(result.message || "Login failed")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <div className="auth-logo-container">
          <img src={spotifyLogo || "/placeholder.svg"} alt="Spotify Logo" className="auth-logo" />
        </div>
        <h1>Log as Admin in to Spotify</h1>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOG IN"}
          </button>
        </form>
        <div className="auth-divider">
          <span>Don't have an account?</span>
        </div>
        <Link to="/signup" className="auth-switch-button">
          SIGN UP FOR SPOTIFY
        </Link>
      </div>
    </div>
  )
}

export default AdminLogin
