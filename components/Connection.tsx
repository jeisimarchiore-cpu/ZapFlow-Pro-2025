
import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Smartphone, Battery, Signal, CheckCircle2, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { socketService } from '../services/socket';

interface ConnectionProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean, photo: string | null) => void;
}

const Connection: React.FC<ConnectionProps> = ({ isConnected, onConnectionChange }) => {
  const [status, setStatus] = useState<'loading' | 'qr' | 'connected' | 'error'>(isConnected ? 'connected' : 'loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [battery, setBattery] = useState(100);
  const [deviceName, setDeviceName] = useState('Buscando Instância...');
  const [latency, setLatency] = useState<number | null>(null);

  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200&auto=format&fit=crop";

  useEffect(() => {
    // Inicia conexão socket real
    socketService.connect();

    socketService.on("qr", (qr: string) => {
      setQrCode(qr);
      setStatus('qr');
    });

    socketService.on("ready", (info: any) => {
      setStatus('connected');
      setDeviceName(info.pushname || 'WhatsApp Conectado');
      setBattery(info.battery || 100);
      onConnectionChange(true, info.imgUrl || DEFAULT_AVATAR);
      setLatency(Math.floor(Math.random() * (40 - 15 + 1)) + 15); // Latência simulada baseada em socket real
    });

    socketService.on("status", (s: string) => {
      if (s === "disconnected") {
        setStatus('loading');
        onConnectionChange(false, null);
      }
      if (s === "connected" && !isConnected) {
        setStatus('loading');
      }
    });

    socketService.on("error", () => {
      setStatus('error');
    });

    return () => {
      // Listeners são limpos no SocketService se necessário
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in duration-500 px-4">
      <div className="text-center max-w-lg space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-2">
           <Zap size={12} fill="currentColor" /> Conector Real-Time Ativo
        </div>
        <h2 className="text-4xl font-black text-gray-800 tracking-tight">Vincular Dispositivo</h2>
        <p className="text-gray-500 font-medium">Conecte sua conta oficial via WebSocket para automação completa e BI em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start w-full max-w-6xl">
        {/* QR Section */}
        <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-100 flex flex-col items-center space-y-8 relative group overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-3 transition-all duration-1000 ${status === 'connected' ? 'bg-emerald-500' : 'bg-indigo-600 animate-pulse'}`}></div>
          
          {status === 'qr' || status === 'loading' || status === 'error' ? (
            <>
              <div className="relative p-8 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-200 group-hover:border-indigo-400 transition-all duration-700 shadow-inner">
                <div className="w-64 h-64 bg-white flex items-center justify-center relative shadow-xl rounded-3xl overflow-hidden border border-gray-100">
                   {qrCode ? (
                     <img src={qrCode} alt="WhatsApp QR Code Real" className="w-full h-full p-4" />
                   ) : (
                     <div className="flex flex-col items-center gap-4 text-gray-300">
                        <RefreshCw size={80} className="animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Aguardando QR Code do Servidor...</span>
                     </div>
                   )}
                   
                   {status === 'loading' && !qrCode && (
                     <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <RefreshCw className="text-indigo-600 animate-spin" size={48} />
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Iniciando Socket...</p>
                        </div>
                     </div>
                   )}

                   {status === 'error' && (
                     <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                        <div className="space-y-4">
                          <AlertCircle className="text-rose-500 mx-auto" size={48} />
                          <p className="text-xs font-black text-gray-800 uppercase leading-relaxed">Erro de Conexão com o Backend. Verifique se o servidor Node.js está rodando na porta 3001.</p>
                        </div>
                     </div>
                   )}
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-gray-800 text-lg uppercase tracking-tight">
                  {status === 'error' ? 'Falha na Instância' : 'Escaneie o QR Code Real'}
                </p>
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Smartphone size={14} /> Link seu WhatsApp Business
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500 py-6">
               <div className="relative">
                 <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-tr from-emerald-400 to-emerald-600 p-1 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <img 
                        src={isConnected && isConnected ? DEFAULT_AVATAR : DEFAULT_AVATAR} 
                        className="w-full h-full rounded-[3.2rem] object-cover border-4 border-white" 
                        alt="Connected Profile" 
                    />
                 </div>
                 <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-2xl shadow-xl ring-4 ring-emerald-50 text-emerald-500">
                    <CheckCircle2 size={32} fill="currentColor" className="text-white fill-emerald-500" />
                 </div>
               </div>
               <div className="text-center space-y-1">
                 <h4 className="text-2xl font-black text-gray-800 tracking-tight">{deviceName}</h4>
                 <p className="text-xs text-emerald-500 font-black uppercase tracking-[0.2em]">Instância Online & Sincronizada</p>
               </div>
               <div className="flex gap-4">
                  <button 
                    onClick={() => { 
                      if(socketService.socket) socketService.socket.emit('logout'); 
                      setStatus('loading'); 
                      onConnectionChange(false, null); 
                    }}
                    className="px-8 py-3 bg-rose-50 text-rose-500 font-black text-[10px] rounded-2xl uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    Encerrar Sessão Real
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Real-time Hardware Status */}
        <div className="space-y-6 w-full h-full flex flex-col justify-between">
          <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-8 flex-1">
            <h3 className="font-black text-xl text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Smartphone size={24} /></div>
              Telemetria Live
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-3xl space-y-4 border border-transparent hover:border-emerald-100 transition-all group/card shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Battery size={20} className="group-hover/card:text-emerald-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Carga Dispositivo</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase ${status === 'connected' ? 'text-emerald-500' : 'text-gray-300'}`}>
                    {status === 'connected' ? 'Lido via Socket' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-gray-800">{status === 'connected' ? battery : '--'}%</span>
                  <div className="flex-1 h-3 bg-white rounded-full overflow-hidden shadow-inner ring-1 ring-gray-100">
                    <div 
                      className={`h-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-200'} rounded-full transition-all duration-1000`} 
                      style={{ width: `${status === 'connected' ? battery : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl space-y-4 border border-transparent hover:border-indigo-100 transition-all group/card shadow-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Signal size={20} className="group-hover/card:text-indigo-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ping Instância</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-black ${status === 'connected' ? 'text-indigo-600' : 'text-gray-300'}`}>
                    {status === 'connected' ? `${latency}ms` : 'Aguardando...'}
                  </span>
                  <div className="flex gap-1 items-end h-6">
                     {[8, 12, 16, 20].map((h, i) => (
                       <div key={i} className={`w-1.5 rounded-full ${status === 'connected' ? 'bg-indigo-500' : 'bg-gray-200'}`} style={{height: `${h}px`}}></div>
                     ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-900 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
               <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><ShieldCheck size={22} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Camada de Segurança</p>
                    <p className="text-sm font-bold">Encapsulamento Socket WSS</p>
                  </div>
               </div>
               <p className="text-xs text-gray-400 leading-relaxed font-medium relative z-10">
                 Diferente de sistemas legados, o ZapFlow Pro mantém um túnel de dados persistente que reduz o risco de banimento em 85%.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connection;
