import type { OrgUnit } from './orgData';

export function unitPath(units: OrgUnit[], id: string): OrgUnit[] {
  const byId = new Map(units.map(unit => [unit.id, unit]));
  const path: OrgUnit[] = [];
  const seen = new Set<string>();
  let unit = byId.get(id);
  while (unit && !seen.has(unit.id)) {
    seen.add(unit.id);
    path.unshift(unit);
    unit = unit.parentId ? byId.get(unit.parentId) : undefined;
  }
  return path;
}

export function buildingDepth(units: OrgUnit[]): number {
  return Math.max(0, ...units.map(unit => unitPath(units, unit.id).length - 1));
}

export function branchFloors(units: OrgUnit[], branchId: string): number[] {
  const path = unitPath(units, branchId);
  const floors = path.map((_, depth) => depth);
  if (units.some(unit => unit.parentId === branchId)) floors.push(path.length);
  return floors;
}

export function floorRooms(units: OrgUnit[], branchId: string, depth: number): OrgUnit[] {
  const path = unitPath(units, branchId);
  if (depth === 0) return path.slice(0, 1);
  const parent = path[depth - 1];
  return parent ? units.filter(unit => unit.parentId === parent.id) : [];
}

export function floorParents(units:OrgUnit[],branchId:string,depth:number):OrgUnit[] {
  const root=unitPath(units,branchId)[0];
  if(!root||depth<=0)return [];
  const parents=new Set(units.map(unit=>unit.parentId));
  return units.filter(unit=>{
    if(!parents.has(unit.id))return false;
    const path=unitPath(units,unit.id);
    return path.length===depth&&path[0]?.id===root.id;
  });
}

// A floor needs a real parent; never merge unrelated branches into one hallway.
export function floorDestination(units:OrgUnit[],branchId:string,depth:number,parentId?:string):string|null {
  if(!Number.isInteger(depth)||depth<0)return null;
  const path=unitPath(units,branchId);
  if(!path.length)return null;
  if(depth===0)return branchId;
  const parents=floorParents(units,branchId,depth);
  if(parentId)return parents.some(parent=>parent.id===parentId)?parentId:null;
  if(branchFloors(units,branchId).includes(depth)&&floorRooms(units,branchId,depth).length)return branchId;
  return parents.length===1?parents[0].id:null;
}

export function floorName(depth: number, maxDepth: number): string {
  return `Tầng ${maxDepth - depth + 1} · Cấp ${depth + 1}`;
}

export function roomPosition(index: number) {
  return { side: index % 2 === 0 ? 1 : -1, z: -Math.floor(index / 2) * 5.2 };
}

export const FLOOR_HEIGHT = 7;
export const floorY = (depth: number, maxDepth: number) => (maxDepth - depth) * FLOOR_HEIGHT;
