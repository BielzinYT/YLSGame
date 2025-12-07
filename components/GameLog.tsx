
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Bell } from 'lucide-react';

interface GameLogProps {
  logs: LogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-48 overflow-hidden shadow-sm">
      <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
        <Bell size={12} className="text-slate-400" />
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Activity Feed</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-950/30">
        {logs.length === 0 && <p className="text-slate-600 text-xs italic text-center py-4">Quiet day...</p>}
        {logs.map((log) => (
          <div key={log.id} className="text-xs py-1 border-b border-slate-800/50 last:border-0 animate-fade-in flex gap-2">
            <span className="text-slate-600 font-mono text-[10px] min-w-[30px]">D{log.timestamp.replace('Day ', '')}</span>
            <span className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};
