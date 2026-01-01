'use client'

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSkillList } from '@/lib/DataUtil.client'
import { Navigation } from '@/components/navigation'

export default function SkillListPage() {
  const [filterStr, setFilterStr] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortReverse, setSortReverse] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const skillList = useMemo(() => {
    try {
      return getSkillList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load skill data')
      return []
    }
  }, [])

  const filteredAndSorted = useMemo(() => {
    let filtered = skillList.filter((skill) => {
      if (!filterStr) return true
      const search = filterStr.toLowerCase()
      return skill.name?.toLowerCase().includes(search) ||
             skill.element.toLowerCase().includes(search) ||
             skill.effect.toLowerCase().includes(search)
    })

    filtered.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortReverse ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      }
      return sortReverse ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number)
    })

    return filtered
  }, [skillList, filterStr, sortBy, sortReverse])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortReverse(!sortReverse)
    } else {
      setSortBy(field)
      setSortReverse(false)
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortReverse ? ' ↓' : ' ↑'
  }

  const getElementColor = (element: string) => {
    if (!element) return ''
    switch(element.toLowerCase()) {
      case 'physical': return 'text-orange-600 font-semibold'
      case 'gun': return 'text-slate-600 font-semibold'
      case 'fire': return 'text-red-600 font-semibold'
      case 'ice': return 'text-cyan-600 font-semibold'
      case 'electric': return 'text-yellow-600 font-semibold'
      case 'wind': return 'text-green-600 font-semibold'
      case 'psychic': return 'text-pink-600 font-semibold'
      case 'nuclear': return 'text-emerald-600 font-semibold'
      case 'bless': return 'text-amber-500 font-semibold'
      case 'curse': return 'text-purple-600 font-semibold'
      case 'almighty': return 'text-indigo-600 font-semibold'
      case 'ailment': return 'text-violet-600 font-semibold'
      case 'support': return 'text-blue-600 font-semibold'
      case 'healing': return 'text-teal-600 font-semibold'
      case 'passive': return 'text-gray-600 font-semibold'
      case 'trait': return 'text-fuchsia-600 font-semibold'
      default: return 'text-gray-700 font-semibold'
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-md text-red-900">
              <h3 className="font-semibold mb-2">Error Loading Skills</h3>
              <p>{error}</p>
              <p className="text-sm mt-1">Please make sure the skill data files are loaded correctly.</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Filter:</label>
              <Input
                type="text"
                value={filterStr}
                onChange={(e) => setFilterStr(e.target.value)}
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                placeholder="Search skills..."
                className="max-w-sm"
              />
              <Button variant="outline" size="sm" onClick={() => setFilterStr('')}>
                Clear
              </Button>
            </div>
            <div className="ml-auto">
              <Navigation />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    Name{renderSortIcon('name')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('element')}
                  >
                    Type{renderSortIcon('element')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('cost')}
                  >
                    Cost{renderSortIcon('cost')}
                  </TableHead>
                  <TableHead>Effect</TableHead>
                  <TableHead>Personas</TableHead>
                  <TableHead>Skill Card Negotiation</TableHead>
                  <TableHead>Skill Card Fusion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No skills found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSorted.map((skill) => (
                    <TableRow key={skill.name}>
                      <TableCell className="font-medium">
                        {skill.name}
                        {skill.unique && <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800 ml-2">Unique</span>}
                      </TableCell>
                      <TableCell>{skill.elemDisplay}</TableCell>
                      <TableCell>{skill.costDisplay}</TableCell>
                      <TableCell className="max-w-md">{skill.effect}</TableCell>
                      <TableCell className="[&_a]:text-blue-600 [&_a:hover]:underline" dangerouslySetInnerHTML={{ __html: skill.personaDisplay || '' }}></TableCell>
                      <TableCell className="[&_a]:text-blue-600 [&_a:hover]:underline" dangerouslySetInnerHTML={{ __html: skill.talkDisplay || '-' }}></TableCell>
                      <TableCell className="[&_a]:text-blue-600 [&_a:hover]:underline" dangerouslySetInnerHTML={{ __html: skill.fuseDisplay || '-' }}></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
