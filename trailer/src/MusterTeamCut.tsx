import React from 'react';
import {AbsoluteFill,Audio,Video,Sequence,staticFile} from 'remotion';
import manifest from '../manifest.json';
import {WhyScene,CardScene,ArchitectureScene,LedgerScene,CtaScene,type Scene} from './MusterDemo';

const scene=(id:string)=>manifest.scenes.find(s=>s.id===id) as Scene;
const PageTake:React.FC<{file:string;label:string}> = ({file,label}) => <AbsoluteFill style={{background:'#08151b'}}>
 <Video src={staticFile(`captures/team-cut/${file}.mp4`)} muted style={{width:'100%',height:'100%',objectFit:'contain'}} />
 <div style={{position:'absolute',right:20,bottom:16,background:'#08151be8',border:'1px solid #63878b',borderRadius:7,padding:'9px 13px',color:'#d6eeed',font:'13px system-ui'}}>{label} · actual page capture · fictional training</div>
</AbsoluteFill>;

// Independently editable clips aligned to the existing narration's reviewed SRT.
// Remove only 115–122.4s, which states the obsolete nineteen-tool count.
export const MusterTeamCut:React.FC = () => <AbsoluteFill style={{background:'#070a08'}}>
 <Sequence name="Why teams rehearse" from={0} durationInFrames={296}><WhyScene scene={scene('rupture')} /></Sequence>
 <Sequence name="Rehearse" from={296} durationInFrames={49}><CardScene scene={scene('card-rehearse')} /></Sequence>
 <Sequence name="Inspect the real 3D rooms" from={345} durationInFrames={265}><PageTake file="interior" label="Rooms, dimensions and equipment" /></Sequence>
 <Sequence name="Guided scenario on the page" from={610} durationInFrames={603}><PageTake file="guided" label="One action at a time" /></Sequence>
 <Sequence name="Draw and inspect a route" from={1213} durationInFrames={311}><PageTake file="draw" label="A human sketch becomes a tool receipt" /></Sequence>
 <Sequence name="Preview then confirm an assignment" from={1524} durationInFrames={369}><PageTake file="team" label="Human confirmation · assignment is not arrival" /></Sequence>
 <Sequence name="Trace divider" from={1893} durationInFrames={59}><CardScene scene={scene('card-trace')} /></Sequence>
 <Sequence name="Architecture explained" from={1952} durationInFrames={558}><ArchitectureScene scene={{...scene('architecture'),headline:'One request. One shared plan.',support:'The local manager routes named tools. An external WebMCP agent can use the same page.'}} authorityBoundary="The agent prepares. The human confirms and reviews." /></Sequence>
 <Sequence name="Actual prompt and tool result" from={2510} durationInFrames={330}><PageTake file="trace" label="Typed request → real input and output" /></Sequence>
 <Sequence name="Human authority" from={2840} durationInFrames={85}><CardScene scene={scene('card-authority')} /></Sequence>
 <Sequence name="Actual after-action draft" from={2925} durationInFrames={182}><PageTake file="report" label="Report staged · approval untouched" /></Sequence>
 <Sequence name="Verification evidence" from={3107} durationInFrames={233}><LedgerScene scene={scene('proof')} totalToolContracts={20} /></Sequence>
 <Sequence name="Tool limits" from={3340} durationInFrames={110}><CardScene scene={scene('card-contract')} /></Sequence>
 <Sequence name="Printable training record" from={3450} durationInFrames={119}><PageTake file="print" label="Vector plan and facilitator pack" /></Sequence>
 <Sequence name="Try the drill" from={3569} durationInFrames={184}><CtaScene scene={scene('cta')} cta={manifest.cta} /></Sequence>
 <Sequence name="Existing AI narration before removed obsolete count" from={0} durationInFrames={3450}><Audio src={staticFile('audio/narration.wav')} startFrom={0} endAt={3450} volume={1.4125}/></Sequence>
 <Sequence name="Existing narration conclusion" from={3450} durationInFrames={303}><Audio src={staticFile('audio/narration.wav')} startFrom={3672} volume={1.4125}/></Sequence>
</AbsoluteFill>;
