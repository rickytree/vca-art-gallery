import apolloClientConfig from '@/src/lib/database/apollo'
import {
  GET_ALL_AVAILABLE_EXHIBITIONS,
  getExhibitionDetails,
} from '../lib/database/exhibition'
import { HomePageHeader, HomeHeroImage } from '../components/homepage/header'
import { SEO } from '@/src/components/seo'

// import { Nav } from '../components/common/nav'
// import { Footer } from '../components/common/footer'
// import { useRouter } from 'next/router'

export default function Home({ exhibitionData }: { exhibitionData: any }) {
  return (
    <div className="font-sans mx-auto min-h-screen">
      <SEO current_page="Home" title="VerticalCrypto Art" />
      <div className="relative">
        <HomeHeroImage image="https://vca-gallery-v3-bucket.s3.eu-central-1.amazonaws.com/token_covers/FG2309_EmiKusano_Pixelated+Perception_FULL17.jpg" />
        <div className="absolute max-w-7xl bottom-10 left-1/2 -translate-x-1/2 w-full text-black xl:px-0 sm:px-12 px-2 sm:mb-28">
          <HomePageHeader exhibition={exhibitionData} />
        </div>
      </div>
    </div>
  )
}

export async function getStaticProps() {
  let exhibitionData = []
  const client = apolloClientConfig()
  try {
    const { data } = await client.query({
      query: GET_ALL_AVAILABLE_EXHIBITIONS,
    })
    exhibitionData = await getExhibitionDetails(data.v3_events[0].slug)
    // exhibitionData = data?.v3_events
    // exhibitionData = exhibitionData
  } catch (error) {
    console.error(error)
  }

  return {
    props: {
      exhibitionData,
    },
  }
}
