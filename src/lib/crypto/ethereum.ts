import {
  getNetwork,
  prepareWriteContract,
  readContracts,
  switchNetwork,
  waitForTransaction,
  writeContract,
} from 'wagmi/actions'
import {
  ETH_CHAIN_ID,
  ETH_MARKETPLACE_CONTRACT_ADDRESS,
  ETH_MARKETPLACE_PARAMS,
  ETH_SUBGRAPH,
  ETH_TOKENFACTORY_PARAMS,
  IPFS_GATEWAY,
  NETWORK,
} from '../constants'
import { readContract } from 'wagmi/actions'
import {
  TransactionReceipt,
  formatEther,
  isAddress,
  parseEther,
  zeroAddress,
} from 'viem'
import { bids_object_mapper } from '../helpers/artwork'
import apolloClientConfig from '../database/apollo'
import { getAllExhibitedListingsInDb, getUserExhibitedListings } from '../database/exhibition'
const keccak256 = require('keccak256')
import { encodeAbiParameters, parseAbiParameters } from 'viem'
import { gql } from '@apollo/client'
import { ADD_WHITELISTED_ADDRESSES } from '../database/tokens'
const { MerkleTree } = require('merkletreejs')
import { ethers, utils } from 'ethers'

const tokenABI = require('../abi/eth-token.json')

/** COLLECTION CREATION FUNCTIONS FOR CREATOR  */

type EthCollectionObj = {
  is_erc721: boolean
  name: string
  symbol: string
  is_lazy?: boolean
}

export const createEthCollection = async (collectionObj: EthCollectionObj) => {
  const { chain } = getNetwork()

  let network = chain?.id

  if (network !== ETH_CHAIN_ID) {
    const updated_chain = await switchNetwork({
      chainId: ETH_CHAIN_ID,
    })

    network = updated_chain.id
  }

  if (network == ETH_CHAIN_ID) {
    const config = await prepareWriteContract({
      ...ETH_TOKENFACTORY_PARAMS,
      functionName: 'createToken',
      args: [
        collectionObj.is_erc721,
        collectionObj.name,
        collectionObj.symbol,
        collectionObj.is_lazy,
      ],
    })

    const { hash } = await writeContract(config)

    const receipt: TransactionReceipt = await waitForTransaction({
      chainId: NETWORK == 'mainnet' ? 1 : 5,
      hash,
    })

    return [receipt.status, receipt.logs[0].address]
  } else {
    return undefined
  }
}

export const getEthCollectionDetails = async (contract_addresses: string[]) => {
  let params: any[] = []
  let results: { name: string; symbol: string }[] = []

  contract_addresses.forEach((contract_address: string) => {
    const tokenDetails = {
      address: contract_address,
      abi: tokenABI,
    }

    const nameParams = {
      ...tokenDetails,
      functionName: 'name',
    }

    const symbolParams = {
      ...tokenDetails,
      functionName: 'symbol',
    }

    params = [...params, nameParams, symbolParams]
  })

  const data = await readContracts({
    contracts: params,
  })

  for (let i = 0; i < contract_addresses.length; i++) {
    const starting_index = i * 2

    // returns an array of { name, symbol } objects
    // for each contract
    results = [
      // @ts-ignore
      ...results,
      {
        // @ts-ignore
        name: data[starting_index].result,
        // @ts-ignore
        symbol: data[starting_index + 1].result,
      },
    ]
  }

  return results
}

/** TOKEN CREATION FUNCTIONS FOR CREATOR  */

export const mintEthToken = async (
  user_address: string,
  contract_address: string,
  metadata_json_cid: string,
) => {
  const { chain } = getNetwork()

  let network = chain?.id

  if (network !== ETH_CHAIN_ID) {
    const updated_chain = await switchNetwork({
      chainId: ETH_CHAIN_ID,
    })

    network = updated_chain.id
  }

  if (network == ETH_CHAIN_ID) {
    const config = await prepareWriteContract({
      // @ts-ignore
      address: contract_address,
      abi: tokenABI,
      functionName: 'mintBase',
      args: [user_address, 'ipfs://' + metadata_json_cid],
    })

    const { hash } = await writeContract(config)

    const receipt = await waitForTransaction({
      hash,
    })

    // returns status, tx hash and token id
    return [
      receipt.status,
      receipt.transactionHash,
      Number(receipt.logs[0].topics[3]),
    ]
  } else {
    return undefined
  }
}

export const batchMintEthTokens = async (
  user_address: string,
  contract_address: string,
  metadata_json_cid: string,
  edition_size: number,
) => {
  let cids: string[] = []

  for (let i = 1; i <= edition_size; i++) {
    cids.push(`ipfs://${metadata_json_cid}/${i}.json`)
  }

  const { chain } = getNetwork()

  let network = chain?.id

  if (network !== ETH_CHAIN_ID) {
    const updated_chain = await switchNetwork({
      chainId: ETH_CHAIN_ID,
    })

    network = updated_chain.id
  }

  if (network == ETH_CHAIN_ID) {
    const config = await prepareWriteContract({
      // @ts-ignore
      address: contract_address,
      abi: tokenABI,
      functionName: 'mintBaseBatch',
      args: [user_address, cids],
    })

    const { hash } = await writeContract(config)

    const receipt = await waitForTransaction({
      hash,
    })

    const tokenids = receipt.logs.map((r: any) => Number(r.topics[3]))
    return [receipt.status, receipt.transactionHash, tokenids]
  } else {
    return undefined
  }
}

export const getEthArtworkMetadata = async (
  contract_address: string,
  token_id: number,
  is_v2: boolean = false,
) => {
  const tokenDetails = {
    address: contract_address,
    abi: tokenABI,
    chainId: ETH_CHAIN_ID,
  }

  let data: any = await readContract(
    //@ts-ignore
    {
      ...tokenDetails,
      functionName: 'tokenURI',
      args: [token_id],
    },
  )

  //@ts-ignore
  let uri: string = data.split('ipfs://')[1]

  let metadata = await fetch(IPFS_GATEWAY + uri).then((result) => result.json())

  return metadata
}

/** LISTING FUNCTIONS FOR ETH MARKETPLACE */

type EthMarketplaceListing = {
  starting_price: bigint
  resting_price: bigint
  dutch_decay_amount: bigint
  listing_type: number
  edition_size: number
  start_time: number
  end_time: number
  dutch_decay_interval: number
  token_id: number
  contract_address: string
  erc_type: number
  lazy_minted: boolean
}

export const checkEthTokenApprovals = async (
  user_wallet: string,
  contract_address: string,
) => {
  // check if owner did approve token
  let status: any = await readContract({
    // @ts-ignore
    address: contract_address,
    abi: tokenABI,
    functionName: 'isApprovedForAll',
    args: [user_wallet, ETH_MARKETPLACE_CONTRACT_ADDRESS],
  })

  // if `isApprovedForAll` is not trigged at least once
  // by user, request it
  if (!status) {
    return false
  } else {
    return true
  }
}

export const approveAllForContract = async (contract_address: string) => {
  // if `isApprovedForAll` is not trigged at least once
  // by user, request it
  try {
    let config = await prepareWriteContract({
      // @ts-ignore
      address: contract_address,
      abi: tokenABI,
      functionName: 'setApprovalForAll',
      args: [ETH_MARKETPLACE_CONTRACT_ADDRESS, true],
    })

    const { hash } = await writeContract(config)

    const receipt = await waitForTransaction({
      hash,
    })

    if (receipt.status == 'success') {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error(error)
    return false
  }
}

export const createEthMarketplaceListing = async (
  listingObj: EthMarketplaceListing,
) => {
  try {
    const config = await prepareWriteContract({
      ...ETH_MARKETPLACE_PARAMS,
      functionName: 'createListing',
      args: [
        [
          listingObj.starting_price,
          listingObj.resting_price,
          listingObj.dutch_decay_amount,
          listingObj.listing_type,
          listingObj.edition_size,
          listingObj.edition_size,
          listingObj.listing_type == 4 ? 600 : 0,
          0,
          listingObj.dutch_decay_interval,
          '0x0000000000000000000000000000000000000000',
          listingObj.start_time,
          listingObj.end_time,
        ],
        [
          listingObj.token_id,
          listingObj.contract_address,
          listingObj.erc_type,
          listingObj.lazy_minted,
        ],
        [0, 0],
        [],
        false,
      ],
    })

    const { hash } = await writeContract(config)

    const receipt = await waitForTransaction({
      hash,
    })

    return receipt.status
  } catch (error) {
    console.error(error)
    return 'something went wrong'
  }
}

export const updateMarketplaceListing = async (listingParams: {
  listing_id: number
  start_time: number
  end_time: number
  initial_amount: bigint
}) => {
  const config = await prepareWriteContract({
    ...ETH_MARKETPLACE_PARAMS,
    functionName: 'modifyListing',
    args: [
      listingParams.listing_id,
      listingParams.initial_amount,
      listingParams.start_time,
      listingParams.end_time,
    ],
  })

  const { hash } = await writeContract(config)

  const receipt = await waitForTransaction({
    hash,
  })

  return receipt.status
}

// query to retrieve ethereum token info from subgraph
const GET_ETH_MARKETPLACE_INFO = `
  query ethMarketplaceTokens($contract: String, $token_id: String) {
    listings(
      where: {nft: $contract, tokenId: $token_id}
    ) {
      curationBPS
      deliverBPS
      deliverFixed
      dutchDecAmount
      dutchInterval
      editionSize
      endTime
      extensionInterval
      id
      initialAmount
      isFinalized
      marketBPS
      minIncrementBPS
      nft
      payToken
      receiverBPS
      receiver
      restingAmount
      seller
      startTime
      tokenId
      totalAvailable
      totalSold
      type
    }
  }
`

// query to retrieve bids for an english auction for a listing
export const GET_BIDS_BY_LISTING = `
  query bidsByListingId($listing_id: String) {
    listing(id: $listing_id) {
      endTime
    }
    bids(where: {listing: $listing_id}) {
      amount
      bidder
      id
      timestamp
      listing {
        nft
        tokenId
      }
    }
  }
`
// query to retrieve availability info from subgraph
const GET_AVAILABILITY_INFO_BY_LISTING = `
  query tokenAvailability($listing_id: String) {
    listings(
      where: {id: $listing_id}
    ) {
      totalAvailable
      totalSold
    }
  }
`

// get the listing details for eth-marketplace contract using our subgraph
export const getListingDetails = async (contract: string, id: string) => {
  // if token is eth token - fetch from marketplace indexer and return
  if (isAddress(contract)) {
    let result = await fetch(ETH_SUBGRAPH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_ETH_MARKETPLACE_INFO,
        variables: {
          contract: contract,
          token_id: id,
        },
      }),
    })

    result = await result.json()

    // @ts-ignore
    let artwork_info = result?.data.listings[0] || null

    /** format of return value 
    * 
    * {
      "curationBPS": 2000,
      "deliverBPS": 0,
      "deliverFixed": "0",
      "dutchDecAmount": "0",
      "dutchInterval": 0,
      "editionSize": 1,
      "endTime": "1695340800",
      "extensionInterval": 0,
      "id": "0x4f92c9ed5a6f9d6c1a8fd7543d30724e49a75c02/8",
      "isFinalized": false,
      "marketBPS": 0,
      "minIncrementBPS": 0,
      "nft": "0x77c182fc2930a72e052a07acbebd88877254f686",
      "payToken": "0x0000000000000000000000000000000000000000",
      "receiverBPS": null,
      "receiver": null,
      "restingAmount": "10000000000000000",
      "seller": "0x69a6875099915b608656ed9d2b92db0260d9035b",
      "startTime": "1694044800",
      "tokenId": "10",
      "totalAvailable": 1,
      "totalSold": 0,
      "type": 1,
      "name": "Pixel Images #4",
      "description": "Pixel Images by Yours Truly",
      "mediaType": "IMAGE",
      "creator": "0x69A6875099915b608656eD9D2B92db0260D9035b",
      "contentURI": "ipfs://QmZ9vE7aTAFbPjRZR5QF3jrnP4N1UAbKBGLGDLnsH19w8y/4.jpeg",
      "previewURI": "ipfs://QmZ9vE7aTAFbPjRZR5QF3jrnP4N1UAbKBGLGDLnsH19w8y/4.jpeg",
      "image": "ipfs://QmZ9vE7aTAFbPjRZR5QF3jrnP4N1UAbKBGLGDLnsH19w8y/4.jpeg",
      "external_url": "https://verticalcrypto.mypinata.cloud/ipfs/QmZ9vE7aTAFbPjRZR5QF3jrnP4N1UAbKBGLGDLnsH19w8y/4.jpeg"
  }
  */

    if (artwork_info) {
      let allowlistStatus = await checkIfAllowlistWindow(
        Number(artwork_info.id.split('/')[1]),
      )

      let mint_info: MintInfo = {
        starting_price: parseFloat(formatEther(artwork_info.initialAmount)),
        current_price: parseFloat(formatEther(artwork_info.initialAmount)),
        current_availability:
          artwork_info.totalAvailable - artwork_info.totalSold,
        total_supply: artwork_info.editionSize,
        decay:
          Number(artwork_info.dutchDecAmount) == 0
            ? 0
            : parseFloat(formatEther(artwork_info.dutchDecAmount)),
        is_allowlist_minting: allowlistStatus ?? false,
      }

      artwork_info = {
        ...artwork_info,
        chain: 'Ethereum',
        token_id: Number(artwork_info.tokenId),
        sale_type:
          artwork_info.type == 1
            ? 'fixed'
            : artwork_info.type == 4
            ? 'e-auction'
            : 'd-auction',
        mint_info,
      }

      // get current bidders
      if (artwork_info.sale_type == 'e-auction') {
        let data = await getEnglishAuctionBiddingInfo(artwork_info.id)
        let sortedBids = data.bids.sort(
          (bidA: Bid, bidB: Bid) => bidB.amount - bidA.amount,
        )

        artwork_info = {
          ...artwork_info,
          mint_info: {
            ...mint_info,
            bid_history: sortedBids,
            current_price:
              sortedBids.length > 0
                ? sortedBids[0].amount
                : parseFloat(formatEther(artwork_info.initialAmount)),
          },
        }
      }

      // get current price for dutch auction
      if (artwork_info.sale_type == 'd-auction') {
        let new_current_price: bigint = await getListingCurrentPrice(
          Number(artwork_info.id.split('/')[1]),
        )

        artwork_info = {
          ...artwork_info,
          mint_info: {
            ...mint_info,
            current_price: parseFloat(formatEther(new_current_price)),
          },
        }
      }
    }

    // @ts-ignore
    return artwork_info
  }
}

export const getEnglishAuctionBiddingInfo = async (listing_id: string) => {
  let bid_results = await fetch(ETH_SUBGRAPH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_BIDS_BY_LISTING,
      variables: {
        listing_id: listing_id,
      },
    }),
  })

  const result = await bid_results.json()

  let mappedBids = bids_object_mapper(result.data.bids || [])

  // Use reduce to get the highest bid per unique bidder
  const cleanedBids = mappedBids.reduce((accumulator: any, currentBid: Bid) => {
    const bidder = currentBid.bidder
    const bidValue = currentBid.amount

    if (!accumulator[bidder] || bidValue > accumulator[bidder].amount) {
      accumulator[bidder] = currentBid
    }

    return accumulator
  }, {})

  mappedBids = Object.values(cleanedBids)

  let new_end_time = result.data.listing.endTime

  return {
    bids: mappedBids,
    end_time: new_end_time,
  }
}

// function that returns whether a listing is currently in the allowlist minting window
export const checkIfAllowlistWindow = async (listing_id: number) => {
  let status: any = await readContract({
    // @ts-ignore
    ...ETH_MARKETPLACE_PARAMS,
    functionName: 'getListingMerkleRoot',
    args: [listing_id],
  })

  if (
    status ==
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  ) {
    return false
  } else {
    return true
  }
}

// purchase token
type PurchaseTokenProps = {
  sale_type: SaleType
  listing_id: number
  price: number
  current_bidder: boolean
  quantity?: number
  is_allowlist_minting?: boolean
  whitelisted_addresses: string[]
  user_address: string
}

// function that get curent price for a dutch auction
export const getListingCurrentPrice = async (listing_id: number) => {
  let new_current_price: any = await readContract({
    // @ts-ignore
    ...ETH_MARKETPLACE_PARAMS,
    functionName: 'getListingCurrentPrice',
    // args: listingId
    args: [listing_id],
  })

  return new_current_price
}

// listing_id format: <marketplace_contract_address>/<listing_id>
// 0x4f92c9ed5a6f9d6c1a8fd7543d30724e49a75c02/11
export const getListingAvailability = async (listing_id: string) => {
  let result = await fetch(ETH_SUBGRAPH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_AVAILABILITY_INFO_BY_LISTING,
      variables: {
        listing_id: listing_id,
      },
    }),
  })

  result = await result.json()

  // @ts-ignore
  let availability_info = result.data.listings[0]
  let updated_availability =
    availability_info.totalAvailable - availability_info.totalSold

  return updated_availability
}

export const purchaseEthToken = async (params: PurchaseTokenProps) => {
  const {
    sale_type,
    listing_id,
    price,
    current_bidder = false,
    quantity = 1,
    is_allowlist_minting = false,
    user_address,
    whitelisted_addresses,
  } = params
  let config
  let status = false
  let merkleProof = []
  let proof = ''

  if (is_allowlist_minting) {
    // calculate merkle root
    const leafNodes = whitelisted_addresses.map((address: string) => {
      // @ts-ignore
      return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['address'], [address]),
      )
    })

    let merkleTree = new MerkleTree(leafNodes, ethers.utils.keccak256, {
      sortPairs: true,
    })

    if (whitelisted_addresses.length == 1) {
      proof = merkleTree.getHexRoot()
    } else {
      // @ts-ignore
      const userLeaf = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['address'], [user_address]),
      )

      proof = merkleTree.getHexProof(userLeaf)
      merkleProof.push(proof[0])
    }
  }

  if (sale_type == 'fixed' || sale_type == 'd-auction') {
    config = await prepareWriteContract({
      // @ts-ignore
      ...ETH_MARKETPLACE_PARAMS,
      functionName: 'purchase',
      args: [listing_id, merkleProof],
      value: parseEther(price.toString()),
    })
  } else if (sale_type == 'e-auction') {
    config = await prepareWriteContract({
      // @ts-ignore
      ...ETH_MARKETPLACE_PARAMS,
      functionName: 'bid',
      args: [listing_id, 1, false, merkleProof],
      value: parseEther(price.toString()),
    })
  }

  const { hash } = await writeContract(config!)

  const receipt = await waitForTransaction({
    hash,
  })

  if (receipt.status == 'success') {
    status = true
  }

  return status
}

// used for english auctions
// can be called by anyone to finalize the auction or else token will be kept in escrow
export const finalizeListing = async (listing_id: number) => {
  let status: boolean = false

  let config = await prepareWriteContract({
    // @ts-ignore
    ...ETH_MARKETPLACE_PARAMS,
    functionName: 'finalize',
    args: [listing_id],
  })

  const { hash } = await writeContract(config!)

  const receipt = await waitForTransaction({
    hash,
  })

  if (receipt.status == 'success') {
    status = true
  }

  return status
}

/** CREATOR RELATED FUNCTIONS AND QUERIES */

const GET_USER_ETH_COLLECTIONS = `
  query getEthCollections($wallet_address: String) {
    tokens(where: {owner: $wallet_address}) {
      id
      address
      owner
      lazy
      is721
    }
  }
`

const GET_USER_ETH_LISTINGS = `
  query getUserEthListings($wallet_address: String!) {
    listings(where: {seller: $wallet_address}) {
      id
      nft
      tokenId
      startTime
      endTime
      initialAmount
      type
      totalSold
      totalAvailable
    }
  }
`

const GET_ALL_ETH_LISTINGS = `
query getAllListings {
  listings {
    id
    nft
    tokenId
    startTime
    endTime
    initialAmount
    type
    totalSold
    totalAvailable
  }
}
`

export const getUserEthCollections = async (wallet_address: string) => {
  let result = await fetch(ETH_SUBGRAPH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_USER_ETH_COLLECTIONS,
      variables: {
        wallet_address: wallet_address.toLowerCase(),
      },
    }),
  })

  result = await result.json()

  // @ts-ignore
  let collections = result.data.tokens
  return collections
}

export const getUserEthListings = async (wallet_address: string) => {
  let result = await fetch(ETH_SUBGRAPH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_USER_ETH_LISTINGS,
      variables: {
        wallet_address: wallet_address.toLowerCase(),
      },
    }),
  })

  result = await result.json()

  // @ts-ignore
  let listings = result.data.listings

  const userListingsInDb = await getUserExhibitedListings(wallet_address)

  let filteredListings: any[] = []

  // only get exhibited listings
  for (const dbListing of userListingsInDb) {
    for (const unfilteredListing of listings) {
      // Check if 'nft' in unfilteredListing matches 'contract' in dbListing
      // and 'tokenId' in unfilteredLISTING matches 'token_id' in listings
      if (
        unfilteredListing.nft === dbListing.contract &&
        unfilteredListing.tokenId === dbListing.token_id
      ) {
        // Store the matching occurrence
        filteredListings.push({
          ...unfilteredListing,
          title: dbListing.title,
          db_id: dbListing.id,
        })
      }
    }
  }

  return filteredListings
}

export const getAllEthListings = async () => {
  let result = await fetch(ETH_SUBGRAPH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_ALL_ETH_LISTINGS
    }),
  })

  result = await result.json()

  // @ts-ignore
  let listings = result.data.listings

  const userListingsInDb = await getAllExhibitedListingsInDb()

  let filteredListings: any[] = []

  // only get exhibited listings
  for (const dbListing of userListingsInDb) {
    for (const unfilteredListing of listings) {
      // Check if 'nft' in unfilteredListing matches 'contract' in dbListing
      // and 'tokenId' in unfilteredLISTING matches 'token_id' in listings
      if (
        unfilteredListing.nft === dbListing.contract &&
        unfilteredListing.tokenId === dbListing.token_id
      ) {
        // Store the matching occurrence
        filteredListings.push({
          ...unfilteredListing,
          title: dbListing.title,
          db_id: dbListing.id,
        })
      }
    }
  }

  return filteredListings
}

export const addUserToWhitelist = async (
  contract_address: string,
  token_id: string,
  listing_id: number,
  whitelist_addresses: string[],
) => {
  // calculate merkle root
  const leafNodes = whitelist_addresses.map((address: string) =>
    // @ts-ignore
    ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(['address'], [address]),
    ),
  )

  const merkleTree = new MerkleTree(leafNodes, ethers.utils.keccak256, {
    sortPairs: true,
  })

  let merkle_root = merkleTree.getHexRoot()

  // update db
  let whitelisted_addresses_string = whitelist_addresses.join(',')

  const res = await apolloClientConfig().mutate({
    mutation: ADD_WHITELISTED_ADDRESSES,
    variables: {
      contract_address: contract_address,
      token_id: token_id,
      whitelisted_addresses: whitelisted_addresses_string,
    },
  })

  let config = await prepareWriteContract({
    // @ts-ignore
    ...ETH_MARKETPLACE_PARAMS,
    functionName: 'setAllowListMerkleRoot',
    args: [listing_id, merkle_root],
  })

  const { hash } = await writeContract(config)

  const receipt = await waitForTransaction({
    hash,
  })

  return [receipt.status, receipt.transactionHash]
}
