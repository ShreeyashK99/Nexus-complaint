import { create } from 'zustand';


export const COMPLAINT_CATEGORIES = [
  'Product Damage',
  'Wrong Product',
  'Delivery Delay',
  'Quality Issue',
  'Manufacturing Defect',
  'Installation Issue',
  'Color Mismatch',
]

export const PRODUCT_CATEGORIES = [
   'Wall Panel',
  'Breeze Blocks',
  'Terraline',
  'Contexture',
]

export const DEPARTMENTS = [
  'Operations',
  'Quality Control',
  'Logistics',
  'Customer Support',
  'Production',
]

export const CUSTOMER_TYPES = [
  'Retail',
  'Dealer',
  'Distributor',
  'Builder',
  'Architect',
  'Contractor',
]

// Types
export type UserRole = 'Sales' | 'AssignedLead' | 'BusinessHead' | 'Admin';

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: 'Workspace Admin',
  AssignedLead: 'Assigned Lead',
  BusinessHead: 'Business Head',
  Sales: 'Sales',
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
}

export type TicketStatus = 'Open' | 'Alignment Call Done' | 'In Progress' | 'Awaiting Customer' | 'Resolved' | 'Closed';
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type EscalationLevel = 'None' | 'Level 1' | 'Level 2' | 'Level 3';

export interface Comment {
  id: string;
  ticketId: string;
  author: string;
  content: string;
  timestamp: string;
  isInternal: boolean;
}

export interface ActivityEntry {
  id: string;
  ticketId: string;
  type: 'status_change' | 'comment' | 'assignment' | 'escalation' | 'creation' | 'severity_change' | 'attachment';
  description: string;
  author: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface Ticket {
  id: string;
  customer_name: string;
  company: string;
  city: string;
  segment: string;
  product: string;
  order_reference: string;
  complaint_verbatim: string;
  complaint_summary: string;
  complaint_type: string;
  severity: Severity;
  desired_outcome: string;
  key_account: boolean;
  owner: string;
  raised_by: string;
  root_cause: string;
  preventive_action: string;
  customer_satisfaction: number;
  status: TicketStatus;
  escalation_level: EscalationLevel;
  sla_deadline: string;
  created_at: string;
  updated_at: string;
  comments: Comment[];
  activity: ActivityEntry[];
  attachments: string[];
  customer_phone?: string;
customer_email?: string;
state?: string;
customer_type?: string;

product_category?: string;
batch_number?: string;
delivery_date?: string;
quantity_affected?: string;

business_impact?: string;

department?: string;

internal_notes?: string;

resolution_notes?: string;

ai_suggested_severity?: Severity;
ai_suggested_department?: string;
ai_summary?: string;
ai_recommendations?: string[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: AIAction[];
  ticketData?: Partial<Ticket>;
}

export interface AIAction {
  label: string;
  type: 'create_ticket' | 'assign' | 'escalate' | 'view_ticket' | 'navigate';
  data?: Record<string, unknown>;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'suggestion' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  relatedTicketId?: string;
}

export type ThemeMode = 'dark' | 'light';
export type ViewType = 'workspace' | 'tickets' | 'ticket-detail' | 'dashboard' | 'escalations' | 'settings';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
 
  isCreateModalOpen: boolean;
openCreateModal: () => void;
closeCreateModal: () => void;

teamMembers: User[];

operationalRules: {
  defaultResponseTime: number;
};

aiSettings: {
  autoSummarize: boolean;
  autoSuggestSeverity: boolean;
  autoSuggestDepartment: boolean;
};

saveDraft: (draft: any) => void;
deleteDraft: (id: string) => void;
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;

  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;

  // Tickets
   // Tickets
  tickets: Ticket[];
  loadTickets: () => Promise<void>;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addComment: (ticketId: string, comment: Comment) => void;
  addActivity: (ticketId: string, activity: ActivityEntry) => void;

  // AI
  aiMessages: AIMessage[];
  addAIMessage: (msg: AIMessage) => void;
  clearAIMessages: () => void;
  aiInsights: AIInsight[];
  isAIPanelOpen: boolean;
  toggleAIPanel: () => void;
  setAIPanelOpen: (v: boolean) => void;
  isAITyping: boolean;
  setAITyping: (v: boolean) => void;

  // Sidebar
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (msg: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Live feed
  liveFeed: LiveFeedItem[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}

export interface LiveFeedItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'ai' | 'system' | 'user';
}

const USERS: Record<string, User> = {
  'admin@nexus.ai': { id: 'u1', name: 'Arjun Mehta', email: 'admin@nexus.ai', role: 'Admin', avatar: 'AM', department: 'Leadership' },
  'lead@nexus.ai': { id: 'u2', name: 'Priya Sharma', email: 'lead@nexus.ai', role: 'AssignedLead', avatar: 'PS', department: 'Operations' },
  'bh@nexus.ai': { id: 'u3', name: 'Rahul Gupta', email: 'bh@nexus.ai', role: 'BusinessHead', avatar: 'RG', department: 'Business' },
  'sales@nexus.ai': { id: 'u4', name: 'Neha Patel', email: 'sales@nexus.ai', role: 'Sales', avatar: 'NP', department: 'Sales' },
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}





export const useStore = create<AppState>((set, get) => ({
  // Auth
  isAuthenticated: false,
  currentUser: null,
  isCreateModalOpen: false,

openCreateModal: () =>
  set({ isCreateModalOpen: true }),

closeCreateModal: () =>
  set({ isCreateModalOpen: false }),

teamMembers: [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@nexus.ai',
    role: 'AssignedLead',
    avatar: 'PS',
    department: 'Operations',
  },
  {
    id: '2',
    name: 'Rahul Gupta',
    email: 'rahul@nexus.ai',
    role: 'BusinessHead',
    avatar: 'RG',
    department: 'Quality Control',
  },
],

operationalRules: {
  defaultResponseTime: 48,
},

aiSettings: {
  autoSummarize: true,
  autoSuggestSeverity: true,
  autoSuggestDepartment: true,
},

saveDraft: () => {},

deleteDraft: () => {},
  login: (email: string, _password: string) => {
    const user = USERS[email];
    if (user) {
      set({ isAuthenticated: true, currentUser: user });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false, currentUser: null, currentView: 'workspace' }),

  // Theme
  theme: 'dark',
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

  // Navigation
  currentView: 'workspace',
  setCurrentView: (view) => set({ currentView: view, selectedTicketId: view !== 'ticket-detail' ? null : get().selectedTicketId }),
  selectedTicketId: null,
  setSelectedTicketId: (id) => set({ selectedTicketId: id, currentView: id ? 'ticket-detail' : get().currentView }),

  // Tickets
   // Tickets
 tickets: [],

 loadTickets: async () => {
   const { fetchTickets } = await import('./services/tickets')

   const tickets = await fetchTickets()

   set({
     tickets: tickets as Ticket[],
   })
 },

 addTicket: (ticket) =>
   set((s) => ({
     tickets: [ticket, ...s.tickets],
   })),

 updateTicket: (id, updates) =>
   set((s) => ({
     tickets: s.tickets.map((t) =>
       t.id === id
         ? {
             ...t,
             ...updates,
             updated_at: new Date().toISOString(),
           }
         : t
     ),
   })),

 addComment: (ticketId, comment) =>
   set((s) => ({
     tickets: s.tickets.map((t) =>
       t.id === ticketId
         ? {
             ...t,
             comments: [...t.comments, comment],
             updated_at: new Date().toISOString(),
           }
         : t
     ),
   })),

 addActivity: (ticketId, activity) =>
   set((s) => ({
     tickets: s.tickets.map((t) =>
       t.id === ticketId
         ? {
             ...t,
             activity: [...t.activity, activity],
             updated_at: new Date().toISOString(),
           }
         : t
     ),
   })),

  // AI
  aiMessages: [],
  addAIMessage: (msg) => set((s) => ({ aiMessages: [...s.aiMessages, msg] })),
  clearAIMessages: () => set({ aiMessages: [] }),
  aiInsights: [],
  isAIPanelOpen: true,
  toggleAIPanel: () => set((s) => ({ isAIPanelOpen: !s.isAIPanelOpen })),
  setAIPanelOpen: (v) => set({ isAIPanelOpen: v }),
  isAITyping: false,
  setAITyping: (v) => set({ isAITyping: v }),

  // Sidebar
  isSidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),

  // Toasts
  toasts: [],
  addToast: (msg) => {
    const id = generateId();
    set((s) => ({ toasts: [...s.toasts, { ...msg, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Live feed
  liveFeed: [],
}));

export { generateId };
