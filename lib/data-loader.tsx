'use client'

import Script from 'next/script'
import { useEffect, useState, ReactNode } from 'react'
import { VersionProvider } from './version-context'

export function DataLoader({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState<'p5' | 'p5r' | null>(null)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    // Load version from localStorage
    const savedVersion = (localStorage.getItem('gameVersion') as 'p5' | 'p5r') || 'p5'
    setVersion(savedVersion)
    
    // Set global variable
    ;(window as any).GLOBAL_IS_ROYAL = savedVersion === 'p5r'
  }, [])

  // Don't render scripts until we know the version
  if (version === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-lg">Initializing...</p>
        </div>
      </div>
    )
  }

  const dataSuffix = version === 'p5r' ? 'Royal' : ''
  const totalScripts = 4

  const handleScriptLoad = () => {
    setLoadedCount(prev => {
      const newCount = prev + 1
      if (newCount >= totalScripts) {
        setScriptsLoaded(true)
      }
      return newCount
    })
  }

  return (
    <>
      <Script 
        src={`/data/Data5${dataSuffix}.js`} 
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={(e) => console.error('Failed to load Data5:', e)}
      />
      <Script 
        src={`/data/PersonaData${dataSuffix}.js`} 
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={(e) => console.error('Failed to load PersonaData:', e)}
      />
      <Script 
        src={`/data/SkillData${dataSuffix}.js`} 
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={(e) => console.error('Failed to load SkillData:', e)}
      />
      <Script 
        src={`/data/ItemData${dataSuffix}.js`} 
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={(e) => console.error('Failed to load ItemData:', e)}
      />
      <VersionProvider>
        {scriptsLoaded ? children : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-lg">Loading data... ({loadedCount}/{totalScripts})</p>
            </div>
          </div>
        )}
      </VersionProvider>
    </>
  )
}
