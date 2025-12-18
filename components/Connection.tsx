import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Terminal, WifiOff, Copy, Check, Info, Box, Zap
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

  // Comandos corrigidos para o usuário
  const buildCmd = "docker build -t zapflow-backend .";
  const runCmd = `docker run -p 8080:8080 -e API_KEY="SUA_CHAVE_AQUI" -v "\${PWD}/.wwebjs_auth:/app/.wwebjs_auth" zapflow-backend`;

  useEffect(() => {
    socketService.on("qr", (qr: string) => { setQrCode(qr); setStatus('qr'); });
    socketService.on("ready", (info: any) => {
      setStatus('connected');
      setDeviceName(info.name || 'WhatsApp Conectado');
      setDeviceInfo(info);
      onConnectionChange(true, info.profilePicUrl);
    });
    socketService.on("whatsapp_status", (s: string) => {
      if (s === "CONNECTED") setStatus('connected');
      if (s === "QR_READY") setStatus('qr');
      if (s === "DISCONNECTED") { setStatus('loading'); onConnectionChange(false, null); }
    });
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Conexão do Motor</h2>
        <p className="text-gray-500 text-sm">Sincronize sua instância do WhatsApp via Docker Desktop.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center justify-center min-h-[450px]">
          {!isSocketActive ? (
            <div className="text-center space-y-6 w-full">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto">
                <WifiOff size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">Motor Offline</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto font-medium">Siga os passos no terminal ao lado para iniciar o servidor.</p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-slate-900 p-4 rounded-2xl text-left relative group">
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Passo 1: Build</p>
                  <code className="text-[10px] text-gray-300 break-all font-mono">{buildCmd}</code>
                  <button onClick={() => handleCopy(buildCmd)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><Copy size={12}/></button>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl text-left relative group">
                  <p className="text-[10px] font-black text-emerald-400 uppercase mb-2">Passo 2: Run</p>
                  <code className="text-[10px] text-gray-300 break-all font-mono">{runCmd}</code>
                  <button onClick={() => handleCopy(runCmd)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><Copy size={12}/></button>
                </div>
              </div>
            </div>
          ) : status === 'connected' ? (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-emerald-500 p-1 mx-auto relative z-10 overflow-hidden">
                  <img src={deviceInfo?.profilePicUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 -z-0"></div>
              </div>
              <div>
                <h4 className="text-2xl font-black text-gray-800">{deviceName}</h4>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">Conexão Ativa via Docker</p>
              </div>
              <button onClick={() => socketService.logout()} className="px-8 py-3 bg-rose-50 text-rose-500 rounded-2xl text-xs font-black uppercase hover:bg-rose-500 hover:text-white transition-all shadow-sm">Encerrar Sessão</button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              {qrCode ? (
                <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-50 animate-in zoom-in duration-300">
                  <img src={qrCode} alt="QR Code" className="w-56 h-56" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="text-indigo-600 animate-spin" size={40} />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Iniciando Puppeteer...</p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm font-black text-gray-800">Escaneie o QR Code</p>
                <p className="text-[10px] font-medium text-gray-400 max-w-[200px] mx-auto">Vá em Aparelhos Conectados no seu WhatsApp e aponte a câmera.</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-950 rounded-[2.5rem] shadow-2xl p-8 border border-white/5 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Terminal size={18} className="text-indigo-400" />
              <h3 className="text-white font-black text-xs uppercase tracking-widest">Logs do Sistema</h3>
            </div>
            
            <div className="space-y-4 font-mono text-[11px] leading-relaxed">
              <div className="flex gap-3">
                <span className="text-gray-600">09:41:02</span>
                <span className="text-emerald-400">[DOCKER]</span>
                <span className="text-gray-300">Instância zapflow-backend verificada.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-600">09:41:05</span>
                <span className="text-indigo-400">[SOCKET]</span>
                <span className={`transition-colors ${isSocketActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isSocketActive ? 'Conexão estabelecida na porta 8080.' : 'Aguardando container...'}
                </span>
              </div>
              {isSocketActive && (
                <div className="flex gap-3 animate-pulse">
                  <span className="text-gray-600">09:41:10</span>
                  <span className="text-white">[CMD]</span>
                  <span className="text-gray-300">Listening on 0.0.0.0:8080</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-white/5">
             <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex gap-4 items-start">
                <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
                  <Box size={18} />
                </div>
                <div>
                   <p className="text-white text-xs font-bold mb-1">Persistência de Dados</p>
                   <p className="text-gray-500 text-[10px] leading-relaxed">O comando de execução já inclui um volume para salvar sua sessão do WhatsApp mesmo se o container for reiniciado.</p>
                </div>
             </div>
             
             <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 flex gap-4 items-start">
                <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
                  <Info size={18} />
                </div>
                <div>
                   <p className="text-emerald-400 text-xs font-bold mb-1">Dica de Performance</p>
                   <p className="text-emerald-900/40 text-[10px] leading-relaxed">Se o QR Code demorar, verifique se o Docker Desktop tem pelo menos 4GB de RAM alocados nas configurações.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connection;