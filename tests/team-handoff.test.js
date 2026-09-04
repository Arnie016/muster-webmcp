import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState,startDrill,addInject} from '../drill-core.js';
import {TEAM_ROOMS,teamRoster,prepareHandoff,confirmHandoff,handoffRecords} from '../team-handoff.js';
import {WALLS} from '../spatial-data.js';
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
test('every room-to-room handoff follows an authored connection without crossing a wall',()=>{
 const s=startDrill(createInitialState());
 for(const person of teamRoster(s))for(const dest of TEAM_ROOMS){
  if(person.room_id===dest)continue;
  const before=JSON.stringify(s),p=prepareHandoff(s,person.id,dest);
  assert.equal(JSON.stringify(s),before);assert.equal(p.requires_human_confirmation,true);assert.equal(p.arrived,false);
  for(let i=1;i<p.points.length;i++)for(const w of WALLS){
   const a=p.points[i-1],b=p.points[i],c=w.slice(0,2),d=w.slice(2);
   assert.ok(!(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0),`${person.id}/${dest} crosses ${w}`);
  }
 }
});
test('human confirmation changes shared position without inventing arrival or clearance',()=>{
 const s=startDrill(createInitialState()),p=prepareHandoff(s,'responder-s-tan','studio','assistance_brief');
 const next=confirmHandoff(s,p,'test');assert.equal(handoffRecords(s).length,0);assert.equal(next.teamHandoffs.length,1);
 assert.equal(teamRoster(next).at(-1).room_id,'studio');assert.equal(next.teamHandoffs[0].arrived,false);assert.equal(next.decisions.length,0);
 assert.deepEqual(teamRoster(JSON.parse(JSON.stringify(next))),teamRoster(next));
 assert.throws(()=>confirmHandoff(next,p,'again'),/changed/);
});
test('stale, unknown, unsupported and out-of-phase proposals fail closed',()=>{
 const initial=createInitialState(),s=startDrill(initial),p=prepareHandoff(s,'responder-s-tan','studio');
 assert.throws(()=>confirmHandoff(initial,p,'x'),/Start/);
 assert.throws(()=>confirmHandoff(addInject(s,'stair'),p,'x'),/changed/);
 assert.throws(()=>prepareHandoff(s,'unknown','studio'),/known/);
 assert.throws(()=>prepareHandoff(s,'responder-s-tan','electrical'),/authored/);
 assert.throws(()=>prepareHandoff(s,'responder-s-tan','west'),/already/);
 assert.throws(()=>prepareHandoff(s,'responder-s-tan','studio','dispatch'),/supported/);
 assert.throws(()=>prepareHandoff({...s,status:'review'},'responder-s-tan','studio'),/Return/);
});
