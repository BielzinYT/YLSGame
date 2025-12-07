
import React from 'react';
import { Video, Rival, GameState } from '../types';
import { StudioVisuals } from './StudioVisuals';
import { StreamChat } from './StreamChat';
import { RecordingMinigame } from './RecordingMinigame';
import { Disc, Camera, Upload, DollarSign, Briefcase, Moon, Monitor, TrendingUp } from 'lucide-react';
import { VideoGenre } from '../types';

interface DashboardProps {
  gameState: GameState;
  // Visual/Chat Props
  chatMessages: any[];
  isProcessing: boolean;
  actionStatus: string | null;
  
  // Actions
  onStartRecording: (genre?: VideoGenre) => void;
  onEditAndUpload: () => void;
  onSleep: () => void;
  onWork: () => void;
  
  // Interaction State
  selectedGenre: VideoGenre;
  setSelectedGenre: (g: VideoGenre) => void;
  showMinigame: boolean;
  handleMinigameComplete: (score: number) => void;
  currentFootage: any;
  editingVibe: string;
  setEditingVibe: (v: string) => void;
  isAutoPlaying: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  gameState, chatMessages, isProcessing, actionStatus,
  onStartRecording, onEditAndUpload, onSleep, onWork,
  selectedGenre, setSelectedGenre, showMinigame, handleMinigameComplete,
  currentFootage, editingVibe, setEditingVibe, isAutoPlaying
}) => {

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-y-auto custom-scrollbar">
       
       <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Channel Overview</h1>
          <div className="flex gap-4 text-sm font-bold text-slate-400 bg-[#1f1f1f] px-4 py-2 rounded-xl border border-[#282828]">
             <span className="flex items-center gap-2 text-green-400"><DollarSign size={14}/> {Math.floor(gameState.money)}</span>
             <span className="w-px bg-[#383838]"></span>
             <span className={`flex items-center gap-2 ${gameState.energy < 30 ? 'text-red-400' : 'text-yellow-400'}`}><ZapIcon percent={gameState.energy} /> {Math.floor(gameState.energy)}%</span>
          </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
          
          {/* Main Visualizer (2 Cols) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
             <div className="bg-[#0F0F0F] border border-[#282828] rounded-[24px] overflow-hidden shadow-2xl relative aspect-video w-full max-h-[500px] flex flex-col ring-4 ring-[#1f1f1f]">
                {/* STUDIO RENDER */}
                <StudioVisuals 
                   equipment={gameState.equipment} 
                   hasLighting={gameState.inventory.hasLighting}
                   hasMicrophone={gameState.inventory.hasMicrophone}
                   isRecording={!!(actionStatus?.includes('Recording') || showMinigame)}
                />
                
                {/* OVERLAYS */}
                {(actionStatus?.includes('Recording') || actionStatus?.includes('Editing') || showMinigame || isAutoPlaying) && (
                    <StreamChat messages={chatMessages} />
                )}

                {/* OBS STATUS BAR */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pointer-events-none">
                   <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow animate-pulse">LIVE</div>
                   <div className="bg-black/60 backdrop-blur text-white text-[10px] font-mono px-2 py-1 rounded border border-white/10">
                      REC: {gameState.equipment}
                   </div>
                </div>

                {/* INTERACTIVE LAYER */}
                <div className="flex-1 flex flex-col justify-center relative z-10 p-6 lg:p-10">
                   {showMinigame ? (
                      <RecordingMinigame onComplete={handleMinigameComplete} difficulty={gameState.level > 5 ? 2 : 1} />
                   ) : currentFootage ? (
                     // EDITING UI
                     <div className="bg-[#1f1f1f]/95 backdrop-blur-xl border border-[#383838] p-6 rounded-2xl max-w-sm mx-auto w-full shadow-2xl animate-scale-in">
                        <div className="text-center mb-6">
                           <Monitor size={40} className="mx-auto text-blue-500 mb-2" />
                           <h3 className="text-white font-bold text-lg">Post-Production</h3>
                           <p className="text-slate-400 text-xs">{currentFootage.genre} • Quality Potential: {currentFootage.qualityMod}%</p>
                        </div>
                        
                        <div className="space-y-4">
                           <div className="grid grid-cols-3 gap-2">
                              {['Standard', 'Funny', 'Cinematic'].map(v => (
                                 <button key={v} onClick={() => setEditingVibe(v)} className={`text-[10px] py-2 rounded border font-bold transition-all ${editingVibe === v ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#282828] border-transparent text-slate-400'}`}>
                                    {v}
                                 </button>
                              ))}
                           </div>
                           <button onClick={onEditAndUpload} disabled={isProcessing} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                              {isProcessing ? 'Rendering...' : 'Upload Video'}
                           </button>
                        </div>
                     </div>
                   ) : (
                     // RECORDING UI
                     <div className="bg-[#1f1f1f]/90 backdrop-blur-md border border-[#383838] p-6 rounded-2xl max-w-lg mx-auto w-full shadow-xl">
                        <div className="grid grid-cols-3 gap-2 mb-4">
                           {Object.values(VideoGenre).map(g => (
                              <button 
                                key={g}
                                onClick={() => setSelectedGenre(g)}
                                disabled={isProcessing}
                                className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${selectedGenre === g ? 'bg-[#282828] border-red-500 text-white' : 'bg-transparent border-transparent text-slate-500 hover:bg-[#282828]'}`}
                              >
                                 <Disc size={14} className={selectedGenre === g ? "text-red-500 animate-spin-slow" : ""} />
                                 <span className="text-[10px] font-bold">{g}</span>
                              </button>
                           ))}
                        </div>
                        <button 
                           onClick={() => onStartRecording()}
                           disabled={isProcessing || gameState.energy < 5}
                           className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale"
                        >
                           <Camera size={20} className="group-hover:scale-110 transition-transform" />
                           <span>START RECORDING</span>
                        </button>
                     </div>
                   )}
                </div>
             </div>
             
             {/* Quick Stats Summary */}
             <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1f1f1f] border border-[#282828] p-4 rounded-xl">
                   <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Views</div>
                   <div className="text-white text-xl font-bold">{gameState.totalViews.toLocaleString()}</div>
                </div>
                <div className="bg-[#1f1f1f] border border-[#282828] p-4 rounded-xl">
                   <div className="text-slate-500 text-xs font-bold uppercase mb-1">Avg Likes</div>
                   <div className="text-white text-xl font-bold">
                      {Math.floor(gameState.videos.reduce((acc, v) => acc + v.likes, 0) / (gameState.videos.length || 1))}
                   </div>
                </div>
                <div className="bg-[#1f1f1f] border border-[#282828] p-4 rounded-xl">
                   <div className="text-slate-500 text-xs font-bold uppercase mb-1">Trend</div>
                   <div className="text-red-400 text-sm font-bold flex items-center gap-1"><TrendingUp size={14}/> {gameState.currentTrend}</div>
                </div>
             </div>
          </div>

          {/* Right Panel: Life Management (1 Col) */}
          <div className="space-y-6">
             <div className="bg-[#1f1f1f] border border-[#282828] rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                   <button onClick={onWork} disabled={isProcessing} className="w-full bg-[#282828] hover:bg-[#383838] p-4 rounded-xl flex items-center gap-4 transition-all border border-transparent hover:border-slate-600 text-left group">
                      <div className="bg-green-900/30 p-2 rounded-lg text-green-400 group-hover:scale-110 transition-transform"><Briefcase size={20}/></div>
                      <div>
                         <div className="text-sm font-bold text-white">Freelance Work</div>
                         <div className="text-xs text-slate-500">+${45} Money</div>
                      </div>
                   </button>
                   <button onClick={onSleep} disabled={isProcessing} className="w-full bg-[#282828] hover:bg-[#383838] p-4 rounded-xl flex items-center gap-4 transition-all border border-transparent hover:border-slate-600 text-left group">
                      <div className="bg-purple-900/30 p-2 rounded-lg text-purple-400 group-hover:scale-110 transition-transform"><Moon size={20}/></div>
                      <div>
                         <div className="text-sm font-bold text-white">Sleep</div>
                         <div className="text-xs text-slate-500">Recover Energy</div>
                      </div>
                   </button>
                </div>
             </div>

             {/* Goal / Next Step */}
             <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6">
                <h4 className="text-blue-400 text-xs font-bold uppercase mb-2">Next Milestone</h4>
                <div className="text-white font-bold text-2xl mb-1">{gameState.subscribers < 1000 ? '1,000' : '10,000'} Subs</div>
                <div className="w-full bg-[#0F0F0F] h-2 rounded-full overflow-hidden mt-2">
                   <div className="bg-blue-500 h-full" style={{ width: `${(gameState.subscribers % 1000) / 10}%` }}></div>
                </div>
                <p className="text-slate-500 text-xs mt-2">Unlock new sponsors at higher tiers.</p>
             </div>
          </div>

       </div>
    </div>
  );
};

const ZapIcon = ({ percent }: { percent: number }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);
