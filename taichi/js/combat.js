/** Non-contact avatar game. It does not teach safe real-world sparring. */
export class CombatRound {
  constructor({level='basic',onEvent=()=>{}}={}) {
    this.level=level;this.onEvent=onEvent;this.reset();
  }
  reset(){this.playerHealth=100;this.opponentHealth=100;this.elapsed=0;this.cooldown=0;this.attackFlash=0;this.strikes=0;this.blocks=0;this.finished=false;this.active=false;this.lastCycle=-1;}
  get period(){return this.level==='master'?3.0:this.level==='pro'?4:5;}
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
  }
  checkEnd(){if(!this.playerHealth||!this.opponentHealth){this.finished=true;this.active=false;this.onEvent({type:'finish',won:this.opponentHealth===0,strikes:this.strikes,blocks:this.blocks});}}
}
