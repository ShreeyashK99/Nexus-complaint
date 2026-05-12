import { useState } from 'react';
import { useStore, generateId, type TicketStatus, type EscalationLevel } from '../store';
import {
  ArrowLeft, Clock, AlertTriangle, User, MapPin,
  Building, Package, FileText, MessageSquare,
  ChevronDown, Send, Paperclip, Shield, Star,
  CheckCircle, Circle, ArrowUpRight, History
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function TicketDetail() {
  const { tickets, selectedTicketId, setSelectedTicketId, setCurrentView, updateTicket, addComment, addActivity, currentUser, addToast } = useStore();
  const ticket = tickets.find(t => t.id === selectedTicketId);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments'>('details');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  if (!ticket) {
    return (
      <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-tertiary)' }}>
        <p>Ticket not found</p>
      </div>
    );
  }

  const overdue = new Date(ticket.sla_deadline) < new Date() && ticket.status !== 'Resolved' && ticket.status !== 'Closed';
  const slaHours = Math.abs(Math.round((new Date().getTime() - new Date(ticket.sla_deadline).getTime()) / 3600000));

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

  const handleStatusChange = (newStatus: TicketStatus) => {
    const oldStatus = ticket.status;
    setStatusLoading(true);
    setShowStatusMenu(false);
    setTimeout(() => {
      updateTicket(ticket.id, { status: newStatus });
      addActivity(ticket.id, {
        id: generateId(), ticketId: ticket.id, type: 'status_change',
        description: `Moved to ${newStatus}`, author: currentUser?.name || 'System',
        timestamp: new Date().toISOString(), metadata: { from: oldStatus, to: newStatus },
      });
      addToast({ type: 'success', title: 'Status updated', description: `${ticket.id} → ${newStatus}` });
      setStatusLoading(false);
    }, 400);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment(ticket.id, {
      id: generateId(), ticketId: ticket.id, author: currentUser?.name || 'Unknown',
      content: commentText.trim(), timestamp: new Date().toISOString(), isInternal,
    });
    addActivity(ticket.id, {
      id: generateId(), ticketId: ticket.id, type: 'comment',
      description: `${isInternal ? 'Internal note' : 'Comment'} added`,
      author: currentUser?.name || 'Unknown', timestamp: new Date().toISOString(),
    });
    setCommentText('');
    addToast({ type: 'success', title: isInternal ? 'Note saved' : 'Comment added' });
  };

  const handleEscalate = () => {
    const levels: EscalationLevel[] = ['None', 'Level 1', 'Level 2', 'Level 3'];
    const nextLevel = levels[Math.min(levels.indexOf(ticket.escalation_level) + 1, levels.length - 1)];
    updateTicket(ticket.id, { escalation_level: nextLevel });
    addActivity(ticket.id, {
      id: generateId(), ticketId: ticket.id, type: 'escalation',
      description: `Priority alert raised to ${nextLevel}`,
      author: currentUser?.name || 'System', timestamp: new Date().toISOString(),
    });
    addToast({ type: 'warning', title: 'Priority alert raised', description: `${ticket.id} → ${nextLevel}` });
  };

  const activityIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <CheckCircle className="w-3 h-3 text-brand-400" />;
      case 'comment': return <MessageSquare className="w-3 h-3 text-blue-400" />;
      case 'assignment': return <User className="w-3 h-3 text-purple-400" />;
      case 'escalation': return <AlertTriangle className="w-3 h-3 text-red-400" />;
      case 'creation': return <Circle className="w-3 h-3 text-emerald-400" />;
      case 'attachment': return <Paperclip className="w-3 h-3 text-amber-400" />;
      default: return <Circle className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-secondary)' }}>
        <div className="flex items-center gap-2 mb-2.5">
          <button onClick={() => { setSelectedTicketId(null); setCurrentView('tickets'); }}
            className="p-1.5 rounded-lg transition hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{ticket.id}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sevBadge(ticket.severity)}`}>{ticket.severity}</span>
          {ticket.key_account && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-400">Key Account</span>}
          {ticket.escalation_level !== 'None' && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-500/10 text-red-400">🔺 {ticket.escalation_level}</span>}
          <div className="flex-1" />

          {/* Status */}
          <div className="relative">
            <button onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-medium ${statusBadge(ticket.status)} ${statusLoading ? 'opacity-50' : ''}`}>
              {statusLoading ? <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" /> : ticket.status}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border shadow-xl py-1 animate-fade-in"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-primary)' }}>
                {statuses.map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)}
                    className="w-full text-left px-3 py-2 text-xs transition hover:opacity-80"
                    style={{ color: ticket.status === s ? '#818cf8' : 'var(--text-secondary)', fontWeight: ticket.status === s ? 600 : 400 }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {ticket.escalation_level !== 'Level 3' && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
            <button onClick={handleEscalate}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-medium bg-red-500/10 text-red-400 hover:bg-red-500/15 transition">
              <ArrowUpRight className="w-3 h-3" />Raise Priority
            </button>
          )}
        </div>
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{ticket.complaint_summary}</h2>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          <span>Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
          <span>·</span>
          <span>Updated {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</span>
          {overdue && (
            <>
              <span>·</span>
              <span className="text-red-400 flex items-center gap-1"><Clock className="w-3 h-3" />Overdue by {slaHours}h</span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-6 shrink-0" style={{ borderColor: 'var(--border-secondary)' }}>
        {([
          { key: 'details', label: 'Details', icon: FileText },
          { key: 'timeline', label: 'Timeline', icon: History },
          { key: 'comments', label: `Discussion (${ticket.comments.length})`, icon: MessageSquare },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition"
            style={{ borderColor: activeTab === key ? '#818cf8' : 'transparent', color: activeTab === key ? '#818cf8' : 'var(--text-tertiary)' }}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' && (
          <div className="px-6 py-5 space-y-5 animate-fade-in">
            {/* Verbatim */}
            <div className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
              <p className="text-[13px] italic leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>"{ticket.complaint_verbatim}"</p>
              <div className="border-t pt-3" style={{ borderColor: 'var(--border-secondary)' }}>
                <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>AI Summary</p>
                <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{ticket.complaint_summary}</p>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: User, label: 'Customer', value: ticket.customer_name },
                { icon: Building, label: 'Company', value: ticket.company },
                { icon: MapPin, label: 'City', value: ticket.city },
                { icon: Package, label: 'Product', value: ticket.product },
                { icon: FileText, label: 'Order Ref', value: ticket.order_reference || '—' },
                { icon: Shield, label: 'Segment', value: ticket.segment },
                { icon: User, label: 'Assigned Lead', value: ticket.owner },
                { icon: User, label: 'Raised By', value: ticket.raised_by },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border p-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  </div>
                  <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              {[
                { label: 'Desired Outcome', value: ticket.desired_outcome || 'Not specified' },
                { label: 'Root Cause', value: ticket.root_cause || 'Under investigation' },
                { label: 'Preventive Action', value: ticket.preventive_action || 'Pending' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border p-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
              <div className="rounded-xl border p-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Customer Satisfaction</span>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= ticket.customer_satisfaction ? 'text-amber-400 fill-amber-400' : ''}`} style={s > ticket.customer_satisfaction ? { color: 'var(--border-primary)' } : {}} />
                  ))}
                  <span className="text-[11px] ml-1" style={{ color: 'var(--text-tertiary)' }}>{ticket.customer_satisfaction}/5</span>
                </div>
              </div>
            </div>

            {ticket.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ticket.attachments.map(att => (
                  <div key={att} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px]"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', color: 'var(--text-secondary)' }}>
                    <Paperclip className="w-3 h-3" />{att}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="px-6 py-5 animate-fade-in">
            <div className="relative">
              <div className="absolute left-[9px] top-2 bottom-2 w-px" style={{ background: 'var(--border-secondary)' }} />
              <div className="space-y-3">
                {[...ticket.activity].reverse().map((entry, idx) => (
                  <div key={entry.id} className="flex items-start gap-3 relative animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="w-[19px] h-[19px] rounded-full flex items-center justify-center shrink-0 z-10 border"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                      {activityIcon(entry.type)}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{entry.description}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{entry.author}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>·</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{format(new Date(entry.timestamp), 'MMM d · h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="px-6 py-5 space-y-3 animate-fade-in">
            {ticket.comments.length === 0 && (
              <p className="text-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>No discussion yet — start the conversation below</p>
            )}
            {ticket.comments.map((comment, idx) => (
              <div key={comment.id} className={`rounded-xl border p-3.5 animate-fade-in ${comment.isInternal ? 'border-l-[3px] border-l-amber-400' : ''}`}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)', animationDelay: `${idx * 40}ms` }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-brand-400" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    {comment.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{comment.author}</span>
                  {comment.isInternal && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/12 text-amber-400 font-medium">Internal</span>}
                  <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</span>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
              </div>
            ))}

            {/* Input */}
            <div className="rounded-xl border p-3.5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                {(['comment', 'internal'] as const).map(type => (
                  <button key={type} onClick={() => setIsInternal(type === 'internal')}
                    className="text-[11px] px-2 py-1 rounded-lg border transition"
                    style={{
                      background: (type === 'internal' ? isInternal : !isInternal) ? 'rgba(99,102,241,0.08)' : 'transparent',
                      borderColor: (type === 'internal' ? isInternal : !isInternal) ? 'rgba(99,102,241,0.2)' : 'var(--border-secondary)',
                      color: (type === 'internal' ? isInternal : !isInternal) ? '#818cf8' : 'var(--text-tertiary)',
                    }}>
                    {type === 'comment' ? 'Comment' : 'Internal Note'}
                  </button>
                ))}
              </div>
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}
                placeholder={isInternal ? 'Write an internal note...' : 'Write a comment...'}
                className="w-full bg-transparent text-[13px] outline-none resize-none h-16" style={{ color: 'var(--text-primary)' }} />
              <div className="flex items-center justify-between mt-1">
                <button className="p-1.5 rounded-lg transition hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleComment} disabled={!commentText.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition disabled:opacity-20"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                  <Send className="w-3 h-3" />Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
