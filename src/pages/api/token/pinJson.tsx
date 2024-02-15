import { NextApiRequest, NextApiResponse } from 'next'
const pinataSDK = require('@pinata/sdk')
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT })
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return
  }

  const metadata = req.body
  let response

  // array of metadata
  if (req.body instanceof Array) {
    // Create a temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'myApp-'))

    // Generate and save JSON files in the temporary directory
    for (let i = 0; i < metadata.length; i++) {
      const filePath = path.join(tempDir, `${i + 1}.json`)
      const jsonData = metadata[i]
      await fs.writeFile(filePath, jsonData)
    }

    // Pin the directory to IPFS
    const options = {
      pinataMetadata: {
        name: 'Metadata-folder-' + new Date().toISOString(),
      },
    }

    try {
      response = await pinata.pinFromFS(tempDir, options)

      await fs.rmdir(tempDir, { recursive: true })
    } catch (error: any) {
      console.log(error)
    }
  } else {
    if (metadata) {
      response = await pinata.pinJSONToIPFS(metadata, {})
    }
  }

  if (response) {
    res.status(200).json({ response })
  } else {
    res.status(500).json({ error: 'failed to load data' })
  }
}
