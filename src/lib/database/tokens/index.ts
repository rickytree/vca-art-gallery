import { gql } from '@apollo/client'

// retrieve tezos token info
const GET_TEZOS_TOKEN = gql`
  query GetTokenByContractAndTokenId(
    $token_contract: String
    $token_id: String
  ) {
    vca_main_tez_tokens(
      where: {
        _and: {
          token_contract: { _eq: $token_contract }
          token_id: { _eq: $token_id }
        }
      }
    ) {
      id
      name
      artist
      additional_info
      token_contract
      token_id
      description
      edition_size
      mime_type
      tags
      sales_type
      artifact_uri
      display_uri
      thumbnail_uri
      banned
    }
  }
`

// retrieve all artblocks projects for a user
const GET_USER_AB_PROJECTS = gql`
  query GetUserArtblocksProjects($user_address: String!) {
    vca_main_ab_projects(where: { artist_address: { _ilike: $user_address } }) {
      id
      title
      artist_address
      flex_engine
      project_id
      render_delay
      sansa_collection_link
      sale_duration
    }
  }
`

const ADD_ETHTOKEN_TO_TOKENS = gql`
  mutation InsertV3Tokens(
    $chain: String
    $contract: String
    $title: String
    $token_id: String
    $display_uri: String
  ) {
    insert_v3_tokens(
      objects: {
        chain: $chain
        contract: $contract
        title: $title
        token_id: $token_id
        display_uri: $display_uri
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

const ADD_ARTIST_TOKEN = gql`
  mutation InsertV3TokenCreators(
    $address: String
    $contract: String
    $token_id: String
  ) {
    insert_v3_token_creators(
      objects: { address: $address, contract: $contract, token_id: $token_id }
    ) {
      affected_rows
      returning {
        id
        address
        contract
        token_id
        created_at
        updated_at
      }
    }
  }
`

const ADD_WHITELISTED_ADDRESSES = gql`
  mutation addWhitelistedAddresses(
    $contract_address: String
    $token_id: String
    $whitelisted_addresses: String
  ) {
    update_v3_tokens(
      where: {
        contract: { _ilike: $contract_address }
        _and: { token_id: { _eq: $token_id } }
      }
      _set: { merkle: $whitelisted_addresses }
    ) {
      affected_rows
      returning {
        id
        merkle
      }
    }
  }
`

const GET_TOKEN_WHITELISTED_ADDRESSES = gql`
  query getTokenWhitelistedAddresses($contract: String, $token_id: String) {
    v3_tokens(
      where: {
        contract: { _ilike: $contract }
        _and: { token_id: { _eq: $token_id } }
      }
    ) {
      merkle
    }
  }
`

export {
  GET_TEZOS_TOKEN,
  GET_USER_AB_PROJECTS,
  ADD_ETHTOKEN_TO_TOKENS,
  ADD_ARTIST_TOKEN,
  ADD_WHITELISTED_ADDRESSES,
  GET_TOKEN_WHITELISTED_ADDRESSES,
}
