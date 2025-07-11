// src/components/MessageItem.tsx
import React from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  currentUser: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, currentUser }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCurrentUser = message.user_id === currentUser;

  return (
    <div className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
      {!isCurrentUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {message.user_email.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      <div className={`max-w-[80%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1">
          {!isCurrentUser && (
            <span className="font-semibold text-white">
              {message.user_email}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {formatTime(message.created_at)}
          </span>
        </div>
        <div className={`
          p-3 rounded-lg leading-relaxed break-words
          ${isCurrentUser 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none' 
            : 'bg-slate-700 text-gray-300 rounded-bl-none'
          }`}
        >
          {message.content}
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {message.user_email.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageItem;