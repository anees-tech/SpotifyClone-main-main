"use client"

import { useState, useEffect } from "react"
import "../../styles/admin/PlaylistForm.css"

function PlaylistForm({ playlist, songs, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    isFeatured: false, // Added featured flag
    songs: [],
    cover: null,
  })
  const [coverPreview, setCoverPreview] = useState("")
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (playlist) {
      setFormData({
        name: playlist.name || "",
        description: playlist.description || "",
        isPublic: playlist.isPublic !== undefined ? playlist.isPublic : true,
        isFeatured: playlist.isFeatured !== undefined ? playlist.isFeatured : false,
        songs: playlist.songs?.map((song) => (typeof song === "object" ? song._id : song)) || [],
        cover: null, // We don't set the actual file here, just show the preview
      })
      setCoverPreview(playlist.coverUrl ? `http://localhost:5000${playlist.coverUrl}` : "")
    }
  }, [playlist])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target

    if (files.length === 0) return

    const file = files[0]

    setFormData({
      ...formData,
      [name]: file,
    })

    if (name === "cover") {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSongToggle = (songId) => {
    const updatedSongs = [...formData.songs]

    if (updatedSongs.includes(songId)) {
      // Remove song
      const index = updatedSongs.indexOf(songId)
      updatedSongs.splice(index, 1)
    } else {
      // Add song
      updatedSongs.push(songId)
    }

    setFormData({
      ...formData,
      songs: updatedSongs,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"

    // Only require cover for new playlists, not when editing
    if (!playlist && !formData.cover) {
      newErrors.cover = "Cover image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.album.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="playlist-form-container">
      <h2>{playlist ? "Edit Playlist" : "Add New Playlist"}</h2>

      <form className="playlist-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "error" : ""}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? "error" : ""}
          ></textarea>
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} />
            Make this playlist public
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
            Mark as featured playlist
            <small>Featured playlists appear in the "Featured Playlists" section for all users</small>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="cover">Cover Image</label>
          <div className="file-input-container">
            <input
              type="file"
              id="cover"
              name="cover"
              accept="image/*"
              onChange={handleFileChange}
              className={errors.cover ? "error" : ""}
            />
            <label htmlFor="cover" className="file-input-label">
              {coverPreview ? "Change Image" : "Choose Image"}
            </label>
          </div>
          {errors.cover && <span className="error-message">{errors.cover}</span>}

          {coverPreview && (
            <div className="image-preview">
              <img src={coverPreview || "/placeholder.svg"} alt="Cover Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Songs</label>
          <div className="songs-search">
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>

          <div className="songs-selection">
            <div className="songs-count">{formData.songs.length} songs selected</div>

            <div className="songs-list">
              {filteredSongs.length > 0 ? (
                filteredSongs.map((song) => (
                  <div
                    key={song._id}
                    className={`song-item ${formData.songs.includes(song._id) ? "selected" : ""}`}
                    onClick={() => handleSongToggle(song._id)}
                  >
                    <div className="song-item-image">
                      <img src={song.coverUrl || "/placeholder.svg"} alt={song.title} />
                    </div>
                    <div className="song-item-details">
                      <h4>{song.title}</h4>
                      <p>{song.artist}</p>
                    </div>
                    <div className="song-item-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.songs.includes(song._id)}
                        onChange={() => {}} // Handled by the onClick of the parent div
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

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button">
            {playlist ? "Update Playlist" : "Add Playlist"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PlaylistForm
