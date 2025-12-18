import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Terminal, WifiOff, Copy, Check, Info, Box, Zap, ShieldCheck
} from 'lucide-react';
import { socketService } from '../services/socket';

interface ConnectionProps {
  isConnected: boolean;
  isSocketActive: boolean;
  onConnectionChange: (connected: boolean, photo: string | null) => void;
}

const Connection: React.FC<ConnectionProps> = ({ isConnected, isSocketActive, onConnectionChange }) => {
  const [status, setStatus] = useState<'loading' | 'qr' | 'connected' | 'error'>(isConnected ? 'connected' : 'loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState('Aguardando pareamento...');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const buildCmd = "docker build -t zapflow-pro .";
  const runCmd = `docker run -p 8080:8080 -e API_KEY="SUA_CHAVE_AQUI" -v "\${PWD}/.wwebjs_auth:/app/.wwebjs_auth" zapflow-pro`;

  useEffect(() => {
    socketService.on("qr", (qr: string) => { 
      setQrCode(qr); 
      setStatus('qr'); 
    });
    
    socketService.on("ready", (info: any) => {
      setStatus('connected');
      setDeviceName(info.name || 'WhatsApp Conectado');
      setDeviceInfo(info);
      onConnectionChange(true, info.profilePicUrl);
    });

    socketService.on("whatsapp_status", (s: string) => {
      if (s === "CONNECTED") setStatus('connected');
      if (s === "QR_READY") setStatus('qr');
      if (s === "DISCONNECTED") { 
        setStatus('loading'); 
        setQrCode(null);
        onConnectionChange(false, null); 
      }
    });
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Motor ZapFlow <span className="text-emerald-500">PRO</span></h2>
        <p className="text-gray-500 font-medium">Sincronize sua instância do WhatsApp via Docker para automação 24/7.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Zap size={150} fill="currentColor" />
          </div>
          
          {!isSocketActive ? (
            <div className="text-center space-y-8 w-full relative z-10">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <WifiOff size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-800">Motor Offline</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium leading-relaxed">O backend Docker não foi detectado na porta 8080. Siga os passos ao lado.</p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-slate-900 p-5 rounded-2xl text-left border border-white/5 group transition-all hover:border-indigo-500/30">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Passo 1: Build da Imagem</p>
                    <button onClick={() => handleCopy(buildCmd)} className="text-gray-500 hover:text-white transition-colors">
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14}/>}
                    </button>
                  </div>
                  <code className="text-[11px] text-gray-300 break-all font-mono leading-relaxed">{buildCmd}</code>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl text-left border border-white/5 group transition-all hover:border-emerald-500/30">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Passo 2: Iniciar Container</p>
                    <button onClick={() => handleCopy(runCmd)} className="text-gray-500 hover:text-white transition-colors">
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14}/>}
                    </button>
                  </div>
                  <code className="text-[11px] text-gray-300 break-all font-mono leading-relaxed">{runCmd}</code>
                </div>
              </div>
            </div>
          ) : status === 'connected' ? (
            <div className="text-center space-y-8 relative z-10">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2.5rem] border-4 border-emerald-500 p-1.5 mx-auto relative z-10 overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-500">
                  <img src={deviceInfo?.profilePicUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} className="w-full h-full rounded-[2rem] object-cover" />
                </div>
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-125 -z-0 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-black text-gray-800">{deviceName}</h4>
                <div className="flex items-center justify-center gap-2 text-emerald-500">
                   <ShieldCheck size={14} />
                   <p className="text-[11px] font-black uppercase tracking-widest">Sessão Autenticada via Docker</p>
                </div>
              </div>
              <button 
                onClick={() => socketService.logout()} 
                className="px-10 py-4 bg-rose-50 text-rose-500 rounded-2xl text-xs font-black uppercase hover:bg-rose-500 hover:text-white transition-all shadow-md active:scale-95"
              >
                Encerrar Sessão
              </button>
            </div>
          ) : (
            <div className="space-y-8 text-center relative z-10">
              {qrCode ? (
                <div className="bg-white p-6 rounded-[3rem] shadow-2xl border border-gray-100 animate-in zoom-in duration-500 relative">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  <div className="absolute inset-0 border-8 border-indigo-500/10 rounded-[3rem] animate-pulse pointer-events-none"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 py-10">
                  <div className="relative">
                    <RefreshCw className="text-indigo-600 animate-spin" size={64} />
                    <div className="absolute inset-0 blur-xl bg-indigo-500/20 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Instanciando Puppeteer Headless...</p>
                </div>
              )}
              <div className="space-y-3">
                <p className="text-lg font-black text-gray-800">Escaneie o QR Code</p>
                <p className="text-[11px] font-medium text-gray-400 max-w-[240px] mx-auto leading-relaxed uppercase tracking-tighter">
                  Abra o WhatsApp {'>'} Configurações {'>'} Aparelhos Conectados {'>'} Conectar um Aparelho.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-950 rounded-[3rem] shadow-2xl p-10 border border-white/5 flex flex-col justify-between overflow-hidden">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Terminal size={20} className="text-indigo-400" />
              </div>
              <h3 className="text-white font-black text-xs uppercase tracking-widest">Logs em Tempo Real</h3>
            </div>
            
            <div className="space-y-5 font-mono text-[12px] leading-relaxed custom-scrollbar max-h-[250px] overflow-y-auto pr-2">
              <div className="flex gap-4">
                <span className="text-gray-600 shrink-0">09:41:02</span>
                <span className="text-emerald-400 font-bold">[DOCKER]</span>
                <span className="text-gray-300">Container zapflow-pro carregado.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-600 shrink-0">09:41:05</span>
                <span className="text-indigo-400 font-bold">[SOCKET]</span>
                <span className={`transition-colors duration-500 ${isSocketActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isSocketActive ? 'Tunelamento TCP Ativo na 8080.' : 'Aguardando handshake do motor...'}
                </span>
              </div>
              {isSocketActive && (
                <>
                  <div className="flex gap-4">
                    <span className="text-gray-600 shrink-0">09:41:10</span>
                    <span className="text-white font-bold">[WA-WEB]</span>
                    <span className="text-gray-400 italic">Iniciando protocolo de autenticação.</span>
                  </div>
                  <div className="flex gap-4 animate-pulse">
                    <span className="text-gray-600 shrink-0">09:41:15</span>
                    <span className="text-indigo-500 font-bold">[STATUS]</span>
                    <span className="text-gray-200">{status === 'connected' ? 'Serviço operacional.' : 'Aguardando QR Scan...'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-10 mt-10 border-t border-white/5">
             <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/10 flex gap-5 items-start transition-all hover:bg-white/10">
                <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400 shrink-0">
                  <Box size={20} />
                </div>
                <div>
                   <p className="text-white text-sm font-black mb-1">Persistência Cloud</p>
                   <p className="text-gray-500 text-[11px] leading-relaxed font-medium">O volume Docker preserva sua sessão. Você pode reiniciar o servidor sem precisar escanear o QR Code novamente.</p>
                </div>
             </div>
             
             <div className="bg-emerald-500/5 p-6 rounded-[1.5rem] border border-emerald-500/10 flex gap-5 items-start transition-all hover:bg-emerald-500/10">
                <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-400 shrink-0">
                  <Info size={20} />
                </div>
                <div>
                   <p className="text-emerald-400 text-sm font-black mb-1">Dica de Infra</p>
                   <p className="text-emerald-900/40 text-[11px] leading-relaxed font-medium">Para melhor estabilidade, certifique-se de que o Docker Desktop tem pelo menos 2 CPUs alocadas.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connection;