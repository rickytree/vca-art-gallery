import ResizeIcon from '../ui/Icons/resize.svg'
import PreviewIcon from '../ui/Icons/preview-image.svg'
import SansaIcon from '../ui/Icons/sansa.svg'
import GeneratorIcon from '../ui/Icons/generator.svg'
import OpenseaIcon from '../ui/Icons/opensea.svg'
import OpenseaIcon from '../ui/Icons/opensea.svg'
import Image from 'next/image'
import { SocialIconLink } from '../ui/iconbuttons'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { TokenTabs } from './artwork_tabs'
import { getFileFromIPFS } from '@/src/lib/utils'
import { IPFS_GATEWAY } from '@/src/lib/constants'

type ToggleProps = {
  preview_url: string
  sansa_url?: string // only used by artblocks tokens
  generator_url?: string // only used by artblocks tokens
  opensea_url?: string
  opensea_url?: string
}

export const ArtworkHeader = ({
  content_uri,
  image_url,
  artwork_type,
  toggle_props,
  show_tabs = false,
  current_tab,
  set_tab,
}: {
  content_uri: string
  image_url: string
  artwork_type?: string
  toggle_props?: ToggleProps
  show_tabs?: boolean
  current_tab?: 'details' | 'collection' | 'others'
  set_tab?: (newTab: 'details' | 'collection' | 'others') => void
}) => {
  const media_type = artwork_type?.toLowerCase().includes('image')
    ? 'image'
    : artwork_type?.toLowerCase().includes('video')
    ? 'video'
    : artwork_type?.toLowerCase().includes('html')
    ? 'application'
    : 'image'

  return (
    <div className="w-[100%] h-[40rem] py-8 bg-gray-100 relative flex flex-col items-center justify-center">
      {content_uri == 'QmcgyTaBnK5mPoZzeYDxboVU3AW2xxkMtqyDhg9ZMqxay9' ? (
        <>
          <ArtworkDisplay
            content_src={
              IPFS_GATEWAY + 'QmZeKQhKW1EKcvH1k7LiGFLd2ni6nm8rwVX7snTsgDW7ik'
            }
            content_type={media_type}
            className="max-h-[25rem] max-w-[40rem] w-full h-full object-contain my-auto mx-auto block"
          />
        </>
      ) : (
        <>
          <ArtworkDisplay
            content_src={IPFS_GATEWAY + content_uri}
            content_type={media_type}
            className="max-h-[25rem] max-w-[40rem] w-full h-full object-contain my-auto mx-auto block"
          />
        </>
      )}
      {toggle_props && (
        <div className="mx-auto w-full max-w-7xl relative">
          <div className="absolute bottom-4 right-4">
            <TokenToggles toggle_props={toggle_props!} />
          </div>
        </div>
      )}

      {show_tabs ? (
        <div className="mx-auto w-full max-w-7xl absolute bottom-0">
          <TokenTabs
            availableTabs={['details', 'collection', 'others']}
            currentTab={current_tab!}
            setTab={set_tab!}
          />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-7xl absolute bottom-0">
          <TokenTabs
            availableTabs={['details']}
            currentTab={current_tab!}
            setTab={set_tab!}
          />
        </div>
      )}
    </div>
  )
}

// Artwork to be displayed on the header of the token page based on mime type
export const ArtworkDisplay = ({
  content_src,
  content_type,
  className,
}: {
  content_src: string
  content_type: 'image' | 'video' | 'application'
  className?: string
}) => {
  return content_type == 'video' ? (
    <video
      className={`${className} ?? ''`}
      src={content_src}
      controls
      autoPlay
      playsInline
    />
  ) : content_type == 'application' ? (
    <iframe className={`${className} ?? ''`} src={content_src} />
  ) : (
    <img
      src={
        content_src
          ? content_src
          : 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'
      }
      className={`${className} ?? ''`}
    />
  )
}

export const TokenToggles = ({
  toggle_props,
}: {
  toggle_props: ToggleProps
}) => {
  const [toggleFullScreen, setToggleFullScreen] = useState<boolean>(false)

  return (
    <div className="flex flex-row gap-x-4">
      <Image
        src={ResizeIcon.src}
        width={24}
        height={24}
        alt="Icon that opens up the image in full width when clicked"
        className="cursor-pointer"
        onClick={() => setToggleFullScreen(true)}
      />
      {toggle_props.generator_url && (
        <SocialIconLink
          image_src={PreviewIcon.src}
          url={toggle_props.preview_url}
        />
      )}
      {toggle_props.sansa_url && (
        <SocialIconLink
          image_src={SansaIcon.src}
          url={toggle_props.sansa_url}
        />
      )}
      {toggle_props.generator_url && (
        <SocialIconLink
          image_src={GeneratorIcon.src}
          url={toggle_props.generator_url}
        />
      )}
      {toggle_props.opensea_url && (
        <SocialIconLink
          image_src={OpenseaIcon.src}
          url={toggle_props.opensea_url}
        />
      )}

      {toggleFullScreen && (
        <ImageFullScreenModal
          close_modal={setToggleFullScreen}
          image_url={toggle_props.preview_url}
        />
      )}
    </div>
  )
}

export const ImageFullScreenModal = ({
  close_modal,
  image_url,
}: {
  close_modal: (newState: boolean) => void
  image_url: string
}) => {
  return (
    <div className="w-screen h-screen fixed top-0 left-0 z-[50] flex items-center justify-center bg-black/90">
      <XMarkIcon
        className="text-white absolute top-8 right-8 w-10 h-10 cursor-pointer"
        onClick={() => close_modal(false)}
      />
      <img
        src={image_url}
        className="w-full h-full object-contain max-w-[80%] max-h-[80%]"
      />
    </div>
  )
}
