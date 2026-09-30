const musicModel = require('../models/music.model');
const albumModel = require("../models/album.model");
const UserModel = require("../models/user.model");
const playlistModel = require("../models/playlist.model");
const { uploadFile,deleteFile } = require("../services/storage.service");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

async function createMusic(req, res) {
  const { title, albumId } = req.body;
  const file = req.file;

  // --------------------------------------------------
  // 1. Basic validation
  // --------------------------------------------------

  if (!file) {
    return res.status(400).json({
      message: "Music file is required",
    });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Music title is required",
    });
  }

  // --------------------------------------------------
  // 2. Daily upload quota
  // --------------------------------------------------

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayUploadCount = await musicModel.countDocuments({
    artist: req.user.id,
    uploadedAt: { $gte: startOfDay },
  });

  if (todayUploadCount >= 50) {
    return res.status(429).json({
      message: "Daily upload limit reached. Try again tomorrow.",
    });
  }

  // --------------------------------------------------
  // 3. Generate file hash
  // --------------------------------------------------

  const fileHash = crypto
    .createHash("sha256")
    .update(file.buffer)
    .digest("hex");

  // --------------------------------------------------
  // 4. Duplicate file check
  // --------------------------------------------------

  const existingMusic = await musicModel.findOne({
    artist: req.user.id,
    fileHash,
  });

  if (existingMusic) {
    return res.status(409).json({
      message: "This music file has already been uploaded",
    });
  }

  // --------------------------------------------------
  // 5. Album ownership validation
  // --------------------------------------------------

  let album = null;

  if (albumId) {
    album = await albumModel.findById(albumId);

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
  }

  // --------------------------------------------------
  // 6. Upload to ImageKit
  // --------------------------------------------------

  let result;

  try {
    result = await uploadFile(
      file.buffer.toString("base64")
    );
  } catch (error) {
    console.error("ImageKit upload failed:", error);

    return res.status(502).json({
      message: "Music upload failed",
    });
  }

  // --------------------------------------------------
  // 7. Create MongoDB document
  // --------------------------------------------------

  let music;

  try {
    music = await musicModel.create({
      uri: result.url,
      fileId: result.fileId,
      fileHash,
      title: title.trim(),
      artist: req.user.id,

      uploadedFromIp: req.ip,
      userAgent: req.get("user-agent"),
      uploadedAt: new Date(),
    });
  } catch (error) {
    console.error("Music database creation failed:", error);

    // MongoDB failed after ImageKit succeeded.
    // Remove orphaned ImageKit file.
    try {
      await deleteFile(result.fileId);
    } catch (cleanupError) {
      console.error(
        "Failed to cleanup ImageKit file:",
        cleanupError
      );
    }

    return res.status(500).json({
      message: "Music could not be saved",
    });
  }

  // --------------------------------------------------
  // 8. Add music to album
  // --------------------------------------------------

  if (album) {
    try {
      album.musics.push(music._id);
      await album.save();
    } catch (error) {
      console.error("Album update failed:", error);

      // Rollback music + ImageKit file
      try {
        await deleteFile(result.fileId);
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup ImageKit file:",
          cleanupError
        );
      }

      await musicModel.findByIdAndDelete(music._id);

      return res.status(500).json({
        message: "Music was uploaded but could not be added to album",
      });
    }
  }

  // --------------------------------------------------
  // 9. Success response
  // --------------------------------------------------

  return res.status(201).json({
    message: "Music created successfully",

    music: {
      id: music._id,
      uri: music.uri,
      title: music.title,
      artist: music.artist,
    },
  });
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

  try {
    await deleteFile(music.fileId);
  } catch (error) {
    console.error("ImageKit deletion failed:", error);

    return res.status(502).json({
      message: "Could not delete music file",
    });
  }

  await musicModel.findByIdAndDelete(musicId);

  await albumModel.updateMany(
    { musics: musicId },
    { $pull: { musics: musicId } }
  );

  await playlistModel.updateMany(
    { musics: musicId },
    { $pull: { musics: musicId } }
  );

  await UserModel.updateMany(
    { likedSongs: musicId },
    { $pull: { likedSongs: musicId } }
  );

  return res.status(200).json({
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