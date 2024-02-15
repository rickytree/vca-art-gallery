import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import ViewIcon from '../../../../components/ui/Icons/view.svg'
import EditIcon from '../../../../components/ui/Icons/edit.svg'
import { useRouter } from 'next/router'
import { truncateEthAddress } from '@/src/lib/utils'
import { CountdownLabel } from '@/src/components/ui/coundown'
import { getUserEthListings } from '@/src/lib/crypto/ethereum'
import { ListingCard } from '@/src/components/artwork/listings/listing_card'

const SalesListingList = () => {
  const [userListings, setUserListings] = useState<any[]>([])

  const { address } = useAccount()
  const router = useRouter()

  /*   useEffect(() => {
    // redirect to main
    router.push('/')
  }, []) */

  useEffect(() => {
    const getListings = async () => {
      const listings = await getUserEthListings(address!)

      if (listings && listings.length > 0) {
        setUserListings(listings)
      } else {
        setUserListings([])
      }
    }

    if (address) {
      getListings()
    }
  }, [address])

  return (
    <div className="max-w-7xl mx-auto px-8 p-10 min-h-screen">
      {userListings.length > 0 && (
        <>
          <h2 className="text-xl font-medium mb-8 mt-8">
            Your exhibited listings with Vertical
          </h2>
          <div className="flex gap-x-4 gap-y-4">
            {userListings.map((listing: any) => {
              const notStarted =
                new Date() <= new Date(listing.startTime * 1000) ? true : false
              const hasEnded =
                new Date() >= new Date(listing.endTime * 1000) ? true : false

              return (
                <ListingCard key={listing.id} listing={listing} hasEnded={hasEnded} notStarted={notStarted} />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default SalesListingList
