
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'DASHBOARD', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: 'CREATE_BLUEPRINT', icon: 'fa-file-signature', label: 'Blueprint Builder' },
    { id: 'CREATE_CONTRACT', icon: 'fa-plus-circle', label: 'New Contract' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <i className="fas fa-file-contract text-white"></i>
        </div>
        <h1 className="text-xl font-bold tracking-tight">ContractFlow</h1>
      </div>
      <nav className="flex-1 mt-4 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
        &copy; 2026 ContractFlow
      </div>
    </div>
  );
};

export default Sidebar;
