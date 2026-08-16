import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function AlbumDetail() {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/music/albums/${albumId}`)
      .then(({ data }) => setAlbum(data.album))
      .catch((err) => setError(err.response?.data?.message || "Could not load album."))
      .finally(() => setLoading(false));
  }, [albumId]);

  return (
    <div className="layout">
      <Navbar />
      <div className="main">
        <Link to="/albums" className="back-link">← Back to albums</Link>

        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="list-empty">Loading…</div>}

        {album && (
          <>
            <h2 className="page-title">{album.title}</h2>
            <p className="page-subtitle">{album.artist?.username || "Unknown artist"}</p>

            {album.musics?.length === 0 && (
              <div className="list-empty">No tracks in this album yet.</div>
            )}

            {album.musics?.map((track, i) => (
              <div className="track-row" key={track._id}>
                <div className="track-index">{i + 1}</div>
                <div className="track-meta">
                  <div className="track-title">{track.title}</div>
                </div>
                <audio controls src={track.uri} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
