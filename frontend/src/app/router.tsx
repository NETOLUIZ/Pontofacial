import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Funcionarios } from '../pages/Funcionarios';
import { Jornadas } from '../pages/Jornadas';
import { Dispositivos } from '../pages/Dispositivos';
import { Registros } from '../pages/Registros';
import { Relatorios } from '../pages/Relatorios';
import { Empresas } from '../pages/Empresas';
import { Terminal } from '../pages/Terminal';
import { NotFound } from '../pages/NotFound';
import { RequireAuth } from './RequireAuth';
import { RequirePermission } from './RequirePermission';
import { routeForTab } from './route-map';

const RhLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentTab = location.pathname.slice(1) || 'dashboard';

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#09090B] text-white">
      <Navbar activeView="app" setActiveView={() => undefined} currentPageTitle={currentTab} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <Sidebar currentTab={currentTab} setCurrentTab={(tab) => navigate(routeForTab(tab))} onOpenPresentation={() => undefined} />
        <main className="min-w-0 flex-1 overflow-y-auto bg-[#09090B] p-3 sm:p-6 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-7xl">
            {location.pathname === '/terminal' && <Terminal />}
            {location.pathname === '/dashboard' && <Dashboard />}
            {location.pathname === '/funcionarios' && <Funcionarios />}
            {location.pathname === '/jornadas' && <Jornadas />}
            {location.pathname === '/dispositivos' && <Dispositivos />}
            {location.pathname === '/registros' && <Registros />}
            {location.pathname === '/relatorios' && <Relatorios />}
            {location.pathname === '/empresas' && (
              <RequirePermission allowedProfiles={['SUPER_ADMIN']}><Empresas /></RequirePermission>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const RhTerminalStandalone: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#09090B] text-white">
      <div className="flex items-center justify-between border-b border-[#27272A] bg-[#111116] px-4 py-2.5">
        <button
          type="button"
          onClick={() => navigate(user ? '/dashboard' : '/login')}
          className="flex items-center gap-1.5 rounded-lg bg-[#18181B] px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:bg-[#27272A] hover:text-white"
        >
          ← {user ? 'Voltar para o Painel RH' : 'Voltar para o Login'}
        </button>
        <span className="text-xs font-bold text-emerald-400">
          ● Terminal de Batida Facial (Totem)
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Terminal />
      </div>
    </div>
  );
};

const RhTerminalPage: React.FC = () => {
  const { user } = useAuth();
  if (user) {
    return <RhLayout />;
  }
  return <RhTerminalStandalone />;
};

const RhLogin: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Login
      onSuccess={() => navigate('/dashboard')}
      onOpenPresentation={() => undefined}
      onOpenTerminal={() => navigate('/terminal')}
    />
  );
};

export const RhRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<RhLogin />} />
      <Route path="/terminal" element={<RhTerminalPage />} />
      <Route path="/acesso-negado" element={<NotFound />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<RequireAuth><RhLayout /></RequireAuth>} />
      <Route path="/funcionarios" element={<RequireAuth><RhLayout /></RequireAuth>} />
      <Route path="/jornadas" element={<RequireAuth><RhLayout /></RequireAuth>} />
      <Route path="/dispositivos" element={<RequireAuth><RhLayout /></RequireAuth>} />
      <Route path="/registros" element={<RequireAuth><RhLayout /></RequireAuth>} />
      <Route path="/relatorios" element={<RequireAuth><RhLayout /></RequireAuth>} />
      <Route path="/empresas" element={<RequireAuth><RhLayout /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
