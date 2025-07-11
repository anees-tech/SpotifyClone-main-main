"use client"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AudioPlayer from "react-h5-audio-player"
import { usePlayer } from "../context/PlayerContext"
import { useAuth } from "../context/AuthContext"
import PlaylistSelectionModal from "./PlaylistSelectionModal"
import "../styles/Player.css"

function Player() {
  const {
    currentSong,
    isPlaying,
    playerRef,
    next,
    prev,
    toggleShuffle,
    isShuffled,
    handlePlay,
    handlePause,
    handleEnded,
    handleTimeUpdate,
    playlist,
    currentIndex,
    audioKey,
    playMode,
    seekTo,
    volume,
    handleVolumeChange,
    clearCurrentSong, // Add this function to PlayerContext if it doesn't exist
  } = usePlayer()

  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)

  const handleSongClick = () => {
    if (currentSong) {
      navigate(`/play/${currentSong._id}`)
    }
  }

  const handleAddToPlaylist = () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    setShowPlaylistModal(true)
  }

  const handleClosePlayer = () => {
    // Stop the audio and clear the current song
    if (playerRef.current && playerRef.current.audio.current) {
      playerRef.current.audio.current.pause()
    }
    clearCurrentSong() // This will clear the currentSong state, which will hide the player
  }

  useEffect(() => {
    if (currentSong) {
      document.title = `${currentSong.title} - ${currentSong.artist} | Spotify Clone`
    } else {
      document.title = "Spotify Clone"
    }
  }, [currentSong])

  const handleSeek = (e) => {
    const audio = e.target
    seekTo(audio.currentTime)
  }

  // Hide player if no song is playing
  if (!currentSong) {
    return null
  }

  return (
    <>
      <div className="player">
        <div className="song-info" onClick={handleSongClick}>
          <div className="song-image">
            <img
              src={
                currentSong.coverUrl
                  ? `http://localhost:5000${currentSong.coverUrl}`
                  : "/placeholder.svg?height=56&width=56"
              }
              alt={currentSong.title}
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=56&width=56"
              }}
            />
          </div>
          <div className="song-details">
            <div className="song-title">{currentSong.title}</div>
            <div className="song-artist">{currentSong.artist}</div>
          </div>
        </div>

        <div className="player-main">
          <div className="player-controls-top">
            <button
              className={`control-btn shuffle-btn ${isShuffled ? "active" : ""}`}
              onClick={toggleShuffle}
              title="Shuffle"
            >
              <i className="fas fa-random"></i>
            </button>
            <span className="queue-info">
              {playMode === "random" ? "Random Mode" : `${currentIndex + 1} of ${playlist.length}`}
            </span>
          </div>

          <AudioPlayer
            key={`main-player-${currentSong._id}-${audioKey}`}
            ref={playerRef}
            src={currentSong.audioUrl ? `http://localhost:5000${currentSong.audioUrl}` : ""}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onListen={handleTimeUpdate}
            onSeek={handleSeek}
            onClickNext={next}
            onClickPrevious={prev}
            onVolumeChange={(e) => handleVolumeChange(e.target.volume)}
            volume={volume}
            showSkipControls={true}
            showJumpControls={false}
            showDownloadProgress={false}
            showFilledProgress={true}
            layout="stacked-reverse"
            customProgressBarSection={["PROGRESS_BAR", "CURRENT_TIME", "DURATION"]}
            customControlsSection={["ADDITIONAL_CONTROLS", "MAIN_CONTROLS", "VOLUME_CONTROLS"]}
            autoPlayAfterSrcChange={true}
            preload="auto"
            customIcons={{
              play: <i className="fas fa-play" />,
              pause: <i className="fas fa-pause" />,
              previous: <i className="fas fa-step-backward" />,
              next: <i className="fas fa-step-forward" />,
              volume: <i className="fas fa-volume-up" />,
              volumeMute: <i className="fas fa-volume-mute" />,
            }}
          />
        </div>

        <div className="player-actions">
          <button
            className="control-btn"
            title="Add to Playlist"
            disabled={!currentSong}
            onClick={handleAddToPlaylist}
          >
            <i className="fas fa-plus"></i>
          </button>
          
          <button
            className="control-btn close-btn"
            title="Close Player"
            onClick={handleClosePlayer}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {showPlaylistModal && (
        <PlaylistSelectionModal
          song={currentSong}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </>
  )
}

export default Player
