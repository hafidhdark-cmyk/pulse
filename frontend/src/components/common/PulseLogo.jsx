import React from 'react';
import pulseLogo from '../../assets/pulse-logo.png';

/**
 * Pulse Logo Component adhering to Brand guidelines:
 * - On dark/blue gradient surfaces: rendered inside a clean white rounded pill
 *   (background: #FFFFFF, border-radius: 12px, padding: 8px 14px).
 * - On light surfaces: rendered transparently directly.
 */
export default function PulseLogo({ variant = 'light', size = 'default', showWordmark = false, className = '' }) {
  const isPill = variant === 'on-gradient' || variant === 'pill';

  const imgHeights = {
    sm: 'h-6',
    default: 'h-8',
    lg: 'h-10',
    xl: 'h-12'
  };

  const image = (
    <img 
      src={pulseLogo} 
      alt="Pulse" 
      className={`${imgHeights[size] || imgHeights.default} w-auto object-contain transition-transform`} 
    />
  );

  if (isPill) {
    return (
      <div className={`inline-flex items-center gap-2 bg-white rounded-xl px-3.5 py-2 shadow-sm ${className}`}>
        {image}
        {showWordmark && (
          <span className="font-bold text-base tracking-tight text-[#1D4ED8]">
            Pulse
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {image}
      {showWordmark && (
        <span className="font-bold text-lg tracking-tight text-[#0F172A]">
          Pulse
        </span>
      )}
    </div>
  );
}
