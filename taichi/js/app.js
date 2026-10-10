import {TrainingScene} from './scene.js';
import {curricula,defaultCurriculumId} from '../data/curricula.js';
import {locations} from '../data/locations.js';
import {getPosition,findNearby,mapsEmbedUrl,mapsLink} from './locations.js';
import {Coach} from './coach.js';
import {supportedLanguages,detectLanguage,t,applyLanguage} from './i18n.js';
import {TrainingSession,LEVELS,neutralPose,copyPose,interpolatePose,applyAction,biggestCorrection,scorePose} from './training.js';
import {CombatRound} from './combat.js';
import {getMessage} from './messages.js';
import {offlinePhotos} from './offline-photos.js';
import {BodyTracker} from './body-tracker.js';

const $=id=>document.getElementById(id);
const shortLang=lang=>lang.startsWith('zh')?'zh':lang.split('-')[0];
let language=detectLanguage();
try{const saved=localStorage.getItem('smartaction-language');if(supportedLanguages.includes(saved))language=saved;}catch{}
const msg=(key,vars={})=>getMessage(language,key,vars);
function local(value) {
  if(typeof value==='string')return value;
  return value?.[language]??value?.[shortLang(language)]??value?.en??value?.zh??'';
}
function status(text){if($('statusText'))$('statusText').textContent=text;}
function options(element,items,current) {
  element.replaceChildren(...items.map(({value,label})=>{const o=document.createElement('option');o.value=value;o.textContent=label;return o;}));
  element.value=current;
}
let course=curricula.find(c=>c.id===defaultCurriculumId)||curricula[0];
let level='basic',mode='follow',selectedLeg='left',selectedHand='right',player=neutralPose(),assistTime=0;
let session,combat,scene,currentPlace=locations[0],voice=true,modelBusy=false,chatBusy=false;
let focused=false,hasAutoFocused=false;
let tracker=null,bodyActive=false,bodyMetrics=null,bodyLastFrame=0,recognition=null,lastReply='';
let lastFrame=0,lastUi=0,lastRender=0,sparMoveTime=0,settings={time:'morning',weather:'clear',season:'spring',climate:'tropical'};
const held=new Set(),pointerHeld=new Map();
let lastModelStatus={code:'local'},availablePlaces=[...locations];
const completed={};
try{Object.assign(completed,JSON.parse(localStorage.getItem('smartaction-progress')||'{}'));}catch{}

function speak(text) {
  if(!voice||!('speechSynthesis'in window)||typeof SpeechSynthesisUtterance==='undefined')return;
  speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=language;utterance.rate=.88;
  const voices=speechSynthesis.getVoices(),matching=voices.find(v=>v.lang.toLowerCase()===language.toLowerCase())||voices.find(v=>v.lang.startsWith(language.split('-')[0]));
  if(matching)utterance.voice=matching;speechSynthesis.speak(utterance);
}
function makeSession(){
  session=new TrainingSession(course.moves,{level,mode,requireInput:true,onEvent:event=>{
    if(event.type==='demo'){bodyMetrics=null;tracker?.setTarget(event.move.pose);showMove();speak(local(event.move.name));status(msg('demo'));}
    if(event.type==='wait')status(msg('wait'));
    if(event.type==='success'){
      status(msg('success'));const key=`${course.id}:${session.index}:${level}`;
      completed[key]=Math.max(completed[key]||0,event.result.score);try{localStorage.setItem('smartaction-progress',JSON.stringify(completed));}catch{}
      showMove();
    }
    if(event.type==='complete'){
      const results=event.results,average=Math.round(results.reduce((sum,r)=>sum+r.score,0)/results.length);
      $('achievement').hidden=false;$('achievement').textContent=msg('progress',{n:results.length,score:average,a:results.filter(r=>r.assisted).length});status(msg('complete'));speak(msg('complete'));
    }
  }});
  combat=new CombatRound({level,onEvent:e=>{
    if(e.type==='strike')status(msg('strike',{n:e.damage}));
    if(e.type==='hit')status(msg('hit',{n:e.damage}));
    if(e.type==='block')status(msg('blocked',{n:e.damage}));
    if(e.type==='finish'){status(msg(e.won?'won':'lost'));$('achievement').hidden=false;$('achievement').textContent=msg(e.won?'won':'lost');speak(msg(e.won?'won':'lost'));}
  }});
  player=neutralPose();assistTime=0;sparMoveTime=0;bodyMetrics=null;tracker?.setTarget(session.target);
  $('achievement').textContent='';$('achievement').hidden=true;showMove();scene?.setMode(mode);scene?.setEquipment?.(course.id==='taijisword'?'sword':'none');showCombat();
}
function showMove(){
  const move=session.move;$('moveName').textContent=local(move.name);$('moveCount').textContent=`${session.index+1} / ${course.moves.length}`;
  $('cues').replaceChildren(...(local(move.cues)||[]).map(c=>{const li=document.createElement('li');li.textContent=c;return li;}));
  $('benefits').textContent=local(move.benefits);if($('courseNote'))$('courseNote').textContent=local(course.sourceNote);
  for(const id of ['movementList','progressStrip']){
    const container=$(id);if(!container)continue;
    container.replaceChildren(...course.moves.map((m,i)=>{
      const b=document.createElement('button');b.type='button';b.textContent=id==='progressStrip'?'':`${String(i+1).padStart(2,'0')} · ${local(m.name)}`;b.setAttribute('aria-label',`${i+1} · ${local(m.name)}`);
      b.title=local(m.name);b.className=i===session.index?'current':'';
      if(completed[`${course.id}:${i}:${level}`])b.classList.add('done');
      b.setAttribute('aria-current',i===session.index?'step':'false');
      b.addEventListener('click',()=>{session.index=i;session.previous=i?copyPose(course.moves[i-1].pose):neutralPose();session.beginDemo();session.paused=false;sparMoveTime=0;});return b;
    }));
  }
}
function updateLimbLabels(){
  $('leftLimbBtn').textContent=msg('switchLeg',{side:msg(selectedLeg==='left'?'leftLeg':'rightLeg')});
  $('rightLimbBtn').textContent=msg('switchHand',{side:msg(selectedHand==='left'?'leftHand':'rightHand')});
  $('leftLimbBtn').dataset.side=selectedLeg;$('rightLimbBtn').dataset.side=selectedHand;
}
function correctionText(){
  const c=biggestCorrection(player,session.target);if(c.size<.035)return msg('matched');
  if(c.type==='waist')return msg(c.delta<0?'waistLeft':'waistRight');
  if(c.type==='crouch')return msg(c.delta>0?'crouchMore':'riseMore');
  if(c.type==='stretch')return msg(c.delta>0?'stretchMore':'relaxMore');
  const side=msg(c.type==='hands'?(c.side==='left'?'leftHand':'rightHand'):(c.side==='left'?'leftLeg':'rightLeg'));
  const direction=msg(c.axis===0?(c.delta<0?'axisLeft':'axisRight'):c.axis===1?(c.delta<0?'axisDown':'axisUp'):(c.delta<0?'axisBack':'axisForward'));
  return msg('correction',{side,direction});
}
function showCombat(){
  const el=$('combatPanel');if(el)el.hidden=mode!=='spar';
  $('sparStrikeBtn')?.replaceChildren(document.createTextNode(msg('attack')));$('sparBlockBtn')?.replaceChildren(document.createTextNode(msg('block')));
}
function updateUi(score){
  $('followScore').textContent=Math.round(score.total);
  for(const [id,key]of[['handsScore','hands'],['feetScore','feet'],['bodyScore','body']]){
    const el=$(id);if(el.tagName==='PROGRESS')el.value=score[key];else{el.textContent=`${Math.round(score[key])}%`;el.style.setProperty('--score',`${score[key]}%`);}
  }
  $('phaseLabel').textContent=mode==='spar'?(combat.finished?msg(combat.opponentHealth===0?'won':'lost'):msg('sparReady')):msg(session.paused?'paused':session.phase);
  const active=session.phase!=='idle'&&session.phase!=='complete';
  $('startBtn').textContent=mode==='spar'?(combat.active?msg('pause'):msg('start')):(active?(session.paused?msg('resume'):msg('pause')):msg('start'));
  const hold=LEVELS[level].hold-session.hold;
  $('practiceHint').textContent=mode==='spar'?msg('sparReady'):(session.phase==='wait'&&!session.hasInput?msg('readyInput'):(session.phase==='wait'&&score.total>=LEVELS[level].threshold?msg('hold',{n:Math.max(0,hold).toFixed(1)}):correctionText()));
  $('poseValues').textContent=`${msg(selectedLeg==='left'?'leftLeg':'rightLeg')}: ${player.feet[selectedLeg].map(n=>n.toFixed(2)).join(' / ')} · ${msg(selectedHand==='left'?'leftHand':'rightHand')}: ${player.hands[selectedHand].map(n=>n.toFixed(2)).join(' / ')} · ↻ ${(player.waist*180/Math.PI).toFixed(0)}°`;
  for(const [id,value]of[['playerHealth',combat.playerHealth],['opponentHealth',combat.opponentHealth]]){
    const el=$(id);if(el){if(el.tagName==='PROGRESS')el.value=value;else el.textContent=String(value);}
  }
}
function changeLanguage(lang){
  language=lang;document.documentElement.lang=lang;applyLanguage(lang);
  try{localStorage.setItem('smartaction-language',lang);}catch{}
  options($('course'),curricula.map(c=>({value:c.id,label:local(c.name)})),course.id);
  $('language').value=lang;showMove();updateLimbLabels();renderPlaces();updateModelStatus(lastModelStatus);showCombat();
  $('voiceBtn').textContent=msg(voice?'voiceOn':'voiceOff');$('voiceBtn').setAttribute('aria-pressed',String(voice));status(msg('welcome'));
  $('focusBtn').textContent=msg(focused?'exitFocus':'focus');
  $('coachCancelBtn').textContent=msg('cancelModel');
  $('localModeBanner').hidden=location.protocol!=='file:';
  renderBodyStatus();
  if(scene)scene.compatibilityLabel=msg('fallback');
  if(!$('mapPanel')?.hidden)openMap();
}
function placeName(place){return local(place.name);}
function choosePlace(place){
  currentPlace=place;$('locationName').textContent=placeName(place);
  scene?.setLocation(location.protocol==='file:'&&offlinePhotos[place.id]?{...place,photo:offlinePhotos[place.id]}:place);if($('scenePhoto'))$('scenePhoto').hidden=!place.photo;
  if(place.photo){if($('scenePhoto'))$('scenePhoto').src=place.photo;}
  else status(msg('noPhoto'));
  const credit=place.photoCredit,container=$('photoCredit');container.replaceChildren();
  if(credit){const a=document.createElement('a');a.href=credit.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=`${credit.author} · ${credit.license}`;container.append(a);}
  if(place.photoNote){const note=document.createElement('span');note.textContent=` · ${local(place.photoNote)}`;container.append(note);}
  renderPlaces();if(!$('mapPanel')?.hidden)openMap();
}
function renderPlaces(){
  const container=$('locationPicker');container.replaceChildren(...availablePlaces.map(place=>{
    const button=document.createElement('button');button.type='button';button.className='location-card'+(place.id===currentPlace.id?' selected':'');
    if(place.photo){const img=document.createElement('img');img.src=place.photo;img.alt=placeName(place);img.loading='lazy';img.addEventListener('error',()=>{img.hidden=true;});button.append(img);}
    const span=document.createElement('span');span.textContent=placeName(place)+(Number.isFinite(place.distanceKm)?` · ${place.distanceKm.toFixed(1)} km`:'');button.append(span);
    button.addEventListener('click',()=>choosePlace(place));return button;
  }));
}
function openMap(){
  const panel=$('mapPanel');panel.hidden=false;
  if(panel.tagName==='DIALOG'&&!panel.open)panel.showModal();
  const content=$('mapContent')||panel;
  let iframe=panel.querySelector('iframe');if(!iframe){iframe=document.createElement('iframe');iframe.title='Google Maps';iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';content.append(iframe);}
  iframe.src=mapsEmbedUrl(currentPlace,language);
  let link=panel.querySelector('.google-map-link');if(!link){link=document.createElement('a');link.className='google-map-link';link.target='_blank';link.rel='noopener noreferrer';content.append(link);}
  link.href=mapsLink(currentPlace,language);link.textContent='Google Maps ↗';
}
async function nearby(){
  const button=$('locationBtn');button.disabled=true;status(msg('locating'));
  try{
    const position=await getPosition(),found=await findNearby(position,language);
    const places=Array.isArray(found)?found:found.locations||found.places||[];
    availablePlaces=[...places,...locations.filter(p=>!places.some(f=>f.id===p.id))];renderPlaces();
    let link=$('nearbyDojoLink');if(!link){link=document.createElement('a');link.id='nearbyDojoLink';link.target='_blank';link.rel='noopener noreferrer';$('locationPicker').parentElement.append(link);}
    link.href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`martial arts dojo near ${position.lat},${position.lng}`)}`;link.textContent=msg('nearbyDojo');
    status(msg(places.some(p=>p.isLiveNearby)?'nearby':'nearbyFallback'));
  }catch(error){status(msg('gpsFail',{error:error.message||String(error)}));}finally{button.disabled=false;}
}
function updateModelStatus(s){
  lastModelStatus=s;let text=msg('modelLocal');
  if(s.code==='ready')text=msg('modelReady');else if(s.code==='loading')text=msg('modelLoading');
  else if(s.code==='downloading')text=msg('modelDownload',{n:Math.round((s.progress||0)*100)});
  else if(s.code==='error')text=msg('modelError',{error:s.message||''});
  $('modelStatus').textContent=text;$('modelBadge').textContent=s.code==='ready'?'CPU · Qwen3':'GUIDE';
  if($('modelProgress')){const p=$('modelProgress');p.hidden=!['loading','downloading'].includes(s.code);p.value=s.progress||0;p.max=1;}
}
const coach=new Coach({onStatus:updateModelStatus,onToken:text=>{$('coachAnswer').textContent=text;}});
async function modelOperation(fn){
  if(modelBusy||chatBusy){status(msg('modelWait'));return;}
  modelBusy=true;$('modelBtn').disabled=true;$('modelDownloadBtn').disabled=true;$('coachCancelBtn').hidden=false;
  try{await fn();}catch(error){updateModelStatus({code:'error',message:error.message||String(error)});}
  finally{modelBusy=false;$('modelBtn').disabled=false;$('modelDownloadBtn').disabled=false;$('coachCancelBtn').hidden=true;}
}
async function askCoach(event){
  event.preventDefault();const question=$('coachInput').value.trim();if(!question||chatBusy||modelBusy)return;
  chatBusy=true;$('coachSend').disabled=true;$('coachCancelBtn').hidden=false;$('coachAnswer').textContent=msg('modelGenerating');
  try{
    const reply=await coach.ask({question,lang:language,course,move:session.move,score:Math.round(scorePose(player,session.target,level).total),weather:settings,body:bodyActive&&bodyMetrics?.valid&&performance.now()-bodyLastFrame<2000?bodyMetrics:null});
    $('coachAnswer').textContent=`${msg(reply.source==='model'?'modelSource':'guideSource')}\n\n${reply.text}`;lastReply=reply.text;if($('coachAutoSpeak').checked)speak(reply.text);
  }catch(error){$('coachAnswer').textContent=msg('modelError',{error:error.message||String(error)});}
  finally{chatBusy=false;$('coachSend').disabled=false;$('coachCancelBtn').hidden=true;}
}
let bodyState={code:'stopped'};
function renderBodyStatus(){
  const code=bodyState.code;
  const key=({permission:'cameraPending',loading:'cameraLoading',ready:'cameraReady',stopped:'cameraPrivacy',error:'cameraError'})[code]||'cameraPrivacy';
  $('bodyStatus').textContent=t(key,language)+(code==='error'&&bodyState.message?' · '+bodyState.message:'');
  $('bodyCameraBtn').textContent=t(bodyActive||tracker?.starting?'stopCamera':'enableCamera',language);
  if(bodyMetrics)renderBodyMetrics(bodyMetrics);
}
function renderBodyMetrics(metrics){
  $('bodyScoreValue').textContent=metrics.valid?`${Math.round(metrics.total)}%`:'—';
  if(!metrics.valid){
    const key=({'no-person':'poseMissing','low-confidence':'cameraInvalid','full-body':'cameraGuide','too-small':'cameraGuide','face-camera':'cameraGuide','no-target':'cameraPending','target-turn':'poseLimit'})[metrics.reason]||'cameraInvalid';
    $('bodyAdvice').textContent=t(key,language);return;
  }
  const change=metrics.corrections?.[0];
  if(change){
    const part={leftFoot:'leftLeg',rightFoot:'rightLeg',leftHand:'leftHand',rightHand:'rightHand'}[change.part]||'leftHand';
    const axis={up:'axisUp',down:'axisDown',left:'axisLeft',right:'axisRight'}[change.direction]||'axisUp';
    $('bodyAdvice').textContent=msg('correction',{side:msg(part),direction:msg(axis)});
  }else $('bodyAdvice').textContent=msg('matched');
}
function drawBody(landmarks){
  const video=$('bodyVideo'),canvas=$('bodyOverlay'),ctx=canvas.getContext('2d');if(!ctx)return;
  const w=video.videoWidth||640,h=video.videoHeight||480;
  if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
  ctx.clearRect(0,0,w,h);ctx.strokeStyle='#daffd5';ctx.fillStyle='#fce5a6';ctx.lineWidth=3;
  const valid=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??1)>.5;
  for(const [a,b]of[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]]){
    const p=landmarks[a],q=landmarks[b];if(!valid(p)||!valid(q))continue;
    ctx.beginPath();ctx.moveTo(p.x*w,p.y*h);ctx.lineTo(q.x*w,q.y*h);ctx.stroke();
  }
  for(const i of[11,12,13,14,15,16,23,24,25,26,27,28]){const p=landmarks[i];if(!valid(p))continue;ctx.beginPath();ctx.arc(p.x*w,p.y*h,5,0,Math.PI*2);ctx.fill();}
}
function stopBody(){
  tracker?.stop();bodyActive=false;bodyMetrics=null;$('bodyView').hidden=true;
  bodyState={code:'stopped'};renderBodyStatus();
}
async function toggleBody(){
  if(bodyActive||tracker?.starting){stopBody();return;}
  if(location.protocol==='file:'||!globalThis.isSecureContext){bodyState={code:'error',message:t('cameraNeedsServer',language)};renderBodyStatus();return;}
  if(!tracker)tracker=new BodyTracker({onStatus:s=>{
    bodyState=s;if(s.code==='ready')bodyActive=true;
    if(['error','stopped'].includes(s.code)){bodyActive=false;bodyMetrics=null;$('bodyView').hidden=true;}
    renderBodyStatus();
  },onFrame:frame=>{bodyMetrics=frame.metrics;bodyLastFrame=performance.now();drawBody(frame.landmarks);renderBodyMetrics(bodyMetrics);}});
  tracker.setTarget(session.target);$('bodyView').hidden=false;
  try{await tracker.start($('bodyVideo'));}
  catch(error){bodyState={code:'error',message:String(error.message||error)};renderBodyStatus();}
}
$('bodyCameraBtn').addEventListener('click',toggleBody);$('bodyStopBtn').addEventListener('click',stopBody);
$('readAnswerBtn').addEventListener('click',()=>{voice=true;speak(lastReply||$('coachAnswer').textContent);});
$('stopSpeechBtn').addEventListener('click',()=>window.speechSynthesis?.cancel());
$('voiceInputBtn').addEventListener('click',()=>{
  if(recognition){recognition.stop();return;}
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){status(t('voiceInputUnavailable',language));return;}
  recognition=new Recognition();recognition.lang=language;recognition.continuous=false;recognition.interimResults=false;
  recognition.onresult=e=>{const words=e.results?.[0]?.[0]?.transcript;if(words){$('coachInput').value=words;$('coachInput').focus();}};
  recognition.onerror=e=>status(t('voiceInputError',language)+' · '+String(e.error||''));
  recognition.onend=()=>{recognition=null;$('voiceInputBtn').textContent=t('voiceInput',language);};
  $('voiceInputBtn').textContent=t('voiceInputStop',language);
  try{recognition.start();}catch(error){recognition=null;$('voiceInputBtn').textContent=t('voiceInput',language);status(t('voiceInputError',language));}
});
window.addEventListener('pagehide',()=>{stopBody();recognition?.abort();coach.abort();});
function assistance(){
  if(level==='master'){status(msg('masterAssist'));return;}
  if(session.phase==='idle')session.start();session.paused=false;assistTime=2.6;session.assisted=true;session.markInput();status(msg('assist'));
}
function startPause(){
  if(!bodyActive&&!hasAutoFocused&&matchMedia('(max-width:860px)').matches){hasAutoFocused=true;setFocus(true);}
  if(mode==='spar'){
    if(combat.finished){combat.reset();session.restart();}combat.active=!combat.active;
    if(session.phase==='idle')session.start();session.paused=!combat.active;status(msg('sparReady'));
  }else{
    if(session.phase==='idle'||session.phase==='complete')session.start();else session.paused=!session.paused;
    status(msg(session.paused?'paused':session.phase));
  }
}
function clearHeld(){held.clear();pointerHeld.clear();document.querySelectorAll('[data-action].pressed').forEach(el=>el.classList.remove('pressed'));}
const keyActions={KeyW:'leg-up',KeyS:'leg-down',KeyA:'leg-left',KeyD:'leg-right',ArrowUp:'hand-up',ArrowDown:'hand-down',ArrowLeft:'hand-left',ArrowRight:'hand-right',KeyF:'hand-forward',KeyB:'hand-back',KeyJ:'leg-lift',KeyK:'leg-lower',KeyZ:'waist-left',KeyC:'waist-right',KeyX:'crouch',KeyT:'rise',KeyV:'stretch',KeyN:'relax',KeyG:'block'};
function strike(){if(mode==='spar')combat.strike(scorePose(player,session.target,level));}
document.querySelectorAll('[data-action]').forEach(button=>{
  button.addEventListener('pointerdown',event=>{
    event.preventDefault();try{button.setPointerCapture?.(event.pointerId);}catch{}pointerHeld.set(event.pointerId,button.dataset.action);button.classList.add('pressed');
    if(button.dataset.action==='attack')strike();
  });
  const release=event=>{pointerHeld.delete(event.pointerId);button.classList.remove('pressed');};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
});
function isEditing(){return /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable;}
document.addEventListener('keydown',event=>{
  if(event.code==='Escape'){
    if(!$('helpPanel').hidden)$('closeHelpBtn').click();else if(!$('mapPanel').hidden)$('closeMapBtn').click();else if(focused)setFocus(false);
    return;
  }
  if(isEditing()||event.metaKey||event.ctrlKey||event.altKey)return;
  if(keyActions[event.code]){event.preventDefault();held.add(keyActions[event.code]);return;}
  if(event.repeat)return;
  if(['Space','KeyQ','KeyE','KeyR','KeyH','Digit1','Digit2','Digit3','KeyP'].includes(event.code))event.preventDefault();
  if(event.code==='Space')startPause();if(event.code==='KeyQ'){$('leftLimbBtn').click();}if(event.code==='KeyE')$('rightLimbBtn').click();
  if(event.code==='KeyR')$('replayBtn').click();if(event.code==='KeyH')assistance();if(event.code==='KeyP')strike();
  if(event.code.startsWith('Digit')&&['1','2','3'].includes(event.code.at(-1))){$('camera').value=['first','second','third'][Number(event.code.at(-1))-1];$('camera').dispatchEvent(new Event('change'));}
});
document.addEventListener('keyup',e=>{if(keyActions[e.code])held.delete(keyActions[e.code]);});
window.addEventListener('blur',clearHeld);document.addEventListener('visibilitychange',()=>{if(document.hidden){stopBody();recognition?.abort();clearHeld();if(session)session.paused=true;if(combat)combat.active=false;}});
$('leftLimbBtn').addEventListener('click',()=>{selectedLeg=selectedLeg==='left'?'right':'left';updateLimbLabels();});
$('rightLimbBtn').addEventListener('click',()=>{selectedHand=selectedHand==='left'?'right':'left';updateLimbLabels();});
$('startBtn').addEventListener('click',startPause);$('assistBtn').addEventListener('click',assistance);
$('replayBtn').addEventListener('click',()=>{session.replay();session.paused=false;assistTime=0;});
$('resetBtn').addEventListener('click',()=>{clearHeld();makeSession();status(msg('welcome'));});
$('course').addEventListener('change',e=>{course=curricula.find(c=>c.id===e.target.value)||curricula[0];makeSession();status(msg('welcome'));});
$('difficulty').addEventListener('change',e=>{level=e.target.value;makeSession();});
$('mode').addEventListener('change',e=>{mode=e.target.value;makeSession();status(msg(mode==='spar'?'sparReady':'welcome'));});
$('camera').addEventListener('change',e=>scene.setCamera(e.target.value));
$('language').addEventListener('change',e=>changeLanguage(e.target.value));
$('voiceBtn').addEventListener('click',()=>{voice=!voice;if(!('speechSynthesis'in window)||typeof SpeechSynthesisUtterance==='undefined'){voice=false;status(msg('voiceMissing'));}else if(!voice)speechSynthesis.cancel();else speak(local(session.move.name));$('voiceBtn').textContent=msg(voice?'voiceOn':'voiceOff');$('voiceBtn').setAttribute('aria-pressed',String(voice));});
for(const [id,key]of[['timeSelect','time'],['weatherSelect','weather'],['seasonSelect','season'],['climateSelect','climate']])$(id).addEventListener('change',e=>{settings[key]=e.target.value;scene.setEnvironment(settings);});
$('locationBtn').addEventListener('click',nearby);$('mapBtn').addEventListener('click',openMap);
$('closeMapBtn').addEventListener('click',()=>{const panel=$('mapPanel');panel.hidden=true;if(panel.tagName==='DIALOG')panel.close();const f=panel.querySelector('iframe');if(f)f.src='about:blank';});
$('coachForm').addEventListener('submit',askCoach);
$('coachCancelBtn').addEventListener('click',()=>coach.abort());
$('modelBtn').addEventListener('click',()=>modelOperation(()=>coach.loadBundled()));
$('modelDownloadBtn').addEventListener('click',()=>modelOperation(()=>coach.download()));
$('modelFile').addEventListener('change',e=>{const file=e.target.files[0];if(file)modelOperation(()=>coach.loadLocalFile(file));});
$('modelImportBtn')?.addEventListener('click',()=>$('modelFile').click());
$('helpBtn').addEventListener('click',()=>{const p=$('helpPanel');p.hidden=false;if(p.tagName==='DIALOG'&&!p.open)p.showModal();});
$('closeHelpBtn').addEventListener('click',()=>{const p=$('helpPanel');p.hidden=true;if(p.tagName==='DIALOG')p.close();});
$('scenePhoto')?.addEventListener('error',()=>{status(msg('photoFail'));$('scenePhoto').hidden=true;});
const focusButton=$('focusBtn');focusButton.addEventListener('click',()=>setFocus(!focused));
function setFocus(value){focused=value;document.body.classList.toggle('practice-focus',focused);focusButton.textContent=msg(focused?'exitFocus':'focus');scene?.resize();}

scene=new TrainingScene($('scene'),{onError:()=>status(msg('fallback'))});
scene.setQuality(matchMedia('(max-width:800px)').matches?'low':'high');
for(const [id,key]of[['timeSelect','time'],['weatherSelect','weather'],['seasonSelect','season'],['climateSelect','climate']])$(id).value=settings[key];
scene.setEnvironment(settings);scene.setCamera('third');makeSession();choosePlace(locations[0]);changeLanguage(language);
window.addEventListener('resize',()=>scene.resize());
if('ResizeObserver'in window)new ResizeObserver(()=>scene.resize()).observe($('sceneStage'));
function frame(time){
  const dt=Math.min(.05,Math.max(0,(time-lastFrame)/1000||.016));lastFrame=time;
  const actions=new Set([...held,...pointerHeld.values()]);
  if(!session.paused){
    for(const action of actions){applyAction(player,action,dt,{leg:selectedLeg,hand:selectedHand});if(!['attack','block'].includes(action))session.markInput();}
    if(assistTime>0){player=interpolatePose(player,session.target,Math.min(1,dt*3.8));assistTime-=dt;}
  }
  const score=session.tick(dt,player);
  if(mode==='spar'){
    combat.tick(dt,score,actions.has('block'));
    if(combat.active){sparMoveTime+=dt;if(session.phase==='wait'&&sparMoveTime>combat.period*1.4){session.previous=copyPose(session.target);session.index=(session.index+1)%course.moves.length;session.beginDemo();sparMoveTime=0;}}
    scene.setCombatState?.({playerHealth:combat.playerHealth,opponentHealth:combat.opponentHealth,playerAttack:combat.attackFlash,opponentAttack:combat.windup});
  }
  // Simulation stays responsive to every input; small screens render at 30 fps.
  if(scene.quality!=='low'||time-lastRender>=32){
    scene.setPlayerPose(player);scene.setTeacherPose(session.teacher);scene.setTargetPose(level==='master'?null:session.target);
    scene.render((time-lastRender)/1000||dt,time/1000);lastRender=time;
    const roles=scene.getRoleScreenPositions?.();
    if(roles)for(const [selector,key]of[['.teacher-tag','teacher'],['.player-tag','player']]){
      const element=document.querySelector(selector),p=roles[key];element.hidden=!p.visible;element.style.left=`${p.x*100}%`;element.style.top=`${p.y*100}%`;
    }
  }
  if(time-lastUi>120){updateUi(score);lastUi=time;}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
// A read-only diagnostic helps report deployment issues without exposing inputs/GPS.
window.SmartActionDiagnostics=()=>({version:'2.0.0',course:course.id,phase:session.phase,mode,language,model:lastModelStatus.code,renderer:scene.fallback?'2d':'3d',moves:course.moves.length,bodyCamera:bodyActive,modelWeights:'optional-484220320-bytes',origin:location.protocol});

window.SmartActionBooted=true;window.dispatchEvent(new Event("smartaction-ready"));
