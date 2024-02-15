import { GET_ALL_EXHIBITIONS } from '@/src/lib/database/exhibition'
import { GET_ACCOUNT_BY_ADDRESS } from '@/src/lib/database/user.ts'
import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { isAddress } from 'viem'
import { SimpleArtistBio } from '../artist/artist_bio'

export const ArtworkGeneralInfo = ({
  title,
  description,
  artist_address,
}: {
  title: string
  description: string
  artist_address: string
}) => {
  const [artist, setArtist] = useState<User>()

  const {
    loading,
    error,
    data: artwork_artist,
  } = useQuery(GET_ACCOUNT_BY_ADDRESS, {
    variables: {
      ethereum: isAddress(artist_address) ? artist_address : '0x',
      tezos: !isAddress(artist_address) ? artist_address : 'tz',
      role: 'artist',
    },
  })

  useEffect(() => {
    if (artwork_artist && artwork_artist.vca_main_account.length > 0) {
      const artist_details = artwork_artist.vca_main_account[0]
      let role = [...artist_details.role]
      setArtist({ ...artist_details, role })
    }
  }, [artwork_artist])

  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="font-bold text-4xl">{title}</h2>

      <p className="whitespace-pre-line">{description}</p>

      {artist && (
        <div className="mt-6">
          <SimpleArtistBio artist={artist} />
        </div>
      )}
    </div>
  )
}
