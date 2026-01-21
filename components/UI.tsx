
import React, { useEffect } from 'react';
import { ContractStatus } from '../types';

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-[2rem] ${className}`}>
    {children}
  </div>
);

export const StatusBadge: React.FC<{ status: ContractStatus }> = ({ status }) => {
  const styles: Record<string, string> = {
    [ContractStatus.CREATED]: 'bg-slate-100 text-slate-600 border-slate-200',
    [ContractStatus.APPROVED]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [ContractStatus.SENT]: 'bg-blue-50 text-blue-600 border-blue-100',
    [ContractStatus.SIGNED]: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    [ContractStatus.LOCKED]: 'bg-slate-900 text-white border-slate-800',
    [ContractStatus.REVOKED]: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles[ContractStatus.CREATED]}`}>
      {status}
    </span>
  );
};

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
    {subtitle && <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>}
  </div>
);

export const WorkflowTimeline: React.FC<{ history: { status: ContractStatus; timestamp: number }[] }> = ({ history }) => (
  <div className="space-y-0 relative pl-4">
    <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
    {history.map((step, i) => (
      <div key={i} className="flex gap-6 pb-8 relative group">
        <div className={`w-5 h-5 rounded-full z-10 flex items-center justify-center transition-all duration-500 ${
          i === history.length - 1 ? 'bg-blue-600 scale-125 shadow-lg shadow-blue-500/40' : 'bg-slate-200'
        }`}>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        <div className={`transition-all duration-300 ${i === history.length - 1 ? 'translate-x-1' : 'opacity-60'}`}>
          <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{step.status}</p>
          <p className="text-[10px] text-slate-400 font-medium">{new Date(step.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      </div>
    ))}
  </div>
);

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const Toast: React.FC<ToastProps & { onClose: () => void }> = ({
  message,
  type,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: 'fa-check-circle text-emerald-500',
    error: 'fa-exclamation-circle text-rose-500',
    warning: 'fa-triangle-exclamation text-amber-500',
    info: 'fa-info-circle text-blue-500',
  };

  const bgColors = {
    success: 'border-emerald-100 bg-emerald-50',
    error: 'border-rose-100 bg-rose-50',
    warning: 'border-amber-100 bg-amber-50',
    info: 'border-blue-100 bg-blue-50',
  };

  return (
    <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-full duration-500 backdrop-blur-sm ${bgColors[type]}`}>
      <i className={`fas ${icons[type]} text-xl`} />
      <p className="text-sm font-bold text-slate-800 tracking-tight">{message}</p>
      <button onClick={onClose} className="ml-4 text-slate-400 hover:text-slate-600">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export const showToast = (
  setToast: React.Dispatch<React.SetStateAction<ToastProps | null>>,
  message: string,
  type: ToastProps['type'] = 'info'
) => {
  setToast({ message, type });
};
