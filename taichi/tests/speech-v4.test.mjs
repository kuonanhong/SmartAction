import test from 'node:test';
import assert from 'node:assert/strict';
import {SpeechController,voiceMatchScore,normalizeVoiceLanguage} from '../js/speech.js';
const TAP={isTrusted:true},text='預備式・起勢';
const native=(uri='tw',lang='zh-TW')=>({voiceURI:uri,name:'Device '+uri,lang,localService:true,default:true});
const naturalBank={id:'test:female',name:'Test female recording',lang:'zh',actualLang:'zh-CN',gender:'female',source:'Test fixture, not real audio',clips:{[text]:'assets/audio-natural/test/open.mp3'}};
function fixture({voices=[native()],recordedBanks=[],timeout=30,audioMode='manual',poisonOnIdleCancel=false,primeAudioOnGesture=false}={}){
 let cancelCalls=0,poisoned=false;const utterances=[],statuses=[],audioInstances=[],listeners={},playCalls=[];
 class Utterance{constructor(t){this.text=t;}}
 class Audio{
  constructor(){this.paused=true;audioInstances.push(this);}
  play(){this.paused=false;playCalls.push(this.src);if(this.src?.startsWith('data:'))return Promise.resolve();if(audioMode==='reject')return Promise.reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'}));if(audioMode==='playing')queueMicrotask(()=>this.onplaying?.());return Promise.resolve();}
  pause(){this.paused=true;}
 }
 const synth={speaking:false,pending:false,getVoices:()=>voices,speak:u=>{utterances.push(u);synth.pending=true;if(poisoned)queueMicrotask(()=>u.onerror?.({error:'synthesis-failed'}));},cancel:()=>{if(poisonOnIdleCancel&&!synth.pending&&!synth.speaking)poisoned=true;cancelCalls++;synth.pending=false;synth.speaking=false;},resume(){},addEventListener:(k,f)=>listeners[k]=f,removeEventListener:k=>delete listeners[k]};
 const controller=new SpeechController({lang:'zh-TW',synth,Utterance,AudioClass:Audio,recordedBanks,startTimeout:timeout,onStatus:s=>statuses.push(s),primeAudioOnGesture});
 const startNative=()=>{synth.pending=false;synth.speaking=true;utterances.at(-1).onstart();};
 const endNative=()=>{synth.pending=false;synth.speaking=false;utterances.at(-1).onend();};
 return {controller,statuses,utterances,audioInstances,playCalls,synth,listeners,voices,startNative,endNative,get cancels(){return cancelCalls;}};
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
test('desktop idle speech never calls cancel before speak, nor between completed phrases',()=>{
 const h=fixture({poisonOnIdleCancel:true});h.controller.enableFromGesture('first sentence',TAP);assert.equal(h.cancels,0);assert.equal(h.utterances.length,1);h.startNative();h.endNative();h.controller.enableFromGesture('second sentence',TAP);assert.equal(h.cancels,0);assert.equal(h.utterances.length,2);h.startNative();assert.equal(h.statuses.at(-1).code,'speaking');h.controller.destroy();
});
test('duplicate start/demo events do not cancel or replay a pending or playing utterance',()=>{
 const h=fixture();h.controller.enableFromGesture(text,TAP);h.controller.speak(text);h.controller.enableFromGesture(text,TAP);assert.equal(h.utterances.length,1);assert.equal(h.cancels,0);h.startNative();h.controller.speak(text);assert.equal(h.utterances.length,1);assert.equal(h.statuses.at(-1).code,'speaking');h.controller.destroy();
});
test('explicit replay restarts a playing utterance but never restarts a pending duplicate',()=>{
 const h=fixture();h.controller.enableFromGesture(text,TAP);h.controller.replayFromGesture(TAP);assert.equal(h.utterances.length,1);h.startNative();h.controller.replayFromGesture(TAP);assert.equal(h.utterances.length,2);assert.equal(h.cancels,1);h.controller.destroy();
});
test('native-present-never-start transitions to known recording; actual playing confirms success',async()=>{
 const h=fixture({audioMode:'playing'});h.controller.enableFromGesture(text,TAP);assert.equal(h.utterances.length,1);assert.equal(h.statuses.at(-1).code,'queued');await wait(40);
 assert.equal(h.playCalls.length,1);assert.ok(h.playCalls[0].endsWith('/cheng37-01-opening.mp3'));assert.equal(h.statuses.at(-1).voiceType,'recorded');assert.equal(h.statuses.at(-1).fallbackReason,'start-timeout');assert.equal(h.statuses.at(-1).code,'speaking');assert.equal(h.controller.hasStarted,true);assert.equal(h.controller.lastText,text);h.controller.destroy();
});
test('native failure and blocked recording preserve exact text and expose a gesture retry',async()=>{
 const h=fixture({audioMode:'reject'});h.controller.enableFromGesture(text,TAP);h.utterances[0].onerror({error:'synthesis-failed'});await Promise.resolve();
 const status=h.statuses.at(-1);assert.equal(status.code,'blocked');assert.equal(status.needsGesture,true);assert.equal(status.error,'NotAllowedError');assert.equal(status.requestedText,text);assert.equal(h.controller.hasStarted,false);assert.equal(h.controller.speak(text),false);
 h.controller.replayFromGesture(TAP);assert.equal(h.playCalls.length,2);assert.equal(h.utterances.length,1);await Promise.resolve();h.controller.destroy();
});
test('recording play promise alone is not confirmed speech; no-start fallback is blocked',async()=>{
 const h=fixture({voices:[],audioMode:'manual',timeout:15});h.controller.enableFromGesture(text,TAP);await Promise.resolve();assert.equal(h.controller.hasStarted,false);assert.equal(h.statuses.at(-1).code,'queued');await wait(25);assert.equal(h.statuses.at(-1).code,'blocked');assert.equal(h.controller.hasStarted,false);h.controller.destroy();
});
test('native errors without matching clips never substitute unrelated canned speech',()=>{
 const h=fixture();h.controller.enableFromGesture('A unique generated answer',TAP);h.utterances[0].onerror({error:'network'});assert.equal(h.playCalls.length,0);assert.equal(h.statuses.at(-1).code,'error');assert.equal(h.controller.lastText,'A unique generated answer');assert.equal(h.statuses.at(-1).recordedAvailable,false);h.controller.destroy();
});
test('automatic fixed phrases prefer natural banks; arbitrary replies use native with unknown gender',()=>{
 const h=fixture({recordedBanks:[naturalBank]});h.controller.enableFromGesture(text,TAP);assert.equal(h.utterances.length,0);assert.ok(h.playCalls[0].endsWith('/test/open.mp3'));h.audioInstances[0].onplaying();assert.equal(h.statuses.at(-1).gender,'female');assert.equal(h.statuses.at(-1).voiceLang,'zh-CN');
 h.controller.speak('A custom answer');assert.equal(h.utterances.length,1);assert.equal(h.statuses.at(-1).gender,null);assert.equal(h.statuses.at(-1).voiceType,'system');assert.equal(h.statuses.at(-1).source,'Web Speech API');h.controller.destroy();
});
test('manual native voice overrides natural auto; switching cleans up only the active request',()=>{
 const h=fixture({voices:[native('A'),native('B','en-US')],recordedBanks:[naturalBank]});h.controller.setVoice('A');assert.equal(h.cancels,0);h.controller.enableFromGesture(text,TAP);assert.equal(h.utterances.length,1);h.controller.setVoice('B');assert.equal(h.cancels,1);h.controller.enableFromGesture(text,TAP);assert.equal(h.utterances[1].voice.voiceURI,'B');assert.equal(h.statuses.at(-1).voiceLang,'en-US');assert.equal(h.cancels,1);h.controller.destroy();
});
test('manual recorded voice gracefully routes arbitrary answers to matching native voice',()=>{
 const h=fixture({recordedBanks:[naturalBank]});h.controller.setVoice('recorded:test:female');h.controller.enableFromGesture('A custom answer',TAP);assert.equal(h.utterances.length,1);assert.equal(h.statuses.at(-1).fallbackReason,'recorded-text-unavailable');assert.equal(h.statuses.at(-1).voiceType,'system');assert.equal(h.statuses.at(-1).gender,null);h.controller.destroy();
});
test('backup button bypasses native but never invents a prerecorded custom answer',()=>{
 const h=fixture({recordedBanks:[naturalBank]});assert.equal(h.controller.playBackupFromGesture(TAP,text),true);assert.equal(h.utterances.length,0);assert.equal(h.playCalls.length,1);h.controller.stop();assert.equal(h.controller.playBackupFromGesture(TAP,'not in this bank'),false);assert.equal(h.statuses.at(-1).code,'voiceMissing');assert.equal(h.playCalls.length,1);h.controller.destroy();
});
test('Chinese cmn aliases match zh scripts and regions without guessing voice gender',()=>{
 assert.equal(normalizeVoiceLanguage('cmn_Hant_TW'),'zh-hant-tw');assert.equal(normalizeVoiceLanguage('zh-cmn-Hans-CN'),'zh-hans-cn');assert.ok(voiceMatchScore(native('cmn','cmn-TW'),'zh-TW')>voiceMatchScore(native('zhcn','zh-CN'),'zh-TW'));assert.equal(voiceMatchScore(native('x','yue-HK'),'zh-TW'),-1);
 const h=fixture({voices:[native('cmn','cmn-TW')]});h.controller.enableFromGesture('一句新話',TAP);assert.equal(h.utterances[0].voice.voiceURI,'cmn');assert.equal(h.statuses.at(-1).voiceLang,'cmn-TW');assert.equal(h.controller.getVoices()[0].gender,null);h.controller.destroy();
});
test('constructor voice callback runs after assignment; late voices do not interrupt playback',async()=>{
 let completed=false;const c=new SpeechController({synth:{getVoices:()=>[]},AudioClass:undefined,onVoices:()=>{assert.ok(c);completed=true;}});assert.equal(completed,false);await Promise.resolve();assert.equal(completed,true);c.destroy();
 const h=fixture({voices:[]});h.controller.enableFromGesture(text,TAP);h.audioInstances[0].onplaying();h.voices.push(native());h.listeners.voiceschanged();assert.equal(h.statuses.at(-1).code,'speaking');assert.equal(h.playCalls.length,1);h.controller.destroy();
});
test('media activation is one short silent WAV only, reused for real fallback and never looped',async()=>{
 const h=fixture({primeAudioOnGesture:true});h.controller.enableFromGesture(text,TAP);assert.equal(h.audioInstances.length,1);assert.equal(h.playCalls.length,1);assert.ok(h.playCalls[0].startsWith('data:audio/wav;base64,'));const bytes=Buffer.from(h.playCalls[0].split(',')[1],'base64');assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.length,364);assert.equal(h.audioInstances[0].loop,false);assert.equal(h.controller.hasStarted,false);
 h.utterances[0].onerror({error:'synthesis-unavailable'});assert.equal(h.audioInstances.length,1);assert.equal(h.playCalls.length,2);assert.ok(h.playCalls[1].endsWith('.mp3'));h.audioInstances[0].onplaying();assert.equal(h.controller.hasStarted,true);h.controller.stop();h.controller.setVoice('tw');h.controller.enableFromGesture('A second native phrase',TAP);assert.equal(h.playCalls.length,2);h.controller.destroy();
});
test('rate and voice metadata are explicit; untrusted gestures cannot start either engine',()=>{
 const h=fixture({recordedBanks:[naturalBank]});h.controller.setRate(1.2);h.controller.enableFromGesture(text,{isTrusted:false});assert.equal(h.playCalls.length,0);assert.equal(h.utterances.length,0);h.controller.enableFromGesture(text,TAP);assert.equal(h.audioInstances[0].playbackRate,1.2);h.controller.stop();h.controller.setVoice('tw');h.controller.enableFromGesture('Any answer',TAP);assert.equal(h.utterances[0].rate,1.2);h.controller.setRate(99);assert.equal(h.controller.rate,1.5);const meta=h.controller.getVoices().find(v=>v.voiceURI==='recorded:test:female');assert.equal(meta.type,'recorded');assert.equal(meta.source,naturalBank.source);assert.equal(meta.gender,'female');h.controller.destroy();
});
test('backup button interrupts a stalled native request even when the sentence is identical',()=>{
 const h=fixture();h.controller.enableFromGesture(text,TAP);assert.equal(h.statuses.at(-1).engine,'system');h.controller.playBackupFromGesture(TAP,text);assert.equal(h.cancels,1);assert.equal(h.playCalls.length,1);assert.equal(h.statuses.at(-1).engine,'recorded');h.controller.destroy();
});
test('end event without observed start is not claimed as successful speech',()=>{
 const h=fixture();h.controller.enableFromGesture(text,TAP);h.utterances[0].onend();assert.equal(h.statuses.at(-1).engine,'recorded');assert.equal(h.statuses.at(-1).code,'queued');assert.equal(h.controller.hasStarted,false);h.audioInstances[0].onended();assert.equal(h.statuses.at(-1).code,'error');assert.equal(h.controller.hasStarted,false);h.controller.destroy();
});
test('registered natural bank cannot suppress native TTS when media playback is unavailable',()=>{
 const h=fixture({recordedBanks:[naturalBank]});h.controller.AudioClass=undefined;h.controller.enableFromGesture(text,TAP);assert.equal(h.utterances.length,1);assert.equal(h.statuses.at(-1).voiceType,'system');h.controller.destroy();
});
test('setting the same automatic preference does not erase active recorded source metadata',()=>{
 const h=fixture({recordedBanks:[naturalBank]});h.controller.enableFromGesture(text,TAP);h.controller.setVoice('');h.audioInstances[0].onplaying();assert.equal(h.statuses.at(-1).voiceType,'recorded');assert.equal(h.statuses.at(-1).voiceSource,naturalBank.source);assert.equal(h.statuses.at(-1).engine,'recorded');h.controller.destroy();
});
test('unavailable replacement reply stops previous clip instead of showing contradictory status',()=>{
 const h=fixture({voices:[],recordedBanks:[naturalBank]});h.controller.enableFromGesture(text,TAP);h.audioInstances[0].onplaying();h.controller.speak('Unrecorded new answer');assert.equal(h.controller.active,null);assert.equal(h.audioInstances[0].paused,true);assert.equal(h.statuses.at(-1).code,'voiceLoading');assert.equal(h.statuses.at(-1).engine,'');assert.equal(h.statuses.at(-1).requestedText,'Unrecorded new answer');h.controller.destroy();
});
test('destroyed controllers cannot resume native or recorded playback',()=>{
 const h=fixture();h.controller.destroy();assert.equal(h.controller.enableFromGesture(text,TAP),false);assert.equal(h.controller.playBackupFromGesture(TAP,text),false);assert.equal(h.utterances.length,0);assert.equal(h.playCalls.length,0);
});
