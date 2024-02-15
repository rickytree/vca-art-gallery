import Link from 'next/link'

// Collection Listing card
export const CollectionCard = ({ collection }: { collection: any }) => {
  return (
    <>
      <Link
        className="rounded-md bg-white drop-shadow-xl"
        href={`/exhibition/${collection.slug}`}
      >
        <div className="relative !w-full h-56">
          <img
            src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}event_covers/${collection.v2_id}.jpg`}
            className="absolute rounded-md top-0 left-0 w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-y-1 p-4 bg-white rounded-bl-lg rounded-br-lg">
          <h4 className="text-black text-xl font-semibold tracking-tight">
            {collection.accounts ? collection.accounts.username : 'Artist'}
          </h4>
          <h4 className="text-[#6B7280] text-xl font-medium tracking-tight">
            {collection.title}
          </h4>
          {/*
                <p className="uppercase text-[#858585] text-sm">
                {formatDatesForExhibitionDisplay(collection.start_date)}{' '}
                {collection.end_date && ' - ' + formatDatesForExhibitionDisplay(collection.end_date)}
                </p>
                */}
          <p className="text-sm text-neutral !text-[#6B7280] mb-4">
            {collection.description}
          </p>
        </div>
      </Link>
    </>
  )
}
