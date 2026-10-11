import test from 'node:test';
import assert from 'node:assert/strict';
import {SpeechController,pickVoice,voiceMatchScore} from '../js/speech.js';
import {dictionary,supportedLanguages,normalizeLanguage,detectLanguage,applyLanguage} from '../js/i18n.js';
import {messageDictionary} from '../js/messages.js';
const voice=(lang,name=lang)=>({lang,name,voiceURI:name,localService:true});
function harness(voices=[voice('zh-Hant-TW')]){
 const events=[],spoken=[],listeners={};let canceled=0;
 const synth={getVoices:()=>voices,speak:u=>spoken.push(u),cancel:()=>canceled++,resume(){},addEventListener:(k,f)=>listeners[k]=f,removeEventListener:k=>delete listeners[k]};
 class Utterance {constructor(text){this.text=text;}}
 const control=new SpeechController({lang:'zh-TW',synth,Utterance,onStatus:s=>events.push(s),startTimeout:40});
 return {control,events,spoken,listeners,synth,voices,get canceled(){return canceled;}};
}
test('speech waits for gesture and only reports playback after onstart',()=>{
 const h=harness();assert.equal(h.events.at(-1).code,'needsGesture');assert.equal(h.control.speak('你好'),false);assert.equal(h.spoken.length,0);
 assert.equal(h.control.enableFromGesture('你好',{isTrusted:true}),true);assert.equal(h.spoken.length,1);assert.equal(h.events.at(-1).code,'queued');assert.equal(h.control.hasStarted,false);
 h.spoken[0].onstart();assert.equal(h.events.at(-1).code,'speaking');assert.equal(h.control.hasStarted,true);assert.equal(h.events.at(-1).voiceLang,'zh-Hant-TW');h.control.destroy();
});
test('voice matching handles scripts, regions and underscores without silently selecting English',()=>{
 const vs=[voice('en-US'),voice('zh-CN'),voice('zh_Hant_HK'),voice('zh-TW')];assert.equal(pickVoice(vs,'zh-TW').lang,'zh-TW');assert.equal(pickVoice(vs.slice(0,3),'zh-TW').lang,'zh_Hant_HK');assert.equal(pickVoice([voice('en')],'th'),null);assert.ok(voiceMatchScore(voice('zh-Hant'),'zh-TW')>voiceMatchScore(voice('zh-CN'),'zh-TW'));
});
test('late voices request another tap, never an untrusted delayed automatic utterance',()=>{
 const voices=[],h=harness(voices);h.control.enableFromGesture('你好',{isTrusted:true});assert.equal(h.events.at(-1).code,'voiceLoading');assert.equal(h.spoken.length,0);
 voices.push(voice('zh-TW'));h.listeners.voiceschanged();assert.equal(h.events.at(-1).code,'needsGesture');assert.equal(h.spoken.length,0);
 h.control.enableFromGesture('你好',{isTrusted:true});assert.equal(h.spoken.length,1);h.control.destroy();
});
test('manual voice exposes actual language; unavailable language is explicit',()=>{
 const h=harness([voice('en-US')]);h.control.enableFromGesture('你好',{isTrusted:true});assert.equal(h.events.at(-1).code,'voiceMissing');h.control.setVoice('en-US');h.control.enableFromGesture('你好',{isTrusted:true});assert.equal(h.spoken[0].lang,'en-US');assert.equal(h.events.at(-1).voiceLang,'en-US');h.control.destroy();
});
test('cancel retains current utterance and stale cancellation cannot overwrite next status',()=>{
 const h=harness();h.control.enableFromGesture('甲',{isTrusted:true});const old=h.spoken[0];assert.equal(h.control.utterance,old);old.onstart();h.control.speak('乙');old.onerror({error:'interrupted'});assert.equal(h.events.at(-1).code,'queued');assert.equal(h.control.utterance,h.spoken[1]);h.control.destroy();
});
test('blocked speech clears permission and requires another real tap',()=>{
 const h=harness();h.control.enableFromGesture('你好',{isTrusted:true});h.spoken[0].onerror({error:'not-allowed'});assert.equal(h.events.at(-1).code,'blocked');assert.equal(h.control.hasStarted,false);assert.equal(h.control.speak('再試'),false);assert.equal(h.events.at(-1).code,'needsGesture');h.control.destroy();
});
test('no-start watchdog does not falsely claim playback and synthetic click is rejected',async()=>{
 const h=harness();h.control.enableFromGesture('你好',{isTrusted:false});assert.equal(h.spoken.length,0);h.control.enableFromGesture('你好',{isTrusted:true});await new Promise(r=>setTimeout(r,60));assert.equal(h.events.at(-1).code,'blocked');assert.equal(h.control.hasStarted,false);h.control.destroy();
});
test('all 18 languages have every UI and runtime key, including interpolation variables',()=>{
 const variables=s=>[...s.matchAll(/\{\w+\}/g)].map(x=>x[0]).sort();assert.equal(supportedLanguages.length,18);
 for(const l of supportedLanguages)for(const dict of [dictionary,messageDictionary]){
  assert.deepEqual(Object.keys(dict[l]).sort(),Object.keys(dict.en).sort(),l);
  for(const k of Object.keys(dict.en)){assert.ok(dict[l][k].trim(),`${l}:${k}`);assert.deepEqual(variables(dict[l][k]),variables(dict.en[k]),`${l}:${k}`);}
 }
});
test('locale detection follows preference order, Chinese script and manual override',()=>{
 const desc=Object.getOwnPropertyDescriptor(globalThis,'navigator');const oldStorage=globalThis.localStorage;let saved='auto';
 try{Object.defineProperty(globalThis,'navigator',{value:{languages:['xx-ZZ','vi-VN','en-US']},configurable:true});globalThis.localStorage={getItem:()=>saved};assert.equal(detectLanguage(),'vi');saved='ar';assert.equal(detectLanguage(),'ar');assert.equal(normalizeLanguage('zh-Hans-SG'),'zh-CN');assert.equal(normalizeLanguage('zh-Hant-TW'),'zh-TW');assert.equal(normalizeLanguage('id_ID'),'id');}
 finally{if(desc)Object.defineProperty(globalThis,'navigator',desc);else delete globalThis.navigator;if(oldStorage)globalThis.localStorage=oldStorage;else delete globalThis.localStorage;}
});

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {recordedSpeech} from '../data/localization-v3-audio.js';
import {getMessage} from '../js/messages.js';
function fakeAudioClass({reject=false}={}){
 return class {static all=[];constructor(){this.constructor.all.push(this);this.playCount=0;}play(){this.playCount++;return reject?Promise.reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'})):Promise.resolve();}pause(){this.paused=true;}};
}
test('known recordings play synchronously when no system voice exists and retain one media element',()=>{
 const AudioClass=fakeAudioClass(),events=[];
 const c=new SpeechController({lang:'zh-TW',synth:undefined,Utterance:undefined,AudioClass,onStatus:s=>events.push(s)});
 assert.equal(c.getVoices()[0].recorded,true);
 assert.equal(c.enableFromGesture(getMessage('zh-TW','voiceTest'),{isTrusted:true}),true);
 assert.equal(AudioClass.all[0].playCount,1);assert.ok(AudioClass.all[0].src.endsWith('voice-test.mp3'));assert.equal(events.at(-1).code,'queued');assert.equal(events.at(-1).voiceLang,'cmn');
 AudioClass.all[0].onplaying();assert.equal(events.at(-1).code,'speaking');
 c.speak('預備式・起勢');assert.equal(AudioClass.all.length,1);assert.equal(AudioClass.all[0].playCount,2);c.destroy();
});
test('recording playback rejection is visible; no fake generative dialogue speech fallback',async()=>{
 const AudioClass=fakeAudioClass({reject:true}),events=[];
 const c=new SpeechController({lang:'en',synth:undefined,Utterance:undefined,AudioClass,onStatus:s=>events.push(s)});
 c.enableFromGesture(getMessage('en','voiceTest'),{isTrusted:true});await Promise.resolve();assert.equal(events.at(-1).code,'blocked');assert.equal(c.hasStarted,false);
 c.enableFromGesture('An arbitrary answer that is not recorded',{isTrusted:true});assert.equal(events.at(-1).code,'unsupported');assert.equal(AudioClass.all[0].playCount,1);c.destroy();
});
test('explicit recording voice uses the clip even with native voices; default prefers native',()=>{
 const h=harness([voice('zh-TW')]);h.control.AudioClass=fakeAudioClass();h.control.primeAudioOnGesture=false;h.control.enableFromGesture('預備式・起勢',{isTrusted:true});assert.equal(h.spoken.length,1);h.control.setVoice('recorded:zh-TW');h.control.enableFromGesture('預備式・起勢',{isTrusted:true});assert.equal(h.spoken.length,1);assert.equal(h.control.audio.playCount,1);h.control.destroy();
});
test('684 prerecorded MP3s have correct hashes and all 18 languages have 37 forms plus test',()=>{
 const root=path.resolve(import.meta.dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/audio/manifest.json')));
 assert.equal(manifest.files.length,684);
 for(const l of supportedLanguages){assert.equal(manifest.files.filter(r=>r.lang===l).length,38);assert.ok(recordedSpeech[l][getMessage(l,'voiceTest')]);}
 for(const row of manifest.files){const bytes=fs.readFileSync(path.join(root,row.path));assert.equal(bytes.length,row.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.sha256);assert.ok(row.spokenText);assert.ok(bytes.length>500);}
 assert.ok(manifest.files.filter(r=>r.lang.startsWith('zh')).every(r=>r.voice==='cmn-latn-pinyin'));
 assert.ok(manifest.files.filter(r=>r.lang==='ja').every(r=>!/[\u4e00-\u9fff]/u.test(r.spokenText)));
});
