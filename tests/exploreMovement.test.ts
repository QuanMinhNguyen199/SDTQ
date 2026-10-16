import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canWalkAt, moveOnFloor, nearElevator, roomAt } from '../data/exploreMovement.ts';

test('both sides of the corridor connect to their rooms through the door',()=>{
  for(const side of [-1,1]){
    const room={x:side*7,z:.4};
    const hall=moveOnFloor(room,{x:-side*4,z:0},2);
    assert.ok(Math.abs(hall.x-3*side)<.01);
    assert.equal(roomAt(hall,2),null);
    const entered=moveOnFloor(hall,{x:side*4,z:0},2);
    assert.ok(Math.abs(entered.x-7*side)<.01);
    assert.equal(roomAt(entered,2),side===1?0:1);
  }
});
test('long frame movements cannot tunnel through a wall or desk',()=>{
  const wall=moveOnFloor({x:0,z:2.5},{x:20,z:0},2);
  assert.ok(wall.x<=4.65);
  const desk=moveOnFloor({x:7,z:0},{x:10,z:0},2);
  assert.ok(desk.x<8.78);
  assert.equal(canWalkAt({x:14,z:0},2),false);
});
test('the elevator is reachable from the hallway',()=>{
  const cabin=moveOnFloor({x:0,z:8},{x:0,z:4},2);
  assert.ok(cabin.z>10.9&&cabin.z<=12.45);
});

test('profiles trigger before the doorway with hysteresis, elevator triggers before its doors',()=>{
  assert.equal(roomAt({x:4.2,z:0},2),0);
  assert.equal(roomAt({x:3.8,z:0},2),null);
  assert.equal(roomAt({x:3.8,z:0},2,0),0);
  assert.equal(roomAt({x:3.4,z:0},2,0),null);
  assert.equal(roomAt({x:4.5,z:2.5},2),null);
  assert.equal(nearElevator({x:0,z:8.7}),true);
  assert.equal(nearElevator({x:3,z:8.7}),false);
  assert.equal(nearElevator({x:0,z:7}),false);
});
