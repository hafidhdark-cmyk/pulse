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
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 sm:max-w-sm flex items-center gap-3 bg-slate-900 border border-slate-800 text-slate-100 px-4 py-3 rounded-lg shadow-lg">
      {icons[toast.type] || icons.info}
      <p className="text-xs sm:text-sm font-medium leading-snug">{toast.msg}</p>
    </div>
  );
}
