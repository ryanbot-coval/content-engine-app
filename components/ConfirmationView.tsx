interface Props {
  topicTitle: string
  onReset: () => void
}

export default function ConfirmationView({ topicTitle, onReset }: Props) {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Content Engine'
  const message =
    process.env.NEXT_PUBLIC_CONFIRMATION_MESSAGE ||
    "You'll receive an email when your bundle is ready."

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
          {/* Check icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Bundle queued!</h1>

          {topicTitle && (
            <p className="text-slate-500 text-sm mb-4">
              &ldquo;{topicTitle}&rdquo;
            </p>
          )}

          <p className="text-slate-600 text-sm mb-8">{message}</p>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" />
            </svg>
            Submit another topic
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">{companyName} Content Engine</p>
      </div>
    </div>
  )
}
