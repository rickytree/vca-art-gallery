import { Title } from '../ui/title'

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

// Page header that is absolute positioned and includes the nav bar.
// Usually used for Exhibition Listing and landing page.
export const TallPageHeader = ({
  title,
  description,
  background,
}: {
  title: string
  description?: string
  background: string
}) => {
  return (
    <div
      className="w-full pb-20"
      style={{ backgroundImage: `url('${background}')` }}
    >
      <div className="max-w-7xl mx-auto pt-36 text-white lg:px-4 px-8">
        <div className="max-w-[70%] mb-10">
          <Title normal={title} />
          {description && <h2 className="mt-3">{description}</h2>}
        </div>
      </div>
    </div>
  )
}
