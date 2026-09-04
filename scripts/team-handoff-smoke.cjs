const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const url=process.env.MUSTER_URL||'http://127.0.0.1:4180';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  for(const width of [1600,390]) {
   const page=await browser.newPage({viewport:{width,height:width===390?844:1100},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url,{waitUntil:'networkidle'});
   await page.locator('#agentPrompt').fill('Prepare S Tan for an assistance handoff to the Studio');
   await page.locator('#agentForm button').click();
   await page.waitForFunction(()=>document.querySelector('#teamProposal').textContent.includes('S. Tan → Studio'));
   assert.match(await page.locator('#conversationHistory').innerText(),/No assignment, arrival, or clearance has been recorded/);
   assert.equal(await page.locator('#teamConfirm').isEnabled(),false);
   await page.locator('#teamCancel').click();
   await page.locator('#interiorMode').click();
   await page.waitForFunction(()=>document.querySelector('#interiorCanvas').dataset.ready==='true');
   await page.locator('#teamStart').click();
   await page.locator('#teamPreview').click();
   assert.equal(await page.locator('#teamConfirm').isEnabled(),true);
   assert.match(await page.locator('#teamProposal').innerText(),/S. Tan → Studio/);
   let snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('muster-demo-state-v2')));
   assert.equal((snapshot.teamHandoffs||[]).length,0);
   assert.match(await page.locator('#conversationHistory').innerText(),/prepare_team_handoff/);
   assert.match(await page.locator('#interiorCanvas').getAttribute('data-handoff'),/responder-s-tan:studio/);
   await page.locator('#interiorCanvas').screenshot({path:path.join(__dirname,'../docs/screenshots',`muster-team-3d-${width}.png`)});
   await page.locator('#teamDesk').screenshot({path:path.join(__dirname,'../docs/screenshots',`muster-team-preview-${width}.png`)});
   await page.locator('#teamConfirm').click();
   snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('muster-demo-state-v2')));
   assert.equal(snapshot.teamHandoffs.length,1);assert.equal(snapshot.teamHandoffs[0].arrived,false);assert.equal(snapshot.decisions.length,0);
   assert.match(await page.locator('#teamState').innerText(),/Arrival and completion are still unrecorded/);
   assert.equal(JSON.parse(await page.locator('#interiorCanvas').getAttribute('data-team-positions')).find(p=>p.id==='responder-s-tan').room,'studio');
   const marker=await page.locator('#peopleLayer [data-person-id="responder-s-tan"]').getAttribute('transform');
   await page.reload({waitUntil:'networkidle'});
   assert.equal(await page.locator('#peopleLayer [data-person-id="responder-s-tan"]').getAttribute('transform'),marker);
   assert.match(await page.locator('#teamHistory').innerText(),/1 confirmed assignment/);
   await page.locator('#teamDestination').selectOption('meeting');await page.locator('#teamPreview').click();
   await page.locator('#toolButton').click();
   await page.locator('[data-tool-run="send_inject"]').click();
   await page.locator('#closeTools').click();
   await page.waitForFunction(()=>/Exercise changed/.test(document.querySelector('#teamState').textContent));
   assert.equal(await page.locator('#teamConfirm').isEnabled(),false);
   assert.match(await page.locator('#teamState').innerText(),/Exercise changed/);
   await page.locator('#teamPreview').click();assert.equal(await page.locator('#teamConfirm').isEnabled(),true);
   await page.locator('#teamCancel').click();
   assert.equal(await page.locator('#teamConfirm').isVisible(),false);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   assert.deepEqual(errors,[]);
   await page.locator('#resetButton').click();
   await page.locator('#interiorMode').click();assert.match(await page.locator('#teamHistory').innerText(),/No assignments/);
   await page.close(); console.log(`PASS team preview, approval, 2D/3D persistence, stale guard, reset, layout ${width}`);
  }
  const fallback=await chromium.launch({headless:true,args:['--disable-webgl']});
  try {
   const page=await fallback.newPage();await page.goto(url,{waitUntil:'networkidle'});await page.locator('#interiorMode').click();
   assert.equal(await page.locator('#interiorFallback').isVisible(),true);
   await page.locator('#teamStart').click();await page.locator('#teamPreview').click();await page.locator('#teamConfirm').click();
   assert.match(await page.locator('#teamHistory').innerText(),/1 confirmed assignment/);
   console.log('PASS team assignment remains usable without WebGL');
  } finally {await fallback.close();}
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
