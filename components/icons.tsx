import type { SVGProps } from 'react'

// ---------------------------------------------------------------------------
// Line-icon set
//
// Tasteful stroked icons drawn on a 24×24 grid, inheriting the current text
// color. These replace the emoji that previously sat on the order cards — they
// read as more refined/professional and are easy to recolor.
//
// When Riley supplies real artwork, swap the relevant <Icon> usages for her
// images (or drop new paths in here). Reference icons by name via <Icon
// name="costume" /> so the data arrays in the pages stay free of JSX.
// ---------------------------------------------------------------------------

function Svg({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

// Framed picture — used for the "Digital Image" category
function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="10" r="1.5" />
      <path d="m3 16 4-4 4 4" />
      <path d="m13 14 3-3 5 5" />
    </Svg>
  )
}

// Dress silhouette — used for the "Costume" option
function CostumeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M9 3 7.5 7 9 8l-2.5 13h11L15 8l1.5-1L15 3" />
      <path d="M9 3q3 3 6 0" />
    </Svg>
  )
}

// Four-point sparkle — used for the "Logo" option
function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 13.6 9.4 19.5 11 13.6 12.6 12 18.5 10.4 12.6 4.5 11 10.4 9.4Z" />
    </Svg>
  )
}

// Speech bubble — used for the "Other / chat" option
function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M20 4H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v4l4-4h9a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z" />
    </Svg>
  )
}

// Single figure — "Single Dancer" layout
function DancerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Svg>
  )
}

// Two figures — "Multiple Dancers" layout
function DancersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6" />
      <path d="M16.5 13.2A6 6 0 0 1 21 19" />
    </Svg>
  )
}

// Clock — "Through the Years" layout
function TimelineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Svg>
  )
}

// Instagram glyph — footer link to @iocongraphics
function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.5" fill="currentColor" />
    </Svg>
  )
}

const ICON_MAP = {
  image: ImageIcon,
  costume: CostumeIcon,
  logo: LogoIcon,
  chat: ChatIcon,
  dancer: DancerIcon,
  dancers: DancersIcon,
  timeline: TimelineIcon,
  instagram: InstagramIcon,
} as const

export type IconName = keyof typeof ICON_MAP

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const Cmp = ICON_MAP[name]
  return <Cmp {...props} />
}
