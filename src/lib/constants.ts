const coreABI = require('./abi/ab-core.json')
const minterABI = require('./abi/ab-da-minter.json')
const ethMarketplaceABI = require('./abi/eth-marketplace.json')
const ethTokenFactoryABI = require('./abi/eth-collection.json')

/** General */
// @ts-ignore
export const NETWORK: 'mainnet' | 'testnet' =
  process.env.NEXT_PUBLIC_NETWORK ?? 'mainnet'
export const ETH_CHAIN_ID =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet' ? 1 : 5
export const IPFS_GATEWAY = 'https://verticalcrypto.mypinata.cloud/ipfs/'
export const ETHERSCAN_URL =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? 'https://etherscan.io/'
    : 'https://goerli.etherscan.io/'

/** Artblocks variables */
export const ARTBLOCKS_GENERATOR_ADDRESS =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? 'https://generator.artblocks.io/0x32d4be5ee74376e08038d652d4dc26e62c67f436/'
    : 'https://generator-staging-goerli.artblocks.io/0x783d27cf1ed18bedf1360902ce80e44dc6f673b4/'
export const ARTBLOCKS_GENERATOR_ADDRESS_WITHOUT_SLASH =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? 'https://generator.artblocks.io/0x32d4be5ee74376e08038d652d4dc26e62c67f436'
    : 'https://generator-staging-goerli.artblocks.io/0x783d27cf1ed18bedf1360902ce80e44dc6f673b4'

export const ARTBLOCKS_TOKEN_ADDRESS =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? 'https://token.artblocks.io/0x32d4be5ee74376e08038d652d4dc26e62c67f436/'
    : 'https://token.staging.artblocks.io/0x783d27cf1ed18bedf1360902ce80e44dc6f673b4/'
export const ARTBLOCKS_IMAGE_PREVIEW =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? 'https://verticalcrypto-gen-art-mainnet.s3.amazonaws.com/'
    : 'https://verticalcrypto-gen-art-goerli.s3.amazonaws.com/'
export const ARTBLOCKS_OPENSEA_LINK =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? 'https://opensea.io/assets/ethereum/0x32d4be5ee74376e08038d652d4dc26e62c67f436/'
    : 'https://testnets.opensea.io/assets/goerli/0x783d27cf1ed18bedf1360902ce80e44dc6f673b4/'
export const ARTBLOCKS_FLEX_CONTRACT_ADDRESS =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? '0x32d4be5ee74376e08038d652d4dc26e62c67f436'
    : '0x783d27cf1ed18bedf1360902ce80e44dc6f673b4'
export const ARTBLOCKS_DA_MINTER_CONTRACT_ADDRESS =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? '0x4d5264b1ddc39758cad1970d65dd658753e73a45'
    : '0xf7Ca5E38E8Cad36b226d480F5A4E491405Da852A'
export const ARTBLOCKS_ARTIST_PROJECT_SITE =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? 'https://artblocks.io/engine/flex/projects/0x32d4be5ee74376e08038d652d4dc26e62c67f436/'
    : 'https://artist-staging.artblocks.io/engine/flex/projects/0x783d27cf1ed18bedf1360902ce80e44dc6f673b4/'
export const ARTBLOCKS_GRAPHQL =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? 'https://api.thegraph.com/subgraphs/name/artblocks/art-blocks'
    : 'https://api.thegraph.com/subgraphs/name/artblocks/art-blocks-artist-staging-goerli'

export const CORE_ENGINE_PARAMS = {
  address: ARTBLOCKS_FLEX_CONTRACT_ADDRESS as `0x${string}`,
  abi: coreABI,
  chainId: (NETWORK as 'mainnet' | 'testnet') === 'testnet' ? 5 : 1,
}

export const AB_MINTER_PARAMS = {
  address: ARTBLOCKS_DA_MINTER_CONTRACT_ADDRESS as `0x${string}`,
  abi: minterABI,
  chainId: (NETWORK as 'mainnet' | 'testnet') === 'testnet' ? 5 : 1,
}

/** MARKETPLACE */
export const ETH_MARKETPLACE_CONTRACT_ADDRESS =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? '0xf9C5Ab2017100b82A02E40dD3f551dcA37b22bea'
    : '0x4f92c9ed5a6f9d6c1a8fd7543d30724e49a75c02'
export const ETH_SUBGRAPH =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? 'https://api.thegraph.com/subgraphs/name/verticalcryptoart/vertical'
    : 'https://api.thegraph.com/subgraphs/name/defigods/vca-v3-subgraph-goerli'
export const ETH_MARKETPLACE_PARAMS = {
  address: ETH_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
  abi: ethMarketplaceABI,
  chainId: (NETWORK as 'mainnet' | 'testnet') === 'testnet' ? 5 : 1,
}

/** TOKEN FACTORY */
export const ETH_TOKENFACTORY_ADDRESS =
  (NETWORK as 'mainnet' | 'testnet') === 'mainnet'
    ? '0x789cA3762ee4CB2f3511697a784F177B15135E74'
    : '0xc3ecc2F8B1cafc16c58Fa7706964c409c53F2C91'

export const ETH_TOKENFACTORY_PARAMS = {
  address: ETH_TOKENFACTORY_ADDRESS as `0x${string}`,
  abi: ethTokenFactoryABI,
  chainId: (NETWORK as 'mainnet' | 'testnet') === 'testnet' ? 5 : 1,
}

export const DEFAULT_META_DESCRIPTION =
  'VerticalCrypto Art (VCA) is the curatorial house for art & culture on the blockchain, working across art, music and fashion. VCA empowers and elevates culture, through curation, redefining what contemporary culture is.'
export const DEFAULT_META_IMAGE =
  'https://verticalcrypto.art/img/logo/meta-image-logo.jpeg'
