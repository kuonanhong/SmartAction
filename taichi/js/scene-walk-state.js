/** Local, bounded park simulation. These coordinates are NOT surveyed paths. */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const wrap=(v)=>((v+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
export function createWalkState({x=0,z=1,yaw=0}={}) {
  return {active:false,x,z,yaw,pitch:0,y:0,vy:0,crouch:0,distance:0,gait:0,speed:0,atBoundary:false,waveUntil:0,elapsed:0,originX:x,originZ:z};
}
export function stepWalk(s,input={}) {
  if(!s.active)return s;
  const dt=clamp(input.dt??.016,0,.06);s.elapsed+=dt;
  s.yaw=wrap(s.yaw+clamp(input.turn,-1,1)*1.55*dt);
  s.pitch=clamp(s.pitch+clamp(input.look,-1,1)*.9*dt,-.65,.65);
  const crouchTarget=input.crouch?.36:0;s.crouch+=clamp(crouchTarget-s.crouch,-dt*1.8,dt*1.8);
  let forward=clamp(input.forward,-1,1),strafe=clamp(input.strafe,-1,1);
  const magnitude=Math.hypot(forward,strafe);if(magnitude>1){forward/=magnitude;strafe/=magnitude;}
  const speed=input.crouch?1.05:2.35;
  const dx=(Math.sin(s.yaw)*forward+Math.cos(s.yaw)*strafe)*speed*dt;
  const dz=(-Math.cos(s.yaw)*forward+Math.sin(s.yaw)*strafe)*speed*dt;
  const nx=s.x+dx,nz=s.z+dz;
  s.x=clamp(nx,s.originX-60,s.originX+60);s.z=clamp(nz,s.originZ-60,s.originZ+60);
  s.atBoundary=Math.abs(nx-s.x)>.000001||Math.abs(nz-s.z)>.000001;
  const walked=Math.hypot(s.x-(nx-dx),s.z-(nz-dz));s.distance+=walked;s.speed=dt>0?walked/dt:0;s.gait+=walked*3.6;
  if(input.jump&&s.y<=.001&&!input.crouch){s.vy=3.9;s.y=.002;}
  s.vy-=9.8*dt;s.y=Math.max(0,s.y+s.vy*dt);if(s.y===0)s.vy=0;
  return s;
}
export function walkPose(s) {
  const stride=Math.min(1,s.speed/2.35),phase=Math.sin(s.gait),lift=Math.max(0,Math.sin(s.gait));
  const waving=s.elapsed<s.waveUntil;
  return {hands:{left:[-.31,1.12+phase*.06*stride,.12-phase*.28*stride],right:waving?[.49,1.94+Math.sin(s.elapsed*12)*.055,.25]:[.31,1.12-phase*.06*stride,.12+phase*.28*stride]},feet:{left:[-.17,.04+lift*.13*stride,phase*.25*stride],right:[.17,.04+Math.max(0,-phase)*.13*stride,-phase*.25*stride]},waist:phase*.055*stride,crouch:s.crouch,stretch:0};
}
export function virtualCoordinates(s,location={}) {
  const numeric=value=>(typeof value==='number'||(typeof value==='string'&&value.trim()!==''))?Number(value):NaN;
  const lat=numeric(location.lat??location.latitude??location.coords?.lat),lng=numeric(location.lng??location.lon??location.longitude??location.coords?.lng);
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)return {lat:null,lng:null,virtualPosition:true};
  const north=-(s.z-s.originZ),east=s.x-s.originX;
  const projectedLat=Math.max(-90,Math.min(90,lat+north/111320));
  const projectedLng=((lng+east/(111320*Math.max(.01,Math.cos(lat*Math.PI/180)))+180)%360+360)%360-180;
  return {lat:projectedLat,lng:projectedLng,virtualPosition:true};
}
export function nearestResident(s,residents,radius=4.2) {
  let nearest=null;
  for(const n of residents){const distance=Math.hypot(s.x-n.x,s.z-n.z);if(!nearest||distance<nearest.distance)nearest={id:n.id,nameKey:n.nameKey,responseKey:n.responseKey,distance,available:distance<=radius};}
  return nearest;
}
