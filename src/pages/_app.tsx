import '../styles/globals.css'
import App, { AppProps, AppContext } from 'next/app'
import { WagmiConfig } from 'wagmi'
import apolloClientConfig from '../../src/lib/database/apollo'
import { ApolloProvider } from '@apollo/client'

import { createConfig, configureChains, mainnet } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { Layout } from '../components/common/layout'
import { goerli } from '@wagmi/chains'

interface AppType extends AppProps {
  token: string
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, goerli],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    publicProvider(),
  ],
)

const config = createConfig({
  publicClient,
  webSocketPublicClient,
  autoConnect: true,
})

const CustomApp = ({ Component, pageProps, token }: AppType) => {
  const client = apolloClientConfig()
  return (
    <WagmiConfig config={config}>
      <ApolloProvider client={client}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ApolloProvider>
    </WagmiConfig>
  )
}

CustomApp.getInitialProps = async (context: AppContext) => {
  let token
  // try {
  //   token = await fetchToken()
  // } catch (error) {
  //   console.error(error)
  // }

  const ctx = await App.getInitialProps(context)

  return { ...ctx, token: token }
}

export default CustomApp
