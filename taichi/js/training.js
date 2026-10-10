/** Deterministic avatar controls and a teacher-waits-for-player state machine.
 * Distances are avatar-local metres; this is not human pose recognition.
 */
export const LEVELS = {
  basic: { threshold: 78, minimum: 65, hold: 1.0, tolerance: 0.29 },
  pro: { threshold: 88, minimum: 78, hold: 1.6, tolerance: 0.21 },
  master: { threshold: 94, minimum: 88, hold: 2.2, tolerance: 0.15 }
};
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function neutralPose() {
  return { hands: { left: [-.32,1.0,.12], right:[.32,1.0,.12] },
    feet: {left:[-.2,0,0],right:[.2,0,0]}, waist:0,crouch:0,stretch:0 };
}
export function copyPose(p) {
  return { hands:{left:[...p.hands.left],right:[...p.hands.right]},
    feet:{left:[...p.feet.left],right:[...p.feet.right]},
    waist:p.waist,crouch:p.crouch,stretch:p.stretch };
}
export function constrainPose(p) {
  p.waist=clamp(p.waist,-1.2,1.2);p.crouch=clamp(p.crouch,0,.45);p.stretch=clamp(p.stretch,0,.2);
  for (const side of ['left','right']) {
    const h=p.hands[side], f=p.feet[side];
    h[0]=clamp(h[0],-1.15,1.15);h[1]=clamp(h[1],.35,2.25);h[2]=clamp(h[2],-.7,1.0);
    f[0]=clamp(f[0],-.9,.9);f[1]=clamp(f[1],0,.95);f[2]=clamp(f[2],-.9,.9);
    // Same limb lengths as the player's renderer. Scores cannot reward an
    // invisible, unreachable endpoint beyond the two-bone IK reach.
    const sign=side==='left'?-1:1;
    projectReach(h,[sign*.245*.98,1.575+p.stretch-p.crouch,0],.674);
    const ankle=[f[0],f[1]+.075,f[2]];
    projectReach(ankle,[sign*.13*.98,1.045-p.crouch,0],.979);
    f[0]=ankle[0];f[1]=Math.max(0,ankle[1]-.075);f[2]=ankle[2];
  }
  return p;
}
function projectReach(point,origin,max){
  const d=Math.hypot(...point.map((v,i)=>v-origin[i]));
  if(d>max)for(let i=0;i<3;i++)point[i]=origin[i]+(point[i]-origin[i])*max/d;
}
export function interpolatePose(a,b,t,arc=0) {
  t=clamp(t,0,1);const s=t*t*(3-2*t), p=neutralPose();
  for(const type of ['hands','feet'])for(const side of ['left','right'])for(let i=0;i<3;i++) {
    p[type][side][i]=a[type][side][i]+(b[type][side][i]-a[type][side][i])*s;
    if(type==='hands'&&i===1)p[type][side][i]+=Math.sin(Math.PI*t)*arc;
  }
  for(const k of ['waist','crouch','stretch'])p[k]=a[k]+(b[k]-a[k])*s;
  return p;
}
export function applyAction(p, action, dt, {leg='left',hand='right'}={}) {
  const h=p.hands[hand],f=p.feet[leg],v=.36*clamp(dt,0,.1),rotation=.60*clamp(dt,0,.1);
  switch(action) {
    case 'leg-up':f[2]+=v;break;case 'leg-down':f[2]-=v;break;
    case 'leg-left':f[0]-=v;break;case 'leg-right':f[0]+=v;break;
    case 'leg-lift':f[1]+=v;break;case 'leg-lower':f[1]-=v;break;
    case 'hand-up':h[1]+=v;break;case 'hand-down':h[1]-=v;break;
    case 'hand-left':h[0]-=v;break;case 'hand-right':h[0]+=v;break;
    case 'hand-forward':h[2]+=v;break;case 'hand-back':h[2]-=v;break;
    case 'waist-left':p.waist-=rotation;break;case 'waist-right':p.waist+=rotation;break;
    case 'crouch':p.crouch+=v*.55;break;case 'rise':p.crouch-=v*.55;break;
    case 'stretch':p.stretch+=v*.35;break;case 'relax':p.stretch-=v*.35;break;
  }
  return constrainPose(p);
}
function distance(a,b){return Math.hypot(...a.map((x,i)=>x-b[i]));}
export function scorePose(actual,target,level='basic') {
  const l=LEVELS[level]||LEVELS.basic;
  const leftHand=distance(actual.hands.left,target.hands.left),rightHand=distance(actual.hands.right,target.hands.right);
  const leftFoot=distance(actual.feet.left,target.feet.left),rightFoot=distance(actual.feet.right,target.feet.right);
  const points=d=>100*Math.exp(-.5*Math.pow(d/l.tolerance,2));
  const hands=(points(leftHand)+points(rightHand))/2,feet=(points(leftFoot)+points(rightFoot))/2;
  const body=100*Math.exp(-.5*(Math.pow((actual.waist-target.waist)/.38,2)+Math.pow((actual.crouch-target.crouch)/.16,2)+Math.pow((actual.stretch-target.stretch)/.1,2)));
  return {total:hands*.42+feet*.36+body*.22,hands,feet,body,
    errors:{leftHand,rightHand,leftFoot,rightFoot,waist:actual.waist-target.waist,crouch:actual.crouch-target.crouch,stretch:actual.stretch-target.stretch}};
}
export function biggestCorrection(actual,target) {
  const corrections=[];
  for(const type of ['hands','feet'])for(const side of ['left','right']) {
    const deltas=target[type][side].map((v,i)=>v-actual[type][side][i]);
    const axis=deltas.map(Math.abs).indexOf(Math.max(...deltas.map(Math.abs)));
    corrections.push({type,side,axis,delta:deltas[axis],size:Math.abs(deltas[axis])});
  }
  for(const [key,scale] of [['waist',.55],['crouch',1],['stretch',1]]) {
    const delta=target[key]-actual[key];corrections.push({type:key,delta,size:Math.abs(delta)*scale});
  }
  return corrections.sort((a,b)=>b.size-a.size)[0];
}
export class TrainingSession {
  constructor(moves,{level='basic',mode='follow',requireInput=false,onEvent=()=>{}}={}) {
    this.moves=moves;this.level=level;this.mode=mode;this.onEvent=onEvent;this.index=0;
    this.phase='idle';this.elapsed=0;this.hold=0;this.previous=neutralPose();this.teacher=neutralPose();
    this.results=[];this.paused=false;this.assisted=false;this.rounds=0;this.requireInput=requireInput;this.hasInput=false;
  }
  get move(){return this.moves[this.index];}
  get target(){return this.move.pose;}
  start(){if(this.phase==='complete')this.restart();if(this.phase==='idle')this.beginDemo();this.paused=false;}
  beginDemo(){this.phase='demo';this.elapsed=0;this.hold=0;this.assisted=false;this.hasInput=false;this.onEvent({type:'demo',index:this.index,move:this.move});}
  markInput(){this.hasInput=true;}
  replay(){this.previous=neutralPose();this.teacher=neutralPose();this.beginDemo();}
  restart(){this.index=0;this.phase='idle';this.elapsed=0;this.hold=0;this.previous=neutralPose();this.teacher=neutralPose();this.results=[];this.rounds=0;this.paused=false;this.hasInput=false;}
  tick(dt,player) {
    dt=clamp(dt,0,.1);const score=scorePose(player,this.target,this.level);
    if(this.paused||this.phase==='idle'||this.phase==='complete')return score;
    this.elapsed+=dt;
    if(this.phase==='demo') {
      const duration=this.mode==='spar'?Math.min(3.2,this.move.duration||6):(this.move.duration||6);
      this.teacher=interpolatePose(this.previous,this.target,this.elapsed/duration,.06);
      if(this.elapsed>=duration){this.teacher=copyPose(this.target);this.phase='wait';this.elapsed=0;this.onEvent({type:'wait',index:this.index});}
    } else if(this.phase==='wait') {
      const l=LEVELS[this.level]||LEVELS.basic;
      const correct=(!this.requireInput||this.hasInput)&&score.total>=l.threshold&&score.hands>=l.minimum&&score.feet>=l.minimum&&score.body>=l.minimum;
      this.hold=correct?this.hold+dt:Math.max(0,this.hold-dt*2);
      if(this.mode!=='spar'&&this.hold>=l.hold){
        const result={score:Math.round(score.total),seconds:this.elapsed,assisted:this.assisted,index:this.index,mode:this.mode};
        this.results.push(result);this.rounds++;
        this.phase='success';this.elapsed=0;this.onEvent({type:'success',result});
      }
    } else if(this.phase==='success'&&this.elapsed>=1.8) {
      this.previous=copyPose(this.target);
      if(this.index<this.moves.length-1){this.index++;this.beginDemo();}
      else{this.phase='complete';this.onEvent({type:'complete',results:this.results});}
    }
    return score;
  }
}
