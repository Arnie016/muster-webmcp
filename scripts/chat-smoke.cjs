const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const url = process.env.MUSTER_URL || 'http://127.0.0.1:4179';
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.locator('#launchScenarioButton').click();
      const initialState = await page.evaluate(() => JSON.parse(localStorage.getItem('muster-demo-state-v2')));
      await page.locator('#openChatButton').click();
      assert.ok(await page.locator('#conversationDialog').isVisible());
      const ask = async (q, pattern) => {
        await page.locator('#agentPrompt').fill(q);
        await page.locator('#agentForm button').click();
        await page.waitForFunction(() => !document.querySelector('#agentForm button').disabled);
        const answer = await page.locator('.conversation-turn.assistant').last().innerText();
        assert.match(answer, pattern, q);
        return answer;
      };
      await ask('swaht is the floor', /Floor 07.*active drill floor/s);
      await ask('where is the extinguisher', /EX-07-W1.*Meeting suite threshold/s);
      assert.equal(await page.locator('#dossierDialog').evaluate((e) => e.open), false);
      await ask('how many people', /84 people.*West workplace: 29.*Studio: 6/s);
      await ask('Who is in charge?', /Fire Safety Manager: A. Rahman/);
      await ask('why is the fire spreading', /no measured fire-spread rate/);
      await ask('what do I do next', /Next: Inspect the Studio/);
      const actionCount = await page.evaluate(() => JSON.parse(localStorage.getItem('muster-demo-state-v2')).decisions.length);
      await ask('approve the report', /Typing here will not reset/);
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('muster-demo-state-v2')).decisions.length), actionCount);
      await ask('favourite movie', /did not match.*No tool was called/s);
      assert.equal(await page.locator('.conversation-turn.user').filter({ hasText: 'swaht is the floor' }).count(), 1);
      assert.ok(await page.locator('.conversation-turn.user').count() >= 8);
      await page.locator('#conversationHistory').evaluate((el) => { el.scrollTop = 0; });
      const beforeScroll = await page.locator('#conversationHistory').evaluate((el) => el.scrollTop);
      await page.waitForTimeout(250);
      assert.equal(await page.locator('#conversationHistory').evaluate((el) => el.scrollTop), beforeScroll);
      const receipts = page.locator('.turn-calls details').filter({ hasText: 'read_equipment' });
      await receipts.first().locator('summary').click();
      assert.match(await receipts.first().innerText(), /Input.*Output.*EX-07-W1/s);
      await receipts.first().scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(__dirname, '..', 'docs/screenshots', `muster-chat-${width}.png`) });
      assert.ok(await page.locator('#conversationDialog').evaluate((el) => el.scrollWidth <= el.clientWidth + 1));
      assert.ok(await page.locator('#conversationHistory').evaluate((el) => el.clientHeight >= 160));
      await page.locator('#conversationExpand').click();
      const afterQueries = await page.evaluate(() => JSON.parse(localStorage.getItem('muster-demo-state-v2')));
      assert.equal(afterQueries.status, initialState.status);
      assert.deepEqual(afterQueries.injectIds, initialState.injectIds);
      // Guide me must preserve the run, not silently reset it.
      await page.locator('[data-agent-prompt="rehearse"]').click();
      await page.waitForFunction(() => !document.querySelector('#agentForm button').disabled);
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('muster-demo-state-v2')).injectIds), initialState.injectIds);
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('.conversation-turn.user').filter({ hasText: 'swaht is the floor' }).count(), 1);
      // Ordinary scrolling is not zooming. Buttons explicitly zoom.
      await page.locator('#floorViewport').dispatchEvent('wheel', { deltaY: -200 });
      assert.equal(await page.locator('#floorZoomLabel').innerText(), '100%');
      await page.locator('#zoomInPlan').click();
      assert.equal(await page.locator('#floorZoomLabel').innerText(), '120%');
      await page.locator('#resetPlanView').click();
      await page.locator('#deckNextButton').click();
      await page.waitForFunction(() => /Block Stair B/.test(document.querySelector('#deckNextButton').textContent));
      await page.locator('#deckNextButton').click();
      await page.waitForFunction(() => /Compare routes/.test(document.querySelector('#deckNextButton').textContent));
      await page.locator('#openChatButton').click();
      await ask('which route from the studio', /Stair B: 18 m, unavailable.*Stair A: 30.1 m, available/s);
      await page.locator('#conversationExpand').click();
      // Complete the remaining workflow using only the always-available next button.
      for (let i = 0; i < 9; i++) {
        if (await page.locator('#deckNextButton').innerText() === 'Review and approve →') break;
        await page.locator('#deckNextButton').click();
        await page.waitForFunction(() => !document.querySelector('#deckNextButton').disabled);
      }
      const final = await page.evaluate(() => JSON.parse(localStorage.getItem('muster-demo-state-v2')));
      assert.equal(final.status, 'review');
      assert.equal(final.approved, false);
      assert.equal(final.decisions.length, 3);
      assert.deepEqual(errors, []);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      console.log(`Chat ${width}px passed: distinct answers, receipts, full history, reload, non-destructive guide, scroll, next actions, human approval preserved.`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
