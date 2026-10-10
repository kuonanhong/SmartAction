/* SmartAction — self-hosted, single-thread CPU language model. MIT. */
const BASE = typeof document!=='undefined' ? new URL('./',document.baseURI) : new URL('../',import.meta.url);
const MODEL_BASE = new URL('models/', BASE);
const hex = bytes => Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join('');
const clean = (x, n = 240) => String(x ?? '').replace(/<\|[^>]*\|>/g, '').slice(0, n);
const names = {'zh-TW':'Traditional Chinese','zh-CN':'Simplified Chinese',en:'English',ja:'Japanese',ko:'Korean',es:'Spanish',fr:'French',de:'German',pt:'Portuguese'};
const messages = {
  'zh-TW': {ready:'離線生成式教練已就緒',loading:'正在驗證並載入 CPU 模型',downloading:'正在下載模型；首次約 484 MB',local:'本機 GGUF 模型',unavailable:'使用課程要領提示；尚未載入生成式模型',error:'模型未載入，仍可使用課程提示',busy:'教練正在回答，請稍候',cancelled:'已取消'},
  en: {ready:'Offline generative coach ready',loading:'Verifying and loading the CPU model',downloading:'Downloading model; first download about 484 MB',local:'Local GGUF model',unavailable:'Course guide mode; generative model not loaded',error:'Model unavailable; course guide still works',busy:'Coach is answering; please wait',cancelled:'Cancelled'}
};
function language(lang) {return String(lang || 'zh-TW').startsWith('zh') ? (lang === 'zh-CN' ? 'zh-CN' : 'zh-TW') : (names[lang] ? lang : 'en');}
function pick(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(x => pick(x, lang)).filter(Boolean).join('；');
  return pick(value[lang] || value[lang.split('-')[0]] || value.en || value['zh-TW'] || value.zh || '', lang);
}
function weatherDetails(value, lang) {
  if (!value || typeof value !== 'object') return pick(value,lang);
  const selected = Object.fromEntries(['time','weather','season','climate'].filter(key => value[key] != null).map(key => [key,pick(value[key],lang)]));
  return Object.keys(selected).length ? JSON.stringify(selected) : pick(value.name || value,lang);
}
function moveFacts(context) {
  const lang = language(context.lang), move = context.move || {}, course = context.course || {};
  return {
    lang,
    course: clean(pick(course.name || course.title || course, lang), 90),
    name: clean(pick(move.name || move.title || move.label || move, lang), 90),
    cues: clean(pick(move.cues || move.tips || move.instructions || move.notes || move.description, lang), 430),
    benefits: clean(pick(move.benefits, lang), 160),
    score: Number.isFinite(Number(context.score)) ? `${Math.round(Number(context.score))}%` : '',
    weather: clean(weatherDetails(context.weather,lang),180),
    sourceNote: clean(pick(course.sourceNote,lang),180),
    question: clean(context.question, 260),
    body:context.body?.valid?clean(JSON.stringify({type:'experimental frontal 2D camera match',score:Math.round(context.body.total),corrections:context.body.corrections?.slice(0,2),limits:'no depth, waist or safety assessment'}),300):'not measured'
  };
}
function guidedReply(context) {
  const f = moveFacts(context), zh = f.lang.startsWith('zh');
  const pain = /痛|暈|眩|受傷|疼|めまい|けが|통증|어지|부상|다친|pain|dizz|injur|dolor|mareo|lesi[oó]n|douleur|vertige|blessure/i.test(f.question);
  if (pain) {
    const advice = {
      'zh-TW':'如果有疼痛、暈眩或受傷，先停止這次練習；遊戲分數不能判定身體是否安全。可請現場老師協助，持續不適時找醫療人員評估。',
      'zh-CN':'如果有疼痛、头晕或受伤，先停止这次练习；游戏分数不能判断身体是否安全。可请现场老师协助，持续不适时找医疗人员评估。',
      en:'Pause if you feel pain, dizziness, or injury. A game score cannot determine physical safety. Ask the in-person teacher for help and seek medical assessment if symptoms persist.',
      ja:'痛み、めまい、けががある場合は練習を中止してください。ゲームの点数では体の安全を判断できません。現場の先生に相談し、不調が続く場合は医療機関で評価を受けてください。',
      ko:'통증, 어지럼증 또는 부상이 있으면 연습을 멈추세요. 게임 점수로 신체 안전을 판단할 수 없습니다. 현장 선생님에게 도움을 요청하고 증상이 계속되면 의료진의 평가를 받으세요.',
      es:'Detén la práctica si sientes dolor, mareo o una lesión. La puntuación del juego no determina la seguridad física. Pide ayuda al profesor presente y consulta a un profesional sanitario si los síntomas persisten.',
      de:'Bei Schmerzen, Schwindel oder Verletzung beende die Übung. Ein Spielwert kann körperliche Sicherheit nicht beurteilen. Bitte die Lehrkraft vor Ort um Hilfe und lass anhaltende Beschwerden medizinisch abklären.',
      pt:'Pare se sentir dor, tontura ou lesão. A pontuação do jogo não determina a segurança física. Peça ajuda ao professor e procure avaliação médica se os sintomas persistirem.',
      fr:'Arrêtez la pratique en cas de douleur, de vertige ou de blessure. Le score du jeu ne détermine pas la sécurité physique. Demandez conseil au professeur présent et consultez un professionnel de santé si les symptômes persistent.'
    };
    return advice[f.lang] || advice.en;
  }
  const name = f.name || (zh ? '目前動作' : 'this movement');
  const cues = f.cues || (zh ? '放慢速度，維持可舒適站穩的步幅；手臂放鬆，膝蓋與腳尖方向相近。' : 'Move slowly, choose a comfortable stable stance, relax your arms, and keep knees aligned with your toes.');
  const out = {
    'zh-TW': `課程提示｜${name}：${cues}${f.score ? ` 目前遊戲姿態分數 ${f.score}。` : ''} 先觀察老師的手、腳與轉腰，再分段練習。這是課程要領整理，並非生成式回答。`,
    'zh-CN': `课程提示｜${name}：${cues}${f.score ? ` 当前游戏姿态分数 ${f.score}。` : ''} 先观察老师的手、脚与转腰，再分段练习。这是课程要领整理，并非生成式回答。`,
    en: `Course guide | ${name}: ${cues}${f.score ? ` Game pose score: ${f.score}.` : ''} Watch the teacher's hands, feet and waist, then practise in stages. This is a course guide, not a generated answer.`,
    ja: `教材ガイド｜${name}：${cues} 先生の手・足・腰を観察して、ゆっくり段階的に練習します。これは教材の説明で、生成 AI の回答ではありません。`,
    ko: `수업 안내 | ${name}: ${cues} 선생님의 손, 발, 허리 움직임을 보고 천천히 나누어 연습하세요. 이것은 수업 안내이며 생성형 답변이 아닙니다.`,
    es: `Guía del curso | ${name}: ${cues} Observa manos, pies y cintura; practica por etapas. Es una guía del curso, no una respuesta generada.`,
    de: `Kursanleitung | ${name}: ${cues} Beobachte Hände, Füße und Taille und übe in Etappen. Dies ist eine Kursanleitung, keine generierte Antwort.`,
    pt: `Guia do curso | ${name}: ${cues} Observe mãos, pés e cintura e pratique por etapas. Este é um guia do curso, não uma resposta gerada.`,
    fr: `Guide du cours | ${name} : ${cues} Observez les mains, les pieds et la taille, puis pratiquez par étapes. Ceci est un guide, pas une réponse générée.`
  };
  return out[f.lang] || out.en;
}
async function hashBlob(blob) {
  if (!globalThis.crypto?.subtle) throw new Error('SECURE_CONTEXT_REQUIRED');
  return hex(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()));
}
async function validatePart(blob, part) {
  if (!blob || blob.size !== part.bytes) throw new Error(`MODEL_SIZE_MISMATCH:${part.file}`);
  if (await hashBlob(blob) !== part.sha256) throw new Error(`MODEL_SHA256_MISMATCH:${part.file}`);
  return blob;
}
function dbOpen() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('MODEL_CACHE_UNAVAILABLE'));
    const request = indexedDB.open('SmartAction-models-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('parts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function cachedPart(key, blob) {
  const db = await dbOpen();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('parts', blob ? 'readwrite' : 'readonly');
      const store = transaction.objectStore('parts');
      const request = blob ? store.put(blob, key) : store.get(key);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => resolve(blob || request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('MODEL_CACHE_WRITE_FAILED'));
    });
  } finally {db.close();}
}
export class Coach {
  constructor({onStatus = () => {}, onToken = () => {}} = {}) {
    this.onStatus = onStatus; this.onToken = onToken;
    this.runtime = null; this.controller = null; this.operation = null; this.manifest = null; this.lang = 'zh-TW';
    this._status = {code:'unavailable',ready:false,model:'Qwen3-0.6B Q4_K_M',backend:'wasm-cpu',threads:1,gpu:false};
  }
  get status() {return {...this._status};}
  report(code, extra = {}) {
    this._status = {...this._status,...extra,code,ready:code === 'ready'};
    this.onStatus({...this._status,message:messages[this.lang]?.[code] || messages.en[code] || code});
  }
  async getManifest() {
    if (this.manifest) return this.manifest;
    const response = await fetch(new URL('manifest.json', MODEL_BASE));
    if (!response.ok) throw new Error('MODEL_MANIFEST_MISSING');
    const manifest = await response.json();
    if (!manifest.parts?.length || manifest.parts.reduce((s,p) => s+p.bytes,0) !== manifest.bytes) throw new Error('MODEL_MANIFEST_INVALID');
    this.manifest = manifest;return manifest;
  }
  key(part) {return `${this.manifest.sha256}:${part.file}`;}
  assertEnvironment() {
    if (globalThis.location?.protocol === 'file:') throw new Error('LOCAL_HTTP_REQUIRED');
    if (!globalThis.WebAssembly) throw new Error('WEBASSEMBLY_UNAVAILABLE');
    if (!globalThis.isSecureContext || !globalThis.crypto?.subtle) throw new Error('SECURE_CONTEXT_REQUIRED');
    // Match the shipped runtime's feature checks before its async constructor check.
    if (!WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,8,1,6,0,6,64,25,11,11]))) throw new Error('WASM_EXCEPTION_HANDLING_REQUIRED');
    if (!WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]))) throw new Error('WASM_SIMD_REQUIRED');
  }
  async operationRun(fn) {
    if (this.operation || this.controller) throw new Error('COACH_BUSY');
    this.assertEnvironment();
    this.controller = new AbortController();
    this.operation = fn().catch(error => {
      this.report(error.name === 'AbortError' ? 'unavailable' : 'error',{error:clean(error.message,250)});
      throw error;
    }).finally(() => {this.operation = null;this.controller = null;});
    return this.operation;
  }
  async initialise(blobs) {
    if (this.controller.signal.aborted) throw new DOMException('Cancelled','AbortError');
    this.report('loading',{progress:1});
    if (this.runtime) {await this.runtime.exit();this.runtime = null;}
    const {Wllama} = await import(new URL('vendor/wllama/main/esm/index.js',BASE));
    const runtime = new Wllama({default:new URL('vendor/wllama/main/esm/wasm/wllama.wasm',BASE).href},{suppressNativeLog:true,logger:{debug(){},log(){},warn(...x){console.warn(...x)},error(...x){console.error(...x)}}});
    runtime.setCompat({wasm:new URL('vendor/wllama/compat/wasm/wllama.wasm',BASE).href,worker:new URL('vendor/wllama/compat/wasm/wllama.js',BASE).href},'firefox_safari');
    // Parts are ordinary byte segments, not independently valid GGUF shards.
    try {
      await runtime.loadModel([new Blob(blobs)],{n_ctx:1024,n_batch:64,n_ubatch:64,n_threads:1,n_gpu_layers:0,offload_kqv:false,no_kv_offload:true,n_parallel:1,jinja:true,warmup:false,seed:42,ctx_shift:true,reasoning:false});
    } catch (error) {try {await runtime.exit();} catch {}throw error;}
    if (this.controller.signal.aborted) {await runtime.exit();throw new DOMException('Cancelled','AbortError');}
    this.runtime = runtime;
    this.report('ready',{progress:1,error:null,runtimeVersion:'3.8.1',libllama:Wllama.getLibllamaVersion()});
    return this.status;
  }
  async loadLocalFile(file) {
    return this.operationRun(async () => {
      const manifest = await this.getManifest();
      if (!file || file.size !== manifest.bytes) throw new Error(`EXPECTED_QWEN3_Q4KM_FILE:${manifest.filename}`);
      this.report('local',{filename:clean(file.name,100)});
      const blobs = [];
      for (const part of manifest.parts) {
        if (this.controller.signal.aborted) throw new DOMException('Cancelled','AbortError');
        blobs.push(await validatePart(file.slice(part.offset,part.offset+part.bytes),part));
        this.report('loading',{progress:(part.offset+part.bytes)/manifest.bytes});
      }
      return this.initialise(blobs);
    });
  }
  async loadBundled() {
    if (this.runtime && this.status.ready) return this.status;
    return this.operationRun(async () => {
      const manifest = await this.getManifest(), blobs = [];
      this.report('loading',{progress:0});
      for (const part of manifest.parts) {
        let blob;
        try {blob = await cachedPart(this.key(part));} catch { /* Private browsing may disallow persistent storage. */ }
        if (!blob) {
          const response = await fetch(new URL(part.file,MODEL_BASE),{signal:this.controller.signal});
          if (!response.ok) throw new Error(`MODEL_PART_MISSING:${part.file}`);
          blob = await response.blob();
        }
        blobs.push(await validatePart(blob,part));
        this.report('loading',{progress:(part.offset+part.bytes)/manifest.bytes});
      }
      return this.initialise(blobs);
    });
  }
  async download() {
    return this.operationRun(async () => {
      const manifest = await this.getManifest();
      this.report('downloading',{progress:0});
      // The user explicitly presses download. Questions are never sent to this host.
      const response = await fetch(manifest.url,{signal:this.controller.signal});
      if (!response.ok || !response.body) throw new Error(`MODEL_DOWNLOAD_FAILED:${response.status}`);
      const reader = response.body.getReader();
      let index = 0, at = 0, loaded = 0, buffer = new Uint8Array(manifest.parts[0].bytes);
      const blobs = [];let cacheWorks = true;
      while (true) {
        const {value,done} = await reader.read();if (done) break;
        let readAt = 0;
        while (readAt < value.length) {
          if (index >= manifest.parts.length) {await reader.cancel();throw new Error('MODEL_DOWNLOAD_TOO_LARGE');}
          const n = Math.min(value.length-readAt,buffer.length-at);
          buffer.set(value.subarray(readAt,readAt+n),at);readAt += n;at += n;loaded += n;
          if (at === buffer.length) {
            const part = manifest.parts[index], blob = await validatePart(new Blob([buffer]),part);
            blobs.push(blob);
            if (cacheWorks) try {await cachedPart(this.key(part),blob);} catch {cacheWorks = false;}
            index++;at = 0;
            if (index < manifest.parts.length) buffer = new Uint8Array(manifest.parts[index].bytes);
          }
        }
        this.report('downloading',{progress:loaded/manifest.bytes,persisted:cacheWorks});
      }
      if (loaded !== manifest.bytes || index !== manifest.parts.length) throw new Error('MODEL_DOWNLOAD_INCOMPLETE');
      this._status.persisted = cacheWorks;
      return this.initialise(blobs);
    });
  }
  async ask(context = {}) {
    this.lang = language(context.lang);
    if (!this.runtime || !this.status.ready) {
      const text = guidedReply(context);this.onToken(text);
      if (!this.operation) this.report('unavailable');
      return {text,source:'guide'};
    }
    if (this.controller) throw new Error('COACH_BUSY');
    const f = moveFacts(context);
    if (!f.question.trim()) return {text:guidedReply(context),source:'guide'};
    this.controller = new AbortController();
    let raw = '', text = '';
    try {
      const system = f.lang.startsWith('zh') ?
        `你是聰動練拳遊戲的助教。以${f.lang === 'zh-CN' ? '簡體' : '繁體'}中文短答兩句，僅依本回合教材解釋動作。遊戲招式是示意，沒有老師核定，切勿宣稱標準傳承。Game score是虛擬角色姿態。Camera只在提供量測時代表粗略正面2D手腳比對，不能判定深度、腰轉或安全性；未量測時不得聲稱看到玩家。不可診斷、治病、捏造動作。若教材沒有答案，直接說無法確認並請現場老師協助。不要思考過程。/no_think` :
        `You are the SmartAction practice-game assistant. Reply in ${names[f.lang]} in two short sentences using only this turn's course guide. Motions are illustrative and not teacher-certified lineage instruction. Game score measures avatars. Camera data, only if supplied, measures coarse frontal 2D wrist/ankle matching, not depth, waist or safety. Never claim to see a user without camera data. Do not diagnose, promise treatment or invent techniques. If facts are missing, say so and suggest the in-person teacher. No reasoning trace. /no_think`;
      const user = `Course: ${clean(f.course,25)}. Source: ${clean(f.sourceNote,35)}. Move: ${clean(f.name,25)}. Guide: ${clean(f.cues,100)}. Benefits: ${clean(f.benefits,40)}. Game score: ${f.score}. Environment: ${f.weather}. Camera: ${f.body}. Question: ${clean(f.question,120)} /no_think`;
      await this.runtime.createChatCompletion({messages:[{role:'system',content:system},{role:'user',content:user}],chat_template_kwargs:{enable_thinking:false},reasoning_format:'none',max_tokens:140,temperature:0.7,top_k:20,top_p:0.8,min_p:0,presence_penalty:1.5,seed:42,cache_prompt:true,abortSignal:this.controller.signal,stream:true,onData:chunk => {
        raw += chunk.choices?.[0]?.delta?.content || '';
        text = raw.replace(/<think>[\s\S]*?<\/think>/g,'').replace(/<think>[\s\S]*$/g,'').replace(/<\|[^>]*\|>/g,'').trim();
        this.onToken(text);
      }});
      if (!text) throw new Error('MODEL_EMPTY_REPLY');
      return {text,source:'model',model:this.manifest.name};
    } finally {this.controller = null;}
  }
  abort() {this.controller?.abort();}
}
