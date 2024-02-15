import { CountdownLabel } from "../../ui/coundown"
import ViewIcon from "../../ui/Icons/view.svg"
import EditIcon from '../../ui/Icons/edit.svg'
import WhitelistUserIcon from '../../ui/Icons/whitelist-user.svg'

import { useRouter } from "next/router"
import { truncateEthAddress } from "@/src/lib/utils"

export const ListingCard = ({
    listing,
    notStarted,
    hasEnded
}: {
    listing: any,
    notStarted: boolean,
    hasEnded: boolean
}) => {

    const router = useRouter();
    return (
        <div className="relative rounded-xl border-gray-700 border p-4 pt-[4rem] w-[16rem] flex flex-col justify-between gap-y-6">
        {notStarted ? (
          <div className="absolute top-[1rem] left-[1rem] w-fit bg-[#3f3e3a]/10 !text-black py-2 px-3 text-xs text-center rounded-[0.1rem]">
            <CountdownLabel
              message=" "
              target={new Date(listing.startTime * 1000)}
            />
          </div>
        ) : !hasEnded ? (
          <div className="absolute top-[1rem] left-[1rem] w-fit bg-gray-200/90 py-2 px-3 text-xs text-center items-center rounded-[0.1rem] flex gap-x-2 z-[1]">
            <div className="rounded-full w-[0.4rem] h-[0.4rem] bg-green-500"></div>
            <span className="font-mono uppercase">LIVE</span>
          </div>
        ) : (
          hasEnded &&
          <div className="absolute top-[1rem] left-[1rem] w-fit bg-gray-200/90 py-2 px-3 text-xs text-center items-center rounded-[0.1rem] flex gap-x-2 z-[1]">
            <div className="rounded-full w-[0.4rem] h-[0.4rem] bg-rose-500"></div>
            <span className="font-mono uppercase">SALE ENDED</span>
          </div>
        )}
        <div className="h-[14rem] bg-gray-100 px-2 pt-16 pb-4 absolute w-full top-0 left-0 rounded-tl-[1rem] rounded-tr-[1rem]">
          <img src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}token_covers/${listing.nft}_${listing.tokenId}.png`} className="object-contain mx-auto max-h-full" />
        </div>
        
        <div className="flex gap-x-2 items-center absolute top-4 right-4 ">
          <img
            src={ViewIcon.src}
            className="w-6 h-6 cursor-pointer"
            onClick={() =>
              router.push(
                `/artwork/${listing.nft}/${listing.tokenId}`,
              )
            }
          />
          {/** Only allow editing if not started **/}
          <img
          src={EditIcon.src}
          className={`w-6 h-6 ${notStarted ? 'cursor-pointer' : 'cursor-not-allowed opacity-20'}`}
          onClick={() =>
              notStarted ? router.push(
              `/dashboard/creator/listings/edit?contract=${listing.nft}&id=${listing.tokenId}`,
              ) : 
              null
          }
          />

          <img
          src={WhitelistUserIcon.src}
          className={`w-6 h-6 ${notStarted ? 'cursor-pointer' : 'cursor-not-allowed opacity-20'}`}
          onClick={() =>
              notStarted ? router.push(
              `/dashboard/admin/listings/allowlist?id=${listing.id.split('/')[1]}`,
              ) : 
              null
          }
          />
          
        </div>

        <div className="flex flex-col mt-[11rem]">
          <span className="font-mono text-xs uppercase text-gray-800">
            {truncateEthAddress(listing.nft)}
          </span>
          <span className="text-3xl uppercase">
            {listing.tokenId}
          </span>
        </div>
        <span>{listing.title}</span>
      </div>
    )
}