import Image from 'next/image'
import AvarImage from '@/src/images/artist.svg'
import ArtworkCover1 from '@/src/images/artworks/agoria1.svg'
import ArtworkCover2 from '@/src/images/artworks/agoria2.svg'
import ArtworkCover3 from '@/src/images/artworks/agoria3.svg'
import ArtistAvatar from '@/src/images/artist-avatar.svg'
import ExhibitionCover1 from '@/src/images/exhibition/overlay1.svg'
import ExhibitionCover2 from '@/src/images/exhibition/overlay2.svg'
import ExhibitionCover3 from '@/src/images/exhibition/overlay3.svg'
import EditorialCover from '@/src/images/editorial.svg'

export default () => {
  return (
    <div className="w-full">
      <div className="w-full bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto sm:px-8 px-6 py-10">
          <div className="grid grid-cols-3 gap-8 items-center">
            <Image src={AvarImage} alt="artist-avatar" className="col-span-1" />
            <div className="flex flex-col col-span-2 gap-4">
              <h2 className="uppercase text-4xl"> Artist Name </h2>
              <p className="text-[#979797] text-xl"> @artist name </p>
              <p className="text-xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>
        </div>
      </div>
      <FeaturedArtworks />
    </div>
  )
}

export const FeaturedArtworks = () => {
  const featuredCards = [
    {
      title: 'Artwork 1',
      artist: 'Artist 1',
      description: 'Here is the Artwork 1',
      price: '0.35',
      cover: ArtworkCover1,
    },
    {
      title: 'Artwork 2',
      artist: 'Artist 2',
      description: 'Here is the Artwork 2',
      price: '0.35',
      cover: ArtworkCover2,
    },
    {
      title: 'Artwork 3',
      artist: 'Artist 3',
      description: 'Here is the Artwork 3',
      price: '0.35',
      cover: ArtworkCover3,
    },
  ]
  const exhibitions = [
    {
      title: 'Proof of People London',
      description: 'Here is the exhibition 1',
      cover: ExhibitionCover1,
      start_date: '31 May 2023',
      end_date: '16 June 2023',
    },
    {
      title: 'VCA x Artblocks',
      description: 'Here is the exhibition 2',
      cover: ExhibitionCover2,
      start_date: '31 May 2023',
      end_date: '16 June 2023',
    },
    {
      title: 'VCA x Artblocks',
      description: 'Here is the exhibition 3',
      cover: ExhibitionCover3,
      start_date: '31 May 2023',
      end_date: '16 June 2023',
    },
  ]
  const editorials = [
    {
      title: 'Femgen',
      description: 'FEMGEN Interview Series: A conversation with Danielle King',
      cover: EditorialCover,
      start_date: '04 February, 2023',
    },
    {
      title: 'Femgen',
      description: 'FEMGEN Interview Series: A conversation with Danielle King',
      cover: EditorialCover,
      start_date: '04 February, 2023',
    },
  ]
  return (
    <div className="max-w-7xl mx-auto sm:px-8 px-6 pb-10">
      <h1 className="text-5xl text-[#434343] font-[500] my-16">
        {' '}
        <span className="italic"> Featured </span> Artworks.{' '}
      </h1>
      <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-12 gap-8">
        {featuredCards.map((card, index) => (
          <FeaturedCard
            key={index}
            cover={card.cover}
            title={card.title}
            artist={card.artist}
            price={card.price}
            description={card.description}
          />
        ))}
      </div>
      <h1 className="text-5xl text-[#434343] font-[500] mt-24 py-16">
        {' '}
        <span className="italic"> Participating </span> Exhibitions.{' '}
      </h1>
      <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
        {exhibitions.map((card, index) => (
          <ExhibitionCard
            key={index}
            cover={card.cover}
            title={card.title}
            description={card.description}
            start_date={card.start_date}
            end_date={card.end_date}
          />
        ))}
      </div>
      <div>
        <h3 className="text-2xl font-semibold mt-16 mb-6"> Editorial </h3>
      </div>
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
        {editorials.map((card, index) => (
          <EditorialCard
            key={index}
            cover={card.cover}
            title={card.title}
            description={card.description}
            start_date={card.start_date}
          />
        ))}
      </div>
    </div>
  )
}

export const FeaturedCard = ({
  cover,
  title,
  artist,
  description,
  price,
}: {
  cover: string
  title: string
  artist: string
  description: string
  price: string
}) => {
  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden shadow-xl shadow-[#e2dede]">
      <div className="flex justify-center bg-[#F9F9F9] py-12">
        <Image src={cover} alt={title} />
      </div>
      <div className="flex flex-col p-5 pb-3 gap-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2.5">
          <Image src={ArtistAvatar} alt="artist-avatar" />
          <p className="text-[#9CA3AF] italic font-semibold">{artist}</p>
        </div>
        <p className="text-[#434343] text-lg">{description}</p>
      </div>
      <hr className="border-[#F3F4F6]" />
      <div className="flex px-5 py-3 justify-between items-center">
        <p className="font-bold uppercase text-black/75">
          {' '}
          price <span className="font-semibold md:ml-5"> Ξ {price} </span>{' '}
        </p>
        <button className="bg-black rounded-md text-white md:px-6 px-4 md:py-2.5 py-2">
          {' '}
          Collect now{' '}
        </button>
      </div>
    </div>
  )
}

export const ExhibitionCard = ({
  cover,
  start_date,
  end_date,
  title,
  description,
}: {
  cover: string
  start_date?: string
  end_date?: string
  title: string
  description: string
}) => {
  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden shadow-xl shadow-[#e2dede]">
      <div className="flex justify-center bg-[#F9F9F9]">
        <Image src={cover} alt={title} className="w-full" />
      </div>
      <div className="flex flex-col p-5 pb-3 gap-1">
        <p className="text-[#6B7280] text-sm">
          {start_date} - {end_date}
        </p>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-[#6B7280] text-sm">{description}</p>
      </div>
    </div>
  )
}

export const EditorialCard = ({
  cover,
  start_date,
  title,
  description,
}: {
  cover: string
  start_date?: string
  title: string
  description: string
}) => {
  return (
    <div className="w-full flex flex-col overflow-hidden shadow-xl shadow-[#e2dede]">
      <div className="flex justify-center bg-[#F9F9F9]">
        <Image src={cover} alt={title} className="w-full" />
      </div>
      <div className="flex flex-col p-5 pb-3 gap-1">
        <p className="text-[#6B7280]">{title}</p>
        <h1 className="text-2xl font-semibold text-black/[.80]">
          {description}
        </h1>
        <p className="text-[#6B7280] mt-6">{start_date}</p>
      </div>
    </div>
  )
}
