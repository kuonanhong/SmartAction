/** Voice-panel and update labels, fully localized for all eighteen locales. */
const keys=['voiceSettingsTitle','voiceSourceFilter','voiceAllSources','voiceNatural','voiceSystem','voiceMechanical','voiceGenderFilter','voiceAllGenders','voiceMale','voiceFemale','voiceRate','voiceReplayLast','voiceBackupTest','voiceScopeV4','voiceNoResults','voiceNaturalLocaleNote','voiceUnknownGender','voiceResetChoice','newRelease'];
const rows={
'zh-TW':`
語音與聲音設定
聲音來源
全部來源
自然合成聲（固定招式）
裝置語音（任意文字）
機械備援
聲線
全部聲線
男聲
女聲
朗讀速度
重播上一句
音檔備援試聽
中文與英文各附兩男兩女自然合成聲，涵蓋37式及試聽；任意教練回答仍使用裝置語音。聲線選擇與速度會記在此裝置。
沒有符合的聲音，請改選全部來源與全部聲線。
自然音檔目前提供普通話及英文；其他語言使用裝置語音或機械備援。
未標示聲線
恢復自動選擇
新版已就緒，重新載入
`,
'zh-CN':`
语音与声音设置
声音来源
全部来源
自然合成声（固定招式）
设备语音（任意文字）
机械备用
声线
全部声线
男声
女声
朗读速度
重播上一句
音频备用试听
中文与英文各附两男两女自然合成声，涵盖37式及试听；任意教练回答仍使用设备语音。声线选择与速度会记在此设备。
没有符合的声音，请改选全部来源与全部声线。
自然音频目前提供普通话及英文；其他语言使用设备语音或机械备用。
未标注声线
恢复自动选择
新版已就绪，重新加载
`,
en:`
Speech and voice settings
Voice source
All sources
Natural synthetic voice (fixed moves)
Device voice (any text)
Mechanical fallback
Voice type
All voice types
Male voice
Female voice
Speech speed
Replay last phrase
Test audio fallback
Mandarin and English each include two male and two female natural synthetic voices for the 37 moves and a test phrase. Free-form coach replies still use device speech. Voice choice and speed are saved on this device.
No matching voices. Select all sources and all voice types.
Natural recordings currently support Mandarin and English; other languages use device speech or mechanical fallback.
Voice type unspecified
Restore automatic selection
An update is ready. Reload
`,
ja:`
読み上げと音声の設定
音声の種類
すべての音声源
自然な合成音声（固定の招式）
端末の音声（任意の文章）
機械音声の予備
声のタイプ
すべての声タイプ
男性の声
女性の声
読み上げ速度
直前の文を再生
予備音声ファイルを試聴
標準中国語と英語に、それぞれ男性2声・女性2声の自然な合成音声を収録しています。37式と試聴文に対応し、自由なコーチ回答は端末の音声で読み上げます。声と速度の選択はこの端末に保存されます。
一致する音声がありません。すべての音声源と声タイプを選んでください。
自然な音声ファイルは現在、標準中国語と英語に対応しています。他の言語は端末音声または機械音声の予備を使います。
声タイプ未指定
自動選択に戻す
更新版を使えます。再読み込み
`,
ko:`
음성 및 소리 설정
음성 출처
모든 출처
자연스러운 합성 음성 (정해진 동작)
기기 음성 (임의의 텍스트)
기계 음성 대체
음색 유형
모든 음색
남성 음성
여성 음성
읽기 속도
마지막 문장 다시 듣기
대체 음성 파일 시험 듣기
표준 중국어와 영어에 각각 남성 2개와 여성 2개의 자연스러운 합성 음성이 있으며, 37식과 시험 문장을 읽습니다. 자유로운 코치 답변은 여전히 기기 음성을 사용합니다. 음색과 속도는 이 기기에 저장됩니다.
맞는 음성이 없습니다. 모든 출처와 모든 음색을 선택하세요.
자연스러운 음성 파일은 현재 표준 중국어와 영어로 제공됩니다. 다른 언어는 기기 음성이나 기계 음성 대체를 사용합니다.
음색 유형 미표시
자동 선택으로 복원
새 버전이 준비되었습니다. 새로 고침
`,
es:`
Ajustes de voz y lectura
Origen de la voz
Todos los orígenes
Voz sintética natural (movimientos fijos)
Voz del dispositivo (cualquier texto)
Respaldo mecánico
Tipo de voz
Todos los tipos
Voz masculina
Voz femenina
Velocidad de lectura
Repetir la última frase
Probar audio de respaldo
El mandarín y el inglés incluyen, cada uno, dos voces masculinas y dos femeninas de síntesis natural para los 37 movimientos y una frase de prueba. Las respuestas libres del entrenador siguen usando la voz del dispositivo. La voz y la velocidad se guardan en este dispositivo.
No hay voces coincidentes. Selecciona todos los orígenes y tipos de voz.
Los audios naturales están disponibles en mandarín e inglés; los demás idiomas usan la voz del dispositivo o el respaldo mecánico.
Tipo de voz sin indicar
Restaurar selección automática
Hay una actualización lista. Recargar
`,
fr:`
Réglages de lecture et de voix
Source de la voix
Toutes les sources
Voix de synthèse naturelle (mouvements fixes)
Voix de l’appareil (tout texte)
Secours mécanique
Type de voix
Tous les types de voix
Voix masculine
Voix féminine
Vitesse de lecture
Réécouter la dernière phrase
Tester l’audio de secours
Le mandarin et l’anglais proposent chacun deux voix masculines et deux féminines de synthèse naturelle pour les 37 mouvements et une phrase de test. Les réponses libres du coach utilisent toujours la voix de l’appareil. Le choix de voix et la vitesse sont enregistrés sur cet appareil.
Aucune voix ne correspond. Choisissez toutes les sources et tous les types de voix.
Les fichiers vocaux naturels sont actuellement en mandarin et en anglais ; les autres langues utilisent la voix de l’appareil ou le secours mécanique.
Type de voix non précisé
Rétablir la sélection automatique
Une mise à jour est prête. Recharger
`,
de:`
Sprach- und Stimmeinstellungen
Stimmquelle
Alle Quellen
Natürlich klingende synthetische Stimme (feste Bewegungen)
Gerätestimme (beliebiger Text)
Mechanische Ersatzstimme
Stimmtyp
Alle Stimmtypen
Männliche Stimme
Weibliche Stimme
Sprechgeschwindigkeit
Letzten Satz wiederholen
Ersatz-Audiodatei testen
Mandarin und Englisch enthalten jeweils zwei männliche und zwei weibliche natürlich klingende synthetische Stimmen für die 37 Bewegungen und einen Testsatz. Freie Trainerantworten nutzen weiterhin die Gerätestimme. Stimme und Geschwindigkeit werden auf diesem Gerät gespeichert.
Keine passende Stimme. Wählen Sie alle Quellen und alle Stimmtypen.
Natürlich klingende Audiodateien gibt es derzeit für Mandarin und Englisch; andere Sprachen verwenden Gerätestimmen oder mechanischen Ersatz.
Stimmtyp nicht angegeben
Automatische Auswahl wiederherstellen
Eine Aktualisierung ist bereit. Neu laden
`,
pt:`
Definições de leitura e voz
Origem da voz
Todas as origens
Voz sintética natural (movimentos fixos)
Voz do dispositivo (qualquer texto)
Voz mecânica de reserva
Tipo de voz
Todos os tipos de voz
Voz masculina
Voz feminina
Velocidade de leitura
Repetir a última frase
Testar áudio de reserva
O mandarim e o inglês incluem, cada um, duas vozes masculinas e duas femininas de síntese natural para os 37 movimentos e uma frase de teste. As respostas livres do treinador continuam a usar a voz do dispositivo. A voz e a velocidade ficam guardadas neste dispositivo.
Nenhuma voz corresponde. Selecione todas as origens e todos os tipos de voz.
Os áudios naturais estão disponíveis em mandarim e inglês; os outros idiomas usam a voz do dispositivo ou a reserva mecânica.
Tipo de voz não indicado
Restaurar seleção automática
Há uma atualização pronta. Recarregar
`,
it:`
Impostazioni di lettura e voce
Origine della voce
Tutte le origini
Voce sintetica naturale (movimenti fissi)
Voce del dispositivo (qualsiasi testo)
Riserva meccanica
Tipo di voce
Tutti i tipi di voce
Voce maschile
Voce femminile
Velocità di lettura
Ripeti l’ultima frase
Prova l’audio di riserva
Mandarino e inglese includono ciascuno due voci maschili e due femminili di sintesi naturale per i 37 movimenti e una frase di prova. Le risposte libere dell’allenatore usano ancora la voce del dispositivo. Voce e velocità vengono salvate su questo dispositivo.
Nessuna voce corrispondente. Selezionate tutte le origini e tutti i tipi di voce.
Gli audio naturali sono disponibili in mandarino e inglese; le altre lingue usano la voce del dispositivo o la riserva meccanica.
Tipo di voce non indicato
Ripristina la scelta automatica
Un aggiornamento è pronto. Ricarica
`,
id:`
Pengaturan ucapan dan suara
Sumber suara
Semua sumber
Suara sintetis alami (gerakan tetap)
Suara perangkat (teks apa saja)
Cadangan mekanis
Jenis suara
Semua jenis suara
Suara pria
Suara wanita
Kecepatan bicara
Putar ulang kalimat terakhir
Uji audio cadangan
Mandarin dan Inggris masing-masing menyertakan dua suara pria dan dua wanita sintetis alami untuk 37 gerakan dan satu kalimat uji. Jawaban bebas pelatih tetap memakai suara perangkat. Pilihan suara dan kecepatan disimpan di perangkat ini.
Tidak ada suara yang cocok. Pilih semua sumber dan semua jenis suara.
Audio alami saat ini tersedia dalam Mandarin dan Inggris; bahasa lain memakai suara perangkat atau cadangan mekanis.
Jenis suara tidak disebutkan
Pulihkan pilihan otomatis
Pembaruan siap. Muat ulang
`,
vi:`
Cài đặt đọc và giọng nói
Nguồn giọng nói
Tất cả nguồn
Giọng tổng hợp tự nhiên (động tác cố định)
Giọng thiết bị (văn bản bất kỳ)
Giọng máy dự phòng
Loại giọng
Tất cả loại giọng
Giọng nam
Giọng nữ
Tốc độ đọc
Phát lại câu vừa rồi
Nghe thử tệp âm thanh dự phòng
Tiếng Quan thoại và tiếng Anh mỗi ngôn ngữ có hai giọng nam và hai giọng nữ tổng hợp tự nhiên cho 37 thức và một câu thử. Câu trả lời tự do của huấn luyện viên vẫn dùng giọng thiết bị. Lựa chọn giọng và tốc độ được lưu trên thiết bị này.
Không có giọng phù hợp. Hãy chọn tất cả nguồn và tất cả loại giọng.
Tệp giọng tự nhiên hiện có tiếng Quan thoại và tiếng Anh; các ngôn ngữ khác dùng giọng thiết bị hoặc giọng máy dự phòng.
Chưa ghi loại giọng
Khôi phục chọn tự động
Đã có phiên bản mới. Tải lại
`,
th:`
ตั้งค่าการอ่านและเสียง
แหล่งเสียง
ทุกแหล่ง
เสียงสังเคราะห์ธรรมชาติ (ท่าที่กำหนด)
เสียงอุปกรณ์ (ข้อความทั่วไป)
เสียงกลไกสำรอง
ลักษณะเสียง
ทุกลักษณะเสียง
เสียงชาย
เสียงหญิง
ความเร็วการอ่าน
เล่นประโยคล่าสุดซ้ำ
ทดลองไฟล์เสียงสำรอง
ภาษาจีนกลางและอังกฤษมีเสียงสังเคราะห์ธรรมชาติภาษาละชายสองเสียงและหญิงสองเสียง สำหรับ 37 ท่าและประโยคทดลอง คำตอบทั่วไปของผู้ฝึกสอนยังใช้เสียงอุปกรณ์ การเลือกเสียงและความเร็วจะบันทึกไว้ในอุปกรณ์นี้
ไม่มีเสียงตรงตามตัวเลือก โปรดเลือกทุกแหล่งและทุกลักษณะเสียง
ไฟล์เสียงธรรมชาติมีภาษาจีนกลางและอังกฤษในขณะนี้ ภาษาอื่นใช้เสียงอุปกรณ์หรือเสียงกลไกสำรอง
ไม่ระบุลักษณะเสียง
กลับไปเลือกอัตโนมัติ
เวอร์ชันใหม่พร้อมแล้ว โหลดใหม่
`,
ar:`
إعدادات النطق والصوت
مصدر الصوت
جميع المصادر
صوت اصطناعي طبيعي النبرة (حركات ثابتة)
صوت الجهاز (أي نص)
بديل آلي
نوع الصوت
جميع أنواع الأصوات
صوت رجالي
صوت نسائي
سرعة القراءة
إعادة آخر جملة
تجربة الملف الصوتي البديل
تتضمن الماندرين والإنجليزية لكل منهما صوتين رجاليين وصوتين نسائيين اصطناعيين طبيعيي النبرة للحركات الـ37 وجملة اختبار. تستخدم إجابات المدرب الحرة صوت الجهاز. يُحفظ اختيار الصوت والسرعة على هذا الجهاز.
لا توجد أصوات مطابقة. اختر جميع المصادر وجميع أنواع الأصوات.
الملفات الطبيعية النبرة متاحة حاليًا بالماندرين والإنجليزية؛ تستخدم اللغات الأخرى صوت الجهاز أو البديل الآلي.
نوع الصوت غير محدد
استعادة الاختيار التلقائي
الإصدار الجديد جاهز. أعد التحميل
`,
hi:`
वाचन और आवाज़ सेटिंग
आवाज़ का स्रोत
सभी स्रोत
प्राकृतिक सुनाई देने वाली कृत्रिम आवाज़ (निश्चित गतियाँ)
डिवाइस की आवाज़ (कोई भी पाठ)
यांत्रिक बैकअप
आवाज़ का प्रकार
सभी आवाज़ प्रकार
पुरुष आवाज़
महिला आवाज़
वाचन की गति
पिछला वाक्य फिर सुनें
बैकअप ऑडियो का परीक्षण
मंदारिन और अंग्रेज़ी में 37 गतियों और एक परीक्षण वाक्य के लिए दो पुरुष तथा दो महिला प्राकृतिक सुनाई देने वाली कृत्रिम आवाज़ें हैं। कोच के स्वतंत्र उत्तर डिवाइस की आवाज़ से ही पढ़े जाते हैं। आवाज़ और गति इस डिवाइस पर सहेजी जाएँगी।
कोई मेल खाती आवाज़ नहीं। सभी स्रोत और सभी आवाज़ प्रकार चुनें।
प्राकृतिक सुनाई देने वाली ऑडियो फ़ाइलें अभी मंदारिन और अंग्रेज़ी में हैं; अन्य भाषाएँ डिवाइस की आवाज़ या यांत्रिक बैकअप इस्तेमाल करती हैं।
आवाज़ का प्रकार नहीं बताया गया
स्वचालित चयन वापस लाएँ
नया संस्करण तैयार है। फिर लोड करें
`,
ru:`
Настройки речи и голоса
Источник голоса
Все источники
Естественно звучащий синтезированный голос (фиксированные движения)
Голос устройства (любой текст)
Механический резерв
Тип голоса
Все типы голоса
Мужской голос
Женский голос
Скорость чтения
Повторить последнюю фразу
Проверить резервную аудиозапись
Для китайского путунхуа и английского предусмотрены по два мужских и два женских естественно звучащих синтезированных голоса для 37 движений и пробной фразы. Произвольные ответы наставника по-прежнему озвучиваются голосом устройства. Выбор голоса и скорость сохраняются на этом устройстве.
Подходящих голосов нет. Выберите все источники и все типы голоса.
Естественно звучащие аудиофайлы пока доступны на путунхуа и английском; другие языки используют голос устройства или механический резерв.
Тип голоса не указан
Восстановить автоматический выбор
Новая версия готова. Перезагрузить
`,
tr:`
Konuşma ve ses ayarları
Ses kaynağı
Tüm kaynaklar
Doğal sentetik ses (sabit hareketler)
Cihaz sesi (herhangi bir metin)
Mekanik yedek
Ses türü
Tüm ses türleri
Erkek sesi
Kadın sesi
Okuma hızı
Son cümleyi tekrar çal
Yedek ses dosyasını dene
Mandarin ve İngilizce için 37 hareket ve deneme cümlesini kapsayan ikişer erkek ve ikişer kadın doğal sentetik ses bulunur. Koçun serbest yanıtları yine cihaz sesiyle okunur. Ses seçimi ve hız bu cihaza kaydedilir.
Eşleşen ses yok. Tüm kaynakları ve tüm ses türlerini seçin.
Doğal ses dosyaları şu an Mandarin ve İngilizcedir; diğer diller cihaz sesi veya mekanik yedek kullanır.
Ses türü belirtilmemiş
Otomatik seçime dön
Yeni sürüm hazır. Yeniden yükle
`,
nl:`
Spraak- en steminstellingen
Stembron
Alle bronnen
Natuurlijk klinkende synthetische stem (vaste bewegingen)
Apparaatstem (willekeurige tekst)
Mechanische reserve
Stemtype
Alle stemtypen
Mannelijke stem
Vrouwelijke stem
Voorleessnelheid
Laatste zin herhalen
Reserve-audio testen
Mandarijn en Engels hebben elk twee mannelijke en twee vrouwelijke natuurlijk klinkende synthetische stemmen voor de 37 bewegingen en een testzin. Vrije coachantwoorden gebruiken nog steeds de apparaatstem. Stemkeuze en snelheid worden op dit apparaat opgeslagen.
Geen passende stemmen. Kies alle bronnen en alle stemtypen.
Natuurlijk klinkende audiobestanden zijn er momenteel in Mandarijn en Engels; andere talen gebruiken apparaatstemmen of mechanische reserve.
Stemtype niet vermeld
Automatische keuze herstellen
Een nieuwe versie is klaar. Herladen
`
};
export const featureMessagesV4=Object.fromEntries(Object.entries(rows).map(([lang,text])=>{const values=text.trim().split('\n');if(values.length!==keys.length)throw new Error(`Feature message count ${lang}: ${values.length}`);return [lang,Object.fromEntries(keys.map((k,i)=>[k,values[i]]))];}));
