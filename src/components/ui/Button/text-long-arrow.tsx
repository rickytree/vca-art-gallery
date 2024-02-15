import { ArrowLongRightIcon } from '@heroicons/react/24/outline'

export const TextWithLongArrow = ({
  text,
  className,
}: {
  text: string
  className?: string
}) => {
  return (
    <div className="flex items-center gap-x-2">
      <span>{text}</span>
      <ArrowLongRightIcon className="w-5" />
    </div>
  )
}
