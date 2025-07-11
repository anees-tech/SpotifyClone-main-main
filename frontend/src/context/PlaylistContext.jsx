"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getPlaylists, getUserPlaylists } from "../services/api"
import { useAuth } from "./AuthContext"

const PlaylistContext = createContext(null)

export const PlaylistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [featuredPlaylists, setFeaturedPlaylists] = useState([])
  const [userPlaylists, setUserPlaylists] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch playlists
  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      const [featured, user] = await Promise.all([
        getPlaylists(),
        isAuthenticated ? getUserPlaylists() : Promise.resolve([])
      ])
      setFeaturedPlaylists(featured)
      setUserPlaylists(user)
    } catch (error) {
      console.error("Error fetching playlists:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [isAuthenticated])

  // Add playlist to user playlists
  const addUserPlaylist = (playlist) => {
    setUserPlaylists(prev => [playlist, ...prev])
  }

  // Update user playlist
  const updateUserPlaylist = (playlistId, updatedPlaylist) => {
    setUserPlaylists(prev => 
      prev.map(p => p._id === playlistId ? updatedPlaylist : p)
    )
  }

  // Remove user playlist
  const removeUserPlaylist = (playlistId) => {
    setUserPlaylists(prev => prev.filter(p => p._id !== playlistId))
  }

  // Get all playlists (featured + user)
  const getAllPlaylists = () => {
    return [...userPlaylists, ...featuredPlaylists]
  }

  return (
    <PlaylistContext.Provider
      value={{
        featuredPlaylists,
        userPlaylists,
        loading,
        fetchPlaylists,
        addUserPlaylist,
        updateUserPlaylist,
        removeUserPlaylist,
        getAllPlaylists,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

export const usePlaylist = () => {
  const context = useContext(PlaylistContext)
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider")
  }
  return context
}