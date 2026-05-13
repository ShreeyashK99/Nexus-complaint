import React, { useState, useMemo } from 'react';
import { useStore, type TicketStatus, type Severity } from '../store';
import {
  Search, Filter, Grid3X3, List,
  AlertTriangle, Clock, ChevronRight, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import TicketCreateModal from './TicketCreateModal'

export default function TicketList() {
  const { tickets, setSelectedTicketId} = useStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const activeTickets = tickets.filter(
  (t: any) =>
    t.status !== 'Closed' &&
    t.status !== 'Resolved'
)

  const filtered = useMemo(() => {
    return activeTickets.filter((t: any) => {
      if (filterSeverity !== 'All' && t.severity !== filterSeverity) return false;
      if (filterStatus !== 'All' && t.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.id.toLowerCase().includes(q) || t.customer_name.toLowerCase().includes(q) ||
          t.company.toLowerCase().includes(q) || t.complaint_summary.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) || t.complaint_type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [tickets, search, filterSeverity, filterStatus]);

  const sevBadge = (s: string) => s === 'Critical' ? 'text-red-400 bg-red-500/10' : s === 'High' ? 'text-amber-400 bg-amber-500/10' : s === 'Medium' ? 'text-blue-400 bg-blue-500/10' : 'text-emerald-400 bg-emerald-500/10';
  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      'Open': 'bg-blue-500/12 text-blue-400', 'In Progress': 'bg-amber-500/12 text-amber-400',
      'Alignment Call Done': 'bg-purple-500/12 text-purple-400', 'Awaiting Customer': 'bg-orange-500/12 text-orange-400',
      'Resolved': 'bg-emerald-500/12 text-emerald-400', 'Closed': 'bg-gray-500/12 text-gray-400',
    };
    return map[s] || '';
  };

  const statuses: TicketStatus[] = ['Open', 'Alignment Call Done', 'In Progress', 'Awaiting Customer', 'Resolved', 'Closed'];

  return (
    <>
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Tickets</h1>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{filtered.length} of {tickets.length}</p>
          </div>
          <button
            onClick={() => useStore.getState().openCreateModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-semibold hover:from-brand-500 hover:to-brand-400 transition shadow-sm shadow-brand-500/15"
          >
            + Add Ticket
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 border transition focus-within:border-brand-500/30"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
          >
            <Search className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text-primary)' }}
            />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} /></button>}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium transition"
            style={{ background: showFilters ? 'rgba(99,102,241,0.08)' : 'var(--bg-input)', borderColor: showFilters ? 'rgba(99,102,241,0.2)' : 'var(--border-primary)', color: showFilters ? '#818cf8' : 'var(--text-secondary)' }}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
          <div className="flex items-center rounded-xl border p-0.5" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
            {(['list', 'board'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)} className="p-1.5 rounded-lg transition" style={{ background: viewMode === m ? 'rgba(99,102,241,0.1)' : 'transparent', color: viewMode === m ? '#818cf8' : 'var(--text-tertiary)' }}>
                {m === 'list' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap animate-fade-in">
            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Severity:</span>
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(s => (
              <button key={s} onClick={() => setFilterSeverity(s)}
                className="text-[11px] px-2 py-1 rounded-lg border transition"
                style={{ background: filterSeverity === s ? 'rgba(99,102,241,0.08)' : 'transparent', borderColor: filterSeverity === s ? 'rgba(99,102,241,0.2)' : 'var(--border-secondary)', color: filterSeverity === s ? '#818cf8' : 'var(--text-tertiary)' }}
              >{s}</button>
            ))}
            <div className="w-px h-4" style={{ background: 'var(--border-secondary)' }} />
            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Status:</span>
            {(['All', ...statuses] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="text-[11px] px-2 py-1 rounded-lg border transition whitespace-nowrap"
                style={{ background: filterStatus === s ? 'rgba(99,102,241,0.08)' : 'transparent', borderColor: filterStatus === s ? 'rgba(99,102,241,0.2)' : 'var(--border-secondary)', color: filterStatus === s ? '#818cf8' : 'var(--text-tertiary)' }}
              >{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'board' ? (
          <div className="flex gap-3 overflow-x-auto p-4">
            {statuses.filter(s => filtered.some(t => t.status === s)).map(status => (
              <div key={status} className="min-w-[260px] max-w-[260px]">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge(status)}`}>{status}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{filtered.filter(t => t.status === status).length}</span>
                </div>
                <div className="space-y-1.5">
                  {filtered.filter((t: any) => t.status === status).map((ticket: any) => (
                    <div key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)}
                      className="rounded-xl border p-3 cursor-pointer transition group hover:border-brand-500/20"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{ticket.id}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sevBadge(ticket.severity)}`}>{ticket.severity}</span>
                      </div>
                      <h4 className="text-xs font-medium mb-1.5 line-clamp-2 group-hover:text-brand-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {ticket.complaint_summary}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{ticket.customer_name}</span>
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold text-brand-400" style={{ background: 'rgba(99,102,241,0.1)' }}>
                          {ticket.owner.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {filtered.map((ticket: any, i: number) => {
              const overdue = new Date(ticket.sla_deadline) < new Date() && ticket.status !== 'Resolved' && ticket.status !== 'Closed';
              return (
                <div key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)}
                  className="px-6 py-3.5 border-b cursor-pointer transition-colors group animate-fade-in"
                  style={{ borderColor: 'var(--border-secondary)', animationDelay: `${Math.min(i * 40, 250)}ms` }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      ticket.severity === 'Critical' ? 'bg-red-400' : ticket.severity === 'High' ? 'bg-amber-400' : ticket.severity === 'Medium' ? 'bg-blue-400' : 'bg-emerald-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{ticket.id}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sevBadge(ticket.severity)}`}>{ticket.severity}</span>
                        {ticket.key_account && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-400">Key</span>}
                        {ticket.escalation_level !== 'None' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-500/10 text-red-400 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />{ticket.escalation_level}
                          </span>
                        )}
                        {overdue && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-500/10 text-red-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />Overdue
                          </span>
                        )}
                      </div>
                      <h4 className="text-[13px] font-medium mb-0.5 line-clamp-1 group-hover:text-brand-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {ticket.complaint_summary}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        <span>{ticket.customer_name}</span><span>·</span><span>{ticket.company}</span><span>·</span><span>{ticket.city}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge(ticket.status)}`}>{ticket.status}</span>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 group-hover:text-brand-400 transition-colors" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No tickets match your search</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Try different filters or search terms</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

<TicketCreateModal

/>
</>
  );
}