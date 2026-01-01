'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { VersionProvider } from '@/lib/version-context'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState<'p5' | 'p5r'>('p5')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedVersion = localStorage.getItem('gameVersion') as 'p5' | 'p5r'
    if (savedVersion) {
      setVersion(savedVersion)
    }
  }, [])

  const isRoyal = version === 'p5r'
  const dataSuffix = isRoyal ? 'Royal' : ''

  if (!mounted) {
    return null
  }

  return (
    <>
      <Script src={`/data/Data5${dataSuffix}.js`} strategy="beforeInteractive" />
      <Script src={`/data/PersonaData${dataSuffix}.js`} strategy="beforeInteractive" />
      <Script src={`/data/SkillData${dataSuffix}.js`} strategy="beforeInteractive" />
      <Script src={`/data/ItemData${dataSuffix}.js`} strategy="beforeInteractive" />
      <Script id="global-config" strategy="beforeInteractive">
        {`var GLOBAL_IS_ROYAL = ${isRoyal};`}
      </Script>
      <VersionProvider>
        {children}
      </VersionProvider>
    </>
  )
}
