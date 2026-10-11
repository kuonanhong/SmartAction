// Actual shipped bundle + DOM wiring / viewport budgets. No physical-device claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {calculatePracticeLayout} from '../js/layout.js';
let Window;
try{({Window}=await import('happy-dom'));}
catch(error){const dir=process.env.SMARTACTION_BUILD_TOOLS;if(!dir)throw error;({Window}=await import(pathToFileURL(createRequire(path.join(dir,'package.json')).resolve('happy-dom')).href));}
const root=new URL('../',import.meta.url);
const [html,bundle,css]=await Promise.all(['index.html','js/game.js','styles.css'].map(file=>readFile(new URL(file,root),'utf8')));
async function fixture(t,{boot=true,width=390,height=844}={}){
  const window=new Window({url:'file:///SmartAction_Taichi_Game_v4/index.html',width,height,settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:false}});
  const frames=new Map(),errors=[];let now=0,next=0;
  window.requestAnimationFrame=fn=>{const id=++next;frames.set(id,fn);return id;};window.cancelAnimationFrame=id=>frames.delete(id);
  window.matchMedia=query=>({matches:/max-width:\s*(\d+)/.test(query)?width<=Number(RegExp.$1):query.includes('landscape')?width>height:false,addEventListener(){},removeEventListener(){}});
  window.fetch=async()=>{throw new Error('No network in this DOM test');};
  window.speechSynthesis={cancel(){},resume(){},getVoices:()=>[],speak(){}};
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  window.HTMLCanvasElement.prototype.getContext=function(kind){if(kind!=='2d')return null;return new Proxy({canvas:this,createLinearGradient:()=>({addColorStop(){}}),measureText:()=>({width:40})},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});};
  window.HTMLElement.prototype.setPointerCapture=()=>{};window.HTMLElement.prototype.releasePointerCapture=()=>{};
  window.addEventListener('error',e=>errors.push(e.message||String(e.error)));
  window.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
  if(boot)window.eval(bundle);
  const $=id=>window.document.getElementById(id);
  const change=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new window.Event('change'));};
  const frame=seconds=>{for(let i=0;i<Math.ceil(seconds/.05);i++){now+=50;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));}};
  t.after(async()=>{frames.clear();window.dispatchEvent(new window.Event('pagehide'));assert.deepEqual(errors,[],'actual bundle must not throw');await window.happyDOM.close();});
  return {window,$,change,frame,diag:()=>window.SmartActionDiagnostics()};
}

for(const fromDemo of [false,true])test(`390px shipped bundle: bottom Assist works ${fromDemo?'during teacher demonstration':'from idle'} and advances exactly one move`,async t=>{
  const f=await fixture(t);assert.equal(f.window.SmartActionBooted,true);
  if(fromDemo){f.$('startBtn').click();f.frame(.4);assert.equal(f.diag().phase,'demo');assert.equal(f.window.document.body.classList.contains('practice-focus'),true);}
  const button=f.$('assistBtn');assert.equal(button.disabled,false);button.click();
  assert.equal(f.diag().assistActive,true);assert.equal(button.getAttribute('aria-pressed'),'true');assert.equal(f.$('assistStatus').hidden,false);
  f.frame(.3);assert.equal(button.classList.contains('assisting'),true);assert.equal(f.diag().assistRemaining,5,'demonstration cannot consume response assistance');
  f.frame(20);assert.equal(f.diag().index,1);assert.equal(f.diag().assistActive,false);assert.equal(button.getAttribute('aria-pressed'),'false');
  f.frame(20);assert.equal(f.diag().index,1,'one tap cannot silently automate the rest of the course');
});

test('mobile master explains its rule in the visible dock; walking disables and then restores assistance',async t=>{
  const f=await fixture(t);f.change('language','zh-TW');f.change('difficulty','master');f.$('assistBtn').click();
  assert.equal(f.diag().assistActive,false);assert.equal(f.diag().phase,'idle');assert.equal(f.$('assistBtn').disabled,false);
  assert.equal(f.$('assistStatus').hidden,false);assert.match(f.$('assistStatus').textContent,/大師級.*自行操作/);
  assert.equal(f.$('assistStatus').getAttribute('aria-live'),'polite');assert.ok(f.$('controlDock').contains(f.$('assistStatus')));
  f.change('difficulty','basic');f.$('walkBtn').click();assert.equal(f.diag().walkActive,true);assert.equal(f.$('assistBtn').disabled,true);
  f.$('assistBtn').click();assert.equal(f.diag().assistActive,false);f.$('walkBtn').click();assert.equal(f.$('assistBtn').disabled,false);
  f.$('assistBtn').click();assert.equal(f.diag().assistActive,true);
});

test('primary mobile Assist has one ID, an uncollapsed dock parent and a nonscrolling 44px control row',async t=>{
  const f=await fixture(t,{boot:false}),doc=f.window.document,button=f.$('assistBtn'),row=f.$('quickControls');
  assert.equal(doc.querySelectorAll('#assistBtn').length,1);assert.equal(button.parentElement,row);assert.equal(row.parentElement,f.$('controlDock'));
  assert.equal(button.closest('.toolbar-main,.control-center-rail,details'),null);
  for(let p=button;p;p=p.parentElement)assert.equal(p.hidden,false);
  // Styles are checked as rules. Happy DOM cannot verify actual pixel placement.
  const controlRules=css.slice(css.indexOf('/* v4.1:'));
  assert.match(controlRules,/#controlDock \.quick-controls\{[^}]*display:grid[^}]*overflow:visible/);
  assert.match(controlRules,/#controlDock \.quick-controls>button\{[^}]*min-height:44px[^}]*white-space:normal/);
  assert.doesNotMatch(controlRules,/#controlDock #assistBtn\{[^}]*(?:display:none|visibility:hidden)/);
  assert.match(css,/#controlDock\{[^}]*env\(safe-area-inset-bottom\)/);
});

test('measured dock height includes quick controls and safe area; very short viewports request scroll instead of shrinking touch targets',()=>{
  // Input heights represent complete measured docks, not unverified screenshots.
  const portrait=calculatePracticeLayout({width:390,height:844,focus:true,headerHeight:93,dockHeight:390,topInset:47,orientation:'portrait'});
  assert.equal(portrait.dockHeight,390);assert.equal(portrait.touchTarget,44);assert.equal(portrait.constrained,false);
  assert.ok(portrait.headerHeight+portrait.sceneHeight+portrait.dockHeight<=844-49);
  const short=calculatePracticeLayout({width:568,height:320,focus:true,headerHeight:50,dockHeight:260,topInset:4,orientation:'landscape'});
  assert.equal(short.dockHeight,260);assert.equal(short.sceneHeight,64);assert.equal(short.touchTarget,44);assert.equal(short.constrained,true);assert.ok(short.shellHeight>320);
  assert.match(css,/body\.practice-focus\[data-layout-constrained="true"\]\{overflow:auto\}/);
});
