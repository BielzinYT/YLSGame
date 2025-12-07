
import React from 'react';
import { EquipmentLevel } from '../types';
import { Monitor, Camera, Mic, Lamp, Coffee, Cpu } from 'lucide-react';

interface StudioVisualsProps {
  equipment: EquipmentLevel;
  hasLighting: boolean;
  hasMicrophone: boolean;
  isRecording: boolean;
}

export const StudioVisuals: React.FC<StudioVisualsProps> = ({ equipment, hasLighting, hasMicrophone, isRecording }) => {
  
  const getEnvironment = () => {
    if (equipment === EquipmentLevel.SMARTPHONE) return 'Bedroom';
    if (equipment === EquipmentLevel.WEBCAM) return 'Home Office';
    if (equipment === EquipmentLevel.DSLR) return 'Pro Studio';
    return 'Cinema Set';
  };

  const env = getEnvironment();

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Background Ambience */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${
        env === 'Bedroom' ? 'bg-[#1a1a2e]' : 
        env === 'Home Office' ? 'bg-[#16213e]' :
        'bg-[#0f0f1a]'
      }`} />

      {/* Dynamic Elements based on progression */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg">
        
        {/* DESK SETUP */}
        <div className="absolute bottom-0 left-10 right-10 h-6 bg-[#2d3748] rounded-t-lg shadow-2xl border-t border-slate-600" />
        
        {/* MONITOR */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            {env === 'Bedroom' ? (
                 <div className="w-20 h-32 bg-slate-800 border-4 border-slate-600 rounded-lg relative flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping absolute top-2 right-2 opacity-50"></div>
                 </div>
            ) : env === 'Home Office' ? (
                 <Monitor size={140} className="text-slate-400 drop-shadow-xl" strokeWidth={1} />
            ) : (
                 <div className="flex items-end gap-2 drop-shadow-2xl">
                    <Monitor size={160} className="text-slate-300" strokeWidth={1} />
                    <Monitor size={120} className="text-slate-500 -rotate-12 transform origin-bottom-right opacity-80" strokeWidth={1} />
                 </div>
            )}
        </div>

        {/* CAMERA */}
        <div className="absolute bottom-24 left-1/4 transform -translate-x-1/2 transition-all duration-500 z-10">
           {equipment === EquipmentLevel.SMARTPHONE ? (
               <div className="w-10 h-16 bg-slate-400 rounded-md border-2 border-slate-200 shadow-md" />
           ) : equipment === EquipmentLevel.WEBCAM ? (
               <div className="w-12 h-4 bg-black rounded-full absolute -bottom-1 left-1/2 shadow-sm" /> 
           ) : (
               <Camera size={80} className={`${isRecording ? 'text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-slate-300'}`} />
           )}
        </div>

        {/* ITEMS */}
        {hasMicrophone && (
            <div className="absolute bottom-24 right-1/4 transform translate-x-1/2 z-10">
                <Mic size={56} className="text-slate-200 drop-shadow-lg" />
            </div>
        )}

        {hasLighting && (
            <div className="absolute top-10 left-10 opacity-80">
                <Lamp size={80} className={`${isRecording ? 'text-yellow-100 drop-shadow-[0_10px_40px_rgba(250,204,21,0.6)]' : 'text-slate-600'}`} />
            </div>
        )}

        {/* DECOR */}
        {env !== 'Bedroom' && (
             <div className="absolute bottom-6 right-12 opacity-50">
                 <Cpu size={40} className="text-blue-500" />
             </div>
        )}
        
        <div className="absolute bottom-6 left-12 opacity-80">
             <Coffee size={28} className="text-slate-400" />
        </div>

      </div>
    </div>
  );
};
