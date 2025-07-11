"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { usePlayer } from "../context/PlayerContext"
import { useSearch } from "../context/SearchContext"
import { addToLibrary, removeFromLibrary } from "../services/api"
import PlaylistSelectionModal from "./PlaylistSelectionModal"
import "../styles/SongCard.css"

function SongCard({ song, showAddToPlaylist = true, showLike = true, onClick }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { playSong, currentSong, isPlaying } = usePlayer()
  const { savedSongs, addToLibrary: addToSearchLibrary, removeFromLibrary: removeFromSearchLibrary } = useSearch()

  const [isLiked, setIsLiked] = useState(savedSongs.includes(song._id))
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const isCurrentSong = currentSong && currentSong._id === song._id

  useEffect(() => {
    setIsLiked(savedSongs.includes(song._id))
  }, [savedSongs, song._id])

  const handlePlay = (e) => {
    e.stopPropagation()
    if (onClick) {
      onClick(song)
    } else {
      playSong(song, null, true) // true = navigate to song page
    }
  }

  const handleLike = async (e) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    try {
      setLoading(true)
      if (isLiked) {
        await removeFromLibrary(song._id)
        removeFromSearchLibrary(song._id)
        setIsLiked(false)
      } else {
        await addToLibrary(song._id)
        addToSearchLibrary(song._id)
        setIsLiked(true)
      }
    } catch (error) {
      console.error("Error updating library:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPlaylist = (e) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    setShowPlaylistModal(true)
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(song)
    } else {
      navigate(`/play/${song._id}`)
    }
  }

  return (
    <>
      <div className={`song-card ${isCurrentSong ? "active" : ""}`} onClick={handleCardClick}>
        <div className="song-image">
          <img
            src={song.coverUrl ? `http://localhost:5000${song.coverUrl}` : "/placeholder.svg"}
            alt={song.title}
            onError={(e) => {
              e.target.src = "/placeholder.svg"
            }}
          />
          <button className="play-button" onClick={handlePlay}>
            {isCurrentSong && isPlaying ? (
              <i className="fas fa-pause"></i>
            ) : (
              <i className="fas fa-play"></i>
            )}
          </button>
          {isCurrentSong && isPlaying && (
            <div className="now-playing-indicator">
              <div className="sound-wave">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            </div>
          )}
        </div>

        <div className="song-info">
          <h3 className="song-title">{song.title}</h3>
          <p className="song-artist">{song.artist}</p>
          <p className="song-album">{song.album}</p>
        </div>

        <div className="song-actions">
          {showLike && (
            <button
              className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
              onClick={handleLike}
              disabled={loading}
              title={isLiked ? "Remove from Liked Songs" : "Add to Liked Songs"}
            >
              <i className={`${isLiked ? "fas" : "far"} fa-heart`}></i>
            </button>
          )}

          {showAddToPlaylist && (
            <button
              className="action-btn playlist-btn"
              onClick={handleAddToPlaylist}
              title="Add to Playlist"
            >
              <i className="fas fa-plus"></i>
            </button>
          )}
        </div>
      </div>

      {showPlaylistModal && (
        <PlaylistSelectionModal
          song={song}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </>
  )
}

export default SongCard
