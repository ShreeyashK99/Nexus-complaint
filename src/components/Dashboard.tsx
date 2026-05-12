import { useStore, ROLE_LABELS } from '../store';
import {
  AlertTriangle, Clock, TrendingUp, MapPin,
  BarChart3, Users, Zap, ArrowUpRight,
  CheckCircle, XCircle, Star
} from 'lucide-react';

export default function Dashboard() {
  const { tickets, currentUser, setSelectedTicketId } = useStore();

  const activeTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');
  const criticalTickets = activeTickets.filter(t => t.severity === 'Critical');
  const urgentDelays = activeTickets.filter(t => new Date(t.sla_deadline) < new Date());
  const priorityAlerts = activeTickets.filter(t => t.escalation_level !== 'None');
  const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
  const keyAccountTickets = activeTickets.filter(t => t.key_account);

  const byType = tickets.reduce<Record<string, number>>((a, t) => { a[t.complaint_type] = (a[t.complaint_type] || 0) + 1; return a; }, {});
  const byCity = tickets.reduce<Record<string, number>>((a, t) => { a[t.city] = (a[t.city] || 0) + 1; return a; }, {});
  const bySeverity = tickets.reduce<Record<string, number>>((a, t) => { a[t.severity] = (a[t.severity] || 0) + 1; return a; }, {});

  const avgSat = tickets.filter(t => t.customer_satisfaction > 0);
  const satScore = avgSat.length > 0 ? (avgSat.reduce((s, t) => s + t.customer_satisfaction, 0) / avgSat.length) : 0;

  const ownerLoad = Array.from(new Set(tickets.map(t => t.owner))).map(owner => ({
    name: owner,
    total: activeTickets.filter(t => t.owner === owner).length,
    critical: activeTickets.filter(t => t.owner === owner && t.severity === 'Critical').length,
  }));

  const isAdmin = currentUser?.role === 'Admin';

  const sevBarColor = (s: string) => s === 'Critical' ? 'bg-red-400' : s === 'High' ? 'bg-amber-400' : s === 'Medium' ? 'bg-blue-400' : 'bg-emerald-400';

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-7 animate-fade-in">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {currentUser ? ROLE_LABELS[currentUser.role] : ''} Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5 mb-7">
          {[
            { label: 'Active', value: activeTickets.length, icon: Zap, color: 'text-brand-400' },
            { label: 'Immediate', value: criticalTickets.length, icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Urgent Delays', value: urgentDelays.length, icon: Clock, color: 'text-amber-400' },
            { label: 'Priority Alerts', value: priorityAlerts.length, icon: AlertTriangle, color: 'text-purple-400' },
            { label: 'Resolved', value: resolved.length, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Avg. CSAT', value: satScore.toFixed(1), icon: Star, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <div key={label} className="rounded-xl border p-3.5 animate-fade-in"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: `${i * 40}ms` }}>
              <Icon className={`w-4 h-4 ${color} mb-1.5`} />
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Severity */}
          <div className="rounded-xl border p-4 animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: '100ms' }}>
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <BarChart3 className="w-3.5 h-3.5 text-brand-400" />Severity Breakdown
            </h3>
            <div className="space-y-2.5">
              {['Critical', 'High', 'Medium', 'Low'].map(sev => {
                const count = bySeverity[sev] || 0;
                const pct = tickets.length > 0 ? (count / tickets.length) * 100 : 0;
                return (
                  <div key={sev}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{sev}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-secondary)' }}>
                      <div className={`h-full rounded-full ${sevBarColor(sev)} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regions */}
          <div className="rounded-xl border p-4 animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: '150ms' }}>
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <MapPin className="w-3.5 h-3.5 text-brand-400" />By Region
            </h3>
            <div className="space-y-2">
              {Object.entries(byCity).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
                <div key={city} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{city}</span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Types */}
          <div className="rounded-xl border p-4 animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: '200ms' }}>
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <TrendingUp className="w-3.5 h-3.5 text-brand-400" />Issue Types
            </h3>
            <div className="space-y-2">
              {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-[11px] truncate flex-1 mr-2" style={{ color: 'var(--text-secondary)' }}>{type}</span>
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Immediate Attention */}
          <div className="rounded-xl border p-4 animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: '250ms' }}>
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />Immediate Attention
            </h3>
            {criticalTickets.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs py-3">
                <CheckCircle className="w-4 h-4" />No immediate concerns — looking good.
              </div>
            ) : (
              <div className="space-y-1.5">
                {criticalTickets.map(t => (
                  <div key={t.id} onClick={() => setSelectedTicketId(t.id)}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition hover:opacity-80 border border-red-500/10" style={{ background: 'rgba(239,68,68,0.04)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.complaint_summary}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t.customer_name} · {t.company}</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workload */}
          <div className="rounded-xl border p-4 animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: '300ms' }}>
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Users className="w-3.5 h-3.5 text-brand-400" />Team Load
            </h3>
            <div className="space-y-3">
              {ownerLoad.map(({ name, total, critical }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{name}</span>
                    <div className="flex items-center gap-1.5">
                      {critical > 0 && <span className="text-[10px] text-red-400">{critical} imm.</span>}
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{total} active</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-secondary)' }}>
                    <div className={`h-full rounded-full transition-all ${total > 4 ? 'bg-red-400' : total > 2 ? 'bg-amber-400' : 'bg-brand-400'}`}
                      style={{ width: `${Math.min((total / 6) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key accounts — Admin only */}
          {isAdmin && (
            <div className="rounded-xl border p-4 animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: '350ms' }}>
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Star className="w-3.5 h-3.5 text-amber-400" />Key Account Risks
              </h3>
              {keyAccountTickets.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs py-3"><CheckCircle className="w-4 h-4" />No key account issues.</div>
              ) : (
                <div className="space-y-1.5">
                  {keyAccountTickets.map(t => (
                    <div key={t.id} onClick={() => setSelectedTicketId(t.id)}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition hover:opacity-80 border" style={{ borderColor: 'var(--border-secondary)' }}>
                      <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.customer_name} — {t.company}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t.complaint_type} · {t.severity}</p>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Urgent Delays */}
          <div className="rounded-xl border p-4 animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: '400ms' }}>
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="w-3.5 h-3.5 text-amber-400" />Urgent Delays
            </h3>
            {urgentDelays.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs py-3"><CheckCircle className="w-4 h-4" />Everything on schedule.</div>
            ) : (
              <div className="space-y-1.5">
                {urgentDelays.map(t => {
                  const hours = Math.round((new Date().getTime() - new Date(t.sla_deadline).getTime()) / 3600000);
                  return (
                    <div key={t.id} onClick={() => setSelectedTicketId(t.id)}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition hover:opacity-80 border border-red-500/10" style={{ background: 'rgba(239,68,68,0.04)' }}>
                      <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.id} — {t.customer_name}</p>
                        <p className="text-[10px] text-red-400">Overdue by {hours}h</p>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
