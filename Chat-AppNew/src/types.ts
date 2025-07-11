// src/types.ts
export interface Message {
  id: string;
  content: string;
  user_id: string;
  user_email: string;
  created_at: string;
  channel_id: string | null;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  unread?: number;
}

export interface DirectMessage {
  id: number;
  email: string;
  name: string;
  online: boolean;
  unread: number;
}

export interface Conversation {
  type: 'channel' | 'dm';
  id: string;
  name: string;
  description?: string;
}

export interface ChatInterfaceProps {
  user: any;
  onSignOut: () => void;
}

export interface SidebarProps {
  user: any;
  channels: Channel[];
  directMessages: DirectMessage[];
  activeConversation: Conversation | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setActiveConversation: (conversation: Conversation) => void;
  createChannel: () => void;
  createDirectMessage: () => void;
  openSettings: () => void;
  onSignOut: () => void;
  setDirectMessages: React.Dispatch<React.SetStateAction<DirectMessage[]>>;
}

export interface MainChatAreaProps {
  user: any;
  messages: Message[];
  newMessage: string;
  isLoading: boolean;
  activeConversation: Conversation | null;
  setNewMessage: (message: string) => void;
  sendMessage: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}