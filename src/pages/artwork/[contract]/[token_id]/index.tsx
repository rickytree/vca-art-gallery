import { SimpleArtistBio } from '@/src/components/artist/artist_bio'
import {
  FilterBadge,
  FilterMenuItem,
} from '@/src/components/artwork/artblocks/filter_menu'
import { ArtblockTokenCard } from '@/src/components/artwork/artblocks/token_card'
import { ArtworkGeneralInfo } from '@/src/components/artwork/artwork_info'
import { ArtworkMintInfo } from '@/src/components/artwork/artwork_mint_info'
import { ArtworkHeader } from '@/src/components/artwork/artwork_page_header'
import { Footer } from '@/src/components/common/footer'
import { Nav } from '@/src/components/common/nav'
import {
  ARTBLOCKS_FLEX_CONTRACT_ADDRESS,
  ARTBLOCKS_TOKEN_ADDRESS,
} from '@/src/lib/constants'
import { getAbProjectInfo } from '@/src/lib/crypto/artblocks'
import { getEthArtworkMetadata } from '@/src/lib/crypto/ethereum'
import { getListingDetails } from '@/src/lib/crypto/ethereum'
import apolloClientConfig from '@/src/lib/database/apollo'
import { GET_TOKEN_WHITELISTED_ADDRESSES } from '@/src/lib/database/tokens'
import { getCollectionFeaturesFrequency } from '@/src/lib/helpers/artwork'
import { displayIpfsImage } from '@/src/lib/utils'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { isAddress } from 'viem'
import { SEO } from '@/src/components/seo'
import { SEO } from '@/src/components/seo'

export async function getServerSideProps(context: any) {
  // Extract contract and id of artwork from context
  const { contract, token_id } = context.params

  let artworkData: any
  let projectType: ProjectType = 'general'
  let network: NetworkType = 'Ethereum'

  // check if contract is an ab contract
  if (contract.toLowerCase() == ARTBLOCKS_FLEX_CONTRACT_ADDRESS.toLowerCase()) {
    try {
      let projectDetails: any = await getAbProjectInfo(Number(token_id))
      projectType = 'artblocks'
      artworkData = projectDetails
    } catch (error) {
      console.error(error)
    }
  } else {
    // not ab tokens
    artworkData = await getListingDetails(contract, token_id)

    if (isAddress(contract)) {
      // if artworkData is not null, it's tokens from v3.
      // otherwise, it's a v2 token
      // we just define a end date earleir than now so it displays
      // as sale ended
      if (!artworkData) {
        artworkData = {
          startTime: 1693526400,
          endTime: 1693526400,
          mint_info: {
            current_availability: 1, // set default to 1 so it reverts to sale ended
          },
        }
      } else {
        if (artworkData.mint_info.is_allowlist_minting) {
          const { data: whitelistedAddresses } =
            await apolloClientConfig().query({
              query: GET_TOKEN_WHITELISTED_ADDRESSES,
              variables: {
                contract: contract,
                token_id: token_id,
              },
            })
          artworkData = {
            ...artworkData,
            whitelisted_addresses: whitelistedAddresses.v3_tokens[0].merkle,
          }
        }
      }

      const tokenMetadata = await getEthArtworkMetadata(
        contract,
        Number(token_id),
        artworkData ? true : false,
      )

      artworkData = {
        ...artworkData,
        ...tokenMetadata,
      }
    }

    projectType = 'general'
  }

  return {
    props: {
      artwork_data: artworkData,
      artwork_type: projectType,
      network,
    },
  }
}

export default function ArtworkPage({
  artwork_data,
  artwork_type,
  network,
}: {
  artwork_data: Artwork & EthArtwork
  artwork_type: ProjectType
  network: NetworkType
}) {
  // @ts-ignore
  const artwork_url = artwork_data.animation_url
    ? artwork_data.animation_url.replace('ipfs://', '')
    : artwork_data.image?.replace('ipfs://', '')
  const image_url = artwork_data.image?.includes('ipfs://')
    ? displayIpfsImage(artwork_data.image?.replace('ipfs://', ''))
    : artwork_data.image

  // @ts-ignore
  const content_type = artwork_data?.contentType || 'image/png'
  const [tab, setTab] = useState<'details' | 'collection' | 'others'>('details')

  const sansa_url = `https://sansa.xyz/asset/0x32d4be5ee74376e08038d652d4dc26e62c67f436/${artwork_data.id}000000`
  const generator_url = `https://generator.artblocks.io/0x32d4be5ee74376e08038d652d4dc26e62c67f436/${artwork_data.id}000000`
  const total_minted =
    (artwork_data?.mint_info?.total_supply || 0) -
    (artwork_data?.mint_info?.current_availability || 0)

  if (artwork_data) {
    return (
      <div className="font-sans mx-auto min-h-screen">
        <SEO
          current_page="Artwork"
          image_link={image_url || ''}
          description={artwork_data.description}
          title={artwork_data.title || artwork_data.name}
        />
        <ArtworkHeader
          content_uri={artwork_url || ''}
          image_url={image_url || ''}
          artwork_type={content_type}
          toggle_props={{
            preview_url: image_url!,
            sansa_url: artwork_type == 'artblocks' ? sansa_url : '',
            generator_url: artwork_type == 'artblocks' ? generator_url : '',
            opensea_url:
              artwork_type == 'general' && artwork_data.chain == 'Ethereum'
                ? `https://opensea.io/assets/ethereum/${artwork_data.nft}/${artwork_data.token_id}`
                : undefined,
          }}
          show_tabs={artwork_type == 'artblocks' ? true : false}
          current_tab={tab}
          set_tab={setTab}
        />

        <main className="max-w-7xl flex justify-between mx-auto px-10 py-20">
          {/* Details info */}
          {tab == 'details' ? (
            <div className="w-full grid grid-cols-5 xl:gap-24 gap-10">
              <div className="md:col-span-3 col-span-5">
                <ArtworkGeneralInfo
                  title={artwork_data.title || artwork_data.name}
                  description={artwork_data.description}
                  artist_address={
                    (artwork_data.artist &&
                      artwork_data.artist.length > 0 &&
                      artwork_data.artist[0].ethereum) ||
                    (artwork_data.artist &&
                      artwork_data.artist.length > 0 &&
                      artwork_data.artist[0]?.tezos) ||
                    artwork_data.creator ||
                    ''
                  }
                />
              </div>
              <div className="md:col-span-2 col-span-5 flex justify-center items-start">
                {artwork_type == 'artblocks' ? (
                  <ArtworkMintInfo
                    mint_info={{
                      start_date: artwork_data.drop_date,
                      sale_details: artwork_data,
                    }}
                  />
                ) : (
                  <ArtworkMintInfo
                    mint_info={{
                      start_date: Number(artwork_data.startTime) * 1000,
                      end_date: artwork_data.endTime
                        ? Number(artwork_data.endTime) * 1000
                        : undefined,
                      sale_details: artwork_data,
                      is_allowlist_minting:
                        artwork_data.mint_info?.is_allowlist_minting || false,
                    }}
                  />
                )}
              </div>
            </div>
          ) : tab == 'collection' ? (
            <ArtblocksCollectionTab
              project_id={Number(artwork_data.id)}
              total_minted={total_minted}
            />
          ) : (
            <></>
          )}
        </main>
      </div>
    )
  }
}

const ArtblocksCollectionTab = ({
  project_id,
  total_minted,
}: {
  project_id: number
  total_minted: number
}) => {
  const token_ids = Array.from(Array(total_minted).keys())

  const [tokensInfo, setTokensInfo] = useState<any>([])
  const [featuresFrequency, setFeaturesFrequency] = useState<any>({})

  const [currentFilters, setCurrentFilters] = useState<any>({})
  const [numFilters, setNumFilters] = useState<number>(0)
  const [activeFeatureFilters, setActiveFeatureFilters] = useState<string[]>([])

  useEffect(() => {
    /** returns an array of tokens with the following format
     * {
     *    id: 0
     *    features: {
     *      Color: "runaway"
     *      Cross Mode: true
     *      Double Mode: false
     *      ...
     *    }
     * }
     */
    const getTokensInfo = async () => {
      const tokens_array = await Promise.all(
        token_ids.map(async (token_id: number) => {
          let tokenDetails: any = await fetch(
            `${ARTBLOCKS_TOKEN_ADDRESS}${project_id}${token_id
              .toString()
              .padStart(6, '0')}`,
          )
          tokenDetails = await tokenDetails.json()
          let features = tokenDetails.features

          return {
            id: token_id,
            features,
          }
        }),
      )

      const _featuresFrequency = getCollectionFeaturesFrequency(tokens_array)
      setFeaturesFrequency(_featuresFrequency)

      setTokensInfo(tokens_array)

      setFilteredTokens(tokens_array.map((item: any) => item.id))
    }

    getTokensInfo()
  }, [])

  useEffect(() => {
    // get number of filters
    if (currentFilters) {
      const featuresMap = Object.keys(currentFilters)

      let featuresArr: any = []

      const valuesMap = Object.values(currentFilters)
      let finalFilters: any = []
      valuesMap.forEach((featureFilters: any, index: number) => {
        finalFilters = [...finalFilters, ...featureFilters]

        if (featureFilters.length > 0) {
          featuresArr = [...featuresArr, featuresMap[index]]
        }
      })

      setActiveFeatureFilters(featuresArr || [])
      setNumFilters(finalFilters && finalFilters.length)
    } else {
      setNumFilters(0)
    }
  }, [currentFilters])

  useEffect(() => {
    // start filtering elements!
    if (activeFeatureFilters.length > 0) {
      let baseItems = tokensInfo

      activeFeatureFilters.map((activeFilter: string) => {
        const filtersInFeatureArr = currentFilters[activeFilter]

        baseItems = [...baseItems].filter((token: any) =>
          filtersInFeatureArr.includes(token.features[activeFilter]),
        )
      })

      let new_token_ids = baseItems.map((item: any) => item.id)
      setFilteredTokens(new_token_ids)
    } else {
      setFilteredTokens(tokensInfo.map((item: any) => item.id))
    }
  }, [activeFeatureFilters])

  // Pagination
  const itemsPerPage = 9

  const [itemOffset, setItemOffset] = useState(0)
  const [currentItems, setCurrentItems] = useState([])

  const [filteredTokens, setFilteredTokens] = useState<number[]>(currentItems)
  const [pageCount, setPageCount] = useState<number>(
    Math.ceil(token_ids.length / itemsPerPage),
  )

  // Invoke when user click to request another page.
  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % filteredTokens.length
    setItemOffset(newOffset)
  }

  // changes the pagination and item offset to display when we have
  // a new set of filtered tokens
  useEffect(() => {
    if (filteredTokens.length > 0) {
      const endOffset = itemOffset + itemsPerPage
      const _currentItems: any = filteredTokens.slice(itemOffset, endOffset)
      setCurrentItems(_currentItems)
      setPageCount(Math.ceil(filteredTokens.length / 9))
    }
  }, [filteredTokens, itemOffset])

  return (
    <div className="flex flex-col w-full">
      {numFilters > 0 && (
        <div className="flex gap-x-[2rem] items-center mb-8">
          <span className="font-medium">Active filters:</span>

          <div className="flex flex-wrap gap-x-3">
            {activeFeatureFilters.map(
              (activeFeature: string) =>
                currentFilters[activeFeature] &&
                currentFilters[activeFeature].map((attribute: any) => (
                  <FilterBadge
                    label={activeFeature}
                    value={attribute}
                    currentFilters={currentFilters}
                    setter={setCurrentFilters}
                  />
                )),
            )}
          </div>
        </div>
      )}
      <div className="flex gap-x-[4rem] w-full">
        <div style={{ width: `calc((100% - 4rem) * 0.2)` }}>
          <div className="flex flex-col w-full">
            <div className="flex justify-between mb-8">
              <p className="font-bold">Filters ({numFilters})</p>
            </div>

            {Object.keys(featuresFrequency).map((feature: any) => {
              return (
                <FilterMenuItem
                  label={feature}
                  options={featuresFrequency[feature]}
                  currentFilters={currentFilters}
                  setFilters={setCurrentFilters}
                />
              )
            })}
          </div>
        </div>
        <div style={{ width: `calc((100% - 4rem) * 0.8)` }}>
          <div className="flex flex-col w-full">
            <div className="flex justify-between">
              <p className="font-bold">{filteredTokens.length} items</p>
            </div>

            <div className="flex flex-wrap gap-x-[3rem] gap-y-[3rem] mt-8">
              {currentItems.map((token_id: number) => (
                <div
                  key={token_id}
                  style={{ width: `calc((100% - 6rem) / 3)` }}
                >
                  <ArtblockTokenCard
                    project_id={project_id}
                    token_id={token_id}
                  />
                </div>
              ))}
            </div>

            <div className="w-full flex justify-center mt-16">
              <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                pageCount={pageCount}
                previousLabel="<"
                renderOnZeroPageCount={null}
                className="flex items-center gap-x-2"
                pageClassName="py-1 w-8 text-center border rounded cursor-pointer"
                activeClassName="text-white bg-black"
                previousClassName="pagination-previous w-8 font-mono text-2xl text-center cursor-pointer"
                nextClassName="pagination-next w-8 font-mono text-2xl text-center cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
