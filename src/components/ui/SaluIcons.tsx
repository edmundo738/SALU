import React from 'react';

interface IconProps {
  className?: string;
}

/* ============================================================================
 * SALU UI KIT — CATEGORY SPRITE ICONS (from SALU Asset Sheet)
 * ============================================================================ */

export function CatTechIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="6" width="24" height="15" rx="2.5" fill="#1D6FE5" />
      <rect x="6.8" y="8.5" width="18.4" height="10" rx="1.2" fill="#93C5FD" />
      <path d="M2 23.5C2 22.67 2.67 22 3.5 22H28.5C29.33 22 30 22.67 30 23.5V24.5C30 25.33 29.33 26 28.5 26H3.5C2.67 26 2 25.33 2 24.5V23.5Z" fill="#081C41" className="dark:fill-[#60A5FA]" />
      <rect x="13" y="22.8" width="6" height="1.4" rx="0.7" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );
}

export function CatConstructionIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M24.2 5.4C21.8 4.4 19 5 17.2 6.8C15.5 8.5 14.9 11.1 15.7 13.4L6.2 22.9C5.1 24 5.1 25.8 6.2 26.9C7.3 28 9.1 28 10.2 26.9L19.7 17.4C22 18.2 24.6 17.6 26.3 15.9C28.1 14.1 28.7 11.3 27.7 8.9L24 12.6L20.5 9.1L24.2 5.4Z"
        fill="#1D6FE5"
      />
      <circle cx="8.3" cy="24.8" r="1.3" fill="#FFFFFF" />
    </svg>
  );
}

export function CatCleaningIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M22.2 3.8C23 3 24.3 3 25.1 3.8C25.9 4.6 25.9 5.9 25.1 6.7L15.6 16.2L12.7 13.3L22.2 3.8Z" fill="#081C41" className="dark:fill-[#CBD5E1]" />
      <path d="M11.6 12.2L16.7 17.3L14.9 19.1L9.8 14L11.6 12.2Z" fill="#F97316" />
      <path d="M9.6 14.2L14.7 19.3L9.4 27.2C8.9 27.9 7.9 28 7.2 27.4L4.2 24.4C3.5 23.7 3.6 22.7 4.3 22.2L9.6 14.2Z" fill="#FB923C" />
      <path d="M6.5 20.5L8.3 22.3M8.2 18.2L10.3 20.3" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

export function CatTransportIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M7.2 12.5L9.8 7.2C10.3 6.2 11.3 5.5 12.4 5.5H19.6C20.7 5.5 21.7 6.2 22.2 7.2L24.8 12.5H7.2Z" fill="#1D6FE5" />
      <path d="M9.5 12.2L11.2 8.2C11.4 7.8 11.8 7.5 12.3 7.5H19.7C20.2 7.5 20.6 7.8 20.8 8.2L22.5 12.2H9.5Z" fill="#93C5FD" />
      <rect x="4" y="12" width="24" height="9.5" rx="3.2" fill="#1D6FE5" />
      <circle cx="8.5" cy="16.8" r="1.7" fill="#FFFFFF" />
      <circle cx="23.5" cy="16.8" r="1.7" fill="#FFFFFF" />
      <rect x="12.5" y="16" width="7" height="1.8" rx="0.9" fill="#081C41" />
      <rect x="6" y="21.5" width="4.2" height="3.2" rx="1.1" fill="#081C41" className="dark:fill-[#60A5FA]" />
      <rect x="21.8" y="21.5" width="4.2" height="3.2" rx="1.1" fill="#081C41" className="dark:fill-[#60A5FA]" />
    </svg>
  );
}

export function CatRepairsIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="5" width="16" height="7" rx="2.5" fill="#F97316" />
      <path d="M21 8.5H23.5C24.9 8.5 26 9.6 26 11V13.2C26 14.5 25 15.6 23.7 15.8L17.4 16.8C16.6 16.9 16 17.6 16 18.4V20" stroke="#081C41" className="dark:stroke-[#CBD5E1]" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="13.5" y="19.5" width="5" height="8.5" rx="2" fill="#1D6FE5" />
    </svg>
  );
}

export function CatHomeIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M16 4.5L4.5 14.2C3.9 14.7 4.2 15.7 5 15.7H7V25.5C7 26.6 7.9 27.5 9 27.5H23C24.1 27.5 25 26.6 25 25.5V15.7H27C27.8 15.7 28.1 14.7 27.5 14.2L16 4.5Z" fill="#F97316" />
      <rect x="13.2" y="18.5" width="5.6" height="9" rx="1.2" fill="#FFFFFF" />
      <rect x="10.2" y="13.2" width="3.4" height="3.2" rx="0.8" fill="#FFEDD5" />
      <rect x="18.4" y="13.2" width="3.4" height="3.2" rx="0.8" fill="#FFEDD5" />
    </svg>
  );
}

export function CatMoreIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="12" fill="#081C41" className="dark:fill-[#1D6FE5]" />
      <circle cx="10.5" cy="16" r="1.9" fill="#FFFFFF" />
      <circle cx="16" cy="16" r="1.9" fill="#FFFFFF" />
      <circle cx="21.5" cy="16" r="1.9" fill="#FFFFFF" />
    </svg>
  );
}

/* ============================================================================
 * SALU UI KIT — SOLID / DUOTONE NAVIGATION ICONS
 * ============================================================================ */

export function NavHomeIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.35 3.22a1 1 0 0 1 1.3 0l8 6.86a1 1 0 0 1-.65 1.76H19v7.66a1.5 1.5 0 0 1-1.5 1.5h-3.75v-5.25a1.25 1.25 0 0 0-1.25-1.25h-1a1.25 1.25 0 0 0-1.25 1.25V21H6.5A1.5 1.5 0 0 1 5 19.5v-7.66H4a1 1 0 0 1-.65-1.76l8-6.86Z" />
    </svg>
  );
}

export function NavExploreIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.3" />
      <path d="M16 16l4.2 4.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function NavOrdersIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9 4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6h3.5A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-9A2.5 2.5 0 0 1 5.5 6H9V4.5Zm1.5 0V6h3V4.5h-3Z" />
      <rect x="9.5" y="10.5" width="5" height="2" rx="1" fill="#061534" opacity="0.35" />
    </svg>
  );
}

export function NavMessagesIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.5 4h15A2.5 2.5 0 0 1 22 6.5v9a2.5 2.5 0 0 1-2.5 2.5H9.4l-4.5 3.3A.75.75 0 0 1 3.7 20.7V18A2.5 2.5 0 0 1 2 15.5v-9A2.5 2.5 0 0 1 4.5 4Z" />
      <rect x="6.5" y="8.5" width="11" height="1.7" rx="0.85" fill="#061534" opacity="0.3" />
      <rect x="6.5" y="12" width="7.5" height="1.7" rx="0.85" fill="#061534" opacity="0.3" />
    </svg>
  );
}

export function NavAlertsIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5a1.25 1.25 0 0 1 1.25 1.25v.55a5.75 5.75 0 0 1 4.5 5.62v3.78l1.35 2.16A1 1 0 0 1 18.25 17.4H5.75a1 1 0 0 1-.85-1.54l1.35-2.16V9.92a5.75 5.75 0 0 1 4.5-5.62v-.55A1.25 1.25 0 0 1 12 2.5Zm-2.2 16.4h4.4a2.2 2.2 0 0 1-4.4 0Z" />
    </svg>
  );
}

export function NavProfileIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 19.5c0-3.3 3.35-5.5 7.5-5.5s7.5 2.2 7.5 5.5c0 .83-.67 1.5-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5Z" />
    </svg>
  );
}

export function NavSettingsIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.4 2.7a1.5 1.5 0 0 1 3.2 0l.32 1.38a6.8 6.8 0 0 1 1.72.72l1.22-.74a1.5 1.5 0 0 1 2.26 2.26l-.74 1.22c.3.54.54 1.12.72 1.72l1.38.32a1.5 1.5 0 0 1 0 3.2l-1.38.32a6.8 6.8 0 0 1-.72 1.72l.74 1.22a1.5 1.5 0 0 1-2.26 2.26l-1.22-.74a6.8 6.8 0 0 1-1.72.72l-.32 1.38a1.5 1.5 0 0 1-3.2 0l-.32-1.38a6.8 6.8 0 0 1-1.72-.72l-1.22.74a1.5 1.5 0 0 1-2.26-2.26l.74-1.22a6.8 6.8 0 0 1-.72-1.72l-1.38-.32a1.5 1.5 0 0 1 0-3.2l1.38-.32c.18-.6.42-1.18.72-1.72l-.74-1.22a1.5 1.5 0 0 1 2.26-2.26l1.22.74c.54-.3 1.12-.54 1.72-.72l.32-1.38ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
      />
    </svg>
  );
}

/* ============================================================================
 * SALU UI KIT — TRUST BADGES & ACTION CIRCLE SPRITES
 * ============================================================================ */

export function VerifiedShieldSprite({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 2.5L4.5 6.3V13.2C4.5 19.2 8.5 24.4 14 26C19.5 24.4 23.5 19.2 23.5 13.2V6.3L14 2.5Z"
        fill="#10B981"
      />
      <path
        d="M10.2 14.2L12.8 16.8L18.2 11.4"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrustTrophySprite({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <path d="M8.5 5H19.5V11.5C19.5 14.8 17 17.4 14 17.4C11 17.4 8.5 14.8 8.5 11.5V5Z" fill="#F97316" />
      <path d="M8.5 6.8H5.5C5.5 10.2 6.8 12.2 8.8 12.5M19.5 6.8H22.5C22.5 10.2 21.2 12.2 19.2 12.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <rect x="12.5" y="17" width="3" height="4" fill="#F59E0B" />
      <rect x="9.5" y="20.8" width="9" height="2.6" rx="1.3" fill="#EA580C" />
    </svg>
  );
}

export function WhatsAppCircleSprite({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="#22C55E" />
      <path
        d="M14 6.8C10.1 6.8 7 9.8 7 13.5C7 14.9 7.4 16.2 8.2 17.3L7.2 21L11 20C12 20.5 13 20.8 14 20.8C17.9 20.8 21 17.8 21 14C21 10.2 17.9 6.8 14 6.8ZM17.6 16.5C17.4 17 16.6 17.4 16.1 17.5C15.7 17.6 15.2 17.6 14.2 17.2C12.7 16.6 11.4 15.2 10.7 13.9C10.4 13.3 10.1 12.4 10.3 11.6C10.4 11.1 10.8 10.7 11.1 10.6C11.4 10.5 11.6 10.5 11.8 10.8L12.5 12.1C12.6 12.3 12.6 12.5 12.4 12.7L12 13.2C12.5 14 13.2 14.7 14 15.1L14.6 14.7C14.8 14.5 15 14.5 15.2 14.6L16.6 15.2C16.9 15.4 17.7 16 17.6 16.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
