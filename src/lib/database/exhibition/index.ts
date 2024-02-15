import { gql } from '@apollo/client'
import apolloClientConfig from '../apollo'
import { user_object_mapper } from '../../helpers/user'
import { artwork_object_mapper } from '../../helpers/artwork'
import { getListingDetails } from '../../crypto/ethereum'
import { isAddress } from 'viem'

// get all exhibitions with curators
const GET_ALL_EXHIBITIONS = gql`
  query exhibitions {
    v3_events {
      v2_id
      cover_image
      title
      start_date
      end_date
      event_url
      tagline
      slug
      sub_event
      accounts {
        account_info {
          id
          v2_id
          username
          ethereum
          tezos
          profile_picture
          website
          account_roles {
            role
          }
        }
      }
    }
  }
`

// get all exhibitions with token info
const GET_EXHIBITION_TOKENS = gql`
  query GetEventByIdWithEthAndTezTokens($event_id: String) {
    v3_events(where: { event_id: { _eq: $event_id } }) {
      id
      tagline
      v2_id
      cover_image
      title
      event_type
      event_url
      start_date
      end_date
      tokens {
        token_info {
          id
          token_id
          contract
          v2_id
          title
          sale_start
          sale_end
          drop_date
          drop_type
          edition
          external_url
          price
          sale_type
          sold
          countdown
          collection
          additional_info
          chain
          display_uri
        }
      }
    }
  }
`

// get all artists of an exhibition
const GET_EXHIBITION_ARTISTS = gql`
  query GetEvents {
    v3_events(where: { event_id: { _eq: $event_id } }) {
      id
      cover_image
      v2_id
      title
      event_type
      event_url
      tagline
      accounts {
        account_info {
          id
          v2_id
          username
          ethereum
          tezos
          profile_picture
          website
          account_roles {
            role
          }
        }
      }
    }
  }
`

// find exhibition by slug
const GET_EXHIBITION_INFO_BY_SLUG = gql`
  query GetExhibitions($slug: String!) {
    v3_events(where: { slug: { _ilike: $slug } }) {
      id
      v2_id
      cover_image
      title
      start_date
      end_date
      event_url
      tagline
      slug
      sub_event
      accounts {
        account_info {
          id
          v2_id
          username
          ethereum
          tezos
          profile_picture
          website
          account_roles {
            role
          }
        }
      }
      v3_sub_events {
        id
        v2_id
        slug
        title
        cover_image
        accounts {
          username
        }
      }
      tokens {
        token_info {
          id
          token_id
          contract
          v2_id
          title
          sale_start
          sale_end
          drop_date
          drop_type
          edition
          external_url
          price
          sale_type
          sold
          countdown
          collection
          additional_info
          chain
          display_uri
          token_creators {
            id
            account_info_eth {
              username
              ethereum
            }
            account_info_tez {
              username
              tezos
            }
            address
            contract
            token_id
          }
        }
      }
    }
  }
`

const GET_EXHIBITION_ARTISTS_BY_ID = gql`
  query GetEventArtists($event_slug: String) {
    v3_accounts(where: { events: { event_slug: { _eq: $event_slug } } }) {
      id
      ethereum
      profile_picture
      roles
      tezos
      username
      v2_id
      website
      created_at
      updated_at
      account_roles {
        role
      }
    }
  }
`

// query to get all listings that have not expired or elapsed
// for artists to add artworks to
// will be used to populate exhibition dropdown selection
// in creator listing page
const GET_ALL_AVAILABLE_EXHIBITIONS = gql`
  query GetAvailableExhibitions {
    v3_events(where: { end_date: { _gt: now } }) {
      id
      title
      slug
      start_date
      end_date
    }
  }
`
const GET_LATEST_EXHIBITION = gql`
  query GetAvailableExhibitions {
    v3_events(order_by: {end_date: desc}) {
      id
      title
      slug
      start_date
      end_date
    }
  }
`

const ADD_TOKEN_TO_EXHIBITION = gql`
  mutation InsertV3EventTokens(
    $contract: String
    $event_slug: String
    $token_id: String
  ) {
    insert_v3_event_tokens(
      objects: {
        contract: $contract
        event_slug: $event_slug
        token_id: $token_id
      }
    ) {
      affected_rows
      returning {
        id
        contract
        event_slug
        token_id
        created_at
        updated_at
      }
    }
  }
`

const GET_USER_EXHIBITED_LISTINGS = gql`
  query userExhibitedListings($wallet_address: String) {
    v3_tokens(
      where: {
        token_creators: { address: { _ilike: $wallet_address } }
        events: {}
      }
    ) {
      id
      title
      contract
      token_id
    }
  }
`

const GET_ALL_EXHIBITED_LISTINGS = gql`
  query allExhibitedListings {
    v3_tokens{
      id
      title
      contract
      token_id
    }
  }
`

export const getExhibitionDetails = async (slug: string) => {
  // const token = await fetchToken()
  const client = apolloClientConfig()
  const { data } = await client.query({
    query: GET_EXHIBITION_INFO_BY_SLUG,
    variables: {
      slug: slug,
    },
  })

  let tokens = await Promise.all(
    data.v3_events[0].tokens.map(async (token: any) => {
      let listingInfo = {}

      // get listing info from subgraph
      if (isAddress(token.token_info.contract) && !token.token_info.v2_id) {
        listingInfo =
          (await getListingDetails(
            token.token_info.contract,
            token.token_info.token_id,
          )) || {}
      }

      return {
        chain: token.chain == 'tezos' ? 'Tezos' : 'Ethereum',
        drop_date: data.v3_events[0].start_date,
        drop_end_date: data.v3_events[0].end_date || undefined,
        listing_info: listingInfo || {},
        ...token,
      }
    }),
  )

  tokens = artwork_object_mapper(tokens)
  let participating_artists: User[] = []

  tokens.forEach((token: Artwork) => {
    participating_artists = [...participating_artists, ...(token.artist || [])]
  })

  // removes duplicates
  const ids = participating_artists.map(({ id }) => id)
  participating_artists = participating_artists.filter(
    ({ id, name }, index) =>
      !ids.includes(id, index + 1) && !name.includes('curator'),
  )

  return {
    ...data.v3_events[0],
    participating_artists: participating_artists,
    mapped_tokens: [...tokens],
  }
}

export const getExhibitionArtists = async (exhibition_slug: string) => {
  // const token = await fetchToken()
  const client = await apolloClientConfig()
  const { data } = await client.query({
    query: GET_EXHIBITION_ARTISTS_BY_ID,
    variables: {
      event_slug: exhibition_slug,
    },
  })

  let artists = data.v3_accounts
    .map((exhibition: any) => ({ id: exhibition.id, ...exhibition }))
    .filter((user: any) => user.account_roles.includes('artist'))

  artists = user_object_mapper(artists)
  return artists
}

export const getUserExhibitedListings = async (wallet_address: string) => {
  // const token = await fetchToken()
  const { data: exhibitedListings } = await apolloClientConfig().query({
    query: GET_USER_EXHIBITED_LISTINGS,
    variables: {
      wallet_address: wallet_address,
    },
  })

  let listings = exhibitedListings.v3_tokens

  return listings
}

// fetch all exhibited listings in our db
export const getAllExhibitedListingsInDb = async () => {
  // const token = await fetchToken()
  const { data: exhibitedListings } = await apolloClientConfig().query({
    query: GET_ALL_EXHIBITED_LISTINGS,
  })

  let listings = exhibitedListings.v3_tokens

  return listings
}

export {
  GET_ALL_EXHIBITIONS,
  GET_EXHIBITION_TOKENS,
  GET_EXHIBITION_ARTISTS,
  GET_ALL_AVAILABLE_EXHIBITIONS,
  ADD_TOKEN_TO_EXHIBITION,
  GET_ALL_EXHIBITED_LISTINGS
}
