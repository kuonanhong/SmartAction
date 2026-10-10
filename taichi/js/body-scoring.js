/** Experimental, deterministic FRONT-VIEW 2D landmark comparison.
 * This is separate from avatar/controller scoring and does not validate Tai Chi.
 * No images or landmarks are persisted by this module.
 */
export const BODY_POINTS = Object.freeze({nose:0,leftShoulder:11,rightShoulder:12,leftElbow:13,rightElbow:14,leftWrist:15,rightWrist:16,leftHip:23,rightHip:24,leftKnee:25,rightKnee:26,leftAnkle:27,rightAnkle:28});
export const BODY_CONNECTIONS = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
const required = [0,11,12,13,14,15,16,23,24,25,26,27,28];
const finitePoint = p => p && Number.isFinite(p.x) && Number.isFinite(p.y);
const sub = (a,b) => [a[0]-b[0],a[1]-b[1]];
const dot = (a,b) => a[0]*b[0]+a[1]*b[1];
const length = a => Math.hypot(...a);
const average = (a,b) => [(a[0]+b[0])/2,(a[1]+b[1])/2];
const rounded = n => Math.round(n*10)/10;
function invalid(reason, coverage=0) { return {valid:false,reason,coverage,total:null,hands:null,feet:null,corrections:[],experimental:true,scope:'frontal-2d'}; }
function angle(a,b,c) {
  const u=sub(a,b),v=sub(c,b),denom=length(u)*length(v);
  return denom>1e-8 ? rounded(Math.acos(Math.max(-1,Math.min(1,dot(u,v)/denom)))*180/Math.PI) : null;
}
/** Reproducible derived measurements, not diagnoses or estimates of exertion. */
export function measureBody(landmarks,{width=640,height=480,worldLandmarks}={}) {
  if (!Array.isArray(landmarks) || landmarks.length<29) return invalid('no-person');
  const visible=required.filter(i=>finitePoint(landmarks[i]) && Number.isFinite(landmarks[i].visibility) && landmarks[i].visibility>=(i===0?.45:.55));
  const coverage=visible.length/required.length;
  if(coverage<1)return invalid('low-confidence',coverage);
  if(required.some(i=>landmarks[i].x<.02||landmarks[i].x>.98||landmarks[i].y<.02||landmarks[i].y>.98))return invalid('full-body',coverage);
  const aspect=Math.max(.1,width)/Math.max(.1,height);
  const p=landmarks.map(l=>finitePoint(l)?[l.x*aspect,-l.y]:[NaN,NaN]);
  const shoulders=average(p[11],p[12]),hips=average(p[23],p[24]);
  const up=sub(shoulders,hips),torso=length(up),shoulder=length(sub(p[12],p[11]));
  if(torso<.10)return invalid('too-small',coverage);
  if(shoulder/torso<.45||shoulder/torso>1.6)return invalid('face-camera',coverage);
  if(worldLandmarks?.[11]&&worldLandmarks?.[12]){
    const l=worldLandmarks[11],r=worldLandmarks[12];
    if([l.x,l.z,r.x,r.z].every(Number.isFinite)){
      const dx=r.x-l.x,dz=r.z-l.z;
      if(Math.abs(dz)/Math.max(.001,Math.hypot(dx,dz))>.55)return invalid('face-camera',coverage);
    }
  }
  const yAxis=up.map(v=>v/torso);
  let xAxis=[yAxis[1],-yAxis[0]];
  if(dot(xAxis,sub(p[12],p[11]))<0)xAxis=xAxis.map(v=>-v);
  const normalize=i=>{const d=sub(p[i],hips);return [dot(d,xAxis)/torso,dot(d,yAxis)/torso];};
  const points={leftHand:normalize(15),rightHand:normalize(16),leftFoot:normalize(27),rightFoot:normalize(28)};
  return {valid:true,reason:'ready',coverage,scope:'frontal-2d',experimental:true,points,
    angles:{leftElbow:angle(p[11],p[13],p[15]),rightElbow:angle(p[12],p[14],p[16]),leftKnee:angle(p[23],p[25],p[27]),rightKnee:angle(p[24],p[26],p[28])}};
}
/** Target format is training.js avatar-local metres. Depth and rotation are NOT scored. */
export function evaluateBodyPose(landmarks,target,options={}) {
  const measured=measureBody(landmarks,options);
  if(!measured.valid)return measured;
  if(!target?.hands||!target?.feet||!['crouch','stretch','waist'].every(k=>Number.isFinite(target[k])) || ['hands','feet'].some(k=>['left','right'].some(s=>!Array.isArray(target[k][s])||target[k][s].length!==3||!target[k][s].every(Number.isFinite))))return invalid('no-target',measured.coverage);
  // Large turns cannot be compared reliably to a front-facing 2D camera view.
  if(Math.abs(target.waist)>.70)return {...invalid('target-turn',measured.coverage),angles:measured.angles};
  const pelvis=1.045-target.crouch,torso=.530+target.stretch;
  const expected={};
  for(const side of ['left','right']){
    expected[`${side}Hand`]=[target.hands[side][0]/torso,(target.hands[side][1]-pelvis)/torso];
    expected[`${side}Foot`]=[target.feet[side][0]/torso,(target.feet[side][1]+.075-pelvis)/torso];
  }
  const errors={},scores={},corrections=[];
  for(const part of Object.keys(expected)){
    const delta=sub(expected[part],measured.points[part]);
    const error=length(delta);errors[part]=rounded(error);
    // Broad tolerance intentionally acknowledges body proportion/perspective differences.
    scores[part]=100*Math.exp(-.5*(error/.38)**2);
    if(error>.20){
      const axis=Math.abs(delta[0])>Math.abs(delta[1])?0:1;
      // 'left/right' always means the person's anatomical direction, not video pixels.
      corrections.push({part,direction:axis===1?(delta[1]>0?'up':'down'):(delta[0]>0?'right':'left'),amount:rounded(Math.abs(delta[axis]))});
    }
  }
  corrections.sort((a,b)=>b.amount-a.amount);
  const hands=(scores.leftHand+scores.rightHand)/2,feet=(scores.leftFoot+scores.rightFoot)/2;
  return {...measured,total:Math.round((hands+feet)/2),hands:Math.round(hands),feet:Math.round(feet),corrections:corrections.slice(0,2),errors,
    unmeasured:['depth','waist-rotation','weight-distribution','breathing','joint-safety','sequence-quality']};
}
