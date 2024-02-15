type BoxButtonProps = {
  label: string
  link: string
}

const DiagonalArrow = () => {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="black"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
      ></path>
    </svg>
  )
}

export const BoxButton = ({ label, link }: BoxButtonProps) => {
  return (
    <a
      className="relative rounded-md border-gray-300 border-2 px-4 pt-10 pb-4 box-button-hover-background hover:border-gray-600 hover:text-white"
      href={link}
    >
      <div className="">
        <div className="absolute right-2 top-2">
          <DiagonalArrow />
        </div>
        <span className="text-xl font-mono">{label}</span>
      </div>
    </a>
  )
}
