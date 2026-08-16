import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useMusic } from "../context/MusicContext";

export default function Home() {
  const { user } = useAuth();

  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myMusics, setMyMusics] = useState([]);
  const [myMusicLoading, setMyMusicLoading] = useState(false);

  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);

  const [likedSongs,setLikedSongs] = useState([]);

  const {
    playSong,
    currentSong,
    isPlaying,
    pauseSong,
  } = useMusic();

  useEffect(() => {
    api
      .get("/music/")
      .then(({ data }) => {
        setMusics(data.musics);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Could not load songs."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
  if (!user) return;

  api
    .get("/music/liked")
    .then(({ data }) => {
      setLikedSongs(
        data.musics.map((music) => music._id)
      );
    })
    .catch((err) => {
      console.log(
        err.response?.data?.message ||
          "Could not load liked songs."
      );
    });
}, [user]);

  useEffect(() => {
    if (user?.role !== "artist") return;

    setMyMusicLoading(true);

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
        setMyMusicLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    api
      .get("/playlists/")
      .then(({ data }) => {
        setPlaylists(data.playlists);
      })
      .catch((err) => {
        console.log(
          err.response?.data?.message ||
            "Could not load playlists."
        );
      });
  }, [user]);

  async function handleAddToPlaylist(
    playlistId,
    musicId
  ) {
    try {
      await api.post("/playlists/add-music", {
        playlistId,
        musicId,
      });

      setShowPlaylistMenu(null);

      console.log("Music added to playlist");
    } catch (err) {
      console.log(
        err.response?.data?.message ||
          "Could not add music to playlist."
      );
    }
  }

  async function handleLikeToggle(musicId) {
  const isLiked = likedSongs.includes(musicId);

  try {
    if (isLiked) {
      await api.delete(`/music/like/${musicId}`);

      setLikedSongs((prev) =>
        prev.filter((id) => id !== musicId)
      );
    } else {
      await api.post("/music/like", {
        musicId,
      });

      setLikedSongs((prev) => [
        ...prev,
        musicId,
      ]);
    }
  } catch (err) {
    console.log(
      err.response?.data?.message ||
        "Could not update liked song."
    );
  }
}

  return (
    <div className="layout">
      <Navbar />

      <div className="main">
        <h2 className="page-title">
          Songs
        </h2>

        <p className="page-subtitle">
          Everything uploaded by artists on the
          platform.
        </p>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {loading && (
          <div className="list-empty">
            Loading…
          </div>
        )}

        {!loading &&
          !error &&
          musics.length === 0 && (
            <div className="list-empty">
              No songs yet. Check back once an
              artist uploads one.
            </div>
          )}

     
        {!loading &&
          musics.map((track, i) => (
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
                  {track.artist?.username ||
                    "Unknown artist"}
                </div>
              </div>

              <button
                className="track-play-btn"
                onClick={() => {
                  if (
                    currentSong?._id ===
                      track._id &&
                    isPlaying
                  ) {
                    pauseSong();
                  } else {
                    playSong(track, musics);
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
                className="track-play-btn"
                onClick={() => {
                  setShowPlaylistMenu(
                    showPlaylistMenu ===
                      track._id
                      ? null
                      : track._id
                  );
                }}
              >
                +
              </button>

              <button
  className={`like-btn ${
    likedSongs.includes(track._id)
      ? "liked"
      : ""
  }`}
  type="button"
  onClick={() =>
    handleLikeToggle(track._id)
  }
>
  {likedSongs.includes(track._id)
    ? "♥"
    : "♡"}
</button>

              {showPlaylistMenu ===
                track._id && (
                <div className="playlist-menu">
                  <div className="playlist-menu-title">
                    Add to playlist
                  </div>

                  {playlists.length === 0 ? (
                    <div className="playlist-menu-empty">
                      No playlists yet.
                    </div>
                  ) : (
                    playlists.map(
                      (playlist) => (
                        <button
                          key={
                            playlist._id
                          }
                          className="playlist-menu-item"
                          onClick={() =>
                            handleAddToPlaylist(
                              playlist._id,
                              track._id
                            )
                          }
                        >
                          🎵{" "}
                          {playlist.name}
                        </button>
                      )
                    )
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}