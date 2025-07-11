"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSearch } from "../context/SearchContext"
import { usePlayer } from "../context/PlayerContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "../styles/BrowseSongsPage.css"

function BrowseSongsPage() {
  const navigate = useNavigate()
  const { allSongs } = useSearch()
  const { playSong, currentSong, isPlaying } = usePlayer()
  
  const [filteredSongs, setFilteredSongs] = useState([])
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("title")

  const genres = [
    { value: "all", label: "All Genres" },
    { value: "Pop", label: "Pop" },
    { value: "Rock", label: "Rock" },
    { value: "Hip-Hop", label: "Hip-Hop" },
    { value: "R&B", label: "R&B" },
    { value: "Electronic", label: "Electronic" },
    { value: "Jazz", label: "Jazz" },
    { value: "Classical", label: "Classical" },
    { value: "Country", label: "Country" },
    { value: "Folk", label: "Folk" },
    { value: "Indie", label: "Indie" },
    { value: "Metal", label: "Metal" },
    { value: "Blues", label: "Blues" },
    { value: "Reggae", label: "Reggae" },
    { value: "Other", label: "Other" }
  ]

  useEffect(() => {
    let filtered = [...allSongs]

    // Filter by genre
    if (selectedGenre !== "all") {
      filtered = filtered.filter(song => 
        song.genre && song.genre.toLowerCase() === selectedGenre.toLowerCase()
      )
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(search) ||
        song.artist.toLowerCase().includes(search) ||
        song.album.toLowerCase().includes(search)
      )
    }

    // Sort songs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "artist":
          return a.artist.localeCompare(b.artist)
        case "album":
          return a.album.localeCompare(b.album)
        case "year":
          return (b.releaseYear || 0) - (a.releaseYear || 0)
        default:
          return 0
      }
    })

    setFilteredSongs(filtered)
  }, [allSongs, selectedGenre, searchTerm, sortBy])

  const handleSongPlay = (song) => {
    playSong(song)
    navigate(`/play/${song._id}`)
  }

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre)
  }

  const formatDuration = (duration) => {
    if (!duration) return "0:00"
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="browse-songs-page">
      <Navbar />
      
      <div className="browse-songs-content">
        <div className="container">
          <div className="page-header">
            <h1>Browse Songs</h1>
            <p>Discover music by genre</p>
          </div>

          {/* Controls */}
          <div className="browse-controls">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search songs, artists, or albums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            
          </div>

          {/* Genre Filter */}
          <div className="genre-filter">
            <h3>Filter by Genre</h3>
            <div className="genre-buttons">
              {genres.map((genre) => (
                <button
                  key={genre.value}
                  className={`genre-btn ${selectedGenre === genre.value ? "active" : ""}`}
                  onClick={() => handleGenreSelect(genre.value)}
                >
                  {genre.label}
                  {genre.value !== "all" && (
                    <span className="count">
                      ({allSongs.filter(song => 
                        song.genre && song.genre.toLowerCase() === genre.value.toLowerCase()
                      ).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="results-section">
            <div className="results-header">
              <h3>
                {selectedGenre === "all" 
                  ? `All Songs (${filteredSongs.length})` 
                  : `${selectedGenre} Songs (${filteredSongs.length})`
                }
              </h3>
            </div>

            {filteredSongs.length > 0 ? (
              <div className="songs-list">
                {filteredSongs.map((song, index) => (
                  <div
                    key={song._id}
                    className={`song-item ${currentSong && currentSong._id === song._id ? "active" : ""}`}
                  >
                    <div className="song-number">
                      {currentSong && currentSong._id === song._id && isPlaying ? (
                        <i className="fas fa-volume-up playing-icon"></i>
                      ) : (
                        <span className="number">{index + 1}</span>
                      )}
                      <button 
                        className="play-btn"
                        onClick={() => handleSongPlay(song)}
                      >
                        <i className="fas fa-play"></i>
                      </button>
                    </div>

                    <div className="song-cover">
                      <img
                        src={song.coverUrl ? `http://localhost:5000${song.coverUrl}` : "/placeholder.svg"}
                        alt={song.title}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg"
                        }}
                      />
                    </div>

                    <div className="song-details">
                      <h4 
                        className="song-title"
                        onClick={() => handleSongPlay(song)}
                      >
                        {song.title}
                      </h4>
                      <p className="song-artist">{song.artist}</p>
                    </div>

                    <div className="song-album">
                      <p>{song.album}</p>
                    </div>

                    <div className="song-genre">
                      <span className="genre-tag">{song.genre}</span>
                    </div>

                    <div className="song-year">
                      <p>{song.releaseYear || "N/A"}</p>
                    </div>

                    <div className="song-duration">
                      <p>{formatDuration(song.duration)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <i className="fas fa-music no-results-icon"></i>
                <h3>No songs found</h3>
                <p>
                  {selectedGenre !== "all" 
                    ? `No songs found in the ${selectedGenre} genre.`
                    : "No songs match your search criteria."
                  }
                </p>
                <button 
                  className="reset-btn"
                  onClick={() => {
                    setSelectedGenre("all")
                    setSearchTerm("")
                  }}
                >
                  Show All Songs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BrowseSongsPage