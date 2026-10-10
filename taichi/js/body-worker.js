/* Local CPU inference in a worker: no UI-thread detectForVideo loop. */
import {FilesetResolver,PoseLandmarker} from '../vendor/pose/vision_bundle.mjs';
let detector=null;
self.onmessage=async ({data})=>{
  try{
    if(data.type==='init'){
      const files=await FilesetResolver.forVisionTasks(data.wasmRoot);
      detector=await PoseLandmarker.createFromOptions(files,{
        baseOptions:{modelAssetPath:data.modelUrl,delegate:'CPU'},
        canvas:new OffscreenCanvas(1,1),runningMode:'VIDEO',numPoses:1,
        minPoseDetectionConfidence:.60,minPosePresenceConfidence:.60,
        minTrackingConfidence:.60,outputSegmentationMasks:false
      });
      self.postMessage({type:'ready'});
    }else if(data.type==='frame'&&detector){
      const started=performance.now();
      try{
        const result=detector.detectForVideo(data.bitmap,data.timestamp);
        self.postMessage({type:'frame',landmarks:result.landmarks?.[0]||[],worldLandmarks:result.worldLandmarks?.[0]||[],inferenceMs:performance.now()-started});
        result.close?.();
      }finally{data.bitmap.close();}
    }
  }catch(error){self.postMessage({type:'error',message:String(error?.message||error)});}
};
