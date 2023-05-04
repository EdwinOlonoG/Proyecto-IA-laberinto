export interface fragment{
    terrain: number;
    row: number;
    col: string;
    visited: boolean;
    initial: boolean;
    isPortal: boolean;
    isKey: boolean;
    isTemple: boolean;
    isHuman: boolean;
    isOctopus: boolean;
    needsDesicion: boolean;
    cost: number;
}