import { useStore, ROLE_LABELS } from '../store';
import {
  User, Shield, Bell, Zap,
  Database, Globe, Key, ChevronRight
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser } = useStore();

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', desc: 'Name, email, and preferences' },
        { icon: Key, label: 'Security', desc: 'Password and session management' },
        { icon: Bell, label: 'Notifications', desc: 'Alert and email preferences' },
      ]
    },
    {
      title: 'Workspace',
      items: [
        { icon: Shield, label: 'Roles & Access', desc: 'Team roles and permissions' },
        { icon: Globe, label: 'Operational Rules', desc: 'Response time policies, routing rules' },
      ]
    },
    {
      title: 'AI & Integrations',
      items: [
        { icon: Zap, label: 'AI Configuration', desc: 'Model, prompts, and behavior settings' },
        { icon: Database, label: 'Data & Export', desc: 'Export tickets, reports, analytics' },
        { icon: Globe, label: 'API & Webhooks', desc: 'External integrations and automation' },
      ]
    },
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-7 animate-fade-in">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Account and workspace configuration</p>
        </div>

        {/* Profile card */}
        <div className="rounded-xl border p-5 mb-7 animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500/25 to-purple-500/20 flex items-center justify-center text-lg font-bold text-brand-400">
              {currentUser?.avatar}
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</h3>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{currentUser?.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                  {currentUser ? ROLE_LABELS[currentUser.role] : ''}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--bg-input)', color: 'var(--text-tertiary)' }}>
                  {currentUser?.department}
                </span>
              </div>
            </div>
          </div>
        </div>

        {sections.map((section, si) => (
          <div key={section.title} className="mb-7 animate-fade-in" style={{ animationDelay: `${(si + 1) * 80}ms` }}>
            <h2 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{section.title}</h2>
            <div className="rounded-xl border overflow-hidden divide-y divide-themed" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
              {section.items.map(({ icon: Icon, label, desc }) => (
                <button key={label}
                  className="w-full flex items-center gap-3.5 p-3.5 transition text-left group"
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.06)' }}>
                    <Icon className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-brand-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 group-hover:text-brand-400 transition-colors" style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* AI Status */}
        <div className="rounded-xl border p-5 animate-fade-in" style={{ background: 'rgba(99,102,241,0.03)', borderColor: 'rgba(99,102,241,0.12)', animationDelay: '350ms' }}>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-sm shadow-brand-500/15">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Engine</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Online — Ready for provider integration</span>
              </div>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            Architectured for OpenAI and Claude. Connect API keys to unlock advanced pattern detection, multi-agent operations, and conversational workflows.
          </p>
          <button className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-medium transition" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
            Configure AI Provider →
          </button>
        </div>
      </div>
    </div>
  );
}
