/** Actual distribution bundle in a simulated DOM. Audio and trusted events are fixtures,
 * so these checks do not constitute browser, operating-system, or speaker hardware QA. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
let Window;
try{({Window}=await import('happy-dom'));}catch(error){const dir=process.env.SMARTACTION_BUILD_TOOLS;if(!dir)throw error;({Window}=await import(pathToFileURL(createRequire(path.join(dir,'package.json')).resolve('happy-dom')).href));}
const [html,source]=await Promise.all(['index.html','js/game.js'].map(name=>readFile(new URL('../'+name,import.meta.url),'utf8')));
const native=(voiceURI,lang,name)=>({voiceURI,lang,name,localService:true});
const nativeVoices=[native('native:tw','zh-TW','Device Mandarin'),native('native:en','en-US','Device English')];
async function fixture(t,{preferences={rate:1,voices:{}},lang='zh-TW',voices=nativeVoices}={}){
 const window=new Window({url:'https://example.invalid/taichi/',width:1440,settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:false}});
 const errors=[],plays=[],utterances=[],audios=[],voiceEvents={};let cancels=0;
 window.localStorage.setItem('smartaction-language',lang);window.localStorage.setItem('smartaction-speech-v4',JSON.stringify(preferences));
 window.requestAnimationFrame=()=>1;window.cancelAnimationFrame=()=>{};
 window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 window.fetch=async()=>{throw new Error('Network intentionally disabled in test');};
 window.HTMLCanvasElement.prototype.getContext=function(type){if(type!=='2d')return null;return new Proxy({canvas:this,createLinearGradient:()=>({addColorStop(){}}),measureText:()=>({width:40})},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});};
 window.HTMLElement.prototype.setPointerCapture=()=>{};
 class Audio{
  constructor(){this.paused=true;audios.push(this);}
  play(){this.paused=false;plays.push({src:this.src,rate:this.playbackRate});return Promise.resolve();}
  pause(){this.paused=true;}
 }
 window.Audio=Audio;
 window.speechSynthesis={cancel(){cancels++;},resume(){},getVoices:()=>voices,speak(u){utterances.push(u);},addEventListener:(type,fn)=>voiceEvents[type]=fn,removeEventListener:type=>delete voiceEvents[type]};
 window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 Object.defineProperty(window.navigator,'userActivation',{value:{isActive:true,hasBeenActive:true},configurable:true});
 window.addEventListener('error',event=>errors.push(event.message||String(event.error)));
 window.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));window.eval(source);await Promise.resolve();
 const $=id=>window.document.getElementById(id);
 // Only synthetic test fixtures set isTrusted: no production code bypasses browser checks.
 const dispatch=(id,type='click',value)=>{if(value!==undefined)$(id).value=value;const event=new window.Event(type,{bubbles:true});Object.defineProperty(event,'isTrusted',{value:true});$(id).dispatchEvent(event);};
 t.after(async()=>{window.dispatchEvent(new window.Event('pagehide'));await window.happyDOM.close();assert.deepEqual(errors,[]);});
 const direct=$('directVoicePlayer');let directPaused=true,directPauses=0;
 Object.defineProperty(direct,'paused',{configurable:true,get:()=>directPaused});
 direct.pause=()=>{directPaused=true;directPauses++;direct.dispatchEvent(new window.Event('pause'));};
 const directPlay=()=>{directPaused=false;direct.dispatchEvent(new window.Event('play'));};
 return {window,$,dispatch,plays,utterances,audios,voiceEvents,voices,directPlay,get directPauses(){return directPauses;},diag:()=>window.SmartActionDiagnostics(),get cancels(){return cancels;},saved:()=>JSON.parse(window.localStorage.getItem('smartaction-speech-v4'))};
}


test('v4.1 desktop first sound-button tap activates current phrase; subsequent tap mutes only after playback starts',async t=>{
 const h=await fixture(t);assert.equal(h.window.SmartActionBooted,true);assert.equal(h.$('voiceBtn').textContent,'啟用聲音');assert.equal(h.$('voiceBtn').getAttribute('aria-pressed'),'false');
 h.dispatch('voiceBtn');assert.equal(h.plays.length,1);assert.match(h.plays[0].src,/audio-natural\/zf_xiaobei\/01\.mp3$/);assert.equal(h.$('voiceStatus').dataset.state,'queued');assert.equal(h.$('voiceBtn').getAttribute('aria-pressed'),'false');
 h.dispatch('voiceBtn');assert.equal(h.plays.length,1);assert.notEqual(h.$('voiceStatus').dataset.state,'off');h.audios[0].onplaying();assert.equal(h.$('voiceBtn').getAttribute('aria-pressed'),'true');
 h.dispatch('voiceBtn');assert.equal(h.$('voiceStatus').dataset.state,'off');assert.equal(h.audios[0].paused,true);assert.equal(h.$('voiceBtn').getAttribute('aria-pressed'),'false');
 h.dispatch('voiceBtn');assert.equal(h.plays.length,2);assert.equal(h.$('voiceStatus').dataset.state,'queued');
});

test('v4.1 always-visible sound trial works while advanced sound settings remain collapsed',async t=>{
 const h=await fixture(t);assert.equal(h.$('soundSettings').open,false);assert.ok(h.$('controlDock').contains(h.$('enableSoundBtn')));assert.equal(h.$('enableSoundBtn').closest('details'),null);
 h.dispatch('enableSoundBtn');assert.equal(h.plays.length,1);assert.match(h.plays[0].src,/\/test\.mp3$/);assert.equal(h.$('voiceStatus').dataset.state,'queued');h.audios[0].onplaying();assert.match(h.$('quickVoiceStatus').textContent,/Xiaobei/);
});

test('v4.1 native audio and independent link follow selected voice, language, movement and rate',async t=>{
 const h=await fixture(t);const p=h.$('directVoicePlayer');assert.equal(p.controls,true);assert.equal(p.preload,'none');assert.equal(p.hidden,false);assert.equal(p.closest('details'),null);assert.equal(h.$('directVoiceLink').href,p.src);assert.match(h.$('directVoiceName').textContent,/Xiaobei · zh-CN/);
 h.dispatch('voiceSelect','change','recorded:kokoro:zm_yunxi');assert.match(p.src,/\/zm_yunxi\/01\.mp3$/);assert.match(h.$('directVoiceName').textContent,/Yunxi/);assert.equal(h.$('directVoiceLink').href,p.src);
 h.dispatch('language','change','en');assert.match(p.src,/\/af_heart\/01\.mp3$/);assert.match(h.$('directVoiceName').textContent,/Heart/);assert.equal(h.$('directVoiceLink').href,p.src);
 h.$('movementList').querySelectorAll('button')[1].click();assert.match(p.src,/\/af_heart\/02\.mp3$/);assert.equal(h.$('directVoiceLink').href,p.src);
 h.dispatch('voiceRate','input','1.25');assert.equal(p.playbackRate,1.25);
});

test('v4.1 direct native play stops controller audio; only playing confirms its source and pause clears speaking state',async t=>{
 const h=await fixture(t);h.dispatch('voiceBtn');h.audios[0].onplaying();assert.match(h.$('quickVoiceStatus').textContent,/Xiaobei/);
 h.directPlay();assert.equal(h.audios[0].paused,true);assert.notEqual(h.$('voiceStatus').dataset.state,'speaking');
 h.$('directVoicePlayer').dispatchEvent(new h.window.Event('playing'));assert.match(h.$('quickVoiceStatus').textContent,/Xiaobei/);assert.match(h.$('quickVoiceStatus').textContent,/zh-CN/);
 h.$('directVoicePlayer').pause();assert.equal(h.$('quickVoiceStatus').textContent,h.$('voiceStatus').textContent);assert.notEqual(h.$('voiceStatus').dataset.state,'speaking');
});

test('v4.1 activating controller voice stops native player to avoid overlapping speech',async t=>{
 const h=await fixture(t);h.directPlay();h.$('directVoicePlayer').dispatchEvent(new h.window.Event('playing'));assert.equal(h.$('directVoicePlayer').paused,false);
 h.dispatch('enableSoundBtn');assert.equal(h.$('directVoicePlayer').paused,true);assert.equal(h.directPauses,1);assert.equal(h.plays.length,1);assert.equal(h.$('voiceStatus').dataset.state,'queued');
});

test('v4.1 exhausted playback failures stay visible beside controls without opening sound settings',async t=>{
 const h=await fixture(t);h.dispatch('enableSoundBtn');h.audios[0].onerror();assert.equal(h.utterances.length,1);h.utterances[0].onerror({error:'synthesis-failed'});assert.equal(h.plays.length,2);h.audios[0].onerror();assert.equal(h.$('voiceStatus').dataset.state,'error');assert.match(h.$('quickVoiceStatus').textContent,/audio-file-unavailable/);assert.equal(h.$('soundSettings').open,false);assert.equal(h.$('voiceBtn').textContent,'啟用聲音');
 h.$('directVoicePlayer').dispatchEvent(new h.window.Event('error'));assert.match(h.$('quickVoiceStatus').textContent,/audio-file-unavailable/);
});
