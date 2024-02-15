import { formatEther, isAddress } from 'viem'
import { getEthCollectionDetails } from '../crypto/ethereum'

export const artblocks_object_mapper = (projectsArr: any[]) => {
  let mappedProjects: ArtblocksProject[] = projectsArr.map((project: any) => {
    return {
      project_id: Number(project.project_id),
      title: project.title,
      artist_address: project.artist_address,
      is_flex: project.flex_engine ?? false,
      render_delay: project.render_delay ?? 0,
      sale_duration: project.sale_duration ?? undefined,
      sansa_collection_url: project.sansa_collection_link ?? undefined,
    }
  })

  return mappedProjects
}

type TokenFeatures = {
  id: number
  features: any
}

/** Returns an object of all possible features of the collection, 
 * and for each feature, the number of tokens that has each possible value of the feature.
 * 
 * i.e this function returns an object that looks like the following:
 *  {
        "hat": {"cap": 1, "visor": 2},
        "shirt": {"blue": 2, "green": 1},
    }
 */
export const getCollectionFeaturesFrequency = (
  tokens_array: TokenFeatures[],
) => {
  let frequencyMapping: any = {}

  // get feature set from the first token,
  // as all tokens have the same
  // # of features.
  let features = Object.keys(tokens_array[0].features)

  tokens_array.forEach((token: TokenFeatures) => {
    features.map((feature: string) => {
      // get current token value for this feature
      const value = token.features[feature]

      if (!frequencyMapping[feature] || !frequencyMapping[feature][value]) {
        // initialize this feature
        if (!frequencyMapping[feature]) {
          frequencyMapping[feature] = {}
        }

        frequencyMapping[feature][value] = 1
      } else {
        frequencyMapping[feature][value] = frequencyMapping[feature][value] + 1
      }
    })
  })

  return frequencyMapping
}

export const artwork_object_mapper = (artworkArr: any[]) => {
  let mappedArtwork: Artwork[] = artworkArr.map((artwork: any) => {
    let sales_type: SaleType =
      artwork.token_info.sales_type == 'auction' ? 'e-auction' : 'fixed'

    // map token creators to a User object
    /**
     * id: string
      name: string
      avatar?: string
      bio?: string
      website?: string
      ethereum?: string
      tezos?: string
      role: ('artist' | 'curator' | 'sponsor')[]
     */

    const artists = artwork.token_info.token_creators
      ? artwork.token_info.token_creators.map((creator: any) => {
          const isEthAddress = isAddress(creator.address)

          return {
            id: 'db-' + creator.id.toString(),
            name: isEthAddress
              ? creator.account_info_eth?.username || ''
              : creator.account_info_tez?.username || '',
            avatar: '',
            bio: '',
            website: '',
            ethereum: isEthAddress
              ? creator.account_info_eth?.ethereum || ''
              : '',
            tezos: !isEthAddress ? creator.account_info_tez?.tezos || '' : '',
            role: ['artist'],
          }
        })
      : []

    return {
      id: artwork.token_info.id,
      contract_address: artwork.token_info.contract,
      chain: artwork.token_info.chain == 'tezos' ? 'Tezos' : 'Ethereum',
      token_id: artwork.token_info.token_id,
      sale_type: sales_type,
      project_type: 'general',
      title: artwork.token_info.title,
      description: artwork.token_info.description || '',
      image: artwork.token_info.display_uri,
      drop_date:
        artwork.token_info.drop_date ||
        Number(artwork.listing_info.startTime) * 1000 ||
        new Date().getTime(),
      drop_end_date:
        artwork.token_info.drop_end_date ||
        Number(artwork.listing_info.endTime) * 1000 ||
        null,
      artist: artists ? artists : [],
      is_v2: artwork.token_info.v2_id ? true : false,
      ...artwork.listing_info,
    }
  })

  return mappedArtwork
}

export const bids_object_mapper = (bidsArr: any[]) => {
  let mappedBids: Bid[] = bidsArr.map((bid: any) => {
    return {
      id: bid.timestamp,
      contract: bid.listing.nft,
      token_id: Number(bid.listing.tokenId),
      bidder: bid.bidder,
      amount: Number(formatEther(bid.amount as bigint)),
      timestamp: bid.timestamp,
    }
  })

  return mappedBids
}

export const collections_obj_mapper = async (collectionsArr: any[]) => {
  const addresses = collectionsArr.map((collection: any) => collection.address)

  const collection_details = await getEthCollectionDetails(addresses)

  let mappedCollections: EthCollection[] = collectionsArr.map(
    (collection: any, index: number) => {
      return {
        id: collection.id,
        address: collection.address,
        name: collection_details[index].name,
        symbol: collection_details[index].symbol,
        is_lazy: collection.lazy,
        is_erc721: collection.is721,
      }
    },
  )

  return mappedCollections
}
