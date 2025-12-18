
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Bot, 
  MessageSquare, 
  QrCode, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onCloseMobile?: () => void;
  isConnected?: boolean;
  userPhoto?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  isCollapsed, 
  toggleCollapse, 
  onCloseMobile,
  isConnected,
  userPhoto
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'campaigns', label: 'Campanhas', icon: Send },
    { id: 'chatbot', label: 'Chatbot', icon: Bot },
    { id: 'chats', label: 'Mensagens', icon: MessageSquare },
    { id: 'connection', label: 'Conexão', icon: QrCode },
  ];

  return (
    <aside className={`
      bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300
      ${isCollapsed ? 'w-20' : 'w-72 md:w-64'}
    `}>
      {/* Logo Area - Clicável para voltar ao dashboard */}
      <div className="p-6 flex items-center justify-between gap-3">
        <button 
          onClick={() => onViewChange('dashboard')}
          className="flex items-center gap-3 group/logo text-left outline-none"
        >
          <div className={`transition-all duration-300 ${isConnected && userPhoto ? '' : 'bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-200 group-hover/logo:scale-110'} shrink-0`}>
            {isConnected && userPhoto ? (
              <img 
                src={userPhoto} 
                className="w-10 h-10 rounded-xl object-cover shadow-md border-2 border-emerald-500 group-hover/logo:border-emerald-600 transition-all" 
                alt="Profile" 
              />
            ) : (
              <Zap size={24} fill="currentColor" />
            )}
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent truncate group-hover/logo:from-emerald-500 group-hover/logo:to-indigo-500 transition-all">
              ZapFlow Pro
            </h1>
          )}
        </button>
        {/* Close Button Mobile */}
        <button onClick={onCloseMobile} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 py-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              currentView === item.id 
              ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={22} className={currentView === item.id ? 'text-indigo-600' : 'text-gray-400'} />
            {!isCollapsed && <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 hidden lg:block">
        <button 
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2"><ChevronLeft size={20} /> <span className="text-sm font-medium">Recolher</span></div>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
