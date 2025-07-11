"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePlayer } from "../context/PlayerContext"
import { useSearch } from "../context/SearchContext"
import { getSongsByCategory } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "../styles/CategoryPage.css"

function CategoryPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { playSong, currentSong, isPlaying } = usePlayer()
  const { allSongs } = useSearch()

  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryInfo, setCategoryInfo] = useState(null)

  // Category mapping
  const categoryMap = {
    pop: { name: "Pop", color: "#1e3264", description: "The biggest pop hits" },
    hiphop: { name: "Hip-Hop", color: "#ba5d07", description: "Beats, rhymes and life" },
    rock: { name: "Rock", color: "#8d67ab", description: "Rock classics and new hits" },
    electronic: { name: "Electronic", color: "#e8115b", description: "Electronic beats and synths" },
    jazz: { name: "Jazz", color: "#0d72ea", description: "Smooth jazz and classics" },
    rnb: { name: "R&B", color: "#148a08", description: "Soul, rhythm and blues" },
    classical: { name: "Classical", color: "#8c1932", description: "Classical masterpieces" },
    country: { name: "Country", color: "#bc5900", description: "Country roads and stories" },
  }

  useEffect(() => {
    const fetchCategorySongs = async () => {
      try {
        setLoading(true)

        // Set category info
        const category = categoryMap[categoryId] || {
          name: categoryId,
          color: "#1e3264",
          description: `${categoryId} music`,
        }
        setCategoryInfo(category)

        // Try to fetch from API first
        let categorySongs = []
        try {
          categorySongs = await getSongsByCategory(categoryId)
        } catch (apiError) {
          console.warn("API fetch failed, using local filtering:", apiError)
        }

        // If API fails or returns no results, filter locally
        if (categorySongs.length === 0 && allSongs.length > 0) {
          categorySongs = allSongs.filter(
            (song) => song.genre && song.genre.toLowerCase().includes(categoryId.toLowerCase()),
          )
        }

        // If still no results, show some random songs as fallback
        if (categorySongs.length === 0 && allSongs.length > 0) {
          categorySongs = allSongs.slice(0, 12) // Show first 12 songs as fallback
        }

        setSongs(categorySongs)
      } catch (error) {
        console.error("Error fetching category songs:", error)
        setSongs([])
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchCategorySongs()
    }
  }, [categoryId, allSongs])

  const handlePlaySong = (song) => {
    playSong(song, true, songs) // Play from this category playlist
    navigate(`/play/${song._id}`)
  }

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], true, songs)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {categoryId} songs...</p>
      </div>
    )
  }

  return (
    <div className="category-page">
      <Navbar />

      <div
        className="category-header"
        style={{ background: `linear-gradient(135deg, ${categoryInfo?.color || "#1e3264"} 0%, #121212 100%)` }}
      >
        <div className="category-info">
          <h1>{categoryInfo?.name || categoryId}</h1>
          <p>{categoryInfo?.description || `Discover ${categoryId} music`}</p>
          <div className="category-stats">
            <span>{songs.length} songs available</span>
          </div>
        </div>
      </div>

      <div className="category-content">
        <div className="category-controls">
          <button className="play-all-btn" onClick={handlePlayAll} disabled={songs.length === 0}>
            <i className="fas fa-play"></i>
            Play All
          </button>
        </div>

        {songs.length > 0 ? (
          <div className="songs-grid">
            {songs.map((song, index) => (
              <div
                key={song._id}
                className={`song-card ${currentSong && currentSong._id === song._id ? "active" : ""}`}
              >
                <div className="song-image">
                  <img
                    src={
                      song.coverUrl ? `http://localhost:5000${song.coverUrl}` : "/placeholder.svg?height=200&width=200"
                    }
                    alt={song.title}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=200&width=200"
                    }}
                  />
                  <button className="play-button" onClick={() => handlePlaySong(song)}>
                    <i
                      className={`fas ${currentSong && currentSong._id === song._id && isPlaying ? "fa-pause" : "fa-play"}`}
                    ></i>
                  </button>
                </div>
                <div className="song-info">
                  <h3 className="song-title" onClick={() => handlePlaySong(song)}>
                    {song.title}
                  </h3>
                  <p className="song-artist">{song.artist}</p>
                  {song.album && <p className="song-album">{song.album}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-songs">
            <i className="fas fa-music no-songs-icon"></i>
            <h3>No songs found</h3>
            <p>We couldn't find any songs in the {categoryInfo?.name || categoryId} category.</p>
            <button onClick={() => navigate("/search")} className="browse-btn">
              Browse All Music
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default CategoryPage
