import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Play, UserCheck, Gift, RefreshCw } from 'lucide-react';
import { Person, Prize } from '../types';

interface LuckyDrawProps {
  people: Person[];
  prizes: Prize[];
}

export default function LuckyDraw({ people, prizes }: LuckyDrawProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [winner, setWinner] = useState<Person | null>(null);
  const [history, setHistory] = useState<{ person: Person; prize: Prize; timestamp: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Determine current prize and progress
  const currentPrizeInfo = useMemo(() => {
    if (prizes.length === 0) return null;

    // Count how many winners for each prize in history
    const prizeWinnerCounts = new Map<string, number>();
    history.forEach(h => {
      prizeWinnerCounts.set(h.prize.id, (prizeWinnerCounts.get(h.prize.id) || 0) + 1);
    });

    // Find the first prize that isn't full
    for (const prize of prizes) {
      const count = prizeWinnerCounts.get(prize.id) || 0;
      if (count < prize.count) {
        return { prize, progress: count + 1 };
      }
    }

    return null; // All prizes full
  }, [prizes, history]);

  const availablePeople = allowRepeat 
    ? people 
    : people.filter(p => !history.some(h => h.person.id === p.id));

  const startDraw = () => {
    if (!currentPrizeInfo || availablePeople.length === 0) return;
    
    setIsDrawing(true);
    setWinner(null);
    
    let speed = 50;
    let count = 0;
    const maxCount = 30;

    const animate = () => {
      setCurrentIndex(prev => (prev + 1) % availablePeople.length);
      count++;
      
      if (count < maxCount) {
        timerRef.current = window.setTimeout(animate, speed);
        if (count > maxCount * 0.7) speed += 30;
      } else {
        const finalWinner = availablePeople[Math.floor(Math.random() * availablePeople.length)];
        setWinner(finalWinner);
        
        setHistory(prev => [
          { person: finalWinner, prize: currentPrizeInfo.prize, timestamp: Date.now() },
          ...prev
        ]);
        
        setIsDrawing(false);
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#18181b', '#3f3f46', '#71717a']
        });
      }
    };

    animate();
  };

  const redraw = () => {
    if (history.length === 0 || isDrawing) return;
    if (!confirm('確定要作廢上一筆紀錄並重新抽獎嗎？')) return;

    // Remove last record
    setHistory(prev => prev.slice(1));
    setWinner(null);
    
    // Start new draw immediately
    setTimeout(startDraw, 100);
  };

  const resetHistory = () => {
    if (confirm('確定要重置所有獲獎紀錄嗎？')) {
      setHistory([]);
      setWinner(null);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4">
        <Trophy size={48} strokeWidth={1} />
        <p>請先在「名單管理」中加入成員</p>
      </div>
    );
  }

  if (prizes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4">
        <Gift size={48} strokeWidth={1} />
        <p>請先在「名單管理」中設定獎項</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col items-center space-y-8">
        {/* Display Area */}
        <div className="relative w-full aspect-video md:aspect-[21/9] bg-zinc-900 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl border border-zinc-800">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-400 via-transparent to-transparent" />
          </div>
          
          <AnimatePresence mode="wait">
            {isDrawing ? (
              <motion.div
                key="drawing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-center space-y-4"
              >
                <div className="text-zinc-500 text-sm font-medium uppercase tracking-widest animate-pulse">
                  正在抽取：{currentPrizeInfo?.prize.name} ({currentPrizeInfo?.progress}/{currentPrizeInfo?.prize.count})
                </div>
                <div className="text-6xl md:text-8xl font-bold text-white tracking-tighter">
                  {availablePeople[currentIndex]?.name}
                </div>
              </motion.div>
            ) : winner ? (
              <motion.div
                key="winner"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="text-zinc-400 text-sm font-medium uppercase tracking-widest">
                  {history[0]?.prize.name} 獲獎者
                </div>
                <div className="text-6xl md:text-8xl font-bold text-white tracking-tighter">
                  {winner.name}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                className="text-center space-y-4"
              >
                {currentPrizeInfo ? (
                  <>
                    <div className="text-zinc-600 text-sm font-medium uppercase tracking-widest">
                      準備抽取：{currentPrizeInfo.prize.name} ({currentPrizeInfo.progress}/{currentPrizeInfo.prize.count})
                    </div>
                    <div className="text-zinc-500 text-lg font-medium">
                      點擊下方按鈕開始
                    </div>
                  </>
                ) : (
                  <div className="text-zinc-500 text-lg font-medium">
                    所有獎項已抽取完畢
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <div className="flex items-center gap-8 w-full justify-center">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={allowRepeat}
                  onChange={(e) => setAllowRepeat(e.target.checked)}
                />
                <div className="w-10 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
              </div>
              <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors">允許重複獲獎</span>
            </label>
            
            <div className="text-sm font-medium text-zinc-400">
              剩餘可抽：{availablePeople.length} 人
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={startDraw}
              disabled={isDrawing || !currentPrizeInfo || availablePeople.length === 0}
              className="flex-[2] h-16 btn-primary text-xl flex items-center justify-center gap-3 shadow-xl shadow-zinc-200 active:scale-95 transition-transform"
            >
              <Play fill="currentColor" size={24} />
              {isDrawing ? '抽籤中...' : currentPrizeInfo ? `開始抽取 ${currentPrizeInfo.prize.name}` : '已抽完'}
            </button>
            
            {history.length > 0 && (
              <button
                onClick={redraw}
                disabled={isDrawing}
                className="flex-1 h-16 btn-secondary text-zinc-600 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                title="作廢上一筆並重新抽獎"
              >
                <RefreshCw size={20} />
                重新抽獎
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-zinc-500" />
            <h3 className="font-semibold text-zinc-900">獲獎紀錄</h3>
          </div>
          <button
            onClick={resetHistory}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={12} />
            重置紀錄
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {history.map((item, idx) => (
              <motion.div
                key={`${item.person.id}-${item.timestamp}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center gap-3 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    {history.length - idx}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-zinc-800 truncate">{item.person.name}</span>
                  <span className="text-[10px] text-zinc-400 font-medium truncate">{item.prize.name}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {history.length === 0 && (
            <div className="col-span-full py-8 text-center text-zinc-400 text-sm italic border border-dashed border-zinc-200 rounded-xl">
              尚無獲獎紀錄
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
