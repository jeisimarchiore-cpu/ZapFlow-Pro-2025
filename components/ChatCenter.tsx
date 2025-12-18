
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Paperclip, MoreVertical, CheckCheck, Phone, 
  Video, Smile, ChevronLeft, MessageSquare, UserPlus, Tag, 
  Sparkles, Zap, Clock, User, Bot, Hash, Info, X, 
  CheckCircle2, ArrowRight, CornerDownRight, Trash2, RefreshCw
} from 'lucide-react';
import { generateAiResponse } from '../services/geminiService';
import { socketService } from '../services/socket';
import { subscribeToCollection } from '../services/firebase';
import { Contact } from '../types';

interface ChatCenterProps {
  isSocketActive: boolean;
}

interface BackendChat {
  id: string;
  name: string;
  number: string;
  lastMsg: string;
  time: string;
  unread: number;
}

interface BackendMessage {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
  timestamp: number;
}

const ChatCenter: React.FC<ChatCenterProps> = ({ isSocketActive }) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [whatsappChats, setWhatsappChats] = useState<BackendChat[]>([]);
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Não Lidas'>('Todos');
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [messages, setMessages] = useState<BackendMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const SERVER_URL = "http://localhost:8000";
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Carrega chats reais do WhatsApp
  const fetchChats = async () => {
    if (!isSocketActive) return;
    setIsLoadingChats(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/chats`);
      const data = await res.json();
      if (Array.isArray(data)) setWhatsappChats(data);
    } catch (e) {
      console.error("Erro ao carregar chats:", e);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Carrega histórico de mensagens ao selecionar um chat
  const fetchMessages = async (chatId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/messages/${chatId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (e) {
      console.error("Erro ao carregar mensagens:", e);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [isSocketActive]);

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listener de mensagens do Socket e eventos de atualização
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      // Atualiza lista de chats se houver nova mensagem
      fetchChats();
      
      // Se a mensagem for do chat aberto, recarrega histórico
      if (selectedChatId && data.chatId === selectedChatId) {
        fetchMessages(selectedChatId);
      }
    };

    const handleRefetch = () => fetchChats();

    socketService.on("message", handleNewMessage);
    socketService.on("refetch_chats", handleRefetch);
    
    return () => {
      socketService.off("message", handleNewMessage);
      socketService.off("refetch_chats", handleRefetch);
    };
  }, [selectedChatId]);

  const selectedChat = whatsappChats.find(c => c.id === selectedChatId);

  const handleAiSuggest = async () => {
    if (!selectedChat) return;
    setIsGeneratingAi(true);
    const suggestion = await generateAiResponse(
      `O cliente ${selectedChat.name} enviou uma mensagem. Sugira uma resposta comercial curta para o ZapFlow Pro.`,
      "Atendente de CRM focado em conversão e suporte amigável."
    );
    setInputText(suggestion);
    setIsGeneratingAi(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChatId) return;
    
    // Envia via SocketService (que chama a API do backend)
    socketService.sendMessage(selectedChatId, inputText);
    
    // Adiciona localmente para feedback instantâneo
    const tempMsg: BackendMessage = {
      id: Date.now().toString(),
      text: inputText,
      fromMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now() / 1000
    };
    setMessages(prev => [...prev, tempMsg]);
    setInputText('');
  };

  const filteredChats = whatsappChats.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.includes(searchQuery);
    if (activeFilter === 'Não Lidas') return matchesSearch && c.unread > 0;
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 h-[calc(100vh-8rem)] flex overflow-hidden relative animate-in fade-in duration-500">
      
      {/* Sidebar - Conversas Reais do WhatsApp */}
      <div className={`
        w-full md:w-80 lg:w-[350px] border-r border-gray-100 flex flex-col bg-white transition-all
        ${selectedChatId ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-6 space-y-5 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-2xl text-gray-800 tracking-tight">WhatsApp Inbox</h3>
            <button onClick={fetchChats} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-indigo-600">
              <RefreshCw size={18} className={isLoadingChats ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Buscar conversas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
            />
          </div>

          <div className="flex gap-1">
            {(['Todos', 'Não Lidas'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {!isSocketActive && (
            <div className="p-8 text-center space-y-3">
              <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100">
                <Zap size={24} className="mx-auto text-rose-500 mb-2" fill="currentColor" />
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-relaxed">Conecte o WhatsApp na aba de Conexão para carregar chats.</p>
              </div>
            </div>
          )}

          {filteredChats.map(chat => (
            <button 
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all group relative ${
                selectedChatId === chat.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                selectedChatId === chat.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {chat.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={`font-black text-sm truncate ${selectedChatId === chat.id ? 'text-white' : 'text-gray-800'}`}>{chat.name}</p>
                  <span className={`text-[9px] font-bold ${selectedChatId === chat.id ? 'text-white/60' : 'text-gray-400'}`}>
                    {chat.time ? new Date(chat.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-xs truncate ${selectedChatId === chat.id ? 'text-white/80' : 'text-gray-400 font-medium'}`}>{chat.lastMsg || 'Sem mensagens'}</p>
                  {chat.unread > 0 && selectedChatId !== chat.id && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat View */}
      <div className={`
        flex-1 flex flex-col bg-[#F9FAFB] transition-all relative
        ${!selectedChatId ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedChat ? (
          <>
            <div className="p-4 md:p-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedChatId(null)} className="md:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl">
                  <ChevronLeft size={24} />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shadow-inner">
                  {selectedChat.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-gray-800 text-lg tracking-tight truncate">{selectedChat.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isSocketActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isSocketActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                      {isSocketActive ? 'Online' : 'Offline'}
                    </span>
                    <span className="text-gray-200">|</span>
                    <span className="text-[10px] text-gray-400 font-bold">{selectedChat.id.split('@')[0]}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowContactInfo(!showContactInfo)}
                className={`p-3 rounded-2xl transition-all ${showContactInfo ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Info size={20}/>
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
              <div className="flex-1 flex flex-col relative overflow-hidden bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_04fcacde533c5e444d4d0f058aef2d0c.png')] bg-repeat">
                <div className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 custom-scrollbar bg-gray-50/90 backdrop-blur-[2px]">
                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 space-y-4">
                      <RefreshCw className="text-indigo-400 animate-spin" size={32} />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizando histórico...</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${!msg.fromMe ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] md:max-w-md p-4 rounded-3xl shadow-sm border ${
                          !msg.fromMe 
                          ? 'bg-white border-gray-100 rounded-tl-none' 
                          : 'bg-indigo-600 text-white border-transparent rounded-tr-none shadow-indigo-100 shadow-xl'
                        }`}>
                          <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1.5 px-2 ${!msg.fromMe ? '' : 'flex-row-reverse'}`}>
                           <span className="text-[9px] font-bold text-gray-400 uppercase">{msg.time}</span>
                           {msg.fromMe && <CheckCheck size={12} className="text-emerald-500" />}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-6 bg-white/80 backdrop-blur-md border-t border-gray-100">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={handleAiSuggest}
                        disabled={isGeneratingAi || !isSocketActive}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 disabled:opacity-50"
                       >
                         {isGeneratingAi ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                         {isGeneratingAi ? 'Analisando...' : 'Sugerir com IA'}
                       </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="p-3 text-gray-400 hover:text-indigo-600 transition-all"><Paperclip size={22}/></button>
                      <input 
                        type="text" 
                        placeholder={isSocketActive ? "Escreva aqui para enviar..." : "WhatsApp desconectado"} 
                        value={inputText}
                        disabled={!isSocketActive}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 py-4 text-sm shadow-inner transition-all outline-none font-medium"
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={!isSocketActive || !inputText.trim()}
                        className="bg-emerald-500 text-white p-4 rounded-2xl hover:bg-emerald-600 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50"
                      >
                        <Send size={20} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {showContactInfo && (
                <div className="w-80 border-l border-gray-100 bg-white h-full overflow-y-auto hidden lg:flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="p-8 space-y-8">
                     <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto rounded-[2.5rem] bg-indigo-500 text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
                          {selectedChat.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                           <h5 className="text-xl font-black text-gray-800 tracking-tight">{selectedChat.name}</h5>
                           <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-widest">WhatsApp Chat</p>
                        </div>
                     </div>
                     <div className="p-5 bg-gray-50 rounded-3xl space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Identificador</p>
                        <p className="text-xs font-bold text-gray-600 truncate">{selectedChat.id}</p>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-[3rem] shadow-xl flex items-center justify-center text-gray-200 animate-bounce duration-[3s]">
                 <MessageSquare size={56} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-12">
                 <Zap size={20} fill="currentColor" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-gray-800 tracking-tight">Atendimento WhatsApp</h4>
              <p className="text-gray-400 text-sm max-w-xs mx-auto font-medium">Selecione uma conversa ativa para visualizar o histórico e responder em tempo real.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatCenter;
