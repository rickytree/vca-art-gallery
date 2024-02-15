import {
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

export const FilterMenuItem = ({
  label,
  options,
  currentFilters,
  setFilters,
}: {
  label: string
  options: any
  currentFilters: any
  setFilters: any
}) => {
  const [checked, setChecked] = useState<boolean>(false)
  const optionsArr = Object.keys(options)

  const handleFilterClick = (option: any) => {
    let newFilters = currentFilters[label] || []

    if (newFilters.includes(option)) {
      const index = newFilters.indexOf(option)
      newFilters.splice(index, 1)
    } else {
      newFilters = [...newFilters, option]
    }

    const filters = { ...currentFilters }
    filters[label] = newFilters

    setFilters(filters)
  }

  return (
    <div className="collapse bg-gray-100 cursor-pointer">
      <input
        type="checkbox"
        className="peer"
        onChange={(e: any) => setChecked(e.target.checked)}
      />
      <div className="collapse-title flex items-center justify-between px-4">
        <span className="font-bold">{label}</span>
        {checked == false ? (
          <ChevronDownIcon className="w-6 h-6" />
        ) : (
          <ChevronUpIcon className="w-6 h-6" />
        )}
      </div>
      <div className="collapse-content flex flex-col gap-y-2 ml-4">
        {optionsArr.map((option: any) => {
          return (
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => handleFilterClick(option)}
            >
              <span
                className={`${
                  currentFilters[label] &&
                  currentFilters[label].includes(option)
                    ? 'text-blue-400'
                    : ''
                }`}
              >
                {option}
              </span>
              <span className="font-mono text-xs block w-10 py-1 text-center border border-gray-400 rounded">
                {options[option]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const FilterBadge = ({
  label,
  value,
  currentFilters,
  setter,
}: {
  label: string
  value: any
  currentFilters: any
  setter: any
}) => {
  const handleDeleteFilter = () => {
    let _currentFilters = currentFilters[label]
    const index = _currentFilters.indexOf(label)
    _currentFilters.splice(index, 1)

    const filters = { ...currentFilters }
    filters[label] = _currentFilters

    setter(filters)
  }

  return (
    <div className="badge badge-info bg-white border-gray-800 gap-2 rounded-xl text-black cursor-pointer">
      <svg
        onClick={() => handleDeleteFilter()}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="inline-block w-4 h-4 stroke-current"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
      <div className="flex items-center gap-x-1">
        <span>{label}:</span>
        <span>{value.toString()}</span>
      </div>
    </div>
  )
}
