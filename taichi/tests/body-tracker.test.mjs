import test from 'node:test';
import assert from 'node:assert/strict';
import {BodyTracker} from '../js/body-tracker.js';
function environment(getUserMedia){
  const doc=new EventTarget();doc.baseURI='https://example.test/taichi/';doc.hidden=false;
  globalThis.document=doc;globalThis.location={protocol:'https:'};globalThis.isSecureContext=true;
  Object.defineProperty(globalThis,'navigator',{value:{mediaDevices:{getUserMedia}},configurable:true});
  globalThis.OffscreenCanvas=class {};
  globalThis.createImageBitmap=async()=>({close(){}});
  globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  globalThis.Worker=class {postMessage(data){if(data.type==='init')queueMicrotask(()=>this.onmessage?.({data:{type:'ready'}}));}terminate(){this.terminated=true;}};
}
const video=()=>({srcObject:null,muted:false,playsInline:false,setAttribute(){},async play(){},pause(){this.paused=true;},videoWidth:640,videoHeight:480});
const media=()=>{const track={stopped:false,stop(){this.stopped=true;},addEventListener(){}};return {track,stream:{getTracks:()=>[track]}};};
test('starting and stopping CPU camera releases stream, video and worker',async()=>{
  const {track,stream}=media();environment(async()=>stream);const v=video(),statuses=[];
  const tracker=new BodyTracker({onStatus:s=>statuses.push(s.code)});await tracker.start(v);
  assert.equal(tracker.running,true);assert.equal(v.srcObject,stream);const worker=tracker.worker;
  tracker.stop();assert.equal(track.stopped,true);assert.equal(v.srcObject,null);assert.equal(worker.terminated,true);assert.equal(statuses.at(-1),'stopped');
});
test('late camera permission result after stop immediately releases newly returned tracks',async()=>{
  const {track,stream}=media();let resolve;environment(()=>new Promise(r=>resolve=r));
  const tracker=new BodyTracker();const pending=tracker.start(video());tracker.stop();resolve(stream);await pending;
  assert.equal(track.stopped,true);assert.equal(tracker.running,false);assert.equal(tracker.worker,null);
});
test('camera permission denial leaves no active tracker and surfaces error',async()=>{
  environment(async()=>{throw new Error('permission denied');});const statuses=[];
  const tracker=new BodyTracker({onStatus:s=>statuses.push(s.code)});
  await assert.rejects(()=>tracker.start(video()),/permission denied/);assert.equal(tracker.running,false);assert.equal(statuses.at(-1),'error');
});
test('file URL is explicitly rejected before permission or model fetch',async()=>{
  let requested=false;environment(async()=>{requested=true;});globalThis.location.protocol='file:';
  await assert.rejects(()=>new BodyTracker().start(video()),/BODY_SECURE_CONTEXT/);assert.equal(requested,false);
});
test('backgrounding page stops camera rather than continuing capture',async()=>{
  const {track,stream}=media();environment(async()=>stream);const tracker=new BodyTracker();await tracker.start(video());
  document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));assert.equal(track.stopped,true);assert.equal(tracker.running,false);
});
