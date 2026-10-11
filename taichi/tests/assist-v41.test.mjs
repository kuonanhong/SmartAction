// Deterministic controller tests, not a physical mobile-device test.
import test from 'node:test';
import assert from 'node:assert/strict';
import {PoseAssistance} from '../js/assist.js';
import {TrainingSession,neutralPose,copyPose,scorePose} from '../js/training.js';
import {PartnerRound} from '../js/combat.js';

function moves(){
  const first=neutralPose();first.hands.left=[-.5,1.65,.45];first.hands.right=[.3,1.35,.5];first.feet.left=[-.4,0,.3];first.waist=.4;first.crouch=.2;
  const second=copyPose(first);second.waist=-.5;second.hands.right=[.5,1.7,.3];
  return [{id:'first',duration:8,pose:first},{id:'second',duration:8,pose:second}];
}
function run({session,assist,seconds,player=neutralPose(),fps=60,partner=null,mode='follow'}){
  for(let i=0;i<Math.round(seconds*fps);i++){
    player=assist.tick(1/fps,player,{session,partner,mode});
    if(mode==='partner')partner.tick(1/fps,scorePose(player,session.target,session.level));
    else session.tick(1/fps,player);
  }
  return player;
}

test('one assist from idle survives a long demonstration and completes exactly one assisted move',()=>{
  const session=new TrainingSession(moves(),{requireInput:true}),assist=new PoseAssistance();
  assert.equal(assist.request({session}).ok,true);assert.equal(session.phase,'demo');
  let player=run({session,assist,seconds:7});
  assert.equal(session.phase,'demo');assert.equal(assist.remaining,5);assert.equal(assist.active,true);
  assert.ok(scorePose(player,session.target).total>99);
  player=run({session,assist,seconds:6,player});
  assert.equal(session.index,1);assert.equal(session.results.length,1);assert.equal(session.results[0].assisted,true);assert.equal(assist.active,false);
  run({session,assist,seconds:30,player});assert.equal(session.results.length,1,'one request must not auto-complete subsequent moves');
});

test('30, 60 and 120 fps have the same assisted pose after the same elapsed time',()=>{
  const values=[30,60,120].map(fps=>{
    const session=new TrainingSession(moves()),assist=new PoseAssistance();assist.request({session});
    return run({session,assist,seconds:1,fps});
  });
  const flatten=p=>[...p.hands.left,...p.hands.right,...p.feet.left,...p.feet.right,p.waist,p.crouch,p.stretch];
  for(const value of values.slice(1))flatten(value).forEach((n,i)=>assert.ok(Math.abs(n-flatten(values[0])[i])<1e-12));
});

test('assistance resumes a paused response; later pause and walking freeze its effect and budget',()=>{
  const session=new TrainingSession(moves(),{level:'pro',requireInput:true}),assist=new PoseAssistance();session.start();session.phase='wait';session.paused=true;
  assist.request({session});assert.equal(session.paused,false);const player=neutralPose(),budget=assist.remaining;
  session.paused=true;assert.equal(assist.tick(.1,player),player);assert.equal(assist.remaining,budget);
  session.paused=false;assert.equal(assist.tick(.1,player,{walkActive:true}),player);assert.equal(assist.remaining,budget);
  run({session,assist,seconds:4,player});assert.equal(session.results.length,1);assert.equal(session.results[0].assisted,true);
});

test('partner assistance survives demonstration and supplies new input during the response',()=>{
  const session=new TrainingSession(moves(),{mode:'partner',requireInput:true}),assist=new PoseAssistance();
  const partner=new PartnerRound({total:2,onEvent:e=>{
    if(e.type==='demo'){session.index=e.index;session.phase='demo';session.assisted=false;}
    if(e.type==='respond')session.phase='wait';
    if(e.type==='success')session.phase='success';
  }});
  assist.request({session,partner,mode:'partner'});let player=run({session,assist,partner,mode:'partner',seconds:3});
  assert.equal(partner.phase,'demo');assert.equal(assist.remaining,5);
  partner.active=false;assert.equal(assist.tick(.1,player,{session,partner,mode:'partner'}),player);assert.equal(assist.remaining,5);partner.active=true;
  player=run({session,assist,partner,mode:'partner',seconds:4,player});
  assert.equal(partner.results.length,1);assert.equal(partner.index,1);assert.equal(assist.active,false);
  run({session,assist,partner,mode:'partner',seconds:10,player});assert.equal(partner.results.length,1);
});

test('master level remains explicit no-assist; request reports the rule without moving or starting',()=>{
  const session=new TrainingSession(moves(),{level:'master'}),assist=new PoseAssistance(),player=neutralPose();
  assert.deepEqual(assist.request({session}),{ok:false,reason:'master'});assert.equal(session.phase,'idle');assert.equal(assist.active,false);assert.equal(assist.tick(.1,player),player);
});

test('manual move, mode, or session changes cancel an outstanding assist',()=>{
  for(const mutate of [s=>s.index++,s=>s.phase='success']){
    const session=new TrainingSession(moves()),assist=new PoseAssistance(),player=neutralPose();assist.request({session});mutate(session);
    assert.equal(assist.tick(.1,player),player);assert.equal(assist.active,false);
  }
  const session=new TrainingSession(moves()),assist=new PoseAssistance(),player=neutralPose();assist.request({session});
  assert.equal(assist.tick(.1,player,{mode:'spar'}),player);assert.equal(assist.active,false);
  assist.request({session});assert.equal(assist.tick(.1,player,{session:new TrainingSession(moves())}),player);assert.equal(assist.active,false);
});

test('sparring help adjusts pose but does not finish a round or create follow-mode results',()=>{
  const session=new TrainingSession(moves(),{mode:'spar',requireInput:true}),assist=new PoseAssistance();
  assist.request({session,mode:'spar'});const player=run({session,assist,mode:'spar',seconds:12});
  assert.equal(session.results.length,0);assert.equal(session.phase,'wait');assert.equal(assist.active,false);assert.ok(scorePose(player,session.target).total>99);
});
