import { editProjectShell } from '@/src/lib/crypto/artblocks'
import { useEffect, useState } from 'react'
import { parseEther } from 'viem'
import {
  DecayIntervalInput,
  PriceInput,
  DateTimePicker,
  SaleTypeRadio,
  SalesDuration,
  TimedDropSelector,
} from '../../ui/Form/formfields'
import { FailureToast, SuccessToast } from '../../ui/Toast/toast'

export const EditProjectShellModal = ({
  project_id,
}: {
  project_id: number
}) => {
  const [saleType, setSaleType] = useState<SaleType>('d-auction')
  const [start, setStart] = useState<string>(
    new Date().toISOString().slice(0, -13) + '00:00',
  )
  const [decayInterval, setDecayInterval] = useState<number>(5)
  const [startPrice, setStartPrice] = useState(1.0)
  const [basePrice, setBasePrice] = useState(0.1)
  const [timedDrop, setTimedDrop] = useState<boolean>(false)
  const [duration, setDuration] = useState(1)

  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false)
  const [showFailureToast, setShowFailureToast] = useState<boolean>(false)

  const handleEditProjectShell = async (e: any) => {
    e.preventDefault()

    // Convert all values to function inputs
    const startTimestamp = new Date(start + ':00.000Z').getTime() / 1000
    const priceDecayHalfLifeSeconds =
      saleType == 'd-auction' ? decayInterval * 60 : 300
    const saleStartPrice =
      saleType == 'd-auction'
        ? parseEther(startPrice.toString())
        : parseEther(basePrice.toString())
    const saleBasePrice = parseEther(basePrice.toString())

    try {
      const tx = await editProjectShell(
        project_id,
        startTimestamp,
        priceDecayHalfLifeSeconds,
        saleStartPrice,
        saleBasePrice,
      )
      if (tx == 'success') {
        setShowSuccessToast(true)
      } else {
        setShowFailureToast(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (showSuccessToast || showFailureToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false)
        setShowFailureToast(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessToast, showFailureToast])

  return (
    <div>
      <div className="overlay fixed top-0 left-0 w-screen h-screen bg-black/60"></div>

      {/** Actual form */}
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[40rem]">
        <form className="p-6 bg-white rounded-xl">
          <h3 className="text-2xl mb-4">Edit Project Shell</h3>

          <div className="flex flex-col gap-y-3 mt-8">
            <SaleTypeRadio
              currentValue={saleType}
              setter={setSaleType}
              options={['fixed', 'd-auction']}
            />
            <DateTimePicker
              label={'Sale Start Date and Time (UTC)'}
              currentDateTime={start}
              setter={setStart}
            />

            {saleType == 'd-auction' && (
              <>
                <DecayIntervalInput
                  currentValue={decayInterval}
                  setter={setDecayInterval}
                />
                <PriceInput
                  label={'Start price (ETH)'}
                  currentValue={startPrice}
                  setter={setStartPrice}
                />
              </>
            )}
            <PriceInput
              label={
                saleType == 'd-auction' ? 'Base price (ETH)' : 'Price(ETH)'
              }
              currentValue={basePrice}
              setter={setBasePrice}
            />

            {saleType == 'fixed' && (
              <>
                <TimedDropSelector
                  currentValue={timedDrop}
                  setter={setTimedDrop}
                />
                {timedDrop && (
                  <SalesDuration currentValue={duration} setter={setDuration} />
                )}
              </>
            )}

            <div className="mt-5 flex gap-x-4 justify-between">
              <button
                className="px-8 py-2 rounded-md bg-gray-400 text-white w-fit"
                onClick={() => null}
              >
                Cancel
              </button>
              <button
                className="px-8 py-2 rounded-md bg-blue-600 text-white w-fit"
                onClick={(e: any) => handleEditProjectShell(e)}
              >
                Submit
              </button>
            </div>
          </div>
        </form>

        {showSuccessToast && <SuccessToast message={'Updated sale details'} />}
        {showFailureToast && (
          <FailureToast message={'Error updating sale details'} />
        )}
      </div>
    </div>
  )
}
