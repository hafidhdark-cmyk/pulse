import React from 'react';

export default function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
    primary: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    cyan: 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]',
    warning: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    danger: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
    gold: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
