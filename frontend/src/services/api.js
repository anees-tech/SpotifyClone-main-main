import axios from "axios"

const API_URL = "http://localhost:5000/api"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Songs API
export const getSongs = async () => {
  try {
    const userId = localStorage.getItem("userId")
    const response = await api.get("/songs", {
      params: { userId },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching songs:", error)
    throw error
  }
}

export const getSongById = async (songId) => {
  try {
    const userId = localStorage.getItem("userId")
    const response = await api.get(`/songs/${songId}`, {
      params: { userId },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching song ${songId}:`, error)
    throw error
  }
}

// Search API
export const searchSongs = async (query) => {
  try {
    const response = await api.get(`/songs/search`, {
      params: { q: query },
    })
    return response.data
  } catch (error) {
    console.error("Error searching songs:", error)
    return []
  }
}

export const getSongsByCategory = async (category) => {
  try {
    const response = await api.get(`/songs/category/${category}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching songs for category ${category}:`, error)
    return []
  }
}

// Playlists API
export const getPlaylists = async () => {
  try {
    const userId = localStorage.getItem("userId")
    const response = await api.get("/playlists", {
      params: { userId },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching playlists:", error)
    throw error
  }
}

export const getPlaylistById = async (playlistId) => {
  try {
    const response = await api.get(`/playlists/${playlistId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching playlist:", error)
    throw error
  }
}

// User API
export const getUserProfile = async () => {
  try {
    const userId = localStorage.getItem("userId")
    if (!userId) return null

    const response = await api.get(`/auth/user/${userId}`)
    return response.data.user
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }
}

// User Playlists API
export const createUserPlaylist = async (playlistData) => {
  try {
    const userId = localStorage.getItem("userId")
    const formData = new FormData()

    formData.append("name", playlistData.name)
    formData.append("description", playlistData.description)
    formData.append("isPublic", playlistData.isPublic)
    formData.append("songs", JSON.stringify(playlistData.songs))

    if (playlistData.cover) {
      formData.append("cover", playlistData.cover)
    }

    const response = await api.post(`/user/playlists?userId=${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error creating playlist:", error)
    throw error
  }
}

export const updateUserPlaylist = async (playlistId, playlistData) => {
  try {
    const userId = localStorage.getItem("userId")
    const formData = new FormData()

    formData.append("name", playlistData.name)
    formData.append("description", playlistData.description)
    formData.append("isPublic", playlistData.isPublic)
    formData.append("songs", JSON.stringify(playlistData.songs))

    if (playlistData.cover) {
      formData.append("cover", playlistData.cover)
    }

    const response = await api.put(`/user/playlists/${playlistId}?userId=${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error updating playlist:", error)
    throw error
  }
}

export const deleteUserPlaylist = async (playlistId) => {
  try {
    const userId = localStorage.getItem("userId")
    const response = await api.delete(`/user/playlists/${playlistId}?userId=${userId}`)
    return response.data
  } catch (error) {
    console.error("Error deleting playlist:", error)
    throw error
  }
}

export const getUserPlaylists = async () => {
  try {
    const userId = localStorage.getItem("userId")
    const response = await api.get(`/user/playlists?userId=${userId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching user playlists:", error)
    throw error
  }
}

export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const userId = localStorage.getItem("userId")
    const response = await api.post(`/user/playlists/${playlistId}/songs`, {
      songId,
      userId,
    })
    return response.data
  } catch (error) {
    console.error("Error adding song to playlist:", error)
    throw error
  }
}

export const removeSongFromPlaylist = async (playlistId, songId) => {
  try {
    const userId = localStorage.getItem("userId")
    const response = await api.delete(`/user/playlists/${playlistId}/songs/${songId}`, {
      params: { userId },
    })
    return response.data
  } catch (error) {
    console.error("Error removing song from playlist:", error)
    throw error
  }
}

// User Library API (without tokens)
export const addToLibrary = async (songId) => {
  try {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User not logged in');
    }

    const response = await fetch(`${API_URL}/user/library`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ songId, userId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add to library');
    }

    return await response.json();
  } catch (error) {
    console.error('Add to library error:', error);
    throw error;
  }
};

// Remove song from library (without tokens)
export const removeFromLibrary = async (songId) => {
  try {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User not logged in');
    }

    const response = await fetch(`${API_URL}/user/library/${songId}?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove from library');
    }

    return await response.json();
  } catch (error) {
    console.error('Remove from library error:', error);
    throw error;
  }
};

// Get user's library (without tokens)
export const getUserLibrary = async () => {
  try {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User not logged in');
    }

    const response = await fetch(`${API_URL}/user/library?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get library');
    }

    return await response.json();
  } catch (error) {
    console.error('Get library error:', error);
    throw error;
  }
};

// Admin API
export const getAdminDashboard = async () => {
  try {
    const userId = localStorage.getItem("userId")
    const response = await api.get("/admin/dashboard", {
      params: { userId },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching admin dashboard:", error)
    throw error
  }
}

export const getAdminSongs = async () => {
  try {
    const userId = localStorage.getItem("userId")
    const response = await api.get("/admin/songs", {
      params: { userId },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching admin songs:", error)
    throw error
  }
}

export const getAdminPlaylists = async () => {
  try {
    const userId = localStorage.getItem("userId")
    const response = await api.get("/admin/playlists", {
      params: { userId },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching admin playlists:", error)
    throw error
  }
}

export default api
