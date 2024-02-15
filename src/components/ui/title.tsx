export const Title = ({
  italics,
  normal,
  size = 'lg',
  white,
}: {
  italics?: string
  normal?: string
  size?: 'sm' | 'md' | 'lg'
  white?: boolean
}) => {
  return (
    <div
      className={`${
        size == 'sm'
          ? 'text-2xl'
          : size == 'md'
          ? 'text-3xl'
          : 'sm:text-5xl text-3xl'
      } ${white && 'text-white'} flex items-center flex-wrap`}
    >
      {italics && <h2 className="inline italic font-bold">{italics}</h2>}
      {normal && <p className="inline">{normal}</p>}
    </div>
  )
}
