#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function loadPlaywright() {
  const requestedModule = process.env.MUSTER_PLAYWRIGHT_PATH;
  try {
    return require(requestedModule || 'playwright');
  } catch (error) {
    const hint = requestedModule
      ? `MUSTER_PLAYWRIGHT_PATH did not resolve: ${requestedModule}`
      : 'Playwright is not installed in this checkout.';
    throw new Error(`${hint} Install Playwright locally or point MUSTER_PLAYWRIGHT_PATH at an existing Playwright module.`, { cause: error });
  }
}

const { chromium } = loadPlaywright();

const APP_URL = process.env.MUSTER_URL || 'http://127.0.0.1:4173';
const CAPTURE_WIDTH = 1920;
const CAPTURE_HEIGHT = 1080;
const trailerRoot = path.resolve(__dirname, '..');
const outputPath = path.join(trailerRoot, 'public', 'captures', 'guided-demo.webm');

const guidedTitles = [
  'Read the visible plan',
  'Start one authored signal',
  'Inspect the affected group',
  'Change one condition',
  'Compare both exits',
  'Record the team decision',
  'Reveal the people gap',
  'Assign assistance',
  'Reconcile the register',
  'Check every responsibility',
  'Prepare the review draft',
  'The draft is ready for a human',
];

function validateLocalUrl(rawUrl) {
  const parsed = new URL(rawUrl);
  assert.equal(parsed.protocol, 'http:', 'MUSTER_URL must use local HTTP.');
  assert.equal(parsed.hostname, '127.0.0.1', 'MUSTER_URL must stay on 127.0.0.1.');
  assert.equal(parsed.port, '4173', 'MUSTER_URL must use port 4173.');
  return parsed;
}

function verifyCapture(capturePath) {
  const stat = fs.statSync(capturePath);
  assert.ok(stat.size > 100_000, `Capture is unexpectedly small: ${stat.size} bytes.`);

  const probe = spawnSync(process.env.FFPROBE_PATH || 'ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height',
    '-of', 'json',
    capturePath,
  ], { encoding: 'utf8' });

  assert.equal(probe.status, 0, `ffprobe failed: ${probe.stderr || 'no diagnostic output'}`);
  const metadata = JSON.parse(probe.stdout);
  const stream = metadata.streams?.[0];
  assert.ok(stream, 'The WebM contains no video stream.');
  assert.equal(stream.width, CAPTURE_WIDTH, 'Captured video width is not 1920.');
  assert.equal(stream.height, CAPTURE_HEIGHT, 'Captured video height is not 1080.');
  assert.match(stream.codec_name, /^vp[89]$/, `Unexpected WebM video codec: ${stream.codec_name}`);
  return { bytes: stat.size, codec: stream.codec_name, width: stream.width, height: stream.height };
}

async function main() {
  const appOrigin = validateLocalUrl(APP_URL).origin;
  const tempRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'muster-guided-demo-'));
  const recordedVideoDir = path.join(tempRoot, 'recorded');
  const stagedCapture = path.join(tempRoot, 'guided-demo.webm');
  await fsp.mkdir(recordedVideoDir, { recursive: true });

  let browser;
  let context;

  try {
    browser = await chromium.launch({
      headless: true,
      channel: process.env.MUSTER_BROWSER_CHANNEL || 'chrome',
    });
    context = await browser.newContext({
      viewport: { width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT },
      screen: { width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT },
      deviceScaleFactor: 1,
      colorScheme: 'dark',
      serviceWorkers: 'block',
      recordVideo: {
        dir: recordedVideoDir,
        size: { width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT },
      },
    });

    await context.addInitScript(() => localStorage.clear());

    let runtimeFault = null;
    let rejectRuntimeFailure;
    const runtimeFailure = new Promise((_, reject) => { rejectRuntimeFailure = reject; });
    runtimeFailure.catch(() => {});

    const failRuntime = (kind, detail) => {
      if (runtimeFault) return;
      runtimeFault = new Error(`${kind}: ${detail}`);
      process.stderr.write(`${runtimeFault.stack}\n`);
      rejectRuntimeFailure(runtimeFault);
    };
    const guarded = (operation) => Promise.race([operation, runtimeFailure]);
    const assertRuntimeHealthy = () => {
      if (runtimeFault) throw runtimeFault;
    };

    await context.route('**/*', async (route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.origin === appOrigin || ['data:', 'blob:'].includes(requestUrl.protocol)) {
        await route.continue();
        return;
      }
      failRuntime('Unexpected network request', requestUrl.href);
      await route.abort('blockedbyclient');
    });

    const page = await context.newPage();
    const video = page.video();
    assert.ok(video, 'Playwright did not attach a video recorder to the page.');

    page.on('console', (message) => {
      if (message.type() === 'error') failRuntime('Browser console error', message.text());
    });
    page.on('pageerror', (error) => failRuntime('Uncaught page error', error.stack || error.message));
    page.on('crash', () => failRuntime('Page crash', APP_URL));

    const locator = (selector) => page.locator(selector).first();

    async function expectOne(selector, label) {
      const count = await guarded(page.locator(selector).count());
      assert.equal(count, 1, `${label} must resolve exactly once; found ${count}.`);
      return locator(selector);
    }

    async function expectVisible(selector, label) {
      const target = await expectOne(selector, label);
      await guarded(target.waitFor({ state: 'visible', timeout: 10_000 }));
      assert.equal(await guarded(target.isVisible()), true, `${label} is not visible.`);
      return target;
    }

    async function expectHidden(selector, label) {
      const target = await expectOne(selector, label);
      await guarded(target.waitFor({ state: 'hidden', timeout: 10_000 }));
      assert.equal(await guarded(target.isHidden()), true, `${label} is not hidden.`);
    }

    async function expectText(selector, expected, label) {
      const target = await expectOne(selector, label);
      const value = (await guarded(target.innerText())).replace(/\s+/g, ' ').trim();
      if (expected instanceof RegExp) assert.match(value, expected, `${label} text was: ${value}`);
      else assert.equal(value, expected, `${label} text did not match.`);
      return value;
    }

    async function visiblePause(milliseconds, reason) {
      assert.ok(
        milliseconds >= 300 && milliseconds <= 700,
        `Visible-state pause for ${reason} must stay between 300 and 700 ms.`,
      );
      await guarded(page.waitForTimeout(milliseconds));
      assertRuntimeHealthy();
    }

    async function clickVisible(selector, label) {
      const target = await expectVisible(selector, label);
      assert.equal(await guarded(target.isEnabled()), true, `${label} is disabled.`);
      await guarded(target.click({ timeout: 10_000 }));
      assertRuntimeHealthy();
    }

    async function scrollToElement(selector, block = 'start') {
      const target = await expectOne(selector, `${selector} scroll target`);
      await guarded(target.evaluate((element, position) => {
        element.scrollIntoView({ behavior: 'smooth', block: position, inline: 'nearest' });
      }, block));
      await visiblePause(600, `scrolling ${selector} into view`);
    }

    async function advanceGuide(currentTitle, nextTitle, pauseMilliseconds = 480) {
      await expectText('#guidedTitle', currentTitle, `guided step “${currentTitle}”`);
      await clickVisible('#guidedNextButton', `guided action for “${currentTitle}”`);
      await guarded(page.waitForFunction((expectedTitle) => {
        const title = document.querySelector('#guidedTitle')?.textContent?.trim();
        return title === expectedTitle && !document.body.classList.contains('tool-working');
      }, nextTitle, { timeout: 10_000 }));
      await visiblePause(pauseMilliseconds, `guided transition to “${nextTitle}”`);
      assertRuntimeHealthy();
    }

    await guarded(page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 15_000 }));
    assert.equal(await guarded(page.title()), 'Muster · Fire drill room');
    assert.deepEqual(
      await guarded(page.evaluate(() => [window.innerWidth, window.innerHeight])),
      [CAPTURE_WIDTH, CAPTURE_HEIGHT],
      'Browser viewport is not 1920x1080.',
    );
    await guarded(page.evaluate(() => window.scrollTo(0, 0)));
    await expectVisible('#workspace', 'Muster command room');
    await expectVisible('#buildingView', '3D command-room building');
    await expectText('#statusDot', /^Ready$/i, 'initial exercise status');
    await visiblePause(650, 'showing the command room');

    await clickVisible('#resetButton', 'Reset exercise');
    await expectVisible('#buildingView', 'reset command room');
    await expectHidden('#floorView', 'floor plan after reset');
    await expectText('#guidedTitle', guidedTitles[0], 'reset guided title');
    await expectText('#statusDot', /^Ready$/i, 'reset exercise status');
    await visiblePause(500, 'showing the reset state');

    await clickVisible('[data-plan-floor="7"]', 'Floor 07 loaded plan');
    assert.equal(
      await guarded(locator('[data-plan-floor="7"]').getAttribute('class')).then((value) => value.includes('active')),
      true,
      'Floor 07 did not become selected.',
    );
    await expectText('#buildingStatus', /F07 · Office command/, 'Floor 07 building status');
    await visiblePause(500, 'showing Floor 07 selected');
    await scrollToElement('#guidedBrief', 'start');

    await advanceGuide(guidedTitles[0], guidedTitles[1], 450);
    await expectText('#lastActivity', /read_plan/i, 'plan-read trace');

    await advanceGuide(guidedTitles[1], guidedTitles[2], 520);
    await expectText('#statusDot', /^In exercise$/i, 'running exercise status');
    assert.equal(await guarded(locator('#buildingView').getAttribute('class')).then((value) => value.includes('drill-live')), true, 'The command-room model did not show the live exercise signal.');

    await advanceGuide(guidedTitles[2], guidedTitles[3], 550);
    await expectVisible('#floorView', 'Floor 07 plan');
    await expectHidden('#buildingView', '3D building after entering the floor plan');
    await expectText('#floorPlanHeading', /F07 · Office command/, 'Floor 07 plan heading');
    await expectText('#floorZoomLabel', '142%', 'Studio focus zoom');
    await scrollToElement('#floorView', 'start');

    await advanceGuide(guidedTitles[3], guidedTitles[4], 550);
    assert.equal(await guarded(locator('#routeB').getAttribute('class')).then((value) => value.includes('blocked')), true, 'Stair B route did not become unavailable.');
    await expectText('#narrativeCaption', /Scripted smoke removes Stair B/i, 'route-change narrative');

    await advanceGuide(guidedTitles[4], guidedTitles[5], 520);
    await expectText('#traceInspector', /Why this call.*Input.*Output/i, 'route-comparison trace');
    await expectText('#traceInspector', /Stair A/i, 'route-comparison output');

    await advanceGuide(guidedTitles[5], guidedTitles[6], 500);
    assert.equal(await guarded(locator('[data-action-id="reroute"]').getAttribute('class')).then((value) => value.includes('recorded')), true, 'The Stair A team decision was not recorded.');

    await clickVisible('#resetPlanView', 'Reset floor-plan view');
    await guarded(page.waitForFunction(() => document.querySelector('#floorZoomLabel')?.textContent === '100%', null, { timeout: 5_000 }));
    await visiblePause(550, 'settling the full floor plan before drawing');
    await clickVisible('#drawRouteButton', 'Draw a route');
    await expectText('#drawRouteButton', /Drawing… release to analyze/, 'route drawing mode');
    await visiblePause(350, 'showing route drawing mode');
    await scrollToElement('#floorView', 'start');

    const planBox = await guarded(locator('#floorPlan').boundingBox());
    assert.ok(planBox, 'The Floor 07 SVG has no drawable bounding box.');
    assert.ok(planBox.width > 800 && planBox.height > 500, `Unexpected floor-plan bounds: ${JSON.stringify(planBox)}`);
    assert.ok(
      planBox.y >= 0 && planBox.y + planBox.height <= CAPTURE_HEIGHT,
      `The complete drawing surface must be inside the recorded viewport: ${JSON.stringify(planBox)}`,
    );

    const routePoint = (xRatio, yRatio) => ({
      x: planBox.x + planBox.width * xRatio,
      y: planBox.y + planBox.height * yRatio,
    });
    const route = [
      routePoint(0.78, 0.65),
      routePoint(0.64, 0.68),
      routePoint(0.47, 0.72),
      routePoint(0.34, 0.76),
      routePoint(0.23, 0.79),
    ];

    await guarded(page.mouse.move(route[0].x, route[0].y));
    await guarded(page.mouse.down());
    for (const point of route.slice(1)) {
      await guarded(page.mouse.move(point.x, point.y, { steps: 5 }));
      await visiblePause(320, 'revealing the drawn route');
    }
    await guarded(page.mouse.up());
    await expectVisible('#userRoute.active', 'drawn route');
    await expectVisible('#routeReceipt', 'route analysis receipt');
    await expectText('#routeReceipt', /Route analysis receipt.*Stair A.*Reaches exit.*Available in scenario/i, 'route receipt');
    await expectText('#planGesture', /reaches Stair A/i, 'route verdict');
    await expectText('#runtimeEvents', /Analyze drawn route/i, 'route trace event');
    await expectText('#traceInspector', /Why this call.*Input.*Output/i, 'drawn-route trace detail');
    await visiblePause(650, 'showing the route receipt and inspectable trace');

    await clickVisible('#crewStrip .crew-member:nth-child(4)', 'S. Tan fictional responder card');
    await expectVisible('#personDialog', 'fictional responder profile');
    await expectText('#personDialog', /Fictional exercise profile.*S\. Tan.*Facilitator-confirmed actions only/i, 'fictional responder profile');
    await visiblePause(650, 'showing the fictional responder profile');
    await clickVisible('#closePerson', 'Close fictional responder profile');
    await expectHidden('#personDialog', 'closed fictional responder profile');
    await visiblePause(400, 'returning to the floor plan');

    await scrollToElement('#guidedBrief', 'start');
    await advanceGuide(guidedTitles[6], guidedTitles[7], 550);
    assert.equal(await guarded(locator('#assistance').getAttribute('class')).then((value) => value.includes('active')), true, 'The assistance gap was not revealed.');
    await expectText('#coveragePanel', /responsibility gap/i, 'revealed responsibility gap');

    await advanceGuide(guidedTitles[7], guidedTitles[8], 550);
    assert.equal(await guarded(locator('#assistance').getAttribute('class')).then((value) => value.includes('resolved')), true, 'The assistance marker did not become resolved.');
    await expectText('#crewStrip', /Mobility assistance.*S\. Tan.*Assigned during exercise/i, 'assigned assistance owner');

    await advanceGuide(guidedTitles[8], guidedTitles[9], 500);
    assert.equal(await guarded(locator('[data-action-id="account"]').getAttribute('class')).then((value) => value.includes('recorded')), true, 'Assembly accounting was not recorded.');

    await advanceGuide(guidedTitles[9], guidedTitles[10], 550);
    await expectText('#coveragePanel', /Every active inject has an owner/i, 'clear coverage result');

    await advanceGuide(guidedTitles[10], guidedTitles[11], 600);
    await expectVisible('#reportPanel', 'staged after-action report');
    await expectText('#statusDot', /^Review$/i, 'human review status');
    await expectText('#simulationLabel', /paused for review/i, 'review pause');
    await expectText('#reportPanel', /Ready for human review.*Every active problem has an owner/i, 'human-review-ready report');
    await scrollToElement('#reportPanel', 'center');

    const approveButton = await expectVisible('#approveButton', 'human approval button');
    assert.equal(await guarded(approveButton.isEnabled()), true, 'The human approval button should be available, but untouched.');
    assert.equal(await guarded(locator('.report-sheet').getAttribute('class')).then((value) => value.includes('approved')), false, 'The report was auto-approved.');
    assert.doesNotMatch(await guarded(locator('#runtimeEvents').innerText()), /Human approval/i, 'A human approval event was recorded.');
    assert.doesNotMatch(await guarded(locator('#reportPanel').innerText()), /Human approved/i, 'The report claims human approval.');
    await expectText('#guidedTitle', guidedTitles[11], 'final guided state');
    assertRuntimeHealthy();
    await visiblePause(700, 'holding on the human-review-ready report');

    await guarded(context.close());
    context = null;
    await video.saveAs(stagedCapture);
    const capture = verifyCapture(stagedCapture);

    await fsp.mkdir(path.dirname(outputPath), { recursive: true });
    await fsp.rename(stagedCapture, outputPath);

    process.stdout.write(`PASS · guided Muster interaction captured without human approval\n`);
    process.stdout.write(`PASS · ${capture.width}x${capture.height} ${capture.codec} WebM · ${capture.bytes} bytes\n`);
    process.stdout.write(`${outputPath}\n`);
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
