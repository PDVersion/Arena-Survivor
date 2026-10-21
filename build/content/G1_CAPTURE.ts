// Run from repository root: npx vite-node build/content/G1_CAPTURE.ts <output.json>
import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { themeRegistry } from '../../src/game/content/theme-registry';
import { buildModels } from '../../src/game/systems/simulation/build-models';
import { simulatePacing, timeToKillTable } from '../../src/game/systems/simulation/pacing-simulator';
import { createWorldState, applyWorldChoice, acceptCurse } from '../../src/game/systems/chaos/world-modifiers';
const root=process.cwd();
const files=execFileSync('git',['ls-files','src','tests','scripts','public','package.json','package-lock.json'],{cwd:root,encoding:'utf8'}).trim().split('\n').sort();
const hashes=Object.fromEntries(files.map(p=>[p,createHash('sha256').update(readFileSync(root+'/'+p)).digest('hex')]));
const cases=[];
const stepMs=Number(process.env.G1_STEP_MS??100);
const sensitivity=process.env.G1_SENSITIVITY==='1';
const historicalGlass=process.env.G1_HISTORICAL_GLASS==='1';
for(const {key,theme:authored} of themeRegistry) for(const world of ['baseline','c3']) for(const difficulty of ['beginner','normal','experienced'] as const) for(const build of buildModels){
 if(sensitivity && (key!=="eco-guardian" || !["damage-rush","two-tools-packed","evolved-packed"].includes(build.id))) continue;
 const theme=historicalGlass && key==="eco-guardian" ? { ...authored, enemies:authored.enemies.map(e=>e.id==="enemy.slow_durable"?{...e,armour:40}:e),
 tuning:{...authored.tuning,director:{...authored.tuning.director,roles:authored.tuning.director.roles.map(r=>r.enemyId==="enemy.slow_durable"?{...r,baseWeight:12}:r)}}} : authored;
 let initialWorld=createWorldState();
 if(world==='c3'){
 const shrine=theme.shrines.find(s=>s.id==='shrine.escalation')!;
 initialWorld=applyWorldChoice(initialWorld,{...shrine,shrineId:shrine.id});
 for(const curse of theme.curses)initialWorld=acceptCurse(initialWorld,curse);
 }
 const options={theme,difficulty,build,durationMs:300000,initialWorld,stepMs};
 const report=simulatePacing(options);
 const {buckets,...summary}=report;
 cases.push({theme:key,world,applicable:!(key==='eco-guardian'&&['spread','explosion'].includes(build.id)),...summary,
 spawnedByRole:Object.fromEntries(theme.enemies.map(e=>[e.id,buckets.reduce((n,b)=>n+(b.spawnedByRole[e.id]??0),0)])),
 levelMilestones:Object.fromEntries([2,5,7,10,15,20,25,30].map(l=>[l,report.levelTimestampsMs[l-2]??null])),
 ttk:timeToKillTable(report,options).filter(r=>[.2,.4,.6,.8,1].some(p=>Math.abs(r.progress-p)<1e-8))});
}
writeFileSync(process.argv[2]!,JSON.stringify({sourceParent:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),trackedRuntimeDigest:createHash('sha256').update(JSON.stringify(hashes)).digest('hex'),method:'SHA256 compact sorted JSON of tracked src/tests/scripts/public/package path SHA256; new test paths captured at final verification separately',stepMs,historicalGlass,scenarioCount:cases.length,limits:['No movement, incoming damage, travel, offers, overkill, children, elites, milestone waves, bosses or causal queue in ambient pacing model','Isolated/packed DPS contact bands, not survival','C3 shrine and both curses applied at start; not natural timing','spread/explosion parked in eco'],cases},null,2)+'\n');
