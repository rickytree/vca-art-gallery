type TokenTabProps = {
  availableTabs?: ('details' | 'collection' | 'others')[]
  currentTab: 'details' | 'collection' | 'others'
  setTab: (tab: 'details' | 'collection' | 'others') => void
}

export const TokenTabs = ({
  availableTabs = ['details'],
  currentTab,
  setTab,
}: TokenTabProps) => {
  const handleTabChange = (tab: 'details' | 'collection' | 'others') => {
    setTab(tab)
  }

  return (
    <div className="tabs ml-10 pb-2 border-gray-200 border-b-2 mb-2  text-black uppercase gap-x-12">
      {availableTabs.includes('details') && (
        <a
          className={`text-md  px-0 tab ${
            currentTab == 'details' && 'border-b-2 border-black text-black'
          }`}
          onClick={() => handleTabChange('details')}
        >
          Details
        </a>
      )}
      {availableTabs.includes('collection') && (
        <a
          className={`text-md  px-0 tab ${
            currentTab == 'collection' && 'border-b-2 border-black text-black'
          }`}
          onClick={() => handleTabChange('collection')}
        >
          Collection
        </a>
      )}
      {availableTabs.includes('others') && (
        <a
          className={`text-md  px-0 tab ${
            currentTab == 'others' && 'border-b-2 border-black text-black'
          }`}
          onClick={() => handleTabChange('others')}
        >
          Others
        </a>
      )}
    </div>
  )
}
