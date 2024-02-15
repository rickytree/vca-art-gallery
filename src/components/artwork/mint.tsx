import { mintArtblocksProject } from '@/src/lib/crypto/artblocks'
import { purchaseEthToken } from '@/src/lib/crypto/ethereum'
import { useEffect, useState } from 'react'
import { isAddress } from 'viem'
import { FailureToast, SuccessToast } from '../ui/Toast/toast'
import { useAccount } from 'wagmi'

type MintButtonProps = {
  contract_address: string
  token_id: number
  project_type: ProjectType
  sale_type: SaleType
  price: number
  listing_id?: number // only needed for eth marketplace purchases
  disabled?: boolean // used when availability = 0
  is_allowlist_minting?: boolean // indicates if allowlist minting period is on
  whitelisted_addresses?: string
  label?: string // used to display 'sold out', or other labels
  current_bidder?: boolean // for e-auction, we need this to decide whether increment is called
}

export const MintButton = ({
  contract_address,
  token_id,
  project_type,
  sale_type,
  price,
  listing_id,
  disabled = false,
  is_allowlist_minting = false,
  whitelisted_addresses = '',
  label = 'Mint',
  current_bidder = false,
}: MintButtonProps) => {
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false)
  const [showFailureToast, setShowFailureToast] = useState<boolean>(false)

  const { address } = useAccount()

  const handleMint = async (e: any) => {
    e.preventDefault()

    try {
      if (project_type == 'artblocks') {
        let mintedToken = await mintArtblocksProject(token_id, price.toString())

        if (mintedToken) {
          setShowSuccessToast(true)
        } else {
          setShowFailureToast(true)
        }
      } else {
        // eth token
        if (address && isAddress(contract_address)) {
          const result = await purchaseEthToken({
            sale_type: sale_type,
            listing_id: listing_id!,
            price,
            current_bidder,
            is_allowlist_minting,
            whitelisted_addresses: whitelisted_addresses
              ? whitelisted_addresses.split(',')
              : [],
            user_address: address,
          })

          if (result) {
            setShowSuccessToast(true)
          } else {
            setShowFailureToast(true)
          }
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
        className={`text-white text-md py-1 px-4 w-full rounded-md ${
          disabled
            ? 'cursor-not-allowed bg-gray-300'
            : 'cursor-pointer bg-gray-600'
        }`}
        onClick={(e: any) => handleMint(e)}
      >
        {label ?? 'Mint'}
      </button>
      {showSuccessToast && (
        <SuccessToast
          message={
            sale_type == 'e-auction'
              ? 'Placed bid successfully'
              : 'Artwork collected successfully!'
          }
        />
      )}
      {showFailureToast && (
        <FailureToast
          message={
            sale_type == 'e-auction'
              ? 'Error placing bid'
              : 'Error collecting artwork'
          }
        />
      )}
    </>
  )
}
