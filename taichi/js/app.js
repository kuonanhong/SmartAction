import {TrainingScene} from './scene.js';
import {curricula,defaultCurriculumId} from '../data/curricula.js';
import {locations} from '../data/locations.js';
import {getPosition,findNearby,mapsEmbedUrl,mapsLink} from './locations.js';
import {Coach} from './coach.js';
import {supportedLanguages,languageNames,detectLanguage,t,applyLanguage} from './i18n.js';
import {TrainingSession,LEVELS,neutralPose,copyPose,interpolatePose,applyAction,biggestCorrection,scorePose} from './training.js';
import {CombatRound,PartnerRound} from './combat.js';
import {pauseForWalk,resumeFromWalk,walkInputs} from './walk.js';
import {SpeechController} from './speech.js';
import {naturalVoiceBanks} from '../data/natural-voices-v4.js';
import {initPracticeLayout,openPracticeDetails} from './layout.js';
import {cacheOfflineScenes} from './offline-cache.js';
import {getMessage} from './messages.js';
import {offlinePhotos} from './offline-photos.js';
import {BodyTracker} from './body-tracker.js';

const $=id=>document.getElementById(id);
const shortLang=lang=>lang.startsWith('zh')?'zh':lang.split('-')[0];
let languagePreference='auto',language=detectLanguage();
try{const saved=localStorage.getItem('smartaction-language');if(supportedLanguages.includes(saved)){languagePreference=saved;language=saved;}}catch{}
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
let session,combat,partner,scene,currentPlace=locations[0],voice=true,modelBusy=false,chatBusy=false;
let focused=false,hasAutoFocused=false;
let tracker=null,bodyActive=false,bodyMetrics=null,bodyLastFrame=0,recognition=null,lastReply='';
let lastFrame=0,lastUi=0,lastRender=0,sparMoveTime=0,settings={time:'morning',weather:'clear',season:'spring',climate:'tropical'};
let walkActive=false,walkSaved=null,jumpRequested=false;
let lastSpeechStatus={code:'needsGesture'};
const held=new Set(),pointerHeld=new Map();
let lastModelStatus={code:'local'},availablePlaces=[...locations],placePage=0;
const completed={};
try{Object.assign(completed,JSON.parse(localStorage.getItem('smartaction-progress')||'{}'));}catch{}

let voicePreferences={rate:1,voices:{}};
try{const saved=JSON.parse(localStorage.getItem('smartaction-speech-v4')||'{}');if(saved&&typeof saved==='object'){voicePreferences.rate=Math.max(.5,Math.min(1.5,Number(saved.rate)||1));if(saved.voices&&typeof saved.voices==='object')voicePreferences.voices=saved.voices;}}catch{}
function saveVoicePreferences(){try{localStorage.setItem('smartaction-speech-v4',JSON.stringify(voicePreferences));}catch{}}
const speech=new SpeechController({lang:language,enabled:voice,recordedBanks:naturalVoiceBanks,rate:voicePreferences.rate,onVoices:renderVoiceOptions,onStatus:s=>{lastSpeechStatus=s;renderSpeechStatus();}});
function renderVoiceOptions(voices){
  const select=$('voiceSelect');if(!select)return;
  const source=$('voiceSource')?.value||'all',gender=$('voiceGender')?.value||'all';
  const type=v=>v.type==='system'?'system':v.quality==='mechanical'?'mechanical':'natural';
  const current=speech.selectedURI||'';
  const matching=voices.filter(v=>(source==='all'||type(v)===source)&&(gender==='all'||(gender==='unknown'?!v.gender:v.gender===gender)));
  // Keep the actual chosen voice visible when a filter excludes it. Filters do not change playback.
  const selected=voices.find(v=>v.voiceURI===current);if(selected&&!matching.includes(selected))matching.unshift(selected);
  const values=[{value:'',label:msg('voiceAutomatic')},...matching.map(v=>({value:v.voiceURI,label:`${v.name} · ${v.lang} · ${msg(type(v)==='system'?'voiceSystem':type(v)==='natural'?'voiceNatural':'voiceMechanical')}${v.gender?' · '+msg(v.gender==='male'?'voiceMale':'voiceFemale'):''}`}))];
  if(current&&!values.some(v=>v.value===current))values.push({value:current,label:current+' · '+msg('voiceStatus_voiceMissing',{language})});
  const signature=JSON.stringify(values);if(select.dataset.options!==signature){select.dataset.options=signature;options(select,values,current);}else select.value=current;
  if($('voiceNoResults'))$('voiceNoResults').hidden=matching.length>0;
  if($('voiceRate'))$('voiceRate').value=String(voicePreferences.rate);
  if($('voiceRateValue'))$('voiceRateValue').textContent=voicePreferences.rate.toFixed(2)+'×';
}
function restoreVoicePreference(){const preferred=voicePreferences.voices[language];if(typeof preferred==='string'&&preferred!==speech.selectedURI)speech.setVoice(preferred);renderVoiceOptions(speech.getVoices());}
function renderSpeechStatus(){
  if(!$('voiceStatus'))return;
  const s=lastSpeechStatus;
  $('voiceStatus').textContent=msg(`voiceStatus_${s.code}`,{name:s.voiceName||'',language:s.voiceLang||language,error:s.error||''});
  $('voiceStatus').dataset.state=s.code;
  if(s.voiceSource&&['queued','speaking','ready'].includes(s.code))$('voiceStatus').textContent+=' · '+msg('voiceSourceFilter')+': '+s.voiceSource+(s.voiceLang?' / '+s.voiceLang:'');
}
function speak(text){if(voice)speech.speak(text);}
function enableSpeech(event,text=msg('voiceTest')){voice=true;speech.setEnabled(true);speech.unlockFromGesture(text,event);$('voiceBtn').textContent=msg('voiceOn');$('voiceBtn').setAttribute('aria-pressed','true');}
function renderNewMessages(){document.querySelectorAll('[data-msg]').forEach(el=>{el.textContent=msg(el.dataset.msg);});}
function renderLevel(){
  const rule=LEVELS[level];$('levelDetails').textContent=msg('levelRule',{score:rule.threshold,minimum:rule.minimum,hold:rule.hold.toFixed(1),tolerance:rule.tolerance.toFixed(2)})+(level==='master'?' '+msg('masterRule'):'');
}
function makeSession(){
  if(walkActive)return;clearHeld();
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
    if(e.type==='finish'){session.paused=true;status(msg(e.won?'won':'lost'));$('achievement').hidden=false;$('achievement').textContent=msg(e.won?'won':'lost')+' '+msg('sparResult',{player:combat.playerHealth,opponent:combat.opponentHealth});speak(msg(e.won?'won':'lost'));}
  }});
  partner=new PartnerRound({level,total:Math.min(6,course.moves.length),onEvent:e=>{
    if(e.type==='demo'){
      session.previous=copyPose(session.teacher);session.index=e.index%course.moves.length;session.elapsed=0;session.phase='demo';session.hold=0;assistTime=0;
      bodyMetrics=null;tracker?.setTarget(session.target);showMove();speak(local(session.move.name));
    }
    if(e.type==='respond'){session.phase='wait';status(msg('partnerRespond',{seconds:partner.rule.window,hold:partner.rule.hold}));}
    if(e.type==='success'){
      session.phase='success';session.results.push({score:e.score,index:session.index,mode:'partner'});
      const key=`${course.id}:${session.index}:${level}`;completed[key]=Math.max(completed[key]||0,e.score);
      try{localStorage.setItem('smartaction-progress',JSON.stringify(completed));}catch{}
      status(msg('partnerSuccess'));showMove();
    }
    if(e.type==='retry')status(msg('partnerRetry'));
    if(e.type==='finish'){session.phase='complete';$('achievement').hidden=false;$('achievement').textContent=msg('partnerDone',{score:e.average});status(msg('partnerDone',{score:e.average}));speak(msg('partnerDone',{score:e.average}));}
  }});
  player=neutralPose();assistTime=0;sparMoveTime=0;bodyMetrics=null;tracker?.setTarget(session.target);
  $('achievement').textContent='';$('achievement').hidden=true;showMove();scene?.setMode(mode);scene?.setEquipment?.(course.id==='taijisword'?'sword':'none');showCombat();renderLevel();updateUi(scorePose(player,session.target,level));
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
      b.setAttribute('aria-current',i===session.index?'step':'false');b.disabled=walkActive||mode!=='follow';
      b.addEventListener('click',()=>{if(walkActive||mode!=='follow')return;session.index=i;session.previous=i?copyPose(course.moves[i-1].pose):neutralPose();session.beginDemo();session.paused=false;sparMoveTime=0;});return b;
    }));
  }
}
function updateLimbLabels(){
  if(walkActive){$('leftLimbBtn').textContent=msg('walkJump');$('rightLimbBtn').textContent=msg('walkGreet');return;}
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
  $('combatPanel').hidden=walkActive||mode!=='spar';$('partnerPanel').hidden=walkActive||mode!=='partner';
  $('sparStrikeBtn').textContent=msg('attack');$('sparBlockBtn').textContent=msg('block');
}
function partnerCue(){
  if(partner.finished)return msg('partnerDone',{score:Math.round(partner.results.reduce((a,b)=>a+b,0)/(partner.results.length||1))});
  if(!partner.active)return msg(partner.phase==='idle'?'partnerIntro':'paused');
  if(partner.phase==='demo')return msg('partnerWatch',{seconds:partner.remaining.toFixed(1)});
  if(partner.phase==='respond')return msg('partnerRespond',{seconds:partner.remaining.toFixed(1),hold:Math.max(0,partner.rule.hold-partner.hold).toFixed(1)});
  return msg('partnerSuccess');
}
function combatCue(){
  if(combat.finished)return msg('sparResult',{player:combat.playerHealth,opponent:combat.opponentHealth});
  if(!combat.active)return msg('sparReadyNew');
  return combat.cue==='block'?msg('sparBlockNow'):combat.cue==='attack'?msg('sparAttackNow'):msg('sparCountdown',{seconds:combat.impactIn.toFixed(1)});
}
function updateWalkUi(){
  const w=scene?.getWalkState?.()||{},lat=w.lat??currentPlace.lat,lng=w.lng??currentPlace.lng;
  $('walkCoordinates').textContent=msg('walkPosition',{lat:Number(lat).toFixed(6),lng:Number(lng).toFixed(6),distance:(w.distance||0).toFixed(1)});
  $('walkMapLink').href=mapsLink({lat,lng},language);
  $('walkStreetViewLink').href=`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${encodeURIComponent(`${lat},${lng}`)}&heading=${(((w.yaw||0)*180/Math.PI)%360+360)%360}`;
  $('residentStatus').textContent=w.atBoundary?msg('walkBoundary'):w.nearbyNPC?.available?msg('greetingNearby',{distance:w.nearbyNPC.distance.toFixed(1)}):msg('walkHint');
}
function updateUi(score){
  $('followScore').textContent=Math.round(score.total);
  for(const [id,key]of[['handsScore','hands'],['feetScore','feet'],['bodyScore','body']]){
    const el=$(id);if(el.tagName==='PROGRESS')el.value=score[key];else{el.textContent=`${Math.round(score[key])}%`;el.style.setProperty('--score',`${score[key]}%`);}
  }
  const active=session.phase!=='idle'&&session.phase!=='complete';
  $('phaseLabel').textContent=walkActive?msg('walkTitle'):mode==='spar'?(combat.finished?msg('complete'):combat.active?t('spar',language):msg('paused')):mode==='partner'?(partner.finished?msg('complete'):partner.active?t('partner',language):msg('paused')):msg(session.paused?'paused':session.phase);
  $('startBtn').textContent=walkActive?msg('walkResume'):mode==='spar'?msg(combat.finished?'roundReplay':combat.active?'pause':'roundStart'):mode==='partner'?msg(partner.finished?'roundReplay':partner.active?'pause':partner.phase==='idle'?'roundStart':'resume'):(active?msg(session.paused?'resume':'pause'):msg('start'));
  const rule=LEVELS[level],matches=score.total>=rule.threshold&&['hands','feet','body'].every(k=>score[k]>=rule.minimum);
  $('practiceHint').textContent=walkActive?msg('walkHint'):mode==='spar'?combatCue():mode==='partner'?partnerCue():session.phase==='wait'&&!session.hasInput?msg('readyInput'):session.phase==='wait'&&matches?msg('hold',{n:Math.max(0,rule.hold-session.hold).toFixed(1)}):correctionText();
  $('poseValues').textContent=`${msg(selectedLeg==='left'?'leftLeg':'rightLeg')}: ${player.feet[selectedLeg].map(n=>n.toFixed(2)).join(' / ')} · ${msg(selectedHand==='left'?'leftHand':'rightHand')}: ${player.hands[selectedHand].map(n=>n.toFixed(2)).join(' / ')} · ↻ ${(player.waist*180/Math.PI).toFixed(0)}°`;
  for(const [id,value]of[['playerHealth',combat.playerHealth],['opponentHealth',combat.opponentHealth]]){const el=$(id);if(el.tagName==='PROGRESS')el.value=value;else el.textContent=String(value);}
  $('combatCue').textContent=combatCue();$('combatPanel').dataset.cue=combat.active?combat.cue:'idle';$('combatBeat').value=combat.elapsed%combat.period/combat.period;
  $('combatClock').textContent=msg('sparClock',{seconds:Math.ceil(combat.remaining),strikes:combat.strikes,blocks:combat.blocks});
  $('combatStartBtn').textContent=msg(combat.finished?'roundReplay':combat.active?'pause':'roundStart');
  $('sparStrikeBtn').disabled=!combat.active||combat.finished||combat.cooldown>0;$('sparBlockBtn').disabled=!combat.active||combat.finished;
  $('partnerCue').textContent=partnerCue();$('partnerProgress').value=partner.results.length;$('partnerProgress').max=partner.total;
  $('partnerSummary').textContent=msg('partnerProgress',{done:partner.results.length,total:partner.total,retries:partner.retries});
  $('partnerStartBtn').textContent=msg(partner.finished?'roundReplay':partner.active?'pause':partner.phase==='idle'?'roundStart':'resume');
  if(walkActive)updateWalkUi();
}
function changeLanguage(preference){
  languagePreference=preference;try{localStorage.setItem('smartaction-language',preference);}catch{}const lang=preference==='auto'?detectLanguage():preference;
  language=lang;speech.setLanguage(lang);restoreVoicePreference();document.documentElement.lang=lang;applyLanguage(lang);
  try{localStorage.setItem('smartaction-language',preference);}catch{}
  options($('course'),curricula.map(c=>({value:c.id,label:local(c.name)})),course.id);
  $('language').value=preference;const auto=$('language').querySelector('[value="auto"]');if(auto)auto.textContent=msg('autoLanguage');renderNewMessages();showMove();updateLimbLabels();renderPlaces();renderLevel();renderSpeechStatus();updateModelStatus(lastModelStatus);showCombat();
  $('voiceBtn').textContent=msg(voice?'voiceOn':'voiceOff');$('voiceBtn').setAttribute('aria-pressed',String(voice));status(msg('welcome'));
  $('focusBtn').textContent=msg(focused?'exitFocus':'focus');
  $('coachCancelBtn').textContent=msg('cancelModel');
  $('localModeBanner').hidden=location.protocol!=='file:';
  renderBodyStatus();renderWalkControls();renderVoiceOptions(speech.getVoices());$('soundSettingsBtn')?.setAttribute('aria-label',msg('voiceSettingsTitle'));updateUi(scorePose(player,session.target,level));
  if(scene)scene.compatibilityLabel=msg('fallback');
  if(!$('mapPanel')?.hidden)openMap();
}
function placeName(place){return local(place.name);}
function choosePlace(place){
  if(walkActive&&(!Number.isFinite(place.lat)||!Number.isFinite(place.lng))){toggleWalk();status(msg('walkNeedsCoordinates'));}
  currentPlace=place;$('locationName').textContent=placeName(place);
  scene?.setLocation(location.protocol==='file:'&&offlinePhotos[place.id]?{...place,photo:offlinePhotos[place.id]}:place);if($('scenePhoto'))$('scenePhoto').hidden=!place.photo;
  if(place.photo){if($('scenePhoto'))$('scenePhoto').src=place.photo;}
  else status(msg('noPhoto'));
  const credit=place.photoCredit,container=$('photoCredit');container.replaceChildren();
  if(credit){const a=document.createElement('a');a.href=credit.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=`${credit.author} · ${credit.license}`;container.append(a);}
  if(place.photoNote){const note=document.createElement('span');note.textContent=` · ${local(place.photoNote)}`;container.append(note);}
  renderPlaces();if(walkActive){$('residentReply').textContent='';status(msg('walkChangePlace'));updateWalkUi();}if(!$('mapPanel')?.hidden)openMap();
}
function regionOf(place){
  if(place.regionCode)return place.regionCode==='islands'?'east':place.regionCode;
  if(place.region)return place.region.replace('taiwan-','').replace('tw-','');
  if(place.country==='TW'||place.country==='Taiwan'||place.lat>21.8&&place.lat<25.6&&place.lng>119&&place.lng<123){
    if(place.lng>121.2&&place.lat<24.7)return 'east';return place.lat>24.3?'north':place.lat>23.4?'central':'south';
  }return 'world';
}
function renderPlaces(){
  const query=($('placeSearch')?.value||'').trim().toLocaleLowerCase(),region=$('placeRegion')?.value||'all',photoOnly=$('photosOnly')?.checked;
  const filtered=availablePlaces.filter(place=>(region==='all'||regionOf(place)===region)&&(!photoOnly||!!place.photo)&&(!query||JSON.stringify([place.name,place.city,place.tags,place.id]).toLocaleLowerCase().includes(query)));
  $('placeCount').textContent=msg('placeCount',{shown:filtered.length,total:availablePlaces.length});
  const pages=Math.max(1,Math.ceil(filtered.length/24));placePage=Math.min(placePage,pages-1);
  $('placesPage').textContent=msg('placesPage',{page:placePage+1,pages});$('placesPrev').disabled=placePage===0;$('placesNext').disabled=placePage>=pages-1;
  const container=$('locationPicker');container.replaceChildren(...filtered.slice(placePage*24,(placePage+1)*24).map(place=>{
    const button=document.createElement('button');button.type='button';button.className='location-card'+(place.id===currentPlace.id?' selected':'');
    if(place.photo){const img=document.createElement('img');img.src=place.photo;img.alt=placeName(place);img.loading='lazy';img.addEventListener('error',()=>{img.hidden=true;});button.append(img);}
    const span=document.createElement('span');span.textContent=placeName(place)+(Number.isFinite(place.distanceKm)?` · ${place.distanceKm.toFixed(1)} km`:'');button.append(span);
    button.addEventListener('click',()=>choosePlace(place));return button;
  }));
  if(!filtered.length){const p=document.createElement('p');p.className='subtle';p.textContent=msg('noPlaceResults');container.append(p);}
}
function openMap(){
  const panel=$('mapPanel');panel.hidden=false;
  if(panel.tagName==='DIALOG'&&!panel.open)panel.showModal();
  const content=$('mapContent')||panel;
  let iframe=panel.querySelector('iframe');if(!iframe){iframe=document.createElement('iframe');iframe.title='Google Maps';iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';content.append(iframe);}
  const point=walkActive?scene.getWalkState():currentPlace;iframe.src=mapsEmbedUrl(point,language);
  let link=panel.querySelector('.google-map-link');if(!link){link=document.createElement('a');link.className='google-map-link';link.target='_blank';link.rel='noopener noreferrer';content.append(link);}
  link.href=mapsLink(point,language);link.textContent='Google Maps ↗';
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
$('readAnswerBtn').addEventListener('click',event=>enableSpeech(event,lastReply||$('coachAnswer').textContent));
$('stopSpeechBtn').addEventListener('click',()=>speech.stop());
$('enableVoiceBtn').addEventListener('click',event=>enableSpeech(event));
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
window.addEventListener('pagehide',()=>{stopBody();recognition?.abort();coach.abort();speech.stop();});
function assistance(){
  if(walkActive)return;
  if(level==='master'){status(msg('masterAssist'));return;}
  if(mode==='partner'&&!partner.active)partner.start();
  if(session.phase==='idle')session.start();session.paused=false;assistTime=2.6+(mode==='partner'&&partner.phase==='demo'?partner.demoDuration:0);session.assisted=true;session.markInput();partner?.markInput();status(msg('assist'));
}
function startPause(event){
  if(walkActive){toggleWalk();return;}
  if(voice&&event)speech.unlockFromGesture(local(session.move.name),event);
  if(!bodyActive&&!hasAutoFocused&&matchMedia('(max-width:860px)').matches){hasAutoFocused=true;setFocus(true);}
  if(mode==='spar'){
    if(combat.finished){combat.reset();session.restart();$('achievement').hidden=true;}
    combat.active=!combat.active;if(session.phase==='idle')session.start();session.paused=!combat.active;status(combatCue());
  }else if(mode==='partner'){
    if(partner.active){partner.active=false;session.paused=true;}
    else{if(partner.finished){session.restart();$('achievement').hidden=true;}partner.start();session.paused=false;}
    status(partnerCue());
  }else{if(session.phase==='idle'||session.phase==='complete')session.start();else session.paused=!session.paused;status(msg(session.paused?'paused':session.phase));}
  updateUi(scorePose(player,session.target,level));
}
function renderWalkControls(){
  document.body.classList.toggle('walking',walkActive);
  $('walkPanel').hidden=!walkActive;$('walkSaveNotice').hidden=!walkActive;$('walkSaveNotice').textContent=msg('walkSaved');$('walkBtn').textContent=msg(walkActive?'walkResume':'walkStart');
  for(const id of ['course','difficulty','mode','replayBtn','assistBtn','resetBtn'])$(id).disabled=walkActive;
  $('legPadTitle').textContent=walkActive?msg('walkMove'):t('legs',language);$('handPadTitle').textContent=walkActive?msg('walkLook'):t('handTechnique',language);
  $('legPadCenter').textContent=walkActive?'↔':t('feet',language);$('handPadCenter').textContent=walkActive?'◉':t('hands',language);
  $('legPadCaption').textContent=walkActive?msg('walkHint'):t('legsHint',language);
  $('stretchJumpBtn').querySelector('span').textContent=walkActive?msg('walkRise'):t('stretch',language);$('stretchJumpBtn').title=walkActive?msg('walkRise'):t('stretch',language);
  for(const action of ['waist-left','waist-right']){const button=document.querySelector(`[data-action="${action}"]`);button.querySelector('span').textContent=walkActive?msg('walkLook'):t('waist',language);button.title=walkActive?msg('walkLook'):t(action==='waist-left'?'waistLeft':'waistRight',language);}
  document.querySelectorAll('.direction').forEach(b=>{
    if(!b.dataset.practiceTitle)b.dataset.practiceTitle=b.title;
    b.title=walkActive?`${b.dataset.action.startsWith('leg')?msg('walkMove'):msg('walkLook')} ${b.textContent.trim().split(' ')[0]}`:t(b.dataset.i18nTitle,language);b.setAttribute('aria-label',b.title);
  });
  document.querySelectorAll('#movementList button,#progressStrip button').forEach(b=>{b.disabled=walkActive||mode!=='follow';});
  updateLimbLabels();showCombat();
}
function toggleWalk(){
  if(!walkActive&&(!Number.isFinite(currentPlace.lat)||!Number.isFinite(currentPlace.lng))){status(msg('walkNeedsCoordinates'));$('walkSaveNotice').hidden=false;$('walkSaveNotice').textContent=msg('walkNeedsCoordinates');return;}
  clearHeld();speech.stop();jumpRequested=false;
  if(!walkActive){walkSaved=pauseForWalk({session,combat,partner,player,mode});walkSaved.camera=$('camera').value;walkActive=true;scene.setWalkMode?.(true);status(msg('walkSaved'));$('residentReply').textContent='';}
  else{scene.setWalkMode?.(false);const restored=resumeFromWalk(walkSaved);player=restored.player;mode=restored.mode;$('camera').value=walkSaved.camera;walkActive=false;walkSaved=null;status(msg(session.paused?'paused':session.phase));}
  renderWalkControls();updateUi(scorePose(player,session.target,level));scene.resize();
}
function greet(){
  if(!walkActive)return;const response=scene.greetNearby?.();
  const text=response?.available?msg('walkGreeting'):msg('walkNoResident');$('residentReply').textContent=text+(response?.available?' '+msg('walkGreetingSource'):'');speak(text);
}
function clearHeld(){held.clear();pointerHeld.clear();document.querySelectorAll('[data-action].pressed').forEach(el=>el.classList.remove('pressed'));}
const keyActions={KeyW:'leg-up',KeyS:'leg-down',KeyA:'leg-left',KeyD:'leg-right',ArrowUp:'hand-up',ArrowDown:'hand-down',ArrowLeft:'hand-left',ArrowRight:'hand-right',KeyF:'hand-forward',KeyB:'hand-back',KeyJ:'leg-lift',KeyK:'leg-lower',KeyZ:'waist-left',KeyC:'waist-right',KeyX:'crouch',KeyT:'rise',KeyV:'stretch',KeyN:'relax',KeyG:'block'};
function strike(){if(!walkActive&&mode==='spar'){combat.strike(scorePose(player,session.target,level));updateUi(scorePose(player,session.target,level));}}
document.querySelectorAll('[data-action]').forEach(button=>{
  button.addEventListener('pointerdown',event=>{
    event.preventDefault();try{button.setPointerCapture?.(event.pointerId);}catch{}pointerHeld.set(event.pointerId,button.dataset.action);button.classList.add('pressed');
    if(walkActive&&['stretch','leg-lift'].includes(button.dataset.action))jumpRequested=true;
    if(button.dataset.action==='attack')strike();
  });
  const release=event=>{pointerHeld.delete(event.pointerId);button.classList.remove('pressed');};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  button.addEventListener('keydown',event=>{if(!['Enter','Space'].includes(event.code))return;event.preventDefault();event.stopPropagation();held.add(button.dataset.action);button.classList.add('pressed');if(!event.repeat){if(button.dataset.action==='attack')strike();if(walkActive&&['stretch','leg-lift'].includes(button.dataset.action))jumpRequested=true;}});
  button.addEventListener('keyup',event=>{if(!['Enter','Space'].includes(event.code))return;event.preventDefault();event.stopPropagation();held.delete(button.dataset.action);button.classList.remove('pressed');});
  button.addEventListener('blur',()=>{held.delete(button.dataset.action);button.classList.remove('pressed');});
});
function isEditing(){return /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable;}
document.addEventListener('keydown',event=>{
  if(event.code==='Escape'){
    if(!$('helpPanel').hidden)$('closeHelpBtn').click();else if(!$('mapPanel').hidden)$('closeMapBtn').click();else if(focused)setFocus(false);
    return;
  }
  if(isEditing()||event.metaKey||event.ctrlKey||event.altKey)return;
  if(keyActions[event.code]){event.preventDefault();if(walkActive&&!event.repeat&&['KeyV','KeyJ'].includes(event.code))jumpRequested=true;held.add(keyActions[event.code]);return;}
  if(event.repeat)return;
  if(['Space','KeyQ','KeyE','KeyR','KeyH','Digit1','Digit2','Digit3','KeyP'].includes(event.code))event.preventDefault();
  if(event.code==='Space')startPause(event);if(event.code==='KeyQ'){$('leftLimbBtn').click();}if(event.code==='KeyE')$('rightLimbBtn').click();
  if(event.code==='KeyR')$('replayBtn').click();if(event.code==='KeyH')assistance();if(event.code==='KeyP')strike();
  if(event.code.startsWith('Digit')&&['1','2','3'].includes(event.code.at(-1))){$('camera').value=['first','second','third'][Number(event.code.at(-1))-1];$('camera').dispatchEvent(new Event('change'));}
});
document.addEventListener('keyup',e=>{if(keyActions[e.code])held.delete(keyActions[e.code]);});
window.addEventListener('blur',clearHeld);document.addEventListener('visibilitychange',()=>{if(document.hidden){stopBody();recognition?.abort();clearHeld();if(session)session.paused=true;if(combat)combat.active=false;if(partner)partner.active=false;if(walkSaved){walkSaved.sessionPaused=true;walkSaved.combatActive=false;walkSaved.partnerActive=false;}speech.stop();}});
$('leftLimbBtn').addEventListener('click',()=>{if(walkActive){jumpRequested=true;return;}selectedLeg=selectedLeg==='left'?'right':'left';updateLimbLabels();});
$('rightLimbBtn').addEventListener('click',()=>{if(walkActive){greet();return;}selectedHand=selectedHand==='left'?'right':'left';updateLimbLabels();});
$('startBtn').addEventListener('click',startPause);$('combatStartBtn').addEventListener('click',startPause);$('partnerStartBtn').addEventListener('click',startPause);$('walkBtn').addEventListener('click',toggleWalk);$('assistBtn').addEventListener('click',assistance);
$('replayBtn').addEventListener('click',event=>{if(walkActive)return;if(voice)speech.unlockFromGesture(local(session.move.name),event);if(mode==='partner'){if(partner.finished){partner.reset();session.restart();$('achievement').hidden=true;}partner.beginDemo();partner.active=true;}else session.replay();session.paused=false;assistTime=0;});
$('resetBtn').addEventListener('click',()=>{clearHeld();makeSession();status(msg('welcome'));});
$('course').addEventListener('change',e=>{course=curricula.find(c=>c.id===e.target.value)||curricula[0];makeSession();status(msg('welcome'));});
$('difficulty').addEventListener('change',e=>{level=e.target.value;makeSession();});
$('mode').addEventListener('change',e=>{if(walkActive)return;mode=e.target.value;makeSession();status(msg(mode==='spar'?'sparReadyNew':mode==='partner'?'partnerIntro':'welcome'));});
$('camera').addEventListener('change',e=>scene.setCamera(e.target.value));
$('language').addEventListener('change',e=>changeLanguage(e.target.value));
$('voiceSelect').addEventListener('change',event=>{speech.setVoice(event.target.value);voicePreferences.voices[language]=event.target.value;saveVoicePreferences();enableSpeech(event);});
for(const id of ['voiceSource','voiceGender'])$(id)?.addEventListener('change',()=>renderVoiceOptions(speech.getVoices()));
$('voiceRate')?.addEventListener('input',event=>{speech.setRate(event.target.value);voicePreferences.rate=speech.rate;saveVoicePreferences();$('voiceRateValue').textContent=speech.rate.toFixed(2)+'×';});
$('voiceReplayBtn')?.addEventListener('click',event=>{if(!speech.lastText){enableSpeech(event);return;}voice=true;speech.setEnabled(true);speech.replayFromGesture(event);$('voiceBtn').textContent=msg('voiceOn');$('voiceBtn').setAttribute('aria-pressed','true');});
$('voiceBackupBtn')?.addEventListener('click',event=>{voice=true;speech.setEnabled(true);speech.playBackupFromGesture(event,msg('voiceTest'));$('voiceBtn').textContent=msg('voiceOn');$('voiceBtn').setAttribute('aria-pressed','true');});
$('voiceResetBtn')?.addEventListener('click',event=>{voicePreferences.voices[language]='';saveVoicePreferences();speech.setVoice('');$('voiceSource').value='all';$('voiceGender').value='all';renderVoiceOptions(speech.getVoices());enableSpeech(event);});
$('soundSettingsBtn')?.addEventListener('click',()=>openPracticeDetails('soundSettings'));
$('voiceBtn').addEventListener('click',event=>{if(voice){voice=false;speech.setEnabled(false);}else enableSpeech(event,local(session.move.name));$('voiceBtn').textContent=msg(voice?'voiceOn':'voiceOff');$('voiceBtn').setAttribute('aria-pressed',String(voice));});
const resetPlaces=()=>{placePage=0;renderPlaces();};$('placeSearch').addEventListener('input',resetPlaces);$('placeRegion').addEventListener('change',resetPlaces);$('photosOnly').addEventListener('change',resetPlaces);
$('placesPrev').addEventListener('click',()=>{placePage=Math.max(0,placePage-1);renderPlaces();});$('placesNext').addEventListener('click',()=>{placePage++;renderPlaces();});
$('cacheScenesBtn').addEventListener('click',async()=>{const button=$('cacheScenesBtn');button.disabled=true;try{const result=await cacheOfflineScenes({onProgress:p=>{$('cacheScenesStatus').textContent=msg('offlineProgress',{n:p.done??p.n??0,total:p.total});}});const failed=Array.isArray(result.failed)?result.failed.length:result.failed||0;$('cacheScenesStatus').textContent=msg(failed?'offlineFailed':'offlineDone',{n:failed});}catch(error){$('cacheScenesStatus').textContent=msg('offlineFailed',{n:error.message||String(error)});}finally{button.disabled=false;}});
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
options($('language'),[{value:'auto',label:msg('autoLanguage')},...supportedLanguages.map(value=>({value,label:languageNames[value]||value}))],languagePreference);
scene.setEnvironment(settings);scene.setCamera('third');makeSession();choosePlace(locations[0]);changeLanguage(languagePreference);initPracticeLayout();
window.addEventListener('resize',()=>scene.resize());window.addEventListener('languagechange',()=>{if(languagePreference==='auto')changeLanguage('auto');});
if('ResizeObserver'in window)new ResizeObserver(()=>scene.resize()).observe($('sceneStage'));
function frame(time){
  const dt=Math.min(.05,Math.max(0,(time-lastFrame)/1000||.016));lastFrame=time;
  const actions=new Set([...held,...pointerHeld.values()]);
  let score=scorePose(player,session.target,level);
  if(walkActive){scene.updateWalk?.(walkInputs(actions,dt,jumpRequested));jumpRequested=false;}
  else{
    if(!session.paused){
      for(const action of actions){applyAction(player,action,dt,{leg:selectedLeg,hand:selectedHand});if(!['attack','block'].includes(action)){session.markInput();partner.markInput();}}
      if(assistTime>0){player=interpolatePose(player,session.target,Math.min(1,dt*3.8));assistTime-=dt;partner.markInput();}
    }
    if(mode==='partner'){
      scene.setCombatState?.({playerAttack:partner.phase==='success'?.8:0,opponentAttack:partner.phase==='demo'?Math.min(1,partner.elapsed/partner.demoDuration):0});
      score=scorePose(player,session.target,level);partner.tick(dt,score);
      if(partner.active){session.elapsed=partner.elapsed;session.hold=partner.hold;session.teacher=partner.phase==='demo'?interpolatePose(session.previous,session.target,partner.elapsed/partner.demoDuration,.06):copyPose(session.target);}
    }else score=session.tick(dt,player);
    if(mode==='spar'){
      combat.tick(dt,score,actions.has('block'));
      if(combat.active){sparMoveTime+=dt;if(session.phase==='wait'&&sparMoveTime>combat.period*1.4){session.previous=copyPose(session.target);session.index=(session.index+1)%course.moves.length;session.beginDemo();sparMoveTime=0;}}
      scene.setCombatState?.({playerHealth:combat.playerHealth,opponentHealth:combat.opponentHealth,playerAttack:combat.attackFlash,opponentAttack:combat.windup});
    }
  }
  // Simulation stays responsive to every input; small screens render at 30 fps.
  if(scene.quality!=='low'||time-lastRender>=32){
    if(!walkActive){scene.setPlayerPose(player);scene.setTeacherPose(session.teacher);scene.setTargetPose(level==='master'?null:session.target);}
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
window.SmartActionDiagnostics=()=>({version:'4.0.0',naturalVoices:new Set(naturalVoiceBanks.map(b=>b.speaker||b.id)).size,speechEngine:lastSpeechStatus.engine,speechSource:lastSpeechStatus.voiceSource,course:course.id,phase:session.phase,paused:session.paused,index:session.index,mode,language,languagePreference,walkActive,combatActive:combat.active,combatFinished:combat.finished,partnerPhase:partner.phase,partnerActive:partner.active,partnerProgress:partner.results.length,speech:lastSpeechStatus.code,places:locations.length,model:lastModelStatus.code,renderer:scene.fallback?'2d':'3d',moves:course.moves.length,bodyCamera:bodyActive,modelWeights:'optional-484220320-bytes',origin:location.protocol});

window.SmartActionBooted=true;window.dispatchEvent(new Event("smartaction-ready"));
