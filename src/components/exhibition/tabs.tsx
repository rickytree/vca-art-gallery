import { useState } from 'react'

type ExhibitionListTabProps = {
  currentTab: 'live' | 'upcoming' | 'past'
  setTab: (tab: 'live' | 'upcoming' | 'past') => void
  displayTabs: ('live' | 'upcoming' | 'past')[]
} 

export const ExhibitionListTabs = ({
  currentTab,
  setTab,
  displayTabs = ['past']
}: ExhibitionListTabProps) => {
  const handleTabChange = (tab: 'live' | 'upcoming' | 'past') => {
    setTab(tab)
  }

  return (
    <div className="w-full tabs text-white absolute bottom-0 left-0 pb-2 border-white/50 border-b mb-4 gap-x-12 lg:px-4 px-8">
      { displayTabs.includes('live') && 
      <a
        className={`text-md px-0 tab border-b-2 ${
          currentTab == 'live' ? 'border-white text-white' : 'border-white/0'
        }`}
        onClick={() => handleTabChange('live')}
      >
        Live
      </a>
      }
      { displayTabs.includes('upcoming') &&
      <a
        className={`text-md px-0 tab border-b-2 ${
          currentTab == 'upcoming' ? 'border-white text-white' : 'border-white/0'
        }`}
        onClick={() => handleTabChange('upcoming')}
      >
        Upcoming
      </a>
      }
      { displayTabs.includes('past') &&
      <a
        className={`text-md px-0 tab border-b-2 ${
          currentTab == 'past' ? 'border-white text-white' : 'border-white/0'
        }`}
        onClick={() => handleTabChange('past')}
      >
        Past
      </a>
      }
    </div>
  )
}

type ExhibitionTabProps = {
  hideAbout?: boolean
  hideSponsors?: boolean
  currentTab: 'about' | 'artists' | 'artworks' | 'sponsors'
  setTab: (tab: 'about' | 'artists' | 'artworks' | 'sponsors') => void
}

export const ExhibitionPageTabs = ({
  hideAbout = true,
  hideSponsors = true,
  currentTab,
  setTab,
}: ExhibitionTabProps) => {
  const handleTabChange = (
    tab: 'about' | 'artists' | 'artworks' | 'sponsors',
  ) => {
    setTab(tab)
  }

  return (
    <div className="tabs mt-20 sm:gap-x-12 gap-x-6 px-4">
      <a
        className={`text-md  px-0 tab tab-bordered font-bold border-black/0 text-black ${
          currentTab == 'artworks' && 'tab-active !border-black text-black'
        }`}
        onClick={() => handleTabChange('artworks')}
      >
        Artworks
      </a>
      {!hideAbout && (
        <a
          className={`text-md px-0 tab text-black font-bold border-black/0 tab-bordered ${
            currentTab == 'about' && 'tab-active text-black !border-black'
          }`}
          onClick={() => handleTabChange('about')}
        >
          Curator Note
        </a>
      )}
      {/**
      <a
        className={`text-md px-0 tab tab-bordered border-black/0 text-black ${
          currentTab == 'artists' && 'tab-active !border-black text-black'
        }`}
        onClick={() => handleTabChange('artists')}
      >
        Artists
      </a> */}
      {!hideSponsors && (
        <a
          className={`text-md  px-0 tab tab-bordered border-black/0 text-black ${
            currentTab == 'sponsors' && 'tab-active !border-black text-black'
          }`}
          onClick={() => handleTabChange('sponsors')}
        >
          Sponsors
        </a>
      )}
    </div>
  )
}
