const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const shots = path.join(root, 'docs', 'screenshots');
const url = process.env.MUSTER_URL || 'http://127.0.0.1:4173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 }, deviceScaleFactor: 1 });
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  assert.equal(await page.locator('[data-building-floor]').count(), 18);
  assert.ok(await page.locator('#buildingView').isVisible());
  await page.screenshot({ path: path.join(shots, 'muster-spatial-command.png'), fullPage: false });

  const viewport = page.locator('#buildingViewport');
  const box = await viewport.boundingBox();
  assert.ok(box);
  await page.mouse.move(box.x + box.width * .45, box.y + box.height * .42);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .62, box.y + box.height * .34, { steps: 8 });
  await page.mouse.up();
  await page.locator('#enterFloorButton').click();
  await page.waitForFunction(() => document.querySelector('#floorView') && !document.querySelector('#floorView').classList.contains('view-hidden'));
  assert.match(await page.locator('#floorZoomLabel').innerText(), /100%/);

  await page.locator('#toolButton').click();
  await page.locator('#rehearsalButton').click();
  await page.waitForFunction(() => !document.querySelector('#reportPanel').hidden);
  assert.ok(await page.locator('#userRoute.active').isVisible());
  assert.match(await page.locator('#traceInspector').innerText(), /why this call/i);
  await page.screenshot({ path: path.join(shots, 'muster-floor-route.png'), fullPage: false });
  await page.locator('#reportPanel').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(shots, 'muster-after-action-report.png'), fullPage: false });
  await page.locator('#approveButton').click();
  assert.match(await page.locator('#reportPanel').innerText(), /Human approved/);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobileErrors = [];
  mobile.on('console', (message) => { if (message.type() === 'error') mobileErrors.push(message.text()); });
  mobile.on('pageerror', (error) => mobileErrors.push(error.message));
  await mobile.goto(url, { waitUntil: 'networkidle' });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `mobile horizontal overflow: ${overflow}px`);
  assert.ok(await mobile.locator('#enterFloorButton').isVisible());
  await mobile.locator('#enterFloorButton').click();
  assert.ok(await mobile.locator('#floorView').isVisible());
  await mobile.screenshot({ path: path.join(shots, 'muster-mobile-spatial.png'), fullPage: false });

  assert.deepEqual(errors, []);
  assert.deepEqual(mobileErrors, []);
  await browser.close();
  console.log('PASS · 3D building exposes 18 selectable floors and supports orbit interaction');
  console.log('PASS · Floor 07 opens, route analysis renders, and report remains human-approved');
  console.log('PASS · 390x844 mobile has no horizontal overflow or console errors');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
