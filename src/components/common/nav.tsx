import { Separator } from '@radix-ui/react-separator'
import VerticalLogo from '../../images/VERTICAL_LOGO.svg'
import Link from 'next/link'
import clsx from 'clsx'
import { Profile } from './profile'
import { useRouter } from 'next/router'
// import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
// import { MoonIcon } from '@heroicons/react/24/solid'

export const Nav = ({ white_bg = true }: { white_bg?: boolean }) => {
  const router = useRouter()
  const exhibition_nav_active = router.pathname.includes('exhibition')
    ? true
    : false

  return (
    <>
      <div
        className={`w-full flex navbar p-0 h-[72px] z-50 ${
          white_bg ? 'bg-white' : 'bg-transparent absolute top-0 left-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 w-full h-full flex justify-between">
          <Link href="/">
            <img src={VerticalLogo.src} className="w-36" />
          </Link>
          <div
            className={`h-full flex items-center sm:gap-x-8 gap-x-4 ${
              white_bg ? 'text-black' : 'text-white'
            }`}
          >
            <div
              className={clsx(
                'sm:flex sm:items-center hidden gap-x-6 h-full relative',
                exhibition_nav_active && (white_bg ? 'active-white' : 'active'),
              )}
            >
              <NavLink
                label="Exhibitions"
                url="/exhibitions"
                white_bg={white_bg}
              />
              {/* <NavLink label="Artists" url="/artists" /> */}
            </div>
            {/**<div className="form-control w-64">
                  <input type="text" placeholder="Search" className="input input-bordered bg-white" />
                </div>**/}
            {/* <MagnifyingGlassIcon className="w-6 h-6" stroke={white_bg ? 'black' : 'white'} strokeWidth={2} />
            <MoonIcon className="w-6 h-6" fill={white_bg ? 'black' : 'white'} /> */}
            <Profile is_black_button={white_bg ? true : false} />
          </div>
        </div>
      </div>
      {/* {white_bg && <Separator
        className="w-full bg-gray-300 h-[1px]"
        orientation="horizontal"
      />} */}
    </>
  )
}

const NavLink = ({
  label,
  url,
  white_bg,
}: {
  label: string
  url: string
  white_bg: boolean
}) => {
  return (
    <Link
      className={clsx('font-medium', white_bg ? 'text-black' : 'text-white')}
      href={url}
    >
      {label}
    </Link>
  )
}
