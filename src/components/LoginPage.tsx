import { useState } from 'react';
import { useStore } from '../store';
import { Zap, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const login = useStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      const success = login(email, password || 'demo');
      if (!success) setError('Invalid credentials. Try one of the demo accounts below.');
      setIsLoading(false);
    }, 800);
  };

  const quickLogin = (emailAddr: string) => {
    setIsLoading(true);
    setTimeout(() => {
      login(emailAddr, 'demo');
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-purple-600/10" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 25% 35%, rgba(99,102,241,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139,92,246,0.12) 0%, transparent 40%)'
        }} />

        <div className="relative z-10 flex flex-col justify-center px-16 max-w-2xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-heading tracking-tight" style={{ color: 'var(--text-primary)' }}>Nexus AI</h1>
              <p className="text-xs text-subtle" style={{ color: 'var(--text-tertiary)' }}>Operations Intelligence</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-[1.15] mb-5" style={{ color: 'var(--text-primary)' }}>
            Complaints turn into<br />
            insights. Insights turn<br />
            into <span className="text-brand-400">action.</span>
          </h2>

          <p className="text-lg mb-14 max-w-md leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Describe what happened — Nexus handles the rest. Assignment, tracking, and resolution, all guided by AI.
          </p>

          <div className="space-y-3">
            {[
              { emoji: '🗣', text: 'Describe complaints in plain language' },
              { emoji: '⚡', text: 'Automatic triage, assignment, and priority' },
              { emoji: '🔍', text: 'Real-time pattern detection and alerts' },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-lg">{emoji}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-16">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Nexus AI</h1>
          </div>

          <h3 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Sign in</h3>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Access your operational workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2.5 border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm hover:from-brand-500 hover:to-brand-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-500/15"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Continue <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Quick access — Demo accounts</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { email: 'admin@nexus.ai', role: 'Workspace Admin', desc: 'Full access', color: 'border-purple-500/25 text-purple-300' },
                { email: 'lead@nexus.ai', role: 'Assigned Lead', desc: 'Operations', color: 'border-blue-500/25 text-blue-300' },
                { email: 'bh@nexus.ai', role: 'Business Head', desc: 'Team view', color: 'border-emerald-500/25 text-emerald-300' },
                { email: 'sales@nexus.ai', role: 'Sales', desc: 'Customer focus', color: 'border-amber-500/25 text-amber-300' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc.email)}
                  className={`px-3 py-2.5 rounded-xl border text-left hover:scale-[1.02] transition-all ${acc.color}`}
                  style={{ background: 'var(--bg-input)' }}
                >
                  <div className="text-xs font-semibold">{acc.role}</div>
                  <div className="text-[10px] opacity-50">{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
