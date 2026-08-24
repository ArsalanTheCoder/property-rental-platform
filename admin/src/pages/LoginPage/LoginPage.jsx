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
      setFormError(err?.message ?? 'Unable to sign in. Please check your credentials.')
      setSubmitting(false)
    }
  }

  function autofillAdmin() {
    setValue('identifier', 'admin@rentalplatform.com')
    setValue('password', 'AdminSecurePass123!')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30">
            <Icon name="home" className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            HAVEN Admin Portal
          </h1>
          <p className="mt-1.5 text-xs text-slate-400 font-medium">
            Authorized management access for Property Rental Platform
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl"
        >
          {formError && (
            <div
              role="alert"
              className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300"
            >
              <Icon name="alert" className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Email
              </label>
              <input
                id="identifier"
                type="email"
                autoComplete="email"
                value={values.identifier}
                onChange={(e) => setValue('identifier', e.target.value)}
                onBlur={() => onBlur('identifier')}
                placeholder="admin@rentalplatform.com"
                className="w-full rounded-xl border border-slate-750 bg-slate-800/80 px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              {errors.identifier && (
                <p className="mt-1 text-xs text-rose-400 font-semibold">{errors.identifier}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) => setValue('password', e.target.value)}
                onBlur={() => onBlur('password')}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-750 bg-slate-800/80 px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400 font-semibold">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50"
            >
              {submitting ? 'Authenticating…' : 'Sign in to Dashboard'}
            </button>
          </div>

          {/* Quick Demo Autofill Helper */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Demo Master Admin</span>
            <button
              type="button"
              onClick={autofillAdmin}
              className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Autofill Credentials
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          HAVEN Property Rental Platform · Secure Enterprise Admin
        </p>
      </div>
    </div>
  )
}
