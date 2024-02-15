import { CreatorArtwork } from '@/src/components/creator/creator_artwork_view'
import { CancelAndCTAButtons } from '@/src/components/creator/cta_cancel_buttons'
import {
  BooleanRadio,
  DateTimePicker,
  DropdownSelect,
  InputTextField,
  NetworkTypeRadio,
  NumberInput,
  PriceInput,
  SaleTypeRadio,
} from '@/src/components/ui/Form/formfields'
import { FailureToast, SuccessToast } from '@/src/components/ui/Toast/toast'
import {
  approveAllForContract,
  checkEthTokenApprovals,
  createEthMarketplaceListing,
} from '@/src/lib/crypto/ethereum'
import {
  ADD_TOKEN_TO_EXHIBITION,
  GET_ALL_AVAILABLE_EXHIBITIONS,
} from '@/src/lib/database/exhibition'
import { addDays } from '@/src/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'

const CreateListingPage = () => {
  const {
    loading,
    error,
    data: exhibition_data,
  } = useQuery(GET_ALL_AVAILABLE_EXHIBITIONS)
  const [addTokenToExhibition, { data: add_mutation_data }] = useMutation(
    ADD_TOKEN_TO_EXHIBITION,
  )

  const { address } = useAccount()
  const router = useRouter()

  const [network, setNetwork] = useState<NetworkType>('Ethereum')
  const [contractAddress, setContractAddress] = useState<string>('')
  const [tokenId, setTokenId] = useState<number>(0)
  const [tokenApproved, setTokenApproved] = useState<boolean>(false)

  const [saleType, setSaleType] = useState<SaleType>('fixed')
  const [start, setStart] = useState<string>(
    new Date(addDays(new Date().toString(), 1)).toISOString().slice(0, -8) +
      ':00.000Z',
  )
  const [end, setEnd] = useState<string>(
    new Date(addDays(new Date().toString(), 2)).toISOString().slice(0, -8) +
      ':00.000Z',
  )

  const [startPrice, setStartPrice] = useState<number>(1.0)
  const [restingPrice, setRestingPrice] = useState<number>(0.1)
  const [editionSize, setEditionSize] = useState<number>(1)

  const [erc721, setErc721] = useState<boolean>(true)

  const [exhibitionList, setExhibitionList] = useState<
    { name: string; slug: string; start: number; end: number }[]
  >([])
  const [selectedExhibition, setSelectedExhibition] = useState<string>('')

  // fixed sale specifics
  const [timedDrop, setTimedDrop] = useState<boolean>(false)
  const [lazyMint, setLazyMint] = useState<boolean>(false)

  // dutch auction specifics
  const [decayAmount, setDecayAmount] = useState<number>(0.1)
  const [decayInterval, setDecayInterval] = useState<number>(15)

  const [authorized, setAuthorized] = useState<boolean>(false)

  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false)
  const [showFailureToast, setShowFailureToast] = useState<boolean>(false)
  const [ctaBtnLoading, setCtaBtnLoading] = useState<boolean>(false)

  /*     useEffect(() => {
      // redirect to main
      router.push('/')
    }, []) */

  const handleTokenApproval = async (e: any) => {
    e.preventDefault()
    setCtaBtnLoading(true)

    const getStatus = await approveAllForContract(contractAddress)

    if (getStatus) {
      setTokenApproved(true)
    } else {
      setTokenApproved(false)
      setShowFailureToast(true)
    }
    setCtaBtnLoading(false)
  }

  const handleCreateListing = async (e: any) => {
    e.preventDefault()
    setCtaBtnLoading(true)
    // default end time is 15 days
    const defaultEndTime = new Date(start).getTime() / 1000 + 1296000
    if (network == 'Ethereum' && address) {
      const txn = await createEthMarketplaceListing({
        starting_price: parseEther(startPrice.toString()),
        resting_price:
          saleType == 'fixed' || saleType == 'e-auction'
            ? parseEther(startPrice.toString())
            : parseEther(restingPrice.toString()),
        dutch_decay_amount:
          saleType == 'd-auction'
            ? parseEther(decayAmount.toString())
            : parseEther('0'.toString()),
        listing_type: saleType == 'd-auction' ? 5 : saleType == 'fixed' ? 1 : 4,
        edition_size: lazyMint ? editionSize : 1,
        start_time: new Date(start).getTime() / 1000,
        end_time:
          saleType == 'e-auction' ||
          saleType == 'd-auction' ||
          (saleType == 'fixed' && timedDrop == true)
            ? new Date(end).getTime() / 1000
            : defaultEndTime,
        dutch_decay_interval: saleType == 'd-auction' ? decayInterval * 60 : 0,
        /** Token Details */
        token_id: tokenId,
        contract_address: contractAddress,
        erc_type: erc721 ? 1 : 2,
        lazy_minted: lazyMint ? true : false,
      })

      if (txn == 'success') {
        // add TOKEN to DB
        const result = await addTokenToExhibition({
          variables: {
            contract: contractAddress,
            event_slug: selectedExhibition,
            token_id: tokenId.toString(),
          },
        })

        setShowSuccessToast(true)
      } else {
        setShowFailureToast(true)
      }
    }
    setCtaBtnLoading(false)
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
    const checkTokenApproval = async () => {
      const is_approved = await checkEthTokenApprovals(
        address!,
        contractAddress,
      )
      setTokenApproved(is_approved)
    }
    if (contractAddress && address) {
      checkTokenApproval()
    }
  }, [contractAddress])

  useEffect(() => {
    // load contract address and id from url
    // and pre-fill form
    if (router.query.contract && router.query.id) {
      setContractAddress(router.query.contract as string)
      setTokenId(Number(router.query.id as string))
      setAuthorized(true)
    }

    if (router.query.type) {
      if ((router.query.type as string) == 'others') {
        setAuthorized(true)
      }
    }

    if (exhibition_data) {
      const { v3_events } = exhibition_data
      let exhibition_list = v3_events.map((exhibition: any) => {
        return {
          name: exhibition.title,
          slug: exhibition.slug,
          start: new Date(exhibition.start_date).getTime(),
          end: new Date(exhibition.end_date).getTime(),
        }
      })

      setExhibitionList(exhibition_list)
      setSelectedExhibition(exhibition_list.length > 0 && exhibition_list[0].slug ? exhibition_list[0].slug : '')
    }
  }, [router, authorized, exhibition_data])

  useEffect(() => {
    // if selected exhibition changes, automatically pull the start and end date
    if (selectedExhibition) {
      const filteredExhibition: any = exhibitionList.filter(
        (exhibition) => (exhibition.slug = selectedExhibition),
      )

      if (filteredExhibition && filteredExhibition.length > 0) {
        setStart(
          new Date(filteredExhibition[0].start).toISOString().slice(0, -8) +
            ':00.000Z',
        )
        setEnd(
          new Date(filteredExhibition[0].end).toISOString().slice(0, -8) +
            ':00.000Z',
        )
      }
    }
  }, [selectedExhibition, exhibitionList])

  return (
    <div className="max-w-7xl mx-auto sm:px-8 px-6 py-10 min-h-screen">
      {!authorized && !contractAddress && !tokenId ? (
        <CreatorArtwork
          setContractAddress={setContractAddress}
          setTokenId={setTokenId}
        />
      ) : (
        <form className="sm:p-6 bg-white rounded-xl">
          <h3 className="text-2xl mb-4">Create a sales listing</h3>

          <div className="flex flex-col md:gap-y-3 sm:gap-y-5 gap-y-6 mt-8">
            <DropdownSelect
              label="Exhibiting for"
              currentValue={selectedExhibition}
              setter={setSelectedExhibition}
              options={exhibitionList}
              id="exhibition-selection"
            />

            <NetworkTypeRadio currentValue={network} setter={setNetwork} />

            {/** add sale type */}
            <SaleTypeRadio
              currentValue={saleType}
              setter={setSaleType}
              options={['e-auction', 'fixed', 'd-auction']}
            />

            {/** contract address */}
            <InputTextField
              label="Token contract address"
              max_char={68}
              current_value={contractAddress}
              setter={setContractAddress}
            />

            {/** ERC721 or ERC1155 */}
            <BooleanRadio
              label="Is this an ERC721 token?"
              name="erc"
              currentValue={erc721}
              setter={setErc721}
            />

            {/** fixed sale type specifics */}
            {saleType == 'fixed' && (
              <BooleanRadio
                label="Is this token lazy minted?"
                name="lazymint"
                currentValue={lazyMint}
                setter={setLazyMint}
              />
            )}

            {/** token id */}
            <NumberInput
              label={`${
                saleType == 'fixed' && lazyMint == true
                  ? 'Asset id'
                  : 'Token id'
              }`}
              current_value={tokenId}
              setter={setTokenId}
            />

            {/** sale start / end dates */}
            <DateTimePicker
              label={'Sale Start Date and Time (UTC)'}
              currentDateTime={start}
              setter={setStart}
            />

            {/** fixed sale type specifics */}
            {saleType == 'fixed' && (
              <BooleanRadio
                label="Is this a timed-drop?"
                name="fixed-drop"
                currentValue={timedDrop}
                setter={setTimedDrop}
              />
            )}

            {(saleType == 'e-auction' ||
              saleType == 'd-auction' ||
              (saleType == 'fixed' && timedDrop == true)) && (
              <DateTimePicker
                label={'Sale End Date and Time (UTC)'}
                currentDateTime={end}
                setter={setEnd}
              />
            )}

            {/** starting price - for all */}
            <PriceInput
              label={`${
                saleType == 'd-auction' || saleType == 'e-auction'
                  ? 'Starting price '
                  : 'Price '
              } ${network == 'Ethereum' ? '(ETH)' : '(XTZ)'}`}
              currentValue={startPrice}
              setter={setStartPrice}
              network={network}
            />

            {/** resting price - only for dutch auctions */}
            {saleType == 'd-auction' && (
              <>
                <PriceInput
                  label={`Resting price ${
                    network == 'Ethereum' ? '(ETH)' : '(XTZ)'
                  }`}
                  currentValue={restingPrice}
                  setter={setRestingPrice}
                  network={network}
                />

                {network == 'Ethereum' && (
                  <>
                    <PriceInput
                      label={`Decay amount (ETH) in each interval`}
                      currentValue={decayAmount}
                      setter={setDecayAmount}
                      network={'Ethereum'}
                    />
                    <NumberInput
                      label={`Decay interval (mins)`}
                      current_value={decayInterval}
                      setter={setDecayInterval}
                      min_value={1}
                    />
                  </>
                )}
              </>
            )}

            {/** Edition size */}
            {lazyMint && (
              <NumberInput
                label="Number of editions"
                current_value={editionSize}
                setter={setEditionSize}
              />
            )}

            <CancelAndCTAButtons
              key={`cta-${tokenApproved}`}
              back_button_label="Cancel"
              back_button_link="/dashboard/creator/listings/create"
              cta_button_label={
                !tokenApproved ? 'Approve tokens for listing' : 'Create listing'
              }
              cta_button_action={
                !tokenApproved
                  ? (e: any) => handleTokenApproval(e)
                  : (e: any) => handleCreateListing(e)
              }
              cta_button_loading={ctaBtnLoading}
            />
          </div>

          {showSuccessToast && (
            <SuccessToast
              title={'Created listing successfully!'}
              message={`<a class="underline" href='/artwork/${contractAddress}/${tokenId.toString()}' target="_blank" rel="noreferrer">View listing</a>`}
            />
          )}
          {showFailureToast && (
            <FailureToast message={'Error creating listing'} />
          )}
        </form>
      )}
    </div>
  )
}

export default CreateListingPage
