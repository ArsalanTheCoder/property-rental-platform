import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useForm } from '../../hooks/useForm.js'
import { validators } from '../../utils/validators.js'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Field.jsx'
import { Icon } from '../../components/ui/Icon.jsx'

const initialValues = { identifier: '', password: '' }

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { values, errors, setValue, onBlur, validateForm } = useForm(initialValues, {
    identifier: validators.required,
    password: validators.required,
  })

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validateForm() || submitting) return
    setSubmitting(true)
    setFormError(null)
    try {
      await login(values.identifier.trim(), values.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(err?.message ?? 'Unable to sign in. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Icon name="home" className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            Property Rental Admin
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Sign in to manage your rental properties
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm shadow-gray-200/60"
        >
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
              id="identifier"
              label="Email or username"
              required
              type="text"
              autoComplete="username"
              value={values.identifier}
              onChange={(e) => setValue('identifier', e.target.value)}
              onBlur={() => onBlur('identifier')}
              error={errors.identifier}
            />
            <Input
              id="password"
              label="Password"
              required
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={(e) => setValue('password', e.target.value)}
              onBlur={() => onBlur('password')}
              error={errors.password}
            />
            <Button type="submit" className="w-full" size="lg" loading={submitting} disabled={submitting}>
              Sign in
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Property Rental Management · Admin Panel
        </p>
      </div>
    </div>
  )
}
