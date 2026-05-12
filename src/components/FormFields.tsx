import { useState, useRef } from 'react';
import { ChevronDown, Upload, X, Check } from 'lucide-react';
import type { Severity } from '../store'
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export function TextInput({ label, value, onChange, placeholder, type = 'text', required, disabled, error }: InputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg text-[13px] border outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 disabled:opacity-50 ${error ? 'border-red-500/50' : ''}`}
        style={{ background: 'var(--bg-input)', borderColor: error ? 'rgba(239,68,68,0.5)' : 'var(--border-primary)', color: 'var(--text-primary)' }}
      />
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends InputProps {
  rows?: number;
}

export function TextArea({ label, value, onChange, placeholder, required, disabled, error, rows = 3 }: TextareaProps) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg text-[13px] border outline-none transition-all resize-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 disabled:opacity-50 ${error ? 'border-red-500/50' : ''}`}
        style={{ background: 'var(--bg-input)', borderColor: error ? 'rgba(239,68,68,0.5)' : 'var(--border-primary)', color: 'var(--text-primary)' }}
      />
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export function Select({ label, value, onChange, options, placeholder = 'Select...', required, disabled, error }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] border outline-none transition-all disabled:opacity-50`}
        style={{ background: 'var(--bg-input)', borderColor: error ? 'rgba(239,68,68,0.5)' : 'var(--border-primary)', color: selected ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
      >
        <span>{selected?.label || placeholder}</span>
        <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 rounded-lg border shadow-xl py-1 max-h-48 overflow-y-auto animate-fade-in" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-primary)' }}>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-[13px] transition flex items-center justify-between hover:bg-brand-500/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {opt.label}
                {opt.value === value && <Check className="w-3.5 h-3.5 text-brand-400" />}
              </button>
            ))}
          </div>
        </>
      )}
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-10 h-5 rounded-full transition-all shrink-0 ${checked ? 'bg-brand-500' : ''} disabled:opacity-50`}
        style={!checked ? { background: 'var(--border-primary)' } : {}}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

interface FileUploadProps {
  label: string;
  files: string[];
  onChange: (files: string[]) => void;
}

export function FileUpload({ label, files, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => f.name);
      onChange([...files, ...newFiles]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition hover:border-brand-500/40" style={{ borderColor: 'var(--border-primary)' }}>
        <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
        <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Click to upload</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Photos, PDFs, Documents</p>
        <input ref={inputRef} type="file" className="hidden" multiple onChange={handleFiles} />
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-secondary)' }}>
              <span className="max-w-[120px] truncate">{file}</span>
              <button type="button" onClick={() => onChange(files.filter((_, i) => i !== idx))} className="hover:text-red-400"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SeveritySelectProps {
  value: Severity | '';
  onChange: (v: Severity) => void;
  aiSuggested?: Severity;
}

export function SeveritySelect({ value, onChange, aiSuggested }: SeveritySelectProps) {
  const options: { value: Severity; color: string }[] = [
  { value: 'Low', color: 'bg-emerald-500' },
  { value: 'Medium', color: 'bg-blue-500' },
  { value: 'High', color: 'bg-amber-500' },
  { value: 'Critical', color: 'bg-red-500' },
];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Severity <span className="text-red-400">*</span></label>
        {aiSuggested && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-medium">AI: {aiSuggested}</span>}
      </div>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 rounded-lg text-[12px] font-medium border transition ${value === opt.value ? 'ring-2 ring-brand-500/30' : ''}`}
            style={{ background: value === opt.value ? 'var(--bg-surface)' : 'var(--bg-input)', borderColor: 'var(--border-primary)', color: value === opt.value ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
            <div className="flex items-center justify-center gap-1.5"><div className={`w-2 h-2 rounded-full ${opt.color}`} />{opt.value}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface RatingProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}

export function Rating({ label, value, onChange, max = 5 }: RatingProps) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <button key={i} type="button" onClick={() => onChange(i + 1)} className="p-0.5 transition hover:scale-110">
            <svg className={`w-5 h-5 ${i < value ? 'text-amber-400 fill-amber-400' : ''}`} style={i >= value ? { color: 'var(--border-primary)' } : {}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
        <span className="text-[11px] ml-2" style={{ color: 'var(--text-tertiary)' }}>{value}/{max}</span>
      </div>
    </div>
  );
}

export function DateInput({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label} {required && <span className="text-red-400">*</span>}</label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px] border outline-none" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
    </div>
  );
}

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Search...',
}: SearchableSelectProps) {

  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-1 relative">
      <label
        className="block text-[11px] font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>

      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-[13px] border outline-none"
        style={{
          background: 'var(--bg-input)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)',
        }}
      />

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg border max-h-52 overflow-y-auto"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-primary)',
          }}
        >
          {filtered.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setQuery(o.label);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-brand-500/10"
              style={{ color: 'var(--text-primary)' }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
