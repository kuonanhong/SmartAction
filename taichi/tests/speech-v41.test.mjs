import test from 'node:test';
import assert from 'node:assert/strict';
import {SpeechController} from '../js/speech.js';
const TAP={isTrusted:true},text='預備式・起勢';
const bank={id:'fixture:natural',name:'Fixture natural',lang:'zh',actualLang:'zh-CN',quality:'natural',priority:20,source:'Test fixture',clips:{[text]:'assets/audio-natural/fixture/01.mp3'}};
function setup({audioMode='manual',voice=true,throwConstructor=false,startTimeout=25}={}){
 const utterances=[],statuses=[],plays=[],audios=[];let cancelCount=0;
 class Audio{
  constructor(){if(throwConstructor)throw Object.assign(new Error('No media'),{name:'NotSupportedError'});this.paused=true;audios.push(this);}
  play(){this.paused=false;plays.push(this.src);return audioMode==='reject'?Promise.reject(Object.assign(new Error('Bad source'),{name:'NotSupportedError'})):Promise.resolve();}
  pause(){this.paused=true;}
 }
 class Utterance{constructor(t){this.text=t;}}
 const native={voiceURI:'native:zh',lang:'zh-TW',name:'Desktop voice',localService:true};
 const synth=voice?{getVoices:()=>[native],speak:u=>utterances.push(u),cancel:()=>cancelCount++,addEventListener(){},removeEventListener(){}}:undefined;
 const c=new SpeechController({lang:'zh-TW',synth,Utterance:voice?Utterance:undefined,AudioClass:Audio,recordedBanks:[bank],primeAudioOnGesture:false,onStatus:s=>statuses.push(s),startTimeout});
 return {c,utterances,statuses,plays,audios,get cancels(){return cancelCount;}};
}
const ticks=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
test('v4.1 failed natural file attempts native speech and confirms only an actual start',async()=>{
 const h=setup({audioMode:'reject'});h.c.enableFromGesture(text,TAP);await ticks();
 assert.equal(h.plays.length,1);assert.equal(h.utterances.length,1);assert.equal(h.utterances[0].text,text);assert.equal(h.statuses.at(-1).code,'queued');assert.equal(h.c.hasStarted,false);
 h.utterances[0].onstart();assert.equal(h.statuses.at(-1).code,'speaking');assert.equal(h.statuses.at(-1).voiceType,'system');assert.equal(h.statuses.at(-1).fallbackReason,'NotSupportedError');h.c.destroy();
});
test('v4.1 fallback is bounded and tries mechanical clip after natural file and native failure',async()=>{
 const h=setup({audioMode:'reject'});h.c.enableFromGesture(text,TAP);await ticks();h.utterances[0].onerror({error:'synthesis-failed'});await ticks();
 assert.equal(h.utterances.length,1);assert.equal(h.plays.length,2);assert.ok(h.plays[0].includes('audio-natural/'));assert.ok(h.plays[1].includes('assets/audio/'));assert.equal(h.c.active,null);assert.equal(h.statuses.at(-1).code,'error');assert.equal(h.c.hasStarted,false);assert.equal(h.c.lastText,text);h.c.destroy();
});
test('v4.1 a late playing callback from a failed file cannot claim native playback',()=>{
 const h=setup();h.c.enableFromGesture(text,TAP);const oldPlaying=h.audios[0].onplaying;h.audios[0].onerror();assert.equal(h.utterances.length,1);oldPlaying();assert.equal(h.c.hasStarted,false);assert.equal(h.statuses.at(-1).code,'queued');assert.equal(h.statuses.at(-1).voiceType,'system');h.c.destroy();
});
test('v4.1 a recording that never starts transitions to desktop speech without claiming success',async()=>{
 const h=setup({startTimeout:15});h.c.enableFromGesture(text,TAP);await new Promise(r=>setTimeout(r,22));assert.equal(h.utterances.length,1);assert.equal(h.c.hasStarted,false);assert.equal(h.statuses.at(-1).voiceType,'system');h.utterances[0].onstart();assert.equal(h.c.hasStarted,true);h.c.destroy();
});
test('v4.1 no native engine uses one independent backup and does not loop through locale aliases',async()=>{
 const h=setup({voice:false,audioMode:'reject'});h.c.enableFromGesture(text,TAP);await ticks();assert.equal(h.plays.length,2);assert.equal(new Set(h.plays).size,2);assert.ok(h.plays[1].includes('assets/audio/'));assert.equal(h.c.active,null);assert.equal(h.statuses.at(-1).code,'error');h.c.destroy();
});
test('v4.1 throwing media constructors cannot suppress an available native voice',()=>{
 const h=setup({throwConstructor:true});assert.doesNotThrow(()=>h.c.enableFromGesture(text,TAP));assert.equal(h.utterances.length,1);h.utterances[0].onstart();assert.equal(h.statuses.at(-1).code,'speaking');h.c.destroy();
});
test('v4.1 trusted controls may attempt playback after transient activation is consumed, synthetic clicks may not',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 try{Object.defineProperty(globalThis,'navigator',{configurable:true,value:{userActivation:{isActive:false}}});const h=setup();h.c.enableFromGesture(text,{isTrusted:false});assert.equal(h.plays.length,0);h.c.enableFromGesture(text,TAP);assert.equal(h.plays.length,1);assert.equal(h.c.hasStarted,false);h.c.destroy();}
 finally{if(descriptor)Object.defineProperty(globalThis,'navigator',descriptor);else delete globalThis.navigator;}
});
test('v4.1 native audio control metadata returns only exact fixed text and honours selected recordings',()=>{
 const h=setup();assert.deepEqual(h.c.getRecordedClip(text),{path:bank.clips[text],voiceURI:'recorded:fixture:natural',voiceName:bank.name,lang:'zh-CN',source:'Test fixture'});h.c.setVoice('recorded:zh-TW');const fallback=h.c.getRecordedClip(text);assert.ok(fallback.path.startsWith('assets/audio/'));assert.equal(fallback.voiceURI,'recorded:zh-TW');assert.equal(h.c.getRecordedClip('A unique free-form answer'),null);h.c.destroy();
});
