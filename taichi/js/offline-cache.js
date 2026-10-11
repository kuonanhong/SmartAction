/** Explicit user-requested photo/audio cache. Models use their own verified store. */
export const SCENE_CACHE='smartaction-scenes-v3';
const appRoot=()=>new URL('./',document.baseURI);
export async function cacheOfflineScenes({onProgress=()=>{}}={}) {
  if(location.protocol==='file:'||!globalThis.caches)throw new Error('Offline scene downloads require HTTPS or localhost.');
  const root=appRoot(),response=await fetch(new URL('offline-manifest.json',root),{cache:'no-store'});
  if(!response.ok)throw new Error('Offline manifest unavailable.');
  const manifest=await response.json();
  const paths=[...new Set((manifest.optional||[]).filter(p=>/^assets\/(?:photos|places|audio|videos)\//.test(p)))];
  const cache=await caches.open(SCENE_CACHE);let done=0;const failed=[];let cursor=0;
  onProgress({done,total:paths.length,failed:0});
  async function worker(){while(cursor<paths.length){const path=paths[cursor++],url=new URL(path,root);
    if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname)){failed.push(path);continue;}
    try{if(!await cache.match(url.href)){const r=await fetch(url,{credentials:'same-origin'});if(!r.ok)throw new Error(String(r.status));await cache.put(url.href,r);}}catch{failed.push(path);}
    done++;onProgress({done,total:paths.length,failed:failed.length});
  }}
  await Promise.all([worker(),worker(),worker()]);return {done,total:paths.length,failed};
}
