/**
 * Fictional app icons for the v1-fix build. Every icon here is an original
 * flat SVG design — none reuse real app logos/colors (Tinder, Instagram,
 * Gmail, WhatsApp, Google Maps, Airbnb, or Apple's stock iOS icon set) —
 * so the fake phone home screen doesn't read as impersonating real brands.
 * Rendered as data-URI strings so existing `<img src>` call sites don't change.
 */

function svgIcon(inner: string, from: string, to: string): string {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient></defs>
    <rect width="128" height="128" rx="30" fill="url(#g)"/>
    ${inner}
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}

// -- System-style apps (kept as generic names, icons redrawn) --------------

export const iconMessages = svgIcon(
  `<path d="M28 34h72a10 10 0 0 1 10 10v34a10 10 0 0 1-10 10H56l-18 16v-16H28a10 10 0 0 1-10-10V44a10 10 0 0 1 10-10z" fill="#fff"/>
   <circle cx="50" cy="61" r="5" fill="url(#g)"/><circle cx="64" cy="61" r="5" fill="url(#g)"/><circle cx="78" cy="61" r="5" fill="url(#g)"/>`,
  "#8B5CF6",
  "#EC4899",
);

export const iconPhone = svgIcon(
  `<path d="M40 46c-4 10 2 26 14 38s28 18 38 14c4-1.6 7-6 7-10l-2-10c-.6-3-3-5-6-5l-12 3c-3 .8-6-.2-8-2l-10-10c-2-2-3-5-2-8l3-12c.7-3-.6-6-3-7l-10-3c-4-1-8 1-9 5z" fill="#fff"/>
   <path d="M86 30a30 30 0 0 1 22 22" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.85"/>
   <path d="M90 42a16 16 0 0 1 12 12" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.85"/>`,
  "#FB923C",
  "#EF4444",
);

export const iconCalendar = svgIcon(
  `<rect x="30" y="34" width="68" height="62" rx="12" fill="#fff"/>
   <rect x="30" y="34" width="68" height="18" rx="10" fill="url(#g)"/>
   <circle cx="46" cy="34" r="5" fill="#fff"/><circle cx="82" cy="34" r="5" fill="#fff"/>
   <circle cx="52" cy="72" r="15" fill="url(#g)"/>
   <path d="M45 72l5 5 9-10" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
   <rect x="72" y="64" width="18" height="6" rx="3" fill="url(#g)" opacity="0.5"/>
   <rect x="72" y="76" width="18" height="6" rx="3" fill="url(#g)" opacity="0.5"/>`,
  "#14B8A6",
  "#0EA5E9",
);

export const iconNotes = svgIcon(
  `<path d="M34 28h44l16 16v56a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V34a6 6 0 0 1 6-6z" fill="#fff"/>
   <path d="M78 28l16 16H84a6 6 0 0 1-6-6z" fill="#f0f0f0"/>
   <path d="M40 62l28-28 8 8-28 28-10 2z" fill="url(#g)"/>`,
  "#FBBF24",
  "#F97316",
);

export const iconWeather = svgIcon(
  `<circle cx="64" cy="64" r="22" fill="#fff"/>
   <g stroke="#fff" stroke-width="6" stroke-linecap="round">
     <line x1="64" y1="20" x2="64" y2="32"/><line x1="64" y1="96" x2="64" y2="108"/>
     <line x1="20" y1="64" x2="32" y2="64"/><line x1="96" y1="64" x2="108" y2="64"/>
     <line x1="33" y1="33" x2="41" y2="41"/><line x1="87" y1="87" x2="95" y2="95"/>
     <line x1="95" y1="33" x2="87" y2="41"/><line x1="41" y1="87" x2="33" y2="95"/>
   </g>`,
  "#F59E0B",
  "#FB7185",
);

export const iconWallet = svgIcon(
  `<rect x="26" y="46" width="76" height="44" rx="10" fill="#fff"/>
   <circle cx="64" cy="68" r="15" fill="url(#g)"/>
   <path d="M64 58v20M59 62c0-3 3-4 5-4s5 1.5 5 3.5-2 2.7-5 3.5-5 1.7-5 3.5 2 3.5 5 3.5 5-1 5-3.5" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
   <circle cx="88" cy="68" r="4" fill="url(#g)"/>`,
  "#0EA5E9",
  "#22D3EE",
);

export const iconClock = svgIcon(
  `<rect x="36" y="22" width="56" height="8" rx="4" fill="#fff"/>
   <rect x="36" y="98" width="56" height="8" rx="4" fill="#fff"/>
   <path d="M40 30h48l-4 10c-2 5-8 14-20 20-12-6-18-15-20-20z" fill="#fff"/>
   <path d="M40 98h48l-4-10c-2-5-8-14-20-20-12 6-18 15-20 20z" fill="#fff"/>`,
  "#7C3AED",
  "#A855F7",
);

export const iconCompass = svgIcon(
  `<circle cx="64" cy="64" r="38" fill="none" stroke="#fff" stroke-width="4"/>
   <path d="M64 32l11 25 25 11-25 11-11 25-11-25-25-11 25-11z" fill="#fff"/>`,
  "#0D9488",
  "#10B981",
);

export const iconCalculator = svgIcon(
  `<rect x="34" y="26" width="60" height="76" rx="12" fill="#fff"/>
   <rect x="42" y="34" width="44" height="18" rx="4" fill="url(#g)"/>
   <circle cx="48" cy="66" r="6" fill="url(#g)"/><circle cx="64" cy="66" r="6" fill="url(#g)"/><circle cx="80" cy="66" r="6" fill="url(#g)"/>
   <circle cx="48" cy="84" r="6" fill="url(#g)"/><rect x="74" y="81" width="12" height="6" rx="3" fill="url(#g)"/>`,
  "#1E3A8A",
  "#3B82F6",
);

export const iconSettings = svgIcon(
  `<g stroke="#fff" stroke-width="5" stroke-linecap="round">
     <line x1="30" y1="46" x2="98" y2="46"/><line x1="30" y1="64" x2="98" y2="64"/><line x1="30" y1="82" x2="98" y2="82"/>
   </g>
   <circle cx="52" cy="46" r="7" fill="#FCD34D"/><circle cx="76" cy="64" r="7" fill="#FCD34D"/><circle cx="58" cy="82" r="7" fill="#FCD34D"/>`,
  "#334155",
  "#64748B",
);

export const iconPhotos = svgIcon(
  `<rect x="30" y="34" width="50" height="60" rx="6" fill="#fff" transform="rotate(-8 55 64)"/>
   <rect x="48" y="34" width="50" height="60" rx="6" fill="#fff" transform="rotate(8 73 64)"/>
   <rect x="56" y="42" width="30" height="24" fill="url(#g)" transform="rotate(8 73 64)"/>`,
  "#EC4899",
  "#F472B6",
);

export const iconRevoBank = svgIcon(
  `<circle cx="64" cy="64" r="30" fill="#fff"/>
   <path d="M64 40l6 14 15 3-11 11 3 15-13-7-13 7 3-15-11-11 15-3z" fill="url(#g)"/>`,
  "#111827",
  "#1F2937",
);

// -- Fictional replacements for real third-party brands ---------------------

export const iconFlurt = svgIcon(
  `<path d="M64 92C40 76 26 62 26 46a18 18 0 0 1 32-12 18 18 0 0 1 32 12c0 16-14 30-26 46z" fill="#fff"/>
   <path d="M64 40l4 8 8 2-8 4-2 8-4-8-8-2 8-4z" fill="url(#g)"/>`,
  "#FB7185",
  "#E11D48",
);

export const iconGlimpse = svgIcon(
  `<rect x="32" y="36" width="64" height="56" rx="12" fill="#fff"/>
   <circle cx="52" cy="58" r="8" fill="url(#g)"/>
   <path d="M40 82l16-16 12 10 10-14 14 20z" fill="url(#g)"/>
   <path d="M84 40l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="url(#g)"/>`,
  "#14B8A6",
  "#8B5CF6",
);

export const iconMailly = svgIcon(
  `<path d="M30 66l70-34-24 72-14-24-18 12 4-20z" fill="#fff"/>
   <path d="M62 60l14 24 6-56z" fill="#dbeafe" opacity="0.75"/>`,
  "#2563EB",
  "#38BDF8",
);

export const iconChatta = svgIcon(
  `<path d="M28 40h60a12 12 0 0 1 12 12v26a12 12 0 0 1-12 12H56l-16 14v-14H28a12 12 0 0 1-12-12V52a12 12 0 0 1 12-12z" fill="#fff"/>
   <path d="M42 63l6 6 12-14" stroke="url(#g)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M58 63l6 6 12-14" stroke="url(#g)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  "#059669",
  "#34D399",
);

export const iconPinpoint = svgIcon(
  `<path d="M64 100C48 78 36 62 36 46a28 28 0 0 1 56 0c0 16-12 32-28 54z" fill="#fff"/>
   <circle cx="64" cy="46" r="12" fill="url(#g)"/>`,
  "#2563EB",
  "#06B6D4",
);

export const iconNestly = svgIcon(
  `<path d="M64 28l38 30v6h-8v34H34V64h-8v-6z" fill="#fff"/>
   <path d="M64 76c-6-5-10-9-10-14a6 6 0 0 1 10-4 6 6 0 0 1 10 4c0 5-4 9-10 14z" fill="url(#g)"/>`,
  "#FB923C",
  "#F43F5E",
);
