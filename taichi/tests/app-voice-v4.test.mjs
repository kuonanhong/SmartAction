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
 const window=new Window({url:'https://example.invalid/taichi/',width:390,settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:false}});
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
 return {window,$,dispatch,plays,utterances,audios,voiceEvents,voices,diag:()=>window.SmartActionDiagnostics(),get cancels(){return cancels;},saved:()=>JSON.parse(window.localStorage.getItem('smartaction-speech-v4'))};
}

test('distributed voice controls initialize after controller assignment and do not claim playback before playing event',async t=>{
 const h=await fixture(t);assert.equal(h.window.SmartActionBooted,true);assert.equal(h.diag().naturalVoices,8);assert.equal(h.$('voiceSelect').value,'');assert.equal(h.$('voiceStatus').dataset.state,'needsGesture');
 h.dispatch('enableVoiceBtn');assert.equal(h.plays.length,1);assert.match(h.plays[0].src,/audio-natural\/zf_xiaobei\/test\.mp3$/);assert.equal(h.utterances.length,0);assert.equal(h.$('voiceStatus').dataset.state,'queued');assert.equal(h.diag().speechSource,'Kokoro-82M v1.0');
 await Promise.resolve();assert.equal(h.$('voiceStatus').dataset.state,'queued');h.audios[0].onplaying();assert.equal(h.$('voiceStatus').dataset.state,'speaking');assert.match(h.$('voiceStatus').textContent,/Xiaobei/);assert.match(h.$('voiceStatus').textContent,/zh-CN/);assert.match(h.$('voiceStatus').textContent,/Kokoro-82M v1.0/);
});

test('replay UI restarts a playing clip while duplicate enable events do not restart it',async t=>{
 const h=await fixture(t);h.dispatch('enableVoiceBtn');h.audios[0].onplaying();h.dispatch('enableVoiceBtn');assert.equal(h.plays.length,1);
 h.dispatch('voiceReplayBtn');assert.equal(h.plays.length,2);assert.equal(h.plays[1].src,h.plays[0].src);assert.equal(h.$('voiceStatus').dataset.state,'queued');assert.equal(h.$('voiceBtn').getAttribute('aria-pressed'),'true');
});

test('native choice and rate persist per language and apply to actual utterances without idle cancellation',async t=>{
 const h=await fixture(t,{preferences:{rate:1.2,voices:{'zh-TW':'native:tw',en:'native:en'}}});
 assert.equal(h.$('voiceSelect').value,'native:tw');assert.equal(h.$('voiceRate').value,'1.2');
 h.dispatch('enableVoiceBtn');assert.equal(h.utterances.length,1);assert.equal(h.utterances[0].voice.voiceURI,'native:tw');assert.equal(h.utterances[0].rate,1.2);assert.equal(h.cancels,0);
 h.utterances[0].onstart();h.utterances[0].onend();h.dispatch('voiceRate','input','0.75');assert.equal(h.saved().rate,.75);h.dispatch('enableVoiceBtn');assert.equal(h.utterances.at(-1).rate,.75);assert.equal(h.cancels,0);
 h.dispatch('language','change','en');assert.equal(h.$('voiceSelect').value,'native:en');h.dispatch('language','change','zh-TW');assert.equal(h.$('voiceSelect').value,'native:tw');assert.equal(h.saved().voices.en,'native:en');
});

test('source and gender filters preserve explicit choice and do not label native voices as male or female',async t=>{
 const h=await fixture(t);h.dispatch('voiceSource','change','natural');h.dispatch('voiceGender','change','male');
 const options=[...h.$('voiceSelect').options].filter(x=>x.value);assert.equal(options.length,2);for(const option of options)assert.match(option.value,/^recorded:kokoro:zm_/);
 h.dispatch('voiceSelect','change',options[0].value);assert.equal(h.saved().voices['zh-TW'],options[0].value);h.dispatch('voiceGender','change','female');assert.equal(h.$('voiceSelect').value,options[0].value);
 h.dispatch('voiceResetBtn');assert.equal(h.$('voiceSource').value,'all');assert.equal(h.$('voiceGender').value,'all');assert.equal(h.$('voiceSelect').value,'');
 h.dispatch('voiceSource','change','system');h.dispatch('voiceGender','change','unknown');assert.deepEqual([...h.$('voiceSelect').options].map(x=>x.value),['','native:tw','native:en']);
 h.dispatch('voiceGender','change','female');assert.deepEqual([...h.$('voiceSelect').options].map(x=>x.value),['']);assert.equal(h.$('voiceNoResults').hidden,false);
});

test('missing saved native URI remains visible and restores its normal option after late voice discovery',async t=>{
 const voices=[...nativeVoices],missing='native:late-mandarin';
 const h=await fixture(t,{voices,preferences:{rate:1,voices:{'zh-TW':missing}}});
 assert.equal(h.$('voiceSelect').value,missing);const pending=[...h.$('voiceSelect').options].find(x=>x.value===missing);assert.ok(pending);assert.match(pending.textContent,/native:late-mandarin/);assert.equal(h.saved().voices['zh-TW'],missing);
 voices.push(native(missing,'zh-TW','Late Mandarin'));h.voiceEvents.voiceschanged();const loaded=[...h.$('voiceSelect').options].find(x=>x.value===missing);assert.equal(h.$('voiceSelect').value,missing);assert.match(loaded.textContent,/Late Mandarin/);assert.equal(loaded.disabled,false);
});

test('manual natural voice reads arbitrary answer through the actual system voice, with backup scoped to fixed phrases',async t=>{
 const h=await fixture(t,{preferences:{rate:1,voices:{'zh-TW':'recorded:kokoro:zf_xiaoyi'}}});
 h.$('coachAnswer').textContent='這是一段未預錄的個別回應。';h.dispatch('readAnswerBtn');assert.equal(h.utterances.length,1);assert.equal(h.utterances[0].voice.voiceURI,'native:tw');assert.equal(h.diag().speechSource,'Web Speech API');assert.match(h.$('voiceStatus').textContent,/Web Speech API/);assert.equal(h.$('voiceSelect').value,'recorded:kokoro:zf_xiaoyi');
 h.dispatch('voiceBackupBtn');assert.match(h.plays.at(-1).src,/audio-natural\/zf_xiaobei\/test\.mp3$/);assert.equal(h.diag().speechSource,'Kokoro-82M v1.0');assert.equal(h.cancels,1);
});
