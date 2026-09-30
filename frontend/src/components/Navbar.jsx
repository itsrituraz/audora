import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";


export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [playlists, setPlaylists] = useState([]);
  const [showCreatePlaylist, setShowCreatePlaylist] =
    useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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

  async function handleCreatePlaylist() {
    if (!playlistName.trim()) return;

    try {
      const { data } = await api.post("/playlists/", {
        name: playlistName.trim(),
      });

      setPlaylists((prev) => [
        ...prev,
        data.playlist,
      ]);

      setPlaylistName("");
      setShowCreatePlaylist(false);
    } catch (err) {
      console.log(
        err.response?.data?.message ||
          "Could not create playlist."
      );
    }
  }

  async function handleLogout() {
    setMobileOpen(false);
    await logout();
    navigate("/login");
  }

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-logo">
          <span>♫</span> Audora
        </div>
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </header>

      {mobileOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className={`navbar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="mobile-drawer-header">
          <div className="sidebar-logo">
            <span>♫</span> Audora
          </div>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <h1 className="sidebar-logo desktop-logo">
          <span>♫</span> Audora
        </h1>

        <div className="sidebar-main-links">

          <NavLink
            to="/"
            end
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>⌂</span>
            Songs
          </NavLink>

          <NavLink
            to="/albums"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>▣</span>
            Albums
          </NavLink>

        </div>

        {user?.role === "artist" && (
          <div className="artist-links">

            <NavLink
              to="/my-music"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span>♫</span>
              Your Music
            </NavLink>

            <NavLink
              to="/my-albums"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span>▣</span>
              Your Albums
            </NavLink>

            <NavLink
              to="/upload"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span>＋</span>
              Upload
            </NavLink>

          </div>
        )}

        <div className="sidebar-library">

          <div className="library-heading">
            Your Library
          </div>

          <NavLink
            to="/liked-songs"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `library-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="liked-icon">
              ♥
            </span>

            <span>
              Liked Songs
            </span>
          </NavLink>

          <div className="playlist-heading">
            <span>Your Playlists</span>

            <button
              type="button"
              className="create-playlist-btn"
              onClick={() =>
                setShowCreatePlaylist(true)
              }
              title="Create playlist"
            >
              +
            </button>
          </div>

          <div className="playlist-list">

            {playlists.map((playlist) => (
              <NavLink
                key={playlist._id}
                to={`/playlists/${playlist._id}`}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `playlist-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <span className="playlist-icon">
                  ♫
                </span>

                <span className="playlist-name">
                  {playlist.name}
                </span>
              </NavLink>
            ))}

          </div>

        </div>

        <div className="nav-footer">

          {user && (
            <div className="user-chip">
              <strong>
                {user.username}
              </strong>

              <span>
                {user.role}
              </span>
            </div>
          )}

          <button
            className="btn btn-secondary logout-btn"
            onClick={handleLogout}
          >
            Log out
          </button>

        </div>

      </nav>

      {showCreatePlaylist && (
        <div
          className="playlist-modal-overlay"
          onClick={() => setShowCreatePlaylist(false)}
        >

          <div
            className="playlist-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <h2>Create Playlist</h2>

            <input
              type="text"
              placeholder="Playlist name"
              value={playlistName}
              onChange={(e) =>
                setPlaylistName(e.target.value)
              }
              autoFocus
            />

            <div className="playlist-modal-actions">

              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setShowCreatePlaylist(false);
                  setPlaylistName("");
                }}
              >
                Cancel
              </button>

              <button
                className="btn"
                type="button"
                onClick={handleCreatePlaylist}
              >
                Create
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}