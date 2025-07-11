"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import AdminHeader from "../../components/admin/AdminHeader"
import "../../styles/admin/UsersManagement.css"

function UsersManagement() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated) {
      navigate("/login")
    } else if (!user?.isAdmin) {
      navigate("/")
    } else {
      fetchUsers()
    }
  }, [isAuthenticated, user, navigate])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem("userId")
      const response = await axios.get(`http://localhost:5000/api/admin/users`, {
        params: { userId },
      })

      setUsers(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching users:", error)
      setLoading(false)
    }
  }

  const handleToggleAdminRole = async (userId) => {
  try {
    const adminId = localStorage.getItem("userId");

    const response = await axios.put(
      `http://localhost:5000/api/admin/users/${userId}/role`,
      {},
      {
        params: { userId: adminId },
      }
    );
    alert(response.data.message);
    setUsers(users.map((u) =>
      u._id === userId ? { ...u, isAdmin: !u.isAdmin } : u
    ));
  } catch (error) {
    console.error("Error updating user role:", error);
    if (error.response && error.response.data && error.response.data.message) {
      alert(error.response.data.message);
    } else {
      alert("Error updating user role");
    }
  }
};


  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const adminId = localStorage.getItem("userId")
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        params: { userId: adminId },
      })

      // Remove user from state
      setUsers(users.filter((user) => user._id !== userId))
      alert("User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      alert(error.response?.data?.message || "Error deleting user")
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading && users.length === 0) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-main">
        <AdminHeader title="Users Management" />

        <div className="admin-content">
          <div className="admin-actions">
            <div className="admin-search">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    {/* <th>Gender</th> */}
                    <th>Joined Date</th>
                    <th className="actions">Actions</th>
                    {/* <th>Music taste</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.isAdmin ? "admin" : "user"}`}>
                          {user.isAdmin ? "Admin" : "User"}
                        </span>
                      </td>
                      {/* <td>{user.gender}</td> */}
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="btn-td">
                        <button className="role-toggle-button" 
                        onClick={() => handleToggleAdminRole(user._id)} >
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                           <button
                            className="delete-button"
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={user._id === localStorage.getItem("userId")} 
                          >
                            Delete User
                          </button> 
                      </td>
                      {/* <td>{user.musictaste}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UsersManagement



//user manegment 
//user.js
//signup.jsx
//userroutes.js