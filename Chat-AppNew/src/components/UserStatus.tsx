// src/components/UserStatus.tsx
import React from 'react';
import { Settings } from 'lucide-react';

interface UserStatusProps {
  user: any;
  userName: string;
  openSettings: () => void;
}

const UserStatus: React.FC<UserStatusProps> = ({ 
  user, 
  userName, 
  openSettings 
}) => {
  return (
    <div className="p-4 border-t border-slate-800 bg-slate-900/30 flex items-center gap-3">
      <div className="relative">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white">
          {user.email[0].toUpperCase()}
        </div>
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-200 truncate">{userName}</div>
        <div className="text-xs text-green-500 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Online
        </div>
      </div>
      <button 
        onClick={openSettings}
        className="p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-cyan-300 transition-colors"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};

export default UserStatus;