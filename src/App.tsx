import { useEffect } from 'react'
import { useStore } from './store';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AICopilot from './components/AICopilot';
import Workspace from './components/Workspace';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import Dashboard from './components/Dashboard';
import Escalations from './components/Escalations';
import SettingsPage from './components/SettingsPage';
import Toasts from './components/Toasts';

function MainLayout() {
  const { currentView, theme } = useStore();

  const renderView = () => {
    switch (currentView) {
      case 'workspace': return <Workspace />;
      case 'tickets': return <TicketList />;
      case 'ticket-detail': return <TicketDetail />;
      case 'dashboard': return <Dashboard />;
      case 'escalations': return <Escalations />;
      case 'settings': return <SettingsPage />;
      default: return <Workspace />;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${theme === 'light' ? 'theme-light' : ''}`} style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-hidden">
            {renderView()}
          </main>
        </div>
        <AICopilot />
      </div>
      <Toasts />
    </div>
  );
}

export default function App() {
  const { isAuthenticated, theme, loadTickets } = useStore();

  useEffect(() => {
    loadTickets();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className={theme === 'light' ? 'theme-light' : ''}>
        <LoginPage />
      </div>
    );
  }

  return <MainLayout />;
}
