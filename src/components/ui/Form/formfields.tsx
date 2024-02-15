// import { useEffect } from "react"

export const BooleanRadio = ({
  label,
  name,
  currentValue,
  setter,
}: {
  label: string
  name: string
  currentValue: boolean
  setter: (new_value: boolean) => void
}) => {
  return (
    <div className="flex w-full sm:flex-row flex-col gap-1">
      <label className="sm:w-1/2">{label}</label>
      <div className="flex gap-x-3">
        <div className="flex gap-x-2 items-center">
          <input
            type="radio"
            name={name + '_type'}
            id={`${label}-radio-yes`}
            className="radio radio-xs bg-gray-200"
            onChange={() => setter(true)}
            checked={currentValue == true}
          />
          <label htmlFor={`${label}-radio-yes`}>Yes</label>
        </div>
        <div className="flex gap-x-2 items-center">
          <input
            type="radio"
            name={name + '_type'}
            id={`${label}-radio-no`}
            className="radio radio-xs bg-gray-200"
            onChange={() => setter(false)}
            checked={currentValue == false}
          />
          <label htmlFor={`${label}-radio-no`}>No</label>
        </div>
      </div>
    </div>
  )
}

type NetworkTypeFieldProps = {
  currentValue: NetworkType
  setter: (value: NetworkType) => void
}
export const NetworkTypeRadio = ({
  currentValue,
  setter,
}: NetworkTypeFieldProps) => {
  return (
    <div className="flex w-full sm:flex-row flex-col gap-2">
      <label className="sm:w-1/2 mr-px">Network</label>
      <div className="flex gap-x-3 sm:w-1/2 w-full">
        <div className="flex gap-x-2 items-center">
          <input
            type="radio"
            name="network_type"
            id="network_type_ethereum"
            className="radio radio-xs bg-gray-200"
            onChange={() => setter('Ethereum')}
            checked={currentValue == 'Ethereum'}
          />
          <label htmlFor="network_type_ethereum">Ethereum</label>
        </div>
        <div className="flex gap-x-2 items-center">
          <input
            type="radio"
            name="network_type"
            id="network_type_tezos"
            className="radio radio-xs bg-gray-200"
            onChange={() => setter('Tezos')}
            checked={currentValue == 'Tezos'}
          />
          <label htmlFor="network_type_tezos">Tezos</label>
        </div>
      </div>
    </div>
  )
}

type SaleTypeFieldProps = {
  options: SaleType[]
  currentValue: SaleType
  setter: (value: SaleType) => void
}
export const SaleTypeRadio = ({
  options,
  currentValue,
  setter,
}: SaleTypeFieldProps) => {
  return (
    <div className="flex w-full sm:flex-row flex-col gap-2">
      <label className="sm:w-1/2">Sale Type</label>
      <div className="flex gap-x-3 sm:w-1/2 w-full">
        {/** dutch auction */}
        {options.includes('d-auction') && (
          <div className="flex gap-x-2 items-center">
            <input
              type="radio"
              name="sale_type"
              id="sale_type_d"
              className="radio radio-xs bg-gray-200"
              onChange={() => setter('d-auction')}
              checked={currentValue == 'd-auction'}
            />
            <label htmlFor="sale_type_d">Dutch Auction</label>
          </div>
        )}
        {/** english auction */}
        {options.includes('e-auction') && (
          <div className="flex gap-x-2 items-center">
            <input
              type="radio"
              name="sale_type"
              id="sale_type_e"
              className="radio radio-xs bg-gray-200"
              onChange={() => setter('e-auction')}
              checked={currentValue == 'e-auction'}
            />
            <label htmlFor="sale_type_e">English Auction</label>
          </div>
        )}
        {/** fixed price sale */}
        {options.includes('fixed') && (
          <div className="flex gap-x-2 items-center">
            <input
              type="radio"
              name="sale_type"
              className="radio radio-xs bg-gray-200"
              onChange={() => setter('fixed')}
              checked={currentValue == 'fixed'}
              id="sale_type_f"
            />
            <label htmlFor="sale_type_f">Fixed Price</label>
          </div>
        )}
      </div>
    </div>
  )
}

export const DropdownSelect = ({
  label,
  currentValue,
  setter,
  options,
  id,
}: {
  label: string
  currentValue: any
  setter: (newValue: any) => void
  options: any[]
  id: string
}) => {
  return (
    <div className="flex w-full sm:items-center items-start sm:flex-row flex-col gap-2">
      <label className="sm:w-1/2 ml-px" htmlFor={id}>
        {label}
      </label>
      <select
        className="text-black sm:w-1/2 w-full p-2 rounded-md bg-gray-200 border-gray-400"
        name={id}
        id={id}
        value={currentValue}
        onChange={(e: any) => setter(e.target.value)}
      >
        {options &&
          options.map((option, index) => (
            <option value={option.slug} key={index}>
              {option.name}
            </option>
          ))}
      </select>
    </div>
  )
}

export const DateTimePicker = ({
  label,
  currentDateTime,
  setter,
}: {
  label: string
  currentDateTime: string
  setter: (newDate: string) => void
}) => {
  return (
    <div className="flex w-full items-center sm:flex-row flex-col gap-2">
      <label className="sm:w-1/2 w-full mr-px" htmlFor={`${label}-date`}>
        {label}
      </label>
      <input
        type="datetime-local"
        className="sm:w-1/2 w-full bg-gray-200 text-black color-black border border-gray-400 px-2 py-1 rounded-md"
        id={`${label}-date`}
        name="start"
        value={currentDateTime.slice(0, -8)}
        onChange={(e) => setter(e.target.value + ':00.000Z')}
        min={new Date().toISOString().slice(0, -13) + '00:00'}
      />
    </div>
  )
}

export const DecayIntervalInput = ({
  currentValue,
  setter,
}: {
  currentValue: number
  setter: (newValue: number) => void
}) => {
  return (
    <div className="flex w-full items-center">
      <label className="w-1/2">
        Time interval before current price is halved (in minutes)
      </label>

      <input
        type="number"
        className="w-1/2 px-2 py-1 rounded-md bg-gray-200 border border-gray-400"
        onChange={(e) => setter(Number(e.target.value))}
        value={currentValue}
        min={5}
        step={1}
      />
    </div>
  )
}

type PriceFieldProps = {
  label: string
  currentValue: number
  setter: (newValue: number) => void
  network?: NetworkType
}

export const PriceInput = ({
  label,
  currentValue,
  setter,
  network = 'Ethereum',
}: PriceFieldProps) => {
  return (
    <div className="flex w-full sm:items-center items-start sm:flex-row flex-col gap-2">
      <label className="sm:w-1/2" htmlFor={`${label}-price`}>
        {label}
      </label>
      <input
        type="number"
        className="sm:w-1/2 w-full px-2 py-1 rounded-md bg-gray-200 border border-gray-400"
        onChange={(e) => setter(Number(e.target.value))}
        value={currentValue}
        min={network == 'Ethereum' ? 0.1 : 1}
        step={network == 'Ethereum' ? 0.1 : 1}
        id={`${label}-price`}
      />
    </div>
  )
}

export const TimedDropSelector = ({
  currentValue,
  setter,
}: {
  currentValue: boolean
  setter: (newValue: boolean) => void
}) => {
  return (
    <div className="flex w-full items-center">
      <label className="w-1/2">Is this a limited-edition or timed drop?</label>

      <input
        type="checkbox"
        className="checkbox checkbox-xs bg-gray-200"
        onChange={(e) => setter(!currentValue)}
        checked={currentValue}
      />
    </div>
  )
}

export const SalesDuration = ({
  currentValue,
  setter,
}: {
  currentValue: number
  setter: (newValue: number) => void
}) => {
  return (
    <div className="flex w-full items-center">
      <label className="w-1/2">Duration of sale (in hours)</label>

      <input
        type="number"
        className="w-1/2 px-2 py-1 rounded-md bg-gray-200 border border-gray-400"
        onChange={(e) => setter(Number(e.target.value))}
        value={currentValue}
        min={1}
        step={1}
      />
    </div>
  )
}

type InputTextProps = {
  label: string
  min_char?: number
  max_char?: number
  current_value: string
  setter: (new_value: string) => void
  disabled?: boolean
}
export const InputTextField = ({
  label,
  min_char = 3,
  max_char = 15,
  current_value,
  setter,
  disabled = false,
}: InputTextProps) => {
  return (
    <div className="flex w-full items-center sm:flex-row flex-col gap-2">
      <label className="sm:w-1/2 w-full mr-px" htmlFor={`${label}-input`}>
        {label}
      </label>
      <input
        type="text"
        className="sm:w-1/2 w-full bg-gray-200 text-black color-black border border-gray-400 px-2 py-1 rounded-md"
        value={current_value}
        onChange={(e) => setter(e.target.value)}
        minLength={min_char ?? 3}
        maxLength={max_char ?? 15}
        disabled={disabled}
        id={`${label}-input`}
      />
    </div>
  )
}

type NumberInputProps = {
  label: string
  min_value?: number
  max_value?: number
  current_value: number
  setter: (new_value: number) => void
  disabled?: boolean
}
export const NumberInput = ({
  label,
  min_value,
  max_value,
  current_value,
  setter,
  disabled = false,
}: NumberInputProps) => {
  return (
    <div className="flex w-full sm:items-center items-start sm:flex-row flex-col gap-2">
      <label className="sm:w-1/2" htmlFor={`${label}-input`}>
        {label}
      </label>
      <input
        type="number"
        className="sm:w-1/2 w-full bg-gray-200 text-black color-black border border-gray-400 px-2 py-1 rounded-md"
        value={current_value}
        id={`${label}-input`}
        onChange={(e) => setter(Number(e.target.value))}
        min={min_value ?? undefined}
        max={max_value ?? undefined}
        disabled={disabled}
      />
    </div>
  )
}

export const FileInput = ({
  accept,
  message = 'Click to Upload',
  onChange = () => {},
  className,
  disabled,
  ...props
}: {
  accept: string
  message?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
  [key: string]: any
}) => {
  return (
    <div className="flex w-full sm:items-center items-start sm:flex-row flex-col gap-2">
      <label className="sm:w-1/2">{message}</label>

      <div className={`sm:w-1/2 w-full flex ${className ? className : ''}`}>
        <input type="file" accept={accept} onChange={(e) => onChange(e)} />
      </div>
    </div>
  )
}

export const FolderUpload = ({
  accept,
  message = 'Click to Upload',
  onChange = () => {},
  className,
  disabled,
  ...props
}: {
  accept: string
  message?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
  [key: string]: any
}) => {
  return (
    <div className="flex w-full sm:items-center items-start sm:flex-row flex-col gap-2">
      <label className="sm:w-1/2">{message}</label>
      <div className={`sm:w-1/2 w-full flex ${className ? className : ''}`}>
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e)}
          // @ts-ignore
          webkitdirectory=""
          // @ts-ignore
          mozdirectory=""
        />
      </div>
    </div>
  )
}

interface TextareaFieldProps {
  label: string
  min_char: number
  max_char: number
  current_value: string
  setter: (value: string) => void
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  min_char,
  max_char,
  current_value,
  setter,
}) => {
  return (
    <div className="flex w-full sm:items-center items-start sm:flex-row flex-col gap-2">
      <label className="sm:w-1/2" htmlFor={`${label}-text`}>
        {label}
      </label>
      <div className="sm:w-1/2 w-full">
        <textarea
          id={`${label}-text`}
          value={current_value}
          onChange={(e) => setter(e.target.value)}
          maxLength={max_char}
          rows={5}
          className="w-full bg-gray-200 text-black color-black border border-gray-400 px-2 py-1 rounded-md" // Add styling here
        />
        <div>
          {current_value.length}/{max_char} characters
        </div>
      </div>
    </div>
  )
}
