const express = require("express");
const playlistController = require("../controllers/playlist.controller");
const authMiddleWare = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleWare.authUser,
  playlistController.createPlaylist
);



router.get("/",authMiddleWare.authUser,playlistController.getMyPlaylists);



router.post("/add-music",authMiddleWare.authUser,playlistController.addMusicToPlaylist);

router.delete("/remove-music",authMiddleWare.authUser,playlistController.removeMusicFromPlaylist);

router.get("/:playlistId",authMiddleWare.authUser,playlistController.getPlaylistById);

router.put("/:playlistId",authMiddleWare.authUser,playlistController.updatePlaylist)



module.exports = router;