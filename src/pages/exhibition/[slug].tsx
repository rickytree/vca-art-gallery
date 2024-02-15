import {
  GET_ALL_EXHIBITIONS,
  getExhibitionArtists,
  getExhibitionDetails,
} from '@/src/lib/database/exhibition'
import matter from 'gray-matter'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import {
  FALLBACK_EXHIBITION_CARD_IMAGE,
  WideExhibitionImage,
} from '@/src/components/exhibition/exhibition_card'
import { ExhibitionPageTabs } from '@/src/components/exhibition/tabs'
import rehypeRaw from 'rehype-raw'
import { displayIpfsImage, getDate } from '@/src/lib/utils'
import { ExhibitionArtistCard } from '@/src/components/exhibition/artist_card'
import { SponsorCard } from '@/src/components/exhibition/sponsor_card'
import { ArtworkCard } from '@/src/components/artwork/artwork_card'
import { CollectionCard } from '@/src/components/collection/collection_card'
import { ExhibitionHeader } from '@/src/components/exhibition/exhibition_header'
import { useState } from 'react'
import apolloClientConfig from '@/src/lib/database/apollo'
import { exhibition_object_mapper } from '@/src/lib/helpers/exhibition'
import { SEO } from '@/src/components/seo'

export const ExhibitionGeneralInfo = ({
  title,
  date,
  location,
  description,
}: {
  title: string
  date: string
  location?: string
  description: string
}) => {
  return (
    <div className="w-1/2 pb-8 border-b">
      <h2 className="text-neutral font-bold">{title}</h2>
      <p className="text-neutral uppercase">{date}</p>
      {location && <p className="text-neutral/30 uppercase">{location}</p>}

      <p className="mt-6">{description}</p>
    </div>
  )
}

// Initialize all possible dynamic paths
export async function getStaticPaths() {
  // getting all .md files from the exhibitions directory
  //const exhibitions = await glob('exhibitions/*.md')

  // converting the file names to their slugs
  //const exhibitionsSlug = exhibitions.map((file) =>
  //  file.split('/')[1].replace(/ /g, '-').slice(0, -3).trim(),
  //)
  // const token = await fetchToken()
  const client = apolloClientConfig()
  const { data } = await client.query({
    query: GET_ALL_EXHIBITIONS,
  })

  let exhibitions = data.v3_events

  // creating a path for each of the `slug` parameter
  const paths = exhibitions.map((exhibition: any) => {
    return { params: { slug: exhibition.slug } }
  })

  return {
    paths,
    fallback: 'blocking',
  }
}

export async function getStaticProps(context: any) {
  // Extract slug from context
  const { slug } = context.params
  let content: any

  try {
    // retrieving the Markdown file associated to the slug (in /exhibitions)
    // and reading its data
    content = await import(`../../../exhibitions/${slug}.md`)
  } catch {
    content = null
  }

  const data = content ? matter(content.default) : null

  let exhibitionData: any = await getExhibitionDetails(slug)
  let exhibitionInfo = exhibition_object_mapper([exhibitionData])

  let participating_artists: User[] = exhibitionData.participating_artists
  let collections: Collection[] = exhibitionData.v3_sub_events
  exhibitionData.mapped_tokens.sort((a: any, b: any) => a.token_id - b.token_id)

  return {
    props: {
      exhibitionData: exhibitionInfo[0],
      participating_artists: participating_artists || [],
      artworks: exhibitionData.mapped_tokens || [],
      collections: collections || [],
      // this passes the metadata in markdown file, denoted between the `---` separators
      frontmatter: data ? data.data : null,
      markdownBody: data ? data.content : null,
    },
    revalidate: 60, // In seconds
  }
}

export default function Exhibition({
  exhibitionData,
  participating_artists,
  artworks,
  collections,
  frontmatter,
  markdownBody,
}: {
  exhibitionData: any
  participating_artists: User[]
  artworks: Artwork[]
  collections: Collection[]
  frontmatter: any
  markdownBody: any
}) {
  const [selectedTab, setSelectedTab] = useState<
    'about' | 'artists' | 'artworks' | 'sponsors'
  >('artworks')

  return (
    <div className="font-sans mx-auto min-h-screen">
      <SEO
        current_page="Exhibition"
        image_link={
          frontmatter
            ? frontmatter.hero_image
            : displayIpfsImage(exhibitionData.cover_image) ||
              FALLBACK_EXHIBITION_CARD_IMAGE
        }
        description={
          frontmatter
            ? frontmatter.brief_description
            : exhibitionData.description || ''
        }
        title={frontmatter ? frontmatter.title : exhibitionData.title}
      />
      <div className="relative">
        <div className="absolute w-full h-full">
          <WideExhibitionImage
            image={
              frontmatter
                ? frontmatter.hero_image
                : displayIpfsImage(exhibitionData.cover_image) ||
                  FALLBACK_EXHIBITION_CARD_IMAGE
            }
          />
        </div>
        <div className="max-w-7xl w-full text-black sm:pt-12 pb-4 mx-auto">
          <ExhibitionHeader
            exhibition={{
              id: exhibitionData.id,
              title: frontmatter ? frontmatter.title : exhibitionData.title,
              curator: exhibitionData.curator ?? [],
              description: frontmatter
                ? frontmatter.brief_description
                : exhibitionData.description || '',
              start_date: getDate(
                frontmatter
                  ? frontmatter.start_date
                  : exhibitionData.start_date,
              ),
              end_date:
                frontmatter && frontmatter.end_date
                  ? getDate(frontmatter.end_date)
                  : exhibitionData.end_date
                  ? getDate(exhibitionData.end_date)
                  : undefined,
              location: frontmatter
                ? frontmatter.location
                : exhibitionData.location || 'Online',
              sub_event: exhibitionData.sub_event,
              slug: exhibitionData.slug,
              event_url: exhibitionData.event_url,
            }}
          />

          <ExhibitionPageTabs
            hideAbout={frontmatter ? false : true}
            hideSponsors={exhibitionData.sponsors.length > 0 ? false : true}
            currentTab={selectedTab}
            setTab={setSelectedTab}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto sm:px-10 sm:py-16 p-5">
        {selectedTab == 'about' ? (
          <div>
            {frontmatter ? (
              <ReactMarkdown
                components={{
                  // style custom components in the markdown file
                  h2: (props) => (
                    <h2 className="font-bold mb-7 text-black">
                      {props.children}
                    </h2>
                  ),
                  a: (props) => (
                    <a
                      className="underline"
                      href={props.href}
                      target="_blank"
                      rel="noreferral"
                    >
                      {props.children}
                    </a>
                  ),
                  ul: (props) => (
                    <ul className="list-disc list-inside">{props.children}</ul>
                  ),
                  li: (props) => (
                    <li className="leading-6">{props.children}</li>
                  ),
                }}
                rehypePlugins={[rehypeRaw]}
                children={markdownBody}
              />
            ) : (
              exhibitionData.description || 'Lorem Ipsum'
            )}
          </div>
        ) : selectedTab == 'artists' ? (
          <div className="flex justify-center my-10 w-full">
            <div className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 grid-flow-row gap-6 w-full">
              {participating_artists &&
                participating_artists.length > 0 &&
                participating_artists.map((artist: User) => (
                  <ExhibitionArtistCard artist={artist} />
                ))}
            </div>
          </div>
        ) : selectedTab == 'artworks' ? (
          <>
            <div
              className={`${
                collections && collections.length > 0 ? 'grid' : 'hidden'
              } grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 grid-flow-row gap-12`}
            >
              {collections &&
                collections.length > 0 &&
                collections.map((collection: Collection, index) => (
                  <CollectionCard collection={collection} key={index} />
                ))}
            </div>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 grid-flow-row md:gap-12 sm:gap-6">
              {artworks &&
                artworks.length > 0 &&
                artworks.map((artwork: Artwork, index) => (
                  <ArtworkCard token={artwork} key={index} />
                ))}
            </div>
          </>
        ) : (
          <div className="flex justify-center my-10">
            <div className="inline-grid mx-auto grid-cols-4 grid-flow-row gap-6">
              <SponsorCard
                sponsor={{
                  id: 'abcdef',
                  name: 'Sponsor XYZ',
                  avatar:
                    'https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg',
                  website: 'google.com',
                  role: ['sponsor'],
                }}
              />
              <SponsorCard
                sponsor={{
                  id: 'abcdef',
                  name: 'Sponsor XYZ',
                  avatar:
                    'https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg',
                  website: 'google.com',
                  role: ['sponsor'],
                }}
              />
              <SponsorCard
                sponsor={{
                  id: 'abcdef',
                  name: 'Sponsor XYZ',
                  avatar:
                    'https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg',
                  website: 'google.com',
                  role: ['sponsor'],
                }}
              />
              <SponsorCard
                sponsor={{
                  id: 'abcdef',
                  name: 'Sponsor XYZ',
                  avatar:
                    'https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg',
                  website: 'google.com',
                  role: ['sponsor'],
                }}
              />
              <SponsorCard
                sponsor={{
                  id: 'abcdef',
                  name: 'Sponsor XYZ',
                  avatar:
                    'https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg',
                  website: 'google.com',
                  role: ['sponsor'],
                }}
              />
              <SponsorCard
                sponsor={{
                  id: 'abcdef',
                  name: 'Sponsor XYZ',
                  avatar:
                    'https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg',
                  website: 'google.com',
                  role: ['sponsor'],
                }}
              />
              <SponsorCard
                sponsor={{
                  id: 'abcdef',
                  name: 'Sponsor XYZ',
                  avatar:
                    'https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg',
                  website: 'google.com',
                  role: ['sponsor'],
                }}
              />
              <SponsorCard
                sponsor={{
                  id: 'abcdef',
                  name: 'Sponsor XYZ',
                  avatar:
                    'https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg',
                  website: 'google.com',
                  role: ['sponsor'],
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
