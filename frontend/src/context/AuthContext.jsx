"use client";
import React from "react"

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via stored user ID
    const checkAuthStatus = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Get user data from localStorage instead of making an API call
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          // If userData is not in localStorage, fetch it once
          const response = await axios.get(
            `http://localhost:5000/api/auth/user/${userId}`
          );
          if (response.data.user) {
            setIsAuthenticated(true);
            setUser(response.data.user);
            // Store user data in localStorage
            localStorage.setItem(
              "userData",
              JSON.stringify(response.data.user)
            );
          }
        }
      } catch (error) {
        console.error("Not authenticated:", error);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("userId");
        localStorage.removeItem("userData");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (response.data.user && response.data.token) {
        // Save user ID and data to localStorage
        localStorage.setItem("userId", response.data.user.id);
        localStorage.setItem("userData", JSON.stringify(response.data.user));

        setIsAuthenticated(true);
        setUser(response.data.user);

        return { success: true, user: response.data.user, isAdmin: response.data.user.isAdmin };
      }
      return { success: false, message: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    localStorage.removeItem("spotifyClonePlayerState"); // Clear player state too
    localStorage.removeItem("recentlyPlayed");

    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        handleLogin,
        handleLogout, // Make sure this is exported
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
