import {LEVELS} from './training.js';
/** Non-contact avatar game. It does not teach safe real-world sparring. */
export class CombatRound {
  constructor({level='basic',onEvent=()=>{}}={}) {
    this.level=level;this.onEvent=onEvent;this.reset();
  }
  reset(){this.playerHealth=100;this.opponentHealth=100;this.elapsed=0;this.cooldown=0;this.attackFlash=0;this.strikes=0;this.blocks=0;this.finished=false;this.active=false;this.lastCycle=-1;this.duration=60;}
  get period(){return this.level==='master'?3.0:this.level==='pro'?4:5;}
  get remaining(){return Math.max(0,this.duration-this.elapsed);}
  get cue(){return this.windup>=.82?'block':this.windup>=.35?'attack':'prepare';}
  get impactIn(){return this.period-this.elapsed%this.period;}
  get windup(){const phase=this.elapsed%this.period;return Math.max(0,(phase-(this.period-1.1))/1.1);}
  strike(score) {
    if(!this.active||this.finished||this.cooldown>0)return {ok:false};
    this.cooldown=.9;this.attackFlash=1;this.strikes++;
    const timing=this.windup>.35&&this.windup<.90?1.3:.8;
    const damage=Math.max(2,Math.round((score.total/100)*16*timing));
    this.opponentHealth=Math.max(0,this.opponentHealth-damage);
    this.onEvent({type:'strike',damage});this.checkEnd();return {ok:true,damage};
  }
  tick(dt,score,blocking=false) {
    if(!this.active||this.finished)return;
    dt=Math.min(.1,Math.max(0,dt));this.elapsed+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.attackFlash=Math.max(0,this.attackFlash-dt*4);
    const cycle=Math.floor(this.elapsed/this.period);
    if(cycle>this.lastCycle){
      if(this.lastCycle>=0){
        const defense=blocking?Math.min(.95,.45+score.total/200):Math.min(.30,score.total/350);
        const damage=Math.round((this.level==='master'?23:17)*(1-defense));
        this.playerHealth=Math.max(0,this.playerHealth-damage);if(blocking)this.blocks++;
        this.onEvent({type: blocking?'block':'hit',damage});this.checkEnd();
      }
      this.lastCycle=cycle;
    }
    if(!this.finished&&this.elapsed>=this.duration){this.finished=true;this.active=false;this.onEvent({type:'finish',won:this.playerHealth>this.opponentHealth,strikes:this.strikes,blocks:this.blocks,timedOut:true});}
  }
  checkEnd(){if(!this.playerHealth||!this.opponentHealth){this.finished=true;this.active=false;this.onEvent({type:'finish',won:this.opponentHealth===0,strikes:this.strikes,blocks:this.blocks});}}
}

/** Six alternating demonstrations and responses. Only avatar pose controls are scored. */
export class PartnerRound {
  constructor({level='basic',total=6,onEvent=()=>{}}={}){this.level=level;this.total=total;this.onEvent=onEvent;this.reset();}
  reset(){this.active=false;this.finished=false;this.phase='idle';this.index=0;this.elapsed=0;this.hold=0;this.retries=0;this.results=[];this.hasInput=false;}
  get rule(){return {...(LEVELS[this.level]||LEVELS.basic),window:({basic:24,pro:18,master:14})[this.level]||24};}
  get demoDuration(){return this.retries?5:3.5;}
  get remaining(){return Math.max(0,(this.phase==='demo'?this.demoDuration:this.rule.window)-this.elapsed);}
  start(){if(this.finished)this.reset();this.active=true;if(this.phase==='idle')this.beginDemo();}
  beginDemo(){this.phase='demo';this.elapsed=0;this.hold=0;this.hasInput=false;this.onEvent({type:'demo',index:this.index});}
  markInput(){if(this.phase==='respond')this.hasInput=true;}
  tick(dt,score){
    if(!this.active||this.finished)return;dt=Math.min(.1,Math.max(0,dt));this.elapsed+=dt;
    if(this.phase==='demo'&&this.elapsed>=this.demoDuration){this.phase='respond';this.elapsed=0;this.hold=0;this.hasInput=false;this.onEvent({type:'respond',index:this.index});}
    else if(this.phase==='respond'){
      const r=this.rule,correct=this.hasInput&&score.total>=r.threshold&&['hands','feet','body'].every(k=>score[k]>=r.minimum);
      this.hold=correct?this.hold+dt:Math.max(0,this.hold-dt*2);
      if(this.hold>=r.hold){this.results.push(Math.round(score.total));this.phase='success';this.elapsed=0;this.onEvent({type:'success',score:Math.round(score.total),index:this.index});}
      else if(this.elapsed>=r.window){this.retries++;this.onEvent({type:'retry',index:this.index});this.beginDemo();}
    }else if(this.phase==='success'&&this.elapsed>=1.5){
      this.index++;
      if(this.index>=this.total){this.finished=true;this.active=false;this.phase='complete';this.onEvent({type:'finish',average:Math.round(this.results.reduce((a,b)=>a+b,0)/this.results.length)});}
      else this.beginDemo();
    }
  }
}
