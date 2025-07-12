// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { 
  MessageSquare, 
  Search, 
  Hash, 
  Plus, 
  User, 
  LogOut, 
  Settings,
  X,
  Menu
} from 'lucide-react';
import { 
  SidebarProps, 
  DirectMessage 
} from '../types';
import ChannelItem from './ChannelItem';
import DirectMessageItem from './DirectMessageItem';
import { supabase } from '../lib/supabase';

const Sidebar: React.FC<SidebarProps> = ({
  user,
  channels,
  directMessages,
  activeConversation,
  setActiveConversation,
  createChannel,
  createDirectMessage,
  openSettings,
  onSignOut,
  setDirectMessages

  
  


}) => {

   const navigate = useNavigate();
  
  // Create settings navigation function
  const openSettings = () => {
    navigate('/settings');

  const userName = user.email.split('@')[0];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Check if mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Auto-collapse on mobile when conversation is selected
  useEffect(() => {
    if (isMobile && activeConversation) {
      setIsCollapsed(true);
    }
  }, [activeConversation, isMobile]);

  // Search for users
  useEffect(() => {
    if (userSearch.trim() === '') {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, avatar_url')
        .or(`username.ilike.%${userSearch}%,email.ilike.%${userSearch}%`)
        .limit(5);

      if (!error && data) {
        setSearchResults(data.filter(u => u.id !== user.id));
      }
      setIsSearching(false);
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [userSearch, user.id]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const startNewConversation = async (contact: any) => {
    const existing = directMessages.find(dm => dm.email === contact.email);
    
    if (existing) {
      setActiveConversation({
        type: 'dm',
        id: contact.email,
        name: contact.username || contact.email.split('@')[0]
      });
      setUserSearch('');
      return;
    }

    // Add to direct messages
    const newContact = {
      id: Date.now(),
      email: contact.email,
      name: contact.username || contact.email.split('@')[0],
      online: true,
      unread: 0
    };

    setDirectMessages(prev => [...prev, newContact]);
    
    // Create conversation in Supabase
    await supabase
      .from('direct_message_conversations')
      .upsert([{
        user1_id: user.id,
        user2_id: contact.id,
        last_message_at: new Date().toISOString()
      }]);

    setActiveConversation({
      type: 'dm',
      id: newContact.email,
      name: newContact.name
    });

    setUserSearch('');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`
          fixed z-30 top-4 left-4 p-2 rounded-full 
          bg-gradient-to-r from-purple-600 to-indigo-600 
          text-white shadow-lg transition-all duration-300
          hover:from-purple-700 hover:to-indigo-700
          ${isCollapsed ? 'opacity-100' : 'md:opacity-0 md:pointer-events-none'}
          ${isMobile ? 'opacity-100' : ''}
        `}
      >
        {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </button>

      {/* Sidebar Container */}
      <div 
        className={`
          fixed md:relative inset-y-0 left-0 z-20
          w-80 bg-gradient-to-b from-slate-900 to-slate-800 
          border-r border-slate-700 flex flex-col shadow-xl
          transition-all duration-300 ease-in-out
          ${isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 relative">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={toggleSidebar}
              className="flex items-center gap-2 group"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg group-hover:from-purple-700 group-hover:to-indigo-700 transition-colors">
                <MessageSquare className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                Dire-Chat
              </h1>
            </button>
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
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          
          {/* Search Results */}
          {userSearch && (
            <div className="absolute z-10 w-[calc(100%-2rem)] mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
              {isSearching ? (
                <div className="p-4 flex justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map(user => (
                    <div 
                      key={user.id}
                      onClick={() => startNewConversation(user)}
                      className="px-4 py-2 flex items-center gap-3 hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="bg-gradient-to-br from-cyan-500 to-teal-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-gray-200 font-medium">
                          {user.username || user.email.split('@')[0]}
                        </div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-gray-400 text-center">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Channels Section */}
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
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {user.email[0].toUpperCase()}
              </div>
              <div>
                <div className="text-gray-200 font-medium">{userName}</div>
                <div className="text-xs text-gray-400">Online</div>
              </div>
            </div>
            
            {/* Settings button */}
            <button
              onClick={openSettings}
              className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-purple-300 transition-colors"
              title="Settings"
            >
              <Settings onClick='window.loacation.href=""' className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;