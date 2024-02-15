import { ArtworkPreview } from '@/src/components/artwork/artwork_card'
import { CancelAndCTAButtons } from '@/src/components/creator/cta_cancel_buttons'
import { CTAButton } from '@/src/components/ui/Button/cta'
import {
  BooleanRadio,
  FileInput,
  FolderUpload,
  InputTextField,
  NumberInput,
  TextareaField,
} from '@/src/components/ui/Form/formfields'
import { FailureToast, SuccessToast } from '@/src/components/ui/Toast/toast'
import { ETHERSCAN_URL } from '@/src/lib/constants'
import {
  batchMintEthTokens,
  getEthCollectionDetails,
  mintEthToken,
} from '@/src/lib/crypto/ethereum'
import {
  ADD_ARTIST_TOKEN,
  ADD_ETHTOKEN_TO_TOKENS,
} from '@/src/lib/database/tokens'
import {
  generateCollectionMetadata,
  generateCover,
  generateMetadata,
  uploadToIpfs,
  uploadToAWS,
  getFileFromIPFS,
} from '@/src/lib/utils'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'

const ManageCollectionPage = () => {
  const [authorized, setAuthorized] = useState<boolean>(false)
  const [mintLoading, setMintLoading] = useState<boolean>(false)
  const [collectionDetails, setCollectionDetails] = useState<{
    name: string
    symbol: string
  }>()

  const [tokenName, setTokenName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [editions, setEditions] = useState<number>(1)
  const [multiEdition, setMultiEdition] = useState<boolean>(false)
  const [artworkCid, setArtworkCid] = useState<string>('')
  const [hasCid, setHasCid] = useState<boolean>(false)

  const [file, setFile] = useState<any>()
  const [fileCover, setFileCover] = useState<any>()

  const { query } = useRouter()
  const router = useRouter()
  const { address } = useAccount()

  const [txHash, setTxHash] = useState<string>('')
  const [newTokenId, setNewTokenId] = useState<number>(0)
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false)
  const [showFailureToast, setShowFailureToast] = useState<boolean>(false)

  // mutations
  const [addTokenMutation, { data: token_addition_data }] = useMutation(
    ADD_ETHTOKEN_TO_TOKENS,
  )
  const [addArtistTokenMutation, { data: token_artist_data }] =
    useMutation(ADD_ARTIST_TOKEN)

  /* useEffect(() => {
    // redirect to main
    router.push('/')
  }, []) */

  useEffect(() => {
    if (query.collection && isAddress(query.collection as string) && address) {
      // TO DO: check if user is deployer
      setAuthorized(true)
    }
  }, [query, address])
  useEffect(() => {
    const getCollectionDetails = async () => {
      let collection_adddress: string[] = query.collection as string[]

      if (typeof query.collection == 'string')
        collection_adddress = [query.collection as string]
      const details: any[] = await getEthCollectionDetails(collection_adddress)
      setCollectionDetails(details[0])
    }

    // if authorized, means collection is valid
    // get details
    if (authorized) {
      getCollectionDetails()
    }
  }, [authorized])

  useEffect(() => {
    const getFile = async (artworkCid: string) => {
      const item = await getFileFromIPFS(artworkCid)

      setFile(item)
    }
    if (artworkCid.length > 0) {
      getFile(artworkCid)
    }
  }, [artworkCid])

  const createToken = async (e: any) => {
    if (!tokenName || tokenName === '') {
      return
    }

    setMintLoading(true)
    e.preventDefault()

    const cid = await uploadToIpfs(
      !multiEdition
        ? file
        : [...file].sort(
            (a: any, b: any) =>
              Number(a.name.split('.')[0]) - Number(b.name.split('.')[0]),
          ),
      multiEdition ?? false,
    )
    let tx: any = ''

    if (!multiEdition) {
      let artwork_cover = cid

      // if original artwork is not an image, we upload
      // the generated artwork cover
      if (file.type.split('/')[0] !== 'image') {
        artwork_cover = await uploadToIpfs(fileCover)
      }

      // getting the right image sizes for covers
      // and thumbnails
      const image_cover = await generateCover(artwork_cover, 1024, 1024, 60)
      const thumbnail_image = await generateCover(artwork_cover, 350, 350, 60)

      // returns the cid for metadata
      const metadata = await generateMetadata.ethereum({
        name: tokenName,
        description: description,
        image: 'ipfs://' + image_cover.cid,
        previewURI: 'ipfs://' + thumbnail_image.cid,
        contentURI: 'ipfs://' + (hasCid && artworkCid ? artworkCid : cid),
        animationURI:
          file.type.split('/')[0] === 'video' ||
          file.type.split('/')[0] === 'model' ||
          file.type.split('/')[0] !== 'image'
            ? 'ipfs://' + (hasCid && artworkCid ? artworkCid : cid)
            : null,
        creator: address!,
        mediaType: file.type,
      })

      // @ts-ignore
      tx = await mintEthToken(address, query.collection as string, metadata)
      try {
        await uploadToAWS(image_cover.blob, `${query.collection}_${tx[2]}`)
      } catch (error) {
        console.error(error)
      } finally {
        setMintLoading(false)
      }
    }

    // multi-artwork
    else {
      // if original artwork is not an image, we upload
      // the generated artwork cover
      let artwork_cover_folder_cid = cid
      let sorted_covers = [...file].sort(
        (a: any, b: any) =>
          Number(a.name.split('.')[0]) - Number(b.name.split('.')[0]),
      )

      if (file[0].type.split('/')[0] !== 'image') {
        sorted_covers = [...fileCover].sort(
          (a: any, b: any) =>
            Number(a.name.split('.')[0]) - Number(b.name.split('.')[0]),
        )
        artwork_cover_folder_cid = await uploadToIpfs(sorted_covers, true)
      }

      let image_covers = []
      let thumbnail_images = []
      let image_cover_blobs = []

      // generate thumbnail images for each
      for (let i = 0; i < file.length; i++) {
        let cover_extension = sorted_covers[i].name.split('.')[1]
        const image_cover = await generateCover(
          `${artwork_cover_folder_cid}/${i + 1}.${cover_extension}`,
          1024,
          1024,
          60,
        )
        const thumbnail_image = await generateCover(
          `${artwork_cover_folder_cid}/${i + 1}.${cover_extension}`,
          350,
          350,
          60,
        )

        image_covers.push(image_cover.cid)
        thumbnail_images.push(thumbnail_image.cid)
        image_cover_blobs.push(image_cover.blob)
      }

      const metadata = await generateCollectionMetadata.ethereum({
        name: tokenName,
        description: description,
        artworkFolderCid: 'ipfs://' + cid,
        creator: address!,
        editions: file.length,
        artworkArr: file,
        imageCids: image_covers,
        thumbnailCids: thumbnail_images,
      })

      tx = await batchMintEthTokens(
        // @ts-ignore
        address,
        query.collection as string,
        metadata,
        file.length,
      )

      try {
        for (let i = 0; i < tx[2].length; i++) {
          await uploadToAWS(
            image_cover_blobs[i],
            `${query.collection}_${tx[2][i]}`,
          )
        }
      } catch (error) {
        console.error(error)
      } finally {
        setMintLoading(false)
      }
    }

    if (tx && tx[0] == 'success') {
      setShowSuccessToast(true)
      setTxHash(tx[1])

      if (!Array.isArray(tx[2])) {
        setNewTokenId(tx[2])

        // add token to our db
        await addTokenMutation({
          variables: {
            chain: 'Ethereum',
            contract: query.collection as string,
            title: tokenName,
            token_id: tx[2].toString(),
            display_uri: 'ipfs://' + cid,
          },
        })

        // add artist - token to our db
        await addArtistTokenMutation({
          variables: {
            address: address,
            contract: query.collection as string,
            token_id: tx[2].toString(),
          },
        })
      } else {
        for (let i = 0; i < tx[2].length; i++) {
          // add token to our db
          await addTokenMutation({
            variables: {
              chain: 'Ethereum',
              contract: query.collection as string,
              title: `${tokenName} ${(i + 1).toString().padStart(3, '0')}`,
              token_id: tx[2][i].toString(),
              display_uri:
                'ipfs://' +
                cid +
                '/' +
                i +
                1 +
                '.' +
                file[i].name.split('.')[1],
            },
          })

          // add artist - token to our db
          await addArtistTokenMutation({
            variables: {
              address: address,
              contract: query.collection as string,
              token_id: tx[2][i].toString(),
            },
          })
        }
      }
    } else {
      setShowFailureToast(true)
    }
  }

  useEffect(() => {
    if (showSuccessToast || showFailureToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false)
        setShowFailureToast(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessToast, showFailureToast])

  return (
    <div className="max-w-7xl mx-auto px-8 p-10 min-h-screen">
      {authorized && collectionDetails ? (
        <div className="sm:p-6 bg-white rounded-xl">
          <h3 className="text-2xl mb-4">Create tokens in your collection</h3>

          <div className="font-mono text-gray-400 uppercase">
            {collectionDetails.name} ({collectionDetails.symbol})
          </div>

          <div className="flex flex-col gap-y-3 mt-8 mb-8">
            <InputTextField
              label="Token name"
              min_char={1}
              max_char={50}
              current_value={tokenName}
              setter={setTokenName}
            />
            <TextareaField
              label="Token description"
              min_char={1}
              max_char={2000}
              current_value={description}
              setter={setDescription}
            />
            <BooleanRadio
              label="Do you need to upload multiple artwork?"
              name="multi-artwork"
              currentValue={multiEdition}
              setter={setMultiEdition}
            />

            {multiEdition ? (
              <>
                <FolderUpload
                  message="Upload your folder of artwork"
                  onChange={(e) => setFile(e?.target?.files)}
                  accept={'*'}
                />

                {file && file[0]?.type.split('/')[0] !== 'image' && (
                  <FileInput
                    message="Upload cover images"
                    onChange={(e) => setFileCover(e?.target?.files)}
                    accept={'image/*'}
                  />
                )}

                <div className="mt-8 font-medium">
                  <p>Please note: </p>
                  <ul className="mt-2 italic text-gray-600 list-disc list-inside">
                    <li className="">
                      Please rename your files in the folder to be numerically
                      ordered. i.e <code>1.png</code>, <code>2.png</code> ...{' '}
                      <code>{file && file.length}</code>.png etc. in the same
                      order you would like the tokens to be minted
                    </li>
                    <li>
                      The token name for each minted token will be named in the
                      following format:{' '}
                      <code>
                        {tokenName ?? 'Token_name'} 001 ...{' '}
                        {tokenName ?? 'Token name'}{' '}
                        {file && file.length.toString().padStart(3, '0')}
                      </code>{' '}
                      <br />
                    </li>
                    <li>
                      The token description remains the same for all tokens
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <NumberInput
                  label="Token edition size"
                  min_value={1}
                  current_value={editions}
                  setter={setEditions}
                />

                <BooleanRadio
                  label="Do you have an existing IPFS hash of your artwork"
                  name="has-cid"
                  currentValue={hasCid}
                  setter={setHasCid}
                />

                {!hasCid ? (
                  <FileInput
                    message="Upload your artwork file"
                    onChange={(e) => setFile(e?.target?.files?.[0])}
                    accept={'*'}
                  />
                ) : (
                  <InputTextField
                    label="Input your artwork IPFS hash or CID string"
                    min_char={3}
                    max_char={300}
                    current_value={artworkCid}
                    setter={setArtworkCid}
                  />
                )}

                {file && file?.type.split('/')[0] !== 'image' && (
                  <FileInput
                    message="Upload cover image"
                    onChange={(e) => setFileCover(e?.target?.files?.[0])}
                    accept={'image/*'}
                  />
                )}

                {file && (
                  <div className="flex gap-x-4 justify-center mt-10">
                    <ArtworkPreview label="Artwork Preview" file={file} />
                    {fileCover && (
                      <ArtworkPreview
                        label="Image cover Preview"
                        file={fileCover}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <CancelAndCTAButtons
            back_button_label="Cancel"
            back_button_link="/dashboard/creator/collections"
            cta_button_label="Mint token"
            cta_button_action={(e: any) => createToken(e)}
            cta_button_loading={mintLoading}
          />

          {newTokenId > 0 && (
            <CTAButton
              label="Create listing for token"
              cta_action={() =>
                router.push(
                  `/dashboard/creator/listings/create?contract=${
                    query.collection as string
                  }&id=${newTokenId}`,
                )
              }
              bg_color="#0284c7"
            />
          )}
        </div>
      ) : (
        <p className="w-full h-full flex justify-center items-center">
          Sorry, you are not authorized to view this page
        </p>
      )}

      {showSuccessToast && (
        <SuccessToast
          title={`Created ${
            newTokenId > 0 ? 'token #' + newTokenId : 'tokens'
          } successfully!`}
          message={`<a class="underline" href=${
            ETHERSCAN_URL + 'tx/' + txHash
          } target="_blank" rel="noreferrer">View transaction</a>`}
        />
      )}
      {showFailureToast && <FailureToast message={'Error creating tokens'} />}
    </div>
  )
}

export default ManageCollectionPage
