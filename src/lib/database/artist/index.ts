import { gql } from '@apollo/client'

const GET_ARTWORK_BY_ADDRESS = gql`
  query getArtistArtwork($wallet_address: String) {
    v3_tokens(
      where: { token_creators: { address: { _ilike: $wallet_address } } }
    ) {
      id
      title
      contract
      token_id
    }
  }
`
export { GET_ARTWORK_BY_ADDRESS }
