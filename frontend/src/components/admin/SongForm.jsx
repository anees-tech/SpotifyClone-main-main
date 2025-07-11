"use client";

import { useState, useEffect } from "react";
import "../../styles/admin/SongForm.css";

function SongForm({ song, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    
   // date: "",
    
    genre: "",
    releaseYear: "",
   
   
    cover: null,
    audio: null,
  });
  const [coverPreview, setCoverPreview] = useState("");
  const [audioName, setAudioName] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title || "",
        artist: song.artist || "",
        album: song.album || "",
     //   date: song. date || "",
        genre: song.genre || "",
       
        cover: null, // We don't set the actual file here, just show the preview
        audio: null, // We don't set the actual file here, just show the name
      });
      setCoverPreview(
        song.coverUrl ? `http://localhost:5000${song.coverUrl}` : ""
      );
      setAudioName(song.audioUrl ? song.audioUrl.split("/").pop() : "");
    }
  }, [song]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (files.length === 0) return;

    const file = files[0];

    setFormData({
      ...formData,
      [name]: file,
    });

    if (name === "cover") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else if (name === "audio") {
      setAudioName(file.name);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.artist.trim()) newErrors.artist = "Artist is required";
    if (!formData.album.trim()) newErrors.album = "Album is required";
    if (!formData.genre.trim()) newErrors.genre = "Genre is required";

    if (
      formData.releaseYear &&
      (isNaN(formData.releaseYear) ||
        formData.releaseYear < 1900 ||
        formData.releaseYear > new Date().getFullYear())
    ) {
      newErrors.releaseYear = "Enter a valid year";
    }

    // Only require cover and audio for new songs, not when editing
    if (!song) {
      if (!formData.cover) {
        newErrors.cover = "Cover image is required";
      }

      if (!formData.audio) {
        newErrors.audio = "Audio file is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="song-form-container">
      <h2>{song ? "Edit Song" : "Add New Song"}</h2>

      <form className="song-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? "error" : ""}
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input
            type="text"
            id="artist"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            className={errors.artist ? "error" : ""}
          />
          {errors.artist && (
            <span className="error-message">{errors.artist}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="album">Album</label>
          <input
            type="text"
            id="album"
            name="album"
            value={formData.album}
            onChange={handleChange}
            className={errors.album ? "error" : ""}
          />
          {errors.album && (
            <span className="error-message">{errors.album}</span>
          )}
        </div>

      
          

          <div className="form-group">
            <label htmlFor="releaseYear">Release Year</label>
            <input
              type="number"
              id="releaseYear"
              name="releaseYear"
              value={formData.releaseYear}
              onChange={handleChange}
              className={errors.releaseYear ? "error" : ""}
            />
            {errors.releaseYear && (
              <span className="error-message">{errors.releaseYear}</span>
            )}
          </div>


       

     

        <div className="form-group">
          <label htmlFor="genre">Genre</label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className={errors.genre ? "error" : ""}
          >
            <option value="">Select Genre</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Hip-Hop">Hip-Hop</option>
            <option value="R&B">R&B</option>
            <option value="Electronic">Electronic</option>
            <option value="Jazz">Jazz</option>
            <option value="Classical">Classical</option>
            <option value="Country">Country</option>
            <option value="Folk">Folk</option>
            <option value="Indie">Indie</option>
            <option value="Metal">Metal</option>
            <option value="Blues">Blues</option>
            <option value="Reggae">Reggae</option>
            <option value="Other">Other</option>
          </select>
          {errors.genre && (
            <span className="error-message">{errors.genre}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cover">Cover Image</label>
          <div className="file-input-container">
            <input
              type="file"
              id="cover"
              name="cover"
              accept="image/*"
              onChange={handleFileChange}
              className={errors.cover ? "error" : ""}
            />
            <label htmlFor="cover" className="file-input-label">
              {coverPreview ? "Change Image" : "Choose Image"}
            </label>
          </div>
          {errors.cover && (
            <span className="error-message">{errors.cover}</span>
          )}

          {coverPreview && (
            <div className="image-preview">
              <img
                src={coverPreview || "/placeholder.svg"}
                alt="Cover Preview"
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="audio">Audio File</label>
          <div className="file-input-container">
            <input
              type="file"
              id="audio"
              name="audio"
              accept="audio/*"
              onChange={handleFileChange}
              className={errors.audio ? "error" : ""}
            />
            <label htmlFor="audio" className="file-input-label">
              {audioName ? "Change Audio" : "Choose Audio"}
            </label>
          </div>
          {errors.audio && (
            <span className="error-message">{errors.audio}</span>
          )}

          {audioName && (
            <div className="audio-preview">
              <i className="fas fa-music"></i>
              <span>{audioName}</span>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button">
            {song ? "Update Song" : "Add Song"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SongForm;




// changing to add field in add new song

//song form 3 jgo p 
//song management me 1 jga p (array)or agr song k neechay  to 2 jago pr
//song js mai 1 jaga pr 
//admin routes mai 4 jago pr[ update a song or creat new song]
//or agr admin dashboard mai recent songs mai to admin dashboard(2) jaga pr 







