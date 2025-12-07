import React, { useState, useEffect, useRef } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

interface RecordingMinigameProps {
  onComplete: (score: number) => void;
  difficulty: number; // 1 (easy) to 3 (hard)
}

export const RecordingMinigame: React.FC<RecordingMinigameProps> = ({ onComplete, difficulty }) => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showResult, setShowResult] = useState<{score: number, label: string} | null>(null);
  
  const speed = 1.5 + (difficulty * 0.5);
  const targetWidth = 20 - (difficulty * 3); // Harder = smaller target
  const targetStart = 50 - (targetWidth / 2);
  const targetEnd = 50 + (targetWidth / 2);

  const requestRef = useRef<number>(0);

  const animate = () => {
    setPosition(prev => {
      let next = prev + (direction * speed);
      if (next >= 100 || next <= 0) {
        setDirection(d => -d);
        next = Math.max(0, Math.min(100, next));
      }
      return next;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, direction, speed]);

  const handleClick = () => {
    if (!isPlaying) return;
    
    setIsPlaying(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    // Calculate score
    const distToCenter = Math.abs(50 - position);
    const maxDist = 50;
    
    let rawScore = 0;
    let label = "";

    if (position >= targetStart && position <= targetEnd) {
      // Perfect hit
      rawScore = 100;
      label = "PERFECT!";
    } else {
      // Calculate falloff
      rawScore = Math.max(10, 100 - (distToCenter * 2.5));
      label = rawScore > 70 ? "GOOD" : rawScore > 40 ? "OKAY" : "POOR";
    }
    
    setShowResult({ score: Math.round(rawScore), label });
    
    setTimeout(() => {
      onComplete(rawScore);
    }, 1200);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-6 rounded-[20px]">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {showResult ? (
          <div className="text-center animate-bounce-in">
             <div className="flex justify-center mb-4">
               <CheckCircle2 size={64} className={showResult.score > 80 ? "text-green-400" : showResult.score > 50 ? "text-yellow-400" : "text-red-400"} />
             </div>
             <h2 className={`text-4xl font-black ${showResult.score > 80 ? "text-green-400" : showResult.score > 50 ? "text-yellow-400" : "text-red-400"}`}>
               {showResult.label}
             </h2>
             <p className="text-slate-400 font-mono mt-2">Quality: {showResult.score}%</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Target className="text-red-500 animate-pulse" /> Recording...
              </h2>
              <p className="text-slate-400 text-xs mt-1">Click when the bar aligns with the green zone!</p>
            </div>

            <div 
              className="relative w-full h-12 bg-slate-800 rounded-full border-4 border-slate-700 overflow-hidden cursor-pointer shadow-inner"
              onClick={handleClick}
            >
              {/* Target Zone */}
              <div 
                className="absolute top-0 bottom-0 bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                style={{ left: `${targetStart}%`, width: `${targetWidth}%` }}
              ></div>
              
              {/* Center Line Marker */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/30 transform -translate-x-1/2"></div>

              {/* Moving Cursor */}
              <div 
                className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_white] z-10"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
              ></div>
            </div>

            <button 
              onClick={handleClick}
              className="mt-8 w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 transition-all active:scale-95"
            >
              CAPTURE
            </button>
          </>
        )}
      </div>
    </div>
  );
};