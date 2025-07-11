"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useBrowse } from "../context/BrowseContext"
import { usePlaylist } from "../context/PlaylistContext"
import { usePlayer } from "../context/PlayerContext"
import "../styles/BrowsePage.css"

function BrowsePage() {
  const { categories, newReleases, loading } = useBrowse()
  const { featuredPlaylists } = usePlaylist()
  const { playSong } = usePlayer()
  const [timeOfDay, setTimeOfDay] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay("Good morning")
    else if (hour < 18) setTimeOfDay("Good afternoon")
    else setTimeOfDay("Good evening")
  }, [])

  const handlePlaySong = (song) => {
    playSong(song)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading browse content...</p>
      </div>
    )
  }

  return (
    <div className="browse-page">
      <Navbar />

      <div className="browse-content">
        <div className="container">
          <div className="browse-header">
            <h1>{timeOfDay}</h1>
          </div>

          {/* Quick Access Grid */}
          <section className="quick-access-section">
            <div className="quick-access-grid">
              <Link to="/library" className="quick-access-item liked-songs">
                <div className="quick-access-icon">
                  <i className="fas fa-heart"></i>
                </div>
                <span>Liked Songs</span>
              </Link>

              {featuredPlaylists.slice(0, 5).map((playlist) => (
                <Link to={`/playlist/${playlist._id}`} key={playlist._id} className="quick-access-item">
                  <img
                    src={
                      playlist.coverUrl
                        ? `http://localhost:5000${playlist.coverUrl}`
                        : "/placeholder.svg?height=80&width=80"
                    }
                    alt={playlist.name}
                  />
                  <span>{playlist.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* New Releases */}
          {newReleases.length > 0 && (
            <section className="new-releases-section">
              <div className="section-header">
                <h2>New Releases</h2>
                <Link to="/search" className="see-all">
                  See all
                </Link>
              </div>
              <div className="content-grid">
                {newReleases.map((song) => (
                  <div key={song._id} className="content-card">
                    <div className="card-image">
                      <img
                        src={
                          song.coverUrl
                            ? `http://localhost:5000${song.coverUrl}`
                            : "/placeholder.svg?height=200&width=200"
                        }
                        alt={song.title}
                      />
                      <button className="play-button" onClick={() => handlePlaySong(song)}>
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                    <div className="card-info">
                      <h3>{song.title}</h3>
                      <p>{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Browse Categories */}
          <section className="browse-categories-section">
            <div className="section-header">
              <h2>Browse all</h2>
            </div>
            <div className="categories-grid">
              {categories.map((category) => (
                <Link
                  to={`/category/${category.id}`}
                  key={category.id}
                  className="category-card"
                  style={{ backgroundColor: category.color }}
                >
                  <h3>{category.name}</h3>
                  <div className="category-icon">
                    <i className="fas fa-music"></i>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Playlists */}
          {featuredPlaylists.length > 0 && (
            <section className="featured-playlists-section">
              <div className="section-header">
                <h2>Featured Playlists</h2>
                <Link to="/search" className="see-all">
                  See all
                </Link>
              </div>
              <div className="content-grid">
                {featuredPlaylists.map((playlist) => (
                  <Link to={`/playlist/${playlist._id}`} key={playlist._id} className="content-card">
                    <div className="card-image">
                      <img
                        src={
                          playlist.coverUrl
                            ? `http://localhost:5000${playlist.coverUrl}`
                            : "/placeholder.svg?height=200&width=200"
                        }
                        alt={playlist.name}
                      />
                      <button className="play-button">
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                    <div className="card-info">
                      <h3>{playlist.name}</h3>
                      <p>{playlist.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BrowsePage
