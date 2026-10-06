import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Tablet, 
  FileSpreadsheet, 
  ScanFace,
  FileText,
  Building2,
  Presentation as PresentationIcon 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenPresentation: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, onOpenPresentation }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'terminal', label: 'Terminal de Ponto Facial', icon: ScanFace, highlight: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'funcionarios', label: 'Funcionários', icon: Users },
    { id: 'jornadas', label: 'Jornadas & Regras', icon: Clock },
    { id: 'dispositivos', label: 'Terminais & Dispositivos', icon: Tablet },
    { id: 'registros', label: 'Registros de Ponto', icon: FileSpreadsheet },
    { id: 'relatorios', label: 'Espelho de Ponto & Relatórios', icon: FileText },
  ];

  // Adiciona Multi-Empresas se for Super Admin
  if (user?.perfil === 'SUPER_ADMIN') {
    menuItems.push({ id: 'empresas', label: 'Multi-Empresas (Tenants)', icon: Building2, highlight: false });
  }

  return (
    <aside className="w-full lg:w-64 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-[#27272A] bg-[#111116] flex flex-col justify-between p-3 lg:p-4 max-h-[42vh] lg:max-h-none lg:h-full overflow-y-auto select-none">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider px-3 mb-2">
            Operação & RH
          </div>
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#1746B8] text-white shadow-sm shadow-[#1746B8]/20'
                      : item.highlight
                      ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-[#6B7280]'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider px-3 mb-2">
            Apresentação Comercial
          </div>
          <button
            onClick={onOpenPresentation}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-[#2F5FD0] bg-[#1746B8]/10 hover:bg-[#1746B8]/20 border border-[#1746B8]/30 transition"
          >
            <PresentationIcon size={18} />
            Ver Slides do Produto (20)
          </button>
        </div>
      </div>

      {/* Rodapé status */}
      <div className="pt-4 border-t border-[#27272A] px-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Sistema Operacional
        </div>
        <div className="text-[10px] text-[#6B7280] mt-1 font-mono">
          VPS Hostinger • PostgreSQL & Redis
        </div>
      </div>
    </aside>
  );
};
