import clsx from 'clsx'

export const CancelAndCTAButtons = ({
  back_button_label,
  back_button_link,
  cta_button_label,
  cta_button_action,
  cta_button_loading = false,
}: {
  back_button_label: string
  back_button_link: string
  cta_button_label: string
  cta_button_action: any
  cta_button_loading?: boolean
}) => {
  return (
    <div className="mt-10 flex gap-x-4 justify-between">
      <button
        className="px-8 py-2 rounded-md bg-gray-400 text-white w-fit border-2 border-gray-500 hover:bg-gray-800"
        onClick={() => (window.location.href = back_button_link)}
      >
        {back_button_label}
      </button>
      <button
        className={clsx(
          'border-2 border-gray-500 px-8 py-2 rounded-md bg-black text-white w-fit flex items-center gap-2',
          cta_button_loading
            ? 'cursor-not-allowed'
            : 'hover:bg-gray-700 hover:border-gray-800',
        )}
        onClick={cta_button_action}
        disabled={cta_button_loading}
      >
        {cta_button_loading && <ButtonLoading />}
        {cta_button_label}
      </button>
    </div>
  )
}

export const ButtonLoading = () => {
  return (
    <svg
      className="animate-spin h-5 w-5 text-indigo-200"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  )
}
