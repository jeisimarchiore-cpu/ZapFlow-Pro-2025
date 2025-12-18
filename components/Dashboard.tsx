import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart
} from 'recharts';
import { 
  Users, Send, CheckCircle, AlertCircle, Clock, MessageSquareText, 
  ShieldCheck, UserMinus, Globe, Smile, Zap, TrendingUp, Sparkles, RefreshCw, FileText, X
} from 'lucide-react';
import { subscribeToCollection } from '../services/firebase';
import { Contact, Campaign } from '../types';

const Dashboard: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const SERVER_URL = "http://localhost:8080";

  useEffect(() => {
    const unsubContacts = subscribeToCollection('contacts', (data) => {
      setContacts(data as Contact[]);
    });
    const unsubCampaigns = subscribeToCollection('campaigns', (data) => {
      setCampaigns(data as Campaign[]);
      setLoading(false);
    });

    return () => {
      unsubContacts();
      unsubCampaigns();
    };
  }, []);

  const totalLeads = contacts.length;
  const activeLeads = contacts.filter(c => c.status === 'Ativo').length;
  const riskLeads = contacts.filter(c => c.status === 'Risco').length;
  const totalCampaigns = campaigns.length;

  const handleGenerateAiInsights = async () => {
    setIsGeneratingAi(true);
    try {
      const stats = {
        totalSent: campaigns.reduce((acc, c) => acc + c.sent, 0),
        totalReceived: campaigns.reduce((acc, c) => acc + c.sent, 0),
        receivedRate: 98,
        totalDelivered: campaigns.reduce((acc, c) => acc + (c.sent * 0.9), 0),
        deliveredRate: 90,
        totalViewed: campaigns.reduce((acc, c) => acc + (c.sent * 0.4), 0),
        viewedRate: 40,
        totalFailed: campaigns.reduce((acc, c) => acc + (c.total - c.sent), 0),
        failureRate: 5
      };

      const res = await fetch(`${SERVER_URL}/api/ai/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactCount: totalLeads,
          activeContacts: activeLeads,
          riskContacts: riskLeads,
          campaignStats: stats,
          filterPeriod: "Últimos 7 dias"
        })
      });
      const data = await res.json();
      if (data.success) setAiReport(data.insights);
    } catch (e) {
      console.error("Erro ao gerar insights:", e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const areaData = [
    { name: 'Seg', sent: 400, received: 240 },
    { name: 'Ter', sent: 700, received: 539 },
    { name: 'Qua', sent: 600, received: 980 },
    { name: 'Qui', sent: 800, received: 690 },
    { name: 'Sex', sent: 950, received: 880 },
    { name: 'Sáb', sent: 400, received: 380 },
    { name: 'Dom', sent: 300, received: 430 },
  ];

  const automationData = [
    { name: 'Bot', value: 72, color: '#10B981' },
    { name: 'Humano', value: 28, color: '#4F46E5' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Executive Intelligence <span className="text-emerald-500 font-black">PRO</span></h2>
          <p className="text-gray-500 text-sm">Monitorando {totalLeads} contatos e {totalCampaigns} campanhas.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerateAiInsights}
            disabled={isGeneratingAi}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50"
          >
            {isGeneratingAi ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isGeneratingAi ? 'Gerando Relatório...' : 'Análise Estratégica IA'}
          </button>
        </div>
      </header>

      {aiReport && (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Sparkles size={200} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <FileText size={24} className="text-indigo-300" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Relatório Gerencial Gemini IA</h3>
            </div>
            <button onClick={() => setAiReport(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
          </div>
          <div className="prose prose-invert max-w-none prose-sm leading-relaxed whitespace-pre-wrap font-medium">
            {aiReport}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Base de Leads', value: totalLeads, trend: `Live Sync`, up: true, icon: Users, color: 'indigo' },
          { label: 'Campanhas Ativas', value: campaigns.filter(c => c.status === 'Running').length, trend: 'Tempo Real', up: true, icon: Send, color: 'emerald' },
          { label: 'Conversas Ativas', value: activeLeads, trend: 'WhatsApp', up: true, icon: MessageSquareText, color: 'blue' },
          { label: 'Leads em Risco', value: riskLeads, trend: 'Ação Urgente', up: false, icon: UserMinus, color: 'rose' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative group overflow-hidden hover:shadow-xl transition-all">
            <div className="flex justify-between items-start relative z-10">
              <div className={`p-3 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600`}>
                <kpi.icon size={24} />
              </div>
              <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${kpi.up ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                {kpi.trend}
              </div>
            </div>
            <div className="mt-6 relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-black text-gray-800">{loading ? '...' : kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;