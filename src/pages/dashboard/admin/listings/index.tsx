import { useUserStore } from "@/src/lib/store"
import { useEffect, useState } from "react"
import ViewIcon from '../../../../components/ui/Icons/view.svg'
import EditIcon from '../../../../components/ui/Icons/edit.svg'
import { useRouter } from 'next/router'
import { truncateEthAddress } from '@/src/lib/utils'
import { CountdownLabel } from '@/src/components/ui/coundown'
import { getAllEthListings, getUserEthListings } from '@/src/lib/crypto/ethereum'
import { ListingCard } from "@/src/components/artwork/listings/listing_card"

const AdminListingsPage = () => {

    const [hydrated, setHydrated] = useState<boolean>(false)
    const userRole = useUserStore((state: any) => state.userRole)
    const [allListings, setAllListings] = useState<any[]>([])
    const router = useRouter();

    useEffect(() => {
      setHydrated(true)
    }, [userRole])

    useEffect(() => {
      
      const getAllListings = async() => {
        const data = await getAllEthListings();
        console.log(data)
        setAllListings(data)
      }  
      if (allListings.length == 0) {
        getAllListings();
      }
    }, [])

    return (
        <div className="max-w-7xl mx-auto px-8 p-10 min-h-screen">
          {userRole == 'admin' && hydrated ? (
           <>
            <h2 className="text-xl font-medium mb-8 mt-8">
            All exhibited listings with Vertical
          </h2>
          <div className="flex gap-x-4 gap-y-4 flex-wrap">
            {allListings.map((listing: any) => {
              const notStarted =
                new Date() <= new Date(listing.startTime * 1000) ? true : false
              const hasEnded =
                new Date() >= new Date(listing.endTime * 1000) ? true : false

              return (
                <ListingCard key={listing.id} listing={listing} notStarted={notStarted} hasEnded={hasEnded} />
              )
            })}
          </div>
          </>
          ) : (
            <p>Not authorized</p>
          )}
        </div>
      ) 
}

export default AdminListingsPage
