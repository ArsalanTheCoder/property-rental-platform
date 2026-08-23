import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'

export function isBlobUrl(url) {
  return typeof url === 'string' && url.startsWith('blob:')
}

let imageKeyCounter = 0

function nextKey() {
  imageKeyCounter += 1
  return `local-image-${imageKeyCounter}`
}

/**
 * Frontend-only local image picker for the property form.
 *
 * Local images are previewed with browser object URLs and surfaced to the
 * parent as blob: URLs so the mock property flow can retain and display them
 * during the current session. Nothing is uploaded to a server — the real
 * backend/upload contract is pending (owner: Mohammad Arsalan).
 */
export default function ImagePicker({ images = [], onChange, hint }) {
  const inputRef = useRef(null)
  const [items, setItems] = useState(() =>
    images.filter(isBlobUrl).map((url) => ({ key: nextKey(), name: null, objectUrl: url }))
  )

  // Keep latest values in refs so the unmount cleanup never sees stale state.
  const latestImagesRef = useRef(images)
  latestImagesRef.current = images
  const itemsRef = useRef(items)
  itemsRef.current = items

  // Revoke object URLs that were never persisted (removed/abandoned previews).
  // URLs still present in `images` (e.g. submitted to the mock) are left alive
  // so the detail page can keep rendering them for the current session.
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (!latestImagesRef.current.includes(item.objectUrl)) {
          URL.revokeObjectURL(item.objectUrl)
        }
      })
    }
  }, [])

  function handleFiles(event) {
    const files = Array.from(event.target.files ?? [])
    // Prevent obvious non-image files from being accepted.
    const accepted = files.filter((file) => file.type && file.type.startsWith('image/'))
    if (accepted.length) {
      const nextItems = [
        ...items,
        ...accepted.map((file) => ({
          key: nextKey(),
          name: file.name,
          objectUrl: URL.createObjectURL(file),
        })),
      ]
      setItems(nextItems)
      onChange(nextItems.map((item) => item.objectUrl))
    }
    // Reset so picking the same file again still fires the change event.
    event.target.value = ''
  }

  function removeImage(key) {
    const removed = items.find((item) => item.key === key)
    const nextItems = items.filter((item) => item.key !== key)
    setItems(nextItems)
    onChange(nextItems.map((item) => item.objectUrl))
    if (removed) {
      URL.revokeObjectURL(removed.objectUrl)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400 shadow-sm">
            <Icon name="arrow-up-tray" className="h-5 w-5" />
          </div>
          <div>
            <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
              Choose Images
            </Button>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-gray-500">
              {hint ??
                'Select property photos from your PC. Local selection is preview/mock only — images are not uploaded to a server yet.'}
            </p>
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        data-testid="image-file-input"
        aria-label="Choose images"
        onChange={handleFiles}
      />
      {items.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-900">Selected images</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {items.length} {items.length === 1 ? 'image' : 'images'} ready for the current session
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.key}
                className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm transition-shadow duration-150 hover:shadow-md"
              >
                <img
                  src={item.objectUrl}
                  alt={item.name ?? 'Selected image'}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.name ?? 'Local image'}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeImage(item.key)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600 transition-colors hover:text-red-700"
                    aria-label={`Remove ${item.name ?? 'image'}`}
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
