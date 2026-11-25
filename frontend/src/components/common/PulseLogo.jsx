import React from 'react';
import pulseLogo from '../../assets/pulse-logo.png';

export default function PulseLogo({ variant = 'light', size = 'default', className = '' }) {
  const isPill = variant === 'on-gradient' || variant === 'pill';

  const imgHeights = {
    sm: 'h-5',
    default: 'h-7',
    lg: 'h-9',
    xl: 'h-11'
  };

  const image = (
    <img
      src={pulseLogo}
      alt="Pulse"
      className={`${imgHeights[size] || imgHeights.default} w-auto object-contain`}
    />
  );

  if (isPill) {
    return (
      <div className={`inline-flex items-center bg-white rounded-lg px-3 py-1.5 ${className}`}>
        {image}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      {image}
    </div>
  );
}
