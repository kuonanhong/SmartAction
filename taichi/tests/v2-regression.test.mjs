// Node / Happy DOM wiring tests; NOT browser, WebGL, phone, microphone or camera tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

let Window;
try {({Window}=await import('happy-dom'));}
catch {
  if(!process.env.SMARTACTION_BUILD_TOOLS)throw new Error('DOM tests need npm install, or SMARTACTION_BUILD_TOOLS pointing to a node_modules directory.');
  ({Window}=await import(pathToFileURL(createRequire(path.join(process.env.SMARTACTION_BUILD_TOOLS,'package.json')).resolve('happy-dom')).href));
}
const root=new URL('../',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
const bundle=await readFile(new URL('js/game.js',root),'utf8');
const bootstrap=await readFile(new URL('js/bootstrap.js',root),'utf8');
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};

async function fixture(t,{protocol='file:',width=1280,boot=true}={}){
  const url=protocol==='file:'?'file:///extracted/SmartAction_Taichi_Game/index.html':'https://example.invalid/SmartAction/taichi/index.html';
  const window=new Window({url,width,settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:false}});
  const frames=new Map(),fetches=[],speech=[],errors=[],imageSources=[];let now=0,next=1;
  window.matchMedia=query=>({matches:/max-width:\s*(\d+)/.test(query)?width<=Number(RegExp.$1):false,media:query,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  window.requestAnimationFrame=callback=>{const id=next++;frames.set(id,callback);return id;};
  window.cancelAnimationFrame=id=>frames.delete(id);
  window.fetch=async(...args)=>{fetches.push(String(args[0]));throw new Error('Test blocks all network access');};
  Object.defineProperty(window.navigator,'serviceWorker',{configurable:true,value:{register:async()=>({})}});
  window.speechSynthesis={cancel(){},getVoices:()=>[],speak:utterance=>speech.push({text:utterance.text,lang:utterance.lang})};
  window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
  const imageSourceDescriptor=Object.getOwnPropertyDescriptor(window.HTMLImageElement.prototype,'src');
  Object.defineProperty(window.HTMLImageElement.prototype,'src',{...imageSourceDescriptor,set(value){imageSources.push(value);imageSourceDescriptor.set.call(this,value);}});
  window.HTMLCanvasElement.prototype.getContext=function(type){
    if(type!=='2d')return null;
    return new Proxy({canvas:this,createLinearGradient:()=>({addColorStop(){}}),measureText:()=>({width:40})},{get:(target,key)=>key in target?target[key]:()=>{},set:(target,key,value)=>{target[key]=value;return true;}});
  };
  window.HTMLElement.prototype.setPointerCapture=function(){};
  window.HTMLElement.prototype.releasePointerCapture=function(){};
  window.addEventListener('error',event=>errors.push(event.message||String(event.error)));
  window.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
  const $=id=>window.document.getElementById(id);
  window.eval(bootstrap);
  if(boot)window.eval(bundle);
  await flush();
  const frame=seconds=>{
    const count=Math.ceil(seconds/.05);
    for(let i=0;i<count;i++){
      now+=50;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback(now));
    }
  };
  const pointer=(action,type,pointerId)=>window.document.querySelector(`[data-action="${action}"]`).dispatchEvent(new window.PointerEvent(type,{bubbles:true,cancelable:true,pointerId,pointerType:'touch'}));
  t.after(async()=>{assert.deepEqual(errors,[],'no uncaught DOM errors');frames.clear();await window.happyDOM.close();});
  return {window,$,frame,fetches,speech,pointer,errors,imageSources,diag:()=>window.SmartActionDiagnostics()};
}

test('HTML loads classic scripts so file:// core has no mandatory module entry',()=>{
  assert.ok(!/<script\b[^>]*type=["']module["']/i.test(html));
  assert.match(html,/<script\b[^>]*src=["']js\/bootstrap\.js["']/);
  assert.match(html,/<script\b[^>]*src=["']js\/game\.js["']/);
  assert.ok(!/\bimport\.meta\b/.test(bundle),'bundled entry must not retain unsupported classic-script import.meta');
});

for(const protocol of ['file:','https:'])test(`${protocol} actual bundled entry boots with no model or network`,async t=>{
  const f=await fixture(t,{protocol});
  assert.equal(f.window.SmartActionBooted,true);
  assert.equal(f.diag().phase,'idle');assert.equal(f.diag().course,'cheng37');assert.equal(f.diag().moves,37);
  assert.equal(f.diag().renderer,'2d','test intentionally provides no WebGL');
  assert.equal(f.$('movementList').children.length,37);assert.equal(f.$('bootNotice').hidden,true);
  assert.deepEqual(f.fetches,[],'core must not fetch model, WASM, data or scene modules at boot');
  if(protocol==='file:')assert.ok(f.imageSources.some(src=>String(src).startsWith('data:image/jpeg;base64,')),'file:// renderer backdrop is embedded to avoid canvas-origin loading problems');
});

test('Start, pause, Replay and Assist are wired to actual session state',async t=>{
  const f=await fixture(t);f.$('startBtn').click();assert.equal(f.diag().phase,'demo');
  f.frame(.4);f.$('startBtn').click();f.frame(20);assert.equal(f.diag().phase,'demo','pause freezes the demonstration');
  f.$('startBtn').click();f.frame(10);assert.equal(f.diag().phase,'wait');
  f.frame(25);assert.equal(f.diag().phase,'wait','teacher waits for actual input');
  f.$('replayBtn').click();assert.equal(f.diag().phase,'demo');
  f.$('assistBtn').click();f.frame(11);assert.notEqual(f.$('moveCount').textContent,'1 / 37','assistance progresses a movement after matching');
  f.$('resetBtn').click();assert.equal(f.diag().phase,'idle');assert.equal(f.$('moveCount').textContent,'1 / 37');
});

test('small-width Focus and return remain operable; keyboard Q/E switch limbs',async t=>{
  const f=await fixture(t,{width:390});
  f.$('startBtn').click();assert.equal(f.window.document.body.classList.contains('practice-focus'),true);
  f.$('focusBtn').click();assert.equal(f.window.document.body.classList.contains('practice-focus'),false);
  const originalLeg=f.$('leftLimbBtn').dataset.side,originalHand=f.$('rightLimbBtn').dataset.side;
  f.window.document.dispatchEvent(new f.window.KeyboardEvent('keydown',{code:'KeyQ',bubbles:true}));
  f.window.document.dispatchEvent(new f.window.KeyboardEvent('keydown',{code:'KeyE',bubbles:true}));
  assert.notEqual(f.$('leftLimbBtn').dataset.side,originalLeg);assert.notEqual(f.$('rightLimbBtn').dataset.side,originalHand);
  f.$('leftLimbBtn').click();f.$('rightLimbBtn').click();
  assert.equal(f.$('leftLimbBtn').dataset.side,originalLeg);assert.equal(f.$('rightLimbBtn').dataset.side,originalHand);
});

test('two pointer IDs move both controls; release and blur clear held inputs',async t=>{
  const f=await fixture(t);f.$('startBtn').click();f.frame(.2);
  const initial=f.$('poseValues').textContent;
  f.pointer('leg-up','pointerdown',11);f.pointer('hand-up','pointerdown',22);f.frame(.45);
  const both=f.$('poseValues').textContent;assert.notEqual(both,initial);
  assert.equal(f.window.document.querySelectorAll('[data-action].pressed').length,2);
  f.pointer('leg-up','pointerup',11);f.frame(.4);const one=f.$('poseValues').textContent;assert.notEqual(one,both);
  assert.equal(f.window.document.querySelectorAll('[data-action].pressed').length,1);
  f.window.dispatchEvent(new f.window.Event('blur'));f.frame(.2);const stopped=f.$('poseValues').textContent;
  f.frame(1);assert.equal(f.$('poseValues').textContent,stopped);
  assert.equal(f.window.document.querySelectorAll('[data-action].pressed').length,0);
});

test('focus in the coach text field prevents movement shortcuts from stealing typing',async t=>{
  const f=await fixture(t);const side=f.$('leftLimbBtn').dataset.side;
  f.$('coachInput').focus();f.window.document.dispatchEvent(new f.window.KeyboardEvent('keydown',{code:'KeyQ',bubbles:true}));
  assert.equal(f.$('leftLimbBtn').dataset.side,side);assert.equal(f.diag().phase,'idle');
});

test('file:// optional model and camera errors do not freeze controls or fetch weights',async t=>{
  const f=await fixture(t);
  f.$('modelBtn').click();await flush();
  assert.equal(f.$('modelBtn').disabled,false);assert.equal(f.$('modelDownloadBtn').disabled,false);assert.equal(f.diag().model,'error');
  f.$('bodyCameraBtn').click();await flush();assert.equal(f.diag().bodyCamera,false);
  f.$('startBtn').click();assert.equal(f.diag().phase,'demo');f.$('replayBtn').click();f.$('focusBtn').click();
  assert.equal(f.window.document.body.classList.contains('practice-focus'),true);
  assert.deepEqual(f.fetches,[],'optional file:// features fail before any fetch');
});

test('model-free form produces labelled guide and can send answer to speech API',async t=>{
  const f=await fixture(t);
  f.$('language').value='en';f.$('language').dispatchEvent(new f.window.Event('change'));
  f.$('coachInput').value='How can I practise this movement?';f.$('coachForm').dispatchEvent(new f.window.Event('submit',{cancelable:true}));await flush();
  assert.match(f.$('coachAnswer').textContent,/not generated|not a generated|non-generative/i);
  assert.equal(f.$('coachSend').disabled,false);assert.ok(f.speech.length>=1);
  assert.ok(f.speech.at(-1).text.length>20);assert.equal(f.speech.at(-1).lang,'en');
  f.$('startBtn').click();assert.equal(f.diag().phase,'demo');assert.deepEqual(f.fetches,[]);
});

test('camera, environment, help, map and course selectors have active event handlers',async t=>{
  const f=await fixture(t);
  for(const value of ['first','second','third']){f.$('camera').value=value;f.$('camera').dispatchEvent(new f.window.Event('change'));}
  for(const [id,value]of [['timeSelect','night'],['weatherSelect','rain'],['seasonSelect','winter'],['climateSelect','cold']]){f.$(id).value=value;f.$(id).dispatchEvent(new f.window.Event('change'));}
  f.$('helpBtn').click();assert.equal(f.$('helpPanel').hidden,false);f.$('closeHelpBtn').click();assert.equal(f.$('helpPanel').hidden,true);
  f.$('mapBtn').click();assert.equal(f.$('mapPanel').hidden,false);assert.match(f.$('mapContent').querySelector('a').href,/google\.com\/maps/);f.$('closeMapBtn').click();assert.equal(f.$('mapPanel').hidden,true);
  f.$('course').value='baduanjin';f.$('course').dispatchEvent(new f.window.Event('change'));assert.equal(f.diag().moves,8);assert.equal(f.diag().phase,'idle');
});

test('missing game script shows actionable bootstrap error',async t=>{
  const f=await fixture(t,{boot:false});
  const script=f.window.document.createElement('script');script.src='js/game.js';f.window.document.body.append(script);script.dispatchEvent(new f.window.Event('error'));
  assert.equal(f.$('bootNotice').hidden,false);assert.match(f.$('bootNotice').textContent,/Missing script/);assert.ok(f.$('bootNotice').querySelector('a'));assert.ok(f.$('bootNotice').querySelector('button'));
});

test('manual physical-device report starts entirely untested and has no network code',async()=>{
  const report=await readFile(new URL('docs/DEVICE_TESTS.html',root),'utf8');
  assert.match(report,/No physical mobile device is claimed as tested yet/);
  assert.match(report,/value='pending'/);assert.match(report,/application\/json/);
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/.test(report));
});
