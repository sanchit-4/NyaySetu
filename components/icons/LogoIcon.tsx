
import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 200 50" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor"
    {...props}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{stopColor: 'var(--tw-color-primary-light)', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: 'var(--tw-color-primary-dark)', stopOpacity: 1}} />
      </linearGradient>
    </defs>
    <path d="M10 40 C10 10, 40 10, 40 40 C40 10, 70 10, 70 40 M25 25 L55 25" stroke="url(#logoGradient)" strokeWidth="5" fill="none" />
    <text x="80" y="35" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="bold" fill="url(#logoGradient)">
      Nyay
    </text>
  </svg>
);
