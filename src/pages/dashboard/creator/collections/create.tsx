import { CancelAndCTAButtons } from '@/src/components/creator/cta_cancel_buttons'
import { CTAButton } from '@/src/components/ui/Button/cta'
import {
  BooleanRadio,
  InputTextField,
  NetworkTypeRadio,
} from '@/src/components/ui/Form/formfields'
import { FailureToast, SuccessToast } from '@/src/components/ui/Toast/toast'
import { ETHERSCAN_URL } from '@/src/lib/constants'
import { createEthCollection } from '@/src/lib/crypto/ethereum'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const CreateCollectionPage = () => {
  const [collectionName, setCollectionName] = useState<string>('')
  const [symbol, setSymbol] = useState<string>('')

  const [network, setNetwork] = useState<NetworkType>('Ethereum')
  const [isERC721, setIsERC721] = useState<boolean>(true)
  const [isLazy, setIsLazy] = useState<boolean>(false)

  const [newContractAddress, setNewContractAddress] = useState<string>('')

  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false)
  const [showFailureToast, setShowFailureToast] = useState<boolean>(false)

  const router = useRouter()

  /* useEffect(() => {
      // redirect to main
      router.push('/')
    }, []) */

  const handleCreateCollection = async (e: any) => {
    e.preventDefault()

    if (network == 'Ethereum') {
      const tx = await createEthCollection({
        is_erc721: isERC721,
        name: collectionName,
        symbol: symbol,
        is_lazy: isLazy,
      })

      if (tx && tx[0] == 'success') {
        setShowSuccessToast(true)
        setNewContractAddress(tx[1]!)
      } else {
        setShowFailureToast(true)
      }
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
    <div className="max-w-7xl mx-auto px-8 p-10 min-h-[70vh]">
      <div className="p-6 bg-white rounded-xl">
        <h3 className="text-2xl mb-4">Create a collection</h3>

        <div className="flex flex-col gap-y-3 mt-8">
          <NetworkTypeRadio currentValue={network} setter={setNetwork} />
          <InputTextField
            label="Collection name"
            min_char={1}
            max_char={30}
            current_value={collectionName}
            setter={setCollectionName}
          />
          <InputTextField
            label="Collection Symbol"
            min_char={1}
            max_char={8}
            current_value={symbol}
            setter={setSymbol}
          />

          {network == 'Ethereum' && (
            <>
              <BooleanRadio
                label="Is this an ERC721 token?"
                name="erc"
                currentValue={isERC721}
                setter={setIsERC721}
              />
            <BooleanRadio label="Is this a lazy-minted collection?" name="lazy_minted" currentValue={isLazy} setter={setIsLazy} />
            </>
          )}
        </div>

        <CancelAndCTAButtons
          back_button_label="Cancel"
          back_button_link="/dashboard/creator"
          cta_button_label="Create collection"
          cta_button_action={(e: any) => handleCreateCollection(e)}
        />

        {newContractAddress && (
          <CTAButton
            bg_color="#0284c7"
            label="Add token(s) to collection"
            cta_action={() =>
              router.push(
                `/dashboard/creator/collections/${newContractAddress}`,
              )
            }
          />
        )}
      </div>
      {showSuccessToast && (
        <SuccessToast
          title={'Collection created successfully!'}
          message={`<a class="underline" href=${
            ETHERSCAN_URL + 'address/' + newContractAddress
          } target="_blank" rel="noreferrer">View on etherscan</a>`}
        />
      )}
      {showFailureToast && (
        <FailureToast message={'Error creating collection'} />
      )}
    </div>
  )
}

export default CreateCollectionPage
