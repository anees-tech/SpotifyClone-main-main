"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import AdminHeader from "../../components/admin/AdminHeader"
import "../../styles/admin/UsersManagement.css"

function AdminManagement() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
    } else if (!user?.isAdmin) {
      navigate("/")
    } else {
      fetchAdmins()
    }
  }, [isAuthenticated, user, navigate])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem("userId")
      const response = await axios.get(`http://localhost:5000/api/admin/admins`, {
        params: { userId },
      })
      setAdmins(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching admins:", error)
      setLoading(false)
    }
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader title="Admin Management" />
        <div className="admin-content">
          {loading ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p>Loading admins...</p>
            </div>
          ) : admins.length > 0 ? (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id}>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No admins found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminManagement
