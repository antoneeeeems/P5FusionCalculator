'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { getCustomPersonaList, clearCache } from '@/lib/DataUtil.client'
import { PersonaData } from '@/lib/types'
import { useVersion } from '@/lib/version-context'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'

// Arcana list for sorting
const ARCANAS = ["Fool", "Magician", "Priestess", "Empress", "Emperor", "Hierophant", 
  "Lovers", "Chariot", "Justice", "Hermit", "Fortune", "Strength", "Hanged Man", 
  "Death", "Temperance", "Devil", "Tower", "Star", "Moon", "Sun", "Judgement", "World"];

export default function PersonaListPage() {
  const [filterStr, setFilterStr] = useState('')
  const [sortBy, setSortBy] = useState('level')
  const [sortReverse, setSortReverse] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dlcRefresh, setDlcRefresh] = useState(0)
  const { version, setVersion } = useVersion()
  
  // Listen for DLC settings changes to refresh the list
  useEffect(() => {
    const handleDlcChange = () => {
      clearCache()
      setDlcRefresh(prev => prev + 1)
    }
    
    window.addEventListener('dlcSettingsChanged', handleDlcChange)
    return () => window.removeEventListener('dlcSettingsChanged', handleDlcChange)
  }, [])
  
  const fullPersonaList = useMemo(() => {
    try {
      setError(null)
      return getCustomPersonaList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load persona data')
      return []
    }
  }, [version, dlcRefresh])

  const getSortValue = useCallback((item: PersonaData) => {
    if (sortBy === "arcana") {
      const arcanaIndex = ARCANAS.indexOf(item.arcana)
      const arcanaValue = arcanaIndex.toString().padStart(2, '0')
      const levelValue = (100 - item.level).toString().padStart(2, '0')
      return arcanaValue + levelValue
    }
    return item[sortBy]
  }, [sortBy])

  const filteredAndSorted = useMemo(() => {
    const search = filterStr.toLowerCase()
    
    let filtered = filterStr
      ? fullPersonaList.filter((persona) =>
          persona.name?.toLowerCase().includes(search) ||
          persona.arcana.toLowerCase().includes(search) ||
          persona.inherits?.toLowerCase().includes(search)
        )
      : fullPersonaList

    return filtered.sort((a, b) => {
      const aVal = getSortValue(a)
      const bVal = getSortValue(b)
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortReverse ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      }
      return sortReverse ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number)
    })
  }, [fullPersonaList, filterStr, sortBy, sortReverse, getSortValue])

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortReverse(!sortReverse)
    } else {
      setSortBy(field)
      setSortReverse(false)
    }
  }, [sortBy, sortReverse])

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortReverse ? ' ↓' : ' ↑'
  }

  const getElementColor = (value: string) => {
    if (!value || value === '-') return ''
    switch(value.toLowerCase()) {
      case 'wk': return 'text-red-600 font-semibold'
      case 'rs': return 'text-blue-600 font-semibold'
      case 'nu': return 'text-gray-500 font-semibold'
      case 'rp': return 'text-yellow-600 font-semibold'
      case 'ab': return 'text-green-600 font-semibold'
      default: return ''
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Persona 5 Fusion Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Version Toggle */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <Label className="text-base font-semibold">Game Version:</Label>
            <RadioGroup
              value={version}
              onValueChange={(value) => setVersion(value as 'p5' | 'p5r')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="p5" id="p5" />
                <Label htmlFor="p5" className="cursor-pointer font-normal">
                  Persona 5
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="p5r" id="p5r" />
                <Label htmlFor="p5r" className="cursor-pointer font-normal">
                  Persona 5 Royal
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Filter and Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Label className="font-semibold">Filter:</Label>
            <Input
              type="text"
              value={filterStr}
              onChange={(e) => setFilterStr(e.target.value)}
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              placeholder="Search by name, arcana, or inherits..."
              className="max-w-md"
            />
            <Button variant="outline" size="sm" onClick={() => setFilterStr('')}>
              Clear
            </Button>
            <div className="ml-auto">
              <Navigation />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error Loading Persona Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-red-600">
            <p>{error}</p>
            <p>Please make sure the persona data files are loaded correctly.</p>
          </CardContent>
        </Card>
      )}

      {/* Persona Table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table className="relative">
          <TableHeader className="sticky top-0 bg-card z-20 border-b shadow-sm after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-border">
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r" onClick={() => handleSort('level')}>
                Level{renderSortIcon('level')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r" onClick={() => handleSort('name')}>
                Name{renderSortIcon('name')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r" onClick={() => handleSort('arcana')}>
                Arcana{renderSortIcon('arcana')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden md:table-cell" onClick={() => handleSort('inherits')}>
                Inherits{renderSortIcon('inherits')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden lg:table-cell" onClick={() => handleSort('strength')}>
                Str{renderSortIcon('strength')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden lg:table-cell" onClick={() => handleSort('magic')}>
                Mag{renderSortIcon('magic')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden lg:table-cell" onClick={() => handleSort('endurance')}>
                End{renderSortIcon('endurance')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden lg:table-cell" onClick={() => handleSort('agility')}>
                Agi{renderSortIcon('agility')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden lg:table-cell" onClick={() => handleSort('luck')}>
                Luk{renderSortIcon('luck')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden xl:table-cell" onClick={() => handleSort('physicalValue')}>
                Phys
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden xl:table-cell" onClick={() => handleSort('gunValue')}>
                Gun
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden xl:table-cell" onClick={() => handleSort('fireValue')}>
                Fire
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden xl:table-cell" onClick={() => handleSort('iceValue')}>
                Ice
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden xl:table-cell" onClick={() => handleSort('electricValue')}>
                Elec
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden xl:table-cell" onClick={() => handleSort('windValue')}>
                Wind
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden xl:table-cell" onClick={() => handleSort('psychicValue')}>
                Psy
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden xl:table-cell" onClick={() => handleSort('nuclearValue')}>
                Nuke
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden xl:table-cell" onClick={() => handleSort('blessValue')}>
                Bless
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card border-r hidden xl:table-cell" onClick={() => handleSort('curseValue')}>
                Curse
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted bg-card hidden 2xl:table-cell" onClick={() => handleSort('area')}>
                Mementos Location
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
                {filteredAndSorted.map((persona) => (
                  <TableRow key={persona.name} className="h-14">
                    <TableCell className="font-medium py-2">{persona.level}</TableCell>
                    <TableCell className="py-2">
                      <Link href={`/persona/${persona.name}`} className="hover:underline font-semibold text-blue-600">
                        {persona.name}
                      </Link>
                      {persona.dlc && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                          DLC
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">{persona.arcana}</TableCell>
                    <TableCell className="hidden md:table-cell py-2">{persona.inherits || '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell py-2 py-2">{persona.strength}</TableCell>
                    <TableCell className="hidden lg:table-cell py-2">{persona.magic}</TableCell>
                    <TableCell className="hidden lg:table-cell py-2">{persona.endurance}</TableCell>
                    <TableCell className="hidden lg:table-cell py-2">{persona.agility}</TableCell>
                    <TableCell className="hidden lg:table-cell py-2">{persona.luck}</TableCell>
                    <TableCell className={`hidden xl:table-cell py-2 ${getElementColor(persona.physical)}`}>{persona.physical}</TableCell>
                    <TableCell className={`hidden xl:table-cell py-2 ${getElementColor(persona.gun)}`}>{persona.gun}</TableCell>
                    <TableCell className={`hidden xl:table-cell py-2 ${getElementColor(persona.fire)}`}>{persona.fire}</TableCell>
                    <TableCell className={`hidden xl:table-cell py-2 ${getElementColor(persona.ice)}`}>{persona.ice}</TableCell>
                    <TableCell className={`hidden xl:table-cell py-2 ${getElementColor(persona.electric)}`}>{persona.electric}</TableCell>
                    <TableCell className={`hidden xl:table-cell py-2 ${getElementColor(persona.wind)}`}>{persona.wind}</TableCell>
                    <TableCell className={`hidden xl:table-cell py-2 ${getElementColor(persona.psychic)}`}>{persona.psychic}</TableCell>
                    <TableCell className={`hidden xl:table-cell py-2 ${getElementColor(persona.nuclear)}`}>{persona.nuclear}</TableCell>
                    <TableCell className={`hidden xl:table-cell py-2 ${getElementColor(persona.bless)}`}>{persona.bless}</TableCell>
                    <TableCell className={`hidden xl:table-cell py-2 py-2 ${getElementColor(persona.curse)}`}>{persona.curse}</TableCell>
                    <TableCell className="hidden 2xl:table-cell py-2">{persona.area || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
    </div>
  )
}
    