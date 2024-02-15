import { gql } from '@apollo/client'

// get all admin accounts
const GET_ALL_ACCOUNTS = gql`
  query GetAdminAccounts {
    vca_main_account {
      username
      tezos
      ethereum
      role
    }
  }
`

// retrieves an account info baed on eth or tezos address
const GET_ACCOUNT_BY_ADDRESS = gql`
  query GetAccountByEthOrTezAddress(
    $ethereum: String
    $tezos: String
    $role: String
  ) {
    vca_main_account(
      where: {
        _or: [
          { ethereum: { _ilike: $ethereum } }
          { tezos: { _ilike: $tezos } }
        ]
        _and: { role: { _eq: $role } }
      }
    ) {
      id
      name
      tezos
      ethereum
      role
    }
  }
`

// create an admin account
const CREATE_ADMIN_ACCOUNT = gql`
  mutation InsertAdminAccount(
    $username: String
    $ethereum: String
    $tezos: String
    $website: String
    $profile_picture: String
    $role: String
  ) {
    insert_vca_main_account(
      objects: {
        username: $username
        ethereum: $ethereum
        tezos: $tezos
        website: $website
        profile_picture: $profile_picture
        role: $role
      }
    ) {
      affected_rows
      returning {
        id
        username
        ethereum
        tezos
        website
        profile_picture
      }
    }
  }
`

// update an admin account
const UPDATE_ADMIN_ACCOUNT = gql`
  mutation UpdateAccount(
    $username: String
    $ethereum: String
    $tezos: String
    $website: String
    $profile_picture: String
  ) {
    update_vca_main_account(
      where: {
        _or: {
          ethereum: { _eq: $ethereum }
          tezos: { _eq: $tezos }
          username: { _eq: $username }
        }
      }
      _set: {
        username: $username
        tezos: $tezos
        ethereum: $ethereum
        profile_picture: $profile_picture
        website: $website
      }
    ) {
      affected_rows
      returning {
        id
        username
        tezos
        ethereum
        website
      }
    }
  }
`

const GET_ADMINS = gql`
  query GetAdmins {
    v3_accounts(where: { account_roles: { role: { _eq: "admin" } } }) {
      id
      username
      ethereum
      tezos
    }
  }
`

const GET_ROLE_BY_ETH_ADDRESS = gql`
  query GetRoleByAddress($eth_wallet: String!) {
    v3_accounts(where: { ethereum: { _ilike: $eth_wallet } }) {
      role
    }
  }
`

export {
  GET_ALL_ACCOUNTS,
  GET_ACCOUNT_BY_ADDRESS,
  CREATE_ADMIN_ACCOUNT,
  UPDATE_ADMIN_ACCOUNT,
  GET_ADMINS,
  GET_ROLE_BY_ETH_ADDRESS,
}
