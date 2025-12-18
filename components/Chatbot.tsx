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

  // Alinhado com a porta 8000 conforme logs e Dockerfile
  const SERVER_URL = "http://localhost:8000";

  useEffect(() => {
    const unsub = subscribeToCollection('chatbot_rules', (data) => {
      setRules(data);
      if (data.length > 0) {
        fetch(`${SERVER_URL}/api/chatbot/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rules: data.map(r => ({ trigger: r.trigger, response: r.response, active: true, exactMatch: r.match === 'Exato' })) })
        }).catch(err => console.debug("Server not ready for rules sync"));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadConfig = async () => {
      const docRef = getDocumentRef('chatbot_config', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setAiConfig(data as any);
        setIsEnabled(data.isEnabled !== false);
        
        fetch(`${SERVER_URL}/api/chatbot/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt: data.persona, isAiEnabled: data.isEnabled })
        }).catch(err => console.debug("Server not ready for config sync"));
      }
      setIsSyncing(false);
    };
    loadConfig();
  }, []);

  const handleSaveAiConfig = async () => {
    setIsSyncing(true);
    const configToSave = { ...aiConfig, isEnabled, updatedAt: new Date().toISOString() };
    const docRef = getDocumentRef('chatbot_config', 'main');
    await setDoc(docRef, configToSave);
    
    try {
      await fetch(`${SERVER_URL}/api/chatbot/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt: aiConfig.persona, isAiEnabled: isEnabled })
      });
      alert('Motor de IA atualizado no servidor!');
    } catch (e) {
      console.error("Erro ao sincronizar com servidor:", e);
    }

    setIsSyncing(false);
  };

  const handleAddRule = async () => {
    const trigger = prompt('Palavra-chave de ativação:');
    const response = prompt('Resposta do bot:');
    if (trigger && response) {
      await saveDocument('chatbot_rules', { trigger, response, match: 'Contém' });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Híbrido IA & Regras</h2>
          <p className="text-gray-500 text-sm">Controle central do motor de atendimento (Porta 8000).</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsEnabled(!isEnabled)}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-md ${isEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            <Power size={18} /> {isEnabled ? 'Motor Ativo' : 'Motor Pausado'}
          </button>
        </div>
      </header>

      <div className="flex gap-4 border-b border-gray-200">
        <button onClick={() => setActiveTab('rules')} className={`pb-4 px-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'rules' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}>
          Dicionário de Respostas ({rules.length})
        </button>
        <button onClick={() => setActiveTab('ai')} className={`pb-4 px-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'ai' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}>
          Configuração Gemini IA
        </button>
      </div>

      {activeTab === 'rules' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={handleAddRule} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              <Plus size={16} /> Adicionar Gatilho
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Se receber:</p>
                    <p className="font-bold text-gray-800">"{rule.trigger}"</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Responder:</p>
                    <p className="text-gray-600 text-sm italic">"{rule.response}"</p>
                  </div>
                </div>
                <button onClick={() => deleteDocument('chatbot_rules', rule.id)} className="p-2 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Instruções de Personalidade (System Prompt)</label>
              <textarea 
                rows={8} 
                className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all text-sm leading-relaxed"
                placeholder="Ex: Você é um vendedor amigável da ZapFlow..."
                value={aiConfig.persona}
                onChange={(e) => setAiConfig({...aiConfig, persona: e.target.value})}
              />
           </div>
           <button onClick={handleSaveAiConfig} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.01] transition-all">
             Atualizar Motor IA em Tempo Real
           </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;