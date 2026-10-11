import test from 'node:test';import assert from 'node:assert/strict';
import {streetViewLink,streetViewEmbedUrl,directionsLink,distanceKm,bundledByDistance,mapsLink,mapsEmbedUrl} from '../js/locations.js';
test('Street View URL identifies exact virtual position and bounded orientation',()=>{
 const u=new URL(streetViewLink({lat:22.63,lng:120.35},{heading:-90,pitch:999,fov:94.5}));
 assert.equal(u.hostname,'www.google.com');assert.equal(u.searchParams.get('api'),'1');assert.equal(u.searchParams.get('map_action'),'pano');assert.equal(u.searchParams.get('viewpoint'),'22.63,120.35');assert.equal(u.searchParams.get('heading'),'270');assert.equal(u.searchParams.get('pitch'),'90');
});
test('optional official embed needs an explicit key and valid position',()=>{
 assert.throws(()=>streetViewEmbedUrl({lat:22,lng:120},''));assert.throws(()=>streetViewLink({lat:99,lng:0}));
 const u=new URL(streetViewEmbedUrl({lat:22,lng:120},'mock-browser-key-1234567890',{lang:'zh-TW'}));assert.equal(u.pathname,'/maps/embed/v1/streetview');assert.equal(u.searchParams.get('language'),'zh-TW');
});
test('walking directions use distinct origin and destination; distance sorted catalog retains honest source',()=>{
 const u=new URL(directionsLink({lat:22.6,lng:120.3},{lat:22.7,lng:120.4},'ja'));
 assert.equal(u.searchParams.get('travelmode'),'walking');assert.notEqual(u.searchParams.get('origin'),u.searchParams.get('destination'));
 assert.equal(distanceKm({lat:22,lng:120},{lat:22,lng:120}),0);
 const list=bundledByDistance({lat:22.64,lng:120.35},20);assert.ok(list.length>0);for(let i=1;i<list.length;i++)assert.ok(list[i].distanceKm>=list[i-1].distanceKm);assert.ok(list.every(p=>p.isLiveNearby===false));
});

test('unlocated places use named map searches, never Null Island or fictional walking coordinates',()=>{
 const place={lat:null,lng:null,name:{'zh-TW':'夢裡森林公園',en:'Mengli Forest Park'}};
 assert.equal(new URL(mapsLink(place,'zh-TW')).searchParams.get('query'),'夢裡森林公園');
 assert.equal(new URL(mapsEmbedUrl(place,'en')).searchParams.get('q'),'Mengli Forest Park');
 assert.throws(()=>streetViewLink(place));assert.throws(()=>distanceKm(place,{lat:0,lng:0}));
 assert.ok(bundledByDistance({lat:22.6,lng:120.3},999).every(p=>p.lat!=null&&p.lng!=null));
});
