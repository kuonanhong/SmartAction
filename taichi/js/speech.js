import {recordedSpeech} from '../data/localization-v3-audio.js';
/** Speech controller v4. A queued request is never reported as audible playback.
 * Native voices are device capabilities, not downloadable/gender-identified models.
 * Recorded banks match exact fixed text. Arbitrary replies use actual native TTS.
 */
export const normalizeVoiceLanguage=value=>{
  const tag=String(value||'').replace(/_/g,'-').toLowerCase();
  return tag.replace(/^cmn(?=-|$)/,'zh').replace(/^zh-cmn(?=-|$)/,'zh');
};
function zhScript(tag){return /hans|(?:^|-)(cn|sg)(?:-|$)/.test(tag)?'hans':/hant|(?:^|-)(tw|hk|mo)(?:-|$)/.test(tag)?'hant':'';}
export function voiceMatchScore(voice,language){
  const a=normalizeVoiceLanguage(voice.lang),b=normalizeVoiceLanguage(language);
  if(!a||!b||a.split('-')[0]!==b.split('-')[0])return -1;
  let score=a===b?100:40;
  if(a.startsWith('zh')){const as=zhScript(a),bs=zhScript(b);score+=as&&bs?(as===bs?35:-20):0;}
  if(voice.localService)score+=4;if(voice.default)score+=1;return score;
}
export function pickVoice(voices,language,preferredURI=''){
  const preferred=preferredURI&&voices.find(v=>v.voiceURI===preferredURI);if(preferred)return preferred;
  return voices.map(v=>({v,score:voiceMatchScore(v,language)})).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score)[0]?.v||null;
}
const sameText=(a,b)=>String(a||'').trim()===String(b||'').trim();
function nativeMeta(v){return v?{voiceURI:v.voiceURI,name:v.name,voiceName:v.name,lang:v.lang,actualLang:v.lang,localService:Boolean(v.localService),default:Boolean(v.default),recorded:false,type:'system',source:'Web Speech API',gender:null}:null;}
function defaultBanks(){return Object.entries(recordedSpeech).map(([lang,clips])=>({id:lang,voiceURI:'recorded:'+lang,name:'eSpeak NG · 37',lang,actualLang:lang.startsWith('zh')?'cmn':lang,source:'eSpeak NG 1.51',gender:null,quality:'mechanical',priority:-100,clips}));}
// A single 20 ms silent PCM WAV can activate a reusable media element inside the
// explicit gesture. It never loops, fetches a file, or asserts future autoplay permission.
const SILENT_WAV='data:audio/wav;base64,UklGRmQBAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
export class SpeechController{
  constructor({lang='zh-TW',enabled=true,onStatus=()=>{},onVoices=()=>{},synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,AudioClass=globalThis.Audio,startTimeout=7000,recordedBanks=[],rate=.9,primeAudioOnGesture=true}={}){
    this.lang=lang;this.enabled=Boolean(enabled);this.onStatus=onStatus;this.onVoices=onVoices;this.synth=synth;this.Utterance=Utterance;this.AudioClass=AudioClass;this.startTimeout=startTimeout;this.rate=Math.max(.5,Math.min(1.5,Number(rate)||.9));this.primeAudioOnGesture=primeAudioOnGesture;
    this.voices=[];this.banks=[];this.selectedURI='';this.utterance=null;this.audio=null;this.audioText='';this.engine='';this.active=null;this.lastText='';this.hasStarted=false;this.gestureRequested=false;this.sequence=0;this.timer=null;this.retryRecording=null;this.nativeFailures=new Set();this._audioPrimeStarted=false;this._audioPrimeTried=false;this._destroyed=false;this._playbackMeta=null;this.fallbackReason='';
    for(const bank of [...defaultBanks(),...recordedBanks])this.addRecordedBank(bank,{notify:false});
    this._voicesChanged=()=>{this.refreshVoices();if(!this.active)this.emit(this.enabled?'needsGesture':'off');};
    this._hidden=()=>{if(globalThis.document?.hidden){this.stop();this.hasStarted=false;this.gestureRequested=false;this.emit(this.enabled?'needsGesture':'off');}};
    this._pagehide=()=>this.stop();
    this.synth?.addEventListener?.('voiceschanged',this._voicesChanged);globalThis.document?.addEventListener('visibilitychange',this._hidden);globalThis.addEventListener?.('pagehide',this._pagehide);
    this.refreshVoices({notify:false});this.emit((!this.synth||!this.Utterance)&&!this.AudioClass?'unsupported':this.enabled?'needsGesture':'off');
    // onVoices may legitimately reference the just-created controller in the app.
    queueMicrotask(()=>{if(!this._destroyed)this.onVoices(this.getVoices());});
  }
  addRecordedBank(bank,{notify=true}={}){
    if(!bank||!bank.id||!bank.lang||!bank.clips||typeof bank.clips!=='object')throw new TypeError('Recorded bank needs id, lang and exact-text clips');
    const item={priority:0,quality:'recorded',gender:null,...bank,id:String(bank.id),voiceURI:bank.voiceURI||'recorded:'+bank.id};
    item.gender=['male','female','neutral'].includes(item.gender)?item.gender:null;
    this.banks=this.banks.filter(b=>b.voiceURI!==item.voiceURI);this.banks.push(item);if(notify)this.onVoices(this.getVoices());return this;
  }
  addRecordedBanks(banks){for(const bank of banks)this.addRecordedBank(bank,{notify:false});this.onVoices(this.getVoices());return this;}
  _bankMeta(b){return b?{voiceURI:b.voiceURI,name:b.name||b.id,voiceName:b.name||b.id,lang:b.actualLang||b.lang,actualLang:b.actualLang||b.lang,locale:b.lang,localService:true,recorded:true,type:'recorded',source:b.source||b.name||b.id,gender:b.gender,quality:b.quality,bankId:b.id}:null;}
  _bank(uri){return this.banks.find(b=>b.voiceURI===uri)||null;}
  _matchingBanks(){return this.banks.filter(b=>voiceMatchScore({lang:b.lang},this.lang)>=0).sort((a,b)=>(b.priority-a.priority)||voiceMatchScore({lang:b.lang},this.lang)-voiceMatchScore({lang:a.lang},this.lang));}
  _clip(bank,text){const value=bank?.clips?.[String(text).trim()];return typeof value==='string'?value:(value?.path||value?.url||null);}
  _backup(text,preferredURI=''){const explicit=this._bank(preferredURI);if(this._clip(explicit,text))return explicit;return this._matchingBanks().find(b=>this._clip(b,text))||null;}
  refreshVoices({notify=true}={}){try{this.voices=Array.from(this.synth?.getVoices?.()||[]);}catch{this.voices=[];}if(notify)this.onVoices(this.getVoices());return this.voices;}
  getVoices(){return [...this.voices.map(nativeMeta),...(this.AudioClass?this._matchingBanks().map(b=>this._bankMeta(b)):[])];}
  recordedVoice(){return this._bankMeta(this._bank('recorded:'+this.lang)||this._matchingBanks()[0]);}
  currentVoice(){return this._bankMeta(this._bank(this.selectedURI))||nativeMeta(pickVoice(this.voices,this.lang,this.selectedURI));}
  emit(code,error=''){
    const v=this._playbackMeta||this.currentVoice();this.status={code,enabled:this.enabled,hasStarted:this.hasStarted,lang:this.lang,voiceName:v?.name||'',voiceLang:v?.actualLang||v?.lang||'',localService:v?Boolean(v.localService):null,engine:this.engine,voiceType:v?.type||'',type:v?.type||'',voiceSource:v?.source||'',source:v?.source||'',gender:v?.gender||null,voiceURI:v?.voiceURI||'',selectedURI:this.selectedURI,requestedText:this.lastText,recordedAvailable:Boolean(this._backup(this.lastText)),fallbackReason:this.fallbackReason,needsGesture:['needsGesture','blocked'].includes(code),error};
    this.onStatus({...this.status});return this.status;
  }
  setLanguage(lang){if(lang!==this.lang){this.stop(false);this.lang=lang;this.selectedURI='';this._playbackMeta=null;this.engine='';this.retryRecording=null;this.refreshVoices();this.emit(this.enabled?'needsGesture':'off');}return this;}
  setVoice(uri){uri=uri||'';if(uri===this.selectedURI&&this.active)return this;if(uri!==this.selectedURI)this.stop(false);this.selectedURI=uri;this.nativeFailures.delete(uri);this.retryRecording=null;this._playbackMeta=null;this.engine='';this.fallbackReason='';if(!this.active)this.emit(this.enabled?'needsGesture':'off');return this;}
  setRate(rate){const n=Number(rate);if(Number.isFinite(n))this.rate=Math.max(.5,Math.min(1.5,n));if(this.audio&&!this.audio.paused)this.audio.playbackRate=this.rate;return this;}
  setEnabled(enabled){this.enabled=Boolean(enabled);if(!this.enabled)this.stop(false);if(!this.active)this.emit(this.enabled?'needsGesture':'off');return this;}
  _activeGesture(event){if(event?.isTrusted===false)return false;const active=globalThis.navigator?.userActivation;return active?active.isActive:Boolean(event?.isTrusted||!globalThis.document);}
  unlockFromGesture(text='',event){return this.enableFromGesture(text,event);}
  enableFromGesture(text='',event){this.enabled=true;if(!this._activeGesture(event)){this.emit('needsGesture');return false;}this.gestureRequested=true;return this.speak(text||this.lastText,{gesture:true,event});}
  replayFromGesture(event){this.enabled=true;return this.speak(this.lastText,{gesture:true,event,force:true,restart:true});}
  playBackupFromGesture(event,text=this.lastText){this.enabled=true;return this.speak(text,{gesture:true,event,preferRecorded:true,restart:true});}
  _select(text,preferRecorded=false){
    const explicitBank=this._bank(this.selectedURI),backup=this._backup(text),native=pickVoice(this.voices,this.lang,explicitBank?'':this.selectedURI);
    if(!this.AudioClass)return preferRecorded?{}:(native?{native,reason:explicitBank?'recorded-playback-unavailable':''}:{});
    if(preferRecorded)return backup?{bank:backup}:{};
    if(this.retryRecording?.lang===this.lang&&sameText(this.retryRecording.text,text)){const b=this._bank(this.retryRecording.uri);if(this._clip(b,text))return {bank:b,reason:'retry-recording'};}
    if(explicitBank){if(this._clip(explicitBank,text))return {bank:explicitBank};return native?{native,reason:'recorded-text-unavailable'}:{};}
    if(!this.selectedURI){const natural=this._matchingBanks().find(b=>b.quality!=='mechanical'&&this._clip(b,text));if(natural)return {bank:natural};}
    if(native&&this.synth&&this.Utterance){if(this.nativeFailures.has(native.voiceURI)&&backup)return {bank:backup,reason:'previous-native-failure'};return {native};}
    return backup?{bank:backup,reason:'native-unavailable'}:{};
  }
  speak(text,{gesture=false,event,force=false,lang,preferRecorded=false,restart=false}={}){
    if(this._destroyed)return false;text=String(text||'').trim();if(!text)return false;if(lang&&lang!==this.lang)this.setLanguage(lang);this.lastText=text;
    if(!this.enabled&&!force){this.emit('off');return false;}
    if(gesture&&!this._activeGesture(event)){this.emit('needsGesture');return false;}
    if(this.active&&sameText(this.active.text,text)&&this.active.lang===this.lang&&!preferRecorded&&(!restart||this.active.phase==='queued'))return true;
    if(!gesture&&!this.hasStarted){this.emit('needsGesture');return false;}
    this.refreshVoices();const selected=this._select(text,preferRecorded);this.fallbackReason=selected.reason||'';
    if(selected.bank&&this.AudioClass)return this._playRecorded(text,selected.bank);
    if(selected.native&&this.synth&&this.Utterance){if(gesture)this._primeAudio();return this._speakNative(text,selected.native);}
    this._cancelActive();this.engine='';this._playbackMeta=null;
    if(preferRecorded||this._bank(this.selectedURI)){this.emit('voiceMissing','recorded-text-unavailable');return false;}
    if(!this.synth||!this.Utterance){this.emit('unsupported');return false;}
    this.emit(this.voices.length?'voiceMissing':'voiceLoading');return false;
  }
  _primeAudio(){
    if(!this.primeAudioOnGesture||!this.AudioClass||this._audioPrimeTried||this.active?.kind==='recorded')return;
    this._audioPrimeTried=true;if(!this.audio)this.audio=new this.AudioClass();const audio=this.audio;
    audio.preload='auto';audio.volume=1;audio.muted=false;audio.loop=false;audio.src=SILENT_WAV;
    audio.onplaying=()=>{if(!this.active||this.active.kind==='system')this._audioPrimeStarted=true;};
    audio.onended=()=>{};audio.onerror=()=>{};
    try{audio.play()?.catch?.(()=>{});}catch{} // No permission claim: the later real clip must confirm its own playback.
  }
  _speakNative(text,voice){
    this._cancelActive();const id=++this.sequence;this.engine='system';this._playbackMeta=nativeMeta(voice);
    this.active={id,text,lang:this.lang,phase:'queued',kind:'system',voice};const u=new this.Utterance(text);this.utterance=u;
    u.lang=voice.lang||this.lang;u.voice=voice;u.rate=this.rate;u.pitch=1;u.volume=1;
    u.onstart=()=>{if(this.active?.id!==id)return;this._clearTimer();this.active.phase='speaking';this.hasStarted=true;this.retryRecording=null;this.emit('speaking');};
    u.onend=()=>{if(this.active?.id!==id)return;if(this.active.phase!=='speaking'){this._nativeFailed(id,'ended-without-start');return;}this._clearTimer();this.active=null;this.utterance=null;this.emit('ready');};
    u.onerror=e=>{if(this.active?.id===id)this._nativeFailed(id,String(e.error||'unknown'));};
    this.emit('queued');this._watchdog(id,()=>this._nativeFailed(id,'start-timeout'));
    try{if(this.synth.paused)this.synth.resume();this.synth.speak(u);return true;}catch(e){this._nativeFailed(id,String(e?.name||e?.message||e));return false;}
  }
  _nativeFailed(id,error){
    const request=this.active;if(!request||request.id!==id)return;
    this.nativeFailures.add(request.voice.voiceURI);this.fallbackReason=error;
    const backup=this._backup(request.text);this._cancelActive();this.hasStarted=false;
    if(backup&&this.AudioClass){this.retryRecording={text:request.text,lang:request.lang,uri:backup.voiceURI};this._playRecorded(request.text,backup);return;}
    this.emit(['not-allowed','start-timeout','audio-busy','audio-hardware'].includes(error)?'blocked':'error',error);
  }
  _watchdog(id,callback){this._clearTimer();this.timer=setTimeout(()=>{if(this.active?.id===id)callback();},this.startTimeout);this.timer?.unref?.();}
  _clearTimer(){clearTimeout(this.timer);this.timer=null;}
  _playRecorded(text,bank){
    if(this._destroyed)return false;const path=this._clip(bank,text);if(!path||!this.AudioClass){this.emit('voiceMissing');return false;}
    this._cancelActive();const id=++this.sequence;this.engine='recorded';this._playbackMeta=this._bankMeta(bank);this.audioText=text;
    this.active={id,text,lang:this.lang,phase:'queued',kind:'recorded',bank};if(!this.audio)this.audio=new this.AudioClass();const audio=this.audio;
    // Clear one-shot priming listeners before assigning a real source.
    audio.onplaying=null;audio.onended=null;audio.onerror=null;
    audio.preload='auto';audio.volume=1;audio.muted=false;audio.loop=false;audio.playbackRate=this.rate;
    audio.src=globalThis.document?new URL(path,globalThis.document.baseURI).href:path;
    audio.onplaying=()=>{if(this.active?.id!==id)return;this._clearTimer();this.active.phase='speaking';this.hasStarted=true;this.retryRecording=null;this.emit('speaking');};
    audio.onended=()=>{if(this.active?.id!==id)return;if(this.active.phase!=='speaking'){failed('audio-ended-without-playing');return;}this._clearTimer();this.active=null;this.audioText='';this.emit('ready');};
    const failed=error=>{if(this.active?.id!==id)return;this.retryRecording={text,lang:this.lang,uri:bank.voiceURI};this._cancelActive();this.hasStarted=false;this.emit(['NotAllowedError','audio-start-timeout'].includes(error)?'blocked':'error',error);};
    audio.onerror=()=>failed('audio-file-'+String(audio.error?.code||'unavailable'));
    this.emit('queued');this._watchdog(id,()=>failed('audio-start-timeout'));
    try{audio.play()?.catch?.(e=>failed(String(e?.name||e)));return true;}catch(e){failed(String(e?.name||e));return false;}
  }
  // Backward-compatible helper. New callers should register a bank, not guess paths.
  playRecorded(text,path){const bank=this._matchingBanks().find(b=>this._clip(b,text)===path);return bank?this._playRecorded(text,bank):false;}
  _cancelActive(){
    const old=this.active,utterance=this.utterance;this.active=null;this.utterance=null;this.audioText='';++this.sequence;this._clearTimer();
    // Crucial: cancel only this controller's active native request, never an idle engine.
    if(utterance){try{this.synth?.cancel();}catch{}}
    if(old?.kind==='recorded'&&this.audio){this.audio.onplaying=null;this.audio.onended=null;this.audio.onerror=null;try{this.audio.pause();this.audio.currentTime=0;}catch{}}
  }
  stop(notify=true){this._cancelActive();if(this.audio&&!this.active){this.audio.onplaying=null;this.audio.onended=null;this.audio.onerror=null;try{if(!this.audio.paused)this.audio.pause();}catch{}}if(notify)this.emit(this.enabled?(this.hasStarted?'ready':'needsGesture'):'off');}
  destroy(){this._destroyed=true;this.stop(false);this.synth?.removeEventListener?.('voiceschanged',this._voicesChanged);globalThis.document?.removeEventListener('visibilitychange',this._hidden);globalThis.removeEventListener?.('pagehide',this._pagehide);}
}
