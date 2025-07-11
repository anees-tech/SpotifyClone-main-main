"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { usePlayer } from "../context/PlayerContext"
import { useSearch } from "../context/SearchContext"
import "../styles/Search.css"

function Search({ searchResults, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery)
  const { playSong } = usePlayer()
  const { performSearch, addToLibrary, removeFromLibrary } = useSearch()
  const navigate = useNavigate()

  // Update local query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const [library, setLibrary] = useState([])

  const addToLibraryLocal = (songId) => {
    setLibrary([...library, songId])
    addToLibrary(songId)
  }

  const removeFromLibraryLocal = (songId) => {
    setLibrary(library.filter((id) => id !== songId))
    removeFromLibrary(songId)
  }

  const handleSearchChange = (e) => {
    const newQuery = e.target.value
    setQuery(newQuery)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true })
    }
  }

  const handlePlaySong = (song) => {
    // Play song in random mode since it's not from a specific playlist
    playSong(song, false)
    navigate(`/play/${song._id || song.id}`)
  }

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`)
  }

  const handleClearSearch = () => {
    setQuery("")
    navigate("/search", { replace: true })
  }

  return (
    <div className="search">
      <div className="search-input-container">
        <form onSubmit={handleSearchSubmit}>
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={handleSearchChange}
          />
          {query && (
            <button className="clear-search" onClick={handleClearSearch} type="button">
              <i className="fas fa-times"></i>
            </button>
          )}
        </form>
      </div>

      {query && searchResults && (
        <div className="search-results">
          {searchResults.songs && searchResults.songs.length > 0 && (
            <section className="search-section">
              <h2>Songs</h2>
              <div className="songs-list">
                {searchResults.songs.map((song) => (
                  <div key={song._id || song.id} className="song-item">
                    <div className="song-image">
                      <img
                        src={
                          song.coverUrl
                            ? `http://localhost:5000${song.coverUrl}`
                            : "/placeholder.svg?height=50&width=50"
                        }
                        alt={song.title}
                      />
                      <button className="play-button" onClick={() => handlePlaySong(song)}>
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                    <div className="song-details">
                      <h3>{song.title}</h3>
                      <p>{song.artist}</p>
                    </div>
                    <div className="song-actions">
                      {library.includes(song._id || song.id) ? (
                        <button
                          className="library-btn saved"
                          onClick={() => removeFromLibraryLocal(song._id || song.id)}
                        >
                          <i className="fas fa-heart"></i>
                        </button>
                      ) : (
                        <button className="library-btn" onClick={() => addToLibraryLocal(song._id || song.id)}>
                          <i className="far fa-heart"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {searchResults.playlists && searchResults.playlists.length > 0 && (
            <section className="search-section">
              <h2>Playlists</h2>
              <div className="playlist-grid">
                {searchResults.playlists.map((playlist) => (
                  <div key={playlist._id || playlist.id} className="playlist-card">
                    <div className="playlist-image">
                      <img src={playlist.coverUrl || "/placeholder.svg?height=200&width=200"} alt={playlist.name} />
                      <button className="play-button" onClick={() => navigate(`/playlist/${playlist._id}`)}>
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                    <h3>{playlist.name}</h3>
                    <p>{playlist.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(!searchResults.songs || searchResults.songs.length === 0) &&
            (!searchResults.playlists || searchResults.playlists.length === 0) && (
              <div className="no-results">
                <i className="fas fa-search no-results-icon"></i>
                <p>No results found for "{query}"</p>
                <p>Please try again with a different search term.</p>
              </div>
            )}
        </div>
      )}

      {!query && (
        <div className="browse-categories">
          <h2>Browse All</h2>
          <div className="categories-grid">
            <div className="category-card pop" onClick={() => handleCategoryClick("pop")}>
              <h3>Pop</h3>
              <i className="fas fa-music category-icon"></i>
            </div>
            <div className="category-card hiphop" onClick={() => handleCategoryClick("hiphop")}>
              <h3>Hip-Hop</h3>
              <i className="fas fa-microphone category-icon"></i>
            </div>
            <div className="category-card rock" onClick={() => handleCategoryClick("rock")}>
              <h3>Rock</h3>
              <i className="fas fa-guitar category-icon"></i>
            </div>
            <div className="category-card electronic" onClick={() => handleCategoryClick("electronic")}>
              <h3>Electronic</h3>
              <i className="fas fa-headphones category-icon"></i>
            </div>
            <div className="category-card jazz" onClick={() => handleCategoryClick("jazz")}>
              <h3>Jazz</h3>
              <i className="fas fa-saxophone category-icon"></i>
            </div>
            <div className="category-card rnb" onClick={() => handleCategoryClick("rnb")}>
              <h3>R&B</h3>
              <i className="fas fa-heart category-icon"></i>
            </div>
            <div className="category-card classical" onClick={() => handleCategoryClick("classical")}>
              <h3>Classical</h3>
              <i className="fas fa-violin category-icon"></i>
            </div>
            <div className="category-card country" onClick={() => handleCategoryClick("country")}>
              <h3>Country</h3>
              <i className="fas fa-hat-cowboy category-icon"></i>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Search
