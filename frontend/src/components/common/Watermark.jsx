import React, { useState } from 'react';
import { ShieldCheck, Info, X, ExternalLink, Sparkles } from 'lucide-react';

export default function Watermark() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Floating Watermark Pill */}
      <div className="fixed bottom-16 sm:bottom-4 right-3 sm:right-4 z-40 select-none">
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md border border-slate-700/80 shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
          title="Click to view authentic remodel verification & attribution"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold tracking-tight">
            Remodeled by <strong className="text-blue-300 font-bold">@layi</strong>
          </span>
          <span className="hidden md:inline text-[10px] text-slate-400 font-normal border-l border-slate-700 pl-2">
            Authentic Remodel · Not Piracy
          </span>
          <Info size={12} className="text-slate-400 ml-0.5 hover:text-white" />
        </div>
      </div>

      {/* Attribution & Anti-Piracy Remodel Details Modal */}
      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    Verified Remodel Attribution
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Authentic
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Pulse Social Fintech MVP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-blue-900">
                <div className="font-semibold text-blue-950 flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} className="text-blue-600" />
                  Engineering &amp; Design Attribution
                </div>
                This product is an <strong>authorized architectural overhaul &amp; UI remodel</strong> conceived and developed by <strong>Layi (@layi)</strong>.
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-800">Why this is an authentic remodel (Not Piracy):</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><strong>Authentic Cultural Mechanics:</strong> Re-engineered around Nigerian community thrift pooling (<em>Ajo / Esusu</em>) with transparent member ledgers.</li>
                  <li><strong>Consensus Governance:</strong> Group plans require multi-member approval for withdrawals—protecting against rogue admins.</li>
                  <li><strong>Strict Dual-Mode Architecture:</strong> Personal savings are private and distraction-free (no chat), while Group savings have live Socket.io discussion and 1-click bill splits.</li>
                  <li><strong>Full-Stack Overhaul:</strong> Built with PostgreSQL on Nobus Cloud VM, atomic double-entry wallet ledgers, and mobile-optimized responsive UX.</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Author: <strong>Layi (@layi / LAM)</strong></span>
                <span>Hackathon 2026 · Pulse MVP</span>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
              >
                Got it, continue exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
