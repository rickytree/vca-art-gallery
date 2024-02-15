export const Avatar = ({
  size,
  imageUrl,
}: {
  size: 's' | 'm' | 'lg'
  imageUrl: string
}) => {
  return (
    <div className="avatar">
      <div
        className={`${
          size == 's' ? 'w-16' : size == 'm' ? 'w-20' : 'w-24'
        } rounded-full`}
      >
        <img src={imageUrl} />
      </div>
    </div>
  )
}
