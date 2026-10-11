import test from 'node:test';
import assert from 'node:assert/strict';
import {Coach} from '../js/coach.js';

const locales = [
  {lang:'it',tag:'it-IT',name:'Italian',guide:'Guida del corso',pain:'Ho dolore al ginocchio',stop:'interrompi la pratica'},
  {lang:'id',tag:'id-ID',name:'Indonesian',guide:'Panduan latihan',pain:'Lutut saya nyeri dan saya pusing',stop:'Hentikan latihan'},
  {lang:'vi',tag:'vi-VN',name:'Vietnamese',guide:'Hướng dẫn bài tập',pain:'Tôi bị đau đầu gối và chóng mặt',stop:'hãy dừng buổi tập'},
  {lang:'th',tag:'th-TH',name:'Thai',guide:'คำแนะนำบทเรียน',pain:'ปวดเข่าและเวียนศีรษะ',stop:'ให้หยุดฝึกก่อน'},
  {lang:'ar',tag:'ar-SA',name:'Arabic',guide:'دليل التدريب',pain:'أشعر بألم في الركبة ودوخة',stop:'توقف عن التدريب'},
  {lang:'hi',tag:'hi-IN',name:'Hindi',guide:'अभ्यास मार्गदर्शिका',pain:'घुटने में दर्द है और चक्कर आ रहे हैं',stop:'अभ्यास रोक दें'}
];
for (const locale of locales) {
  test(`unloaded coach provides a complete ${locale.name} guide including default movement and cues`,async () => {
    const coach = new Coach();
    const result = await coach.ask({lang:locale.lang,score:81});
    assert.equal(result.source,'guide');
    assert.ok(result.text.startsWith(locale.guide));
    assert.ok(result.text.includes('81%'));
    assert.doesNotMatch(result.text,/this movement|Move slowly|Course guide|Watch the teacher|not a generated answer/);
    assert.ok(result.text.length>100);
  });
  test(`${locale.name} discomfort question receives its localized pause guidance`,async () => {
    const result = await new Coach().ask({lang:locale.lang,question:locale.pain});
    assert.equal(result.source,'guide');
    assert.ok(result.text.includes(locale.stop));
    assert.doesNotMatch(result.text,/Pause if you feel|Ask the in-person teacher/);
  });
  test(`${locale.tag} reaches the model with the requested language rather than English`,async () => {
    let request;
    const coach = new Coach();
    coach.runtime = {async createChatCompletion(options) {
      request = options;
      options.onData({choices:[{delta:{content:'test response'}}]});
    }};
    coach.manifest = {name:'mock-model'};
    coach.report('ready');
    const result = await coach.ask({lang:locale.tag,question:'Please explain the current movement.',move:{name:{[locale.lang]:'LOCAL_MOVE',en:'ENGLISH_MOVE'},cues:{[locale.lang]:'LOCAL_CUES',en:'ENGLISH_CUES'}}});
    assert.equal(result.source,'model');
    assert.match(request.messages[0].content,new RegExp(`Reply in ${locale.name} in two short sentences`));
    assert.doesNotMatch(request.messages[0].content,/Reply in English/);
    assert.match(request.messages[1].content,/LOCAL_MOVE/);
    assert.match(request.messages[1].content,/LOCAL_CUES/);
    assert.doesNotMatch(request.messages[1].content,/ENGLISH_MOVE|ENGLISH_CUES/);
    assert.equal(request.reasoning_format,'none');
    assert.equal(request.chat_template_kwargs.enable_thinking,false);
  });
}
test('Italian word male does not classify an English gender description as a symptom',async () => {
  const result = await new Coach().ask({lang:'en',question:'Can a male visitor follow this course?'});
  assert.ok(result.text.startsWith('Course guide'));
});
