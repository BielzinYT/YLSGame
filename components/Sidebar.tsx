
import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, PlaySquare, MessageSquare, ShoppingBag, BarChart2, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  channelName: string;
  channelInitial: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, channelName, channelInitial }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'CONTENT', label: 'Content', icon: PlaySquare },
    { id: 'COMMENTS', label: 'Comments', icon: MessageSquare },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart2 },
    { id: 'SHOP', label: 'Upgrades', icon: ShoppingBag },
  ];

  return (
    <div className="w-20 lg:w-64 bg-[#0F0F0F] border-r border-[#282828] flex flex-col h-full flex-shrink-0 z-30">
      {/* Brand / Logo Area */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-[#282828]">
        <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
          <PlaySquare size={16} fill="white" />
        </div>
        <span className="hidden lg:block ml-3 font-bold text-white tracking-tight text-lg">Studio</span>
      </div>

      {/* Channel Profile Mini */}
      <div className="p-4 flex flex-col items-center lg:flex-row lg:items-center lg:gap-3 border-b border-[#282828] mb-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
            {channelInitial}
        </div>
        <div className="hidden lg:block overflow-hidden">
            <h3 className="text-sm font-bold text-white truncate">{channelName}</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Your Channel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-2 overflow-y-auto custom-scrollbar px-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative ${
                isActive 
                  ? 'bg-[#282828] text-white shadow-inner' 
                  : 'text-slate-400 hover:bg-[#1f1f1f] hover:text-slate-100'
              }`}
            >
              {isActive && (
                 <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
              )}
              <item.icon size={22} className={`${isActive ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-100'}`} />
              <span className={`hidden lg:block text-sm font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#282828] space-y-2">
        <button className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-2 text-slate-500 hover:text-white transition-colors">
            <Settings size={20} />
            <span className="hidden lg:block text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
};
