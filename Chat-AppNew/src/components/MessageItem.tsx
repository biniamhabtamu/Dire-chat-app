// src/components/MessageItem.tsx
import React from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-semibold">
          {message.user_email.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white">
            {message.user_email}
          </span>
          <span className="text-xs text-gray-400">
            {formatTime(message.created_at)}
          </span>
        </div>
        <div className="text-gray-300 leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;