/** Structural DOM + measured viewport-budget tests. Not real browser / phone QA. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {calculatePracticeLayout,initPracticeLayout,openPracticeDetails} from '../js/layout.js';
let Window;
try{({Window}=await import('happy-dom'));}catch(error){const dir=process.env.SMARTACTION_BUILD_TOOLS;if(!dir)throw error;({Window}=await import(pathToFileURL(createRequire(path.join(dir,'package.json')).resolve('happy-dom')).href));}
const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await fs.readFile(new URL('../styles.css',import.meta.url),'utf8');
const requiredIds=["bootNotice","localModeBanner","language","helpBtn","course","difficulty","mode","levelDetails","courseNote","environmentDetails","locationBtn","mapBtn","placeSearch","placeRegion","photosOnly","placeCount","locationPicker","placesPrev","placesPage","placesNext","cacheScenesBtn","cacheScenesStatus","timeSelect","weatherSelect","seasonSelect","climateSelect","movementList","bodyCameraBtn","bodyStatus","modelBadge","coachForm","coachInput","coachSend","coachCancelBtn","coachAutoSpeak","readAnswerBtn","stopSpeechBtn","voiceInputBtn","coachAnswer","modelBtn","modelImportBtn","modelDownloadBtn","modelFile","modelProgress","modelStatus","sceneStage","scenePhoto","scene","locationName","camera","bodyView","bodyVideo","bodyOverlay","bodyScoreValue","bodyAdvice","bodyStopBtn","phaseLabel","photoCredit","startBtn","replayBtn","assistBtn","focusBtn","voiceBtn","resetBtn","enableVoiceBtn","voiceSelect","voiceStatus","walkBtn","walkSaveNotice","walkPanel","walkCoordinates","residentStatus","walkMapLink","walkStreetViewLink","residentReply","partnerPanel","partnerCue","partnerProgress","partnerSummary","partnerStartBtn","combatPanel","playerHealth","opponentHealth","combatCue","combatBeat","combatClock","sparStrikeBtn","sparBlockBtn","combatStartBtn","moveName","moveCount","progressStrip","cues","benefits","statusText","legPadTitle","leftLimbBtn","legPadCenter","legPadCaption","followScore","handsScore","feetScore","bodyScore","stretchJumpBtn","handPadTitle","rightLimbBtn","handPadCenter","practiceHint","poseDetails","poseValues","achievement","mapPanel","closeMapBtn","mapContent","helpPanel","closeHelpBtn"];
const create=()=>{const window=new Window({url:'https://example.invalid/taichi/',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:false}});window.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));return window;};

test('all 116 previous application IDs survive restructuring without duplicates',async()=>{
  const win=create(),doc=win.document,ids=[...doc.querySelectorAll('[id]')].map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length);for(const id of requiredIds)assert.ok(doc.getElementById(id),`lost ${id}`);
  for(const action of ['leg-up','leg-down','leg-left','leg-right','hand-up','hand-down','hand-left','hand-right','attack','block','waist-left','waist-right','crouch','stretch','hand-forward','hand-back'])assert.equal(doc.querySelectorAll(`[data-action="${action}"]`).length,1,`duplicate or missing ${action}`);
  await win.happyDOM.close();
});

test('scene is immediately followed by its dock; detailed text and speech settings cannot split them',async()=>{
  const win=create(),doc=win.document,shell=doc.getElementById('practiceShell'),scene=doc.getElementById('sceneStage'),dock=doc.getElementById('controlDock');
  assert.equal(scene.parentElement,shell);assert.equal(scene.nextElementSibling,dock);assert.equal(dock.parentElement,shell);
  for(const id of ['leftLimbBtn','rightLimbBtn','sparStrikeBtn','sparBlockBtn','partnerStartBtn','walkCoordinates','residentReply'])assert.ok(dock.contains(doc.getElementById(id)),`${id} disconnected from dock`);
  assert.ok(!shell.contains(doc.getElementById('soundSettings')));assert.ok(!shell.contains(doc.getElementById('movementDetails')));
  assert.ok(doc.getElementById('soundSettings').contains(doc.getElementById('enableVoiceBtn')));assert.ok(doc.getElementById('soundSettings').contains(doc.getElementById('voiceSelect')));
  assert.ok(shell.querySelector('.practice-topbar').contains(doc.getElementById('soundSettingsBtn')));
  assert.ok(shell.querySelector('.practice-topbar').contains(doc.getElementById('moveName')));
  await win.happyDOM.close();
});

for(const sample of [
  {width:320,height:568,headerHeight:93,dockHeight:284},
  {width:390,height:844,headerHeight:93,dockHeight:284},
  {width:430,height:932,headerHeight:93,dockHeight:284},
  {width:568,height:320,headerHeight:50,dockHeight:171},
  {width:844,height:390,headerHeight:50,dockHeight:205},
  {width:1024,height:768,headerHeight:93,dockHeight:226},
])test(`measured ${sample.width} × ${sample.height} focus budget retains a scene above a full-size dock`,()=>{
  const value=calculatePracticeLayout({...sample,focus:true,topInset:4});
  assert.equal(value.touchTarget,44);assert.equal(value.constrained,false);assert.ok(value.sceneHeight>=value.sceneMinimum);
  assert.ok(value.headerHeight+value.dockHeight+value.sceneHeight<=sample.height-6+.01);
});

test('extraordinary keyboard-height constraint keeps the controller intact and requests scrolling',()=>{
  const layout=calculatePracticeLayout({width:390,height:220,focus:true,headerHeight:93,dockHeight:250,orientation:'portrait'});
  assert.equal(layout.constrained,true);assert.equal(layout.dockHeight,250);assert.equal(layout.sceneHeight,80);assert.ok(layout.shellHeight>220);
});

test('visualViewport resize refreshes allocated height, class changes stay observable, and installation is idempotent',async()=>{
  const win=create(),doc=win.document;doc.body.classList.add('practice-focus');
  const viewport=new win.EventTarget();viewport.width=390;viewport.height=844;Object.defineProperty(win,'visualViewport',{value:viewport,configurable:true});
  const frames=[];win.requestAnimationFrame=fn=>(frames.push(fn),frames.length);win.cancelAnimationFrame=()=>{};
  doc.querySelector('.practice-topbar').getBoundingClientRect=()=>({height:93});doc.getElementById('controlDock').getBoundingClientRect=()=>({height:250});
  const api=initPracticeLayout({window:win,document:doc});assert.equal(api,initPracticeLayout({window:win,document:doc}));assert.equal(doc.documentElement.style.getPropertyValue('--practice-viewport-height'),'844px');
  const initial=parseFloat(doc.getElementById('practiceShell').style.height);viewport.height=568;viewport.dispatchEvent(new win.Event('resize'));frames.splice(0).forEach(fn=>fn());
  assert.ok(parseFloat(doc.getElementById('practiceShell').style.height)<initial);assert.equal(doc.body.dataset.layoutConstrained,'false');
  viewport.height=220;viewport.dispatchEvent(new win.Event('resize'));frames.splice(0).forEach(fn=>fn());assert.equal(doc.body.dataset.layoutConstrained,'true');
  api.destroy();await win.happyDOM.close();
});

test('opening sound settings exits focus through the app button and reveals the existing panel',async()=>{
  const win=create(),doc=win.document;doc.body.classList.add('practice-focus');let clicks=0,revealed=0;
  doc.getElementById('focusBtn').addEventListener('click',()=>{clicks++;doc.body.classList.remove('practice-focus');});
  doc.getElementById('soundSettings').scrollIntoView=()=>revealed++;win.requestAnimationFrame=fn=>{fn();return 1;};
  assert.equal(openPracticeDetails('soundSettings',{window:win,document:doc}),true);assert.equal(clicks,1);assert.equal(doc.body.classList.contains('practice-focus'),false);assert.equal(doc.getElementById('soundSettings').open,true);assert.equal(revealed,1);
  assert.equal(openPracticeDetails('missing',{window:win,document:doc}),false);await win.happyDOM.close();
});

test('dock rules use grid flow, safe-area inset, 44px pads and a scrollable centre rail',()=>{
  const v4=css.slice(css.indexOf('/* v4 —'));
  assert.match(v4,/#controlDock \.controls-area\{display:grid/);assert.match(v4,/#controlDock \.dpad\{display:contents/);
  assert.match(v4,/env\(safe-area-inset-bottom\)/);assert.match(v4,/#controlDock \.direction\{min-width:44px;min-height:44px/);
  assert.match(v4,/#controlDock \.limb-switch\{[^}]*min-width:44px;min-height:44px/);
  assert.match(v4,/#controlDock \.control-center-rail\{[^}]*overflow:auto/);
  assert.doesNotMatch(v4,/#controlDock[^}]*position:(absolute|fixed)/);
});
