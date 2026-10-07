import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Presentation } from './pages/Presentation';
import { Terminal } from './pages/Terminal';
import { resolveSurface } from './app/surface';
import { RhRouter } from './app/router';

const AppContent: React.FC = () => {
  useAuth();
  const surface = resolveSurface(window.location.hostname);
  if (surface === 'rh') return <RhRouter />;

  const [activeView, setActiveView] = useState<'presentation' | 'terminal'>('terminal');

  return (
    <div className="h-screen bg-[#09090B] flex flex-col text-white overflow-hidden">
      {/* Top Navbar Header */}
      {/* Main Container */}
      {activeView === 'presentation' ? (
        <div className="flex-1 overflow-y-auto">
          <Presentation onGoToApp={() => setActiveView('terminal')} />
        </div>
      ) : activeView === 'terminal' ? (
        <div className="flex-1 overflow-y-auto bg-[#09090B]">
          <div className="w-full h-full">
            <Terminal />
          </div>
        </div>
      ) : <Terminal />}
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
