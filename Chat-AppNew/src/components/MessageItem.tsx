// src/components/MessageItem.tsx
import React from 'react';
import { Edit, Trash2, Reply } from 'lucide-react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  currentUser: string;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onReply: (message: Message) => void;
  isEditing?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  currentUser,
  onEdit,
  onDelete,
  onReply,
  isEditing
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCurrentUser = message.user_id === currentUser;

  return (
    <div className={`flex items-start gap-3 group ${isCurrentUser ? 'justify-end' : ''}`}>
      {!isCurrentUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {message.user_email.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      <div className={`max-w-[80%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <div className="font-medium text-gray-300 mb-1">
            {message.user_email.split('@')[0]}
          </div>
        )}
        
        <div className={`
          p-3 rounded-lg leading-relaxed break-words relative
          ${isCurrentUser 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none' 
            : 'bg-slate-700 text-gray-300 rounded-bl-none'
          }
          ${isEditing ? 'ring-2 ring-cyan-500' : ''}
        `}>
          {message.content}
          
          {!isEditing && (
            <div className={`
              absolute -right-8 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity
              ${isCurrentUser ? 'flex-row-reverse -left-8 right-auto' : ''}
            `}>
              <button 
                onClick={() => onReply(message)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-purple-400 transition-colors"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>
              
              {isCurrentUser && (
                <>
                  <button 
                    onClick={() => onEdit(message)}
                    className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-cyan-400 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(message.id)}
                    className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          {formatTime(message.created_at)}
          {message.updated_at && message.updated_at !== message.created_at && (
            <span className="ml-2 italic">(edited)</span>
          )}
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