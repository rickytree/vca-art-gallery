import { ETHERSCAN_URL } from '@/src/lib/constants'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'
import { OutlinedBadge } from '../Labels/outlined'
import { useEffect, useState } from 'react'

export const BidRow = ({ position, bid }: { position: number; bid: Bid }) => {
  const { address: current_user } = useAccount()
  const [hydrated, setHydrated] = useState<boolean>(false)
  let chain: NetworkType = 'Ethereum'
  if (!isAddress(bid.bidder)) {
    chain = 'Tezos'
  }

  let priceLabel = chain == 'Ethereum' ? 'Ξ ' : 'ꜩ '
  let link_to =
    chain == 'Ethereum' ? ETHERSCAN_URL + `address/${bid.bidder}` : ''

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated ? (
    <div className="flex" key={bid.id}>
      <span className="text-xl w-[10%]">{position}</span>
      <div className="flex flex-col w-[90%]">
        <div className="w-full flex justify-between items-center mb-1">
          <p className="text-xs text-gray-500">
            {new Date(Number(bid.timestamp) * 1000).toUTCString()}
          </p>
          <div className="flex gap-x-1">
            {current_user && bid.bidder == current_user.toLowerCase() && (
              <OutlinedBadge label="You" color={'#22c55e'} />
            )}
            {position == 1 && (
              <OutlinedBadge label="Leading" color={'#eab308'} />
            )}
          </div>
        </div>
        <div
          className={`w-full flex gap-x-1 justify-between ${
            current_user && bid.bidder == current_user.toLowerCase()
              ? 'text-green-500'
              : ''
          }`}
        >
          <a
            href={link_to}
            target="_blank"
            rel="noreferrer"
            className="w-[80%] font-mono overflow-hidden text-ellipsis cursor-pointer"
          >
            {bid.bidder}
          </a>
          <p className="w-[25%] text-right">
            {bid.amount} {priceLabel}
          </p>
        </div>
      </div>
    </div>
  ) : (
    <></>
  )
}
