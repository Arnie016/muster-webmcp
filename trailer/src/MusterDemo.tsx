import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Focus = {x: number; y: number; scale: number};
type Scene = {
  id: string;
  type: 'proof' | 'architecture' | 'trace' | 'report' | 'ledger' | 'cta';
  start: number;
  end: number;
  asset?: string;
  headline: string;
  support: string;
  narration: string;
  focus?: Focus;
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
  ink: '#090b09',
  panel: '#11150f',
  paper: '#f2efe5',
  muted: '#a9aa9f',
  line: '#343a31',
  orange: '#ff6237',
  amber: '#f0c44f',
  green: '#99e887',
  cyan: '#9ce8db',
};

const base: React.CSSProperties = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: palette.paper,
};

const Mono: React.FC<React.PropsWithChildren<{style?: React.CSSProperties}>> = ({children, style}) => (
  <span style={{fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.06em', ...style}}>{children}</span>
);

const BrandBar: React.FC<{sceneId: string}> = ({sceneId}) => (
  <div style={{position: 'absolute', left: 52, top: 38, right: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: palette.orange, color: palette.ink, fontWeight: 900}}>M</div>
      <strong style={{fontSize: 24}}>Muster</strong>
    </div>
    <Mono style={{fontSize: 14, color: palette.muted}}>FICTIONAL TRAINING · {sceneId.toUpperCase()}</Mono>
  </div>
);

const Caption: React.FC<{headline: string; support: string; dark?: boolean}> = ({headline, support, dark = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 18, stiffness: 130}});
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        bottom: 58,
        width: 1080,
        padding: '28px 34px 26px',
        borderRadius: 24,
        background: dark ? 'rgba(8,10,8,0.92)' : 'rgba(242,239,229,0.96)',
        color: dark ? palette.paper : palette.ink,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.14)' : 'rgba(9,11,9,0.18)'}`,
        boxShadow: '0 24px 80px rgba(0,0,0,0.34)',
        transform: `translateY(${(1 - enter) * 24}px)`,
        opacity: enter,
        zIndex: 30,
      }}
    >
      <h1 style={{margin: 0, fontSize: 58, lineHeight: 1.02, letterSpacing: '-0.04em'}}>{headline}</h1>
      <p style={{margin: '12px 0 0', color: dark ? palette.muted : '#484b43', fontSize: 22, lineHeight: 1.35}}>{support}</p>
    </div>
  );
};

const ProofScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const focus = scene.focus ?? {x: 50, y: 50, scale: 1};
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = focus.scale * (1 + progress * 0.025);
  return (
    <AbsoluteFill style={{...base, background: palette.ink, overflow: 'hidden'}}>
      <Img
        src={staticFile(scene.asset ?? '')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${focus.x}% ${focus.y}%`,
          transform: `scale(${scale})`,
          filter: 'saturate(1.05) contrast(1.03)',
        }}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,5,0.24) 0%, rgba(5,7,5,0.04) 46%, rgba(5,7,5,0.72) 100%)'}} />
      <BrandBar sceneId={scene.id} />
      <Caption headline={scene.headline} support={scene.support} />
    </AbsoluteFill>
  );
};

const ArchitectureScene: React.FC<{scene: Scene; authorityBoundary: string; boundedPageTools: number}> = ({scene, authorityBoundary, boundedPageTools}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nodes = [
    {label: 'PLAN', x: 305},
    {label: 'PEOPLE', x: 635},
    {label: 'EQUIPMENT', x: 965},
    {label: 'REVIEW', x: 1295},
  ];
  const reveal = (delay: number) => spring({frame: frame - delay, fps, config: {damping: 18, stiffness: 100}});
  return (
    <AbsoluteFill style={{...base, background: `radial-gradient(circle at 50% 42%, #182018 0%, ${palette.ink} 64%)`}}>
      <BrandBar sceneId={scene.id} />
      <div style={{position: 'absolute', top: 118, left: 140, right: 140, textAlign: 'center'}}>
        <Mono style={{fontSize: 15, color: palette.cyan}}>WEBMCP ORCHESTRATION</Mono>
        <h1 style={{fontSize: 62, margin: '14px 0 0', letterSpacing: '-0.045em'}}>{scene.headline}</h1>
      </div>

      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <line x1="960" y1="320" x2="960" y2="410" stroke={palette.orange} strokeWidth="4" opacity={reveal(4)} />
        {nodes.map((node, index) => (
          <g key={node.label} opacity={reveal(8 + index * 3)}>
            <line x1="960" y1="505" x2={node.x + 120} y2="600" stroke={palette.line} strokeWidth="3" />
            <line x1={node.x + 120} y1="690" x2="960" y2="800" stroke={palette.line} strokeWidth="3" />
          </g>
        ))}
        <line x1="960" y1="870" x2="960" y2="915" stroke={palette.green} strokeWidth="4" opacity={reveal(25)} />
      </svg>

      <div style={{position: 'absolute', top: 242, left: 740, width: 440, padding: 24, textAlign: 'center', border: `1px solid ${palette.amber}`, background: '#15170f', borderRadius: 20, opacity: reveal(0)}}>
        <Mono style={{fontSize: 13, color: palette.amber}}>AUTHORITY</Mono>
        <strong style={{display: 'block', marginTop: 8, fontSize: 26}}>Human facilitator</strong>
      </div>
      <div style={{position: 'absolute', top: 410, left: 710, width: 500, padding: 26, textAlign: 'center', border: `2px solid ${palette.orange}`, background: '#1a120e', borderRadius: 24, opacity: reveal(5)}}>
        <Mono style={{fontSize: 13, color: palette.orange}}>MANAGER TOOL</Mono>
        <strong style={{display: 'block', marginTop: 8, fontSize: 34}}>Incident Commander</strong>
      </div>
      {nodes.map((node, index) => (
        <div key={node.label} style={{position: 'absolute', top: 595, left: node.x, width: 240, padding: '28px 12px', textAlign: 'center', border: `1px solid ${palette.line}`, background: palette.panel, borderRadius: 18, opacity: reveal(10 + index * 3), transform: `translateY(${(1 - reveal(10 + index * 3)) * 18}px)`}}>
          <Mono style={{fontSize: 15, color: palette.cyan}}>{node.label}</Mono>
          <span style={{display: 'block', marginTop: 8, color: palette.muted, fontSize: 16}}>specialist desk</span>
        </div>
      ))}
      <div style={{position: 'absolute', top: 796, left: 660, width: 600, padding: 22, textAlign: 'center', border: `1px solid ${palette.green}`, background: '#0d170e', borderRadius: 18, opacity: reveal(23)}}>
        <strong style={{fontSize: 28}}>{boundedPageTools} bounded page tools</strong>
        <span style={{display: 'block', marginTop: 6, color: palette.muted}}>read or update the same visible state</span>
      </div>
      <div style={{position: 'absolute', bottom: 58, left: 430, right: 430, textAlign: 'center', padding: 18, borderRadius: 14, background: palette.paper, color: palette.ink, fontSize: 22, fontWeight: 750, opacity: reveal(28)}}>
        {authorityBoundary}
      </div>
    </AbsoluteFill>
  );
};

const TraceScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const receipts = [
    ['send_inject', 'Stair B unavailable', palette.orange],
    ['inspect_zone', 'Studio · 6 people · 2 assisted', palette.cyan],
    ['record_action', 'Mobility assistance pair assigned', palette.green],
  ] as const;
  return (
    <AbsoluteFill style={{...base, background: palette.ink, overflow: 'hidden'}}>
      <Img src={staticFile(scene.asset ?? '')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '72% 50%', transform: 'scale(1.14)', opacity: 0.35, filter: 'blur(1px)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(9,11,9,0.96) 0%, rgba(9,11,9,0.82) 62%, rgba(9,11,9,0.34) 100%)'}} />
      <BrandBar sceneId={scene.id} />
      <div style={{position: 'absolute', top: 178, left: 120, width: 760}}>
        <h1 style={{fontSize: 70, lineHeight: 1, letterSpacing: '-0.05em', margin: 0}}>{scene.headline}</h1>
        <p style={{fontSize: 24, color: palette.muted, margin: '18px 0 34px'}}>{scene.support}</p>
        <div style={{display: 'grid', gap: 16}}>
          {receipts.map(([tool, result, color], index) => {
            const enter = spring({frame: frame - index * 18, fps, config: {damping: 17, stiffness: 115}});
            return (
              <div key={tool} style={{display: 'grid', gridTemplateColumns: '190px 1fr 42px', alignItems: 'center', gap: 18, minHeight: 92, padding: '14px 20px', border: `1px solid ${palette.line}`, borderRadius: 18, background: 'rgba(17,21,15,0.96)', opacity: enter, transform: `translateX(${(1 - enter) * 36}px)`}}>
                <Mono style={{fontSize: 16, color}}>{tool}</Mono>
                <span style={{fontSize: 20}}>{result}</span>
                <span style={{width: 14, height: 14, borderRadius: 99, background: color, boxShadow: `0 0 24px ${color}`}} />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', right: 92, top: 285, width: 650, height: 410, borderRadius: 24, border: `1px solid ${palette.line}`, overflow: 'hidden', boxShadow: '0 35px 100px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile(scene.asset ?? '')} style={{width: 1440, height: 1000, objectFit: 'cover', objectPosition: 'right center', transform: 'translate(-540px, -130px) scale(0.92)', transformOrigin: 'top left'}} />
      </div>
      <Caption headline="Visible. Reviewable. Correctable." support="No hidden side effects." />
    </AbsoluteFill>
  );
};

const ReportScene: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = (delay: number) => spring({frame: frame - delay, fps, config: {damping: 18, stiffness: 105}});
  const stats = [['2', 'scenario changes'], ['3', 'recorded actions'], ['1', 'observation'], ['0', 'open gaps']];
  return (
    <AbsoluteFill style={{...base, background: `linear-gradient(135deg, ${palette.ink}, #13170f)`}}>
      <BrandBar sceneId={scene.id} />
      <div style={{position: 'absolute', left: 120, right: 120, top: 145, bottom: 115, display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 42}}>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: enter(0)}}>
          <Mono style={{color: palette.orange, fontSize: 16}}>AFTER-ACTION REVIEW</Mono>
          <h1 style={{fontSize: 76, lineHeight: 0.98, letterSpacing: '-0.055em', margin: '18px 0'}}>{scene.headline}</h1>
          <p style={{fontSize: 25, lineHeight: 1.4, color: palette.muted, maxWidth: 610}}>{scene.support}</p>
          <div style={{marginTop: 34, padding: '22px 24px', borderLeft: `4px solid ${palette.amber}`, background: '#18160e', borderRadius: '0 16px 16px 0'}}>
            <strong style={{fontSize: 22}}>Human authority boundary</strong>
            <p style={{margin: '8px 0 0', color: palette.muted, fontSize: 18}}>Approval is deliberately absent from the page-tool contract.</p>
          </div>
        </div>
        <div style={{border: `1px solid ${palette.line}`, borderRadius: 28, padding: 34, background: '#10130f', boxShadow: '0 30px 90px rgba(0,0,0,0.36)', opacity: enter(7)}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, borderBottom: `1px solid ${palette.line}`}}>
            <div>
              <Mono style={{fontSize: 13, color: palette.cyan}}>MST-0742 · DRAFT</Mono>
              <h2 style={{fontSize: 32, margin: '8px 0 0'}}>Floor 07 rehearsal report</h2>
            </div>
            <span style={{padding: '10px 16px', borderRadius: 999, border: `1px solid ${palette.amber}`, color: palette.amber}}>Awaiting human</span>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 24}}>
            {stats.map(([value, label], index) => (
              <div key={label} style={{padding: 22, border: `1px solid ${palette.line}`, borderRadius: 16, opacity: enter(12 + index * 3)}}>
                <strong style={{fontSize: 42, color: label === 'open gaps' ? palette.green : palette.paper}}>{value}</strong>
                <span style={{display: 'block', marginTop: 4, color: palette.muted}}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, padding: '20px 22px', borderRadius: 16, background: '#172016', border: `1px solid ${palette.green}`}}>
            <div>
              <strong style={{fontSize: 20}}>Ready for Fire Safety Manager review</strong>
              <span style={{display: 'block', marginTop: 5, color: palette.muted}}>The agent cannot perform this approval.</span>
            </div>
            <div style={{padding: '15px 22px', borderRadius: 12, background: palette.paper, color: palette.ink, fontWeight: 800}}>Approve report</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LedgerScene: React.FC<{scene: Scene; totalToolContracts: number}> = ({scene, totalToolContracts}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [
    ['OBSERVED', 'Real command-room and review captures', palette.green],
    ['TESTED', '500 shuffled workflows · approval gate', palette.green],
    ['SOURCE', `${totalToolContracts} tool contracts · bounded effects`, palette.cyan],
    ['PENDING', 'Native discovery in a compatible browser', palette.amber],
  ] as const;
  return (
    <AbsoluteFill style={{...base, background: palette.ink}}>
      <BrandBar sceneId={scene.id} />
      <div style={{position: 'absolute', left: 180, right: 180, top: 150}}>
        <h1 style={{fontSize: 72, margin: 0, letterSpacing: '-0.05em'}}>{scene.headline}</h1>
        <p style={{fontSize: 24, color: palette.muted, margin: '14px 0 32px'}}>{scene.support}</p>
        <div style={{borderTop: `1px solid ${palette.line}`}}>
          {rows.map(([status, label, color], index) => {
            const enter = spring({frame: frame - index * 8, fps, config: {damping: 18, stiffness: 110}});
            return (
              <div key={status} style={{display: 'grid', gridTemplateColumns: '180px 1fr 28px', alignItems: 'center', minHeight: 116, borderBottom: `1px solid ${palette.line}`, opacity: enter}}>
                <Mono style={{fontSize: 16, color}}>{status}</Mono>
                <strong style={{fontSize: 28}}>{label}</strong>
                <span style={{width: 14, height: 14, borderRadius: 99, background: color}} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CtaScene: React.FC<{scene: Scene; cta: Manifest['cta']}> = ({scene, cta}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 18, stiffness: 95}});
  return (
    <AbsoluteFill style={{...base, background: `radial-gradient(circle at 50% 48%, #292014 0%, ${palette.ink} 58%)`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', transform: `scale(${0.94 + enter * 0.06})`, opacity: enter}}>
        <div style={{margin: '0 auto 26px', width: 78, height: 78, borderRadius: 22, display: 'grid', placeItems: 'center', background: palette.orange, color: palette.ink, fontSize: 34, fontWeight: 950}}>M</div>
        <h1 style={{fontSize: 92, lineHeight: 0.96, letterSpacing: '-0.06em', margin: 0}}>{scene.headline}</h1>
        <div style={{display: 'inline-flex', marginTop: 34, padding: '20px 30px', borderRadius: 16, background: palette.paper, color: palette.ink, fontWeight: 850, fontSize: 24}}>{cta.label}</div>
        <Mono style={{display: 'block', marginTop: 24, color: palette.cyan, fontSize: 18}}>{cta.url}</Mono>
        <p style={{margin: '32px 0 0', color: palette.muted, fontSize: 17}}>{scene.support}</p>
      </div>
    </AbsoluteFill>
  );
};

const SceneRenderer: React.FC<{scene: Scene; manifest: Manifest}> = ({scene, manifest}) => {
  if (scene.type === 'architecture') return <ArchitectureScene scene={scene} authorityBoundary={manifest.architecture.authorityBoundary} boundedPageTools={manifest.toolContractProof.boundedPageTools} />;
  if (scene.type === 'trace') return <TraceScene scene={scene} />;
  if (scene.type === 'report') return <ReportScene scene={scene} />;
  if (scene.type === 'ledger') return <LedgerScene scene={scene} totalToolContracts={manifest.toolContractProof.totalToolContracts} />;
  if (scene.type === 'cta') return <CtaScene scene={scene} cta={manifest.cta} />;
  return <ProofScene scene={scene} />;
};

export const MusterDemo: React.FC<MusterDemoProps> = ({manifest}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{...base, background: palette.ink}}>
      {manifest.scenes.map((scene) => (
        <Sequence key={scene.id} from={Math.round(scene.start * fps)} durationInFrames={Math.round((scene.end - scene.start) * fps)}>
          <SceneRenderer scene={scene} manifest={manifest} />
        </Sequence>
      ))}
      {manifest.audio.enabled ? <Audio src={staticFile(manifest.audio.source)} volume={1} /> : null}
    </AbsoluteFill>
  );
};
