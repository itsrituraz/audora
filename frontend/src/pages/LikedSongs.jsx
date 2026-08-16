import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useMusic } from "../context/MusicContext";

export default function LikedSongs() {
  const [musics, setMusics] = useState([]);
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
      .get("/music/liked")
      .then(({ data }) => {
        setMusics(data.musics);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Could not load liked songs."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function handleUnlike(musicId) {
    try {
      await api.delete(
        `/music/like/${musicId}`
      );

      setMusics((prev) =>
        prev.filter(
          (music) => music._id !== musicId
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not unlike song."
      );
    }
  }

  return (
    <div className="layout">
      <Navbar />

      <main className="main">

        <h2 className="page-title">
          Liked Songs
        </h2>

        <p className="page-subtitle">
          Songs you liked.
        </p>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {loading && (
          <div className="list-empty">
            Loading liked songs…
          </div>
        )}

        {!loading &&
          !error &&
          musics.length === 0 && (
            <div className="playlist-empty">
              <div className="playlist-empty-icon">
                ♥
              </div>

              <h3>
                No liked songs yet
              </h3>

              <p>
                Like songs from the Songs page
                and they'll appear here.
              </p>
            </div>
          )}

        {!loading &&
          musics.length > 0 && (
            <div className="playlist-songs">

              {musics.map((track, i) => (
                <div
                  className="playlist-track"
                  key={track._id}
                >

                  <div className="playlist-track-number">
                    {i + 1}
                  </div>

                  <div className="playlist-track-icon liked-song-icon">
                    ♥
                  </div>

                  <div className="playlist-track-info">

                    <div className="playlist-track-title">
                      {track.title}
                    </div>

                    <div className="playlist-track-artist">
                      {track.artist?.username ||
                        "Unknown artist"}
                    </div>

                  </div>

                  <div className="playlist-track-actions">

                    <button
                      className="playlist-action-btn play"
                      type="button"
                      onClick={() => {
                        if (
                          currentSong?._id ===
                            track._id &&
                          isPlaying
                        ) {
                          pauseSong();
                        } else {
                          playSong(
                            track,
                            musics
                          );
                        }
                      }}
                    >
                      {currentSong?._id ===
                        track._id &&
                      isPlaying
                        ? "❚❚"
                        : "▶"}
                    </button>

                    <button
                      className="playlist-action-btn delete"
                      type="button"
                      onClick={() =>
                        handleUnlike(
                          track._id
                        )
                      }
                      title="Unlike"
                    >
                      ♥
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

      </main>
    </div>
  );
}