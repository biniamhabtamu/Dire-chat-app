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
      onClick={() =>
        setActiveConversation({
          type: 'channel',
          id: channel.id,
          name: channel.name,
          description: channel.description
        })
      }
      aria-label={`Channel ${channel.name}`}
      title={`${channel.name} - ${channel.description}`}
      className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 group relative overflow-hidden ${
        isActive
          ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white shadow-md border-l-4 border-cyan-300'
          : 'text-gray-300 hover:bg-slate-700/50'
      }`}
    >
      {/* Icon container */}
      <div
        className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
          isActive
            ? 'bg-white/20'
            : 'bg-slate-700 group-hover:bg-slate-600'
        }`}
      >
        <Hash className="w-4 h-4" />
      </div>

      {/* Channel name */}
      <div className="flex-1 truncate text-sm font-medium">
        {channel.name}
      </div>

      {/* Unread badge */}
      {channel.unread > 0 && (
        <span
          className="animate-bounce bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center shadow-md"
          aria-label={`${channel.unread} unread messages`}
        >
          {channel.unread}
        </span>
      )}
    </button>
  );
};

export default ChannelItem;
