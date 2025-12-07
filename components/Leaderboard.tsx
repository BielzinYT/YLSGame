import React from 'react';
import { Rival } from '../types';
import { Users, Crown, TrendingUp } from 'lucide-react';
import { LiveNumber } from './LiveNumber';

interface LeaderboardProps {
  rivals: Rival[];
  playerSubscribers: number;
  playerName: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ rivals, playerSubscribers, playerName }) => {
  const allChannels = [
    ...rivals,
    { id: 'player', name: playerName, subscribers: playerSubscribers, growthRate: 0, color: 'bg-blue-600', isPlayer: true }
  ].sort((a, b) => b.subscribers - a.subscribers);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-full max-h-[400px]">
      <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
        <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
          <Crown size={14} className="text-yellow-500" /> 
          Global Rankings
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {allChannels.map((channel, index) => (
          <div 
            key={channel.id} 
            className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${channel.isPlayer ? 'bg-blue-500/10 border-blue-500/50' : 'bg-transparent border-transparent hover:bg-slate-700/30'}`}
          >
            <div className={`font-mono text-xs w-6 text-center ${index < 3 ? 'text-yellow-500 font-bold' : 'text-slate-600'}`}>#{index + 1}</div>
            
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ${channel.color}`}>
              {channel.name[0]}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-bold truncate ${channel.isPlayer ? 'text-blue-400' : 'text-slate-300'}`}>
                {channel.name}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Users size={8} />
                <LiveNumber value={Math.floor(channel.subscribers)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};