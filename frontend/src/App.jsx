import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Upload from "./pages/Upload";
import MyMusic from "./pages/MyMusic";
import MyAlbums from "./pages/MyAlbums";
import ProtectedRoute from "./components/ProtectedRoute";
import LikedSongs from "./pages/LikedSongs";
import { MusicProvider } from "./context/MusicContext";
import MusicPlayer from "./components/MusicPlayer";
import PlaylistDetail from "./pages/PlaylistDetail";

export default function App() {
  return (
    <MusicProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/albums"
          element={
            <ProtectedRoute>
              <Albums />
            </ProtectedRoute>
          }
        />

        <Route
          path="/albums/:albumId"
          element={
            <ProtectedRoute>
              <AlbumDetail />
            </ProtectedRoute>
          }
        />

        

        <Route
         path="/my-music"
         element={
          <ProtectedRoute requiredRole="artist">
           <MyMusic />
          </ProtectedRoute>
         }
        />

        <Route 
          path="/my-albums"
          element={
            <ProtectedRoute requiredRole="artist">
              <MyAlbums />
            </ProtectedRoute>
          }

        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute requiredRole="artist">
              <Upload />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/playlists/:playlistId"
          element={
            <ProtectedRoute>
              <PlaylistDetail />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/liked-songs"
          element={
            <ProtectedRoute>
              <LikedSongs />
            </ProtectedRoute>
          }
        /> 
      </Routes>

      

      <MusicPlayer />
    </MusicProvider>
  );
}