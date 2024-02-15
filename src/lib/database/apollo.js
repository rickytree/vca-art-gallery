import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import axios from 'axios'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

const setWsLink = (token = '') => {
  const client =
    typeof window !== 'undefined'
      ? new GraphQLWsLink(
          createClient({
            url: process.env.NEXT_PUBLIC_HASURA_ENDPOINT,
            connectionParams: {
              // headers: {
              //   Authorization: `Bearer ${token}`
              // },
              headers: {
                'x-hasura-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET,
              },
            },
          }),
        )
      : null
  return client
}

const setHttpLink = (token = '') => {
  return new HttpLink({
    uri: process.env.NEXT_PUBLIC_HASURA_ENDPOINT,
    // headers: { Authorization: `Bearer ${token}` }
    headers: { 'x-hasura-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET },
  })
}

const setLink = (token = '') => {
  const wsLink = setWsLink(token)
  const httpLink = setHttpLink(token)
  return typeof window !== 'undefined' && wsLink != null
    ? split(
        ({ query }) => {
          const def = getMainDefinition(query)
          return (
            def.kind === 'OperationDefinition' &&
            def.operation === 'subscription'
          )
        },
        wsLink,
        httpLink,
      )
    : httpLink
}

export const apolloClientConfig = (tokenProps = '') => {
  const link = setLink(tokenProps)
  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })
  return apolloClient
}

export const fetchToken = async () => {
  let token = ''
  const webhookUrl = `${process.env.NEXT_PUBLIC_WEBHOOK_URL || '/'}getToken`
  try {
    const tokenFetch = (await axios.get(webhookUrl)).data
    token = tokenFetch.token
  } catch (error) {
    console.error(error)
  } finally {
    return token
  }
}

export default apolloClientConfig
