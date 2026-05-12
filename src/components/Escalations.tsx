import { useStore } from '../store';
import {
  AlertTriangle, Clock, ArrowUpRight,
  CheckCircle, User, ChevronRight, Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Escalations() {
  const { tickets, setSelectedTicketId } = useStore();

  const activeTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');
  const alerted = activeTickets.filter(t => t.escalation_level !== 'None');
  const slaAtRisk = activeTickets.filter(t => {
    const hoursLeft = (new Date(t.sla_deadline).getTime() - new Date().getTime()) / 3600000;
    return hoursLeft < 12 && hoursLeft > 0;
  });
  const overdue = activeTickets.filter(t => new Date(t.sla_deadline) < new Date());

  const alertColor = (level: string) => {
    const map: Record<string, string> = {
      'Level 3': 'text-red-400 bg-red-500/10 border-red-500/20',
      'Level 2': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      'Level 1': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };
    return map[level] || '';
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-7 animate-fade-in">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Priority Alerts</h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Active alerts and urgent delays requiring attention</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { label: 'Active Alerts', value: alerted.length, icon: Shield, color: 'text-red-400' },
            { label: 'Urgent Delays', value: overdue.length, icon: Clock, color: 'text-amber-400' },
            { label: 'At Risk', value: slaAtRisk.length, icon: AlertTriangle, color: 'text-orange-400' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <div key={label} className="rounded-xl border p-4 animate-fade-in"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: `${i * 60}ms` }}>
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Alerted Tickets */}
        <div className="mb-7 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <h2 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Shield className="w-3.5 h-3.5 text-red-400" />Active Priority Alerts
          </h2>
          {alerted.length === 0 ? (
            <div className="rounded-xl border p-8 text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
              <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No active alerts</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Everything's flowing normally</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerted.sort((a, b) => {
                const order = ['Level 3', 'Level 2', 'Level 1'];
                return order.indexOf(a.escalation_level) - order.indexOf(b.escalation_level);
              }).map((ticket, idx) => {
                const isOverdue = new Date(ticket.sla_deadline) < new Date();
                const hours = Math.abs(Math.round((new Date().getTime() - new Date(ticket.sla_deadline).getTime()) / 3600000));
                return (
                  <div key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)}
                    className="rounded-xl border p-4 cursor-pointer transition group hover:border-brand-500/20 animate-fade-in"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: `${idx * 60}ms` }}>
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0 ${alertColor(ticket.escalation_level)}`}>
                        {ticket.escalation_level}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{ticket.id}</span>
                          {ticket.key_account && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Key</span>}
                        </div>
                        <h4 className="text-[13px] font-medium mb-0.5 group-hover:text-brand-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                          {ticket.complaint_summary}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" />{ticket.customer_name}</span>
                          <span>·</span>
                          <span>{ticket.company}</span>
                          <span>·</span>
                          <span>Lead: {ticket.owner}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {isOverdue ? (
                          <div className="flex items-center gap-1 text-red-400 text-[11px] font-medium"><Clock className="w-3 h-3" />Overdue {hours}h</div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-400 text-[11px]"><Clock className="w-3 h-3" />{hours}h left</div>
                        )}
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 mt-1 group-hover:text-brand-400 transition-colors" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Response Time Risk Zone */}
        <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
          <h2 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Clock className="w-3.5 h-3.5 text-amber-400" />Urgent Delay Zone
          </h2>
          {overdue.length === 0 && slaAtRisk.length === 0 ? (
            <div className="rounded-xl border p-8 text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
              <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>All clear</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>No urgent delays detected</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {[...overdue, ...slaAtRisk].map(ticket => {
                const isOverdue = new Date(ticket.sla_deadline) < new Date();
                const hours = Math.abs(Math.round((new Date().getTime() - new Date(ticket.sla_deadline).getTime()) / 3600000));
                return (
                  <div key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)}
                    className="rounded-xl border p-3 cursor-pointer transition hover:scale-[1.002]"
                    style={{ background: isOverdue ? 'rgba(239,68,68,0.03)' : 'rgba(245,158,11,0.03)', borderColor: 'var(--border-secondary)' }}>
                    <div className="flex items-center gap-2.5">
                      {isOverdue ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" /> : <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{ticket.id} — {ticket.complaint_summary}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{ticket.customer_name} · {ticket.owner}</p>
                      </div>
                      <span className={`text-[11px] font-medium shrink-0 ${isOverdue ? 'text-red-400' : 'text-amber-400'}`}>
                        {isOverdue ? `Overdue ${hours}h` : `${hours}h left`}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
