// src/components/MessageItem.tsx
import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Reply, 
  Heart, 
  Smile, 
  Download, 
  File, 
  FileAudio,
  FileImage,
  FileVideo,
  FileText,
  Play,
  Pause,
  MoreVertical
} from 'lucide-react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  currentUser: string;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onReply: (message: Message) => void;
  onReact: (messageId: string, reaction: string) => void;
  isEditing?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  currentUser,
  onEdit,
  onDelete,
  onReply,
  onReact,
  isEditing
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  
  const isCurrentUser = message.user_id === currentUser;
  const isMediaMessage = ['image', 'audio', 'video', 'file'].includes(message.type || 'text');
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: message.created_at.includes(new Date().getFullYear().toString()) ? undefined : 'numeric'
    });
  };

  const getFileIcon = () => {
    if (!message.type) return <File className="w-4 h-4" />;
    
    switch (message.type) {
      case 'image': return <FileImage className="w-4 h-4" />;
      case 'audio': return <FileAudio className="w-4 h-4" />;
      case 'video': return <FileVideo className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real app, you'd control an audio element here
  };

  const handleReaction = (reaction: string) => {
    onReact(message.id, reaction);
    setShowReactions(false);
  };

  const downloadFile = () => {
    if (message.content) {
      const link = document.createElement('a');
      link.href = message.content;
      link.download = message.file_name || 'file';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    if (message.type === 'image') {
      return (
        <div className="rounded-lg overflow-hidden max-w-xs">
          <img 
            src={message.content} 
            alt={message.file_name || 'Image'} 
            className="max-h-80 object-cover"
          />
        </div>
      );
    }
    
    if (message.type === 'audio') {
      return (
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-500 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
              Voice message
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1">
              <div 
                className="bg-cyan-500 h-full rounded-full" 
                style={{ width: `${audioProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      );
    }
    
    if (message.type === 'video') {
      return (
        <div className="rounded-lg overflow-hidden max-w-xs">
          <video 
            src={message.content} 
            controls
            className="max-h-80"
          />
        </div>
      );
    }
    
    if (message.type === 'file') {
      return (
        <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3 max-w-xs">
          <div className="bg-slate-700 p-2 rounded-lg">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {message.file_name}
            </div>
            <div className="text-xs text-gray-400">
              {message.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
            </div>
          </div>
          <button 
            onClick={downloadFile}
            className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-cyan-300 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      );
    }
    
    // Default text message
    return (
      <div className="leading-relaxed break-words">
        {message.content}
      </div>
    );
  };

  return (
    <div className={`flex items-start gap-3 group ${isCurrentUser ? 'justify-end' : ''}`}>
      {!isCurrentUser && (
        <div className="w-9 h-9 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
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
          rounded-lg relative
          ${isCurrentUser 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none' 
            : 'bg-slate-700 text-gray-300 rounded-bl-none'
          }
          ${isEditing ? 'ring-2 ring-cyan-500' : ''}
          ${isMediaMessage ? 'bg-transparent p-0' : 'p-3'}
        `}>
          {renderContent()}
          
          {!isEditing && (
            <div className={`
              absolute -right-8 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity
              ${isCurrentUser ? 'flex-row-reverse -left-8 right-auto' : ''}
            `}>
              <button 
                onClick={() => onReply(message)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-purple-400 transition-colors"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-yellow-400 transition-colors"
                title="React"
              >
                <Smile className="w-4 h-4" />
              </button>
              
              {isCurrentUser && (
                <>
                  <button 
                    onClick={() => onEdit(message)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-cyan-400 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(message.id)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(message.reactions).map(([reaction, users]) => (
              <div 
                key={reaction} 
                className="bg-slate-800/50 px-2 py-1 rounded-full text-xs flex items-center gap-1"
              >
                <span>{reaction}</span>
                <span className="text-cyan-400">{users.length}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
          <span>{formatTime(message.created_at)}</span>
          {message.updated_at && message.updated_at !== message.created_at && (
            <span className="italic">(edited)</span>
          )}
          {isCurrentUser && (
            <span className="text-cyan-400">✓✓</span> // Seen indicator
          )}
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="w-9 h-9 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">
            {message.user_email.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      {/* Reaction Picker */}
      {showReactions && (
        <div className={`
          absolute bg-slate-800 border border-slate-700 rounded-full px-2 py-1 flex gap-1 z-10
          ${isCurrentUser ? 'mr-16' : 'ml-16'}
        `}>
          {['❤️', '👍', '👎', '😂', '😮', '😢'].map(reaction => (
            <button
              key={reaction}
              onClick={() => handleReaction(reaction)}
              className="text-xl hover:scale-125 transform transition-transform"
            >
              {reaction}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageItem;