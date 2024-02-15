import { useEffect, useState } from 'react'
import { Countdown } from '../ui/coundown'
import { getPriceAndAvailability } from '@/src/lib/crypto/artblocks'
import { formatEther, parseEther } from 'viem'
import { MintButton } from './mint'
import { PriceInput } from '../ui/Form/formfields'
import { useAccount } from 'wagmi'
import {
  ARTBLOCKS_FLEX_CONTRACT_ADDRESS,
  ETHERSCAN_URL,
} from '@/src/lib/constants'
import { BidRow } from '../ui/Bid/bid'
import { FinalizeButton } from './finalize'
import { dateWithinTenDays } from '@/src/lib/utils'
import { FinalizeButton } from './finalize'
import { dateWithinTenDays } from '@/src/lib/utils'

type MintInfoProps = {
  start_date: string | number
  end_date?: string | number
  sale_details: Artwork & EthArtwork
  is_allowlist_minting?: boolean
}

export const ArtworkMintInfo = ({
  mint_info,
}: {
  mint_info: MintInfoProps
}) => {
  const { address: current_user } = useAccount()
  const [hydrated, setHydrated] = useState<boolean>(false)

  const start = new Date(mint_info.start_date).getTime()
  const end = mint_info.end_date
    ? new Date(mint_info.end_date).getTime()
    : undefined
  const hasStarted = new Date().getTime() > start

  // returns true if there's an end date, and sale ended
  // returns false if there's an end date, and sale has not ended
  // returns undefined if there's no end date
  const [hasEnded, setHasEnded] = useState<boolean | undefined>(
    end ? (new Date().getTime() > end ? true : false) : undefined,
  )
  const [endTime, setEndTime] = useState<number | undefined>(end ?? undefined)
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('')
  const [withinTenDays, setWithinTenDays] = useState<boolean>(false)
  

  // returns whether it's allowlisting minting window
  const is_al_window: boolean = mint_info.is_allowlist_minting ?? false

  const sale_details = mint_info.sale_details
  const bidHistory =
    sale_details.mint_info?.bid_history &&
    sale_details.mint_info?.bid_history.length > 0
      ? sale_details.mint_info?.bid_history
      : []

  const currentPriceLabel =
    sale_details.sale_type == 'e-auction'
      ? sale_details.mint_info?.bid_history &&
        sale_details.mint_info?.bid_history.length > 0
        ? 'Current Bid'
        : 'Reserve Bid'
      : sale_details.sale_type == 'd-auction'
      ? 'Current Price'
      : 'Price'

  const priceLabel = sale_details.chain == 'Ethereum' ? 'Ξ ' : 'ꜩ '

  const current_bidder =
    (bidHistory.length > 0 &&
      bidHistory.filter(
        (bid: Bid) => bid.bidder.toLowerCase() == current_user?.toLowerCase(),
      )) ||
    []

  // state setters
  const [price, setPrice] = useState<number>(
    sale_details.sale_type == 'e-auction' && bidHistory.length > 0
      ? bidHistory[0].amount
      : mint_info.sale_details.mint_info?.current_price || 0,
  )
  const [bid, setBid] = useState<number>(
    Number(
      ((mint_info.sale_details.mint_info?.current_price || 0) * 1.1).toFixed(4),
    ),
  )
  const [currentBids, setCurrentBids] = useState<Bid[]>(
    sale_details.mint_info?.bid_history || [],
  )
  const [availability, setAvailability] = useState<number>(
    mint_info.sale_details.mint_info?.current_availability || 0,
  )
  const [currentBidder, setCurrentBidder] = useState<Bid[]>(current_bidder)

  // useEffect that updates the end time
  // and last auction history time
  useEffect(() => {
    setLastUpdatedTime(new Date().toUTCString())

    if (endTime) {
      setHasEnded(new Date().getTime() > endTime ? true : false)

      let _endTime = endTime
      let currentTime = new Date().getTime()

      // check if same length
      if (endTime.toString().length !== currentTime.toString().length) {
        _endTime = _endTime * 1000
      }

      setWithinTenDays(dateWithinTenDays(_endTime))
    } else {
      setHasEnded(undefined)
    }
  }, [endTime])

  // useEffect that displays informational label
  // depending on bid placed by user
  useEffect(() => {})

  // useEffect that launches interval to fetch price
  // and availability
  // if e-auction, fetches latest bid list and end time too.
  useEffect(() => {
    setHydrated(true)

    // run interval every 15s to query price and latest availability
    const getUpdatedStats = async () => {
      const is_artblocks =
        mint_info.sale_details.project_type == 'artblocks' ?? false
      const contract: string = is_artblocks
        ? ARTBLOCKS_FLEX_CONTRACT_ADDRESS
        : mint_info.sale_details.id.split('/')[0]
      const id: number = is_artblocks
        ? mint_info.sale_details.token_id
        : Number(mint_info.sale_details.id.split('/')[1])

      const data: any = await getPriceAndAvailability(
        id,
        contract,
        mint_info.sale_details.sale_type == 'e-auction',
      )

      setPrice(parseFloat(formatEther(data.price)))
      setAvailability(data.availability)

      if (mint_info.sale_details.sale_type == 'e-auction') {
        setCurrentBids(data.bids ?? [])
        setEndTime(data.new_end_time * 1000)
        setLastUpdatedTime(new Date().toUTCString())

        if (data.bids && data.bids.length > 0) {
          setPrice(data.bids[0].amount)
        }

        if (current_user && data.bids && data.bids.length > 0) {
          let current_bids_by_user =
            data.bids.filter(
              (bid: Bid) =>
                bid.bidder.toLowerCase() == current_user?.toLowerCase(),
            ) || []
          setCurrentBidder(current_bids_by_user)
        }
      }
    }

    // if ab token or a dutch interval token, run interval
    if (
      (mint_info.sale_details.project_type == 'artblocks' &&
        availability > 0) ||
      (mint_info.sale_details.sale_type == 'd-auction' &&
        availability > 0 &&
        hasStarted &&
        !hasEnded) ||
      (mint_info.sale_details.sale_type == 'e-auction' &&
        availability > 0 &&
        hasStarted &&
        !hasEnded)
    ) {
      const interval = setInterval(async () => {
        getUpdatedStats()
      }, 15000)

      return () => clearInterval(interval)
    }
  }, [])

  return hydrated ? (
    <div className="flex flex-col gap-y-4 p-8 w-full bg-gray-100">
      <span className="uppercase font-light text-xs">
        {end &&
        hasEnded == false &&
        hasStarted &&
        availability > 0 &&
        withinTenDays ? (
          <>
            {is_al_window ? 'Allowlist sale' : ''} Ending in{' '}
            <Countdown target={new Date(endTime!)} />
          </>
        ) : !hasStarted ? (
          <>
            {is_al_window ? 'Allowlist sale' : ''} Starting in{' '}
            <Countdown target={new Date(mint_info.start_date)} />
          </>
        ) : availability == 0 ? (
          'Sold'
        ) : hasEnded ? (
          `Sale ended`
        ) : (
          `${is_al_window ? 'Allowlist Sale' : ''} live`
        )}
      </span>

      {price ? (
        <>
          <p className="text-xl font-medium">
            {currentBids.length > 0
              ? hasEnded
                ? 'Hammer Price'
                : 'Current Bid'
              : currentPriceLabel}
          </p>
          <p className="text-3xl font-bold">
            {priceLabel} {price.toFixed(3)}
          </p>
        </>
      ) : (
        <p>No further details available.</p>
      )}

      {/** Bid input box */}
      {hasStarted && !hasEnded && sale_details.sale_type == 'e-auction' && (
        <>
          <PriceInput
            label={`Bid amount ${priceLabel}`}
            currentValue={bid}
            setter={setBid}
            network="Ethereum"
          />
          {currentBidder.length > 0 &&
            currentBids[0].bidder != current_user?.toLowerCase() && (
              <p className="text-xs mt-2 text-gray-500">
                Your previous bid has been returned to you. Place a new bid
                higher than the current one to try to secure this lot.
              </p>
            )}
        </>
      )}

      <div className="mt-2 w-full">
        <MintButton
          contract_address={sale_details.contract_address || sale_details.nft}
          token_id={sale_details.token_id}
          project_type={sale_details.project_type}
          sale_type={sale_details.sale_type}
          price={sale_details.sale_type == 'e-auction' ? bid : price}
          listing_id={
            sale_details.id ? Number(sale_details.id.split('/')[1]) : undefined
          }
          disabled={availability == 0 || !hasStarted || hasEnded}
          current_bidder={currentBidder.length > 0 ?? false}
          is_allowlist_minting={is_al_window ?? false}
          // @ts-ignore
          whitelisted_addresses={
            is_al_window ? sale_details.whitelisted_addresses : ''
          }
          label={
            availability == 0
              ? 'Sold'
              : hasEnded
              ? `${is_al_window ? 'Allowlist ' : ''}Sale ended`
              : !hasStarted
              ? 'Sale has not started'
              : // @ts-ignore
              is_al_window &&
                !sale_details.whitelisted_addresses.includes(current_user)
              ? `Reserved`
              : sale_details.sale_type == 'e-auction'
              ? 'Bid'
              : 'Collect'
          }
        />
      </div>

      {/** Settlement button */}
      {/** @ts-ignore */}
      { sale_details.sale_type == 'e-auction' && hasEnded && !sale_details.isFinalized &&
        <>
        <FinalizeButton listing_id={Number(sale_details.id.split('/')[1])} />
        <p className="text-xs mt-2 text-gray-500">By concluding this sale, the auction will be settled and the artwork will be transferred to the collector.</p>
        </>
      }

      {/** Settlement button */}
      {/** @ts-ignore */}
      {sale_details.sale_type == 'e-auction' &&
        hasEnded &&
        !sale_details.isFinalized && (
          <>
            <FinalizeButton
              listing_id={Number(sale_details.id.split('/')[1])}
            />
            <p className="text-xs mt-2 text-gray-500">
              By concluding this sale, the auction will be settled and the
              artwork will be transferred to the collector.
            </p>
          </>
        )}

      {/** English auction bids display */}
      {sale_details.sale_type == 'e-auction' && (
        <div className="border-t border-gray-400 flex flex-col gap-y-1">
          <div className="mb-4 mt-6 flex flex-col">
            <span className="font-medium">Auction History</span>
            <span className="text-xs text-gray-500">
              Last updated on {lastUpdatedTime}
            </span>
          </div>

          {currentBids.length > 0 ? (
            <div className="flex flex-col gap-y-2">
              {currentBids.map((bid: Bid, index: number) => (
                <BidRow key={bid.id} position={index + 1} bid={bid} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mt-2 italic">
              There are no active bids
            </p>
          )}
        </div>
      )}
    </div>
  ) : (
    <></>
  )
}
