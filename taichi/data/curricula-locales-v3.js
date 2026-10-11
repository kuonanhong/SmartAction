/* Additional curriculum locales for the game-authored target poses.
 * Cues describe the SAME endpoints as the existing ja/ko/es/fr/de/pt adapter.
 * They are localized game instructions, not certified martial-arts teaching.
 * Source labels identify referenced naming lists; they do not imply endorsement.
 */
export const curriculumLocaleCodesV3 = ['it','id','vi','th','ar','hi'];
const LANGS=curriculumLocaleCodesV3;
const table = text => Object.fromEntries(text.trim().split('\n').map(line=>{
 const [key,...values]=line.split('|');
 if(values.length!==LANGS.length) throw new Error(`Curriculum locale column count: ${key}`);
 return [key,Object.fromEntries(LANGS.map((lang,i)=>[lang,values[i]]))];
}));
const moveNames=table(`
Preparation and opening|Preparazione e apertura|Persiapan dan pembukaan|Chuẩn bị và khởi thế|เตรียมและเริ่มท่า|الاستعداد والافتتاح|तैयारी और आरंभ
Left ward-off|Parata a sinistra|Menangkis ke kiri|Bằng trái|ปัดป้องซ้าย|الصد إلى اليسار|बाईं ओर बचाव
Right ward-off|Parata a destra|Menangkis ke kanan|Bằng phải|ปัดป้องขวา|الصد إلى اليمين|दाईं ओर बचाव
Roll back|Deviare indietro|Mengalihkan ke belakang|Vuốt về sau|ดึงเบี่ยงไปด้านหลัง|التحويل إلى الخلف|पीछे की ओर मोड़ना
Press|Premere|Menekan|Ép|บีบกด|الضغط|दबाना
Push|Spingere|Mendorong|Đẩy|ผลัก|الدفع|धकेलना
Single whip|Frusta singola|Cambuk tunggal|Đơn tiên|แส้เดี่ยว|السوط المفرد|एकल चाबुक
Raise hands|Sollevare le mani|Mengangkat tangan|Đề thủ|ยกมือ|رفع اليدين|हाथ उठाना
Shoulder alignment|Allineamento della spalla|Penyelarasan bahu|Căn chỉnh vai|จัดแนวไหล่|محاذاة الكتف|कंधे का संरेखण
White crane spreads wings|La gru bianca apre le ali|Bangau putih mengembangkan sayap|Bạch hạc lượng sí|กระเรียนขาวกางปีก|الكركي الأبيض ينشر جناحيه|सफेद सारस पंख फैलाता है
Left brush knee and push|Sfiorare il ginocchio sinistro e spingere|Menyapu lutut kiri dan mendorong|Lâu tất ảo bộ trái|ปัดเข่าซ้ายแล้วผลัก|مسح الركبة اليسرى والدفع|बाएँ घुटने के पास से हाथ फेरकर धकेलना
Play the lute|Suonare il liuto|Memainkan kecapi|Thủ huy tỳ bà|บรรเลงพิณ|العزف على العود|वीणा बजाना
Step, parry and punch|Passo, parata e pugno|Melangkah, menangkis, dan memukul|Tiến bộ ban lan chùy|ก้าว ปัดป้อง และชก|خطوة وصد ولكمة|कदम, बचाव और मुक्का
Apparent close-up|Chiudere e proteggere|Menutup dan melindungi|Như phong tự bế|ปิดและป้องกัน|الإغلاق والحماية|बंद करके रक्षा करना
Cross hands|Incrociare le mani|Menyilangkan tangan|Thập tự thủ|ไขว้มือ|تقاطع اليدين|हाथ पार करना
Embrace tiger, return to mountain|Abbracciare la tigre e tornare al monte|Memeluk harimau, kembali ke gunung|Bão hổ quy sơn|โอบพยัคฆ์คืนภูผา|احتضان النمر والعودة إلى الجبل|बाघ को गले लगाकर पर्वत लौटना
Diagonal single whip|Frusta singola diagonale|Cambuk tunggal diagonal|Tà đơn tiên|แส้เดี่ยวแนวเฉียง|السوط المفرد المائل|तिरछा एकल चाबुक
Fist under elbow|Pugno sotto il gomito|Tinju di bawah siku|Trửu để khán chùy|หมัดใต้ศอก|القبضة تحت المرفق|कोहनी के नीचे मुट्ठी
Right repulse monkey|Respingere la scimmia a destra|Menghalau monyet ke kanan|Đảo niện hầu phải|ถอยไล่วานรขวา|إبعاد القرد إلى اليمين|दाईं ओर बंदर को पीछे हटाना
Left repulse monkey|Respingere la scimmia a sinistra|Menghalau monyet ke kiri|Đảo niện hầu trái|ถอยไล่วานรซ้าย|إبعاد القرد إلى اليسار|बाईं ओर बंदर को पीछे हटाना
Diagonal flying|Volo diagonale|Terbang diagonal|Tà phi thế|บินเฉียง|الطيران المائل|तिरछी उड़ान
Cloud hands left|Mani come nuvole a sinistra|Tangan awan ke kiri|Vân thủ trái|มือเมฆซ้าย|يدا السحاب إلى اليسار|बाईं ओर बादल जैसे हाथ
Cloud hands right|Mani come nuvole a destra|Tangan awan ke kanan|Vân thủ phải|มือเมฆขวา|يدا السحاب إلى اليمين|दाईं ओर बादल जैसे हाथ
Low single whip, shallow|Frusta bassa, piegamento lieve|Cambuk rendah, tekukan dangkal|Đơn tiên hạ thế, hạ thấp nhẹ|แส้เดี่ยวต่ำ ย่อเล็กน้อย|السوط المنخفض مع ثني خفيف|नीचा एकल चाबुक, हल्का झुकाव
Right golden rooster, low knee|Gallo dorato a destra, ginocchio basso|Ayam emas kanan, lutut rendah|Kim kê độc lập phải, nâng gối thấp|ไก่ทองขวา ยกเข่าต่ำ|الديك الذهبي الأيمن مع رفع منخفض للركبة|दायाँ स्वर्ण मुर्गा, घुटना नीचे
Left golden rooster, low knee|Gallo dorato a sinistra, ginocchio basso|Ayam emas kiri, lutut rendah|Kim kê độc lập trái, nâng gối thấp|ไก่ทองซ้าย ยกเข่าต่ำ|الديك الذهبي الأيسر مع رفع منخفض للركبة|बायाँ स्वर्ण मुर्गा, घुटना नीचे
Separate right foot, low|Aprire il piede destro, in basso|Membuka kaki kanan rendah|Phân cước phải, thấp|แยกเท้าขวาระดับต่ำ|فتح القدم اليمنى على ارتفاع منخفض|दायाँ पैर कम ऊँचाई पर बाहर खोलना
Separate left foot, low|Aprire il piede sinistro, in basso|Membuka kaki kiri rendah|Phân cước trái, thấp|แยกเท้าซ้ายระดับต่ำ|فتح القدم اليسرى على ارتفاع منخفض|बायाँ पैर कम ऊँचाई पर बाहर खोलना
Turn and heel kick, low|Girare e spingere il tallone, basso|Berputar dan tendangan tumit rendah|Chuyển thân đặng cước, thấp|หมุนตัวถีบส้นเท้าต่ำ|الالتفاف وركلة كعب منخفضة|मुड़कर एड़ी से नीची किक
Right brush knee and push|Sfiorare il ginocchio destro e spingere|Menyapu lutut kanan dan mendorong|Lâu tất ảo bộ phải|ปัดเข่าขวาแล้วผลัก|مسح الركبة اليمنى والدفع|दाएँ घुटने के पास से हाथ फेरकर धकेलना
Step and downward punch|Passo e pugno verso il basso|Melangkah dan pukulan ke bawah|Tiến bộ tài chùy|ก้าวและชกลง|خطوة ولكمة إلى الأسفل|कदम और नीचे की ओर मुक्का
Fair lady works shuttles 1|La dama tesse 1|Gadis menenun 1|Ngọc nữ xuyên thoa 1|สาวงามทอกระสวย 1|السيدة تنسج 1|सुंदरी बुनाई करती है 1
Fair lady works shuttles 2|La dama tesse 2|Gadis menenun 2|Ngọc nữ xuyên thoa 2|สาวงามทอกระสวย 2|السيدة تنسج 2|सुंदरी बुनाई करती है 2
Fair lady works shuttles 3|La dama tesse 3|Gadis menenun 3|Ngọc nữ xuyên thoa 3|สาวงามทอกระสวย 3|السيدة تنسج 3|सुंदरी बुनाई करती है 3
Fair lady works shuttles 4|La dama tesse 4|Gadis menenun 4|Ngọc nữ xuyên thoa 4|สาวงามทอกระสวย 4|السيدة تنسج 4|सुंदरी बुनाई करती है 4
Step up to seven stars|Avanzare verso le sette stelle|Maju ke tujuh bintang|Thượng bộ thất tinh|ก้าวสู่เจ็ดดาว|التقدم نحو النجوم السبعة|सात तारों की ओर कदम
Step back and ride tiger|Arretrare e cavalcare la tigre|Mundur dan menunggang harimau|Thoái bộ khóa hổ|ถอยก้าวขี่พยัคฆ์|التراجع وركوب النمر|पीछे कदम रखकर बाघ की सवारी
Turn and sweep lotus, low|Girare e spazzare il loto, basso|Berputar dan sapuan teratai rendah|Chuyển thân bãi liên, thấp|หมุนกวาดดอกบัวต่ำ|الالتفاف ومسح اللوتس على ارتفاع منخفض|मुड़कर कम ऊँचाई पर कमल झाड़ना
Draw bow and shoot tiger|Tendere l’arco e mirare alla tigre|Menarik busur dan membidik harimau|Loan cung xạ hổ|โก่งธนูเล็งพยัคฆ์|شد القوس والتصويب نحو النمر|धनुष खींचकर बाघ पर निशाना
Closing|Chiusura|Penutupan|Thu thế|จบท่า|الختام|समापन
Preparation|Preparazione|Persiapan|Dự bị thế|เตรียมท่า|الاستعداد|तैयारी
Opening|Apertura|Pembukaan|Khởi thế|เริ่มท่า|الافتتاح|आरंभ
Part wild horse mane|Separare la criniera del cavallo selvaggio|Membelah surai kuda liar|Dã mã phân tông|แหวกแผงคอม้าป่า|تفريق عرف الحصان البري|जंगली घोड़े की अयाल अलग करना
Raise both hands to the sky|Sollevare entrambe le mani al cielo|Mengangkat kedua tangan ke langit|Hai tay nâng trời|ยกสองมือสู่ฟ้า|رفع اليدين نحو السماء|दोनों हाथ आकाश की ओर उठाना
Draw the bow to either side|Tendere l’arco sui due lati|Menarik busur ke kedua sisi|Kéo cung sang hai bên|โก่งธนูทั้งสองข้าง|شد القوس إلى الجانبين|दोनों ओर धनुष खींचना
Raise one hand|Sollevare una mano|Mengangkat satu tangan|Nâng một tay|ยกมือข้างเดียว|رفع يد واحدة|एक हाथ उठाना
Look gently behind|Guardare dolcemente indietro|Menoleh perlahan ke belakang|Nhẹ nhàng nhìn ra sau|หันมองด้านหลังเบา ๆ|النظر برفق إلى الخلف|धीरे से पीछे देखना
Gentle side-to-side shift|Spostamento dolce da un lato all’altro|Memindahkan berat perlahan ke samping|Chuyển trọng tâm nhẹ sang hai bên|ถ่ายน้ำหนักซ้ายขวาเบา ๆ|نقل الوزن بلطف من جانب إلى آخر|दोनों ओर धीरे वजन बदलना
Reach down comfortably, adapted|Scendere con le mani senza forzare, adattato|Menjangkau ke bawah dengan nyaman, adaptasi|Vươn tay xuống trong tầm thoải mái, biến thể|เอื้อมลงอย่างสบาย ท่าดัดแปลง|المد إلى الأسفل ضمن مدى مريح، نسخة معدلة|आराम से नीचे पहुँचना, अनुकूलित
Slow controlled fist reach|Estendere il pugno lentamente e con controllo|Menjulurkan tinju perlahan terkendali|Vươn nắm đấm chậm và có kiểm soát|เหยียดหมัดช้าอย่างควบคุม|مد القبضة ببطء وتحكم|मुट्ठी धीरे और नियंत्रण से आगे बढ़ाना
Gentle heel raise|Sollevare dolcemente i talloni|Mengangkat tumit perlahan|Nhón gót nhẹ|ยกส้นเท้าเบา ๆ|رفع الكعبين برفق|एड़ियाँ हल्के से उठाना
Ready stance|Posizione pronta|Sikap siap|Tư thế chuẩn bị|ท่าเตรียมพร้อม|وضع الاستعداد|तैयार मुद्रा
Low block · Arae-makgi|Parata bassa · Arae-makgi|Tangkisan bawah · Arae-makgi|Đỡ thấp · Arae-makgi|ปัดป้องต่ำ · อาแรมักกี|صد منخفض · أراي ماكغي|नीचा बचाव · अरे माक्गी
Middle block · Momtong-makgi|Parata media · Momtong-makgi|Tangkisan tengah · Momtong-makgi|Đỡ trung đẳng · Momtong-makgi|ปัดป้องกลาง · มมทงมักกี|صد أوسط · مومتونغ ماكغي|मध्य बचाव · मोंतोंग माक्गी
High block · Eolgul-makgi|Parata alta · Eolgul-makgi|Tangkisan atas · Eolgul-makgi|Đỡ cao · Eolgul-makgi|ปัดป้องสูง · ออลกุลมักกี|صد مرتفع · أولغول ماكغي|ऊँचा बचाव · ओलगुल माक्गी
Straight punch · Jireugi, slow|Pugno diretto · Jireugi, lento|Pukulan lurus · Jireugi, perlahan|Đấm thẳng · Jireugi, chậm|ชกตรงช้า · จิรูกี|لكمة مستقيمة بطيئة · جيريوغي|सीधा मुक्का · जिरूगी, धीमा
Front-kick preparation, low knee|Preparazione al calcio frontale, ginocchio basso|Persiapan tendangan depan, lutut rendah|Chuẩn bị đá trước, nâng gối thấp|เตรียมเตะหน้า ยกเข่าต่ำ|استعداد للركلة الأمامية مع ركبة منخفضة|आगे की किक की तैयारी, घुटना नीचे
Low front kick · Ap-chagi|Calcio frontale basso · Ap-chagi|Tendangan depan rendah · Ap-chagi|Đá trước thấp · Ap-chagi|เตะหน้าต่ำ · อัพชากี|ركلة أمامية منخفضة · آب تشاغي|नीची आगे की किक · अप चागी
Return to guard|Tornare in guardia|Kembali ke posisi jaga|Trở về thủ thế|กลับท่าป้องกัน|العودة إلى وضع الحراسة|रक्षा मुद्रा में लौटना
Standing bow|Saluto in piedi|Membungkuk hormat sambil berdiri|Chào đứng|คำนับยืน|التحية بانحناءة واقفة|खड़े होकर झुककर अभिवादन
Natural stance|Posizione naturale|Sikap alami|Tư thế tự nhiên|ท่ายืนธรรมชาติ|وقفة طبيعية|स्वाभाविक मुद्रा
Defensive stance, shallow|Posizione difensiva, piegamento lieve|Sikap bertahan dengan tekukan dangkal|Tư thế phòng thủ, hạ thấp nhẹ|ท่าป้องกัน ย่อเล็กน้อย|وقفة دفاعية مع ثني خفيف|रक्षा मुद्रा, हल्का झुकाव
Advance step|Passo avanti|Langkah maju|Bước tiến|ก้าวหน้า|خطوة إلى الأمام|आगे कदम
Retreat step|Passo indietro|Langkah mundur|Bước lùi|ก้าวถอย|خطوة إلى الخلف|पीछे कदम
Body turning footwork|Passi con rotazione del corpo|Langkah memutar tubuh|Bước xoay thân|ก้าวหมุนตัว|خطوات مع دوران الجسم|शरीर मोड़ते हुए कदम
Sumo base stance|Posizione base del sumo|Sikap dasar sumo|Tư thế cơ bản sumo|ท่าพื้นฐานซูโม่|وقفة السومو الأساسية|सूमो की मूल मुद्रा
Left shiko, low lift|Shiko sinistro, sollevamento basso|Shiko kiri, angkatan rendah|Shiko trái, nâng thấp|ชิโกะซ้าย ยกต่ำ|شيكو أيسر مع رفع منخفض|बायाँ शिको, कम उठान
Right shiko, low lift|Shiko destro, sollevamento basso|Shiko kanan, angkatan rendah|Shiko phải, nâng thấp|ชิโกะขวา ยกต่ำ|شيكو أيمن مع رفع منخفض|दायाँ शिको, कम उठान
Sliding step · Suriashi|Passo scivolato · Suriashi|Langkah geser · Suriashi|Bước trượt · Suriashi|ก้าวไถล · ซูริอาชิ|خطوة انزلاقية · سوري آشي|फिसलता कदम · सुरिआशी
Teppo, air-palm practice|Teppo, palmi nell’aria|Teppo, latihan telapak di udara|Teppo, tập chưởng trong không khí|เทปโป ฝ่ามือในอากาศ|تيبو، تمرين راحة اليد في الهواء|तेप्पो, हवा में हथेली का अभ्यास
Return and breathe|Ritornare e respirare|Kembali dan bernapas|Trở về và thở|กลับท่าและหายใจ|العودة والتنفس|लौटना और श्वास लेना
Fist-and-palm salute|Saluto con pugno e palmo|Salam kepalan dan telapak|Chào quyền chưởng|คารวะหมัดกับฝ่ามือ|تحية القبضة وراحة اليد|मुट्ठी और हथेली से अभिवादन
Horse stance, shallow|Posizione del cavaliere, lieve|Sikap kuda-kuda dangkal|Mã bộ, hạ thấp nhẹ|ท่าม้า ย่อเล็กน้อย|وقفة الحصان مع ثني خفيف|अश्व मुद्रा, हल्का झुकाव
Bow stance punch, slow|Pugno lento in posizione ad arco|Pukulan lambat dengan sikap busur|Đấm chậm ở cung bộ|ชกช้าในท่าคันธนู|لكمة بطيئة في وقفة القوس|धनुष मुद्रा में धीमा मुक्का
Empty stance and lifting palm|Posizione vuota e palmo che sale|Sikap kosong dan telapak terangkat|Hư bộ nâng chưởng|ท่าว่างและยกฝ่ามือ|وقفة خفيفة ورفع راحة اليد|रिक्त मुद्रा और उठती हथेली
Forward palm reach|Palmo in avanti|Telapak menjangkau ke depan|Vươn chưởng ra trước|ยื่นฝ่ามือไปหน้า|مد راحة اليد إلى الأمام|हथेली आगे बढ़ाना
Low knee lift and palm|Ginocchio basso e palmo|Angkat lutut rendah dan telapak|Nâng gối thấp và chưởng|ยกเข่าต่ำกับฝ่ามือ|رفع منخفض للركبة مع راحة اليد|घुटना कम उठाना और हथेली
Side step and open palms|Passo laterale e palmi aperti|Langkah samping dan telapak terbuka|Bước ngang mở chưởng|ก้าวข้างและเปิดฝ่ามือ|خطوة جانبية وفتح راحتي اليدين|बगल में कदम और खुली हथेलियाँ
Sword preparation, virtual prop|Preparazione con spada virtuale|Persiapan pedang virtual|Chuẩn bị kiếm ảo|เตรียมกระบี่เสมือน|الاستعداد بالسيف الافتراضي|आभासी तलवार की तैयारी
Opening sword lift|Sollevamento iniziale della spada|Mengangkat pedang saat pembukaan|Khởi thế nâng kiếm|ยกกระบี่เริ่มท่า|رفع السيف في الافتتاح|आरंभ में तलवार उठाना
Bow stance sword point|Puntare la spada in posizione ad arco|Mengarah pedang dalam sikap busur|Cung bộ chỉ kiếm|ชี้กระบี่ในท่าคันธนู|توجيه السيف في وقفة القوس|धनुष मुद्रा में तलवार इंगित करना
Draw sword to left|Portare la spada a sinistra|Menarik pedang ke kiri|Đưa kiếm sang trái|นำกระบี่ไปซ้าย|سحب السيف إلى اليسار|तलवार बाईं ओर खींचना
Open sword to side|Aprire la spada di lato|Membuka pedang ke samping|Mở kiếm sang bên|เปิดกระบี่ไปข้าง|فتح السيف إلى الجانب|तलवार बगल में खोलना
Low knee, level sword|Ginocchio basso, spada orizzontale|Lutut rendah, pedang mendatar|Gối thấp, kiếm ngang|เข่าต่ำ กระบี่ระดับ|ركبة منخفضة وسيف أفقي|घुटना नीचे, तलवार समतल
Step back and lower sword|Arretrare e abbassare la spada|Mundur dan menurunkan pedang|Lùi bước hạ kiếm|ถอยและลดกระบี่|التراجع وخفض السيف|पीछे कदम और तलवार नीचे
Sword closing|Chiusura con la spada|Penutupan pedang|Thu kiếm|เก็บกระบี่จบท่า|ختام السيف|तलवार का समापन
Comfortable standing|Stare in piedi comodamente|Berdiri nyaman|Đứng thoải mái|ยืนสบาย|الوقوف براحة|आराम से खड़ा होना
Round holding posture|Postura di abbraccio circolare|Sikap memeluk lingkaran|Tư thế ôm tròn|ท่าโอบวงกลม|وضع الاحتضان الدائري|गोल घेरा थामने की मुद्रा
Open and close, natural breath|Aprire e chiudere, respiro naturale|Membuka dan menutup, napas alami|Mở khép, thở tự nhiên|เปิดปิด หายใจธรรมชาติ|الفتح والإغلاق مع تنفس طبيعي|खोलना और बंद करना, स्वाभाविक श्वास
Lift palms gently|Sollevare dolcemente i palmi|Mengangkat telapak perlahan|Nâng nhẹ hai chưởng|ยกฝ่ามือเบา ๆ|رفع راحتي اليدين برفق|हथेलियाँ धीरे उठाना
Relax and lower|Rilassare e abbassare|Rileks dan turunkan|Thả lỏng và hạ xuống|ผ่อนคลายแล้วลดลง|الاسترخاء والخفض|ढीला छोड़ना और नीचे करना
Closing, natural breath|Chiusura, respiro naturale|Penutupan, napas alami|Thu công, thở tự nhiên|จบท่า หายใจธรรมชาติ|الختام مع تنفس طبيعي|समापन, स्वाभाविक श्वास
Lazy tying coat, slow|Legare il mantello, lentamente|Mengikat jubah perlahan|Lãn trát y, chậm|ผูกเสื้อคลุมช้า|ربط المعطف ببطء|धीरे से चोगा बाँधना
Six sealing, four closing, slow|Sei sigilli, quattro chiusure, lento|Enam penutupan, empat penguncian, perlahan|Lục phong tứ bế, chậm|หกผนึกสี่ปิด ช้า|ستة أختام وأربعة إغلاقات، ببطء|छह मुहरें और चार बंद, धीरे
Diagonal step, small|Piccolo passo diagonale|Langkah diagonal kecil|Bước chéo ngắn|ก้าวเฉียงสั้น|خطوة مائلة صغيرة|छोटा तिरछा कदम
Horse stance block and punch|Parata e pugno in posizione del cavaliere|Tangkisan dan pukulan dalam kuda-kuda|Mã bộ đỡ và đấm|ท่าม้าปัดป้องและชก|صد ولكمة في وقفة الحصان|अश्व मुद्रा में बचाव और मुक्का
Fan through back|Aprire il ventaglio attraverso la schiena|Kipas melalui punggung|Phiến thông bối|พัดผ่านหลัง|فتح المروحة عبر الظهر|पीठ से पंखा खोलना
Left side tap|Tocco laterale sinistro|Ketuk samping kiri|Chạm bước ngang trái|แตะเท้าด้านซ้าย|لمسة جانبية إلى اليسار|बाईं ओर पैर छुआना
Right side tap|Tocco laterale destro|Ketuk samping kanan|Chạm bước ngang phải|แตะเท้าด้านขวา|لمسة جانبية إلى اليمين|दाईं ओर पैर छुआना
Forward tap and arms|Tocco avanti e braccia|Ketuk depan dan gerak lengan|Chạm bước trước và vung tay|แตะหน้าและแกว่งแขน|لمسة أمامية وحركة الذراعين|आगे पैर छुआना और बाँहें
Back tap and arms|Tocco indietro e braccia|Ketuk belakang dan gerak lengan|Chạm bước sau và vung tay|แตะหลังและแกว่งแขน|لمسة خلفية وحركة الذراعين|पीछे पैर छुआना और बाँहें
Open the arms|Aprire le braccia|Membuka kedua lengan|Mở hai tay|กางแขน|فتح الذراعين|बाँहें खोलना
Low knee and clap|Ginocchio basso e battito di mani|Lutut rendah dan tepuk tangan|Nâng gối thấp và vỗ tay|ยกเข่าต่ำและปรบมือ|رفع منخفض للركبة وتصفيق|घुटना कम उठाकर ताली
Small waist turn and arms|Piccola rotazione della vita e braccia|Putaran pinggang kecil dan lengan|Xoay eo nhẹ và tay|หมุนเอวเล็กน้อยและแขน|دوران خفيف للخصر والذراعين|कमर हल्की मोड़ना और बाँहें
Return and relax|Ritornare e rilassarsi|Kembali dan rileks|Trở về và thả lỏng|กลับและผ่อนคลาย|العودة والاسترخاء|लौटना और आराम
`);
const courseNames=table(`
cheng37|Tai chi di Cheng Man-ching · 37 forme|Tai chi Cheng Man-ching · 37 jurus|Thái cực quyền Trịnh Mạn Thanh · 37 thức|ไทเก๊กเจิ้งม่านชิง · 37 ท่า|تاي تشي تشنغ مان تشينغ · 37 حركة|चेंग मान-चिंग ताई ची · 37 रूप
tai12|Tai chi semplice · 12 sezioni di gioco|Tai chi sederhana · 12 bagian permainan|Thái cực đơn giản · 12 phần trò chơi|ไทเก๊กง่าย · 12 ช่วงในเกม|تاي تشي مبسط · 12 مقطعًا للعبة|सरल ताई ची · खेल के 12 खंड
baduanjin|Baduanjin · otto broccati|Baduanjin · delapan brokat|Bát đoạn cẩm · 8 đoạn|ปาต้วนจิ่น · 8 ท่า|بادوانجين · قطع الديباج الثماني|बादुआनजिन · आठ रेशमी खंड
taekwondo|Taekwondo · basi lente|Taekwondo · dasar perlahan|Taekwondo · cơ bản chậm|เทควันโด · พื้นฐานช้า|تايكوندو · أساسيات بطيئة|ताइक्वांडो · धीमे मूल अभ्यास
judo|Judo · posizione e passi|Judo · sikap dan langkah|Judo · tư thế và bước chân|ยูโด · ท่ายืนและก้าว|جودو · الوقفة والخطوات|जूडो · मुद्रा और कदम
sumo|Sumo · basi di ampiezza ridotta|Sumo · dasar gerak rendah|Sumo · cơ bản biên độ thấp|ซูโม่ · พื้นฐานช่วงเคลื่อนไหวน้อย|سومو · أساسيات بمدى صغير|सूमो · कम दायरे के मूल अभ्यास
martial|Arti marziali dell’Asia orientale · basi|Seni bela diri Asia Timur · gerak dasar|Võ thuật Đông Á · cơ bản|ศิลปะการต่อสู้เอเชียตะวันออก · พื้นฐาน|فنون القتال لشرق آسيا · حركة أساسية|पूर्वी एशियाई युद्धकलाएँ · मूल गति
taijisword|Spada del tai chi · pratica virtuale lenta|Pedang tai chi · latihan virtual perlahan|Kiếm thái cực · tập chậm với kiếm ảo|กระบี่ไทเก๊ก · ฝึกเสมือนช้า|سيف تاي تشي · تدريب افتراضي بطيء|ताई ची तलवार · धीमा आभासी अभ्यास
qigong|Qigong · respiro naturale e movimento|Qigong · napas alami dan gerakan|Khí công · thở tự nhiên và vận động|ชี่กง · หายใจธรรมชาติและเคลื่อนไหว|تشي كونغ · تنفس طبيعي وحركة|चीगोंग · स्वाभाविक श्वास और गति
chen|Tai chi Chen · otto sezioni lente|Tai chi Chen · delapan bagian perlahan|Thái cực Trần gia · tám phần chậm|ไทเก๊กตระกูลเฉิน · 8 ช่วงช้า|تاي تشي تشن · ثمانية مقاطع بطيئة|चेन ताई ची · आठ धीमे खंड
shaolin|Ispirazione Shaolin · movimenti iniziali|Terinspirasi Shaolin · gerak pemula|Lấy cảm hứng Thiếu Lâm · động tác nhập môn|แรงบันดาลใจเส้าหลิน · ท่าเริ่มต้น|مستوحى من شاولين · حركة للمبتدئين|शाओलिन से प्रेरित · शुरुआती गति
yang|Tai chi Yang · sezioni lente scelte|Tai chi Yang · bagian perlahan pilihan|Thái cực Dương gia · phần chậm tuyển chọn|ไทเก๊กตระกูลหยาง · ช่วงช้าคัดสรร|تاي تشي يانغ · مقاطع بطيئة مختارة|यांग ताई ची · चुने हुए धीमे खंड
dance|Danza di gruppo · ritmo dolce|Tari kelompok · ritme ringan|Múa tập thể · nhịp nhẹ nhàng|เต้นกลุ่ม · จังหวะเบา|رقص جماعي · إيقاع لطيف|सामूहिक नृत्य · हल्की लय
`);
const descriptions=table(`
cheng37|I 37 nomi e numeri seguono il manuale della Società Shizhong. Ogni sezione allena una posa bersaglio del gioco. Ripetizioni, collegamenti e chiusura sono conservati nei dati, ma non animati integralmente. Imparate la sequenza completa con un insegnante.|Nama dan nomor 37 jurus mengikuti buku panduan Perhimpunan Shizhong. Tiap bagian melatih satu pose sasaran permainan. Pengulangan, penghubung, dan penutupan disimpan dalam data tetapi tidak dianimasikan seluruhnya. Pelajari rangkaian lengkap dengan guru.|Tên và số thứ tự 37 thức theo sổ tay của Thời Trung Học Xã. Mỗi phần luyện một tư thế mục tiêu trong trò chơi. Các đoạn lặp, chuyển tiếp và thu thế được lưu trong dữ liệu nhưng chưa diễn hoạt đầy đủ. Hãy học toàn bài với thầy.|ชื่อและหมายเลข 37 ท่าอ้างอิงคู่มือสมาคมสือจง แต่ละช่วงฝึกหนึ่งท่าเป้าหมายของเกม ท่าซ้ำ ท่าเชื่อม และท่าจบเก็บไว้ในข้อมูล แต่ไม่ได้แสดงครบทั้งหมด ควรเรียนชุดท่าเต็มกับครู|تتبع أسماء الحركات الـ37 وأرقامها دليل جمعية شيجونغ. يتدرب كل مقطع على وضع مستهدف واحد في اللعبة. التكرارات والوصلات والختام محفوظة في البيانات لكنها ليست متحركة بالكامل. تعلم التسلسل الكامل مع معلم.|37 रूपों के नाम और क्रम शिझोंग संस्था की पुस्तिका पर आधारित हैं। हर खंड खेल की एक लक्ष्य मुद्रा का अभ्यास कराता है। दोहराव, जोड़ और समापन डेटा में हैं, लेकिन पूरे एनिमेशन में नहीं। पूरा क्रम शिक्षक से सीखें।
tai12|Dodici brevi sezioni di mani e passi del tai chi; non sono una forma ufficiale di dodici posture di una scuola.|Dua belas bagian singkat gerak tangan dan langkah tai chi yang mudah dioperasikan; bukan rangkaian dua belas jurus resmi suatu aliran.|Mười hai phần ngắn gồm thủ pháp và bộ pháp thái cực dễ thao tác; không phải bài 12 thức chính thức của một môn phái.|12 ช่วงสั้นของมือและก้าวไทเก๊กที่ควบคุมง่าย ไม่ใช่ชุด 12 ท่าทางการของสำนักใด|اثنا عشر مقطعًا قصيرًا لحركات اليدين والخطوات في تاي تشي، وليست تسلسلًا رسميًا من اثنتي عشرة وضعية لمدرسة معينة.|ताई ची के हाथों और कदमों के बारह सरल खंड; किसी परंपरा का प्रमाणित बारह-मुद्रा क्रम नहीं।
baduanjin|Otto nomi tradizionali verificati con la fonte dell’amministrazione sportiva. Le pose del gioco sono adattate a piegamenti lievi e ampiezze comode. I riferimenti a organi e malattie nei versi non sono promesse terapeutiche.|Delapan nama tradisional diperiksa terhadap sumber administrasi olahraga. Pose permainan disesuaikan menjadi tekukan dangkal dan jangkauan nyaman. Nama organ dan penyakit dalam syair bukan klaim khasiat medis.|Tám tên truyền thống đã đối chiếu với nguồn của cơ quan thể thao. Trò chơi điều chỉnh thành tư thế hạ thấp nhẹ, trong tầm thoải mái. Tên cơ quan và bệnh trong khẩu quyết không phải khẳng định điều trị.|ตรวจชื่อดั้งเดิมทั้งแปดกับข้อมูลหน่วยงานกีฬา เกมปรับให้ย่อเล็กน้อยและเคลื่อนไหวสบาย คำเกี่ยวกับอวัยวะและโรคในชื่อท่าไม่ใช่คำรับรองผลรักษา|رُوجعت الأسماء التقليدية الثمانية مع مصدر الإدارة الرياضية. يعدلها هذا اللعب إلى ثني خفيف ومدى مريح. ذكر الأعضاء والأمراض في الأبيات لا يعني ادعاء أثر علاجي.|आठ पारंपरिक नाम खेल प्रशासन के स्रोत से मिलाए गए हैं। खेल में हल्के झुकाव और आरामदायक दायरे की मुद्राएँ हैं। पद्यों में अंगों और रोगों का उल्लेख चिकित्सीय लाभ का दावा नहीं है।
taekwondo|Preparazione, parate, pugno diretto lento e calcio frontale basso; non è una lezione di poomsae o combattimento pratico.|Persiapan, tangkisan, pukulan lurus perlahan, dan tendangan depan rendah; bukan pelajaran poomsae atau pertarungan praktis.|Chuẩn bị, đỡ, đấm thẳng chậm và đá trước thấp; không phải dạy bài quyền poomsae hay đối kháng thực tế.|ท่าเตรียม ปัดป้อง ชกตรงช้า และเตะหน้าต่ำ ไม่ใช่การสอนพุมเซ่หรือการต่อสู้จริง|استعداد وصد ولكمة مستقيمة بطيئة وركلة أمامية منخفضة؛ ليس درسًا في البومسي أو النزال العملي.|तैयारी, बचाव, धीमा सीधा मुक्का और नीची आगे की किक; यह पूमसे या वास्तविक मुकाबले का पाठ नहीं है।
judo|Saluto in piedi, posizioni naturale e difensiva, passi avanti e indietro e rotazioni. Il corso non mostra proiezioni, cadute protette o atterraggi.|Membungkuk hormat, sikap alami dan bertahan, langkah maju-mundur serta putaran. Kursus ini tidak memperagakan bantingan, teknik jatuh, atau pendaratan.|Chào đứng, tư thế tự nhiên và phòng thủ, bước tiến lùi và xoay thân. Khóa này không diễn kỹ thuật ném, ngã an toàn hay tiếp đất.|คำนับยืน ท่าธรรมชาติ ท่าป้องกัน ก้าวหน้า-ถอยและหมุนตัว หลักสูตรไม่สาธิตการทุ่ม การล้มรับ หรือการลงพื้น|تحية واقفة ووقفتان طبيعية ودفاعية وخطوات للأمام والخلف ودوران. لا يوضح هذا الدرس الرميات أو السقوط الآمن أو الهبوط.|खड़े होकर अभिवादन, स्वाभाविक और रक्षात्मक मुद्राएँ, आगे-पीछे कदम और मुड़ना। इस पाठ में फेंकना, सुरक्षित गिरना या उतरना नहीं दिखाया गया।
sumo|Posizione base, shiko basso, passi scivolati e teppo nell’aria; senza urti o lotta reale.|Sikap dasar, shiko rendah, langkah geser, dan teppo di udara; tanpa tabrakan atau gulat sungguhan.|Tư thế cơ bản, shiko thấp, bước trượt và teppo trong không khí; không va chạm hoặc đấu vật thật.|ท่าพื้นฐาน ชิโกะต่ำ ก้าวไถล และเทปโปในอากาศ ไม่มีการชนหรือปล้ำจริง|وقفة أساسية وشيكو منخفض وخطوات انزلاقية وتيبو في الهواء؛ من دون اصطدامات أو مصارعة حقيقية.|मूल मुद्रा, नीचा शिको, फिसलते कदम और हवा में तेप्पो; टक्कर या वास्तविक कुश्ती नहीं।
martial|Gioco introduttivo incentrato su mani e posizioni delle arti marziali cinesi, senza considerare tutte le tradizioni regionali come un unico stile.|Permainan pengantar yang berfokus pada gerak tangan dan sikap bela diri Tiongkok, tanpa menyamakan semua tradisi daerah sebagai satu aliran.|Trò chơi nhập môn tập trung vào thủ pháp và bộ pháp võ Trung Hoa, không coi mọi truyền thống khu vực là cùng một môn phái.|เกมเบื้องต้นเน้นมือและก้าวของศิลปะการต่อสู้จีน โดยไม่ถือว่าทุกสำนักในแต่ละภูมิภาคเป็นวิชาเดียวกัน|لعبة تمهيدية تركز على حركات اليدين والوقفات في فنون القتال الصينية، دون اعتبار كل التقاليد الإقليمية أسلوبًا واحدًا.|चीनी युद्धकलाओं के हाथों और मुद्राओं पर केंद्रित शुरुआती खेल; सभी क्षेत्रीय परंपराओं को एक शैली नहीं माना गया है।
taijisword|Otto sezioni di controllo di una spada virtuale; non sono la sequenza completa della spada Cheng né le 32 forme da gara.|Delapan bagian pengendalian pedang virtual; bukan rangkaian lengkap pedang Cheng atau 32 jurus pedang perlombaan.|Tám phần điều khiển kiếm ảo; không phải toàn bài kiếm Trịnh gia hay bài kiếm thi đấu 32 thức.|8 ช่วงควบคุมกระบี่เสมือน ไม่ใช่ชุดกระบี่เจิ้งเต็มชุดหรือกระบี่แข่งขัน 32 ท่า|ثمانية مقاطع للتحكم بسيف افتراضي؛ ليست تسلسل سيف تشنغ الكامل ولا صيغة السيف التنافسية ذات 32 حركة.|आभासी तलवार चलाने के आठ खंड; यह चेंग तलवार का पूरा क्रम या प्रतियोगिता के 32 रूप नहीं हैं।
qigong|Sei sezioni di respiro naturale e movimenti dolci, senza trattenere il fiato o forzare inspirazioni profonde.|Enam bagian napas alami dan gerak lembut; tanpa menahan napas atau memaksakan napas dalam.|Sáu phần thở tự nhiên và vận động nhẹ; không nín thở hoặc ép thở sâu.|6 ช่วงหายใจธรรมชาติและเคลื่อนไหวอ่อนโยน ไม่กลั้นหายใจหรือบังคับหายใจลึก|ستة مقاطع لتنفس طبيعي وحركة لطيفة، دون حبس النفس أو إجبار التنفس العميق.|स्वाभाविक श्वास और हल्की गति के छह खंड; साँस रोकना या जबरन गहरी साँस लेना नहीं।
chen|Otto nomi dalla lista pubblicata da Chen Zhenglei. Le pose non riproducono l’avvolgimento della seta, l’emissione di forza o il metodo corporeo completo.|Delapan nama dari daftar delapan jurus Chen Zhenglei. Pose tidak mereproduksi gerakan lilitan sutra, pelepasan tenaga, atau metode tubuh lengkap.|Tám tên theo danh sách tám thức công khai của Trần Chính Lôi. Tư thế không tái hiện triền ti, phát kình hay thân pháp đầy đủ.|8 ชื่อจากรายการแปดท่าที่เฉินเจิ้งเหลยเผยแพร่ ท่าในเกมไม่ได้จำลองการพันไหม การส่งแรง หรือหลักการใช้ร่างกายทั้งหมด|ثمانية أسماء من قائمة تشن تشنغ لي المنشورة. لا تعيد الوضعيات إنتاج لف الحرير أو إطلاق القوة أو الطريقة الجسدية الكاملة.|चेन झेंगलेई की प्रकाशित आठ रूपों की सूची से नाम लिए गए हैं। मुद्राएँ रेशम लपेटने की गति, शक्ति छोड़ने या पूरी शारीरिक पद्धति को नहीं दोहरातीं।
shaolin|Gioco con basi comuni come posizione del cavaliere, arco e pugno; non rivendica una forma ufficiale o una discendenza del tempio Shaolin.|Permainan dasar umum seperti kuda-kuda, sikap busur, dan pukulan; tidak mengklaim rangkaian resmi atau garis perguruan Kuil Shaolin.|Trò chơi dùng cơ bản phổ biến như mã bộ, cung bộ và xung quyền; không tự nhận là bài chính thức hay truyền thừa của Thiếu Lâm tự.|เกมใช้พื้นฐานทั่วไป เช่น ท่าม้า ท่าคันธนู และหมัดตรง ไม่อ้างว่าเป็นชุดทางการหรือสืบสายสำนักวัดเส้าหลิน|لعبة تستخدم أساسيات شائعة مثل وقفة الحصان والقوس واللكمة؛ لا تدعي أنها صيغة رسمية أو امتداد لسلسلة تعليم معبد شاولين.|अश्व मुद्रा, धनुष मुद्रा और मुक्के जैसे सामान्य मूल अभ्यासों का खेल; शाओलिन मंदिर के आधिकारिक क्रम या वंश-परंपरा का दावा नहीं है।
yang|Nomi comuni scelti dallo stile Yang; non è la forma completa di 103 posture né un’altra forma breve ufficiale.|Nama gerakan umum pilihan dari gaya Yang; bukan rangkaian lengkap 103 jurus atau rangkaian pendek resmi lainnya.|Chọn các tên thường dùng của Dương gia; không phải toàn bài 103 thức hay một bài rút gọn khác.|เลือกชื่อท่าที่ใช้ทั่วไปในตระกูลหยาง ไม่ใช่ชุดเต็ม 103 ท่าหรือชุดย่ออื่น|أسماء شائعة مختارة من أسلوب يانغ؛ ليست التسلسل الكامل ذي 103 وضعيات ولا صيغة قصيرة أخرى.|यांग शैली के चुने हुए सामान्य नाम; यह पूरा 103-मुद्रा क्रम या कोई अन्य छोटा क्रम नहीं है।
dance|Otto sezioni originali di passi leggeri e braccia; senza brani commerciali o coreografie altrui.|Delapan bagian orisinal langkah ringan dan gerak lengan; tidak memakai lagu komersial atau menyalin koreografi orang lain.|Tám phần bước nhẹ và tay do trò chơi sáng tác; không dùng bài hát thương mại hoặc sao chép vũ đạo của người khác.|8 ช่วงก้าวเบาและแกว่งแขนที่สร้างขึ้นใหม่ ไม่ใช้เพลงเชิงพาณิชย์หรือคัดลอกท่าเต้นของผู้อื่น|ثمانية مقاطع أصلية من خطوات لطيفة وحركات الذراعين؛ دون أغان تجارية أو نسخ رقصات الآخرين.|हल्के कदमों और बाँहों के आठ मौलिक खंड; व्यावसायिक गीत या दूसरों की नृत्यरचना का उपयोग नहीं।
`);
const sourceLabels=table(`
cheng37|Manuale della Società Shizhong sul dominio del memoriale di Cheng Man-ching|Buku panduan Perhimpunan Shizhong pada domain memorial Cheng Man-ching|Sổ tay Thời Trung Học Xã trên tên miền nhà tưởng niệm Trịnh Mạn Thanh|คู่มือสมาคมสือจงบนโดเมนอนุสรณ์เจิ้งม่านชิง|دليل جمعية شيجونغ على نطاق موقع نصب تشنغ مان تشينغ التذكاري|चेंग मान-चिंग स्मारक के डोमेन पर शिझोंग संस्था की पुस्तिका
tai12|Composizione originale del gioco|Susunan orisinal permainan|Bố cục nguyên gốc của trò chơi|การเรียงชุดที่สร้างขึ้นสำหรับเกม|ترتيب أصلي للعبة|खेल का मौलिक संयोजन
baduanjin|Amministrazione generale dello sport: posture fisse del Baduanjin|Administrasi Umum Olahraga: postur tetap Baduanjin|Tổng cục Thể thao: tư thế định hình Bát đoạn cẩm|สำนักงานการกีฬาจีน: ท่าหลักปาต้วนจิ่น|الإدارة العامة للرياضة: وضعيات بادوانجين الثابتة|सामान्य खेल प्रशासन: बादुआनजिन की स्थिर मुद्राएँ
taekwondo|Terminologia del Kukkiwon per alcuni nomi|Istilah Kukkiwon untuk beberapa nama|Thuật ngữ Kukkiwon cho một số tên|ศัพท์ของคุกคิวอนสำหรับบางชื่อท่า|مصطلحات كوكيوون لبعض الأسماء|कुछ नामों के लिए कुक्कीवोन शब्दावली
judo|Materiali didattici della Federazione giapponese di judo per le categorie di base|Bahan ajar Federasi Judo Seluruh Jepang untuk kategori dasar|Tài liệu dạy học Liên đoàn Judo Nhật Bản cho các nhóm động tác cơ bản|สื่อการสอนสหพันธ์ยูโดญี่ปุ่นสำหรับกลุ่มท่าพื้นฐาน|مواد اتحاد الجودو الياباني التعليمية لفئات الحركة الأساسية|मूल श्रेणियों के लिए अखिल जापान जूडो संघ की शिक्षण सामग्री
sumo|Nomi shiko, suriashi e teppo dell’Associazione giapponese di sumo|Nama shiko, suriashi, dan teppo dari Asosiasi Sumo Jepang|Tên shiko, suriashi và teppo của Hiệp hội Sumo Nhật Bản|ชื่อชิโกะ ซูริอาชิ และเทปโปจากสมาคมซูโม่ญี่ปุ่น|أسماء شيكو وسوري آشي وتيبو لدى جمعية السومو اليابانية|जापान सूमो संघ के शिको, सुरिआशी और तेप्पो नाम
martial|Movimenti generali riuniti per il gioco|Gerak umum yang dirangkai untuk permainan|Động tác phổ thông được ghép cho trò chơi|ท่าทั่วไปที่รวบรวมสำหรับเกม|حركات عامة جُمعت للعبة|खेल के लिए जोड़ी गई सामान्य गतियाँ
taijisword|Sezioni originali con spada virtuale|Bagian pedang virtual orisinal|Các phần kiếm ảo nguyên gốc|ช่วงกระบี่เสมือนที่สร้างขึ้นใหม่|مقاطع أصلية بالسيف الافتراضي|मौलिक आभासी तलवार खंड
qigong|Sezioni originali di movimento dolce|Bagian gerak lembut orisinal|Các phần vận động nhẹ nguyên gốc|ช่วงเคลื่อนไหวอ่อนโยนที่สร้างขึ้นใหม่|مقاطع أصلية لحركة لطيفة|मौलिक हल्की गति के खंड
chen|Lista delle otto forme di Chen Zhenglei Ltd|Daftar delapan jurus Chen Zhenglei Ltd|Danh sách tám thức của Chen Zhenglei Ltd|รายการแปดท่าของ Chen Zhenglei Ltd|قائمة الحركات الثماني لشركة تشن تشنغ لي|चेन झेंगलेई लिमिटेड की आठ रूपों की सूची
shaolin|Basi generali, senza approvazione del tempio Shaolin|Dasar umum, tanpa persetujuan Kuil Shaolin|Cơ bản phổ thông, không được Thiếu Lâm tự phê duyệt|พื้นฐานทั่วไป ไม่ได้รับการรับรองจากวัดเส้าหลิน|أساسيات عامة، دون اعتماد من معبد شاولين|सामान्य मूल अभ्यास, शाओलिन मंदिर का अनुमोदन नहीं
 yang|Nomi dalle liste pubbliche di Yang Family Tai Chi|Nama dari daftar publik Yang Family Tai Chi|Tên từ danh sách công khai của Yang Family Tai Chi|ชื่อจากรายการสาธารณะของ Yang Family Tai Chi|أسماء من قوائم تاي تشي لعائلة يانغ المنشورة|यांग फैमिली ताई ची की सार्वजनिक सूचियों से नाम
dance|Movimenti e ordine originali del gioco|Gerakan dan urutan orisinal permainan|Động tác và thứ tự nguyên gốc của trò chơi|ท่าและลำดับที่สร้างขึ้นใหม่สำหรับเกม|حركات وترتيب أصليان للعبة|खेल की मौलिक गतियाँ और क्रम
`.replace('\n yang|','\nyang|'));
const genericNotes={
it:'Le pose 3D, le interpolazioni e le indicazioni sono create per il gioco e non validate da un insegnante. Non sono una sequenza completa certificata né lezioni di combattimento.',
id:'Pose 3D, interpolasi, dan petunjuk dibuat untuk permainan dan belum divalidasi guru. Ini bukan rangkaian lengkap bersertifikat atau pelajaran pertarungan.',
vi:'Tư thế 3D, nội suy và chỉ dẫn do trò chơi biên soạn, chưa được giáo viên xác nhận. Đây không phải toàn bài được chứng nhận hay bài dạy chiến đấu.',
th:'ท่า 3 มิติ การเคลื่อนไหวเชื่อม และคำแนะนำสร้างสำหรับเกม ยังไม่ผ่านการตรวจจากครู ไม่ใช่ชุดท่าครบที่รับรองหรือการสอนต่อสู้',
ar:'الوضعيات ثلاثية الأبعاد والاستيفاء والإرشادات من إعداد اللعبة ولم يعتمدها معلم. ليست تسلسلًا كاملًا معتمدًا ولا دروس قتال.',
hi:'3D मुद्राएँ, बीच की गतियाँ और निर्देश खेल के लिए बनाए गए हैं; शिक्षक ने सत्यापित नहीं किए हैं। ये प्रमाणित पूरा क्रम या युद्ध का पाठ नहीं हैं।'
};
const chengSpelling={
it:'La forma 4 usa il carattere comune 捋; la forma 37 conserva la grafia originale 彎躬射虎.',
id:'Jurus 4 memakai karakter lazim 捋; jurus 37 mempertahankan ejaan sumber 彎躬射虎.',
vi:'Thức 4 dùng chữ thông dụng 捋; thức 37 giữ nguyên chữ nguồn 彎躬射虎.',
th:'ท่าที่ 4 ใช้อักษรทั่วไป 捋 ส่วนท่าที่ 37 คงอักษรจากแหล่งเดิม 彎躬射虎',
ar:'تستخدم الحركة 4 الحرف الشائع 捋، وتحتفظ الحركة 37 بكتابة المصدر 彎躬射虎.',
hi:'रूप 4 में प्रचलित अक्षर 捋 और रूप 37 में मूल स्रोत की वर्तनी 彎躬射虎 रखी गई है।'
};
const benefits=table(`
balance|Allenare il trasferimento del peso e l’equilibrio: è un obiettivo generale di movimento, non un effetto terapeutico dimostrato di questa mossa.|Melatih pemindahan berat dan keseimbangan; ini tujuan olahraga umum, bukan efek terapi yang terbukti dari gerakan ini.|Luyện chuyển trọng tâm và thăng bằng; đây là mục tiêu vận động chung, không phải tác dụng điều trị đã được chứng minh của động tác.|ฝึกถ่ายน้ำหนักและควบคุมสมดุล เป็นเป้าหมายการออกกำลังกายทั่วไป ไม่ใช่ผลรักษาที่พิสูจน์แล้วของท่านี้|تدريب نقل الوزن وضبط التوازن؛ هدف عام للتمرين وليس أثرًا علاجيًا مثبتًا لهذه الحركة.|वजन बदलने और संतुलन का अभ्यास; यह व्यायाम का सामान्य लक्ष्य है, इस गति का सिद्ध चिकित्सीय प्रभाव नहीं।
coordination|Allenare la coordinazione di braccia, gambe e tronco e la memoria dei movimenti.|Melatih koordinasi lengan, kaki, dan batang tubuh serta ingatan gerakan.|Luyện phối hợp tay, chân, thân và ghi nhớ động tác.|ฝึกประสานแขน ขา ลำตัว และจดจำการเคลื่อนไหว|تدريب تنسيق الذراعين والساقين والجذع وتذكر الحركات.|बाँहों, पैरों और धड़ का समन्वय तथा गतियों को याद रखने का अभ्यास।
mobility|Allenare la mobilità di spalle, anche e tronco entro un’ampiezza confortevole.|Melatih mobilitas bahu, pinggul, dan batang tubuh dalam jangkauan nyaman.|Luyện độ linh hoạt của vai, hông và thân trong phạm vi thoải mái.|ฝึกช่วงเคลื่อนไหวของไหล่ สะโพก และลำตัวในระยะสบาย|تدريب حركة الكتفين والوركين والجذع ضمن مدى مريح.|आरामदायक दायरे में कंधों, कूल्हों और धड़ की गतिशीलता का अभ्यास।
breath|Allenare il respiro naturale, l’attenzione e un ritmo di movimento lento.|Melatih napas alami, perhatian, dan ritme gerak perlahan.|Luyện thở tự nhiên, chú ý và nhịp vận động chậm.|ฝึกหายใจธรรมชาติ สมาธิ และจังหวะเคลื่อนไหวช้า|تدريب التنفس الطبيعي والانتباه وإيقاع حركة بطيء.|स्वाभाविक श्वास, ध्यान और धीमी गति की लय का अभ्यास।
legs|Allenare il sostegno delle gambe, i passi e la postura, senza accosciate profonde o allungamenti forzati.|Melatih dukungan kaki, langkah, dan kendali postur tanpa jongkok dalam atau peregangan paksa.|Luyện sức nâng đỡ của chân, bước chân và kiểm soát tư thế; không cần ngồi xổm sâu hoặc kéo giãn gắng sức.|ฝึกการพยุงของขา ก้าว และควบคุมท่าทาง โดยไม่ย่อลึกหรือฝืนยืด|تدريب دعم الساقين والخطوات وضبط الوضعية دون قرفصاء عميقة أو تمدد قسري.|गहरी बैठक या जबरन खिंचाव के बिना पैरों के सहारे, कदमों और मुद्रा नियंत्रण का अभ्यास।
rhythm|Allenare il ritmo, la coordinazione destra-sinistra e movimenti dolci di tutto il corpo.|Melatih ritme, koordinasi kiri-kanan, dan gerak ringan seluruh tubuh.|Luyện nhịp điệu, phối hợp trái-phải và vận động nhẹ toàn thân.|ฝึกจังหวะ ประสานซ้ายขวา และเคลื่อนไหวทั้งตัวเบา ๆ|تدريب الإيقاع والتنسيق بين الجانبين والحركة اللطيفة لكامل الجسم.|लय, दाएँ-बाएँ समन्वय और पूरे शरीर की हल्की गति का अभ्यास।
`);
const poseWords={
 it:{left:'sinistra',right:'destra',waist:'all’altezza della vita',chest:'all’altezza del petto',head:'accanto alla testa',front:'in avanti',side:'di lato',back:'leggermente indietro',neutral:'verso una posizione comoda',arm:(s,h,d)=>`Portate la mano ${s} ${h} e muovetela dolcemente ${d}.`,lift:s=>`Sollevate poco il piede sul lato ${s}; mantenete stabile la gamba d’appoggio.`,step:s=>`Fate un piccolo passo avanti con il piede sul lato ${s}.`,backStep:s=>`Fate un piccolo passo indietro con il piede sul lato ${s}, senza inclinarvi all’indietro.`,wide:'Aprite i piedi a una larghezza confortevole.',parallel:'Mantenete i piedi stabili, senza incrociarli.',turn:s=>`Ruotate poco la vita a ${s}, mantenendo ginocchia e dita dei piedi nella stessa direzione.`,centre:'Mantenete il tronco centrato e le spalle rilassate.',low:'Piegate poco le ginocchia, senza accosciarvi profondamente.',soft:'Lasciate morbide le ginocchia e respirate naturalmente.'},
 id:{left:'kiri',right:'kanan',waist:'setinggi pinggang',chest:'setinggi dada',head:'di samping kepala',front:'ke depan',side:'ke samping',back:'sedikit ke belakang',neutral:'ke posisi nyaman',arm:(s,h,d)=>`Posisikan tangan ${s} ${h}, lalu gerakkan perlahan ${d}.`,lift:s=>`Angkat kaki ${s} sedikit saja; stabilkan kaki penopang.`,step:s=>`Langkahkan kaki ${s} sedikit ke depan.`,backStep:s=>`Langkahkan kaki ${s} sedikit ke belakang tanpa mencondongkan tubuh ke belakang.`,wide:'Buka kaki selebar yang terasa nyaman.',parallel:'Jaga kedua kaki stabil tanpa menyilangkannya.',turn:s=>`Putar pinggang sedikit ke ${s}; arahkan lutut sejalan dengan jari kaki.`,centre:'Jaga batang tubuh di tengah dan rilekskan bahu.',low:'Tekuk lutut sedikit, tanpa jongkok dalam.',soft:'Biarkan lutut lentur dan bernapas alami.'},
 vi:{left:'trái',right:'phải',waist:'ngang eo',chest:'ngang ngực',head:'cạnh đầu',front:'về trước',side:'sang bên',back:'hơi về sau',neutral:'đến vị trí thoải mái',arm:(s,h,d)=>`Đặt tay ${s} ${h}, rồi đưa nhẹ ${d}.`,lift:s=>`Chỉ nâng nhẹ chân ${s}, giữ vững chân trụ.`,step:s=>`Bước chân ${s} một bước ngắn về trước.`,backStep:s=>`Lùi chân ${s} một bước ngắn, không ngả người ra sau.`,wide:'Mở hai chân với độ rộng thoải mái.',parallel:'Giữ chân ổn định, không bắt chéo.',turn:s=>`Xoay eo nhẹ sang ${s}; giữ gối cùng hướng với ngón chân.`,centre:'Giữ thân ở giữa và thả lỏng vai.',low:'Gập gối nhẹ, không ngồi xổm sâu.',soft:'Thả lỏng đầu gối và thở tự nhiên.'},
 th:{left:'ซ้าย',right:'ขวา',waist:'ระดับเอว',chest:'ระดับอก',head:'ข้างศีรษะ',front:'ไปด้านหน้า',side:'ไปด้านข้าง',back:'ไปด้านหลังเล็กน้อย',neutral:'ไปยังตำแหน่งที่สบาย',arm:(s,h,d)=>`วางมือ${s}${h} แล้วเคลื่อนเบา ๆ ${d}`,lift:s=>`ยกเท้า${s}เพียงเล็กน้อย โดยให้ขาที่รับน้ำหนักมั่นคง`,step:s=>`ก้าวเท้า${s}ไปด้านหน้าสั้น ๆ`,backStep:s=>`ก้าวเท้า${s}ถอยหลังสั้น ๆ โดยไม่เอนตัวไปด้านหลัง`,wide:'แยกเท้ากว้างในระยะที่สบาย',parallel:'วางเท้ามั่นคง ไม่ไขว้เท้า',turn:s=>`หมุนเอวไปทาง${s}เล็กน้อย ให้เข่าและปลายเท้าหันทางเดียวกัน`,centre:'รักษาลำตัวให้อยู่กลางและผ่อนคลายไหล่',low:'งอเข่าเพียงเล็กน้อย ไม่ย่อตัวลึก',soft:'ผ่อนเข่าและหายใจตามธรรมชาติ'},
 ar:{left:'اليسار',right:'اليمين',waist:'عند مستوى الخصر',chest:'عند مستوى الصدر',head:'بجانب الرأس',front:'إلى الأمام',side:'إلى الجانب',back:'قليلًا إلى الخلف',neutral:'إلى موضع مريح',arm:(s,h,d)=>`ضع اليد ${s==='اليسار'?'اليسرى':'اليمنى'} ${h}، ثم حركها بلطف ${d}.`,lift:s=>`ارفع القدم ${s==='اليسار'?'اليسرى':'اليمنى'} قليلًا فقط مع تثبيت ساق الارتكاز.`,step:s=>`خذ خطوة قصيرة إلى الأمام بالقدم ${s==='اليسار'?'اليسرى':'اليمنى'}.`,backStep:s=>`خذ خطوة قصيرة إلى الخلف بالقدم ${s==='اليسار'?'اليسرى':'اليمنى'} دون الميل إلى الخلف.`,wide:'باعد بين القدمين بمسافة مريحة.',parallel:'حافظ على ثبات القدمين دون تقاطعهما.',turn:s=>`أدر الخصر قليلًا نحو ${s}؛ اجعل الركبتين وأصابع القدمين في الاتجاه نفسه.`,centre:'حافظ على الجذع في المنتصف وأرخ الكتفين.',low:'اثن الركبتين قليلًا دون قرفصاء عميقة.',soft:'أبق الركبتين مرنتين وتنفس بشكل طبيعي.'},
 hi:{left:'बाईं',right:'दाईं',waist:'कमर की ऊँचाई पर',chest:'छाती की ऊँचाई पर',head:'सिर के पास',front:'आगे',side:'बगल में',back:'थोड़ा पीछे',neutral:'आरामदायक स्थान की ओर',arm:(s,h,d)=>`${s} ओर का हाथ ${h} रखें, फिर उसे धीरे ${d} ले जाएँ।`,lift:s=>`${s} ओर का पैर थोड़ा ही उठाएँ और सहारा देने वाले पैर को स्थिर रखें।`,step:s=>`${s} ओर के पैर से आगे छोटा कदम लें।`,backStep:s=>`${s} ओर के पैर से पीछे छोटा कदम लें; शरीर पीछे न झुकाएँ।`,wide:'पैरों को आरामदायक दूरी पर खोलें।',parallel:'पैरों को स्थिर रखें और आपस में पार न करें।',turn:s=>`कमर थोड़ी ${s} ओर मोड़ें; घुटने और पैर की उँगलियाँ एक दिशा में रखें।`,centre:'धड़ बीच में और कंधे ढीले रखें।',low:'घुटने हल्के मोड़ें, गहरी बैठक न लगाएँ।',soft:'घुटने ढीले रखें और स्वाभाविक श्वास लें।'}
};
// These additional guards retain the limitations of the authored source cues.
const guards=table(`
noImpact|Eseguite solo un gesto lento nell’aria: non colpite persone, colonne o altri oggetti.|Latih perlahan di udara saja; jangan memukul orang, tiang, atau benda lain.|Chỉ tập chậm trong không khí; không đánh người, cột hoặc vật khác.|ฝึกช้าในอากาศเท่านั้น ห้ามตีคน เสา หรือวัตถุอื่น|تدرب ببطء في الهواء فقط؛ لا تضرب الأشخاص أو الأعمدة أو الأشياء.|केवल हवा में धीरे अभ्यास करें; लोगों, खंभों या वस्तुओं पर प्रहार न करें।
noLock|Non bloccate i gomiti né irrigidite i polsi; tenete spalle e collo rilassati.|Jangan mengunci siku atau menegangkan pergelangan; rilekskan bahu dan leher.|Không khóa khuỷu hoặc gồng cổ tay; thả lỏng vai và cổ.|ไม่ล็อกศอกหรือเกร็งข้อมือ ผ่อนคลายไหล่และคอ|لا تقفل المرفقين ولا تشد الرسغين؛ أرخ الكتفين والرقبة.|कोहनियाँ न जकड़ें, कलाइयाँ न अकड़ाएँ; कंधे और गर्दन ढीले रखें।
noBreathForce|Non trattenete il fiato e non forzate respiri profondi.|Jangan menahan napas atau memaksakan tarikan napas dalam.|Không nín thở hoặc cố hít quá sâu.|ไม่กลั้นหายใจหรือบังคับหายใจลึก|لا تحبس النفس ولا تجبر نفسك على تنفس عميق.|साँस न रोकें और जबरन गहरी साँस न लें।
noHighKick|Mantenete il sollevamento basso e controllato; non cercate calci alti e non inclinatevi indietro.|Pertahankan angkatan rendah dan terkendali; jangan mengejar tendangan tinggi atau bersandar ke belakang.|Nâng chân thấp, có kiểm soát; không cố đá cao hoặc ngả người ra sau.|ยกขาต่ำอย่างควบคุม ไม่พยายามเตะสูงหรือเอนหลัง|أبق رفع الساق منخفضًا ومضبوطًا؛ لا تحاول الركل عاليًا ولا تمل إلى الخلف.|पैर कम ऊँचाई पर नियंत्रण से उठाएँ; ऊँची किक की कोशिश या पीछे झुकाव न करें।
noTwistKnee|La posa finale del gioco non riproduce una rotazione completa. Non torcete il ginocchio d’appoggio e non girate con forza.|Pose akhir permainan tidak menampilkan putaran lengkap. Jangan memuntir lutut penopang atau memaksa putaran.|Tư thế cuối của trò chơi không tái hiện toàn bộ động tác xoay. Không vặn gối trụ hoặc xoay gắng sức.|ท่าเป้าหมายในเกมไม่ได้แสดงการหมุนครบ ห้ามบิดเข่าข้างที่รับน้ำหนักหรือฝืนหมุน|الوضع النهائي في اللعبة لا يعيد الدوران الكامل. لا تلوِ ركبة الارتكاز ولا تدر بقوة.|खेल की अंतिम मुद्रा पूरा घुमाव नहीं दिखाती। सहारा देने वाले घुटने को न मरोड़ें और जोर से न घूमें।
lotus|È solo una posa a gamba bassa: non dimostra la rotazione completa né il colpo alla pianta del piede.|Ini hanya pose kaki terangkat rendah; tidak memperagakan putaran penuh atau tepukan kaki.|Đây chỉ là tư thế nâng chân thấp; không diễn xoay tròn đầy đủ hoặc vỗ bàn chân.|เป็นเพียงท่ายกขาต่ำ ไม่สาธิตหมุนเต็มรอบหรือตบเท้า|هذه وضعية رفع منخفض للساق فقط؛ لا توضح دورانًا كاملًا أو صفع القدم.|यह केवल कम ऊँचाई पर पैर उठाने की मुद्रा है; पूरा घूमना या पैर पर थपकी दिखाना नहीं।
sword|Usate solo la spada virtuale del gioco; non serve una spada vera. Lasciate spazio libero intorno a voi.|Gunakan hanya pedang virtual permainan; tidak perlu pedang sungguhan. Sisakan ruang bebas di sekitar Anda.|Chỉ dùng kiếm ảo của trò chơi; không cần kiếm thật. Giữ khoảng trống xung quanh.|ใช้กระบี่เสมือนของเกมเท่านั้น ไม่ต้องใช้กระบี่จริง เว้นพื้นที่รอบตัว|استخدم سيف اللعبة الافتراضي فقط؛ لا حاجة إلى سيف حقيقي. اترك مساحة خالية حولك.|केवल खेल की आभासी तलवार इस्तेमाल करें; असली तलवार नहीं चाहिए। आसपास खाली जगह रखें।
noStamp|Abbassate il piede dolcemente e con controllo; non saltate e non battete forte il piede a terra.|Turunkan kaki lembut dan terkendali; jangan melompat atau mengentakkan kaki kuat-kuat.|Hạ chân nhẹ, có kiểm soát; không nhảy hoặc giậm mạnh.|วางเท้าลงเบาและควบคุม ไม่กระโดดหรือกระแทกเท้าแรง|اخفض القدم بلطف وتحكم؛ لا تقفز ولا تضرب الأرض بالقدم بقوة.|पैर धीरे और नियंत्रण से नीचे रखें; कूदें या पैर जोर से न पटकें।
noNeckForce|Lasciate seguire lo sguardo al corpo senza forzare il collo, scuotere la testa o ruotare bruscamente la vita.|Biarkan pandangan mengikuti tubuh tanpa memaksa leher, mengayun kepala, atau memutar pinggang mendadak.|Để mắt theo thân; không cố vặn cổ, lắc đầu hoặc xoay eo giật mạnh.|ให้สายตามองตามลำตัว ไม่ฝืนบิดคอ สะบัดศีรษะ หรือกระชากเอว|دع النظر يتبع الجسم دون إجبار الرقبة أو هز الرأس أو لي الخصر فجأة.|नज़र शरीर के साथ घूमे; गर्दन पर जोर, सिर झटकना या कमर अचानक मोड़ना न करें।
noDeepReach|Scendete solo fin dove è comodo; mantenete la schiena lunga senza lanciarvi verso terra.|Turun hanya sejauh nyaman; jaga punggung memanjang tanpa menghunjam ke lantai.|Chỉ hạ đến mức thoải mái; giữ lưng dài, không lao người xuống đất.|ลดตัวเท่าที่สบาย รักษาหลังยาว ไม่พุ่งตัวลงพื้น|انخفض بقدر مريح فقط؛ حافظ على امتداد الظهر دون الاندفاع نحو الأرض.|केवल आराम की सीमा तक नीचे जाएँ; पीठ लंबी रखें और जमीन की ओर न झपटें।
noTherapy|I termini tradizionali del nome non sono una promessa di cura.|Istilah tradisional dalam nama bukan janji pengobatan.|Từ ngữ truyền thống trong tên không phải lời hứa chữa bệnh.|คำดั้งเดิมในชื่อท่าไม่ใช่คำสัญญาว่ารักษาโรค|المصطلحات التقليدية في الاسم ليست وعدًا بالعلاج.|नाम के पारंपरिक शब्द इलाज का वादा नहीं हैं।
`);
function localizedPoseCues(pose,lang,move,course){
 const w=poseWords[lang], out=[];
 for(const side of ['left','right']){
  const v=pose.hands[side];
  const height=v[1]>1.72?w.head:v[1]>1.2?w.chest:w.waist;
  const direction=v[2]>.3?w.front:v[2]<-.05?w.back:Math.abs(v[0])>.5?w.side:w.neutral;
  out.push(w.arm(w[side],height,direction));
 }
 const lifted=Object.keys(pose.feet).find(s=>pose.feet[s][1]>.09);
 const forward=Object.keys(pose.feet).find(s=>pose.feet[s][2]>.2);
 const backward=Object.keys(pose.feet).find(s=>pose.feet[s][2]<-.2);
 out.push(lifted?w.lift(w[lifted]):forward?w.step(w[forward]):backward?w.backStep(w[backward]):Math.abs(pose.feet.left[0])>.32?w.wide:w.parallel);
 out.push(Math.abs(pose.waist)>.12?w.turn(w[pose.waist<0?'left':'right']):w.centre);
 out.push(pose.crouch>.16?w.low:w.soft);
 const source=move.cues.en.join(' '), add=new Set(['noLock']);
 if(/strike|hit |punch|teppo|shoulder alignment/i.test(source+' '+move.name.en)) add.add('noImpact');
 if(/breath|breath/i.test(source)||course.id==='qigong') add.add('noBreathForce');
 if(lifted||/kick/i.test(move.name.en)) add.add('noHighKick');
 if(/complete turn|support knee/.test(source)) add.add('noTwistKnee');
 if(/spin|foot slap/.test(source)) add.add('lotus');
 if(course.id==='taijisword') add.add('sword');
 if(course.id==='sumo'||/stamp|jump|heel raise/.test(source+' '+move.name.en)) add.add('noStamp');
 if(/neck|head|behind/.test(source+' '+move.name.en)) add.add('noNeckForce');
 if(/ground|floor|downward|Reach down/.test(source+' '+move.name.en)) add.add('noDeepReach');
 if(course.id==='baduanjin') add.add('noTherapy');
 for(const key of add) out.push(guards[key][lang]);
 return out;
}
export function applyCurriculumLocalesV3(curricula){
 for(const c of curricula){
  for(const lang of LANGS){
   c.name[lang]=courseNames[c.id][lang];
   c.description[lang]=descriptions[c.id][lang];
   c.sourceNote[lang]=[sourceLabels[c.id][lang],c.id==='cheng37'?chengSpelling[lang]:null,genericNotes[lang]].filter(Boolean).join(' ');
   for(const m of c.moves){
    if(!moveNames[m.name.en]?.[lang]) throw new Error(`Missing v3 move name: ${m.name.en}/${lang}`);
    m.name[lang]=moveNames[m.name.en][lang];
    m.cues[lang]=localizedPoseCues(m.pose,lang,m,c);
    m.benefits[lang]=benefits[m.benefitType][lang];
    for(const continuation of m.continuations||[]){
     if(!moveNames[continuation.name.en]?.[lang]) throw new Error(`Missing v3 continuation: ${continuation.name.en}/${lang}`);
     continuation.name[lang]=moveNames[continuation.name.en][lang];
    }
   }
  }
 }
}
