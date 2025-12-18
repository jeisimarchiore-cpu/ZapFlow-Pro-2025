import React, { useState, useEffect } from 'react';
import { 
  Users, Send, MessageSquareText, UserMinus, Sparkles, RefreshCw, FileText, X, AlertTriangle, TrendingUp, Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { subscribeToCollection } from '../services/firebase';
import { Contact, Campaign } from '../types';

const Dashboard: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const chartData = [
    { name: 'Seg', msgs: 400, leads: 240 },
    { name: 'Ter', msgs: 700, leads: 398 },
    { name: 'Qua', msgs: 1200, leads: 480 },
    { name: 'Qui', msgs: 1100, leads: 390 },
    { name: 'Sex', msgs: 1800, leads: 480 },
    { name: 'Sáb', msgs: 2100, leads: 520 },
    { name: 'Dom', msgs: 1500, leads: 400 },
  ];

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

  const handleGenerateAiInsights = async () => {
    setIsGeneratingAi(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${SERVER_URL}/api/ai/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactCount: totalLeads,
          activeContacts: activeLeads,
          riskContacts: riskLeads,
          campaignStats: { totalSent: campaigns.length, viewedRate: 45 },
          filterPeriod: "Últimos 7 dias"
        })
      });

      if (!res.ok) throw new Error("Motor Offline (localhost:8080)");
      const data = await res.json();
      setAiReport(data.insights);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Estratégia & <span className="text-emerald-500">BI</span></h2>
          <p className="text-gray-500 text-sm font-medium">Performance consolidada de {totalLeads} contatos em tempo real.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={handleGenerateAiInsights}
            disabled={isGeneratingAi}
            className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
          >
            {isGeneratingAi ? <RefreshCw size={18} className="animate-spin text-indigo-400" /> : <Sparkles size={18} className="text-indigo-400" />}
            {isGeneratingAi ? 'Processando BI...' : 'Insights com Gemini IA'}
          </button>
          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
              <AlertTriangle size={14} /> {errorMsg}
            </div>
          )}
        </div>
      </header>

      {aiReport && (
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden animate-in zoom-in-95 duration-500 border border-white/5">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Activity size={240} className="text-indigo-300" />
          </div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10">
                <FileText size={24} className="text-emerald-400" />
              </div>
              <div>
                 <h3 className="text-2xl font-black tracking-tight">Relatório Executivo IA</h3>
                 <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-widest">Análise gerada via Gemini 3 Flash</p>
              </div>
            </div>
            <button onClick={() => setAiReport(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={20} /></button>
          </div>
          <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-medium relative z-10 text-indigo-50/90">
            {aiReport}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
           <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                 <TrendingUp size={18} className="text-indigo-500" /> Atividade Semanal
              </h4>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-bold text-gray-400">MENSAGENS</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-gray-400">LEADS</span>
                 </div>
              </div>
           </div>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800}}
                  />
                  <Area type="monotone" dataKey="msgs" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMsgs)" />
                  <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-8 flex flex-col justify-center">
           <div className="text-center space-y-2">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Health Score da Base</h4>
              <div className="text-5xl font-black text-gray-900">84<span className="text-emerald-500">%</span></div>
           </div>
           <div className="space-y-4">
              {[
                { label: 'Engajamento Ativo', val: 72, color: 'emerald' },
                { label: 'Conversão de Funil', val: 45, color: 'indigo' },
                { label: 'Risco de Churn', val: 12, color: 'rose' },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                   <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                   </div>
                   <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${item.color}-500 rounded-full transition-all duration-1000 shadow-sm`} 
                        style={{ width: `${item.val}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Leads no CRM', value: totalLeads, trend: `+12%`, up: true, icon: Users, color: 'indigo' },
          { label: 'ROI Estimado', value: '4.2x', trend: 'Recorde', up: true, icon: TrendingUp, color: 'emerald' },
          { label: 'Taxa de Leitura', value: '94%', trend: 'Estável', up: true, icon: MessageSquareText, color: 'blue' },
          { label: 'Interações/Hora', value: '284', trend: 'Pico', up: true, icon: Activity, color: 'amber' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                <kpi.icon size={24} />
              </div>
              <div className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl ${kpi.up ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                {kpi.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{kpi.label}</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">{loading ? '...' : kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;