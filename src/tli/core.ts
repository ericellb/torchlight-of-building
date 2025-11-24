import { Mod } from "./mod";

export interface Affix {
    mods: Mod[]
    maxDivinity?: number
    src?: string
}