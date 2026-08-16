# 🎵 Audora

> Your music. Your world.

Audora is a full-stack music streaming platform where artists can upload and manage their music, while users can discover songs, create playlists, like their favorite tracks, and enjoy seamless music playback.


---

## 📸 Screenshots

### User View — Browse Songs, Like Tracks & Manage Playlists

![User songs view](https://drive.google.com/file/d/16hssXR2pONYeZ8PYdDt8jY40B1IZoPY3/view?usp=drive_link)

### Artist View — Manage Music & Albums

![Artist songs view](https://drive.google.com/file/d/1wxTa0ovwG1NIeyH6dnLmfu2S5Gw1l3NA/view?usp=drive_link)

### Artist View — Upload Songs & Create Albums

![Artist upload view](https://drive.google.com/file/d/1lWimIcp-91OfA4db7GDepQ_UzQQkdm_1/view?usp=drive_link)

---

## ✨ Features

### 🎧 Music

- Browse songs uploaded by artists
- Play and pause songs
- Continuous music playback
- View artist information
- Delete uploaded music
- Automatically remove deleted songs from albums, playlists and liked songs

### 🎤 Artist Features

- Upload music
- View personal music library
- Create albums
- Add songs to albums
- Remove songs from albums
- Edit album details
- Delete albums
- Delete uploaded songs

### 📚 User Library

- Create playlists
- Rename playlists
- Add songs to playlists
- Remove songs from playlists
- Like and unlike songs
- Dedicated Liked Songs section
- Play songs directly from playlists and liked songs

### 🔐 Authentication & Authorization

- User authentication
- Artist authentication
- Protected routes
- JWT-based authentication
- Role-based authorization
- Artist-only music management

### 🧹 Data Consistency

When an artist deletes a song, Audora automatically removes that song from:

- Albums
- Playlists
- Liked Songs

This keeps the user's library and database consistent.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Context API
- Axios
- Custom CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer

### Storage

- ImageKit for audio file storage and delivery

---

## 🏗️ Project Structure

```text
Audora/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar
│   │   │   ├── MusicPlayer
│   │   │   └── ProtectedRoute
│   │   │
│   │   ├── pages/
│   │   │   ├── Home
│   │   │   ├── Albums
│   │   │   ├── Upload
│   │   │   ├── MyMusic
│   │   │   ├── MyAlbums
│   │   │   ├── PlaylistDetail
│   │   │   └── LikedSongs
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext
│   │   │   └── MusicContext
│   │   │
│   │   └── api/
│   │       └── axios
│   │
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   └── ...
│
└── README.md