import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import { FALLBACK_EXHIBITION_CARD_IMAGE } from '../components/exhibition/exhibition_card'
import { IPFS_GATEWAY } from './constants'
import { isAddress } from 'viem'
import AWS from 'aws-sdk'
const axios = require('axios')
const crypto = require('crypto')
const FormData = require('form-data')

const S3_BUCKET = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || ''
const REGION = process.env.NEXT_PUBLIC_AWS_REGION || ''

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
})

const myBucket = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDateTime = (dateTime: any) => {
  const stamp = new Date(dateTime)

  const date = stamp.toLocaleString('en-GB', { month: 'long', day: 'numeric' })
  const time = stamp.toLocaleTimeString('en-GB', {
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
  })
  return date + ' ' + time
}

export const getDate = (dateTime: any) => {
  const stamp = new Date(dateTime)

  const date = stamp.toLocaleString('en-GB', { month: 'long', day: 'numeric' })
  return date
}

// takes a date string and returns it in DD MMM YYYY format
// used mostly in the Exhibition Listing Page
export const formatDatesForExhibitionDisplay = (dateTime: any) => {
  const date = new Date(dateTime)

  return dayjs(date).format('DD MMM YYYY')
}

// takes an image string (ipfs://xxxx) and returns the ipfs link for rendering
export const displayIpfsImage = (image: string) => {
  const cid = image.includes('ipfs://') ? image.split('ipfs://')[1] : image
  return cid
    ? 'https://verticalcrypto.mypinata.cloud/ipfs/' + cid
    : FALLBACK_EXHIBITION_CARD_IMAGE
}

// adds # of days to a date string
export const addDays = (date: string, days: number) => {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const uploadToIpfs = async (file: any, folder = false) => {
  const formData = new FormData()

  // single file upload
  if (!folder) {
    formData.append('file', file)
  } else {
    // sort files first
    const folder = [...file].sort(
      (a: any, b: any) =>
        Number(a.name.split('.')[0]) - Number(b.name.split('.')[0]),
    )

    for (const each_file of folder) {
      formData.append('file', each_file)
    }
  }

  /** SERVER SIDE UPLOAD, HOWEVER MAX FILE SIZE IS 4.5MB */
  /**
    const response = await axios.post(`/api/token/pinFile`, formData, {
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'multipart/form-data',
        }
    })**/

  try {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
      },
    )

    // returns the cid
    return res.data.IpfsHash
  } catch (error) {
    console.log(error)
  }
}

export const getFileFromIPFS = async (cid: string) => {
  let strippedCid = cid.replace('ipfs://', '')

  const response = await fetch(IPFS_GATEWAY + strippedCid, {
    headers: {
      Accept: 'text/plain',
    },
  })

  const blob = await response.blob()
  return blob
}

export const generateCover = async (
  artifact: string,
  width: number,
  height: number,
  quality: number,
) => {
  const response = await fetch(
    IPFS_GATEWAY +
      artifact +
      `?img-width=${width}&img-height=${height}&img-quality=${quality}&img-fit=contain`,
    {
      headers: {
        Accept: 'text/plain',
      },
    },
  )

  const blob = await response.blob()

  const cid = await uploadToIpfs(blob)

  return { cid, blob }
}

export const uploadToAWS = async (blob: Blob, name: string) => {
  const params = {
    ACL: 'public-read',
    Body: blob,
    Bucket: S3_BUCKET,
    Key: `token_covers/${name}.png`,
  }

  const upload = myBucket
    .putObject(params)
    .on('httpUploadProgress', (evt) => {
      console.log('Uploading ' + (evt.loaded * 100) / evt.total + '%')
    })
    .promise()
  try {
    const success = await upload.then((callback) => {
      console.log(callback)
    })
    return success
  } catch (error) {
    return error
  }
}

// upload the json object from `generateMetadata` and pin to pinata.
// returns the cid.
export const uploadJSON = async (json: any) => {
  const response = await axios.post(`/api/token/pinJson`, json, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // returns the cid
  return response.data.response.IpfsHash
}

// creates the metadata json object for pinning
export const generateMetadata = {
  tezos: async ({
    name = '',
    description = '',
    editions = 1,
    artifactUri,
    coverUri,
    thumbnailUri,
    creator,
    mediaType,
    width,
    height,
  }: {
    name: string
    description: string
    editions: number
    artifactUri: string
    coverUri: string
    thumbnailUri: string
    creator: string
    mediaType: string
    width: number
    height: number
  }) => {
    const cid = await uploadJSON(
      JSON.stringify({
        name: name,
        description: description,
        minter: 'KT1Aq4wWmVanpQhq4TTfjZXB5AjFpx15iQMM',
        mintingTool: 'https://auction.verticalcrypto.art',
        date: new Date().toISOString(),
        symbol: 'OBJKTCOM',
        artifactUri: artifactUri,
        displayUri: coverUri,
        thumbnailUri: thumbnailUri,
        image: coverUri,
        creators: [creator],
        formats: [
          {
            uri: artifactUri,
            mimeType: mediaType,
            fileName: `artifact.${mediaType.split('/')[1]}`,
            dimensions: {
              value: `${width}x${height}`,
              unit: 'px',
            },
          },
          {
            uri: coverUri,
            mimeType: mediaType,
            fileName: `cover.${mediaType.split('/')[1]}`,
            dimensions: {
              value: '1024x1024',
              unit: 'px',
            },
          },
          {
            uri: thumbnailUri,
            mimeType: mediaType,
            fileName: `thumbnail.${mediaType.split('/')[1]}`,
            dimensions: {
              value: '350x350',
              unit: 'px',
            },
          },
        ],
        attributes: [],
        decimals: 0,
        isBooleanAmount: false,
        shouldPreferSymbol: false,
      }),
    )

    return cid
  },

  ethereum: async ({
    name = '',
    description = '',
    image,
    previewURI,
    contentURI,
    animationURI = null,
    creator,
    mediaType,
  }: {
    name: string
    description: string
    image: string
    previewURI: string
    contentURI: string
    animationURI: string | null
    creator: string
    mediaType: string
  }) => {
    const cid = await uploadJSON(
      JSON.stringify({
        name: name,
        description: description,
        mediaType: mediaType.split('/')[0].toUpperCase(),
        contentType: mediaType,
        creator: creator,
        previewURI: previewURI,
        contentURI: contentURI,
        image: image,
        external_url: IPFS_GATEWAY + contentURI.split('ipfs://')[1],
        animation_url: animationURI,
      }),
    )

    return cid
  },
}

// creates the metadata json object for pinning
export const generateCollectionMetadata = {
  ethereum: async ({
    name = '',
    description = '',
    artworkFolderCid,
    creator,
    editions,
    artworkArr,
    imageCids,
    thumbnailCids,
  }: {
    name: string
    description: string
    artworkFolderCid: string
    creator: string
    editions: number
    artworkArr: File[]
    imageCids: string[]
    thumbnailCids: string[]
  }) => {
    let combinedJson = []
    // sort files first
    const folder = [...artworkArr].sort(
      (a: any, b: any) =>
        Number(a.name.split('.')[0]) - Number(b.name.split('.')[0]),
    )

    for (let i = 1; i <= editions; i++) {
      const media = folder[i - 1].type.split('/')[0].toUpperCase()
      const extension = folder[i - 1].name.split('.')[1]

      const metadata = JSON.stringify({
        name: `${name} ${i.toString().padStart(3, '0')}`,
        description: description,
        image: 'ipfs://' + imageCids[i - 1],
        previewURI: 'ipfs://' + thumbnailCids[i - 1],
        mediaType: media,
        creator: creator,
        contentURI: artworkFolderCid + '/' + i + '.' + extension,
        external_url:
          IPFS_GATEWAY +
          artworkFolderCid.split('ipfs://')[1] +
          '/' +
          i +
          '.' +
          extension,
      })

      combinedJson.push(metadata)
    }

    const cid = await uploadJSON(combinedJson)

    return cid
  },
}

/**
 * Truncates an ethereum address to the format 0x0000…0000
 * @param address Full address to truncate
 * @returns Truncated address
 */
export const truncateEthAddress = function (address: string) {
  let truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/

  let match = address.match(truncateRegex)
  if (!match) return address
  return match[1] + '\u2026' + match[2]
}

export function convertAddressToNumber(address: string) {
  // Remove the '0x' prefix if it's an Ethereum address
  if (isAddress(address)) {
    address = address.slice(2)
  }

  // Replace letters with their ASCII values
  const replacedAddress = address.replace(/[a-fA-F]/g, (char: string) =>
    char.charCodeAt(0).toString(),
  )

  // Convert the resulting string to an integer
  const uniqueNumber = parseInt(replacedAddress, 10)

  return uniqueNumber
}

// get usd price of eth
export const getPriceInUSD = async (price: number) => {
  const eth_price = await fetch(
    'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
  )
  const result = await eth_price.json()
  return result.USD * price
}

// check if a date given is within 10 days from current date.
export const dateWithinTenDays = (date: any) => {
  let currentTime = new Date().getTime()

  // Calculate the time difference in milliseconds
  const timeDifference = date - currentTime

  // Calculate the number of milliseconds in 10 days
  const tenDaysInMilliseconds = 10 * 24 * 60 * 60 * 1000

  // Check if the time difference is less than or equal to 10 days
  if (timeDifference <= tenDaysInMilliseconds) {
    return true
  } else {
    return false
  }
}
