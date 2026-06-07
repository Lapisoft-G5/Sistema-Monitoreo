import type { SVGProps } from 'react';

export const LogoUgelIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" width="20" height="20" {...props}>
      <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <path
        d="M16 5 L27 22 H5 Z"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="11" r="2.5" fill="white" opacity="0.85" />
    </svg>
  );
};
