import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/music/albums")
      .then(({ data }) => setAlbums(data.albums))
      .catch((err) => setError(err.response?.data?.message || "Could not load albums."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout">
      <Navbar />
      <div className="main">
        <h2 className="page-title">Albums</h2>
        <p className="page-subtitle">Browse albums by artist.</p>

        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="list-empty">Loading…</div>}
        {!loading && !error && albums.length === 0 && (
          <div className="list-empty">No albums yet.</div>
        )}

        <div className="card-grid">
          {albums.map((album) => (
            <Link to={`/albums/${album._id}`} className="album-card" key={album._id}>
              <div className="album-art">♪</div>
              <div className="album-title">{album.title}</div>
              <div className="album-sub">{album.artist?.username || "Unknown artist"}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
