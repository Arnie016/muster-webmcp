import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  Video,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Focus = {x: number; y: number; scale: number};
type Scene = {
  id: string;
  type: 'why' | 'card' | 'proof' | 'live' | 'architecture' | 'runtime' | 'trace' | 'report' | 'ledger' | 'cta';
  start: number;
  end: number;
  asset?: string;
  secondaryAsset?: string;
  headline: string;
  support: string;
  narration: string;
  focus?: Focus;
  videoStartSeconds?: number;
};

export type Manifest = {
  project: {title: string; fps: number; durationSeconds: number};
  scenes: Scene[];
  audio: {enabled: boolean; source: string};
  cta: {label: string; url: string};
  architecture: {authorityBoundary: string};
  toolContractProof: {boundedPageTools: number; totalToolContracts: number};
};

type MusterDemoProps = {manifest: Manifest};

const palette = {
  ink: '#070a08',
  panel: '#10150f',
  panel2: '#151b14',
  paper: '#f4f0e6',
  muted: '#a3a99e',
  faint: '#657066',
  line: '#303a31',
  orange: '#ff663d',
  amber: '#f1c75b',
  green: '#99eb87',
  cyan: '#91ead9',
  red: '#ff6969',
};

const base: React.CSSProperties = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: palette.paper,
};

const Mono: React.FC<React.PropsWithChildren<{style?: React.CSSProperties}>> = ({children, style}) => (
  <span style={{fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.045em', ...style}}>{children}</span>
);

const revealAt = (frame: number, fps: number, delay: number, stiffness = 120) =>
  spring({frame: frame - delay, fps, config: {damping: 18, stiffness}});

const BrandBar: React.FC<{sceneId: string}> = ({sceneId}) => (
  <div style={{position: 'absolute', left: 56, top: 38, right: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 30}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 13}}>
      <div style={{width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center', background: palette.orange, color: palette.ink, fontWeight: 950}}>M</div>
      <strong style={{fontSize: 23}}>Muster</strong>
    </div>
    <Mono style={{fontSize: 13, color: palette.muted}}>FICTIONAL FIRE-DRILL TRAINING · {sceneId.toUpperCase()}</Mono>
  </div>
);

const Kicker: React.FC<React.PropsWithChildren> = ({children}) => (
  <Mono style={{fontSize: 14, color: palette.cyan, fontWeight: 800}}>{children}</Mono>
);

const Caption: React.FC<{headline: string; support: string; width?: number}> = ({headline, support, width = 1020}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = revealAt(frame, fps, 0);
  return (
    <div style={{position: 'absolute', left: 66, bottom: 52, width, padding: '25px 30px 23px', borderRadius: 22, background: 'rgba(7,10,8,0.94)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 24px 80px rgba(0,0,0,0.42)', transform: `translateY(${(1 - enter) * 20}px)`, opacity: enter, zIndex: 30}}>
      <h1 style={{margin: 0, fontSize: 54, lineHeight: 1.02, letterSpacing: '-0.045em'}}>{headline}</h1>
      <p style={{margin: '11px 0 0', color: palette.muted, fontSize: 21, lineHeight: 1.35}}>{support}</p>
    </div>
  );
};

const ProofScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const focus = scene.focus ?? {x: 50, y: 50, scale: 1};
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = focus.scale * (1 + progress * 0.018);
  return (
    <AbsoluteFill style={{...base, background: palette.ink, overflow: 'hidden'}}>
      <Img src={staticFile(scene.asset ?? '')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focus.x}% ${focus.y}%`, transform: `scale(${scale})`, filter: 'saturate(1.06) contrast(1.06)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,5,0.25) 0%, transparent 46%, rgba(5,7,5,0.78) 100%)'}} />
      <BrandBar sceneId={scene.id} />
      <Caption headline={scene.headline} support={scene.support} />
    </AbsoluteFill>
  );
};

const WhyScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const second = interpolate(frame, [fps * 2.7, fps * 3.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const enter = revealAt(frame, fps, 2, 90);
  return (
    <AbsoluteFill style={{...base, background: palette.ink, overflow: 'hidden'}}>
      <Img src={staticFile(scene.asset ?? '')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.025)', opacity: 1 - second}} />
      {scene.secondaryAsset ? <Img src={staticFile(scene.secondaryAsset)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.025)', opacity: second}} /> : null}
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(4,7,6,.92) 0%, rgba(4,7,6,.64) 36%, rgba(4,7,6,.08) 72%), linear-gradient(0deg, rgba(4,7,6,.62), transparent 48%)'}} />
      <div style={{position: 'absolute', left: 82, top: 100, width: 720, opacity: enter, transform: `translateY(${(1 - enter) * 18}px)`}}>
        <Kicker>WHY MUSTER</Kicker>
        <h1 style={{fontSize: 82, lineHeight: 0.97, letterSpacing: '-0.06em', margin: '20px 0 20px'}}>{scene.headline}</h1>
        <p style={{fontSize: 25, color: '#d0d3cb', lineHeight: 1.42, maxWidth: 650}}>{scene.support}</p>
      </div>
      <div style={{position: 'absolute', left: 82, bottom: 58, display: 'flex', alignItems: 'center', gap: 12, color: palette.paper}}><span style={{width: 11, height: 11, borderRadius: 99, background: palette.orange, boxShadow: `0 0 20px ${palette.orange}`}} /><strong style={{fontSize: 18}}>Prepare together before conditions change.</strong></div>
    </AbsoluteFill>
  );
};

const CardScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = revealAt(frame, fps, 0, 105);
  const line = interpolate(frame, [0, Math.max(1, fps * 0.75)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{...base, background: palette.ink, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <div style={{position: 'absolute', width: 720, height: 720, borderRadius: '50%', border: `1px solid ${palette.line}`, opacity: 0.45, transform: `scale(${0.86 + line * 0.18})`}} />
      <div style={{width: 1160, textAlign: 'center', opacity: enter, transform: `translateY(${(1 - enter) * 18}px)`}}>
        <Mono style={{fontSize: 14, color: palette.orange}}>MUSTER · ONE DECISION AT A TIME</Mono>
        <h1 style={{margin: '22px 0 0', fontSize: 86, lineHeight: 0.94, letterSpacing: '-0.06em'}}>{scene.headline}</h1>
        <p style={{margin: '24px auto 0', maxWidth: 860, color: palette.muted, fontSize: 22, lineHeight: 1.4}}>{scene.support}</p>
      </div>
      <div style={{position: 'absolute', bottom: 72, left: 480, right: 480, height: 2, background: `linear-gradient(90deg, transparent, ${palette.orange} ${line * 50}%, ${palette.cyan} ${line * 100}%, transparent)`}} />
    </AbsoluteFill>
  );
};

const LiveScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{...base, background: '#030504'}}>
      <div style={{position: 'absolute', inset: 18, overflow: 'hidden', borderRadius: 18, border: `1px solid ${palette.line}`, boxShadow: '0 24px 90px rgba(0,0,0,.55)'}}>
        <Video
          src={staticFile(scene.asset ?? '')}
          startFrom={Math.round((scene.videoStartSeconds ?? 0) * fps)}
          volume={0}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </div>
      <div style={{position: 'absolute', left: 38, top: 38, padding: '9px 12px', borderRadius: 999, background: 'rgba(4,8,6,.88)', border: `1px solid ${palette.cyan}`, color: palette.cyan}}><Mono style={{fontSize: 12}}>REAL GUIDED PAGE CAPTURE</Mono></div>
      <div style={{position: 'absolute', right: 38, bottom: 38, padding: '10px 13px', borderRadius: 10, background: 'rgba(4,8,6,.9)', border: `1px solid ${palette.line}`, color: palette.muted}}><Mono style={{fontSize: 11}}>MANUAL PAGE MODE · SOURCE-DEFINED WEBMCP CONTRACTS</Mono></div>
    </AbsoluteFill>
  );
};

const FlowArrow: React.FC<{left: number; top: number; width: number; delay: number; color?: string}> = ({left, top, width, delay, color = palette.line}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const amount = revealAt(frame, fps, delay, 95);
  return (
    <div style={{position: 'absolute', left, top, width, height: 2, background: `linear-gradient(90deg, ${color} ${amount * 100}%, rgba(255,255,255,0.08) ${amount * 100}%)`}}>
      <div style={{position: 'absolute', right: -2, top: -5, width: 10, height: 10, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}`, transform: 'rotate(45deg)', opacity: amount}} />
      <div style={{position: 'absolute', left: `${Math.min(96, amount * 100)}%`, top: -4, width: 10, height: 10, borderRadius: 99, background: color, boxShadow: `0 0 20px ${color}`}} />
    </div>
  );
};

const ArchitectureScene: React.FC<{scene: Scene; authorityBoundary: string}> = ({scene, authorityBoundary}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const show = (delay: number) => revealAt(frame, fps, delay, 105);
  const calls = [
    ['inspect_zone', 'Studio · 6 people', palette.cyan],
    ['compare_routes', 'Stair B blocked', palette.red],
    ['check_coverage', '1 owner missing', palette.amber],
  ] as const;
  return (
    <AbsoluteFill style={{...base, background: `radial-gradient(circle at 53% 48%, #182119 0%, ${palette.ink} 65%)`}}>
      <BrandBar sceneId={scene.id} />
      <div style={{position: 'absolute', left: 84, top: 122, right: 84}}>
        <Kicker>ONE REQUEST · ONE SHARED STATE</Kicker>
        <h1 style={{fontSize: 64, lineHeight: 1, letterSpacing: '-0.052em', margin: '14px 0 0'}}>{scene.headline}</h1>
        <p style={{fontSize: 21, color: palette.muted, margin: '13px 0 0'}}>{scene.support}</p>
      </div>

      <div style={{position: 'absolute', left: 84, top: 340, width: 382, height: 390, padding: 26, borderRadius: 24, border: `1px solid ${palette.line}`, background: palette.panel, opacity: show(0), transform: `translateY(${(1 - show(0)) * 18}px)`}}>
        <Kicker>FACILITATOR</Kicker>
        <div style={{marginTop: 22, padding: '22px 22px', borderRadius: 17, background: '#1b201a', border: `1px solid ${palette.faint}`, fontSize: 25, lineHeight: 1.35}}>
          “Stair B is blocked.<br />Check the Studio route.”
        </div>
        <div style={{position: 'absolute', left: 26, right: 26, bottom: 24, display: 'flex', alignItems: 'center', gap: 12, color: palette.amber}}>
          <span style={{width: 11, height: 11, borderRadius: 99, background: palette.amber}} />
          <strong style={{fontSize: 18}}>Human starts the change</strong>
        </div>
      </div>

      <FlowArrow left={470} top={524} width={135} delay={4} color={palette.orange} />

      <div style={{position: 'absolute', left: 610, top: 318, width: 475, height: 435, padding: 28, borderRadius: 26, border: `2px solid ${palette.orange}`, background: '#17130f', opacity: show(5), boxShadow: '0 25px 80px rgba(0,0,0,0.35)'}}>
        <Kicker>INCIDENT COMMANDER</Kicker>
        <h2 style={{fontSize: 32, margin: '12px 0 19px'}}>Routes the request</h2>
        <div style={{display: 'grid', gap: 12}}>
          {calls.map(([tool, result, color], index) => (
            <div key={tool} style={{display: 'grid', gridTemplateColumns: '12px 1fr', gap: 13, alignItems: 'center', padding: '15px 16px', borderRadius: 14, border: `1px solid ${palette.line}`, background: palette.panel, opacity: show(10 + index * 8), transform: `translateX(${(1 - show(10 + index * 8)) * 24}px)`}}>
              <span style={{width: 10, height: 10, borderRadius: 99, background: color, boxShadow: `0 0 18px ${color}`}} />
              <div><Mono style={{fontSize: 14, color}}>{tool}</Mono><strong style={{display: 'block', marginTop: 4, fontSize: 19}}>{result}</strong></div>
            </div>
          ))}
        </div>
      </div>

      <FlowArrow left={1090} top={524} width={135} delay={24} color={palette.green} />

      <div style={{position: 'absolute', left: 1230, top: 292, width: 606, height: 486, borderRadius: 26, border: `1px solid ${palette.green}`, background: '#0d160e', opacity: show(25), overflow: 'hidden'}}>
        <div style={{padding: '22px 24px', borderBottom: `1px solid ${palette.line}`, display: 'flex', justifyContent: 'space-between'}}>
          <Kicker>SAME VISIBLE FLOOR</Kicker><Mono style={{fontSize: 13, color: palette.green}}>UPDATED</Mono>
        </div>
        <div style={{padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13}}>
          {[['ZONE', 'Studio · 6'], ['EXIT', 'Stair B blocked'], ['ROUTE', '18 m to Stair A'], ['OWNER', 'Needs assignment']].map(([label, value], index) => (
            <div key={label} style={{padding: '18px 17px', borderRadius: 14, border: `1px solid ${palette.line}`, background: palette.panel, opacity: show(28 + index * 4)}}>
              <Mono style={{fontSize: 12, color: palette.faint}}>{label}</Mono><strong style={{display: 'block', marginTop: 7, fontSize: 20}}>{value}</strong>
            </div>
          ))}
        </div>
        <div style={{margin: '2px 24px 0', padding: '18px 19px', borderRadius: 14, background: '#1a180f', border: `1px solid ${palette.amber}`}}>
          <strong style={{fontSize: 19}}>Human decision still required</strong>
          <span style={{display: 'block', color: palette.muted, marginTop: 6}}>Assign the assistance owner, then approve the report.</span>
        </div>
      </div>

      <div style={{position: 'absolute', left: 84, right: 84, bottom: 58, padding: '17px 24px', borderRadius: 15, background: palette.paper, color: palette.ink, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: show(38)}}>
        <strong style={{fontSize: 21}}>{authorityBoundary}</strong>
        <Mono style={{fontSize: 13}}>NO ALARMS · NO DISPATCH · NO AUTONOMOUS APPROVAL</Mono>
      </div>
    </AbsoluteFill>
  );
};

const MiniFloor: React.FC<{stage: number}> = ({stage}) => {
  const safe = stage >= 3;
  const blocked = stage >= 2;
  return (
    <div style={{position: 'relative', height: 470, borderRadius: 20, border: `1px solid ${palette.line}`, backgroundColor: '#0a0d0a', backgroundImage: 'linear-gradient(rgba(137,160,138,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(137,160,138,.06) 1px, transparent 1px)', backgroundSize: '28px 28px', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 42, right: 42, top: 42, bottom: 42, border: '3px solid #6d746b'}} />
      <div style={{position: 'absolute', left: 42, top: 210, width: 420, borderTop: '3px solid #6d746b'}} />
      <div style={{position: 'absolute', left: 462, top: 42, bottom: 42, borderLeft: '3px solid #6d746b'}} />
      <div style={{position: 'absolute', left: 62, top: 233, color: palette.muted}}><Mono>STUDIO · 6</Mono></div>
      <div style={{position: 'absolute', left: 70, bottom: 68, padding: '14px 28px', borderRadius: 10, border: `1px solid ${palette.green}`, color: palette.green}}>STAIR A</div>
      <div style={{position: 'absolute', right: 69, bottom: 68, padding: '14px 28px', borderRadius: 10, border: `1px solid ${blocked ? palette.red : palette.green}`, color: blocked ? palette.red : palette.green, background: blocked ? 'rgba(255,105,105,.09)' : 'transparent'}}>STAIR B</div>
      <div style={{position: 'absolute', left: 215, top: 256, width: 18, height: 18, borderRadius: 99, background: palette.orange, boxShadow: `0 0 30px ${palette.orange}`}} />
      {blocked ? <div style={{position: 'absolute', right: 125, bottom: 86, width: 82, borderTop: `4px solid ${palette.red}`, transform: 'rotate(-24deg)'}} /> : null}
      {safe ? (
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
          <path d="M224 266 C190 300, 185 338, 155 370" fill="none" stroke={palette.green} strokeWidth="7" strokeDasharray="14 10" />
          <circle cx="155" cy="370" r="8" fill={palette.green} />
        </svg>
      ) : blocked ? (
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
          <path d="M224 266 C340 296, 505 318, 655 372" fill="none" stroke={palette.red} strokeWidth="7" strokeDasharray="14 10" />
        </svg>
      ) : null}
    </div>
  );
};

const RuntimeScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stage = frame < 45 ? 0 : frame < 105 ? 1 : frame < 175 ? 2 : frame < 245 ? 3 : 4;
  const prompt = 'Stair B is blocked. Check the Studio route.';
  const typed = prompt.slice(0, Math.floor(interpolate(frame, [3, 47], [0, prompt.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const tools = [
    ['inspect_zone', 'Studio · 6 people · 2 assisted', 70],
    ['compare_routes', 'Stair B unavailable', 116],
    ['analyze_route_sketch', '18 m · endpoint Stair A', 184],
  ] as const;
  return (
    <AbsoluteFill style={{...base, background: palette.ink}}>
      <BrandBar sceneId={scene.id} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 118, bottom: 54, display: 'grid', gridTemplateColumns: '0.95fr 1.24fr', gap: 26}}>
        <div style={{display: 'flex', flexDirection: 'column', minWidth: 0}}>
          <Kicker>LIVE RUNTIME BENCH</Kicker>
          <h1 style={{fontSize: 58, lineHeight: 1, letterSpacing: '-0.05em', margin: '13px 0 24px'}}>{scene.headline}</h1>
          <div style={{padding: 24, borderRadius: 20, border: `1px solid ${palette.line}`, background: palette.panel}}>
            <Mono style={{fontSize: 12, color: palette.faint}}>YOU</Mono>
            <div style={{fontSize: 24, lineHeight: 1.4, marginTop: 9, minHeight: 70}}>{typed}<span style={{color: palette.orange}}>|</span></div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 13}}>
              <Mono style={{fontSize: 12, color: palette.muted}}>SAME OPEN PAGE</Mono>
              <div style={{width: 46, height: 46, borderRadius: 13, display: 'grid', placeItems: 'center', background: frame > 43 ? palette.orange : palette.line, color: palette.ink, fontSize: 24, fontWeight: 900}}>→</div>
            </div>
          </div>
          <div style={{marginTop: 18, padding: 22, borderRadius: 20, border: `1px solid ${stage >= 1 ? palette.orange : palette.line}`, background: '#15130f', minHeight: 278}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div><Mono style={{fontSize: 12, color: palette.orange}}>INCIDENT COMMANDER</Mono><strong style={{display: 'block', marginTop: 6, fontSize: 22}}>{stage === 0 ? 'Waiting for a request' : stage < 4 ? 'Checking the visible plan…' : 'Alternate route ready'}</strong></div>
              <span style={{padding: '8px 12px', borderRadius: 999, color: stage === 4 ? palette.green : palette.amber, border: `1px solid ${stage === 4 ? palette.green : palette.amber}`}}>{stage === 4 ? 'DONE' : 'WORKING'}</span>
            </div>
            <div style={{display: 'grid', gap: 9, marginTop: 17}}>
              {tools.map(([tool, result, delay]) => {
                const enter = revealAt(frame, fps, delay, 120);
                return <div key={tool} style={{padding: '12px 14px', borderRadius: 11, border: `1px solid ${palette.line}`, background: palette.panel2, opacity: enter, transform: `translateX(${(1 - enter) * 22}px)`}}><Mono style={{fontSize: 12, color: palette.cyan}}>{tool}</Mono><span style={{float: 'right', fontSize: 15, color: palette.paper}}>{result}</span></div>;
              })}
            </div>
          </div>
        </div>
        <div style={{padding: 22, borderRadius: 24, border: `1px solid ${palette.line}`, background: palette.panel, minWidth: 0}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
            <div><Mono style={{fontSize: 12, color: palette.faint}}>FLOOR 07 · PLAN REV 04</Mono><strong style={{display: 'block', fontSize: 22, marginTop: 5}}>The same screen changes</strong></div>
            <div style={{display: 'flex', gap: 9}}><span style={{padding: '8px 12px', border: `1px solid ${palette.line}`, borderRadius: 9}}>84 people</span><span style={{padding: '8px 12px', border: `1px solid ${palette.line}`, borderRadius: 9}}>2 assisted</span></div>
          </div>
          <MiniFloor stage={stage} />
          <div style={{marginTop: 14, display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, padding: '15px 17px', borderRadius: 13, background: stage >= 4 ? '#142014' : '#1a1810', border: `1px solid ${stage >= 4 ? palette.green : palette.amber}`}}>
            <div><Mono style={{fontSize: 12, color: stage >= 4 ? palette.green : palette.amber}}>{stage >= 4 ? 'VISIBLE RESULT' : 'PLAN CHECK'}</Mono><strong style={{display: 'block', marginTop: 4, fontSize: 18}}>{stage >= 4 ? 'Route the Studio to Stair A' : 'Checking route and responsibility…'}</strong></div>
            <span style={{alignSelf: 'center', color: palette.muted}}>Human confirms →</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TraceScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [
    {time: '00:01', phase: 'OBSERVE', tool: 'inspect_zone', result: 'Studio · 6 people · 2 assisted', color: palette.cyan, why: 'Read the room selected on the plan.', change: 'Studio becomes the active zone.', guard: 'Training fixture counts only.'},
    {time: '00:03', phase: 'THINK', tool: 'compare_routes', result: 'Stair B unavailable', color: palette.red, why: 'Compare exits after the drill change.', change: 'Blocked route turns red.', guard: 'No live evacuation direction.'},
    {time: '00:05', phase: 'THINK', tool: 'analyze_route_sketch', result: '18 m · endpoint Stair A', color: palette.green, why: 'Measure the facilitator-drawn line.', change: 'Safe alternative appears in green.', guard: 'Qualified human reviews any real route.'},
    {time: '00:07', phase: 'VERIFY', tool: 'check_coverage', result: '1 assistance owner missing', color: palette.amber, why: 'Find active tasks without an owner.', change: 'The roster gap remains visible.', guard: 'The tool cannot invent completion.'},
  ];
  const active = Math.min(rows.length - 1, Math.max(0, Math.floor(frame / 85)));
  const detail = rows[active];
  return (
    <AbsoluteFill style={{...base, background: palette.ink}}>
      <BrandBar sceneId={scene.id} />
      <div style={{position: 'absolute', top: 120, left: 76, right: 76}}>
        <Kicker>VISIBLE TOOL RECEIPTS</Kicker>
        <h1 style={{fontSize: 62, margin: '12px 0 8px', letterSpacing: '-0.05em'}}>{scene.headline}</h1>
        <p style={{fontSize: 20, color: palette.muted, margin: 0}}>{scene.support}</p>
      </div>
      <div style={{position: 'absolute', top: 280, left: 76, right: 76, bottom: 70, display: 'grid', gridTemplateColumns: '1.38fr 0.86fr', gap: 24}}>
        <div style={{border: `1px solid ${palette.line}`, borderRadius: 22, overflow: 'hidden', background: palette.panel}}>
          <div style={{height: 54, padding: '0 20px', display: 'grid', gridTemplateColumns: '80px 105px 230px 1fr', alignItems: 'center', borderBottom: `1px solid ${palette.line}`, color: palette.faint}}><Mono>TIME</Mono><Mono>STEP</Mono><Mono>TOOL</Mono><Mono>VISIBLE RESULT</Mono></div>
          {rows.map((row, index) => {
            const enter = revealAt(frame, fps, index * 30, 120);
            const selected = index === active;
            return <div key={row.tool} style={{minHeight: 112, padding: '0 20px', display: 'grid', gridTemplateColumns: '80px 105px 230px 1fr', alignItems: 'center', borderBottom: index === rows.length - 1 ? 'none' : `1px solid ${palette.line}`, background: selected ? '#172018' : 'transparent', opacity: enter, transform: `translateX(${(1 - enter) * 25}px)`}}>
              <Mono style={{fontSize: 13, color: palette.muted}}>{row.time}</Mono>
              <Mono style={{fontSize: 12, color: row.color}}>{row.phase}</Mono>
              <Mono style={{fontSize: 15, color: palette.paper}}>{row.tool}</Mono>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}><span style={{width: 10, height: 10, borderRadius: 99, background: row.color, boxShadow: `0 0 16px ${row.color}`}} /><strong style={{fontSize: 18}}>{row.result}</strong></div>
            </div>;
          })}
        </div>
        <div style={{position: 'relative', padding: 28, borderRadius: 22, border: `1px solid ${detail.color}`, background: '#101510', boxShadow: '0 22px 70px rgba(0,0,0,.35)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><Kicker>SELECTED CALL</Kicker><span style={{width: 12, height: 12, borderRadius: 99, background: detail.color, boxShadow: `0 0 20px ${detail.color}`}} /></div>
          <Mono style={{display: 'block', marginTop: 16, fontSize: 21, color: detail.color}}>{detail.tool}</Mono>
          {[['WHY', detail.why], ['SCREEN CHANGE', detail.change], ['GUARDRAIL', detail.guard]].map(([label, value], index) => (
            <div key={label} style={{marginTop: index === 0 ? 30 : 24, paddingTop: index === 0 ? 0 : 22, borderTop: index === 0 ? 'none' : `1px solid ${palette.line}`}}><Mono style={{fontSize: 12, color: palette.faint}}>{label}</Mono><strong style={{display: 'block', marginTop: 7, fontSize: 21, lineHeight: 1.35}}>{value}</strong></div>
          ))}
          <div style={{position: 'absolute', right: 24, bottom: 24, left: 24, padding: '13px 15px', borderRadius: 12, color: palette.green, border: `1px solid ${palette.green}`, textAlign: 'center'}}><Mono>NO HIDDEN SIDE EFFECTS</Mono></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ReportScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const show = (delay: number) => revealAt(frame, fps, delay, 105);
  const stats = [['2', 'scenario changes'], ['3', 'recorded actions'], ['1', 'observation'], ['0', 'open gaps']];
  return (
    <AbsoluteFill style={{...base, background: `linear-gradient(135deg, ${palette.ink}, #13170f)`}}>
      <BrandBar sceneId={scene.id} />
      <div style={{position: 'absolute', left: 112, right: 112, top: 145, bottom: 100, display: 'grid', gridTemplateColumns: '0.82fr 1.18fr', gap: 46}}>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: show(0)}}>
          <Kicker>AFTER-ACTION REVIEW</Kicker>
          <h1 style={{fontSize: 72, lineHeight: 0.98, letterSpacing: '-0.055em', margin: '18px 0'}}>{scene.headline}</h1>
          <p style={{fontSize: 24, lineHeight: 1.4, color: palette.muted, maxWidth: 570}}>{scene.support}</p>
          <div style={{marginTop: 30, padding: '20px 22px', borderLeft: `4px solid ${palette.amber}`, background: '#18160e', borderRadius: '0 15px 15px 0'}}><strong style={{fontSize: 21}}>The agent stops at “draft.”</strong><p style={{margin: '7px 0 0', color: palette.muted, fontSize: 17}}>Approval is not exposed as a WebMCP tool.</p></div>
        </div>
        <div style={{border: `1px solid ${palette.line}`, borderRadius: 27, padding: 32, background: '#10130f', boxShadow: '0 30px 90px rgba(0,0,0,0.36)', opacity: show(7)}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 22, borderBottom: `1px solid ${palette.line}`}}><div><Mono style={{fontSize: 13, color: palette.cyan}}>MST-0742 · DRAFT</Mono><h2 style={{fontSize: 31, margin: '8px 0 0'}}>Floor 07 rehearsal report</h2></div><span style={{padding: '10px 15px', borderRadius: 999, border: `1px solid ${palette.amber}`, color: palette.amber}}>AWAITING HUMAN</span></div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginTop: 22}}>{stats.map(([value, label], index) => <div key={label} style={{padding: 20, border: `1px solid ${palette.line}`, borderRadius: 15, opacity: show(12 + index * 4)}}><strong style={{fontSize: 40, color: label === 'open gaps' ? palette.green : palette.paper}}>{value}</strong><span style={{display: 'block', marginTop: 4, color: palette.muted}}>{label}</span></div>)}</div>
          <div style={{marginTop: 21, padding: '18px 20px', borderRadius: 15, background: '#172016', border: `1px solid ${palette.green}`, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center'}}><div><strong style={{fontSize: 20}}>Ready for Fire Safety Manager</strong><span style={{display: 'block', marginTop: 5, color: palette.muted}}>Review the record before accepting it.</span></div><div style={{padding: '14px 20px', borderRadius: 11, background: palette.paper, color: palette.ink, fontWeight: 850}}>Approve</div></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LedgerScene: React.FC<{scene: Scene; totalToolContracts: number}> = ({scene, totalToolContracts}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [
    ['WORKING', 'Live public rehearsal interface', palette.green],
    ['TESTED', '500 shuffled workflows · human approval gate', palette.green],
    ['SOURCE', `${totalToolContracts} declared WebMCP tool contracts`, palette.cyan],
    ['PENDING', 'Native discovery capture in a compatible browser', palette.amber],
  ] as const;
  return <AbsoluteFill style={{...base, background: palette.ink}}><BrandBar sceneId={scene.id} /><div style={{position: 'absolute', left: 180, right: 180, top: 150}}><h1 style={{fontSize: 70, margin: 0, letterSpacing: '-0.05em'}}>{scene.headline}</h1><p style={{fontSize: 23, color: palette.muted, margin: '14px 0 30px'}}>{scene.support}</p><div style={{borderTop: `1px solid ${palette.line}`}}>{rows.map(([status, label, color], index) => {const enter = revealAt(frame, fps, index * 8, 110); return <div key={status} style={{display: 'grid', gridTemplateColumns: '180px 1fr 28px', alignItems: 'center', minHeight: 116, borderBottom: `1px solid ${palette.line}`, opacity: enter}}><Mono style={{fontSize: 15, color}}>{status}</Mono><strong style={{fontSize: 28}}>{label}</strong><span style={{width: 14, height: 14, borderRadius: 99, background: color}} /></div>;})}</div></div></AbsoluteFill>;
};

const CtaScene: React.FC<{scene: Scene; cta: Manifest['cta']}> = ({scene, cta}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = revealAt(frame, fps, 0, 95);
  return <AbsoluteFill style={{...base, background: `radial-gradient(circle at 50% 48%, #292014 0%, ${palette.ink} 58%)`, alignItems: 'center', justifyContent: 'center'}}><div style={{textAlign: 'center', transform: `scale(${0.94 + enter * 0.06})`, opacity: enter}}><div style={{margin: '0 auto 25px', width: 78, height: 78, borderRadius: 22, display: 'grid', placeItems: 'center', background: palette.orange, color: palette.ink, fontSize: 34, fontWeight: 950}}>M</div><h1 style={{fontSize: 90, lineHeight: 0.96, letterSpacing: '-0.06em', margin: 0}}>{scene.headline}</h1><div style={{display: 'inline-flex', marginTop: 32, padding: '19px 29px', borderRadius: 15, background: palette.paper, color: palette.ink, fontWeight: 850, fontSize: 23}}>{cta.label}</div><Mono style={{display: 'block', marginTop: 22, color: palette.cyan, fontSize: 17}}>{cta.url}</Mono><p style={{margin: '29px 0 0', color: palette.muted, fontSize: 16}}>{scene.support}</p></div></AbsoluteFill>;
};

const SceneRenderer: React.FC<{scene: Scene; manifest: Manifest}> = ({scene, manifest}) => {
  if (scene.type === 'why') return <WhyScene scene={scene} />;
  if (scene.type === 'card') return <CardScene scene={scene} />;
  if (scene.type === 'live') return <LiveScene scene={scene} />;
  if (scene.type === 'architecture') return <ArchitectureScene scene={scene} authorityBoundary={manifest.architecture.authorityBoundary} />;
  if (scene.type === 'runtime') return <RuntimeScene scene={scene} />;
  if (scene.type === 'trace') return <TraceScene scene={scene} />;
  if (scene.type === 'report') return <ReportScene scene={scene} />;
  if (scene.type === 'ledger') return <LedgerScene scene={scene} totalToolContracts={manifest.toolContractProof.totalToolContracts} />;
  if (scene.type === 'cta') return <CtaScene scene={scene} cta={manifest.cta} />;
  return <ProofScene scene={scene} />;
};

export const MusterDemo: React.FC<MusterDemoProps> = ({manifest}) => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{...base, background: palette.ink}}>{manifest.scenes.map((scene) => <Sequence key={scene.id} from={Math.round(scene.start * fps)} durationInFrames={Math.round((scene.end - scene.start) * fps)}><SceneRenderer scene={scene} manifest={manifest} /></Sequence>)}{manifest.audio.enabled ? <Audio src={staticFile(manifest.audio.source)} volume={1} /> : null}</AbsoluteFill>;
};
