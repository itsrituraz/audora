import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");

  const [albumTitle, setAlbumTitle] = useState("");
  const [albumMusicIds, setAlbumMusicIds] = useState("");
  const [albumBusy, setAlbumBusy] = useState(false);
  const [albumError, setAlbumError] = useState("");
  const [albumSuccess, setAlbumSuccess] = useState("");

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    try {
      const { data } = await api.get("/music/albums");
      setAlbums(data.albums || []);
    } catch (err) {
      console.log("Could not fetch albums", err);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!file) {
      setError("Choose an audio file first.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("music", file);
      if (selectedAlbumId) {
        formData.append("albumId", selectedAlbumId);
      }

      const { data } = await api.post("/music/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(`"${data.music.title}" uploaded.`);
      setTitle("");
      setFile(null);
      setSelectedAlbumId("");
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateAlbum(e) {
    e.preventDefault();
    setAlbumError("");
    setAlbumSuccess("");
    setAlbumBusy(true);
    try {
      const musics = albumMusicIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      const { data } = await api.post("/music/album", { title: albumTitle, musics });
      setAlbumSuccess(`Album "${data.album.title}" created.`);
      setAlbumTitle("");
      setAlbumMusicIds("");
      fetchAlbums(); 
    } catch (err) {
      setAlbumError(err.response?.data?.message || "Could not create album.");
    } finally {
      setAlbumBusy(false);
    }
  }

  return (
    <div className="layout">
      <Navbar />
      <div className="main">
        <h2 className="page-title">Upload a song</h2>
        <p className="page-subtitle">MP3 or similar audio file, plus a title.</p>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <form className="upload-form" onSubmit={handleUpload}>
          <div className="field">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label>Audio file</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <div className="field">
            <label>Album (optional)</label>
            <select
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
            >
              <option value="">-- No album --</option>
              {albums.map((album) => (
                <option key={album._id} value={album._id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload song"}
          </button>
        </form>

        <h2 className="page-title" style={{ marginTop: 48 }}>Create an album</h2>
        <p className="page-subtitle">Create an empty album, then upload songs directly into it above.</p>

        {albumError && <div className="error-banner">{albumError}</div>}
        {albumSuccess && <div className="success-banner">{albumSuccess}</div>}

        <form className="upload-form" onSubmit={handleCreateAlbum}>
          <div className="field">
            <label>Album title</label>
            <input type="text" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} required />
          </div>
          <button className="btn" type="submit" disabled={albumBusy}>
            {albumBusy ? "Creating…" : "Create album"}
          </button>
        </form>
      </div>
    </div>
  );
}