import { Title } from '../ui/title'

export const ExhibitionHeader = ({
  exhibition,
}: {
  exhibition: Exhibition
}) => {
  let displayEnd = true
  if (exhibition.start_date == exhibition.end_date) {
    displayEnd = false
  }

  return (
    <div className="relative md:max-w-[66%] w-full flex flex-col gap-y-3 bg-white/80 rounded-lg p-4">
      <h4 className="mb-2 text-black">
        {exhibition.location ? `${exhibition.location}, ` : ''}
        {exhibition.start_date}
        {exhibition.end_date && displayEnd ? ` - ${exhibition.end_date}` : ''}
      </h4>
      <Title italics={exhibition.title} />
      <h2
        className="mt-2"
        dangerouslySetInnerHTML={{ __html: exhibition.description }}
      ></h2>

      {exhibition.curator && exhibition.curator.length > 0 && (
        <p className="text-gray-900 uppercase font-bold curation-text absolute top-2 right-6 max-h-[10rem] text-center">
          Curated by{' '}
          {exhibition.curator.map((curator: User, index: number) => {
            return `${curator.name} + ${
              index !== (exhibition.curator && exhibition.curator.length - 1)
                ? ', '
                : ''
            }`
          })}
        </p>
      )}
    </div>
  )
}

export const PageHeader = ({
  title,
  description,
}: {
  title: string
  description?: string
}) => {
  const italics = title.split(' ')[0]
  const normalTitle = title.replace(italics, '')

  return (
    <div className="max-w-[50%]">
      <Title italics={italics} normal={normalTitle} />
      {description && <h2 className="mt-3">{description}</h2>}
    </div>
  )
}
