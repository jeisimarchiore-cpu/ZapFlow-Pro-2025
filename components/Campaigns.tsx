import React, { useState, useEffect } from 'react';
import { 
  Send, Clock, Shield, BarChart3, List, Layers, Play, Pause, 
  Square, Upload, MessageSquare, CheckCheck, Info, Sparkles,
  ChevronRight, AlertCircle, FileText, ImageIcon, 
  Video, Calendar, MousePointer2, Zap, History, Eye, Plus, RefreshCw, Smartphone
} from 'lucide-react';
import { subscribeToCollection, saveDocument, updateDocument } from '../services/firebase';
import { Campaign, Contact } from '../types';
import { socketService } from '../services/socket';

interface CampaignsProps {
  isSocketActive: boolean;
}

const Campaigns: React.FC<CampaignsProps> = ({ isSocketActive }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'running' | 'history'>('create');
  const [speed, setSpeed] = useState('Normal');
  const [msgText, setMsgText] = useState('Olá {{nome}}, tudo bem? Temos uma novidade exclusiva para você hoje! 🚀');
  const [campaignName, setCampaignName] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Alinhado com a porta 8000 conforme logs e Dockerfile
  const SERVER_URL = "http://localhost:8000";

  useEffect(() => {
    const unsub = subscribeToCollection('campaigns', (data) => {
      setCampaigns(data as Campaign[]);
    });
    const unsubContacts = subscribeToCollection('contacts', (data) => {
      setContacts(data as Contact[]);
    });
    return () => { unsub(); unsubContacts(); };
  }, []);

  useEffect(() => {
    const handleUpdate = (data: any) => {
      if (data.campaignId) {
        const progress = Math.round((data.sent / data.total) * 100);
        updateDocument('campaigns', data.campaignId, { 
          sent: data.sent, 
          progress, 
          status: data.status === 'Concluído' ? 'Completed' : 'Running' 
        });
      }
    };
    socketService.on('campaign_update', handleUpdate);
    return () => socketService.off('campaign_update', handleUpdate);
  }, []);

  const handleStartCampaign = async () => {
    if (!campaignName || !msgText) { alert('Preencha os dados.'); return; }
    if (!isSocketActive) { alert('Conecte o WhatsApp primeiro.'); return; }

    setIsSaving(true);
    try {
      const docRef = await saveDocument('campaigns', {
        name: campaignName,
        message: msgText,
        status: 'Running',
        progress: 0,
        sent: 0,
        total: contacts.length,
        createdAt: new Date().toISOString(),
        speed: speed
      });

      await fetch(`${SERVER_URL}/api/campaign/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: docRef.id,
          audience: contacts.map(c => ({ id: c.id, name: c.name, number: c.whatsapp })),
          message: msgText,
          speed: speed,
          smartDelayMs: speed === 'Lento' ? 60000 : speed === 'Normal' ? 30000 : 10000
        })
      });

      setCampaignName('');
      setActiveTab('running');
    } catch (error) {
      console.error("Erro no disparo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex gap-1 bg-white p-1.5 rounded-[1.5rem] border border-gray-100 shadow-sm">
          {[
            { id: 'create', label: 'Nova Campanha', icon: Plus },
            { id: 'running', label: 'Em Execução', icon: Play },
            { id: 'history', label: 'Histórico', icon: History },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
              <h3 className="text-xl font-black text-gray-800">Parâmetros de Disparo</h3>
              <div className="space-y-5">
                <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm font-bold" placeholder="Nome da Campanha" />
                <textarea rows={6} value={msgText} onChange={(e) => setMsgText(e.target.value)} className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:bg-white text-sm" placeholder="Sua mensagem..." />
                <div className="flex gap-2">
                   {['Lento', 'Normal', 'Rápido'].map(s => (
                     <button key={s} onClick={() => setSpeed(s)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${speed === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}>{s}</button>
                   ))}
                </div>
              </div>
            </div>
            <button onClick={handleStartCampaign} disabled={isSaving || !isSocketActive} className="w-full py-6 bg-emerald-500 text-white font-black rounded-[2.5rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
              {isSaving ? 'INICIANDO MOTOR...' : 'LANÇAR CAMPANHA AGORA'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.filter(c => activeTab === 'running' ? (c.status === 'Running' || c.status === 'Paused') : c.status === 'Completed').map(camp => (
            <div key={camp.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-gray-800">{camp.name}</h4>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${camp.status === 'Completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500 animate-pulse'}`}>{camp.status}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-gray-400">
                  <span>{camp.progress}% COMPLETO</span>
                  <span>{camp.sent} / {camp.total} ENVIADOS</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${camp.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;