
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, 
  Radar, Legend, ComposedChart, Line
} from 'recharts';
import { 
  Users, Send, CheckCircle, AlertCircle, Cake, ExternalLink, 
  TrendingUp, TrendingDown, Clock, MousePointer2, Zap, 
  MessageSquareText, ShieldCheck, UserMinus, Globe, Smile
} from 'lucide-react';

const areaData = [
  { name: 'Seg', sent: 400, received: 240 },
  { name: 'Ter', sent: 700, received: 539 },
  { name: 'Qua', sent: 600, received: 980 },
  { name: 'Qui', sent: 800, received: 690 },
  { name: 'Sex', sent: 950, received: 880 },
  { name: 'Sáb', sent: 400, received: 380 },
  { name: 'Dom', sent: 300, received: 430 },
];

const radarData = [
  { subject: 'Velocidade', A: 120, B: 110, fullMark: 150 },
  { subject: 'Volume', A: 98, B: 130, fullMark: 150 },
  { subject: 'Reatividade', A: 86, B: 130, fullMark: 150 },
  { subject: 'Fidelidade', A: 99, B: 100, fullMark: 150 },
  { subject: 'Conversão', A: 85, B: 90, fullMark: 150 },
];

const automationData = [
  { name: 'Bot', value: 720, color: '#10B981' },
  { name: 'Humano', value: 280, color: '#4F46E5' },
];

const sourceData = [
  { name: 'Facebook Ads', value: 450 },
  { name: 'Instagram', value: 380 },
  { name: 'Site Orgânico', value: 210 },
  { name: 'Google Ads', value: 180 },
  { name: 'Indicação', value: 95 },
];

const heatmapData = [
  { h: '08h', seg: 10, ter: 20, qua: 40, qui: 30, sex: 50 },
  { h: '12h', seg: 50, ter: 60, qua: 80, qui: 90, sex: 70 },
  { h: '16h', seg: 30, ter: 40, qua: 60, qui: 50, sex: 80 },
  { h: '20h', seg: 20, ter: 10, qua: 30, qui: 40, sex: 20 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Executive Intelligence <span className="text-emerald-500 font-black">PRO</span></h2>
          <p className="text-gray-500 text-sm">Painel avançado de monitoramento e decisões estratégicas.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
             Exportar PDF
          </button>
          <span className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-bold text-emerald-600 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> AO VIVO
          </span>
        </div>
      </header>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'SLA de Resposta', value: '1m 24s', trend: '-18s', up: true, icon: Clock, color: 'indigo' },
          { label: 'Conversas Ativas', value: '42', trend: '+5', up: true, icon: MessageSquareText, color: 'emerald' },
          { label: 'Taxa de Retenção', value: '89.4%', trend: '+2.1%', up: true, icon: ShieldCheck, color: 'blue' },
          { label: 'Leads em Risco', value: '14', trend: '+3', up: false, icon: UserMinus, color: 'rose' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative group overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div className={`p-2.5 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600`}>
                <kpi.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${kpi.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                {kpi.trend}
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-2xl font-black text-gray-800">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Evolução com Camada de Conversão */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Engajamento & Conversão</h3>
              <p className="text-xs text-gray-400">Relação entre mensagens recebidas e fechamentos</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Mensagens
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Leads
               </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="sent" stroke="#4F46E5" strokeWidth={4} fillOpacity={0.1} fill="#4F46E5" />
                <Bar dataKey="received" barSize={20} fill="#10B981" radius={[10, 10, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut de Automação */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Resolução</h3>
          <p className="text-xs text-gray-400 mb-8">Bot vs. Atendimento Humano</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={automationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {automationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 w-full space-y-3">
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Chatbot
                </span>
                <span className="text-sm font-black text-gray-800">72%</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Humano
                </span>
                <span className="text-sm font-black text-gray-800">28%</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Origem de Leads (BI Puro) */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                 <Globe size={18} className="text-indigo-500" /> Origem dos Leads
              </h3>
           </div>
           <div className="space-y-5">
              {sourceData.map((source, idx) => (
                <div key={idx} className="space-y-1">
                   <div className="flex justify-between text-[11px] font-bold uppercase text-gray-400">
                      <span>{source.name}</span>
                      <span className="text-gray-800">{source.value}</span>
                   </div>
                   <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(source.value / 450) * 100}%` }}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Análise de Sentimento (IA Insights) */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Smile size={18} className="text-amber-500" /> Humor da Base
           </h3>
           <div className="flex flex-col items-center justify-center h-48">
              <div className="relative">
                 <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="110" className="text-emerald-500" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-800">75%</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Positivo</span>
                 </div>
              </div>
           </div>
           <p className="text-center text-xs text-gray-400 mt-2">Baseado nas últimas 500 mensagens analisadas pela IA.</p>
        </div>

        {/* Leads em Risco (Ação Imediata) */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Fila de Reativação</h3>
              <span className="bg-rose-50 text-rose-500 text-[10px] font-bold px-2 py-1 rounded-full">+48h Sem Contato</span>
           </div>
           <div className="space-y-3">
              {[
                { name: 'Roberto Lima', time: '3 dias', risk: 'Alto' },
                { name: 'Consultoria ABC', time: '2 dias', risk: 'Médio' },
                { name: 'Juliana Paes', time: '2 dias', risk: 'Médio' },
              ].map((lead, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-rose-50 transition-colors cursor-pointer group">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-500 group-hover:bg-rose-100 group-hover:text-rose-600">
                         {lead.name[0]}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-gray-800">{lead.name}</p>
                         <p className="text-[10px] text-gray-400">Inativo há {lead.time}</p>
                      </div>
                   </div>
                   <button className="p-2 bg-white text-emerald-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap size={14} fill="currentColor" />
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
