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

const RhLogin: React.FC = () => {
  const navigate = useNavigate();
  return <Login onSuccess={() => navigate('/dashboard')} onOpenPresentation={() => undefined} onOpenTerminal={() => { window.location.href = '/'; }} />;
};

export const RhRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<RhLogin />} />
      <Route path="/acesso-negado" element={<NotFound />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<RequireAuth><RhLayout /></RequireAuth>} />
    </Routes>
  </BrowserRouter>
);
