import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useNotifications();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />,
    error: <AlertCircle className="text-rose-400 shrink-0" size={18} />,
    info: <Info className="text-sky-400 shrink-0" size={18} />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm flex items-center gap-3 bg-[#131d2e] border border-slate-700/80 text-slate-100 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
      {icons[toast.type] || icons.info}
      <p className="text-sm font-medium">{toast.msg}</p>
    </div>
  );
}
