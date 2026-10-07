import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ScanFace, Building2, UserCircle, LogOut, Presentation as PresentationIcon, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  activeView: 'presentation' | 'app' | 'terminal';
  setActiveView: (view: 'presentation' | 'app' | 'terminal') => void;
  currentPageTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, currentPageTitle }) => {
  const { user, logout } = useAuth();
  const isBiometriaSubdomain = window.location.hostname === 'biometria.ptfacial.korentech.com.br';

  return (
    <header className="min-h-16 shrink-0 border-b border-[#27272A] bg-[#111116] px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 z-50">
      {/* Brand & Context */}
      <div className="flex items-center gap-2 sm:gap-6 min-w-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('terminal')}>
          <div className="w-10 h-10 rounded-lg bg-[#1746B8] flex items-center justify-center text-white shadow-md shadow-[#1746B8]/30">
            <ScanFace size={24} />
          </div>
          <div className="min-w-0">
            <div className="font-bold tracking-tight text-white flex items-center gap-2 text-sm md:text-base">
              PONTO FACIAL
              <span className="text-[10px] bg-[#1746B8]/20 text-[#2F5FD0] border border-[#1746B8]/40 px-1.5 py-0.5 rounded font-mono font-bold">
                SAAS
              </span>
            </div>
            <div className="hidden sm:block text-xs text-[#6B7280]">Reconhecimento Facial em Tempo Real</div>
          </div>
        </div>

        {/* Empresa Badge */}
        {user?.empresa && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA]">
            <Building2 size={14} className="text-[#1746B8]" />
            <span className="font-medium text-white">{user.empresa.nomeFantasia}</span>
          </div>
        )}
      </div>

      {/* Switcher & Actions */}
      <div className="flex items-center gap-1 sm:gap-3 max-w-full overflow-x-auto">
        {/* Toggle Apresentação vs Painel vs Terminal */}
        {!isBiometriaSubdomain && <div className="flex items-center bg-[#18181B] p-1 rounded-lg border border-[#27272A] gap-1">
          <button
            onClick={() => setActiveView('terminal')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'terminal'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:text-white hover:bg-emerald-500/20'
            }`}
          >
            <ScanFace size={14} />
            <span className="hidden sm:inline">Câmera Facial (Terminal)</span>
          </button>
          <button
            onClick={() => setActiveView('app')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'app'
                ? 'bg-[#1746B8] text-white shadow-sm'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <LayoutDashboard size={14} />
            <span className="hidden sm:inline">Painel RH</span>
          </button>
          <button
            onClick={() => setActiveView('presentation')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'presentation'
                ? 'bg-[#1746B8] text-white shadow-sm'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <PresentationIcon size={14} />
            <span className="hidden sm:inline">Apresentação</span>
          </button>
        </div>}

        {/* User profile & logout */}
        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-[#27272A]">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-semibold text-white">{user.nome}</div>
              <div className="text-[10px] text-[#6B7280]">{user.perfil}</div>
            </div>
            <button
              onClick={logout}
              title="Sair do sistema"
              className="p-2 text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : !isBiometriaSubdomain ? (
          <button
            onClick={() => setActiveView('app')}
            className="text-xs font-semibold bg-[#1746B8] hover:bg-[#0D2F87] text-white px-3.5 py-1.5 rounded-md transition"
          >
            Acessar Sistema
          </button>
        ) : null}
      </div>
    </header>
  );
};
