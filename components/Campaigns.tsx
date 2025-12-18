import React, { useState, useEffect } from 'react';
// Fix: Added missing Eye icon import from lucide-react
import { 
  Send, Clock, Shield, BarChart3, List, Layers, Play, Pause, 
  Square, Upload, MessageSquare, CheckCheck, Info, Sparkles,
  ChevronRight, AlertCircle, FileText, Image as ImageIcon, 
  Video, Calendar, MousePointer2, Zap, History, Eye
} from 'lucide-react';

const Campaigns: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'running' | 'history'>('create');
  const [speed, setSpeed] = useState('Normal');
  const [msgText, setMsgText] = useState('Olá {{nome}}, tudo bem? Temos uma novidade exclusiva para você hoje! 🚀');
  const [campaignName, setCampaignName] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{name: string, type: string} | null>(null);

  const insertVariable = (variable: string) => {
    setMsgText(prev => prev + ` {{${variable}}}`);
  };

  const stats = [
    { label: 'Total Enviado', value: '12.4k', icon: Send, color: 'indigo' },
    { label: 'Taxa de Entrega', value: '98.2%', icon: CheckCheck, color: 'emerald' },
    { label: 'Engajamento', value: '45%', icon: Zap, color: 'amber' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Navigation & Stats Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex gap-1 bg-white p-1.5 rounded-[1.5rem] border border-gray-100 shadow-sm">
          {[
            { id: 'create', label: 'Nova Campanha', icon: PlusIcon },
            { id: 'running', label: 'Em Execução', icon: Play },
            { id: 'history', label: 'Histórico', icon: History },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          {stats.map((s, i) => (
            <div key={i} className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-50 shadow-sm">
               <div className={`p-2 rounded-xl bg-${s.color}-50 text-${s.color}-500`}><s.icon size={16} /></div>
               <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{s.label}</p>
                  <p className="text-sm font-black text-gray-800">{s.value}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Layers size={22} /></div>
                <div>
                   <h3 className="text-xl font-black text-gray-800 tracking-tight">Configuração de Conteúdo</h3>
                   <p className="text-sm text-gray-400 font-medium">Personalize sua mensagem para máxima conversão.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identificação</label>
                    <input 
                      type="text" 
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-sm" 
                      placeholder="Ex: Oferta Relâmpago Maio" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lista de Destino</label>
                    <select className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer font-medium text-sm">
                      <option>Selecione uma lista...</option>
                      <option>Clientes VIP (450 contatos)</option>
                      <option>Novos Leads (120 contatos)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Corpo da Mensagem</label>
                    <div className="flex gap-1.5">
                      {['nome', 'saudação', 'empresa'].map(v => (
                        <button 
                          key={v}
                          onClick={() => insertVariable(v)}
                          className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-100 transition-colors"
                        >
                          + {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea 
                    rows={6} 
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm leading-relaxed" 
                    placeholder="Escreva aqui..."
                  ></textarea>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Anexo Multimídia</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {[
                       { id: 'img', icon: ImageIcon, label: 'Imagem' },
                       { id: 'vid', icon: Video, label: 'Vídeo' },
                       { id: 'pdf', icon: FileText, label: 'PDF' },
                       { id: 'audio', icon: Zap, label: 'Áudio' },
                     ].map(m => (
                       <button 
                        key={m.id}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed transition-all group ${
                          selectedMedia?.type === m.id ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-indigo-200'
                        }`}
                        onClick={() => setSelectedMedia({name: 'arquivo.png', type: m.id})}
                       >
                         <m.icon size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-black uppercase">{m.label}</span>
                       </button>
                     ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Shield & Speed Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <Shield size={20} />
                    <h4 className="text-sm font-black uppercase tracking-widest">Modo Anti-Bloqueio</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-500 font-bold">Velocidade de Disparo</span>
                       <span className="text-indigo-600 font-black">{speed}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       {['Seguro', 'Normal', 'Rápido'].map(s => (
                         <button 
                           key={s}
                           onClick={() => setSpeed(s)}
                           className={`py-2 rounded-xl text-[10px] font-black transition-all border ${
                             speed === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                           }`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Calendar size={20} />
                    <h4 className="text-sm font-black uppercase tracking-widest">Agendamento</h4>
                  </div>
                  <div className="relative group">
                     <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                     <input type="datetime-local" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10" />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                     <Info size={14} className="text-amber-500 shrink-0" />
                     <p className="text-[9px] text-amber-800 font-bold leading-tight">Sugestão: Terças às 10h costumam ter +20% de abertura na sua base.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Preview Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-6">
               <div className="relative mx-auto w-full max-w-[320px] aspect-[9/18.5] bg-gray-900 rounded-[3.5rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden ring-1 ring-gray-700">
                  {/* Phone Header */}
                  <div className="bg-gray-100/95 backdrop-blur-md p-5 pb-3 flex items-center gap-3 border-b border-gray-200">
                     <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">LS</div>
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-800">Lead do ZapFlow</p>
                        <p className="text-[8px] text-emerald-500 font-bold">Online agora</p>
                     </div>
                  </div>
                  {/* Phone Chat Area */}
                  <div className="p-4 space-y-3 h-[calc(100%-80px)] overflow-y-auto bg-[#e5ddd5] custom-scrollbar">
                     <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[90%] animate-in slide-in-from-left duration-300">
                        {selectedMedia && (
                          <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center gap-3 border border-gray-100">
                             <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                                {selectedMedia.type === 'img' ? <ImageIcon size={20} /> : <FileText size={20} />}
                             </div>
                             <p className="text-[10px] font-bold text-gray-500 truncate">{selectedMedia.name}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {msgText.replace('{{nome}}', 'Lucas').replace('{{saudação}}', 'Bom dia').replace('{{empresa}}', 'ZapFlow Inc')}
                        </p>
                        <div className="flex justify-end mt-1">
                           <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">10:45</span>
                        </div>
                     </div>
                  </div>
               </div>

               <button className="w-full mt-8 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-[2rem] shadow-2xl shadow-emerald-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Play size={20} fill="currentColor" /> INICIAR CAMPANHA AGORA
               </button>
               <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                  Custo estimado: <span className="text-emerald-500">0.02 créditos/msg</span>
               </p>
            </div>
          </div>
        </div>
      ) : activeTab === 'running' ? (
        <div className="space-y-6">
          {[1].map((i) => (
            <div key={i} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-bottom-5">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Ativa
                      </span>
                      <h4 className="text-xl font-black text-gray-800">Campanha Verão 2024 #042</h4>
                   </div>
                   <p className="text-sm text-gray-500 font-medium">Iniciada hoje às 09:30 • Lista: Clientes High-Ticket • Velocity: Seguro</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-6 py-2.5 bg-gray-50 text-gray-600 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all flex items-center gap-2">
                    <Pause size={16} /> Pausar
                  </button>
                  <button className="px-6 py-2.5 bg-rose-50 text-rose-500 rounded-2xl font-black text-xs hover:bg-rose-100 transition-all flex items-center gap-2">
                    <Square size={16} fill="currentColor" /> Encerrar
                  </button>
                </div>
              </div>

              {/* Progress & Analytics Funnel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                 <div className="lg:col-span-4 space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progresso Total</span>
                       <span className="text-3xl font-black text-indigo-600">75%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 ring-1 ring-gray-100">
                       <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 px-1">
                       <span>337 Enviados</span>
                       <span>450 Total</span>
                    </div>
                 </div>

                 <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Entregues', value: '312', color: 'indigo', icon: CheckCheck },
                      { label: 'Lidos (visto)', value: '240', color: 'blue', icon: Eye },
                      { label: 'Respostas', value: '84', color: 'emerald', icon: MessageSquare },
                      { label: 'Falhas', value: '12', color: 'rose', icon: AlertCircle },
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 group hover:scale-[1.05] transition-transform">
                        <div className={`p-2 w-fit rounded-xl bg-${stat.color}-50 text-${stat.color}-500 mb-3`}><stat.icon size={18} /></div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black text-${stat.color}-600`}>{stat.value}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Real-time Logs Console */}
              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    <History size={14} /> Log de Eventos em Tempo Real
                 </div>
                 <div className="bg-gray-900 rounded-3xl p-6 font-mono text-[11px] leading-relaxed overflow-hidden relative">
                    <div className="space-y-1.5 h-32 overflow-y-auto custom-scrollbar opacity-80">
                       <p className="text-emerald-400">[09:30:12] Conexão socket.io estabelecida com sucesso.</p>
                       <p className="text-gray-400">[09:31:05] Mensagem #335 enviada para +5511994... - OK</p>
                       <p className="text-gray-400">[09:31:58] Pausa inteligente de 10s aplicada (Anti-bloqueio).</p>
                       <p className="text-indigo-400">[09:32:08] Retomando disparos...</p>
                       <p className="text-gray-400">[09:32:15] Mensagem #336 enviada para +5521987... - OK</p>
                       <p className="text-rose-400">[09:32:22] Falha no disparo para +5511912... (Número inválido).</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent"></div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
           <div className="w-20 h-20 bg-gray-100 rounded-[2.5rem] flex items-center justify-center text-gray-300">
              <History size={40} />
           </div>
           <div>
              <h4 className="text-xl font-black text-gray-800">Histórico de Campanhas</h4>
              <p className="text-sm text-gray-400 max-w-sm mt-1">Aqui você poderá ver o desempenho consolidado de todas as campanhas já finalizadas.</p>
           </div>
        </div>
      )}
    </div>
  );
};

// Helper for the Plus icon missing in current scope if not imported
const PlusIcon = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default Campaigns;