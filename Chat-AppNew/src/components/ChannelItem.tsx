// src/components/ChannelItem.tsx
import React from 'react';
import { Hash } from 'lucide-react';
import { Channel, Conversation } from '../types';

interface ChannelItemProps {
  channel: Channel;
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation) => void;
}

const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  activeConversation,
  setActiveConversation
}) => {
  const isActive = activeConversation?.type === 'channel' && 
                  activeConversation.id === channel.id;

  return (
    <button
      onClick={() => setActiveConversation({
        type: 'channel',
        id: channel.id,
        name: channel.name,
        description: channel.description
      })}
      className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 group ${
        isActive
          ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white shadow-md'
          : 'text-gray-300 hover:bg-slate-700/50'
      }`}
    >
      <div className={`p-1.5 rounded-lg ${
        isActive 
          ? 'bg-white/20' 
          : 'bg-slate-700 group-hover:bg-slate-600'
      }`}>
        <Hash className="w-4 h-4" />
      </div>
      <div className="flex-1 truncate">{channel.name}</div>
      {channel.unread && (
        <span className="bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
          {channel.unread}
        </span>
      )}
    </button>
  );
};

export default ChannelItem;