
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Paperclip, MoreVertical, CheckCheck, Phone, 
  Video, Smile, ChevronLeft, MessageSquare, UserPlus, Tag, 
  Sparkles, Zap, Clock, User, Bot, Hash, Info, X, 
  CheckCircle2, ArrowRight, CornerDownRight, Trash2
} from 'lucide-react';
import { generateAiResponse } from '../services/geminiService';
import { socketService } from '../services/socket';

const mockChats = [
  { id: '1', name: 'João Silva', last: 'Pode me enviar o boleto?', time: '10:45', unread: 2, avatar: 'JS', status: 'Aguardando', score: 85, phone: '5511999999999', tags: ['VIP', 'Lead Quente'] },
  { id: '2', name: 'Ana Oliveira', last: 'Obrigado pelo atendimento!', time: '11:20', unread: 0, avatar: 'AO', status: 'Atendido', score: 45, phone: '5521988888888', tags: ['Newsletter'] },
  { id: '3', name: 'Carlos Santos', last: 'Qual o valor do plano Pro?', time: '09:15', unread: 1, avatar: 'CS', status: 'Aguardando', score: 92, phone: '5531977777777', tags: ['Interessado'] },
];

const ChatCenter: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Aguardando' | 'Não Lidas'>('Todos');
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: 'Pode me enviar o boleto de pagamento deste mês? Por favor.', sender: 'user', time: '10:45' },
    { id: '2', text: 'Claro, João! Estou gerando agora mesmo para você. Só um momento.', sender: 'agent', time: '10:46' },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Escuta mensagens reais via Socket
  useEffect(() => {
    const handleMessage = (msg: any) => {
      // Se a mensagem for de um contato real, adicionamos ao fluxo
      const newMessage = {
        id: Date.now().toString(),
        text: msg.text || msg.body || "",
        sender: 'user' as const,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      if (newMessage.text) {
        setMessages(prev => [...prev, newMessage]);
      }
    };

    socketService.on("message", handleMessage);
    
    return () => {
      // Idealmente o SocketService deveria permitir remover listeners específicos
    };
  }, []);

  const selectedChat = mockChats.find(c => c.id === selectedId);

  const handleAiSuggest = async () => {
    if (!selectedChat) return;
    setIsGeneratingAi(true);
    const suggestion = await generateAiResponse(
      `O cliente ${selectedChat.name} perguntou: "${selectedChat.last}". Sugira uma resposta curta e profissional.`,
      "Atendente prestativo e comercial da ZapFlow Pro"
    );
    setInputText(suggestion);
    setIsGeneratingAi(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Envia via Socket REAL
    if (selectedChat) {
      socketService.sendMessage(selectedChat.phone, inputText);
      
      const newMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'agent' as const,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    } else {
      alert("Selecione um chat para enviar mensagens via socket.");
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 h-[calc(100vh-8rem)] flex overflow-hidden relative animate-in fade-in duration-500">
      
      {/* Sidebar - Conversas */}
      <div className={`
        w-full md:w-80 lg:w-[350px] border-r border-gray-100 flex flex-col bg-white transition-all
        ${selectedId ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-6 space-y-5 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-2xl text-gray-800 tracking-tight">Chats Live</h3>
            <div className="flex gap-2">
               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200" title="Socket Online"></div>
               <button className="p-2 bg-white text-gray-400 hover:text-indigo-600 rounded-xl shadow-sm transition-all border border-gray-100">
                <UserPlus size={18}/>
               </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Sincronizando chats reais..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
            />
          </div>

          <div className="flex gap-1">
            {(['Todos', 'Aguardando', 'Não Lidas'] as const).map(f => (
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
          {mockChats.map(chat => (
            <button 
              key={chat.id}
              onClick={() => setSelectedId(chat.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all group relative ${
                selectedId === chat.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                selectedId === chat.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {chat.avatar}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={`font-black text-sm truncate ${selectedId === chat.id ? 'text-white' : 'text-gray-800'}`}>{chat.name}</p>
                  <span className={`text-[9px] font-bold whitespace-nowrap ml-2 opacity-60 uppercase tracking-widest`}>{chat.time}</span>
                </div>
                <p className={`text-xs truncate ${selectedId === chat.id ? 'text-white/80' : 'text-gray-400 font-medium'}`}>{chat.last}</p>
              </div>
              {chat.unread > 0 && selectedId !== chat.id && (
                <div className="absolute top-4 right-4 w-5 h-5 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat View */}
      <div className={`
        flex-1 flex flex-col bg-[#F9FAFB] transition-all relative
        ${!selectedId ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 md:p-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedId(null)} className="md:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl">
                  <ChevronLeft size={24} />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shadow-inner">
                    {selectedChat.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-gray-800 text-lg tracking-tight truncate">{selectedChat.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
                      <Zap size={10} fill="currentColor" /> Live WebSocket
                    </span>
                    <span className="text-gray-200">|</span>
                    <span className="text-[10px] text-gray-400 font-bold">+{selectedChat.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className={`p-3 rounded-2xl transition-all ${showContactInfo ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <Info size={20}/>
                </button>
                <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><MoreVertical size={20}/></button>
              </div>
            </div>

            {/* Content: Messages + Info Sidebar */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* Messages Area */}
              <div className="flex-1 flex flex-col relative overflow-hidden bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_04fcacde533c5e444d4d0f058aef2d0c.png')] bg-repeat">
                <div className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 custom-scrollbar bg-gray-50/90 backdrop-blur-[2px]">
                  <div className="flex justify-center">
                    <span className="bg-white/80 backdrop-blur shadow-sm px-4 py-1.5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">Criptografia Ponta-a-Ponta</span>
                  </div>
                  
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[85%] md:max-w-md p-4 rounded-3xl shadow-sm border ${
                        msg.sender === 'user' 
                        ? 'bg-white border-gray-100 rounded-tl-none' 
                        : 'bg-indigo-600 text-white border-transparent rounded-tr-none shadow-indigo-100 shadow-xl'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 mt-1.5 px-2 ${msg.sender === 'user' ? '' : 'flex-row-reverse'}`}>
                         <span className="text-[9px] font-bold text-gray-400 uppercase">{msg.time}</span>
                         {msg.sender === 'agent' && <CheckCheck size={12} className="text-emerald-500" />}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* AI Assistant Preview Bar */}
                {isGeneratingAi && (
                  <div className="mx-6 mb-2 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-between animate-pulse">
                     <div className="flex items-center gap-3">
                        <Sparkles size={18} className="animate-spin duration-[3s]" />
                        <span className="text-xs font-bold uppercase tracking-widest">IA Analisando Fluxo Real...</span>
                     </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-6 bg-white/80 backdrop-blur-md border-t border-gray-100">
                  <div className="flex flex-col gap-4">
                    {/* Quick Response Toolbar */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                       <button 
                        onClick={handleAiSuggest}
                        disabled={isGeneratingAi}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 shrink-0"
                       >
                         <Sparkles size={14} /> Sugerir com IA
                       </button>
                       {['Pix', 'Catálogo', 'Endereço', 'Boas-vindas'].map(label => (
                         <button key={label} className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 shrink-0">
                           {label}
                         </button>
                       ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <button className="p-3 text-gray-400 hover:text-indigo-600 transition-all"><Paperclip size={22}/></button>
                        <button className="p-3 text-gray-400 hover:text-indigo-600 transition-all"><Smile size={22}/></button>
                      </div>
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          placeholder="Digite para disparar via Socket..." 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 py-4 text-sm shadow-inner transition-all outline-none font-medium"
                        />
                      </div>
                      <button 
                        onClick={handleSendMessage}
                        className="bg-emerald-500 text-white p-4 rounded-2xl hover:bg-emerald-600 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-100 active:scale-95"
                      >
                        <Send size={20} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CRM Sidebar */}
              {showContactInfo && (
                <div className="w-80 border-l border-gray-100 bg-white h-full overflow-y-auto hidden lg:flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="p-8 space-y-8">
                     <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto rounded-[2.5rem] bg-indigo-500 text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
                          {selectedChat.avatar}
                        </div>
                        <div>
                           <h5 className="text-xl font-black text-gray-800 tracking-tight">{selectedChat.name}</h5>
                           <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-widest">Lead {selectedChat.tags[0]}</p>
                        </div>
                        <div className="flex gap-2 justify-center">
                           <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all border border-gray-100"><Phone size={18}/></button>
                           <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all border border-gray-100"><Video size={18}/></button>
                           <button className="p-3 bg-gray-50 text-gray-400 hover:text-rose-500 rounded-2xl transition-all border border-gray-100"><Trash2 size={18}/></button>
                        </div>
                     </div>

                     <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Health Score</span>
                           <span className={`text-xs font-black text-emerald-500`}>{selectedChat.score}%</span>
                        </div>
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
                           <div 
                            className={`h-full bg-emerald-500 rounded-full transition-all duration-1000`} 
                            style={{width: `${selectedChat.score}%`}}
                           ></div>
                        </div>
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
              <h4 className="text-2xl font-black text-gray-800 tracking-tight">Painel de Sincronia Live</h4>
              <p className="text-gray-400 text-sm max-w-xs mx-auto font-medium">As mensagens aparecerão aqui em tempo real assim que seu socket Node.js detectar novas interações.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatCenter;
