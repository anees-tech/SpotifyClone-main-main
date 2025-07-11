"use client"

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react"
import { useSearch } from "./SearchContext"

const PlayerContext = createContext()

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider")
  }
  return context
}

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null)
  const [playlist, setPlaylist] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState("off") // off, one, all
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [audioKey, setAudioKey] = useState(0) // Force re-render of audio component

  const playerRef = useRef(null)
  const { allSongs } = useSearch()

  // Load player state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('spotifyClonePlayerState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        if (state.currentSong) {
          setCurrentSong(state.currentSong)
          setPlaylist(state.playlist || [])
          setCurrentIndex(state.currentIndex || 0)
          setIsShuffled(state.isShuffled || false)
          setRepeatMode(state.repeatMode || "off")
          setVolume(state.volume || 1)
          // Don't restore isPlaying state - let user manually play
        }
      } catch (error) {
        console.error('Error loading player state:', error)
      }
    }
  }, [])

  // Save player state to localStorage whenever it changes
  useEffect(() => {
    if (currentSong) {
      const stateToSave = {
        currentSong,
        playlist,
        currentIndex,
        isShuffled,
        repeatMode,
        volume,
        timestamp: Date.now()
      }
      localStorage.setItem('spotifyClonePlayerState', JSON.stringify(stateToSave))
    }
  }, [currentSong, playlist, currentIndex, isShuffled, repeatMode, volume])

  // Create shuffled playlist
  const createShuffledPlaylist = useCallback((songs, currentSongIndex = 0) => {
    const shuffled = [...songs]
    const currentSong = shuffled[currentSongIndex]

    // Remove current song and shuffle the rest
    shuffled.splice(currentSongIndex, 1)
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Put current song at the beginning
    return [currentSong, ...shuffled]
  }, [])

  // Play a single song with optional playlist context
  const playSong = useCallback(
    (song, playlistContext = null, shouldNavigate = true) => {
      console.log("Playing song:", song.title)
      setIsLoading(true)

      let newPlaylist = playlistContext || allSongs || []

      // If no playlist context provided, create one from all songs
      if (!playlistContext && allSongs.length > 0) {
        newPlaylist = allSongs
      }

      // Find the song index in the playlist
      const songIndex = newPlaylist.findIndex((s) => s._id === song._id)
      const finalIndex = songIndex >= 0 ? songIndex : 0

      // If song not in playlist, add it at the beginning
      if (songIndex === -1) {
        newPlaylist = [song, ...newPlaylist]
      }

      setCurrentSong(song)
      setPlaylist(isShuffled ? createShuffledPlaylist(newPlaylist, finalIndex) : newPlaylist)
      setCurrentIndex(isShuffled ? 0 : finalIndex)
      setIsPlaying(true)
      setAudioKey(prev => prev + 1) // Force audio component refresh
      setIsLoading(false)

      // Add to recently played
      const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]')
      const updatedRecent = [song._id, ...recentlyPlayed.filter(id => id !== song._id)].slice(0, 20)
      localStorage.setItem('recentlyPlayed', JSON.stringify(updatedRecent))

      // Navigate if requested
      if (shouldNavigate && window.location.pathname !== `/play/${song._id}`) {
        window.history.pushState(null, '', `/play/${song._id}`)
        // Trigger a custom event to update the page content
        window.dispatchEvent(new CustomEvent('songChanged', { detail: { song } }))
      }
    },
    [allSongs, isShuffled, createShuffledPlaylist]
  )

  // Play from a playlist starting at index
  const playFromPlaylist = useCallback(
    (songs, startIndex = 0, shouldNavigate = true) => {
      if (!songs || songs.length === 0) return

      console.log("Playing from playlist, starting at index:", startIndex)
      const song = songs[startIndex]
      const finalPlaylist = isShuffled ? createShuffledPlaylist(songs, startIndex) : songs
      const finalIndex = isShuffled ? 0 : startIndex

      setCurrentSong(song)
      setPlaylist(finalPlaylist)
      setCurrentIndex(finalIndex)
      setIsPlaying(true)
      setAudioKey(prev => prev + 1) // Force audio component refresh

      // Add to recently played
      const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]')
      const updatedRecent = [song._id, ...recentlyPlayed.filter(id => id !== song._id)].slice(0, 20)
      localStorage.setItem('recentlyPlayed', JSON.stringify(updatedRecent))

      // Navigate if requested
      if (shouldNavigate && window.location.pathname !== `/play/${song._id}`) {
        window.history.pushState(null, '', `/play/${song._id}`)
        window.dispatchEvent(new CustomEvent('songChanged', { detail: { song } }))
      }
    },
    [isShuffled, createShuffledPlaylist]
  )

  // Next song
  const next = useCallback(() => {
    if (playlist.length === 0) return

    let nextIndex = currentIndex + 1

    if (nextIndex >= playlist.length) {
      if (repeatMode === "all") {
        nextIndex = 0
      } else {
        return // End of playlist
      }
    }

    const nextSong = playlist[nextIndex]
    if (nextSong) {
      setCurrentSong(nextSong)
      setCurrentIndex(nextIndex)
      setIsPlaying(true)
      setAudioKey(prev => prev + 1)

      // Navigate to the new song
      const newPath = `/play/${nextSong._id}`
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath)
        window.dispatchEvent(new CustomEvent('songChanged', { detail: { song: nextSong } }))
      }
    }
  }, [playlist, currentIndex, repeatMode])

  // Previous song
  const prev = useCallback(() => {
    if (playlist.length === 0) return

    let prevIndex = currentIndex - 1

    if (prevIndex < 0) {
      if (repeatMode === "all") {
        prevIndex = playlist.length - 1
      } else {
        prevIndex = 0
      }
    }

    const prevSong = playlist[prevIndex]
    if (prevSong) {
      setCurrentSong(prevSong)
      setCurrentIndex(prevIndex)
      setIsPlaying(true)
      setAudioKey(prev => prev + 1)

      // Navigate to the new song
      const newPath = `/play/${prevSong._id}`
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath)
        window.dispatchEvent(new CustomEvent('songChanged', { detail: { song: prevSong } }))
      }
    }
  }, [playlist, currentIndex, repeatMode])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (playerRef.current?.audio?.current) {
      if (isPlaying) {
        playerRef.current.audio.current.pause()
      } else {
        playerRef.current.audio.current.play()
      }
    }
  }, [isPlaying])

  // Jump forward/backward
  const jumpForward = useCallback(() => {
    if (playerRef.current?.audio?.current) {
      playerRef.current.audio.current.currentTime += 10
    }
  }, [])

  const jumpBackward = useCallback(() => {
    if (playerRef.current?.audio?.current) {
      playerRef.current.audio.current.currentTime -= 10
    }
  }, [])

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    const newShuffled = !isShuffled
    setIsShuffled(newShuffled)

    if (playlist.length > 0 && currentSong) {
      if (newShuffled) {
        const shuffledPlaylist = createShuffledPlaylist(playlist, currentIndex)
        setPlaylist(shuffledPlaylist)
        setCurrentIndex(0)
      } else {
        // Restore original order
        const originalIndex = allSongs.findIndex((s) => s._id === currentSong._id)
        setPlaylist(allSongs)
        setCurrentIndex(originalIndex >= 0 ? originalIndex : 0)
      }
    }
  }, [isShuffled, playlist, currentSong, currentIndex, allSongs, createShuffledPlaylist])

  // Toggle repeat
  const toggleRepeat = useCallback(() => {
    const modes = ["off", "all", "one"]
    const currentModeIndex = modes.indexOf(repeatMode)
    const nextMode = modes[(currentModeIndex + 1) % modes.length]
    setRepeatMode(nextMode)
  }, [repeatMode])

  // Audio event handlers
  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    setIsLoading(false)
  }, [])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleEnded = useCallback(() => {
    if (repeatMode === "one") {
      // Replay current song
      if (playerRef.current?.audio?.current) {
        playerRef.current.audio.current.currentTime = 0
        playerRef.current.audio.current.play()
      }
    } else {
      next()
    }
  }, [repeatMode, next])

  const handleTimeUpdate = useCallback(() => {
    if (playerRef.current?.audio?.current) {
      setCurrentTime(playerRef.current.audio.current.currentTime)
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (playerRef.current?.audio?.current) {
      setDuration(playerRef.current.audio.current.duration)
    }
  }, [])

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume)
    if (playerRef.current?.audio?.current) {
      playerRef.current.audio.current.volume = newVolume
    }
  }, [])

  // Seek to specific time
  const seekTo = useCallback((time) => {
    if (playerRef.current?.audio?.current) {
      playerRef.current.audio.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  // Clear playlist
  const clearPlaylist = useCallback(() => {
    setCurrentSong(null)
    setPlaylist([])
    setCurrentIndex(0)
    setIsPlaying(false)
    localStorage.removeItem('spotifyClonePlayerState')
  }, [])

  const clearCurrentSong = () => {
    setCurrentSong(null)
    setIsPlaying(false)
    setCurrentIndex(-1)
    setPlaylist([])
  }

  const value = {
    // State
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    isShuffled,
    repeatMode,
    volume,
    currentTime,
    duration,
    isLoading,
    playerRef,
    audioKey,

    // Actions
    playSong,
    playFromPlaylist,
    next,
    prev,
    togglePlay,
    jumpForward,
    jumpBackward,
    toggleShuffle,
    toggleRepeat,
    handleVolumeChange,
    clearPlaylist,
    seekTo,
    clearCurrentSong,

    // Audio handlers
    handlePlay,
    handlePause,
    handleEnded,
    handleTimeUpdate,
    handleLoadedMetadata,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
