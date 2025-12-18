
import React, { useState } from 'react';
import { Bot, Sparkles, MessageSquare, Trash2, Plus, Save, Power } from 'lucide-react';

const Chatbot: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'ai'>('rules');
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cérebro do Chatbot</h2>
          <p className="text-gray-500">Combine regras fixas com inteligência artificial</p>
        </div>
        <button 
          onClick={() => setIsEnabled(!isEnabled)}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-md ${isEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}
        >
          <Power size={18} /> {isEnabled ? 'Ativado' : 'Desativado'}
        </button>
      </header>

      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('rules')}
          className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'rules' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
        >
          Regras de Gatilho
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
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
              <Plus size={18} /> Nova Regra
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { trigger: 'Olá', response: 'Olá! Como posso ajudar você hoje?', match: 'Exato' },
              { trigger: 'preço', response: 'Nossos planos começam em R$ 97/mês. Gostaria de ver o catálogo?', match: 'Contém' },
            ].map((rule, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
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
                  <button className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg"><Save size={18}/></button>
                  <button className="p-2 text-gray-400 hover:text-rose-600 rounded-lg"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-4 text-indigo-600">
                <div className="p-3 bg-indigo-50 rounded-2xl"><Sparkles size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold">Personalidade da IA</h3>
                  <p className="text-sm text-gray-500">Defina como a IA deve se comportar quando nenhuma regra for acionada.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Prompt de Sistema (Persona)</label>
                  <textarea 
                    rows={10} 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm leading-relaxed"
                    placeholder="Você é o atendente virtual da ZapFlow Pro. Seja amigável, utilize emojis de forma profissional e tente sempre converter o cliente para uma demonstração gratuita."
                  ></textarea>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <Bot className="text-indigo-600" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">Fallback Automático</p>
                      <p className="text-xs text-gray-500">Usar IA se a mensagem do usuário não bater com nenhuma regra fixa.</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600" />
                </div>
              </div>

              <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                Salvar Configurações de IA
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
              <h4 className="font-bold text-lg mb-2">Dica de Especialista 💡</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                As "Regras Fixas" são ótimas para suporte imediato e links. A "Persona IA" é perfeita para manter o engajamento quando o cliente faz perguntas fora do script.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-4">Uso de Tokens</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Consumo Mensal</span>
                  <span className="font-bold text-gray-800">12,402 / 50,000</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
