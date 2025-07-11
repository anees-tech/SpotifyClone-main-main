"use client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomePage from "./pages/HomePage";
import PlaySongPage from "./pages/PlaySongPage";
import SearchPage from "./pages/SearchPage";
import BrowsePage from "./pages/BrowsePage";
import CategoryPage from "./pages/CategoryPage";
import PlaylistPage from "./pages/PlaylistPage"; // Add this import
import AdminDashboard from "./pages/admin/AdminDashboard";
import SongsManagement from "./pages/admin/SongsManagement";
import PlaylistsManagement from "./pages/admin/PlaylistsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
import { PlayerProvider } from "./context/PlayerContext";
import { BrowseProvider } from "./context/BrowseContext";
import { PlaylistProvider } from "./context/PlaylistContext";
import "./App.css";
import AdminLogin from "./pages/AdminLogin";
import { ImZoomIn } from "react-icons/im";
import TopSongs from "./pages/admin/Topsongs";
import AdminManagement from "./components/admin/AdminManegment";
import Player from "./components/Player";
import LibraryPage from "./pages/LibraryPage";
import BrowseSongsPage from "./pages/BrowseSongsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const UserProtectedRoutes = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

const AdminProtectedRoutes = ({ element }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  if (user && user?.isAdmin) {
    return element;
  } else {
    return <Navigate to="/" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <PlaylistProvider>
          <PlayerProvider>
            <BrowseProvider>
              <Router>
                <div className="App">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/adminLogin" element={<AdminLogin />} />
                    <Route
                      path="/play/:songId"
                      element={<UserProtectedRoutes element={<PlaySongPage />} />}
                    />
                    <Route
                      path="/playlist/:playlistId"
                      element={<UserProtectedRoutes element={<PlaylistPage />} />}
                    />
                    <Route
                      path="/library"
                      element={<UserProtectedRoutes element={<LibraryPage />} />}
                    />
                    <Route
                      path="/search"
                      element={<UserProtectedRoutes element={<SearchPage />} />}
                    />
                    <Route
                      path="/browse"
                      element={<UserProtectedRoutes element={<BrowsePage />} />}
                    />
                    <Route
                      path="/category/:categoryId"
                      element={<UserProtectedRoutes element={<CategoryPage />} />}
                    />
                    <Route
                      path="/browse-songs"
                      element={<BrowseSongsPage />}
                    />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPasswordPage />}
                    />
                    {/* Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminProtectedRoutes element={<AdminDashboard />} />
                      }
                    />
                    <Route
                      path="/admin/songs"
                      element={
                        <AdminProtectedRoutes element={<SongsManagement />} />
                      }
                    />
                    <Route
                      path="/admin/playlists"
                      element={
                        <AdminProtectedRoutes element={<PlaylistsManagement />} />
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <AdminProtectedRoutes element={<UsersManagement />} />
                      }
                    />
                    <Route
                      path="/admin/admins"
                      element={
                        <AdminProtectedRoutes element={<AdminManagement />} />
                      }
                    />
                  </Routes>
                  <Player />
                </div>
              </Router>
            </BrowseProvider>
          </PlayerProvider>
        </PlaylistProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
