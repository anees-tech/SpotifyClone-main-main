"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePlayer } from "../context/PlayerContext"
import { useAuth } from "../context/AuthContext"
import { useSearch } from "../context/SearchContext"
import { usePlaylist } from "../context/PlaylistContext"
import { getSongById, addToLibrary, removeFromLibrary } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import PlaylistSelectionModal from "../components/PlaylistSelectionModal"
import "../styles/PlaySongPage.css"

function PlaySongPage() {
  const { songId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { currentSong, isPlaying, togglePlay, playSong, next, prev } = usePlayer()
  const {
    allSongs,
    savedSongs,
    addToLibrary: addToSearchLibrary,
    removeFromLibrary: removeFromSearchLibrary,
  } = useSearch()
  const { getAllPlaylists } = usePlaylist()

  const [song, setSong] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [relatedSongs, setRelatedSongs] = useState([])
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Listen for URL changes (when user navigates back/forward or URL changes)
  useEffect(() => {
    const handlePopState = () => {
      // Force re-fetch when URL changes
      window.location.reload()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Listen for song changes from player context
  useEffect(() => {
    const handleSongChange = (event) => {
      const { song: newSong } = event.detail
      if (newSong && newSong._id !== songId) {
        // Navigate to the new song page
        navigate(`/play/${newSong._id}`, { replace: true })
      }
    }

    window.addEventListener('songChanged', handleSongChange)
    return () => window.removeEventListener('songChanged', handleSongChange)
  }, [songId, navigate])

  // Main effect to fetch song data when songId changes
  useEffect(() => {
    const fetchSong = async () => {
      if (!songId) return

      try {
        setLoading(true)

        // First try to find in allSongs
        let foundSong = allSongs.find((s) => s._id === songId)

        // If not found, check if it's the current song from player context
        if (!foundSong && currentSong && currentSong._id === songId) {
          foundSong = currentSong
        }

        // If still not found, fetch from API
        if (!foundSong) {
          foundSong = await getSongById(songId)
        }

        if (foundSong) {
          setSong(foundSong)
          setIsLiked(savedSongs.includes(foundSong._id))

          // Find related songs (same genre or artist)
          const related = allSongs
            .filter((s) => s._id !== foundSong._id && (s.genre === foundSong.genre || s.artist === foundSong.artist))
            .slice(0, 6)
          setRelatedSongs(related)

          // If this song is not the current playing song, update the player
          if (!currentSong || currentSong._id !== foundSong._id) {
            playSong(foundSong, null, false) // false = don't navigate since we're already on the page
          }
        } else {
          navigate("/")
        }
      } catch (error) {
        console.error("Error fetching song:", error)
        navigate("/")
      } finally {
        setLoading(false)
      }
    }

    fetchSong()
  }, [songId, navigate]) // Removed allSongs and currentSong dependencies to prevent infinite loops

  // Separate effect to update liked status when savedSongs changes
  useEffect(() => {
    if (song) {
      setIsLiked(savedSongs.includes(song._id))
    }
  }, [savedSongs, song])

  // Separate effect to update related songs when allSongs changes
  useEffect(() => {
    if (song && allSongs.length > 0) {
      const related = allSongs
        .filter((s) => s._id !== song._id && (s.genre === song.genre || s.artist === song.artist))
        .slice(0, 6)
      setRelatedSongs(related)
    }
  }, [allSongs, song])

  const handlePlayPause = () => {
    if (currentSong && currentSong._id === song._id) {
      togglePlay()
    } else {
      playSong(song, null, false) // false = don't navigate since we're already on the page
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    try {
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
    }
  }

  const handleAddToPlaylist = () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    setShowPlaylistModal(true)
  }

  const handleShare = () => {
    setShowShareMenu(!showShareMenu)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setShowShareMenu(false)
    // You could add a toast notification here
  }

  const handlePlayRelated = (relatedSong) => {
    // Navigate to the new song page first, then play
    navigate(`/play/${relatedSong._id}`)
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
        <p>Loading song...</p>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="error-container">
        <h2>Song not found</h2>
        <button onClick={() => navigate("/")} className="back-btn">
          Go Back Home
        </button>
      </div>
    )
  }

  const isCurrentSong = currentSong && currentSong._id === song._id

  return (
    <div className="play-song-page">
      <Navbar />

      <div className="song-hero">
        <div className="song-artwork">
          <img
            src={song.coverUrl ? `http://localhost:5000${song.coverUrl}` : "/placeholder.svg?height=300&width=300"}
            alt={song.title}
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=300&width=300"
            }}
          />
        </div>

        <div className="song-info">
          <span className="song-type">Song</span>
          <h1 className="song-title">{song.title}</h1>
          <div className="song-meta">
            <span className="song-artist">{song.artist}</span>
            {song.album && <span> • {song.album}</span>}
            {song.releaseDate && <span> • {new Date(song.releaseDate).getFullYear()}</span>}
            <span> • {formatDuration(song.duration)}</span>
          </div>
        </div>
      </div>

      <div className="song-controls">
        <button className={`play-btn ${isCurrentSong && isPlaying ? "playing" : ""}`} onClick={handlePlayPause}>
          <i className={`fas ${isCurrentSong && isPlaying ? "fa-pause" : "fa-play"}`}></i>
        </button>

        {isAuthenticated && (
          <button className={`like-btn ${isLiked ? "liked" : ""}`} onClick={handleLike}>
            <i className={`${isLiked ? "fas" : "far"} fa-heart`}></i>
          </button>
        )}

        <button className="add-playlist-btn" onClick={handleAddToPlaylist}>
          <i className="fas fa-plus"></i>
        </button>

        <div className="share-container">
          <button className="share-btn" onClick={handleShare}>
            <i className="fas fa-share-alt"></i>
          </button>

          {showShareMenu && (
            <div className="share-menu">
              <button onClick={handleCopyLink}>
                <i className="fas fa-link"></i>
                Copy link
              </button>
            </div>
          )}
        </div>
      </div>

      {relatedSongs.length > 0 && (
        <div className="related-songs">
          <h2>More from {song.artist}</h2>
          <div className="related-songs-grid">
            {relatedSongs.map((relatedSong) => (
              <div
                key={relatedSong._id}
                className={`related-song-card ${currentSong && currentSong._id === relatedSong._id ? "active" : ""}`}
              >
                <div className="related-song-image">
                  <img
                    src={relatedSong.coverUrl ? `http://localhost:5000${relatedSong.coverUrl}` : "/placeholder.svg"}
                    alt={relatedSong.title}
                  />
                  <button className="play-button" onClick={() => handlePlayRelated(relatedSong)}>
                    <i className="fas fa-play"></i>
                  </button>
                </div>
                <div className="related-song-info">
                  <h3 onClick={() => handlePlayRelated(relatedSong)}>{relatedSong.title}</h3>
                  <p>{relatedSong.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPlaylistModal && <PlaylistSelectionModal song={song} onClose={() => setShowPlaylistModal(false)} />}

      <Footer />
    </div>
  )
}

export default PlaySongPage
