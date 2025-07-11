"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "../../styles/admin/AdminSidebar.css"
import { FaAmilia } from "react-icons/fa6"
import { CgUserlane } from "react-icons/cg"
import { FiShield } from "react-icons/fi"
import { FaHackerNewsSquare, FaMap } from "react-icons/fa"

function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { handleLogout } = useAuth()

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogoutClick = () => {
    handleLogout()
    navigate("/loginas")
  }

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>Admin Panel</h2>
      </div>

      <nav className="admin-nav">
        <ul>
          <li className={isActive("/admin") ? "active" : ""}>
            <Link to="/admin">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={isActive("/admin/songs") ? "active" : ""}>
            <Link to="/admin/songs">
              <i className="fas fa-music"></i>
              <span>Songs</span>
            </Link>
          </li>
          {/* <li className={isActive("/admin/playlists") ? "active" : ""}>
            <Link to="/admin/playlists">
              <i className="fas fa-list"></i>
              <span>Playlists</span>
            </Link>
          </li> */}
          <li className={isActive("/admin/users") ? "active" : ""}>
            <Link to="/admin/users">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>

          {/* <li className={isActive("/admin/topsongs") ? "active" : ""}>
            <Link to="/admin/topsongs">
            < FaHackerNewsSquare className="top"/>
              <span>top songs</span>
            </Link>
          </li> */}
        
        <li>
 <Link to="/admin/admins">
    <i className="fas fa-user-shield"></i> Admins
  </Link>
 </li>


        
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        <Link to="/" className="view-site-link">
          <i className="fas fa-home"></i>
          <span>View Site</span>
        </Link>
        <button className="logout-button" onClick={handleLogoutClick}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar
// admins k lia admin dashboard pr link ka comment remove 
//or sidebar mai bhi 