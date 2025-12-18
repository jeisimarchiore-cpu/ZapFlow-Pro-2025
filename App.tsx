
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import Campaigns from './components/Campaigns';
import Chatbot from './components/Chatbot';
import ChatCenter from './components/ChatCenter';
import Connection from './components/Connection';
import { Menu, Zap } from 'lucide-react';
import { socketService } from './services/socket';

type View = 'dashboard' | 'contacts' | 'campaigns' | 'chatbot' | 'chats' | 'connection';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isSocketActive, setIsSocketActive] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    const handleSocketStatus = (status: string) => {
      setIsSocketActive(status === 'connected');
    };
    
    // Configurar ouvintes antes de conectar
    socketService.on('socket_status', handleSocketStatus);
    socketService.connect();
    
    return () => {
      socketService.off('socket_status', handleSocketStatus);
    };
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'contacts': return <Contacts />;
      case 'campaigns': return <Campaigns isSocketActive={isSocketActive} />;
      case 'chatbot': return <Chatbot />;
      case 'chats': return <ChatCenter isSocketActive={isSocketActive} />;
      case 'connection': return (
        <Connection 
          isConnected={isConnected} 
          isSocketActive={isSocketActive}
          onConnectionChange={(connected, photo) => {
            setIsConnected(connected);
            setUserPhoto(photo);
          }} 
        />
      );
      default: return <Dashboard />;
    }
  };

  const viewNames: Record<View, string> = {
    dashboard: 'Dashboard',
    contacts: 'Contatos',
    campaigns: 'Campanhas',
    chatbot: 'Chatbot IA',
    chats: 'Mensagens',
    connection: 'Conexão'
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          isCollapsed={isSidebarCollapsed} 
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          isConnected={isConnected}
          isSocketActive={isSocketActive}
          userPhoto={userPhoto}
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2"
          >
            {isConnected && userPhoto ? (
              <img src={userPhoto} className="w-8 h-8 rounded-lg object-cover border border-emerald-500" alt="Profile" />
            ) : (
              <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                <Zap size={18} fill="currentColor" />
              </div>
            )}
            <span className="font-bold text-gray-800">{viewNames[currentView]}</span>
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto relative p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-10">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
