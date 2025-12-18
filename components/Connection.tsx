
import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Smartphone, Battery, Signal, CheckCircle2 } from 'lucide-react';

interface ConnectionProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean, photo: string | null) => void;
}

const Connection: React.FC<ConnectionProps> = ({ isConnected, onConnectionChange }) => {
  const [status, setStatus] = useState<'loading' | 'qr' | 'connected'>(isConnected ? 'connected' : 'qr');
  const [battery, setBattery] = useState(85);

  // Foto de perfil simulada para o ZapFlow Pro
  const MOCK_PROFILE_PHOTO = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200&auto=format&fit=crop";

  const handleToggleConnection = () => {
    if (status === 'connected') {
      setStatus('qr');
      onConnectionChange(false, null);
    } else {
      setStatus('loading');
      setTimeout(() => {
        setStatus('connected');
        onConnectionChange(true, MOCK_PROFILE_PHOTO);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in duration-500 px-4">
      <div className="text-center max-w-md space-y-2">
        <h2 className="text-3xl font-bold text-gray-800">Conectar Dispositivo</h2>
        <p className="text-gray-500 text-sm md:text-base">Escaneie o QR Code abaixo com seu WhatsApp para ativar o ZapFlow Pro em sua conta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start w-full max-w-5xl">
        {/* QR Section */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col items-center space-y-6 relative group overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-2 transition-colors ${status === 'connected' ? 'bg-emerald-500' : 'bg-amber-400 opacity-20'}`}></div>
          
          {status === 'qr' ? (
            <>
              <div className="p-4 md:p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 group-hover:border-emerald-500 transition-all duration-500">
                <div className="w-56 h-56 md:w-64 md:h-64 bg-white flex items-center justify-center relative shadow-inner rounded-xl overflow-hidden">
                   {/* Simulating QR code with pattern */}
                   <div className="grid grid-cols-10 gap-1 opacity-80 p-4">
                      {Array.from({length: 100}).map((_, i) => (
                        <div key={i} className={`w-full h-full aspect-square ${Math.random() > 0.4 ? 'bg-gray-800' : 'bg-transparent'}`}></div>
                      ))}
                   </div>
                   <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={handleToggleConnection}
                        className="bg-emerald-500 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform"
                      >
                        <RefreshCw size={24} />
                      </button>
                   </div>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="font-bold text-gray-800">Aguardando leitura...</p>
                <p className="text-xs text-gray-400">Expira em 45 segundos</p>
              </div>
            </>
          ) : status === 'loading' ? (
            <div className="w-56 h-56 md:w-64 md:h-64 flex flex-col items-center justify-center space-y-4">
               <div className="relative">
                 <RefreshCw className="text-emerald-500 animate-spin" size={48} />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                 </div>
               </div>
               <p className="text-gray-500 font-medium">Validando conexão...</p>
            </div>
          ) : (
            <div className="w-56 h-56 md:w-64 md:h-64 flex flex-col items-center justify-center space-y-4 animate-in zoom-in">
               <div className="relative">
                 <img 
                    src={MOCK_PROFILE_PHOTO} 
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-emerald-100 shadow-xl" 
                    alt="Connected User" 
                 />
                 <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                 </div>
               </div>
               <div className="text-center">
                 <p className="text-emerald-600 font-bold text-lg">Conectado!</p>
                 <p className="text-xs text-gray-400">Lucas Santos</p>
               </div>
               <button 
                onClick={handleToggleConnection}
                className="mt-4 px-4 py-1.5 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg uppercase tracking-wider transition-colors"
               >
                 Desconectar
               </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="space-y-6 w-full">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
              <Smartphone size={22} className="text-indigo-500" /> Status do Aparelho
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-transparent hover:border-emerald-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Battery size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Bateria</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Carregando</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-gray-800">{battery}%</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full mb-2 ml-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: `${battery}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-transparent hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-2 text-gray-500">
                  <Signal size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Conexão</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${status === 'connected' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {status === 'connected' ? 'Estável' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </div>

            {status === 'connected' && (
              <div className="space-y-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                 <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">LS</div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Lucas Santos</p>
                        <p className="text-[10px] text-gray-500">WhatsApp Business • iOS</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                 </div>
              </div>
            )}
          </div>

          <div className="bg-emerald-600 p-6 md:p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <QrCode size={180} />
            </div>
            <h4 className="font-bold text-xl mb-3 relative z-10">Dica de Segurança</h4>
            <p className="text-sm opacity-90 leading-relaxed mb-4 relative z-10">
              Mantenha seu celular conectado à internet e com bateria acima de 20% para garantir que suas campanhas não sejam interrompidas.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full relative z-10">
              <CheckCircle2 size={14} /> 
              Criptografia de Ponta-a-Ponta Ativa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connection;
