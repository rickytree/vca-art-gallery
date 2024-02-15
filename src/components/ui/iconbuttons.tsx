import Image from 'next/image'

export const SocialIconLink = ({
  url,
  image_src,
  internal = false,
}: {
  url: string
  image_src: string
  internal?: boolean
}) => {
  return (
    <a
      href={url}
      className="cursor-pointer"
      target={internal ? '' : '_blank'}
      rel={internal ? '' : 'noreferrer'}
    >
      <Image
        alt="Icon that points to a link"
        src={image_src}
        width={24}
        height={24}
      />
    </a>
  )
}
