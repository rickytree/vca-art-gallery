type SaleType = 'fixed' | 'e-auction' | 'd-auction'
type ProjectType = 'artblocks' | 'fxhash' | 'general'

type Artwork = {
  id: string
  contract_address: string
  chain: NetworkType
  token_id: number
  sale_type: SaleType
  project_type: ProjectType
  title: string
  description: string
  image?: string
  drop_date: string
  drop_end_date?: string
  mint_info?: MintInfo
  artist?: User[]
  display_uri?: string
  accounts?: Account
  is_v2?: boolean // determines whether it's a v2 token
}

type EthArtwork = {
  startTime: string
  endTime: string
  creator: string
  name: string
  nft: string // contract address
}

type MintInfo = {
  starting_price: number // for fixed sale, starting and current price should be the same
  current_price?: number // optional as we need to query client side for auctions/dutch auctions
  current_availability: number
  total_supply: number
  decay?: number
  bid_history?: Bid[] /** only for auctions */
  is_allowlist_minting?: boolean
}

type Bid = {
  id: string
  contract: string
  token_id: number
  bidder: string
  amount: number
  timestamp: string
}

type ArtblocksProject = {
  project_id: number
  title: string
  artist_address: string
  is_flex: boolean
  render_delay: number
  sale_duration: number
  sansa_collection_url: string
}

type EthCollection = {
  id: string
  address: string
  name: string
  symbol: string
  is_lazy: boolean
  is_erc721: boolean
}
