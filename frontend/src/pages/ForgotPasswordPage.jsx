"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/Auth.css"
import spotifyLogo from "../assets/spotify-logo.png"

function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("") // Clear error when user types
  }

  const requestOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.email) {
      setError("Please enter your email address")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/password-reset/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("OTP sent to your email address")
        setStep(2)
      } else {
        setError(data.message || "Failed to send OTP")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.otp) {
      setError("Please enter the OTP")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/password-reset/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("OTP verified successfully")
        setStep(3)
      } else {
        setError(data.message || "Invalid OTP")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/password-reset/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password reset successfully!")
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } else {
        setError(data.message || "Failed to reset password")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={requestOTP} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "SENDING OTP..." : "SEND OTP"}
            </button>
          </form>
        )

      case 2:
        return (
          <form onSubmit={verifyOTP} className="auth-form">
            <div className="step-info">
              <p>We've sent a 6-digit OTP to <strong>{formData.email}</strong></p>
            </div>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "VERIFYING..." : "VERIFY OTP"}
            </button>
            <button 
              type="button" 
              className="auth-link-button"
              onClick={() => setStep(1)}
            >
              Change email address
            </button>
          </form>
        )

      case 3:
        return (
          <form onSubmit={resetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                minLength="6"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                minLength="6"
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "RESETTING..." : "RESET PASSWORD"}
            </button>
          </form>
        )

      default:
        return null
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <div className="auth-logo-container">
          <img src={spotifyLogo || "/placeholder.svg"} alt="Spotify Logo" className="auth-logo" />
        </div>
        
        <h1>Reset your password</h1>
        
        {/* Progress indicator */}
        <div className="progress-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {renderStep()}

        <div className="auth-divider">
          <span>Remember your password?</span>
        </div>
        
        <Link to="/login" className="auth-switch-button">
          BACK TO LOGIN
        </Link>
      </div>
    </div>
  )
}

export default ForgotPasswordPage