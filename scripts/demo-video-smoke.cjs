const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${process.env.MUSTER_URL||'http://127.0.0.1:4180'}/demo.html`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('video').readyState>=1);
  const initial=await page.locator('video').evaluate(v=>({width:v.videoWidth,height:v.videoHeight,duration:v.duration,paused:v.paused}));
  assert.equal(initial.width,1920);assert.equal(initial.height,1080);assert.ok(initial.duration>125&&initial.duration<126);assert.equal(initial.paused,true);
  await page.locator('video').evaluate(async v=>{v.muted=true;v.textTracks[0].mode='hidden';await v.play();});
  await page.waitForFunction(()=>document.querySelector('video').currentTime>.2);
  await page.locator('video').evaluate(v=>{v.pause();v.currentTime=118;});
  await page.waitForFunction(()=>{const v=document.querySelector('video');return !v.seeking&&v.currentTime>=118&&v.textTracks[0]?.cues?.length===33;});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  assert.deepEqual(errors,[]);
  await page.close();console.log(`PASS ${width}px: public-format 1080p video, no autoplay, playback, seeking, 33 captions, no overflow or page errors`);
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
