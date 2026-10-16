import { roomPosition } from './explore';

export interface FloorPoint { x:number; z:number }

// World units per second. Tune this value to change Explore walking speed.
export const WALK_SPEED = 4;
export const ROOM_TRIGGER_ENTER_X = 4.1;
export const ROOM_TRIGGER_EXIT_X = 3.5;
export const ELEVATOR_TRIGGER_Z = 8.6;

// The corridor and each doorway form one connected walkable area.
export function canWalkAt(point:FloorPoint, roomCount:number):boolean {
  const length=Math.max(20,Math.ceil(roomCount/2)*5.2+12);
  if(Math.abs(point.x)<=4.65&&point.z>=8-length+.4&&point.z<=9.65)return true;
  if(Math.abs(point.x)<=1.65&&point.z>=9.4&&point.z<=12.45)return true;
  for(let index=0;index<roomCount;index++){
    const room=roomPosition(index),x=point.x*room.side,z=Math.abs(point.z-room.z);
    if(x>=4.5&&x<=5.45&&z<=.95)return true;
    if(x>=5.35&&x<=11.65&&z<=1.65){
      // Leave space for the desk instead of walking through it.
      if(x>=8.78&&x<=10.42&&z<1.48)return false;
      return true;
    }
  }
  return false;
}

export function moveOnFloor(from:FloorPoint,delta:FloorPoint,roomCount:number):FloorPoint {
  const result={...from};
  const steps=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.08));
  for(let step=0;step<steps;step++){
    const next={x:result.x+delta.x/steps,z:result.z+delta.z/steps};
    if(canWalkAt(next,roomCount)){Object.assign(result,next);continue;}
    const slideX={x:next.x,z:result.z};
    if(canWalkAt(slideX,roomCount))result.x=slideX.x;
    const slideZ={x:result.x,z:next.z};
    if(canWalkAt(slideZ,roomCount))result.z=slideZ.z;
  }
  return result;
}

export function roomAt(point:FloorPoint,roomCount:number,previousIndex:number|null=null):number|null {
  if(previousIndex!==null&&previousIndex>=0&&previousIndex<roomCount){
    const previous=roomPosition(previousIndex);
    if(point.x*previous.side>ROOM_TRIGGER_EXIT_X&&Math.abs(point.z-previous.z)<1.8)return previousIndex;
  }
  for(let index=0;index<roomCount;index++){
    const room=roomPosition(index);
    if(point.x*room.side>ROOM_TRIGGER_ENTER_X&&Math.abs(point.z-room.z)<1.15)return index;
  }
  return null;
}

export function nearElevator(point:FloorPoint):boolean {
  return Math.abs(point.x)<1.85&&point.z>ELEVATOR_TRIGGER_Z;
}
