const express = require('express');
const musicController = require("../controllers/music.controller")
const authMiddleWare = require("../middlewares/auth.middleware")
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage()
});

const router = express.Router();

router.post("/upload",authMiddleWare.authArtist,upload.single("music"),musicController.createMusic)

router.post("/album",authMiddleWare.authArtist,musicController.createAlbum)

router.post("/album/add-music",authMiddleWare.authArtist,musicController.addMusicToAlbum)


router.get("/",authMiddleWare.authUser,musicController.getAllMusics)

router.post("/like",authMiddleWare.authUser,musicController.likeMusic)

router.delete("/like/:musicId",authMiddleWare.authUser,musicController.unlikeMusic)

router.get("/liked",authMiddleWare.authUser,musicController.getLikedMusics)



router.get("/my",authMiddleWare.authArtist,musicController.getMyMusics);

router.get("/albums",authMiddleWare.authUser,musicController.getAllAlbums)

router.get("/my-albums",authMiddleWare.authArtist,musicController.getMyAlbums);

router.get("/albums/:albumId",authMiddleWare.authUser,musicController.getAlbumById);

router.delete("/album/delete-music",authMiddleWare.authArtist,musicController.removeMusicFromAlbum )

router.delete("/albums/:albumId",authMiddleWare.authArtist,musicController.deleteAlbum);

router.delete("/:musicId",authMiddleWare.authArtist,musicController.deleteMusic);


router.put("/albums/:albumId",authMiddleWare.authArtist,musicController.updateAlbum
);



module.exports = router;


