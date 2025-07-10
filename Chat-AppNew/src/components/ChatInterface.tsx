import React, { useState, useEffect, useRef } from 'react'
import { supabase, Message, Channel } from '../lib/supabase'
import { 
  Send, 
  Hash, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  MessageSquare, 
  Search, 
  User 
} from 'lucide-react'

interface ChatInterfaceProps {
  user: any
  onSignOut: () => void
}

interface DirectMessage {
  id: number
  name: string
  online: boolean
  unread: number
}

export default function ChatInterface({ user, onSignOut }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([
    { id: 1, name: 'John Doe', online: true, unread: 3 },
    { id: 2, name: 'Jane Smith', online: false, unread: 0 },
    { id: 3, name: 'Alex Johnson', online: true, unread: 1 },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChannels()
  }, [])

  useEffect(() => {
    if (activeChannel) {
      loadMessages()
      subscribeToMessages()
    }
  }, [activeChannel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChannels = async () => {
    const { data } = await supabase
      .from('channels')
      .select('*')
      .order('created_at')
    
    if (data) {
      setChannels(data)
      if (data.length > 0) {
        setActiveChannel(data[0].id)
      }
    }
  }

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', activeChannel)
      .order('created_at')
    
    if (data) {
      setMessages(data)
    }
  }

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          if (payload.new.channel_id === activeChannel) {
            setMessages(prev => [...prev, payload.new as Message])
          }
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChannel) return

    setIsLoading(true)
    
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content: newMessage,
          user_id: user.id,
          user_email: user.email,
          channel_id: activeChannel
        }
      ])

    if (!error) {
      setNewMessage('')
    }
    
    setIsLoading(false)
  }

  const createChannel = async () => {
    const name = prompt('Enter channel name:')
    if (!name) return

    const { error } = await supabase
      .from('channels')
      .insert([{ name, description: `Channel for ${name}` }])

    if (!error) {
      loadChannels()
    }
  }

  const createDirectMessage = () => {
    const userName = prompt('Enter user name to start a conversation:')
    if (userName) {
      setDirectMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          name: userName, 
          online: true, 
          unread: 0 
        }
      ])
    }
  }

  const openSettings = () => {
    // Placeholder for settings functionality
    alert('Settings functionality would open here')
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const activeChannelData = channels.find(c => c.id === activeChannel)
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const userName = user.email.split('@')[0]

  return (
    <div className="h-screen bg-slate-900 flex">
      {/* Enhanced Sidebar */}
      <div className="w-80 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
                <MessageSquare className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                Dire-Chat
              </h1>
            </div>
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors group"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-purple-300 transition-colors" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {user.email[0].toUpperCase()}
            </div>
            <div className="text-gray-400 truncate">
              {user.email}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Channels Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-4 h-4 text-purple-400" />
                Channels
              </h2>
              <button
                onClick={createChannel}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                title="Create Channel"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 group ${
                    activeChannel === channel.id
                      ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white shadow-md'
                      : 'text-gray-300 hover:bg-slate-700/50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${
                    activeChannel === channel.id 
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
              ))}
            </div>
          </div>
          
          {/* Direct Messages Section */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                <User className="w-4 h-4 text-cyan-400" />
                Direct Messages
              </h2>
              <button 
                onClick={createDirectMessage}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                title="New Message"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {directMessages.map((dm) => (
                <button
                  key={dm.id}
                  className="w-full text-left p-2 rounded-lg flex items-center gap-3 text-gray-300 hover:bg-slate-700/50 transition-colors group"
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
              ))}
            </div>
          </div>
        </div>
        
        {/* User Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/30 flex items-center gap-3">
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {user.email[0].toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-200 truncate">{userName}</div>
            <div className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Online
            </div>
          </div>
          <button 
            onClick={openSettings}
            className="p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-cyan-300 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {activeChannelData?.name || 'Select a channel'}
                </h2>
                <p className="text-sm text-gray-400">
                  {activeChannelData?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
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
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-slate-800 border-t border-slate-700 p-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${activeChannelData?.name || 'channel'}`}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              disabled={isLoading || !activeChannel}
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim() || !activeChannel}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}