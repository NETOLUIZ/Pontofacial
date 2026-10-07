import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Presentation } from './pages/Presentation';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Funcionarios } from './pages/Funcionarios';
import { Jornadas } from './pages/Jornadas';
import { Dispositivos } from './pages/Dispositivos';
import { Registros } from './pages/Registros';

import { Terminal } from './pages/Terminal';
import { Relatorios } from './pages/Relatorios';
import { Empresas } from './pages/Empresas';
import { resolveSurface } from './app/surface';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const surface = resolveSurface(window.location.hostname);
  const initialView = surface === 'rh' ? 'app' : 'terminal';
  const [activeView, setActiveView] = useState<'presentation' | 'app' | 'terminal'>(initialView);
  const [currentTab, setCurrentTab] = useState<string>('terminal');

  return (
    <div className="h-screen bg-[#09090B] flex flex-col text-white overflow-hidden">
      {/* Top Navbar Header */}
      {activeView !== 'terminal' && <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        currentPageTitle={currentTab}
      />}

      {/* Main Container */}
      {activeView === 'presentation' ? (
        <div className="flex-1 overflow-y-auto">
          <Presentation onGoToApp={() => setActiveView('app')} />
        </div>
      ) : activeView === 'terminal' ? (
        <div className="flex-1 overflow-y-auto bg-[#09090B]">
          <div className="w-full h-full">
            <Terminal />
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <Login
            onSuccess={() => {
              setActiveView('app');
              setCurrentTab('terminal');
            }}
            onOpenPresentation={() => setActiveView('presentation')}
            onOpenTerminal={() => setActiveView('terminal')}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onOpenPresentation={() => setActiveView('presentation')}
          />
          <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-6 md:p-8 lg:p-10 bg-[#09090B]">
            <div className="max-w-7xl mx-auto w-full">
              {currentTab === 'terminal' && <Terminal />}
              {currentTab === 'dashboard' && <Dashboard />}
              {currentTab === 'funcionarios' && <Funcionarios />}
              {currentTab === 'jornadas' && <Jornadas />}
              {currentTab === 'dispositivos' && <Dispositivos />}
              {currentTab === 'registros' && <Registros />}
              {currentTab === 'relatorios' && <Relatorios />}
              {currentTab === 'empresas' && <Empresas />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
