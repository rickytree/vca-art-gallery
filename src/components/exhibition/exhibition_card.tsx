import MapPinIcon from '../../../public/map-pin.svg'
import { Countdown, CountdownLabel, LiveLabel } from '../ui/coundown'
import { Separator } from '../ui/separator'
import {
  displayIpfsImage,
  formatDatesForExhibitionDisplay,
  getDate,
} from '@/src/lib/utils'
import Link from 'next/link'

export const FALLBACK_EXHIBITION_CARD_IMAGE =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'

// Tiles that is used in the Past Exhibition Listing page
export const V2ExhibitionCard = ({
  image,
  title,
  v2_link,
  start_date,
  end_date,
  description,
  tags,
}: {
  image?: string
  v2_link: string
  title: string
  start_date: string
  end_date?: string
  description?: string
  tags?: string[]
}) => {
  return (
    <Link
      className="rounded-md bg-white drop-shadow-xl"
      href={v2_link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="relative !w-full h-56">
        <img
          src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}event_covers/${image}.jpg`}
          className="absolute rounded-md top-0 left-0 w-full h-full object-cover"
        />
        {new Date() <= new Date(start_date) && (
          <div className="absolute bottom-0 left-0 w-full bg-[#3f3e3a]/80 py-2 text-xs text-center">
            <CountdownLabel target={new Date(start_date)} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-1 p-4">
        <p className="uppercase text-[#858585] text-sm">
          {formatDatesForExhibitionDisplay(start_date)}{' '}
          {end_date && ' - ' + formatDatesForExhibitionDisplay(end_date)}
        </p>
        <h4 className="text-black text-xl font-semibold tracking-tight">
          {title}
        </h4>
        <p className="text-sm text-neutral !text-[#6B7280] mb-4">
          {description}
        </p>
      </div>
    </Link>
  )
}

// Tiles that is used in the Past Exhibition Listing page
export const ExhibitionCard = ({
  image,
  title,
  slug,
  start_date,
  end_date,
  description,
  tags,
}: {
  image?: string
  slug: string
  title: string
  start_date: string
  end_date?: string
  description?: string
  tags?: string[]
}) => {
  return (
    <Link
      className="rounded-md bg-white drop-shadow-xl"
      href={`/exhibition/${slug}`}
    >
      <div className="relative !w-full h-56">
        <img
          src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}event_covers/${image}.jpg`}
          className="absolute rounded-md top-0 left-0 w-full h-full object-cover"
        />
        {new Date() <= new Date(start_date) && (
          <div className="absolute bottom-0 left-0 w-full bg-[#3f3e3a]/80 py-2 text-xs text-center">
            <CountdownLabel target={new Date(start_date)} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-1 p-4">
        <p className="uppercase text-[#858585] text-sm">
          {formatDatesForExhibitionDisplay(start_date)}{' '}
          {end_date && ' - ' + formatDatesForExhibitionDisplay(end_date)}
        </p>
        <h4 className="text-black text-xl font-semibold tracking-tight">
          {title}
        </h4>
        <p className="text-sm !text-[#6B7280] mb-4 line-clamp-3">
          {description}
        </p>
      </div>
    </Link>
  )
}

// Tiles that is used in the Past Exhibition Listing page
export const UpcomingExhibitionCard = ({
  image,
  title,
  slug,
  start_date,
  end_date,
  description,
  tags,
}: {
  image?: string
  slug: string
  title: string
  start_date: string
  end_date?: string
  description?: string
  tags?: string[]
}) => {
  return (
    <>
      <Link className={'drop-shadow-xl'} href={`/exhibition/${slug}`}>
        <div className="flex flex-col rounded-tl-lg rounded-tr-lg">
          <div className="relative !w-full h-96">
            <WideExhibitionImage
              has_white_overlay={false}
              image={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}event_covers/${image}.jpg`}
            />

            {new Date() <= new Date(start_date) && (
              <div className="absolute bottom-0 left-0 w-full bg-[#3f3e3a]/80 py-2 text-xs text-center">
                <CountdownLabel
                  message="Collection period live in"
                  target={new Date(start_date)}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-y-2 bg-white p-4 pb-12 rounded-bl-lg rounded-br-lg">
            <div className="w-full flex justify-between items-center">
              <span className="text-lg uppercase">
                {formatDatesForExhibitionDisplay(start_date)}{' '}
                {end_date && ' - ' + formatDatesForExhibitionDisplay(end_date)}
              </span>
              {/*
            <div className="flex gap-x-1 items-center">
              <img src={MapPinIcon.src} className="w-6 h-6" />
            </div>
             */}
            </div>
            <h4 className="text-black text-2xl font-semibold tracking-tight">
              {title}
            </h4>
            <p className="text-sm !text-[#6B7280] mb-4">{description}</p>
          </div>
        </div>
      </Link>
      {/*
    <Link
      className="rounded-md bg-white drop-shadow-xl"
      href={`/exhibition/${slug}`}
    >
      <div className="relative !w-full h-96">
        <img
          src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}event_covers/${image}.png`} 
          className="absolute rounded-md top-0 left-0 w-full h-full object-cover"
        />
        {new Date() <= new Date(start_date) && (
          <div className="absolute bottom-0 left-0 w-full bg-[#3f3e3a]/80 py-2 text-xs text-center">
            <CountdownLabel target={new Date(start_date)} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-1 p-4">
        <p className="uppercase text-[#858585] text-sm">
          {formatDatesForExhibitionDisplay(start_date)}{' '}
          {end_date && ' - ' + formatDatesForExhibitionDisplay(end_date)}
        </p>
        <h4 className="text-black text-xl font-semibold tracking-tight">
          {title}
        </h4>
        <p className="text-sm !text-[#6B7280] mb-4">
          {description}
        </p>
      </div>
    </Link>
     */}
    </>
  )
}

// Component that renders a full width (short) image
export const WideExhibitionImage = ({
  image,
  has_white_overlay = true,
}: {
  image: string
  has_white_overlay?: boolean
}) => {
  return (
    <div className="w-full h-full relative">
      <div
        className={`absolute top-0 left-0 h-full w-full ${
          has_white_overlay ? 'bg-white/70' : ''
        }`}
      ></div>
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

// Component to populate the Live Exhibitions listing page
export const LiveExhibitionCard = ({
  image,
  slug,
  start_date,
  end_date,
  location,
  title,
  partnership_info,
  description,
}: {
  image?: string
  slug: string
  start_date: string
  end_date?: string
  location?: string
  title: string
  partnership_info?: string
  description: string
}) => {
  let show_end_date: boolean = false

  if (
    end_date &&
    formatDatesForExhibitionDisplay(start_date) ==
      formatDatesForExhibitionDisplay(end_date)
  ) {
    show_end_date = false
  }

  return (
    <Link className={'drop-shadow-xl'} href={`/exhibition/${slug}`}>
      <div className="flex flex-col rounded-tl-lg rounded-tr-lg relative w-full">
        <div className="absolute top-[1rem] left-[1rem] w-fit bg-[#3f3e3a]/80 py-2 px-1 text-xs text-center rounded-[0.1rem] z-[10]">
          <LiveLabel />
        </div>

        <WideExhibitionImage
          has_white_overlay={false}
          image={
            image
              ? `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}event_covers/${image}.jpg`
              : FALLBACK_EXHIBITION_CARD_IMAGE
          }
        />

        <div className="flex flex-col gap-y-2 bg-white p-4 pb-12 rounded-bl-lg rounded-br-lg">
          <div className="w-full flex justify-between items-center">
            <span className="text-lg uppercase">
              {`${formatDatesForExhibitionDisplay(start_date)}
          ${
            end_date && show_end_date
              ? ` - ${formatDatesForExhibitionDisplay(end_date)}`
              : ''
          }`}
            </span>
            <div className="flex gap-x-1 items-center">
              <img src={MapPinIcon.src} className="w-6 h-6" />
              <span>{location ?? 'Online'}</span>
            </div>
          </div>
          <h3 className="text-2xl mt-2">{title}</h3>
          {partnership_info && (
            <p className="text-gray-400 text-xs">{partnership_info}</p>
          )}
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
    </Link>
  )
}
