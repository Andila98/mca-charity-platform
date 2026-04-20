import clsx from 'clsx'

export function FormField({ label, error, required, children, help }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Input({ error, className, ...props }) {
  return <input className={clsx('input', error && 'input-error', className)} {...props} />
}

export function Select({ error, className, children, ...props }) {
  return (
    <select className={clsx('input', error && 'input-error', className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ error, className, rows = 4, ...props }) {
  return <textarea rows={rows} className={clsx('input', error && 'input-error', className)} {...props} />
}
