import { JSX } from 'react';
import { useStore } from '../store';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export default function Toasts() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  type ToastType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'

  const iconMap: Record<ToastType, JSX.Element> = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    info: <Info className="w-4 h-4 text-brand-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
  };

  const borderMap: Record<ToastType, string> = {
    success: 'border-l-emerald-400',
    info: 'border-l-brand-400',
    warning: 'border-l-amber-400',
    error: 'border-l-red-400',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast: any) => (
        <div
          key={toast.id}
          className={`animate-toast rounded-xl border border-l-[3px] ${borderMap[toast.type as ToastType]} px-4 py-3 shadow-lg flex items-start gap-3`}
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-primary)' }}
        >
          <div className="mt-0.5 shrink-0">{iconMap[toast.type as ToastType]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{toast.title}</p>
            {toast.description && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{toast.description}</p>
            )}
          </div>
          <button onClick={() => removeToast(toast.id)} className="shrink-0 p-0.5 rounded hover:opacity-70">
            <X className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
          </button>
        </div>
      ))}
    </div>
  );
}
