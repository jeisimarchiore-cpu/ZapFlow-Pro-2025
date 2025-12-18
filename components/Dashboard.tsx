
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart
} from 'recharts';
import { 
  Users, Send, CheckCircle, AlertCircle, Clock, MessageSquareText, 
  ShieldCheck, UserMinus, Globe, Smile, Zap, TrendingUp
} from 'lucide-react';
import { subscribeToCollection } from '../services/firebase';
import { Contact, Campaign } from '../types';

const Dashboard: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Cálculos dinâmicos baseados no Firestore
  const totalLeads = contacts.length;
  const activeLeads = contacts.filter(c => c.status === 'Ativo').length;
  const riskLeads = contacts.filter(c => c.status === 'Risco').length;
  const newLeads = contacts.filter(c => c.status === 'Novo').length;
  
  const totalCampaigns = campaigns.length;
  const runningCampaigns = campaigns.filter(c => c.status === 'Running').length;

  // Mock de dados para os gráficos (podem ser agregados do Firestore em produção)
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
          <p className="text-gray-500 text-sm">Monitorando {totalLeads} contatos e {totalCampaigns} campanhas no Cloud Firestore.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-black text-emerald-600 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> CLOUD SYNC ATIVO
          </span>
        </div>
      </header>

      {/* KPI Cards Dinâmicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Base de Leads', value: totalLeads, trend: `+${newLeads} novos`, up: true, icon: Users, color: 'indigo' },
          { label: 'Campanhas Ativas', value: runningCampaigns, trend: 'Tempo Real', up: true, icon: Send, color: 'emerald' },
          { label: 'Conversas Ativas', value: activeLeads, trend: 'Live', up: true, icon: MessageSquareText, color: 'blue' },
          { label: 'Leads em Risco', value: riskLeads, trend: 'Ação Urgente', up: false, icon: UserMinus, color: 'rose' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative group overflow-hidden hover:shadow-xl hover:shadow-gray-100 transition-all">
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
            <div className={`absolute -bottom-4 -right-4 w-20 h-20 bg-${kpi.color}-500 opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight">Desempenho Semanal</h3>
              <p className="text-sm text-gray-400 font-medium">Fluxo de mensagens e engajamento da base</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div> Enviadas
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm"></div> Recebidas
               </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={areaData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '15px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sent" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorSent)" />
                <Bar dataKey="received" barSize={20} fill="#10B981" radius={[10, 10, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="text-center mb-8">
            <h3 className="text-xl font-black text-gray-800 tracking-tight">Atendimento AI</h3>
            <p className="text-sm text-gray-400 font-medium">Resolutividade via Automação</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={automationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {automationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 w-full space-y-3">
             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></div> Chatbot
                </span>
                <span className="text-lg font-black text-gray-800">72%</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm"></div> Humano
                </span>
                <span className="text-lg font-black text-gray-800">28%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
