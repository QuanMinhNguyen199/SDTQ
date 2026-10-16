import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { orderedStations, sampleUnits } from '../data/orgData.ts';
import { useOrgStore, journeyStations, journeyUnits } from '../store/useOrgStore.ts';

beforeEach(()=>useOrgStore.setState(useOrgStore.getInitialState(),true));
test('sample has three main departments, two sublayers and own responsibilities',()=>{
  const stations=orderedStations(sampleUnits);
  assert.equal(stations.length,13);
  assert.equal(stations.filter(u=>u.depth===1).length,3);
  assert.equal(Math.max(...stations.map(u=>u.depth)),3);
  assert.equal(new Set(stations.map(u=>u.id)).size,13);
  assert.ok(stations.every(u=>u.duties.length&&u.authorities.length));
});
test('journey restores organization view, selection, filters and expansion',()=>{
  useOrgStore.setState({view:'2d',searchQuery:'cán bộ',expanded:new Set(['custom']),typeFilter:new Set(['Vụ'])});
  const before=useOrgStore.getState();
  before.setExperienceMode('journey');
  useOrgStore.getState().stepJourney(1);
  useOrgStore.getState().setExperienceMode('organization');
  const after=useOrgStore.getState();
  assert.equal(after.view,'2d');assert.equal(after.activeDeptId,before.activeDeptId);
  assert.equal(after.searchQuery,'cán bộ');assert.deepEqual(after.expanded,before.expanded);assert.deepEqual(after.typeFilter,before.typeFilter);
});
test('sample selection never overwrites working data',()=>{
  const units=useOrgStore.getState().units;
  useOrgStore.getState().setExperienceMode('journey');
  useOrgStore.getState().setJourneyDataset('sample');
  assert.equal(journeyUnits(useOrgStore.getState()).length,13);
  assert.equal(useOrgStore.getState().units,units);
  assert.equal(useOrgStore.getState().dirty,false);
});
test('filters align selection, empty results recover, sublayer links drill through filters',()=>{
  const actions=useOrgStore.getState();actions.setExperienceMode('journey');actions.setJourneyDataset('sample');
  actions.setJourneyLayer(1);
  assert.equal(journeyStations(useOrgStore.getState()).length,3);
  actions.jumpToStation('demo-recruit',true);
  assert.equal(useOrgStore.getState().activeDeptId,'demo-recruit');assert.equal(useOrgStore.getState().journeyLayer,null);
  actions.setQuery('no-match-xyz');assert.equal(useOrgStore.getState().activeDeptId,null);
  actions.clearFilters();assert.equal(useOrgStore.getState().activeDeptId,'demo-root');
  actions.setJourneyCluster('demo-tech');assert.equal(journeyStations(useOrgStore.getState()).length,4);
});
test('station navigation is bounded and genuine context loss restores 2D',()=>{
  const actions=useOrgStore.getState();actions.setView('2d');actions.setExperienceMode('journey');actions.setJourneyDataset('sample');
  actions.stepJourney(-1);assert.equal(useOrgStore.getState().activeDeptId,'demo-root');
  actions.stepJourney(1);assert.equal(useOrgStore.getState().activeDeptId,'demo-people');
  actions.failWebGL();assert.equal(useOrgStore.getState().experienceMode,'organization');assert.equal(useOrgStore.getState().view,'2d');
  actions.setView('3d');assert.equal(useOrgStore.getState().webglFailed,false);
});
