import type { PersonaData, PersonaMap } from './types';

/**
 * Optimized data utility with caching
 */

// Cache for processed data
let cachedPersonaList: PersonaData[] | null = null;
let cachedCustomPersonaList: PersonaData[] | null = null;
let cachedSkillList: any[] | null = null;
let lastVersion: string | null = null;

function isRoyal(): boolean {
  if (typeof window === 'undefined') return false;
  return (window as any).GLOBAL_IS_ROYAL === true;
}

function getCurrentVersion(): string {
  return isRoyal() ? 'royal' : 'vanilla';
}

function clearCache() {
  cachedPersonaList = null;
  cachedCustomPersonaList = null;
  cachedSkillList = null;
}

function getPersonaMap(): PersonaMap {
  if (typeof window === 'undefined') return {};
  const royal = isRoyal();
  return royal ? ((window as any).personaMapRoyal || {}) : ((window as any).personaMap || {});
}

function getSkillMap(): any {
  if (typeof window === 'undefined') return {};
  const royal = isRoyal();
  return royal ? ((window as any).skillMapRoyal || {}) : ((window as any).skillMap || {});
}

function getItemMap(): any {
  if (typeof window === 'undefined') return {};
  const royal = isRoyal();
  return royal ? ((window as any).itemMapRoyal || {}) : ((window as any).itemMap || {});
}

function getArcana2Combos(): any[] {
  if (typeof window === 'undefined') return [];
  const royal = isRoyal();
  return royal ? ((window as any).arcana2CombosRoyal || []) : ((window as any).arcana2Combos || []);
}

function getSpecialCombos(): any[] {
  if (typeof window === 'undefined') return [];
  const royal = isRoyal();
  return royal ? ((window as any).specialCombosRoyal || []) : ((window as any).specialCombos || []);
}

function getRareCombos(): any {
  if (typeof window === 'undefined') return {};
  const royal = isRoyal();
  return royal ? ((window as any).rareCombosRoyal || {}) : ((window as any).rareCombos || {});
}

/**
 * Recipe interface matching FusionCalculator
 */
export interface Recipe {
  sources: PersonaData[];
  result: PersonaData;
  cost?: number;
  isAllRare?: boolean;
}

function getInheritanceChart(): any {
  if (typeof window === 'undefined') return {};
  const royal = isRoyal();
  return royal ? ((window as any).inheritanceChartRoyal || {}) : ((window as any).inheritanceChart || {});
}

function addStatProperties(persona: PersonaData) : void {
    persona.strength = persona.stats[0];
    persona.magic = persona.stats[1];
    persona.endurance = persona.stats[2];
    persona.agility = persona.stats[3];
    persona.luck = persona.stats[4];
}

const elemsValue: {[key: string]: number} = {"wk":0, "-":1, "rs":2, "nu":3, "rp":4, "ab":5};
const properties = ['physical', 'gun', 'fire', 'ice', 'electric', 'wind', 'psychic', 'nuclear', 'bless', 'curse'];

function addElementProperties(persona: PersonaData) : void {
    for (let i = 0; i < properties.length; i++) {
        persona[properties[i]] = persona.elems[i];
        persona[properties[i] + 'Value'] = elemsValue[persona.elems[i]];
    }
}

export function isDlcPersonaOwned(dlcPersona: string): boolean {
    if (typeof window === 'undefined') return false;
    if (!localStorage["dlcPersona"]) return false;

    return JSON.parse(localStorage["dlcPersona"])[dlcPersona] === true;
}

/**
 * List of persona with DLC persona potentially removed based on user config
 */
export function getCustomPersonaList(): PersonaData[] {
    const currentVersion = getCurrentVersion();
    
    // Check if cache is valid
    if (cachedCustomPersonaList && lastVersion === currentVersion) {
        return cachedCustomPersonaList;
    }
    
    const personaMap = getPersonaMap();
    const arr: PersonaData[] = [];
    
    for (const key in personaMap) {
        if (!personaMap.hasOwnProperty(key)) continue;
        
        const personaBase = personaMap[key];
        if (personaBase.dlc && !isDlcPersonaOwned(key)) {
            continue;
        }
        
        const persona = {...personaBase, name: key};
        addStatProperties(persona);
        addElementProperties(persona);
        arr.push(persona);
    }
    
    cachedCustomPersonaList = arr;
    lastVersion = currentVersion;
    return arr;
}

export function getFullPersonaList(): PersonaData[] {
    const currentVersion = getCurrentVersion();
    
    // Check if cache is valid
    if (cachedPersonaList && lastVersion === currentVersion) {
        return cachedPersonaList;
    }
    
    const personaMap = getPersonaMap();
    const arr: PersonaData[] = [];
    
    for (const key in personaMap) {
        if (!personaMap.hasOwnProperty(key)) continue;
        
        const persona = {...personaMap[key], name: key};
        addStatProperties(persona);
        addElementProperties(persona);
        arr.push(persona);
    }
    
    cachedPersonaList = arr;
    lastVersion = currentVersion;
    return arr;
}

export function getSkillList(): any[] {
    const currentVersion = getCurrentVersion();
    
    // Check if cache is valid
    if (cachedSkillList && lastVersion === currentVersion) {
        return cachedSkillList;
    }
    
    const skillMap = getSkillMap();
    const arr: any[] = [];
    
    for (const key in skillMap) {
        if (!skillMap.hasOwnProperty(key)) continue;
        
        const skill = {...skillMap[key], name: key};
        skill.elemDisplay = capitalizeFirstLetter(skill.element);
        skill.costDisplay = getSkillCost(skill);
        skill.personaDisplay = getSkillPersonaList(skill);
        
        if (skill.talk) {
            skill.talkDisplay = createPersonaLink(skill.talk);
        }
        if (skill.fuse) {
            if (typeof skill.fuse === 'string') {
                skill.fuseDisplay = createPersonaLink(skill.fuse);
            } else {
                skill.fuseDisplay = skill.fuse.map((f: string) => createPersonaLink(f)).join(", ");
            }
        }
        arr.push(skill);
    }
    
    cachedSkillList = arr;
    lastVersion = currentVersion;
    return arr;
}

// Export clearCache so version context can call it
export { clearCache };

/**
 * Persona by arcana based on customPersonaList
 */
export function getCustomPersonaeByArcana(): {[arcana: string]: PersonaData[]} {
    const customPersonaList = getCustomPersonaList();
    let personaeByArcana_: {[arcana: string]: PersonaData[]} = {};
    for (let i = 0; i < customPersonaList.length; i++) {
        let persona = customPersonaList[i];
        if (!personaeByArcana_[persona.arcana]) {
            personaeByArcana_[persona.arcana] = [];
        }
        personaeByArcana_[persona.arcana].push(persona);
    }

    for (let key in personaeByArcana_) {
        personaeByArcana_[key].sort((a,b) => a.level - b.level);
    }

    // Make sure this is always there regardless of DLC setting
    if (!personaeByArcana_['World']) {
        personaeByArcana_['World'] = [];
    }

    return personaeByArcana_;
}

const getArcanaMap = () => {
    const arcana2Combos = getArcana2Combos();
    let map: {[key: string]: {[key: string]: string}} = {};
    for (let i = 0; i < arcana2Combos.length; i++) {
        let combo = arcana2Combos[i];
        if (!map[combo.source[0]]) map[combo.source[0]] = {};
        map[combo.source[0]][combo.source[1]] = combo.result;

        if (!map[combo.source[1]]) map[combo.source[1]] = {};
        map[combo.source[1]][combo.source[0]] = combo.result;
    }
    return map;
};

export const getResultArcana = (arcana1: string, arcana2: string) => {
    const arcanaMap = getArcanaMap();
    return arcanaMap[arcana1]?.[arcana2];
};

export function getSpecial2Combos() {
    const specialCombos = getSpecialCombos();
    let combos = [];
    for (let i = 0; i < specialCombos.length; i++) {
        if (specialCombos[i].sources.length == 2) {
            combos.push(specialCombos[i]);
        }
    }
    return combos;
}

export function getElems(personaName: string) {
    const personaMap = getPersonaMap();
    let elems = [...personaMap[personaName].elems];
    for (let i = 0; i < elems.length; i++) {
        if (elems[i] == 'wk') elems[i] = 'Weak';
        else if (elems[i] == 'rs') elems[i] = 'Resist';
        else if (elems[i] == 'ab') elems[i] = 'Absorb';
        else if (elems[i] == 'rp') elems[i] = 'Repel';
        else if (elems[i] == 'nu') elems[i] = 'Null';
    }
    return elems;
}

export function getSkills(personaName: string) {
    const personaMap = getPersonaMap();
    const skillMap = getSkillMap();
    let skills = personaMap[personaName].skills;
    let sorted = [];
    for (let name in skills) {
        if (skills.hasOwnProperty(name)) {
            sorted.push([name, skills[name]]);
        }
    }

    sorted.sort(function(a, b) {
        return a[1] - b[1];
    });

    let resSkills = [];
    for (let i = 0; i < sorted.length; i++) {
        let skillData = skillMap[sorted[i][0]];
        resSkills.push({
            name: sorted[i][0],
            level: sorted[i][1],
            description: skillData.effect,
            unique: skillData.unique,
            elem: capitalizeFirstLetter(skillData.element),
            cost: getSkillCost(skillData)
        })
    }

    if (personaMap[personaName].trait) {
        let traitData = skillMap[personaMap[personaName].trait];
        resSkills.unshift({
            name: personaMap[personaName].trait,
            level: 0,
            description: traitData.effect,
            unique: traitData.unique,
            elem: "Trait",
            cost: "-"
        });
    }

    return resSkills;
}

export function getSkillCardInfo(skillCard: string) {
    const skillMap = getSkillMap();
    let skillData = [];
    let skill = skillMap[skillCard];
    skillData.push({
        name: skillCard,
        description: skill.effect,
        elem: capitalizeFirstLetter(skill.element),
        cost: getSkillCost(skill)
    })

    return skillData;
}

export function getItem(itemName: string) {
    const itemMap = getItemMap();
    let itemData = [];
    let item = itemMap[itemName];
    
    // Check if item exists in the map
    if (!item) {
        return null;
    }
    
    itemData.push({
        name: itemName,
        type: item.type,
        description: item.description
    })

    return itemData;
}

export function getInheritance(inheritanceType: string) {
    const inheritanceChart = getInheritanceChart();
    return inheritanceChart[inheritanceType];
}

function getSkillPersonaList(skill: any): string {
    let arr = [];
    for (let key in skill.personas) {
        if (skill.personas.hasOwnProperty(key)) {
            let level = skill.personas[key];
            let keyHref = createPersonaLink(key);
            arr.push(keyHref + (level !== 0? " (" + level + ")" : ""));
        }
    }
    let str = arr.join(", ");
    if (skill.note) {
        str = (str? (str + ". ") : "") + skill.note;
    }
    return str;
}

export function createPersonaLink(personaName: string): string {
    return `<a href='/persona/${personaName}'>${personaName}</a>`;
}

export function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function getSkillCost(skill: any) {
    if (skill.element !== 'passive' && skill.element !== 'trait') {
        if (skill.cost < 100) {
            return String(skill.cost) + '% HP'
        }
        else {
            return String(skill.cost / 100) + ' SP';
        }
    }
    else {
        return "-"
    }
}

export function getPersonaByName(name: string): PersonaData | null {
    const personaMap = getPersonaMap();
    if (!personaMap[name]) return null;
    
    let persona = {...personaMap[name]};
    persona.name = name;
    addStatProperties(persona);
    addElementProperties(persona);
    return persona;
}

/**
 * Helper function to get rare personae list
 */
function getRarePersonae(): string[] {
    if (typeof window === 'undefined') return [];
    const royal = isRoyal();
    return royal ? ((window as any).rarePersonaeRoyal || []) : ((window as any).rarePersonae || []);
}

/**
 * Get all fusion recipes that can create the given persona
 */
export function getRecipesToCreate(persona: PersonaData): Recipe[] {
    try {
        if (typeof window === 'undefined') return [];
        
        const FusionCalculator = require('./FusionCalculator').default;
        
        // Build personaeByArcana from customPersonaList to respect DLC filters
        const personaMap = getPersonaMap();
        const customPersonaList = getCustomPersonaList();
        const personaeByArcana: {[arcana: string]: PersonaData[]} = {};
        
        customPersonaList.forEach(p => {
            if (!personaeByArcana[p.arcana]) {
                personaeByArcana[p.arcana] = [];
            }
            personaeByArcana[p.arcana].push(p);
        });
        
        const calculator = new FusionCalculator(
            personaeByArcana,
            customPersonaList,
            personaMap,
            getSpecial2Combos(),
            getSpecialCombos(),
            getArcana2Combos(),
            getRareCombos(),
            getRarePersonae(),
            getResultArcana
        );
        
        return calculator.getRecipes(persona);
    } catch (error) {
        console.error('Error in getRecipesToCreate:', error);
        return [];
    }
}

/**
 * Get all fusion recipes where this persona is used as an ingredient
 */
export function getRecipesUsing(persona: PersonaData): Recipe[] {
    try {
        if (typeof window === 'undefined') return [];
        
        const FusionCalculator = require('./FusionCalculator').default;
        
        // Build personaeByArcana from customPersonaList to respect DLC filters
        const personaMap = getPersonaMap();
        const customPersonaList = getCustomPersonaList();
        const personaeByArcana: {[arcana: string]: PersonaData[]} = {};
        
        customPersonaList.forEach(p => {
            if (!personaeByArcana[p.arcana]) {
                personaeByArcana[p.arcana] = [];
            }
            personaeByArcana[p.arcana].push(p);
        });
        
        const calculator = new FusionCalculator(
            personaeByArcana,
            customPersonaList,
            personaMap,
            getSpecial2Combos(),
            getSpecialCombos(),
            getArcana2Combos(),
            getRareCombos(),
            getRarePersonae(),
            getResultArcana
        );
        
        return calculator.getAllResultingRecipesFrom(persona);
    } catch (error) {
        console.error('Error in getRecipesUsing:', error);
        return [];
    }
}

export { getPersonaMap as personaMap, getSkillMap as skillMap, getItemMap as itemMap, getRareCombos as rareCombos };
