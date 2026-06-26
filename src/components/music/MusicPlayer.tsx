import { Play, Pause, SkipBack, SkipForward, Volume2, Music, List, X, Shuffle, RefreshCw, AlertCircle, WifiOff } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  url: string;
  cover: string;
  lrc?: string;
}

const RETRY_DELAY = 3000;
const MAX_RETRY_ATTEMPTS = 10;

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showList, setShowList] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [songList, setSongList] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  const fetchSongs = useCallback(async (attempt = 1) => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(attempt - 1);
    try {
      const res = await fetch('https://v2.xxapi.cn/api/randomkuwo');
      const data = await res.json();
      if (data?.code === 200) {
        const song: Song = {
          id: Date.now(),
          title: data.title || '未知歌曲',
          artist: data.artist || '未知歌手',
          album: data.album || '',
          duration: data.duration || '3:00',
          url: data.url || '',
          cover: data.cover || '',
          lrc: data.lrc || '',
        };
        
        if (song.url && song.url.startsWith('http')) {
          const newSongList = [...songList, song];
          setSongList(newSongList);
          setCurrentSong(song);
          setIsLoading(false);
          setHasError(false);
          setErrorMessage('');
          
          if (audioRef.current) {
            audioRef.current.src = song.url;
            audioRef.current.load();
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        } else {
          throw new Error('没有可用的歌曲链接');
        }
      } else {
        throw new Error(data?.msg || 'API 返回异常');
      }
    } catch (err: any) {
      console.error(`酷我音乐接口调用失败 (尝试 ${attempt})`, err);
      if (attempt < MAX_RETRY_ATTEMPTS) {
        retryTimeoutRef.current = window.setTimeout(() => {
          fetchSongs(attempt + 1);
        }, RETRY_DELAY);
      } else {
        setHasError(true);
        setErrorMessage('网络连接不稳定，音乐加载失败');
        setIsLoading(false);
      }
    }
  }, [songList]);

  const handleRetry = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    fetchSongs(1);
  };

  useEffect(() => {
    fetchSongs();
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchSongs]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && isPlaying) {
        audioRef.current.play().catch(() => {});
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isPlaying]);

  const updateProgress = useCallback(() => {
    if (audioRef.current && currentSong) {
      const duration = audioRef.current.duration;
      const currentTime = audioRef.current.currentTime;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (isPlaying && progressInterval.current === null) {
      progressInterval.current = window.setInterval(updateProgress, 1000);
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, updateProgress]);

  useEffect(() => {
    const handleEnded = () => {
      fetchSongs();
    };
    const handleError = () => {
      setIsPlaying(false);
      if (songList.length > 0) {
        fetchSongs();
      }
    };
    
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('error', handleError);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, [songList, fetchSongs]);

  const togglePlay = () => {
    if (!currentSong?.url) {
      fetchSongs();
      return;
    }
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false);
        fetchSongs();
      });
    }
  };

  const nextSong = () => {
    fetchSongs();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentSong) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setProgress(percent * 100);
  };

  if (isLoading) {
    return (
      <div className="glass-card p-3 sm:p-4 glow-border relative">
        <div className="flex items-center gap-3">
          {/* 封面骨架 */}
          <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl bg-midnight-800/50 animate-pulse flex-shrink-0" />

          {/* 信息骨架 */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-3/4 bg-midnight-800/50 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-midnight-800/30 rounded animate-pulse" />
            <div className="h-1 w-full bg-midnight-800/30 rounded animate-pulse mt-3" />
          </div>

          {/* 按钮骨架 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-midnight-800/50 animate-pulse" />
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-midnight-800/30 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-3 sm:p-4 glow-border relative">
      <audio ref={audioRef} preload="metadata" />

      {hasError && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-red-500/10 border-b border-red-500/30 px-3 py-1.5 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] text-red-300">{errorMessage}</span>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            重试
          </button>
        </div>
      )}

      <div className={`flex items-center gap-3 ${hasError ? 'mt-5' : ''}`}>
        {/* 封面 */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-cyan-glow/20 to-midnight-700 overflow-hidden shadow-lg shadow-cyan-glow/5">
            {currentSong?.cover ? (
              <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-glow" />
              </div>
            )}
          </div>
          {isPlaying && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-glow/20 backdrop-blur-sm border border-cyan-glow/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse" />
            </div>
          )}
        </div>

        {/* 信息和控制 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-white truncate font-serif">
            {currentSong?.title || '未选择'}
          </h3>
          <p className="text-[11px] text-midnight-200 truncate mt-0.5">
            {currentSong?.artist || '未知歌手'}
          </p>
          {currentSong?.album && (
            <p className="text-[10px] text-midnight-400 truncate mt-0.5">
              {currentSong.album}
            </p>
          )}

          {/* 进度条 */}
          <div className="mt-2">
            <div
              className="relative h-1 bg-midnight-800 rounded-full overflow-hidden cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-glow to-cyan-soft rounded-full"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 5px)` }}
              />
            </div>
            <div className="flex justify-between mt-0.5 text-[10px] text-midnight-400 font-mono">
              <span>{formatTime((progress / 100) * (audioRef.current?.duration || 180))}</span>
              <span>{currentSong?.duration}</span>
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={togglePlay}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-glow/15 border border-cyan-glow/30 flex items-center justify-center text-cyan-glow hover:bg-cyan-glow/25 hover:border-cyan-glow/50 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            )}
          </button>
          <button
            onClick={nextSong}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-midnight-200 hover:text-cyan-glow hover:bg-cyan-glow/10 transition-all"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}