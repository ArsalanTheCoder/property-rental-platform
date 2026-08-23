import { Icon } from './Icon.jsx'

export function Table({ headers, children, empty }) {
  const isEmpty = children == null || (Array.isArray(children) && children.length === 0)
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm shadow-gray-200/50">
      <table className="min-w-full divide-y divide-gray-200">
        {headers && (
          <thead className="bg-gray-50/80">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key ?? header.label}
                  scope="col"
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-100">
          {isEmpty ? (
            <tr>
              <td colSpan={headers?.length ?? 1} className="px-4 py-14">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Icon name="inbox" className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-gray-500">{empty ?? 'No records to display.'}</p>
                </div>
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  )
}

export function TableRow({ className = '', children }) {
  return (
    <tr className={`transition-colors duration-100 hover:bg-gray-50/70 ${className}`}>{children}</tr>
  )
}

export function TableCell({ className = '', children }) {
  return <td className={`px-4 py-3.5 align-middle text-sm text-gray-700 ${className}`}>{children}</td>
}
