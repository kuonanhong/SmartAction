import {recordedSpeech} from '../data/localization-v3-audio.js';
/** Device speech, activated synchronously by a real click/tap.
 * Sources: MDN SpeechSynthesis, getVoices, SpeechSynthesisErrorEvent.
 * No OS voice is bundled or guaranteed. onstart confirms API playback, not audible volume.
 */
const voiceTag = value => String(value || '').replace(/_/g, '-').toLowerCase();
function zhScript(tag) { return /hans|(?:^|-)(cn|sg)(?:-|$)/.test(tag) ? 'hans' : /hant|(?:^|-)(tw|hk|mo)(?:-|$)/.test(tag) ? 'hant' : ''; }
export function voiceMatchScore(voice, language) {
  const a=voiceTag(voice.lang), b=voiceTag(language);
  if(!a||!b||a.split('-')[0]!==b.split('-')[0]) return -1;
  let score=a===b?100:40;
  if(a.startsWith('zh')) { const as=zhScript(a), bs=zhScript(b); score+=as&&bs?(as===bs?35:-20):0; }
  if(voice.localService)score+=4;
  if(voice.default)score+=1;
  return score;
}
export function pickVoice(voices, language, preferredURI='') {
  const preferred=preferredURI&&voices.find(v=>v.voiceURI===preferredURI);
  if(preferred)return preferred;
  return voices.map(v=>({v,score:voiceMatchScore(v,language)})).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score)[0]?.v||null;
}
export class SpeechController {
  constructor({lang='zh-TW',enabled=true,onStatus=()=>{},onVoices=()=>{},synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,AudioClass=globalThis.Audio,startTimeout=7000}={}) {
    this.lang=lang;this.enabled=enabled;this.onStatus=onStatus;this.onVoices=onVoices;this.synth=synth;this.Utterance=Utterance;this.AudioClass=AudioClass;this.audio=null;this.audioText='';this.engine='';this.startTimeout=startTimeout;
    this.voices=[];this.selectedURI='';this.utterance=null;this.lastText='';this.hasStarted=false;this.gestureRequested=false;this.sequence=0;this.timer=null;
    this._voicesChanged=()=>{this.refreshVoices();if(!this.utterance)this.emit(this.enabled?'needsGesture':'off');};
    this._hidden=()=>{if(globalThis.document?.hidden){this.stop();this.hasStarted=false;this.gestureRequested=false;this.emit(this.enabled?'needsGesture':'off');}};
    this._pagehide=()=>this.stop();
    this.synth?.addEventListener?.('voiceschanged',this._voicesChanged);
    globalThis.document?.addEventListener('visibilitychange',this._hidden);
    globalThis.addEventListener?.('pagehide',this._pagehide);
    this.refreshVoices();this.emit((!this.synth||!this.Utterance)&&!this.AudioClass?'unsupported':enabled?'needsGesture':'off');
  }
  refreshVoices(){try{this.voices=Array.from(this.synth?.getVoices?.()||[]);}catch{this.voices=[];}this.onVoices(this.getVoices());return this.voices;}
  recordedVoice(){return {voiceURI:'recorded:'+this.lang,name:'eSpeak NG · 37',lang:this.lang.startsWith('zh')?'cmn':this.lang,localService:true,recorded:true};}
  getVoices(){return [...this.voices,...(this.AudioClass&&recordedSpeech[this.lang]?[this.recordedVoice()]:[])];}
  currentVoice(){return this.selectedURI.startsWith('recorded:')?this.recordedVoice():pickVoice(this.voices,this.lang,this.selectedURI);}
  emit(code,error=''){
    const v=this.engine==='recorded'?this.recordedVoice():this.currentVoice();this.status={code,enabled:this.enabled,hasStarted:this.hasStarted,lang:this.lang,voiceName:v?.name||'',voiceLang:v?.lang||'',localService:v?Boolean(v.localService):null,engine:this.engine,recordedAvailable:Boolean(recordedSpeech[this.lang]?.[this.lastText]),error};
    this.onStatus({...this.status});return this.status;
  }
  setLanguage(lang){if(lang!==this.lang){this.stop();this.lang=lang;this.selectedURI='';this.engine='';this.refreshVoices();this.emit(this.enabled?'needsGesture':'off');}return this;}
  setVoice(uri){this.stop();this.selectedURI=uri||'';this.engine='';this.emit(this.enabled?'needsGesture':'off');return this;}
  setEnabled(enabled){this.enabled=Boolean(enabled);if(!this.enabled)this.stop();this.emit(this.enabled?'needsGesture':'off');return this;}
  _activeGesture(event){if(event?.isTrusted===false)return false;const active=globalThis.navigator?.userActivation;return active?active.isActive:Boolean(event?.isTrusted||!globalThis.document);}
  unlockFromGesture(text='',event){return this.enableFromGesture(text,event);}
  enableFromGesture(text='',event){
    this.enabled=true;
    if(!this._activeGesture(event)){this.emit('needsGesture');return false;}
    this.gestureRequested=true;
    // speak is deliberately in the same synchronous event stack. Do not await voices or a model here.
    return this.speak(text||this.lastText,{gesture:true,event});
  }
  replayFromGesture(event){return this.enableFromGesture(this.lastText,event);}
  speak(text,{gesture=false,event,force=false,lang}={}){
    text=String(text||'').trim();if(!text)return false;this.lastText=text;
    if(!this.enabled&&!force){this.emit('off');return false;}
    if(gesture&&!this._activeGesture(event)){this.emit('needsGesture');return false;}
    if(!gesture&&!this.hasStarted){if(this.utterance?.text===text||this.audioText===text)return true;this.emit('needsGesture');return false;}
    if(lang&&lang!==this.lang)this.setLanguage(lang);
    this.refreshVoices();
    const clip=recordedSpeech[this.lang]?.[text],candidate=this.currentVoice();
    if(clip&&this.AudioClass&&(!candidate||candidate.recorded||!this.synth||!this.Utterance))return this.playRecorded(text,clip);
    if(candidate?.recorded){this.emit('voiceMissing');return false;}
    if(!this.synth||!this.Utterance){this.emit('unsupported');return false;}
    if(!this.voices.length){this.emit('voiceLoading');return false;}
    const selected=this.currentVoice();if(!selected){this.emit('voiceMissing');return false;}
    this.stop(false);this.engine='system';const generation=++this.sequence;
    const utterance=new this.Utterance(text);this.utterance=utterance; // retain for Safari/GC lifetime
    utterance.lang=selected.lang||this.lang;utterance.voice=selected;utterance.rate=.9;utterance.pitch=1;utterance.volume=1;
    utterance.onstart=()=>{if(generation!==this.sequence)return;clearTimeout(this.timer);this.timer=null;this.hasStarted=true;this.emit('speaking');};
    utterance.onend=()=>{if(generation!==this.sequence)return;clearTimeout(this.timer);this.timer=null;this.utterance=null;this.emit('ready');};
    utterance.onerror=e=>{if(generation!==this.sequence)return;clearTimeout(this.timer);this.timer=null;this.utterance=null;const error=String(e.error||'unknown');if(['not-allowed','audio-busy','audio-hardware'].includes(error))this.hasStarted=false;this.emit(error==='not-allowed'?'blocked':'error',error);};
    this.emit('queued');
    this.timer=setTimeout(()=>{if(generation!==this.sequence)return;this.stop(false);this.hasStarted=false;this.emit('blocked','start-timeout');},this.startTimeout);this.timer?.unref?.();
    try{if(this.synth.paused)this.synth.resume();this.synth.speak(utterance);return true;}catch(error){clearTimeout(this.timer);this.timer=null;this.utterance=null;this.hasStarted=false;this.emit('error',String(error?.message||error));return false;}
  }
  playRecorded(text,path){
    this.stop(false);this.engine='recorded';this.audioText=text;const generation=++this.sequence;
    if(!this.audio)this.audio=new this.AudioClass();
    const audio=this.audio;audio.preload='auto';audio.volume=1;audio.muted=false;
    audio.src=globalThis.document?new URL(path,globalThis.document.baseURI).href:path;
    audio.onplaying=()=>{if(generation!==this.sequence)return;clearTimeout(this.timer);this.timer=null;this.hasStarted=true;this.emit('speaking');};
    audio.onended=()=>{if(generation!==this.sequence)return;clearTimeout(this.timer);this.timer=null;this.audioText='';this.emit('ready');};
    const failed=error=>{if(generation!==this.sequence)return;this.stop(false);this.hasStarted=false;this.emit(error==='NotAllowedError'?'blocked':'error',error);};
    audio.onerror=()=>failed('audio-file-'+String(audio.error?.code||'unavailable'));
    this.emit('queued');
    this.timer=setTimeout(()=>{if(generation===this.sequence){this.stop(false);this.hasStarted=false;this.emit('blocked','audio-start-timeout');}},this.startTimeout);this.timer?.unref?.();
    // Calling play synchronously here is essential on mobile. Reuse this element for subsequent movements.
    try{const playing=audio.play();playing?.catch?.(error=>failed(String(error?.name||error)));return true;}catch(error){failed(String(error?.name||error));return false;}
  }
  stop(notify=true){++this.sequence;clearTimeout(this.timer);this.timer=null;try{this.synth?.cancel();}catch{}this.utterance=null;if(this.audio){this.audio.onplaying=null;this.audio.onended=null;this.audio.onerror=null;try{this.audio.pause();this.audio.currentTime=0;}catch{}}this.audioText='';if(notify)this.emit(this.enabled?(this.hasStarted?'ready':'needsGesture'):'off');}
  destroy(){this.stop(false);this.synth?.removeEventListener?.('voiceschanged',this._voicesChanged);globalThis.document?.removeEventListener('visibilitychange',this._hidden);globalThis.removeEventListener?.('pagehide',this._pagehide);}
}
