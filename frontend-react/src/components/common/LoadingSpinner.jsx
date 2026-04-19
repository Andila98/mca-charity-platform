export default function LoadingSpinner({ message = 'Loading...', fullPage = false }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  )
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }
  return <div className="flex justify-center py-12">{spinner}</div>
}
