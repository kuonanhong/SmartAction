import {copyPose} from './training.js';
/** Freeze existing practice objects; do not replace the session or reset progress. */
export function pauseForWalk({session,combat,partner,player,mode}){
  const saved={session,combat,partner,player:copyPose(player),mode,sessionPaused:session.paused,combatActive:combat.active,partnerActive:partner.active};
  session.paused=true;combat.active=false;partner.active=false;return saved;
}
export function resumeFromWalk(saved){
  saved.session.paused=saved.sessionPaused;saved.combat.active=saved.combatActive;saved.partner.active=saved.partnerActive;
  return {player:copyPose(saved.player),mode:saved.mode};
}
export function walkInputs(actions,dt,jump=false){
  const has=a=>actions.has(a)?1:0;
  return {forward:has('leg-up')-has('leg-down'),strafe:has('leg-right')-has('leg-left'),turn:has('hand-right')-has('hand-left')+has('waist-right')-has('waist-left'),look:has('hand-up')-has('hand-down'),crouch:!!has('crouch'),jump,dt};
}
