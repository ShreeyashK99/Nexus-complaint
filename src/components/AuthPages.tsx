import { useState } from 'react';
import { useStore, type UserRole, ROLE_LABELS } from '../store';
import { Zap, ArrowRight, AlertCircle, ArrowLeft, Mail, Lock, User, Sparkles } from 'lucide-react';

export function LoginPage() {
  const { login, setAuthView } = useStore();
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
      if (!success) setError('Invalid credentials. Try a demo account below.');
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
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-purple-600/10" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25% 35%, rgba(99,102,241,0.2) 0%, transparent 50%)' }} />
        <div className="relative z-10 flex flex-col justify-center px-16 max-w-2xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Nexus AI</h1>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Operations Intelligence</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-[1.15] mb-5" style={{ color: 'var(--text-primary)' }}>
            Complaints turn into<br />insights. Insights turn<br />into <span className="text-brand-400">action.</span>
          </h2>
          <p className="text-lg mb-14 max-w-md leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Describe what happened — Nexus handles the rest. Assignment, tracking, and resolution, all guided by AI.
          </p>
          <div className="space-y-3">
            {['🗣 Describe complaints naturally', '⚡ Automatic triage and assignment', '🔍 Real-time pattern detection'].map(text => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-lg">{text.slice(0, 2)}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{text.slice(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all border focus:ring-2 focus:ring-brand-500/30"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all border focus:ring-2 focus:ring-brand-500/30"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent" />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Remember me</span>
              </label>
              <button type="button" onClick={() => setAuthView('forgot-password')} className="text-xs text-brand-400 hover:underline">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2.5 border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-500/15">
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Continue <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Don't have an account? </span>
            <button onClick={() => setAuthView('signup')} className="text-xs text-brand-400 hover:underline">Sign up</button>
          </div>

          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Demo accounts</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { email: 'founder@nexus.ai', role: 'Founder', color: 'border-purple-500/25 text-purple-300' },
                { email: 'owner@nexus.ai', role: 'Owner', color: 'border-pink-500/25 text-pink-300' },
                { email: 'admin@nexus.ai', role: 'Admin', color: 'border-blue-500/25 text-blue-300' },
                { email: 'bh@nexus.ai', role: 'Business Head', color: 'border-emerald-500/25 text-emerald-300' },
                { email: 'lead@nexus.ai', role: 'Assigned Lead', color: 'border-cyan-500/25 text-cyan-300' },
                { email: 'sales@nexus.ai', role: 'Sales', color: 'border-amber-500/25 text-amber-300' },
              ].map((acc) => (
                <button key={acc.email} onClick={() => quickLogin(acc.email)}
                  className={`px-2 py-2 rounded-lg border text-left hover:scale-[1.02] transition-all ${acc.color}`}
                  style={{ background: 'var(--bg-input)' }}>
                  <div className="text-[10px] font-semibold">{acc.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SignupPage() {
  const { signup, setAuthView } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Sales');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      signup(name, email, password, role);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <button onClick={() => setAuthView('login')} className="flex items-center gap-1 text-xs mb-8 transition hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </button>

        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Nexus AI</h1>
        </div>

        <h3 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Create account</h3>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Join your team's operational workspace</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all border focus:ring-2 focus:ring-brand-500/30"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all border focus:ring-2 focus:ring-brand-500/30"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all border focus:ring-2 focus:ring-brand-500/30"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border focus:ring-2 focus:ring-brand-500/30"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2.5 border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </div>
          )}

          <button type="submit" disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-500/15">
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Already have an account? </span>
          <button onClick={() => setAuthView('login')} className="text-xs text-brand-400 hover:underline">Sign in</button>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { setAuthView } = useStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setSent(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <button onClick={() => setAuthView('login')} className="flex items-center gap-1 text-xs mb-8 transition hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </button>

        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Nexus AI</h1>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Check your email</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              We've sent password reset instructions to<br /><strong>{email}</strong>
            </p>
            <button onClick={() => setAuthView('login')} className="text-sm text-brand-400 hover:underline">
              Back to login
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Reset password</h3>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Enter your email to receive reset instructions</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all border focus:ring-2 focus:ring-brand-500/30"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-500/15">
                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Instructions <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
