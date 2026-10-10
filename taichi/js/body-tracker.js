import {measureBody,evaluateBodyPose} from './body-scoring.js';
/** Camera use is opt-in; inference remains local. A stopped tracker releases every track. */
export class BodyTracker {
  constructor({onStatus=()=>{},onFrame=()=>{},maxFPS=8}={}){
    this.onStatus=onStatus;this.onFrame=onFrame;this.maxFPS=Math.max(1,Math.min(12,maxFPS));
    this.running=false;this.starting=false;this.target=null;this.sequence=0;
    this._hidden=()=>{if(document.hidden&&(this.running||this.starting))this.stop();};
  }
  setTarget(pose){this.target=pose;}
  _status(code,message=''){this.onStatus({code,message});}
  async start(video){
    if(this.running||this.starting)return;
    if(location.protocol==='file:'||!globalThis.isSecureContext)throw new Error('BODY_SECURE_CONTEXT');
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('BODY_CAMERA_UNAVAILABLE');
    if(!globalThis.Worker||!globalThis.OffscreenCanvas||!globalThis.createImageBitmap)throw new Error('BODY_WORKER_UNAVAILABLE');
    this.starting=true;const sequence=++this.sequence;this.video=video;
    document.addEventListener('visibilitychange',this._hidden);
    try{
      this._status('permission');
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:15,max:24}},audio:false});
      if(sequence!==this.sequence){stream.getTracks().forEach(t=>t.stop());return;}
      this.stream=stream;stream.getTracks().forEach(track=>track.addEventListener?.('ended',()=>{if(sequence===this.sequence)this.stop();},{once:true}));video.srcObject=stream;video.muted=true;video.playsInline=true;video.setAttribute('playsinline','');
      await video.play();
      if(sequence!==this.sequence)return;
      this._status('loading');
      const base=document.baseURI;
      const worker=new Worker(new URL('js/body-worker.bundle.js',base));this.worker=worker;
      await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error('BODY_LOAD_TIMEOUT')),60000);
        this._rejectReady=error=>{clearTimeout(timer);reject(error);};
        worker.onerror=event=>{const error=new Error(event.message||'BODY_WORKER_ERROR');if(this._rejectReady)this._rejectReady(error);else{this._status('error',error.message);this.stop(false);}};
        worker.onmessage=({data})=>{
          if(sequence!==this.sequence)return;
          if(data.type==='ready'){clearTimeout(timer);this._rejectReady=null;resolve();}
          else if(data.type==='error'){
            if(this._rejectReady)this._rejectReady(new Error(data.message));
            else{this._status('error',data.message);this.stop(false);}
          }else if(data.type==='frame'){
            this.busy=false;
            const options={width:video.videoWidth,height:video.videoHeight,worldLandmarks:data.worldLandmarks};
            const metrics=this.target?evaluateBodyPose(data.landmarks,this.target,options):measureBody(data.landmarks,options);
            this.onFrame({landmarks:data.landmarks,worldLandmarks:data.worldLandmarks,metrics,inferenceMs:data.inferenceMs});
          }
        };
        worker.postMessage({type:'init',wasmRoot:new URL('vendor/pose/wasm',base).href,modelUrl:new URL('models/pose/pose_landmarker_lite.task',base).href});
      });
      if(sequence!==this.sequence)return;
      this.starting=false;this.running=true;this.busy=false;this.lastFrame=0;this.lastVideoTime=-1;this._status('ready');
      const loop=async timestamp=>{
        if(!this.running||sequence!==this.sequence)return;
        this.raf=requestAnimationFrame(loop);
        if(this.busy&&timestamp-this.lastFrame>15000){this._status('error','BODY_FRAME_TIMEOUT');this.stop(false);return;}
        if(this.busy||timestamp-this.lastFrame<1000/this.maxFPS||video.readyState<2||video.currentTime===this.lastVideoTime)return;
        this.busy=true;this.lastFrame=timestamp;this.lastVideoTime=video.currentTime;
        try{
          const bitmap=await createImageBitmap(video);
          if(sequence!==this.sequence||!this.running){bitmap.close();return;}
          worker.postMessage({type:'frame',bitmap,timestamp},[bitmap]);
        }catch(error){this._status('error',String(error?.message||error));this.stop(false);}
      };
      this.raf=requestAnimationFrame(loop);
    }catch(error){
      if(sequence!==this.sequence)return;
      this.stop(false);this._status('error',String(error?.message||error));throw error;
    }
  }
  stop(notify=true){
    this.sequence++;this.running=false;this.starting=false;this.busy=false;
    if(this.raf)cancelAnimationFrame(this.raf);
    this._rejectReady?.(new Error('BODY_STOPPED'));this._rejectReady=null;
    this.worker?.terminate();this.worker=null;
    this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;
    if(this.video){this.video.pause();this.video.srcObject=null;}
    document.removeEventListener('visibilitychange',this._hidden);
    if(notify)this._status('stopped');
  }
  dispose(){this.stop();}
}
