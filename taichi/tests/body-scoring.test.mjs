import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateBodyPose,measureBody} from '../js/body-scoring.js';
import {neutralPose} from '../js/training.js';
function landmarks(pose=neutralPose(),{scale=.35,shiftX=.5,shiftY=.87,mirror=-1,width=640,height=480}={}){
  const data=Array.from({length:33},()=>({x:.5,y:.5,z:0,visibility:.99}));
  const points={0:[0,1.95],11:[-.2401,1.575+pose.stretch-pose.crouch],12:[.2401,1.575+pose.stretch-pose.crouch],23:[-.1274,1.045-pose.crouch],24:[.1274,1.045-pose.crouch],13:[-.3,1.25],14:[.3,1.25],25:[-.2,.55],26:[.2,.55],15:pose.hands.left,16:pose.hands.right,27:[pose.feet.left[0],pose.feet.left[1]+.075],28:[pose.feet.right[0],pose.feet.right[1]+.075]};
  for(const [id,[x,y]] of Object.entries(points))data[id]={x:shiftX+mirror*x*scale/(width/height),y:shiftY-y*scale,z:0,visibility:.99};
  return data;
}
test('body score matches synthetic projected target at 100 without scoring depth',()=>{
  const pose=neutralPose(),data=landmarks(pose),score=evaluateBodyPose(data,pose);
  assert.equal(score.valid,true);assert.equal(score.total,100);assert.equal(score.corrections.length,0);assert.ok(score.unmeasured.includes('joint-safety'));
  pose.hands.left[2]=.9;assert.equal(evaluateBodyPose(data,pose).total,100);
});
test('body score invariant to camera distance, translation and mirrored preview geometry',()=>{
  const p=neutralPose();p.hands.left=[-.5,1.5,.2];
  for(const options of [{scale:.30,shiftX:.4,shiftY:.85},{mirror:1},{width:480,height:640}])assert.equal(evaluateBodyPose(landmarks(p,options),p,options).total,100);
});
test('missing person or uncertain landmark yields no numeric score',()=>{
  assert.equal(evaluateBodyPose([],neutralPose()).total,null);
  const data=landmarks();data[27].visibility=.3;
  const score=evaluateBodyPose(data,neutralPose());assert.equal(score.valid,false);assert.equal(score.reason,'low-confidence');assert.equal(score.total,null);
});
test('clipped feet, distant torso, side-on body and turning target do not receive a score',()=>{
  const data=landmarks();data[28].y=1.01;assert.equal(measureBody(data).reason,'full-body');
  assert.equal(measureBody(landmarks(neutralPose(),{scale:.1})).reason,'too-small');
  const world=Array.from({length:33},()=>({x:0,y:0,z:0}));world[11]={x:-.1,y:0,z:-.4};world[12]={x:.1,y:0,z:.4};
  assert.equal(measureBody(landmarks(),{worldLandmarks:world}).reason,'face-camera');
  const p=neutralPose();p.waist=.8;assert.equal(evaluateBodyPose(landmarks(),p).reason,'target-turn');
});
test('lowered left hand reduces measured hands score and asks left hand to move up',()=>{
  const target=neutralPose(),actual=neutralPose();actual.hands.left[1]=.5;
  const score=evaluateBodyPose(landmarks(actual),target);
  assert.equal(score.valid,true);assert.ok(score.hands<80);assert.equal(score.feet,100);
  assert.equal(score.corrections[0].part,'leftHand');assert.equal(score.corrections[0].direction,'up');
});
test('malformed target cannot create NaN score',()=>{
  const p=neutralPose();p.feet.left[0]=NaN;
  const score=evaluateBodyPose(landmarks(),p);assert.equal(score.valid,false);assert.equal(score.total,null);
});
