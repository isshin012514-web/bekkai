const ICONS = {
  // modules
  purpose: (
    <>
      <path d="M12 2.5 13.7 9.4 20.5 11 13.7 12.6 12 19.5 10.3 12.6 3.5 11 10.3 9.4Z" />
    </>
  ),
  goal: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  problem: (
    <>
      <path d="M13 2.5 4.5 13.5H11L10 21.5 19.5 10H13L13 2.5Z" />
    </>
  ),
  past: (
    <>
      <path d="M3.5 8V3.5M3.5 8H8" />
      <path d="M4.2 9.2A9 9 0 1 1 4 13" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  self: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5.5 20.5v-.7a6.5 6.5 0 0 1 13 0v.7" />
    </>
  ),
  around: (
    <>
      <circle cx="9" cy="8.5" r="3.1" />
      <path d="M3.2 20v-.6a5.8 5.8 0 0 1 11.6 0v.6" />
      <circle cx="17.3" cy="9.3" r="2.3" />
      <path d="M16.5 14.4a5 5 0 0 1 4.3 4.9v.5" />
    </>
  ),
  market: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.3 3.7 5.3 3.7 8.5S14.4 18.2 12 20.5c-2.4-2.3-3.7-5.3-3.7-8.5S9.6 5.8 12 3.5Z" />
    </>
  ),
  future: (
    <>
      <path d="M3.5 19h17" />
      <path d="M7 19a5 5 0 0 1 10 0" />
      <path d="M12 3v3.5M5 9.5l1.6 1.6M19 9.5l-1.6 1.6" />
    </>
  ),
  // utility
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.2-4.2" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5.5-5.5 2 2-5.5Z" />
    </>
  ),
  list: (
    <>
      <path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20" />
      <circle cx="4.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19 6v5c0 4.6-3 7.7-7 9.2-4-1.5-7-4.6-7-9.2V6l7-3Z" />
    </>
  ),
  flag: (
    <>
      <path d="M5.5 21V3.5" />
      <path d="M5.5 4h11l-2 3.2 2 3.2h-11" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12h2.5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" />
    </>
  ),
  moon: (
    <>
      <path d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5.5v13M5.5 12h13" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 17.5h6" />
      <path d="M10 20.5h4" />
      <path d="M12 3a6 6 0 0 1 3.5 10.9c-.6.5-.9 1-.9 1.6H9.4c0-.6-.3-1.1-.9-1.6A6 6 0 0 1 12 3Z" />
    </>
  ),
  paperclip: (
    <>
      <path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l8-8a3.3 3.3 0 0 1 4.7 4.7l-7.6 7.6a1.6 1.6 0 0 1-2.3-2.3l7-7" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.83-2.83L5 17.2 4 20Z" />
      <path d="M14.5 8 17 10.5" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11M8 11l4 4 4-4" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15.5v-11M8 8l4-4 4 4" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  filter: (
    <>
      <path d="M3.5 5.5h17l-6.5 8v5l-4 2v-7Z" />
    </>
  ),
  trash: (
    <>
      <path d="M4 6.5h16" />
      <path d="M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
      <path d="M6 6.5 6.8 19a2 2 0 0 0 2 1.9h6.4a2 2 0 0 0 2-1.9L18 6.5" />
      <path d="M10 10.5v6M14 10.5v6" />
    </>
  ),
}

export default function Icon({ name, size = 22, sw = 1.6, className = '', style }) {
  const paths = ICONS[name]
  if (!paths) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths}
    </svg>
  )
}
