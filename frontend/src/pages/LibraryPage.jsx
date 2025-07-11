"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSearch } from "../context/SearchContext"
import { usePlayer } from "../context/PlayerContext"
import { usePlaylist } from "../context/PlaylistContext"
import { getUserPlaylists, deleteUserPlaylist, createUserPlaylist, updateUserPlaylist } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import PlaylistModal from "../components/PlaylistModal"
import "../styles/LibraryPage.css"

function LibraryPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { savedSongs = [], allSongs = [] } = useSearch()
  const { playFromPlaylist, playSong, currentSong } = usePlayer()
  const { 
    userPlaylists = [], 
    featuredPlaylists = [], 
    loading, 
    addUserPlaylist, 
    updateUserPlaylist: updatePlaylistInContext, 
    removeUserPlaylist 
  } = usePlaylist()
  
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState(null)
  const [activeTab, setActiveTab] = useState("playlists")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

  // Filter saved songs with proper error handling
  const savedSongsList = allSongs.filter((song) => {
    if (!savedSongs || !Array.isArray(savedSongs)) return false
    return savedSongs.includes(song._id)
  })

  // Filter and sort playlists with proper error handling
  const filteredPlaylists = userPlaylists.filter(playlist => {
    if (!playlist || !playlist.name || !playlist.description) return false
    const query = searchTerm.toLowerCase()
    return playlist.name.toLowerCase().includes(query) ||
           playlist.description.toLowerCase().includes(query)
  })

  const sortedPlaylists = [...filteredPlaylists].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      case "oldest":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case "name":
        return (a.name || "").localeCompare(b.name || "")
      case "songs":
        return (b.songs?.length || 0) - (a.songs?.length || 0)
      default:
        return 0
    }
  })

  const handleCreatePlaylist = () => {
    setEditingPlaylist(null)
    setShowPlaylistModal(true)
  }

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist)
    setShowPlaylistModal(true)
  }

  const handlePlaylistSubmit = async (playlistData) => {
    try {
      if (editingPlaylist) {
        // Update existing playlist
        const updatedPlaylist = await updateUserPlaylist(editingPlaylist._id, playlistData)
        updatePlaylistInContext(editingPlaylist._id, updatedPlaylist.playlist)
      } else {
        // Create new playlist
        const newPlaylist = await createUserPlaylist(playlistData)
        addUserPlaylist(newPlaylist.playlist)
      }
      setShowPlaylistModal(false)
      setEditingPlaylist(null)
    } catch (error) {
      console.error("Error saving playlist:", error)
      throw error
    }
  }

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist? This action cannot be undone.")) {
      return
    }

    try {
      await deleteUserPlaylist(playlistId)
      removeUserPlaylist(playlistId)
    } catch (error) {
      console.error("Error deleting playlist:", error)
      alert("Failed to delete playlist. Please try again.")
    }
  }

  const handlePlayPlaylist = (playlist) => {
    if (playlist.songs && Array.isArray(playlist.songs) && playlist.songs.length > 0) {
      playFromPlaylist(playlist.songs, 0)
    }
  }

  const handlePlaySong = (song) => {
    playSong(song)
    navigate(`/play/${song._id}`)
  }

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist._id}`)
  }

  const formatDuration = (duration) => {
    if (!duration || isNaN(duration)) return "0:00"
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Unknown"
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="library-page">
      <Navbar />
      
      <div className="library-content">
        <div className="library-header">
          <h1>Your Library</h1>
          <button className="create-playlist-btn" onClick={handleCreatePlaylist}>
            <i className="fas fa-plus"></i>
            Create Playlist
          </button>
        </div>

        <div className="library-tabs">
          <button 
            className={`tab-btn ${activeTab === "playlists" ? "active" : ""}`}
            onClick={() => setActiveTab("playlists")}
          >
            <i className="fas fa-list"></i>
            Your Playlists ({userPlaylists.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "liked" ? "active" : ""}`}
            onClick={() => setActiveTab("liked")}
          >
            <i className="fas fa-heart"></i>
            Liked Songs ({savedSongsList.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "featured" ? "active" : ""}`}
            onClick={() => setActiveTab("featured")}
          >
            <i className="fas fa-star"></i>
            Featured Playlists
          </button>
        </div>

        {activeTab === "playlists" && (
          <div className="playlists-section">
            <div className="section-controls">
              <div className="search-filter">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search your playlists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm("")}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                <select 
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Recently Created</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Alphabetical</option>
                  <option value="songs">Most Songs</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-section">
                <div className="loading-spinner"></div>
                <p>Loading your playlists...</p>
              </div>
            ) : sortedPlaylists.length > 0 ? (
              <div className="playlists-grid">
                {sortedPlaylists.map((playlist) => (
                  <div key={playlist._id} className="playlist-card">
                    <div className="playlist-image" onClick={() => handlePlaylistClick(playlist)}>
                      <img
                        src={playlist.coverUrl ? `http://localhost:5000${playlist.coverUrl}` : "/placeholder.svg"}
                        alt={playlist.name || "Playlist"}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg"
                        }}
                      />
                      <button 
                        className="play-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayPlaylist(playlist)
                        }}
                      >
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                    <div className="playlist-info">
                      <h3 onClick={() => handlePlaylistClick(playlist)}>
                        {playlist.name || "Untitled Playlist"}
                      </h3>
                      <p className="playlist-description">
                        {playlist.description || "No description"}
                      </p>
                      <div className="playlist-meta">
                        <span>{playlist.songs?.length || 0} songs</span>
                        <span>•</span>
                        <span>{playlist.isPublic ? "Public" : "Private"}</span>
                        <span>•</span>
                        <span>{formatDate(playlist.createdAt)}</span>
                      </div>
                    </div>
                    <div className="playlist-actions">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditPlaylist(playlist)}
                        title="Edit Playlist"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeletePlaylist(playlist._id)}
                        title="Delete Playlist"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-list empty-icon"></i>
                <h3>No playlists found</h3>
                <p>
                  {searchTerm 
                    ? "Try adjusting your search or create a new playlist"
                    : "Create your first playlist to get started"
                  }
                </p>
                <button className="create-playlist-button" onClick={handleCreatePlaylist}>
                  <i className="fas fa-plus"></i>
                  Create Playlist
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="liked-songs-section">
            {savedSongsList.length > 0 ? (
              <div className="songs-list">
                {savedSongsList.map((song, index) => (
                  <div 
                    key={song._id} 
                    className={`song-item ${currentSong && currentSong._id === song._id ? "active" : ""}`}
                  >
                    <div className="song-number">
                      {index + 1}
                    </div>
                    <div className="song-image" onClick={() => handlePlaySong(song)}>
                      <img
                        src={song.coverUrl ? `http://localhost:5000${song.coverUrl}` : "/placeholder.svg"}
                        alt={song.title || "Song"}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg"
                        }}
                      />
                      <button className="play-button">
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                    <div className="song-details">
                      <h4 onClick={() => handlePlaySong(song)}>
                        {song.title || "Unknown Title"}
                      </h4>
                      <p>{song.artist || "Unknown Artist"}</p>
                    </div>
                    <div className="song-album">
                      {song.album || "Unknown Album"}
                    </div>
                    <div className="song-duration">
                      {formatDuration(song.duration)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-heart empty-icon"></i>
                <h3>No liked songs yet</h3>
                <p>Songs you like will appear here. Start exploring music!</p>
                <button className="browse-button" onClick={() => navigate("/browse")}>
                  <i className="fas fa-compass"></i>
                  Browse Music
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "featured" && (
          <div className="featured-section">
            {featuredPlaylists.length > 0 ? (
              <div className="playlists-grid">
                {featuredPlaylists.map((playlist) => (
                  <div key={playlist._id} className="playlist-card featured">
                    <div className="playlist-image" onClick={() => handlePlaylistClick(playlist)}>
                      <img
                        src={playlist.coverUrl ? `http://localhost:5000${playlist.coverUrl}` : "/placeholder.svg"}
                        alt={playlist.name || "Playlist"}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg"
                        }}
                      />
                      <button 
                        className="play-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayPlaylist(playlist)
                        }}
                      >
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                    <div className="playlist-info">
                      <h3 onClick={() => handlePlaylistClick(playlist)}>
                        {playlist.name || "Untitled Playlist"}
                      </h3>
                      <p className="playlist-description">
                        {playlist.description || "No description"}
                      </p>
                      <div className="playlist-meta">
                        <span>{playlist.songs?.length || 0} songs</span>
                        <span>•</span>
                        <span>Featured</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-star empty-icon"></i>
                <h3>No featured playlists available</h3>
                <p>Check back later for curated playlists!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

      <PlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        onSubmit={handlePlaylistSubmit}
        editPlaylist={editingPlaylist}
      />
    </div>
  )
}

export default LibraryPage