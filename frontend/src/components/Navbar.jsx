"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSearch } from "../context/SearchContext"
import "../styles/Navbar.css"

function Navbar() {
  const { isAuthenticated, user, handleLogout } = useAuth() // Fixed: use handleLogout instead of logout
  const { searchQuery, setSearchQuery } = useSearch()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const handleLogoutClick = () => {
    handleLogout() // Fixed: use handleLogout
    setShowUserMenu(false)
    navigate("/login")
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate("/search")
    }
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showUserMenu])

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <i className="fab fa-spotify"></i>
          <span>Spotify Clone</span>
        </Link>

        <div className="navbar-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive("/") ? "active" : ""}`}
          >
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link 
            to="/browse-songs" 
            className={`nav-link ${isActive("/browse-songs") ? "active" : ""}`}
          >
            {/* <i className="fas fa-search"></i> */}
            <span>Browse Song</span>
          </Link>
          <Link 
            to="/library" 
            className={`nav-link ${isActive("/library") ? "active" : ""}`}
          >
            <i className="fas fa-book"></i>
            <span>Your Library</span>
          </Link>
        </div>
      </div>

      <div className="navbar-center">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="clear-search"
                onClick={() => setSearchQuery("")}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="user-menu-container">
            <button 
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <span className="user-name">{user?.name || "User"}</span>
              <i className={`fas fa-chevron-down menu-arrow ${showUserMenu ? "open" : ""}`}></i>
            </button>

            {showUserMenu && (
              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar-large">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="user-details">
                    <h4>{user?.name}</h4>
                    <p>{user?.email}</p>
                  </div>
                </div>
                
                <div className="menu-divider"></div>
                
                <Link to="/library" className="menu-item" onClick={() => setShowUserMenu(false)}>
                  <i className="fas fa-book"></i>
                  <span>Your Library</span>
                </Link>
                
                {user?.isAdmin && (
                  <>
                    <div className="menu-divider"></div>
                    <Link to="/admin" className="menu-item admin-link" onClick={() => setShowUserMenu(false)}>
                      <i className="fas fa-shield-alt"></i>
                      <span>Admin Dashboard</span>
                    </Link>
                  </>
                )}
                
                <div className="menu-divider"></div>
                
                <button className="menu-item logout-btn" onClick={handleLogoutClick}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/signup" className="signup-btn">
              Sign up
            </Link>
            <Link to="/login" className="login-btn">
              Log in
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
