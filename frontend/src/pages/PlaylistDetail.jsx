import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useMusic } from "../context/MusicContext";

export default function PlaylistDetail() {
  const { playlistId } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRename, setShowRename] = useState(false);
  const [newPlaylistName, setNewPlaylistName] =
    useState("");

  const {
    playSong,
    currentSong,
    isPlaying,
    pauseSong,
  } = useMusic();

  useEffect(() => {
    api
      .get(`/playlists/${playlistId}`)
      .then(({ data }) => {
        setPlaylist(data.playlist);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Could not load playlist."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [playlistId]);


  async function handleRemoveMusic(musicId) {
    try {
      const { data } = await api.delete(
        "/playlists/remove-music",
        {
          data: {
            playlistId,
            musicId,
          },
        }
      );

      setPlaylist(data.playlist);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not remove music from playlist."
      );
    }
  }

  async function handleRenamePlaylist() {
    const name = newPlaylistName.trim();

    if (!name) {
      return;
    }

    try {
      const { data } = await api.put(
        `/playlists/${playlistId}`,
        {
          name,
        }
      );

      setPlaylist(data.playlist);

      setNewPlaylistName("");
      setShowRename(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not rename playlist."
      );
    }
  }


  return (
    <div className="layout">
      <Navbar />

      <main className="main">


        {loading && (
          <div className="list-empty">
            Loading playlist…
          </div>
        )}

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {!loading && !error && playlist && (
          <>


            <div className="playlist-page-header">

              <div>
                <h2 className="page-title">
                  {playlist.name}
                </h2>

                <p className="page-subtitle">
                  Playlist •{" "}
                  {playlist.musics?.length || 0} songs
                </p>
              </div>

              <button
                className="rename-playlist-btn"
                type="button"
                onClick={() => {
                  setNewPlaylistName(
                    playlist.name
                  );

                  setShowRename(true);
                }}
              >
                ✏️ Rename
              </button>

            </div>


            {playlist.musics?.length === 0 && (
              <div className="playlist-empty">

                <div className="playlist-empty-icon">
                  ♫
                </div>

                <h3>
                  This playlist is empty
                </h3>

                <p>
                  Add songs from the Songs page
                  using the + button.
                </p>

              </div>
            )}


            {playlist.musics?.length > 0 && (
              <div className="playlist-songs">

                {playlist.musics.map(
                  (track, i) => (
                    <div
                      className="playlist-track"
                      key={track._id}
                    >


                      <div className="playlist-track-number">
                        {i + 1}
                      </div>

                      

                      <div className="playlist-track-icon">
                        ♫
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
                                playlist.musics
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
                            handleRemoveMusic(
                              track._id
                            )
                          }
                          title="Remove from playlist"
                        >
                          🗑
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

         

            {showRename && (
  <div className="playlist-modal-overlay">
    <div className="playlist-modal rename-modal">

      <h2>Rename Playlist</h2>

      <p className="rename-subtitle">
        Give your playlist a new name
      </p>

      <div className="rename-input-wrapper">
        <span className="rename-input-icon">
          ♫
        </span>

        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) =>
            setNewPlaylistName(e.target.value)
          }
          placeholder="Enter playlist name"
          autoFocus
        />
      </div>

      <div className="playlist-modal-actions">

        <button
          className="rename-cancel-btn"
          type="button"
          onClick={() => {
            setShowRename(false);
            setNewPlaylistName("");
          }}
        >
          Cancel
        </button>

        <button
          className="rename-save-btn"
          type="button"
          onClick={handleRenamePlaylist}
        >
          Save
        </button>

      </div>

      <p className="rename-hint">
        ⓘ Choose a name that feels right for your playlist
      </p>

    </div>
  </div>
)}

          </>
        )}

      </main>
    </div>
  );
}