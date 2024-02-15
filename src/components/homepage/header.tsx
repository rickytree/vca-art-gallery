import Image from 'next/image'
import { Title } from '../ui/title'
import { getDate } from '@/src/lib/utils'
import Link from 'next/link'
import VerticalVLogo from '../../images/VERTICAL_LOGO_vertical.svg'
import { ArrowSmallRightIcon } from '@heroicons/react/24/outline'

export const HomePageHeader = ({ exhibition }: { exhibition: any }) => {
  return (
    <div className="p-4 bg-black md:max-w-[70%] w-full rounded-xl opacity-80">
      <div className="relative w-full flex rounded-lg justify-between">
        <div className="w-full flex flex-col items-start gap-y-1 hero-section-gradient rounded-xl py-5 px-8 mr-16">
          <h4 className="mb-2 text-white">
            {exhibition.location ? `${exhibition.location}, ` : ''}
            {getDate(exhibition.start_date)}
            {` - ${getDate(exhibition.end_date)}`}
          </h4>
          <Title italics={exhibition.title} white />
          <h2
            className="mt-2 text-white"
            dangerouslySetInnerHTML={{ __html: exhibition.tagline }}
          ></h2>
          <Link
            href={`/exhibition/${exhibition.slug}`}
            className="uppercase mt-6 flex justify-between items-center border-[1px] border-white rounded-md px-4 py-1.5 gap-2 text-white"
          >
            <ArrowSmallRightIcon className="w-4 h-4" />
            <span> View Exhibition </span>
          </Link>
        </div>
        <img
          src={VerticalVLogo.src}
          alt="VERTICAL logo"
          className="hidden sm:block h-full absolute right-0"
        />
      </div>
    </div>
  )
}

export const HomeHeroImage = ({ image }: { image: string }) => {
  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-0 left-0 h-full w-full"></div>
      <img
        src={
          image
            ? image
            : 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'
        }
        className="object-cover w-full h-full rounded"
      />
    </div>
  )
}
