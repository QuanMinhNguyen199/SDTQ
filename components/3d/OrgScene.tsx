'use client';
import { useOrgStore } from '../../store/useOrgStore';
import type { OrgUnit } from '../../data/orgData';
import OrganizationScene from '../../src/scene/OrgScene';
import ExploreScene from './ExploreScene';

export interface OrgSceneProps {
  units:Array<OrgUnit&{depth:number}>; allUnits:OrgUnit[];
  positions:Map<string,{x:number;z:number;busZ?:number;trunkX?:number|null}>;
  matches:(unit:OrgUnit)=>boolean; filtering:boolean;
  insets:{left:number;right:number;top:number;bottom:number};
}
export default function OrgScene(props:OrgSceneProps) {
  const mode=useOrgStore(s=>s.experienceMode);
  return mode==='explore'?<ExploreScene/>:<OrganizationScene {...props}/>;
}
