// src/components/DirectMessageItem.tsx
import React from 'react';
import { DirectMessage, Conversation } from '../types';

interface DirectMessageItemProps {
  dm: DirectMessage;
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation) => void;
  setDirectMessages: React.Dispatch<React.SetStateAction<DirectMessage[]>>;
}

const DirectMessageItem: React.FC<DirectMessageItemProps> = ({
  dm,
  activeConversation,
  setActiveConversation,
  setDirectMessages
}) => {
  const isActive = activeConversation?.type === 'dm' && 
                  activeConversation.id === dm.email;

  return (
    <button
      onClick={() => {
        // Reset unread count when opening conversation
        setDirectMessages(prev => prev.map(d => 
          d.email === dm.email ? {...d, unread: 0} : d
        ))
        setActiveConversation({
          type: 'dm',
          id: dm.email,
          name: dm.name
        })
      }}
      className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors group ${
        isActive
          ? 'bg-cyan-600/20 text-white'
          : 'text-gray-300 hover:bg-slate-700/50'
      }`}
    >
      <div className="relative">
        <div className="bg-gradient-to-br from-cyan-500 to-teal-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white">
          {dm.name[0]}
        </div>
        {dm.online && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-800"></div>
        )}
      </div>
      <div className="flex-1 truncate">{dm.name}</div>
      {dm.unread > 0 && (
        <span className="bg-cyan-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          {dm.unread}
        </span>
      )}
    </button>
  );
};

export default DirectMessageItem;