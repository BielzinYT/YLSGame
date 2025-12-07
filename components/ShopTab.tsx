
import React from 'react';
import { GameState, EquipmentLevel, Perk } from '../types';
import { EQUIPMENT_COSTS } from '../constants';
import { ShoppingBag, Camera, Mic, Monitor, Zap, Check, Lock, Star } from 'lucide-react';
import { LiveNumber } from './LiveNumber';

interface ShopTabProps {
  gameState: GameState;
  onBuyUpgrade: (type: 'equipment' | 'item', key: string, cost: number) => void;
  onUnlockPerk: (perkId: string) => void;
}

export const ShopTab: React.FC<ShopTabProps> = ({ gameState, onBuyUpgrade, onUnlockPerk }) => {
  const levels = Object.values(EquipmentLevel);
  const currentLevelIdx = levels.indexOf(gameState.equipment);

  return (
    <div className="p-6 space-y-8 animate-fade-in h-full overflow-y-auto custom-scrollbar">
       
       {/* Header */}
       <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <ShoppingBag className="text-yellow-400" /> Creator Store
            </h2>
            <p className="text-slate-400 mt-1">Invest in your career to grow faster.</p>
          </div>
          <div className="text-right">
             <div className="text-xs text-slate-500 uppercase font-bold">Available Funds</div>
             <div className="text-3xl font-mono text-green-400 font-bold">$<LiveNumber value={Math.floor(gameState.money)} /></div>
          </div>
       </div>

       {/* Equipment Section */}
       <section>
          <h3 className="text-lg font-bold text-white mb-4 border-b border-[#282828] pb-2">Camera Gear</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
             {levels.map((level, idx) => {
                const cost = EQUIPMENT_COSTS[level] || 0;
                const isOwned = idx <= currentLevelIdx;
                const isNext = idx === currentLevelIdx + 1;
                const isLocked = idx > currentLevelIdx + 1;

                return (
                   <div key={level} className={`bg-[#1f1f1f] border rounded-xl p-5 relative overflow-hidden transition-all ${isOwned ? 'border-green-500/30 bg-green-900/10' : isNext ? 'border-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-[#282828] opacity-60'}`}>
                      <div className="flex justify-between items-start mb-4">
                         <div className={`p-3 rounded-xl ${isOwned ? 'bg-green-500 text-black' : 'bg-[#282828] text-slate-300'}`}>
                            <Camera size={24} />
                         </div>
                         {isOwned && <div className="text-green-500"><Check size={20} /></div>}
                         {isLocked && <div className="text-slate-600"><Lock size={20} /></div>}
                      </div>
                      
                      <h4 className="text-white font-bold text-lg">{level}</h4>
                      <p className="text-xs text-slate-400 mb-6">
                         {level === EquipmentLevel.SMARTPHONE ? 'Basic starter gear.' : 
                          level === EquipmentLevel.WEBCAM ? '1080p streaming quality.' :
                          level === EquipmentLevel.DSLR ? 'Professional depth of field.' : 'Hollywood standard 8K.'}
                      </p>

                      {isNext ? (
                         <button 
                            onClick={() => onBuyUpgrade('equipment', level, cost)}
                            disabled={gameState.money < cost}
                            className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                         >
                            Buy ${cost}
                         </button>
                      ) : isOwned ? (
                         <div className="w-full py-2 text-center text-xs font-bold text-green-500 bg-green-500/10 rounded-lg uppercase">Owned</div>
                      ) : (
                         <div className="w-full py-2 text-center text-xs font-bold text-slate-600 bg-[#282828] rounded-lg">Locked</div>
                      )}
                   </div>
                );
             })}
          </div>
       </section>

       {/* Studio Upgrades */}
       <section>
          <h3 className="text-lg font-bold text-white mb-4 border-b border-[#282828] pb-2">Studio Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[
                { id: 'hasMicrophone', name: 'Pro Microphone', icon: Mic, cost: 150, desc: '+5 Quality to all videos.' },
                { id: 'hasLighting', name: 'Softbox Lights', icon: Zap, cost: 100, desc: '+5 Quality & Aesthetic.' },
                { id: 'hasEditor', name: 'Editing Suite', icon: Monitor, cost: 300, desc: '+10 Quality & faster workflow.' }
             ].map((item) => {
                const isOwned = gameState.inventory[item.id as keyof typeof gameState.inventory];
                
                return (
                   <div key={item.id} className={`bg-[#1f1f1f] border rounded-xl p-4 flex flex-col ${isOwned ? 'border-green-500/30' : 'border-[#282828]'}`}>
                      <div className="flex items-center gap-4 mb-4">
                         <div className={`p-3 rounded-lg ${isOwned ? 'bg-green-500/20 text-green-500' : 'bg-[#282828] text-slate-400'}`}>
                            <item.icon size={24} />
                         </div>
                         <div>
                            <h4 className="text-white font-bold">{item.name}</h4>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                         </div>
                      </div>
                      <div className="mt-auto">
                        {isOwned ? (
                           <button disabled className="w-full py-2 bg-[#282828] text-green-500 font-bold rounded-lg text-xs flex items-center justify-center gap-2">
                              <Check size={14} /> Purchased
                           </button>
                        ) : (
                           <button 
                              onClick={() => onBuyUpgrade('item', item.id, item.cost)}
                              disabled={gameState.money < item.cost}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs disabled:opacity-50"
                           >
                              Purchase ${item.cost}
                           </button>
                        )}
                      </div>
                   </div>
                )
             })}
          </div>
       </section>

       {/* Perk Tree Preview */}
       <section>
          <div className="flex justify-between items-center mb-4 border-b border-[#282828] pb-2">
             <h3 className="text-lg font-bold text-white">Talent Tree</h3>
             <div className="text-xs font-bold text-purple-400">{gameState.skillPoints} Points Available</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {gameState.perks.map(perk => (
                <div key={perk.id} className={`p-4 rounded-xl border relative ${perk.unlocked ? 'bg-purple-900/10 border-purple-500/50' : 'bg-[#1f1f1f] border-[#282828]'}`}>
                    <div className="flex justify-between mb-2">
                       <Star size={18} className={perk.unlocked ? "text-purple-400" : "text-slate-600"} />
                       <span className="text-xs font-mono text-slate-500">{perk.cost} SP</span>
                    </div>
                    <h4 className={`font-bold text-sm ${perk.unlocked ? 'text-white' : 'text-slate-300'}`}>{perk.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-3">{perk.description}</p>
                    
                    {!perk.unlocked && (
                       <button 
                          onClick={() => onUnlockPerk(perk.id)}
                          disabled={gameState.skillPoints < perk.cost}
                          className="w-full py-1.5 bg-[#282828] hover:bg-purple-600 text-slate-300 hover:text-white text-xs font-bold rounded transition-colors disabled:opacity-30 disabled:hover:bg-[#282828]"
                       >
                          Unlock
                       </button>
                    )}
                </div>
             ))}
          </div>
       </section>

    </div>
  );
};
