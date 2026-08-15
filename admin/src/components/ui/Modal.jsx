import { useEffect, useId, useRef } from 'react'

export function Modal({ open, onClose, title, titleId, describedBy, children, footer }) {
  const generatedTitleId = useId()
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const restoreFocusRef = useRef(null)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    restoreFocusRef.current = document.activeElement
    const dialog = dialogRef.current
    if (dialog) {
      const focusable = [
        ...dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ),
      ]
      const target = focusable[0]
      if (target) target.focus()
      else dialog.focus()
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const focusable = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (restoreFocusRef.current?.focus) restoreFocusRef.current.focus()
    }
  }, [open])

  if (!open) return null

  const labelId = titleId ?? (title ? generatedTitleId : undefined)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
    >
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
      >
        {title && (
          <h2 id={labelId} className="mb-4 text-lg font-semibold text-gray-900">
            {title}
          </h2>
        )}
        <div className="text-sm text-gray-700">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
