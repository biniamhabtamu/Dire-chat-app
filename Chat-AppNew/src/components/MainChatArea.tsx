// src/components/MainChatArea.tsx
import React, { useState, useEffect } from 'react';
import { 
  Hash, 
  User, 
  Users, 
  Settings, 
  Send, 
  MessageCircle, 
  Loader2,
  Edit,
  Trash2,
  Reply,
  Check,
  X
} from 'lucide-react';
import { MainChatAreaProps, Message } from '../types';
import MessageItem from './MessageItem';
import { supabase } from '../lib/supabase';

const MainChatArea: React.FC<MainChatAreaProps> = ({
  user,
  messages,
  newMessage,
  isLoading,
  activeConversation,
  setNewMessage,
  sendMessage,
  messagesEndRef,
  setDirectMessages,
  directMessages
}) => {
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [draftContent, setDraftContent] = useState('');
  
  // Calculate participant count
  const participantCount = activeConversation?.type === 'channel' 
    ? Math.floor(Math.random() * 15) + 3  // Random between 3-17
    : 2;  // Always 2 for direct messages

  // Handle message editing
  const startEditing = (message: Message) => {
    setEditingMessage(message);
    setDraftContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setDraftContent('');
  };

  const saveEdit = async () => {
    if (!editingMessage || !draftContent.trim()) return;

    // Update in Supabase
    const { error } = await supabase
      .from(activeConversation?.type === 'channel' ? 'messages' : 'direct_messages')
      .update({ content: draftContent })
      .eq('id', editingMessage.id);

    if (!error) {
      // Update local state
      const updatedMessages = messages.map(msg => 
        msg.id === editingMessage.id ? { ...msg, content: draftContent } : msg
      );
      
      // Update context state
      // (You'll need to pass a setMessages function from parent)
      // setMessages(updatedMessages);
      
      setEditingMessage(null);
      setDraftContent('');
    }
  };

  // Handle message deletion
  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    // Delete from Supabase
    const { error } = await supabase
      .from(activeConversation?.type === 'channel' ? 'messages' : 'direct_messages')
      .delete()
      .eq('id', messageId);

    if (!error) {
      // Update local state
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      
      // Update context state
      // (You'll need to pass a setMessages function from parent)
      // setMessages(updatedMessages);
    }
  };

  // Handle message replies
  const startReply = (message: Message) => {
    setReplyToMessage(message);
    setNewMessage(`@${message.user_email.split('@')[0]} `);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeConversation?.type === 'channel' ? (
              <div className="relative">
                <Hash className="w-6 h-6 text-purple-400" />
                {participantCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {participantCount}
                  </span>
                )}
              </div>
            ) : (
              <User className="w-6 h-6 text-cyan-400" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">
                {activeConversation?.name || 'Select a conversation'}
              </h2>
              <p className="text-sm text-gray-400">
                {activeConversation?.type === 'channel' 
                  ? `${activeConversation.description} • ${participantCount} participants`
                  : 'Direct message conversation'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-cyan-300 transition-colors">
              <Users className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-cyan-300 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6">
              <MessageCircle className="w-16 h-16 mx-auto text-cyan-500/30 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {activeConversation 
                  ? `Welcome to #${activeConversation.name}!` 
                  : 'No conversation selected'}
              </h3>
              <p className="text-gray-500 max-w-md">
                {activeConversation 
                  ? 'Send your first message to start the conversation'
                  : 'Select a conversation or start a new one'}
              </p>
            </div>
            
            {activeConversation && (
              <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-w-md">
                <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Channel Tips</span>
                </h4>
                <ul className="text-sm text-gray-400 space-y-1 text-left">
                  <li>• Use @mentions to notify specific people</li>
                  <li>• Press Shift+Enter for new lines</li>
                  <li>• Type /help for command options</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <MessageItem 
                key={message.id} 
                message={message}
                currentUser={user.id}
                onEdit={startEditing}
                onDelete={deleteMessage}
                onReply={startReply}
                isEditing={editingMessage?.id === message.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-slate-800 border-t border-slate-700 p-4">
        {editingMessage && (
          <div className="mb-3 p-3 bg-slate-700/50 rounded-lg flex items-center justify-between">
            <div className="text-cyan-400 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              <span>Editing message</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={cancelEditing}
                className="p-1.5 rounded-md bg-slate-600 hover:bg-slate-500 text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
              <button 
                onClick={saveEdit}
                className="p-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {replyToMessage && (
          <div className="mb-3 p-3 bg-slate-700/50 rounded-lg flex items-center justify-between">
            <div className="text-purple-400 flex items-center gap-2">
              <Reply className="w-4 h-4" />
              <span>Replying to {replyToMessage.user_email.split('@')[0]}</span>
            </div>
            <button 
              onClick={() => setReplyToMessage(null)}
              className="p-1.5 rounded-md bg-slate-600 hover:bg-slate-500 text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              activeConversation?.type === 'channel' 
                ? `Message #${activeConversation?.name || 'channel'}`
                : `Message ${activeConversation?.name || 'user'}`
            }
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all disabled:opacity-50"
            disabled={isLoading || !activeConversation}
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim() || !activeConversation}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[44px]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MainChatArea;