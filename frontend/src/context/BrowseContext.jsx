"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useSearch } from "./SearchContext"

const BrowseContext = createContext()

export const useBrowse = () => {
  const context = useContext(BrowseContext)
  if (!context) {
    throw new Error("useBrowse must be used within a BrowseProvider")
  }
  return context
}

export const BrowseProvider = ({ children }) => {
  const { allSongs } = useSearch()
  const [categories, setCategories] = useState([])
  const [featuredPlaylists, setFeaturedPlaylists] = useState([])

  // Define categories with colors
  const defaultCategories = [
    { id: "pop", name: "Pop", color: "#1DB954" },
    { id: "hiphop", name: "Hip-Hop", color: "#FF5733" },
    { id: "rock", name: "Rock", color: "#C70039" },
    { id: "electronic", name: "Electronic", color: "#900C3F" },
    { id: "jazz", name: "Jazz", color: "#581845" },
    { id: "rnb", name: "R&B", color: "#FFC300" },
    { id: "classical", name: "Classical", color: "#2E86C1" },
    { id: "country", name: "Country", color: "#27AE60" },
    { id: "reggae", name: "Reggae", color: "#E74C3C" },
    { id: "blues", name: "Blues", color: "#8E44AD" },
    { id: "folk", name: "Folk", color: "#D35400" },
    { id: "indie", name: "Indie", color: "#16A085" },
  ]

  // Initialize categories and playlists
  useEffect(() => {
    setCategories(defaultCategories)

    // Create featured playlists from available songs
    if (allSongs.length > 0) {
      const playlists = [
        {
          id: "trending",
          name: "Trending Now",
          description: "The hottest tracks right now",
          coverUrl: "/placeholder.svg?height=200&width=200",
          songs: allSongs.slice(0, 20),
        },
        {
          id: "top-hits",
          name: "Top Hits",
          description: "The biggest hits of the year",
          coverUrl: "/placeholder.svg?height=200&width=200",
          songs: allSongs.slice(5, 25),
        },
        {
          id: "new-releases",
          name: "New Releases",
          description: "Fresh music for your ears",
          coverUrl: "/placeholder.svg?height=200&width=200",
          songs: allSongs.slice(10, 30),
        },
        {
          id: "chill-vibes",
          name: "Chill Vibes",
          description: "Relax and unwind",
          coverUrl: "/placeholder.svg?height=200&width=200",
          songs: allSongs
            .filter(
              (song) =>
                song.genre?.toLowerCase().includes("jazz") ||
                song.genre?.toLowerCase().includes("chill") ||
                song.genre?.toLowerCase().includes("ambient"),
            )
            .slice(0, 15),
        },
      ]
      setFeaturedPlaylists(playlists)
    }
  }, [allSongs])

  // Get category by ID
  const getCategoryById = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId)
  }

  // Browse songs by category
  const browseByCategory = (categoryId) => {
    if (!allSongs || allSongs.length === 0) return []

    const categoryName = categoryId.toLowerCase()

    // Filter songs by genre/category
    let categorySongs = allSongs.filter((song) => {
      if (!song.genre) return false

      const songGenre = song.genre.toLowerCase()

      // Flexible matching for different genre variations
      switch (categoryName) {
        case "pop":
          return songGenre.includes("pop")
        case "hiphop":
          return songGenre.includes("hip") || songGenre.includes("rap") || songGenre.includes("hip-hop")
        case "rock":
          return songGenre.includes("rock")
        case "electronic":
          return (
            songGenre.includes("electronic") ||
            songGenre.includes("edm") ||
            songGenre.includes("techno") ||
            songGenre.includes("house")
          )
        case "jazz":
          return songGenre.includes("jazz")
        case "rnb":
          return songGenre.includes("r&b") || songGenre.includes("rnb") || songGenre.includes("soul")
        case "classical":
          return songGenre.includes("classical") || songGenre.includes("orchestra")
        case "country":
          return songGenre.includes("country")
        case "reggae":
          return songGenre.includes("reggae")
        case "blues":
          return songGenre.includes("blues")
        case "folk":
          return songGenre.includes("folk") || songGenre.includes("acoustic")
        case "indie":
          return songGenre.includes("indie") || songGenre.includes("alternative")
        default:
          return songGenre.includes(categoryName)
      }
    })

    // If no songs found for specific genre, return a random selection
    if (categorySongs.length === 0) {
      categorySongs = allSongs.sort(() => Math.random() - 0.5).slice(0, 10)
    }

    return categorySongs
  }

  // Get featured playlists
  const getFeaturedPlaylists = () => {
    return featuredPlaylists
  }

  // Get playlist by ID
  const getPlaylistById = (playlistId) => {
    return featuredPlaylists.find((playlist) => playlist.id === playlistId)
  }

  // Search within category
  const searchInCategory = (categoryId, query) => {
    const categorySongs = browseByCategory(categoryId)

    if (!query) return categorySongs

    const searchTerm = query.toLowerCase()
    return categorySongs.filter(
      (song) =>
        song.title?.toLowerCase().includes(searchTerm) ||
        song.artist?.toLowerCase().includes(searchTerm) ||
        song.album?.toLowerCase().includes(searchTerm),
    )
  }

  const value = {
    categories,
    featuredPlaylists,
    getCategoryById,
    browseByCategory,
    getFeaturedPlaylists,
    getPlaylistById,
    searchInCategory,
  }

  return <BrowseContext.Provider value={value}>{children}</BrowseContext.Provider>
}
