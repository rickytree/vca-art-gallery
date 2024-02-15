import { ReactNode } from 'react'
import { Nav } from './nav'
import { Footer } from './footer'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Analytics } from '@vercel/analytics/react'

export const Layout = ({ children }: { children: ReactNode }) => {
  const router = useRouter()

  const transparent_nav =
    router.pathname == '/exhibitions' || router.pathname == '/' ? true : false

  return (
    <div>
      <Head>
        <title>VERTICAL GALLERY</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon_vertical.ico" />
      </Head>

      <nav className="mx-auto">
        <Nav white_bg={!transparent_nav} />
      </nav>
      {children}
      <Analytics />
      <Footer />
    </div>
  )
}
