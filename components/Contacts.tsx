
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Upload, Trash2, Tag, Download, Filter, 
  MoreHorizontal, MessageSquare, Eye, Calendar, Phone,
  UserCheck, ShieldAlert, UserPlus, X, Edit2, ChevronRight,
  Zap, ArrowRightLeft, CheckCircle2, AlertCircle,
  Users, Send
} from 'lucide-react';
import { Contact, ContactStatus } from '../types';
import { subscribeToCollection, saveDocument, deleteDocument, updateDocument } from '../services/firebase';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<ContactStatus | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(true);

  // Sync Real-time com Firestore
  useEffect(() => {
    const unsub = subscribeToCollection('contacts', (data) => {
      setContacts(data as Contact[]);
      setIsSyncing(false);
    });
    return () => unsub();
  }, []);

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

  const handleImport = async () => {
    const lines = importText.split('\n').filter(l => l.trim() !== '');
    setIsSyncing(true);
    
    for (const line of lines) {
      const [name, phone, birthday] = line.split('\t');
      const newContact = {
        name: name || 'Lead Importado',
        whatsapp: phone?.replace(/\D/g, '') || '',
        birthday: birthday || '2000-01-01',
        status: 'Novo' as ContactStatus,
        lists: ['Importação ' + new Date().toLocaleDateString()],
        score: Math.floor(Math.random() * 100),
        source: 'Import' as const,
        lastInteraction: new Date().toISOString()
      };
      
      if (newContact.whatsapp.length >= 10) {
        await saveDocument('contacts', newContact);
      }
    }

    setImportText('');
    setShowImportModal(false);
    setIsSyncing(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument('contacts', id);
  };

  const handleBulkDelete = async () => {
    if (confirm(`Excluir ${selectedIds.size} contatos permanentemente?`)) {
      setIsSyncing(true);
      for (const id of Array.from(selectedIds)) {
        await deleteDocument('contacts', id);
      }
      setSelectedIds(new Set());
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {isSyncing && (
        <div className="absolute top-0 right-0 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm z-50 animate-pulse">
           <RefreshCw className="text-indigo-500 animate-spin" size={12} />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizando Firestore...</span>
        </div>
      )}

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
          <p className="text-gray-500 text-sm">Visualize e gerencie a saúde da sua base de leads no Cloud Firestore.</p>
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
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="hidden group-hover:flex justify-end gap-1.5 animate-in fade-in zoom-in duration-200">
                      <button className="p-2.5 text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm" title="Conversar">
                        <MessageSquare size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }}
                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
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
                 <button className="flex items-center gap-2 text-xs font-bold hover:text-rose-400 transition-colors" onClick={handleBulkDelete}>
                    <Trash2 size={16} /> Excluir em Massa
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

      {/* Modern Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">Cloud Import</h3>
                <p className="text-sm text-gray-500">Persistência direta no Google Cloud Firestore.</p>
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
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Dicas Firestore</label>
                    <div className="space-y-3">
                       {[
                         { icon: CheckCircle2, text: 'Os dados são salvos em tempo real', color: 'emerald' },
                         { icon: CheckCircle2, text: 'ID único gerado automaticamente pelo Firebase', color: 'emerald' },
                         { icon: AlertCircle, text: 'Mantenha a conexão ativa para sincronia', color: 'amber' },
                       ].map((tip, i) => (
                         <div key={i} className={`flex items-start gap-3 p-4 bg-${tip.color}-50 rounded-2xl border border-${tip.color}-100`}>
                            <tip.icon className={`text-${tip.color}-500 shrink-0 mt-0.5`} size={18} />
                            <p className={`text-xs font-medium text-${tip.color}-800`}>{tip.text}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-10 bg-gray-50/50 flex justify-end gap-4 border-t border-gray-100">
              <button 
                disabled={!importText.trim() || isSyncing}
                onClick={handleImport}
                className="px-12 py-4 bg-emerald-500 text-white font-black rounded-3xl shadow-2xl shadow-emerald-100 hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {isSyncing ? 'Sincronizando...' : 'Confirmar Importação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper components missing in snippet
const RefreshCw = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
);

export default Contacts;
