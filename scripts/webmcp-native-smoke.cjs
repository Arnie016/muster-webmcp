const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const target = process.env.MUSTER_URL || 'http://127.0.0.1:4179';
const chromePath = process.env.MUSTER_CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: process.env.MUSTER_HEADLESS === '1',
    args: [
      '--enable-experimental-web-platform-features',
      '--enable-features=WebMCPTesting,DevToolsWebMCPSupport',
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(target, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => /WebMCP live/i.test(document.querySelector('#runtimeConnection')?.textContent || ''));

    const probe = await page.evaluate(async () => {
      const registered = await document.modelContext.getTools();
      return {
        documentModelContext: typeof document.modelContext,
        registerTool: typeof document.modelContext?.registerTool,
        getTools: typeof document.modelContext?.getTools,
        executeTool: typeof document.modelContext?.executeTool,
        toolNames: registered.map((tool) => tool.name),
        tools: registered.map((tool) => ({
          name: tool.name,
          title: tool.title,
          inputSchema: typeof tool.inputSchema === 'string' ? JSON.parse(tool.inputSchema) : tool.inputSchema,
          annotations: tool.annotations,
        })),
      };
    });

    assert.equal(probe.documentModelContext, 'object');
    assert.equal(probe.registerTool, 'function');
    assert.equal(probe.getTools, 'function');
    assert.equal(probe.executeTool, 'function');
    assert.equal(probe.toolNames.length, 20);
    assert.ok(probe.toolNames.includes('run_drill_manager'));
    assert.ok(probe.toolNames.includes('read_plan'));
    assert.ok(probe.toolNames.includes('stage_report'));
    if (process.env.MUSTER_DEBUG_WEBMCP === '1') console.log(JSON.stringify(probe.tools, null, 2));
    assert.ok(probe.tools.every((tool) => typeof tool.title === 'string' && tool.title.length > 0));
    assert.ok(probe.tools.every((tool) => tool.inputSchema?.additionalProperties === false));
    assert.ok(probe.tools.every((tool) => tool.annotations?.untrustedContentHint === false));

    const rawResult = await page.evaluate(async () => {
      const tools = await document.modelContext.getTools();
      const readPlan = tools.find((tool) => tool.name === 'read_plan');
      return document.modelContext.executeTool(readPlan, '{}');
    });
    const result = typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult;
    const resultText = JSON.stringify(result);
    assert.match(resultText, /Meridian Exchange/);
    assert.match(resultText, /training_only/);
    assert.match(await page.locator('#runtimeEvents').innerText(), /Read plan/i);
    assert.match(await page.locator('#runtimeConnection').innerText(), /WebMCP live/i);
    assert.equal(await page.locator('#guidedStepIndex').innerText(), '02');
    assert.match(await page.locator('#phaseGuide').innerText(), /Mission stage 2 of 5/i);
    assert.match(await page.locator('#traceInspector').innerText(), /Why this call[\s\S]*Visible change[\s\S]*Input[\s\S]*Output/i);
    assert.match(await page.locator('#traceInspector').innerText(), /plan_version/i);
    assert.match(await page.locator('.runtime-event.selected time').innerText(), /^\d+ ms$/i);

    const rawManagerResult = await page.evaluate(async () => {
      const tools = await document.modelContext.getTools();
      const manager = tools.find((tool) => tool.name === 'run_drill_manager');
      return document.modelContext.executeTool(manager, JSON.stringify({ intent: 'orient' }));
    });
    const managerResult = typeof rawManagerResult === 'string' ? JSON.parse(rawManagerResult) : rawManagerResult;
    assert.match(JSON.stringify(managerResult), /incident_commander/);
    assert.match(await page.locator('#runtimeEvents').innerText(), /Route one mission intent/i);
    assert.match(await page.locator('#traceInspector').innerText(), /Incident Commander[\s\S]*orient[\s\S]*Output/i);

    const nativeRehearsal = await page.evaluate(async () => {
      const registered = await document.modelContext.getTools();
      const toolsByName = new Map(registered.map((tool) => [tool.name, tool]));
      const run = async (name, input = {}) => {
        const raw = await document.modelContext.executeTool(toolsByName.get(name), JSON.stringify(input));
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      };
      const steps = [
        ['start_drill', {}],
        ['inspect_zone', { zone_id: 'studio' }],
        ['send_inject', { inject_id: 'stair' }],
        ['compare_routes', { zone_id: 'studio' }],
        ['record_action', { action_id: 'reroute' }],
        ['send_inject', { inject_id: 'roster' }],
        ['record_action', { action_id: 'assist' }],
        ['record_action', { action_id: 'account' }],
      ];
      const receipts = [];
      for (const [name, input] of steps) receipts.push({ name, output: await run(name, input) });
      const review = await run('run_drill_manager', { intent: 'prepare_review' });
      return { receipts, review };
    });

    assert.equal(nativeRehearsal.receipts.length, 8);
    assert.equal(nativeRehearsal.review.staged, true);
    assert.equal(nativeRehearsal.review.human_approval_required, true);
    assert.match(await page.locator('#guidedBrief').getAttribute('aria-label'), /Human review ready/i);
    assert.match(await page.locator('#phaseGuide').innerText(), /Mission stage 5 of 5/i);
    assert.match(await page.locator('#reportPanel').innerText(), /Ready for human review/i);
    assert.equal(await page.locator('#approveButton').isEnabled(), true);
    assert.match(await page.locator('#traceInspector').innerText(), /Incident Commander[\s\S]*prepare_review[\s\S]*staged[\s\S]*cannot[\s\S]*approve the report/i);
    assert.match(await page.locator('#runtimeEvents').innerText(), /Prepare review[\s\S]*Check responsibilities/i);
    assert.deepEqual(errors, []);

    await page.screenshot({ path: path.join(root, 'docs', 'screenshots', 'muster-native-webmcp.png'), fullPage: false });
    console.log(`PASS · Native document.modelContext registered ${probe.toolNames.length} tools in Chrome`);
    const spatialReceipt = await page.evaluate(async () => {
      const tools = await document.modelContext.getTools();
      const run = async (name,input) => {const raw=await document.modelContext.executeTool(tools.find(t=>t.name===name),JSON.stringify(input));return typeof raw==='string'?JSON.parse(raw):raw;};
      const room=await run('read_room_profile',{room_id:'studio',view:'3d'});
      const equipment=await run('read_equipment',{item_id:'MCP-07-L1',view:'3d'});
      const route=await run('compare_routes',{zone_id:'studio',preview_exit:'B',checkpoint:4,view:'3d'});
      return {room,equipment,route};
    });
    assert.equal(spatialReceipt.room.spatial_profile.width,13.1);
    assert.equal(spatialReceipt.equipment.selected_item,'MCP-07-L1');
    assert.equal(spatialReceipt.route.displayed_checkpoint,3);
    assert.equal(spatialReceipt.route.walkthrough.available,false);
    assert.equal(spatialReceipt.route.preview_only,true);
    assert.ok(await page.locator('#interiorView').isVisible());
    assert.match(await page.locator('#interiorCaption').innerText(),/Stop: unavailable/);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('muster-demo-state-v2')).approved),false);
    console.log('PASS · Native tools opened a 3D room, focused the call point, and clamped the blocked-route preview without approval');
    console.log('PASS · document.modelContext.executeTool ran read_plan and changed the visible trace');
    console.log('PASS · Native manager intent routed named page tools into one inspectable receipt');
    console.log('PASS · Native page tools completed the consequential rehearsal and stopped at human approval');
    await page.locator('#resetButton').click();
    const handoff=await page.evaluate(async()=>{
      const tools=await document.modelContext.getTools();
      const run=async(name,input={})=>{const raw=await document.modelContext.executeTool(tools.find(t=>t.name===name),JSON.stringify(input));return typeof raw==='string'?JSON.parse(raw):raw;};
      await run('start_drill');
      const proposal=await run('prepare_team_handoff',{person_id:'responder-s-tan',room_id:'studio',task:'assistance_brief'});
      const register=await run('read_floor_register');
      return {proposal,register,names:tools.map(t=>t.name)};
    });
    assert.equal(handoff.proposal.requires_human_confirmation,true);
    assert.equal(handoff.register.team_positions.find(p=>p.id==='responder-s-tan').room_id,'west');
    assert.ok(!handoff.names.some(n=>/confirm.*handoff|confirm.*assignment/.test(n)));
    assert.equal(await page.locator('#teamConfirm').isEnabled(),true);
    await page.locator('#teamConfirm').click();
    const readback=await page.evaluate(async()=>{const tools=await document.modelContext.getTools();const raw=await document.modelContext.executeTool(tools.find(t=>t.name==='read_status_board'),'{}');return typeof raw==='string'?JSON.parse(raw):raw;});
    assert.equal(readback.team_assignments.length,1);assert.equal(readback.team_assignments[0].arrived,false);
    assert.equal(readback.team_positions.find(p=>p.id==='responder-s-tan').room_id,'studio');
    assert.deepEqual(errors,[]);
    console.log('PASS · Native agent proposed a handoff, human confirmed, and native tool read back the shared assignment');
    await page.locator('#resetButton').click();
    await page.evaluate(async()=>{
      const tools=await document.modelContext.getTools();
      const run=(name,input={})=>document.modelContext.executeTool(tools.find(t=>t.name===name),JSON.stringify(input));
      await run('read_plan');await run('start_drill');
      await run('send_inject',{inject_id:'stair'});await run('record_action',{action_id:'reroute'});
      await run('send_inject',{inject_id:'roster'});await run('record_action',{action_id:'assist'});
      await run('record_action',{action_id:'account'});await run('stage_report');
    });
    assert.match(await page.locator('#guidedBrief').getAttribute('aria-label'),/Human review ready/);
    await page.locator('#deckNextButton').click();
    await page.locator('#agentPrompt').fill('What do I do next?');await page.locator('#agentForm button').click();
    await page.waitForFunction(()=>!document.querySelector('#agentForm button').disabled);
    assert.match(await page.locator('#conversationHistory').innerText(),/The draft is ready/);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('muster-demo-state-v2')).approved),false);
    assert.deepEqual(errors,[]);
    console.log('PASS · A native route that skips optional guide inspections still leads to human review, not an earlier step');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
