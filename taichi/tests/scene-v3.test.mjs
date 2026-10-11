import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createWalkState,stepWalk,walkPose,virtualCoordinates,nearestResident} from '../js/scene-walk-state.js';
import {TrainingScene} from '../js/scene.js';

const walking=()=>({...createWalkState(),active:true});
const stepSecond=(state,input)=>{for(let i=0;i<50;i++)stepWalk(state,{...input,dt:.02});return state;};
const near=(actual,expected,tolerance=1e-6)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} ≈ ${expected}`);

test('walking directions are relative to eye heading, with normalised diagonal speed',()=>{
  const f=stepSecond(walking(),{forward:1});near(f.z,1-2.35);near(f.x,0);
  const r=stepSecond(walking(),{strafe:1});near(r.x,2.35);near(r.z,1);
  const east=walking();east.yaw=Math.PI/2;stepSecond(east,{forward:1});near(east.x,2.35);near(east.z,1);
  const diagonal=stepSecond(walking(),{forward:1,strafe:1});near(diagonal.distance,2.35);
});
test('walk route is bounded to 60 m from the start and inactive state remains still',()=>{
  const s=walking();for(let i=0;i<700;i++)stepWalk(s,{forward:1,strafe:1,dt:.06});
  assert.ok(Math.abs(s.x-s.originX)<=60&&Math.abs(s.z-s.originZ)<=60);assert.equal(s.atBoundary,true);
  s.active=false;const before={...s};stepWalk(s,{forward:1,jump:true,dt:1});assert.deepEqual(s,before);
});
test('jump returns to ground and crouch changes pose without repeated jump',()=>{
  const s=walking();stepWalk(s,{jump:true,dt:.03});assert.ok(s.y>0);
  for(let i=0;i<100;i++)stepWalk(s,{dt:.02});assert.equal(s.y,0);assert.equal(s.vy,0);
  stepSecond(s,{crouch:true,jump:true});near(s.crouch,.36);assert.equal(s.y,0);near(walkPose(s).crouch,.36);
  stepSecond(s,{});near(s.crouch,0);
});
test('simulated map position uses east/north displacement and retains explicit virtual flag',()=>{
  const s=walking();s.x+=10;s.z-=20;
  const p=virtualCoordinates(s,{lat:22.62,lng:120.34});assert.ok(p.lat>22.62&&p.lng>120.34);assert.equal(p.virtualPosition,true);
  assert.equal(virtualCoordinates(s,{}).lat,null);
});
test('greeting is restricted to a nearby resident',()=>{
  const s=walking(),residents=[{id:'a',x:2,z:0},{id:'b',x:8,z:9}];
  assert.equal(nearestResident(s,residents).id,'a');assert.equal(nearestResident(s,residents).available,true);
  s.x=40;assert.equal(nearestResident(s,residents).available,false);
});

const pose=()=>({hands:{left:[-.4,1.2,.2],right:[.4,1.2,.2]},feet:{left:[-.2,.07,0],right:[.2,.07,0]},waist:.2,crouch:.1,stretch:0});
const resident=(id,x,z)=>({id,x,z,person:{root:new THREE.Group()}});
function sceneFixture(){
  const scene=Object.create(TrainingScene.prototype);scene.walk=createWalkState();scene.fallback=false;scene.camera=new THREE.PerspectiveCamera(43,16/9,.06,650);scene.cameraMode='third';scene.mode='follow';scene.orbit={azimuth:.28,elevation:.24,radius:8.1};scene.location={lat:22.62,lng:120.34};scene.sceneProjection='flat';scene.sceneKind='photo-3d';scene.is360=false;
  scene.player={height:1,root:new THREE.Group(),apply(p){this.lastPose=p;},head:{},body:{},hem:{},neck:{},collar:{},sword:{}};scene.player.root.position.set(0,0,1);scene.player.root.rotation.y=Math.PI;scene.player.root.scale.x=-1;
  scene.teacher={root:new THREE.Group(),apply(){}};scene.teacher.root.position.set(0,0,-2.7);scene.playerPose=pose();scene.teacherPose=pose();scene.targetPose=pose();scene.targetsVisible=false;scene.targets=new THREE.Group();scene.classmates=[];scene.residents=[resident('a',2,-1)];scene.playerPad={};scene.playerRing={};return scene;
}
test('walk exit restores the exact training transform, pose and camera selection',()=>{
  const s=sceneFixture();const before=JSON.stringify(s.playerPose),position=s.player.root.position.clone();s.setWalkMode(true);
  stepSecond(s.walk,{forward:1,turn:.2});s._applyWalk();s.setCamera('first');assert.notEqual(s.player.root.position.z,position.z);
  s.setWalkMode(false);assert.equal(JSON.stringify(s.playerPose),before);assert.deepEqual(s.player.root.position,position);assert.equal(s.player.root.scale.x,-1);assert.equal(s.cameraMode,'third');
});
test('all walk cameras translate in world space; first-person hides head; horizontal FOV expands by 5%',()=>{
  for(const mode of ['first','second','third']){
    const s=sceneFixture();s.setWalkMode(true);s.setCamera(mode);const start=s.camera.position.clone();s.walk.x+=3;s.walk.z-=2;s._applyWalk();near(s.camera.position.x-start.x,3);near(s.camera.position.z-start.z,-2);
    assert.equal(s.player.head.visible,mode!=='first');const base=mode==='first'?67:mode==='second'?58:53;
    const h=2*Math.atan(Math.tan(base*Math.PI/360)*s.camera.aspect);const actual=2*Math.atan(Math.tan(s.camera.fov*Math.PI/360)*s.camera.aspect);near(actual,h*1.05);
  }
});
test('flat photos never become a panorama from aspect alone; only explicit 2:1 panoramas enable sphere',()=>{
  const original=THREE.TextureLoader.prototype.load;
  let aspect=2;THREE.TextureLoader.prototype.load=function(url,done){done(new THREE.Texture({width:aspect*100,height:100}));};
  try{
    for(const [projection,ratio,expected]of [['flat',2,false],['equirectangular',2,true],['equirectangular',1.5,false]]){
      aspect=ratio;const s=sceneFixture();s.panoSphere={};s.photoPlane={};s.photoShade={};s.photoMaterial=new THREE.MeshBasicMaterial();s.panoMaterial=new THREE.MeshBasicMaterial();s.renderer={capabilities:{getMaxAnisotropy:()=>4}};
      s.setLocation({photo:'licensed.jpg',projection});assert.equal(s.is360,expected);assert.equal(s.panoSphere.visible,expected);
    }
  }finally{THREE.TextureLoader.prototype.load=original;}
});
test('walk state and greeting work without a WebGL renderer',()=>{
  const s=sceneFixture();s.fallback=true;s.player=undefined;s.setWalkMode(true);s.updateWalk({forward:1,dt:.02});assert.equal(s.getWalkState().active,true);assert.ok(s.getWalkState().z<1);
  const greeting=s.greetNearby();assert.equal(greeting.available,true);assert.equal(greeting.ok,true);s.setWalkMode(false);assert.equal(s.getWalkState().active,false);
});

test('licensed video uses muted inline autoplay, falls back on rejection, and stops on release',async()=>{
  const previous=globalThis.document;let video;
  globalThis.document={createElement(tag){assert.equal(tag,'video');video={attributes:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(){},play(){return Promise.reject(new Error('autoplay blocked'));},pause(){this.paused=true;},removeAttribute(k){delete this[k];},load(){this.released=true;}};return video;}};
  try{const s=sceneFixture();s.photoGeneration=1;s._loadVideo({src:'assets/park.webm',projection:'flat'},1);await Promise.resolve();await Promise.resolve();assert.equal(video.muted,true);assert.equal(video.playsInline,true);assert.equal(video.loop,true);assert.equal(s.videoTexture,undefined);assert.equal(s.sceneKind,'photo-3d');s._clearVideo();assert.equal(video.paused,true);assert.equal(video.released,true);assert.equal(s.videoElement,null);}finally{globalThis.document=previous;}
});

test('catalog coordinates reject null, empty strings, booleans and out-of-range values',()=>{
  for(const bad of [null,undefined,'','  ',false,true,NaN,Infinity,91])assert.equal(virtualCoordinates(walking(),{lat:bad,lng:120}).lat,null);
  for(const bad of [null,undefined,'','  ',false,true,NaN,Infinity,181])assert.equal(virtualCoordinates(walking(),{lat:22,lng:bad}).lng,null);
  near(virtualCoordinates(walking(),{lat:'22.6',lng:'120.3'}).lat,22.6);
  near(virtualCoordinates(walking(),{lat:0,lng:0}).lng,0);
  const s=walking();s.x=60;assert.ok(virtualCoordinates(s,{lat:10,lng:179.9999}).lng<0);
});

test('an inside panorama has inward faces and photograph UVs increase toward screen-right',()=>{
  const s=sceneFixture();s.scene=new THREE.Scene();s._makeEnvironment();s.panoSphere.updateMatrixWorld(true);
  const centre=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,0,-1)).intersectObject(s.panoSphere)[0];
  const right=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(.1,0,-1).normalize()).intersectObject(s.panoSphere)[0];
  assert.ok(centre&&right,'camera inside sphere can see its inward faces');assert.ok(right.uv.x>centre.uv.x,'a photograph does not become horizontally mirrored');
});

test('new place clears old photograph immediately and async old results cannot change it',()=>{
  const original=THREE.TextureLoader.prototype.load,loads=[];
  THREE.TextureLoader.prototype.load=function(url,done,progress,error){loads.push({url,done,error});};
  try{
    const s=sceneFixture();s.panoSphere={};s.photoPlane={};s.photoShade={};s.photoMaterial=new THREE.MeshBasicMaterial();s.panoMaterial=new THREE.MeshBasicMaterial();s.renderer={capabilities:{getMaxAnisotropy:()=>4}};
    s.setLocation({photo:'old.jpg'});s.setLocation({photo:'new.jpg'});
    assert.equal(s.photoMaterial.opacity,0);assert.equal(s.photoMaterial.map,null);
    let released=false;const stale=new THREE.Texture({width:200,height:100});stale.addEventListener('dispose',()=>released=true);loads[0].done(stale);assert.equal(released,true);assert.equal(s.photoMaterial.map,null);
    const current=new THREE.Texture({width:150,height:100});loads[1].done(current);assert.equal(s.photoMaterial.map,current);
    s.setLocation({photo:'third.jpg'});assert.equal(s.photoMaterial.map,null);assert.equal(s.photoMaterial.opacity,0);
  }finally{THREE.TextureLoader.prototype.load=original;}
});

test('photo errors cannot hide active video and video decode errors restore its still photo',async()=>{
  const originalLoad=THREE.TextureLoader.prototype.load,previousDocument=globalThis.document,loads=[];let video;
  THREE.TextureLoader.prototype.load=function(url,done,progress,error){loads.push({done,error});};
  globalThis.document={addEventListener(){},removeEventListener(){},createElement(){const events=new Map();video={videoWidth:1600,videoHeight:900,readyState:3,HAVE_CURRENT_DATA:2,setAttribute(){},addEventListener(k,v){events.set(k,v);},removeEventListener(k){events.delete(k);},play(){return Promise.resolve();},pause(){},removeAttribute(){},load(){},emit(k){events.get(k)?.();}};return video;}};
  try{
    const s=sceneFixture();s.panoSphere={};s.photoPlane={};s.photoShade={};s.photoMaterial=new THREE.MeshBasicMaterial();s.panoMaterial=new THREE.MeshBasicMaterial();s.renderer={capabilities:{getMaxAnisotropy:()=>4}};
    s.setLocation({photo:'poster.jpg',video:{src:'park.webm'}});await Promise.resolve();await Promise.resolve();assert.ok(s.videoTexture);assert.equal(s.sceneKind,'video-3d');
    loads[0].error();assert.equal(s.sceneKind,'video-3d');assert.equal(s.photoMaterial.opacity,.97);
    const poster=new THREE.Texture({width:1600,height:900});loads[0].done(poster);assert.notEqual(s.photoMaterial.map,poster);assert.equal(s.stillTexture,poster);
    video.emit('error');assert.equal(s.videoTexture,null);assert.equal(s.photoMaterial.map,poster);assert.equal(s.sceneKind,'photo-3d');
  }finally{THREE.TextureLoader.prototype.load=originalLoad;globalThis.document=previousDocument;}
});

test('both renderers receive the same active paired combat pose',()=>{
  const s=sceneFixture();s.mode='partner';s.combatState={playerAttack:1,opponentAttack:1};const {tp,pp}=s._animatedPoses();
  near(pp.hands.right[2],.91);near(tp.hands.right[2],.91);near(pp.hands.left[1],1.6);
  assert.notEqual(s.playerPose.hands.right[2],.91,'render effects do not mutate the scoring pose');
});
