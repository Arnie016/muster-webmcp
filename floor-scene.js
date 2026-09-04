import * as THREE from './vendor/three.module.min.js';
import { ROOMS, WALLS, SPATIAL_EQUIPMENT, DETECTOR, toWorld } from './spatial-data.js';

export function initFloorScene(canvas, onSelect) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setClearColor(0x091319);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const perspectiveCamera = new THREE.PerspectiveCamera(38, 1, .1, 250);
  const orthographicCamera = new THREE.OrthographicCamera(-25,25,16,-16,.1,250);
  let camera = perspectiveCamera;
  const model = new THREE.Group(); model.name = 'F07-original-procedural-interior'; scene.add(model);
  scene.add(new THREE.HemisphereLight(0xdaf2ff, 0x17323b, 1.8));
  const sun = new THREE.DirectionalLight(0xe9f5ff, 2.4);
  sun.position.set(-15,35,18); sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-28; sun.shadow.camera.right=28;
  sun.shadow.camera.top=25; sun.shadow.camera.bottom=-25; sun.shadow.normalBias=.04;
  scene.add(sun);
  const warm = new THREE.DirectionalLight(0xffb875,1.3); warm.position.set(22,10,-8); scene.add(warm);
  const mats = {};
  const mat = (color, metalness=.1, opacity=1) => {
    const key = `${color}/${metalness}/${opacity}`;
    return mats[key] ||= new THREE.MeshStandardMaterial({ color, roughness: .64, metalness, transparent: opacity<1, opacity });
  };
  const mesh = (geometry, material, pos, name, parent=model) => {
    const m = new THREE.Mesh(geometry,material); m.position.set(...pos); m.name=name;
    m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
  };
  const box = (w,h,d,color,p,name,parent=model) => mesh(new THREE.BoxGeometry(w,h,d),mat(color),p,name,parent);
  const at = (uv,y=0) => toWorld(uv,y);
  const line = (points,color=0x619397) => {
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map((p)=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color})); model.add(l); return l;
  };
  function label(text, uv, color='#c7ece8', size=3.7, y=2) {
    const image = document.createElement('canvas'); image.width=512; image.height=100;
    const ctx=image.getContext('2d'); ctx.fillStyle='rgba(6,17,24,.90)'; ctx.fillRect(0,0,512,100);
    ctx.strokeStyle=color; ctx.lineWidth=3; ctx.strokeRect(2,2,508,96); ctx.fillStyle=color;
    ctx.font='bold 42px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,256,52,486);
    const texture = new THREE.CanvasTexture(image); texture.colorSpace=THREE.SRGBColorSpace;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));
    sprite.position.set(...at(uv,y)); sprite.scale.set(size,size*100/512,1); sprite.renderOrder=5;
    model.add(sprite); return sprite;
  }
  box(39.4,.48,24.55,'#152c37',[0,-.38,0],'F07-structural-slab');
  const grid=new THREE.GridHelper(54,54,0x284c5a,0x122d39); grid.position.y=-.65; scene.add(grid);
  const selectable=[]; const roomMeshes=[];
  for(const room of ROOMS) {
    const [x1,z1,x2,z2]=room.bounds;
    const floor=box(room.width,.12,room.depth,room.color,at([(x1+x2)/2,(z1+z2)/2],-.055),`${room.id}-floor`);
    floor.material=floor.material.clone();
    floor.userData={type:'room',id:room.id}; selectable.push(floor); roomMeshes.push(floor);
    label(room.label.toUpperCase(),[room.center[0],z1+30],'#d8eeea',room.id==='electrical'?4.8:7.4,1.8);
    if(room.occupants) label(`${room.occupants} PEOPLE`,[room.center[0],z1+60],'#9adacb',3.4,.65);
  }
  for(const [i,[u1,v1,u2,v2]] of WALLS.entries()) {
    const a=at([u1,v1]),b=at([u2,v2]);
    const wall=box(Math.hypot(b[0]-a[0],b[2]-a[2]),1.35,.15,'#78969d',[(a[0]+b[0])/2,.675,(a[2]+b[2])/2],`wall-${i}`);
    wall.rotation.y=-Math.atan2(b[2]-a[2],b[0]-a[0]);
    line([[a[0],1.37,a[2]],[b[0],1.37,b[2]]],0xc3dbd5);
  }
  // Open-top lift core, doors and the two visible stair landings.
  box(4.2,.06,6.85,'#192c36',at([375,280],.035),'fire-lift-floor');
  box(2,1.9,.12,'#6a848c',at([375,347],.95),'lift-closed-door');
  line([at([375,347],0),at([375,347],1.9)],0x263f4c);
  label('LIFT · NOT A ROUTE',[375,275],'#849d9c',4.8,2.2);
  for(const [name,u] of [['A',171],['B',742]]) {
    box(6.5,.13,3,'#365c54',at([u,479],.1),`stair-${name}-landing`);
    for(let n=0;n<6;n++) box(1.8,.12+n*.09,.30,'#aec4bb',at([u-38,495-n*6],.16+n*.045),`stair-${name}-step-${n}`);
    label(`STAIR ${name}`,[u,510],'#bde69a',4.4,2);
  }
  // Original modular props: names and transforms remain inspectable.
  const desk=(u,v,id)=>{
    box(2.7,.12,1.15,'#9cabaa',at([u,v],.78),`${id}-desktop`);
    for(const dx of [-1.1,1.1]) box(.1,.72,.78,'#40545b',[at([u,v])[0]+dx,.36,at([u,v])[2]],`${id}-leg`);
    box(.78,.48,.08,'#122932',at([u,v-3],1.08),`${id}-monitor`);
    box(.05,.15,.08,'#657e81',at([u,v-3],.88),`${id}-monitor-stand`);
    box(.58,.10,.58,'#455f68',at([u,v+22],.46),`${id}-chair-seat`);
    box(.58,.50,.09,'#536c74',at([u,v+28],.70),`${id}-chair-back`);
  };
  for(const side of [0,500]) for(const [i,[u,v]] of [[145,170],[245,170],[145,250],[245,250]].entries()) desk(u+side,v,`office-${side}-${i}`);
  box(4.7,.14,1.7,'#aa9e87',at([190,398],.78),'meeting-table');
  for(const v of [373,424]) for(const u of [162,192,222]) box(.55,.48,.55,'#58717b',at([u,v],.25),`meeting-chair-${u}-${v}`);
  for(const [i,u] of [685,740,790].entries()) {
    box(.9,.8,.65,'#665e73',at([u,376],.4),`studio-equipment-case-${i}`);
    box(.85,.08,.62,'#9e94a5',at([u,376],.84),`studio-case-lid-${i}`);
  }
  const tripod=new THREE.Group(); tripod.name='studio-camera-tripod'; tripod.position.set(...at([790,418])); model.add(tripod);
  box(.5,.4,.6,'#263d46',[0,1.55,0],'camera-body',tripod);
  for(const angle of [0,2.09,4.18]) {
    const leg=box(.04,1.5,.04,'#b3c4c8',[Math.sin(angle)*.18,.7,Math.cos(angle)*.18],'tripod-leg',tripod); leg.rotation.z=Math.cos(angle)*.25; leg.rotation.x=Math.sin(angle)*.25;
  }
  for(const u of [501,546]) {
    box(1.0,1.9,.6,'#697a7d',at([u,253],.95),`electrical-cabinet-${u}`);
    box(.12,.4,.04,'#efb95e',at([u+7,260],1.10),`cabinet-warning-${u}`);
  }
  box(3,.46,.8,'#788e88',at([480,132],.23),'lobby-bench');
  const equipMeshes=[];
  for(const item of [...SPATIAL_EQUIPMENT,DETECTOR]) {
    const pos=at(item.point,.75); let object;
    if(item.symbol==='E') {
      object=mesh(new THREE.CylinderGeometry(.15,.15,.7,16),mat('#e5533d'),pos,'extinguisher-cylinder');
      box(.27,.08,.14,'#161f25',[pos[0],1.17,pos[2]],'extinguisher-handle');
      box(.21,.26,.018,'#ede8d8',[pos[0],.78,pos[2]+.15],'extinguisher-label');
    } else if(item.symbol==='H') {
      object=box(.85,.95,.24,'#c65c46',pos,'hose-reel-cabinet');
      const reel=mesh(new THREE.TorusGeometry(.28,.045,8,24),mat('#e6b78a'),[pos[0],pos[1],pos[2]+.16],'hose-coil');
    } else if(item.symbol==='P') object=box(.9,.04,.9,'#dac365',at(item.point,.16),'assistance-point');
    else if(item.symbol==='D') object=mesh(new THREE.CylinderGeometry(.22,.22,.1,16),mat('#e5b474'),at(item.point,2.5),'illustrative-detector');
    else object=box(.35,.45,.18,'#ef614d',pos,'manual-call-point');
    object.userData={type:'equipment',id:item.id}; selectable.push(object); equipMeshes.push(object);
    const pin=label(item.symbol,item.point,item.color,1.25,3); pin.userData=object.userData; selectable.push(pin);
    line([at(item.point,.3),at(item.point,2.7)],0x9c9e78);
  }
  const signal=mesh(new THREE.SphereGeometry(.55,20,12),mat('#ff703d',.0,.46),at(DETECTOR.point,1.7),'scripted-signal'); signal.visible=false;
  const ring=mesh(new THREE.TorusGeometry(1.2,.055,8,48),mat('#f6a45f'),at(DETECTOR.point,.15),'signal-ring'); ring.rotation.x=-Math.PI/2; ring.visible=false;
  const selectedPin=mesh(new THREE.TorusGeometry(.72,.06,8,48),mat('#fff0a9'),[0,.2,0],'selected-equipment-ring');selectedPin.rotation.x=-Math.PI/2;selectedPin.visible=false;
  // Dimension strings are part of the model, not raster screenshots.
  line([at([70,565],.05),at([830,565],.05)],0x90b1b6);
  label('38.00 m · AUTHORED PLAN',[450,568],'#88b5b8',7,.45);
  line([at([42,72],.05),at([42,535],.05)],0x90b1b6);
  label('23.15 m',[25,310],'#88b5b8',3.8,.55);
  const routeGroup=new THREE.Group(); routeGroup.name='route-preview-not-recorded-action'; model.add(routeGroup);
  const avatar=new THREE.Group(); avatar.name='walkthrough-marker'; scene.add(avatar);
  mesh(new THREE.CylinderGeometry(.18,.24,.7,12),mat('#f6df88'),[0,.65,0],'marker-body',avatar);
  mesh(new THREE.SphereGeometry(.19,12,8),mat('#fff2c8'),[0,1.2,0],'marker-head',avatar);
  mesh(new THREE.CylinderGeometry(.48,.48,.025,32),mat('#efeaba',0,.55),[0,.14,0],'marker-footprint',avatar);
  avatar.visible=false;
  let visible=false, active=false, selected='studio', yaw=-.50, pitch=.91, distance=53, target=new THREE.Vector3(0,0,0), route=null, step=0, fraction=0, follow=false;
  let transition=null, last=0;
  const teamMeshes=new Map(), teamMoves=new Map();
  const handoffGroup=new THREE.Group(); handoffGroup.name='proposed-team-assignment';model.add(handoffGroup);
  let handoffKey=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setTeam(people) {
    for(const p of people) {
      let group=teamMeshes.get(p.id);
      if(!group){
        group=new THREE.Group();group.name=p.id;model.add(group);teamMeshes.set(p.id,group);
        const body=box(.52,.82,.32,'#d4b455',[0,.66,0],`${p.id}-jacket`,group);
        const head=mesh(new THREE.SphereGeometry(.22,14,10),mat('#efdab7'),[0,1.26,0],`${p.id}-head`,group);
        const helmet=mesh(new THREE.SphereGeometry(.27,16,10,0,Math.PI*2,0,Math.PI/2),mat('#ffd567'),[0,1.35,0],`${p.id}-helmet`,group);
        mesh(new THREE.CylinderGeometry(.65,.65,.025,24),mat('#e9c564',0,.75),[0,.15,0],`${p.id}-selection-disc`,group);
        for(const dx of [-.15,.15])box(.16,.44,.20,'#354549',[dx,.25,0],`${p.id}-leg`,group);
        const icon=document.createElement('canvas');icon.width=128;icon.height=128;
        const ctx=icon.getContext('2d');ctx.fillStyle='#ffda73';ctx.beginPath();ctx.arc(64,64,59,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#19232b';ctx.lineWidth=6;ctx.stroke();ctx.fillStyle='#18252a';ctx.font='bold 46px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.initials,64,67);
        const texture=new THREE.CanvasTexture(icon);texture.colorSpace=THREE.SRGBColorSpace;
        const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));tag.name=`${p.id}-initials`;tag.position.set(0,2.4,0);tag.scale.set(1.15,1.15,1);tag.renderOrder=10;group.add(tag);
        for(const object of [body,head,helmet,tag]){object.userData={type:'person',id:p.id};selectable.push(object);}
      }
      if(!teamMoves.has(p.id))group.position.set(...at(p.point));
      group.userData.room=p.room_id;
    }
    canvas.dataset.teamPositions=JSON.stringify(people.map(p=>({id:p.id,room:p.room_id,status:p.status})));
  }
  function setHandoff(proposal) {
    const key=proposal?JSON.stringify([proposal.person_id,proposal.to_room,proposal.revision]):null;
    routeGroup.visible=!proposal;avatar.visible=!proposal&&Boolean(route);
    if(key===handoffKey)return;handoffKey=key;
    for(const child of [...handoffGroup.children]){child.geometry?.dispose();child.material?.dispose();handoffGroup.remove(child);}
    routeGroup.visible=!proposal;avatar.visible=!proposal&&Boolean(route);
    if(proposal){
      const points=proposal.points.map(p=>new THREE.Vector3(...at(p,.27)));
      const curve=new THREE.CurvePath();for(let i=1;i<points.length;i++)if(points[i].distanceTo(points[i-1])>.001)curve.add(new THREE.LineCurve3(points[i-1],points[i]));
      handoffGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve,100,.10,7,false),new THREE.MeshBasicMaterial({color:0x70d7f5})));
      for(let i=0;i<points.length;i++){
        const marker=new THREE.Mesh(new THREE.SphereGeometry(i===points.length-1?.38:.16,12,8),new THREE.MeshBasicMaterial({color:i===points.length-1?0xffd46d:0x9beaff}));marker.position.copy(points[i]);handoffGroup.add(marker);
      }
    }
    canvas.dataset.handoff=proposal?`${proposal.person_id}:${proposal.to_room}`:'';
  }
  function animateHandoff(proposal){
    if(reduced)return;
    const curve=new THREE.CurvePath();const points=proposal.points.map(p=>new THREE.Vector3(...at(p)));
    for(let i=1;i<points.length;i++)if(points[i].distanceTo(points[i-1])>.001)curve.add(new THREE.LineCurve3(points[i-1],points[i]));
    teamMoves.set(proposal.person_id,{curve,start:performance.now()});
  }
  function updateCamera() {
    const center=follow&&avatar.visible?avatar.position.clone():target;
    const radius=(follow?12:distance)*Math.max(1,1.4/camera.aspect);
    camera.position.set(center.x+Math.sin(yaw)*Math.cos(pitch)*radius,center.y+Math.sin(pitch)*radius,center.z+Math.cos(yaw)*Math.cos(pitch)*radius);
    camera.lookAt(center);
  }
  function resize() {
    const {width,height}=canvas.parentElement.getBoundingClientRect(); if(width<1||height<1)return;
    renderer.setSize(width,height,false); perspectiveCamera.aspect=width/height;perspectiveCamera.updateProjectionMatrix();
    const halfHeight=Math.max(14,21/(width/height));orthographicCamera.left=-halfHeight*width/height;orthographicCamera.right=halfHeight*width/height;orthographicCamera.top=halfHeight;orthographicCamera.bottom=-halfHeight;orthographicCamera.aspect=width/height;orthographicCamera.updateProjectionMatrix();updateCamera();
  }
  function clearRoute() {
    for(const child of [...routeGroup.children]) { child.geometry?.dispose(); child.material?.dispose(); routeGroup.remove(child); }
  }
  function setRoute(next,nextStep=0) {
    const changed=JSON.stringify([next?.zone_id,next?.exit,next?.available])!==JSON.stringify([route?.zone_id,route?.exit,route?.available]);
    const previousStep=step;
    const stepChanged=nextStep!==step;
    route=next; step=Math.min(nextStep,route?.maxStep||0);
    if(changed) {
      clearRoute();
      if(route) {
        const pts=route.points.map(p=>new THREE.Vector3(...at(p,.2)));
        const curve=new THREE.CurvePath(); for(let i=1;i<pts.length;i++)curve.add(new THREE.LineCurve3(pts[i-1],pts[i]));
        const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,100,.065,6,false),new THREE.MeshBasicMaterial({color:route.available?0x8cdfce:0xfa7865})); routeGroup.add(tube);
        route.steps.forEach((s,i)=>{
          const waypoint=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.035,20),new THREE.MeshBasicMaterial({color:i===3&&!route.available?0xf67962:0xb3e8dc}));
          waypoint.position.set(...at(s.point,.19));routeGroup.add(waypoint);
        });
      }
    }
    avatar.visible=Boolean(route);
    if(route) {
      const to=new THREE.Vector3(...at(route.steps[step].point));
      if(changed||reduced) {avatar.position.copy(to);transition=null;}
      else if(stepChanged) {
        const indexOf=(p)=>route.points.findIndex(q=>q[0]===p[0]&&q[1]===p[1]);
        const fromIndex=indexOf(route.steps[Math.min(previousStep,route.maxStep)].point),toIndex=indexOf(route.steps[step].point);
        const between=fromIndex<=toIndex?route.points.slice(fromIndex,toIndex+1):route.points.slice(toIndex,fromIndex+1).reverse();
        const points=[avatar.position.clone(),...between.slice(1).map(p=>new THREE.Vector3(...at(p)))];
        const curve=new THREE.CurvePath();for(let i=1;i<points.length;i++)curve.add(new THREE.LineCurve3(points[i-1],points[i]));
        transition=curve.curves.length?{curve,start:performance.now()}:null;
        if(!transition)avatar.position.copy(to);
      }
      canvas.dataset.route=route.exit; canvas.dataset.routeAvailable=String(route.available);canvas.dataset.walkStep=String(step);
    }
    updateCamera();
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);
  const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster(); let drag=null;
  canvas.addEventListener('pointerdown',(e)=>{drag={x:e.clientX,y:e.clientY,yaw,pitch,moved:false};if(e.pointerType!=='touch')canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',(e)=>{
    if(!drag||e.pointerType==='touch')return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y; if(Math.hypot(dx,dy)>5)drag.moved=true;
    if(drag.moved){yaw=drag.yaw-dx*.007;pitch=Math.max(.35,Math.min(1.53,drag.pitch+dy*.004));follow=false;updateCamera();}
  });
  canvas.addEventListener('pointerup',(e)=>{
    if(drag&&!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8){
      const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
      raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(selectable,false)[0];if(hit)onSelect(hit.object.userData);
    } drag=null;
  });
  canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('wheel',(e)=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();distance=Math.min(75,Math.max(18,distance+e.deltaY*.03));updateCamera();},{passive:false});
  renderer.setAnimationLoop((time)=>{
    if(!visible||document.hidden)return;
    for(const [id,move] of teamMoves){const t=Math.min(1,(time-move.start)/1800);teamMeshes.get(id)?.position.copy(move.curve.getPoint(t));if(t===1)teamMoves.delete(id);}
    if(transition){const t=Math.min(1,(time-transition.start)/1300);avatar.position.copy(transition.curve.getPoint(t));if(t===1)transition=null;updateCamera();}
    if(!reduced&&active){const pulse=1+Math.sin(time*.002)*.08;signal.scale.setScalar(pulse);ring.material.opacity=.45+Math.sin(time*.002)*.18;}
    renderer.render(scene,camera);
  });
  resize();canvas.dataset.ready='true';canvas.dataset.roomCount=String(ROOMS.length);
  return {
    show(value){visible=value;if(value)resize();},refresh:resize,
    select(id){selected=id;roomMeshes.forEach(m=>{m.material.emissive.set(m.userData.id===id?'#21665f':'#000000');m.material.emissiveIntensity=m.userData.id===id?.30:0;});canvas.dataset.selectedRoom=id;},
    setHazard(value){active=value;signal.visible=value;ring.visible=value;},
    setRoute,
    setTeam,setHandoff,animateHandoff,
    clearTeamMotion(){teamMoves.clear();},
    focusPerson(id){const p=teamMeshes.get(id);if(p){camera=perspectiveCamera;target.copy(p.position);distance=29;follow=false;updateCamera();}},
    focusEquipment(id){const item=[...SPATIAL_EQUIPMENT,DETECTOR].find(e=>e.id===id);if(!item)return;camera=perspectiveCamera;selectedPin.position.set(...at(item.point,.2));selectedPin.visible=true;target.set(...at(item.point));distance=24;follow=false;canvas.dataset.selectedEquipment=id;updateCamera();},
    view(mode){follow=mode==='follow';camera=mode==='top'?orthographicCamera:perspectiveCamera;if(mode==='top'){pitch=Math.PI/2-.0001;yaw=0;distance=48;target.set(0,0,0);orthographicCamera.zoom=1;}else if(mode==='reset'){pitch=.91;yaw=-.50;distance=53;target.set(0,0,0);}canvas.dataset.projection=camera===orthographicCamera?'orthographic':'perspective';resize();},
    zoom(delta){distance=Math.min(75,Math.max(18,distance+delta));if(camera===orthographicCamera){orthographicCamera.zoom=48/distance;orthographicCamera.updateProjectionMatrix();}updateCamera();},
    dispose(){observer.disconnect();renderer.setAnimationLoop(null);renderer.dispose();},
  };
}
