import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useForm } from '../../hooks/useForm.js'
import { validators } from '../../utils/validators.js'
import authService from '../../services/authService.js'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Field.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Icon } from '../../components/ui/Icon.jsx'

const initialValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function CardHeader({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { values, errors, setValue, onBlur, validateForm, reset } = useForm(initialValues, {
    currentPassword: validators.required,
    newPassword: [validators.required, validators.password],
    confirmPassword: [validators.required, validators.matches('newPassword')],
  })

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validateForm() || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await authService.changePassword(values.currentPassword, values.newPassword)
      toast.success('Password changed successfully.')
      reset()
    } catch (err) {
      setFormError(err?.message ?? 'Unable to change the password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-800 text-white shadow-sm">
          <Icon name="cog" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Settings</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage your account and security</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader
          icon="user-circle"
          title="Account"
          description="Your profile information as shown in the admin panel."
        />
        <dl className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Icon name="user-circle" className="h-4 w-4" />
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Name</dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-900">{user?.name ?? '—'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Icon name="envelope" className="h-4 w-4" />
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-900">{user?.email ?? '—'}</dd>
            </div>
          </div>
        </dl>
      </Card>

      <Card className="mt-6">
        <CardHeader
          icon="lock"
          title="Security"
          description="Keep your account secure by updating your password regularly."
        />
        <form onSubmit={handleSubmit} noValidate className="p-5">
          {formError && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              <Icon name="alert" className="h-5 w-5 shrink-0" />
              {formError}
            </div>
          )}
          <div className="space-y-4">
            <Input
              id="currentPassword"
              label="Current password"
              required
              type="password"
              autoComplete="current-password"
              value={values.currentPassword}
              onChange={(e) => setValue('currentPassword', e.target.value)}
              onBlur={() => onBlur('currentPassword')}
              error={errors.currentPassword}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="newPassword"
                label="New password"
                required
                type="password"
                autoComplete="new-password"
                value={values.newPassword}
                onChange={(e) => setValue('newPassword', e.target.value)}
                onBlur={() => onBlur('newPassword')}
                error={errors.newPassword}
              />
              <Input
                id="confirmPassword"
                label="Confirm new password"
                required
                type="password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(e) => setValue('confirmPassword', e.target.value)}
                onBlur={() => onBlur('confirmPassword')}
                error={errors.confirmPassword}
              />
            </div>
            <p className="text-xs text-gray-500">
              Current password plus a new password (at least 8 characters). The exact policy
              follows the backend authentication contract.
            </p>
            <Button type="submit" loading={submitting} disabled={submitting}>
              <Icon name="key" className="h-4 w-4" />
              Change password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
