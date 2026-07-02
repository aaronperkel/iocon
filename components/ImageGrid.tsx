// Gallery image grid — stub only.
// Replace sampleImages with real data (CMS, Instagram API, static imports, etc.)

const sampleImages = [
  { id: 1, caption: 'Solo Feís Dress' },
  { id: 2, caption: 'School Crest Logo' },
  { id: 3, caption: 'Championship Gown' },
  { id: 4, caption: 'Two-Figure Study' },
  { id: 5, caption: 'Solo Figure' },
  { id: 6, caption: 'Custom Crest' },
]

export default function ImageGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {sampleImages.map(({ id, caption }) => (
        <div
          key={id}
          className="group relative rounded-xl overflow-hidden aspect-square bg-gradient-to-br from-olive-50 to-gold-50 border border-stone-200"
        >
          {/* Placeholder art block */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
            <ImagePlaceholderIcon />
            <p className="text-stone-400 text-xs text-center leading-tight">{caption}</p>
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gold-950/0 group-hover:bg-gold-950/10 transition-colors" />
        </div>
      ))}
    </div>
  )
}

function ImagePlaceholderIcon() {
  return (
    <svg
      className="w-10 h-10 text-stone-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}
