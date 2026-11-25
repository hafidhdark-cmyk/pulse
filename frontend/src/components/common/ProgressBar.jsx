import React from 'react';

export default function ProgressBar({ current, target, percent, showLabels = true, height = "h-2.5", className = "" }) {
  const percentage = percent !== undefined ? percent : Math.min(100, Math.round((current / target) * 100));

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-[#52627A]">Vault Progress</span>
          <span className="text-[#1D4ED8] font-mono font-bold tabular-nums">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-[#E2E8F0] rounded-full ${height} overflow-hidden p-0.5`}>
        <div
          className="bg-brand-progress h-full rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}
