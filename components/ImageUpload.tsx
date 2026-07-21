'use client'

import { useRef, useState } from 'react'

export interface UploadedFile {
  id: string
  name: string
  previewUrl: string
  /** The original file, kept so the form can upload it on submit. */
  file: File
}

// Must match IMAGE_EXTENSIONS in app/api/uploads/route.ts. Listing concrete
// types (not image/*) also nudges iOS into converting HEIC photos to JPEG.
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface Props {
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  label?: string
  helperText?: string
  required?: boolean
  error?: string
}

export function ImageUpload({
  files,
  onChange,
  label = 'Upload Images',
  helperText,
  required,
  error,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [typeNote, setTypeNote] = useState(false)

  function handleFileList(fileList: FileList | null) {
    if (!fileList) return
    // Drag-and-drop ignores the input's accept list, so filter here too.
    const accepted = Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type))
    setTypeNote(accepted.length < fileList.length)
    const newFiles: UploadedFile[] = accepted.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      file,
    }))
    if (newFiles.length > 0) onChange([...files, ...newFiles])
    // Reset input so the same file can be re-added after removal
    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(id: string) {
    const target = files.find((f) => f.id === id)
    if (target) URL.revokeObjectURL(target.previewUrl)
    onChange(files.filter((f) => f.id !== id))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">
        {label}
        {required && <span className="text-gold-600 ml-0.5">*</span>}
      </label>
      {helperText && <p className="text-xs text-stone-500 mb-2">{helperText}</p>}
      <div
        role="button"
        tabIndex={0}
        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition hover:bg-stone-50 ${
          error ? 'border-red-400' : 'border-stone-300 hover:border-gold-400'
        }`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFileList(e.dataTransfer.files)
        }}
      >
        <p className="text-sm text-stone-400">Click to select or drag and drop images</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => handleFileList(e.target.files)}
        />
      </div>
      {typeNote && (
        <p className="mt-1 text-xs text-stone-500">
          Some files weren&rsquo;t added — images must be JPEG, PNG, WebP, or GIF.
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {files.map((f) => (
            <div key={f.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.previewUrl}
                alt={f.name}
                className="w-full h-20 object-cover rounded-lg border border-stone-200"
              />
              <button
                type="button"
                onClick={() => remove(f.id)}
                aria-label={`Remove ${f.name}`}
                className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full w-5 h-5 text-stone-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className="w-3 h-3"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              <p className="text-xs text-stone-400 truncate mt-0.5 px-0.5">{f.name}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
