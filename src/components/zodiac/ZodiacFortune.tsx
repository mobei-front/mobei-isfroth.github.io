import { useState } from 'react';
import { Star, Sparkles, RefreshCw } from 'lucide-react';

const zodiacSigns = [
  { name: '白羊座', icon: '♈', date: '3.21-4.19' },
  { name: '金牛座', icon: '♉', date: '4.20-5.20' },
  { name: '双子座', icon: '♊', date: '5.21-6.21' },
  { name: '巨蟹座', icon: '♋', date: '6.22-7.22' },
  { name: '狮子座', icon: '♌', date: '7.23-8.22' },
  { name: '处女座', icon: '♍', date: '8.23-9.22' },
  { name: '天秤座', icon: '♎', date: '9.23-10.23' },
  { name: '天蝎座', icon: '♏', date: '10.24-11.22' },
  { name: '射手座', icon: '♐', date: '11.23-12.21' },
  { name: '摩羯座', icon: '♑', date: '12.22-1.19' },
  { name: '水瓶座', icon: '♒', date: '1.20-2.18' },
  { name: '双鱼座', icon: '♓', date: '2.19-3.20' },
];

const fortuneTexts = [
  '今日运势佳',
  '贵人相助',
  '桃花运旺',
  '财运亨通',
  '学习运佳',
  '健康良好',
  '适合外出',
  '心情愉悦',
];

const luckyLevels = ['★★★★★', '★★★★', '★★★', '★★', '★'];

interface Fortune {
  text: string;
  love: string;
  career: string;
  wealth: string;
}

function generateFortune(): Fortune {
  return {
    text: fortuneTexts[Math.floor(Math.random() * fortuneTexts.length)],
    love: luckyLevels[Math.floor(Math.random() * 5)],
    career: luckyLevels[Math.floor(Math.random() * 5)],
    wealth: luckyLevels[Math.floor(Math.random() * 5)],
  };
}

export default function ZodiacFortune() {
  const [selectedSign, setSelectedSign] = useState(zodiacSigns[Math.floor(Math.random() * 12)]);
  const [fortune, setFortune] = useState<Fortune>(generateFortune());
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const refreshFortune = () => {
    setLoading(true);
    setTimeout(() => {
      setFortune(generateFortune());
      setLoading(false);
    }, 300);
  };

  return (
    <div className="glass-card p-2 sm:p-3 glow-border">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-xs font-semibold text-white flex items-center gap-1.5 font-serif">
          <Star className="w-3.5 h-3.5 text-yellow-400" />
          星座占卜
        </h3>
        <button
          onClick={refreshFortune}
          className="text-midnight-300 hover:text-cyan-glow transition-colors p-0.5"
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/3">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-xl flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
        >
          {selectedSign.icon}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white font-serif">
            {selectedSign.name}
            <span className="text-midnight-300 text-[10px] ml-1">{selectedSign.date}</span>
          </div>
          <div className="text-[10px] text-cyan-soft mt-0.5">
            {fortune.text}
          </div>
        </div>
        <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse flex-shrink-0" />
      </div>

      <div className="grid grid-cols-3 gap-1 mt-1.5 text-center">
        <div className="p-1 rounded bg-white/3">
          <div className="text-[9px] text-pink-400">恋爱</div>
          <div className="text-[9px] text-yellow-400">{fortune.love}</div>
        </div>
        <div className="p-1 rounded bg-white/3">
          <div className="text-[9px] text-blue-400">事业</div>
          <div className="text-[9px] text-yellow-400">{fortune.career}</div>
        </div>
        <div className="p-1 rounded bg-white/3">
          <div className="text-[9px] text-green-400">财运</div>
          <div className="text-[9px] text-yellow-400">{fortune.wealth}</div>
        </div>
      </div>

      {showPicker && (
        <div className="mt-2 p-1.5 rounded-lg bg-white/5 animate-fade-in">
          <div className="grid grid-cols-6 gap-0.5">
            {zodiacSigns.map((sign) => (
              <button
                key={sign.name}
                onClick={() => {
                  setSelectedSign(sign);
                  setShowPicker(false);
                  refreshFortune();
                }}
                className={`p-1 rounded text-center transition-all ${
                  selectedSign.name === sign.name
                    ? 'bg-cyan-glow/15 text-cyan-glow'
                    : 'hover:bg-white/5 text-midnight-200'
                }`}
              >
                <div className="text-sm">{sign.icon}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}