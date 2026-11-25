import React from 'react';

export default function ProgressBar({
  current = 0,
  target = 1,
  percent,
  showLabels = true,
  height = 'h-2',
  className = ''
}) {
  const computed = target > 0 ? Math.min(100, Math.round((Number(current) / Number(target)) * 1000) / 10) : 0;
  const percentage = percent !== undefined ? Number(percent) : computed;
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-500 font-medium">Progress</span>
          <span className="text-slate-900 font-mono font-semibold tabular-nums">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 border border-slate-200/80 rounded-full ${height} overflow-hidden`}>
        <div
          className="bg-[#1D4ED8] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
