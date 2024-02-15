import Image from 'next/image'

export const SponsorCard = ({ sponsor }: { sponsor: User }) => {
  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-y-3 w-[15rem] items-center"
    >
      <img
        src={sponsor.avatar}
        alt={`Logo for ${sponsor.name}`}
        className="rounded-xl object-cover w-full h-[12rem] bg-black"
      />
      <p className="uppercase text-xs text-gray-500">{sponsor.name}</p>
    </a>
  )
}
