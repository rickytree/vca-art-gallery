export const SuccessToast = ({
  title,
  message,
}: {
  title?: string
  message: string
}) => {
  return (
    <div className="fixed bottom-4 right-4 w-fit flex items-center gap-x-3 alert bg-emerald-300 text-gray-800 z-[10000]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex flex-col gap-y-[1] items-start">
        {title && <span className="font-medium">{title}</span>}
        <span dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    </div>
  )
}

export const FailureToast = ({ message }: { message: string }) => {
  return (
    <div className="fixed bottom-4 right-4 w-fit flex gap-x-3 alert bg-red-300 text-gray-800 z-[10000]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <span>{message}</span>
    </div>
  )
}
