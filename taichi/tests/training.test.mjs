import test from 'node:test';
import assert from 'node:assert/strict';
import {TrainingSession,LEVELS,neutralPose,copyPose,constrainPose,applyAction,scorePose,interpolatePose} from '../js/training.js';
import {CombatRound} from '../js/combat.js';
import {curricula,defaultCurriculumId} from '../data/curricula.js';
import {distanceKm,mapsEmbedUrl,mapsLink,bundledByDistance} from '../js/locations.js';
import {supportedLanguages,dictionary,t} from '../js/i18n.js';
import {Coach} from '../js/coach.js';

const advance=(object,seconds,pose,blocking=false)=>{
  for(let i=0;i<Math.ceil(seconds/.05);i++)object.tick(.05,pose,blocking);
};
const until=(object,predicate,seconds=10)=>{
  for(let i=0;i<Math.ceil(seconds/.05)&&!predicate();i++)object.tick(.05,object.target);
  assert.ok(predicate(),'expected state was not reached within the time bound');
};
const poseClose=(a,b,label='pose')=>{
  const numbers=p=>[...p.hands.left,...p.hands.right,...p.feet.left,...p.feet.right,p.waist,p.crouch,p.stretch];
  const expected=numbers(b);assert.ok(numbers(a).every((v,i)=>Math.abs(v-expected[i])<1e-9),label);
};
const moves=()=>[{id:'first',duration:.3,pose:neutralPose()},{id:'second',duration:.3,pose:{...neutralPose(),waist:.25}}];
const waiting=level=>{const s=new TrainingSession(moves(),{level});s.start();advance(s,.4,s.target);assert.equal(s.phase,'wait');return s;};

test('website requires a player pose input even when an opening stance already matches',()=>{
  const session=new TrainingSession(moves(),{requireInput:true});session.start();
  advance(session,60,session.target);assert.equal(session.phase,'wait');assert.equal(session.index,0);assert.equal(session.hold,0);
  session.markInput();until(session,()=>session.phase==='success');assert.equal(session.results.length,1);
  until(session,()=>session.index===1);assert.equal(session.hasInput,false);
  advance(session,60,session.target);assert.equal(session.phase,'wait');assert.equal(session.index,1);assert.equal(session.results.length,1);
});

test('teacher demonstrates first and waits indefinitely for an incorrect player',()=>{
  const s=new TrainingSession(moves());
  advance(s,4,s.target);assert.equal(s.phase,'idle');assert.equal(s.index,0);
  s.start();s.tick(.1,s.target);assert.equal(s.phase,'demo');assert.equal(s.results.length,0);
  advance(s,.4,s.target);assert.equal(s.phase,'wait');
  const bad=copyPose(s.target);bad.hands.left=[1,2,-.6];bad.hands.right=[-1,.4,-.6];
  advance(s,60,bad);assert.equal(s.phase,'wait');assert.equal(s.index,0);assert.equal(s.results.length,0);
});

for(const level of ['basic','pro','master']){
  test(`${level}: matching needs its full hold period; success then advances once`,()=>{
    const events=[],s=waiting(level);s.onEvent=e=>events.push(e.type);
    advance(s,LEVELS[level].hold-.2,s.target);assert.equal(s.phase,'wait');assert.equal(s.index,0);
    advance(s,.4,s.target);assert.equal(s.phase,'success');assert.equal(s.results.length,1);
    until(s,()=>s.index===1,2);assert.equal(s.phase,'demo');assert.equal(s.index,1);
    assert.equal(events.filter(e=>e==='success').length,1);
  });
  for(const part of ['hands','feet','body']){
    test(`${level}: a high total cannot hide an inadequate ${part} score`,()=>{
      const s=waiting(level),bad=copyPose(s.target);
      const offset={basic:.3,pro:.15,master:.08}[level];
      if(part==='hands'){bad.hands.left[0]+=offset;bad.hands.right[0]-=offset;}
      else if(part==='feet'){bad.feet.left[1]+=offset;bad.feet.right[1]+=offset;}
      else bad.waist={basic:.4,pro:.28,master:.21}[level];
      poseClose(constrainPose(copyPose(bad)),bad,'rejection fixture must be physically reachable in the avatar');
      const score=scorePose(bad,s.target,level);
      assert.ok(score.total>=LEVELS[level].threshold,'fixture must defeat total-only acceptance');
      assert.ok(score[part]<LEVELS[level].minimum,'fixture must fail the part minimum');
      advance(s,10,bad);assert.equal(s.phase,'wait');assert.equal(s.results.length,0);
    });
  }
}

test('pause freezes demo pose, matching hold, transitions and results',()=>{
  const s=new TrainingSession(moves());s.start();s.tick(.1,s.target);
  const demo=copyPose(s.teacher),elapsed=s.elapsed;s.paused=true;advance(s,5,s.target);
  assert.deepEqual(s.teacher,demo);assert.equal(s.elapsed,elapsed);assert.equal(s.phase,'demo');
  s.paused=false;advance(s,.4,s.target);s.tick(.05,s.target);const hold=s.hold;
  s.paused=true;advance(s,5,s.target);assert.equal(s.hold,hold);assert.equal(s.results.length,0);
  s.paused=false;advance(s,2,s.target);assert.equal(s.phase,'success');
  s.paused=true;advance(s,5,s.target);assert.equal(s.index,0);assert.equal(s.phase,'success');
});

test('a wrong pose reduces accumulated hold; completing and restarting clears results',()=>{
  const s=waiting('basic');advance(s,.5,s.target);const before=s.hold;
  const bad=copyPose(s.target);bad.waist=1.1;s.tick(.1,bad);assert.ok(s.hold<before);
  until(s,()=>s.phase==='success',2);assert.equal(s.results.length,1);
  until(s,()=>s.index===1,2);until(s,()=>s.phase==='wait',1);
  until(s,()=>s.phase==='success',2);assert.equal(s.results.length,2);
  until(s,()=>s.phase==='complete',2);
  assert.equal(s.phase,'complete');assert.equal(s.results.length,2);
  s.start();assert.equal(s.phase,'demo');assert.equal(s.index,0);assert.equal(s.results.length,0);
});

test('sparring pose practice stays separate from follow-mode completion',()=>{
  const s=new TrainingSession(moves(),{mode:'spar'});s.start();advance(s,.4,s.target);
  advance(s,20,s.target);assert.equal(s.phase,'wait');assert.equal(s.index,0);
  assert.equal(s.results.length,0,'combat owns sparring progression; pose hold must not finish its round');
});

test('limb selection isolates left/right hands and feet, including depth and lift controls',()=>{
  const p=neutralPose(),initial=copyPose(p);
  applyAction(p,'hand-forward',.1,{hand:'left',leg:'right'});
  applyAction(p,'leg-lift',.1,{hand:'left',leg:'right'});
  assert.ok(p.hands.left[2]>initial.hands.left[2]);assert.deepEqual(p.hands.right,initial.hands.right);
  assert.ok(p.feet.right[1]>0);assert.deepEqual(p.feet.left,initial.feet.left);
  for(let i=0;i<8;i++){applyAction(p,'hand-forward',.05,{hand:'right'});applyAction(p,'leg-up',.05,{leg:'left'});}
  assert.ok(p.hands.right[2]>initial.hands.right[2]+.1);assert.ok(p.feet.left[2]>.1);
  for(let i=0;i<8;i++){applyAction(p,'hand-back',.05,{hand:'right'});applyAction(p,'leg-down',.05,{leg:'left'});}
  assert.ok(Math.abs(p.hands.right[2]-initial.hands.right[2])<1e-10);
  applyAction(p,'leg-lower',.1,{leg:'right'});assert.equal(p.feet.right[1],0);
});

test('waist, crouch and stretch controls have reversible, bounded effects',()=>{
  const p=neutralPose();for(const action of ['waist-left','crouch','stretch'])applyAction(p,action,.1);
  assert.ok(p.waist<0&&p.crouch>0&&p.stretch>0);
  for(const action of ['waist-right','rise','relax'])applyAction(p,action,.1);
  assert.equal(p.waist,0);assert.equal(p.crouch,0);assert.equal(p.stretch,0);
  for(let i=0;i<300;i++)for(const action of ['hand-up','leg-lift','waist-right','crouch','stretch'])applyAction(p,action,.1);
  poseClose(constrainPose(copyPose(p)),p);assert.ok(p.hands.right[1]<=2.25&&p.feet.left[1]<=.95);
  const a=neutralPose(),b=copyPose(p);poseClose(interpolatePose(a,b,0),a);poseClose(interpolatePose(a,b,1),b);
});

test('combat rejects inactive strikes, enforces cooldown and rewards wind-up timing',()=>{
  const score={total:100},round=new CombatRound();assert.equal(round.strike(score).ok,false);
  round.active=true;const normal=round.strike(score);assert.equal(normal.ok,true);
  const hp=round.opponentHealth;assert.equal(round.strike(score).ok,false);assert.equal(round.opponentHealth,hp);
  advance(round,1,score);assert.equal(round.strike(score).ok,true);
  const timed=new CombatRound();timed.active=true;advance(timed,timed.period-.5,score);
  assert.ok(timed.strike(score).damage>normal.damage);
});

test('blocking only at the impact reduces damage; pause prevents a scheduled hit',()=>{
  const score={total:100},open=new CombatRound(),guard=new CombatRound(),early=new CombatRound();
  for(const r of [open,guard,early])r.active=true;
  advance(open,5.2,score,false);advance(guard,5.2,score,true);
  advance(early,3,score,true);advance(early,2.2,score,false);
  assert.ok(guard.playerHealth>open.playerHealth);assert.equal(early.playerHealth,open.playerHealth);
  assert.equal(guard.blocks,1);assert.equal(open.blocks,0);
  const elapsed=open.elapsed,hp=open.playerHealth;open.active=false;advance(open,10,score);
  assert.equal(open.elapsed,elapsed);assert.equal(open.playerHealth,hp);
});

test('combat declares wins and losses once and bounds health at zero',()=>{
  const events=[],winner=new CombatRound({onEvent:e=>events.push(e)});winner.active=true;
  for(let i=0;i<100&&!winner.finished;i++){winner.strike({total:100});advance(winner,1,{total:100},true);}
  assert.equal(winner.opponentHealth,0);assert.equal(winner.active,false);
  assert.equal(events.filter(e=>e.type==='finish').length,1);assert.equal(events.at(-1).won,true);
  const loss=[],loser=new CombatRound({level:'master',onEvent:e=>loss.push(e)});loser.active=true;
  advance(loser,60,{total:0},false);assert.equal(loser.playerHealth,0);assert.equal(loss.at(-1).won,false);
  loser.reset();assert.equal(loser.playerHealth,100);assert.equal(loser.finished,false);assert.equal(loser.active,false);
});

test('13 curricula include distinct 37, 12 and eight-section pose sequences',()=>{
  assert.equal(curricula.length,13);assert.equal(defaultCurriculumId,'cheng37');
  assert.equal(new Set(curricula.map(c=>c.id)).size,13);
  for(const [id,n]of[['cheng37',37],['tai12',12],['baduanjin',8]])assert.equal(curricula.find(c=>c.id===id).moves.length,n);
  const fingerprints=[];
  for(const c of curricula){
    assert.equal(c.verified,false);assert.ok(c.sourceNote.zh&&c.sourceNote.en);
    assert.ok(new Set(c.moves.map(m=>JSON.stringify(m.pose))).size>=Math.min(6,c.moves.length));
    fingerprints.push(JSON.stringify(c.moves.map(m=>m.pose)));
    for(const m of c.moves){
      poseClose(constrainPose(copyPose(m.pose)),m.pose,`${m.id}: target must be reachable by controls`);
      for(const lang of ['zh','zh-TW','zh-CN','en','ja','ko','es','fr','de','pt']){
        assert.ok(m.name[lang]?.length,`${m.id} name ${lang}`);
        assert.ok(Array.isArray(m.cues[lang])&&m.cues[lang].length>=2,`${m.id} cues ${lang}`);
        assert.ok(m.benefits[lang]?.length,`${m.id} benefits ${lang}`);
      }
    }
  }
  assert.equal(new Set(fingerprints).size,13,'different labels must not conceal identical courses');
});

test('language dictionaries are complete and coordinate links preserve place and language',()=>{
  for(const lang of supportedLanguages)for(const key of Object.keys(dictionary.en)){
    assert.ok(Object.hasOwn(dictionary[lang],key),`${lang} lacks ${key}`);assert.notEqual(t(key,lang),key);
  }
  assert.equal(distanceKm({lat:0,lng:0},{lat:0,lng:0}),0);
  assert.ok(Math.abs(distanceKm({lat:0,lng:0},{lat:0,lng:1})-111.195)<.01);
  assert.throws(()=>mapsLink({lat:95,lng:0}));
  const position={lat:22.6198,lng:120.34},list=bundledByDistance(position);
  assert.equal(list[0].id,'weiwuying');assert.equal(list[0].isLiveNearby,false);
  assert.ok(list.every((p,i)=>i===0||p.distanceKm>=list[i-1].distanceKm));
  const embedded=new URL(mapsEmbedUrl(position,'ja'));assert.equal(embedded.searchParams.get('q'),'22.6198,120.34');assert.equal(embedded.searchParams.get('hl'),'ja');
});

test('without model, coach honestly labels course facts instead of claiming generation',async()=>{
  const coach=new Coach(),course=curricula[0];
  for(const lang of supportedLanguages){
    const response=await coach.ask({question:'How should I practise?',lang,course,move:course.moves[1],score:81});
    assert.equal(response.source,'guide');assert.ok(response.text.length>30);assert.equal(coach.status.ready,false);
    if(lang==='en')assert.ok(response.text.includes('81%'),'course guide should retain supplied pose score');
  }
});
