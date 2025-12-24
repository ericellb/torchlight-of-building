import type { Tree } from "../talent";
import type { CoreTalents } from "./core_talents";

export interface BaseCoreTalent {
  name: string;
  tree: Tree;
  affix: string;
}

export type CoreTalentName = (typeof CoreTalents)[number]["name"];
