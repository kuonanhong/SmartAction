import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {curricula} from '../data/curricula.js';
const languages=['zh-TW','zh-CN','en','ja','ko','es','fr','de','pt','it','id','vi','th','ar','hi'];
const added=['it','id','vi','th','ar','hi'];
const old=['zh','zh-TW','zh-CN','en','ja','ko','es','fr','de','pt'];
function oldContent(v){
 if(Array.isArray(v))return v.map(oldContent);
 if(!v||typeof v!=='object')return v;
 const mapped=Object.hasOwn(v,'en')&&Object.hasOwn(v,'zh');
 return Object.fromEntries(Object.entries(v).filter(([k])=>!mapped||old.includes(k)).map(([k,x])=>[k,oldContent(x)]));
}
test('All 15 locales cover each course, each of 131 moves, and all 24 continuation names',()=>{
 assert.equal(curricula.length,13);
 assert.equal(curricula.flatMap(c=>c.moves).length,131);
 assert.equal(curricula.flatMap(c=>c.moves.flatMap(m=>m.continuations||[])).length,24);
 for(const c of curricula)for(const lang of languages){
  for(const key of ['name','description','sourceNote'])assert.ok(typeof c[key][lang]==='string'&&c[key][lang].trim(),`${c.id}.${key}.${lang}`);
  for(const m of c.moves){
   for(const key of ['name','benefits'])assert.ok(typeof m[key][lang]==='string'&&m[key][lang].trim(),`${m.id}.${key}.${lang}`);
   assert.ok(Array.isArray(m.cues[lang])&&m.cues[lang].length>=2,`${m.id}.cues.${lang}`);
   for(const cue of m.cues[lang])assert.ok(typeof cue==='string'&&cue.trim(),`${m.id} empty cue/${lang}`);
   for(const x of m.continuations||[])assert.ok(x.name[lang]?.trim(),`${m.id}.continuation/${lang}`);
  }
 }
});
test('Added locales never substitute English paragraphs for mapped teaching content',()=>{
 for(const c of curricula)for(const lang of added){
  for(const key of ['name','description','sourceNote'])assert.notEqual(c[key][lang],c[key].en,`${c.id}.${key}.${lang}`);
  for(const m of c.moves){
   for(const key of ['name','benefits'])assert.notEqual(m[key][lang],m[key].en,`${m.id}.${key}.${lang}`);
   for(const cue of m.cues[lang])assert.ok(!m.cues.en.includes(cue),`${m.id} English fallback/${lang}`);
  }
 }
});
test('Locale addition preserves original pose geometry, metadata, and all existing-language content',()=>{
 const digest=createHash('sha256').update(JSON.stringify(oldContent(curricula))).digest('hex');
 // Fingerprint taken from the delivered v2 archive before this locale addition.
 assert.equal(digest,'3e1284a58d240db5d3f5a8202dacbaf7411917c7c4d0686f6e7ab9fb287c2fa0');
});
test('Virtual sword and reduced-turn safety remain explicit in all six added locales',()=>{
 const sword=curricula.find(c=>c.id==='taijisword');
 const turn=curricula[0].moves.find(m=>m.name.en==='Turn and heel kick, low');
 const words={it:['spada virtuale','ginocchio d’appoggio'],id:['pedang virtual','lutut penopang'],vi:['kiếm ảo','gối trụ'],th:['กระบี่เสมือน','เข่าข้างที่รับน้ำหนัก'],ar:['الافتراضي','ركبة الارتكاز'],hi:['आभासी तलवार','घुटने को न मरोड़ें']};
 for(const lang of added){
  for(const m of sword.moves)assert.ok(m.cues[lang].some(s=>s.includes(words[lang][0])),`${m.id} sword constraint/${lang}`);
  assert.ok(turn.cues[lang].some(s=>s.includes(words[lang][1])),`turn constraint/${lang}`);
 }
});
