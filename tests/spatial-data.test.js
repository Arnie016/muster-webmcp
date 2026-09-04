import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS, WALLS, SPATIAL_EQUIPMENT, routeWalkthrough, roomSpatialProfile, toWorld } from '../spatial-data.js';
import { createInitialState, startDrill, addInject } from '../drill-core.js';
import { planVector, drillPackHTML } from '../print-pack.js';
test('room bounds preserve authored scale and floor accounting',()=>{
 assert.equal(ROOMS.reduce((n,r)=>n+r.occupants,0),84);
 assert.equal(ROOMS.reduce((n,r)=>n+r.assisted,0),2);
 assert.deepEqual(toWorld([70,72]),[-19,0,-11.575]);
 const r=roomSpatialProfile('studio');assert.equal(r.width,13.1);assert.equal(r.depth,9.25);
 assert.match(r.geometry_basis,/not a surveyed/);assert.equal(r.dimensions_m.inferred_height,3);
 assert.equal(SPATIAL_EQUIPMENT.length,4);
});
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
test('all ten route polylines stay inside plan and do not cross a wall segment',()=>{
 for(const room of ['studio','east','west','meeting','lobby'])for(const exit of ['A','B']){
  const r=routeWalkthrough(room,exit,false);
  assert.equal(r.steps.length,5);assert.equal(new Set(r.steps.map(s=>s.point.join(','))).size,5,`${room}/${exit} duplicate checkpoints`);
  for(const p of r.points){assert.ok(p[0]>=70&&p[0]<=830);assert.ok(p[1]>=72&&p[1]<=535);}
  for(let i=1;i<r.points.length;i++)for(const w of WALLS){
   const a=r.points[i-1],b=r.points[i],c=w.slice(0,2),d=w.slice(2);
   assert.ok(!(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0),`${room}/${exit} crosses ${w}`);
  }
  const indices=r.steps.map(s=>r.points.findIndex(p=>p[0]===s.point[0]&&p[1]===s.point[1]));
  assert.deepEqual(indices,[...indices].sort((a,b)=>a-b));
 }
});
test('blocked B preview stops at approach, does not record action, and A is not certified',()=>{
 const b=routeWalkthrough('studio','B',true);assert.equal(b.maxStep,3);assert.equal(b.available,false);assert.equal(b.recorded_action,false);
 assert.ok(b.steps[b.maxStep].point[1]<448);
 const a=routeWalkthrough('studio','A',true);assert.equal(a.available,true);assert.match(a.logic.at(-1).text,/approved route/);
 assert.throws(()=>routeWalkthrough('electrical','A',false));assert.throws(()=>routeWalkthrough('studio','C'));
});
test('print exports preserve unavailable route, missing owners and training scope',()=>{
 const state=addInject(startDrill(createInitialState()),'stair');const before=JSON.stringify(state);
 const svg=planVector({state,exit:'B'});assert.match(svg,/UNAVAILABLE/);assert.match(svg,/NOT AN APPROVED ESCAPE PLAN/);assert.match(svg,/width="1100"/);
 const html=drillPackHTML({state,exit:'B'});assert.equal((html.match(/<section class="page">/g)||[]).length,2);assert.match(html,/UNASSIGNED/);assert.match(html,/not a safety rating|No alternate route recorded/);
 assert.equal(JSON.stringify(state),before);
});
