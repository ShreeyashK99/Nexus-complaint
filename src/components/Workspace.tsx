import { useState, useEffect } from 'react';
import { useStore, ROLE_LABELS } from '../store';
import {
  AlertTriangle, Clock, Zap,
  ArrowUpRight, Users, Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Workspace() {
  const { tickets, currentUser, setSelectedTicketId, aiInsights, liveFeed, setAIPanelOpen } = useStore();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  const role = currentUser?.role;
  const activeTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');
  const criticalTickets = activeTickets.filter(t => t.severity === 'Critical');
  const urgentDelays = activeTickets.filter(t => new Date(t.sla_deadline) < new Date());
  const priorityAlerts = activeTickets.filter(t => t.escalation_level !== 'None');

  // Role-filtered tickets
  const myTickets = role === 'AssignedLead'
    ? activeTickets.filter(t => t.owner === currentUser?.name)
    : role === 'Sales'
    ? activeTickets
    : activeTickets;

  const recentTickets = [...myTickets]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    const name = currentUser?.name?.split(' ')[0] || '';
    if (h < 12) return `Good morning, ${name}`;
    if (h < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const subtitle = () => {
    if (role === 'Admin') {
      return criticalTickets.length > 0
        ? `${criticalTickets.length} ${criticalTickets.length === 1 ? 'issue needs' : 'issues need'} immediate attention across the organization.`
        : 'Operations are running smoothly. No immediate concerns.';
    }
    if (role === 'AssignedLead') {
      return `You have ${myTickets.length} active tickets. ${urgentDelays.filter(t => t.owner === currentUser?.name).length > 0 ? 'Some are running behind.' : 'All on track.'}`;
    }
    if (role === 'BusinessHead') {
      return `Team is handling ${activeTickets.length} tickets. ${priorityAlerts.length > 0 ? `${priorityAlerts.length} priority alerts active.` : 'No alerts.'}`;
    }
    return `${activeTickets.length} active tickets across your accounts. ${criticalTickets.length > 0 ? 'Some need attention.' : 'Looking good.'}`;
  };

  const sevDot = (s: string) => s === 'Critical' ? 'bg-red-400' : s === 'High' ? 'bg-amber-400' : s === 'Medium' ? 'bg-blue-400' : 'bg-emerald-400';
  const sevBadge = (s: string) => s === 'Critical' ? 'text-red-400 bg-red-500/10' : s === 'High' ? 'text-amber-400 bg-amber-500/10' : s === 'Medium' ? 'text-blue-400 bg-blue-500/10' : 'text-emerald-400 bg-emerald-500/10';
  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      'Open': 'bg-blue-500/12 text-blue-400',
      'In Progress': 'bg-amber-500/12 text-amber-400',
      'Alignment Call Done': 'bg-purple-500/12 text-purple-400',
      'Awaiting Customer': 'bg-orange-500/12 text-orange-400',
      'Resolved': 'bg-emerald-500/12 text-emerald-400',
      'Closed': 'bg-gray-500/12 text-gray-400',
    };
    return map[s] || 'bg-gray-500/12 text-gray-400';
  };

  // Stats based on role
  const stats = () => {
    if (role === 'Admin') return [
      { label: 'Active', value: activeTickets.length, color: 'text-brand-400' },
      { label: 'Immediate Attention', value: criticalTickets.length, color: 'text-red-400' },
      { label: 'Urgent Delays', value: urgentDelays.length, color: 'text-amber-400' },
      { label: 'Priority Alerts', value: priorityAlerts.length, color: 'text-purple-400' },
    ];
    if (role === 'AssignedLead') return [
      { label: 'My Tickets', value: myTickets.length, color: 'text-brand-400' },
      { label: 'Immediate', value: myTickets.filter(t => t.severity === 'Critical').length, color: 'text-red-400' },
      { label: 'Behind Schedule', value: myTickets.filter(t => new Date(t.sla_deadline) < new Date()).length, color: 'text-amber-400' },
      { label: 'Awaiting Input', value: myTickets.filter(t => t.status === 'Awaiting Customer').length, color: 'text-orange-400' },
    ];
    if (role === 'BusinessHead') return [
      { label: 'Team Active', value: activeTickets.length, color: 'text-brand-400' },
      { label: 'Immediate', value: criticalTickets.length, color: 'text-red-400' },
      { label: 'Urgent Delays', value: urgentDelays.length, color: 'text-amber-400' },
      { label: 'Priority Alerts', value: priorityAlerts.length, color: 'text-purple-400' },
    ];
    return [
      { label: 'Active Issues', value: activeTickets.length, color: 'text-brand-400' },
      { label: 'Need Attention', value: criticalTickets.length, color: 'text-red-400' },
      { label: 'Running Late', value: urgentDelays.length, color: 'text-amber-400' },
      { label: 'Key Accounts', value: activeTickets.filter(t => t.key_account).length, color: 'text-purple-400' },
    ];
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Greeting */}
        <div className={`mb-8 transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{greeting()}</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{subtitle()}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8' }}>
              {currentUser ? ROLE_LABELS[currentUser.role] : ''}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {stats().map((s, i) => (
            <div
              key={s.label}
              className={`rounded-xl p-4 border transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', transitionDelay: `${i * 80}ms` }}
            >
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* AI Signals — only show important ones */}
        {aiInsights.filter(i => i.type === 'critical').length > 0 && (
          <div className="mb-6 animate-fade-in">
            {aiInsights.filter(i => i.type === 'critical').slice(0, 2).map(insight => (
              <div
                key={insight.id}
                onClick={() => insight.relatedTicketId && setSelectedTicketId(insight.relatedTicketId)}
                className="rounded-xl border border-l-[3px] border-l-red-400 p-3.5 flex items-start gap-3 cursor-pointer mb-2 transition hover:scale-[1.003]"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{insight.title}</h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{insight.description}</p>
                </div>
                {insight.relatedTicketId && <ArrowUpRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Tickets list */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Zap className="w-3.5 h-3.5 text-brand-400" />
                {role === 'AssignedLead' ? 'Your Active Work' : 'Recent Activity'}
              </h2>
            </div>
            <div className="space-y-1.5">
              {recentTickets.map((ticket, i) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className="rounded-xl border p-3.5 cursor-pointer transition-all group hover:border-brand-500/20 animate-fade-in"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sevDot(ticket.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{ticket.id}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sevBadge(ticket.severity)}`}>{ticket.severity}</span>
                        {ticket.key_account && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-400">Key</span>
                        )}
                        {new Date(ticket.sla_deadline) < new Date() && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-500/10 text-red-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />Overdue
                          </span>
                        )}
                      </div>
                      <h4 className="text-[13px] font-medium mb-1 line-clamp-1 group-hover:text-brand-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {ticket.complaint_summary}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        <span>{ticket.customer_name}</span>
                        <span>·</span>
                        <span>{ticket.city}</span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${statusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Quick AI Action */}
            <div
              className="rounded-xl border p-4 cursor-pointer transition hover:border-brand-500/20"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}
              onClick={() => setAIPanelOpen(true)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Action</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                Describe a complaint or ask a question — Nexus AI will handle the rest.
              </p>
            </div>

            {/* Workload (Admin / BH only) */}
            {(role === 'Admin' || role === 'BusinessHead') && (
              <div className="rounded-xl border p-4 animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: '200ms' }}>
                <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  Team Workload
                </h3>
                {Array.from(new Set(tickets.map(t => t.owner))).map(owner => {
                  const count = activeTickets.filter(t => t.owner === owner).length;
                  const crit = activeTickets.filter(t => t.owner === owner && t.severity === 'Critical').length;
                  return (
                    <div key={owner} className="mb-2.5 last:mb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{owner}</span>
                        <div className="flex items-center gap-1.5">
                          {crit > 0 && <span className="text-[10px] text-red-400">{crit} imm.</span>}
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{count}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-secondary)' }}>
                        <div className={`h-full rounded-full transition-all ${count > 4 ? 'bg-red-400' : count > 2 ? 'bg-amber-400' : 'bg-brand-400'}`} style={{ width: `${Math.min((count / 6) * 100, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live Feed */}
            <div className="rounded-xl border p-4 animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: '300ms' }}>
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Activity className="w-3.5 h-3.5 text-brand-400" />
                Live Feed
              </h3>
              <div className="space-y-2.5">
                {liveFeed.slice(0, 4).map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      item.type === 'ai' ? 'bg-brand-400' : item.type === 'system' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`} />
                    <div>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.message}</p>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
