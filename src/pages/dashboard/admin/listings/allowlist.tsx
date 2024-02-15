import { CancelAndCTAButtons } from '@/src/components/creator/cta_cancel_buttons'
import {
  InputTextField,
  NumberInput,
} from '@/src/components/ui/Form/formfields'
import { FailureToast, SuccessToast } from '@/src/components/ui/Toast/toast'
import { ETHERSCAN_URL } from '@/src/lib/constants'
import { addUserToWhitelist } from '@/src/lib/crypto/ethereum'
import { useUserStore } from '@/src/lib/store'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

const ManageAllowlistPage = () => {
  const { address } = useAccount()
  const router = useRouter()

  const [listingId, setListingId] = useState<number>(0)
  const [hydrated, setHydrated] = useState<boolean>(false)
  const [whitelistedAddress, setWhitelistedAddress] = useState<string>('')

  const [whitelistingLoading, setWhitelistingLoading] = useState<boolean>(false)

  const [txHash, setTxHash] = useState<string>('')
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false)
  const [showFailureToast, setShowFailureToast] = useState<boolean>(false)
  const userRole = useUserStore((state: any) => state.userRole)

  const handleWhitelisting = async (e: any) => {
    if (!address || !whitelistedAddress || listingId == 0) {
      return
    }

    setWhitelistingLoading(true)
    e.preventDefault()

    let tx: any = ''

    // returns the cid for metadata
    tx = await addUserToWhitelist(
      router.query.contract as string,
      router.query.token_id as string,
      listingId,
      [whitelistedAddress],
    )

    if (tx && tx[0] == 'success') {
      setShowSuccessToast(true)
      setTxHash(tx[1])
    } else {
      setShowFailureToast(true)
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

  useEffect(() => {
    if(router.query.id) {
      setListingId(Number(router.query.id as string))
    }
  }, [router])

  useEffect(() => {
    setHydrated(true)
  }, [userRole])

  return (
    <div className="max-w-7xl mx-auto px-8 p-10 min-h-screen">
      {userRole == 'admin' && hydrated ? (
        <div className="sm:p-6 bg-white rounded-xl">
          <h3 className="text-2xl mb-4">Add allowlist </h3>

          <div className="flex flex-col gap-y-3 mt-8 mb-8">
            <NumberInput
              label="Listing id"
              min_value={0}
              current_value={listingId}
              setter={setListingId}
            />

            <InputTextField
              label="Add whitelisted address"
              min_char={1}
              max_char={42}
              current_value={whitelistedAddress}
              setter={setWhitelistedAddress}
            />

            <CancelAndCTAButtons
              back_button_label="Cancel"
              back_button_link="/dashboard/admin/"
              cta_button_label="Whitelist user"
              cta_button_action={(e: any) => handleWhitelisting(e)}
              cta_button_loading={whitelistingLoading}
            />
          </div>

          {showSuccessToast && (
            <SuccessToast
              title={`Added to whitelist`}
              message={`<a class="underline" href=${
                ETHERSCAN_URL + 'tx/' + txHash
              } target="_blank" rel="noreferrer">View transaction</a>`}
            />
          )}
          {showFailureToast && (
            <FailureToast message={'Error whitelisting address'} />
          )}
        </div>
      ) : (
        <p>Not authorized</p>
      )}
    </div>
  )
}

export default ManageAllowlistPage
