
export type ContactStatus = 'Ativo' | 'Risco' | 'Novo';

export interface Contact {
  id: string;
  name: string;
  whatsapp: string;
  birthday: string;
  status: ContactStatus;
  lists: string[];
  score?: number; // 0-100
  source?: 'Manual' | 'API' | 'Import' | 'Chatbot';
  lastInteraction?: string;
}

export interface ContactList {
  id: string;
  name: string;
  color: string;
}

export interface Campaign {
  id: string;
  name: string;
  listId: string;
  message: string;
  status: 'Draft' | 'Running' | 'Paused' | 'Completed';
  progress: number;
  sent: number;
  total: number;
  mediaUrl?: string;
  createdAt: string;
}

export interface ChatbotRule {
  id: string;
  trigger: string;
  response: string;
  matchType: 'Exact' | 'Contains';
}

export interface ChatbotConfig {
  aiPersona: string;
  isEnabled: boolean;
  autoAiFallback: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  messages: Message[];
}
