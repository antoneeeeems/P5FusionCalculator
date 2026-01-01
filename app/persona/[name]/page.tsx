'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  getPersonaByName, 
  getSkills, 
  getElems, 
  getItem, 
  getInheritance,
  getRecipesToCreate,
  getRecipesUsing,
  type Recipe
} from '@/lib/DataUtil.client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Navigation } from '@/components/navigation'

export default function PersonaPage({ params }: { params: Promise<{ name: string }> | { name: string } }) {
  // Handle both Promise and plain object for params
  const resolvedParams = params instanceof Promise ? use(params) : params
  const { name: personaName } = resolvedParams
  const decodedName = decodeURIComponent(personaName)
  
  let persona, skills, elems, itemData, itemrData, inheritance
  let error: string | null = null
  
  try {
    persona = getPersonaByName(decodedName)
    if (persona) {
      skills = getSkills(decodedName)
      elems = getElems(decodedName)
      itemData = persona.item ? getItem(persona.item) : null
      itemrData = persona.itemr ? getItem(persona.itemr) : null
      inheritance = persona.inherits ? getInheritance(persona.inherits) : null
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load persona data'
  }
  
  // State for fusion recipe filters and pagination
  const [recipeToCreateFilter, setRecipeToCreateFilter] = useState('')
  const [recipeToCreatePage, setRecipeToCreatePage] = useState(1)
  const [recipeUsingFilter, setRecipeUsingFilter] = useState('')
  const [recipeUsingPage, setRecipeUsingPage] = useState(1)
  const recipesPerPage = 10

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error Loading Persona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-red-600">
            <p>{error}</p>
            <p>Please make sure the persona data files are loaded correctly.</p>
            <Link href="/list">
              <Button>Back to List</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!persona) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Persona Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/list">
              <Button>Back to List</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const elemNames = ['Physical', 'Gun', 'Fire', 'Ice', 'Electric', 'Wind', 'Psychic', 'Nuclear', 'Bless', 'Curse']
  
  const getElementColor = (value: string) => {
    if (!value || value === '-') return ''
    switch(value.toLowerCase()) {
      case 'weak': return 'text-red-600 font-semibold'
      case 'resist': return 'text-blue-600 font-semibold'
      case 'null': return 'text-gray-500 font-semibold'
      case 'repel': return 'text-yellow-600 font-semibold'
      case 'absorb': return 'text-green-600 font-semibold'
      default: return ''
    }
  }
  
  // Get additional data
  const item = itemData?.[0]
  const itemr = itemrData?.[0]
  
  // Get fusion recipes (only if not rare)
  let recipesToCreate: Recipe[] = []
  let recipesUsing: Recipe[] = []
  
  if (!persona.rare) {
    try {
      recipesToCreate = getRecipesToCreate(persona)
      recipesUsing = getRecipesUsing(persona)
      console.log(`Fusion recipes for ${decodedName}:`, {
        recipesToCreate: recipesToCreate.length,
        recipesUsing: recipesUsing.length
      })
    } catch (error) {
      console.error('Error loading fusion recipes:', error)
    }
  }
  
  // Filter and paginate recipes to create
  const filteredRecipesToCreate = useMemo(() => {
    if (!recipeToCreateFilter) return recipesToCreate
    const filter = recipeToCreateFilter.toLowerCase()
    return recipesToCreate.filter(recipe => 
      recipe.sources[0]?.name.toLowerCase().includes(filter) ||
      recipe.sources[1]?.name.toLowerCase().includes(filter)
    )
  }, [recipesToCreate, recipeToCreateFilter])
  
  const totalPagesToCreate = Math.ceil(filteredRecipesToCreate.length / recipesPerPage)
  const paginatedRecipesToCreate = filteredRecipesToCreate.slice(
    (recipeToCreatePage - 1) * recipesPerPage,
    recipeToCreatePage * recipesPerPage
  )
  
  // Filter and paginate recipes using this persona
  const filteredRecipesUsing = useMemo(() => {
    if (!recipeUsingFilter) return recipesUsing
    const filter = recipeUsingFilter.toLowerCase()
    return recipesUsing.filter(recipe => {
      const otherIngredient = recipe.sources.find(s => s.name !== decodedName)
      return otherIngredient?.name.toLowerCase().includes(filter) ||
             recipe.result.name.toLowerCase().includes(filter)
    })
  }, [recipesUsing, recipeUsingFilter, decodedName])
  
  const totalPagesUsing = Math.ceil(filteredRecipesUsing.length / recipesPerPage)
  const paginatedRecipesUsing = filteredRecipesUsing.slice(
    (recipeUsingPage - 1) * recipesPerPage,
    recipeUsingPage * recipesPerPage
  )

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl px-4">
      <div className="flex items-center justify-between">
        <Link href="/list">
          <Button variant="outline" size="sm">Back to List</Button>
        </Link>
        <Navigation />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{decodedName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Arcana:</strong> {persona.arcana}</p>
          <p><strong>Level:</strong> {persona.level}</p>
          {persona.inherits && <p><strong>Inherits:</strong> {persona.inherits}</p>}
          {persona.rare && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 mr-2">
              Rare
            </span>
          )}
          {persona.special && (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 mr-2">
              Special Fusion
            </span>
          )}
          {persona.dlc && (
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
              DLC
            </span>
          )}
        </CardContent>
      </Card>

      {persona.area && (
        <Card>
          <CardHeader>
            <CardTitle>Mementos Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{persona.area}</p>
          </CardContent>
        </Card>
      )}

      {(item || itemr) && (
        <Card>
          <CardHeader>
            <CardTitle>Itemization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {item && (
              <p><strong>Item:</strong> {item.name} - {item.description}</p>
            )}
            {itemr && (
              <p><strong>Item (Royal):</strong> {itemr.name} - {itemr.description}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Strength</TableHead>
                <TableHead>Magic</TableHead>
                <TableHead>Endurance</TableHead>
                <TableHead>Agility</TableHead>
                <TableHead>Luck</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{persona.stats[0]}</TableCell>
                <TableCell className="font-medium">{persona.stats[1]}</TableCell>
                <TableCell className="font-medium">{persona.stats[2]}</TableCell>
                <TableCell className="font-medium">{persona.stats[3]}</TableCell>
                <TableCell className="font-medium">{persona.stats[4]}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Elementals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {elemNames.map(name => (
                  <TableHead key={name}>{name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {elems.map((elem, idx) => (
                  <TableCell key={idx} className={getElementColor(elem)}>{elem}</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {inheritance && (
        <Card>
          <CardHeader>
            <CardTitle>Inheritance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3"><strong>Type:</strong> {persona.inherits}</p>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(inheritance).map((elem) => (
                    <TableHead key={elem}>{elem}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {Object.values(inheritance).map((value, idx) => (
                    <TableCell key={idx}>{value ? '○' : '-'}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Effect</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill, idx) => (
                <TableRow key={idx}>
                  <TableCell>{skill.level === 0 ? '-' : skill.level}</TableCell>
                  <TableCell>{skill.elem}</TableCell>
                  <TableCell className="font-medium">
                    {skill.name}
                    {skill.unique && <span className="text-red-600 ml-1">*</span>}
                  </TableCell>
                  <TableCell>{skill.description}</TableCell>
                  <TableCell>{skill.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!persona.rare && recipesToCreate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fusion to this persona ({filteredRecipesToCreate.length} Recipes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Filter..."
                value={recipeToCreateFilter}
                onChange={(e) => {
                  setRecipeToCreateFilter(e.target.value)
                  setRecipeToCreatePage(1)
                }}
                className="max-w-xs"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setRecipeToCreateFilter('')
                  setRecipeToCreatePage(1)
                }}
              >
                Clear
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  {paginatedRecipesToCreate.map((recipe, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm">{(recipeToCreatePage - 1) * recipesPerPage + idx + 1}</TableCell>
                      <TableCell className="text-sm">¥{recipe.cost?.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">
                        <Link href={`/persona/${recipe.sources[0].name}`} className="text-blue-600 hover:underline">
                          {recipe.sources[0].name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        {recipe.sources[1] ? (
                          <Link href={`/persona/${recipe.sources[1].name}`} className="text-blue-600 hover:underline">
                            {recipe.sources[1].name}
                          </Link>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPagesToCreate > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecipeToCreatePage(p => Math.max(1, p - 1))}
                  disabled={recipeToCreatePage === 1}
                >
                  ◀ Prev
                </Button>
                <span className="text-sm">
                  {recipeToCreatePage} / {totalPagesToCreate}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecipeToCreatePage(p => Math.min(totalPagesToCreate, p + 1))}
                  disabled={recipeToCreatePage === totalPagesToCreate}
                >
                  Next ▶
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!persona.rare && recipesUsing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fusion from this persona ({filteredRecipesUsing.length} Recipes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Filter..."
                value={recipeUsingFilter}
                onChange={(e) => {
                  setRecipeUsingFilter(e.target.value)
                  setRecipeUsingPage(1)
                }}
                className="max-w-xs"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setRecipeUsingFilter('')
                  setRecipeUsingPage(1)
                }}
              >
                Clear
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  {paginatedRecipesUsing.map((recipe, idx) => {
                    const otherIngredient = recipe.sources.find(s => s.name !== decodedName) || recipe.sources[0]
                    return (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{(recipeUsingPage - 1) * recipesPerPage + idx + 1}</TableCell>
                        <TableCell className="text-sm">¥{recipe.cost?.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">
                          <Link href={`/persona/${otherIngredient.name}`} className="text-blue-600 hover:underline">
                            {otherIngredient.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          <Link href={`/persona/${recipe.result.name}`} className="text-blue-600 hover:underline">
                            {recipe.result.name}
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            
            {totalPagesUsing > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecipeUsingPage(p => Math.max(1, p - 1))}
                  disabled={recipeUsingPage === 1}
                >
                  ◀ Prev
                </Button>
                <span className="text-sm">
                  {recipeUsingPage} / {totalPagesUsing}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecipeUsingPage(p => Math.min(totalPagesUsing, p + 1))}
                  disabled={recipeUsingPage === totalPagesUsing}
                >
                  Next ▶
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {persona.rare && (
        <Card>
          <CardHeader>
            <CardTitle>Fusion Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This persona cannot be fused and must be obtained through other means.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
