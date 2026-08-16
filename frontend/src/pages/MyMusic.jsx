import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useMusic } from "../context/MusicContext";

export default function MyMusic() {
  const [myMusics, setMyMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    playSong,
    currentSong,
    isPlaying,
    pauseSong,
  } = useMusic();

  useEffect(() => {
    api
      .get("/music/my")
      .then(({ data }) => {
        setMyMusics(data.musics);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Could not load your music."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="layout">
      <Navbar />

      <div className="main">
        <h2 className="page-title">Your Music</h2>

        <p className="page-subtitle">
          Music uploaded by you.
        </p>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {loading && (
          <div className="list-empty">
            Loading your music…
          </div>
        )}

        {!loading &&
          !error &&
          myMusics.length === 0 && (
            <div className="list-empty">
              You haven't uploaded any music yet.
            </div>
          )}

        {!loading &&
          !error &&
          myMusics.map((track, i) => (
            <div
              className="track-row"
              key={track._id}
            >
              <div className="track-index">
                {i + 1}
              </div>

              <div className="track-meta">
                <div className="track-title">
                  {track.title}
                </div>

                <div className="track-artist">
                  You
                </div>
              </div>

              <button
                className="track-play-btn"
                onClick={() => {
                  if (
                    currentSong?._id === track._id &&
                    isPlaying
                  ) {
                    pauseSong();
                  } else {
                    playSong(track, myMusics);
                  }
                }}
              >
                {currentSong?._id === track._id &&
                isPlaying
                  ? "❚❚"
                  : "▶"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}