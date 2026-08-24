export function ComingSoon({ title = 'This feature' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <p className="text-sm font-medium text-gray-700">Feature coming soon</p>
      <p className="text-sm text-gray-500">This module has not been implemented yet.</p>
    </div>
  )
}
