const musicModel = require('../models/music.model');
const albumModel = require("../models/album.model");
const UserModel = require("../models/user.model");
const playlistModel = require("../models/playlist.model");
const { uploadFile,deleteFile } = require("../services/storage.service");
const jwt = require("jsonwebtoken");

async function createMusic(req, res) {
 const { title,albumId } = req.body;
  const file = req.file;
  console.log('File received:', req.file);

  const result = await uploadFile(file.buffer.toString('base64'))

  const music = await musicModel.create({
    uri: result.url,
    fileId:result.fileId,
    title,
    artist: req.user.id,
  });

  if (albumId) {
    const album = await albumModel.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    // Ownership check - apna hi album hona chahiye
    if (album.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: "You don't own this album" });
    }

    album.musics.push(music._id);
    await album.save();
  }


  res.status(201).json({
    message: "Music created successfully",
    music: {
      id: music._id,
      uri: music.uri,
      title: music.title,
      artist: music.artist,
    }
  })
} 


async function createAlbum(req,res) {

  const { title,musics } = req.body;

  const album = await albumModel.create({
    title,
    artist: req.user.id,
    musics:musics,
  })

  res.status(201).json({
    message:"Album created successfully",
    album: {
      id: album._id,
      title:album.title,
      artist:album.artist,
      musics:album.musics,
    }
  })
}

async function getAllMusics(req,res) {
  const musics = await musicModel.find().populate("artist","username email")

  res.status(200).json({
    message:"music fetched successfully",
    musics: musics,
  })

}

async function getMyMusics(req, res) {
  const musics = await musicModel
    .find({ artist: req.user.id })
    .populate("artist", "username email");

  res.status(200).json({
    message: "Your music fetched successfully",
    musics: musics,
  });
}

async function addMusicToAlbum(req, res) {
  const { albumId, musicId } = req.body;

  const album = await albumModel.findById(albumId);

  if (!album) {
    return res.status(404).json({ message: "Album not found" });
  }

  if (album.artist.toString() !== req.user.id) {
    return res.status(403).json({ message: "You don't own this album" });
  }

  if (album.musics.includes(musicId)) {
    return res.status(400).json({ message: "Music already in album" });
  }

  album.musics.push(musicId);
  await album.save();

  await album.populate("musics");

  res.status(200).json({
    message: "Music added to album successfully",
    album,
  });
};

async function removeMusicFromAlbum(req, res) {
  const { albumId, musicId } = req.body;

  const album = await albumModel.findById(albumId);

  if (!album) {
    return res.status(404).json({
      message: "Album not found",
    });
  }

  if (album.artist.toString() !== req.user.id) {
    return res.status(403).json({
      message: "You don't own this album",
    });
  }

  if (
    !album.musics.some(
      (id) => id.toString() === musicId
    )
  ) {
    return res.status(404).json({
      message: "Music is not found in this album",
    });
  }

  album.musics = album.musics.filter(
    (id) => id.toString() !== musicId
  );

  await album.save();

  await album.populate("musics");

  res.status(200).json({
    message: "Music removed from the album",
    album,
  });
}

async function getAllAlbums(req,res) {
  const albums = await albumModel.find().select("title artist").populate("artist","username email")
  res.status(200).json({
    message:"Albums fetched successfully",
    albums: albums,
  })
}

async function getMyAlbums(req,res) {
  const albums = await albumModel
  .find({ artist:req.user.id })
  .populate("artist","username email",)
  .populate("musics");

  res.status(200).json({
    message: "Your Albums fetched successfully",
    albums: albums,
  })
}

async function deleteAlbum(req, res) {
  const albumId = req.params.albumId;

  const album = await albumModel.findById(albumId);

  if (!album) {
    return res.status(404).json({
      message: "Album not found",
    });
  }

  if (album.artist.toString() !== req.user.id) {
    return res.status(403).json({
      message: "You don't own this album",
    });
  }

  await albumModel.findByIdAndDelete(albumId);

  res.status(200).json({
    message: "Album deleted successfully",
  });
}

async function updateAlbum(req, res) {
  const albumId = req.params.albumId;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Album title is required",
    });
  }

  const album = await albumModel.findById(albumId);

  if (!album) {
    return res.status(404).json({
      message: "Album not found",
    });
  }

  if (album.artist.toString() !== req.user.id) {
    return res.status(403).json({
      message: "You don't own this album",
    });
  }

  album.title = title.trim();

  await album.save();

  res.status(200).json({
    message: "Album updated successfully",
    album,
  });
}

async function getAlbumById(req,res) {
  const albumId = req.params.albumId;
  const album = await albumModel.findById(albumId).populate("artist","username email").populate("musics");

  if(!album) {
    return res.status(404).json({ message: "Album not found" })
  }

  res.status(200).json({
    message:"Album fetched successfully",
    album: album,
  })
}

async function deleteMusic(req, res) {
  const musicId = req.params.musicId;

  const music = await musicModel.findById(musicId);

  if (!music) {
    return res.status(404).json({
      message: "Music not found",
    });
  }
  if (music.artist.toString() !== req.user.id) {
    return res.status(403).json({
      message: "You don't own this music",
    });
  }

  await deleteFile(music.fileId);

  await musicModel.findByIdAndDelete(musicId);

  await albumModel.updateMany(
    { musics: musicId },
    { $pull: { musics: musicId } }
  );

  await playlistModel.updateMany(
    { musics: musicId},
    { $pull: {musics: musicId } }
  )

  await UserModel.updateMany(
    { likedSongs: musicId},
    { $pull: {likedSongs: musicId } }
  );

  res.status(200).json({
    message: "Music deleted successfully"
  });

  await deleteFile(music.fileId);

  await musicModel.findByIdAndDelete(musicId);

  await albumModel.updateMany(
    { musics: musicId },
    { $pull: { musics: musicId } }
  );

  res.status(200).json({
    message: "Music deleted successfully",
  });
}

async function likeMusic(req, res) {
  const { musicId } = req.body;

  const music = await musicModel.findById(musicId);

  if (!music) {
    return res.status(404).json({
      message: "Music not found",
    });
  }

  const user = await UserModel.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (
    user.likedSongs.some(
      (id) => id.toString() === musicId
    )
  ) {
    return res.status(400).json({
      message: "Music already liked",
    });
  }

  user.likedSongs.push(musicId);

  await user.save();

  res.status(200).json({
    message: "Music liked successfully",
    likedSongs: user.likedSongs,
  });
}

async function unlikeMusic(req, res) {
  const { musicId } = req.params;

  const user = await UserModel.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const isLiked = user.likedSongs.some(
    (id) => id.toString() === musicId
  );

  if (!isLiked) {
    return res.status(400).json({
      message: "Music is not liked",
    });
  }

  user.likedSongs = user.likedSongs.filter(
    (id) => id.toString() !== musicId
  );

  await user.save();

  res.status(200).json({
    message: "Music unliked successfully",
    likedSongs: user.likedSongs,
  });
}

async function getLikedMusics(req, res) {
  const user = await UserModel
    .findById(req.user.id)
    .populate({
      path: "likedSongs",
      populate: {
        path: "artist",
        select: "username email",
      },
    });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: "Liked songs fetched successfully",
    musics: user.likedSongs,
  });
}



module.exports = { createMusic,createAlbum,getAllMusics,getMyMusics,getAllAlbums,getAlbumById,addMusicToAlbum,deleteMusic,getMyAlbums,deleteAlbum,updateAlbum,removeMusicFromAlbum,likeMusic,unlikeMusic,getLikedMusics };