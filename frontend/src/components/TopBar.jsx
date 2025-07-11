"use client"

import { useState } from "react"
import "../styles/TopBar.css"

function TopBar({ onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem("user")) || {}

  return (
    <div className="topbar">
      <div className="user-menu">
        <div className="user-profile" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
          <span className="user-name">{user.name || "User"}</span>
          <i className={`fas fa-chevron-${isDropdownOpen ? "up" : "down"}`}></i>
        </div>

        {isDropdownOpen && (
          <div className="dropdown-menu">
            <ul>
              <li>Favourite Songs</li>
              <li onClick={onLogout}>Logout</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopBar
