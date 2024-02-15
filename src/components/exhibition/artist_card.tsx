import Jazzicon from 'react-jazzicon/dist/Jazzicon'
import { Avatar } from '../ui/User/avatar'
import { convertAddressToNumber } from '@/src/lib/utils'

export const ExhibitionArtistCard = ({ artist }: { artist: User }) => {
  return (
    <div className="rounded-xl bg-[#F9FAFB] w-full p-6 flex flex-col items-center">
      {artist.avatar ? (
        <Avatar size={'lg'} imageUrl={artist.avatar} />
      ) : (
        <Jazzicon
          diameter={40}
          seed={convertAddressToNumber(
            artist.ethereum || artist.tezos || artist.id,
          )}
        />
      )}

      <div className="mt-6 text-center">
        <p className="font-bold">{artist.name}</p>
        <p className="text-gray-500">{artist.bio ?? 'Artist'}</p>
      </div>
    </div>
  )
}
