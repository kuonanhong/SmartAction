import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {CombatRound,PartnerRound} from '../js/combat.js';
import {TrainingSession,neutralPose} from '../js/training.js';
import {pauseForWalk,resumeFromWalk,walkInputs} from '../js/walk.js';

const perfect={total:100,hands:100,feet:100,body:100};
const tick=(round,seconds,score=perfect)=>{for(let i=0;i<Math.ceil(seconds/.05);i++)round.tick(.05,score);};
const moves=[{name:{en:'Opening'},pose:neutralPose(),duration:.2},{name:{en:'Turn'},pose:{...neutralPose(),waist:.1},duration:.2}];

test('partner alternates demonstration and response, and never auto-completes without player input',()=>{
  const round=new PartnerRound();round.start();assert.equal(round.phase,'demo');tick(round,3.6);assert.equal(round.phase,'respond');
  tick(round,5);assert.equal(round.results.length,0);round.markInput();tick(round,1.1);assert.equal(round.phase,'success');assert.equal(round.results.length,1);
  tick(round,1.6);assert.equal(round.phase,'demo');assert.equal(round.index,1);
});

test('partner response window retries the same move and retains independent limb minimums',()=>{
  const events=[],round=new PartnerRound({level:'pro',onEvent:e=>events.push(e)});round.start();tick(round,3.6);round.markInput();
  tick(round,19,{total:98,hands:20,feet:100,body:100});assert.equal(round.index,0);assert.equal(round.results.length,0);assert.equal(round.retries,1);assert.ok(events.some(e=>e.type==='retry'));
});

test('partner completes six exchanges, resets on replay, and freezes while paused',()=>{
  const round=new PartnerRound();round.start();for(let i=0;i<6;i++){tick(round,3.6);round.markInput();tick(round,1.1);tick(round,1.6);}
  assert.equal(round.finished,true);assert.equal(round.results.length,6);assert.equal(round.active,false);
  round.start();assert.equal(round.phase,'demo');assert.equal(round.results.length,0);const elapsed=round.elapsed;round.active=false;tick(round,20);assert.equal(round.elapsed,elapsed);
});

test('rhythm round has separate prepare / attack / guard cues and a finite timeout',()=>{
  const events=[],r=new CombatRound({onEvent:e=>events.push(e)});r.active=true;assert.equal(r.cue,'prepare');tick(r,4.5);assert.equal(r.cue,'attack');tick(r,.4);assert.equal(r.cue,'block');
  // Preserve stamina to exercise timeout independently of losing all health.
  for(let i=0;i<1400&&!r.finished;i++){r.playerHealth=100;r.tick(.05,perfect,true);}
  assert.equal(r.finished,true);assert.equal(r.remaining,0);assert.equal(events.filter(e=>e.type==='finish').length,1);assert.equal(events.at(-1).timedOut,true);
});

test('walking preserves the same session, target, score results, timer, paused state and independent round state',()=>{
  const session=new TrainingSession(moves),combat=new CombatRound(),partner=new PartnerRound();session.start();session.tick(.1,neutralPose());session.results.push({score:91});combat.active=true;partner.start();
  const player=neutralPose(),before={phase:session.phase,index:session.index,elapsed:session.elapsed,results:JSON.stringify(session.results)};
  const saved=pauseForWalk({session,combat,partner,player,mode:'partner'});player.waist=1;
  for(let i=0;i<100;i++){session.tick(.1,neutralPose());combat.tick(.1,perfect);partner.tick(.1,perfect);}
  const restored=resumeFromWalk(saved);assert.equal(saved.session,session);assert.equal(restored.mode,'partner');assert.equal(restored.player.waist,0);
  assert.deepEqual({phase:session.phase,index:session.index,elapsed:session.elapsed,results:JSON.stringify(session.results)},before);assert.equal(session.paused,false);assert.equal(combat.active,true);assert.equal(partner.active,true);
  session.paused=true;const paused=pauseForWalk({session,combat,partner,player,mode:'follow'});resumeFromWalk(paused);assert.equal(session.paused,true);
});

test('walk controls map simultaneous left/right pads without changing selected limbs',()=>{
  const inputs=walkInputs(new Set(['leg-up','leg-right','hand-left','hand-up','crouch']),.03,true);
  assert.deepEqual(inputs,{forward:1,strafe:1,turn:-1,look:1,crouch:true,jump:true,dt:.03});
});

// Real application wiring in a DOM simulator. This is not phone / WebGL / audio hardware testing.
const dependency=async name=>{
  try{return await import(name);}catch(error){const dir=process.env.SMARTACTION_BUILD_TOOLS;if(!dir)throw error;return import(pathToFileURL(createRequire(path.join(dir,'package.json')).resolve(name)).href);}
};
const [{Window},esbuild]=await Promise.all([dependency('happy-dom'),dependency('esbuild')]);
const root=fileURLToPath(new URL('../',import.meta.url));
const html=await readFile(path.join(root,'index.html'),'utf8');
const built=await esbuild.build({entryPoints:[path.join(root,'js/app.js')],bundle:true,write:false,format:'iife',platform:'browser',target:['es2020'],define:{'import.meta.url':'"file:///source-module-only/"'}});
const source=built.outputFiles[0].text;
async function fixture(t){
  const window=new Window({url:'https://example.invalid/taichi/',width:390,settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:false}});
  const frames=new Map(),errors=[];let clock=0,next=0;
  window.requestAnimationFrame=callback=>{const id=++next;frames.set(id,callback);return id;};window.cancelAnimationFrame=id=>frames.delete(id);
  window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  window.fetch=async()=>{throw new Error('Network intentionally disabled');};
  window.HTMLCanvasElement.prototype.getContext=function(type){if(type!=='2d')return null;return new Proxy({canvas:this,createLinearGradient:()=>({addColorStop(){}}),measureText:()=>({width:40})},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});};
  window.HTMLElement.prototype.setPointerCapture=()=>{};
  window.speechSynthesis={cancel(){},resume(){},getVoices:()=>[{name:'English',lang:'en-US',voiceURI:'en-test',localService:true}],speak(u){u.onstart?.();u.onend?.();}};
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  window.addEventListener('error',e=>errors.push(e.message||String(e.error)));
  window.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));window.eval(source);
  const $=id=>window.document.getElementById(id);
  const frame=seconds=>{for(let i=0;i<Math.ceil(seconds/.05);i++){clock+=50;const q=[...frames.values()];frames.clear();q.forEach(cb=>cb(clock));}};
  const change=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new window.Event('change'));};
  const pointer=(action,type,id=1)=>window.document.querySelector(`[data-action="${action}"]`).dispatchEvent(new window.PointerEvent(type,{pointerId:id,bubbles:true,cancelable:true}));
  t.after(async()=>{assert.deepEqual(errors,[]);frames.clear();window.dispatchEvent(new window.Event('pagehide'));await window.happyDOM.close();});
  return {window,$,frame,change,pointer,diag:()=>window.SmartActionDiagnostics()};
}

test('v3 UI modes expose usable round controls, run independently, and reset when mode changes',async t=>{
  const f=await fixture(t);assert.equal(f.window.SmartActionBooted,true);
  f.change('mode','partner');assert.equal(f.$('partnerPanel').hidden,false);assert.equal(f.$('combatPanel').hidden,true);f.$('partnerStartBtn').click();assert.equal(f.diag().partnerActive,true);f.frame(3.7);assert.equal(f.diag().partnerPhase,'respond');
  f.$('assistBtn').click();f.frame(5);assert.ok(f.diag().partnerProgress>=1);f.change('mode','spar');assert.equal(f.$('combatPanel').hidden,false);assert.equal(f.diag().phase,'idle');assert.equal(f.diag().partnerProgress,0);
  f.$('combatStartBtn').click();assert.equal(f.diag().combatActive,true);f.frame(.2);const hp=f.$('opponentHealth').value;f.pointer('attack','pointerdown');f.pointer('attack','pointerup');assert.ok(f.$('opponentHealth').value<hp);f.frame(4.7);assert.match(f.$('combatPanel').dataset.cue,/attack|block/);
  f.change('mode','follow');assert.equal(f.diag().phase,'idle');assert.equal(f.$('combatPanel').hidden,true);assert.equal(f.$('partnerPanel').hidden,true);
});

test('UI rest remaps controls, freezes training, preserves progress and resumes the prior mode',async t=>{
  const f=await fixture(t);f.$('startBtn').click();f.frame(.5);const before=f.diag();f.$('walkBtn').click();assert.equal(f.diag().walkActive,true);assert.equal(f.$('mode').disabled,true);assert.equal(f.$('walkPanel').hidden,false);
  f.pointer('leg-up','pointerdown',7);f.pointer('hand-right','pointerdown',8);f.frame(2);f.pointer('leg-up','pointerup',7);f.pointer('hand-right','pointerup',8);
  assert.equal(f.diag().phase,before.phase);assert.equal(f.diag().index,before.index);assert.match(f.$('walkMapLink').href,/google.com/);assert.notEqual(f.$('leftLimbBtn').textContent,'switchLeg');
  f.$('rightLimbBtn').click();assert.ok(f.$('residentReply').textContent.length>0);f.$('walkBtn').click();assert.equal(f.diag().walkActive,false);assert.equal(f.diag().mode,before.mode);assert.equal(f.diag().paused,before.paused);assert.equal(f.$('mode').disabled,false);
  f.frame(10);assert.equal(f.diag().phase,'wait');
});

test('language auto option, score thresholds, searchable paged locations and mobile voice button exist',async t=>{
  const f=await fixture(t);assert.ok(f.$('language').querySelector('[value="auto"]'));assert.ok(f.$('enableVoiceBtn'));assert.ok(f.$('voiceStatus').textContent.length>0);
  f.change('difficulty','master');assert.match(f.$('levelDetails').textContent,/94/);assert.match(f.$('levelDetails').textContent,/88/);assert.match(f.$('levelDetails').textContent,/2.2/);
  assert.ok(f.$('locationPicker').querySelectorAll('button').length<=24);f.$('placeSearch').value='no-such-location-999';f.$('placeSearch').dispatchEvent(new f.window.Event('input'));assert.equal(f.$('locationPicker').querySelectorAll('button').length,0);
});
