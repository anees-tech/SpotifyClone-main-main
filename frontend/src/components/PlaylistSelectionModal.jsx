"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { usePlaylist } from "../context/PlaylistContext"
import { addSongToPlaylist, createUserPlaylist } from "../services/api"
import "../styles/PlaylistSelectionModal.css"

function PlaylistSelectionModal({ song, onClose }) {
  const { isAuthenticated } = useAuth()
  const { userPlaylists, addUserPlaylist, fetchPlaylists } = usePlaylist()
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists()
    }
  }, [isAuthenticated, fetchPlaylists])

  const handleAddToPlaylist = async (playlistId) => {
    if (!isAuthenticated || !song) return

    try {
      setLoading(true)
      await addSongToPlaylist(playlistId, song._id)

      // Show success message (you could add a toast notification here)
      console.log(`Added "${song.title}" to playlist`)

      onClose()
    } catch (error) {
      console.error("Error adding song to playlist:", error)
      // Show error message (you could add a toast notification here)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated || !newPlaylistName.trim()) return

    try {
      setLoading(true)

      // Create FormData for multipart/form-data request (same as PlaylistModal.jsx)
      const formData = new FormData()
      formData.append('name', newPlaylistName.trim())
      formData.append('description', newPlaylistDescription.trim() || `Created for ${song.title}`)
      formData.append('isPublic', isPublic)

      // Add the current song to the new playlist
      formData.append('songs', JSON.stringify([song._id]))

      // Create a default cover image or use a placeholder
      // Since cover is required by backend, we'll create a small placeholder image
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 300
      const ctx = canvas.getContext('2d')

      // Create a simple gradient background
      const gradient = ctx.createLinearGradient(0, 0, 300, 300)
      gradient.addColorStop(0, '#FF6B6B')
      gradient.addColorStop(1, '#4ECDC4')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 300, 300)

      // Add playlist name text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(newPlaylistName.substring(0, 20), 150, 150)

      // Convert canvas to blob and append to formData
      canvas.toBlob((blob) => {
        formData.append('cover', blob, 'playlist-cover.png')

        // Send the request
        createUserPlaylist(formData)
          .then((newPlaylist) => {
            addUserPlaylist(newPlaylist.playlist)
            console.log(`Created playlist "${newPlaylistName}" with "${song.title}"`)
            onClose()
          })
          .catch((error) => {
            console.error("Error creating playlist:", error)
          })
          .finally(() => {
            setLoading(false)
          })
      }, 'image/png')

    } catch (error) {
      console.error("Error creating playlist:", error)
      setLoading(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="playlist-modal-backdrop" onClick={handleBackdropClick}>
      <div className="playlist-modal">
        <div className="playlist-modal-header">
          <h2>Add to playlist</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="playlist-modal-content">
          {!showCreateForm ? (
            <>
              <p className="create-playlist-btn">
                You can Add to an existing playlist
              </p>

              <div className="playlists-list">
                {userPlaylists.length > 0 ? (
                  userPlaylists.map((playlist) => (
                    <div key={playlist._id} className="playlist-item" onClick={() => handleAddToPlaylist(playlist._id)}>
                      <div className="playlist-cover">
                        <img
                          src={
                            playlist.coverUrl
                              ? `http://localhost:5000${playlist.coverUrl}`
                              : "/placeholder.svg?height=50&width=50"
                          }
                          alt={playlist.name}
                        />
                      </div>
                      <div className="playlist-info">
                        <h3>{playlist.name}</h3>
                        <p>{playlist.songs?.length || 0} songs</p>
                      </div>
                      <button className="add-btn" disabled={loading}>
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-playlists">
                    <i className="fas fa-music"></i>
                    <p>You don't have any playlists yet.</p>
                    <p>Create your first playlist to get started!</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreatePlaylist} className="create-playlist-form">
              <button type="button" className="back-btn" onClick={() => setShowCreateForm(false)}>
                <i className="fas fa-arrow-left"></i>
                Back
              </button>

              <div className="form-group">
                <label htmlFor="playlistName">Playlist name *</label>
                <input
                  type="text"
                  id="playlistName"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Playlist #1"
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="playlistDescription">Description</label>
                <textarea
                  id="playlistDescription"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder={`Add an optional description (default: "Created for ${song.title}")`}
                  maxLength={300}
                  rows={3}
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                  <span className="checkmark"></span>
                  Make playlist public
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="create-btn" disabled={loading || !newPlaylistName.trim()}>
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaylistSelectionModal
