import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const script=await readFile(new URL('../service-worker.js',import.meta.url),'utf8');
test('v4.1 versioned core URLs refresh over network and reopen from installed bare-key cache offline',async()=>{
 for(const prefix of ['/taichi/','/SmartAction/taichi/']){
  const handlers={},saved=new Map(),requests=[];let online=true;
  const cache={match:async key=>saved.get(typeof key==='string'?key:key.url)?.clone(),put:async(key,value)=>saved.set(typeof key==='string'?key:key.url,value)};
  const context={URL,Response,Headers,Number,fetch:async req=>{requests.push(req.url);if(!online)throw Error('offline');return new Response('version-4.1-core');},caches:{open:async()=>cache},self:{location:{href:'https://example.test'+prefix+'service-worker.js'},addEventListener:(name,fn)=>handlers[name]=fn}};
  vm.createContext(context);vm.runInContext(script,context);
  const run=async path=>{let response;handlers.fetch({request:new Request('https://example.test'+prefix+path+'?v=4.1.0'),respondWith:p=>{response=p;}});return await response;};
  for(const path of ['styles.css','js/game.js','js/bootstrap.js']){
   online=true;assert.equal(await(await run(path)).text(),'version-4.1-core');assert.ok(saved.has('https://example.test'+prefix+path));
   online=false;assert.equal(await(await run(path)).text(),'version-4.1-core');
  }
  assert.ok(requests.every(url=>url.endsWith('?v=4.1.0')));
 }
});
