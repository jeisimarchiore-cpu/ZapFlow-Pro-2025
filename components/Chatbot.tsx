
import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, MessageSquare, Trash2, Plus, Save, Power, RefreshCw } from 'lucide-react';
import { subscribeToCollection, saveDocument, deleteDocument, updateDocument, getDocumentRef } from '../services/firebase';
import { getDoc, setDoc } from 'firebase/firestore';

const Chatbot: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'ai'>('rules');
  const [isEnabled, setIsEnabled] = useState(true);
  const [rules, setRules] = useState<any[]>([]);
  const [aiConfig, setAiConfig] = useState({ persona: '', fallback: true });
  const [isSyncing, setIsSyncing] = useState(true);

  // Sync Rules
  useEffect(() => {
    const unsub = subscribeToCollection('chatbot_rules', (data) => {
      setRules(data);
    });
    return () => unsub();
  }, []);

  // Sync Global Config
  useEffect(() => {
    const loadConfig = async () => {
      const docRef = getDocumentRef('chatbot_config', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setAiConfig(snap.data() as any);
      }
      setIsSyncing(false);
    };
    loadConfig();
  }, []);

  const handleSaveAiConfig = async () => {
    setIsSyncing(true);
    const docRef = getDocumentRef('chatbot_config', 'main');
    await setDoc(docRef, { ...aiConfig, updatedAt: new Date().toISOString() });
    setIsSyncing(false);
    alert('Configurações salvas no Firestore!');
  };

  const handleAddRule = async () => {
    const trigger = prompt('Palavra-chave:');
    const response = prompt('Resposta:');
    if (trigger && response) {
      await saveDocument('chatbot_rules', { trigger, response, match: 'Contém' });
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (confirm('Excluir regra?')) {
      await deleteDocument('chatbot_rules', id);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cérebro do Chatbot</h2>
          <p className="text-gray-500">Sincronizado via Google Firestore Cloud</p>
        </div>
        <div className="flex items-center gap-4">
          {isSyncing && <RefreshCw className="animate-spin text-gray-400" size={16} />}
          <button 
            onClick={() => setIsEnabled(!isEnabled)}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-md ${isEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            <Power size={18} /> {isEnabled ? 'Ativado' : 'Desativado'}
          </button>
        </div>
      </header>

      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('rules')}
          className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'rules' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
        >
          Regras de Gatilho ({rules.length})
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'ai' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
        >
          Persona IA (Gemini)
        </button>
      </div>

      {activeTab === 'rules' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button 
              onClick={handleAddRule}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
            >
              <Plus size={18} /> Nova Regra
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {rules.map((rule, idx) => (
              <div key={rule.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">QUANDO</span>
                      <span className="text-xs text-gray-400">Tipo: {rule.match}</span>
                    </div>
                    <p className="font-semibold text-gray-800">"{rule.trigger}"</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded">RESPONDER</span>
                    <p className="text-gray-600 text-sm italic">"{rule.response}"</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-gray-400 hover:text-rose-600 rounded-lg">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))}
            {rules.length === 0 && (
              <div className="text-center p-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                 <Bot size={48} className="mx-auto text-gray-300 mb-4" />
                 <p className="text-gray-400 font-medium">Nenhuma regra de gatilho configurada no momento.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-4 text-indigo-600">
                <div className="p-3 bg-indigo-50 rounded-2xl"><Sparkles size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold">Personalidade da IA Cloud</h3>
                  <p className="text-sm text-gray-500">Sincronia instantânea entre o servidor e a IA.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Prompt de Sistema (Persona)</label>
                  <textarea 
                    rows={10} 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm leading-relaxed"
                    placeholder="Defina o comportamento da IA..."
                    value={aiConfig.persona}
                    onChange={(e) => setAiConfig({...aiConfig, persona: e.target.value})}
                  ></textarea>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <Bot className="text-indigo-600" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">Fallback Automático</p>
                      <p className="text-xs text-gray-500">Persistido no Firestore.</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={aiConfig.fallback} 
                    onChange={(e) => setAiConfig({...aiConfig, fallback: e.target.checked})}
                    className="w-5 h-5 accent-indigo-600" 
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveAiConfig}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Salvar Configurações no Cloud
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-[3rem] text-white space-y-6 shadow-2xl">
             <h4 className="font-black text-xl flex items-center gap-2">
               <Database className="text-indigo-400" size={24} /> Firestore BI
             </h4>
             <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado da Persistência</p>
                   <p className="text-emerald-400 font-bold mt-1">Sincronizado</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Caminho do Firestore</p>
                   <p className="text-indigo-300 text-[10px] font-mono mt-1 break-all">artifacts/zapflow-pro/users/user-001/chatbot_rules</p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper
const Database = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
);

export default Chatbot;
