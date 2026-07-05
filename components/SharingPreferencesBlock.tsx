'use client'

// NOTE: Currently unused. The sharing/permission questions (platforms, tag
// the dancer, tag the dance school) were removed from the order forms in
// July 2026 — too confusing mid-order; Riley sorts sharing out with the
// client directly. Kept intact in case a post-order permissions step comes
// back. The dance-school tag question is grouped with the dancer-tag
// questions here on purpose.

import type { SharingPlatform } from '@/lib/orders'

export interface SharingPrefsFields {
  platforms: SharingPlatform[]
  instagramTag: boolean | null
  instagramHandle: string
  tikTokTag: boolean | null
  tikTokHandle: string
  schoolTag: boolean | null
  schoolHandle: string
}

export const EMPTY_SHARING: SharingPrefsFields = {
  platforms: [],
  instagramTag: null,
  instagramHandle: '',
  tikTokTag: null,
  tikTokHandle: '',
  schoolTag: null,
  schoolHandle: '',
}

const PLATFORM_OPTIONS: { value: SharingPlatform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'website', label: 'Íocón website' },
  { value: 'none', label: 'Please do not post' },
]

interface Props {
  value: SharingPrefsFields
  onChange: (value: SharingPrefsFields) => void
}

export function SharingPreferencesBlock({ value, onChange }: Props) {
  const showInstagram = value.platforms.includes('instagram')
  const showTikTok = value.platforms.includes('tiktok')
  const showSchool = value.platforms.some((p) => p !== 'none')

  function togglePlatform(platform: SharingPlatform) {
    let next: SharingPlatform[]
    if (platform === 'none') {
      next = value.platforms.includes('none') ? [] : ['none']
    } else {
      const withoutNone = value.platforms.filter((p) => p !== 'none')
      next = withoutNone.includes(platform)
        ? withoutNone.filter((p) => p !== platform)
        : [...withoutNone, platform]
    }
    const anySharing = next.some((p) => p !== 'none')
    onChange({
      ...value,
      platforms: next,
      instagramTag: next.includes('instagram') ? value.instagramTag : null,
      instagramHandle: next.includes('instagram') ? value.instagramHandle : '',
      tikTokTag: next.includes('tiktok') ? value.tikTokTag : null,
      tikTokHandle: next.includes('tiktok') ? value.tikTokHandle : '',
      schoolTag: anySharing ? value.schoolTag : null,
      schoolHandle: anySharing ? value.schoolHandle : '',
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-stone-400 mb-1">No personal information will be shared.</p>
        <p className="text-sm font-medium text-stone-700 mb-0.5">
          Where can this drawing be shared?
        </p>
        <p className="text-xs text-stone-500 mb-3">Select all that apply — you can choose more than one.</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((p) => {
            const selected = value.platforms.includes(p.value)
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePlatform(p.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                  selected
                    ? 'bg-gold-900 text-white border-gold-900'
                    : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
                }`}
              >
                {selected && (
                  <svg
                    viewBox="0 0 12 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3 shrink-0"
                    aria-hidden="true"
                  >
                    <polyline points="1,5 4,8 11,1" />
                  </svg>
                )}
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Instagram tag */}
      {showInstagram && (
        <TagBlock
          platform="Instagram"
          wantTag={value.instagramTag}
          handle={value.instagramHandle}
          onWantTag={(v) =>
            onChange({ ...value, instagramTag: v, instagramHandle: v ? value.instagramHandle : '' })
          }
          onHandle={(h) => onChange({ ...value, instagramHandle: h })}
        />
      )}

      {/* TikTok tag */}
      {showTikTok && (
        <TagBlock
          platform="TikTok"
          wantTag={value.tikTokTag}
          handle={value.tikTokHandle}
          onWantTag={(v) =>
            onChange({ ...value, tikTokTag: v, tikTokHandle: v ? value.tikTokHandle : '' })
          }
          onHandle={(h) => onChange({ ...value, tikTokHandle: h })}
        />
      )}

      {/* Dance school tag */}
      {showSchool && (
        <DanceSchoolTagBlock
          wantTag={value.schoolTag}
          handle={value.schoolHandle}
          onWantTag={(v) =>
            onChange({ ...value, schoolTag: v, schoolHandle: v ? value.schoolHandle : '' })
          }
          onHandle={(h) => onChange({ ...value, schoolHandle: h })}
        />
      )}
    </div>
  )
}

// "Do I have permission to tag your dance school?" — sits directly below the
// dancer-tag questions above.
function DanceSchoolTagBlock({
  wantTag,
  handle,
  onWantTag,
  onHandle,
}: {
  wantTag: boolean | null
  handle: string
  onWantTag: (v: boolean) => void
  onHandle: (h: string) => void
}) {
  return (
    <div className="space-y-3 pl-4 border-l-2 border-gold-200">
      <p className="text-sm font-medium text-stone-700">
        Do I have permission to tag your dance school?
      </p>
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onWantTag(v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
              wantTag === v
                ? 'bg-gold-900 text-white border-gold-900'
                : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
            }`}
          >
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
      {wantTag === true && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Dance school handle
          </label>
          <input
            type="text"
            value={handle}
            onChange={(e) => onHandle(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
            placeholder="@schoolhandle"
          />
        </div>
      )}
    </div>
  )
}

function TagBlock({
  platform,
  wantTag,
  handle,
  onWantTag,
  onHandle,
}: {
  platform: string
  wantTag: boolean | null
  handle: string
  onWantTag: (v: boolean) => void
  onHandle: (h: string) => void
}) {
  return (
    <div className="space-y-3 pl-4 border-l-2 border-gold-200">
      <p className="text-sm font-medium text-stone-700">Tag you on {platform}?</p>
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onWantTag(v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
              wantTag === v
                ? 'bg-gold-900 text-white border-gold-900'
                : 'bg-white text-stone-600 border-stone-300 hover:border-gold-400'
            }`}
          >
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
      {wantTag === true && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            {platform} handle
          </label>
          <input
            type="text"
            value={handle}
            onChange={(e) => onHandle(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
            placeholder="@yourhandle"
          />
        </div>
      )}
    </div>
  )
}
