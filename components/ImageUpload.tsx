'use client'

import { useRef } from 'react'

export interface UploadedFile {
  id: string
  name: string
  previewUrl: string
}

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

  function handleFileList(fileList: FileList | null) {
    if (!fileList) return
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      // TODO: Upload to storage (S3, Cloudflare R2, Vercel Blob…) and store
      //   the returned URL instead. Delete the object URL after upload.
    }))
    onChange([...files, ...newFiles])
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
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileList(e.target.files)}
        />
      </div>

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
