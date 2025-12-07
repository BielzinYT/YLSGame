
import React from 'react';
import { Video } from '../types';
import { Eye, ThumbsUp, MessageSquare, DollarSign, Calendar } from 'lucide-react';
import { LiveNumber } from './LiveNumber';

interface ContentTabProps {
  videos: Video[];
}

export const ContentTab: React.FC<ContentTabProps> = ({ videos }) => {
  // Sort by newest first
  const sortedVideos = [...videos].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold text-white mb-6">Channel Content</h2>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#282828] rounded-2xl text-slate-500">
           <PlaySquare size={48} className="mb-4 opacity-50" />
           <p>No videos uploaded yet.</p>
           <p className="text-sm mt-2">Go to Dashboard to record your first video!</p>
        </div>
      ) : (
        <div className="bg-[#1f1f1f] border border-[#282828] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#282828] text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Video</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Date</th>
                <th className="p-4 text-right">Views</th>
                <th className="p-4 text-right">Comments</th>
                <th className="p-4 text-right">Likes (vs Dis)</th>
                <th className="p-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#282828]">
              {sortedVideos.map((video) => (
                <tr key={video.id} className="hover:bg-[#2a2a2a] transition-colors group">
                  <td className="p-4 max-w-xs">
                    <div className="flex gap-4 items-center">
                      <div className={`w-24 h-14 rounded bg-gradient-to-br ${video.thumbnailGradient} flex-shrink-0 relative overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                         <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded text-white font-mono">HD</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors cursor-pointer">{video.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{video.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 rounded">{video.genre}</span>
                           <span className="text-[10px] text-slate-500">Quality: {video.quality}%</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-green-500 text-xs">
                       <Eye size={14} />
                       <span>Public</span>
                    </div>
                  </td>
                  <td className="p-4 text-right text-slate-400 font-mono text-xs">
                     Day {video.dayPublished}
                  </td>
                  <td className="p-4 text-right text-slate-200 font-medium">
                     <LiveNumber value={video.views} />
                  </td>
                  <td className="p-4 text-right text-slate-400">
                     {video.comments.length}
                  </td>
                  <td className="p-4 text-right">
                     <div className="flex items-center justify-end gap-3">
                        <span className="flex items-center gap-1 text-slate-300 text-xs"><ThumbsUp size={12}/> {video.likes}</span>
                     </div>
                     <div className="w-full bg-slate-700 h-1 rounded-full mt-1 overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${(video.likes / (video.likes + video.dislikes || 1)) * 100}%` }}></div>
                     </div>
                  </td>
                  <td className="p-4 text-right text-green-400 font-bold font-mono">
                     $<LiveNumber value={Math.floor(video.earnings)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
import { PlaySquare } from 'lucide-react';
