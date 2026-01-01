'use client'

import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const dlcPersonas = [
  'Orpheus',
  'Orpheus Picaro',
  'Izanagi',
  'Izanagi Picaro',
  'Kaguya',
  'Kaguya Picaro',
  'Ariadne',
  'Ariadne Picaro',
  'Asterius',
  'Asterius Picaro',
  'Tsukiyomi',
  'Tsukiyomi Picaro',
  'Messiah',
  'Messiah Picaro',
  'Athena',
  'Athena Picaro'
]

export function SettingsPopover() {
  const [dlcSettings, setDlcSettings] = useState<{ [key: string]: boolean }>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load from localStorage
    const stored = localStorage.getItem('dlcPersona')
    if (stored) {
      try {
        setDlcSettings(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse DLC settings', e)
      }
    }
  }, [])

  const handleToggle = (persona: string, checked: boolean) => {
    const newSettings = {
      ...dlcSettings,
      [persona]: checked
    }
    setDlcSettings(newSettings)
    localStorage.setItem('dlcPersona', JSON.stringify(newSettings))
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('dlcSettingsChanged'))
  }

  const handleSelectAll = () => {
    const newSettings: { [key: string]: boolean } = {}
    dlcPersonas.forEach(p => {
      newSettings[p] = true
    })
    setDlcSettings(newSettings)
    localStorage.setItem('dlcPersona', JSON.stringify(newSettings))
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('dlcSettingsChanged'))
  }

  const handleClearAll = () => {
    setDlcSettings({})
    localStorage.setItem('dlcPersona', JSON.stringify({}))
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('dlcSettingsChanged'))
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  const selectedCount = Object.values(dlcSettings).filter(Boolean).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
          {selectedCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {selectedCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[500px] overflow-y-auto" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">DLC Personas</h3>
            <p className="text-sm text-muted-foreground">
              Select which DLC personas you own for fusion calculations.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex-1"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="flex-1"
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-3 pt-2">
            {dlcPersonas.map(persona => (
              <div
                key={persona}
                className="flex items-center justify-between space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <Label
                  htmlFor={`dlc-${persona}`}
                  className="flex-1 cursor-pointer font-normal text-sm"
                >
                  {persona}
                </Label>
                <Switch
                  id={`dlc-${persona}`}
                  checked={dlcSettings[persona] || false}
                  onCheckedChange={(checked) => handleToggle(persona, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
