import {
  ARTBLOCKS_FLEX_CONTRACT_ADDRESS,
  ARTBLOCKS_GENERATOR_ADDRESS,
  ARTBLOCKS_IMAGE_PREVIEW,
} from '@/src/lib/constants'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export const ArtblockTokenCard = ({
  project_id,
  token_id,
}: {
  project_id: number
  token_id: number
}) => {
  const image_url =
    ARTBLOCKS_IMAGE_PREVIEW +
    project_id +
    token_id.toString().padStart(6, '0') +
    '.png'
  const generator_url =
    ARTBLOCKS_GENERATOR_ADDRESS +
    project_id +
    token_id.toString().padStart(6, '0')

  const openLiveViewLink = (e: any) => {
    e.stopPropagation()
    e.preventDefault()

    window.open(generator_url, '_blank')
  }
  return (
    <Link
      className="drop-shadow-xl"
      href={`/artwork/${ARTBLOCKS_FLEX_CONTRACT_ADDRESS}/${project_id}/${token_id}`}
    >
      <div className="relative h-64 flex justify-center items-center px-4 bg-gray-100 rounded-tl-lg rounded-tr-lg">
        <img
          src={image_url}
          className="max-w-[90%] max-h-[80%] object-contain"
        />
      </div>
      <div className="flex p-4 bg-white rounded-bl-lg rounded-br-lg justify-between">
        <p className="text-2xl">#{token_id}</p>
        <div
          className="flex gap-x-2 items-start cursor-pointer"
          onClick={(e: any) => openLiveViewLink(e)}
        >
          <span className="font-mono uppercase text-gray-400 text-xs">
            Live view
          </span>
          <ArrowUpRightIcon className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}
