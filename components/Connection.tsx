
import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, RefreshCw, Smartphone, Battery, Signal, 
  CheckCircle2, AlertCircle, Zap, ShieldCheck, 
  Terminal, Server, LogOut, Activity, Wifi, WifiOff 
} from 'lucide-react';
import { socketService } from '../services/socket';

interface ConnectionProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean, photo: string | null) => void;
}

interface SystemLog {
  id: number;
  time: string;
  message: string;
}

const Connection: React.FC<ConnectionProps> = ({ isConnected, onConnectionChange }) => {
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

    const handleServerStatus = (s: string) => {
      if (s === "CONNECTED") setStatus('connected');
      if (s === "QR_READY") setStatus('qr');
      if (s === "DISCONNECTED") {
        setStatus('loading');
        setQrCode(null);
        onConnectionChange(false, null);
      }
      if (s === "AUTH_FAILURE") setStatus('error');
    };

    const handleLog = (log: SystemLog) => {
      setLogs(prev => [log, ...prev].slice(0, 50));
    };

    socketService.on("qr", handleQr);
    socketService.on("ready", handleReady);
    socketService.on("server_status", handleServerStatus);
    socketService.on("log", handleLog);

    socketService.connect();

    return () => {
      socketService.off("qr", handleQr);
      socketService.off("ready", handleReady);
      socketService.off("server_status", handleServerStatus);
      socketService.off("log", handleLog);
    };
  }, []);

  const handleLogout = () => {
    if (confirm("Deseja realmente desconectar este dispositivo do servidor?")) {
      socketService.logout();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
           <Activity size={12} className="animate-pulse" /> Sincronia de Instância Port:8000
        </div>
        <h2 className="text-4xl font-black text-gray-800 tracking-tight">Vincular Dispositivo</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center justify-center space-y-8 relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-full h-2 transition-all duration-1000 ${
            status === 'connected' ? 'bg-emerald-500' : status === 'error' ? 'bg-rose-500' : 'bg-indigo-600 animate-pulse'
          }`}></div>

          {status === 'connected' ? (
            <div className="w-full flex flex-col items-center space-y-8 py-6">
              <div className="relative">
                <div className="w-36 h-36 rounded-[3.5rem] bg-emerald-500 p-1 shadow-2xl rotate-3">
                   <img src={deviceInfo?.profilePicUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} className="w-full h-full rounded-[3.2rem] object-cover border-4 border-white" alt="Profile" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-2xl shadow-xl ring-4 ring-emerald-50">
                   <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-black text-gray-800">{deviceName}</h4>
                <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] mt-1">Platform: {deviceInfo?.platform || 'Web'}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-8 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <LogOut size={16} /> Encerrar Sessão
              </button>
            </div>
          ) : (
            <div className="w-full space-y-8">
              <div className="bg-gray-50 p-6 rounded-[2.5rem] border-4 border-dashed border-gray-100 flex items-center justify-center min-h-[350px] relative">
                {status === 'qr' && qrCode ? (
                  <img src={qrCode} alt="WhatsApp QR" className="w-64 h-64 p-2 bg-white rounded-2xl shadow-lg animate-in zoom-in" />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="text-indigo-600 animate-spin" size={48} />
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Iniciando Client...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 bg-gray-900 rounded-[3rem] shadow-2xl p-8 flex flex-col relative overflow-hidden min-h-[450px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
              <Terminal size={18} className="text-indigo-400" /> WhatsApp Console Log
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-2 custom-scrollbar pr-4">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4">
                <span className="text-indigo-500 font-bold">[{log.time}]</span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connection;
