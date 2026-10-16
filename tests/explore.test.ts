import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleUnits } from '../data/orgData.ts';
import { branchFloors, buildingDepth, floorDestination, floorRooms, floorY, unitPath } from '../data/explore.ts';
import { useOrgStore } from '../store/useOrgStore.ts';

beforeEach(()=>useOrgStore.setState(useOrgStore.getInitialState(),true));
function finish() {const s=useOrgStore.getState();s.exploreFinish(s.explorePhase,s.exploreTransition);}
function enter() {const s=useOrgStore.getState();s.replaceUnits(sampleUnits,'import');s.setExperienceMode('explore');return useOrgStore.getState();}

test('floors preserve organizational depth and root is physically highest',()=>{
  assert.equal(buildingDepth(sampleUnits),3);
  assert.deepEqual(unitPath(sampleUnits,'demo-talent').map(u=>u.id),['demo-root','demo-people','demo-recruit','demo-talent']);
  assert.ok(floorY(0,3)>floorY(1,3));
  assert.deepEqual(floorRooms(sampleUnits,'demo-people',2).map(u=>u.id),['demo-recruit','demo-learning']);
  assert.ok(floorRooms(sampleUnits,'demo-people',2).every(u=>u.parentId==='demo-people'));
});
test('elevator only permits ancestors and the next layer of this branch',()=>{
  const s=enter();
  assert.deepEqual(branchFloors(sampleUnits,'demo-root'),[0,1]);
  s.exploreElevator();s.exploreChooseFloor(1);
  assert.equal(useOrgStore.getState().explorePhase,'boarding');
  finish();assert.equal(useOrgStore.getState().explorePhase,'building');
  s.exploreChooseFloor(2);assert.equal(useOrgStore.getState().explorePhase,'building');
  s.exploreChooseFloor(1);assert.equal(useOrgStore.getState().explorePhase,'travelling');
  assert.equal(useOrgStore.getState().exploreDepth,0);
  finish();assert.equal(useOrgStore.getState().exploreDepth,1);assert.equal(useOrgStore.getState().explorePhase,'opening');
  finish();assert.equal(useOrgStore.getState().explorePhase,'hall');assert.equal(useOrgStore.getState().exploreRoomId,null);
});
test('entering a room changes branch, search can jump to a real unit, leaf has no phantom lower floor',()=>{
  const s=enter();s.exploreLocate('demo-tech');
  assert.equal(useOrgStore.getState().exploreDepth,1);
  assert.deepEqual(floorRooms(sampleUnits,'demo-tech',2).map(u=>u.id),['demo-product','demo-platform']);
  s.exploreLocate('demo-engineer');
  assert.equal(useOrgStore.getState().exploreDepth,3);
  assert.deepEqual(branchFloors(sampleUnits,'demo-engineer'),[0,1,2,3]);
  s.exploreRoot();assert.equal(useOrgStore.getState().exploreRoomId,'demo-root');
});
test('cancel elevator and stale transition callbacks cannot move the user',()=>{
  const s=enter();s.exploreElevator();const old=useOrgStore.getState().exploreTransition;
  s.exploreCancelElevator();s.exploreFinish('boarding',old);
  assert.equal(useOrgStore.getState().explorePhase,'opening');
  finish();assert.equal(useOrgStore.getState().exploreDepth,0);
  s.exploreElevator();finish();s.setExperienceMode('organization');
  finish();assert.equal(useOrgStore.getState().experienceMode,'organization');
});
test('exiting restores the working view, filters and selected unit without mutating data',()=>{
  useOrgStore.setState({view:'2d',searchQuery:'cán bộ',expanded:new Set(['custom']),typeFilter:new Set(['Vụ'])});
  const before=useOrgStore.getState();before.setExperienceMode('explore');
  before.exploreLocate(before.units.at(-1)!.id);before.setExperienceMode('organization');
  const after=useOrgStore.getState();
  assert.equal(after.view,'2d');assert.equal(after.activeDeptId,before.activeDeptId);
  assert.equal(after.searchQuery,'cán bộ');assert.deepEqual(after.typeFilter,before.typeFilter);assert.deepEqual(after.expanded,before.expanded);
  assert.equal(after.units,before.units);assert.equal(after.dirty,false);
});
test('genuine context loss restores organization 2D and invalidates transitions',()=>{
  const s=enter();s.exploreElevator();s.failWebGL();finish();
  assert.equal(useOrgStore.getState().experienceMode,'organization');assert.equal(useOrgStore.getState().view,'2d');
  s.setView('3d');assert.equal(useOrgStore.getState().webglFailed,false);
});

test('walking through a door preserves camera transition and opens the correct profile',()=>{
  const s=enter();s.exploreLocate('demo-people');finish();
  assert.equal(useOrgStore.getState().detailOpen,true);
  const token=useOrgStore.getState().exploreTransition;
  s.exploreWalkRoom(null);
  assert.equal(useOrgStore.getState().explorePhase,'hall');
  assert.equal(useOrgStore.getState().detailOpen,false);
  s.exploreWalkRoom('demo-finance');
  assert.equal(useOrgStore.getState().activeDeptId,'demo-finance');
  assert.equal(useOrgStore.getState().detailOpen,true);
  assert.equal(useOrgStore.getState().exploreTransition,token);
  s.exploreWalkRoom('demo-talent');
  assert.equal(useOrgStore.getState().activeDeptId,'demo-finance');
});

test('a lower floor with one parent is reachable without first entering that parent',()=>{
  const units=sampleUnits.filter(unit=>!['demo-learning','demo-finance','demo-budget','demo-cost','demo-account','demo-tech','demo-product','demo-engineer','demo-platform'].includes(unit.id));
  const s=useOrgStore.getState();s.replaceUnits(units,'import');s.setExperienceMode('explore');s.exploreElevator();finish();
  assert.equal(floorDestination(units,'demo-root',2),'demo-people');
  s.exploreChooseFloor(2);finish();finish();
  const after=useOrgStore.getState();
  assert.equal(after.exploreDepth,2);
  assert.deepEqual(floorRooms(after.units,after.exploreBranchId,2).map(unit=>unit.id),['demo-recruit']);
});

test('ambiguous lower floors require a valid parent and never mix sibling branches',()=>{
  const s=enter();s.exploreElevator();finish();
  assert.equal(floorDestination(sampleUnits,'demo-root',2),null);
  s.exploreChooseFloor(2,'demo-tech');finish();finish();
  const after=useOrgStore.getState();
  assert.deepEqual(floorRooms(after.units,after.exploreBranchId,2).map(unit=>unit.id),['demo-product','demo-platform']);
  assert.equal(floorDestination(sampleUnits,'demo-root',2,'demo-talent'),null);
});

test('focus mode closes the profile without changing the current room',()=>{
  const s=enter();finish();assert.equal(useOrgStore.getState().detailOpen,true);
  const room=useOrgStore.getState().exploreRoomId;
  s.setExploreLookActive(true);
  assert.equal(useOrgStore.getState().detailOpen,false);
  assert.equal(useOrgStore.getState().exploreRoomId,room);
});
