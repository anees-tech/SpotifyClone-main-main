// A service to handle audio playback across the application
class AudioService {
  constructor() {
    this.audio = new Audio()
    this.currentSong = null
    this.playlist = []
    this.allSongs = [] // New: Store all available songs
    this.currentIndex = -1
    this.isPlaying = false
    this.volume = 0.7
    this.isShuffled = false
    this.originalPlaylist = [] // Store original order for shuffle toggle
    this.listeners = {
      play: [],
      pause: [],
      next: [],
      prev: [],
      timeUpdate: [],
      songChange: [],
      volumeChange: [],
      playlistChange: [],
    }

    // Set up event listeners
    this.audio.addEventListener("timeupdate", () => this.notifyListeners("timeUpdate"))
    this.audio.addEventListener("ended", () => this.next())
    this.audio.addEventListener("play", () => {
      this.isPlaying = true
      this.notifyListeners("play")
    })
    this.audio.addEventListener("pause", () => {
      this.isPlaying = false
      this.notifyListeners("pause")
    })
  }

  // Add a listener for a specific event
  addListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback)
      return () => this.removeListener(event, callback)
    }
    return () => {}
  }

  // Remove a listener
  removeListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }
  }

  // Notify all listeners of an event
  notifyListeners(event) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback())
    }
  }

  // Set all available songs
  setAllSongs(songs) {
    this.allSongs = [...songs]
    if (this.playlist.length === 0) {
      this.playlist = [...songs]
      this.originalPlaylist = [...songs]
    }
  }

  // Play a specific song and use all songs as playlist if no playlist is set
  playSong(song) {
    if (!song) return

    // If no playlist is set, use all songs
    if (this.playlist.length === 0 && this.allSongs.length > 0) {
      this.playlist = [...this.allSongs]
      this.originalPlaylist = [...this.allSongs]
    }

    // Find song index in current playlist
    this.currentIndex = this.playlist.findIndex(s => s._id === song._id)
    
    // If song not found in playlist, add all songs to playlist
    if (this.currentIndex === -1 && this.allSongs.length > 0) {
      this.playlist = [...this.allSongs]
      this.originalPlaylist = [...this.allSongs]
      this.currentIndex = this.playlist.findIndex(s => s._id === song._id)
    }

    // If we're playing a new song
    if (!this.currentSong || this.currentSong._id !== song._id) {
      this.currentSong = song
      this.audio.src = `http://localhost:5000/${song.audioUrl}` || "https://example.com/placeholder-audio.mp3"
      this.notifyListeners("songChange")
      console.log("Playing new song:", song.audioUrl)
    }

    this.audio.play().catch((error) => {
      console.error("Error playing audio:", error)
    })
  }

  // Play a song from a playlist
  playFromPlaylist(songs, index = 0) {
    if (!songs || !songs.length) return

    this.playlist = [...songs]
    this.originalPlaylist = [...songs]
    this.currentIndex = index
    const song = this.playlist[this.currentIndex]

    if (song) {
      this.playSong(song)
    }
    
    this.notifyListeners("playlistChange")
  }

  // Pause the current song
  pause() {
    this.audio.pause()
  }

  // Toggle play/pause
  togglePlay() {
    if (this.isPlaying) {
      this.pause()
    } else if (this.currentSong) {
      this.playSong(this.currentSong)
    }
  }

  // Play the next song in the playlist
  next() {
    if (!this.playlist || this.playlist.length === 0) {
      // If no playlist, use all songs
      if (this.allSongs.length > 0) {
        this.playlist = [...this.allSongs]
        this.originalPlaylist = [...this.allSongs]
        this.currentIndex = 0
      } else {
        return
      }
    }

    this.currentIndex = (this.currentIndex + 1) % this.playlist.length
    const nextSong = this.playlist[this.currentIndex]

    if (nextSong) {
      this.playSong(nextSong)
      this.notifyListeners("next")
    }
  }

  // Play the previous song in the playlist
  prev() {
    if (!this.playlist || this.playlist.length === 0) {
      // If no playlist, use all songs
      if (this.allSongs.length > 0) {
        this.playlist = [...this.allSongs]
        this.originalPlaylist = [...this.allSongs]
        this.currentIndex = this.allSongs.length - 1
      } else {
        return
      }
    }

    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length
    const prevSong = this.playlist[this.currentIndex]

    if (prevSong) {
      this.playSong(prevSong)
      this.notifyListeners("prev")
    }
  }

  // Skip to specific track
  skipToTrack(index) {
    if (!this.playlist || index < 0 || index >= this.playlist.length) return

    this.currentIndex = index
    const song = this.playlist[index]
    
    if (song) {
      this.playSong(song)
    }
  }

  // Toggle shuffle
  toggleShuffle() {
    this.isShuffled = !this.isShuffled
    
    if (this.isShuffled) {
      // Shuffle the playlist
      const currentSong = this.currentSong
      const shuffled = [...this.playlist]
      
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      
      this.playlist = shuffled
      this.currentIndex = this.playlist.findIndex(s => s._id === currentSong._id)
    } else {
      // Restore original order
      this.playlist = [...this.originalPlaylist]
      this.currentIndex = this.playlist.findIndex(s => s._id === this.currentSong._id)
    }
    
    this.notifyListeners("playlistChange")
  }

  // Get current playlist info
  getPlaylistInfo() {
    return {
      playlist: this.playlist,
      currentIndex: this.currentIndex,
      total: this.playlist.length,
      isShuffled: this.isShuffled
    }
  }

  // Set the current time of the audio
  setCurrentTime(time) {
    if (this.audio) {
      this.audio.currentTime = time
    }
  }

  // Get the current time of the audio
  getCurrentTime() {
    return this.audio ? this.audio.currentTime : 0
  }

  // Get the duration of the audio
  getDuration() {
    return this.audio ? this.audio.duration || 0 : 0
  }

  // Set the volume (0-1)
  setVolume(volume) {
    this.volume = volume
    if (this.audio) {
      this.audio.volume = volume
    }
    this.notifyListeners("volumeChange")
  }

  // Get the current volume
  getVolume() {
    return this.volume
  }

  // Get the current song
  getCurrentSong() {
    return this.currentSong
  }

  // Check if audio is playing
  getIsPlaying() {
    return this.isPlaying
  }
}

// Create and export a singleton instance
const audioService = new AudioService()
export default audioService
