import { useState, useEffect, useCallback } from 'react';
import { useStore, generateId, COMPLAINT_CATEGORIES, PRODUCT_CATEGORIES, DEPARTMENTS, CUSTOMER_TYPES, type Ticket, type Severity } from '../store';
import { TextInput,
  TextArea,
  Select,
  SearchableSelect,
  Toggle,
  FileUpload,
  SeveritySelect,
  Rating,
  DateInput,
    INDIAN_STATES
} from './FormFields';
import { X, Sparkles, User, Package, FileText, Settings, Brain, CheckCircle, ChevronRight, ChevronLeft, Save, Loader2 } from 'lucide-react';

type Step = 'customer' | 'product' | 'complaint' | 'operations' | 'ai' | 'resolution';

const STEPS: { key: Step; label: string; icon: typeof User }[] = [
  { key: 'customer', label: 'Customer', icon: User },
  { key: 'product', label: 'Product', icon: Package },
  { key: 'complaint', label: 'Complaint', icon: FileText },
  { key: 'operations', label: 'Operations', icon: Settings },
  { key: 'ai', label: 'AI Assist', icon: Brain },
  { key: 'resolution', label: 'Review', icon: CheckCircle },
];


export default function TicketCreateModal() {
  const { isCreateModalOpen, closeCreateModal, addTicket, currentUser, teamMembers, addToast, operationalRules, aiSettings, saveDraft, deleteDraft } = useStore();
  const [step, setStep] = useState<Step>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draftId] = useState(() => generateId());

  // Form state
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    company: '',
    city: '',
    state: '',
    customer_type: '',
    key_account: false,
    product: '',
    product_category: '',
    batch_number: '',
    order_reference: '',
    delivery_date: '',
    quantity_affected: '',
    complaint_type: '',
    severity: '' as Severity | '',
    business_impact: '',
    complaint_verbatim: '',
    desired_outcome: '',
    attachments: [] as string[],
    owner: '',
    department: '',
    sla_hours: operationalRules.defaultResponseTime,
    escalation_level: 'None' as const,
    root_cause: '',
    preventive_action: '',
    internal_notes: '',
    status: 'Open' as const,
    customer_satisfaction: 0,
    resolution_notes: '',
  });

  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState({
    severity: '' as Severity | '',
    department: '',
    summary: '',
    recommendations: [] as string[],
    analyzed: false,
  });

  const updateForm = useCallback((updates: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (isCreateModalOpen && form.customer_name) {
      const timer = setTimeout(() => {
        const draftData = { ...form, severity: form.severity || undefined } as Partial<Ticket>;
        saveDraft({ id: draftId, data: draftData, lastModified: new Date().toISOString() });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [form, isCreateModalOpen, draftId, saveDraft]);

  // AI Analysis
  const runAIAnalysis = useCallback(() => {
    if (!form.complaint_verbatim || !aiSettings.autoSummarize) return;
    
    setIsAnalyzing(true);
    setTimeout(() => {
      const lower = form.complaint_verbatim.toLowerCase();
      
      let suggestedSeverity: Severity = 'Medium';
      if (lower.includes('crack') || lower.includes('wrong') || lower.includes('stalled') || lower.includes('immediate')) {
        suggestedSeverity = 'Critical';
      } else if (lower.includes('delay') || lower.includes('mismatch') || lower.includes('peel') || lower.includes('quality')) {
        suggestedSeverity = 'High';
      } else if (lower.includes('defect') || lower.includes('minor')) {
        suggestedSeverity = 'Medium';
      }

      let suggestedDept = 'Operations';
      if (lower.includes('quality') || lower.includes('defect') || lower.includes('crack') || lower.includes('color')) {
        suggestedDept = 'Quality Control';
      } else if (lower.includes('delay') || lower.includes('wrong') || lower.includes('delivery')) {
        suggestedDept = 'Logistics';
      }

      const summary = `${form.complaint_type || 'Issue'} reported by ${form.customer_name || 'customer'} from ${form.company || 'company'} regarding ${form.product || 'product'}. ${form.business_impact ? `Business impact: ${form.business_impact}.` : ''}`;

      const recommendations = [
        form.key_account ? 'High-priority handling recommended for key account' : null,
        suggestedSeverity === 'Critical' ? 'Immediate response required — consider same-day callback' : null,
        lower.includes('second time') || lower.includes('again') ? 'Recurring issue detected — root cause analysis needed' : null,
        'Document all communications for audit trail',
        form.business_impact?.includes('project') ? 'Consider expedited replacement process' : null,
      ].filter(Boolean) as string[];

      setAiSuggestions({
        severity: suggestedSeverity,
        department: suggestedDept,
        summary,
        recommendations: recommendations.slice(0, 4),
        analyzed: true,
      });

      if (aiSettings.autoSuggestSeverity && !form.severity) {
        updateForm({ severity: suggestedSeverity });
      }
      if (aiSettings.autoSuggestDepartment && !form.department) {
        updateForm({ department: suggestedDept });
      }

      setIsAnalyzing(false);
    }, 1200);
  }, [form, aiSettings, updateForm]);

  // Validate step
  const isStepValid = (s: Step): boolean => {
    switch (s) {
      case 'customer': return !!(form.customer_name && form.company && form.city);
      case 'product': return !!(form.product && form.product_category);
      case 'complaint': return !!(form.complaint_type && form.severity && form.complaint_verbatim);
      case 'operations': return !!(form.owner && form.department);
      case 'ai': return true;
      case 'resolution': return true;
      default: return false;
    }
  };

  const stepIndex = STEPS.findIndex(s => s.key === step);
  const canGoNext = isStepValid(step);
  const canGoPrev = stepIndex > 0;

  const goNext = () => {
    if (step === 'complaint' && !aiSuggestions.analyzed) {
      runAIAnalysis();
    }
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1].key);
    }
  };

  const goPrev = () => {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1].key);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const slaDeadline = new Date(Date.now() + form.sla_hours * 3600000).toISOString();
      const ticket: Ticket = {
        id: `TKT-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email,
        company: form.company,
        city: form.city,
        state: form.state,
        customer_type: form.customer_type,
        key_account: form.key_account,
        product: form.product,
        product_category: form.product_category,
        batch_number: form.batch_number,
        order_reference: form.order_reference,
        delivery_date: form.delivery_date,
        quantity_affected: form.quantity_affected,
        complaint_type: form.complaint_type,
        severity: form.severity as Severity,
        business_impact: form.business_impact,
        complaint_verbatim: form.complaint_verbatim,
        complaint_summary: aiSuggestions.summary || form.complaint_verbatim.slice(0, 150),
        desired_outcome: form.desired_outcome,
        attachments: form.attachments,
        owner: form.owner,
        department: form.department,
        sla_deadline: slaDeadline,
        escalation_level: form.escalation_level,
        root_cause: form.root_cause,
        preventive_action: form.preventive_action,
        internal_notes: form.internal_notes,
        raised_by: currentUser?.name || '',
        status: form.status,
        customer_satisfaction: form.customer_satisfaction,
        resolution_notes: form.resolution_notes,
        segment: form.customer_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comments: [],
        activity: [{
          id: generateId(),
          ticketId: '',
          type: 'creation',
          description: 'Ticket created via intake workflow',
          author: currentUser?.name || 'System',
          timestamp: new Date().toISOString(),
        }],
        ai_suggested_severity: aiSuggestions.severity || undefined,
        ai_suggested_department: aiSuggestions.department || undefined,
        ai_summary: aiSuggestions.summary || undefined,
        ai_recommendations: aiSuggestions.recommendations,
      };

      addTicket(ticket);
      deleteDraft(draftId);
      addToast({ type: 'success', title: `Ticket ${ticket.id} created`, description: `Assigned to ${ticket.owner}` });
      setIsSubmitting(false);
      closeCreateModal();
      resetForm();
    }, 800);
  };

  const handleSaveDraft = () => {
    const draftData = { ...form, severity: form.severity || undefined } as Partial<Ticket>;
    saveDraft({ id: draftId, data: draftData, lastModified: new Date().toISOString() });
    addToast({ type: 'info', title: 'Draft saved', description: 'You can continue later' });
    closeCreateModal();
    resetForm();
  };

  const resetForm = () => {
    setForm({
      customer_name: '', customer_phone: '', customer_email: '', company: '', city: '', state: '',
      customer_type: '', key_account: false, product: '', product_category: '', batch_number: '',
      order_reference: '', delivery_date: '', quantity_affected: '', complaint_type: '', severity: '',
      business_impact: '', complaint_verbatim: '', desired_outcome: '', attachments: [], owner: '',
      department: '', sla_hours: operationalRules.defaultResponseTime, escalation_level: 'None',
      root_cause: '', preventive_action: '', internal_notes: '', status: 'Open', customer_satisfaction: 0,
      resolution_notes: '',
    });
    setAiSuggestions({ severity: '', department: '', summary: '', recommendations: [], analyzed: false });
    setStep('customer');
  };

  if (!isCreateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCreateModal} />
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-slide-up" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-secondary)' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>New Complaint Ticket</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Complete the intake workflow to create a ticket</p>
          </div>
          <button onClick={closeCreateModal} className="p-2 rounded-lg transition hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 border-b flex items-center gap-1 overflow-x-auto shrink-0" style={{ borderColor: 'var(--border-secondary)' }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.key === step;
            const isPast = i < stepIndex;
            return (
              <button key={s.key} onClick={() => (isPast || isStepValid(STEPS[i - 1]?.key)) && setStep(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition whitespace-nowrap ${isActive ? 'bg-brand-500/15 text-brand-400' : isPast ? 'text-emerald-400' : ''}`}
                style={!isActive && !isPast ? { color: 'var(--text-muted)' } : {}}>
                {isPast ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'customer' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Customer Name" value={form.customer_name} onChange={(v: string) => updateForm({ customer_name: v })} placeholder="Full name" required />
                <TextInput label="Phone Number" value={form.customer_phone} onChange={(v: string) => updateForm({ customer_phone: v })} placeholder="+91 98765 43210" type="tel" />
                <TextInput label="Email" value={form.customer_email} onChange={(v: string) => updateForm({ customer_email: v })} placeholder="customer@company.com" type="email" />
                <TextInput label="Company Name" value={form.company} onChange={(v: string) => updateForm({ company: v })} placeholder="Company Ltd" required />
                <TextInput label="City" value={form.city} onChange={(v: string) => updateForm({ city: v })} placeholder="Mumbai" required />
                <SearchableSelect
  label="State / Union Territory"
  value={form.state}
  onChange={(v: string) => updateForm({ state: v })}
  options={INDIAN_STATES.map((s: string) => ({
    value: s,
    label: s,
  }))}
  placeholder="Type or select State / UT"
/>
                <Select label="Customer Type" value={form.customer_type} onChange={(v: string) => updateForm({ customer_type: v })} options={CUSTOMER_TYPES.map((t: string) => ({ value: t, label: t }))} placeholder="Select type" />
                <div className="flex items-end pb-1">
                  <Toggle label="Important Customer" description="Priority handling for key accounts" checked={form.key_account} onChange={(v: boolean) => updateForm({ key_account: v })} />
                </div>
              </div>
            </div>
          )}

          {step === 'product' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Product Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Product Name" value={form.product} onChange={(v: string) => updateForm({ product: v })} placeholder="Premium Floor Tiles 60x60" required />
                <Select label="Product Category" value={form.product_category} onChange={(v: string) => updateForm({ product_category: v })} options={PRODUCT_CATEGORIES.map((c: string) => ({ value: c, label: c }))} placeholder="Select category" required />
                <TextInput label="Batch Number" value={form.batch_number} onChange={(v: string) => updateForm({ batch_number: v })} placeholder="BT-2024-XXXX" />
                <TextInput label="Order Reference" value={form.order_reference} onChange={(v: string) => updateForm({ order_reference: v })} placeholder="ORD-2024-XXXX" />
                <DateInput label="Delivery Date" value={form.delivery_date} onChange={(v: string) => updateForm({ delivery_date: v })} />
                <TextInput label="Quantity Affected" value={form.quantity_affected} onChange={(v: string) => updateForm({ quantity_affected: v })} placeholder="50 boxes" />
              </div>
            </div>
          )}

          {step === 'complaint' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Complaint Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Complaint Category" value={form.complaint_type} onChange={(v: string) => updateForm({ complaint_type: v })} options={COMPLAINT_CATEGORIES.map((c: string) => ({ value: c, label: c }))} placeholder="Select category" required />
                <div>
                  <SeveritySelect value={form.severity} onChange={(v: Severity) => updateForm({ severity: v })} aiSuggested={aiSuggestions.severity || undefined} />
                </div>
              </div>
              <TextArea label="Business Impact" value={form.business_impact} onChange={(v: string) => updateForm({ business_impact: v })} placeholder="How is this affecting the customer's business?" rows={2} />
              <TextArea label="Complaint Description" value={form.complaint_verbatim} onChange={(v: string) => updateForm({ complaint_verbatim: v })} placeholder="Describe the complaint in detail as reported by the customer..." rows={4} required />
              <TextArea label="Desired Resolution" value={form.desired_outcome} onChange={(v: string) => updateForm({ desired_outcome: v })} placeholder="What outcome does the customer expect?" rows={2} />
              <FileUpload label="Photos / Documents" files={form.attachments} onChange={(v: string[]) => updateForm({ attachments: v })} />
            </div>
          )}

          {step === 'operations' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Internal Operations</h3>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Assign Team Lead" value={form.owner} onChange={(v: string) => updateForm({ owner: v })} options={teamMembers.map((m: any) => ({ value: m.name, label: `${m.name} (${m.department})` }))} placeholder="Select lead" required />
                <Select label="Department" value={form.department} onChange={(v: string) => updateForm({ department: v })} options={DEPARTMENTS.map((d: string) => ({ value: d, label: d }))} placeholder="Select department" required />
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Response Deadline</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={form.sla_hours} onChange={(e) => updateForm({ sla_hours: Number(e.target.value) })} className="w-20 px-3 py-2 rounded-lg text-[13px] border outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                    <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>hours</span>
                  </div>
                </div>
                <Select label="Priority Handling" value={form.escalation_level} onChange={(v: string) => updateForm({ escalation_level: v as any })} options={[{ value: 'None', label: 'Standard' }, { value: 'Level 1', label: 'Priority Level 1' }, { value: 'Level 2', label: 'Priority Level 2' }, { value: 'Level 3', label: 'Priority Level 3 (Urgent)' }]} />
              </div>
              <TextArea label="Main Reason (if known)" value={form.root_cause} onChange={(v: string) => updateForm({ root_cause: v })} placeholder="Initial assessment of what caused this issue..." rows={2} />
              <TextArea label="Prevention Action" value={form.preventive_action} onChange={(v: string) => updateForm({ preventive_action: v })} placeholder="Steps to prevent this from happening again..." rows={2} />
              <TextArea label="Internal Notes" value={form.internal_notes} onChange={(v: string) => updateForm({ internal_notes: v })} placeholder="Any internal context or notes (not visible to customer)..." rows={2} />
            </div>
          )}

          {step === 'ai' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Assistance</h3>
                {!aiSuggestions.analyzed && (
                  <button onClick={runAIAnalysis} disabled={isAnalyzing || !form.complaint_verbatim}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition disabled:opacity-50"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                    {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Complaint'}
                  </button>
                )}
              </div>

              {isAnalyzing && (
                <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <Loader2 className="w-8 h-8 mx-auto mb-3 text-brand-400 animate-spin" />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analyzing complaint...</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Extracting patterns and generating recommendations</p>
                </div>
              )}

              {aiSuggestions.analyzed && !isAnalyzing && (
                <div className="space-y-4">
                  <div className="rounded-xl border p-4" style={{ background: 'rgba(99,102,241,0.03)', borderColor: 'rgba(99,102,241,0.15)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-brand-400" />
                      <span className="text-xs font-semibold text-brand-400">AI Analysis Complete</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="rounded-lg border p-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                        <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Suggested Severity</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{aiSuggestions.severity}</p>
                      </div>
                      <div className="rounded-lg border p-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                        <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Suggested Department</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{aiSuggestions.department}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border p-3 mb-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                      <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>AI Summary</p>
                      <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{aiSuggestions.summary}</p>
                    </div>
                    {aiSuggestions.recommendations.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Recommended Next Steps</p>
                        <div className="space-y-1.5">
                          {aiSuggestions.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!aiSuggestions.analyzed && !isAnalyzing && (
                <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <Brain className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI analysis not yet run</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Click "Analyze Complaint" to get AI suggestions</p>
                </div>
              )}
            </div>
          )}

          {step === 'resolution' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Review & Create</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Customer</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{form.customer_name}</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{form.company} • {form.city}</p>
                  {form.key_account && <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-medium">Important Customer</span>}
                </div>
                <div className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Product</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{form.product}</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{form.product_category} {form.quantity_affected && `• ${form.quantity_affected}`}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Complaint</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{form.complaint_type}</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Severity: {form.severity}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Assignment</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{form.owner}</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{form.department} • {form.sla_hours}h deadline</p>
                </div>
              </div>
              <div className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Description</p>
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{form.complaint_verbatim}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Initial Status" value={form.status} onChange={(v: string) => updateForm({ status: v as any })} options={[{ value: 'Open', label: 'Open' }, { value: 'In Progress', label: 'In Progress' }]} />
                <Rating label="Initial Customer Satisfaction" value={form.customer_satisfaction} onChange={(v: number) => updateForm({ customer_satisfaction: v })} />
              </div>
              <TextArea label="Resolution Notes (if any)" value={form.resolution_notes} onChange={(v: string) => updateForm({ resolution_notes: v })} placeholder="Initial resolution notes..." rows={2} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t shrink-0" style={{ borderColor: 'var(--border-secondary)' }}>
          <button onClick={handleSaveDraft} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition hover:opacity-80" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <div className="flex items-center gap-2">
            {canGoPrev && (
              <button onClick={goPrev} className="flex items-center gap-1 px-4 py-2 rounded-lg text-[12px] font-medium transition hover:opacity-80" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
            )}
            {step !== 'resolution' ? (
              <button onClick={goNext} disabled={!canGoNext}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-[12px] font-medium transition disabled:opacity-50 bg-brand-500 text-white hover:bg-brand-600">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold transition disabled:opacity-50 bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {isSubmitting ? 'Creating...' : 'Create Ticket'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
