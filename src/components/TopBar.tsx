import { useStore, ROLE_LABELS } from '../store';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function TopBar() {
  const { theme, toggleTheme, currentUser, isAIPanelOpen, toggleAIPanel, tickets } = useStore();

  const activeTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');
  const immediateCount = activeTickets.filter(t => t.severity === 'Critical').length;

  return (
    <div className="h-11 flex items-center justify-between px-4 border-b shrink-0"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
      {/* Left: status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {activeTickets.length} active
          </span>
        </div>
        {immediateCount > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-[11px] font-medium text-red-400">
              {immediateCount} immediate
            </span>
          </div>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition hover:opacity-80"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-secondary)' }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>

        {/* AI toggle */}
        {!isAIPanelOpen && (
          <button
            onClick={toggleAIPanel}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition hover:opacity-80"
            style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open AI
          </button>
        )}

        {/* User */}
        <div className="flex items-center gap-2 ml-1 pl-2 border-l" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500/25 to-purple-500/20 flex items-center justify-center text-[9px] font-bold text-brand-400">
            {currentUser?.avatar}
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] font-medium leading-none" style={{ color: 'var(--text-primary)' }}>{currentUser?.name?.split(' ')[0]}</p>
            <p className="text-[9px] leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {currentUser ? ROLE_LABELS[currentUser.role] : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
