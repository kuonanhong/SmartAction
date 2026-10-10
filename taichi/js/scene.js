import * as THREE from '../vendor/three.module.js';

/* Three.js r169, MIT. Geometric teaching avatars; not motion-capture or a
   geographically measured digital twin. All runtime dependencies are local. */
const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n) || 0));
const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const DEFAULT_POSE = { hands: { left: [-.42, 1.18, .24], right: [.42, 1.18, .24] }, feet: { left: [-.19, .075, 0], right: [.19, .075, 0] }, waist: 0, crouch: 0, stretch: 0 };
const clonePose = (p = DEFAULT_POSE) => ({
  hands: { left: [...(p.hands?.left || DEFAULT_POSE.hands.left)], right: [...(p.hands?.right || DEFAULT_POSE.hands.right)] },
  feet: { left: [...(p.feet?.left || DEFAULT_POSE.feet.left)], right: [...(p.feet?.right || DEFAULT_POSE.feet.right)] },
  waist: clamp(p.waist, -1.2, 1.2), crouch: clamp(p.crouch, 0, .45), stretch: clamp(p.stretch, 0, .2)
});
const vec = (a) => new THREE.Vector3(Number(a[0]) || 0, Number(a[1]) || 0, Number(a[2]) || 0);
const sphereGeo = new THREE.SphereGeometry(1, 16, 12);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 12);
const coneGeo = new THREE.CylinderGeometry(.77, 1, 1, 16);
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

function material(color, extra = {}) { return new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...extra }); }
function ellipsoid(parent, mat, pos, size, geo = sphereGeo) {
  const mesh = new THREE.Mesh(geo, mat); mesh.position.set(...pos); mesh.scale.set(...size);
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function segment(parent, mat, radius) {
  const mesh = new THREE.Mesh(coneGeo, mat); mesh.userData.radius = radius; mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function placeSegment(mesh, a, b, radius = mesh.userData.radius) {
  const d = new THREE.Vector3().subVectors(b, a);
  mesh.position.copy(a).add(b).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(UP, d.clone().normalize());
  mesh.scale.set(radius, Math.max(.001, d.length()), radius);
}
/** Two-bone IK with an explicit bend direction, so knees and elbows remain humanlike. */
function elbowPoint(a, target, l1, l2, pole) {
  const d = new THREE.Vector3().subVectors(target, a), originalLength = d.length();
  const distance = Math.max(.03, Math.min(originalLength, l1 + l2 - .000001));
  const forward = d.clone().normalize(); if (!originalLength) forward.set(0, -1, 0);
  const projection = clamp((l1*l1 + distance*distance - l2*l2) / (2 * distance), -l1, l1);
  const height = Math.sqrt(Math.max(0, l1*l1 - projection*projection));
  const bend = pole.clone().addScaledVector(forward, -pole.dot(forward)).normalize();
  if (bend.lengthSq() < .001) bend.set(0, 0, 1);
  return a.clone().addScaledVector(forward, projection).addScaledVector(bend, height);
}

class Practitioner {
  constructor({ color = '#286e61', skin = '#d4a17c', hair = '#272220', build = 1, height = 1, female = false, elder = false, accent = '#bcd1ad' } = {}) {
    this.details = []; this.root = new THREE.Group(); this.root.scale.setScalar(height); this.height = height;
    this.upper = new THREE.Group(); this.root.add(this.upper);
    this.skin = material(skin); this.cloth = material(color); this.hair = material(hair);
    this.trim = material(accent); this.shoeMat = material('#273332'); this.eyeMat = material('#221e1d'); this.white = material('#eee8dc');
    this.body = ellipsoid(this.upper, this.cloth, [0, 1.36, 0], [.265 * build, .35, .185]);
    this.hem = ellipsoid(this.upper, this.cloth, [0, 1.105, 0], [.267 * build, .135, .188], cylinderGeo);
    this.seam = ellipsoid(this.upper, this.trim, [.063, 1.39, .181], [.006, .28, .005], boxGeo);
    this.collar = ellipsoid(this.upper, this.trim, [0, 1.672, .008], [.083, .046, .075], cylinderGeo);
    this.neck = ellipsoid(this.upper, this.skin, [0, 1.711, 0], [.062, .085, .064], cylinderGeo);
    for (let i = 0; i < 5; i++) {
      this.details.push(ellipsoid(this.upper, this.trim, [.075, 1.60 - i*.105, .18], [.017, .007, .007], boxGeo));
      this.details.push(ellipsoid(this.upper, this.trim, [.095, 1.60 - i*.105, .182], [.006, .009, .01]));
    }
    this.head = new THREE.Group(); this.head.position.set(0, 1.866, .005); this.upper.add(this.head);
    ellipsoid(this.head, this.skin, [0, 0, 0], [.133, .174, .12]);
    ellipsoid(this.head, this.skin, [-.133, -.006, -.006], [.028, .046, .023]);
    ellipsoid(this.head, this.skin, [.133, -.006, -.006], [.028, .046, .023]);
    for (const x of [-.048, .048]) {
      ellipsoid(this.head, this.white, [x, .027, .106], [.025, .01, .008]);
      ellipsoid(this.head, this.eyeMat, [x, .027, .112], [.008, .009, .004]);
      const brow = ellipsoid(this.head, this.hair, [x, .059, .106], [.029, .004, .005], boxGeo); brow.rotation.z = x < 0 ? .12 : -.12;
    }
    ellipsoid(this.head, this.skin, [0, -.005, .12], [.021, .044, .029]);
    this.mouth = ellipsoid(this.head, material(elder ? '#9e6358' : '#b97868'), [0, -.062, .107], [.033, .006, .006]);
    const capGeo = new THREE.SphereGeometry(1, 16, 10, 0, TAU, 0, Math.PI*.50);
    ellipsoid(this.head, this.hair, [0, .019, -.012], [.137, .167, .127], capGeo);
    ellipsoid(this.head, this.hair, [-.116, .052, -.043], [.034, .083, .085]);
    ellipsoid(this.head, this.hair, [.116, .052, -.043], [.034, .083, .085]);
    if (female) { ellipsoid(this.head, this.hair, [0, .042, -.126], [.097, .10, .063]); ellipsoid(this.head, this.hair, [0, -.087, -.135], [.055, .13, .055]); }
    if (elder) {
      for (const x of [-.047, .047]) { const wrinkle = ellipsoid(this.head, material('#aa836c'), [x, .004, .113], [.031, .0013, .002], boxGeo); wrinkle.rotation.z = x < 0 ? -.05 : .05; }
    }
    this.hips = ellipsoid(this.root, this.cloth, [0, 1.025, 0], [.218*build, .13, .164]);
    this.arms = {}; this.legs = {}; this.handGroups = {}; this.footGroups = {};
    for (const side of ['left','right']) {
      const sign = side === 'left' ? -1 : 1;
      const arm = { shoulder: new THREE.Vector3(sign*.245*build, 1.575, 0), upper: segment(this.upper, this.cloth, .084*build), lower: segment(this.upper, this.cloth, .067*build), joint: ellipsoid(this.upper, this.cloth, [0,0,0], [.078,.078,.078]) };
      this.arms[side] = arm;
      const palm = new THREE.Group(); this.upper.add(palm); this.handGroups[side] = palm;
      ellipsoid(palm, this.skin, [0, 0, 0], [.037, .063, .023]);
      for (let j=0;j<4;j++) { const finger = ellipsoid(palm, this.skin, [-.026 + j*.017, -.065 - (j===0||j===3 ? -.008:0), 0], [.008, .034, .009], cylinderGeo); finger.rotation.z = (j-1.5)*.07; this.details.push(finger); }
      const thumb = ellipsoid(palm, this.skin, [sign*.043, -.009, .004], [.010, .035, .010], cylinderGeo); thumb.rotation.z = sign*-.6; this.details.push(thumb);
      const leg = { hip: new THREE.Vector3(sign*.13*build, 1.045, 0), thigh: segment(this.root, this.cloth, .111*build), shin: segment(this.root, this.cloth, .087*build), joint: ellipsoid(this.root, this.cloth, [0,0,0], [.105,.105,.105]) };
      this.legs[side] = leg;
      const foot = new THREE.Group(); this.root.add(foot); this.footGroups[side] = foot;
      ellipsoid(foot, this.shoeMat, [0, -.025, .055], [.074, .048, .145]);
      ellipsoid(foot, this.white, [0, -.061, .053], [.075, .009, .139], boxGeo);
    }
    this.sword = new THREE.Group(); this.sword.visible = false; this.sword.rotation.x=Math.PI/2;this.handGroups.right.add(this.sword);
    const bladeMat=material('#d7e5e5',{metalness:.75,roughness:.28}),handleMat=material('#775840'),guardMat=material('#baad75',{metalness:.6,roughness:.38});
    ellipsoid(this.sword,handleMat,[0,.028,0],[.022,.12,.022],cylinderGeo);
    ellipsoid(this.sword,guardMat,[0,.10,0],[.17,.019,.025],boxGeo);
    ellipsoid(this.sword,bladeMat,[0,.43,0],[.042,.65,.011],boxGeo);
    const tip=new THREE.Mesh(new THREE.ConeGeometry(.025,.11,3),bladeMat);tip.position.set(0,.81,0);tip.scale.z=.3;this.sword.add(tip);
    this.pose = clonePose(); this.apply(this.pose);
  }
  apply(pose, breath = 0) {
    const p = clonePose(pose); this.pose = p;
    const lift = p.stretch - p.crouch, bodyOffset = new THREE.Vector3(0, -p.crouch, 0);
    this.upper.position.y = lift + breath; this.upper.rotation.y = p.waist;
    this.upper.rotation.z = 0;
    this.hips.position.y = 1.025 - p.crouch;
    this.head.rotation.y = clamp(-p.waist*.35, -.28, .28);
    for (const side of ['left','right']) {
      const sign = side === 'left' ? -1 : 1, arm = this.arms[side];
      const hand = vec(p.hands[side]); hand.x = clamp(hand.x, -1.15, 1.15); hand.y = clamp(hand.y, .35, 2.25) - lift; hand.z = clamp(hand.z, -.7, 1.0);
      hand.sub(arm.shoulder).clampLength(.03,.674).add(arm.shoulder);
      const elbow = elbowPoint(arm.shoulder, hand, .34, .335, new THREE.Vector3(sign*.3, -.75, -.6));
      placeSegment(arm.upper, arm.shoulder, elbow); placeSegment(arm.lower, elbow, hand); arm.joint.position.copy(elbow);
      this.handGroups[side].position.copy(hand); this.handGroups[side].rotation.set(-.22 - hand.z*.38, sign*.18, sign*.10 + p.waist*.08);
      const leg = this.legs[side], hip = leg.hip.clone().add(bodyOffset), foot = vec(p.feet[side]);
      foot.x = clamp(foot.x, -.9, .9); foot.y = clamp(foot.y, 0, .95)+.075; foot.z = clamp(foot.z, -.9, .9);
      foot.sub(hip).clampLength(.04,.979).add(hip);
      const knee = elbowPoint(hip, foot, .495, .485, new THREE.Vector3(sign*.05, .03, 1));
      placeSegment(leg.thigh, hip, knee); placeSegment(leg.shin, knee, foot); leg.joint.position.copy(knee);
      this.footGroups[side].position.copy(foot); this.footGroups[side].rotation.y = sign*.12 + p.waist*.12;
    }
  }
}

/** Static, no-build renderer API. render() receives seconds, not milliseconds. */
export class TrainingScene {
  constructor(canvas, { onReady, onError } = {}) {
    this.canvas = canvas; this.disposed = false; this.mode = 'follow'; this.cameraMode = 'third'; this.quality = matchMedia('(max-width: 800px)').matches ? 'low' : 'high';
    this.environment = { time: 'morning', weather: 'clear', season: 'summer', climate: 'tropical' };
    this.playerPose = clonePose(); this.teacherPose = clonePose(); this.targetPose = clonePose(); this.teacherHistory = [];
    this.combatState = { playerHealth: 100, opponentHealth: 100, playerAttack: 0, opponentAttack: 0 }; this.classmatesEnabled = true; this.photoURL = ''; this.location = { name: '衛武營榕園' }; this.orbit = { azimuth: .46, elevation: .30, radius: 8.3 }; this.listeners = [];
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
      this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.1;
      this.renderer.shadowMap.enabled = this.quality === 'high'; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#b7d4db'); this.scene.fog = new THREE.Fog('#c6dfd8', 15, 50);
      this.camera = new THREE.PerspectiveCamera(45, 1, .06, 110);
      this.ambient = new THREE.HemisphereLight('#e4f4fc', '#65734c', 2.1); this.scene.add(this.ambient);
      this.sun = new THREE.DirectionalLight('#fff1d1', 3.0); this.sun.position.set(-5,10,5); this.sun.castShadow = true; this.sun.shadow.mapSize.set(1024,1024); this.sun.shadow.camera.left=-9; this.sun.shadow.camera.right=9; this.sun.shadow.camera.top=9; this.sun.shadow.camera.bottom=-9; this.sun.shadow.normalBias=.03; this.sun.shadow.bias=-.0001; this.scene.add(this.sun);
      this.fill = new THREE.DirectionalLight('#b7e4f7', .6); this.fill.position.set(5,5,-6); this.scene.add(this.fill);
      this._makeGround(); this._makeEnvironment(); this._makeClass(); this._makeTarget(); this._makeWeather(); this._installOrbit(); this.setQuality(this.quality);
      this._contextLost = (event) => { event.preventDefault(); this.contextLost = true; onError?.(new Error('WebGL context lost; please reload the scene.')); };
      this._contextRestored = () => { this.contextLost = false; this.resize(); };
      this._listen(canvas, 'webglcontextlost', this._contextLost); this._listen(canvas, 'webglcontextrestored', this._contextRestored);
      this.resize(); this.setEnvironment(this.environment); this.setCamera('third'); this.render(0,0); queueMicrotask(() => onReady?.(this));
    } catch (error) {
      onError?.(error); this.fallback = true;
      // A fresh canvas is necessary after a failed WebGL context acquisition.
      const replacement = canvas.cloneNode(false);
      canvas.replaceWith(replacement); this.canvas = replacement; this.ctx = replacement.getContext('2d'); this.resize(); this.render(0,0); queueMicrotask(() => onReady?.(this));
    }
  }
  _listen(el, name, fn, options) { el.addEventListener(name, fn, options); this.listeners.push(() => el.removeEventListener(name, fn, options)); }
  _makeGround() {
    const c = document.createElement('canvas'); c.width=512; c.height=512; const x=c.getContext('2d');
    x.fillStyle='#a6a99c'; x.fillRect(0,0,512,512);
    for(let i=0;i<1000;i++){const n=(i*197)%512,m=(i*73)%512; x.fillStyle=i%2?'rgba(255,255,255,.08)':'rgba(22,44,32,.06)';x.fillRect(n,m,3,2);}
    x.strokeStyle='#8c9287';x.lineWidth=3;for(let i=0;i<512;i+=128){x.beginPath();x.moveTo(i,0);x.lineTo(i,512);x.moveTo(0,i);x.lineTo(512,i);x.stroke();}
    const texture = new THREE.CanvasTexture(c); texture.wrapS=texture.wrapT=THREE.RepeatWrapping; texture.repeat.set(8,8); texture.colorSpace=THREE.SRGBColorSpace;
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(40,40), material('#ffffff',{map:texture})); this.ground.rotation.x=-Math.PI/2; this.ground.receiveShadow=true; this.scene.add(this.ground);
    this.grass = new THREE.Mesh(new THREE.CircleGeometry(23,48), material('#68845a'));this.grass.rotation.x=-Math.PI/2;this.grass.position.y=-.015;this.scene.add(this.grass);
    const edge = new THREE.Mesh(new THREE.RingGeometry(8.5,9.1,64), material('#b7b49d')); edge.rotation.x=-Math.PI/2; edge.position.y=.005; this.scene.add(edge);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(.48,40), material('#61c5a9',{transparent:true,opacity:.16,depthWrite:false}));pad.rotation.x=-Math.PI/2;pad.position.set(0,.012,1.0);this.scene.add(pad);this.playerPad=pad;
    const ring = new THREE.Mesh(new THREE.RingGeometry(.45,.48,48), material('#87e5cb',{transparent:true,opacity:.7}));ring.rotation.x=-Math.PI/2;ring.position.copy(pad.position);this.scene.add(ring);this.playerRing=ring;
  }
  _makeEnvironment() {
    this.treeGroup=new THREE.Group(); this.scene.add(this.treeGroup); this.leafMaterials=[]; this.treeRoots=[];
    const trunkMat=material('#665b45'); const rootMat=material('#80715a');
    for (const [tx,tz,scale] of [[-7,-4,1.35],[7,-5,1.45],[-9,3,1.05],[8,4,1.10]]) {
      const tree=new THREE.Group();tree.position.set(tx,0,tz);tree.scale.setScalar(scale);this.treeGroup.add(tree);
      ellipsoid(tree,trunkMat,[0,1.55,0],[.44,3.1,.37],cylinderGeo);
      for (const [ex,ey,ez] of [[-1.7,3.7,0],[1.8,3.9,.3],[.2,4.2,-1.4]]) {
        const branch=segment(tree,trunkMat,.15);placeSegment(branch,new THREE.Vector3(0,2.15,0),new THREE.Vector3(ex,ey,ez));
      }
      const leafMat=material('#3e6d45');this.leafMaterials.push(leafMat);
      for (const [x,y,z,s] of [[0,4.35,0,2.5],[-1.8,4.1,.2,1.85],[1.75,4.55,.2,2.1],[.2,4.65,-1.45,2.05],[.6,4.0,1.75,1.8]]) ellipsoid(tree,leafMat,[x,y,z],[s,.76*s,s]);
      for (let j=0;j<8;j++){const a=j/8*TAU;const root=segment(tree,rootMat,.073);placeSegment(root,new THREE.Vector3(Math.cos(a)*.28,.75,Math.sin(a)*.28),new THREE.Vector3(Math.cos(a)*1.05,.04,Math.sin(a)*1.05));}
      for (let j=0;j<5;j++){const a=j/5*TAU;const aerial=segment(tree,rootMat,.022);placeSegment(aerial,new THREE.Vector3(Math.cos(a)*1.3,3.8,Math.sin(a)*1.1),new THREE.Vector3(Math.cos(a)*1.3,.15,Math.sin(a)*1.1));}
    }
    const benchMat=material('#8e7760'), metal=material('#48564f');
    for(const bx of [-5.1,5.4]){const bench=new THREE.Group();bench.position.set(bx,0,-5);this.scene.add(bench);ellipsoid(bench,benchMat,[0,.52,0],[1.35,.09,.45],boxGeo);ellipsoid(bench,benchMat,[0,.85,-.2],[1.35,.52,.065],boxGeo);for(const x of [-.48,.48])ellipsoid(bench,metal,[x,.26,0],[.09,.50,.40],boxGeo);}
    this.photoMaterial = new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,toneMapped:false});
    this.photoPlane = new THREE.Mesh(new THREE.PlaneGeometry(37,18),this.photoMaterial);this.photoPlane.position.set(0,7,-16);this.scene.add(this.photoPlane);
    this.photoShade = new THREE.Mesh(new THREE.PlaneGeometry(37,18),new THREE.MeshBasicMaterial({color:'#a5c7b2',transparent:true,opacity:.08,depthWrite:false}));this.photoShade.position.set(0,7,-15.98);this.scene.add(this.photoShade);
  }
  _makeClass() {
    // Learners face -Z toward the teacher. Mirror X together with the 180-degree
    // turn so raw x<0 continues to mean screen-left in the three default views;
    // +Z still steps toward the teacher. The teacher presents a mirror example.
    // The same reflection on the target group keeps scoring markers aligned.
    this.teacher = new Practitioner({ color:'#eee7d5',skin:'#ca9f7f',hair:'#deded5',build:.94,height:1.04,elder:true,accent:'#b8946b' });this.teacher.root.position.set(0,0,-2.7);this.scene.add(this.teacher.root);
    this.player = new Practitioner({color:'#267569',skin:'#d5a07d',hair:'#252a27',build:.98,height:1,accent:'#b9cdb0'});this.player.root.position.set(0,0,1);this.player.root.rotation.y=Math.PI;this.player.root.scale.x=-this.player.height;this.scene.add(this.player.root);
    const configs=[
      {color:'#8a666d',skin:'#d5ad8e',hair:'#444037',build:.90,height:.94,female:true},
      {color:'#3e6487',skin:'#ae8066',hair:'#1f2427',build:1.25,height:1.10},
      {color:'#c5a56d',skin:'#e0b292',hair:'#bbb9b3',build:1.04,height:.97,elder:true},
      {color:'#698879',skin:'#7e5444',hair:'#292322',build:1.12,height:1.02,female:true},
      {color:'#796b96',skin:'#d1a184',hair:'#312c29',build:.80,height:.84},
      {color:'#597d8b',skin:'#c69d81',hair:'#bbb7ac',build:.98,height:1.01,female:true,elder:true}
    ];
    this.classmates=configs.map((cfg,i)=>{const c=new Practitioner(cfg);c.root.position.set(i%2===0 ? -2.15-(i>3?.22:0) : 2.15+(i>3?.22:0),0,[-.8,-.8,1.1,1.1,3.0,3.0][i]);c.root.rotation.y=Math.PI;c.root.scale.x=-c.height;this.scene.add(c.root);return c;});
    this.classmates.forEach((c,i)=>{c.phase=i*.72;});
  }
  _makeTarget() {
    this.targets=new THREE.Group();this.targets.position.copy(this.player.root.position);this.targets.rotation.y=Math.PI;this.targets.scale.x=-1;this.scene.add(this.targets);
    this.handTargets={};this.footTargets={};const mat=new THREE.MeshBasicMaterial({color:'#a5ffe7',transparent:true,opacity:.65,depthTest:true});
    for(const side of ['left','right']) {
      const h=new THREE.Mesh(new THREE.SphereGeometry(.066,12,8),mat);this.targets.add(h);this.handTargets[side]=h;
      const f=new THREE.Mesh(new THREE.TorusGeometry(.095,.013,6,20),mat);f.rotation.x=Math.PI/2;this.targets.add(f);this.footTargets[side]=f;
    }
    const lineMat=new THREE.LineDashedMaterial({color:'#8fe9d8',dashSize:.08,gapSize:.05,transparent:true,opacity:.55});
    this.targetLines={};for(const side of ['left','right']){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const line=new THREE.Line(geo,lineMat);this.targets.add(line);this.targetLines[side]=line;}
  }
  _makeWeather() {
    this.particleCount=340;const positions=new Float32Array(this.particleCount*3);this.particleSpeeds=[];
    for(let i=0;i<this.particleCount;i++){positions[i*3]=((i*17.13)%20)-10;positions[i*3+1]=(i*.819)%12;positions[i*3+2]=((i*13.07)%19)-9;this.particleSpeeds.push(.7+(i%10)/10);}
    this.weatherGeo=new THREE.BufferGeometry();this.weatherGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
    this.weatherMat=new THREE.PointsMaterial({color:'#c8e4f7',size:.045,transparent:true,opacity:.65,sizeAttenuation:true,depthWrite:false});this.weatherPoints=new THREE.Points(this.weatherGeo,this.weatherMat);this.weatherPoints.frustumCulled=false;this.scene.add(this.weatherPoints);
  }
  _installOrbit() {
    let active=false,lastX=0,lastY=0;
    this._listen(this.canvas,'pointerdown',e=>{if(e.button!==0||this.cameraMode!=='third')return;active=true;lastX=e.clientX;lastY=e.clientY;this.canvas.setPointerCapture?.(e.pointerId);});
    this._listen(this.canvas,'pointermove',e=>{if(!active)return;this.orbit.azimuth-=(e.clientX-lastX)*.005;this.orbit.elevation=clamp(this.orbit.elevation+(e.clientY-lastY)*.003,.1,.75);lastX=e.clientX;lastY=e.clientY;this._positionCamera();});
    this._listen(this.canvas,'pointerup',()=>{active=false;});this._listen(this.canvas,'pointercancel',()=>{active=false;});
    this._listen(this.canvas,'wheel',e=>{if(this.cameraMode!=='third')return;e.preventDefault();this.orbit.radius=clamp(this.orbit.radius+e.deltaY*.007,4.8,13);this._positionCamera();},{passive:false});
  }
  setLocation(location={}) {
    this.location={...location};const photo=typeof location.photo==='string'?location.photo:(location.photo?.url||location.photo?.src||location.image||'');this.photoURL=photo;
    if(this.fallback){this.fallbackPhoto=null;if(photo){const img=new Image();img.onload=()=>{if(this.photoURL===photo)this.fallbackPhoto=img;};img.src=photo;}return;}
    if(!photo){this.photoMaterial.opacity=0;this.photoMaterial.map?.dispose();this.photoMaterial.map=null;this.photoMaterial.needsUpdate=true;this.photoGeneration=(this.photoGeneration||0)+1;return;}
    const generation = (this.photoGeneration || 0)+1;this.photoGeneration=generation;
    new THREE.TextureLoader().load(photo,texture=>{if(this.disposed||this.photoGeneration!==generation){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;const aspect=(texture.image?.width||1)/(texture.image?.height||1),panelAspect=37/18;if(aspect>panelAspect){texture.repeat.x=panelAspect/aspect;texture.offset.x=(1-texture.repeat.x)/2;}else{texture.repeat.y=aspect/panelAspect;texture.offset.y=(1-texture.repeat.y)/2;}texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());this.photoMaterial.map?.dispose();this.photoMaterial.map=texture;this.photoMaterial.opacity=.93;this.photoMaterial.needsUpdate=true;},undefined,()=>{if(this.photoGeneration===generation)this.photoMaterial.opacity=0;});
  }
  setEnvironment(value={}) {
    this.environment={...this.environment,...value};if(this.fallback)return;const e=this.environment;
    const themes={morning:['#bcdedc','#fff0ce',2.7,1.14],noon:['#badcee','#fff6e7',3.6,1.1],sunset:['#d7a998','#ffd0a0',1.75,1.02],night:['#192638','#a6b9e4',.45,.82]};const theme=themes[e.time]||themes.morning;
    this.scene.background.set(theme[0]);this.scene.fog.color.set(theme[0]);this.sun.color.set(theme[1]);this.sun.intensity=theme[2];this.renderer.toneMappingExposure=theme[3];this.ambient.intensity=e.time==='night'?.8:1.8;
    this.sun.position.set(e.time==='sunset'?-8:-5,e.time==='sunset'?3:10,e.time==='night'?-4:5);
    if(e.weather==='cloudy'||e.weather==='rain'){this.sun.intensity*=.48;this.ambient.intensity*=.86;this.scene.background.lerp(new THREE.Color('#7f929d'),.35);this.scene.fog.color.copy(this.scene.background);}
    this.scene.fog.far=e.climate==='dry'?55:e.climate==='cold'?32:e.climate==='tropical'?35:45;
    if(e.climate==='cold')this.sun.color.lerp(new THREE.Color('#ccdfff'),.18);
    if(e.climate==='dry')this.sun.color.lerp(new THREE.Color('#ffdcaa'),.16);
    this.weatherPoints.visible=e.weather==='rain'||e.weather==='snow';this.weatherMat.color.set(e.weather==='snow'?'#ffffff':'#bde0ff');this.weatherMat.size=e.weather==='snow'?.067:.032;this.weatherMat.opacity=e.weather==='snow'?.9:.65;
    this.ground.material.color.set(e.weather==='snow'?'#eef4ee':e.weather==='rain'?'#738682':'#ffffff');this.ground.material.roughness=e.weather==='rain'?.36:.92;
    const leaf=e.season==='autumn'?'#a8793e':e.season==='winter'?'#64765e':e.season==='spring'?'#638c49':'#3e6d45';this.leafMaterials.forEach(m=>m.color.set(leaf));
    const grass=e.climate==='dry'?'#a19b65':e.climate==='cold'?'#7e9279':e.season==='autumn'?'#918659':'#698457';this.grass.material.color.set(e.weather==='snow'?'#e1e8df':grass);
    this.photoShade.material.color.set(e.time==='night'?'#1b284b':e.time==='sunset'?'#db9464':'#d9eee4');this.photoShade.material.opacity=e.time==='night'?.55:e.time==='sunset'?.19:.06;
  }
  setCamera(mode) {this.cameraMode=['first','second','third'].includes(mode)?mode:'third';if(this.fallback)return;this.player.head.visible=this.cameraMode!=='first';this.player.body.visible=this.cameraMode!=='first';this.player.hem.visible=this.cameraMode!=='first';this.player.neck.visible=this.cameraMode!=='first';this.player.collar.visible=this.cameraMode!=='first';this._positionCamera();}
  _positionCamera() {
    if(!this.camera)return;const p=this.player.root.position;
    if(this.cameraMode==='first'){this.camera.position.set(p.x,p.y+1.86+this.playerPose.stretch-this.playerPose.crouch,p.z+.10);this.camera.lookAt(this.teacher.root.position.x,1.53,this.teacher.root.position.z);this.camera.fov=67;}
    else if(this.cameraMode==='second'){this.camera.position.set(p.x+.62,p.y+2.12-this.playerPose.crouch*.4,p.z+1.22);this.camera.lookAt(this.teacher.root.position.x,1.35,this.teacher.root.position.z);this.camera.fov=55;}
    else {const a=this.orbit.azimuth,r=this.orbit.radius,e=this.orbit.elevation;this.camera.position.set(Math.sin(a)*r,1.3+Math.sin(e)*r,Math.cos(a)*r+.3);this.camera.lookAt(0,1.05,-.5);this.camera.fov=43;}
    this.camera.updateProjectionMatrix();
  }
  setPlayerPose(pose) {this.playerPose=clonePose(pose);if(!this.fallback){this.player.apply(this.playerPose);if(this.cameraMode!=='third')this._positionCamera();}}
  setTeacherPose(pose) {this.teacherPose=clonePose(pose);if(!this.fallback)this.teacher.apply(this.teacherPose);}
  setTargetPose(pose) {this.targetsVisible = pose != null;if(this.fallback)return;this.targets.visible=this.targetsVisible;if(pose==null)return;this.targetPose=clonePose(pose);const p=this.targetPose;for(const side of ['left','right']){const hand=vec(p.hands[side]);hand.applyAxisAngle(Y_AXIS,p.waist);this.handTargets[side].position.copy(hand);this.footTargets[side].position.copy(vec(p.feet[side]));this.footTargets[side].position.y+=.025;const points=[new THREE.Vector3(side==='left'?-.245:.245,1.575+p.stretch-p.crouch,0).applyAxisAngle(Y_AXIS,p.waist),hand];this.targetLines[side].geometry.setFromPoints(points);this.targetLines[side].computeLineDistances();}}
  setMode(mode) {this.mode=['follow','partner','spar'].includes(mode)?mode:'follow';if(this.fallback)return;const paired=this.mode!=='follow';this.teacher.root.position.set(paired?.25:0,0,paired?-.65:-2.7);this.player.root.position.set(0,0,paired?1.25:1);this.targets.position.copy(this.player.root.position);this.playerPad.position.z=this.player.root.position.z;this.playerRing.position.z=this.player.root.position.z;this.classmates.forEach((c,i)=>{c.root.position.x=(i%2?-1:1)*(paired?3.1:2.15);});this._positionCamera();}
  setEquipment(equipment='none') {this.equipment=equipment==='sword'?'sword':'none';if(this.fallback)return;for(const c of [this.teacher,this.player,...this.classmates])c.sword.visible=this.equipment==='sword';}
  setCombatState(state = {}) {this.combatState={...this.combatState,...state};this.combatState.playerAttack=clamp(this.combatState.playerAttack,0,1);this.combatState.opponentAttack=clamp(this.combatState.opponentAttack,0,1);}
  setQuality(quality) {this.quality=quality==='low'?'low':'high';if(this.fallback)return;this.renderer.shadowMap.enabled=this.quality==='high';this.classmates?.forEach(c=>c.details.forEach(m=>{m.visible=this.quality==='high';}));this.weatherGeo.setDrawRange(0,this.quality==='low'?120:this.particleCount);this.resize();}
  setClassmates(enabled) {this.classmatesEnabled=!!enabled;if(!this.fallback)this.classmates.forEach(c=>{c.root.visible=this.classmatesEnabled;});}
  getRoleScreenPositions() {
    if(this.fallback)return null;
    const position=person=>{
      const v=person.head.getWorldPosition(new THREE.Vector3());v.y+=.26;v.project(this.camera);
      return {x:(v.x+1)/2,y:(1-v.y)/2,visible:v.z>-1&&v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1};
    };
    return {teacher:position(this.teacher),player:{...position(this.player),visible:this.cameraMode==='third'}};
  }
  resize() {const rect=this.canvas.getBoundingClientRect();const w=Math.max(1,rect.width||this.canvas.clientWidth||800),h=Math.max(1,rect.height||this.canvas.clientHeight||500);if(this.fallback){this.canvas.width=Math.round(w);this.canvas.height=Math.round(h);return;}if(!this.renderer)return;this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,this.quality==='low'?1.25:1.75));this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  render(dt=.016,time=0) {
    if(this.disposed)return;dt=Math.max(0,Math.min(Number(dt)||0,.06));time=Number(time)||0;if(this.fallback){this._renderFallback(time);return;}if(this.contextLost)return;
    const tp=clonePose(this.teacherPose),pp=clonePose(this.playerPose);
    if(this.mode==='spar'){
      const a=this.combatState.playerAttack,b=this.combatState.opponentAttack;
      pp.hands.right[1]+=(1.55-pp.hands.right[1])*a;pp.hands.right[2]+=(.91-pp.hands.right[2])*a;pp.waist+=a*.16;
      tp.hands.left[1]+=(1.60-tp.hands.left[1])*a;tp.hands.left[2]+=(.62-tp.hands.left[2])*a;
      tp.hands.right[1]+=(1.55-tp.hands.right[1])*b;tp.hands.right[2]+=(.91-tp.hands.right[2])*b;tp.waist+=b*.16;
      pp.hands.left[1]+=(1.6-pp.hands.left[1])*b;pp.hands.left[2]+=(.62-pp.hands.left[2])*b;
    }
    this.teacher.apply(tp,Math.sin(time*1.25)*.004);this.player.apply(pp,Math.sin(time*1.18)*.002);
    for(const c of this.classmates){if(!c.root.visible)continue;const p=clonePose(this.teacherPose);p.hands.left[1]+=Math.sin(time*1.2+c.phase)*.012;p.hands.right[1]+=Math.sin(time*1.3+c.phase)*.01;c.apply(p,Math.sin(time*1.1+c.phase)*.004);}
    if(this.weatherPoints.visible){const attr=this.weatherGeo.getAttribute('position'),snow=this.environment.weather==='snow';for(let i=0;i<attr.count;i++){attr.array[i*3+1]-=dt*this.particleSpeeds[i]*(snow?.75:6);attr.array[i*3]+=dt*(snow?Math.sin(time+i)*.1:.5);if(attr.array[i*3+1]<0){attr.array[i*3+1]=12;attr.array[i*3]=((i*17.13)%20)-10;}}attr.needsUpdate=true;}
    const pulse=.55+Math.sin(time*2)*.12;Object.values(this.handTargets).forEach(m=>{m.material.opacity=pulse;});this.renderer.render(this.scene,this.camera);
  }
  _renderFallback(time) {
    const ctx=this.ctx;if(!ctx)return;const w=this.canvas.width,h=this.canvas.height;ctx.clearRect(0,0,w,h);
    const night=this.environment.time==='night',g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,night?'#1b2940':'#bdd5d7');g.addColorStop(1,night?'#253d3c':'#69866d');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    if(this.fallbackPhoto){ctx.globalAlpha=.5;ctx.drawImage(this.fallbackPhoto,0,0,w,h*.73);ctx.globalAlpha=1;}
    ctx.fillStyle=night?'#344a43':'#a9b49d';ctx.beginPath();ctx.moveTo(0,h*.65);ctx.lineTo(w,h*.65);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
    const draw=(pose,x,y,s,color,teacher=false)=>{const project=(v)=>[x+v[0]*s,y-v[1]*s-v[2]*s*.18];ctx.lineCap='round';ctx.lineJoin='round';const hip=project([0,1.05-pose.crouch,0]);const neck=project([0,1.67-pose.crouch,0]);ctx.strokeStyle=color;ctx.lineWidth=s*.29;ctx.beginPath();ctx.moveTo(...hip);ctx.lineTo(...neck);ctx.stroke();for(const side of ['left','right']){const sign=side==='left'?-1:1;const shoulder=project([sign*.22,1.55-pose.crouch,0]),hand=project(pose.hands[side]);ctx.lineWidth=s*.12;ctx.beginPath();ctx.moveTo(...shoulder);ctx.lineTo((shoulder[0]+hand[0])/2+sign*s*.08,(shoulder[1]+hand[1])/2+s*.05);ctx.lineTo(...hand);ctx.stroke();const foot=project(pose.feet[side]);ctx.lineWidth=s*.16;ctx.beginPath();ctx.moveTo(hip[0]+sign*s*.10,hip[1]);ctx.lineTo((hip[0]+foot[0])/2, (hip[1]+foot[1])/2);ctx.lineTo(...foot);ctx.stroke();ctx.fillStyle='#cda581';ctx.beginPath();ctx.ellipse(hand[0],hand[1],s*.036,s*.065,0,0,TAU);ctx.fill();}const head=project([0,1.86-pose.crouch,0]);ctx.fillStyle='#d5ad8b';ctx.beginPath();ctx.ellipse(head[0],head[1],s*.13,s*.17,0,0,TAU);ctx.fill();ctx.fillStyle=teacher?'#d4d1c6':'#34312b';ctx.beginPath();ctx.ellipse(head[0],head[1]-s*.09,s*.13,s*.075,0,Math.PI,TAU);ctx.fill();ctx.fillStyle='#31342b';ctx.fillRect(head[0]-s*.06,head[1],s*.015,s*.014);ctx.fillRect(head[0]+s*.05,head[1],s*.015,s*.014);};
    if(this.classmatesEnabled){for(let i=0;i<6;i++)draw(this.teacherPose,w*(i%2?.78:.22),h*(.65+Math.floor(i/2)*.1),h*(.13+Math.floor(i/2)*.018),['#9b7381','#577e99','#9b8a60','#67897c','#86749b','#648694'][i]);}
    draw(this.teacherPose,w*.5,h*.67,h*.20,'#ece3cb',true);draw(this.playerPose,w*.49,h*.96,h*.24,'#287d70');
    ctx.fillStyle='rgba(15,39,37,.8)';ctx.fillRect(12,12,Math.min(w-24,260),31);ctx.fillStyle='#e4f1df';ctx.font='13px system-ui';ctx.fillText(this.compatibilityLabel||'2D compatibility mode',22,32,Math.min(w-44,240));
  }
  dispose() {
    this.disposed=true;this.photoGeneration=(this.photoGeneration||0)+1;this.listeners.forEach(fn=>fn());if(!this.scene)return;const geometries=new Set(),materials=new Set(),textures=new Set();this.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material])){if(!m)continue;materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}});textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());this.renderer?.dispose();
  }
}
