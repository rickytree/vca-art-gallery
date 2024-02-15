import {
  readContract,
  readContracts,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
  getNetwork,
  switchNetwork,
} from 'wagmi/actions'
import {
  AB_MINTER_PARAMS,
  ARTBLOCKS_FLEX_CONTRACT_ADDRESS,
  ARTBLOCKS_GRAPHQL,
  ARTBLOCKS_TOKEN_ADDRESS,
  CORE_ENGINE_PARAMS,
  ETH_CHAIN_ID,
  ETH_MARKETPLACE_CONTRACT_ADDRESS,
  ETH_SUBGRAPH,
} from '../constants'
import { formatEther, parseEther, parseGwei } from 'viem'
import {
  getEnglishAuctionBiddingInfo,
  getListingAvailability,
  getListingCurrentPrice,
} from './ethereum'

export const getAbProjectInfo = async (id: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await readContracts({
        contracts: [
          {
            ...CORE_ENGINE_PARAMS,
            functionName: 'projectScriptInfo',
            args: [id],
          },
          {
            ...AB_MINTER_PARAMS,
            functionName: 'projectConfig',
            args: [id],
          },
          {
            ...CORE_ENGINE_PARAMS,
            functionName: 'projectTokenInfo',
            args: [id],
          },
          {
            ...AB_MINTER_PARAMS,
            functionName: 'getPriceInfo',
            args: [id],
          },
        ],
      })

      const isPaused = data[0].result ? data[0].result[4] : false
      const currentMinted: number = data[2].result
        ? Number(data[2].result[2])
        : 0
      const supply: number = data[1].result ? (data[1].result[1] as number) : 0
      const saleStart = data[1].result ? Number(data[1].result[2]) : 0
      const priceDecay = data[1].result ? Number(data[1].result[3]) : 0
      const startingPrice = data[1].result ? Number(data[1].result[4]) : 0
      const basePrice = data[1].result ? Number(data[1].result[5]) : 0
      const currentPrice = data[3].result ? data[3].result[1] : 0

      let projectDetails: any = await fetch(
        `${ARTBLOCKS_TOKEN_ADDRESS}${id}000000`,
      )
      projectDetails = await projectDetails.json()

      const mappedObj: Artwork = {
        id: projectDetails.project_id.toString(),
        contract_address: ARTBLOCKS_FLEX_CONTRACT_ADDRESS,
        chain: 'Ethereum',
        token_id: projectDetails.project_id,
        sale_type: startingPrice == basePrice ? 'fixed' : 'd-auction',
        project_type: 'artblocks',
        title: projectDetails.name.split(' #')[0],
        description: projectDetails.description,
        image: projectDetails.image,
        drop_date: new Date(saleStart).toISOString(),
        mint_info: {
          starting_price: parseFloat(
            formatEther(startingPrice as unknown as bigint),
          ),
          current_availability: supply - currentMinted,
          current_price: parseFloat(formatEther(currentPrice as bigint)),
          total_supply: supply,
          decay: priceDecay == 0 ? 0 : priceDecay,
        },
        artist: [
          {
            id: 'ab-' + projectDetails.royaltyInfo.artistAddress,
            name: projectDetails.artist,
            ethereum: projectDetails.royaltyInfo.artistAddress || '0x',
            website: projectDetails.website,
            role: ['artist'],
          },
        ],
      }

      resolve({ ...mappedObj })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

export const singleAbTokenInfo = async (
  project_id: number,
  token_id: number,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let projectDetails: any = await fetch(
        `${ARTBLOCKS_TOKEN_ADDRESS}${project_id}${token_id
          .toString()
          .padStart(6, '0')}`,
      )

      const data: any = await readContract({
        ...CORE_ENGINE_PARAMS,
        functionName: 'projectTokenInfo',
        args: [project_id],
      })

      const supply: number = data[3] ? Number(data[3]) : 0

      projectDetails = await projectDetails.json()

      resolve({ ...projectDetails, supply: supply })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

export const getPriceAndAvailability = async (
  id: number,
  contract_address: string,
  is_english_auction: boolean,
) => {
  return new Promise(async (resolve, reject) => {
    // artblocks
    if (contract_address == ARTBLOCKS_FLEX_CONTRACT_ADDRESS) {
      try {
        const data = await readContracts({
          contracts: [
            {
              ...CORE_ENGINE_PARAMS,
              functionName: 'projectTokenInfo',
              args: [id],
            },
            {
              ...AB_MINTER_PARAMS,
              functionName: 'getPriceInfo',
              args: [id],
            },
          ],
        })

        const currentMinted: number = data[0].result
          ? (data[0].result[2] as number)
          : 0
        const supply: number = data[0].result
          ? (data[0].result[3] as number)
          : 0
        const availability = supply - currentMinted

        const price: number = data[1].result ? Number(data[1].result[1]) : 0

        resolve({ availability, price })
      } catch (error) {
        console.log(error)
        reject(error)
      }
    }
    // eth marketplace
    else {
      const price = await getListingCurrentPrice(id)
      const availability = await getListingAvailability(
        contract_address + '/' + id.toString(),
      )

      if (is_english_auction) {
        let data = await getEnglishAuctionBiddingInfo(
          ETH_MARKETPLACE_CONTRACT_ADDRESS + '/' + id.toString(),
        )
        let ordered_bids =
          data.bids.sort((bidA: Bid, bidB: Bid) => bidB.amount - bidA.amount) ||
          []

        resolve({
          availability,
          price,
          bids: ordered_bids,
          new_end_time: data.end_time,
        })
      } else {
        resolve({ availability, price })
      }
    }
  })
}

// Get artblock individual token info
const queryAbTokenMint = `
query queryAbTokenMint($id: String) {
    token(id: $id) {
      owner {
        id
      }
      createdAt
    }
}`

export const getAbTokenMintInfo = (id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(ARTBLOCKS_GRAPHQL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryAbTokenMint,
          variables: {
            id,
          },
        }),
      })

      const result = await res.json()
      resolve(result.data)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

export const mintArtblocksProject = async (id: number, price: string) => {
  let tokenId: number = 0

  const { chain } = getNetwork()

  const config = await prepareWriteContract({
    ...AB_MINTER_PARAMS,
    functionName: 'purchase',
    args: [id],
    value: parseEther(price),
  })

  let network = chain?.id

  if (network !== ETH_CHAIN_ID) {
    const updated_chain = await switchNetwork({
      chainId: ETH_CHAIN_ID,
    })

    network = updated_chain.id
  }

  if (network == ETH_CHAIN_ID) {
    const { hash } = await writeContract(config)

    const receipt = await waitForTransaction({
      hash,
    })

    if (receipt.status == 'success') {
      // Get correct token ID from transaction receipt
      const transactionLogs = receipt.logs
      let tokenId = 0

      transactionLogs.forEach((log: any) => {
        // check mint event log
        if (
          log.topics[0] ==
          '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f'
        ) {
          // get token ID which is the 3rd param
          tokenId = Number(log.topics[2]) - id * 1000000
        }
      })
    } else {
      return undefined
    }

    return tokenId
  } else {
    return undefined
  }
}

export const editProjectShell = async (
  id: number,
  startTimestamp: number,
  priceDecay: number,
  startPrice: bigint,
  basePrice: bigint,
) => {
  const config = await prepareWriteContract({
    ...AB_MINTER_PARAMS,
    functionName: 'setAuctionDetails',
    args: [id, startTimestamp, priceDecay, startPrice, basePrice],
  })

  const { hash } = await writeContract(config)

  const receipt = await waitForTransaction({
    hash,
  })

  return receipt.status
}
