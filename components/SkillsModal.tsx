import React from 'react';
import { Perk } from '../types';
import { Zap, DollarSign, Eye, Star, Lock, Check } from 'lucide-react';

interface SkillsModalProps {
  perks: Perk[];
  skillPoints: number;
  onUnlock: (perkId: string) => void;
  onClose: () => void;
}

export const SkillsModal: React.FC<SkillsModalProps> = ({ perks, skillPoints, onUnlock, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Zap className="text-emerald-400" /> Talent Tree
            </h2>
            <p className="text-slate-400 text-sm mt-1">Upgrade your creator abilities</p>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-500 uppercase font-bold mr-2">Available Points</span>
            <span className="text-xl font-bold text-emerald-400">{skillPoints}</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {perks.map((perk) => {
            const canAfford = skillPoints >= perk.cost;
            
            return (
              <div 
                key={perk.id} 
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  perk.unlocked 
                    ? 'bg-emerald-900/20 border-emerald-500/50' 
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-lg ${perk.unlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {perk.effect.includes('energy') ? <Zap size={18} /> : 
                     perk.effect.includes('money') ? <DollarSign size={18} /> :
                     perk.effect.includes('view') ? <Eye size={18} /> : <Star size={18} />}
                  </div>
                  {perk.unlocked ? (
                    <Check size={20} className="text-emerald-500" />
                  ) : (
                    <div className="flex items-center gap-1 text-slate-400 text-sm font-mono bg-slate-900 px-2 py-1 rounded">
                      <span>{perk.cost}</span> <span className="text-[10px]">SP</span>
                    </div>
                  )}
                </div>
                
                <h3 className={`font-bold ${perk.unlocked ? 'text-emerald-300' : 'text-slate-200'}`}>{perk.name}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4 leading-tight">{perk.description}</p>
                
                {!perk.unlocked && (
                  <button
                    onClick={() => onUnlock(perk.id)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                      ${canAfford 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                  >
                    {canAfford ? 'Unlock' : 'Not Enough Points'} {!canAfford && <Lock size={12} />}
                  </button>
                )}
                
                {perk.unlocked && (
                  <div className="w-full py-2 text-center text-xs font-bold text-emerald-500 uppercase tracking-wider bg-emerald-900/10 rounded-lg">
                    Active
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};