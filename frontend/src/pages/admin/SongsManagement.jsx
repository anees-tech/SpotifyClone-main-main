"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import AdminHeader from "../../components/admin/AdminHeader"
import SongForm from "../../components/admin/SongForm"
import "../../styles/admin/SongsManagement.css"
import { FaLongArrowAltUp, FaPlayCircle } from "react-icons/fa"
import { FaBacon } from "react-icons/fa6"

function SongsManagement() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSong, setEditingSong] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("title") // Default sorting by title

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated) {
      navigate("/login")
    } else if (!user?.isAdmin) {
      navigate("/")
    } else {
      fetchSongs()
    }
  }, [isAuthenticated, user, navigate])

  const fetchSongs = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem("userId")
      const response = await axios.get(`http://localhost:5000/api/admin/songs`, {
        params: { userId },
      })

      setSongs(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching songs:", error)
      setLoading(false)
    }
  }

  const handleAddSong = () => {
    setEditingSong(null)
    setShowForm(true)
  }

  const handleEditSong = (song) => {
    setEditingSong(song)
    setShowForm(true)
  }

  const handleDeleteSong = async (songId) => {
    if (!window.confirm("Are you sure you want to delete this song?")) {
      return
    }

    try {
      const userId = localStorage.getItem("userId")
      await axios.delete(`http://localhost:5000/api/admin/songs/${songId}`, {
        params: { userId },
      })

      // Remove song from state
      setSongs(songs.filter((song) => song._id !== songId))
      alert("Song deleted successfully")
    } catch (error) {
      console.error("Error deleting song:", error)
      alert("Error deleting song")
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true)
      const userId = localStorage.getItem("userId")
      const formPayload = new FormData()

      // Add new   fields here for song form
      const fields = ["title", "artist", "album","genre", "releaseYear"]
      fields.forEach((field) => {
        if (formData[field]) {
          formPayload.append(field, formData[field])
        }
      })

      if (formData.cover && typeof formData.cover === "object") {
        formPayload.append("cover", formData.cover)
      }
      if (formData.audio && typeof formData.audio === "object") {
        formPayload.append("audio", formData.audio)
      }

      if (editingSong) {
        await axios.put(
          `http://localhost:5000/api/admin/songs/${editingSong._id}?userId=${userId}`,
          formPayload,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
      } else {
        await axios.post(
          `http://localhost:5000/api/admin/songs?userId=${userId}`,
          formPayload,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
      }

      fetchSongs()
      setShowForm(false)
      setEditingSong(null)
      alert(editingSong ? "Song updated successfully" : "Song added successfully")
    } catch (error) {
      console.error("Error saving song:", error)
      alert("Error saving song: " + (error.response?.data?.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingSong(null)
  }

  const handleSortChange = (e) => {
    setSortOption(e.target.value)
  }

  const sortedSongs = [...songs].sort((a, b) => {
    if (sortOption === "title") {
      return a.title.localeCompare(b.title)
    } else if (sortOption === "releaseYear") {
      return new Date(b.releaseYear) - new Date(a.releaseYear)
    }
    return 0
  })

  const filteredSongs = sortedSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.album.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading && songs.length === 0) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading songs...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-main">
        <AdminHeader title="Songs Management" />

        <div className="admin-content">
          {showForm ? (
            <SongForm song={editingSong} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
          ) : (
            <>
              <div className="admin-actions">
                <button className="admin-button" onClick={handleAddSong}>
                  <i className="fas fa-plus"></i> Add New Song
                </button>
                <div className="admin-search">
                  <input
                    type="text"
                    placeholder="Search songs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fas fa-search"></i>
                </div>
               {/* <div className="admin-sort">
                  <label htmlFor="sort">Sort By:</label>
                  <select id="sort" value={sortOption} onChange={handleSortChange}>
                    <option value="title">Alphabetical (Title)</option>
                    <option value="releaseYear">Release Year</option>
  
                  </select>
                </div>  */}
              </div>

              {filteredSongs.length > 0 ? (
                <div className="songs-grid">
                  {filteredSongs.map((song) => (
                    <div className="song-card" key={song._id}>
                      <div className="song-card-image">
                        <img src={`http://localhost:5000${song.coverUrl}` || "/placeholder.svg"} alt={song.title} />
                      </div>
                      <div className="song-card-content">
                        <h3>{song.title}</h3>
                        <p className="song-artist">{song.artist}</p>
                        <p className="song-album">{song.album}</p>
                        <p className="song-genre">{song.genre}</p>
                        
                    
                       
                        <p className="song-release-year">Release Year: {song.releaseYear}</p>
                      </div>
                      <div className="song-card-actions">
                        <button className="edit-button" onClick={() => handleEditSong(song)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="deleted-button" onClick={() => handleDeleteSong(song._id)}>
                          <i className="fas fa-trash"></i>
                        </button>

                     
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>No songs found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SongsManagement
