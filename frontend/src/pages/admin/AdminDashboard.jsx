"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import "../../styles/admin/AdminDashboard.css";

function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    counts: {
      songs: 0,
      playlists: 0,
      users: 0,
      admins: 0,
    },
    recentSongs: [],
    recentPlaylists: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!user?.isAdmin) {
      navigate("/register");
    } else {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `http://localhost:5000/api/admin/dashboard`,
        {
          params: { userId },
        }
      );

      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-main">
        <AdminHeader title="Dashboard" />

        <div className="admin-content">
          <div className="stats-grid">
            <Link to={"/admin/songs"}>
              <div className="stat-card">
                <h3>Songs</h3>
                <p className="stat-number">{stats.counts.songs}</p>
                <i className="fas fa-music stat-icon"></i>
              </div>
            </Link>
            {/* <Link to={"/admin/playlists"}>
              <div className="stat-card">
                <h3>Playlists</h3>
                <p className="stat-number">{stats.counts.playlists}</p>
                <i className="fas fa-list stat-icon"></i>
              </div>
            </Link> */}
            <Link to={"/admin/users"}>
            <div className="stat-card">
              <h3>Users</h3>
              <p className="stat-number">{stats.counts.users}</p>
              <i className="fas fa-users stat-icon"></i>
            </div>
            </Link>
    
            {/* <Link to={"/admin/admins"}> */}
            <div className="stat-card">
              <h3>Admins</h3>
              <p className="stat-number">{stats.counts.admins}</p>
              <i className="fas fa-user-shield stat-icon"></i>
            </div>
            {/* </Link> */}
          </div>

          <div className="recent-grid">
            <div className="recent-section">
              <h3>Recent Songs</h3>
              <div className="recent-list">
                {stats.recentSongs.length > 0 ? (
                  <table border={1} className="admin-table">
                    <thead>
                      <tr className="table-header">
                        <th>Title</th>
                        <th>Artist</th>
                      {/* <th>Added By</th> */}
                    
                        <th>Album</th>
                        <th>Genre</th>
                        <th>Created By</th>
                     
                        {/* <th>Date</th>  */}
                        
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentSongs.map((song) => (
                        <tr key={song._id}>
                          <td>{song.title}</td>
                          <td>{song.artist}</td>
                          {/* <td>{song.addedBy?.name || "Unknown"}</td> */}
                         
                          <td>{song.album}</td>
                          <td>{song.genre}</td>
                          <td>{song.createdBy?.name || "Unknown"}</td>
                        
                          {/* <td>
                            {new Date(song.createdAt).toLocaleDateString()}
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No songs added yet</p>
                )}
              </div>
            </div>
{/* 
            <div className="recent-section">
              <h3>Recent Playlists</h3>
              <div className="recent-list">
                {stats.recentPlaylists.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Songs</th>
                        <th>Created By</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentPlaylists.map((playlist) => (
                        <tr key={playlist._id}>
                          <td>{playlist.name}</td>
                          <td>{playlist.songs?.length || 0}</td>
                          <td>{playlist.createdBy?.name || "Unknown"}</td>
                          <td>
                            {new Date(playlist.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No playlists created yet</p>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
