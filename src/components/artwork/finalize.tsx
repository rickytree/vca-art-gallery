import { finalizeListing } from '@/src/lib/crypto/ethereum'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { FailureToast, SuccessToast } from '../ui/Toast/toast'

export const FinalizeButton = ({ listing_id }: { listing_id: number }) => {
  const { address } = useAccount()

  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false)
  const [showFailureToast, setShowFailureToast] = useState<boolean>(false)

  const handleFinalizeListing = async (e: any) => {
    e.preventDefault()

    try {
      if (address) {
        const result = await finalizeListing(listing_id)

        if (result) {
          setShowSuccessToast(true)
        } else {
          setShowFailureToast(true)
        }
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
    <>
      <button
        className={`text-white text-md py-1 px-4 w-full rounded-md cursor-pointer bg-gray-600`}
        onClick={(e: any) => handleFinalizeListing(e)}
      >
        Conclude
      </button>

      {showSuccessToast && (
        <SuccessToast
          title="Concluded sale successfully!"
          message={'The artwork will be transferred to the collector.'}
        />
      )}
      {showFailureToast && <FailureToast message={'Error concluding sale'} />}
    </>
  )
}
