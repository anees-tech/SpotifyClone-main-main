"use client"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getSongs, searchSongs } from "../services/api"

const SearchContext = createContext(null)

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState({ songs: [], playlists: [] })
  const [savedSongs, setSavedSongs] = useState([])
  const [allSongs, setAllSongs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch all songs from the database
    const fetchSongs = async () => {
      try {
        setLoading(true)
        const songs = await getSongs()
        setAllSongs(songs)

        // Initialize saved songs (in a real app, this would come from user's saved songs)
        const initialSavedSongs = []
        setSavedSongs(initialSavedSongs)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching songs for search:", error)
        setLoading(false)
      }
    }

    fetchSongs()
  }, [])

  // Use useCallback to memoize the performSearch function
  const performSearch = useCallback(
    async (query) => {
      console.log("Performing search for:", query)

      // If search query is empty, clear results
      if (!query || !query.trim()) {
        setSearchResults({ songs: [], playlists: [] })
        return
      }

      try {
        // Try to search via API first
        const apiResults = await searchSongs(query)
        if (apiResults && apiResults.length > 0) {
          const updatedSongs = apiResults.map((song) => ({
            ...song,
            isSaved: savedSongs.includes(song._id),
          }))
          setSearchResults({
            songs: updatedSongs,
            playlists: [], // We'll add playlists later
          })
          return
        }
      } catch (error) {
        console.warn("API search failed, falling back to local search:", error)
      }

      // Fallback to local search if API fails or returns no results
      if (allSongs.length === 0) {
        setSearchResults({ songs: [], playlists: [] })
        return
      }

      // Filter songs based on search query
      const filteredSongs = allSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(query.toLowerCase()) ||
          song.artist.toLowerCase().includes(query.toLowerCase()) ||
          (song.album && song.album.toLowerCase().includes(query.toLowerCase())) ||
          (song.genre && song.genre.toLowerCase().includes(query.toLowerCase())),
      )

      // Update search results with saved status
      const updatedSongs = filteredSongs.map((song) => ({
        ...song,
        isSaved: savedSongs.includes(song._id),
      }))

      setSearchResults({
        songs: updatedSongs,
        playlists: [], // We'll add playlists later
      })
    },
    [allSongs, savedSongs],
  )

  const addToLibrary = (songId) => {
    setSavedSongs((prev) => {
      const newSavedSongs = [...prev, songId]

      // Update search results to reflect the change
      if (searchResults.songs && searchResults.songs.length > 0) {
        const updatedSongs = searchResults.songs.map((song) =>
          song._id === songId ? { ...song, isSaved: true } : song,
        )
        setSearchResults((prev) => ({ ...prev, songs: updatedSongs }))
      }

      return newSavedSongs
    })
  }

  const removeFromLibrary = (songId) => {
    setSavedSongs((prev) => {
      const newSavedSongs = prev.filter((id) => id !== songId)

      // Update search results to reflect the change
      if (searchResults.songs && searchResults.songs.length > 0) {
        const updatedSongs = searchResults.songs.map((song) =>
          song._id === songId ? { ...song, isSaved: false } : song,
        )
        setSearchResults((prev) => ({ ...prev, songs: updatedSongs }))
      }

      return newSavedSongs
    })
  }

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        performSearch,
        addToLibrary,
        removeFromLibrary,
        allSongs,
        loading,
        savedSongs,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  return useContext(SearchContext)
}
