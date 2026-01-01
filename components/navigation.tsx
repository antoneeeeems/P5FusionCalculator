'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SettingsPopover } from '@/components/settings-popover'
import { List, Sparkles } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()
  
  const isPersonasActive = pathname === '/list' || pathname?.startsWith('/persona/')
  const isSkillsActive = pathname === '/skill'

  return (
    <div className="flex items-center gap-2">
      <Link href="/list">
        <Button 
          variant={isPersonasActive ? "default" : "outline"} 
          size="sm"
          className="gap-2"
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Personas</span>
        </Button>
      </Link>
      <Link href="/skill">
        <Button 
          variant={isSkillsActive ? "default" : "outline"} 
          size="sm"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Skills</span>
        </Button>
      </Link>
      <SettingsPopover />
    </div>
  )
}
