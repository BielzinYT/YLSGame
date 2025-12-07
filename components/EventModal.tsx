import React from 'react';
import { GameEvent } from '../types';
import { AlertTriangle, XCircle } from 'lucide-react';

interface EventModalProps {
  event: GameEvent;
  onChoice: (choiceId: 'A' | 'B') => void;
  isProcessing: boolean;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onChoice, isProcessing }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transform scale-100 animate-slide-up">
        
        <div className="bg-gradient-to-r from-purple-900 to-slate-900 p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <AlertTriangle className="text-yellow-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Event Triggered</h2>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
          <p className="text-slate-400 mb-6 leading-relaxed">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoice(choice.id)}
                disabled={isProcessing}
                className="group relative p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-blue-500 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-400">
                    Option {choice.id}
                  </span>
                </div>
                <div className="text-sm font-medium text-white group-hover:text-blue-100">
                  {choice.label}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {isProcessing && (
           <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
           </div>
        )}
      </div>
    </div>
  );
};