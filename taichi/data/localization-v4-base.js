/** Russian, Turkish and Dutch dictionaries. Written locally; no translation API. */
const langs=['ru','tr','nl'];
function table(text){const out=Object.fromEntries(langs.map(l=>[l,{}]));for(const row of text.trim().split('\n')){const [key,...values]=row.split('|');if(values.length!==3)throw new Error(`Invalid v4 locale row: ${key}`);langs.forEach((l,i)=>out[l][key]=values[i].replace(/\\n/g,'\n'));}return out;}
export const extraUIV4=table(`
brand|SmartAction · Тайцзи|SmartAction · Tai Chi|SmartAction · Tai Chi
localFirst|Локальные вычисления · осознанная практика|Yerel hesaplama · bilinçli çalışma|Lokale verwerking · aandachtig oefenen
language|Язык|Dil|Taal
help|Как играть|Nasıl oynanır|Hoe speel je
studioEyebrow|Дышите. Прислушайтесь к телу.|Nefes alın. Bedeninizi dinleyin.|Adem. Luister naar je lichaam.
studioTitle|Сделайте практику\\nежедневным ритуалом.|Çalışmayı günlük\\nbir alışkanlığa dönüştürün.|Maak oefenen\\neen dagelijks ritueel.
studioDescription|Следуйте за учителем и найдите свой ритм.|Öğretmeni takip edin ve kendi ritminizi bulun.|Volg de leraar en vind je eigen ritme.
course|Стиль практики|Çalışma türü|Oefenstijl
defaultCourse|Чжэн Маньцин · 37 форм|Cheng Man-ch’ing · 37 form|Cheng Man-ch’ing · 37 vormen
courseNote|Названия движений соответствуют 37 формам из источника мемориала Чжэн Маньцина. Анимации схематичны и не проверены преподавателем.|Hareket adları Cheng Man-ch’ing anıtının 37 formluk kaynağını izler. Animasyonlar eğitmen tarafından doğrulanmamış gösterimlerdir.|De bewegingsnamen volgen de 37 vormen van het Cheng Man-ch’ing-monument. De animaties zijn illustraties die niet door een leraar zijn getoetst.
difficulty|Уровень|Seviye|Niveau
basic|Базовый|Temel|Basis
pro|Профессиональный|Profesyonel|Professioneel
master|Мастерский|Usta|Meester
mode|Режим практики|Çalışma modu|Oefenmodus
follow|Следовать за учителем|Öğretmeni takip et|Leraar volgen
partner|Практика с партнёром|Eşli çalışma|Samen oefenen
spar|Ритмичный поединок|Ritimli karşılaşma|Ritmesparren
environment|Места и окружение|Mekân ve ortam|Plekken en omgeving
nearby|Найти поблизости|Yakında ara|Zoek in de buurt
openMap|Карты Google|Google Haritalar|Google Maps
time|Освещение|Gün ışığı|Daglicht
morning|Утро|Sabah|Ochtend
noon|Полдень|Öğle|Middag
sunset|Закат|Gün batımı|Zonsondergang
night|Ночь|Gece|Nacht
weather|Погода|Hava durumu|Weer
clear|Ясно|Açık|Helder
cloudy|Облачно|Bulutlu|Bewolkt
rain|Небольшой дождь|Hafif yağmur|Lichte regen
snow|Снег|Kar|Sneeuw
season|Время года|Mevsim|Seizoen
spring|Весна|İlkbahar|Lente
summer|Лето|Yaz|Zomer
autumn|Осень|Sonbahar|Herfst
winter|Зима|Kış|Winter
climate|Климат|İklim|Klimaat
temperate|Умеренный|Ilıman|Gematigd
tropical|Тропический|Tropikal|Tropisch
dry|Сухой|Kurak|Droog
cold|Холодный|Soğuk|Koud
moveLibrary|Каталог движений|Hareket kitaplığı|Bewegingsbibliotheek
coachTitle|Спросить у наставника|Çalışma koçuna sorun|Vraag het aan de oefencoach
coachReady|Руководство к практике|Çalışma rehberi|Oefengids
coachIntro|Спросите о движении, темпе или своём сегодняшнем самочувствии.|Hareket ipuçlarını, çalışma temposunu veya bugün nasıl hissettiğinizi sorun.|Stel vragen over bewegingen, tempo of hoe je je vandaag voelt.
askCoach|Спросить наставника|Koça sor|Vraag de coach
coachPlaceholder|Как расслабить плечи в этом движении?|Bu harekette omuzlarımı nasıl gevşetebilirim?|Hoe ontspan ik mijn schouders bij deze beweging?
send|Спросить наставника|Koça sor|Vraag de coach
coachWelcome|Начните с расслабленных плеч и естественного дыхания. Загрузите локальную модель для генеративного диалога без интернета.|Önce omuzlarınızı gevşetin ve doğal nefes alın. Çevrimdışı üretken sohbet için yerel modeli yükleyin.|Begin met ontspannen schouders en natuurlijk ademen. Laad een lokaal model voor een offline generatief gesprek.
offlineModel|Генеративная модель без интернета|Çevrimdışı üretken model|Offline generatief model
loadModel|Загрузить скачанную модель|İndirilen modeli yükle|Gedownload model laden
downloadModel|Скачать и включить|İndir ve etkinleştir|Downloaden en inschakelen
modelIdle|Локальный вывод на CPU. Для первой загрузки нужны интернет и свободное место.|Yerel CPU çıkarımı. İlk indirme internet ve depolama alanı gerektirir.|Lokale CPU-inferentie. De eerste download vereist internet en opslagruimte.
simulationNotice|Персонажи показывают позы. Игровые оценки относятся к персонажу; камера при желании даёт отдельную оценку позы человека.|Karakterler duruşları gösterir. Oyun puanı karakteri değerlendirir; isteğe bağlı kamera takibi gerçek kişinin duruşunu ayrı tahmin eder.|Personages illustreren houdingen. Spelscores beoordelen het personage; optionele cameratracking geeft een afzonderlijke schatting van de echte houding.
practicePlace|Ваше место практики|Çalışma alanınız|Jouw oefenplek
breathe|Расслабьте плечи и локти · дышите естественно|Gevşek omuzlar · rahat dirsekler · doğal nefes|Ontspannen schouders · soepele ellebogen · natuurlijke adem
camera|Ракурс|Görünüm|Weergave
cameraThird|Третий план · всё тело|Üçüncü kişi · tüm beden|Derde persoon · heel lichaam
cameraSecond|Второй ракурс · вблизи|İkinci görünüm · yakın|Tweede weergave · dichtbij
cameraFirst|От первого лица|Birinci kişi|Eerste persoon
teacher|Учитель|Öğretmen|Leraar
you|Вы|Siz|Jij
ready|Готовы к практике|Çalışmaya hazır|Klaar om te oefenen
start|Начать практику|Çalışmaya başla|Begin met oefenen
pause|Пауза|Duraklat|Pauzeren
resume|Продолжить|Sürdür|Hervatten
replay|Показать ещё раз|Tekrar göster|Opnieuw tonen
assist|Помощь с позой|Duruş yardımı|Houdingshulp
voice|Озвучивание движений|Hareketleri seslendir|Bewegingen voorlezen
reset|Начать заново|Yeniden başlat|Opnieuw beginnen
currentMove|Текущее движение|Şimdiki hareket|Huidige beweging
movementCues|Указания к движению|Hareket ipuçları|Bewegingsaanwijzingen
benefits|Цели практики|Çalışmanın yararları|Voordelen van oefenen
initialStatus|Нажмите «Начать», посмотрите на учителя и повторяйте с помощью двух панелей.|Başlat'a basın, öğretmeni izleyin ve iki kontrol paneliyle takip edin.|Druk op Start, kijk naar de leraar en volg met de twee bedieningspanelen.
legs|Работа ног|Ayak hareketleri|Voetenwerk
switchLeg|Сменить ногу|Bacak değiştir|Wissel been
legUp|Переместить ногу вперёд|Bacağı öne götür|Been naar voren
legDown|Переместить ногу назад|Bacağı geriye götür|Been naar achteren
legLeft|Переместить ногу влево|Bacağı sola götür|Been naar links
legRight|Переместить ногу вправо|Bacağı sağa götür|Been naar rechts
legsHint|Левая панель · выбранная нога|Sol panel · seçili bacağı hareket ettir|Linkerpaneel · beweeg het gekozen been
alignment|Совпадение позы персонажа|Karakter duruş uyumu|Houdingsmatch van personage
hands|Руки|Kollar|Armen
feet|Ноги|Bacaklar|Benen
body|Тело|Gövde|Lichaam
waist|Талия|Bel|Taille
waistLeft|Повернуть талию влево|Beli sola çevir|Taille naar links draaien
waistRight|Повернуть талию вправо|Beli sağa çevir|Taille naar rechts draaien
crouch|Опуститься|Alçal|Zakken
stretch|Вытянуться|Uzan|Strekken
handTechnique|Работа рук|El hareketleri|Handwerk
switchHand|Сменить руку|El değiştir|Wissel hand
handUp|Поднять руку|Eli yukarı götür|Hand omhoog
handDown|Опустить руку|Eli aşağı götür|Hand omlaag
handLeft|Переместить руку влево|Eli sola götür|Hand naar links
handRight|Переместить руку вправо|Eli sağa götür|Hand naar rechts
forward|Вытянуть вперёд|İleri uzat|Reiken
back|Вернуть к себе|Geri çek|Terugtrekken
controlsHint|Удерживайте обе панели одновременно. Ненадолго сохраните совпадение позы, чтобы продолжить.|İki kontrol panelini aynı anda basılı tutun. İlerlemek için uyumlu duruşu kısa süre koruyun.|Houd beide bedieningspanelen tegelijk ingedrukt. Houd de passende houding even vast om verder te gaan.
poseDetails|Параметры позы|Duruş değerleri|Houdingswaarden
advancedControls|Поднять ноги, встать и расслабиться|Ayak kaldır, doğrul ve gevşe|Voeten heffen, opstaan en ontspannen
legLift|Поднять стопу|Ayağı kaldır|Voet heffen
legLower|Опустить стопу|Ayağı indir|Voet laten zakken
rise|Выпрямиться|Doğrul|Rechtop staan
relax|Расслабиться|Gevşe|Ontspannen
footerNotice|Игра иллюстрирует практику, но не даёт медицинских советов или квалификации в боевых искусствах. Двигайтесь в комфортных пределах.|Bu oyun çalışmayı örnekler; tıbbi tavsiye veya dövüş sanatı sertifikası değildir. Hareketleri rahat sınırlar içinde tutun.|Dit spel illustreert oefeningen; het is geen medisch advies of krijgskunstcertificering. Beweeg binnen een comfortabele grens.
technologyDemo|Демонстрация Holo-Artisan ↗|Holo-Artisan teknoloji gösterimi ↗|Holo-Artisan-technologiedemo ↗
documentation|Документация ↗|Belgeler ↗|Documentatie ↗
practiceMap|Карта места практики|Çalışma alanı haritası|Kaart van de oefenplek
mapPrivacy|При открытии Карт Google устанавливается соединение с Google. Местоположение запрашивается только после выбора «Найти поблизости».|Google Haritalar'ı açmak Google'a bağlanır. Konum yalnızca Yakında ara seçildikten sonra istenir.|Google Maps openen maakt verbinding met Google. Je locatie wordt pas gevraagd nadat je Zoeken in de buurt kiest.
helpIntro|Учитель показывает движение и ждёт. Совместите руки, ноги и корпус персонажа, затем удержите позу для перехода дальше.|Öğretmen bir hareket gösterir ve bekler. Karakterin kollarını, bacaklarını ve gövdesini eşleştirin; ilerlemek için kısa süre koruyun.|De leraar toont één beweging en wacht. Pas armen, benen en romp van het personage aan en houd de houding even vast om door te gaan.
keyboard|Клавиатура|Klavye|Toetsenbord
handsHint|Перемещать выбранную руку|Seçili eli hareket ettir|Beweeg de gekozen hand
switchHelp|Сменить ногу / руку|Bacak / el değiştir|Been / hand wisselen
bodyHelp|Поворот талии · опускание / вытяжение|Beli çevir · alçal / uzan|Taille draaien · zakken / strekken
depthHelp|Вытянуть руку / вернуть к себе|Eli öne uzat / geri çek|Hand naar voren / terugtrekken
practiceKeys|Пауза · повтор · помощь|Duraklat · tekrarla · yardım|Pauzeren · herhalen · hulp
cameraKeys|Первый / ближний / третий ракурс|Birinci / yakın / üçüncü kişi görünümü|Eerste persoon / dichtbij / derde persoon
touch|Сенсорное управление|Dokunmatik kontroller|Aanraakbediening
touchHelp|Удерживайте левую и правую панели одновременно. Средние кнопки управляют талией, приседанием и вытяжением. В альбомной ориентации больше места.|Sol ve sağ panelleri aynı anda basılı tutun. Ortadaki düğmelerle beli, alçalmayı ve uzanmayı kontrol edin. Yatay ekran daha fazla alan sunar.|Houd het linker- en rechterpaneel tegelijk ingedrukt. Gebruik de middelste knoppen voor taille, zakken en strekken. Liggende weergave biedt meer ruimte.
levelsHelpTitle|Уровни и помощь|Seviyeler ve yardım|Niveaus en hulp
levelsHelp|Базовый уровень допускает больше отклонений позы. Профессиональный и мастерский требуют точности. Помощь приближает позу персонажа к цели.|Temel seviye daha fazla duruş farkına izin verir. Profesyonel ve Usta daha yakın uyum ister. Duruş yardımı karakteri hedefe yönlendirir.|Basis laat meer houdingsverschil toe. Professioneel en Meester vragen nauwkeuriger overeenstemming. Houdingshulp brengt het personage naar het doel.
learningNoteTitle|О последовательности|Dizi hakkında|Over de reeks
learningNote|Нумерация 37 форм следует источнику мемориала. Анимация схематична; уточняйте технику у преподавателя.|37 formun sırası anıt kaynağını izler. Animasyon yolları şematiktir; tekniği öğretmeninizle doğrulayın.|De nummering van de 37 vormen volgt de bron van het monument. Animaties blijven schematisch; bespreek de techniek met je leraar.
attack|Ударить|Vur|Slaan
block|Блок|Blok|Blokkeren
playerHealth|Выносливость игрока|Oyuncu dayanıklılığı|Conditie van speler
opponentHealth|Выносливость партнёра|Eşin dayanıklılığı|Conditie van partner
sparNote|Ритмичная игра с персонажами; результат не отражает реальные навыки боевых искусств.|Ritim temelli bir karakter oyunu; puan gerçek dövüş sanatı becerisini göstermez.|Een ritmespel met personages; de score zegt niets over echte krijgskunstvaardigheid.
leftLeg|Левая нога|Sol bacak|Linkerbeen
rightLeg|Правая нога|Sağ bacak|Rechterbeen
leftHand|Левая рука|Sol el|Linkerhand
rightHand|Правая рука|Sağ el|Rechterhand
loading|Загрузка…|Yükleniyor…|Laden…
close|Закрыть|Kapat|Sluiten
modelReady|Локальный ИИ готов|Çevrimdışı yapay zekâ hazır|Offline AI gereed
noWebGL|Браузер не поддерживает WebGL. Используйте современный браузер.|Bu tarayıcı WebGL desteklemiyor. Güncel bir tarayıcı kullanın.|Deze browser ondersteunt WebGL niet. Gebruik een actuele browser.
liftHelp|Поднять / опустить стопу|Ayağı kaldır / indir|Voet heffen / laten zakken
relaxHelp|Выпрямиться / расслабиться|Doğrul / gevşe|Opstaan / ontspannen
importModel|Выбрать локальный .gguf|Yerel .gguf seç|Lokaal .gguf-bestand kiezen
bodyTracking|Отслеживание тела|Beden takibi|Lichaamstracking
enableCamera|Включить отслеживание камерой|Kamera takibini etkinleştir|Cameratracking inschakelen
stopCamera|Остановить камеру|Kamerayı durdur|Camera stoppen
calibrateCamera|Откалибровать стойку|Duruşu kalibre et|Stand kalibreren
cameraPrivacy|Видео анализируется в вашем браузере и никуда не отправляется.|Video tarayıcınızda analiz edilir ve yüklenmez.|Video wordt in je browser geanalyseerd en niet geüpload.
cameraNeedsServer|Для камеры откройте игру через localhost или HTTPS с помощью прилагаемого запуска.|Kamera takibi için birlikte verilen başlatıcıyla localhost veya HTTPS üzerinden açın.|Open voor cameratracking via localhost of HTTPS met de meegeleverde starter.
cameraLoading|Загрузка модели позы…|Duruş modeli yükleniyor…|Houdingsmodel laden…
cameraReady|Отслеживание камерой готово|Kamera takibi hazır|Cameratracking gereed
cameraError|Камера недоступна: {error}|Kamera kullanılamıyor: {error}|Camera niet beschikbaar: {error}
poseMissing|Держите всё тело в кадре при хорошем освещении|İyi aydınlatmada tüm bedeninizi kadrajda tutun|Houd je hele lichaam in beeld met voldoende licht
poseScore|Оценка позы по камере|Kamera duruş tahmini|Houdingsschatting via camera
poseAdvice|Наблюдения за движением|Hareket gözlemleri|Bewegingsobservaties
poseLimit|Одна камера даёт приблизительную оценку видимой позы; она не проверяет внутреннее усилие, нагрузку или боевую технику.|Tek kamera görünür duruşu kabaca tahmin eder; iç kuvveti, yüklenmeyi veya dövüş tekniğini doğrulayamaz.|Eén camera geeft een ruwe schatting van de zichtbare houding; zij kan interne kracht, belasting of krijgstechniek niet beoordelen.
coachSpeech|Озвучивать ответы наставника|Koç yanıtlarını seslendir|Antwoorden van coach voorlezen
readAnswer|Прочитать этот ответ|Bu yanıtı oku|Dit antwoord voorlezen
stopSpeech|Остановить озвучивание|Seslendirmeyi durdur|Voorlezen stoppen
voiceInput|Голосовой ввод|Sesli giriş|Spraakinvoer
voiceInputStop|Остановить прослушивание|Dinlemeyi durdur|Luisteren stoppen
voiceInputUnavailable|Голосовой ввод недоступен в этом браузере. Введите текст.|Bu tarayıcıda sesli giriş yok. Lütfen yazın.|Spraakinvoer is in deze browser niet beschikbaar. Typ je tekst.
localMode|Режим локального файла|Yerel dosya modu|Lokale bestandsmodus
localModeNote|Базовая игра работает напрямую. Для ИИ, камеры и геолокации используйте localhost или HTTPS.|Temel oyun doğrudan çalışır. Yapay zekâ, kamera ve konum için localhost başlatıcısını kullanın veya HTTPS'ye dağıtın.|Het basisspel werkt rechtstreeks. Gebruik voor AI, camera en locatie de localhost-starter of publiceer via HTTPS.
bootFailure|Не удалось запустить приложение. Полностью распакуйте архив и перезагрузите страницу.|Uygulama başlatılamadı. Paketi tamamen çıkarıp sayfayı yeniden yükleyin.|De app kon niet starten. Pak het hele pakket uit en laad de pagina opnieuw.
retry|Повторить|Yeniden dene|Opnieuw proberen
openGuide|Открыть руководство|Rehberi aç|Gids openen
cameraPaused|Отслеживание камерой приостановлено|Kamera takibi duraklatıldı|Cameratracking gepauzeerd
cameraPending|Ожидание доступа к камере или видео|Kamera izni veya video bekleniyor|Wachten op cameratoestemming of video
cameraTarget|Сравнить с целевой позой учителя|Öğretmenin hedef duruşuyla karşılaştır|Vergelijk met de doelhouding van de leraar
cameraInvalid|Недостаточная уверенность распознавания; кадр не оценивается|Algılama güveni çok düşük; bu kare puanlanmaz|Detectie is te onzeker; geen score voor dit beeld
cameraToggleView|Показать / скрыть изображение камеры|Kamera önizlemesini göster/gizle|Cameravoorbeeld tonen/verbergen
inputPrivacy|Голосовой ввод обеспечивает браузер. Некоторые браузеры отправляют звук в свой речевой сервис; можно ввести текст. Озвучивание без интернета зависит от установленного голоса устройства.|Sesli giriş tarayıcı tarafından sağlanır. Bazı tarayıcılar sesi konuşma hizmetlerine gönderir; bunun yerine yazabilirsiniz. Çevrimdışı seslendirme, cihazda yüklü sese bağlıdır.|Spraakinvoer komt van de browser. Sommige browsers sturen audio naar hun spraakdienst; je kunt ook typen. Offline voorlezen vereist een geïnstalleerde apparaatstem.
voiceInputError|Ошибка голосового ввода: {error}|Sesli giriş başarısız: {error}|Spraakinvoer mislukt: {error}
cameraGuide|Встаньте лицом к камере примерно в 2–3 метрах. Голова и стопы должны быть видны; оставьте место для движений.|Kameraya yaklaşık 2–3 metre uzaktan dönük durun; başınız ve ayaklarınız görünsün, hareket için yeterli alan bırakın.|Ga op ongeveer 2–3 meter recht voor de camera staan, met hoofd en voeten in beeld en genoeg bewegingsruimte.
poseExperimental|Экспериментальное наблюдение позы, не аттестация боевого искусства|Deneysel duruş gözlemi; dövüş sanatı sertifikası değildir|Experimentele houdingsobservatie, geen krijgskunstcertificering
localPhotoHint|Если фотофон недоступен в режиме файла, практика продолжает работать. Для полной сцены используйте запуск локального сервера.|Fotoğraf arka planı yerel dosya modunda açılamazsa çalışma devam eder. Tam sahne için başlatıcıyı kullanın.|Als de fotoachtergrond in bestandsmodus ontbreekt, blijft oefenen werken. Gebruik de starter voor de volledige scène.
bootLoading|Запуск площадки для практики…|Çalışma alanı başlatılıyor…|Oefenruimte starten…
cameraStopped|Камера остановлена|Kamera durduruldu|Camera gestopt
cameraUnsupported|Отслеживание камерой здесь недоступно; можно практиковаться с кнопками.|Kamera takibi burada kullanılamıyor; kontrollerle çalışmaya devam edebilirsiniz.|Cameratracking is hier niet beschikbaar; je kunt met de knoppen blijven oefenen.
listening|Слушаю…|Dinleniyor…|Luisteren…
voiceUnavailable|Для этого языка голос не найден. Установите голос в настройках устройства или читайте текст.|Bu dil için ses bulunamadı. Cihaz ayarlarından ses yükleyin veya metni okuyun.|Geen stem gevonden voor deze taal. Installeer een stem in de apparaatinstellingen of lees de tekst.
coachAccuracy|Ответы небольшой модели могут быть неверны. Сверяйтесь с руководством и своим учителем.|Küçük modelin yanıtları yanlış olabilir. Ders rehberini ve öğretmeninizi esas alın.|Het kleine model kan onjuiste antwoorden geven. Raadpleeg de oefengids en je leraar.
`);

export const extraRuntimeV4 = {
  "ru": {
    "welcome": "Нажмите «Начать», чтобы посмотреть показ. Левая панель управляет стопой, правая — кистью.",
    "idle": "Готово",
    "demo": "Учитель показывает движение",
    "wait": "Учитель ждёт, пока вы примете позу",
    "success": "Выполнено! Следующее движение",
    "complete": "Занятие завершено",
    "paused": "Пауза",
    "start": "Начать",
    "pause": "Пауза",
    "resume": "Продолжить",
    "hold": "Удерживайте позу {n} с",
    "leftLeg": "Левая стопа",
    "rightLeg": "Правая стопа",
    "leftHand": "Левая кисть",
    "rightHand": "Правая кисть",
    "switchLeg": "Выбор стопы: {side}",
    "switchHand": "Выбор кисти: {side}",
    "axisUp": "вверх",
    "axisDown": "вниз",
    "axisLeft": "влево относительно персонажа",
    "axisRight": "вправо относительно персонажа",
    "axisForward": "вперёд",
    "axisBack": "назад",
    "correction": "Поправьте положение: {side}; направление: {direction}",
    "waistLeft": "Повернуть поясницу влево",
    "waistRight": "Повернуть поясницу вправо",
    "crouchMore": "Немного опустите персонажа",
    "riseMore": "Немного поднимите персонажа",
    "stretchMore": "Увеличьте вытяжение",
    "relaxMore": "Уменьшите вытяжение",
    "matched": "Поза совпадает. Удерживайте её",
    "assist": "Помощь в выравнивании: это движение будет отмечено как выполненное с помощью",
    "masterAssist": "На уровне мастера доступно только ручное управление; для помощи выберите базовый уровень",
    "locating": "Определяем местоположение; координаты используются только для поиска мест поблизости",
    "nearby": "Список мест поблизости обновлён. Уточняйте сведения о школах боевых искусств в Google Картах",
    "gpsFail": "Не удалось определить местоположение или выполнить поиск: {error}. Выберите сцену из списка.",
    "nearbyDojo": "Найти школы боевых искусств поблизости в Google Картах",
    "noPhoto": "Для этого места нет проверенной фотографии; показана виртуальная площадка для занятий",
    "nearbyFallback": "Поиск поблизости недоступен. Встроенные сцены отсортированы по расстоянию; это не текущие результаты поиска",
    "modelLocal": "Модель для процессора не загружена · доступны подсказки урока",
    "modelLoading": "Загрузка модели для процессора…",
    "modelDownload": "Загрузка модели: {n}% (при первой загрузке около 484 МБ)",
    "modelReady": "Генеративная модель для процессора готова · обработка на устройстве",
    "modelError": "Модель недоступна; подсказки урока по-прежнему работают. {error}",
    "modelGenerating": "Процессор создаёт ответ, подождите…",
    "modelSource": "Ответ создан моделью на процессоре",
    "guideSource": "Подсказка урока (не сгенерирована)",
    "voiceOn": "Озвучивание: вкл.",
    "voiceOff": "Озвучивание: выкл.",
    "voiceMissing": "Озвучивание недоступно; названия движений остаются на экране",
    "sparReady": "Спарринг персонажей: следите за замахом. P — атака, G — блок",
    "attack": "Атака",
    "block": "Блок (удерживать)",
    "hit": "Противник попал: −{n}",
    "strike": "Ваш удар достиг цели: у противника −{n}",
    "blocked": "Удар заблокирован: только −{n}",
    "won": "Вы победили! Нажмите «Начать» для нового раунда",
    "lost": "Раунд завершён. Снова попробуйте принять позу и вовремя поставить блок",
    "progress": "Движений: {n}, средний балл: {score}; с помощью: {a}",
    "fallback": "На этом устройстве недоступно 3D; используется двумерный вид скелета",
    "modelWait": "Модель занята; дождитесь завершения текущей операции",
    "photoFail": "Фотография фона недоступна; трёхмерная тренировка продолжает работать",
    "focus": "Режим сосредоточения",
    "exitFocus": "Вернуться в меню",
    "cancelModel": "Остановить работу модели",
    "readyInput": "Используйте управление позой, чтобы принять стойку; учитель подождёт",
    "autoLanguage": "Автоматически (по браузеру)",
    "levelRule": "Общий балл ≥ {score}; кисти, стопы и корпус — каждое ≥ {minimum}; удержание {hold} с; допустимое отклонение положения {tolerance} м.",
    "masterRule": "На уровне мастера целевая поза скрыта, помощь в её принятии отключена.",
    "voiceEnable": "Включить / проверить голос",
    "voiceTest": "Расслабьте плечи. Приготовьтесь к занятию.",
    "voiceRetry": "На телефоне сначала нажмите «Включить / проверить голос». Проверьте громкость мультимедиа и установите системный голос для этого языка.",
    "walkStart": "Прогуляться поблизости",
    "walkResume": "Продолжить занятие",
    "walkTitle": "Прогулка поблизости · виртуальное исследование",
    "walkHint": "Левая панель — движение, правая — поворот и осмотр. Q — прыжок, E — приветствие, удерживайте X, чтобы присесть.",
    "walkNotice": "Виртуальное перемещение сочетает реальную фотографию с трёхмерным парком; это не отслеживание по GPS в реальном времени и не точная реконструкция улиц.",
    "walkSaved": "Ваше движение, баллы и раунд сохранены. Вернитесь к занятию, чтобы продолжить.",
    "walkPosition": "Виртуальные координаты {lat}, {lng} · пройдено {distance} м",
    "walkMap": "Посмотреть положение персонажа в Google Картах ↗",
    "walkStreetView": "Открыть эти координаты в Просмотре улиц Google ↗",
    "walkJump": "Прыжок · Q",
    "walkGreet": "Поздороваться · E",
    "walkMove": "Движение",
    "walkLook": "Осмотр",
    "walkCrouch": "Присесть",
    "walkRise": "Прыгнуть",
    "walkNoResident": "Поблизости никого нет. Подойдите к кому-нибудь ближе, чтобы поздороваться.",
    "walkGreeting": "Местный житель: Здравствуйте! Прекрасный день для спокойной прогулки. Не забывайте отдыхать после занятий.",
    "walkGreetingSource": "Заданный диалог на устройстве (не сгенерирован)",
    "walkBoundary": "Вы достигли границы этой виртуальной сцены. Выберите другое место, чтобы продолжить прогулку.",
    "walkChangePlace": "Место прогулки изменено. Виртуальные координаты начинают отсчёт от нового места.",
    "placeSearch": "Поиск парков, городов или мест",
    "placeRegion": "Регион",
    "regionAll": "Все регионы",
    "regionNorth": "Северный Тайвань",
    "regionCentral": "Центральный Тайвань",
    "regionSouth": "Южный Тайвань",
    "regionEast": "Восточный Тайвань / острова",
    "regionWorld": "Весь мир",
    "photosOnly": "Только с реальными фотографиями",
    "placeCount": "Показано мест: {shown} / {total}",
    "noPlaceResults": "Подходящих мест нет. Измените запрос или регион.",
    "partnerTitle": "Парная практика · по очереди",
    "partnerIntro": "Наблюдайте за партнёром, затем повторите позу за отведённое время. Выполните 6 обменов, чтобы закончить раунд.",
    "partnerWatch": "Ход партнёра · {seconds} с",
    "partnerRespond": "Ваш ход · осталось {seconds} с · удерживайте совпадение {hold} с",
    "partnerSuccess": "Поза повторена! Готовьтесь к следующему движению.",
    "partnerRetry": "Время вышло. Партнёр покажет движение снова; продолжайте пробовать.",
    "partnerProgress": "Успешных обменов: {done} / {total} · повторных попыток: {retries}",
    "partnerDone": "Парный раунд завершён! Средний балл: {score}.",
    "roundStart": "Начать раунд",
    "roundReplay": "Ещё один раунд",
    "sparCountdown": "Приготовьтесь · противник атакует через {seconds} с",
    "sparAttackNow": "Момент для удара! Нажмите «Атака», чтобы получить бонус за своевременность",
    "sparBlockNow": "Противник атакует! Удерживайте «Блок»",
    "sparClock": "Осталось {seconds} с · ударов: {strikes} · блоков: {blocks}",
    "sparReadyNew": "Начните раунд и следуйте подсказкам «Атака» / «Блок». Корректируйте позу для лучшего результата.",
    "sparCooldown": "До следующего удара: {seconds} с",
    "sparResult": "Раунд завершён · ваша выносливость: {player}, выносливость партнёра: {opponent}.",
    "greetingNearby": "Местный житель · расстояние {distance} м",
    "modeLockedWalk": "Вернитесь к занятию, прежде чем менять курс, режим или уровень.",
    "offlineScenes": "Скачать сцены для работы без сети",
    "offlineProgress": "Скачивание: {n} / {total}",
    "offlineDone": "Сцены для работы без сети скачаны.",
    "offlineFailed": "Не удалось скачать сцены: {n}. Можно повторить попытку.",
    "placesPrev": "Назад",
    "placesNext": "Далее",
    "placesPage": "Страница {page} / {pages}",
    "voiceSelect": "Выберите голос",
    "voiceAutomatic": "Подобрать голос автоматически",
    "voiceLocal": "Голос устройства",
    "voiceNetwork": "Для этого голоса может требоваться сеть",
    "voiceStatus_needsGesture": "Нажмите, чтобы включить голос; проверьте громкость мультимедиа.",
    "voiceStatus_voiceLoading": "Системные голоса пока не появились в списке; вскоре нажмите проверку снова.",
    "voiceStatus_voiceMissing": "Нет голоса для этого языка. Установите системный голос или выберите другой.",
    "voiceStatus_queued": "Озвучивание запрошено; ожидается подтверждение воспроизведения.",
    "voiceStatus_speaking": "Говорит: {name} · {language}",
    "voiceStatus_ready": "Озвучивание завершено: {name} · {language}; громкость регулируется на устройстве.",
    "voiceStatus_off": "Озвучивание выключено.",
    "voiceStatus_unsupported": "Этот браузер не поддерживает синтез речи; читайте текст на экране.",
    "voiceStatus_blocked": "Воспроизведение не началось. Нажмите проверку снова; проверьте громкость мультимедиа и системные голоса.",
    "voiceStatus_error": "Ошибка озвучивания: {error}. Нажмите проверку, чтобы повторить.",
    "voiceAsyncReplay": "Ответ готов. Если звука нет, нажмите «Прочитать этот ответ».",
    "voiceRecorded": "Синтезированная запись (механический голос)",
    "walkNeedsCoordinates": "Для этого места пока нет проверенных координат. Перед прогулкой выберите место с координатами.",
    "photoCredits": "Авторы фотографий и лицензии ↗",
    "associationHome": "Главная SmartAction ↗"
  },
  "tr": {
    "welcome": "Gösterimi izlemek için Başlat'a basın. Sol yön tuşları ayağı, sağ yön tuşları eli kontrol eder.",
    "idle": "Hazır",
    "demo": "Öğretmen gösteriyor",
    "wait": "Öğretmen duruşunuzu bekliyor",
    "success": "Tamamlandı! Sıradaki hareket",
    "complete": "Çalışma tamamlandı",
    "paused": "Duraklatıldı",
    "start": "Başlat",
    "pause": "Duraklat",
    "resume": "Devam et",
    "hold": "{n} saniye sabit kalın",
    "leftLeg": "Sol ayak",
    "rightLeg": "Sağ ayak",
    "leftHand": "Sol el",
    "rightHand": "Sağ el",
    "switchLeg": "Ayak değiştir: {side}",
    "switchHand": "El değiştir: {side}",
    "axisUp": "yukarı",
    "axisDown": "aşağı",
    "axisLeft": "karakterin soluna",
    "axisRight": "karakterin sağına",
    "axisForward": "ileri",
    "axisBack": "geri",
    "correction": "Düzeltin: {side}; yön: {direction}",
    "waistLeft": "Beli sola çevir",
    "waistRight": "Beli sağa çevir",
    "crouchMore": "Karakterinizi biraz alçaltın",
    "riseMore": "Karakterinizi biraz yükseltin",
    "stretchMore": "Uzanmayı artırın",
    "relaxMore": "Uzanmayı azaltın",
    "matched": "Duruş eşleşti. Sabit kalın",
    "assist": "Duruş yardımı: bu hareket yardımlı olarak kaydedilir",
    "masterAssist": "Usta düzeyinde elle kontrol kullanılır; yardım için Temel düzeye geçin",
    "locating": "Konum belirleniyor; koordinatlar yalnızca yakındaki yerleri bulmak için kullanılır",
    "nearby": "Yakındaki yerler güncellendi. Dövüş sanatları salonlarının bilgilerini Google Haritalar'dan doğrulayın",
    "gpsFail": "Konum belirleme veya arama başarısız: {error}. Listeden bir sahne seçin.",
    "nearbyDojo": "Google Haritalar'da yakındaki dövüş sanatları salonlarını bul",
    "noPhoto": "Bu yer için doğrulanmış fotoğraf yok; sanal çalışma alanı gösteriliyor",
    "nearbyFallback": "Yakındaki yerler hizmeti kullanılamıyor. Hazır sahneler mesafeye göre sıralandı; bunlar güncel yakın yer araması sonuçları değildir",
    "modelLocal": "İşlemci modeli yüklenmedi · ders rehberi etkin",
    "modelLoading": "İşlemci modeli yükleniyor…",
    "modelDownload": "Model indiriliyor: %{n} (ilk indirmede yaklaşık 484 MB)",
    "modelReady": "İşlemcide çalışan üretken model hazır · cihazda çıkarım",
    "modelError": "Model kullanılamıyor; ders rehberi çalışmaya devam ediyor. {error}",
    "modelGenerating": "İşlemci yanıt üretiyor, lütfen bekleyin…",
    "modelSource": "İşlemcide üretildi",
    "guideSource": "Ders rehberi (üretilmiş yanıt değil)",
    "voiceOn": "Ses: açık",
    "voiceOff": "Ses: kapalı",
    "voiceMissing": "Seslendirme kullanılamıyor; hareket adları ekranda kalır",
    "sparReady": "Karakter karşılaşması: saldırı hazırlığını izleyin. P saldırı, G blok",
    "attack": "Saldır",
    "block": "Blok (basılı tut)",
    "hit": "Rakip isabet ettirdi: −{n}",
    "strike": "Vuruş isabet etti: rakip −{n}",
    "blocked": "Bloklandı: yalnızca −{n}",
    "won": "Kazandınız! Yeni tur için Başlat'a basın",
    "lost": "Tur bitti. Duruşu ve blok zamanlamasını yeniden deneyin",
    "progress": "{n} hareket, ortalama {score}; {a} yardımlı",
    "fallback": "Bu cihazda 3B kullanılamıyor; 2B iskelet görünümü kullanılıyor",
    "modelWait": "Model meşgul; devam eden işlemin bitmesini bekleyin",
    "photoFail": "Arka plan fotoğrafı kullanılamıyor; 3B çalışma devam ediyor",
    "focus": "Odaklanma görünümü",
    "exitFocus": "Menüye dön",
    "cancelModel": "Model işlemini durdur",
    "readyInput": "Duruşu tamamlamak için duruş kontrollerini kullanın; öğretmen bekler",
    "autoLanguage": "Otomatik (tarayıcı)",
    "levelRule": "Toplam ≥ {score}; eller, ayaklar ve gövdenin her biri ≥ {minimum}; {hold} sn sabit tutma; konum toleransı {tolerance} m.",
    "masterRule": "Usta düzeyi hedef duruş rehberini gizler ve duruş yardımını kapatır.",
    "voiceEnable": "Sesi aç / dene",
    "voiceTest": "Omuzlarınızı gevşetin. Çalışmaya hazırlanın.",
    "voiceRetry": "Telefonda önce Sesi aç / dene düğmesine dokunun. Medya ses düzeyini kontrol edin ve bu dil için bir sistem sesi yükleyin.",
    "walkStart": "Yakınlarda yürü",
    "walkResume": "Çalışmaya devam et",
    "walkTitle": "Yakınlarda yürüyüş · sanal keşif",
    "walkHint": "Sol yön tuşları hareket ettirir, sağ yön tuşları döndürür ve bakışı değiştirir. Q ile zıplayın, E ile selam verin; çömelmek için X'i basılı tutun.",
    "walkNotice": "Sanal hareket gerçek bir fotoğrafı 3B parkla birleştirir; canlı GPS takibi veya sokakların birebir yeniden oluşturulması değildir.",
    "walkSaved": "Hareketiniz, puanınız ve turunuz kaydedildi. Kaldığınız yerden devam etmek için çalışmaya dönün.",
    "walkPosition": "Sanal koordinatlar {lat}, {lng} · yürünen mesafe {distance} m",
    "walkMap": "Karakterin konumunu Google Haritalar'da görüntüle ↗",
    "walkStreetView": "Bu koordinatı Google Sokak Görünümü'nde aç ↗",
    "walkJump": "Zıpla · Q",
    "walkGreet": "Selam ver · E",
    "walkMove": "Hareket et",
    "walkLook": "Bak",
    "walkCrouch": "Çömel",
    "walkRise": "Zıpla",
    "walkNoResident": "Yeterince yakında kimse yok. Selam vermek için birine yaklaşın.",
    "walkGreeting": "Mahalle sakini: Merhaba! Sakin bir yürüyüş için güzel bir gün. Çalışmadan sonra dinlenmeyi unutmayın.",
    "walkGreetingSource": "Cihazdaki hazır diyalog (üretilmiş değil)",
    "walkBoundary": "Bu sanal sahnenin sınırına ulaştınız. Keşfe devam etmek için başka bir yer seçin.",
    "walkChangePlace": "Yürüyüş yeri değişti. Sanal koordinatlar yeni yerden başlar.",
    "placeSearch": "Park, şehir veya yer ara",
    "placeRegion": "Bölge",
    "regionAll": "Tüm bölgeler",
    "regionNorth": "Kuzey Tayvan",
    "regionCentral": "Orta Tayvan",
    "regionSouth": "Güney Tayvan",
    "regionEast": "Doğu Tayvan / adalar",
    "regionWorld": "Dünya geneli",
    "photosOnly": "Yalnızca gerçek fotoğraflı yerler",
    "placeCount": "{shown} / {total} yer gösteriliyor",
    "noPlaceResults": "Eşleşen yer yok. Aramayı veya bölgeyi değiştirin.",
    "partnerTitle": "Eşli çalışma · sırayla",
    "partnerIntro": "Eşinizi izleyin, ardından verilen süre içinde aynı duruşu yapın. Turu bitirmek için 6 karşılıklı hareketi tamamlayın.",
    "partnerWatch": "Eşinizin sırası · {seconds} sn",
    "partnerRespond": "Sizin sıranız · {seconds} sn kaldı · duruşu {hold} sn eşleştirin",
    "partnerSuccess": "Duruş eşleşti! Sonraki harekete hazırlanın.",
    "partnerRetry": "Süre doldu. Eşiniz tekrar gösterecek; denemeye devam edin.",
    "partnerProgress": "Eşleşen hareketler {done} / {total} · {retries} yeniden deneme",
    "partnerDone": "Eşli çalışma turu tamamlandı! Ortalama {score}.",
    "roundStart": "Turu başlat",
    "roundReplay": "Yeni bir tur oyna",
    "sparCountdown": "Hazırlanın · rakip {seconds} sn içinde saldıracak",
    "sparAttackNow": "Vuruş zamanı! Zamanlama bonusu için Saldır'a dokunun",
    "sparBlockNow": "Saldırı geliyor! Blok düğmesini basılı tutun",
    "sparClock": "{seconds} sn kaldı · {strikes} vuruş · {blocks} blok",
    "sparReadyNew": "Bir tur başlatın, ardından Saldır / Blok işaretlerini izleyin. Daha iyi sonuç için duruşunuzu düzeltin.",
    "sparCooldown": "Yeni vuruşa kalan süre {seconds} sn",
    "sparResult": "Tur bitti · sizin dayanıklılığınız {player}, eşinizin dayanıklılığı {opponent}.",
    "greetingNearby": "Yakındaki mahalle sakini · {distance} m uzakta",
    "modeLockedWalk": "Dersi, modu veya düzeyi değiştirmeden önce çalışmaya dönün.",
    "offlineScenes": "Çevrimdışı sahneleri indir",
    "offlineProgress": "İndiriliyor {n} / {total}",
    "offlineDone": "Çevrimdışı sahneler indirildi.",
    "offlineFailed": "Bazı sahneler indirilemedi: {n}. Yeniden deneyebilirsiniz.",
    "placesPrev": "Önceki",
    "placesNext": "Sonraki",
    "placesPage": "Sayfa {page} / {pages}",
    "voiceSelect": "Bir ses seçin",
    "voiceAutomatic": "Sesi otomatik eşleştir",
    "voiceLocal": "Cihaz sesi",
    "voiceNetwork": "Ses için internet bağlantısı gerekebilir",
    "voiceStatus_needsGesture": "Sesi açmak için dokunun; medya ses düzeyini kontrol edin.",
    "voiceStatus_voiceLoading": "Sistem sesleri henüz listelenmedi; kısa bir süre sonra yeniden deneyin.",
    "voiceStatus_voiceMissing": "Bu dil için ses yok. Bir sistem sesi yükleyin veya başka bir ses seçin.",
    "voiceStatus_queued": "Seslendirme istendi; oynatma onayı bekleniyor.",
    "voiceStatus_speaking": "Seslendiriliyor: {name} · {language}",
    "voiceStatus_ready": "Seslendirme bitti: {name} · {language}; ses düzeyi cihazınızdan ayarlanır.",
    "voiceStatus_off": "Seslendirme kapalı.",
    "voiceStatus_unsupported": "Bu tarayıcı ses sentezini desteklemiyor; metni okuyabilirsiniz.",
    "voiceStatus_blocked": "Oynatma başlamadı. Yeniden deneme düğmesine dokunun; medya ses düzeyini ve sistem seslerini kontrol edin.",
    "voiceStatus_error": "Seslendirme başarısız: {error}. Yeniden denemek için deneme düğmesine dokunun.",
    "voiceAsyncReplay": "Yanıt hazır. Ses yoksa Bu yanıtı oku düğmesine dokunun.",
    "voiceRecorded": "Sentezlenmiş kayıt (mekanik ses)",
    "walkNeedsCoordinates": "Bu yerin doğrulanmış koordinatları henüz yok. Yürümeye başlamadan önce konumu belirli bir yer seçin.",
    "photoCredits": "Fotoğraf sahipleri ve lisanslar ↗",
    "associationHome": "SmartAction ana sayfası ↗"
  },
  "nl": {
    "welcome": "Druk op Start om te kijken. De linker richtingsknoppen besturen een voet; de rechter een hand.",
    "idle": "Klaar",
    "demo": "De leraar doet het voor",
    "wait": "De leraar wacht op je houding",
    "success": "Voltooid! Volgende beweging",
    "complete": "Sessie voltooid",
    "paused": "Gepauzeerd",
    "start": "Start",
    "pause": "Pauzeer",
    "resume": "Hervat",
    "hold": "Houd {n} s stabiel vast",
    "leftLeg": "Linkervoet",
    "rightLeg": "Rechtervoet",
    "leftHand": "Linkerhand",
    "rightHand": "Rechterhand",
    "switchLeg": "Wissel van voet: {side}",
    "switchHand": "Wissel van hand: {side}",
    "axisUp": "omhoog",
    "axisDown": "omlaag",
    "axisLeft": "naar links vanuit het personage",
    "axisRight": "naar rechts vanuit het personage",
    "axisForward": "vooruit",
    "axisBack": "achteruit",
    "correction": "Pas {side} aan: {direction}",
    "waistLeft": "Draai de taille naar links",
    "waistRight": "Draai de taille naar rechts",
    "crouchMore": "Laat je personage iets zakken",
    "riseMore": "Laat je personage iets omhoogkomen",
    "stretchMore": "Strek verder uit",
    "relaxMore": "Strek minder ver uit",
    "matched": "De houding klopt. Houd stabiel vast",
    "assist": "Houdingshulp: deze beweging wordt als geholpen geregistreerd",
    "masterAssist": "Op meesterniveau gebruik je handmatige bediening; kies Basis voor hulp",
    "locating": "Locatie bepalen; coördinaten worden alleen gebruikt om plekken in de buurt te vinden",
    "nearby": "Plekken in de buurt bijgewerkt. Controleer de gegevens van vechtsportscholen in Google Maps",
    "gpsFail": "Locatie bepalen of zoeken mislukt: {error}. Kies een scène uit de lijst.",
    "nearbyDojo": "Zoek vechtsportscholen in de buurt in Google Maps",
    "noPhoto": "Geen gecontroleerde foto voor deze plek; er wordt een virtuele oefenplek getoond",
    "nearbyFallback": "De zoekdienst voor de omgeving is niet beschikbaar. Meegeleverde scènes zijn op afstand gesorteerd; dit zijn geen actuele zoekresultaten",
    "modelLocal": "CPU-model niet geladen · lesgids actief",
    "modelLoading": "CPU-model laden…",
    "modelDownload": "Model downloaden: {n}% (de eerste keer ongeveer 484 MB)",
    "modelReady": "Generatief CPU-model klaar · verwerking op je apparaat",
    "modelError": "Model niet beschikbaar; de lesgids blijft werken. {error}",
    "modelGenerating": "De CPU genereert een antwoord, even geduld…",
    "modelSource": "Gegenereerd op de CPU",
    "guideSource": "Lesgids (niet gegenereerd)",
    "voiceOn": "Spraak: aan",
    "voiceOff": "Spraak: uit",
    "voiceMissing": "Spraak niet beschikbaar; bewegingsnamen blijven op het scherm staan",
    "sparReady": "Sparren met personages: let op de aanloop van de aanval. P aanvallen, G blokkeren",
    "attack": "Aanvallen",
    "block": "Blokkeren (vasthouden)",
    "hit": "De tegenstander raakt je: −{n}",
    "strike": "Je aanval raakt: tegenstander −{n}",
    "blocked": "Geblokkeerd: slechts −{n}",
    "won": "Je hebt gewonnen! Druk op Start voor een nieuwe ronde",
    "lost": "Ronde voorbij. Probeer de houding en het juiste blokkeermoment opnieuw",
    "progress": "{n} bewegingen, gemiddeld {score}; {a} met hulp",
    "fallback": "3D is niet beschikbaar op dit apparaat; de 2D-skeletweergave wordt gebruikt",
    "modelWait": "Het model is bezig; wacht tot de huidige bewerking klaar is",
    "photoFail": "Achtergrondfoto niet beschikbaar; oefenen in 3D blijft werken",
    "focus": "Focusweergave",
    "exitFocus": "Terug naar het menu",
    "cancelModel": "Modelbewerking stoppen",
    "readyInput": "Gebruik de houdingsbediening om de stand af te maken; de leraar wacht",
    "autoLanguage": "Automatisch (browser)",
    "levelRule": "Totaal ≥ {score}; handen, voeten en romp elk ≥ {minimum}; {hold} s vasthouden; toegestane positieafwijking {tolerance} m.",
    "masterRule": "Op meesterniveau is de doelhouding verborgen en staat houdingshulp uit.",
    "voiceEnable": "Spraak aanzetten / testen",
    "voiceTest": "Ontspan je schouders. Maak je klaar om te oefenen.",
    "voiceRetry": "Tik op je telefoon eerst op Spraak aanzetten / testen. Controleer het mediavolume en installeer een systeemstem voor deze taal.",
    "walkStart": "Rondwandelen",
    "walkResume": "Oefening hervatten",
    "walkTitle": "Wandeling in de buurt · virtueel verkennen",
    "walkHint": "Links beweeg je, rechts draai je en kijk je rond. Q om te springen, E om te groeten; houd X vast om te hurken.",
    "walkNotice": "Virtuele beweging combineert een echte foto met een 3D-park; dit is geen rechtstreekse GPS-tracking of exacte reconstructie op straatniveau.",
    "walkSaved": "Je beweging, score en ronde zijn bewaard. Hervat de oefening om door te gaan.",
    "walkPosition": "Virtuele coördinaten {lat}, {lng} · {distance} m gelopen",
    "walkMap": "Bekijk de positie van het personage in Google Maps ↗",
    "walkStreetView": "Open deze coördinaten in Google Street View ↗",
    "walkJump": "Springen · Q",
    "walkGreet": "Groeten · E",
    "walkMove": "Bewegen",
    "walkLook": "Kijken",
    "walkCrouch": "Hurken",
    "walkRise": "Springen",
    "walkNoResident": "Er is niemand dichtbij genoeg. Loop dichter naar iemand toe om te groeten.",
    "walkGreeting": "Buurtbewoner: Hallo! Een mooie dag voor een rustige wandeling. Vergeet niet uit te rusten na het oefenen.",
    "walkGreetingSource": "Vooraf geschreven dialoog op het apparaat (niet gegenereerd)",
    "walkBoundary": "Je hebt de grens van deze virtuele scène bereikt. Kies een andere plek om verder te verkennen.",
    "walkChangePlace": "Wandellocatie gewijzigd. De virtuele coördinaten beginnen opnieuw vanaf de nieuwe plek.",
    "placeSearch": "Zoek parken, steden of plekken",
    "placeRegion": "Regio",
    "regionAll": "Alle regio's",
    "regionNorth": "Noord-Taiwan",
    "regionCentral": "Centraal-Taiwan",
    "regionSouth": "Zuid-Taiwan",
    "regionEast": "Oost-Taiwan / eilanden",
    "regionWorld": "Wereldwijd",
    "photosOnly": "Alleen met echte foto's",
    "placeCount": "{shown} / {total} plekken weergegeven",
    "noPlaceResults": "Geen passende plekken. Pas de zoekopdracht of regio aan.",
    "partnerTitle": "Oefenen met een partner · om de beurt",
    "partnerIntro": "Kijk naar je partner en neem daarna binnen de tijd dezelfde houding aan. Voltooi 6 wisselingen om de ronde af te maken.",
    "partnerWatch": "De partner is aan de beurt · {seconds} s",
    "partnerRespond": "Jij bent aan de beurt · nog {seconds} s · houd de juiste houding {hold} s vast",
    "partnerSuccess": "De houding klopt! Bereid je voor op de volgende beweging.",
    "partnerRetry": "De tijd is om. Je partner doet het nogmaals voor; blijf proberen.",
    "partnerProgress": "{done} / {total} wisselingen geslaagd · {retries} herkansingen",
    "partnerDone": "Partnerronde voltooid! Gemiddeld {score}.",
    "roundStart": "Ronde starten",
    "roundReplay": "Nog een ronde spelen",
    "sparCountdown": "Maak je klaar · de tegenstander valt aan over {seconds} s",
    "sparAttackNow": "Tijd om aan te vallen! Tik op Aanvallen voor een bonus voor het juiste moment",
    "sparBlockNow": "Er komt een aanval! Houd Blokkeren vast",
    "sparClock": "Nog {seconds} s · {strikes} aanvallen · {blocks} blokkeringen",
    "sparReadyNew": "Start een ronde en volg de aanwijzingen voor Aanvallen / Blokkeren. Pas je houding aan voor betere resultaten.",
    "sparCooldown": "Volgende aanval mogelijk over {seconds} s",
    "sparResult": "Ronde afgelopen · jouw uithoudingsvermogen {player}, dat van je partner {opponent}.",
    "greetingNearby": "Buurtbewoner · op {distance} m afstand",
    "modeLockedWalk": "Hervat de oefening voordat je de cursus, modus of het niveau wijzigt.",
    "offlineScenes": "Scènes downloaden voor offline gebruik",
    "offlineProgress": "Downloaden: {n} / {total}",
    "offlineDone": "Scènes voor offline gebruik gedownload.",
    "offlineFailed": "Sommige scènes zijn mislukt: {n}. Je kunt het opnieuw proberen.",
    "placesPrev": "Vorige",
    "placesNext": "Volgende",
    "placesPage": "Pagina {page} / {pages}",
    "voiceSelect": "Kies een stem",
    "voiceAutomatic": "Automatisch een passende stem kiezen",
    "voiceLocal": "Stem op het apparaat",
    "voiceNetwork": "Deze stem heeft mogelijk internet nodig",
    "voiceStatus_needsGesture": "Tik om spraak aan te zetten; controleer het mediavolume.",
    "voiceStatus_voiceLoading": "Systeemstemmen staan nog niet in de lijst; tik zo nogmaals op Testen.",
    "voiceStatus_voiceMissing": "Geen stem voor deze taal. Installeer een systeemstem of kies een andere stem.",
    "voiceStatus_queued": "Spraak aangevraagd; wachten op bevestiging van afspelen.",
    "voiceStatus_speaking": "Spreekt: {name} · {language}",
    "voiceStatus_ready": "Uitgesproken: {name} · {language}; je regelt het volume op je apparaat.",
    "voiceStatus_off": "Spraak staat uit.",
    "voiceStatus_unsupported": "Deze browser heeft geen spraaksynthese; lees de tekst op het scherm.",
    "voiceStatus_blocked": "Afspelen is niet begonnen. Tik nogmaals op Testen; controleer het mediavolume en de systeemstemmen.",
    "voiceStatus_error": "Spraak mislukt: {error}. Tik op Testen om het opnieuw te proberen.",
    "voiceAsyncReplay": "Antwoord klaar. Geen geluid? Tik op Lees dit antwoord voor.",
    "voiceRecorded": "Gesynthetiseerde opname (mechanische stem)",
    "walkNeedsCoordinates": "Deze plek heeft nog geen gecontroleerde coördinaten. Kies een plek met bekende coördinaten voordat je gaat wandelen.",
    "photoCredits": "Fotografen en licenties ↗",
    "associationHome": "SmartAction-startpagina ↗"
  }
};
