import React from 'react';
import { Video } from '../types';
import { ThumbsUp, Eye, DollarSign, MoreVertical } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  compact?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, compact = false }) => {
  if (compact) {
    return (
      <div className="flex gap-3 p-2 hover:bg-slate-800/50 rounded-lg transition-colors cursor-default group">
        <div className={`w-24 h-14 rounded-md bg-gradient-to-br ${video.thumbnailGradient} flex-shrink-0 relative overflow-hidden`}>
           <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded text-white font-mono">
             {Math.floor(video.quality / 10)}:00
           </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
            {video.title}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">{video.views.toLocaleString()} views • {video.dayPublished} days ago</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 group">
      {/* Thumbnail */}
      <div className={`w-full aspect-video rounded-xl bg-gradient-to-br ${video.thumbnailGradient} relative shadow-lg group-hover:shadow-blue-900/20 transition-all duration-300`}>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px] rounded-xl">
           <span className="bg-white/90 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">Watch Now</span>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-xs px-1.5 py-0.5 rounded text-white font-mono">
          HD • {video.quality}%
        </div>
      </div>
      
      {/* Meta */}
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-600">
           {video.genre[0]}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold leading-tight mb-1 group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-sm text-slate-400 mb-1 line-clamp-2">{video.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
             <span className="flex items-center gap-1"><Eye size={12} /> {video.views.toLocaleString()}</span>
             <span className="flex items-center gap-1 text-green-400"><DollarSign size={12} /> {video.earnings}</span>
             <span className="flex items-center gap-1"><ThumbsUp size={12} /> {video.likes}</span>
          </div>
        </div>
        <button className="text-slate-500 hover:text-white">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};