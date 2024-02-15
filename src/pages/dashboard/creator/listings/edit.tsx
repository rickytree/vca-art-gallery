import { CancelAndCTAButtons } from '@/src/components/creator/cta_cancel_buttons'
import {
  DateTimePicker,
  InputTextField,
  NumberInput,
  PriceInput,
} from '@/src/components/ui/Form/formfields'
import { FailureToast, SuccessToast } from '@/src/components/ui/Toast/toast'
import {
  getUserEthListings,
  updateMarketplaceListing,
} from '@/src/lib/crypto/ethereum'
import { addDays } from '@/src/lib/utils'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { formatEther, isAddress, parseEther } from 'viem'
import { useAccount } from 'wagmi'

const EditListingPage = () => {
  const { address } = useAccount()
  const router = useRouter()

  const [contractAddress, setContractAddress] = useState<string>('')
  const [tokenId, setTokenId] = useState<number>(0)

  const [start, setStart] = useState<string>(
    new Date(addDays(new Date().toString(), 1)).toISOString().slice(0, -8) +
      ':00.000Z',
  )
  const [end, setEnd] = useState<string>(
    new Date(addDays(new Date().toString(), 2)).toISOString().slice(0, -8) +
      ':00.000Z',
  )

  const [startPrice, setStartPrice] = useState<number>(1.0)
  const [listingId, setListingId] = useState<number | undefined>(undefined)

  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false)
  const [showFailureToast, setShowFailureToast] = useState<boolean>(false)

  /*     useEffect(() => {
      // redirect to main
      router.push('/')
    }, []) */

  const handleUpdateListing = async (e: any) => {
    e.preventDefault()

    // if ethereum contract & user is connected
    if (isAddress(contractAddress) && address) {
      const txn = await updateMarketplaceListing({
        listing_id: listingId || 0,
        initial_amount: parseEther(startPrice.toString()),
        start_time: new Date(start).getTime() / 1000,
        end_time: new Date(end).getTime() / 1000,
      })

      if (txn == 'success') {
        setShowSuccessToast(true)
      } else {
        setShowFailureToast(true)
      }
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
    const getListingDetails = async () => {
      // verify owner
      const userListings = await getUserEthListings(address!)

      const filteredListings = userListings.filter(
        (listing: any) =>
          listing.nft.toLowerCase() ==
            (router.query.contract! as string).toLowerCase() &&
          listing.tokenId == (router.query.id as string),
      )

      // user is owner of listing - get info
      if (filteredListings && filteredListings.length > 0) {
        setStart(
          new Date(filteredListings[0].startTime * 1000)
            .toISOString()
            .slice(0, -8) + ':00.000Z',
        )
        setEnd(
          new Date(filteredListings[0].endTime * 1000)
            .toISOString()
            .slice(0, -8) + ':00.000Z',
        )
        setStartPrice(Number(formatEther(filteredListings[0].initialAmount)))
        setListingId(Number(filteredListings[0].id.split('/')[1]))
        setTokenId(Number(router.query.id as string))
        setContractAddress(router.query.contract as string)
      }
    }

    if (router.query.contract && router.query.id && address) {
      getListingDetails()
    }
  }, [router])

  return (
    <div className="max-w-7xl mx-auto px-8 p-10 min-h-screen">
      {listingId ? (
        <form className="p-6 bg-white rounded-xl">
          <h3 className="text-2xl mb-4">Update your sales listing</h3>

          <div className="flex flex-col gap-y-3 mt-8">
            {/** contract address */}
            <InputTextField
              label="Token contract address"
              max_char={68}
              current_value={contractAddress}
              setter={setContractAddress}
              disabled
            />

            {/** token id */}
            <NumberInput
              label={'Token id'}
              current_value={tokenId}
              setter={setTokenId}
              disabled
            />

            {/** sale start / end dates */}
            <DateTimePicker
              label={'Sale Start Date and Time (UTC)'}
              currentDateTime={start}
              setter={setStart}
            />

            <DateTimePicker
              label={'Sale End Date and Time (UTC)'}
              currentDateTime={end}
              setter={setEnd}
            />

            {/** starting price - for all */}
            <PriceInput
              label={'Starting price'}
              currentValue={startPrice}
              setter={setStartPrice}
              network={isAddress(contractAddress) ? 'Ethereum' : 'Tezos'}
            />

            <CancelAndCTAButtons
              back_button_label="Cancel"
              back_button_link="/dashboard/creator/listings"
              cta_button_label={'Update listing'}
              cta_button_action={(e: any) => handleUpdateListing(e)}
            />
          </div>

          {showSuccessToast && (
            <SuccessToast
              title={'Edited listing successfully!'}
              message={`<a class="underline" href='/artwork/${contractAddress}/${tokenId.toString()}' target="_blank" rel="noreferrer">View listing</a>`}
            />
          )}
          {showFailureToast && (
            <FailureToast message={'Error updating listing'} />
          )}
        </form>
      ) : (
        <div>You are not authorized.</div>
      )}
    </div>
  )
}

export default EditListingPage
