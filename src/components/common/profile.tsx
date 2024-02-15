import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState, useEffect } from 'react'
import Jazzicon from 'react-jazzicon/dist/Jazzicon'
import { useRouter } from 'next/router'
import { GET_ROLE_BY_ETH_ADDRESS } from '@/src/lib/database/user.ts'
import { useQuery } from '@apollo/client'
import { get_user_role_array } from '@/src/lib/helpers/user'
import { useUserStore } from '@/src/lib/store'

export const Profile = ({
  is_black_button = true,
}: {
  is_black_button?: boolean
}) => {
  const router = useRouter()
  const ongoPage = (link: string) => {
    router.push(link)
  }
  const [randomSeed, setRandomSeed] = useState<number>(0)
  const { address, connector, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
  const { disconnect } = useDisconnect()

  const [_isConnected, _setIsConnected] = useState(false)
  const [_connectors, _setConnectors] = useState<any>([])

  const setUserRole = useUserStore((state: any) => state.setUserRole)

  const { data: user_role } = useQuery(GET_ROLE_BY_ETH_ADDRESS, {
    variables: {
      eth_wallet: address,
    },
  })

  useEffect(() => {
    _setIsConnected(isConnected)
  }, [isConnected])

  useEffect(() => {
    _setConnectors(connectors)
  }, [connectors])

  useEffect(() => {
    // Generate random number
    setRandomSeed(Math.round(Math.random() * 10000000))
  }, [])

  useEffect(() => {
    if (user_role) {
      const rolesArray = get_user_role_array(user_role.v3_accounts)
      setUserRole(rolesArray[0])
    } else {
      setUserRole('user')
    }
  }, [user_role, address])

  if (_isConnected) {
    return (
      <div className="dropdown dropdown-end">
        <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <Jazzicon diameter={40} seed={randomSeed} />
        </div>
        <ul
          tabIndex={0}
          className="mt-3 p-2 menu menu-compact dropdown-content bg-white rounded-box w-52 border-gray-200 border text-black"
        >
          {/**
          <li>
            <a href="/dashboard/creator" className="justify-between hover:bg-gray-300 active:text-black">
              Dashboard
              <span className="badge bg-gray-400 border-0 text-white">New</span>
            </a>
          </li>
           */}
          <li className="sm:hidden block hover:bg-gray-300">
            <a
              className="justify-between active:text-black"
              onClick={() => ongoPage('/exhibitions')}
            >
              Exhibitions
            </a>
          </li>
          {/**
          <li className='hover:bg-gray-300'>
            <a className="justify-between active:text-black" onClick={() => ongoPage('/profile')}>
              Profile
            </a>
          </li>
           */}
          {/* <li className='sm:hidden block hover:bg-gray-300'>
            <a href="/artists" className="justify-between active:text-black">
              Artists
            </a>
          </li> */}
          <li>
            <a
              onClick={() => disconnect()}
              className="hover:bg-gray-300 active:text-black"
            >
              Logout
            </a>
          </li>
        </ul>
      </div>
    )
  }
  return (
    <div>
      {_connectors.map((connector: any) => (
        <button
          className={`px-6 py-2 rounded font-medium ${
            is_black_button ? 'bg-black text-white' : 'bg-white text-black'
          }`}
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => {
            connect({ connector })
          }}
        >
          Connect
          {!connector.ready && ' (unsupported)'}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </button>
      ))}
    </div>
  )
}
