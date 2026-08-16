import { useEffect } from "react";
import { useMusic } from "../context/MusicContext";

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    nextSong,
    previousSong,
    audioRef,
    setCurrentTime,
    setDuration,
  } = useMusic();

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      nextSong();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, setCurrentTime, setDuration, nextSong]);

  if (!currentSong) {
    return null;
  }

  const formatTime = (time) => {
    if (!time || Number.isNaN(time)) {
      return "0:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="music-player">
      <div className="player-song">
        <div className="player-icon">♫</div>

        <div className="player-info">
          <div className="player-title">
            {currentSong.title}
          </div>

          <div className="player-artist">
            {currentSong.artist?.username || "Unknown artist"}
          </div>
        </div>
      </div>

      <div className="player-controls">

        <div className="player-buttons">

          <button
            className="player-skip-btn"
            onClick={previousSong}
          >
            ⏮
          </button>

          <button
            className="player-play-btn"
            onClick={togglePlay}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <button
            className="player-skip-btn"
            onClick={nextSong}
          >
            ⏭
          </button>

        </div>

        <div className="player-progress">
          <span>{formatTime(currentTime)}</span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
          />

          <span>{formatTime(duration)}</span>
        </div>

      </div>
    </div>
  );
}