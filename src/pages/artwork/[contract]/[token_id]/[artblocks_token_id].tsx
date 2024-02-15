import { SimpleArtistBio } from '@/src/components/artist/artist_bio'
import { ArtworkGeneralInfo } from '@/src/components/artwork/artwork_info'
import { ArtworkMintInfo } from '@/src/components/artwork/artwork_mint_info'
import { ArtworkHeader } from '@/src/components/artwork/artwork_page_header'
import { Footer } from '@/src/components/common/footer'
import { Nav } from '@/src/components/common/nav'
import { ARTBLOCKS_FLEX_CONTRACT_ADDRESS } from '@/src/lib/constants'
import {
  getAbProjectInfo,
  getAbTokenMintInfo,
  singleAbTokenInfo,
} from '@/src/lib/crypto/artblocks'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export async function getServerSideProps(context: any) {
  // Extract contract and id of artwork from context
  const { contract, token_id: project_id, artblocks_token_id } = context.params

  let artworkData = {}
  let projectType: ProjectType = 'general'
  let network: NetworkType = 'Ethereum'

  // check if contract is an ab contract
  if (contract.toLowerCase() == ARTBLOCKS_FLEX_CONTRACT_ADDRESS.toLowerCase()) {
    try {
      let projectDetails: any = await singleAbTokenInfo(
        Number(project_id),
        Number(artblocks_token_id),
      )
      projectType = 'artblocks'
      artworkData = projectDetails
    } catch (error) {
      console.error(error)
    }
  } else {
    // not ab tokens
  }

  return {
    props: {
      artwork_data: artworkData,
      artwork_type: projectType,
    },
  }
}

export default function ArtworkPage({
  artwork_data,
  artwork_type,
}: {
  artwork_data: any
  artwork_type: ProjectType
}) {
  const sansa_url = `https://sansa.xyz/asset/0x32d4be5ee74376e08038d652d4dc26e62c67f436/${artwork_data.tokenID}`

  const featuresKeys: any[] = Object.keys(artwork_data.features || {})
  const featuresValues: any[] = Object.values(artwork_data.features || {})
  const [mintTime, setMintTime] = useState<string>('')
  const [owner, setOwner] = useState<string>('')

  useEffect(() => {
    const getMintInfo = async () => {
      const data: any = await getAbTokenMintInfo(
        `${ARTBLOCKS_FLEX_CONTRACT_ADDRESS.toLowerCase()}-${
          artwork_data.tokenID
        }`,
      )
      if (data) {
        setMintTime(
          new Date(Number(data.token?.createdAt * 1000)).toUTCString(),
        )
        setOwner(data.token?.owner.id)
      }
    }
    if (artwork_data) getMintInfo()
  }, [artwork_data])
  if (artwork_data) {
    return (
      <div className="font-sans mx-auto min-h-screen">
        <ArtworkHeader
          content_uri={artwork_data.image || ''}
          image_url={artwork_data.image || ''}
          toggle_props={{
            preview_url: artwork_data.image,
            sansa_url: sansa_url,
            generator_url: artwork_data.generator_url,
          }}
        />

        <main className="max-w-7xl flex justify-between mx-auto px-10 py-20">
          <div className="w-1/2 flex-col">
            <h2 className="font-bold text-4xl mb-8">
              About {artwork_data.name}
            </h2>
            {featuresKeys.map((item: any, index: number) => (
              <div className="flex gap-x-4">
                <p className="w-1/3">{item}</p>
                <p className="w-2/3 font-medium text-gray-500">
                  {featuresValues[index].toString()}
                </p>
              </div>
            ))}
          </div>
          <div className="w-1/3 flex flex-col gap-y-8 mt-8">
            <LabelTextField
              label="Token"
              text={`${artwork_data.name.split(' #')[1]} of ${
                artwork_data.supply
              }`}
            />
            <LabelTextField label="Minted on" text={mintTime} />
            <LabelTextField label="Owned by" text={owner} />
          </div>
        </main>
      </div>
    )
  }
}

const LabelTextField = ({ label, text }: { label: string; text: any }) => {
  return (
    <div className="flex flex-col gap-y-1">
      <p className="text-gray-300 font-mono uppercase">{label}</p>
      <p className="text-black font-md">{text}</p>
    </div>
  )
}
