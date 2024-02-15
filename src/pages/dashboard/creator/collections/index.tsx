import { collections_obj_mapper } from '@/src/lib/helpers/artwork'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { getUserEthCollections } from '@/src/lib/crypto/ethereum'
import AddIcon from '../../../../components/ui/Icons/add.svg'
import { useRouter } from 'next/router'
import { truncateEthAddress } from '@/src/lib/utils'
import PageLoading from '../../../../components/ui/Loading'
import NoData from '../../../../components/ui/Loading/nodata'

const CollectionsList = () => {
  const [userCollections, setUserCollections] = useState<EthCollection[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const { address } = useAccount()
  const router = useRouter()

  /*   useEffect(() => {
    // redirect to main
    router.push('/')
  }, []) */

  useEffect(() => {
    const getCollections = async () => {
      const collections = await getUserEthCollections(address!)

      if (collections && collections.length > 0) {
        let mapped_collections = await collections_obj_mapper(collections)
        setUserCollections(mapped_collections)
      } else {
        setUserCollections([])
      }
      setLoading(false)
    }

    if (address) {
      getCollections()
    }
  }, [address])

  return (
    <div className="max-w-7xl mx-auto px-8 p-10 min-h-screen">
      {loading ? (
        <PageLoading />
      ) : userCollections.length === 0 ? (
        <NoData />
      ) : (
        <>
          <h2 className="text-xl font-medium mb-8 mt-8">
            Select a collection to add tokens to
          </h2>
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-4 gap-y-4 flex-wrap">
            {userCollections.map((collection: EthCollection, index) => (
              <div
                key={index}
                className="relative rounded-xl border-gray-700 border p-4 w-full flex flex-col justify-between gap-y-8"
              >
                <img
                  src={AddIcon.src}
                  className="w-6 h-6 absolute top-4 right-4 cursor-pointer hover:scale-125"
                  onClick={() =>
                    router.push(
                      `/dashboard/creator/collections/${collection.address}`,
                    )
                  }
                />
                <div className="flex flex-col">
                  <span className="font-mono text-xs uppercase text-gray-800">
                    {truncateEthAddress(collection.address)}
                  </span>
                  <span className="text-3xl uppercase">
                    {collection.symbol}
                  </span>
                </div>
                <span>{collection.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CollectionsList
