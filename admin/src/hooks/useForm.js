import { useCallback, useMemo, useState } from 'react'

export function useForm(initialValues, validators = {}) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})

  const validateField = useCallback(
    (name, value) => {
      const rule = validators[name]
      if (!rule) return null
      const run = (r) => (typeof r === 'function' ? r(value, values) : r.validate(value, values))
      if (Array.isArray(rule)) {
        for (const r of rule) {
          const error = run(r)
          if (error) return error
        }
        return null
      }
      return run(rule)
    },
    [validators, values]
  )

  const validateForm = useCallback(() => {
    const next = {}
    Object.keys(validators).forEach((name) => {
      const error = validateField(name, values[name])
      if (error) next[name] = error
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }, [validators, validateField, values])

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }))
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    },
    [validateField]
  )

  const setValuesMany = useCallback((patch) => {
    setValues((prev) => ({ ...prev, ...patch }))
  }, [])

  const onBlur = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    setValues((prev) => {
      setErrors((e) => ({ ...e, [name]: validateField(name, prev[name]) }))
      return prev
    })
  }, [validateField])

  const reset = useCallback((nextValues) => {
    setValues(nextValues ?? initialValues)
    setTouched({})
    setErrors({})
  }, [initialValues])

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors])

  return {
    values,
    touched,
    errors,
    isValid,
    setValue,
    setValuesMany,
    onBlur,
    validateForm,
    reset,
  }
}
