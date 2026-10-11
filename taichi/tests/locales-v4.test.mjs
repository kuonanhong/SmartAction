import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {supportedLanguages,languageNames,dictionary,normalizeLanguage,detectLanguage,t} from '../js/i18n.js';
import {messageDictionary,getMessage} from '../js/messages.js';
import {featureMessagesV4} from '../data/localization-v4-features.js';
import {curricula} from '../data/curricula.js';
const additional=['ru','tr','nl'];
const placeholders=s=>[...String(s).matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(m=>m[1]).sort();
test('18 locales each provide every UI/runtime key and preserve interpolation variables',()=>{
 assert.equal(supportedLanguages.length,18);assert.equal(new Set(supportedLanguages).size,18);
 for(const lang of supportedLanguages){
  assert.ok(languageNames[lang]);
  for(const [group,name]of [[dictionary,'ui'],[messageDictionary,'runtime']]){
   assert.deepEqual(Object.keys(group[lang]).sort(),Object.keys(group.en).sort(),`${name}/${lang} keys`);
   for(const [key,text]of Object.entries(group.en)){
    assert.equal(typeof group[lang][key],'string',`${name}/${lang}/${key}`);assert.ok(group[lang][key].trim());
    assert.deepEqual(placeholders(group[lang][key]),placeholders(text),`${name}/${lang}/${key} variables`);
   }
  }
 }
});
test('All 19 new voice/update labels are directly supplied in all 18 locales',()=>{
 const keys=Object.keys(featureMessagesV4.en);assert.equal(keys.length,19);
 for(const lang of supportedLanguages)for(const key of keys){assert.ok(featureMessagesV4[lang][key]?.trim());assert.equal(messageDictionary[lang][key],featureMessagesV4[lang][key]);}
});
test('The three added locales contain localized text instead of copied English paragraphs',()=>{
 const cognates={ru:new Set(),tr:new Set(['brand']),nl:new Set(['brand','openMap','winter','start'])};
 for(const lang of additional)for(const group of [dictionary,messageDictionary])for(const key of Object.keys(group.en)){
  if(cognates[lang].has(key))continue;
  assert.notEqual(group[lang][key],group.en[key],`${lang}/${key} English substitution`);
 }
 assert.match(getMessage('ru-RU','hold',{n:2}),/2/);
 assert.match(t('cameraError','nl-BE',{error:'E42'}),/E42/);
});
test('BCP 47 normalization recognizes new regions and respects explicit Chinese scripts',()=>{
 for(const [input,want]of [['ru-RU','ru'],['ru-Cyrl-RU','ru'],['tr_TR','tr'],['nl-BE','nl'],['nl-NL','nl'],['zh-Hant-CN','zh-TW'],['zh-Hans-TW','zh-CN'],['zh-SG','zh-CN'],['zh-HK','zh-TW'],['en-GB','en']])assert.equal(normalizeLanguage(input),want);
 for(const input of ['','zz-ZZ','zhgarbage'])assert.equal(normalizeLanguage(input),null);
});
test('Browser preference order and explicit stored language determine detection, without GPS',()=>{
 const oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator'),oldStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');let saved=null;
 try{
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>saved}});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{languages:['zz-ZZ','nl-BE','en-US'],language:'en-US'}});
  assert.equal(detectLanguage(),'nl');saved='tr';assert.equal(detectLanguage(),'tr');saved='auto';assert.equal(detectLanguage(),'nl');
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{languages:['ru-RU','en-US']}});assert.equal(detectLanguage(),'ru');
 }finally{if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;if(oldStorage)Object.defineProperty(globalThis,'localStorage',oldStorage);else delete globalThis.localStorage;}
});
test('18 locales cover all 13 courses, 131 moves and 24 continuation names',()=>{
 assert.equal(curricula.length,13);assert.equal(curricula.flatMap(c=>c.moves).length,131);
 assert.equal(curricula.flatMap(c=>c.moves.flatMap(m=>m.continuations||[])).length,24);
 for(const lang of supportedLanguages)for(const c of curricula){
  for(const k of ['name','description','sourceNote'])assert.ok(c[k][lang]?.trim(),`${c.id}/${k}/${lang}`);
  for(const m of c.moves){
   for(const k of ['name','benefits'])assert.ok(m[k][lang]?.trim(),`${m.id}/${k}/${lang}`);
   assert.ok(m.cues[lang]?.length>=2);assert.ok(m.cues[lang].every(x=>typeof x==='string'&&x.trim()));
   if(additional.includes(lang)){assert.notEqual(m.benefits[lang],m.benefits.en);for(const cue of m.cues[lang])assert.ok(!m.cues.en.includes(cue));}
   for(const continuation of m.continuations||[])assert.ok(continuation.name[lang]?.trim());
  }
 }
});
test('Existing 15-language curriculum and all pose geometry remain unchanged from v3',()=>{
 function strip(v){if(Array.isArray(v))return v.map(strip);if(!v||typeof v!=='object')return v;const mapped=Object.hasOwn(v,'en')&&Object.hasOwn(v,'zh');return Object.fromEntries(Object.entries(v).filter(([k])=>!mapped||!additional.includes(k)).map(([k,x])=>[k,strip(x)]));}
 const digest=createHash('sha256').update(JSON.stringify(strip(curricula))).digest('hex');
 assert.equal(digest,'c9862a31013288b1c57862acb3c3c7007ada061b7909500462e6dd33d3082313');
});
test('New curriculum cues retain virtual-sword and knee-turn limitations',()=>{
 const needles={ru:['виртуальный меч','опорное колено'],tr:['sanal kılıcını','Destek dizini'],nl:['virtuele zwaard','steunende knie']};
 const sword=curricula.find(c=>c.id==='taijisword'),turn=curricula[0].moves.find(m=>m.name.en==='Turn and heel kick, low');
 for(const lang of additional){for(const m of sword.moves)assert.ok(m.cues[lang].some(x=>x.includes(needles[lang][0])));assert.ok(turn.cues[lang].some(x=>x.includes(needles[lang][1])));}
});
