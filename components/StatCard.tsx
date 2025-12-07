import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subValue?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color = "text-blue-400", subValue, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-slate-800 ${onClick ? 'cursor-pointer hover:border-slate-600' : ''}`}
    >
      <div className={`p-3 rounded-lg bg-slate-800 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider leading-none mb-1">{label}</p>
        <h3 className="text-xl font-bold text-white leading-none">{value}</h3>
        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
      </div>
    </div>
  );
};