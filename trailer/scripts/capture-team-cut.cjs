const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const url=process.env.MUSTER_URL||'http://127.0.0.1:4180';
const dir=path.join(root,'public/captures/team-cut');
const pause=(page,ms)=>page.waitForTimeout(ms);
(async()=>{
 await fs.mkdir(dir,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--enable-experimental-web-platform-features','--enable-features=WebMCPTesting,DevToolsWebMCPSupport']});
 const receipts=[];
 try {
  async function capture(name,setup,perform,minSeconds){
   if(process.env.CAPTURE_ONLY&&!process.env.CAPTURE_ONLY.split(',').includes(name))return;
   const context=await browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir,size:{width:1920,height:1080}}});
   const page=await context.newPage(),origin=performance.now(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url,{waitUntil:'networkidle'});
   await page.waitForFunction(()=>document.querySelector('#toolCount').textContent==='20');
   const run=(name,input={})=>page.evaluate(async({name,input})=>{const tools=await document.modelContext.getTools();const raw=await document.modelContext.executeTool(tools.find(t=>t.name===name),JSON.stringify(input));return typeof raw==='string'?JSON.parse(raw):raw;},{name,input});
   await setup(page,run);await pause(page,400);
   const from=(performance.now()-origin)/1000;
   await perform(page,run);
   const remaining=minSeconds-(performance.now()-origin)/1000+from;if(remaining>0)await pause(page,remaining*1000);
   const duration=(performance.now()-origin)/1000-from;
   assert.deepEqual(errors,[]);
   await page.screenshot({path:path.join(dir,`${name}.png`)});
   const video=page.video();await context.close();const raw=path.join(dir,`${name}-raw.webm`);await video.saveAs(raw);
   const out=path.join(dir,`${name}.mp4`);
   const ff=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(Math.max(0,from-.12)),'-i',raw,'-t',String(duration+.1),'-an','-vf','fps=30','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',out],{encoding:'utf8'});
   assert.equal(ff.status,0,ff.stderr);const receipt={name,source:url,duration,from,mode:'native-capable Chrome; actual page interactions',file:out};receipts.push(receipt);
   await fs.writeFile(path.join(dir,`${name}.receipt.json`),JSON.stringify(receipt,null,2));
   console.log(`Captured ${name}: ${duration.toFixed(1)}s`);
  }
  await capture('interior',async p=>{await p.locator('#interiorMode').click();await p.locator('#interiorExpand').click();},async(p)=>{
   const box=await p.locator('#interiorCanvas').boundingBox();await p.mouse.move(box.x+box.width*.5,box.y+box.height*.45);await p.mouse.down();await p.mouse.move(box.x+box.width*.64,box.y+box.height*.5,{steps:35});await p.mouse.up();await pause(p,1700);
   await p.locator('[data-interior-room="studio"]').click();await pause(p,1800);await p.locator('[data-interior-equipment="MCP-07-L1"]').click();await pause(p,1500);await p.locator('#interiorReset').click();
  },9.2);
  await capture('guided',async(p,run)=>{await run('run_drill_manager',{intent:'rehearse'});await p.locator('#guidedBrief').scrollIntoViewIfNeeded();},async p=>{
   for(let i=0;i<6;i++){await p.locator('#guidedNextButton').click();await pause(p,i===0?2800:2500);}
   assert.match(await p.locator('#guidedTitle').innerText(),/Reveal the people gap/);
  },20.5);
  await capture('draw',async(p,run)=>{await run('read_plan');await run('start_drill');await run('send_inject',{inject_id:'stair'});await p.locator('#floorMode').click();await p.locator('#drawRouteButton').click();},async p=>{
   const b=await p.locator('#floorPlan').boundingBox();assert.ok(b);
   await p.mouse.move(b.x+b.width*.77,b.y+b.height*.65);await pause(p,700);await p.mouse.down();await p.mouse.move(b.x+b.width*.23,b.y+b.height*.79,{steps:55});await p.mouse.up();
   await p.waitForFunction(()=>document.querySelector('#userRoute').classList.contains('active'));
   await pause(p,1400);await p.locator('#routeReceipt').scrollIntoViewIfNeeded();
  },10.8);
  await capture('team',async(p,run)=>{await run('read_plan');await run('start_drill');await p.locator('#interiorMode').click();await p.locator('#teamDesk').scrollIntoViewIfNeeded();},async p=>{
   await p.locator('#teamResponder').selectOption('responder-s-tan');await p.locator('#teamDestination').selectOption('studio');await p.locator('#teamTask').selectOption('assistance_brief');
   await pause(p,600);await p.locator('#teamPreview').click();await pause(p,3000);await p.locator('#teamConfirm').click();await pause(p,2800);
   assert.match(await p.locator('#teamMapStatus').innerText(),/assigned, not arrived/);
  },12.6);
  await capture('trace',async(p,run)=>{await run('read_plan');await run('start_drill');await p.locator('#openChatButton').click();},async p=>{
   await p.locator('#agentPrompt').pressSequentially('Where is the extinguisher?',{delay:35});await p.locator('#agentForm button').click();await p.waitForFunction(()=>!document.querySelector('#agentForm button').disabled);
   const receipt=p.locator('.turn-calls details').filter({hasText:'read_equipment'}).last();await receipt.locator('summary').click();await receipt.scrollIntoViewIfNeeded();await pause(p,3000);
   assert.match(await receipt.innerText(),/EX-07-W1/);
  },11.3);
  const finish=async(p,run)=>{await run('read_plan');await run('start_drill');await run('send_inject',{inject_id:'stair'});await run('record_action',{action_id:'reroute'});await run('send_inject',{inject_id:'roster'});await run('record_action',{action_id:'assist'});await run('record_action',{action_id:'account'});await run('stage_report');await p.locator('#reportPanel').scrollIntoViewIfNeeded();};
  await capture('report',finish,async p=>{assert.equal(await p.locator('#approveButton').isEnabled(),true);assert.match(await p.locator('#guidedBrief').getAttribute('aria-label'),/Human review ready/);await p.locator('#reportPanel').scrollIntoViewIfNeeded();},6.4);
  await capture('print',async(p,run)=>{await finish(p,run);await p.locator('#openPrintPack').click();},async p=>{await p.frameLocator('#printPackFrame').locator('.page').first().waitFor();assert.equal(await p.frameLocator('#printPackFrame').locator('.page').count(),2);},4.3);
  await fs.writeFile(path.join(dir,'capture-receipts.json'),JSON.stringify({captured_at:new Date().toISOString(),receipts},null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
