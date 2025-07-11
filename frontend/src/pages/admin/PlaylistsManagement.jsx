"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import AdminHeader from "../../components/admin/AdminHeader"
import PlaylistForm from "../../components/admin/PlaylistForm"
import "../../styles/admin/PlaylistsManagement.css"

function PlaylistsManagement() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated) {
      navigate("/login")
    } else if (!user?.isAdmin) {
      navigate("/")
    } else {
      fetchPlaylists()
      fetchSongs()
    }
  }, [isAuthenticated, user, navigate])

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem("userId")
      const response = await axios.get(`http://localhost:5000/api/admin/playlists`, {
        params: { userId },
      })

      setPlaylists(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching playlists:", error)
      setLoading(false)
    }
  }

  const fetchSongs = async () => {
    try {
      const userId = localStorage.getItem("userId")
      const response = await axios.get(`http://localhost:5000/api/admin/songs`, {
        params: { userId },
      })

      setSongs(response.data)
    } catch (error) {
      console.error("Error fetching songs:", error)
    }
  }

  const handleAddPlaylist = () => {
    setEditingPlaylist(null)
    setShowForm(true)
  }

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist)
    setShowForm(true)
  }

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) {
      return
    }

    try {
      const userId = localStorage.getItem("userId")
      await axios.delete(`http://localhost:5000/api/admin/playlists/${playlistId}`, {
        params: { userId },
      })

      // Remove playlist from state
      setPlaylists(playlists.filter((playlist) => playlist._id !== playlistId))
      alert("Playlist deleted successfully")
    } catch (error) {
      console.error("Error deleting playlist:", error)
      alert("Error deleting playlist")
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true)
      const userId = localStorage.getItem("userId")

      if (editingPlaylist) {
        // Update existing playlist
        const playlistData = new FormData()

        // Add all text fields
        playlistData.append("name", formData.name)
        playlistData.append("description", formData.description)
        playlistData.append("isPublic", formData.isPublic)

        // Add songs as JSON string
        if (formData.songs) {
          playlistData.append("songs", JSON.stringify(formData.songs))
        }

        // Only append cover if it exists
        if (formData.cover) {
          playlistData.append("cover", formData.cover)
        }

        // Add userId to the query params, not the form data
        await axios.put(
          `http://localhost:5000/api/admin/playlists/${editingPlaylist._id}?userId=${userId}`,
          playlistData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
      } else {
        // Create new playlist
        const playlistData = new FormData()

        // Add all text fields
        playlistData.append("name", formData.name)
        playlistData.append("description", formData.description)
        playlistData.append("isPublic", formData.isPublic)

        // Add songs as JSON string
        if (formData.songs) {
          playlistData.append("songs", JSON.stringify(formData.songs))
        }

        // Add cover file
        if (formData.cover) {
          playlistData.append("cover", formData.cover)
        }

        // Add userId to the query params, not the form data
        await axios.post(`http://localhost:5000/api/admin/playlists?userId=${userId}`, playlistData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      }

      // Refresh playlists list
      fetchPlaylists()
      setShowForm(false)
      setEditingPlaylist(null)
      alert(editingPlaylist ? "Playlist updated successfully" : "Playlist added successfully")
    } catch (error) {
      console.error("Error saving playlist:", error)
      alert("Error saving playlist: " + (error.response?.data?.message || "Unknown error"))
      setLoading(false)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingPlaylist(null)
  }

  const filteredPlaylists = playlists.filter(
    (playlist) =>
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading && playlists.length === 0) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading playlists...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-main">
        <AdminHeader title="Playlists Management" />

        <div className="admin-content">
          {showForm ? (
            <PlaylistForm
              playlist={editingPlaylist}
              songs={songs}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          ) : (
            <>
              <div className="admin-actions">
                <button className="admin-button" onClick={handleAddPlaylist}>
                  <i className="fas fa-plus"></i> Add New Playlist
                </button>
                <div className="admin-search">
                  <input
                    type="text"
                    placeholder="Search playlists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fas fa-search"></i>
                </div>
              </div>

              {filteredPlaylists.length > 0 ? (
                <div className="playlists-grid">
                  {filteredPlaylists.map((playlist) => (
                    <div className="playlist-card" key={playlist._id}>
                      <div className="playlist-card-image">
                        <img
                          src={`http://localhost:5000${playlist.coverUrl}` || "/placeholder.svg"}
                          alt={playlist.name}
                        />
                      </div>
                      <div className="playlist-card-content">
                        <h3>{playlist.name}</h3>
                        <p className="playlist-description">{playlist.description}</p>
                        <p className="playlist-songs">{playlist.songs?.length || 0} songs</p>
                      </div>
                      <div className="playlist-card-actions">
                        <button className="edit-button" onClick={() => handleEditPlaylist(playlist)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="delete-button" onClick={() => handleDeletePlaylist(playlist._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>No playlists found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaylistsManagement
