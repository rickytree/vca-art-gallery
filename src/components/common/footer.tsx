import { Title } from '../ui/title'
import DiscordIcon from '../../../public/discord.svg'
import InstagramIcon from '../../../public/instagram.svg'
import TwitterIcon from '../../../public/twitter.svg'
import LongArrow from '../../../public/long-arrow-right.svg'
import Image from 'next/image'
import { useState } from 'react'
import VerticalVLogo from '../../images/VERTICAL_LOGO_vertical.svg'

type Link = {
  name: string
  url: string
  internal: boolean
}

type LinkBlock = {
  title: string
  links: Link[]
}

const footerLinks = [
  {
    title: 'Explore',
    links: [{ name: 'Exhibitions', url: '/exhibitions', internal: true }],
  },
  {
    title: 'About us',
    links: [
      {
        name: 'Contact',
        url: 'mailto:info@verticalcrypto.art',
        internal: false,
      },
      {
        name: 'What we do',
        url: 'https://verticalcrypto.art',
        internal: false,
      },
    ],
  },
  {
    title: 'Other initiatives',
    links: [
      {
        name: 'VERTICAL Residency',
        url: 'https://residency.verticalcrypto.art',
        internal: false,
      },
    ],
  },
]

export const SocialMediaBlock = () => {
  return (
    <div className="flex gap-x-4">
      <a href="https://discord.gg/TqNcW5CpyJ" target="_blank" rel="noreferrer">
        <Image
          alt="Discord Icon"
          src={DiscordIcon.src}
          width={28}
          height={28}
        />
      </a>
      <a
        href="https://twitter.com/verticalcrypto"
        target="_blank"
        rel="noreferrer"
      >
        <Image
          alt="Twitter Icon"
          src={TwitterIcon.src}
          width={28}
          height={28}
        />
      </a>
      <a
        href="https://www.instagram.com/verticalcryptoart"
        target="_blank"
        rel="noreferrer"
      >
        <Image
          alt="Instagram Icon"
          src={InstagramIcon.src}
          width={28}
          height={28}
        />
      </a>
    </div>
  )
}

export const NewsletterInputBlock = () => {
  const [submissionMessage, setSubmissionMessage] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')

  const handleFormSubmit = (e: any) => {
    e.preventDefault()

    if (name && email) {
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          revision: '2023-07-15',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              profile: {
                data: {
                  type: 'profile',
                  attributes: {
                    email: email,
                    first_name: name,
                    properties: {
                      custom_source: 'VCA Gallery Platform Newsletter Form',
                    },
                  },
                },
              },
            },
            relationships: { list: { data: { type: 'list', id: 'UF5itD' } } },
          },
        }),
      }

      fetch(
        'https://a.klaviyo.com/client/subscriptions/?company_id=VaQQxZ',
        options,
      )
        .then((response) => {
          if (response.status == 202)
            setSubmissionMessage(`Thanks for subscribing, ${name}!`)
        })
        .catch((err) => console.error(err))
    } else {
      console.log('Error!')
    }
  }

  return (
    <>
      <form
        className="flex flex-col gap-y-4 sm:mt-4 mt-8 text-black"
        onSubmit={(e: any) => handleFormSubmit(e)}
      >
        <div className="flex gap-x-4 gap-y-2 flex-wrap">
          <input
            type="text"
            placeholder="First Name*"
            required={true}
            value={name}
            onChange={(e) => {
              setSubmissionMessage('')
              setName(e.target.value)
            }}
            className="rounded input input-bordered input-sm w-full max-w-xs bg-white"
          />
          <input
            type="email"
            placeholder="Email*"
            required={true}
            value={email}
            onChange={(e) => {
              setSubmissionMessage('')
              setEmail(e.target.value)
            }}
            className="rounded input input-bordered input-sm w-full max-w-xs bg-white"
          />
          <button
            className="flex gap-x-2 items-center jusify-center rounded input w-fit px-6 input-sm bg-white"
            type="submit"
            value="submit"
          >
            <span>Register now</span>
            <img
              alt="Long arrow - decorative"
              src={LongArrow.src}
              className="w-4"
            />
          </button>
        </div>
        <div className="flex gap-x-2">
          <input type="checkbox" name="checkbox" required={true} />
          <label className="text-white/40">
            Yes I agree to the Privacy Policy
          </label>
        </div>
      </form>

      {submissionMessage && <p className="mt-2 text-xs">{submissionMessage}</p>}
    </>
  )
}

export const Footer = () => {
  return (
    <div className="bg-black mx-auto text-white w-full">
      <div className="relative max-w-7xl mx-auto flex flex-col gap-y-12 py-16 px-6">
        <div className="flex flex-col gap-y-2">
          {/* 
          <Title italics="Sign up" normal="to our newsletter" />
          <NewsletterInputBlock />
        */}
        </div>
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-4 w-full mb-8">
          {footerLinks.map((block: LinkBlock, index) => (
            <LinkBlock link_block={block} key={index} />
          ))}
        </div>

        <div className="flex justify-between flex-wrap">
          <div className="flex gap-x-4 items-center flex-wrap">
            <span className="text-white/40">© VERTICAL 2023</span>
            <a href="/terms-conditions">Terms and Conditions</a>
            <a href="/privacy">Privacy</a>
          </div>

          <SocialMediaBlock />
        </div>

        <Image
          alt="VERTICAL logo"
          src={VerticalVLogo.src}
          className="absolute right-0 top-14"
          height={48}
          width={48}
        />
      </div>
    </div>
  )
}

export const LinkBlock = ({ link_block }: { link_block: LinkBlock }) => {
  return (
    <div className="flex flex-col gap-y-1 sm:items-start items-center">
      <h4 className="uppercase text-white/40">{link_block.title}</h4>
      {link_block.links.map((link: Link, index) => (
        <a
          className="cursor-pointer"
          href={link.url}
          target={link.internal ? '' : '_blank '}
          rel={link.internal ? '' : 'noreferrer'}
          key={index}
        >
          {link.name}
        </a>
      ))}
    </div>
  )
}
