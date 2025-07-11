"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { usePlayer } from "../context/PlayerContext";
import { usePlaylist } from "../context/PlaylistContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "../styles/HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { allSongs } = useSearch();
  const { playSong, playFromPlaylist, currentSong } = usePlayer();
  const { featuredPlaylists, userPlaylists, loading } = usePlaylist();

  const handleSongPlay = (song) => {
    playSong(song);
    navigate(`/play/${song._id}`);
  };

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist._id}`);
  };

  const handlePlaylistPlay = (playlist, e) => {
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      playFromPlaylist(playlist.songs, 0);
    }
  };

  // Get recently played songs (for demo, we'll just show first 6)
  const recentSongs = allSongs.slice(0, 6);

  // Get trending playlists (featured playlists)
  const trendingPlaylists = featuredPlaylists.slice(0, 6);
  
  // Hero slider data
  const heroSlides = [
    {
      id: 1,
      title: "Discover New Music",
      subtitle: "Listen to the latest releases and curated playlists",
      bgImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1740&auto=format&fit=crop",
      buttonText: "Explore Now",
      buttonLink: "/browse",
      gradient: "linear-gradient(45deg, #8860D0 0%, #5AB9EA 100%)"
    },
    {
      id: 2,
      title: "Your Personal Library",
      subtitle: "All your favorite songs and playlists in one place",
      bgImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1470&auto=format&fit=crop",
      buttonText: "Go to Library",
      buttonLink: "/library",
      gradient: "linear-gradient(45deg, #FC466B 0%, #3F5EFB 100%)"
    },
    {
      id: 3,
      title: "Featured Playlists",
      subtitle: "Check out our curated playlists for every mood",
      bgImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1074&auto=format&fit=crop",
      buttonText: "Listen Now",
      buttonLink: featuredPlaylists.length > 0 ? `/playlist/${featuredPlaylists[0]._id}` : "/browse",
      gradient: "linear-gradient(45deg, #1DB954 0%, #191414 100%)"
    }
  ];

  return (
    <div className="home-page">
      <Navbar />

      <div className="home-content">
        {/* Hero Slider */}
        <section className="hero-section">
          <Swiper
            spaceBetween={0}
            centeredSlides={true}
            effect="fade"
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            navigation={true}
            modules={[Autoplay, EffectFade, Pagination, Navigation]}
            className="hero-swiper"
          >
            {heroSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div 
                  className="hero-slide" 
                  style={{ 
                    background: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%), url(${slide.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="hero-content">
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                    <button 
                      className="hero-btn"
                      onClick={() => navigate(slide.buttonLink)}
                      style={{
                        background: slide.gradient
                      }}
                    >
                      {slide.buttonText}
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <div className="welcome-section">
          <h1>
            {isAuthenticated ? "Welcome back!" : "Welcome to Spotify Clone"}
          </h1>
          <p>
            {isAuthenticated
              ? "Ready to dive into your music?"
              : "Discover millions of songs and podcasts"}
          </p>
        </div>

        {/* Quick Play Section */}
        {isAuthenticated && userPlaylists.length > 0 && (
          <section className="quick-play-section">
            <h2>Quick Play</h2>
            <div className="quick-play-grid">
              {userPlaylists.slice(0, 6).map((playlist) => (
                <div
                  key={playlist._id}
                  className="quick-play-item"
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <img
                    src={
                      playlist.coverUrl
                        ? `http://localhost:5000${playlist.coverUrl}`
                        : "/placeholder.svg"
                    }
                    alt={playlist.name}
                  />
                  <span>{playlist.name}</span>
                  <button
                    className="quick-play-btn"
                    onClick={(e) => handlePlaylistPlay(playlist, e)}
                  >
                    <i className="fas fa-play"></i>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recently Played */}
        <section className="content-section">
          <div className="section-header">
            <h2>Recently Played</h2>
            <button
              className="see-all-btn"
              onClick={() => navigate("/browse")}
            >
              See all
            </button>
          </div>
          <div className="content-grid">
            {recentSongs.map((song) => (
              <div
                key={song._id}
                className={`content-card ${
                  currentSong && currentSong._id === song._id ? "active" : ""
                }`}
              >
                <div className="card-image">
                  <img
                    src={
                      song.coverUrl
                        ? `http://localhost:5000${song.coverUrl}`
                        : "/placeholder.svg"
                    }
                    alt={song.title}
                  />
                  <button
                    className="play-button"
                    onClick={() => handleSongPlay(song)}
                  >
                    <i className="fas fa-play"></i>
                  </button>
                </div>
                <div className="card-info">
                  <h3 onClick={() => handleSongPlay(song)}>{song.title}</h3>
                  <p>{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Playlists */}
        <section className="content-section">
          <div className="section-header">
            <h2>Featured Playlists</h2>
            <button
              className="see-all-btn"
              onClick={() => navigate("/browse")}
            >
              See all
            </button>
          </div>
          <div className="content-grid">
            {trendingPlaylists.map((playlist) => (
              <div
                key={playlist._id}
                className="content-card"
                onClick={() => handlePlaylistClick(playlist)}
              >
                <div className="card-image">
                  <img
                    src={
                      playlist.coverUrl
                        ? `http://localhost:5000${playlist.coverUrl}`
                        : "/placeholder.svg"
                    }
                    alt={playlist.name}
                  />
                  <button
                    className="play-button"
                    onClick={(e) => handlePlaylistPlay(playlist, e)}
                  >
                    <i className="fas fa-play"></i>
                  </button>
                </div>
                <div className="card-info">
                  <h3>{playlist.name}</h3>
                  <p>{playlist.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Your Playlists */}
        {isAuthenticated && userPlaylists.length > 0 && (
          <section className="content-section">
            <div className="section-header">
              <h2>Your Playlists</h2>
              <button
                className="see-all-btn"
                onClick={() => navigate("/library")}
              >
                See all
              </button>
            </div>
            <div className="content-grid">
              {userPlaylists.slice(0, 6).map((playlist) => (
                <div
                  key={playlist._id}
                  className="content-card"
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <div className="card-image">
                    <img
                      src={
                        playlist.coverUrl
                          ? `http://localhost:5000${playlist.coverUrl}`
                          : "/placeholder.svg"
                      }
                      alt={playlist.name}
                    />
                    <button
                      className="play-button"
                      onClick={(e) => handlePlaylistPlay(playlist, e)}
                    >
                      <i className="fas fa-play"></i>
                    </button>
                  </div>
                  <div className="card-info">
                    <h3>{playlist.name}</h3>
                    <p>
                      {playlist.songs?.length || 0} songs •{" "}
                      {playlist.isPublic ? "Public" : "Private"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Songs */}
        <section className="content-section">
          <div className="section-header">
            <h2>Popular Right Now</h2>
            <button
              className="see-all-btn"
              onClick={() => navigate("/browse")}
            >
              See all
            </button>
          </div>
          <div className="content-grid">
            {allSongs.slice(6, 12).map((song) => (
              <div
                key={song._id}
                className={`content-card ${
                  currentSong && currentSong._id === song._id ? "active" : ""
                }`}
              >
                <div className="card-image">
                  <img
                    src={
                      song.coverUrl
                        ? `http://localhost:5000${song.coverUrl}`
                        : "/placeholder.svg"
                    }
                    alt={song.title}
                  />
                  <button
                    className="play-button"
                    onClick={() => handleSongPlay(song)}
                  >
                    <i className="fas fa-play"></i>
                  </button>
                </div>
                <div className="card-info">
                  <h3 onClick={() => handleSongPlay(song)}>{song.title}</h3>
                  <p>{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default HomePage;
