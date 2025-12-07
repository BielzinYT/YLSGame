
import React, { useState } from 'react';
import { Video, Comment } from '../types';
import { Heart, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface CommentsTabProps {
  videos: Video[];
  onHeartComment: (videoId: string, commentIndex: number) => void;
}

export const CommentsTab: React.FC<CommentsTabProps> = ({ videos, onHeartComment }) => {
  const [filter, setFilter] = useState<'ALL' | 'HEARTED'>('ALL');

  // Flatten comments
  const allComments = videos.flatMap(v => 
    v.comments.map((c, idx) => ({ 
        ...c, 
        videoTitle: v.title, 
        videoId: v.id, 
        originalIndex: idx,
        videoTimestamp: v.timestamp
    }))
  ).sort((a, b) => b.videoTimestamp - a.videoTimestamp);

  const filteredComments = filter === 'ALL' ? allComments : allComments.filter(c => c.isHearted);

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Latest Comments</h2>
          <div className="flex bg-[#1f1f1f] rounded-lg p-1 border border-[#282828]">
             <button 
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${filter === 'ALL' ? 'bg-[#383838] text-white' : 'text-slate-500 hover:text-slate-300'}`}
             >
                All
             </button>
             <button 
                onClick={() => setFilter('HEARTED')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${filter === 'HEARTED' ? 'bg-[#383838] text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Hearted
             </button>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {filteredComments.length === 0 ? (
             <div className="text-center py-20 text-slate-500">
                <MessageSquare size={40} className="mx-auto mb-2 opacity-50" />
                <p>No comments found.</p>
             </div>
          ) : (
            filteredComments.map((comment, i) => (
               <div key={`${comment.videoId}-${i}`} className="bg-[#1f1f1f] border border-[#282828] p-4 rounded-xl flex gap-4 hover:border-[#383838] transition-colors group">
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm ${comment.sentiment === 'positive' ? 'bg-green-600' : comment.sentiment === 'negative' ? 'bg-red-600' : 'bg-slate-600'}`}>
                     {comment.user[0]}
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200 text-sm">{comment.user}</span>
                            <span className="text-[10px] text-slate-500">• on "{comment.videoTitle}"</span>
                        </div>
                        <span className="text-[10px] text-slate-600">Just now</span>
                     </div>
                     <p className="text-slate-300 text-sm mt-1">{comment.text}</p>
                     
                     <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors text-xs">
                           <ThumbsUp size={14} /> <span>{Math.floor(Math.random() * 50)}</span>
                        </button>
                        <button className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors text-xs">
                           <ThumbsDown size={14} />
                        </button>
                        
                        <div className="h-4 w-[1px] bg-[#383838]"></div>

                        <button 
                           onClick={() => onHeartComment(comment.videoId, comment.originalIndex)}
                           disabled={comment.isHearted}
                           className={`p-1.5 rounded-full transition-all flex items-center gap-1 ${comment.isHearted ? 'text-red-500 bg-red-500/10 cursor-default' : 'text-slate-500 hover:text-red-500 hover:bg-red-500/10'}`}
                           title={comment.isHearted ? "Hearted by creator" : "Heart this comment"}
                        >
                           <Heart size={16} fill={comment.isHearted ? "currentColor" : "none"} />
                           {comment.isHearted && <div className="w-4 h-4 rounded-full bg-blue-500 border border-black absolute -top-1 -right-1"></div>}
                        </button>
                     </div>
                  </div>
               </div>
            ))
          )}
       </div>
    </div>
  );
};
