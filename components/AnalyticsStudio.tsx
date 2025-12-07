
import React from 'react';
import { GameState } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';
import { VideoCard } from './VideoCard';
import { LiveNumber } from './LiveNumber';
import { Activity, Users, Eye, DollarSign } from 'lucide-react';

interface AnalyticsStudioProps {
  gameState: GameState;
}

export const AnalyticsStudio: React.FC<AnalyticsStudioProps> = ({ gameState }) => {
  const latestVideo = gameState.videos[gameState.videos.length - 1];
  
  // Calculate Rank
  const mySubs = gameState.subscribers;
  const rank = gameState.rivals.filter(r => r.subscribers > mySubs).length + 1;
  
  // Prepare data for "Realtime" chart (Last 48h / ticks simulation)
  // Since we don't store 48h history, we mock a live pulse based on current velocity
  const realTimeData = Array.from({ length: 20 }).map((_, i) => ({
    time: i,
    views: latestVideo ? Math.max(10, Math.floor(latestVideo.currentVelocity * (0.8 + Math.random() * 0.4))) : 0
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white">Channel Dashboard</h2>
        <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-slate-800 text-yellow-400 text-xs font-bold rounded border border-yellow-500/30">
                Global Rank: #{rank}
            </div>
            <div className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase animate-pulse">
            Live Updates
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Latest Video Performance */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-white font-bold mb-4">Latest Video Performance</h3>
          {latestVideo ? (
            <div className="space-y-6">
              <div className="relative">
                 <VideoCard video={latestVideo} compact />
                 <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-green-400 font-mono">
                    +{Math.floor(latestVideo.currentVelocity)}/sec
                 </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 border-t border-slate-700 pt-4">
                 <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase">Views</div>
                    <div className="text-lg font-bold text-white">
                      <LiveNumber value={latestVideo.views} />
                    </div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase">CTR</div>
                    <div className="text-lg font-bold text-white">{(latestVideo.quality / 10).toFixed(1)}%</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase">Avg. View</div>
                    <div className="text-lg font-bold text-white">4:20</div>
                 </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg">
                 <h4 className="text-xs text-slate-500 uppercase mb-2">Comments</h4>
                 <div className="space-y-2">
                   {latestVideo.comments.slice(0, 2).map((c, i) => (
                      <div key={i} className="text-xs text-slate-300">
                        <span className="font-bold text-slate-500 mr-2">{c.user}:</span>
                        {c.text}
                      </div>
                   ))}
                 </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-center py-10">No content available</div>
          )}
        </div>

        {/* Middle Col: Channel Analytics */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg flex flex-col">
          <h3 className="text-white font-bold mb-6">Channel Analytics</h3>
          
          <div className="space-y-6 mb-8">
             <div>
                <div className="text-sm text-slate-400 mb-1">Current Subscribers</div>
                <div className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <LiveNumber value={gameState.subscribers} />
                </div>
                <div className="text-xs text-green-400 mt-1">Top {Math.max(1, 100 - (rank * 5))}% of channels</div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/50">
                   <div className="text-xs text-slate-400 uppercase mb-1">Revenue</div>
                   <div className="text-xl font-bold text-green-400">
                     <LiveNumber value={Math.floor(gameState.money)} prefix="$" />
                   </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/50">
                   <div className="text-xs text-slate-400 uppercase mb-1">Lifetime Views</div>
                   <div className="text-xl font-bold text-blue-400">
                      <LiveNumber value={gameState.totalViews} />
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 min-h-[150px]">
             <div className="text-xs text-slate-500 mb-2 uppercase">Growth (Last 30 Days)</div>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={gameState.subHistory.slice(-10)}>
                 <defs>
                   <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#colorGrowth)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Realtime */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3">
              <Activity className="text-blue-500 animate-pulse" />
           </div>
           
           <h3 className="text-white font-bold mb-1">Realtime</h3>
           <p className="text-xs text-slate-400 mb-6">Updating live</p>

           <div className="flex-1 flex flex-col justify-end">
              <div className="text-5xl font-extrabold text-white mb-2">
                 <LiveNumber value={Math.floor(gameState.videos.reduce((acc, v) => acc + v.currentVelocity, 0) * 10)} />
              </div>
              <p className="text-sm text-slate-400 mb-8 border-b border-slate-700 pb-4">Views · Last 60 min</p>

              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={realTimeData}>
                    <Tooltip 
                      cursor={{fill: '#334155', opacity: 0.4}}
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none' }}
                    />
                    <Bar dataKey="views" fill="#3b82f6" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Top Content</p>
                {gameState.videos.slice().sort((a,b) => b.currentVelocity - a.currentVelocity).slice(0, 3).map(video => (
                   <div key={video.id} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300 truncate w-32">{video.title}</span>
                      <span className="text-blue-400 font-mono">
                        {Math.floor(video.currentVelocity)}/s
                      </span>
                   </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
