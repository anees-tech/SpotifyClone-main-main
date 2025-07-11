"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { usePlayer } from "../context/PlayerContext"
import { useSearch } from "../context/SearchContext"
import { useBrowse } from "../context/BrowseContext"
import SongCard from "./SongCard"
import "../styles/Home.css"

function Home() {
  const navigate = useNavigate()
  const { playSong, playFromPlaylist } = usePlayer()
  const { allSongs, getSavedSongsDetails } = useSearch()
  const { featuredPlaylists } = useBrowse()

  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [recommendedSongs, setRecommendedSongs] = useState([])
  const [topHits, setTopHits] = useState([])

  useEffect(() => {
    if (allSongs.length > 0) {
      // Get recently played from localStorage or use random songs
      const recent = JSON.parse(localStorage.getItem("recentlyPlayed") || "[]")
      const recentSongs = recent
        .map((id) => allSongs.find((song) => song._id === id))
        .filter(Boolean)
        .slice(0, 6)

      if (recentSongs.length < 6) {
        const additionalSongs = allSongs
          .filter((song) => !recent.includes(song._id))
          .sort(() => Math.random() - 0.5)
          .slice(0, 6 - recentSongs.length)
        setRecentlyPlayed([...recentSongs, ...additionalSongs])
      } else {
        setRecentlyPlayed(recentSongs)
      }

      // Set recommended songs (random selection)
      setRecommendedSongs(allSongs.sort(() => Math.random() - 0.5).slice(0, 8))

      // Set top hits (first 8 songs)
      setTopHits(allSongs.slice(0, 8))
    }
  }, [allSongs])

  const handlePlaySong = (song) => {
    // Add to recently played
    const recent = JSON.parse(localStorage.getItem("recentlyPlayed") || "[]")
    const updatedRecent = [song._id, ...recent.filter((id) => id !== song._id)].slice(0, 20)
    localStorage.setItem("recentlyPlayed", JSON.stringify(updatedRecent))

    playSong(song, allSongs)
    navigate(`/play/${song._id}`)
  }

  const handlePlayPlaylist = (playlist) => {
    if (playlist.songs && playlist.songs.length > 0) {
      playFromPlaylist(playlist.songs)
      navigate(`/play/${playlist.songs[0]._id}`)
    }
  }

  const savedSongs = getSavedSongsDetails()

  return (
    <div className="home">
      <div className="container">
        <div className="welcome-section">
          <h1>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}</h1>
        </div>

        {recentlyPlayed.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2>Recently played</h2>
            </div>
            <div className="quick-play-grid">
              {recentlyPlayed.slice(0, 6).map((song) => (
                <div key={song._id} className="quick-play-item" onClick={() => handlePlaySong(song)}>
                  <img
                    src={song.coverUrl ? `http://localhost:5000${song.coverUrl}` : "/placeholder.svg"}
                    alt={song.title}
                  />
                  <span>{song.title}</span>
                  <button className="quick-play-button">
                    <i className="fas fa-play"></i>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {featuredPlaylists.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2>Made for you</h2>
            </div>
            <div className="cards-grid">
              {featuredPlaylists.slice(0, 4).map((playlist) => (
                <div key={playlist.id} className="playlist-card" onClick={() => handlePlayPlaylist(playlist)}>
                  <div className="playlist-image">
                    <img src={playlist.coverUrl || "/placeholder.svg"} alt={playlist.name} />
                    <div className="play-overlay">
                      <button className="play-button">
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                  </div>
                  <h3>{playlist.name}</h3>
                  <p>{playlist.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {recommendedSongs.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2>Recommended for you</h2>
            </div>
            <div className="cards-grid">
              {recommendedSongs.map((song) => (
                <SongCard
                  key={song._id}
                  song={song}
                  onClick={() => navigate(`/play/${song._id}`)}
                  onPlay={handlePlaySong}
                />
              ))}
            </div>
          </section>
        )}

        {topHits.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2>Popular right now</h2>
            </div>
            <div className="cards-grid">
              {topHits.map((song) => (
                <SongCard
                  key={song._id}
                  song={song}
                  onClick={() => navigate(`/play/${song._id}`)}
                  onPlay={handlePlaySong}
                />
              ))}
            </div>
          </section>
        )}

        {savedSongs.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2>Your liked songs</h2>
            </div>
            <div className="cards-grid">
              {savedSongs.slice(0, 8).map((song) => (
                <SongCard
                  key={song._id}
                  song={song}
                  onClick={() => navigate(`/play/${song._id}`)}
                  onPlay={handlePlaySong}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Home
