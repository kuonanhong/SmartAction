#!/usr/bin/env node
// Dependency-free deployment audit. Optional weights are strict with --require-model.
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {locations} from '../data/locations.js';
import {dictionary,supportedLanguages} from '../js/i18n.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const modelArg=process.argv.indexOf('--model-dir');
const modelDirectory=modelArg>=0?path.resolve(process.argv[modelArg+1]||'models'):path.join(root,'models');
const fail=[],notes=[],seen=new Set();
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const relative=file=>path.relative(root,file).split(path.sep).join('/');
async function exists(file){try{return await stat(file);}catch{return null;}}
function expect(condition,message){if(!condition)fail.push(message);}
async function asset(reference,from){
  if(!reference||/^(?:https?:|data:|blob:|about:|mailto:|tel:|#)/i.test(reference))return;
  const clean=decodeURIComponent(reference.split(/[?#]/)[0]);
  if(!clean)return;
  const file=path.resolve(path.dirname(from),clean);
  expect(!path.relative(root,file).startsWith('..'),`Outside package: ${reference} in ${relative(from)}`);
  const info=await exists(file);expect(!!info,`Missing asset ${reference} referenced by ${relative(from)}`);
  if(info?.isFile()){seen.add(relative(file));const bytes=await readFile(file);expect(!bytes.subarray(0,80).toString().startsWith('version https://git-lfs.github.com/spec/v1'),`LFS pointer served as asset: ${relative(file)}`);}
}
async function walk(dir){
  const entries=await readdir(dir,{withFileTypes:true});let list=[];
  for(const e of entries){if(e.name.startsWith('.')||e.name==='vendor'||e.name==='models'||e.name==='tmp'||e.name==='node_modules')continue;const file=path.join(dir,e.name);list.push(...e.isDirectory()?await walk(file):[file]);}
  return list;
}
const htmlPath=path.join(root,'index.html'),html=await readFile(htmlPath,'utf8');
const ownFiles=await walk(root);
for(const file of ownFiles.filter(f=>/\.(?:html|css|js|mjs)$/.test(f))){
  const text=await readFile(file,'utf8');
  if(/\.(?:js|mjs)$/.test(file)){
    try{execFileSync(process.execPath,['--check',file],{stdio:'pipe'});}catch(e){fail.push(`Syntax ${relative(file)}: ${e.stderr?.toString().trim()||e.message}`);}
    for(const match of text.matchAll(/(?:\bfrom\s*|\bimport\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g))await asset(match[2],file);
  }
  if(file.endsWith('.html'))for(const m of text.matchAll(/\b(?:src|href)\s*=\s*['"]([^'"]+)['"]/g))await asset(m[1],file);
  if(file.endsWith('.css'))for(const m of text.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g))await asset(m[1],file);
}
const ids=[...html.matchAll(/\bid=['"]([^'"]+)['"]/g)].map(m=>m[1]),idSet=new Set(ids);
expect(idSet.size===ids.length,'Duplicate HTML IDs');
const app=await readFile(path.join(root,'js/app.js'),'utf8');
const dynamicIds=new Set([...app.matchAll(/\.id\s*=\s*['"]([^'"]+)['"]/g)].map(m=>m[1]));
for(const m of app.matchAll(/\$\(['"]([^'"]+)['"]\)/g))expect(idSet.has(m[1])||dynamicIds.has(m[1]),`App depends on absent HTML ID: ${m[1]}`);
const transKeys=new Set([...html.matchAll(/data-i18n(?:-title|-placeholder)?=['"]([^'"]+)['"]/g)].map(m=>m[1]));
for(const lang of supportedLanguages)for(const key of transKeys)expect(Object.hasOwn(dictionary[lang],key),`Missing ${lang} translation: ${key}`);
const actions=new Set([...html.matchAll(/data-action=['"]([^'"]+)['"]/g)].map(m=>m[1]));
for(const action of ['leg-up','leg-down','leg-left','leg-right','leg-lift','leg-lower','hand-up','hand-down','hand-left','hand-right','hand-forward','hand-back','waist-left','waist-right','crouch','rise','stretch','relax'])expect(actions.has(action),`Missing touch control: ${action}`);
for(const [id,action]of[['sparStrikeBtn','attack'],['sparBlockBtn','block']]){
  const tag=[...html.matchAll(/<button\b[^>]*>/g)].find(m=>new RegExp(`id=['"]${id}['"]`).test(m[0]))?.[0]||'';
  expect(new RegExp(`data-action=['"]${action}['"]`).test(tag),`${id} is not wired to touch action ${action}`);
}
for(const place of locations){
  const credit=place.photoCredit;expect(!!credit?.author&&!!credit?.license&&/^https:\/\//.test(credit?.licenseUrl||'')&&/^https:\/\//.test(credit?.url||''),`Incomplete photo attribution: ${place.id}`);
  expect(/^(?:CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|CC0|Public domain)$/.test(credit?.license||''),`Unapproved photo license: ${place.id}`);
  await asset(place.photo,htmlPath);const photo=path.join(root,place.photo);
  if(await exists(photo)){const bytes=await readFile(photo);expect(bytes.length===credit.size&&digest(bytes)===credit.sha256,`Photo bytes or hash mismatch: ${place.id}`);expect(bytes[0]===0xff&&bytes[1]===0xd8,`Photo is not JPEG: ${place.id}`);}
}
const runtimePath=path.join(root,'vendor/wllama'),runtime=JSON.parse(await readFile(path.join(runtimePath,'runtime-manifest.json'),'utf8'));
for(const item of runtime.files){
  const file=path.join(runtimePath,item.file),info=await exists(file);expect(!!info,`Missing runtime: ${item.file}`);
  if(info){const bytes=await readFile(file);expect(bytes.length===item.bytes&&digest(bytes)===item.sha256,`Runtime integrity mismatch: ${item.file}`);if(item.file.endsWith('.wasm'))expect(bytes.subarray(0,4).equals(Buffer.from([0,97,115,109])),`Invalid WASM or LFS pointer: ${item.file}`);}
}
const poseManifest=JSON.parse(await readFile(path.join(root,'vendor/pose/manifest.json'),'utf8'));
for(const item of poseManifest.files){const file=path.join(root,item.path),info=await exists(file);expect(!!info,`Missing body asset: ${item.path}`);if(info){const bytes=await readFile(file);expect(bytes.length===item.bytes&&digest(bytes)===item.sha256,`Body asset integrity mismatch: ${item.path}`);}}
expect(!html.includes('type="module"'),'Core HTML must use classic entry for file://');
expect(html.includes('js/game.js')&&html.includes('js/bootstrap.js'),'Missing resilient classic entry');
const manifest=JSON.parse(await readFile(path.join(root,'models/manifest.json'),'utf8'));
expect(manifest.parts?.length===15,'Model manifest must describe all 15 parts');
const fullHash=createHash('sha256');let offset=0,found=0;
for(const part of manifest.parts){
  expect(part.offset===offset,`Model offset discontinuity: ${part.file}`);offset+=part.bytes;
  expect(part.bytes>0&&part.bytes<100*1024*1024&&/^[a-f0-9]{64}$/.test(part.sha256),`Invalid model part metadata: ${part.file}`);
  const file=path.join(modelDirectory,part.file);if(!await exists(file))continue;
  found++;const bytes=await readFile(file);expect(bytes.length===part.bytes&&digest(bytes)===part.sha256,`Model part size/hash mismatch: ${part.file}`);
  expect(!bytes.subarray(0,80).toString().startsWith('version https://git-lfs.github.com/spec/v1'),`Model part is an LFS pointer: ${part.file}`);
  if(part.offset===0)expect(bytes.subarray(0,4).toString()==='GGUF','First model part lacks GGUF magic');fullHash.update(bytes);
}
expect(offset===manifest.bytes,'Model total size disagrees with parts');
if(found===manifest.parts.length)expect(fullHash.digest('hex')===manifest.sha256,'Reassembled model SHA-256 mismatch');
else if(process.argv.includes('--require-model'))fail.push(`Model incomplete: ${found}/${manifest.parts.length} parts present`);
else notes.push(`Optional CPU weights: ${found}/${manifest.parts.length} local parts. Install the separate model package or run tools/download_model.py; use --require-model for a strict full-model audit.`);
for(const name of ['service-worker.js','manifest.webmanifest','.nojekyll'])expect(!!await exists(path.join(root,name)),`Missing publishing/offline file: ${name}`);
const workerPath=path.join(root,'service-worker.js');
if(await exists(workerPath)){
  const worker=await readFile(workerPath,'utf8');
  for(const m of worker.matchAll(/['"]([^'"\s]+\.(?:html|css|js|json|webmanifest|svg|wasm|jpe?g|png))['"]/g))await asset(m[1],workerPath);
}
const offlinePath=path.join(root,'offline-manifest.json');
if(await exists(offlinePath)){
  const offline=JSON.parse(await readFile(offlinePath,'utf8')),files=new Set(offline.files||[]);
  expect(files.size===(offline.files||[]).length,'Duplicate offline manifest entries');
  for(const file of files)await asset(file,offlinePath);
  const required=['index.html','styles.css','js/game.js','js/bootstrap.js','js/body-worker.bundle.js','models/pose/pose_landmarker_lite.task','js/app.js','js/coach.js','models/manifest.json',...locations.map(p=>p.photo),...runtime.files.filter(f=>/\.(?:js|wasm)$/.test(f.file)).map(f=>`vendor/wllama/${f.file}`)];
  for(const file of required)expect(files.has(file)||files.has(`./${file}`),`Offline cache omits ${file}`);
  expect(![...files].some(f=>/\.(?:part\d+|gguf)$/.test(f)),'Offline cache should not duplicate large IndexedDB model weights');
}else expect(false,'Missing offline-manifest.json');
const webManifestPath=path.join(root,'manifest.webmanifest');
if(await exists(webManifestPath)){
  const web=JSON.parse(await readFile(webManifestPath,'utf8'));for(const icon of web.icons||[])await asset(icon.src,webManifestPath);await asset(web.start_url,webManifestPath);
}
console.log(`Checked ${ownFiles.length} source/document files, ${seen.size} referenced assets, ${ids.length} UI IDs, ${supportedLanguages.length} languages, ${locations.length} licensed photos, ${runtime.files.length+poseManifest.files.length} runtime/model files and ${found}/15 model parts.`);
for(const note of notes)console.log(`NOTE: ${note}`);
if(fail.length){console.error(fail.map(x=>`FAIL: ${x}`).join('\n'));process.exitCode=1;}else console.log('PASS: no missing dependencies or integrity mismatches in the checked package.');
