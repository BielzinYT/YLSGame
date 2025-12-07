
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface StreamChatProps {
  messages: ChatMessage[];
}

export const StreamChat: React.FC<StreamChatProps> = ({ messages }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="absolute bottom-4 right-4 w-64 h-56 pointer-events-none z-20 flex flex-col justify-end">
       <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-2xl overflow-hidden mask-gradient-top">
          <div className="space-y-2 flex flex-col justify-end min-h-0">
            {messages.slice(-8).map((msg) => (
                <div key={msg.id} className="text-[11px] animate-fade-in flex items-start gap-1.5 leading-tight">
                    <span style={{ color: msg.color }} className="font-bold whitespace-nowrap drop-shadow-sm">{msg.user}:</span>
                    <span className="text-slate-100 drop-shadow-md break-words">{msg.text}</span>
                </div>
            ))}
            <div ref={endRef} />
          </div>
       </div>
    </div>
  );
};
