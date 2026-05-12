import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore, generateId, type Ticket } from '../store';
import { generateAIResponse, generateTicketFromAI } from '../ai-engine';
import {
  Sparkles, Send, X, Maximize2, Minimize2,
  AlertTriangle, Info, Lightbulb, AlertCircle,
  ChevronRight, Plus, RotateCcw, Zap
} from 'lucide-react';

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'var(--text-secondary)' }}>
      {lines.map((line, i) => {
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let keyIdx = 0;

        while (remaining.length > 0) {
          const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
          if (boldMatch && boldMatch.index !== undefined) {
            if (boldMatch.index > 0) {
              parts.push(<span key={keyIdx++}>{remaining.substring(0, boldMatch.index)}</span>);
            }
            parts.push(<strong key={keyIdx++} className="font-semibold" style={{ color: 'var(--text-primary)' }}>{boldMatch[1]}</strong>);
            remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
          } else {
            parts.push(<span key={keyIdx++}>{remaining}</span>);
            remaining = '';
          }
        }

        return (
          <span key={i}>
            {parts}
            {i < lines.length - 1 && '\n'}
          </span>
        );
      })}
    </div>
  );
}

export default function AICopilot() {
  const {
    aiMessages, addAIMessage, clearAIMessages, aiInsights, isAIPanelOpen, toggleAIPanel, loadTickets,
    isAITyping, setAITyping, tickets, addTicket, currentUser, setSelectedTicketId, addToast
  } = useStore();
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'signals'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAITyping]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isAITyping) return;
    const userMsg = {
      id: generateId(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    addAIMessage(userMsg);
    const query = input.trim();
    setInput('');
    setAITyping(true);

    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      const response = generateAIResponse(query, tickets, currentUser?.role || 'Sales');
      const lower = query.toLowerCase();
      const isComplaint = lower.includes('customer') && (lower.includes('says') || lower.includes('complaint') || lower.includes('report') || lower.includes('issue'));

      const aiMsg = {
        id: generateId(),
        role: 'assistant' as const,
        content: response,
        timestamp: new Date().toISOString(),
        actions: isComplaint ? [
          { label: 'Create Ticket', type: 'create_ticket' as const },
        ] : undefined,
        ticketData: isComplaint ? generateTicketFromAI(query) as Partial<Ticket> : undefined,
      };
      addAIMessage(aiMsg);
      setAITyping(false);
    }, delay);
  }, [input, isAITyping, tickets, currentUser, addAIMessage, setAITyping]);

  const handleAction = useCallback(
  async (action: { type: string }, msg: typeof aiMessages[0]) => {

    // CREATE REAL TICKET
    if (action.type === 'create_ticket' && msg.ticketData) {

      try {

        const { createTicket } = await import('../services/create-ticket')

        const createdTicket = await createTicket({
          ...msg.ticketData,
          raised_by: currentUser?.name || '',
        })

        addTicket(createdTicket)

        await loadTickets()

        addToast({
          type: 'success',
          title: 'Ticket created',
          description: 'Real ticket saved to Supabase',
        })

        const confirmation = {
          id: generateId(),
          role: 'assistant' as const,
          content:
            `Done! Your ticket is now live and operational.\n\n` +
            `• Stored in Supabase\n` +
            `• AI monitoring enabled\n` +
            `• Workflow tracking started\n\n` +
            `I’ll continue watching this issue for escalations and delays.`,
          timestamp: new Date().toISOString(),
        }

        addAIMessage(confirmation)

      } catch (error) {

        console.error(error)

        addToast({
          type: 'error',
          title: 'Ticket creation failed',
          description: 'Could not save ticket to Supabase',
        })
      }
    }

    // VIEW TICKET
    if (action.type === 'view_ticket') {

      const data = msg.actions?.find(
        (a) => a.type === 'view_ticket'
      )?.data

      if (
        data &&
        typeof data === 'object' &&
        'ticketId' in data
      ) {
        setSelectedTicketId(data.ticketId as string)
      }
    }
  },
  [
    tickets,
    currentUser,
    addTicket,
    addAIMessage,
    setSelectedTicketId,
    addToast,
    loadTickets,
  ]
)

  const insightIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'suggestion': return <Lightbulb className="w-4 h-4 text-brand-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const insightBorder = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-red-400';
      case 'warning': return 'border-l-amber-400';
      case 'suggestion': return 'border-l-brand-400';
      default: return 'border-l-blue-400';
    }
  };

  // Role-specific suggestions
  const getSuggestions = () => {
    const role = currentUser?.role;
    if (role === 'Sales') return [
      'Any updates on my customers?',
      'Customer from Pune says tiles cracked',
      'Which accounts need follow-up?',
    ];
    if (role === 'AssignedLead') return [
      'What\'s on my plate today?',
      'Any urgent delays?',
      'Show me my workload',
    ];
    if (role === 'BusinessHead') return [
      'How is the team doing?',
      'Any bottlenecks this week?',
      'Show me trends',
    ];
    return [
      'What\'s going on right now?',
      'Show me operational trends',
      'Any urgent delays?',
    ];
  };

  if (!isAIPanelOpen) {
    return (
      <button
        onClick={toggleAIPanel}
        className="fixed right-5 bottom-5 z-50 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 hover:scale-105 transition-transform"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div
      className={`h-full flex flex-col border-l transition-all duration-300 ${isExpanded ? 'w-[440px]' : 'w-[320px]'}`}
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-sm shadow-brand-500/15">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nexus AI</h3>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Watching operations</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {aiMessages.length > 0 && (
            <button onClick={clearAIMessages} className="p-1.5 rounded-md hover:opacity-70 transition" style={{ color: 'var(--text-tertiary)' }} title="Clear chat">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-md hover:opacity-70 transition" style={{ color: 'var(--text-tertiary)' }}>
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={toggleAIPanel} className="p-1.5 rounded-md hover:opacity-70 transition" style={{ color: 'var(--text-tertiary)' }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-secondary)' }}>
        {(['chat', 'signals'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 text-xs font-medium transition-colors relative"
            style={{ color: activeTab === tab ? '#818cf8' : 'var(--text-tertiary)' }}
          >
            {tab === 'chat' ? 'Conversation' : `Signals (${aiInsights.length})`}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-brand-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Chat */}
      {activeTab === 'chat' ? (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {aiMessages.length === 0 && (
              <div className="text-center py-6 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/15 to-purple-500/10 flex items-center justify-center mx-auto mb-4 border" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
                  <Zap className="w-6 h-6 text-brand-400" />
                </div>
                <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>How can I help?</h4>
                <p className="text-xs mb-5 max-w-[220px] mx-auto leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  Describe a complaint, ask for updates, or request operational insights.
                </p>
                <div className="space-y-1.5">
                  {getSuggestions().map(s => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs transition border hover:border-brand-500/30"
                      style={{ background: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-secondary)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {aiMessages.map((msg: any, idx: number) => (
              <div key={msg.id} className={`animate-fade-in ${msg.role === 'user' ? 'flex justify-end' : ''}`} style={{ animationDelay: `${Math.min(idx * 30, 100)}ms` }}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] px-3 py-2 rounded-xl rounded-tr-sm text-[13px]" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--text-primary)' }}>
                    {msg.content}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <MarkdownText text={msg.content} />
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {msg.actions.map((action: any) => (
                              <button
                                key={action.label}
                                onClick={() => handleAction(action, msg)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition border hover:border-brand-500/40"
                                style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
                              >
                                {action.type === 'create_ticket' && <Plus className="w-3 h-3" />}
                                {action.type === 'view_ticket' && <ChevronRight className="w-3 h-3" />}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isAITyping && (
              <div className="flex items-start gap-2 animate-fade-in">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-input)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 border transition-all focus-within:border-brand-500/30 focus-within:shadow-sm focus-within:shadow-brand-500/5"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything or describe a complaint..."
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isAITyping}
                className="p-1.5 rounded-lg transition disabled:opacity-20"
                style={{ background: input.trim() ? 'rgba(99,102,241,0.15)' : 'transparent', color: '#818cf8' }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Signals */
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {aiInsights.map((insight: any, idx: number) => (
            <div
              key={insight.id}
              className={`rounded-lg border border-l-[3px] p-3 ${insightBorder(insight.type)} animate-fade-in cursor-pointer hover:scale-[1.005] transition-transform`}
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-secondary)', animationDelay: `${idx * 60}ms` }}
              onClick={() => {
                if (insight.relatedTicketId) setSelectedTicketId(insight.relatedTicketId);
              }}
            >
              <div className="flex items-start gap-2.5">
                {insightIcon(insight.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{insight.title}</h4>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{insight.description}</p>
                  {insight.relatedTicketId && (
                    <div className="flex items-center gap-1 mt-1.5 text-brand-400 text-[10px] font-medium">
                      <ChevronRight className="w-3 h-3" />
                      View details
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
