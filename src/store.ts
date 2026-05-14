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

export const ROLE_PERMISSIONS = {
  Founder: {
    canViewAll: true,
    canManageTeam: true,
    canConfigureAI: true,
    canManageRules: true,
  },

  Owner: {
    canViewAll: true,
    canManageTeam: true,
    canConfigureAI: true,
    canManageRules: true,
  },

  Admin: {
    canViewAll: true,
    canManageTeam: true,
    canConfigureAI: true,
    canManageRules: true,
  },

  BusinessHead: {
    canViewAll: true,
    canManageTeam: true,
    canConfigureAI: false,
    canManageRules: false,
  },

  AssignedLead: {
    canViewAll: false,
    canManageTeam: false,
    canConfigureAI: false,
    canManageRules: false,
  },

  Sales: {
    canViewAll: false,
    canManageTeam: false,
    canConfigureAI: false,
    canManageRules: false,
  },
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  phone?: string;
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
  authView: 'login' | 'signup' | 'forgot-password';
setAuthView: (
  view: 'login' | 'signup' | 'forgot-password'
) => void;

signup: (
  name: string,
  email: string,
  password: string,
  role: UserRole
) => boolean;
 
  isCreateModalOpen: boolean;
openCreateModal: () => void;
closeCreateModal: () => void;

teamMembers: User[];

operationalRules: {
  defaultResponseTime: number;
  criticalResponseTime: number;
  highResponseTime: number;
  autoEscalate: boolean;
  escalateAfterHours: number;
};

updateOperationalRules: (
  rules: Partial<AppState['operationalRules']>
) => void;

aiSettings: {
  autoSummarize: boolean;
  autoSuggestSeverity: boolean;
  autoSuggestDepartment: boolean;
  autoRecommendations: boolean;
};

updateAISettings: (
  settings: Partial<AppState['aiSettings']>
) => void;


notificationSettings: {
  emailAlerts: boolean;
  criticalOnly: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
};

updateNotificationSettings: (
  settings: Partial<AppState['notificationSettings']>
) => void;

updateProfile: (
  profile: Partial<User>
) => void;


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
  isLoadingTickets: boolean;
  loadTickets: () => Promise<void>;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addComment: (ticketId: string, comment: Comment) => Promise<void>;
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

const savedUser =
  localStorage.getItem('nexus-user');

const parsedUser = savedUser
  ? JSON.parse(savedUser)
  : null;

const savedTheme =
  localStorage.getItem('nexus-theme') as ThemeMode | null;

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}





export const useStore = create<AppState>((set, get) => ({
  // Auth
  isAuthenticated: !!parsedUser,
currentUser: parsedUser,
authView: 'login',

setAuthView: (view) =>
  set({
    authView: view,
  }),
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
  criticalResponseTime: 4,
  highResponseTime: 12,
  autoEscalate: true,
  escalateAfterHours: 24,
},

aiSettings: {
  autoSummarize: true,
  autoSuggestSeverity: true,
  autoSuggestDepartment: true,
  autoRecommendations: true,
},

notificationSettings: {
  emailAlerts: true,
  criticalOnly: false,
  dailyDigest: true,
  weeklyReport: true,
},

updateNotificationSettings: (settings) =>
  set((s) => ({
    notificationSettings: {
      ...s.notificationSettings,
      ...settings,
    },
  })),

updateOperationalRules: (rules) =>
  set((s) => ({
    operationalRules: {
      ...s.operationalRules,
      ...rules,
    },
  })),

updateProfile: (profile) =>
  set((s) => ({
    currentUser: s.currentUser
      ? {
          ...s.currentUser,
          ...profile,
        }
      : null,
  })),



updateAISettings: (settings) =>
  set((s) => ({
    aiSettings: {
      ...s.aiSettings,
      ...settings,
    },
  })),

saveDraft: () => {},

deleteDraft: () => {},
login: (email: string, password: string) => {

  const accounts =
    JSON.parse(
      localStorage.getItem('nexus-accounts') || '[]'
    );

  const user =
    accounts.find(
      (u: any) =>
        u.email === email &&
        u.password === password
    );

  if (!user) {
    return false;
  }

  localStorage.setItem(
    'nexus-user',
    JSON.stringify(user)
  );

  set({
    isAuthenticated: true,
    currentUser: user,
    currentView: 'workspace',
  });

  return true;
},

signup: (name, email, password, role) => {

  const existingUsers =
    JSON.parse(
      localStorage.getItem('nexus-accounts') || '[]'
    );

  const alreadyExists =
    existingUsers.find(
      (u: any) => u.email === email
    );

  if (alreadyExists) {
    return false;
  }

  const newUser = {
    id: generateId(),
    name,
    email,
    password,
    role,
    avatar: name
      .split(' ')
      .map((n) => n[0])
      .join(''),
    department: role,
  };

  localStorage.setItem(
    'nexus-accounts',
    JSON.stringify([
      ...existingUsers,
      newUser,
    ])
  );

  localStorage.setItem(
    'nexus-user',
    JSON.stringify(newUser)
  );

  set({
    isAuthenticated: true,
    currentUser: newUser,
    currentView: 'workspace',
  });

  return true;
},

  logout: () => {

  localStorage.removeItem('nexus-user');

  set({
  isAuthenticated: false,
  currentUser: null,
  currentView: 'workspace',
  authView: 'login',
});
},

  // Theme
  theme: savedTheme || 'dark',
  toggleTheme: () =>
  set((s) => {

    const nextTheme =
      s.theme === 'dark'
        ? 'light'
        : 'dark';

    localStorage.setItem(
      'nexus-theme',
      nextTheme
    );

    return {
      theme: nextTheme
    };

  }),

  // Navigation
  currentView:
  (localStorage.getItem('currentView') as any) ||
  'workspace',
  setCurrentView: (view) => {
  localStorage.setItem('currentView', view);

  set({
    currentView: view,
  });
},
  selectedTicketId: null,
  setSelectedTicketId: (id) => set({ selectedTicketId: id, currentView: id ? 'ticket-detail' : get().currentView }),

  // Tickets
   // Tickets
 tickets: [],
 isLoadingTickets: false,

loadTickets: async () => {

  set({
    isLoadingTickets: true
  })

  try {

    const { fetchTickets } =
      await import('./services/tickets')

    const allTickets =
  await fetchTickets()

const currentUser =
  get().currentUser

const tickets =
  currentUser?.role === 'Admin'
    ? allTickets
    : allTickets.filter(
        (t: any) =>
          t.owner === currentUser?.name ||
          t.raised_by === currentUser?.name
      )

    set({
      tickets: tickets as Ticket[],
      isLoadingTickets: false
    })

  } catch (err) {

    console.error(err)

    set({
      isLoadingTickets: false
    })

  }
},

 addTicket: (ticket) =>
   set((s) => ({
     tickets: [ticket, ...s.tickets],
   })),

updateTicket: async (id, updates) => {

  try {

    const { supabase } = await import('./lib/supabase')

    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()

    

    console.log('UPDATE RESULT:', data)
    console.log('UPDATE ERROR:', error)

    if (error) {
      throw error
    }

    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === id
          ? {
              ...t,
              ...data[0],
            }
          : t
      ),
    }))
    await get().loadTickets()
    return data[0]

  } catch (err) {

    console.error('UPDATE FAILED:', err)

  }
},

addComment: async (ticketId, comment) => {

  const { supabase } = await import('./lib/supabase')

  const currentUser = get().currentUser

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        ticket_id: ticketId,
        author_id: currentUser?.id,
        message: comment.content,
        is_internal: comment.isInternal,
      },
    ])
    .select()

  console.log('COMMENT RESULT:', data)
  console.log('COMMENT ERROR:', error)

  if (error) {
    console.error(error)
    return
  }

  set((s) => ({
    tickets: s.tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            comments: [
              ...(t.comments || []),
              comment,
            ],
            updated_at: new Date().toISOString(),
          }
        : t
    ),
  }))
},

 addActivity: (ticketId, activity) =>
   set((s) => ({
     tickets: s.tickets.map((t) =>
       t.id === ticketId
         ? {
             ...t,
             activity: [...(t.activity || []), activity],
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
