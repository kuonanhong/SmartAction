/* Relative URLs also work in /SmartAction/taichi/ and project Pages roots. */
const VERSION='smartaction-taichi-v2-20261010';
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
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
  // Model parts have SHA-verified IndexedDB storage. Avoid a duplicate 484 MB
  // cache or ever mistaking an HTML 404/LFS pointer for a model weight.
  if(/\.(?:part\d+|gguf)$/.test(url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(VERSION);
    if(url.pathname.includes('/vendor/')||url.pathname.includes('/assets/')){
      const hit=await cache.match(event.request);if(hit)return hit;
    }
    try{
      const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;
    }catch(error){const cached=await cache.match(event.request);if(cached)return cached;throw error;}
  })());
});
