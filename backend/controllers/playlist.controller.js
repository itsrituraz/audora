const playlistModel = require("../models/playlist.model");

async function createPlaylist(req, res) {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Playlist name is required",
    });
  }

  const playlist = await playlistModel.create({
    name: name.trim(),
    owner: req.user.id,
    musics: [],
  });

  res.status(201).json({
    message: "Playlist created successfully",
    playlist: {
      id: playlist._id,
      name: playlist.name,
      owner: playlist.owner,
      musics: playlist.musics,
    },
  });
}

async function getMyPlaylists(req, res) {
  const playlists = await playlistModel
    .find({ owner: req.user.id })
    .select("name owner musics")
    .populate("musics", "title uri artist");

  res.status(200).json({
    message: "Playlists fetched successfully",
    playlists,
  });
}

async function getPlaylistById(req, res) {
  const { playlistId } = req.params;

  const playlist = await playlistModel
    .findOne({
      _id: playlistId,
      owner: req.user.id,
    })
    .populate("owner", "username email")
    .populate("musics");

  if (!playlist) {
    return res.status(404).json({
      message: "Playlist not found",
    });
  }

  res.status(200).json({
    message: "Playlist fetched successfully",
    playlist,
  });
}

async function addMusicToPlaylist(req, res) {
  const { playlistId, musicId } = req.body;

  const playlist = await playlistModel.findOne({
    _id: playlistId,
    owner: req.user.id,
  });

  if (!playlist) {
    return res.status(404).json({
      message: "Playlist not found",
    });
  }

  if (playlist.musics.some((id) => id.toString() === musicId)) {
    return res.status(400).json({
      message: "Music already in playlist",
    });
  }

  playlist.musics.push(musicId);

  await playlist.save();

  await playlist.populate("musics");

  res.status(200).json({
    message: "Music added to playlist successfully",
    playlist,
  });
}

async function removeMusicFromPlaylist(req, res) {
  const { playlistId, musicId } = req.body;

  const playlist = await playlistModel.findOne({
    _id: playlistId,
    owner: req.user.id,
  });

  if (!playlist) {
    return res.status(404).json({
      message: "Playlist not found",
    });
  }

  const musicExists = playlist.musics.some(
    (id) => id.toString() === musicId
  );

  if (!musicExists) {
    return res.status(404).json({
      message: "Music is not in this playlist",
    });
  }

  playlist.musics = playlist.musics.filter(
    (id) => id.toString() !== musicId
  );

  await playlist.save();

  await playlist.populate("musics");

  res.status(200).json({
    message: "Music removed from playlist successfully",
    playlist,
  });
}

async function updatePlaylist(req, res) {
  const { playlistId } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Playlist name is required",
    });
  }

  const playlist = await playlistModel.findOne({
    _id: playlistId,
    owner: req.user.id,
  });

  if (!playlist) {
    return res.status(404).json({
      message: "Playlist not found",
    });
  }

  playlist.name = name.trim();

  await playlist.save();

  res.status(200).json({
    message: "Playlist renamed successfully",
    playlist,
  });
}

module.exports = {
  createPlaylist,getMyPlaylists,getPlaylistById,addMusicToPlaylist,removeMusicFromPlaylist,updatePlaylist
};