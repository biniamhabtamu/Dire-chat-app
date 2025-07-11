// src/components/Sidebar.tsx
import React from 'react';
import { 
  MessageSquare, 
  Search, 
  Hash, 
  Plus, 
  User, 
  LogOut, 
  Settings 
} from 'lucide-react';
import { 
  SidebarProps, 
  DirectMessage, 
  Conversation 
} from '../types';
import ChannelItem from './ChannelItem';
import DirectMessageItem from './DirectMessageItem';
import UserStatus from './UserStatus';

const Sidebar: React.FC<SidebarProps> = ({
  user,
  channels,
  directMessages,
  activeConversation,
  searchTerm,
  setSearchTerm,
  setActiveConversation,
  createChannel,
  createDirectMessage,
  openSettings,
  onSignOut,
  setDirectMessages
}) => {
  const userName = user.email.split('@')[0];
  
  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
              <MessageSquare className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
              Dire-Chat
            </h1>
          </div>
          <button
            onClick={onSignOut}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors group"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-purple-300 transition-colors" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {user.email[0].toUpperCase()}
          </div>
          <div className="text-gray-400 truncate">
            {user.email}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
              <Hash className="w-4 h-4 text-purple-400" />
              Channels
            </h2>
            <button
              onClick={createChannel}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              title="Create Channel"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {channels.map((channel) => (
              <ChannelItem 
                key={channel.id}
                channel={channel}
                activeConversation={activeConversation}
                setActiveConversation={setActiveConversation}
              />
            ))}
          </div>
        </div>
        
        {/* Direct Messages Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
              <User className="w-4 h-4 text-cyan-400" />
              Direct Messages
            </h2>
            <button 
              onClick={createDirectMessage}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              title="New Message"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {directMessages.map((dm) => (
              <DirectMessageItem
                key={dm.id}
                dm={dm}
                activeConversation={activeConversation}
                setActiveConversation={setActiveConversation}
                setDirectMessages={setDirectMessages}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* User Status */}
      <UserStatus 
        user={user} 
        userName={userName} 
        openSettings={openSettings} 
      />
    </div>
  );
};

export default Sidebar;