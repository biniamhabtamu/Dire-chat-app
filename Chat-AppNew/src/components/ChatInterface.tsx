// src/components/ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Message, 
  Channel, 
  DirectMessage, 
  Conversation, 
  ChatInterfaceProps,
  SidebarProps,
  MainChatAreaProps
} from '../types';
import Sidebar from './Sidebar';
import MainChatArea from './MainChatArea';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onSignOut }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([
    { id: 1, email: 'john@example.com', name: 'John Doe', online: true, unread: 3 },
    { id: 2, email: 'jane@example.com', name: 'Jane Smith', online: false, unread: 0 },
    { id: 3, email: 'alex@example.com', name: 'Alex Johnson', online: true, unread: 1 },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (activeConversation?.type === 'channel') {
      loadChannelMessages(activeConversation.id);
      subscribeToChannelMessages();
    } else if (activeConversation?.type === 'dm') {
      loadDirectMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChannels = async () => {
    const { data } = await supabase
      .from('channels')
      .select('*')
      .order('created_at');
    
    if (data && data.length > 0) {
      setChannels(data);
      setActiveConversation({
        type: 'channel',
        id: data[0].id,
        name: data[0].name,
        description: data[0].description
      });
    }
  };

  const loadChannelMessages = async (channelId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at');
    
    if (data) {
      setMessages(data);
    }
  };

  const loadDirectMessages = async (contactId: string) => {
    // In a real app, fetch from direct messages table
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hey there!',
        user_id: contactId,
        user_email: contactId,
        created_at: new Date().toISOString(),
        channel_id: null
      },
      {
        id: '2',
        content: 'How are you doing?',
        user_id: user.id,
        user_email: user.email,
        created_at: new Date().toISOString(),
        channel_id: null
      }
    ];
    setMessages(mockMessages);
  };

  const subscribeToChannelMessages = () => {
    if (!activeConversation || activeConversation.type !== 'channel') return;

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          if (payload.new.channel_id === activeConversation.id) {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setIsLoading(true);
    
    if (activeConversation.type === 'channel') {
      // Send channel message
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage,
            user_id: user.id,
            user_email: user.email,
            channel_id: activeConversation.id
          }
        ]);

      if (!error) {
        setNewMessage('');
      }
    } else {
      // Send direct message
      const newMsg: Message = {
        id: Date.now().toString(),
        content: newMessage,
        user_id: user.id,
        user_email: user.email,
        created_at: new Date().toISOString(),
        channel_id: null
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Update unread count for recipient
      setDirectMessages(prev => prev.map(dm => 
        dm.email === activeConversation.id 
          ? {...dm, unread: dm.unread + 1} 
          : dm
      ));
    }
    
    setIsLoading(false);
  };

  const createChannel = async () => {
    const name = prompt('Enter channel name:');
    if (!name) return;

    const { error } = await supabase
      .from('channels')
      .insert([{ name, description: `Channel for ${name}` }]);

    if (!error) {
      loadChannels();
    }
  };

  const createDirectMessage = () => {
    const email = prompt('Enter user email to start a conversation:');
    if (email) {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Check if contact already exists
      if (directMessages.some(dm => dm.email === email)) {
        alert('Conversation with this user already exists');
        return;
      }
      
      // Extract name from email
      const name = email.split('@')[0];
      
      setDirectMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          email,
          name, 
          online: true, 
          unread: 0 
        }
      ]);
    }
  };

  const openSettings = () => {
    // Placeholder for settings functionality
    alert('Settings functionality would open here');
  };

  return (
    <div className="h-screen bg-slate-900 flex">
      <Sidebar
        user={user}
        channels={channels}
        directMessages={directMessages}
        activeConversation={activeConversation}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setActiveConversation={setActiveConversation}
        createChannel={createChannel}
        createDirectMessage={createDirectMessage}
        openSettings={openSettings}
        onSignOut={onSignOut}
        setDirectMessages={setDirectMessages}
      />

      <MainChatArea
        user={user}
        messages={messages}
        newMessage={newMessage}
        isLoading={isLoading}
        activeConversation={activeConversation}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
};

export default ChatInterface;