import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'

export function isBlobUrl(url) {
  return typeof url === 'string' && url.startsWith('blob:')
}

let fileKeyCounter = 0
function nextKey() {
  fileKeyCounter += 1
  return `file-${fileKeyCounter}`
}

/**
 * Production-ready Image Picker with instant preview and multi-file selection for Cloudinary upload.
 */
export default function ImagePicker({
  existingImages = [],
  onExistingImagesChange,
  newFiles = [],
  onNewFilesChange,
  hint,
}) {
  const inputRef = useRef(null)
  const [filePreviews, setFilePreviews] = useState([])

  // Generate previews for selected File objects
  useEffect(() => {
    const previews = newFiles.map((file) => ({
      key: file.__pickerKey || (file.__pickerKey = nextKey()),
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      previewUrl: URL.createObjectURL(file),
    }))

    setFilePreviews(previews)

    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    }
  }, [newFiles])

  function handleFileSelect(event) {
    const files = Array.from(event.target.files ?? [])
    const acceptedImages = files.filter(
      (file) => file.type && file.type.startsWith('image/')
    )

    if (acceptedImages.length > 0) {
      const combined = [...newFiles, ...acceptedImages].slice(0, 10)
      onNewFilesChange?.(combined)
    }

    event.target.value = ''
  }

  function removeExistingImage(indexToRemove) {
    const updated = existingImages.filter((_, idx) => idx !== indexToRemove)
    onExistingImagesChange?.(updated)
  }

  function removeNewFile(indexToRemove) {
    const updated = newFiles.filter((_, idx) => idx !== indexToRemove)
    onNewFilesChange?.(updated)
  }

  const totalCount = (existingImages?.length || 0) + (newFiles?.length || 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm border border-gray-200">
            <Icon name="photo" className="h-5 w-5" />
          </div>
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              <Icon name="arrow-up-tray" className="mr-1.5 h-4 w-4" />
              Choose Images from Computer
            </Button>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-gray-500">
              {hint ??
                'Select property photos (.jpg, .png, .webp). Photos will be uploaded to Cloudinary CDN upon saving.'}
            </p>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        className="sr-only"
        onChange={handleFileSelect}
      />

      {totalCount > 0 && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-gray-900">
            Property Photos ({totalCount}/10)
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Existing Cloudinary Images */}
            {existingImages?.map((url, idx) => (
              <div
                key={`existing-${url}-${idx}`}
                className="group relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={url}
                  alt={`Property photo ${idx + 1}`}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover bg-gray-100"
                />
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    Uploaded (Cloudinary)
                  </span>
                  <p className="truncate text-xs text-gray-500 mt-1">Photo #{idx + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* 2. Newly Selected Local Files */}
            {filePreviews.map((preview, idx) => (
              <div
                key={preview.key}
                className="group relative flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/40 p-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={preview.previewUrl}
                  alt={preview.name}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover bg-gray-100"
                />
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                    Ready to Upload ({preview.size})
                  </span>
                  <p className="truncate text-xs font-medium text-gray-800 mt-1">
                    {preview.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeNewFile(idx)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
