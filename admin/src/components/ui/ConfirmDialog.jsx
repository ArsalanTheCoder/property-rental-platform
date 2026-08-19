import { useId } from 'react'
import { Button } from './Button.jsx'
import { Modal } from './Modal.jsx'

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, loading = false }) {
  const titleId = useId()
  const messageId = useId()
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      titleId={titleId}
      describedBy={messageId}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p id={messageId}>{message}</p>
    </Modal>
  )
}
