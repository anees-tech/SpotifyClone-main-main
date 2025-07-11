"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSearch } from "../context/SearchContext"
import { usePlayer } from "../context/PlayerContext"
import { usePlaylist } from "../context/PlaylistContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Search from "../components/Search"
import "../styles/SearchPage.css"

function SearchPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { searchQuery, setSearchQuery, allSongs, performSearch } = useSearch()
  const { playSong, playFromPlaylist, currentSong } = usePlayer()
  const { getAllPlaylists } = usePlaylist()
  
  const [filteredSongs, setFilteredSongs] = useState([])
  const [filteredPlaylists, setFilteredPlaylists] = useState([])
  const [activeFilter, setActiveFilter] = useState("all")
  const [currentQuery, setCurrentQuery] = useState("")

  // Extract query parameter from URL
  const queryParam = new URLSearchParams(location.search).get("q") || ""

  useEffect(() => {
    // Only update if the query has actually changed
    if (queryParam !== currentQuery) {
      setCurrentQuery(queryParam)
      setSearchQuery(queryParam)
      console.log("Search query updated:", queryParam)
      // Only perform search if there's a query
      if (queryParam) {
        performSearch(queryParam)
      }
    }
  }, [queryParam, setSearchQuery, performSearch, currentQuery])
  
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      
      // Filter songs
      const songs = allSongs.filter(
        song =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query)
      )
      
      // Filter playlists
      const playlists = getAllPlaylists().filter(
        playlist =>
          playlist.name.toLowerCase().includes(query) ||
          playlist.description.toLowerCase().includes(query)
      )
      
      setFilteredSongs(songs)
      setFilteredPlaylists(playlists)
    } else {
      setFilteredSongs([])
      setFilteredPlaylists([])
    }
  }, [searchQuery, allSongs, getAllPlaylists])

  const handleSongPlay = (song) => {
    playSong(song)
    navigate(`/play/${song._id}`)
  }

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist._id}`)
  }

  const handlePlaylistPlay = (playlist, e) => {
    e.stopPropagation() // Prevent navigation when clicking play button
    if (playlist.songs && playlist.songs.length > 0) {
      playFromPlaylist(playlist.songs, 0)
    }
  }

  const getFilteredResults = () => {
    switch (activeFilter) {
      case "songs":
        return { songs: filteredSongs, playlists: [] }
      case "playlists":
        return { songs: [], playlists: filteredPlaylists }
      default:
        return { songs: filteredSongs, playlists: filteredPlaylists }
    }
  }

  const { songs, playlists } = getFilteredResults()
  const totalResults = filteredSongs.length + filteredPlaylists.length

  return (
    <div className="search-page">
      <Navbar />
      
      <div className="search-content">
        <div className="search-header">
          <div className="search-input-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery("")}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {searchQuery.trim() ? (
          <div className="search-results">
            <div className="search-filters">
              <button 
                className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All ({totalResults})
              </button>
              <button 
                className={`filter-btn ${activeFilter === "songs" ? "active" : ""}`}
                onClick={() => setActiveFilter("songs")}
              >
                Songs ({filteredSongs.length})
              </button>
              <button 
                className={`filter-btn ${activeFilter === "playlists" ? "active" : ""}`}
                onClick={() => setActiveFilter("playlists")}
              >
                Playlists ({filteredPlaylists.length})
              </button>
            </div>

            {songs.length > 0 && (
              <section className="results-section">
                <h2>Songs</h2>
                <div className="songs-grid">
                  {songs.map((song) => (
                    <div
                      key={song._id}
                      className={`song-card ${currentSong && currentSong._id === song._id ? "active" : ""}`}
                    >
                      <div className="song-image">
                        <img
                          src={song.coverUrl ? `http://localhost:5000${song.coverUrl}` : "/placeholder.svg"}
                          alt={song.title}
                          onError={(e) => {
                            e.target.src = "/placeholder.svg"
                          }}
                        />
                        <button 
                          className="play-button"
                          onClick={() => handleSongPlay(song)}
                        >
                          <i className="fas fa-play"></i>
                        </button>
                      </div>
                      <div className="song-info">
                        <h3 
                          className="song-title"
                          onClick={() => handleSongPlay(song)}
                        >
                          {song.title}
                        </h3>
                        <p className="song-artist">{song.artist}</p>
                        <p className="song-album">{song.album}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {playlists.length > 0 && (
              <section className="results-section">
                <h2>Playlists</h2>
                <div className="playlists-grid">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist._id}
                      className="playlist-card"
                      onClick={() => handlePlaylistClick(playlist)}
                    >
                      <div className="playlist-image">
                        <img
                          src={playlist.coverUrl ? `http://localhost:5000${playlist.coverUrl}` : "/placeholder.svg"}
                          alt={playlist.name}
                          onError={(e) => {
                            e.target.src = "/placeholder.svg"
                          }}
                        />
                        <button 
                          className="play-button"
                          onClick={(e) => handlePlaylistPlay(playlist, e)}
                        >
                          <i className="fas fa-play"></i>
                        </button>
                      </div>
                      <div className="playlist-info">
                        <h3 className="playlist-title">{playlist.name}</h3>
                        <p className="playlist-description">{playlist.description}</p>
                        <p className="playlist-meta">
                          {playlist.songs?.length || 0} songs • {playlist.isPublic ? "Public" : "Private"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {songs.length === 0 && playlists.length === 0 && (
              <div className="no-results">
                <i className="fas fa-search no-results-icon"></i>
                <h3>No results found for "{searchQuery}"</h3>
                <p>Try searching for something else or check your spelling.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="search-placeholder">
            <div className="browse-categories">
              <h2>Browse all</h2>
              <div className="categories-grid">
                <div className="category-card" style={{backgroundColor: '#1e3264'}}>
                  <h3>Pop</h3>
                  <i className="fas fa-music category-icon"></i>
                </div>
                <div className="category-card" style={{backgroundColor: '#ba5d07'}}>
                  <h3>Hip-Hop</h3>
                  <i className="fas fa-microphone category-icon"></i>
                </div>
                <div className="category-card" style={{backgroundColor: '#8d67ab'}}>
                  <h3>Rock</h3>
                  <i className="fas fa-guitar category-icon"></i>
                </div>
                <div className="category-card" style={{backgroundColor: '#e8115b'}}>
                  <h3>Electronic</h3>
                  <i className="fas fa-headphones category-icon"></i>
                </div>
                <div className="category-card" style={{backgroundColor: '#0d72ea'}}>
                  <h3>Jazz</h3>
                  <i className="fas fa-saxophone category-icon"></i>
                </div>
                <div className="category-card" style={{backgroundColor: '#148a08'}}>
                  <h3>Classical</h3>
                  <i className="fas fa-violin category-icon"></i>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default SearchPage
