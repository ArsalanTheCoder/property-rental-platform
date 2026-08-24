export function Field({ label, htmlFor, error, hint, required, children }) {
  return (
    <div>
      {label && (
        <label
          htmlFor={htmlFor}
          className={`mb-1.5 block text-sm font-medium text-gray-700 ${
            required ? 'field-label-required' : ''
          }`}
        >
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

const controlClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors duration-150 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 disabled:bg-gray-50'

export function Input({ label, error, required, hint, className = '', ...props }) {
  return (
    <Field label={label} htmlFor={props.id} error={error} hint={hint} required={required}>
      <input
        className={`${controlClass} ${error ? 'border-red-400 hover:border-red-400' : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </Field>
  )
}

export function Select({ label, error, required, hint, className = '', children, ...props }) {
  return (
    <Field label={label} htmlFor={props.id} error={error} hint={hint} required={required}>
      <select
        className={`${controlClass} ${error ? 'border-red-400 hover:border-red-400' : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
}

export function Textarea({ label, error, required, hint, className = '', ...props }) {
  return (
    <Field label={label} htmlFor={props.id} error={error} hint={hint} required={required}>
      <textarea
        className={`${controlClass} ${error ? 'border-red-400 hover:border-red-400' : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </Field>
  )
}
