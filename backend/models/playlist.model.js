const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    musics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const playlistModel = mongoose.model(
  "Playlist",
  playlistSchema
);

module.exports = playlistModel;