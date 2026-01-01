// Type definitions extracted from PersonaData.ts

export interface PersonaMap {
    [index: string]: PersonaData;
}

export interface PersonaData {
    name?: string;
    arcana: string;
    level: number;
    stats: number[];
    elems: string[];
    skills: {
        [index: string]: number;
    }
    personality?: string;
    special?: boolean;
    max?: boolean;
    dlc?: boolean;
    note?: string;
    rare?: boolean;
    inherits?: string;
    item?: string;
    itemr?: string;
    skillCard?: boolean;
    trait?: string;
    strength?: number;
    magic?: number;
    endurance?: number;
    agility?: number;
    luck?: number;
    physical?: string;
    gun?: string;
    fire?: string;
    ice?: string;
    electric?: string;
    wind?: string;
    psychic?: string;
    nuclear?: string;
    bless?: string;
    curse?: string;
    physicalValue?: number;
    gunValue?: number;
    fireValue?: number;
    iceValue?: number;
    electricValue?: number;
    windValue?: number;
    psychicValue?: number;
    nuclearValue?: number;
    blessValue?: number;
    curseValue?: number;
    area?: string;
    floor?: string;
}

// Import the actual data from the compiled JavaScript
declare const personaMap: PersonaMap;

export { personaMap };
