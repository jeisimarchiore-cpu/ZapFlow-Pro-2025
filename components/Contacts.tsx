
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Upload, Trash2, Tag, Download, Filter, 
  MoreHorizontal, MessageSquare, Eye, Calendar, Phone,
  UserCheck, ShieldAlert, UserPlus, X, Edit2, ChevronRight,
  Zap, ArrowRightLeft, CheckCircle2, AlertCircle,
  // Fix: Add missing imports from lucide-react
  Users, Send
} from 'lucide-react';
import { Contact, ContactStatus } from '../types';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'João Silva', whatsapp: '5511999999999', birthday: '1990-05-15', status: 'Ativo', lists: ['Clientes VIP'], score: 95, source: 'Manual', lastInteraction: '2024-05-20T10:30:00' },
    { id: '2', name: 'Maria Souza', whatsapp: '5521988888888', birthday: '1985-12-02', status: 'Novo', lists: ['Newsletter'], score: 40, source: 'Import', lastInteraction: '2024-05-19T15:20:00' },
    { id: '3', name: 'Pedro Santos', whatsapp: '5531977777777', birthday: '1992-08-22', status: 'Risco', lists: ['Leads Frios'], score: 12, source: 'Chatbot', lastInteraction: '2024-05-10T09:00:00' },
    { id: '4', name: 'Ana Costa', whatsapp: '5511912345678', birthday: '1995-03-10', status: 'Ativo', lists: ['Clientes VIP', 'Promo'], score: 88, source: 'API', lastInteraction: '2024-05-21T11:45:00' },
  ]);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<ContactStatus | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesFilter = activeFilter === 'Todos' || c.status === activeFilter;
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.whatsapp.includes(searchQuery);
      return matchesFilter && matchesSearch;
    });
  }, [contacts, activeFilter, searchQuery]);

  const handleImport = () => {
    const lines = importText.split('\n').filter(l => l.trim() !== '');
    const newContacts: Contact[] = lines.map((line) => {
      const [name, phone, birthday] = line.split('\t');
      // Fix: cast source to 'Import' as const to match Contact interface literal types
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: name || 'Lead Importado',
        whatsapp: phone?.replace(/\D/g, '') || '',
        birthday: birthday || '2000-01-01',
        status: 'Novo' as ContactStatus,
        lists: ['Importação ' + new Date().toLocaleDateString()],
        score: 50,
        source: 'Import' as const,
        lastInteraction: new Date().toISOString()
      };
    }).filter(c => c.whatsapp.length >= 10);

    setContacts([...contacts, ...newContacts]);
    setImportText('');
    setShowImportModal(false);
  };

  const getScoreColor = (score: number = 0) => {
    if (score > 70) return 'text-emerald-500 bg-emerald-50';
    if (score > 30) return 'text-amber-500 bg-amber-50';
    return 'text-rose-500 bg-rose-50';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Base Total', value: contacts.length, icon: Users, color: 'indigo' },
          { label: 'Novos Leads', value: contacts.filter(c => c.status === 'Novo').length, icon: UserPlus, color: 'emerald' },
          { label: 'Engajamento Médio', value: '64%', icon: Zap, color: 'amber' },
          { label: 'Taxa de Risco', value: '12%', icon: ShieldAlert, color: 'rose' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
              <h4 className="text-2xl font-black text-gray-800 tracking-tight">{m.value}</h4>
            </div>
            <div className={`p-3 rounded-2xl bg-${m.color}-50 text-${m.color}-500 group-hover:scale-110 transition-transform`}>
              <m.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">CRM de Contatos</h2>
          <p className="text-gray-500 text-sm">Visualize e gerencie a saúde da sua base de leads.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-2xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
          >
            <Upload size={18} /> Importar
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl hover:bg-emerald-600 transition-all font-bold text-sm shadow-lg shadow-emerald-100">
            <Plus size={18} /> Novo Lead
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-3 rounded-[1.8rem] shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, número ou tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-transparent focus:border-indigo-500/20 rounded-2xl text-sm transition-all focus:bg-white focus:shadow-inner"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100">
          {(['Todos', 'Ativo', 'Novo', 'Risco'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Filter size={20}/></button>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === filteredContacts.length && filteredContacts.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded-lg text-emerald-500 focus:ring-emerald-500 border-gray-200" 
                  />
                </th>
                <th className="px-4 py-5">Lead / Origem</th>
                <th className="px-4 py-5">Score & Status</th>
                <th className="px-4 py-5">Tags / Listas</th>
                <th className="px-4 py-5 text-right">Interação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredContacts.map((contact) => (
                <tr 
                  key={contact.id} 
                  className={`hover:bg-gray-50/60 transition-all group cursor-pointer ${selectedIds.has(contact.id) ? 'bg-indigo-50/30' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="w-5 h-5 rounded-lg text-emerald-500 focus:ring-emerald-500 border-gray-200" 
                    />
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform">
                        {contact.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-800 truncate">{contact.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400 font-medium">+{contact.whatsapp}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-bold uppercase">{contact.source}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between w-24">
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${
                          contact.status === 'Ativo' ? 'text-emerald-500' :
                          contact.status === 'Novo' ? 'text-indigo-500' : 'text-rose-500'
                        }`}>
                          {contact.status}
                        </span>
                        <span className="text-[10px] font-black text-gray-400">{contact.score}%</span>
                      </div>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            contact.score! > 70 ? 'bg-emerald-500' : 
                            contact.score! > 30 ? 'bg-amber-500' : 'bg-rose-500'
                          }`} 
                          style={{ width: `${contact.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {contact.lists.slice(0, 2).map((l, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-gray-100 text-gray-500 rounded-lg text-[9px] font-bold uppercase shadow-sm">
                          {l}
                        </span>
                      ))}
                      {contact.lists.length > 2 && <span className="text-[9px] font-bold text-gray-300">+{contact.lists.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex flex-col items-end group-hover:hidden">
                       <p className="text-[11px] font-bold text-gray-700">Há 2 horas</p>
                       <p className="text-[10px] text-gray-400">Via WhatsApp</p>
                    </div>
                    <div className="hidden group-hover:flex justify-end gap-1.5 animate-in fade-in zoom-in duration-200">
                      <button className="p-2.5 text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm" title="Conversar">
                        <MessageSquare size={16} />
                      </button>
                      <button className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-gray-900/90 backdrop-blur-md text-white px-8 py-4 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-8 min-w-[500px]">
              <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                 <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-black text-sm">
                    {selectedIds.size}
                 </div>
                 <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Selecionados</span>
              </div>
              <div className="flex items-center gap-6">
                 <button className="flex items-center gap-2 text-xs font-bold hover:text-emerald-400 transition-colors">
                    <Send size={16} /> Disparar Campanha
                 </button>
                 <button className="flex items-center gap-2 text-xs font-bold hover:text-indigo-400 transition-colors">
                    <Tag size={16} /> Etiquetar
                 </button>
                 <button className="flex items-center gap-2 text-xs font-bold hover:text-rose-400 transition-colors">
                    <Trash2 size={16} /> Excluir
                 </button>
              </div>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500"
              >
                <X size={18} />
              </button>
           </div>
        </div>
      )}

      {/* CRM Profile Sidebar */}
      {selectedContact && (
        <div className="fixed inset-0 z-[150] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedContact(null)}></div>
          <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-500 ease-out border-l border-gray-100">
            <div className="h-full flex flex-col">
              {/* Profile Header */}
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-5">
                   <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-100 ring-8 ring-indigo-50">
                     {selectedContact.name.split(' ').map(n => n[0]).join('')}
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-gray-800 tracking-tight">{selectedContact.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <span className={`w-2.5 h-2.5 rounded-full ${selectedContact.status === 'Ativo' ? 'bg-emerald-500' : 'bg-gray-300'} animate-pulse`}></span>
                         <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{selectedContact.status} • Lead {selectedContact.source}</span>
                      </div>
                   </div>
                </div>
                <button onClick={() => setSelectedContact(null)} className="p-3 bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* CRM Tabs/Details */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Score and Contact */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-center space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Health Score</p>
                      <h5 className={`text-4xl font-black ${selectedContact.score! > 70 ? 'text-emerald-500' : 'text-rose-500'}`}>{selectedContact.score}%</h5>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full">
                         <div className={`h-full rounded-full ${selectedContact.score! > 70 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{width: `${selectedContact.score}%`}}></div>
                      </div>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-center items-center gap-2">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-500"><Phone size={24} /></div>
                      <p className="font-black text-gray-800">+{selectedContact.whatsapp}</p>
                      <button className="text-[10px] font-black text-indigo-500 uppercase hover:underline">Ver no WhatsApp</button>
                   </div>
                </div>

                {/* Automation & Tags */}
                <div className="space-y-4">
                   <h6 className="text-xs font-black text-gray-400 uppercase tracking-widest">Segmentação e Fluxo</h6>
                   <div className="flex flex-wrap gap-2">
                      {selectedContact.lists.map((l, i) => (
                        <div key={i} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-xs font-bold border border-indigo-100">
                          <Tag size={14} /> {l}
                        </div>
                      ))}
                      <button className="flex items-center gap-2 border border-dashed border-gray-200 px-4 py-2 rounded-2xl text-xs font-bold text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all">
                        <Plus size={14} /> Nova Tag
                      </button>
                   </div>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                   <h6 className="text-xs font-black text-gray-400 uppercase tracking-widest">Linha do Tempo (Atividade)</h6>
                   <div className="relative space-y-8 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                      <div className="relative pl-14 group">
                         <div className="absolute left-0 top-0 w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl border-4 border-white shadow-sm flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <Send size={18} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-800">Mensagem Enviada</p>
                            <p className="text-xs text-gray-500 mt-1 italic leading-relaxed">"Olá, vimos que você se interessou pelo ZapFlow Pro. Como podemos ajudar hoje?"</p>
                            <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase">Lida • Hoje às 10:45</p>
                         </div>
                      </div>
                      <div className="relative pl-14 group">
                         <div className="absolute left-0 top-0 w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl border-4 border-white shadow-sm flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <Zap size={18} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-800">Gatilho de Chatbot</p>
                            <p className="text-xs text-gray-500 mt-1">O lead digitou "preço" e a regra [Vendas] foi acionada automaticamente.</p>
                            <p className="text-[10px] font-bold text-indigo-600 mt-2 uppercase">Ontem às 22:15</p>
                         </div>
                      </div>
                      <div className="relative pl-14 group">
                         <div className="absolute left-0 top-0 w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl border-4 border-white shadow-sm flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                            <ArrowRightLeft size={18} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-800">Origem de Lead via API</p>
                            <p className="text-xs text-gray-500 mt-1">Contato capturado via Webhook do Site Principal.</p>
                            <p className="text-[10px] font-bold text-amber-600 mt-2 uppercase">15 Mai 2024</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                 <button className="flex-1 py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black text-sm hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                   Remover Lead
                 </button>
                 <button className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                   <MessageSquare size={18} fill="currentColor" /> Abrir Conversa
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">Importação em Massa</h3>
                <p className="text-sm text-gray-500">Cole seus dados de planilhas para processamento inteligente.</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-3 text-gray-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Área de Colagem</label>
                    <textarea 
                      rows={10} 
                      className="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] focus:outline-none focus:border-indigo-500 focus:bg-white font-mono text-xs leading-relaxed transition-all resize-none"
                      placeholder="Nome	WhatsApp	Nascimento&#10;João Silva	5511999999999	1990-01-01"
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Dicas de Sucesso</label>
                    <div className="space-y-3">
                       {[
                         { icon: CheckCircle2, text: 'Use o formato TAB (excel/sheets padrão)', color: 'emerald' },
                         { icon: CheckCircle2, text: 'Números sem DDI (+55) serão normalizados', color: 'emerald' },
                         { icon: AlertCircle, text: 'Arquivos com mais de 5.000 linhas podem demorar', color: 'amber' },
                       ].map((tip, i) => (
                         <div key={i} className={`flex items-start gap-3 p-4 bg-${tip.color}-50 rounded-2xl border border-${tip.color}-100`}>
                            <tip.icon className={`text-${tip.color}-500 shrink-0 mt-0.5`} size={18} />
                            <p className={`text-xs font-medium text-${tip.color}-800`}>{tip.text}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {importText && (
                <div className="animate-in fade-in slide-in-from-top-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Preview dos Dados</h4>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                     <table className="w-full text-[10px] text-left">
                        <thead className="bg-gray-100 text-gray-500 font-bold uppercase">
                           <tr>
                              <th className="px-4 py-2">Nome</th>
                              <th className="px-4 py-2">Telefone</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                           {importText.split('\n').slice(0, 5).map((l, i) => {
                             const [n, p] = l.split('\t');
                             if (!l.trim()) return null;
                             return (
                               <tr key={i}>
                                  <td className="px-4 py-2 font-bold text-gray-700">{n || '—'}</td>
                                  <td className="px-4 py-2 text-emerald-600 font-mono">{p || '—'}</td>
                               </tr>
                             )
                           })}
                        </tbody>
                     </table>
                     <div className="p-2 text-center text-[10px] text-gray-400 font-bold uppercase bg-gray-50">
                        Exibindo os primeiros 5 registros...
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-gray-50/50 flex justify-end gap-4 border-t border-gray-100">
              <button 
                onClick={() => setShowImportModal(false)}
                className="px-8 py-4 text-gray-500 font-black text-sm hover:text-gray-800 transition-colors"
              >
                Descartar
              </button>
              <button 
                disabled={!importText.trim()}
                onClick={handleImport}
                className="px-12 py-4 bg-emerald-500 text-white font-black rounded-3xl shadow-2xl shadow-emerald-100 hover:bg-emerald-600 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Importação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
