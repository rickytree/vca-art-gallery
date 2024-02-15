import Link from 'next/link'
import { CountdownLabel, LiveLabel } from '../ui/coundown'
import { dateWithinTenDays, getPriceInUSD } from '@/src/lib/utils'
import { useEffect, useState } from 'react'

export const ArtworkCard = ({ token }: { token: Artwork }) => {
  const notStarted = new Date() <= new Date(token.drop_date) ? true : false
  const hasEnded =
    token.drop_end_date && new Date() >= new Date(token.drop_end_date)
      ? true
      : false
  const is_reserved = token.mint_info?.is_allowlist_minting ?? false

  const buttonLabel = is_reserved
    ? 'Reserved'
    : token.sale_type == 'e-auction'
    ? '→ View and bid'
    : '→ View and collect'

  let auction_ended_with_bid = false

  if (
    token.sale_type == 'e-auction' &&
    token.mint_info?.bid_history &&
    token.mint_info?.bid_history.length > 0 &&
    hasEnded
  ) {
    auction_ended_with_bid = true
  }

  return (
    <Link
      className={`drop-shadow-xl`}
      href={`/artwork/${token.contract_address}/${token.token_id}`}
    >
      <div className="relative h-56 flex justify-center items-center xl:px-4 bg-gray-100 rounded-tl-lg rounded-tr-lg">
        <img
          src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}token_covers/${token.contract_address}_${token.token_id}.png`}
          className="max-w-[90%] max-h-[90%]"
        />
        {!hasEnded && token.mint_info?.current_availability != 0 && (
          <StatusTag
            is_live={!notStarted}
            start_date={token.drop_date}
            end_date={token.drop_end_date ?? undefined}
          />
        )}
      </div>
      <div className="flex flex-col gap-y-1 p-4 bg-white rounded-bl-lg rounded-br-lg">
        <h4 className="text-[#6B7280] text-xl font-medium tracking-tight">
          {token.title}
        </h4>
        <p className="font-bold text-black">
          {token.artist && token?.artist.length > 0
            ? token.artist[0].name
            : 'Artist'}
        </p>
        {token.mint_info?.total_supply && (
          <p className="text-sm !text-[#6B7280]">
            {
              //added kaouru fix
              token.contract_address ===
              '0x7d23fac0a2bfb6cd6c83d5a787160df647242a05'
                ? 'Edition of 10'
                : token.mint_info?.total_supply == 1
                ? 'Unique 1/1'
                : `${token.mint_info?.total_supply} artworks`
            }
          </p>
        )}
        {token.mint_info?.current_price && (
          <TokenPriceComponent
            type={token.sale_type}
            network={token.chain}
            price={token.mint_info?.current_price!}
            mint_info={token.mint_info}
            has_ended={hasEnded}
          />
        )}
        {
          <button
            className={`${
              notStarted ||
              hasEnded ||
              token.mint_info?.current_availability == 0
                ? 'bg-gray-300'
                : 'bg-black'
            } mt-8 text-white uppercase py-2 w-full rounded`}
          >
            {token.mint_info?.current_availability == 0 ||
            auction_ended_with_bid
              ? 'Sold'
              : !hasEnded
              ? notStarted
                ? is_reserved
                  ? 'Reserved'
                  : 'View'
                : `${buttonLabel}`
              : 'View'}
          </button>
        }
      </div>
    </Link>
  )
}

export const TokenPriceComponent = ({
  type,
  network,
  price,
  mint_info,
  has_ended,
}: {
  type: SaleType
  network: NetworkType
  price: number
  mint_info: MintInfo
  has_ended: boolean
}) => {
  const [usdPrice, setUsdPrice] = useState<number>(0)
  const [displayPrice, setDisplayPrice] = useState<number>(price)

  useEffect(() => {
    const getEthPrice = async () => {
      const price_in_usd = await getPriceInUSD(displayPrice)
      setUsdPrice(price_in_usd)
    }

    getEthPrice()
  }, [displayPrice])

  useEffect(() => {
    if (mint_info.bid_history && mint_info.bid_history.length > 0) {
      setDisplayPrice(mint_info.bid_history[0].amount)
    }
  }, [mint_info])

  let bids =
    mint_info.bid_history && mint_info.bid_history.length > 0
      ? mint_info.bid_history
      : []
  let eAuctionLabel = ''

  if (type == 'e-auction') {
    if (has_ended) {
      eAuctionLabel = 'Auction concluded'
    } else if (bids.length > 0) {
      eAuctionLabel = 'Current Bid'
    } else {
      eAuctionLabel = 'Reserve'
    }
  }

  return (
    <div>
      <div
        className={`flex gap-x-2 text-sm ${
          eAuctionLabel == 'Current Bid' && 'text-green-500'
        }`}
      >
        <span className="font-light">
          {type == 'e-auction'
            ? eAuctionLabel
            : type == 'd-auction'
            ? 'Current price'
            : 'Price'}
        </span>

        {!(type == 'e-auction' && has_ended && bids.length == 0) && (
          <>
            {' ▪ '}
            <div className="flex gap-x-2">
              <span className="font-bold">
                {network == 'Ethereum' ? 'Ξ ' : 'ꜩ '}
                {displayPrice}
              </span>
              <span className="font-light text-gray-300">{`($${usdPrice.toFixed(
                2,
              )})`}</span>
            </div>
          </>
        )}
      </div>
      <p className="font-light mt-1 text-sm">
        {type == 'd-auction'
          ? 'Dutch Auction'
          : type == 'e-auction'
          ? 'English Auction'
          : 'Fixed Price'}
      </p>
    </div>
  )
}

/** Component to display the preview of an uploaded artwork file
 * Mainly used in manage collection / create token pages.
 */
export const ArtworkPreview = ({
  label,
  file,
}: {
  label: string
  file: any
}) => {
  return (
    <div className="flex md:w-[20rem] p-4 border-gray-400 rounded border flex-col gap-y-2">
      <p className="font-mono text-gray-400 uppercase">{label}</p>
      {file.type.includes('image') ? (
        <img
          className="h-full object-contain"
          src={URL.createObjectURL(file)}
          alt={`${label} of ${file.name}`}
        />
      ) : file.type.includes('video') ? (
        <video
          className="h-full object-contain"
          src={URL.createObjectURL(file)}
          controls
        />
      ) : (
        <></>
      )}
    </div>
  )
}

export const StatusTag = ({
  is_live,
  start_date,
  end_date,
}: {
  is_live: boolean
  start_date: string
  end_date?: string
}) => {
  let withinTenDays: boolean = false

  if (is_live && end_date) {
    let endTime = new Date(end_date).getTime()
    let currentTime = new Date().getTime()
    
    // check if same length
    if (endTime.toString().length !== currentTime.toString().length) {
      endTime = endTime * 1000
    }

    withinTenDays = dateWithinTenDays(endTime)
    withinTenDays = dateWithinTenDays(endTime)
  }

  return (
    <div className="absolute top-[1rem] left-[1rem] w-fit bg-[#3f3e3a]/80 py-2 px-1 text-xs text-center rounded-[0.1rem]">
      {!is_live ? (
        <CountdownLabel
          message="Sale starts in"
          target={new Date(start_date)}
        />
      ) : end_date && withinTenDays ? (
        <CountdownLabel
          message="Ending in"
          target={new Date(end_date)}
          show_green_dot={true}
        />
      ) : (
        <LiveLabel />
      )}
    </div>
  )
}
