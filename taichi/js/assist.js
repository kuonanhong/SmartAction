import {LEVELS,copyPose} from './training.js';

/** One explicitly requested avatar-pose assist. This is not body tracking.
 * Demonstration and pause time must not consume the player's response window.
 * A direct exponential blend keeps the effect equal at 30, 60 and 120 fps;
 * applying a smoothstep to dt in every frame would weaken it at higher fps.
 */
export class PoseAssistance {
  constructor({speed=5,responsePadding=4}={}){
    this.speed=speed;this.responsePadding=responsePadding;this.cancel();
  }
  cancel(){this.active=false;this.session=null;this.partner=null;this.mode=null;this.index=-1;this.remaining=0;}
  request({session,partner=null,mode='follow',level=session?.level||'basic'}={}){
    if(!session)return {ok:false,reason:'missingSession'};
    if(level==='master'){this.cancel();return {ok:false,reason:'master'};}
    // A resumed partner may already have a demonstration in progress.
    if(mode==='partner'&&partner&&!partner.active)partner.start();
    if(session.phase==='idle'||session.phase==='complete')session.start();
    session.paused=false;
    if(['success','complete'].includes(session.phase)){this.cancel();return {ok:false,reason:'finished'};}
    this.active=true;this.session=session;this.partner=partner;this.mode=mode;this.index=session.index;
    this.remaining=(LEVELS[level]||LEVELS.basic).hold+this.responsePadding;
    session.assisted=true;session.markInput();partner?.markInput();
    return {ok:true,reason:'assisting'};
  }
  tick(dt,player,{session=this.session,partner=this.partner,mode=this.mode,walkActive=false}={}){
    if(!this.active)return player;
    if(session!==this.session||mode!==this.mode||session.index!==this.index||['idle','success','complete'].includes(session.phase)){
      this.cancel();return player;
    }
    if(walkActive||session.paused||(mode==='partner'&&(!partner?.active||partner.finished)))return player;
    const phase=mode==='partner'?partner.phase:session.phase;
    if(!['demo','wait','respond'].includes(phase)){this.cancel();return player;}
    dt=Math.max(0,Math.min(.1,Number(dt)||0));
    if(!dt)return player;
    const blend=1-Math.exp(-this.speed*dt),next=copyPose(player),target=session.target;
    for(const part of ['hands','feet'])for(const side of ['left','right'])for(let i=0;i<3;i++)next[part][side][i]+=(target[part][side][i]-next[part][side][i])*blend;
    for(const axis of ['waist','crouch','stretch'])next[axis]+=(target[axis]-next[axis])*blend;
    session.assisted=true;session.markInput();partner?.markInput();
    if(phase!=='demo'){
      this.remaining=Math.max(0,this.remaining-dt);
      if(this.remaining===0)this.cancel();
    }
    return next;
  }
}
