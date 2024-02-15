import { BoxButton } from '@/src/components/ui/Button/box'
import { Title } from '@/src/components/ui/title'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Creator = () => {
  const router = useRouter()

  /* useEffect(() => {
    // redirect to main
    router.push('/')
  }, []) */

  return (
    <main className="max-w-7xl mx-auto px-8 p-10 min-h-screen">
      <Title italics="GM, " normal="what would you like to do today?" />

      <h2 className="text-lg mt-12 mb-4 uppercase font-mono">Create</h2>
      <div className="flex gap-x-6 gap-y-4 flex-wrap">
        <BoxButton
          label="Collection"
          link="/dashboard/creator/collections/create"
        />
        <BoxButton label="Single token" link="/dashboard/creator/collections" />
        <BoxButton label="Artblocks project" link=".../" />
        <BoxButton
          label="Sales/auction listing"
          link="/dashboard/creator/listings/create"
        />
      </div>

      <h2 className="text-lg mt-12 mb-4 uppercase font-mono">Manage</h2>
      <div className="flex gap-x-6 gap-y-4 flex-wrap">
        <BoxButton label="Artblocks project" link=".../" />
        <BoxButton label="Collection" link="/dashboard/creator/collections" />
        <BoxButton label="Sales listing" link="/dashboard/creator/listings" />
      </div>

      <h2 className="text-lg mt-12 mb-4 uppercase font-mono">Account</h2>
      <div className="flex gap-x-6 flex-wrap">
        <BoxButton label="Edit profile" link=".../" />
      </div>
    </main>
  )
}

export default Creator
