/* v3: cache the small shell first; optional scenes/audio/models load on demand. */
const VERSION='smartaction-taichi-v3-20261011';
const SCENES='smartaction-scenes-v3';
const ROOT=new URL('./',self.location.href);
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const response=await fetch(new URL('offline-manifest.json',ROOT),{cache:'no-store'});
  if(!response.ok)throw new Error('Offline manifest not found');
  const {files}=await response.json(),cache=await caches.open(VERSION);
  await cache.addAll(files.map(path=>new URL(path,ROOT).href));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('smartaction-taichi-')&&key!==VERSION)await caches.delete(key);
  await self.clients.claim();
})()));
// Safari requests byte ranges for MP3/MP4. Serve a correctly sliced cached body
// so opt-in downloaded audio still plays offline; never cache partial responses.
async function cachedRange(request){
  const match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range')||'');
  if(!match||(!match[1]&&!match[2]))return fetch(request);
  const cached=await (await caches.open(SCENES)).match(request.url)||await (await caches.open(VERSION)).match(request.url);
  if(!cached||cached.status!==200)return fetch(request);
  const blob=await cached.blob(),size=blob.size;
  let start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  let end=match[1]?(match[2]?Math.min(size-1,Number(match[2])):size-1):size-1;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  const headers=new Headers(cached.headers);headers.delete('content-encoding');
  headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
  return new Response(blob.slice(start,end+1,blob.type),{status:206,headers});
}
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
  if(/\.(?:part\d+|gguf)$/.test(url.pathname))return;
  if(event.request.headers.has('range')){event.respondWith(cachedRange(event.request));return;}
  event.respondWith((async()=>{
    const cache=await caches.open(VERSION),sceneCache=await caches.open(SCENES);
    const isAsset=url.pathname.includes('/vendor/')||url.pathname.includes('/assets/');
    if(isAsset){const hit=await cache.match(event.request)||await sceneCache.match(event.request);if(hit)return hit;}
    try{
      const response=await fetch(event.request);
      if(response.ok && response.status===200){try{await (isAsset?sceneCache:cache).put(event.request,response.clone());}catch{/* Storage limits must not break online play. */}}
      return response;
    }catch(error){const cached=await cache.match(event.request)||await sceneCache.match(event.request);if(cached)return cached;throw error;}
  })());
});
