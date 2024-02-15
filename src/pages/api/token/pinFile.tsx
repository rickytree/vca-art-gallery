import { IncomingForm } from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
const pinataSDK = require('@pinata/sdk')
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT })
const rfs = require('recursive-fs')
import path from 'path'
import os from 'os'
const basePathConverter = require('base-path-converter')
const axios = require('axios')
const FormData = require('form-data')
import { promises as fsp } from 'fs' // Import the promises API for other file operations

export const config = {
  api: {
    bodyParser: false,
  },
}

const saveFile = async (file: any) => {
  try {
    const stream = fs.createReadStream(file.filepath)
    const options = {
      pinataMetadata: {
        name: file.originalFilename,
      },
    }
    const response = await pinata.pinFileToIPFS(stream, options)
    fs.unlinkSync(file.filepath)

    return response
  } catch (error) {
    throw error
  }
}

const saveFolder = async (dir: any) => {
  const options = {
    pinataMetadata: {
      name: 'collection-upload' + new Date().toISOString(),
    },
  }

  const response = await pinata
    .pinFromFS(dir, options)
    .then((result: any) => {
      return result
    })
    .catch((err: any) => {
      //handle error here
      console.log(err)
    })

  return response
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return
  }

  // parse form with a Promise wrapper
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm()
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log({ err })
        return res.status(500).send('Upload Error')
      }

      let response
      // single artwork upload
      if (files.file && files.file.length == 1) {
        //@ts-ignore
        response = await saveFile(files.file[0])
      } else {
        if (files.file && files.file.length > 1) {
          // create temp directory
          const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'tmp-'))

          // Create an array to store promises for file write operations
          const writePromises = []

          // read files from numerical order
          let files_in_folder = files.file

          for (let i = 0; i < files_in_folder.length; i++) {
            try {
              const readStream = fs.createReadStream(
                files_in_folder[i].filepath,
              )
              const extension =
                files_in_folder[i].originalFilename?.split('.')[1]

              const writePath = path.join(tempDir, `${i + 1}.${extension}`)
              const writeStream = fs.createWriteStream(writePath)

              const writePromise = new Promise((resolve, reject) => {
                try {
                  readStream.pipe(writeStream)

                  writeStream.on('finish', () => {
                    console.log(`File ${i} has been written to ${writePath}`)
                    resolve(null) // Resolve the promise on success
                  })

                  writeStream.on('error', (err) => {
                    console.error(`Error writing file ${i}: ${err}`)
                    resolve(null) // Resolve the promise on success
                  })
                } catch (err) {
                  console.error(`Error reading or writing file ${i}: ${err}`)
                  resolve(null)
                }
              })

              writePromises.push(writePromise)
            } catch (err) {
              console.error(`Error reading or writing file ${i}: ${err}`)
            }
          }

          // Wait for all file write promises to complete
          try {
            await Promise.all(writePromises)
            console.log(`All write promises resolved`)
          } catch (error) {
            console.error(`Error while waiting for write promises: ${error}`)
            return reject(error)
          }

          response = await saveFolder(tempDir)
        }
      }

      const { IpfsHash } = response

      return res.send(IpfsHash)
    })
  })
}
