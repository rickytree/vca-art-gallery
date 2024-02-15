import { GET_ARTWORK_BY_ADDRESS } from '@/src/lib/database/artist'
import { truncateEthAddress } from '@/src/lib/utils'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import PageLoading from '../ui/Loading'

export const CreatorArtwork = ({
  setContractAddress,
  setTokenId,
}: {
  setContractAddress: any
  setTokenId: any
}) => {
  const { address } = useAccount()
  const [loading, setLoading] = useState<boolean>(true)
  const [creatorArtwork, setCreatorArtwork] = useState<any>([])

  const { data: creator_artwork } = useQuery(GET_ARTWORK_BY_ADDRESS, {
    variables: {
      wallet_address: address,
    },
  })

  useEffect(() => {
    // @ts-ignore
    if (creator_artwork && creator_artwork.v3_tokens) {
      setCreatorArtwork(creator_artwork.v3_tokens)
    }

    setLoading(false)
  }, [creator_artwork])

  const handleClickToken = (contract_address: string, token_id: string) => {
    setContractAddress(contract_address), setTokenId(Number(token_id))
  }

  return (
    <div>
      <h3 className="lg:text-3xl text-2xl mb-4 text-center">
        Select a token to list for sale
      </h3>
      {loading ? (
        <PageLoading />
      ) : (
        creatorArtwork &&
        creatorArtwork.length > 0 && (
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
            {creatorArtwork.map((artwork: any, index: any) => (
              <div
                key={index}
                className="p-4 rounded border-gray-600 border flex flex-col gap-y-4 cursor-pointer"
                onClick={() =>
                  handleClickToken(artwork.contract, artwork.token_id)
                }
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}token_covers/${artwork.contract}_${artwork.token_id}.png`}
                  width={100}
                  height={200}
                  alt={`Token cover for ${artwork.contract}`}
                  className="w-full max-h-[10rem] object-contain"
                />
                <div className="flex flex-col">
                  <span className="font-mono text-xs uppercase text-gray-800">
                    {truncateEthAddress(artwork.contract)}
                  </span>
                  <span className="overflow-hidden text-ellipsis line-clamp-2">
                    {artwork.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      <p className="text-gray-400 mt-10 ">
        Can't find your token?{' '}
        <a
          className="underline"
          href="/dashboard/creator/listings/create?type=others"
        >
          Click here
        </a>{' '}
        to specify your contract address and token id
      </p>
    </div>
  )
}
