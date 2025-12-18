import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, RefreshCw, Smartphone, Battery, Signal, 
  CheckCircle2, AlertCircle, Zap, ShieldCheck, 
  Terminal, Server, LogOut, Activity, Wifi, WifiOff,
  ChevronRight, Info, Box
} from 'lucide-react';
import { socketService } from '../services/socket';

interface ConnectionProps {
  isConnected: boolean;
  isSocketActive: boolean;
  onConnectionChange: (connected: boolean, photo: string | null) => void;
}

interface SystemLog {
  id: number;
  time: string;
  message: string;
}

const Connection: React.FC<ConnectionProps> = ({ isConnected, isSocketActive, onConnectionChange }) => {
  const [status, setStatus] = useState<'loading' | 'qr' | 'connected' | 'error'>(isConnected ? 'connected' : 'loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState('Aguardando pareamento...');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleQr = (qr: string) => {
      setQrCode(qr);
      setStatus('qr');
    };

    const handleReady = (info: any) => {
      setStatus('connected');
      setDeviceName(info.name || 'WhatsApp Conectado');
      setDeviceInfo(info);
      onConnectionChange(true, info.profilePicUrl);
    };

    const handleWhatsappStatus = (s: string) => {
      if (s === "CONNECTED") setStatus('connected');
      if (s === "QR_READY") setStatus('qr');
      if (s === "DISCONNECTED" || s === "INITIALIZING") {
        setStatus('loading');
        setQrCode(null);
        if (s === "DISCONNECTED") onConnectionChange(false, null);
      }
      if (s === "AUTH_FAILURE") setStatus('error');
    };

    const handleLog = (log: SystemLog) => {
      setLogs(prev => [log, ...prev].slice(0, 50));
    };

    socketService.on("qr", handleQr);
    socketService.on("ready", handleReady);
    socketService.on("whatsapp_status", handleWhatsappStatus);
    socketService.on("log", handleLog);

    return () => {
      socketService.off("qr", handleQr);
      socketService.off("ready", handleReady);
      socketService.off("whatsapp_status", handleWhatsappStatus);
      socketService.off("log", handleLog);
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleLogout = () => {
    if (confirm("Deseja desconectar o WhatsApp?")) {
      socketService.logout();
    }
  };

  const handleReconnect = () => {
    socketService.disconnect();
    socketService.connect();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
           <Activity size={12} className={isSocketActive ? "animate-pulse" : ""} /> 
           {isSocketActive ? "Instância Ativa :8080" : "Motor Desconectado"}
        </div>
        <h2 className="text-4xl font-black text-gray-800 tracking-tight tracking-tighter">Sincronização de Dispositivo</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Esquerdo: QR / Status */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center justify-center space-y-8 relative overflow-hidden min-h-[500px]">
          <div className={`absolute top-0 left-0 w-full h-2 transition-all duration-1000 ${
            status === 'connected' ? 'bg-emerald-500' : !isSocketActive ? 'bg-rose-500' : 'bg-indigo-600 animate-pulse'
          }`}></div>

          {!isSocketActive ? (
            <div className="text-center space-y-6 py-10 w-full">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-rose-100">
                <Box size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Docker Offline</h3>
                <p className="text-sm text-gray-500 font-medium px-4">
                  O painel não detectou o motor rodando na porta 8080. 
                </p>
                <div className="bg-gray-900 p-4 rounded-2xl text-left border border-white/10 space-y-2 font-mono">
                   <p className="text-[10px] font-black text-indigo-400 uppercase">Comando Docker:</p>
                   <code className="text-[11px] text-gray-300 block bg-black/30 p-2 rounded">
                    docker build -t zapflow-motor .<br/>
                    docker run -p 8080:8080 zapflow-motor
                   </code>
                </div>
              </div>
              <button 
                onClick={handleReconnect}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
              >
                <RefreshCw size={16} /> Atualizar Conexão
              </button>
            </div>
          ) : status === 'connected' ? (
            <div className="w-full flex flex-col items-center space-y-8 py-6">
              <div className="relative">
                <div className="w-40 h-40 rounded-[4rem] bg-emerald-500 p-1 shadow-2xl">
                   <img 
                    src={deviceInfo?.profilePicUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} 
                    className="w-full h-full rounded-[3.8rem] object-cover border-4 border-white" 
                    alt="Profile" 
                   />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-xl ring-4 ring-emerald-50 text-emerald-500">
                   <CheckCircle2 size={32} />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-3xl font-black text-gray-800">{deviceName}</h4>
                <div className="flex items-center justify-center gap-2 mt-2">
                   <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Ativo via Docker</span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-10 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
              >
                <LogOut size={16} /> Desconectar Celular
              </button>
            </div>
          ) : (
            <div className="w-full space-y-8">
              <div className="bg-gray-50 p-6 rounded-[3rem] border-4 border-dashed border-gray-100 flex items-center justify-center min-h-[350px] relative">
                {status === 'qr' && qrCode ? (
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-500 border border-gray-50">
                    <img src={qrCode} alt="WhatsApp QR" className="w-64 h-64" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <RefreshCw className="text-indigo-600 animate-spin" size={48} />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Motor em Inicialização...</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Sincronizando com porta 8080</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3 items-start">
                <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-indigo-800 leading-relaxed uppercase tracking-tight">
                  Abra o WhatsApp no seu celular > Configurações > Dispositivos Conectados e escaneie o código acima.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Logs */}
        <div className="lg:col-span-7 bg-slate-950 rounded-[3rem] shadow-2xl p-8 flex flex-col relative overflow-hidden min-h-[500px] border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
              <Terminal size={18} className="text-emerald-400" /> Docker System Output
            </h3>
            <button 
              onClick={() => setLogs([])}
              className="text-[9px] font-black text-gray-500 uppercase hover:text-white transition-colors"
            >
              Clear Console
            </button>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-2 custom-scrollbar pr-4 text-gray-400">
            {logs.length === 0 && (
              <div className="space-y-2">
                <p className="text-emerald-500/50"># ZapFlow Docker Engine v1.0.0</p>
                <p className="text-gray-600 italic">Aguardando sinais do motor local...</p>
              </div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 animate-in slide-in-from-left duration-200">
                <span className="text-gray-600 font-bold shrink-0">[{log.time}]</span>
                <span className={`leading-relaxed ${log.message.includes('✅') ? 'text-emerald-400' : log.message.includes('❌') ? 'text-rose-400' : 'text-gray-300'}`}>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${isSocketActive ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'} shadow-lg animate-pulse`}></div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Container Status: {isSocketActive ? 'Running' : 'Stopped'}
              </span>
            </div>
            <span className="text-[9px] font-black text-white/20 uppercase">Port Mapping 8080:8080</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connection;