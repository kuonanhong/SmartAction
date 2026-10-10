/* SmartAction practice-game curriculum.
 * All motion targets and cues below are authored for this game, not motion capture
 * or a certified teaching syllabus. Sources and limitations: docs/CURRICULUM_SOURCES.md.
 * Coordinates: metres, +Z forward, -X anatomical left; hand/foot endpoints.
 */

const n = (zh, en, es, ja = zh, ko = zh) => ({zh,en,ja,ko,es});
const P = (lh=[-.32,1.0,.12], rh=[.32,1.0,.12], lf=[-.2,0,0], rf=[.2,0,0], waist=0, crouch=.04, stretch=0) => ({
  hands:{left:[...lh],right:[...rh]}, feet:{left:[...lf],right:[...rf]}, waist,crouch,stretch
});
const clone = value => JSON.parse(JSON.stringify(value));
const B = {
  balance:{zh:'練習重心轉移與平衡控制；屬一般運動目標，並非此招已被證實有特定療效。',en:'Practise weight transfer and balance control; this is a general exercise aim, not a proven therapeutic effect of this move.'},
  coordination:{zh:'練習手、腳與軀幹的協調及動作記憶。',en:'Practise coordination of the arms, legs and trunk, and movement recall.'},
  mobility:{zh:'在舒適範圍內練習肩、髖與軀幹活動度。',en:'Practise comfortable shoulder, hip and trunk mobility.'},
  breath:{zh:'練習自然呼吸、注意力與緩慢動作的節奏。',en:'Practise natural breathing, attention and a slow movement rhythm.'},
  legs:{zh:'練習下肢支撐、步法與姿勢控制；不要求深蹲或勉強拉伸。',en:'Practise leg support, footwork and posture control without deep squats or forced stretching.'},
  rhythm:{zh:'練習節奏、左右協調及輕度全身活動。',en:'Practise rhythm, left-right coordination and gentle whole-body movement.'}
};
const benefitTranslations = {
 balance:{ja:'重心移動とバランスを練習します。一般的な運動目標であり、この動作の治療効果を示すものではありません。',ko:'체중 이동과 균형 조절을 연습합니다. 일반적인 운동 목표이며 이 동작의 치료 효과를 뜻하지 않습니다.',es:'Practica cambios de peso y equilibrio; es un objetivo general del ejercicio, no un efecto terapéutico probado de este movimiento.'},
 coordination:{ja:'手、足、体幹の協調と動作の記憶を練習します。',ko:'팔, 다리, 몸통의 협응과 동작 기억을 연습합니다.',es:'Practica la coordinación de brazos, piernas y tronco, y la memoria de los movimientos.'},
 mobility:{ja:'無理のない範囲で肩、股関節、体幹の動きを練習します。',ko:'편안한 범위에서 어깨, 고관절, 몸통의 움직임을 연습합니다.',es:'Practica la movilidad cómoda de hombros, caderas y tronco.'},
 breath:{ja:'自然な呼吸、集中、ゆっくりした動きのリズムを練習します。',ko:'자연스러운 호흡, 집중, 느린 동작의 리듬을 연습합니다.',es:'Practica la respiración natural, la atención y un ritmo de movimiento lento.'},
 legs:{ja:'脚の支持、足運び、姿勢の制御を練習します。深いしゃがみや無理なストレッチは不要です。',ko:'다리 지지, 발걸음, 자세 조절을 연습합니다. 깊은 쪼그림이나 무리한 스트레칭은 필요하지 않습니다.',es:'Practica el apoyo de piernas, los pasos y la postura sin sentadillas profundas ni estiramientos forzados.'},
 rhythm:{ja:'リズム、左右の協調、穏やかな全身運動を練習します。',ko:'리듬, 좌우 협응, 부드러운 전신 움직임을 연습합니다.',es:'Practica el ritmo, la coordinación entre lados y el movimiento suave de todo el cuerpo.'}
};
// Japanese/Korean/Spanish cues are concrete endpoint instructions derived from
// the same target pose; they do not silently fall back to an English paragraph.
function poseCues(pose,lang) {
 const words={
  fr:{left:'gauche',right:'droite',waist:'de la taille',chest:'de la poitrine',head:'de la tête',side:'le côté',arm:(s,h,d)=>`Placez la main ${s} près ${h}, puis déplacez-la doucement vers ${d}.`,front:'l’avant',neutral:'une position confortable',lift:s=>`Soulevez légèrement le pied ${s} en stabilisant la jambe d’appui.`,step:s=>`Faites un petit pas en avant avec le pied ${s}.`,wide:'Écartez les pieds à une largeur confortable.',parallel:'Gardez les pieds stables, sans les croiser.',turn:s=>`Tournez légèrement la taille à ${s} ; alignez genoux et orteils.`,centre:'Gardez le tronc centré et les épaules détendues.',low:'Fléchissez peu les genoux, sans accroupissement profond.',soft:'Gardez les genoux souples et respirez naturellement.'},
  de:{left:'links',right:'rechts',waist:'der Taille',chest:'der Brust',head:'dem Kopf',side:'zur Seite',arm:(s,h,d)=>`Halten Sie die Hand ${s} nahe ${h} und bewegen Sie sie sanft ${d}.`,front:'nach vorne',neutral:'in eine bequeme Position',lift:s=>`Heben Sie den Fuß ${s} nur leicht an; stabilisieren Sie das Standbein.`,step:s=>`Machen Sie mit dem Fuß ${s} einen kleinen Schritt nach vorne.`,wide:'Öffnen Sie die Füße auf eine bequeme Breite.',parallel:'Halten Sie die Füße stabil, ohne sie zu kreuzen.',turn:s=>`Drehen Sie die Taille leicht nach ${s}; Knie und Zehen zeigen in dieselbe Richtung.`,centre:'Halten Sie den Rumpf mittig und entspannen Sie die Schultern.',low:'Beugen Sie die Knie nur leicht, ohne tiefe Kniebeuge.',soft:'Halten Sie die Knie locker und atmen Sie natürlich.'},
  pt:{left:'esquerdo',right:'direito',waist:'da cintura',chest:'do peito',head:'da cabeça',side:'o lado',arm:(s,h,d)=>`Coloque a mão do lado ${s} perto ${h} e mova-a suavemente para ${d}.`,front:'a frente',neutral:'uma posição confortável',lift:s=>`Levante um pouco o pé ${s}, mantendo a perna de apoio estável.`,step:s=>`Dê um pequeno passo em frente com o pé ${s}.`,wide:'Afaste os pés a uma distância confortável.',parallel:'Mantenha os pés estáveis, sem os cruzar.',turn:s=>`Rode a cintura um pouco para o lado ${s}; alinhe joelhos e dedos dos pés.`,centre:'Mantenha o tronco centrado e os ombros relaxados.',low:'Dobre ligeiramente os joelhos, sem agachar profundamente.',soft:'Mantenha os joelhos soltos e respire naturalmente.'},
  ja:{left:'左',right:'右',hand:'手',waist:'腰の前',chest:'胸の前',head:'頭の横',side:'側方',arm:(s,h,d)=>`${s}手を${h}に置き、${d}へ穏やかに動かす。`,front:'前',neutral:'自然な位置',lift:s=>`${s}足を少しだけ上げ、支持脚を安定させる。`,step:s=>`${s}足を前に小さく出す。`,wide:'両足を無理のない幅に開く。',parallel:'両足を安定させ、交差しない。',turn:s=>`腰を${s}へ少し回し、膝とつま先の向きを合わせる。`,centre:'体幹を中央に保ち、肩を緩める。',low:'浅く膝を曲げる。深くしゃがまない。',soft:'膝を軽く緩め、自然に呼吸する。'},
  ko:{left:'왼',right:'오른',hand:'손',waist:'허리 앞',chest:'가슴 앞',head:'머리 옆',side:'옆',arm:(s,h,d)=>`${s}손을 ${h}에 두고 ${d} 방향으로 부드럽게 움직입니다.`,front:'앞',neutral:'편안한',lift:s=>`${s}발을 조금만 들고 지지 다리를 안정시킵니다.`,step:s=>`${s}발을 앞으로 조금 내딛습니다.`,wide:'발을 편안한 너비로 벌립니다.',parallel:'발을 안정시키고 서로 교차하지 않습니다.',turn:s=>`허리를 ${s}쪽으로 조금 돌리고 무릎과 발끝 방향을 맞춥니다.`,centre:'몸통을 가운데 두고 어깨를 이완합니다.',low:'무릎을 얕게 굽힙니다. 깊게 쪼그리지 않습니다.',soft:'무릎을 부드럽게 하고 자연스럽게 호흡합니다.'},
  es:{left:'izquierda',right:'derecha',hand:'mano',waist:'la cintura',chest:'el pecho',head:'la cabeza',side:'el lado',arm:(s,h,d)=>`Mantén la mano ${s} cerca de ${h} y muévela suavemente hacia ${d}.`,front:'delante',neutral:'una posición cómoda',lift:s=>`Levanta un poco el pie de la ${s} y estabiliza la pierna de apoyo.`,step:s=>`Da un paso corto hacia delante con el pie de la ${s}.`,wide:'Abre los pies a una distancia cómoda.',parallel:'Mantén los pies estables y sin cruzarlos.',turn:s=>`Gira un poco la cintura a la ${s}; alinea las rodillas con los dedos de los pies.`,centre:'Mantén el tronco centrado y los hombros relajados.',low:'Flexiona las rodillas suavemente, sin una sentadilla profunda.',soft:'Mantén las rodillas suaves y respira con naturalidad.'}
 }[lang];
 const cue=[];
 for(const side of ['left','right']){
  const v=pose.hands[side],height=v[1]>1.72?words.head:v[1]>1.2?words.chest:words.waist;
  cue.push(words.arm(words[side],height,v[2]>.3?words.front:Math.abs(v[0])>.5?words.side:words.neutral));
 }
 const lift=Object.keys(pose.feet).find(s=>pose.feet[s][1]>.09);
 const step=Object.keys(pose.feet).find(s=>pose.feet[s][2]>.2);
 cue.push(lift?words.lift(words[lift]):step?words.step(words[step]):Math.abs(pose.feet.left[0])>.32?words.wide:words.parallel);
 cue.push(Math.abs(pose.waist)>.12?words.turn(words[pose.waist<0?'left':'right']):words.centre);
 cue.push(pose.crouch>.16?words.low:words.soft);
 return cue;
}
const M = (id,name,zh,en,pose,benefit='coordination') => ({id,name,cues:{zh,en,ja:poseCues(pose,'ja'),ko:poseCues(pose,'ko'),es:poseCues(pose,'es')},benefitType:benefit,benefits:{...clone(B[benefit]),...clone(benefitTranslations[benefit])},duration:6,pose:clone(pose)});

// Common tai chi names are used as short game sections, not as a complete lineage form.
const T = {
  prepare:M('prepare',n('預備式','Preparation','Preparación','予備式','준비 자세'),['雙腳平行，站穩再開始。','肩頸放鬆，眼睛平視。'],['Stand with parallel feet before beginning.','Relax your shoulders and neck; look ahead.'],P(), 'breath'),
  opening:M('opening',n('起勢','Opening','Apertura','起勢','시작 동작'),['雙手緩緩抬至胸前，手肘保留弧度。','膝蓋微鬆，勿聳肩。'],['Raise both hands slowly in front of the chest with soft elbows.','Soften your knees without shrugging.'],P([-.3,1.42,.48],[.3,1.42,.48],[-.23,0,0],[.23,0,0],0,.08),'breath'),
  wardL:M('ward-left',n('左掤','Left ward-off','Desviar a la izquierda','左掤','왼쪽 붕'),['左臂在胸前保持圓弧，右手鬆放。','向左前移重心，膝蓋與腳尖同向。'],['Keep the left arm rounded in front of the chest; relax the right hand.','Shift towards the left front with the knee aligned with the toes.'],P([-.32,1.39,.5],[.32,1.05,.15],[-.24,0,.35],[.22,0,-.17],-.15,.12),'balance'),
  wardR:M('ward-right',n('右掤','Right ward-off','Desviar a la derecha','右掤','오른쪽 붕'),['右臂在胸前成圓弧，兩肩放鬆。','向右前移重心，腳下保持穩定。'],['Round the right arm in front of the chest; relax both shoulders.','Shift towards the right front while keeping a stable base.'],P([-.32,1.06,.16],[.32,1.39,.5],[-.22,0,-.17],[.24,0,.35],.15,.12),'balance'),
  rollback:M('rollback',n('捋','Roll back','Desviar hacia atrás','捋','뒤로 흘리기'),['雙手隨腰小幅轉向左側。','重心略回移，勿以手臂硬拉。'],['Let the hands follow a small waist turn to the left.','Shift slightly back without pulling hard with the arms.'],P([-.55,1.25,.2],[-.02,1.34,.37],[-.23,0,-.12],[.23,0,.25],-.32,.1),'balance'),
  press:M('press',n('擠','Press','Presionar','擠','모아 밀기'),['雙手在胸前靠近，兩臂保持彈性。','腰胯帶動前移，不要挺胸。'],['Bring the hands near each other in front of the chest with soft arms.','Let the hips guide a forward shift without thrusting the chest.'],P([-.08,1.36,.5],[.14,1.36,.46],[-.23,0,-.16],[.23,0,.33],.1,.12),'coordination'),
  push:M('push',n('按','Push','Empujar','按','앞으로 밀기'),['雙掌向前，手腕及肘部保持舒適。','動作均勻，肩膀不要向上抬。'],['Move both palms forward with comfortable wrists and elbows.','Keep the motion even and the shoulders down.'],P([-.28,1.32,.58],[.28,1.32,.58],[-.22,0,-.17],[.22,0,.32],0,.12),'coordination'),
  whip:M('single-whip',n('單鞭','Single whip','Látigo simple','単鞭','단편'),['兩臂舒展成圓弧，不鎖死手肘。','左腳側開，腰部小幅左轉。'],['Open the arms in rounded lines without locking the elbows.','Step the left foot sideways and turn the waist a little left.'],P([-.78,1.38,.25],[.67,1.42,.2],[-.39,0,.12],[.28,0,-.05],-.25,.14),'mobility'),
  raise:M('raise-hands',n('提手上勢','Raise hands','Elevar las manos','提手上勢','손 들어 올리기'),['雙手向中線靠攏，前腳輕點。','身體直立，勿前傾。'],['Bring the hands towards the centre and touch lightly with the front foot.','Keep the trunk upright without leaning forward.'],P([-.13,1.43,.42],[.18,1.19,.37],[-.2,0,-.08],[.2,0,.26],.08,.1),'balance'),
  shoulder:M('shoulder',n('靠（遊戲慢練）','Shoulder alignment','Alineación del hombro','靠・ゆっくり練習','어깨 정렬 연습'),['雙手收近身側，肩胯朝同一方向。','只做姿勢控制，不撞擊他人。'],['Bring the hands closer to the body; align shoulder and hip direction.','Practise posture only; do not strike another person.'],P([-.35,1.16,.17],[.3,1.31,.23],[-.23,0,-.12],[.28,0,.3],.3,.12),'coordination'),
  crane:M('white-crane',n('白鶴亮翅','White crane spreads wings','La grulla blanca abre las alas','白鶴亮翅','백학량시'),['右手升至額旁，左手落至腰前。','前腳輕點，上身保持中正。'],['Raise the right hand beside the forehead and lower the left near the waist.','Touch lightly with the front foot and stay upright.'],P([-.42,1.03,.18],[.32,1.86,.17],[-.2,0,.25],[.21,0,-.15],-.08,.07),'balance'),
  brushL:M('brush-left',n('左摟膝拗步','Left brush knee and push','Cepillar la rodilla izquierda y empujar','左摟膝拗歩','왼쪽 누슬요보'),['左手沿膝外側鬆落，右掌向前。','左腳向前，膝蓋順著腳尖。'],['Lower the left hand beside the knee and move the right palm forward.','Step forward with the left foot and align the knee with the toes.'],P([-.47,.92,.24],[.22,1.35,.58],[-.25,0,.39],[.23,0,-.18],-.14,.16),'coordination'),
  brushR:M('brush-right',n('右摟膝拗步','Right brush knee and push','Cepillar la rodilla derecha y empujar','右摟膝拗歩','오른쪽 누슬요보'),['右手沿膝外側鬆落，左掌向前。','右腳向前，膝蓋順著腳尖。'],['Lower the right hand beside the knee and move the left palm forward.','Step forward with the right foot and align the knee with the toes.'],P([-.22,1.35,.58],[.47,.92,.24],[-.23,0,-.18],[.25,0,.39],.14,.16),'coordination'),
  lute:M('lute',n('手揮琵琶','Play the lute','Tocar el laúd','手揮琵琶','수휘비파'),['一手在前、一手在肘旁，兩肘放鬆。','前腳輕點，重心留在後腳。'],['Place one hand forward and the other near its elbow with relaxed joints.','Touch with the front foot while keeping weight back.'],P([-.17,1.47,.45],[.18,1.23,.28],[-.2,0,.27],[.2,0,-.11],-.05,.08),'balance'),
  punch:M('parry-punch',n('進步搬攔捶','Step, parry and punch','Avanzar, desviar y golpear','進歩搬攔捶','진보반란추'),['前手慢慢伸出，另一手留在胸前。','配合小步前移；不鎖肘、不發力打人。'],['Extend the lead hand slowly; keep the other in front of the chest.','Take a small forward step; do not lock the elbow or strike anyone.'],P([-.26,1.35,.62],[.25,1.25,.21],[-.23,0,.35],[.23,0,-.16],-.12,.14),'coordination'),
  closeup:M('apparent-close',n('如封似閉','Apparent close-up','Cerrar y proteger','如封似閉','여봉사폐'),['雙手先收回，再鬆鬆向前。','腰胯帶動手臂，勿用肩膀硬推。'],['Draw both hands back, then move them gently forward.','Let the hips guide the arms rather than pushing from the shoulders.'],P([-.27,1.29,.48],[.27,1.29,.48],[-.22,0,.28],[.22,0,-.15],0,.11),'coordination'),
  cross:M('cross-hands',n('十字手','Cross hands','Cruzar las manos','十字手','십자수'),['雙手在胸前交叉，保持離胸的空間。','兩腳平行，慢慢回到中央。'],['Cross the hands in front of the chest, leaving space from the body.','Set parallel feet and return gently to the centre.'],P([.08,1.4,.32],[-.08,1.33,.38],[-.23,0,0],[.23,0,0],0,.07),'coordination'),
  tiger:M('embrace-tiger',n('抱虎歸山','Embrace tiger, return to mountain','Abrazar al tigre y volver a la montaña','抱虎帰山','포호귀산'),['雙臂先抱圓，再隨腰轉向右前。','步幅舒適，身體勿扭成兩段。'],['Round both arms, then let them follow a turn towards the right front.','Use a comfortable step and turn the trunk as a unit.'],P([-.22,1.25,.4],[.49,1.38,.41],[-.25,0,-.12],[.3,0,.28],.3,.14),'mobility'),
  diagonalWhip:M('diagonal-whip',n('斜單鞭','Diagonal single whip','Látigo diagonal','斜単鞭','사단편'),['雙臂向斜角展開，肘部柔軟。','只轉到舒適角度，膝蓋勿內扣。'],['Open the arms towards a diagonal with soft elbows.','Turn only to a comfortable angle; do not collapse the knees inward.'],P([-.69,1.36,.4],[.7,1.43,.13],[-.34,0,.23],[.25,0,-.11],-.34,.14),'mobility'),
  elbow:M('fist-under-elbow',n('肘底看捶','Fist under elbow','Puño bajo el codo','肘底看捶','주저간추'),['左手向前，右手靠近左肘下方。','前腳輕點，肩膀保持水平。'],['Reach the left hand forward and place the right beneath its elbow.','Touch lightly with the front foot; keep the shoulders level.'],P([-.27,1.45,.51],[.07,1.13,.34],[-.2,0,.26],[.21,0,-.13],-.08,.09),'balance'),
  monkeyR:M('repulse-right',n('右倒攆猴','Right repulse monkey','Retroceder y repeler al mono, derecha','右倒攆猴','오른쪽 도련후'),['右掌向前，左手鬆收至側後。','左腳退小步，視線仍向前。'],['Move the right palm forward and draw the left hand gently to the side.','Take a small backward step with the left foot while looking ahead.'],P([-.42,1.32,-.1],[.22,1.34,.57],[-.24,0,-.26],[.22,0,.14],.18,.13),'balance'),
  monkeyL:M('repulse-left',n('左倒攆猴','Left repulse monkey','Retroceder y repeler al mono, izquierda','左倒攆猴','왼쪽 도련후'),['左掌向前，右手鬆收至側後。','右腳退小步，勿向後仰。'],['Move the left palm forward and draw the right hand gently to the side.','Take a small backward step with the right foot without leaning back.'],P([-.22,1.34,.57],[.42,1.32,-.1],[-.22,0,.14],[.24,0,-.26],-.18,.13),'balance'),
  flying:M('diagonal-flying',n('斜飛勢','Diagonal flying','Volar en diagonal','斜飛勢','사비세'),['右臂向斜上開展，左手鬆落。','腰胯向右帶動，保持胸口放鬆。'],['Open the right arm diagonally upward; lower the left hand gently.','Let the hips guide a right turn and keep the chest relaxed.'],P([-.37,1.04,.12],[.74,1.5,.24],[-.24,0,-.09],[.34,0,.23],.32,.13),'mobility'),
  cloudL:M('cloud-left',n('雲手左','Cloud hands left','Manos como nubes, izquierda','雲手・左','운수 왼쪽'),['左手在胸前帶弧線，右手隨行。','小幅左轉，兩腳勿交叉。'],['Trace an arc with the left hand at chest height; let the right follow.','Turn a little left without crossing the feet.'],P([-.53,1.43,.35],[.07,1.04,.37],[-.3,0,.02],[.24,0,0],-.27,.1),'coordination'),
  cloudR:M('cloud-right',n('雲手右','Cloud hands right','Manos como nubes, derecha','雲手・右','운수 오른쪽'),['右手在胸前帶弧線，左手隨行。','小幅右轉，速度保持一致。'],['Trace an arc with the right hand at chest height; let the left follow.','Turn a little right and keep the speed even.'],P([-.07,1.04,.37],[.53,1.43,.35],[-.24,0,0],[.3,0,.02],.27,.1),'coordination'),
  snake:M('low-single-whip',n('單鞭下勢（淺蹲）','Low single whip, shallow','Látigo bajo, flexión suave','単鞭下勢・浅く','단편하세, 얕게'),['只下降到舒適高度，左手向前下方。','膝蓋與腳尖同向，勿勉強壓低。'],['Lower only to a comfortable height and reach the left hand forward and down.','Align knees and toes; never force a low position.'],P([-.64,.9,.36],[.58,1.18,.16],[-.45,0,.12],[.35,0,-.02],-.2,.28),'legs'),
  roosterL:M('rooster-left',n('左金雞獨立（低抬腿）','Left golden rooster, low knee','Gallo dorado izquierdo, rodilla baja','左金鶏独立・低く','왼쪽 금계독립, 낮게'),['左腳支撐，右腳只小幅抬起。','右手抬高，左手下降；勿屏息。'],['Support on the left foot and lift the right foot only slightly.','Raise the right hand and lower the left without holding the breath.'],P([-.35,1.03,.12],[.29,1.7,.25],[-.2,0,0],[.2,.25,.18],0,.03),'balance'),
  roosterR:M('rooster-right',n('右金雞獨立（低抬腿）','Right golden rooster, low knee','Gallo dorado derecho, rodilla baja','右金鶏独立・低く','오른쪽 금계독립, 낮게'),['右腳支撐，左腳只小幅抬起。','左手抬高，右手下降；軀幹中正。'],['Support on the right foot and lift the left foot only slightly.','Raise the left hand and lower the right with an upright trunk.'],P([-.29,1.7,.25],[.35,1.03,.12],[-.2,.25,.18],[.2,0,0],0,.03),'balance'),
  partMane:M('part-mane',n('野馬分鬃','Part wild horse mane','Separar la crin del caballo','野馬分鬃','야마분종'),['左手向斜前上方，右手落在腰旁。','小步前移，肩胯協調。'],['Reach the left hand diagonally forward and up; lower the right near the waist.','Shift through a small step with coordinated shoulders and hips.'],P([-.53,1.44,.44],[.37,1.03,.08],[-.27,0,.36],[.23,0,-.14],-.18,.13),'coordination'),
  shuttle:M('shuttle',n('玉女穿梭','Fair lady works shuttles','La dama trabaja en el telar','玉女穿梭','옥녀천사'),['左手在額側護住，右掌慢慢向前。','腳步向斜前方，身體不歪斜。'],['Place the left hand beside the forehead and move the right palm forward slowly.','Step towards a diagonal while keeping the body upright.'],P([-.32,1.83,.2],[.25,1.35,.55],[-.26,0,-.15],[.28,0,.34],.2,.12),'coordination'),
  needle:M('needle',n('海底針（淺降）','Needle at sea bottom, shallow','Aguja al fondo del mar, suave','海底針・浅く','해저침, 얕게'),['右手向前下方鬆落，背部保持長。','只淺蹲，不彎腰探地。'],['Lower the right hand gently forward and down while keeping a long back.','Use a shallow knee bend rather than bending to the ground.'],P([-.31,1.08,.18],[.32,.85,.4],[-.2,0,.23],[.22,0,-.08],0,.2),'mobility'),
  fan:M('fan-back',n('扇通背','Fan through back','Abrir el abanico','扇通背','선통배'),['右手升到頭側，左手向前開。','肩膀放鬆，以腰部小幅帶動。'],['Raise the right hand beside the head and open the left hand forward.','Relax the shoulders and use a small waist turn.'],P([-.55,1.47,.44],[.34,1.84,.16],[-.25,0,.34],[.23,0,-.14],-.16,.12),'mobility'),
  closing:M('closing',n('收勢','Closing','Cierre','収勢','마무리'),['雙手緩緩下降到身側。','兩腳回到平行，呼吸自然。'],['Lower both hands slowly to the sides.','Return to parallel feet and breathe naturally.'],P([-.32,.99,.1],[.32,.99,.1],[-.2,0,0],[.2,0,0],0,.02),'breath')
};

const J = {
  bow:M('bow',n('立禮','Standing bow','Saludo de pie','立礼','서서 인사'),['雙腳站穩，手在身側。','輕微低頭致意，回復直立。'],['Stand securely with hands beside the body.','Give a small respectful nod and return upright.'],P(), 'breath'),
  natural:M('natural',n('自然體','Natural stance','Postura natural','自然体','자연체'),['雙腳與肩同寬，手在身前。','不用多餘的力，準備前後移步。'],['Set the feet at shoulder width with hands in front.','Avoid excess tension and prepare for forward and backward steps.'],P([-.28,1.22,.28],[.28,1.22,.28],[-.23,0,0],[.23,0,0],0,.06),'balance'),
  defensive:M('defensive',n('自護體（淺降）','Defensive stance, shallow','Postura defensiva suave','自護体・浅く','자호체, 얕게'),['雙腳略開，膝蓋柔軟。','雙手在前，身體保持直立。'],['Widen the feet slightly and soften the knees.','Keep hands in front and the trunk upright.'],P([-.35,1.24,.35],[.35,1.24,.35],[-.35,0,0],[.35,0,0],0,.2),'legs'),
  advance:M('advance',n('進步移動','Advance step','Paso hacia delante','前進','전진'),['右腳向前小步，左腳隨後。','步幅小，勿拖曳或交叉雙腳。'],['Take a small step forward with the right foot, then follow with the left.','Use short steps without dragging or crossing the feet.'],P([-.3,1.28,.32],[.3,1.28,.32],[-.22,0,-.12],[.22,0,.3],0,.12),'balance'),
  retreat:M('retreat',n('退步移動','Retreat step','Paso hacia atrás','後退','후진'),['左腳小步後退，重心跟隨。','維持視線向前，不後仰。'],['Take a small backward step with the left foot and let the weight follow.','Keep looking ahead without leaning back.'],P([-.3,1.28,.3],[.3,1.28,.3],[-.22,0,-.3],[.22,0,.1],0,.12),'balance'),
  turn:M('turn-body',n('體捌（轉身步法）','Body turning footwork','Giro y desplazamiento','体さばき','몸 돌리기'),['移步配合小幅轉腰。','只做步法，不演示投技或摔落。'],['Coordinate a step with a small waist turn.','Practise footwork only; no throws or falls are demonstrated.'],P([-.29,1.28,.35],[.36,1.34,.32],[-.3,0,.14],[.23,0,-.18],-.36,.14),'coordination')
};

const K = {
  ready:M('ready',n('準備姿勢','Ready stance','Postura de preparación','準備姿勢','준비 서기'),['雙腳平行，兩拳放在腹前。','身體放鬆，留出手腳活動空間。'],['Stand with parallel feet and fists in front of the abdomen.','Relax and leave space around your arms and legs.'],P([-.13,1.07,.26],[.13,1.07,.26],[-.24,0,0],[.24,0,0]),'coordination'),
  lowblock:M('low-block',n('下格擋 · Arae-makgi','Low block · Arae-makgi','Bloqueo bajo · Arae-makgi','下段受け · Arae-makgi','아래막기'),['左手向前下方，右拳收回腰旁。','用小幅腰轉，勿用力甩肘。'],['Move the left arm forward and down; draw the right fist near the waist.','Use a small trunk turn without snapping the elbow.'],P([-.44,1.0,.43],[.3,1.07,.12],[-.24,0,.34],[.24,0,-.15],-.17,.13),'coordination'),
  middleblock:M('middle-block',n('中段格擋 · Momtong-makgi','Middle block · Momtong-makgi','Bloqueo medio · Momtong-makgi','中段受け · Momtong-makgi','몸통막기'),['左前臂在胸前保留弧度。','右手護近身側，兩肩放鬆。'],['Keep the left forearm rounded in front of the chest.','Bring the right hand near the body and relax the shoulders.'],P([-.32,1.48,.38],[.32,1.15,.18],[-.24,0,.3],[.24,0,-.15],-.12,.12),'coordination'),
  highblock:M('high-block',n('上格擋 · Eolgul-makgi','High block · Eolgul-makgi','Bloqueo alto · Eolgul-makgi','上段受け · Eolgul-makgi','얼굴막기'),['左手升至額前，勿抬肩夾頸。','右手收近胸前，站穩。'],['Raise the left hand in front of the forehead without shrugging.','Keep the right hand near the chest and maintain a stable stance.'],P([-.24,1.83,.29],[.28,1.23,.2],[-.25,0,.28],[.24,0,-.15],-.08,.12),'mobility'),
  punch:M('straight-punch',n('正拳 · Jireugi（慢練）','Straight punch · Jireugi, slow','Puñetazo recto · Jireugi, lento','正拳 · Jireugi','지르기, 천천히'),['右拳慢慢向前，左拳回收。','不鎖肘，不衝擊真人或硬物。'],['Extend the right fist slowly and draw the left fist back.','Do not lock the elbow or strike a person or hard object.'],P([-.3,1.12,.1],[.22,1.37,.59],[-.24,0,-.15],[.24,0,.34],.15,.13),'coordination'),
  knee:M('knee-lift',n('前踢準備 · 低抬膝','Front-kick preparation, low knee','Preparación de patada frontal, rodilla baja','前蹴り準備・低く','앞차기 준비, 낮게'),['右腳只小幅離地，雙手保護胸前。','支撐腿保持柔軟，不突然踢高。'],['Lift the right foot only a little with hands guarding the chest.','Keep the support leg soft; do not kick suddenly or high.'],P([-.27,1.5,.26],[.27,1.5,.26],[-.21,0,0],[.2,.3,.19],0,.04),'balance'),
  kick:M('front-kick-low',n('低前踢 · Ap-chagi','Low front kick · Ap-chagi','Patada frontal baja · Ap-chagi','低い前蹴り · Ap-chagi','낮은 앞차기'),['右腳向前低伸，再受控收回。','保持雙手護身，不仰腰。'],['Extend the right foot low to the front, then draw it back under control.','Keep the hands guarding and avoid leaning backwards.'],P([-.27,1.49,.24],[.27,1.49,.24],[-.2,0,-.02],[.18,.24,.52],0,.02),'balance'),
  guard:M('guard',n('守備回位','Return to guard','Volver a la guardia','構えに戻る','겨루기 준비 자세'),['雙手回到胸前，腳步成自然前後站姿。','放鬆呼吸，留意距離。'],['Bring the hands in front of the chest with a comfortable staggered stance.','Breathe naturally and attend to spacing.'],P([-.25,1.5,.28],[.25,1.48,.33],[-.24,0,.19],[.24,0,-.2],-.1,.1),'coordination')
};

const S = {
  stance:M('sumo-stance',n('相撲基本站姿','Sumo base stance','Postura básica de sumo','相撲の基本姿勢','스모 기본 자세'),['雙腳適度打開，膝蓋朝腳尖方向。','雙手放在腿上方，不深蹲。'],['Set a comfortable wide stance with knees aligned to the toes.','Keep hands above the thighs without a deep squat.'],P([-.42,.98,.2],[.42,.98,.2],[-.4,0,0],[.4,0,0],0,.22),'legs'),
  shikoL:M('shiko-left',n('左四股（低抬腿）','Left shiko, low lift','Shiko izquierdo, elevación baja','左四股・低く','왼쪽 시코, 낮게'),['右腳支撐，左腳小幅側抬。','上身保持穩定，落腳輕柔。'],['Support on the right foot and lift the left slightly to the side.','Keep the trunk steady and place the foot gently.'],P([-.4,1.08,.12],[.4,1.08,.12],[-.42,.16,.02],[.26,0,0],0,.08),'balance'),
  shikoR:M('shiko-right',n('右四股（低抬腿）','Right shiko, low lift','Shiko derecho, elevación baja','右四股・低く','오른쪽 시코, 낮게'),['左腳支撐，右腳小幅側抬。','不要追求抬高或用力跺腳。'],['Support on the left foot and lift the right slightly to the side.','Do not try to lift high or stamp forcefully.'],P([-.4,1.08,.12],[.4,1.08,.12],[-.26,0,0],[.42,.16,.02],0,.08),'balance'),
  slide:M('suriashi',n('摺足 · Suriashi','Sliding step · Suriashi','Paso deslizante · Suriashi','すり足','스리아시'),['腳步沿地面小幅向前移動。','腰保持舒適高度，身體勿前撲。'],['Move forward with small sliding steps close to the ground.','Keep a comfortable hip height without pitching forward.'],P([-.4,1.13,.24],[.4,1.13,.24],[-.29,0,-.13],[.31,0,.24],0,.2),'legs'),
  teppo:M('teppo',n('鐵砲（空練推掌）','Teppo, air-palm practice','Teppo, empujar al aire','鉄砲・空練習','텟포, 허공 연습'),['左掌向前，右手收近身側。','只慢慢空練，不撞擊柱子或他人。'],['Reach the left palm forward and draw the right near the side.','Practise slowly in the air without hitting a pillar or person.'],P([-.28,1.34,.59],[.34,1.11,.18],[-.33,0,.2],[.3,0,-.11],-.15,.17),'coordination'),
  ritual:M('sumo-return',n('回復站姿與呼吸','Return and breathe','Volver y respirar','姿勢を戻して呼吸','자세 회복과 호흡'),['雙手向兩側舒展，腳步回正。','慢慢站高，恢復自然呼吸。'],['Open the arms gently to the sides and return the feet.','Rise slowly and return to natural breathing.'],P([-.67,1.3,.16],[.67,1.3,.16],[-.3,0,0],[.3,0,0],0,.06),'breath')
};

const W = {
  salute:M('salute',n('抱拳禮','Fist-and-palm salute','Saludo de puño y palma','抱拳礼','포권례'),['一拳一掌在胸前靠近。','肩放鬆，雙腳站穩。'],['Bring one fist and one palm together in front of the chest.','Relax the shoulders and stand securely.'],P([-.06,1.37,.4],[.06,1.37,.4]),'breath'),
  horse:M('horse-stance',n('馬步（淺蹲）','Horse stance, shallow','Postura del caballo, suave','馬歩・浅く','마보, 얕게'),['雙腳側開，膝蓋柔軟。','手放腰旁，胸口與背部自然。'],['Open the feet sideways and soften the knees.','Keep hands near the waist and the chest and back relaxed.'],P([-.33,1.02,.12],[.33,1.02,.12],[-.41,0,0],[.41,0,0],0,.24),'legs'),
  bowpunch:M('bow-punch',n('弓步沖拳（慢練）','Bow stance punch, slow','Puño en postura de arco, lento','弓歩衝拳・ゆっくり','궁보충권, 천천히'),['左腳向前成舒適弓步，右拳慢伸。','膝蓋順腳尖，肘部不鎖死。'],['Step into a comfortable left bow stance and extend the right fist slowly.','Align the knee with the toes and avoid locking the elbow.'],P([-.32,1.06,.12],[.23,1.3,.62],[-.27,0,.39],[.25,0,-.18],-.13,.17),'coordination'),
  empty:M('empty-stance',n('虛步挑掌','Empty stance and lifting palm','Postura vacía y palma ascendente','虚歩挑掌','허보도장'),['前腳輕點，手掌在胸前上提。','重心留在後腿，身體不後仰。'],['Touch lightly with the front foot and lift a palm before the chest.','Keep weight on the rear leg without leaning back.'],P([-.22,1.46,.48],[.33,1.04,.16],[-.2,0,.27],[.23,0,-.1],-.07,.12),'balance'),
  palm:M('palm-forward',n('前伸掌','Forward palm reach','Palma hacia delante','前への掌','앞으로 장 뻗기'),['左掌向前，右手回收。','腰胯小幅配合，勿用力猛推。'],['Reach the left palm forward and draw the right hand back.','Use a small hip turn without a forceful shove.'],P([-.24,1.37,.61],[.32,1.08,.12],[-.25,0,.3],[.25,0,-.15],-.14,.13),'coordination'),
  knee:M('knee-palm',n('提膝穿掌（低抬腿）','Low knee lift and palm','Rodilla baja y palma','提膝穿掌・低く','제슬천장, 낮게'),['右腳小幅抬起，左掌向前。','支撐腿柔軟，動作緩慢。'],['Lift the right foot a little and reach the left palm forward.','Keep the support leg soft and move slowly.'],P([-.25,1.45,.51],[.31,1.14,.15],[-.21,0,0],[.21,.24,.18],0,.03),'balance'),
  side:M('side-open',n('側步開掌','Side step and open palms','Paso lateral y abrir las palmas','横歩きと開掌','옆걸음과 장 열기'),['左腳側移，雙手隨之展開。','腳尖與膝蓋方向一致。'],['Step left and open both hands with the movement.','Keep toes and knees pointing in the same direction.'],P([-.67,1.37,.26],[.64,1.32,.23],[-.36,0,.05],[.25,0,-.04],-.2,.13),'mobility'),
  blockpunch:M('horse-block-punch',n('馬步架打（慢練）','Horse stance block and punch','Bloquear y golpear en postura de caballo','馬歩架打・ゆっくり','마보가타, 천천히'),['左手在額側，右拳慢慢向前。','用淺馬步，不需要低架或發力。'],['Place the left hand beside the forehead and extend the right fist slowly.','Use a shallow horse stance without a low position or force.'],P([-.26,1.79,.23],[.3,1.27,.55],[-.4,0,0],[.4,0,0],0,.22),'coordination')
};

const D = {
  sideL:M('dance-side-left',n('左側點步','Left side tap','Toque lateral izquierdo','左サイドタップ','왼쪽 사이드 탭'),['左腳向側方輕點，兩手舒展。','跟上均勻節拍，不急著跨大步。'],['Tap the left foot to the side and open the hands gently.','Follow an even beat without taking large steps.'],P([-.56,1.34,.2],[.51,1.2,.22],[-.38,0,0],[.21,0,0],-.08,.06),'rhythm'),
  sideR:M('dance-side-right',n('右側點步','Right side tap','Toque lateral derecho','右サイドタップ','오른쪽 사이드 탭'),['右腳向側方輕點，兩手舒展。','支撐腳站穩，膝蓋柔軟。'],['Tap the right foot to the side and open the hands gently.','Stay stable on the support foot with soft knees.'],P([-.51,1.2,.22],[.56,1.34,.2],[-.21,0,0],[.38,0,0],.08,.06),'rhythm'),
  forward:M('dance-forward',n('前點步擺臂','Forward tap and arms','Toque frontal y brazos','前タップと腕振り','앞 탭과 팔 흔들기'),['左腳向前輕點，右臂向前。','兩邊交替時保持呼吸自然。'],['Tap the left foot forward and swing the right arm forward.','Keep breathing naturally when alternating sides.'],P([-.43,1.06,.03],[.32,1.45,.43],[-.21,0,.3],[.21,0,-.04],-.08,.07),'rhythm'),
  back:M('dance-back',n('後點步擺臂','Back tap and arms','Toque atrás y brazos','後ろタップと腕振り','뒤 탭과 팔 흔들기'),['右腳向後輕點，左臂向前。','上身直立，不往後仰。'],['Tap the right foot backwards and swing the left arm forward.','Stay upright without leaning back.'],P([-.32,1.45,.43],[.43,1.06,.03],[-.21,0,.02],[.21,0,-.27],.08,.07),'rhythm'),
  open:M('dance-open',n('開合手臂','Open the arms','Abrir los brazos','腕を開く','팔 벌리기'),['雙手開到胸旁，肘部柔軟。','腳步回中，肩膀不要抬高。'],['Open both hands beside the chest with soft elbows.','Return to the centre without raising the shoulders.'],P([-.68,1.4,.21],[.68,1.4,.21],[-.24,0,0],[.24,0,0],0,.04),'mobility'),
  knee:M('dance-knee',n('低抬膝與拍手','Low knee and clap','Rodilla baja y palmada','低い膝上げと拍手','낮은 무릎 들기와 박수'),['右腳輕抬，雙手在胸前靠近。','慢慢落腳，不跳躍。'],['Lift the right foot gently and bring hands together before the chest.','Place the foot down slowly without jumping.'],P([-.07,1.38,.41],[.07,1.38,.41],[-.2,0,0],[.2,.17,.13],0,.02),'rhythm'),
  turn:M('dance-turn',n('小轉腰擺手','Small waist turn and arms','Giro suave y brazos','小さな腰回しと腕','작은 허리 회전과 팔'),['雙手向左隨腰移動。','轉角小，兩腳不交叉。'],['Let both hands follow a small turn to the left.','Keep the angle small and do not cross the feet.'],P([-.57,1.31,.21],[.02,1.33,.4],[-.28,0,.08],[.25,0,-.04],-.3,.08),'rhythm'),
  finish:M('dance-finish',n('回正放鬆','Return and relax','Volver y relajarse','正面に戻ってリラックス','정면으로 돌아와 이완'),['雙腳回到平行，雙手緩落。','放慢節奏，恢復自然呼吸。'],['Return to parallel feet and lower the hands slowly.','Slow the rhythm and breathe naturally.'],P(), 'breath')
};

const eight = [
 M('b1',n('兩手托天理三焦','Raise both hands to the sky','Elevar ambas manos al cielo','両手で天を支える','두 손으로 하늘 받치기'),['雙手緩升到頭上舒適位置。','不聳肩、不憋氣；名稱為傳統口訣。'],['Raise both hands to a comfortable position above the head.','Do not shrug or hold your breath; the name is a traditional verse.'],P([-.25,2.03,.14],[.25,2.03,.14],[-.23,0,0],[.23,0,0],0,.02,.05),'mobility'),
 M('b2',n('左右開弓似射鵰','Draw the bow to either side','Abrir el arco a ambos lados','左右に弓を引く','좌우로 활 당기기'),['左臂向側伸，右手留在胸旁。','用淺蹲站穩，換邊同樣緩慢。'],['Reach the left arm sideways and keep the right near the chest.','Use a shallow stable stance and change sides slowly.'],P([-.82,1.38,.13],[.15,1.36,.19],[-.39,0,0],[.39,0,0],-.18,.2),'coordination'),
 M('b3',n('調理脾胃須單舉','Raise one hand','Elevar una mano','片手を上げる','한 손 들어 올리기'),['左手向上，右手鬆鬆向下。','兩側拉長到舒適範圍，不屏息。'],['Raise the left hand and lower the right gently.','Lengthen within comfort without holding the breath.'],P([-.27,2.0,.1],[.34,.96,.13],[-.23,0,0],[.23,0,0],0,.02,.05),'mobility'),
 M('b4',n('五勞七傷往後瞧','Look gently behind','Mirar suavemente hacia atrás','後ろを穏やかに見る','부드럽게 뒤 돌아보기'),['雙手鬆放，腰部小幅右轉。','頸部不強扭，視線隨身體轉。'],['Relax the hands and turn the waist a little right.','Do not force the neck; let the gaze follow the trunk.'],P([-.4,1.05,.06],[.4,1.05,.06],[-.23,0,0],[.23,0,0],.32,.04),'mobility'),
 M('b5',n('搖頭擺尾去心火','Gentle side-to-side shift','Balanceo lateral suave','穏やかな左右の移動','부드러운 좌우 이동'),['淺蹲，雙手留在腿上方。','只小幅移重心，不甩頭或扭腰。'],['Use a shallow knee bend with hands above the thighs.','Shift weight gently without whipping the head or twisting hard.'],P([-.44,.95,.22],[.44,.95,.22],[-.4,0,0],[.4,0,0],-.14,.24),'balance'),
 M('b6',n('兩手攀足固腎腰（遊戲淺降）','Reach down comfortably, adapted','Bajar las manos con comodidad','両手を下げる・浅く','두 손 내리기, 얕게'),['雙手沿身前下降到大腿旁。','遊戲改為淺降，不彎腰摸腳或硬拉筋。'],['Lower the hands in front to beside the thighs.','This game uses a shallow adaptation, not a forced toe-touch.'],P([-.35,.85,.32],[.35,.85,.32],[-.25,0,0],[.25,0,0],0,.18),'mobility'),
 M('b7',n('攥拳怒目增氣力（慢練）','Slow controlled fist reach','Extender el puño con control','拳をゆっくり伸ばす','주먹 천천히 뻗기'),['左拳慢慢伸出，右拳在腰旁。','不咬牙、不憋氣、不猛衝。'],['Extend the left fist slowly with the right near the waist.','Do not clench the jaw, hold the breath or lunge forcefully.'],P([-.26,1.32,.6],[.34,1.05,.13],[-.4,0,0],[.4,0,0],-.1,.2),'coordination'),
 M('b8',n('背後七顛百病消（輕提跟）','Gentle heel raise','Elevar suavemente los talones','かかとを軽く上げる','뒤꿈치 가볍게 들기'),['雙腳小幅提跟，再緩慢回落。','不重摔、不跳躍；口訣不代表療效承諾。'],['Lift the heels only slightly and lower them slowly.','Do not stamp or jump; the verse does not promise treatment.'],P([-.33,1.04,.12],[.33,1.04,.12],[-.22,.035,0],[.22,.035,0],0,.01),'balance')
];

const sword = [
 M('sword-ready',n('持劍預備（虛擬道具）','Sword preparation, virtual prop','Preparación de espada virtual','剣の準備・仮想道具','검 준비, 가상 소품'),['右手握虛擬劍，左手在胸前。','保留周圍空間；不需真劍。'],['Hold the virtual sword in the right hand and the left before the chest.','Leave space around you; no real sword is needed.'],P([-.27,1.3,.28],[.35,1.04,.19]),'coordination'),
 M('sword-lift',n('起勢舉劍','Opening sword lift','Elevar la espada','起勢・剣を上げる','시작과 검 들기'),['右手緩抬，左手隨行。','劍尖由遊戲顯示，手腕不硬折。'],['Lift the right hand slowly and let the left follow.','The game shows the blade direction; keep the wrist comfortable.'],P([-.3,1.43,.3],[.3,1.57,.43],[-.23,0,0],[.23,0,0],0,.06),'mobility'),
 M('sword-point',n('弓步前指劍','Bow stance sword point','Apuntar la espada en arco','弓歩・前に剣を向ける','궁보에서 검 앞으로'),['右手向前，左手留在胸旁。','小弓步站穩，勿向前撲。'],['Reach the right hand forward and keep the left near the chest.','Use a small stable bow stance without leaning forward.'],P([-.27,1.42,.28],[.27,1.43,.59],[-.24,0,-.16],[.24,0,.35],.1,.14),'coordination'),
 M('sword-parry',n('左帶劍','Draw sword to left','Llevar la espada a la izquierda','左に剣を引く','검 왼쪽으로'),['右手帶過胸前向左移。','腰胯小幅左轉，勿用腕甩劍。'],['Draw the right hand across the chest towards the left.','Turn the hips a little left without flicking from the wrist.'],P([-.41,1.3,.24],[-.08,1.41,.48],[-.28,0,.08],[.24,0,-.12],-.3,.12),'coordination'),
 M('sword-open',n('側開劍','Open sword to side','Abrir la espada al lado','側方へ剣を開く','검 옆으로 열기'),['右手向側展開，左手平衡。','肩膀不聳起，手肘保留弧度。'],['Open the right hand to the side and use the left for balance.','Keep shoulders down and elbows softly curved.'],P([-.58,1.35,.21],[.75,1.45,.24],[-.31,0,0],[.31,0,0],.18,.1),'mobility'),
 M('sword-knee',n('獨立平劍（低抬腿）','Low knee, level sword','Rodilla baja y espada horizontal','低い独立・平剣','낮은 독립과 수평 검'),['左腳支撐，右腳小幅抬起。','右手向前，目光平視。'],['Support on the left foot and lift the right only a little.','Reach the right hand forward and look ahead.'],P([-.42,1.33,.2],[.3,1.52,.52],[-.2,0,0],[.2,.21,.14],0,.02),'balance'),
 M('sword-lower',n('回步落劍','Step back and lower sword','Retroceder y bajar la espada','戻って剣を下げる','뒤로 가며 검 내리기'),['右腳回地，右手緩落。','動作均勻，不突然收腕。'],['Place the right foot down and lower the right hand slowly.','Keep the motion even without snapping the wrist.'],P([-.27,1.3,.22],[.38,1.0,.28],[-.22,0,.1],[.22,0,-.23],-.07,.08),'coordination'),
 M('sword-close',n('收劍合式','Sword closing','Cerrar con la espada','剣を収める','검 마무리'),['右手回到身側，左手緩落。','雙腳平行，呼吸自然。'],['Return the right hand to the side and lower the left.','Set parallel feet and breathe naturally.'],P(), 'breath')
];

const qigong = [
 M('q-standing',n('舒適站樁','Comfortable standing','De pie con comodidad','無理のない立位','편안한 서기'),['雙腳平行，膝蓋不鎖死。','雙手鬆垂，呼吸保持自然。'],['Stand with parallel feet without locking the knees.','Let the hands hang softly and breathe naturally.'],P(), 'breath'),
 M('q-round',n('抱圓','Round holding posture','Postura redonda','円を抱く姿勢','둥글게 안기'),['雙臂在腹前抱圓。','手指、肩與肘皆放鬆。'],['Round the arms in front of the abdomen.','Relax fingers, shoulders and elbows.'],P([-.25,1.24,.38],[.25,1.24,.38],[-.23,0,0],[.23,0,0],0,.06),'breath'),
 M('q-open',n('開合呼吸練習','Open and close, natural breath','Abrir y cerrar con respiración natural','開閉と自然な呼吸','열고 닫기와 자연 호흡'),['雙手緩緩向側方開展。','不追求深呼吸，不憋氣。'],['Open both hands slowly to the sides.','Do not force deep breaths or hold the breath.'],P([-.66,1.26,.23],[.66,1.26,.23],[-.23,0,0],[.23,0,0],0,.06),'breath'),
 M('q-lift',n('托掌舒展','Lift palms gently','Elevar suavemente las palmas','掌を穏やかに上げる','손바닥 부드럽게 올리기'),['雙手向前上方托起。','升到舒適高度即可，勿聳肩。'],['Lift both palms forward and up.','Stop at a comfortable height without shrugging.'],P([-.3,1.75,.28],[.3,1.75,.28],[-.23,0,0],[.23,0,0],0,.03,.03),'mobility'),
 M('q-lower',n('鬆沉回落','Relax and lower','Relajar y bajar','緩めて下ろす','이완하고 내리기'),['雙手落至腹前，膝蓋稍鬆。','感受動作變慢，不壓低身體。'],['Lower the hands towards the abdomen and soften the knees.','Let the movement slow without forcing the body low.'],P([-.24,1.07,.33],[.24,1.07,.33],[-.23,0,0],[.23,0,0],0,.1),'breath'),
 M('q-close',n('收功（自然呼吸）','Closing, natural breath','Cierre con respiración natural','収功・自然な呼吸','마무리와 자연 호흡'),['雙手輕放腹前，雙腳站穩。','回到平常呼吸，結束這一節。'],['Rest the hands lightly in front of the abdomen and stand securely.','Return to your ordinary breathing and finish the section.'],P([-.1,1.08,.2],[.1,1.08,.25],[-.22,0,0],[.22,0,0],0,.02),'breath')
];

const chen = [
 clone(T.opening),
 M('chen-coat',n('懶扎衣（慢練）','Lazy tying coat, slow','Atar la chaqueta, lento','懶扎衣・ゆっくり','나찰의, 천천히'),['右臂向側方成圓弧，左手留在腹前。','用小幅腰轉，保持膝腳方向一致。'],['Round the right arm towards the side and keep the left before the abdomen.','Turn the waist gently with knees aligned to the toes.'],P([-.2,1.08,.34],[.68,1.36,.28],[-.3,0,-.08],[.34,0,.17],.28,.16),'coordination'),
 M('chen-seal',n('六封四閉（慢練）','Six sealing, four closing, slow','Seis sellos y cuatro cierres, lento','六封四閉・ゆっくり','육봉사폐, 천천히'),['雙手移向右前方，保持弧度。','身體隨腰平順轉動，不猛推。'],['Move both hands towards the right front with rounded arms.','Turn smoothly from the hips without shoving.'],P([-.03,1.24,.42],[.45,1.24,.45],[-.28,0,-.12],[.31,0,.24],.3,.16),'coordination'),
 clone(T.whip), clone(T.crane),
 M('chen-diagonal',n('斜行（小步）','Diagonal step, small','Paso diagonal corto','斜行・小さく','사행, 작은 걸음'),['左腳向斜前小步，左手鬆落。','右手在胸旁，肩胯協調。'],['Take a small diagonal step with the left foot and lower the left hand softly.','Keep the right hand beside the chest with coordinated shoulders and hips.'],P([-.48,1.02,.21],[.42,1.38,.3],[-.35,0,.3],[.21,0,-.13],-.28,.16),'balance'),
 clone(T.brushL), clone(T.closing)
];

// Numbering follows the Shizhong Society handbook on the memorial's domain.
// Its unnumbered connecting/repeated movements are retained as metadata, not
// silently counted as additional numbered forms. Targets are game-authored.
const named = (base,name) => ({...clone(base),name});
const C37 = {
 start:named(T.opening,n('預備式・起勢','Preparation and opening','Preparación y apertura','予備式・起勢','준비와 시작')),
 shoulder:named(T.shoulder,n('靠','Shoulder alignment','Alineación del hombro','靠','어깨 정렬')),
 raise:named(T.raise,n('提手','Raise hands','Elevar las manos','提手','손 들어 올리기')),
 cloudL:named(T.cloudL,n('左雲手','Cloud hands left','Manos como nubes, izquierda','左雲手','왼쪽 운수')),
 cloudR:named(T.cloudR,n('右雲手','Cloud hands right','Manos como nubes, derecha','右雲手','오른쪽 운수')),
 snake:named(T.snake,n('單鞭下勢','Low single whip, shallow','Látigo bajo, flexión suave','単鞭下勢','단편하세')),
 roosterR:named(T.roosterL,n('右金雞獨立','Right golden rooster, low knee','Gallo dorado derecho, rodilla baja','右金鶏独立','오른쪽 금계독립')),
 roosterL:named(T.roosterR,n('左金雞獨立','Left golden rooster, low knee','Gallo dorado izquierdo, rodilla baja','左金鶏独立','왼쪽 금계독립')),
 kickR:M('separate-right',n('右分腳','Separate right foot, low','Separar el pie derecho, bajo','右分脚','오른발 나누기'),['左腳站穩，右腳向右前方低幅伸出。','雙臂舒展，身體不要後仰；不追求高踢。'],['Stand on the left foot and extend the right foot low towards the right front.','Open the arms without leaning back; do not aim for a high kick.'],P([-.57,1.45,.22],[.63,1.42,.24],[-.2,0,0],[.39,.19,.3],.12,.03),'balance'),
 kickL:M('separate-left',n('左分腳','Separate left foot, low','Separar el pie izquierdo, bajo','左分脚','왼발 나누기'),['右腳站穩，左腳向左前方低幅伸出。','雙臂舒展，落腳時保持受控。'],['Stand on the right foot and extend the left foot low towards the left front.','Open the arms and lower the foot under control.'],P([-.63,1.42,.24],[.57,1.45,.22],[-.39,.19,.3],[.2,0,0],-.12,.03),'balance'),
 turnKick:M('turn-heel',n('轉身蹬腳','Turn and heel kick, low','Girar y patear con el talón, bajo','転身蹬脚・低く','몸 돌려 낮은 뒤꿈치 차기'),['先站穩再小幅轉腰，左腳低伸。','遊戲只示意端點，不重現完整轉身；真人不強扭支撐膝。'],['Stabilise before a small waist turn and extend the left foot low.','This endpoint illustration does not reproduce the complete turn; never force the support knee.'],P([-.59,1.43,.25],[.59,1.4,.24],[-.24,.2,.43],[.22,0,-.03],-.3,.04),'balance'),
 downPunch:M('plant-punch',n('進步栽捶','Step and downward punch','Avanzar y golpear hacia abajo','進歩栽捶','진보재추'),['左腳小步向前，右手向前下方慢落。','淺屈膝、背部保持長，不彎腰衝向地面。'],['Take a small left step and lower the right hand slowly forward.','Bend the knees shallowly and keep a long back instead of lunging at the ground.'],P([-.43,1.03,.2],[.23,.93,.43],[-.25,0,.33],[.23,0,-.14],-.16,.2),'coordination'),
 shuttle1:named(T.shuttle,n('玉女穿梭一','Fair lady works shuttles 1','La dama trabaja en el telar 1','玉女穿梭一','옥녀천사 1')),
 shuttle2:M('shuttle-2',n('玉女穿梭二','Fair lady works shuttles 2','La dama trabaja en el telar 2','玉女穿梭二','옥녀천사 2'),['右手在額旁，左掌慢向斜前。','穩定換重心；此遊戲轉腰角度縮小。'],['Keep the right hand beside the forehead and move the left palm diagonally forward.','Transfer weight steadily; this game reduces the turning angle.'],P([-.25,1.35,.53],[.32,1.83,.2],[-.28,0,.34],[.26,0,-.15],-.24,.12),'coordination'),
 shuttle3:M('shuttle-3',n('玉女穿梭三','Fair lady works shuttles 3','La dama trabaja en el telar 3','玉女穿梭三','옥녀천사 3'),['左手護額側，右掌慢慢向前。','以舒適步幅配合轉腰，不扭轉膝蓋。'],['Guard beside the forehead with the left hand and reach forward with the right palm.','Coordinate a comfortable step and waist turn without twisting the knee.'],P([-.34,1.79,.19],[.29,1.37,.5],[-.24,0,-.15],[.32,0,.3],.36,.13),'coordination'),
 shuttle4:M('shuttle-4',n('玉女穿梭四','Fair lady works shuttles 4','La dama trabaja en el telar 4','玉女穿梭四','옥녀천사 4'),['右手護額側，左掌慢慢向前。','兩肩放鬆，步腳保持穩定。'],['Guard beside the forehead with the right hand and reach forward with the left palm.','Relax both shoulders and stabilise the feet.'],P([-.29,1.37,.5],[.34,1.79,.19],[-.32,0,.3],[.24,0,-.15],-.36,.13),'coordination'),
 seven:M('seven-stars',n('上步七星','Step up to seven stars','Avanzar a las siete estrellas','上歩七星','상보칠성'),['前腳輕點，雙手在胸前交叉。','腰背中正，不靠前傾來伸手。'],['Touch lightly with the front foot and cross the hands before the chest.','Keep the trunk upright rather than leaning to reach.'],P([.04,1.43,.42],[-.04,1.36,.47],[-.2,0,.28],[.22,0,-.11],-.05,.09),'balance'),
 rideTiger:M('ride-tiger',n('退步跨虎','Step back and ride tiger','Retroceder y montar al tigre','退歩跨虎','퇴보과호'),['右腳向後小步，右手向額側舒展。','左手鬆落，維持穩定支撐。'],['Take a small right step back and open the right hand beside the forehead.','Lower the left hand gently while maintaining stable support.'],P([-.47,1.08,.14],[.41,1.78,.16],[-.21,0,.15],[.27,0,-.27],.18,.08),'balance'),
 lotus:M('lotus-turn',n('轉身擺蓮','Turn and sweep lotus, low','Girar y barrer el loto, bajo','転身擺蓮・低く','몸 돌려 낮은 연꽃 쓸기'),['先穩定左腳，右腳低幅向側方開。','遊戲採低抬腿端點，不示範完整旋轉或拍腳。'],['Stabilise the left foot and open the right foot low to the side.','The game uses a low-lift endpoint, not a complete spin or foot slap.'],P([-.25,1.38,.44],[.53,1.42,.3],[-.22,0,0],[.46,.18,.16],.29,.04),'balance'),
 bowTiger:M('bow-tiger',n('彎躬射虎','Draw bow and shoot tiger','Tensar el arco y apuntar al tigre','彎弓射虎','만궁사호'),['左手向斜前，右手留在額旁。','用舒適弓步與小幅轉腰；不拉緊肩頸。'],['Reach the left hand diagonally forward and keep the right near the forehead.','Use a comfortable bow stance and small waist turn without tensing the neck.'],P([-.48,1.36,.45],[.35,1.7,.12],[-.27,0,.3],[.26,0,-.15],-.22,.14),'coordination')
};
const numbered37 = (move, number, continuations=[]) => ({...clone(move),sourceNumber:number,continuations:continuations.map(m=>({name:clone(m.name),pose:clone(m.pose)}))});
const cheng37 = [C37.start,T.wardL,T.wardR,T.rollback,T.press,T.push,T.whip,C37.raise,C37.shoulder,T.crane,T.brushL,T.lute,T.punch,T.closeup,T.cross,T.tiger,T.elbow,T.monkeyR,T.monkeyL,T.flying,C37.cloudL,C37.cloudR,C37.snake,C37.roosterR,C37.roosterL,C37.kickR,C37.kickL,C37.turnKick,C37.downPunch,C37.shuttle1,C37.shuttle2,C37.shuttle3,C37.shuttle4,C37.seven,C37.rideTiger,C37.lotus,C37.bowTiger].map((move,i)=>numbered37(move,i+1,({12:[T.brushL],16:[T.rollback,T.press,T.push,T.diagonalWhip],19:[T.monkeyR],22:[T.cloudL],28:[T.brushL,T.brushR],29:[T.wardR,T.rollback,T.press,T.push,T.whip],33:[T.wardL,T.wardR,T.rollback,T.press,T.push,T.snake],37:[T.punch,T.closeup,T.cross,T.closing]})[i+1]||[]));
for(let i=1;i<=5;i++) cheng37[i].name.zh=`攬雀尾・${cheng37[i].name.zh}`;
for(const move of cheng37) move.sourceName=move.name.zh;

const course = (id,name,description,sourceNote,moves) => ({id,name,description,verified:false,sourceNote,moves:moves.map((m,i)=>({...clone(m),id:`${id}-${String(i+1).padStart(2,'0')}-${m.id}`}))});
const demoNote = {zh:'遊戲入門節目；關鍵姿勢、插值動畫與要領由本遊戲編寫，未經拳師或教練驗證，不是完整套路或實戰教學。',en:'Introductory game sections. Pose targets, interpolated animation and cues are game-authored and not validated by an instructor; this is not a complete form or combat lesson.'};

export const defaultCurriculumId = 'cheng37';
export const curricula = [
 course('cheng37',n('鄭曼青太極 · 37 式','Cheng Man-ching tai chi · 37 forms','Taichí de Cheng Man-ching · 37 formas','鄭曼青太極拳・37式','정만청 태극권 · 37식'),
   {zh:'預設 37 式的招名與編號依時中學社《學員手冊》。每式練習一個遊戲目標姿勢；重複、過渡及收式另存資料，並未完整演出，請跟隨實際老師學習完整套路。',en:'The 37 names and numbers follow the Shizhong Society handbook. Each game section practises one target pose; repeats, connecting movements and closing are retained as metadata, not fully animated. Learn the complete form with your instructor.'},
   {zh:'名稱與編號：鄭曼青紀念館同網域之時中學社《學員手冊》。第4式以常用字「捋」表示；第37式保留來源「彎躬射虎」。三維端點與插值是遊戲原創，未經拳師核可。',en:'Names and numbering: Shizhong Society handbook on the Cheng memorial domain. The conventional character 捋 is used for form 4; source spelling 彎躬射虎 is retained for form 37. Game-authored 3D endpoints and interpolation are not instructor-validated.'},cheng37),
 course('tai12',n('簡易太極 · 12 節遊戲編排','Simple tai chi · 12 game sections','Taichí sencillo · 12 secciones','簡易太極・ゲーム12節','쉬운 태극권 · 게임 12절'),
   {zh:'12 節短練習，選取易操作的太極手法與步法；並非某一流派的公定 12 式。',en:'Twelve short sections of accessible tai chi handwork and footwork, not a certified twelve-posture lineage form.'},demoNote,
   [T.prepare,T.opening,T.partMane,T.crane,T.brushL,T.brushR,T.lute,T.monkeyR,T.cloudL,T.cloudR,T.cross,T.closing]),
 course('baduanjin',n('八段錦 · 8 段','Baduanjin · eight brocades','Baduanjin · ocho brocados','八段錦・8段','팔단금 · 8단'),
   {zh:'八個傳統招名已對照體育總局資料；遊戲採淺蹲與舒適幅度的改編姿勢。口訣中的臟器與疾病字眼不代表療效。',en:'Eight traditional names checked against the sports administration source. This game adapts them to shallow, comfortable poses; organ and disease wording in the verses is not a medical claim.'},
   {zh:'招名來源：國家體育總局〈八段錦定式動作〉。名稱可核對；三維姿勢及淺降改編並非該機構審定教材。',en:'Names: General Administration of Sport, Baduanjin fixed postures. Names are sourced; these 3D poses and shallow adaptations are not an endorsed teaching resource.'},eight),
 course('taekwondo',n('跆拳道 · 基本慢練','Taekwondo · slow basics','Taekwondo · fundamentos lentos','テコンドー・基本をゆっくり','태권도 · 느린 기본 동작'),
   {zh:'準備、格擋、慢速正拳與低前踢；不是品勢或對打實技教學。',en:'Preparation, blocks, a slow straight punch and a low front kick; not a poomsae or practical sparring lesson.'},
   {zh:'部分技術名稱對照國技院用語；順序與慢練姿勢是本遊戲設計。',en:'Selected names refer to Kukkiwon terminology; the sequence and slow poses are game-authored.'},[K.ready,K.lowblock,K.middleblock,K.highblock,K.punch,K.knee,K.kick,K.guard]),
 course('judo',n('柔道 · 站姿與步法','Judo · stance and footwork','Judo · postura y desplazamiento','柔道・姿勢と足運び','유도 · 자세와 발걸음'),
   {zh:'立禮、自然體、自護體與進退轉身；此課程不演投技、受身或摔落。',en:'Standing bow, natural and defensive stances, stepping and turning. This course does not demonstrate throws, breakfalls or landings.'},
   {zh:'名稱及基本動作範圍參考全日本柔道連盟授業資料；只作遊戲站姿與步法練習。',en:'Basic movement categories refer to All Japan Judo Federation teaching resources; this game covers stance and footwork only.'},[J.bow,J.natural,J.defensive,J.advance,J.retreat,J.turn]),
 course('sumo',n('相撲 · 低幅基本動作','Sumo · low-range basics','Sumo · fundamentos de amplitud baja','相撲・小さな基本動作','스모 · 작은 기본 동작'),
   {zh:'基本站姿、低四股、摺足與空練鐵砲；不使用碰撞或真實摔跤。',en:'Base stance, low shiko, sliding steps and air teppo; no collisions or real wrestling.'},
   {zh:'四股、摺足、鐵砲名稱參考日本相撲協會；小幅改編不等於官方健康體操全套。',en:'Shiko, suriashi and teppo names refer to the Japan Sumo Association; these low-range adaptations are not its full official exercise sequence.'},[S.stance,S.shikoL,S.shikoR,S.slide,S.teppo,S.ritual]),
 course('martial',n('東方武術 · 基本手步法','East Asian martial arts · basic movement','Artes marciales de Asia oriental · fundamentos','東洋武術・基本動作','동양 무술 · 기본 동작'),
   {zh:'以中國武術手步法為主的入門遊戲，不把各國流派視為同一拳種。',en:'An introductory game focused on Chinese martial handwork and stances, without treating all regional traditions as one style.'},demoNote,
   [W.salute,W.horse,W.bowpunch,W.empty,W.palm,W.knee,W.side,T.closing]),
 course('taijisword',n('太極劍 · 虛擬劍慢練','Tai chi sword · virtual slow practice','Espada de taichí · práctica virtual lenta','太極剣・仮想剣の練習','태극검 · 가상 검 느린 연습'),
   {zh:'八個虛擬劍操作練習節；沒有宣稱對應鄭子劍或競賽 32 式的完整套路。',en:'Eight virtual sword-control sections, not a complete Cheng sword or competition 32-sword form.'},demoNote,sword),
 course('qigong',n('氣功 · 自然呼吸舒展','Qigong · natural breath and movement','Qigong · respiración natural y movimiento','気功・自然な呼吸と動き','기공 · 자연 호흡과 움직임'),
   {zh:'六節自然呼吸與緩慢舒展；不使用憋氣或強迫深呼吸。',en:'Six gentle movement and natural-breathing sections without breath holding or forced deep breathing.'},demoNote,qigong),
 course('chen',n('陳氏太極 · 8 節慢練','Chen tai chi · eight slow sections','Taichí Chen · ocho secciones lentas','陳式太極・ゆっくり8節','진식 태극권 · 느린 8절'),
   {zh:'8 個招名參考陳正雷公開 8 式表；程序姿勢不重現纏絲、發勁或完整身法。',en:'Eight names refer to Chen Zhenglei\'s published eight-form list. Procedural poses do not reproduce silk-reeling, power release or the complete body method.'},
   {zh:'招名和排列參考 Chen Zhenglei Ltd 的 8 Form；動畫是本遊戲的低幅姿勢，非授權動作教材。',en:'Names and order refer to Chen Zhenglei Ltd\'s 8 Form. Animation is this game\'s low-range pose design, not an authorised movement lesson.'},chen),
 course('shaolin',n('少林武術 · 入門手步法遊戲','Shaolin-inspired · beginner movement','Inspirado en Shaolin · movimientos básicos','少林風・入門動作ゲーム','소림풍 · 입문 동작 게임'),
   {zh:'以馬步、弓步、沖拳等常見武術基本動作設計遊戲；不冒稱少林寺正式套路或師承。',en:'A game built from common stances and handwork such as horse stance, bow stance and punching; not an official Shaolin Temple form or lineage course.'},
   {zh:'通用基本手步法為遊戲編排；未取得少林寺課程或動作授權，非完整少林拳譜。',en:'Generic handwork and stance exercises arranged for the game; no Shaolin Temple syllabus or motion endorsement, and no complete Shaolin form.'},
   [W.salute,W.horse,W.bowpunch,W.knee,W.blockpunch,W.empty,W.side,T.closing]),
 course('yang',n('楊氏太極 · 選招慢練','Yang tai chi · selected slow sections','Taichí Yang · secciones lentas seleccionadas','楊式太極・選択動作','양식 태극권 · 선택 동작'),
   {zh:'選取楊氏常見招名；與完整 103 式或其他短套路不同。',en:'Selected common Yang names, distinct from the full 103-posture form or another short form.'},
   {zh:'名稱參考 Yang Family Tai Chi 公開手拳表；8 節選招、要領與程序姿勢為本遊戲編排。',en:'Names refer to published Yang Family Tai Chi hand-form lists; these eight selected sections, cues and procedural targets are game-arranged.'},
   [T.opening,T.wardL,T.whip,T.crane,T.brushL,T.lute,T.fan,T.closing]),
 course('dance',n('廣場舞 · 輕步節奏','Square dance · gentle rhythm','Baile en grupo · ritmo suave','広場ダンス・やさしいリズム','광장 춤 · 부드러운 리듬'),
   {zh:'原創八節輕步擺臂組合，無商業歌曲或別人舞蹈編排。',en:'An original eight-section tap-and-arm sequence, with no commercial song or copied choreography.'},
   {zh:'節奏動作及順序為本遊戲原創，非任何特定歌曲舞蹈的重製。',en:'Movement and order are original to this game, not a reproduction of a particular song\'s choreography.'},
   [D.sideL,D.sideR,D.forward,D.back,D.open,D.knee,D.turn,D.finish])
];

const descriptions = {
 cheng37:{ja:'時中学社の学員手冊にある37式の名称と番号を採用しました。各節はゲームの目標姿勢1つです。反復・つなぎ・収勢は資料に保存されていますが、完全には演じません。全套路は先生から学んでください。',ko:'시중학사 학원수책의 37식 이름과 번호를 따릅니다. 각 절은 게임 목표 자세 하나입니다. 반복, 연결, 마무리는 자료에 있지만 모두 애니메이션으로 재현하지는 않습니다. 완전한 투로는 선생님에게 배우세요.',es:'Los nombres y números de las 37 formas siguen el manual de Shizhong. Cada sección practica una postura objetivo. Repeticiones, enlaces y cierre figuran en los datos, pero no se animan por completo. Aprende la forma completa con tu profesor.'},
 tai12:{ja:'太極の手法と足運びを選んだ短い12節です。流派公認の12式ではありません。',ko:'태극권의 손동작과 발걸음을 고른 짧은 12절입니다. 유파 공인 12식은 아닙니다.',es:'Doce secciones breves de manos y pasos de taichí; no es una forma de doce posturas certificada por una escuela.'},
 baduanjin:{ja:'伝統の8招名を公的資料と照合しました。浅い姿勢に改編したゲームです。名称に含まれる臓器や病気の語は治療効果を保証しません。',ko:'전통 8개 동작 이름을 공식 자료와 대조했습니다. 게임은 얕고 편안한 자세로 바꿨습니다. 이름 속 장기나 질병 표현은 치료 효과를 보장하지 않습니다.',es:'Ocho nombres tradicionales contrastados con la fuente oficial. El juego usa posturas suaves; los órganos o enfermedades mencionados en los versos no son promesas médicas.'},
 taekwondo:{ja:'準備、受け、ゆっくりした正拳、低い前蹴りです。品勢や実戦組手の指導ではありません。',ko:'준비, 막기, 느린 지르기와 낮은 앞차기입니다. 품새나 실전 겨루기 지도는 아닙니다.',es:'Preparación, bloqueos, un puño lento y una patada frontal baja; no es una lección de poomsae ni combate real.'},
 judo:{ja:'立礼、自然体、自護体、前後の足運びと体さばきです。投げ技、受身、着地を示しません。',ko:'서서 인사, 자연체, 자호체, 앞뒤 발걸음과 몸 돌리기입니다. 메치기, 낙법, 착지는 보여 주지 않습니다.',es:'Saludo, posturas natural y defensiva, pasos y giros. No se muestran lanzamientos, caídas ni aterrizajes.'},
 sumo:{ja:'基本姿勢、低い四股、すり足、空での鉄砲です。衝突や実際の取組は行いません。',ko:'기본 자세, 낮은 시코, 스리아시와 허공 텟포입니다. 충돌이나 실제 씨름은 하지 않습니다.',es:'Postura básica, shiko bajo, pasos deslizantes y teppo al aire; sin choques ni lucha real.'},
 martial:{ja:'中国武術の手法と足運びを中心とした入門ゲームです。各国の伝統を同じ流派として扱いません。',ko:'중국 무술의 손동작과 발걸음을 중심으로 한 입문 게임입니다. 각국 전통을 하나의 유파로 취급하지 않습니다.',es:'Juego inicial centrado en manos y posturas de artes marciales chinas, sin agrupar todas las tradiciones regionales como una sola escuela.'},
 taijisword:{ja:'仮想剣を操作する8節です。鄭式剣や競技32式剣の完全な套路ではありません。',ko:'가상 검을 조작하는 8절입니다. 정식 검법이나 경기 32식 검법의 완전한 투로는 아닙니다.',es:'Ocho secciones para manejar una espada virtual; no es una forma completa de espada Cheng ni de competición de 32 movimientos.'},
 qigong:{ja:'自然な呼吸と緩やかな動きの6節です。息止めや無理な深呼吸は行いません。',ko:'자연 호흡과 부드러운 움직임의 6절입니다. 숨 참기나 강제 깊은 호흡은 하지 않습니다.',es:'Seis secciones de respiración natural y movimiento suave, sin retener el aire ni forzar respiraciones profundas.'},
 chen:{ja:'陳正雷の公開8式表の招名を参考にしています。纏絲や発勁、完全な身法を再現したものではありません。',ko:'진정뢰의 공개 8식 목록에서 이름을 참고했습니다. 전사, 발경, 완전한 몸 기술을 재현한 것은 아닙니다.',es:'Ocho nombres basados en la lista publicada de Chen Zhenglei. No se reproduce el enrollado de seda, la emisión de fuerza ni el método corporal completo.'},
 shaolin:{ja:'馬歩、弓歩、衝拳など共通の基本動作を使うゲームです。少林寺の正式套路や師承を主張しません。',ko:'마보, 궁보, 충권 등 일반적인 기본 동작을 쓰는 게임입니다. 소림사의 정식 투로나 계보를 주장하지 않습니다.',es:'Juego con fundamentos comunes como postura del caballo, arco y puño. No se presenta como forma oficial ni linaje del templo Shaolin.'},
 yang:{ja:'楊式でよく使われる招名を選びました。完全な103式や別の短套路ではありません。',ko:'양식에서 흔히 쓰는 동작 이름을 골랐습니다. 완전한 103식이나 다른 단축 투로는 아닙니다.',es:'Nombres comunes seleccionados de Yang; distinto de la forma completa de 103 posturas o de otra forma corta.'},
 dance:{ja:'軽い足運びと腕の動きを組み合わせた独自の8節です。商用曲や他者の振付を使用していません。',ko:'가벼운 발걸음과 팔동작을 조합한 독창적 8절입니다. 상업 음악이나 다른 사람의 안무를 사용하지 않았습니다.',es:'Ocho secciones originales de pasos suaves y brazos, sin canciones comerciales ni coreografía copiada.'}
};
const genericNotes={ja:'ゲーム独自の入門編です。招名の参考資料があっても、姿勢、補間アニメーション、要領は先生の検証を受けていません。完全な套路や実戦指導ではありません。',ko:'게임이 만든 입문 과정입니다. 이름 참고 자료가 있어도 자세, 보간 애니메이션, 요령은 지도자의 검증을 받지 않았습니다. 완전한 투로나 실전 지도는 아닙니다.',es:'Curso inicial creado para el juego. Aunque se citan fuentes para los nombres, las posturas, animaciones interpoladas e indicaciones no han sido validadas por un instructor. No es una forma completa ni instrucción de combate.'};
const specificNotes={
 cheng37:{ja:'名称と番号は鄭曼青記念館と同じドメインの時中学社・学員手冊を参照。第4式は通用字「捋」、第37式は原文の「彎躬射虎」。3D端点と補間はゲーム独自で、拳師未検証です。',ko:'이름과 번호는 정만청 기념관과 같은 도메인의 시중학사 학원수책을 참고합니다. 제4식은 통용자 捋, 제37식은 원문 彎躬射虎를 씁니다. 3D 끝점과 보간은 게임 제작 자료이며 권사의 검증을 받지 않았습니다.',es:'Nombres y números: manual de Shizhong, en el dominio del memorial de Cheng. La forma 4 usa 捋 y la 37 conserva 彎躬射虎. Los puntos 3D y la interpolación son propios del juego y no están validados por un instructor.'},
 baduanjin:{ja:'招名は国家体育総局の八段錦資料と照合しました。3D姿勢と浅い動作への改編は公式認定教材ではありません。',ko:'이름은 국가체육총국의 팔단금 자료와 대조했습니다. 3D 자세와 얕은 동작 각색은 공식 인증 교재가 아닙니다.',es:'Nombres contrastados con la Administración General del Deporte. Las posturas 3D y adaptaciones suaves no son material oficialmente aprobado.'},
 taekwondo:{ja:'一部の技名は国技院の用語を参考にしました。順序とゆっくりした姿勢はゲーム独自です。',ko:'일부 기술 이름은 국기원 용어를 참고했습니다. 순서와 느린 자세는 게임이 작성했습니다.',es:'Algunos nombres remiten a Kukkiwon; la secuencia y las posturas lentas son propias del juego.'},
 judo:{ja:'基本動作の範囲は全日本柔道連盟の資料を参考にしました。姿勢と足運びだけのゲームです。',ko:'기본 동작 범위는 전일본유도연맹 자료를 참고했습니다. 자세와 발걸음만 다루는 게임입니다.',es:'Las categorías básicas remiten a la Federación Japonesa de Judo; el juego solo cubre posturas y desplazamientos.'},
 sumo:{ja:'四股、すり足、鉄砲の名称は日本相撲協会を参考にしました。公式健康体操の全套ではありません。',ko:'시코, 스리아시, 텟포 이름은 일본스모협회를 참고했습니다. 공식 건강 체조 전체는 아닙니다.',es:'Shiko, suriashi y teppo remiten a la Asociación Japonesa de Sumo; no es su secuencia completa de gimnasia.'},
 chen:{ja:'招名と順序はChen Zhenglei Ltdの8式表を参考にしました。動作教材の承認を受けていません。',ko:'이름과 순서는 Chen Zhenglei Ltd의 8식 목록을 참고했습니다. 동작 교재의 승인을 받지 않았습니다.',es:'Nombres y orden basados en las ocho formas de Chen Zhenglei Ltd; no es material de movimiento autorizado.'},
 yang:{ja:'招名はYang Family Tai Chiの公開表を参考にしました。8節の選択と姿勢は独自です。',ko:'이름은 Yang Family Tai Chi의 공개 목록을 참고했습니다. 8절 선택과 자세는 자체 제작입니다.',es:'Nombres basados en las listas públicas de Yang Family Tai Chi; la selección de ocho secciones y sus posturas son propias.'},
 dance:{ja:'動作と順序はゲーム独自の創作です。特定の曲のダンスを再製したものではありません。',ko:'동작과 순서는 게임의 독창적 창작입니다. 특정 노래의 춤을 재현한 것이 아닙니다.',es:'Los movimientos y su orden son originales del juego, no una reproducción de una danza de canción concreta.'}
};
const extraMoveNames=Object.fromEntries(`
Preparation and opening|Préparation et ouverture|Vorbereitung und Eröffnung|Preparação e abertura
Left ward-off|Parer à gauche|Links abwehren|Aparar à esquerda
Right ward-off|Parer à droite|Rechts abwehren|Aparar à direita
Roll back|Dévier vers l’arrière|Nach hinten ableiten|Desviar para trás
Press|Presser|Drücken|Pressionar
Push|Pousser|Schieben|Empurrar
Single whip|Simple fouet|Einfache Peitsche|Chicote simples
Raise hands|Lever les mains|Hände heben|Elevar as mãos
Shoulder alignment|Alignement de l’épaule|Schulter ausrichten|Alinhamento do ombro
White crane spreads wings|La grue blanche déploie ses ailes|Weißer Kranich breitet die Flügel aus|A garça branca abre as asas
Left brush knee and push|Brosser le genou gauche et pousser|Links Knie streifen und schieben|Escovar o joelho esquerdo e empurrar
Play the lute|Jouer du luth|Laute spielen|Tocar o alaúde
Step, parry and punch|Avancer, parer et frapper|Schritt, Abwehr und Fauststoß|Avançar, aparar e golpear
Apparent close-up|Fermer et protéger|Schließen und schützen|Fechar e proteger
Cross hands|Croiser les mains|Hände kreuzen|Cruzar as mãos
Embrace tiger, return to mountain|Embrasser le tigre, retourner à la montagne|Tiger umarmen, zum Berg zurückkehren|Abraçar o tigre e voltar à montanha
Diagonal single whip|Simple fouet diagonal|Diagonale einfache Peitsche|Chicote simples diagonal
Fist under elbow|Poing sous le coude|Faust unter dem Ellbogen|Punho sob o cotovelo
Right repulse monkey|Repousser le singe à droite|Rechts den Affen abwehren|Repelir o macaco à direita
Left repulse monkey|Repousser le singe à gauche|Links den Affen abwehren|Repelir o macaco à esquerda
Diagonal flying|Vol en diagonale|Diagonales Fliegen|Voo diagonal
Cloud hands left|Mains comme des nuages à gauche|Wolkenhände links|Mãos como nuvens à esquerda
Cloud hands right|Mains comme des nuages à droite|Wolkenhände rechts|Mãos como nuvens à direita
Low single whip, shallow|Simple fouet bas, flexion légère|Tiefe Peitsche, leichte Beugung|Chicote baixo, flexão suave
Right golden rooster, low knee|Coq doré à droite, genou bas|Goldener Hahn rechts, Knie niedrig|Galo dourado à direita, joelho baixo
Left golden rooster, low knee|Coq doré à gauche, genou bas|Goldener Hahn links, Knie niedrig|Galo dourado à esquerda, joelho baixo
Separate right foot, low|Séparer le pied droit, bas|Rechten Fuß niedrig abspreizen|Separar o pé direito, baixo
Separate left foot, low|Séparer le pied gauche, bas|Linken Fuß niedrig abspreizen|Separar o pé esquerdo, baixo
Turn and heel kick, low|Tourner et pousser le talon, bas|Drehen und niedriger Fersenstoß|Rodar e chutar com o calcanhar, baixo
Right brush knee and push|Brosser le genou droit et pousser|Rechts Knie streifen und schieben|Escovar o joelho direito e empurrar
Step and downward punch|Avancer et frapper vers le bas|Schritt und Fauststoß nach unten|Avançar e golpear para baixo
Fair lady works shuttles 1|La dame tisse 1|Die Weberin 1|A dama tece 1
Fair lady works shuttles 2|La dame tisse 2|Die Weberin 2|A dama tece 2
Fair lady works shuttles 3|La dame tisse 3|Die Weberin 3|A dama tece 3
Fair lady works shuttles 4|La dame tisse 4|Die Weberin 4|A dama tece 4
Step up to seven stars|Avancer vers les sept étoiles|Zu den sieben Sternen vortreten|Avançar para as sete estrelas
Step back and ride tiger|Reculer et chevaucher le tigre|Zurücktreten und den Tiger reiten|Recuar e montar o tigre
Turn and sweep lotus, low|Tourner et balayer le lotus, bas|Drehen und niedriger Lotusfeger|Rodar e varrer o lótus, baixo
Draw bow and shoot tiger|Tendre l’arc et viser le tigre|Bogen spannen und auf den Tiger zielen|Armar o arco e mirar o tigre
Closing|Fermeture|Abschluss|Encerramento
Preparation|Préparation|Vorbereitung|Preparação
Opening|Ouverture|Eröffnung|Abertura
Part wild horse mane|Séparer la crinière du cheval sauvage|Mähne des Wildpferdes teilen|Separar a crina do cavalo selvagem
Raise both hands to the sky|Lever les deux mains vers le ciel|Beide Hände zum Himmel heben|Elevar as duas mãos ao céu
Draw the bow to either side|Tendre l’arc de chaque côté|Bogen zu beiden Seiten spannen|Armar o arco para os dois lados
Raise one hand|Lever une main|Eine Hand heben|Elevar uma mão
Look gently behind|Regarder doucement derrière|Sanft nach hinten schauen|Olhar suavemente para trás
Gentle side-to-side shift|Déplacement doux d’un côté à l’autre|Sanfte Verlagerung von Seite zu Seite|Deslocamento suave entre os lados
Reach down comfortably, adapted|Descendre les mains sans forcer, adapté|Bequem nach unten greifen, angepasst|Alcançar abaixo sem forçar, adaptado
Slow controlled fist reach|Allonger le poing lentement|Langsamer kontrollierter Fauststoß|Estender o punho devagar e com controlo
Gentle heel raise|Lever doucement les talons|Fersen sanft heben|Elevar suavemente os calcanhares
Ready stance|Position de préparation|Bereitschaftsstellung|Posição de preparação
Low block · Arae-makgi|Blocage bas · Arae-makgi|Tiefer Block · Arae-makgi|Bloqueio baixo · Arae-makgi
Middle block · Momtong-makgi|Blocage médian · Momtong-makgi|Mittlerer Block · Momtong-makgi|Bloqueio médio · Momtong-makgi
High block · Eolgul-makgi|Blocage haut · Eolgul-makgi|Hoher Block · Eolgul-makgi|Bloqueio alto · Eolgul-makgi
Straight punch · Jireugi, slow|Coup de poing droit · Jireugi, lent|Gerader Fauststoß · Jireugi, langsam|Soco direto · Jireugi, lento
Front-kick preparation, low knee|Préparation du coup de pied avant, genou bas|Vorbereitung Fronttritt, Knie niedrig|Preparação do chute frontal, joelho baixo
Low front kick · Ap-chagi|Coup de pied avant bas · Ap-chagi|Niedriger Fronttritt · Ap-chagi|Chute frontal baixo · Ap-chagi
Return to guard|Revenir en garde|Zur Deckung zurückkehren|Voltar à guarda
Standing bow|Salut debout|Verbeugung im Stand|Saudação em pé
Natural stance|Posture naturelle|Natürliche Stellung|Postura natural
Defensive stance, shallow|Posture défensive, flexion légère|Verteidigungsstellung, leicht gebeugt|Postura defensiva, flexão suave
Advance step|Pas en avant|Schritt vorwärts|Passo em frente
Retreat step|Pas en arrière|Schritt rückwärts|Passo atrás
Body turning footwork|Pas et rotation du corps|Schritte mit Körperdrehung|Passos com rotação do corpo
Sumo base stance|Posture de base du sumo|Sumo-Grundstellung|Postura básica de sumô
Left shiko, low lift|Shiko gauche, levée basse|Shiko links, niedrig heben|Shiko esquerdo, elevação baixa
Right shiko, low lift|Shiko droit, levée basse|Shiko rechts, niedrig heben|Shiko direito, elevação baixa
Sliding step · Suriashi|Pas glissé · Suriashi|Gleitschritt · Suriashi|Passo deslizante · Suriashi
Teppo, air-palm practice|Teppo, paume dans le vide|Teppo, Handflächenübung in der Luft|Teppo, palma no ar
Return and breathe|Revenir et respirer|Zurückkehren und atmen|Voltar e respirar
Fist-and-palm salute|Salut du poing et de la paume|Faust-Handflächen-Gruß|Saudação de punho e palma
Horse stance, shallow|Posture du cavalier, flexion légère|Reiterstellung, leicht gebeugt|Postura do cavalo, flexão suave
Bow stance punch, slow|Coup de poing en posture d’arc, lent|Fauststoß im Bogenschritt, langsam|Soco na postura de arco, lento
Empty stance and lifting palm|Posture vide et paume montante|Leere Stellung und Handfläche heben|Postura vazia e palma elevada
Forward palm reach|Paume vers l’avant|Handfläche nach vorne führen|Palma para a frente
Low knee lift and palm|Genou bas et paume|Knie niedrig heben und Handfläche führen|Joelho baixo e palma
Side step and open palms|Pas de côté et paumes ouvertes|Seitwärtsschritt und Handflächen öffnen|Passo lateral e palmas abertas
Sword preparation, virtual prop|Préparer l’épée virtuelle|Vorbereitung mit virtuellem Schwert|Preparação com espada virtual
Opening sword lift|Lever l’épée à l’ouverture|Schwert zur Eröffnung heben|Elevar a espada na abertura
Bow stance sword point|Pointer l’épée en posture d’arc|Schwert im Bogenschritt ausrichten|Apontar a espada na postura de arco
Draw sword to left|Ramener l’épée à gauche|Schwert nach links ziehen|Trazer a espada à esquerda
Open sword to side|Ouvrir l’épée sur le côté|Schwert zur Seite öffnen|Abrir a espada para o lado
Low knee, level sword|Genou bas, épée horizontale|Knie niedrig, Schwert waagerecht|Joelho baixo, espada horizontal
Step back and lower sword|Reculer et abaisser l’épée|Zurücktreten und Schwert senken|Recuar e baixar a espada
Sword closing|Clôture avec l’épée|Schwertabschluss|Encerramento com espada
Comfortable standing|Station debout confortable|Bequem stehen|Ficar em pé confortavelmente
Round holding posture|Posture d’étreinte arrondie|Runde Halteposition|Postura de abraço redondo
Open and close, natural breath|Ouvrir et fermer, respiration naturelle|Öffnen und schließen, natürlich atmen|Abrir e fechar, respiração natural
Lift palms gently|Lever doucement les paumes|Handflächen sanft heben|Elevar suavemente as palmas
Relax and lower|Détendre et abaisser|Entspannen und senken|Relaxar e baixar
Closing, natural breath|Clôture, respiration naturelle|Abschluss, natürliche Atmung|Encerramento, respiração natural
Lazy tying coat, slow|Attacher le manteau, lentement|Mantel locker binden, langsam|Atar o casaco, devagar
Six sealing, four closing, slow|Six fermetures, quatre clôtures, lent|Sechsmal versiegeln, viermal schließen, langsam|Seis selos e quatro fechos, devagar
Diagonal step, small|Petit pas diagonal|Kleiner Diagonalschritt|Pequeno passo diagonal
Horse stance block and punch|Blocage et poing en posture du cavalier|Block und Fauststoß in Reiterstellung|Bloqueio e soco na postura do cavalo
Fan through back|Éventail dans le dos|Fächer durch den Rücken|Leque pelas costas
Left side tap|Pointe latérale gauche|Links seitlich tippen|Toque lateral esquerdo
Right side tap|Pointe latérale droite|Rechts seitlich tippen|Toque lateral direito
Forward tap and arms|Pointe en avant et bras|Vorwärtstippen mit Armen|Toque em frente e braços
Back tap and arms|Pointe en arrière et bras|Rückwärtstippen mit Armen|Toque atrás e braços
Open the arms|Ouvrir les bras|Arme öffnen|Abrir os braços
Low knee and clap|Genou bas et claquement des mains|Knie niedrig und klatschen|Joelho baixo e palmas
Small waist turn and arms|Petite rotation de taille et bras|Kleine Taillendrehung mit Armen|Pequena rotação da cintura e braços
Return and relax|Revenir et se détendre|Zurückkehren und entspannen|Voltar e relaxar
`.trim().split('\n').map(line=>{const [key,fr,de,pt]=line.split('|');return [key,{fr,de,pt}];}));

const extraBenefits={
 balance:{fr:'Pratiquez les transferts de poids et l’équilibre : objectif général d’activité, sans effet thérapeutique démontré pour ce mouvement.',de:'Üben Sie Gewichtsverlagerung und Gleichgewicht; ein allgemeines Bewegungsziel, keine nachgewiesene Heilwirkung dieser Übung.',pt:'Pratique a transferência de peso e o equilíbrio; é um objetivo geral de exercício, não um efeito terapêutico comprovado deste movimento.'},
 coordination:{fr:'Pratiquez la coordination des bras, des jambes et du tronc ainsi que la mémoire des mouvements.',de:'Üben Sie die Koordination von Armen, Beinen und Rumpf sowie das Bewegungsgedächtnis.',pt:'Pratique a coordenação dos braços, pernas e tronco, além da memória dos movimentos.'},
 mobility:{fr:'Mobilisez épaules, hanches et tronc dans une amplitude confortable.',de:'Üben Sie Schulter-, Hüft- und Rumpfbeweglichkeit in angenehmem Umfang.',pt:'Pratique a mobilidade confortável dos ombros, ancas e tronco.'},
 breath:{fr:'Pratiquez la respiration naturelle, l’attention et un rythme de mouvement lent.',de:'Üben Sie natürliche Atmung, Aufmerksamkeit und einen langsamen Bewegungsrhythmus.',pt:'Pratique a respiração natural, a atenção e um ritmo de movimento lento.'},
 legs:{fr:'Pratiquez les appuis, les pas et la posture sans flexion profonde ni étirement forcé.',de:'Üben Sie Beinstütze, Schritte und Haltung ohne tiefe Kniebeugen oder erzwungenes Dehnen.',pt:'Pratique o apoio das pernas, os passos e a postura, sem agachamentos profundos nem alongamentos forçados.'},
 rhythm:{fr:'Pratiquez le rythme, la coordination gauche-droite et les mouvements doux du corps entier.',de:'Üben Sie Rhythmus, Links-rechts-Koordination und sanfte Ganzkörperbewegung.',pt:'Pratique o ritmo, a coordenação entre os lados e o movimento suave de todo o corpo.'}
};
const extraCourseNames={
 cheng37:['Tai-chi de Cheng Man-ching · 37 formes','Cheng-Man-ching-Tai-Chi · 37 Formen','Tai chi de Cheng Man-ching · 37 formas'],
 tai12:['Tai-chi simple · 12 séquences de jeu','Einfaches Tai-Chi · 12 Spielabschnitte','Tai chi simples · 12 secções de jogo'],
 baduanjin:['Baduanjin · huit brocarts','Baduanjin · acht Brokate','Baduanjin · oito brocados'],
 taekwondo:['Taekwondo · bases lentes','Taekwondo · langsame Grundlagen','Taekwondo · fundamentos lentos'],
 judo:['Judo · posture et déplacements','Judo · Haltung und Schritte','Judo · postura e passos'],
 sumo:['Sumo · bases de faible amplitude','Sumo · Grundlagen mit kleinem Umfang','Sumô · fundamentos de pequena amplitude'],
 martial:['Arts martiaux est-asiatiques · bases','Ostasiatische Kampfkunst · Grundlagen','Artes marciais do leste asiático · fundamentos'],
 taijisword:['Épée de tai-chi · pratique virtuelle lente','Tai-Chi-Schwert · langsame virtuelle Übung','Espada de tai chi · prática virtual lenta'],
 qigong:['Qigong · souffle naturel et mouvement','Qigong · natürliche Atmung und Bewegung','Qigong · respiração natural e movimento'],
 chen:['Tai-chi Chen · huit séquences lentes','Chen-Tai-Chi · acht langsame Abschnitte','Tai chi Chen · oito secções lentas'],
 shaolin:['Inspiration Shaolin · mouvements débutants','Shaolin-inspiriert · Einstiegsbewegungen','Inspiração Shaolin · movimentos iniciais'],
 yang:['Tai-chi Yang · mouvements choisis','Yang-Tai-Chi · ausgewählte langsame Abschnitte','Tai chi Yang · movimentos selecionados'],
 dance:['Danse collective · rythme doux','Gruppentanz · sanfter Rhythmus','Dança em grupo · ritmo suave']
};
const extraDescriptions={
 cheng37:['Les 37 noms et numéros suivent le manuel de Shizhong. Chaque séquence travaille une posture cible. Répétitions, transitions et clôture figurent dans les données mais ne sont pas entièrement animées. Apprenez la forme complète avec un professeur.','37 Namen und Nummern folgen dem Shizhong-Handbuch. Jeder Abschnitt übt eine Zielhaltung. Wiederholungen, Übergänge und Abschluss sind als Daten erhalten, aber nicht vollständig animiert. Lernen Sie die ganze Form bei einer Lehrkraft.','Os 37 nomes e números seguem o manual de Shizhong. Cada secção pratica uma postura alvo. Repetições, ligações e encerramento estão nos dados, mas não são totalmente animados. Aprenda a forma completa com um professor.'],
 tai12:['Douze séquences courtes de mains et de pas du tai-chi ; ce n’est pas une forme de douze postures certifiée par une école.','Zwölf kurze Abschnitte mit Tai-Chi-Hand- und Fußbewegungen; keine anerkannte Zwölferform einer Schule.','Doze secções curtas de mãos e passos de tai chi; não são uma forma de doze posturas certificada por uma escola.'],
 baduanjin:['Huit noms traditionnels vérifiés auprès de la source sportive officielle. Le jeu adapte les postures à une amplitude douce ; les organes ou maladies cités dans les noms ne constituent pas des promesses médicales.','Acht traditionelle Namen mit der offiziellen Sportquelle abgeglichen. Das Spiel verwendet sanfte Haltungen; Organ- und Krankheitsnamen sind keine medizinischen Versprechen.','Oito nomes tradicionais conferidos na fonte desportiva oficial. O jogo usa posturas suaves; órgãos ou doenças citados nos nomes não constituem promessas médicas.'],
 taekwondo:['Préparation, blocages, poing lent et coup de pied avant bas ; pas un cours de poomsae ou de combat réel.','Vorbereitung, Blocks, langsamer Fauststoß und niedriger Fronttritt; kein Poomsae- oder praktischer Kampfkurs.','Preparação, bloqueios, soco lento e chute frontal baixo; não é uma aula de poomsae nem de combate real.'],
 judo:['Salut debout, postures naturelle et défensive, pas et rotations. Aucune projection, chute ou réception n’est montrée.','Verbeugung, natürliche und defensive Haltung, Schritte und Drehungen. Keine Würfe, Falltechniken oder Landungen.','Saudação em pé, posturas natural e defensiva, passos e rotações. Não demonstra projeções, quedas nem aterragens.'],
 sumo:['Posture de base, shiko bas, pas glissés et teppo dans le vide ; sans collision ni lutte réelle.','Grundstellung, niedriger Shiko, Gleitschritte und Teppo in der Luft; keine Zusammenstöße und kein echtes Ringen.','Postura básica, shiko baixo, passos deslizantes e teppo no ar; sem colisões nem luta real.'],
 martial:['Jeu d’introduction centré sur les mains et les pas des arts martiaux chinois, sans assimiler toutes les traditions régionales.','Einstiegsspiel mit Schwerpunkt auf chinesischen Handtechniken und Stellungen; regionale Traditionen werden nicht zu einem Stil zusammengefasst.','Jogo inicial centrado nas mãos e posturas das artes marciais chinesas, sem tratar todas as tradições regionais como um só estilo.'],
 taijisword:['Huit séquences d’épée virtuelle, sans prétendre reproduire la forme complète de Cheng ni les 32 mouvements de compétition.','Acht Abschnitte mit virtuellem Schwert; keine vollständige Cheng-Schwertform oder 32er-Wettkampfform.','Oito secções de espada virtual; não reproduzem a forma completa de Cheng nem os 32 movimentos de competição.'],
 qigong:['Six séquences douces avec respiration naturelle, sans apnée ni respiration profonde forcée.','Sechs sanfte Bewegungsabschnitte mit natürlicher Atmung, ohne Luftanhalten oder erzwungene tiefe Atemzüge.','Seis secções de movimento suave e respiração natural, sem prender o ar nem forçar respirações profundas.'],
 chen:['Huit noms tirés de la liste publiée de Chen Zhenglei. Les poses ne reproduisent pas l’enroulement de la soie, l’émission de force ni toute la méthode corporelle.','Acht Namen nach der veröffentlichten Liste von Chen Zhenglei. Die Haltungen bilden weder Seidenwickeln noch Kraftabgabe oder die vollständige Körpermethode ab.','Oito nomes da lista publicada de Chen Zhenglei. As posturas não reproduzem o enrolar da seda, a emissão de força nem todo o método corporal.'],
 shaolin:['Jeu de postures et mouvements usuels, notamment cavalier, arc et poing ; aucune prétention de forme officielle ou de lignée du temple Shaolin.','Spiel mit üblichen Grundstellungen und Handbewegungen; kein Anspruch auf eine offizielle Form oder Lehrlinie des Shaolin-Tempels.','Jogo com posturas e movimentos comuns, como cavalo, arco e soco; não reivindica forma oficial nem linhagem do templo Shaolin.'],
 yang:['Noms usuels du style Yang sélectionnés ; ce n’est ni la forme complète de 103 postures ni une autre forme courte.','Ausgewählte gebräuchliche Yang-Namen; weder die vollständige 103er-Form noch eine andere Kurzform.','Nomes comuns selecionados do estilo Yang; não é a forma completa de 103 posturas nem outra forma curta.'],
 dance:['Huit séquences originales de pas doux et de bras, sans chanson commerciale ni chorégraphie copiée.','Acht eigene Abschnitte mit sanften Schritten und Armen, ohne kommerzielles Lied oder kopierte Choreografie.','Oito secções originais de passos suaves e braços, sem música comercial nem coreografia copiada.']
};
const extraSourceNames={
 cheng37:['Manuel de Shizhong, domaine du mémorial de Cheng','Shizhong-Handbuch auf der Cheng-Gedenkstätten-Domain','Manual de Shizhong, domínio do memorial de Cheng'],
 tai12:['Composition originale du jeu','Eigene Spielzusammenstellung','Composição original do jogo'],
 baduanjin:['Administration générale du sport : postures fixes du Baduanjin','Allgemeine Sportverwaltung: Baduanjin-Endhaltungen','Administração Geral do Desporto: posturas fixas do Baduanjin'],
 taekwondo:['Terminologie du Kukkiwon','Kukkiwon-Terminologie','Terminologia do Kukkiwon'],
 judo:['Ressources de la Fédération japonaise de judo','Lehrmaterial des japanischen Judoverbands','Materiais da Federação Japonesa de Judo'],
 sumo:['Noms de l’Association japonaise de sumo','Bezeichnungen des japanischen Sumoverbands','Nomes da Associação Japonesa de Sumô'],
 martial:['Mouvements généraux assemblés pour le jeu','Allgemeine Bewegungen für das Spiel zusammengestellt','Movimentos gerais reunidos para o jogo'],
 taijisword:['Séquences d’épée virtuelle originales','Eigene virtuelle Schwertabschnitte','Secções originais de espada virtual'],
 qigong:['Séquences douces originales','Eigene sanfte Bewegungsabschnitte','Secções suaves originais'],
 chen:['Liste des huit formes de Chen Zhenglei Ltd','Liste der acht Formen von Chen Zhenglei Ltd','Lista das oito formas de Chen Zhenglei Ltd'],
 shaolin:['Bases générales ; aucune autorisation du temple Shaolin','Allgemeine Grundlagen; keine Freigabe des Shaolin-Tempels','Fundamentos gerais; sem autorização do templo Shaolin'],
 yang:['Noms des listes de Yang Family Tai Chi','Namen aus Listen von Yang Family Tai Chi','Nomes das listas de Yang Family Tai Chi'],
 dance:['Mouvements et ordre originaux du jeu','Eigene Bewegungen und Reihenfolge des Spiels','Movimentos e ordem originais do jogo']
};
const extraNotes=[
 'Les cibles 3D, interpolations et indications sont créées pour le jeu, sans validation par un professeur. Ce n’est pas une animation complète certifiée ni un enseignement de combat.',
 '3D-Ziele, Übergangsanimationen und Hinweise sind für das Spiel erstellt und nicht von einer Lehrkraft geprüft. Keine zertifizierte vollständige Formanimation und kein Kampfunterricht.',
 'Os alvos 3D, interpolações e indicações foram criados para o jogo, sem validação de um professor. Não constituem animação completa certificada nem ensino de combate.'
];
for(const c of curricula){
 Object.assign(c.description,descriptions[c.id]);
 Object.assign(c.sourceNote,specificNotes[c.id]||genericNotes);
 for(const [i,lang] of ['fr','de','pt'].entries()){
  c.name[lang]=extraCourseNames[c.id][i];
  c.description[lang]=extraDescriptions[c.id][i];
  c.sourceNote[lang]=`${extraSourceNames[c.id][i]}. ${extraNotes[i]}`;
  for(const m of c.moves){
   if(!extraMoveNames[m.name.en]?.[lang]) throw new Error(`Missing movement translation: ${m.name.en}/${lang}`);
   m.name[lang]=extraMoveNames[m.name.en][lang];
   m.cues[lang]=poseCues(m.pose,lang);
   m.benefits[lang]=extraBenefits[m.benefitType][lang];
   for(const continuation of m.continuations||[]) Object.assign(continuation.name,extraMoveNames[continuation.name.en]);
  }
 }
}
// Simplified Chinese is preconverted from the complete Traditional Chinese
// curriculum at build time; no CDN or translation service is needed at runtime.
const simplifiedChinese = {
 "12 節短練習，選取易操作的太極手法與步法；並非某一流派的公定 12 式。": "12 节短练习，选取易操作的太极手法与步法；并非某一流派的公定 12 式。",
 "8 個招名參考陳正雷公開 8 式表；程序姿勢不重現纏絲、發勁或完整身法。": "8 个招名参考陈正雷公开 8 式表；程序姿势不重现缠丝、发劲或完整身法。",
 "一手在前、一手在肘旁，兩肘放鬆。": "一手在前、一手在肘旁，两肘放松。",
 "上格擋 · Eolgul-makgi": "上格挡 · Eolgul-makgi",
 "上身保持穩定，落腳輕柔。": "上身保持稳定，落脚轻柔。",
 "上身直立，不往後仰。": "上身直立，不往后仰。",
 "下格擋 · Arae-makgi": "下格挡 · Arae-makgi",
 "不咬牙、不憋氣、不猛衝。": "不咬牙、不憋气、不猛冲。",
 "不用多餘的力，準備前後移步。": "不用多余的力，准备前后移步。",
 "不聳肩、不憋氣；名稱為傳統口訣。": "不耸肩、不憋气；名称为传统口诀。",
 "不要追求抬高或用力跺腳。": "不要追求抬高或用力跺脚。",
 "不追求深呼吸，不憋氣。": "不追求深呼吸，不憋气。",
 "不重摔、不跳躍；口訣不代表療效承諾。": "不重摔、不跳跃；口诀不代表疗效承诺。",
 "不鎖肘，不衝擊真人或硬物。": "不锁肘，不冲击真人或硬物。",
 "中段格擋 · Momtong-makgi": "中段格挡 · Momtong-makgi",
 "五勞七傷往後瞧": "五劳七伤往后瞧",
 "以中國武術手步法為主的入門遊戲，不把各國流派視為同一拳種。": "以中国武术手步法为主的入门游戏，不把各国流派视为同一拳种。",
 "以舒適步幅配合轉腰，不扭轉膝蓋。": "以舒适步幅配合转腰，不扭转膝盖。",
 "以馬步、弓步、沖拳等常見武術基本動作設計遊戲；不冒稱少林寺正式套路或師承。": "以马步、弓步、冲拳等常见武术基本动作设计游戏；不冒称少林寺正式套路或师承。",
 "低抬膝與拍手": "低抬膝与拍手",
 "保持雙手護身，不仰腰。": "保持双手护身，不仰腰。",
 "保留周圍空間；不需真劍。": "保留周围空间；不需真剑。",
 "側步開掌": "侧步开掌",
 "側開劍": "侧开剑",
 "先穩定左腳，右腳低幅向側方開。": "先稳定左脚，右脚低幅向侧方开。",
 "先站穩再小幅轉腰，左腳低伸。": "先站稳再小幅转腰，左脚低伸。",
 "兩側拉長到舒適範圍，不屏息。": "两侧拉长到舒适范围，不屏息。",
 "兩手托天理三焦": "两手托天理三焦",
 "兩手攀足固腎腰（遊戲淺降）": "两手攀足固肾腰（游戏浅降）",
 "兩肩放鬆，步腳保持穩定。": "两肩放松，步脚保持稳定。",
 "兩腳回到平行，呼吸自然。": "两脚回到平行，呼吸自然。",
 "兩腳平行，慢慢回到中央。": "两脚平行，慢慢回到中央。",
 "兩臂舒展成圓弧，不鎖死手肘。": "两臂舒展成圆弧，不锁死手肘。",
 "兩邊交替時保持呼吸自然。": "两边交替时保持呼吸自然。",
 "八個傳統招名已對照體育總局資料；遊戲採淺蹲與舒適幅度的改編姿勢。口訣中的臟器與疾病字眼不代表療效。": "八个传统招名已对照体育总局资料；游戏采浅蹲与舒适幅度的改编姿势。口诀中的脏器与疾病字眼不代表疗效。",
 "八個虛擬劍操作練習節；沒有宣稱對應鄭子劍或競賽 32 式的完整套路。": "八个虚拟剑操作练习节；没有宣称对应郑子剑或竞赛 32 式的完整套路。",
 "八段錦 · 8 段": "八段锦 · 8 段",
 "六封四閉（慢練）": "六封四闭（慢练）",
 "六節自然呼吸與緩慢舒展；不使用憋氣或強迫深呼吸。": "六节自然呼吸与缓慢舒展；不使用憋气或强迫深呼吸。",
 "前腳輕點，上身保持中正。": "前脚轻点，上身保持中正。",
 "前腳輕點，手掌在胸前上提。": "前脚轻点，手掌在胸前上提。",
 "前腳輕點，肩膀保持水平。": "前脚轻点，肩膀保持水平。",
 "前腳輕點，重心留在後腳。": "前脚轻点，重心留在后脚。",
 "前腳輕點，雙手在胸前交叉。": "前脚轻点，双手在胸前交叉。",
 "前踢準備 · 低抬膝": "前踢准备 · 低抬膝",
 "前點步擺臂": "前点步摆臂",
 "劍尖由遊戲顯示，手腕不硬折。": "剑尖由游戏显示，手腕不硬折。",
 "動作均勻，不突然收腕。": "动作均匀，不突然收腕。",
 "動作均勻，肩膀不要向上抬。": "动作均匀，肩膀不要向上抬。",
 "升到舒適高度即可，勿聳肩。": "升到舒适高度即可，勿耸肩。",
 "原創八節輕步擺臂組合，無商業歌曲或別人舞蹈編排。": "原创八节轻步摆臂组合，无商业歌曲或别人舞蹈编排。",
 "只下降到舒適高度，左手向前下方。": "只下降到舒适高度，左手向前下方。",
 "只做姿勢控制，不撞擊他人。": "只做姿势控制，不撞击他人。",
 "只小幅移重心，不甩頭或扭腰。": "只小幅移重心，不甩头或扭腰。",
 "只慢慢空練，不撞擊柱子或他人。": "只慢慢空练，不撞击柱子或他人。",
 "右倒攆猴": "右倒撵猴",
 "右側點步": "右侧点步",
 "右分腳": "右分脚",
 "右手升到頭側，左手向前開。": "右手升到头侧，左手向前开。",
 "右手升至額旁，左手落至腰前。": "右手升至额旁，左手落至腰前。",
 "右手向側展開，左手平衡。": "右手向侧展开，左手平衡。",
 "右手向前，目光平視。": "右手向前，目光平视。",
 "右手回到身側，左手緩落。": "右手回到身侧，左手缓落。",
 "右手在胸前帶弧線，左手隨行。": "右手在胸前带弧线，左手随行。",
 "右手在胸旁，肩胯協調。": "右手在胸旁，肩胯协调。",
 "右手在額旁，左掌慢向斜前。": "右手在额旁，左掌慢向斜前。",
 "右手帶過胸前向左移。": "右手带过胸前向左移。",
 "右手握虛擬劍，左手在胸前。": "右手握虚拟剑，左手在胸前。",
 "右手收近胸前，站穩。": "右手收近胸前，站稳。",
 "右手沿膝外側鬆落，左掌向前。": "右手沿膝外侧松落，左掌向前。",
 "右手緩抬，左手隨行。": "右手缓抬，左手随行。",
 "右手護近身側，兩肩放鬆。": "右手护近身侧，两肩放松。",
 "右手護額側，左掌慢慢向前。": "右手护额侧，左掌慢慢向前。",
 "右掌向前，左手鬆收至側後。": "右掌向前，左手松收至侧后。",
 "右摟膝拗步": "右搂膝拗步",
 "右腳只小幅離地，雙手保護胸前。": "右脚只小幅离地，双手保护胸前。",
 "右腳向側方輕點，兩手舒展。": "右脚向侧方轻点，两手舒展。",
 "右腳向前低伸，再受控收回。": "右脚向前低伸，再受控收回。",
 "右腳向前小步，左腳隨後。": "右脚向前小步，左脚随后。",
 "右腳向前，膝蓋順著腳尖。": "右脚向前，膝盖顺著脚尖。",
 "右腳向後小步，右手向額側舒展。": "右脚向后小步，右手向额侧舒展。",
 "右腳向後輕點，左臂向前。": "右脚向后轻点，左臂向前。",
 "右腳回地，右手緩落。": "右脚回地，右手缓落。",
 "右腳小幅抬起，左掌向前。": "右脚小幅抬起，左掌向前。",
 "右腳支撐，左腳只小幅抬起。": "右脚支撑，左脚只小幅抬起。",
 "右腳支撐，左腳小幅側抬。": "右脚支撑，左脚小幅侧抬。",
 "右腳站穩，左腳向左前方低幅伸出。": "右脚站稳，左脚向左前方低幅伸出。",
 "右腳輕抬，雙手在胸前靠近。": "右脚轻抬，双手在胸前靠近。",
 "右腳退小步，勿向後仰。": "右脚退小步，勿向后仰。",
 "右臂向側方成圓弧，左手留在腹前。": "右臂向侧方成圆弧，左手留在腹前。",
 "右臂向斜上開展，左手鬆落。": "右臂向斜上开展，左手松落。",
 "右臂在胸前成圓弧，兩肩放鬆。": "右臂在胸前成圆弧，两肩放松。",
 "右金雞獨立": "右金鸡独立",
 "右雲手": "右云手",
 "名稱參考 Yang Family Tai Chi 公開手拳表；8 節選招、要領與程序姿勢為本遊戲編排。": "名称参考 Yang Family Tai Chi 公开手拳表；8 节选招、要领与程序姿势为本游戏编排。",
 "名稱及基本動作範圍參考全日本柔道連盟授業資料；只作遊戲站姿與步法練習。": "名称及基本动作范围参考全日本柔道连盟授业资料；只作游戏站姿与步法练习。",
 "名稱與編號：鄭曼青紀念館同網域之時中學社《學員手冊》。第4式以常用字「捋」表示；第37式保留來源「彎躬射虎」。三維端點與插值是遊戲原創，未經拳師核可。": "名称与编号：郑曼青纪念馆同网域之时中学社《学员手册》。第4式以常用字「捋」表示；第37式保留来源「弯躬射虎」。三维端点与插值是游戏原创，未经拳师核可。",
 "向右前移重心，腳下保持穩定。": "向右前移重心，脚下保持稳定。",
 "向左前移重心，膝蓋與腳尖同向。": "向左前移重心，膝盖与脚尖同向。",
 "單鞭": "单鞭",
 "單鞭下勢": "单鞭下势",
 "單鞭下勢（淺蹲）": "单鞭下势（浅蹲）",
 "四股、摺足、鐵砲名稱參考日本相撲協會；小幅改編不等於官方健康體操全套。": "四股、折足、铁砲名称参考日本相扑协会；小幅改编不等于官方健康体操全套。",
 "回到平常呼吸，結束這一節。": "回到平常呼吸，结束这一节。",
 "回復站姿與呼吸": "回复站姿与呼吸",
 "回正放鬆": "回正放松",
 "回步落劍": "回步落剑",
 "在舒適範圍內練習肩、髖與軀幹活動度。": "在舒适范围内练习肩、髋与躯干活动度。",
 "基本站姿、低四股、摺足與空練鐵砲；不使用碰撞或真實摔跤。": "基本站姿、低四股、折足与空练铁砲；不使用碰撞或真实摔跤。",
 "太極劍 · 虛擬劍慢練": "太极剑 · 虚拟剑慢练",
 "如封似閉": "如封似闭",
 "守備回位": "守备回位",
 "小幅右轉，速度保持一致。": "小幅右转，速度保持一致。",
 "小幅左轉，兩腳勿交叉。": "小幅左转，两脚勿交叉。",
 "小弓步站穩，勿向前撲。": "小弓步站稳，勿向前扑。",
 "小步前移，肩胯協調。": "小步前移，肩胯协调。",
 "小轉腰擺手": "小转腰摆手",
 "少林武術 · 入門手步法遊戲": "少林武术 · 入门手步法游戏",
 "左倒攆猴": "左倒撵猴",
 "左側點步": "左侧点步",
 "左分腳": "左分脚",
 "左右開弓似射鵰": "左右开弓似射雕",
 "左帶劍": "左带剑",
 "左手升至額前，勿抬肩夾頸。": "左手升至额前，勿抬肩夹颈。",
 "左手向上，右手鬆鬆向下。": "左手向上，右手松松向下。",
 "左手向斜前，右手留在額旁。": "左手向斜前，右手留在额旁。",
 "左手在胸前帶弧線，右手隨行。": "左手在胸前带弧线，右手随行。",
 "左手在額側護住，右掌慢慢向前。": "左手在额侧护住，右掌慢慢向前。",
 "左手在額側，右拳慢慢向前。": "左手在额侧，右拳慢慢向前。",
 "左手抬高，右手下降；軀幹中正。": "左手抬高，右手下降；躯干中正。",
 "左手沿膝外側鬆落，右掌向前。": "左手沿膝外侧松落，右掌向前。",
 "左手護額側，右掌慢慢向前。": "左手护额侧，右掌慢慢向前。",
 "左手鬆落，維持穩定支撐。": "左手松落，维持稳定支撑。",
 "左掌向前，右手收近身側。": "左掌向前，右手收近身侧。",
 "左掌向前，右手鬆收至側後。": "左掌向前，右手松收至侧后。",
 "左摟膝拗步": "左搂膝拗步",
 "左腳側移，雙手隨之展開。": "左脚侧移，双手随之展开。",
 "左腳側開，腰部小幅左轉。": "左脚侧开，腰部小幅左转。",
 "左腳向側方輕點，兩手舒展。": "左脚向侧方轻点，两手舒展。",
 "左腳向前成舒適弓步，右拳慢伸。": "左脚向前成舒适弓步，右拳慢伸。",
 "左腳向前輕點，右臂向前。": "左脚向前轻点，右臂向前。",
 "左腳向前，膝蓋順著腳尖。": "左脚向前，膝盖顺著脚尖。",
 "左腳向斜前小步，左手鬆落。": "左脚向斜前小步，左手松落。",
 "左腳小步向前，右手向前下方慢落。": "左脚小步向前，右手向前下方慢落。",
 "左腳小步後退，重心跟隨。": "左脚小步后退，重心跟随。",
 "左腳支撐，右腳只小幅抬起。": "左脚支撑，右脚只小幅抬起。",
 "左腳支撐，右腳小幅側抬。": "左脚支撑，右脚小幅侧抬。",
 "左腳支撐，右腳小幅抬起。": "左脚支撑，右脚小幅抬起。",
 "左腳站穩，右腳向右前方低幅伸出。": "左脚站稳，右脚向右前方低幅伸出。",
 "左腳退小步，視線仍向前。": "左脚退小步，视线仍向前。",
 "左臂向側伸，右手留在胸旁。": "左臂向侧伸，右手留在胸旁。",
 "左臂在胸前保持圓弧，右手鬆放。": "左臂在胸前保持圆弧，右手松放。",
 "左金雞獨立": "左金鸡独立",
 "左雲手": "左云手",
 "廣場舞 · 輕步節奏": "广场舞 · 轻步节奏",
 "弓步前指劍": "弓步前指剑",
 "弓步沖拳（慢練）": "弓步冲拳（慢练）",
 "彎躬射虎": "弯躬射虎",
 "後點步擺臂": "后点步摆臂",
 "感受動作變慢，不壓低身體。": "感受动作变慢，不压低身体。",
 "慢慢站高，恢復自然呼吸。": "慢慢站高，恢复自然呼吸。",
 "慢慢落腳，不跳躍。": "慢慢落脚，不跳跃。",
 "懶扎衣（慢練）": "懒扎衣（慢练）",
 "手指、肩與肘皆放鬆。": "手指、肩与肘皆放松。",
 "手揮琵琶": "手挥琵琶",
 "手放腰旁，胸口與背部自然。": "手放腰旁，胸口与背部自然。",
 "抱圓": "抱圆",
 "抱拳禮": "抱拳礼",
 "抱虎歸山": "抱虎归山",
 "招名來源：國家體育總局〈八段錦定式動作〉。名稱可核對；三維姿勢及淺降改編並非該機構審定教材。": "招名来源：国家体育总局〈八段锦定式动作〉。名称可核对；三维姿势及浅降改编并非该机构审定教材。",
 "招名和排列參考 Chen Zhenglei Ltd 的 8 Form；動畫是本遊戲的低幅姿勢，非授權動作教材。": "招名和排列参考 Chen Zhenglei Ltd 的 8 Form；动画是本游戏的低幅姿势，非授权动作教材。",
 "持劍預備（虛擬道具）": "持剑预备（虚拟道具）",
 "搖頭擺尾去心火": "摇头摆尾去心火",
 "摺足 · Suriashi": "折足 · Suriashi",
 "擠": "挤",
 "攥拳怒目增氣力（慢練）": "攥拳怒目增气力（慢练）",
 "攬雀尾・右掤": "揽雀尾・右掤",
 "攬雀尾・左掤": "揽雀尾・左掤",
 "攬雀尾・按": "揽雀尾・按",
 "攬雀尾・捋": "揽雀尾・捋",
 "攬雀尾・擠": "揽雀尾・挤",
 "支撐腳站穩，膝蓋柔軟。": "支撑脚站稳，膝盖柔软。",
 "支撐腿保持柔軟，不突然踢高。": "支撑腿保持柔软，不突然踢高。",
 "支撐腿柔軟，動作緩慢。": "支撑腿柔软，动作缓慢。",
 "收劍合式": "收剑合式",
 "收勢": "收势",
 "放慢節奏，恢復自然呼吸。": "放慢节奏，恢复自然呼吸。",
 "放鬆呼吸，留意距離。": "放松呼吸，留意距离。",
 "斜單鞭": "斜单鞭",
 "斜飛勢": "斜飞势",
 "東方武術 · 基本手步法": "东方武术 · 基本手步法",
 "柔道 · 站姿與步法": "柔道 · 站姿与步法",
 "楊氏太極 · 選招慢練": "杨氏太极 · 选招慢练",
 "正拳 · Jireugi（慢練）": "正拳 · Jireugi（慢练）",
 "步幅小，勿拖曳或交叉雙腳。": "步幅小，勿拖曳或交叉双脚。",
 "步幅舒適，身體勿扭成兩段。": "步幅舒适，身体勿扭成两段。",
 "氣功 · 自然呼吸舒展": "气功 · 自然呼吸舒展",
 "淺屈膝、背部保持長，不彎腰衝向地面。": "浅屈膝、背部保持长，不弯腰冲向地面。",
 "淺蹲，雙手留在腿上方。": "浅蹲，双手留在腿上方。",
 "準備、格擋、慢速正拳與低前踢；不是品勢或對打實技教學。": "准备、格挡、慢速正拳与低前踢；不是品势或对打实技教学。",
 "準備姿勢": "准备姿势",
 "獨立平劍（低抬腿）": "独立平剑（低抬腿）",
 "用小幅腰轉，保持膝腳方向一致。": "用小幅腰转，保持膝脚方向一致。",
 "用小幅腰轉，勿用力甩肘。": "用小幅腰转，勿用力甩肘。",
 "用淺蹲站穩，換邊同樣緩慢。": "用浅蹲站稳，换边同样缓慢。",
 "用淺馬步，不需要低架或發力。": "用浅马步，不需要低架或发力。",
 "用舒適弓步與小幅轉腰；不拉緊肩頸。": "用舒适弓步与小幅转腰；不拉紧肩颈。",
 "白鶴亮翅": "白鹤亮翅",
 "相撲 · 低幅基本動作": "相扑 · 低幅基本动作",
 "相撲基本站姿": "相扑基本站姿",
 "移步配合小幅轉腰。": "移步配合小幅转腰。",
 "穩定換重心；此遊戲轉腰角度縮小。": "稳定换重心；此游戏转腰角度缩小。",
 "立禮": "立礼",
 "立禮、自然體、自護體與進退轉身；此課程不演投技、受身或摔落。": "立礼、自然体、自护体与进退转身；此课程不演投技、受身或摔落。",
 "節奏動作及順序為本遊戲原創，非任何特定歌曲舞蹈的重製。": "节奏动作及顺序为本游戏原创，非任何特定歌曲舞蹈的重制。",
 "簡易太極 · 12 節遊戲編排": "简易太极 · 12 节游戏编排",
 "維持視線向前，不後仰。": "维持视线向前，不后仰。",
 "練習下肢支撐、步法與姿勢控制；不要求深蹲或勉強拉伸。": "练习下肢支撑、步法与姿势控制；不要求深蹲或勉强拉伸。",
 "練習手、腳與軀幹的協調及動作記憶。": "练习手、脚与躯干的协调及动作记忆。",
 "練習節奏、左右協調及輕度全身活動。": "练习节奏、左右协调及轻度全身活动。",
 "練習自然呼吸、注意力與緩慢動作的節奏。": "练习自然呼吸、注意力与缓慢动作的节奏。",
 "練習重心轉移與平衡控制；屬一般運動目標，並非此招已被證實有特定療效。": "练习重心转移与平衡控制；属一般运动目标，并非此招已被证实有特定疗效。",
 "肩放鬆，雙腳站穩。": "肩放松，双脚站稳。",
 "肩膀不聳起，手肘保留弧度。": "肩膀不耸起，手肘保留弧度。",
 "肩膀放鬆，以腰部小幅帶動。": "肩膀放松，以腰部小幅带动。",
 "肩頸放鬆，眼睛平視。": "肩颈放松，眼睛平视。",
 "背後七顛百病消（輕提跟）": "背后七颠百病消（轻提跟）",
 "腰保持舒適高度，身體勿前撲。": "腰保持舒适高度，身体勿前扑。",
 "腰背中正，不靠前傾來伸手。": "腰背中正，不靠前倾来伸手。",
 "腰胯向右帶動，保持胸口放鬆。": "腰胯向右带动，保持胸口放松。",
 "腰胯小幅左轉，勿用腕甩劍。": "腰胯小幅左转，勿用腕甩剑。",
 "腰胯帶動前移，不要挺胸。": "腰胯带动前移，不要挺胸。",
 "腰胯帶動手臂，勿用肩膀硬推。": "腰胯带动手臂，勿用肩膀硬推。",
 "腳尖與膝蓋方向一致。": "脚尖与膝盖方向一致。",
 "腳步向斜前方，身體不歪斜。": "脚步向斜前方，身体不歪斜。",
 "腳步回中，肩膀不要抬高。": "脚步回中，肩膀不要抬高。",
 "腳步沿地面小幅向前移動。": "脚步沿地面小幅向前移动。",
 "膝蓋微鬆，勿聳肩。": "膝盖微松，勿耸肩。",
 "膝蓋與腳尖同向，勿勉強壓低。": "膝盖与脚尖同向，勿勉强压低。",
 "膝蓋順腳尖，肘部不鎖死。": "膝盖顺脚尖，肘部不锁死。",
 "自然體": "自然体",
 "自護體（淺降）": "自护体（浅降）",
 "舒適站樁": "舒适站桩",
 "虛步挑掌": "虚步挑掌",
 "調理脾胃須單舉": "调理脾胃须单举",
 "起勢": "起势",
 "起勢舉劍": "起势举剑",
 "跆拳道 · 基本慢練": "跆拳道 · 基本慢练",
 "跟上均勻節拍，不急著跨大步。": "跟上均匀节拍，不急著跨大步。",
 "身體放鬆，留出手腳活動空間。": "身体放松，留出手脚活动空间。",
 "身體直立，勿前傾。": "身体直立，勿前倾。",
 "身體隨腰平順轉動，不猛推。": "身体随腰平顺转动，不猛推。",
 "輕微低頭致意，回復直立。": "轻微低头致意，回复直立。",
 "轉角小，兩腳不交叉。": "转角小，两脚不交叉。",
 "轉身擺蓮": "转身摆莲",
 "轉身蹬腳": "转身蹬脚",
 "退步移動": "退步移动",
 "通用基本手步法為遊戲編排；未取得少林寺課程或動作授權，非完整少林拳譜。": "通用基本手步法为游戏编排；未取得少林寺课程或动作授权，非完整少林拳谱。",
 "進步搬攔捶": "进步搬拦捶",
 "進步栽捶": "进步栽捶",
 "進步移動": "进步移动",
 "遊戲入門節目；關鍵姿勢、插值動畫與要領由本遊戲編寫，未經拳師或教練驗證，不是完整套路或實戰教學。": "游戏入门节目；关键姿势、插值动画与要领由本游戏编写，未经拳师或教练验证，不是完整套路或实战教学。",
 "遊戲只示意端點，不重現完整轉身；真人不強扭支撐膝。": "游戏只示意端点，不重现完整转身；真人不强扭支撑膝。",
 "遊戲採低抬腿端點，不示範完整旋轉或拍腳。": "游戏采低抬腿端点，不示范完整旋转或拍脚。",
 "遊戲改為淺降，不彎腰摸腳或硬拉筋。": "游戏改为浅降，不弯腰摸脚或硬拉筋。",
 "選取楊氏常見招名；與完整 103 式或其他短套路不同。": "选取杨氏常见招名；与完整 103 式或其他短套路不同。",
 "部分技術名稱對照國技院用語；順序與慢練姿勢是本遊戲設計。": "部分技术名称对照国技院用语；顺序与慢练姿势是本游戏设计。",
 "鄭曼青太極 · 37 式": "郑曼青太极 · 37 式",
 "配合小步前移；不鎖肘、不發力打人。": "配合小步前移；不锁肘、不发力打人。",
 "重心留在後腿，身體不後仰。": "重心留在后腿，身体不后仰。",
 "野馬分鬃": "野马分鬃",
 "鐵砲（空練推掌）": "铁砲（空练推掌）",
 "開合呼吸練習": "开合呼吸练习",
 "開合手臂": "开合手臂",
 "陳氏太極 · 8 節慢練": "陈氏太极 · 8 节慢练",
 "雙手先收回，再鬆鬆向前。": "双手先收回，再松松向前。",
 "雙手向中線靠攏，前腳輕點。": "双手向中线靠拢，前脚轻点。",
 "雙手向兩側舒展，腳步回正。": "双手向两侧舒展，脚步回正。",
 "雙手向前上方托起。": "双手向前上方托起。",
 "雙手向左隨腰移動。": "双手向左随腰移动。",
 "雙手回到胸前，腳步成自然前後站姿。": "双手回到胸前，脚步成自然前后站姿。",
 "雙手在前，身體保持直立。": "双手在前，身体保持直立。",
 "雙手在胸前交叉，保持離胸的空間。": "双手在胸前交叉，保持离胸的空间。",
 "雙手在胸前靠近，兩臂保持彈性。": "双手在胸前靠近，两臂保持弹性。",
 "雙手收近身側，肩胯朝同一方向。": "双手收近身侧，肩胯朝同一方向。",
 "雙手放在腿上方，不深蹲。": "双手放在腿上方，不深蹲。",
 "雙手沿身前下降到大腿旁。": "双手沿身前下降到大腿旁。",
 "雙手移向右前方，保持弧度。": "双手移向右前方，保持弧度。",
 "雙手緩升到頭上舒適位置。": "双手缓升到头上舒适位置。",
 "雙手緩緩下降到身側。": "双手缓缓下降到身侧。",
 "雙手緩緩向側方開展。": "双手缓缓向侧方开展。",
 "雙手緩緩抬至胸前，手肘保留弧度。": "双手缓缓抬至胸前，手肘保留弧度。",
 "雙手落至腹前，膝蓋稍鬆。": "双手落至腹前，膝盖稍松。",
 "雙手輕放腹前，雙腳站穩。": "双手轻放腹前，双脚站稳。",
 "雙手開到胸旁，肘部柔軟。": "双手开到胸旁，肘部柔软。",
 "雙手隨腰小幅轉向左側。": "双手随腰小幅转向左侧。",
 "雙手鬆垂，呼吸保持自然。": "双手松垂，呼吸保持自然。",
 "雙手鬆放，腰部小幅右轉。": "双手松放，腰部小幅右转。",
 "雙掌向前，手腕及肘部保持舒適。": "双掌向前，手腕及肘部保持舒适。",
 "雙腳側開，膝蓋柔軟。": "双脚侧开，膝盖柔软。",
 "雙腳回到平行，雙手緩落。": "双脚回到平行，双手缓落。",
 "雙腳小幅提跟，再緩慢回落。": "双脚小幅提跟，再缓慢回落。",
 "雙腳平行，兩拳放在腹前。": "双脚平行，两拳放在腹前。",
 "雙腳平行，呼吸自然。": "双脚平行，呼吸自然。",
 "雙腳平行，站穩再開始。": "双脚平行，站稳再开始。",
 "雙腳平行，膝蓋不鎖死。": "双脚平行，膝盖不锁死。",
 "雙腳略開，膝蓋柔軟。": "双脚略开，膝盖柔软。",
 "雙腳站穩，手在身側。": "双脚站稳，手在身侧。",
 "雙腳與肩同寬，手在身前。": "双脚与肩同宽，手在身前。",
 "雙腳適度打開，膝蓋朝腳尖方向。": "双脚适度打开，膝盖朝脚尖方向。",
 "雙臂先抱圓，再隨腰轉向右前。": "双臂先抱圆，再随腰转向右前。",
 "雙臂在腹前抱圓。": "双臂在腹前抱圆。",
 "雙臂舒展，落腳時保持受控。": "双臂舒展，落脚时保持受控。",
 "雙臂舒展，身體不要後仰；不追求高踢。": "双臂舒展，身体不要后仰；不追求高踢。",
 "雲手右": "云手右",
 "雲手左": "云手左",
 "預備式": "预备式",
 "預備式・起勢": "预备式・起势",
 "預設 37 式的招名與編號依時中學社《學員手冊》。每式練習一個遊戲目標姿勢；重複、過渡及收式另存資料，並未完整演出，請跟隨實際老師學習完整套路。": "预设 37 式的招名与编号依时中学社《学员手册》。每式练习一个游戏目标姿势；重复、过渡及收式另存资料，并未完整演出，请跟随实际老师学习完整套路。",
 "頸部不強扭，視線隨身體轉。": "颈部不强扭，视线随身体转。",
 "馬步架打（慢練）": "马步架打（慢练）",
 "馬步（淺蹲）": "马步（浅蹲）",
 "體捌（轉身步法）": "体捌（转身步法）",
 "鬆沉回落": "松沉回落"
};
const simplify = text => simplifiedChinese[text] ?? text;
function addChineseLocales(value){
 if(!value || typeof value!=='object') return;
 if(Object.prototype.hasOwnProperty.call(value,'zh')){
  value['zh-TW']=clone(value.zh);
  value['zh-CN']=Array.isArray(value.zh)?value.zh.map(simplify):simplify(value.zh);
 }
 for(const child of Object.values(value)) addChineseLocales(child);
}
for(const c of curricula) addChineseLocales(c);
export const curriculumById = Object.fromEntries(curricula.map(c=>[c.id,c]));

