import Image from 'next/image'

const NoData = () => (
  <div className="flex flex-col items-center w-full py-8">
    <Image src="/no-data.svg" width={100} height={100} alt="no-data" />
    <span className="text-xl"> No Data </span>
  </div>
)

export default NoData
