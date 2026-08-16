import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function MyAlbums() {
  const [albums, setAlbums] = useState([]);
  const [myMusics, setMyMusics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [musicLoading, setMusicLoading] = useState(false);

  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [albumTitle, setAlbumTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const [selectedAlbum, setSelectedAlbum] =
    useState(null);

  const [addingMusic, setAddingMusic] =
    useState(false);

  const [editingAlbum, setEditingAlbum] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [updating, setUpdating] = useState(false);  

  useEffect(() => {
    api
      .get("/music/my-albums")
      .then(({ data }) => {
        setAlbums(data.albums);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Could not load your albums."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function loadMyMusics() {
    try {
      setMusicLoading(true);
      setError("");

      const { data } = await api.get("/music/my");

      setMyMusics(data.musics);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your music."
      );
    } finally {
      setMusicLoading(false);
    }
  }

  async function handleCreateAlbum() {
    if (!albumTitle.trim()) return;

    try {
      setCreating(true);
      setError("");

      const { data } = await api.post("/music/album", {
        title: albumTitle.trim(),
        musics: [],
      });

      setAlbums((prev) => [...prev, data.album]);

      setAlbumTitle("");
      setShowCreateForm(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create album."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleOpenAddMusic(album) {
    setSelectedAlbum(album);

    await loadMyMusics();
  }

  async function handleAddMusic(musicId) {
    if (!selectedAlbum) return;

    try {
      setAddingMusic(true);
      setError("");

      const { data } = await api.post(
        "/music/album/add-music",
        {
          albumId: selectedAlbum._id,
          musicId: musicId,
        }
      );

      setSelectedAlbum(data.album);

      setAlbums((prev) =>
        prev.map((album) =>
          album._id === data.album._id
            ? data.album
            : album
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not add music to album."
      );
    } finally {
      setAddingMusic(false);
    }
  }

  async function handleRemoveMusic(musicId) {
  if (!selectedAlbum) return;

  try {
    setError("");

    const { data } = await api.delete(
      "/music/album/delete-music",
      {
        data: {
          albumId: selectedAlbum._id,
          musicId: musicId,
        },
      }
    );

    setSelectedAlbum(data.album);

    setAlbums((prev) =>
      prev.map((album) =>
        album._id === data.album._id
          ? data.album
          : album
      )
    );
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Could not remove music from album."
    );
  }
}

  async function handleDeleteAlbum(albumId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this album?"
  );

  if (!confirmed) return;

  try {
    setError("");

    await api.delete(
      `/music/albums/${albumId}`
    );

    setAlbums((prev) =>
      prev.filter(
        (album) => album._id !== albumId
      )
    );

    if (selectedAlbum?._id === albumId) {
      setSelectedAlbum(null);
    }
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Could not delete album."
    );
  }
}

  async function handleUpdateAlbum() {
  if (!editingAlbum || !editTitle.trim()) return;

  try {
    setUpdating(true);
    setError("");

    const { data } = await api.put(
      `/music/albums/${editingAlbum._id}`,
      {
        title: editTitle.trim(),
      }
    );

    setAlbums((prev) =>
      prev.map((album) =>
        album._id === data.album._id
          ? data.album
          : album
      )
    );

    setEditingAlbum(null);
    setEditTitle("");
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Could not update album."
    );
  } finally {
    setUpdating(false);
  }
}

  return (
    <div className="layout">
      <Navbar />

      <div className="main">
        <h2 className="page-title">
          Your Albums
        </h2>

        <p className="page-subtitle">
          Albums created by you.
        </p>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <button
          className="btn"
          style={{
            maxWidth: "180px",
            marginBottom: "24px",
          }}
          onClick={() =>
            setShowCreateForm(!showCreateForm)
          }
        >
          {showCreateForm
            ? "Cancel"
            : "+ Create Album"}
        </button>

        {showCreateForm && (
          <div
            className="auth-card"
            style={{
              marginBottom: "24px",
              maxWidth: "420px",
            }}
          >
            <div className="field">
              <label>Album title</label>

              <input
                type="text"
                placeholder="Enter album title"
                value={albumTitle}
                onChange={(e) =>
                  setAlbumTitle(e.target.value)
                }
              />
            </div>

            <button
              className="btn"
              disabled={
                creating || !albumTitle.trim()
              }
              onClick={handleCreateAlbum}
            >
              {creating
                ? "Creating..."
                : "Create Album"}
            </button>
          </div>
        )}

        {loading && (
          <div className="list-empty">
            Loading your albums…
          </div>
        )}

        {!loading &&
          !error &&
          albums.length === 0 && (
            <div className="list-empty">
              You haven't created any albums yet.
            </div>
          )}

        {!loading &&
          albums.length > 0 && (
            <div className="card-grid">
              {albums.map((album) => (
                <div
                  className="album-card"
                  key={album._id}
                >
                  <div className="album-art">
                    ♫
                  </div>

                  <div className="album-title">
                    {album.title}
                  </div>

                  <div className="album-sub">
                    {album.musics?.length || 0} songs
                  </div>

                  <button
                    className="btn"
                    style={{
                      marginTop: "12px",
                    }}
                    onClick={() =>
                      handleOpenAddMusic(album)
                    }
                  >
                    + Add Song
                  </button>

                  <button
                    className="btn btn-secondary"
                    style={{
                      marginTop: "8px",
                    }}
                    onClick={() => {
                      setEditingAlbum(album);
                      setEditTitle(album.title);
                    }}
                  >
                    Edit
                  </button>


                  <button
                    className="btn btn-secondary"
                    style={{
                      marginTop: "8px",
                      color: "var(--danger)",
                    }}
                    onClick={() => 
                      handleDeleteAlbum(album._id)
                    }
                  >
                    Delete
                  </button>

                </div>
              ))}
            </div>
          )}

        {editingAlbum && (
  <div
    className="auth-card"
    style={{
      marginTop: "30px",
      maxWidth: "420px",
    }}
  >
    <h3>Edit Album</h3>

    <div className="field">
      <label>Album title</label>

      <input
        type="text"
        value={editTitle}
        onChange={(e) =>
          setEditTitle(e.target.value)
        }
      />
    </div>

    <button
      className="btn"
      disabled={
        updating || !editTitle.trim()
      }
      onClick={handleUpdateAlbum}
    >
      {updating
        ? "Updating..."
        : "Save Changes"}
    </button>

    <button
      className="btn btn-secondary"
      style={{ marginTop: "8px" }}
      onClick={() => {
        setEditingAlbum(null);
        setEditTitle("");
      }}
    >
      Cancel
    </button>
  </div>
)}  

        {selectedAlbum && (
          <div
            className="auth-card"
            style={{
              marginTop: "30px",
              maxWidth: "500px",
            }}
          >
            <h3>
              Add Song to "{selectedAlbum.title}"
            </h3>

            {selectedAlbum.musics?.length === 0 && (
              <div className="list-empty">
                No songs in this album.
               </div> 
            )}

            {selectedAlbum.musics?.map((music) => (
              <div
                className="track-row"
                key={music._id}
              >
                <div className="track-meta">
                  <div className="track-title">
                    {music.title}
                  </div>
                  <div className="track-artist">
                    you
                  </div>
              </div>

              <button
          className="btn btn-secondary"
          style={{
            width: "auto",
            padding: "8px 14px",
            color: "var(--danger)",
          }}
          onClick={() =>
            handleRemoveMusic(music._id)
          }
        >
          Remove
        </button>
      </div>
    ))}

    <hr
      style={{
        borderColor: "var(--border)",
        margin: "24px 0",
      }}
    />

    <h3>
      Add Song to "{selectedAlbum.title}"
    </h3>

            <button
              className="btn btn-secondary"
              style={{
                marginBottom: "20px",
              }}
              onClick={() =>
                setSelectedAlbum(null)
              }
            >
              Close
            </button>

            {musicLoading && (
              <div className="list-empty">
                Loading your music…
              </div>
            )}

            {!musicLoading &&
              myMusics.length === 0 && (
                <div className="list-empty">
                  You haven't uploaded any music yet.
                </div>
              )}

            {!musicLoading &&
              myMusics.map((music) => {
                const alreadyAdded =
                  selectedAlbum.musics?.some(
                    (item) =>
                      (item._id || item) ===
                      music._id
                  );

                return (
                  <div
                    className="track-row"
                    key={music._id}
                  >
                    <div className="track-meta">
                      <div className="track-title">
                        {music.title}
                      </div>

                      <div className="track-artist">
                        You
                      </div>
                    </div>

                    <button
                      className="btn"
                      style={{
                        width: "auto",
                        padding: "8px 14px",
                      }}
                      disabled={
                        alreadyAdded || addingMusic
                      }
                      onClick={() =>
                        handleAddMusic(
                          music._id
                        )
                      }
                    >
                      {alreadyAdded
                        ? "Added"
                        : addingMusic
                        ? "Adding..."
                        : "Add"}
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}