"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "../../styles/admin/AdminHeader.css"

function AdminHeader({ title }) {
  const { user } = useAuth()

  return (
    <div className="admin-header">
      <h1>{title}</h1>
    
      <div className="admin-user-info">
         
        <div className="admin-avatar">{user?.name?.charAt(0).toUpperCase() || "A"}</div>
           <div className="admin-user-details">
          <p className="admin-user-name">{user?.name || "Admin"}</p>
           <p className="admin-user-role">Administrator</p>
          
        </div>
      
      </div>
     
    </div>
  )
}

export default AdminHeader
