import React from "react";

export function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="ig-grad-badge" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad-badge)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
      <circle cx="15.5" cy="8.5" r="0.9" fill="#FFFFFF" />
    </svg>
  );
}

export function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#000000" stroke="#2A2A2A" strokeWidth="1" />
      <path
        d="M16.5 7.2a3.8 3.8 0 0 1-2.8-2.7V4h-2.5v10.2a2.1 2.1 0 1 1-3.8-1.3 2.1 2.1 0 0 1 1.7-2.1V8.3a4.6 4.6 0 1 0 4.6 4.6V9.1a6.1 6.1 0 0 0 3.5 1.1V7.2z"
        fill="#00F2FE"
      />
      <path
        d="M16.2 6.9a3.8 3.8 0 0 1-2.8-2.7V4h-2.2v10.2a2.1 2.1 0 1 1-3.8-1.3 2.1 2.1 0 0 1 1.7-2.1V8.3a4.6 4.6 0 1 0 4.6 4.6V9.1a6.1 6.1 0 0 0 3.5 1.1V6.9z"
        fill="#FF004F"
        style={{ mixBlendMode: "screen" }}
      />
      <path
        d="M16.3 7a3.8 3.8 0 0 1-2.8-2.7V4h-2.4v10.2a2.1 2.1 0 1 1-3.8-1.3 2.1 2.1 0 0 1 1.7-2.1V8.3a4.6 4.6 0 1 0 4.6 4.6V9.1a6.1 6.1 0 0 0 3.5 1.1V7z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#1877F2" />
      <path
        d="M15 12h-2.5v7h-3v-7h-2v-2.5h2V8a3 3 0 0 1 3-3h2.5v2.5h-1.5c-.5 0-.8.3-.8.8v1.2H15L15 12z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function TwitterIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#000000" stroke="#2A2A2A" strokeWidth="1" />
      <path
        d="M15.5 6h2.2l-4.8 5.5 5.7 7.5h-4.4l-3.5-4.5-4 4.5H4.5l5.2-6L4.2 6h4.5l3.1 4.1L15.5 6zm-.8 11.7h1.2L8.2 7.2H6.9l7.8 10.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
