import { useStore, ROLE_LABELS, type ViewType } from '../store';
import {
  Zap, Ticket, AlertTriangle,
  Settings, LogOut, ChevronLeft, ChevronRight,
  Brain, BarChart3
} from 'lucide-react';

const NAV_ITEMS: { view: ViewType; label: string; icon: typeof Zap }[] = [
  { view: 'workspace', label: 'Workspace', icon: Brain },
  { view: 'tickets', label: 'Tickets', icon: Ticket },
  { view: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { view: 'escalations', label: 'Priority Alerts', icon: AlertTriangle },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { currentView, setCurrentView, currentUser, logout, isSidebarCollapsed, toggleSidebar, tickets } = useStore();

  const activeTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');
  const alertCount = activeTickets.filter(t => t.escalation_level !== 'None').length;

  return (
    <div
      className={`h-full flex flex-col border-r transition-all duration-300 ${isSidebarCollapsed ? 'w-[60px]' : 'w-60'}`}
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
        <div className={`flex items-center gap-2.5 ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/15">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Nexus AI</h1>
            </div>
          )}
        </div>
        {!isSidebarCollapsed && (
          <button onClick={toggleSidebar} className="p-1 rounded-md hover:opacity-70 transition" style={{ color: 'var(--text-tertiary)' }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {isSidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="mx-auto mt-2 p-1 rounded-md hover:opacity-70 transition"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
          const isActive = currentView === view || (view === 'tickets' && currentView === 'ticket-detail');
          const badge = view === 'escalations' ? alertCount : undefined;

          return (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all relative group
                ${isSidebarCollapsed ? 'justify-center' : ''}`}
              style={{
                background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: isActive ? '#818cf8' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              title={isSidebarCollapsed ? label : undefined}
            >
              <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-brand-400' : ''}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 text-left font-medium">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold leading-none">
                      {badge}
                    </span>
                  )}
                </>
              )}
              {isSidebarCollapsed && badge !== undefined && badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-4 rounded-r-full bg-brand-400" />
              )}
            </button>
          );
        })}

        {!isSidebarCollapsed && (
          <div className="pt-4 px-1">
            <div className="rounded-xl p-3 border" style={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.15)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
                <span className="text-[10px] font-semibold text-brand-400">AI Active</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                Monitoring {activeTickets.length} tickets. {activeTickets.filter(t => t.severity === 'Critical').length > 0
                  ? 'Issues detected — check workspace.'
                  : 'All clear.'}
              </p>
            </div>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t px-3 py-3" style={{ borderColor: 'var(--border-secondary)' }}>
        <div className={`flex items-center gap-2.5 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/25 to-purple-500/20 flex items-center justify-center text-[11px] font-bold text-brand-400 shrink-0">
            {currentUser?.avatar}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>{currentUser ? ROLE_LABELS[currentUser.role] : ''}</p>
            </div>
          )}
          {!isSidebarCollapsed && (
            <button onClick={logout} className="p-1.5 rounded-md hover:opacity-70 transition" style={{ color: 'var(--text-tertiary)' }}>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
