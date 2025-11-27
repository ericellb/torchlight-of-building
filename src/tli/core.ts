import { Mod } from "./mod";
import { TreeName } from "./talent_tree_types";
import { EquipmentType } from "./gear_data_types";

export interface Affix {
  mods: Mod[];
  maxDivinity?: number;
  src?: string;
  raw?: string;
}

export interface DmgRange {
  // inclusive on both ends
  min: number;
  max: number;
}

export interface Configuration {
  fervor: {
    enabled: boolean;
    points: number;
  };
}

export interface DivinitySlate {
  affixes: Affix[];
}

export interface Gear {
  gearType:
    | "helmet"
    | "chest"
    | "neck"
    | "gloves"
    | "belt"
    | "boots"
    | "ring"
    | "sword"
    | "shield";
  affixes: Affix[];
}

export interface TalentPage {
  affixes: Affix[];
}

export interface DivinityPage {
  slates: DivinitySlate[];
}

export interface GearPage {
  helmet?: Gear;
  chest?: Gear;
  neck?: Gear;
  gloves?: Gear;
  belt?: Gear;
  boots?: Gear;
  leftRing?: Gear;
  rightRing?: Gear;
  mainHand?: Gear;
  offHand?: Gear;
}

export interface Loadout {
  equipmentPage: GearPage;
  talentPage: TalentPage;
  divinityPage: DivinityPage;
  customConfiguration: Affix[];
}

export interface RawAllocatedTalentNode {
  x: number;
  y: number;
  points: number;
}

export interface RawTalentTree {
  name: string;
  allocatedNodes: RawAllocatedTalentNode[];
}

export interface RawTalentPage {
  tree1?: RawTalentTree;
  tree2?: RawTalentTree;
  tree3?: RawTalentTree;
  tree4?: RawTalentTree;
}

export interface TalentNodeData {
  nodeType: "micro" | "medium" | "legendary";
  rawAffix: string;
  position: { x: number; y: number };
  prerequisite?: { x: number; y: number };
  maxPoints: number;
  iconName: string;
}

export interface TalentTreeData {
  name: TreeName;
  nodes: TalentNodeData[];
}

export interface RawGear {
  id: string;
  gearType:
    | "helmet"
    | "chest"
    | "neck"
    | "gloves"
    | "belt"
    | "boots"
    | "ring"
    | "sword"
    | "shield";
  affixes: string[];
  equipmentType?: EquipmentType;
}

export interface RawGearPage {
  helmet?: RawGear;
  chest?: RawGear;
  neck?: RawGear;
  gloves?: RawGear;
  belt?: RawGear;
  boots?: RawGear;
  leftRing?: RawGear;
  rightRing?: RawGear;
  mainHand?: RawGear;
  offHand?: RawGear;
}

export interface RawSupportSkills {
  supportSkill1?: string;
  supportSkill2?: string;
  supportSkill3?: string;
  supportSkill4?: string;
  supportSkill5?: string;
}

export interface RawSkillWithSupports {
  skillName?: string;
  enabled: boolean;
  supportSkills: RawSupportSkills;
}

export interface RawSkillPage {
  activeSkill1: RawSkillWithSupports;
  activeSkill2: RawSkillWithSupports;
  activeSkill3: RawSkillWithSupports;
  activeSkill4: RawSkillWithSupports;
  passiveSkill1: RawSkillWithSupports;
  passiveSkill2: RawSkillWithSupports;
  passiveSkill3: RawSkillWithSupports;
  passiveSkill4: RawSkillWithSupports;
}

export interface RawLoadout {
  equipmentPage: RawGearPage;
  talentPage: RawTalentPage;
  skillPage: RawSkillPage;
  itemsList: RawGear[];
}
