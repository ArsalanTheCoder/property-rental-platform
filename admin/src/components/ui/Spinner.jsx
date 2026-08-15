export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-[2.5px]', lg: 'h-12 w-12 border-4' }
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-blue-600 ${sizes[size]} ${className}`}
    />
  )
}
