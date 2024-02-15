import { useEffect, useState } from 'react'
import { TallPageHeader } from '../components/common/page_header'
import {
  ExhibitionCard,
  LiveExhibitionCard,
  V2ExhibitionCard,
  UpcomingExhibitionCard,
} from '../components/exhibition/exhibition_card'
import { ExhibitionListTabs } from '../components/exhibition/tabs'
import { gql, useQuery } from '@apollo/client'
import { GET_ALL_EXHIBITIONS } from '../lib/database/exhibition'
import { exhibition_object_mapper } from '../lib/helpers/exhibition'
import ExhibitionImagePlaceholder from '../images/EXHIBITION_PLACEHOLDER.jpg'
import { TextWithLongArrow } from '../components/ui/Button/text-long-arrow'
import PageLoading from '../components/ui/Loading'
import NoData from '../components/ui/Loading/nodata'
import { SEO } from '@/src/components/seo'
import Link from 'next/link'

type ExhibitionListing = {
  live: Exhibition[]
  upcoming: Exhibition[]
  past: Exhibition[]
}

export default function ExhibitionListingPage({
  exhibitionData,
  frontmatter,
  markdownBody,
}: {
  exhibitionData: any
  frontmatter: any
  markdownBody: any
}) {
  const { loading, error, data } = useQuery(GET_ALL_EXHIBITIONS)

  const [exhibitions, setExhibitions] = useState<ExhibitionListing>()
  const [selectedTab, setSelectedTab] = useState<'live' | 'upcoming' | 'past'>(
    'live',
  )
  const [visibleTabs, setVisibleTabs] = useState<
    ('live' | 'upcoming' | 'past')[]
  >(['past'])

  // implements the load more functionality for live exhibitions
  const [slice, setSlice] = useState<number>(1)

  useEffect(() => {
    if (data) {
      const { v3_events } = data

      // transform the data from db to the correct format
      // supported by the gallery
      if (v3_events && v3_events.length > 0) {
        let eventsWithoutSubEvents = v3_events.filter(
          (exhibition: Exhibition) => exhibition.sub_event == false,
        )
        let _exhibitions = exhibition_object_mapper(eventsWithoutSubEvents)
        _exhibitions = [..._exhibitions].sort(
          (a: Exhibition, b: Exhibition) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
        )

        let liveExhibitions = _exhibitions.filter((exhibition: Exhibition) => {
          // by default, if no end_date set for exhibition, we take it as a 1 day event
          let end =
            exhibition.end_date ||
            new Date(exhibition.start_date).setDate(
              new Date(exhibition.start_date).getDate() + 1,
            )
          return (
            new Date().getTime() >= new Date(exhibition.start_date).getTime() &&
            new Date().getTime() < new Date(end).getTime()
          )
        })

        let pastExhibitions = _exhibitions.filter(
          (exhibition: Exhibition) =>
            !liveExhibitions.includes(exhibition) &&
            new Date(exhibition.start_date) < new Date(),
        )
        let upcomingExhibitions = _exhibitions.filter(
          (exhibition: Exhibition) =>
            new Date() < new Date(exhibition.start_date),
        )

        // set visible tabs
        let _visibleTabs: ('live' | 'upcoming' | 'past')[] = []
        if (liveExhibitions.length > 0) _visibleTabs.push('live')
        if (upcomingExhibitions.length > 0) _visibleTabs.push('upcoming')
        if (pastExhibitions.length > 0) _visibleTabs.push('past')
        setVisibleTabs(_visibleTabs)
        setSelectedTab(_visibleTabs[0])

        setExhibitions({
          live: liveExhibitions || [],
          upcoming: upcomingExhibitions || [],
          past: pastExhibitions || [],
        })
      }
    }
  }, [data])

  return (
    <main className="font-sans mx-auto min-h-screen">
      <SEO current_page="Exhibitions" />
      <TallPageHeader
        title="Discover our exhibitions"
        description=""
        background={ExhibitionImagePlaceholder.src}
      />

      <div className="max-w-7xl mx-auto relative w-full">
        <ExhibitionListTabs
          currentTab={selectedTab}
          setTab={setSelectedTab}
          displayTabs={visibleTabs}
        />
      </div>

      {selectedTab == 'live' && (
        <div className="mt-20 flex flex-col gap-y-24 mb-20 max-w-7xl sm:px-20 px-4 mx-auto">
          {loading ? (
            <PageLoading />
          ) : (
            <LiveExhibitions
              exhibitions={[...(exhibitions?.live || [])].slice(0, slice * 3)}
            />
          )}
          {exhibitions?.live && exhibitions.live.length / 3 > slice && (
            <a
              className="cursor-pointer mx-auto border-b-2 border-black w-fit"
              onClick={() => setSlice(slice + 1)}
            >
              <TextWithLongArrow text="View more" />
            </a>
          )}
        </div>
      )}
      {selectedTab == 'upcoming' && (
        <div className="mt-20 flex flex-col gap-y-24 mb-20 max-w-7xl mx-auto sm:px-20 px-4">
          {loading ? (
            <PageLoading />
          ) : (
            <UpcomingExhibitionCardListing
              exhibitions={exhibitions?.upcoming || []}
            />
          )}
        </div>
      )}
      {selectedTab == 'past' && (
        <div className="mt-20 flex flex-col gap-y-24 mb-20 max-w-7xl mx-auto md:px-20 sm:px-12 px-4">
          {loading ? (
            <PageLoading />
          ) : (
            <ExhibitionCardListing exhibitions={exhibitions?.past || []} />
          )}
        </div>
      )}
    </main>
  )
}

export const LiveExhibitions = ({
  exhibitions,
}: {
  exhibitions: Exhibition[]
}) => {
  return (
    <>
      {exhibitions.length === 0 ? (
        <NoData />
      ) : (
        exhibitions.map((exhibition: Exhibition, index) => (
          <LiveExhibitionCard
            key={index}
            image={exhibition.v2_id ?? ''}
            title={exhibition.title}
            start_date={exhibition.start_date}
            end_date={exhibition.end_date}
            description={exhibition.description}
            //slug={`/exhibition/${exhibition.id}`}
            slug={exhibition.slug}
          />
        ))
      )}
    </>
  )
}

export const UpcomingExhibitionCardListing = ({
  exhibitions,
}: {
  exhibitions: Exhibition[]
}) => {
  return (
    <>
      {exhibitions.length > 0 ? (
        exhibitions.map((exhibition: Exhibition, index) => (
          <UpcomingExhibitionCard
            image={exhibition.v2_id ?? ''}
            title={exhibition.title}
            start_date={exhibition.start_date}
            description={exhibition.description}
            //tags={['pop-up', 'gallery']}
            slug={exhibition.slug}
            key={index}
          />
        ))
      ) : (
        <p className="mt-4 mx-auto text-gray-500">
          There are no upcoming exhibitions at the moment.
        </p>
      )}
    </>
  )
}

export const ExhibitionCardListing = ({
  exhibitions,
}: {
  exhibitions: Exhibition[]
}) => {
  return (
    <>
      <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 lg:gap-x-10 gap-x-4 gap-y-20">
        {exhibitions.length > 0 ? (
          exhibitions.map((exhibition: Exhibition, index) =>
            exhibition.event_url ? (
              <V2ExhibitionCard
                image={exhibition.v2_id ?? ''}
                title={exhibition.title}
                start_date={exhibition.start_date}
                description={exhibition.description}
                //tags={['pop-up', 'gallery']}
                v2_link={exhibition.event_url}
                key={index}
              />
            ) : (
              <ExhibitionCard
                image={exhibition.v2_id ?? ''}
                title={exhibition.title}
                start_date={exhibition.start_date}
                description={exhibition.description}
                //tags={['pop-up', 'gallery']}
                slug={exhibition.slug}
                key={index}
              />
            ),
          )
        ) : (
          <p className="mt-4 mx-auto text-gray-500">
            There are no upcoming exhibitions at the moment.
          </p>
        )}
      </div>
    </>
  )
}
