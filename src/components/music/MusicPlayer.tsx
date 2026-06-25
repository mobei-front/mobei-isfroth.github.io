import { Play, Pause, SkipBack, SkipForward, Volume2, Music, List, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
}

const songList: Song[] = [
  { id: 1, title: '夜航', artist: '合成波浪潮', duration: '4:02' },
  { id: 2, title: '雨中漫步', artist: '轻音乐集', duration: '3:28' },
  { id: 3, title: '午夜电台', artist: 'Lo-Fi Beats', duration: '5:14' },
  { id: 4, title: '星河入梦', artist: '氛围音乐', duration: '4:45' },
  { id: 5, title: '城市微光', artist: '电子精选', duration: '3:52' },
  { id: 6, title: '雨后初晴', artist: '钢琴独奏', duration: '4:21' },
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [showList, setShowList] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song>(songList[0]);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭列表
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setShowList(false);
      }
    };
    if (showList) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showList]);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setShowList(false);
  };

  return (
    <div ref={containerRef} className="glass-card p-3 sm:p-4 glow-border relative">
      <div className="flex items-center gap-3">
        {/* 专辑封面 */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-glow/20 to-midnight-700 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Music className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-glow" />
        </div>

        {/* 歌曲信息和进度条 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate font-serif">
            {currentSong.title}
          </h3>
          <p className="text-[11px] text-midnight-200 truncate">
            {currentSong.artist}
          </p>

          <div className="mt-1.5">
            <div className="relative h-1 bg-midnight-800 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-glow to-cyan-soft rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-0.5 text-[10px] text-midnight-300 font-mono">
              <span>1:24</span>
              <span>{currentSong.duration}</span>
            </div>
          </div>
        </div>

        {/* 控制按钮 - 只保留播放和列表 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-glow/15 border border-cyan-glow/30 flex items-center justify-center text-cyan-glow hover:bg-cyan-glow/25 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setShowList(!showList)}
            className={`p-2 transition-colors ${showList ? 'text-cyan-glow' : 'text-midnight-200 hover:text-cyan-glow'}`}
          >
            <List className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 播放列表弹窗 */}
      {showList && (
        <div
          ref={listRef}
          className="absolute top-full left-0 sm:left-auto sm:right-0 sm:w-72 mt-2 glass-card glow-border max-h-64 overflow-y-auto z-30 animate-fade-in"
        >
          <div className="p-2 border-b border-white/5 flex items-center justify-between sticky top-0 bg-midnight-950/90 backdrop-blur-sm">
            <span className="text-xs text-white font-serif font-medium">播放列表</span>
            <button
              onClick={() => setShowList(false)}
              className="text-midnight-300 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-1">
            {songList.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  currentSong.id === song.id
                    ? 'bg-cyan-glow/10 text-cyan-glow'
                    : 'hover:bg-white/5 text-midnight-100'
                }`}
              >
                <Music className={`w-4 h-4 flex-shrink-0 ${currentSong.id === song.id ? 'text-cyan-glow' : 'text-midnight-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-serif truncate">{song.title}</div>
                  <div className="text-[10px] text-midnight-300 truncate">{song.artist}</div>
                </div>
                <div className="text-[10px] text-midnight-300 font-mono flex-shrink-0">
                  {song.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
