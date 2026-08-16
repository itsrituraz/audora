import { createContext, useContext, useRef, useState } from "react";

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const audioRef = useRef(new Audio());

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const playSong = (song,songList=playlist) => {
    const audio = audioRef.current;

    if(songList.length>0){
      setPlaylist(songList);
    }

    const index = songList.findIndex((item)=>item._id===song._id);

    if(index !== -1){
      setCurrentIndex(index);
    }

    if (currentSong?._id !== song._id) {
      audio.src = song.uri;
      setCurrentSong(song);
      setCurrentTime(0);
    }

    audio.play();
    setIsPlaying(true);
  };

  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!currentSong) return;

    if (isPlaying) {
      pauseSong();
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextSong = () => {
    if (!playlist.length) return;

    const nextIndex = currentIndex + 1;

    if (nextIndex >= playlist.length) {
      return;
    }

    const song = playlist[nextIndex];

    setCurrentIndex(nextIndex);
    setCurrentSong(song);
    setCurrentTime(0);

    audioRef.current.src = song.uri;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const previousSong = () => {
    if (!playlist.length) return;

    const previousIndex = currentIndex - 1;

    if (previousIndex < 0) {
      return;
    }

    const song = playlist[previousIndex];

    setCurrentIndex(previousIndex);
    setCurrentSong(song);
    setCurrentTime(0);

    audioRef.current.src = song.uri;
    audioRef.current.play();
    setIsPlaying(true);
  };


  const seek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        playlist,
        currentIndex,
        playSong,
        pauseSong,
        togglePlay,
        nextSong,
        previousSong,
        seek,

        audioRef,
        setCurrentTime,
        setDuration,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}