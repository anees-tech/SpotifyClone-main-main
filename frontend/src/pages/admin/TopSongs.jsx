
import React from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import './TopSongs.css'

const TopSongs = () => {
  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <div className="top-songs-header">
          <h1>Top Songs</h1>
        </div>
      </div>
    </div>
  )
}

export default TopSongs


