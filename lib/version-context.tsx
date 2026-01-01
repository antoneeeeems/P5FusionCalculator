'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type GameVersion = 'p5' | 'p5r'

interface VersionContextType {
  version: GameVersion
  setVersion: (version: GameVersion) => void
  isRoyal: boolean
}

const VersionContext = createContext<VersionContextType | undefined>(undefined)

export function VersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersionState] = useState<GameVersion>('p5')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load version from localStorage
    const savedVersion = localStorage.getItem('gameVersion') as GameVersion
    if (savedVersion) {
      setVersionState(savedVersion)
      if (typeof window !== 'undefined') {
        (window as any).GLOBAL_IS_ROYAL = savedVersion === 'p5r'
      }
    }
  }, [])

  const setVersion = (newVersion: GameVersion) => {
    setVersionState(newVersion)
    localStorage.setItem('gameVersion', newVersion)
    
    // Reload the page to load different data files
    window.location.reload()
  }

  const isRoyal = version === 'p5r'

  return (
    <VersionContext.Provider value={{ version, setVersion, isRoyal }}>
      {children}
    </VersionContext.Provider>
  )
}

export function useVersion() {
  const context = useContext(VersionContext)
  if (context === undefined) {
    throw new Error('useVersion must be used within a VersionProvider')
  }
  return context
}
