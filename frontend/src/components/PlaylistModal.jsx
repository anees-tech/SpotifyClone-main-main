"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useSearch } from "../context/SearchContext"
import "../styles/PlaylistModal.css"

function PlaylistModal({ isOpen, onClose, onSubmit, editPlaylist = null }) {
  const { user } = useAuth()
  const { allSongs } = useSearch()
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    songs: [],
    cover: null
  })
  const [coverPreview, setCoverPreview] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when editing
  useEffect(() => {
    if (editPlaylist) {
      setFormData({
        name: editPlaylist.name || "",
        description: editPlaylist.description || "",
        isPublic: editPlaylist.isPublic !== undefined ? editPlaylist.isPublic : true,
        songs: editPlaylist.songs?.map(song => song._id || song) || [],
        cover: null
      })
      setCoverPreview(editPlaylist.coverUrl ? `http://localhost:5000${editPlaylist.coverUrl}` : "")
    } else {
      setFormData({
        name: "",
        description: "",
        isPublic: true,
        songs: [],
        cover: null
      })
      setCoverPreview("")
    }
    setErrors({})
    setSearchTerm("")
  }, [editPlaylist, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, cover: "Please select a valid image file" }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, cover: "Image size must be less than 5MB" }))
      return
    }

    setFormData(prev => ({ ...prev, cover: file }))
    setErrors(prev => ({ ...prev, cover: "" }))

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => setCoverPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleSongToggle = (songId) => {
    setFormData(prev => {
      const updatedSongs = [...prev.songs]
      const index = updatedSongs.indexOf(songId)
      
      if (index > -1) {
        updatedSongs.splice(index, 1)
      } else {
        updatedSongs.push(songId)
      }
      
      return { ...prev, songs: updatedSongs }
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Playlist name is required"
    } else if (formData.name.length > 100) {
      newErrors.name = "Playlist name must be less than 100 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    // Only require cover for new playlists
    if (!editPlaylist && !formData.cover) {
      newErrors.cover = "Cover image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error("Error saving playlist:", error)
      setErrors({ submit: "Failed to save playlist. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const filteredSongs = allSongs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.album.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="playlist-modal-overlay" onClick={onClose}>
      <div className="playlist-modal" onClick={e => e.stopPropagation()}>
        <div className="playlist-modal-header">
          <h2>{editPlaylist ? "Edit Playlist" : "Create New Playlist"}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="playlist-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Playlist Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="My Awesome Playlist"
                className={errors.name ? "error" : ""}
                maxLength={100}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your playlist..."
                className={errors.description ? "error" : ""}
                maxLength={500}
                rows={3}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cover">Cover Image {!editPlaylist && "*"}</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="cover"
                  name="cover"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={errors.cover ? "error" : ""}
                />
                <label htmlFor="cover" className="file-input-label">
                  <i className="fas fa-upload"></i>
                  {coverPreview ? "Change Image" : "Choose Image"}
                </label>
              </div>
              {errors.cover && <span className="error-text">{errors.cover}</span>}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                />
                <span className="checkbox-custom"></span>
                Make this playlist public
                <small>Public playlists can be discovered by other users</small>
              </label>
            </div>
          </div>

          {coverPreview && (
            <div className="cover-preview">
              <img src={coverPreview} alt="Cover Preview" />
            </div>
          )}

          <div className="songs-section">
            <label>Add Songs</label>
            <div className="songs-search">
              <input
                type="text"
                placeholder="Search songs to add..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>

            <div className="songs-selection">
              <p className="songs-count">{formData.songs.length} songs selected</p>
              
              <div className="songs-list">
                {filteredSongs.length > 0 ? (
                  filteredSongs.map(song => (
                    <div
                      key={song._id}
                      className={`song-item ${formData.songs.includes(song._id) ? "selected" : ""}`}
                      onClick={() => handleSongToggle(song._id)}
                    >
                      <div className="song-cover">
                        <img
                          src={song.coverUrl ? `http://localhost:5000${song.coverUrl}` : "/placeholder.svg"}
                          alt={song.title}
                        />
                      </div>
                      <div className="song-details">
                        <h4>{song.title}</h4>
                        <p>{song.artist} • {song.album}</p>
                      </div>
                      <div className="song-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.songs.includes(song._id)}
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-songs">No songs found</p>
                )}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {editPlaylist ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <i className={`fas fa-${editPlaylist ? "save" : "plus"}`}></i>
                  {editPlaylist ? "Update Playlist" : "Create Playlist"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlaylistModal