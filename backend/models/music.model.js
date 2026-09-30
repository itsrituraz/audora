const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema({
  uri: {
    type: String,
    required: true,
  },

  fileId: {
    type: String,
    required: true,
  },

  fileHash: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  uploadedFromIp: {
    type: String,
  },

  userAgent: {
    type: String,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

musicSchema.index(
  { artist: 1, fileHash: 1 },
  { unique: true }
);

const musicModel = mongoose.model("Music", musicSchema);

module.exports = musicModel;