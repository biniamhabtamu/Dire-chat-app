// src/components/MainChatArea.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Mic,
  Paperclip,
  File,
  FileAudio,
  FileImage,
  FileVideo,
  FileText
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
  setMessages // Add this prop to update messages
}) => {
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate participant count
  const participantCount = activeConversation?.type === 'channel' 
    ? Math.floor(Math.random() * 15) + 3  // Random between 3-17
    : 2;  // Always 2 for direct messages

  // Initialize media recorder
  useEffect(() => {
    if (!navigator.mediaDevices) return;
    
    const initMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(audioBlob);
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          audioChunksRef.current = [];
        };
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };
    
    initMediaRecorder();
    
    return () => {
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
    if (!editingMessage || !draftContent.trim() || !activeConversation) return;

    setIsSending(true);
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from(activeConversation.type === 'channel' ? 'messages' : 'direct_messages')
        .update({ 
          content: draftContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMessage.id);

      if (error) throw error;

      // Update local state
      const updatedMessages = messages.map(msg => 
        msg.id === editingMessage.id ? { 
          ...msg, 
          content: draftContent,
          updated_at: new Date().toISOString()
        } : msg
      );
      
      if (setMessages) setMessages(updatedMessages);
      
      setEditingMessage(null);
      setDraftContent('');
    } catch (error) {
      console.error('Error updating message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle message deletion
  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?') || !activeConversation) return;

    setIsSending(true);
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from(activeConversation.type === 'channel' ? 'messages' : 'direct_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      if (setMessages) setMessages(updatedMessages);
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle message replies
  const startReply = (message: Message) => {
    setReplyToMessage(message);
    setNewMessage(`@${message.user_email.split('@')[0]} `);
  };

  // Voice recording functions
  const startRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    setIsRecording(true);
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    setIsRecording(false);
    mediaRecorderRef.current.stop();
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  // Upload file to Supabase storage
  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('chat-files')
      .upload(filePath, file);

    if (error) throw error;

    return filePath;
  };

  // Send voice message
  const sendVoiceMessage = async () => {
    if (!audioBlob || !activeConversation || !user || !setMessages) return;
    
    setIsSending(true);
    
    try {
      // Create a unique filename
      const fileName = `voice-${Date.now()}.webm`;
      
      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, audioBlob);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(fileName);
      
      // Create message object
      const newMsg: Message = {
        id: Date.now().toString(),
        content: urlData.publicUrl,
        user_id: user.id,
        user_email: user.email,
        type: 'audio',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        conversation_id: activeConversation.id,
        conversation_type: activeConversation.type
      };
      
      // Insert message into database
      const { error: insertError } = await supabase
        .from(activeConversation.type === 'channel' ? 'messages' : 'direct_messages')
        .insert([newMsg]);
      
      if (insertError) throw insertError;
      
      // Update local state
      setMessages([...messages, newMsg]);
      
      // Clear recording
      setAudioUrl(null);
      setAudioBlob(null);
    } catch (error) {
      console.error('Error sending voice message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Send file message
  const sendFileMessage = async () => {
    if (!selectedFile || !activeConversation || !user || !setMessages) return;
    
    setIsSending(true);
    
    try {
      // Upload file
      const filePath = await uploadFile(selectedFile);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);
      
      // Create message object
      const newMsg: Message = {
        id: Date.now().toString(),
        content: urlData.publicUrl,
        user_id: user.id,
        user_email: user.email,
        type: selectedFile.type.startsWith('image/') ? 'image' : 
              selectedFile.type.startsWith('audio/') ? 'audio' : 
              selectedFile.type.startsWith('video/') ? 'video' : 'file',
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        conversation_id: activeConversation.id,
        conversation_type: activeConversation.type
      };
      
      // Insert message into database
      const { error: insertError } = await supabase
        .from(activeConversation.type === 'channel' ? 'messages' : 'direct_messages')
        .insert([newMsg]);
      
      if (insertError) throw insertError;
      
      // Update local state
      setMessages([...messages, newMsg]);
      
      // Clear file
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending file:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Get file icon based on file type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-4 h-4" />;
    if (type.startsWith('video/')) return <FileVideo className="w-4 h-4" />;
    if (type.startsWith('text/')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Handle sending all message types
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (audioBlob) {
      await sendVoiceMessage();
    } else if (selectedFile) {
      await sendFileMessage();
    } else {
      // Send text message using parent's sendMessage function
      await sendMessage(e);
    }
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
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800">
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
                  <li>• Press and hold the mic icon to record voice messages</li>
                  <li>• Click the paperclip to send files</li>
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

        {audioUrl && (
          <div className="mb-3 p-3 bg-slate-700/50 rounded-lg flex items-center justify-between">
            <div className="text-purple-400 flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              <span>Voice message</span>
            </div>
            <div className="flex items-center gap-2">
              <audio controls className="h-8">
                <source src={audioUrl} type="audio/webm" />
              </audio>
              <button 
                onClick={cancelRecording}
                className="p-1.5 rounded-md bg-slate-600 hover:bg-slate-500 text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="mb-3 p-3 bg-slate-700/50 rounded-lg flex items-center justify-between">
            <div className="text-cyan-400 flex items-center gap-2">
              {getFileIcon(selectedFile.type)}
              <span className="truncate max-w-xs">{selectedFile.name}</span>
            </div>
            <button 
              onClick={removeFile}
              className="p-1.5 rounded-md bg-slate-600 hover:bg-slate-500 text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSend} className="flex gap-3">
          <div className="flex gap-1">
            {/* File attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-cyan-300 transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </button>
            
            {/* Voice recording button */}
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-cyan-300 transition-colors ${
                isRecording ? 'animate-pulse bg-red-500 text-white' : ''
              }`}
              title={isRecording ? "Recording... release to send" : "Hold to record"}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
          
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
            disabled={isLoading || !activeConversation || isRecording}
          />
          
          <button
            type="submit"
            disabled={
              isLoading || 
              !activeConversation || 
              (!newMessage.trim() && !audioUrl && !selectedFile) ||
              isSending
            }
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[44px]"
          >
            {isSending ? (
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