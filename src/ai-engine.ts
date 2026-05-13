import { type Ticket, type Severity, type UserRole, generateId } from './store';

interface ExtractedTicketData {
  customer_name: string;
  company: string;
  city: string;
  product: string;
  complaint_verbatim: string;
  complaint_summary: string;
  complaint_type: string;
  severity: Severity;
  suggested_owner: string;
  escalation_risk: string;
  segment: string;
}

const COMPLAINT_PATTERNS: Record<string, { type: string; severity: Severity; owner: string }> = {
  'crack|break|damage|broken': { type: 'Product Damage', severity: 'Critical', owner: 'Priya Sharma' },
  'color|shade|mismatch|match': { type: 'Color Mismatch', severity: 'High', owner: 'Rahul Gupta' },
  'wrong|incorrect|different': { type: 'Wrong Product', severity: 'Critical', owner: 'Priya Sharma' },
  'delay|late|waiting|overdue': { type: 'Delivery Delay', severity: 'High', owner: 'Priya Sharma' },
  'defect|fault|flaw|quality': { type: 'Manufacturing Defect', severity: 'Medium', owner: 'Rahul Gupta' },
  'peel|coat|surface|wear': { type: 'Quality Issue', severity: 'High', owner: 'Priya Sharma' },
  'install|fit|size': { type: 'Installation Issue', severity: 'Medium', owner: 'Rahul Gupta' },
};

const CITIES = ['Pune', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Bangalore', 'Kochi', 'Ahmedabad', 'Kolkata', 'Jaipur'];

function extractCity(text: string): string {
  const lower = text.toLowerCase();
  for (const city of CITIES) {
    if (lower.includes(city.toLowerCase())) return city;
  }
  return 'Not specified';
}

function extractName(text: string): string {
  const patterns = [
    /(?:customer|client|mr\.|mrs\.|ms\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:says|reports|called|complained)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return '';
}

export function extractTicketData(userMessage: string): ExtractedTicketData {
  const lower = userMessage.toLowerCase();

  let type = 'General Complaint';
  let severity: Severity = 'Medium';
  let owner = 'Priya Sharma';

  for (const [pattern, data] of Object.entries(COMPLAINT_PATTERNS)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lower)) {
      type = data.type;
      severity = data.severity;
      owner = data.owner;
      break;
    }
  }

  const city = extractCity(userMessage);
  const name = extractName(userMessage);

  const escalation_risk = severity === 'Critical' ? 'High — needs immediate attention' :
    severity === 'High' ? 'Moderate — keep an eye on this' : 'Low — routine handling';

  return {
    customer_name: name || 'Customer',
    company: '',
    city,
    product: '',
    complaint_verbatim: userMessage,
    complaint_summary: generateSummary(userMessage, type),
    complaint_type: type,
    severity,
    suggested_owner: owner,
    escalation_risk,
    segment: '',
  };
}

function generateSummary(verbatim: string, type: string): string {
  const shortened = verbatim.length > 100 ? verbatim.substring(0, 100) + '...' : verbatim;
  return `[${type}] ${shortened}`;
}

export function generateAIResponse(userMessage: string, tickets: Ticket[], userRole: UserRole): string {
  const lower = userMessage.toLowerCase();

  const matchedTicket = tickets.find(
  (t) =>
    lower.includes(t.id.toLowerCase()) ||
    lower.includes(t.customer_name.toLowerCase()) ||
    lower.includes(t.company.toLowerCase())
);

if (
  matchedTicket &&
  (
    lower.includes('show') ||
    lower.includes('status') ||
    lower.includes('update') ||
    lower.includes('what')
  )
) {

  const overdue =
    new Date(matchedTicket.sla_deadline) < new Date();

  return (
    `📋 **Ticket Overview**\n\n` +
    `🆔 ${matchedTicket.id}\n` +
    `👤 Customer: ${matchedTicket.customer_name}\n` +
    `🏢 Company: ${matchedTicket.company}\n` +
    `📍 Location: ${matchedTicket.city}\n` +
    `⚠️ Severity: ${matchedTicket.severity}\n` +
    `📌 Status: ${matchedTicket.status}\n` +
    `👨‍💼 Assigned Lead: ${matchedTicket.owner}\n` +
    `📝 Issue: ${matchedTicket.complaint_summary}\n\n` +
    (
      overdue
        ? `⏰ This ticket is overdue and needs attention.\n\n`
        : `✅ Response timeline is currently healthy.\n\n`
    ) +
    `Would you like me to summarize risks, timeline activity, or customer impact?`
  );
}

  // Complaint creation
  if (lower.includes('customer') && (lower.includes('says') || lower.includes('complaint') || lower.includes('report') || lower.includes('issue'))) {
    const data = extractTicketData(userMessage);
    return `Got it — I've analyzed the complaint and pulled out the key details:\n\n` +
      `📋 **Type:** ${data.complaint_type}\n` +
      `🔴 **Severity:** ${data.severity}\n` +
      `👤 **Customer:** ${data.customer_name}\n` +
      `📍 **Location:** ${data.city}\n` +
      `⚡ **Priority Risk:** ${data.escalation_risk}\n` +
      `👨‍💼 **Suggested Lead:** ${data.suggested_owner}\n\n` +
      `**Summary:** ${data.complaint_summary}\n\n` +
      `Want me to create a ticket from this? I'll assign it and start tracking automatically.`;
  }

  // Status / overview
  if (lower.includes('status') || lower.includes('update') || lower.includes('how') || lower.includes('overview') || lower.includes('what\'s going on')) {
    const active = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');
    const criticals = active.filter(t => t.severity === 'Critical');
    const delayed = active.filter(t => new Date(t.sla_deadline) < new Date());

    if (userRole === 'Sales') {
      return `Here's what's happening with your customers right now:\n\n` +
        `📊 **${active.length} active tickets** across all accounts\n` +
        (criticals.length > 0 ? `🔴 **${criticals.length} need immediate attention:**\n` +
        criticals.map(t => `  • **${t.id}** — ${t.customer_name} at ${t.company} — ${t.complaint_type}`).join('\n') + '\n\n' : '') +
        (delayed.length > 0 ? `⏰ **${delayed.length} running behind schedule** — customers may need a heads-up` : '✅ All tickets on track — no customer follow-ups needed right now');
    }
    if (userRole === 'AssignedLead') {
      const myTickets = active.filter(t => t.owner === 'Priya Sharma');
      return `Here's your current workload:\n\n` +
        `📋 **${myTickets.length} tickets assigned to you**\n` +
        myTickets.map(t => `  • **${t.id}** — ${t.severity} — ${t.complaint_type} — ${t.status}`).join('\n') +
        `\n\n💡 **My recommendation:** ` +
        (criticals.length > 0 ? `Focus on ${criticals[0].id} first — it needs immediate attention and the customer is a key account.` :
        `You're in good shape. Keep moving tickets through the pipeline.`);
    }
    if (userRole === 'BusinessHead') {
      return `Team performance snapshot:\n\n` +
        `📊 **${active.length} active** across the team\n` +
        `🔴 ${criticals.length} need immediate attention\n` +
        `⏰ ${delayed.length} running behind schedule\n\n` +
        `**Bottleneck alert:** Priya Sharma has ${active.filter(t => t.owner === 'Priya Sharma').length} active tickets. Consider redistributing workload.\n\n` +
        `**Top issue type:** ${Object.entries(tickets.reduce<Record<string, number>>((a, t) => { a[t.complaint_type] = (a[t.complaint_type] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`;
    }
    // Admin
    return `Here's the full picture:\n\n` +
      `📊 **${active.length} active tickets** | ${criticals.length} need immediate attention | ${delayed.length} urgent delays\n\n` +
      (criticals.length > 0 ? `🔴 **Immediate attention required:**\n` +
      criticals.map(t => `  • **${t.id}** — ${t.customer_name} (${t.company}) — ${t.status}`).join('\n') +
      `\n\n` : '') +
      `**Operational health:** ${delayed.length === 0 ? 'Good — all tickets within response windows' : `${delayed.length} tickets overdue — consider a team sync`}\n` +
      `**Key accounts at risk:** ${active.filter(t => t.key_account).length}`;
  }

  // SLA / delays / overdue
  if (lower.includes('sla') || lower.includes('delay') || lower.includes('overdue') || lower.includes('behind') || lower.includes('urgent')) {
    const delayed = tickets.filter(t => new Date(t.sla_deadline) < new Date() && t.status !== 'Closed' && t.status !== 'Resolved');
    if (delayed.length > 0) {
      return `⏰ **${delayed.length} tickets are running behind schedule:**\n\n` +
        delayed.map(t => {
          const hours = Math.abs(Math.round((new Date().getTime() - new Date(t.sla_deadline).getTime()) / 3600000));
          return `• **${t.id}** — ${t.customer_name} — overdue by ${hours}h — ${t.severity}`;
        }).join('\n') +
        `\n\n**What I'd suggest:**\n` +
        `1. Prioritize **${delayed[0].id}** — it's been waiting the longest\n` +
        `2. Send a quick update to ${delayed.filter(t => t.key_account).length > 0 ? 'key account customers' : 'affected customers'}\n` +
        `3. Check if any blockers need to be escalated`;
    }
    return `✅ Everything's on schedule. No urgent delays right now — all tickets are within their response windows.`;
  }

  // Escalation / priority alerts
  if (lower.includes('escalat') || lower.includes('priority') || lower.includes('alert')) {
    const alerted = tickets.filter(t => t.escalation_level !== 'None' && t.status !== 'Closed' && t.status !== 'Resolved');
    return `📢 **Priority Alert Summary:**\n\n` +
      (alerted.length > 0
        ? alerted.map(t => `• **${t.id}** — ${t.escalation_level} — ${t.customer_name} — ${t.severity}`).join('\n') +
          `\n\n${alerted.length} active alerts. ${alerted.filter(t => t.escalation_level === 'Level 2' || t.escalation_level === 'Level 3').length > 0 ? 'Some require senior attention.' : 'All currently manageable.'}`
        : 'No active priority alerts — everything is flowing normally.') ;
  }

  // Insights / trends
  if (lower.includes('insight') || lower.includes('trend') || lower.includes('pattern') || lower.includes('analytic') || lower.includes('report')) {
    const types: Record<string, number> = {};
    const cities: Record<string, number> = {};
    tickets.forEach(t => {
      types[t.complaint_type] = (types[t.complaint_type] || 0) + 1;
      cities[t.city] = (cities[t.city] || 0) + 1;
    });
    const topType = Object.entries(types).sort((a, b) => b[1] - a[1])[0];
    const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0];
    const avgSat = tickets.filter(t => t.customer_satisfaction > 0);
    const satScore = avgSat.length > 0 ? (avgSat.reduce((s, t) => s + t.customer_satisfaction, 0) / avgSat.length).toFixed(1) : 'N/A';

    return `📊 **Here's what the data is telling me:**\n\n` +
      `**Most common issue:** ${topType[0]} (${topType[1]} cases)\n` +
      `**Hotspot region:** ${topCity[0]} (${topCity[1]} cases)\n` +
      `**Key accounts affected:** ${tickets.filter(t => t.key_account && t.status !== 'Closed' && t.status !== 'Resolved').length} active\n` +
      `**Customer satisfaction:** ${satScore}/5 average\n\n` +
      `**What I'd recommend:**\n` +
      `1. The recurring damage pattern suggests a packaging process issue — worth a logistics review\n` +
      `2. Pune-Delhi corridor needs attention — it's generating most complaints\n` +
      `3. Key accounts with repeat issues should get proactive outreach\n` +
      `4. Consider a quality review with the production team`;
  }

  // Help
  if (lower.includes('help') || lower.includes('what can') || lower.includes('how do')) {
    return `Hey! I'm Nexus — your AI operations assistant. Here's how I can help:\n\n` +
      `**🗣 Just describe a situation:**\n` +
      `"Customer from Pune says tiles cracked during unloading" — I'll turn it into a ticket\n\n` +
      `**📊 Ask me anything about operations:**\n` +
      `• "What's the current status?" — I'll give you a personalized overview\n` +
      `• "Any urgent delays?" — I'll check response times\n` +
      `• "Show me trends" — I'll analyze patterns\n` +
      `• "Who's overloaded?" — I'll check team workload\n\n` +
      `**💡 I also proactively watch for:**\n` +
      `Response time risks, recurring patterns, workload imbalances, and key account issues.\n\n` +
      `Just talk to me naturally — no forms needed.`;
  }

  // Workload
  if (lower.includes('workload') || lower.includes('who') || lower.includes('team') || lower.includes('assign')) {
    const active = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');
    const owners = Array.from(new Set(active.map(t => t.owner)));
    return `**Team workload right now:**\n\n` +
      owners.map(o => {
        const count = active.filter(t => t.owner === o).length;
        const critical = active.filter(t => t.owner === o && t.severity === 'Critical').length;
        const bar = '█'.repeat(count) + '░'.repeat(Math.max(0, 6 - count));
        return `${o}: ${bar} ${count} tickets${critical > 0 ? ` (${critical} immediate)` : ''}`;
      }).join('\n') +
      `\n\n💡 ${owners.some(o => active.filter(t => t.owner === o).length > 3) ? 'Some team members look overloaded — consider redistribution.' : 'Workload looks balanced.'}`;
  }

  // Default conversational response
  return `I'm not sure I fully caught that, but I'm here to help. You can:\n\n` +
    `• **Describe a complaint** — I'll create a ticket from it\n` +
    `• **Ask "what's going on?"** — I'll give you a status overview\n` +
    `• **Say "any urgent delays?"** — I'll check response times\n` +
    `• **Ask for "trends"** — I'll analyze complaint patterns\n\n` +
    `Or just tell me what you need — I'll figure it out.`;
}

export function generateTicketFromAI(userMessage: string): Partial<Ticket> {
  const data = extractTicketData(userMessage);
  const now = new Date();
  const sla = new Date(now.getTime() + 48 * 3600000);

  return {
    id: `TKT-${String(Math.floor(Math.random() * 900) + 100)}`,
    customer_name: data.customer_name,
    company: data.company || 'Not specified',
    city: data.city,
    segment: data.segment || 'Not specified',
    product: data.product || 'Not specified',
    order_reference: '',
    complaint_verbatim: data.complaint_verbatim,
    complaint_summary: data.complaint_summary,
    complaint_type: data.complaint_type,
    severity: data.severity,
    desired_outcome: '',
    key_account: false,
    owner: data.suggested_owner,
    raised_by: '',
    root_cause: '',
    preventive_action: '',
    customer_satisfaction: 0,
    status: 'Open' as const,
    escalation_level: 'None' as const,
    sla_deadline: sla.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    comments: [],
    activity: [{
      id: generateId(),
      ticketId: '',
      type: 'creation' as const,
      description: 'Created via AI conversation',
      author: 'Nexus AI',
      timestamp: now.toISOString(),
    }],
    attachments: [],
  };
}
