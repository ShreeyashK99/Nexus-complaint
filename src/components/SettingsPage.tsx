import { useState } from 'react';
import { useStore, ROLE_LABELS, ROLE_PERMISSIONS } from '../store';
import { TextInput, Toggle } from './FormFields';
import { User, Shield, Bell, Zap, Key, Save, Clock, Brain } from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'ai' | 'rules' | 'security';

export default function SettingsPage() {
  const { currentUser, updateProfile, notificationSettings, updateNotificationSettings, aiSettings, updateAISettings, operationalRules, updateOperationalRules, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
  });

  const permissions = currentUser ? ROLE_PERMISSIONS[currentUser.role] : null;

  const tabs: { key: SettingsTab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'ai', label: 'AI Settings', icon: Brain },
    { key: 'rules', label: 'Response Rules', icon: Clock },
    { key: 'security', label: 'Security', icon: Shield },
  ];

  const handleSaveProfile = () => {
    updateProfile({ name: profileForm.name, phone: profileForm.phone, department: profileForm.department });
    addToast({ type: 'success', title: 'Profile updated' });
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-7 animate-fade-in">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Manage your account and workspace preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map(({ key, label, icon: Icon }) => {
                const isActive = activeTab === key;
                const isDisabled = (key === 'ai' && !permissions?.canConfigureAI) || (key === 'rules' && !permissions?.canManageRules);
                return (
                  <button key={key} onClick={() => !isDisabled && setActiveTab(key)} disabled={isDisabled}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition ${isActive ? 'bg-brand-500/10 text-brand-400' : ''} ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    style={!isActive && !isDisabled ? { color: 'var(--text-secondary)' } : {}}>
                    <Icon className="w-4 h-4" />
                    {label}
                    {isDisabled && <span className="ml-auto text-[9px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-400">Restricted</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                {/* Profile card */}
                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/25 to-purple-500/20 flex items-center justify-center text-xl font-bold text-brand-400">
                      {currentUser?.avatar}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{currentUser?.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                          {currentUser ? ROLE_LABELS[currentUser.role] : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <TextInput label="Full Name" value={profileForm.name} onChange={v => setProfileForm(p => ({ ...p, name: v }))} placeholder="Your name" />
                    <TextInput label="Email" value={profileForm.email} onChange={v => setProfileForm(p => ({ ...p, email: v }))} placeholder="Email" disabled />
                    <TextInput label="Phone" value={profileForm.phone} onChange={v => setProfileForm(p => ({ ...p, phone: v }))} placeholder="+91 98765 43210" />
                    <TextInput label="Department" value={profileForm.department} onChange={v => setProfileForm(p => ({ ...p, department: v }))} placeholder="Department" />
                  </div>

                  <div className="flex justify-end mt-6">
                    <button onClick={handleSaveProfile}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium bg-brand-500 text-white hover:bg-brand-600 transition">
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </div>

                {/* Role permissions */}
                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Your Permissions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'View all tickets', value: permissions?.canViewAll },
                      { label: 'Manage team', value: permissions?.canManageTeam },
                      { label: 'Configure AI', value: permissions?.canConfigureAI },
                      { label: 'Manage rules', value: permissions?.canManageRules },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-2 text-[12px]" style={{ color: value ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        <div className={`w-2 h-2 rounded-full ${value ? 'bg-emerald-400' : 'bg-red-400/50'}`} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fade-in">
                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Email Notifications</h4>
                  <div className="space-y-4">
                    <Toggle label="Email alerts" description="Receive email notifications for ticket updates" checked={notificationSettings.emailAlerts} onChange={v => updateNotificationSettings({ emailAlerts: v })} />
                    <Toggle label="Immediate attention only" description="Only notify for high-priority and urgent items" checked={notificationSettings.criticalOnly} onChange={v => updateNotificationSettings({ criticalOnly: v })} />
                    <Toggle label="Daily digest" description="Receive a daily summary of activity" checked={notificationSettings.dailyDigest} onChange={v => updateNotificationSettings({ dailyDigest: v })} />
                    <Toggle label="Weekly report" description="Receive a weekly operational report" checked={notificationSettings.weeklyReport} onChange={v => updateNotificationSettings({ weeklyReport: v })} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6 animate-fade-in">
                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>AI Assistance</h4>
                  <div className="space-y-4">
                    <Toggle label="Auto-suggest severity" description="AI will recommend severity level based on complaint description" checked={aiSettings.autoSuggestSeverity} onChange={v => updateAISettings({ autoSuggestSeverity: v })} />
                    <Toggle label="Auto-suggest department" description="AI will recommend the responsible department" checked={aiSettings.autoSuggestDepartment} onChange={v => updateAISettings({ autoSuggestDepartment: v })} />
                    <Toggle label="Auto-summarize complaints" description="AI will generate a summary of the complaint" checked={aiSettings.autoSummarize} onChange={v => updateAISettings({ autoSummarize: v })} />
                    <Toggle label="Auto-recommendations" description="AI will suggest next steps and actions" checked={aiSettings.autoRecommendations} onChange={v => updateAISettings({ autoRecommendations: v })} />
                  </div>
                </div>

                <div className="rounded-xl border p-5" style={{ background: 'rgba(99,102,241,0.03)', borderColor: 'rgba(99,102,241,0.12)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Engine Status</h4>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
                        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Online — Ready for provider integration</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                    Connect OpenAI or Claude API keys to unlock advanced capabilities including multi-agent operations, AI memory, and conversational workflows.
                  </p>
                  <button className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-medium transition" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                    Configure Provider →
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-6 animate-fade-in">
                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Response Deadlines</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Default Response Time</label>
                      <div className="flex items-center gap-2">
                        <input type="number" value={operationalRules.defaultResponseTime} onChange={e => updateOperationalRules({ defaultResponseTime: Number(e.target.value) })}
                          className="w-20 px-3 py-2 rounded-lg text-[13px] border outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>hours</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Immediate Attention Response</label>
                      <div className="flex items-center gap-2">
                        <input type="number" value={operationalRules.criticalResponseTime} onChange={e => updateOperationalRules({ criticalResponseTime: Number(e.target.value) })}
                          className="w-20 px-3 py-2 rounded-lg text-[13px] border outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>hours</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>High Priority Response</label>
                      <div className="flex items-center gap-2">
                        <input type="number" value={operationalRules.highResponseTime} onChange={e => updateOperationalRules({ highResponseTime: Number(e.target.value) })}
                          className="w-20 px-3 py-2 rounded-lg text-[13px] border outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Priority Handling</h4>
                  <div className="space-y-4">
                    <Toggle label="Auto-escalate" description="Automatically raise priority when response deadline is at risk" checked={operationalRules.autoEscalate} onChange={v => updateOperationalRules({ autoEscalate: v })} />
                    <div>
                      <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Escalate After</label>
                      <div className="flex items-center gap-2">
                        <input type="number" value={operationalRules.escalateAfterHours} onChange={e => updateOperationalRules({ escalateAfterHours: Number(e.target.value) })}
                          className="w-20 px-3 py-2 rounded-lg text-[13px] border outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>hours without response</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-fade-in">
                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Password</h4>
                  <p className="text-[12px] mb-4" style={{ color: 'var(--text-tertiary)' }}>Update your password to keep your account secure</p>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium border transition hover:opacity-80"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                    <Key className="w-3.5 h-3.5" /> Change Password
                  </button>
                </div>

                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Sessions</h4>
                  <p className="text-[12px] mb-4" style={{ color: 'var(--text-tertiary)' }}>Manage your active sessions</p>
                  <div className="rounded-lg border p-3 flex items-center justify-between" style={{ borderColor: 'var(--border-secondary)' }}>
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Current Session</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Active now • This device</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">Active</span>
                  </div>
                </div>

                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-secondary)' }}>
                  <h4 className="text-sm font-semibold mb-2 text-red-400">Danger Zone</h4>
                  <p className="text-[12px] mb-4" style={{ color: 'var(--text-tertiary)' }}>Permanently delete your account and all data</p>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
