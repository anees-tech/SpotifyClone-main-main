"use client"

import { useState, useEffect } from "react"
import { useSearch } from "../context/SearchContext"
import { usePlayer } from "../context/PlayerContext"
import { getPlaylists, getUserPlaylists, deleteUserPlaylist, createUserPlaylist, updateUserPlaylist } from "../services/api"
import { useAuth } from "../context/AuthContext"
import PlaylistModal from "./PlaylistModal"
import "../styles/Library.css"

function Library({ onPlaySong, removeFromLibrary }) {
  const { isAuthenticated } = useAuth()
  const { savedSongs, allSongs } = useSearch()
  const { playFromPlaylist } = usePlayer()
  const [playlists, setPlaylists] = useState([])
  const [userPlaylists, setUserPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedPlaylists, fetchedUserPlaylists] = await Promise.all([
          getPlaylists(),
          isAuthenticated ? getUserPlaylists() : Promise.resolve([])
        ])
        setPlaylists(fetchedPlaylists)
        setUserPlaylists(fetchedUserPlaylists)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching playlists:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated])

  // Filter saved songs
  const savedSongsList = allSongs.filter((song) => savedSongs.includes(song._id))

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
        setUserPlaylists(prev => 
          prev.map(p => p._id === editingPlaylist._id ? updatedPlaylist.playlist : p)
        )
      } else {
        // Create new playlist
        const newPlaylist = await createUserPlaylist(playlistData)
        setUserPlaylists(prev => [newPlaylist.playlist, ...prev])
      }
      setShowPlaylistModal(false)
      setEditingPlaylist(null)
    } catch (error) {
      console.error("Error saving playlist:", error)
      throw error
    }
  }

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) {
      return
    }

    try {
      await deleteUserPlaylist(playlistId)
      setUserPlaylists(prev => prev.filter(p => p._id !== playlistId))
    } catch (error) {
      console.error("Error deleting playlist:", error)
      alert("Failed to delete playlist")
    }
  }

  const handlePlayPlaylist = (playlist) => {
    if (playlist.songs && playlist.songs.length > 0) {
      playFromPlaylist(playlist.songs, 0)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading library...</p>
      </div>
    )
  }

  return (
    <div className="library">
      <div className="library-header">
        <h1>Your Library</h1>
        {isAuthenticated && (
          <button className="create-playlist-btn" onClick={handleCreatePlaylist}>
            <i className="fas fa-plus"></i>
            Create Playlist
          </button>
        )}
      </div>

      <section className="library-section">
        <h2>Saved Songs</h2>
        {savedSongsList.length > 0 ? (
          <div className="songs-list">
            {savedSongsList.map((song) => (
              <div key={song._id} className="song-item">
                <div className="song-image">
                  <img
                    src={
                      song.coverUrl ? `http://localhost:5000${song.coverUrl}` : "/placeholder.svg?height=50&width=50"
                    }
                    alt={song.title}
                  />
                  <button className="play-button" onClick={() => onPlaySong(song)}>
                    <i className="fas fa-play"></i>
                  </button>
                </div>
                <div className="song-details">
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                </div>
                <div className="song-actions">
                  <button className="library-btn saved" onClick={() => removeFromLibrary(song._id)}>
                    <i className="fas fa-heart"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-library">
            <i className="fas fa-music empty-icon"></i>
            <h3>Songs you like will appear here</h3>
            <p>Save songs by clicking the heart icon</p>
          </div>
        )}
      </section>

      {isAuthenticated && (
        <section className="library-section">
          <div className="section-header">
            <h2>Your Playlists</h2>
            <button className="create-playlist-btn-small" onClick={handleCreatePlaylist}>
              <i className="fas fa-plus"></i>
            </button>
          </div>
          {userPlaylists.length > 0 ? (
            <div className="playlist-grid">
              {userPlaylists.map((playlist) => (
                <div key={playlist._id} className="playlist-card">
                  <div className="playlist-image">
                    <img
                      src={
                        playlist.coverUrl
                          ? `http://localhost:5000${playlist.coverUrl}`
                          : "/placeholder.svg?height=180&width=180"
                      }
                      alt={playlist.name}
                    />
                    <button className="play-button" onClick={() => handlePlayPlaylist(playlist)}>
                      <i className="fas fa-play"></i>
                    </button>
                  </div>
                  <div className="playlist-info">
                    <h3>{playlist.name}</h3>
                    <p>{playlist.description}</p>
                    <span className="playlist-meta">
                      {playlist.songs?.length || 0} songs • {playlist.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                  <div className="playlist-actions">
                    <button onClick={() => handleEditPlaylist(playlist)} className="edit-btn">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDeletePlaylist(playlist._id)} className="delete-btn">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-library">
              <i className="fas fa-list empty-icon"></i>
              <h3>Create your first playlist</h3>
              <p>It's easy, we'll help you</p>
              <button className="create-playlist-button" onClick={handleCreatePlaylist}>
                Create playlist
              </button>
            </div>
          )}
        </section>
      )}

      <section className="library-section">
        <h2>Featured Playlists</h2>
        {playlists.length > 0 ? (
          <div className="playlist-grid">
            {playlists.map((playlist) => (
              <div key={playlist._id} className="playlist-card">
                <div className="playlist-image">
                  <img
                    src={
                      playlist.coverUrl
                        ? `http://localhost:5000${playlist.coverUrl}`
                        : "/placeholder.svg?height=180&width=180"
                    }
                    alt={playlist.name}
                  />
                  <button className="play-button" onClick={() => handlePlayPlaylist(playlist)}>
                    <i className="fas fa-play"></i>
                  </button>
                </div>
                <div className="playlist-info">
                  <h3>{playlist.name}</h3>
                  <p>{playlist.description}</p>
                  <span className="playlist-meta">
                    {playlist.songs?.length || 0} songs
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-library">
            <i className="fas fa-list empty-icon"></i>
            <h3>No featured playlists available</h3>
          </div>
        )}
      </section>

      <PlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        onSubmit={handlePlaylistSubmit}
        editPlaylist={editingPlaylist}
      />
    </div>
  )
}

export default Library
