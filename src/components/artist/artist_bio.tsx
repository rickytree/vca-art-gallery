import { Avatar } from '../ui/User/avatar'
import ArtistFallbackImg from '../../images/FALLBACK_ARTIST_AVATAR.jpg'

export const SimpleArtistBio = ({ artist }: { artist: User }) => {
  return (
    <div className="flex gap-x-4 items-center">
      <Avatar size="s" imageUrl={artist?.avatar ?? ArtistFallbackImg.src} />
      <div className="flex flex-col">
        <p className="font-medium text-sm">{artist?.name}</p>
        <p className="text-gray-400 -mt-1 text-sm">
          {artist?.bio ?? 'Artist'}{' '}
        </p>
      </div>
    </div>
  )
}
