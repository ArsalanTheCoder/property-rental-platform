export function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm shadow-gray-200/50 ${className}`}
    >
      {children}
    </div>
  )
}
