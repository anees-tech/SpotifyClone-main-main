"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/Auth.css"
import spotifyLogo from "../assets/spotify-logo.png"

function Signup() {
  const [formData, setFormData] = useState({
    email: "",
   // musictaste: "",
    password: "",
    confirmPassword: "",
    name: "",
   // gender: "", // Added gender field
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name ) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      if (response.data.user) {
        localStorage.setItem("userId", response.data.user.id)
        localStorage.setItem("userData", JSON.stringify(response.data.user))
        navigate("/")
      } else {
        setError(response.data.message || "An error occurred")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error")
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
        <h1>Sign up for free to start listening</h1>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">What's your email?</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">What should we call you?</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter a profile name"
              required
            />
          </div>
          {/* <div className="form-group">
            <label htmlFor="gender">Select your gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">-- Select --</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div> */}


{/* <div className="form-group">
            <label htmlFor="musictaste">Create a music taste</label>
            <input
              type="text"
              id="musictaste"
              name="musictaste"
              value={formData.musictaste}
              onChange={handleChange}
              placeholder="Create a musictaste"
              required
            />
          </div> */}



          <div className="form-group">
            <label htmlFor="password">Create a password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm your password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "SIGNING UP..." : "SIGN UP"}
          </button>
        </form>
        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>
        <Link to="/login" className="auth-switch-button">
          LOG IN INSTEAD
        </Link>
      </div>
    </div>
  )
}

export default Signup
