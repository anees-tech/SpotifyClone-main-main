"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { usePlayer } from "../context/PlayerContext"
import { usePlaylist } from "../context/PlaylistContext"
import { getPlaylistById } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "../styles/PlaylistPage.css"

function PlaylistPage() {
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { playFromPlaylist, playSong, currentSong, isPlaying } = usePlayer()
  const { getAllPlaylists } = usePlaylist()
  
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true)
        
        // First try to find in context playlists
        const allPlaylists = getAllPlaylists()
        let foundPlaylist = allPlaylists.find(p => p._id === playlistId)
        
        // If not found, fetch from API
        if (!foundPlaylist) {
          foundPlaylist = await getPlaylistById(playlistId)
        }
        
        if (foundPlaylist) {
          setPlaylist(foundPlaylist)
        } else {
          navigate("/")
        }
      } catch (error) {
        console.error("Error fetching playlist:", error)
        navigate("/")
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylist()
  }, [playlistId, navigate, getAllPlaylists])

  const handlePlayAll = () => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      playFromPlaylist(playlist.songs, 0)
    }
  }

  const handlePlaySong = (song, index) => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      playFromPlaylist(playlist.songs, index)
    }
  }

  const formatDuration = (duration) => {
    if (!duration) return "0:00"
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading playlist...</p>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="error-container">
        <h2>Playlist not found</h2>
        <button onClick={() => navigate("/")} className="back-btn">
          Go Back Home
        </button>
      </div>
    )
  }

  return (
    <div className="playlist-page">
      <Navbar />
      
      <div className="playlist-header">
        <div className="playlist-cover">
          <img
            src={playlist.coverUrl ? `http://localhost:5000${playlist.coverUrl}` : "/placeholder.svg?height=300&width=300"}
            alt={playlist.name}
          />
        </div>
        <div className="playlist-info">
          <span className="playlist-type">
            {playlist.isPublic ? "Public Playlist" : "Private Playlist"}
          </span>
          <h1>{playlist.name}</h1>
          <p className="playlist-description">{playlist.description}</p>
          <div className="playlist-meta">
            <span>{playlist.songs?.length || 0} songs</span>
            {playlist.createdBy && (
              <span> • Created by {playlist.createdBy.name || "Unknown"}</span>
            )}
          </div>
        </div>
      </div>

      <div className="playlist-controls">
        <button 
          className="play-all-btn"
          onClick={handlePlayAll}
          disabled={!playlist.songs || playlist.songs.length === 0}
        >
          <i className="fas fa-play"></i>
          
        </button>
        
      </div>

      <div className="playlist-content">
        {playlist.songs && playlist.songs.length > 0 ? (
          <div className="songs-table">
            <div className="songs-header">
              <span className="track-number">#</span>
              <span className="track-title">Title</span>
              <span className="track-album">Album</span>
              <span className="track-duration">Duration</span>
            </div>
            <div className="songs-list">
              {playlist.songs.map((song, index) => (
                <div
                  key={song._id}
                  className={`song-row ${currentSong && currentSong._id === song._id ? "active" : ""}`}
                  onClick={() => handlePlaySong(song, index)}
                >
                  <span className="track-number">
                    {currentSong && currentSong._id === song._id && isPlaying ? (
                      <i className="fas fa-volume-up playing-icon"></i>
                    ) : (
                      <span className="number">{index + 1}</span>
                    )}
                    <i className="fas fa-play play-icon"></i>
                  </span>
                  <div className="track-info">
                    <div className="track-cover">
                      <img
                        src={song.coverUrl ? `http://localhost:5000${song.coverUrl}` : "/placeholder.svg"}
                        alt={song.title}
                      />
                    </div>
                    <div className="track-details">
                      <span className="track-name">{song.title}</span>
                      <span className="track-artist">{song.artist}</span>
                    </div>
                  </div>
                  <span className="track-album">{song.album}</span>
                  <span className="track-duration">{formatDuration(song.duration)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-playlist">
            <i className="fas fa-music empty-icon"></i>
            <h3>This playlist is empty</h3>
            <p>Add some songs to get started</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default PlaylistPage