
import React from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <i className="fas fa-search"></i>
        </span>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search contracts or blueprints..." 
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <i className="fas fa-times-circle"></i>
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
      <i className="fas fa-user text-slate-400 text-xs"></i>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">Shuchitha</p>
            <p className="text-xs text-slate-500">Legal Admin</p>
          </div>
          <img src="../screenshots/my-pic.png" alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" />
        </div>
      </div>
    </header>
  );
};

export default Header;
