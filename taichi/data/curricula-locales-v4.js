/** Three further localizations of the existing game-authored curriculum.
 * Pose cues use the same endpoints, with safety qualifications retained.
 * No new lineage sequence or instructor approval is implied.
 */
export const curriculumLocaleCodesV4=['ru','tr','nl'];
const langs=curriculumLocaleCodesV4;
const table=text=>Object.fromEntries(text.trim().split('\n').map(row=>{const [key,...values]=row.split('|');if(values.length!==3)throw new Error(`Invalid v4 curriculum row: ${key}`);return [key,Object.fromEntries(langs.map((l,i)=>[l,values[i]]))];}));
const names=table(`
Preparation and opening|Подготовка и начало|Hazırlık ve açılış|Voorbereiding en opening
Left ward-off|Отражение влево|Sola savuşturma|Links afweren
Right ward-off|Отражение вправо|Sağa savuşturma|Rechts afweren
Roll back|Откатывание назад|Geri yönlendirme|Naar achteren afleiden
Press|Сдавливание|Bastırma|Drukken
Push|Толчок|İtme|Duwen
Single whip|Одиночный кнут|Tek kırbaç|Enkele zweep
Raise hands|Поднять руки|Elleri kaldırma|Handen heffen
Shoulder alignment|Выравнивание плеча|Omuz hizalama|Schouder uitlijnen
White crane spreads wings|Белый журавль расправляет крылья|Beyaz turna kanat açar|Witte kraanvogel spreidt zijn vleugels
Left brush knee and push|Обмахнуть левое колено и толкнуть|Sol dizi sıyırıp itme|Linkerknie strijken en duwen
Play the lute|Игра на лютне|Lavta çalma|De luit bespelen
Step, parry and punch|Шаг, отведение и удар кулаком|Adım, savuşturma ve yumruk|Stappen, afweren en stoten
Apparent close-up|Закрыть и защитить|Kapatma ve koruma|Sluiten en beschermen
Cross hands|Скрещённые руки|Elleri çaprazlama|Handen kruisen
Embrace tiger, return to mountain|Обнять тигра и вернуться в горы|Kaplanı kucaklayıp dağa dönüş|De tijger omarmen en terugkeren naar de berg
Diagonal single whip|Косой одиночный кнут|Çapraz tek kırbaç|Diagonale enkele zweep
Fist under elbow|Кулак под локтем|Dirsek altında yumruk|Vuist onder de elleboog
Right repulse monkey|Отогнать обезьяну справа|Maymunu sağdan uzaklaştırma|Aap rechts verdrijven
Left repulse monkey|Отогнать обезьяну слева|Maymunu soldan uzaklaştırma|Aap links verdrijven
Diagonal flying|Косой полёт|Çapraz uçuş|Diagonaal vliegen
Cloud hands left|Облачные руки влево|Bulut elleri sola|Wolkenhanden links
Cloud hands right|Облачные руки вправо|Bulut elleri sağa|Wolkenhanden rechts
Low single whip, shallow|Низкий одиночный кнут, неглубоко|Alçak tek kırbaç, hafif çömelme|Lage enkele zweep, licht gebogen
Right golden rooster, low knee|Правый золотой петух, низкое колено|Sağ altın horoz, alçak diz|Rechter gouden haan, lage knie
Left golden rooster, low knee|Левый золотой петух, низкое колено|Sol altın horoz, alçak diz|Linker gouden haan, lage knie
Separate right foot, low|Невысоко отвести правую стопу|Sağ ayağı alçaktan açma|Rechtervoet laag openen
Separate left foot, low|Невысоко отвести левую стопу|Sol ayağı alçaktan açma|Linkervoet laag openen
Turn and heel kick, low|Поворот и низкий удар пяткой|Dönüş ve alçak topuk vuruşu|Draaien en lage hieltrap
Right brush knee and push|Обмахнуть правое колено и толкнуть|Sağ dizi sıyırıp itme|Rechterknie strijken en duwen
Step and downward punch|Шаг и удар кулаком вниз|Adım ve aşağı yumruk|Stap en neerwaartse stoot
Fair lady works shuttles 1|Дева ткет челноком 1|Genç kadın mekik dokur 1|De dame weeft 1
Fair lady works shuttles 2|Дева ткет челноком 2|Genç kadın mekik dokur 2|De dame weeft 2
Fair lady works shuttles 3|Дева ткет челноком 3|Genç kadın mekik dokur 3|De dame weeft 3
Fair lady works shuttles 4|Дева ткет челноком 4|Genç kadın mekik dokur 4|De dame weeft 4
Step up to seven stars|Шаг к семи звёздам|Yedi yıldıza adım|Naar de zeven sterren stappen
Step back and ride tiger|Отступить и оседлать тигра|Geri adım ve kaplana binme|Terugstappen en de tijger berijden
Turn and sweep lotus, low|Поворот и низкий взмах лотоса|Dönüş ve alçak lotus süpürüşü|Draaien en lage lotusveeg
Draw bow and shoot tiger|Натянуть лук и прицелиться в тигра|Yayı gerip kaplana nişan alma|Boog spannen en op de tijger richten
Closing|Завершение|Kapanış|Afsluiting
Preparation|Подготовка|Hazırlık|Voorbereiding
Opening|Начало|Açılış|Opening
Part wild horse mane|Разделить гриву дикой лошади|Yabani atın yelesini ayırma|De manen van het wilde paard scheiden
Raise both hands to the sky|Поднять обе руки к небу|İki eli göğe kaldırma|Beide handen naar de hemel heffen
Draw the bow to either side|Натянуть лук в обе стороны|İki yana yay germe|De boog naar beide kanten spannen
Raise one hand|Поднять одну руку|Tek eli kaldırma|Eén hand heffen
Look gently behind|Мягко посмотреть назад|Yavaşça arkaya bakma|Rustig achterom kijken
Gentle side-to-side shift|Мягкий перенос веса из стороны в сторону|Ağırlığı hafifçe iki yana aktarma|Rustig zijwaarts gewicht verplaatsen
Reach down comfortably, adapted|Комфортно потянуться вниз, адаптация|Rahatça aşağı uzanma, uyarlanmış|Comfortabel omlaag reiken, aangepast
Slow controlled fist reach|Медленно вытянуть кулак с контролем|Yavaş ve kontrollü yumruk uzatma|Langzaam en beheerst de vuist uitstrekken
Gentle heel raise|Мягко поднять пятки|Topukları hafifçe kaldırma|Rustig de hielen heffen
Ready stance|Стойка готовности|Hazır duruş|Klaarstand
Low block · Arae-makgi|Нижний блок · арэ-макки|Alt blok · Arae-makgi|Lage blokkering · Arae-makgi
Middle block · Momtong-makgi|Средний блок · момтхон-макки|Orta blok · Momtong-makgi|Middelste blokkering · Momtong-makgi
High block · Eolgul-makgi|Верхний блок · ольгуль-макки|Üst blok · Eolgul-makgi|Hoge blokkering · Eolgul-makgi
Straight punch · Jireugi, slow|Медленный прямой удар · чирыги|Düz yumruk · Jireugi, yavaş|Rechte stoot · Jireugi, langzaam
Front-kick preparation, low knee|Подготовка к удару вперёд, низкое колено|Ön tekme hazırlığı, alçak diz|Voorwaartse trap voorbereiden, lage knie
Low front kick · Ap-chagi|Низкий передний удар · ап-чаги|Alçak ön tekme · Ap-chagi|Lage voorwaartse trap · Ap-chagi
Return to guard|Вернуться к защите|Savunma duruşuna dönüş|Terug naar de dekking
Standing bow|Поклон стоя|Ayakta selamlama|Staande buiging
Natural stance|Естественная стойка|Doğal duruş|Natuurlijke stand
Defensive stance, shallow|Защитная стойка, неглубоко|Savunma duruşu, hafif çömelme|Verdedigende stand, licht gebogen
Advance step|Шаг вперёд|İleri adım|Stap vooruit
Retreat step|Шаг назад|Geri adım|Stap achteruit
Body turning footwork|Шаги с поворотом тела|Gövde döndürme adımları|Voetenwerk met lichaamsdraai
Sumo base stance|Основная стойка сумо|Temel sumo duruşu|Basisstand van sumo
Left shiko, low lift|Левый сико, низкий подъём|Sol shiko, alçak kaldırış|Linker shiko, laag geheven
Right shiko, low lift|Правый сико, низкий подъём|Sağ shiko, alçak kaldırış|Rechter shiko, laag geheven
Sliding step · Suriashi|Скользящий шаг · суриаси|Kayma adımı · Suriashi|Glijdende stap · Suriashi
Teppo, air-palm practice|Тэппо, ладонь в воздухе|Teppo, havada avuç çalışması|Teppo, handpalm oefenen in de lucht
Return and breathe|Вернуться и дышать|Dönüş ve nefes|Terugkeren en ademen
Fist-and-palm salute|Приветствие кулаком и ладонью|Yumruk ve avuç selamı|Vuist-en-palmgroet
Horse stance, shallow|Стойка всадника, неглубоко|At duruşu, hafif çömelme|Paardenstand, licht gebogen
Bow stance punch, slow|Медленный удар в стойке лука|Yay duruşunda yavaş yumruk|Langzame stoot in boogstand
Empty stance and lifting palm|Пустая стойка и подъём ладони|Boş duruş ve avuç kaldırma|Lege stand en handpalm heffen
Forward palm reach|Вытянуть ладонь вперёд|Avucu öne uzatma|Handpalm naar voren reiken
Low knee lift and palm|Низкий подъём колена и ладонь|Alçak diz kaldırış ve avuç|Lage knieheffing en handpalm
Side step and open palms|Шаг в сторону и раскрытые ладони|Yana adım ve avuçları açma|Zijstap en handpalmen openen
Sword preparation, virtual prop|Подготовка с виртуальным мечом|Sanal kılıç hazırlığı|Voorbereiding met virtueel zwaard
Opening sword lift|Начальный подъём меча|Açılışta kılıcı kaldırma|Zwaard heffen bij de opening
Bow stance sword point|Направить меч в стойке лука|Yay duruşunda kılıç ucu|Zwaard richten in boogstand
Draw sword to left|Отвести меч влево|Kılıcı sola çekme|Zwaard naar links trekken
Open sword to side|Раскрыть меч в сторону|Kılıcı yana açma|Zwaard zijwaarts openen
Low knee, level sword|Низкое колено, горизонтальный меч|Alçak diz, yatay kılıç|Lage knie, horizontaal zwaard
Step back and lower sword|Шаг назад и опустить меч|Geri adım ve kılıcı indirme|Terugstappen en zwaard laten zakken
Sword closing|Завершение с мечом|Kılıç kapanışı|Zwaardafsluiting
Comfortable standing|Комфортное стояние|Rahat duruş|Comfortabel staan
Round holding posture|Округлая обнимающая поза|Yuvarlak tutuş duruşu|Ronde omarmende houding
Open and close, natural breath|Раскрытие и закрытие, естественное дыхание|Açma ve kapama, doğal nefes|Openen en sluiten, natuurlijk ademen
Lift palms gently|Мягко поднять ладони|Avuçları yumuşakça kaldırma|Handpalmen rustig heffen
Relax and lower|Расслабиться и опустить|Gevşeme ve indirme|Ontspannen en laten zakken
Closing, natural breath|Завершение, естественное дыхание|Kapanış, doğal nefes|Afsluiting, natuurlijke adem
Lazy tying coat, slow|Медленно завязать плащ|Yavaşça cüppe bağlama|Langzaam de jas vastbinden
Six sealing, four closing, slow|Шесть запечатываний, четыре закрытия, медленно|Altı mühür, dört kapama, yavaş|Zes zegels, vier sluitingen, langzaam
Diagonal step, small|Небольшой косой шаг|Küçük çapraz adım|Kleine diagonale stap
Horse stance block and punch|Блок и удар в стойке всадника|At duruşunda blok ve yumruk|Blokkering en stoot in paardenstand
Fan through back|Веер через спину|Sırttan yelpaze açma|Waaier door de rug
Left side tap|Касание влево|Sola dokunma adımı|Links zijwaarts aantikken
Right side tap|Касание вправо|Sağa dokunma adımı|Rechts zijwaarts aantikken
Forward tap and arms|Касание вперёд и руки|Öne dokunma ve kollar|Voorwaarts aantikken en armen
Back tap and arms|Касание назад и руки|Geriye dokunma ve kollar|Achterwaarts aantikken en armen
Open the arms|Раскрыть руки|Kolları açma|Armen openen
Low knee and clap|Низкое колено и хлопок|Alçak diz ve el çırpma|Lage knie en klappen
Small waist turn and arms|Небольшой поворот талии и руки|Hafif bel dönüşü ve kollar|Kleine tailledraai en armen
Return and relax|Вернуться и расслабиться|Dönüş ve gevşeme|Terugkeren en ontspannen
`);
const courseNames=table(`
cheng37|Тайцзи Чжэн Маньцина · 37 форм|Cheng Man-ching tai chi · 37 form|Cheng Man-ching-tai chi · 37 vormen
tai12|Простое тайцзи · 12 игровых разделов|Basit tai chi · 12 oyun bölümü|Eenvoudige tai chi · 12 spelonderdelen
baduanjin|Бадуаньцзинь · восемь кусков парчи|Baduanjin · sekiz brokar|Baduanjin · acht brokaten
taekwondo|Тхэквондо · медленные основы|Taekwondo · yavaş temel hareketler|Taekwondo · langzame basis
judo|Дзюдо · стойки и шаги|Judo · duruş ve adımlar|Judo · stand en voetenwerk
sumo|Сумо · основы малой амплитуды|Sumo · küçük açılı temel hareketler|Sumo · basis met kleine bewegingen
martial|Боевые искусства Восточной Азии · основы|Doğu Asya dövüş sanatları · temel hareket|Oost-Aziatische krijgskunsten · basisbeweging
taijisword|Меч тайцзи · медленная виртуальная практика|Tai chi kılıcı · yavaş sanal çalışma|Tai chi-zwaard · langzaam virtueel oefenen
qigong|Цигун · естественное дыхание и движение|Qigong · doğal nefes ve hareket|Qigong · natuurlijke adem en beweging
chen|Тайцзи Чэнь · восемь медленных разделов|Chen tai chi · sekiz yavaş bölüm|Chen-tai chi · acht langzame onderdelen
shaolin|По мотивам Шаолиня · движения для начинающих|Shaolin esintili · başlangıç hareketleri|Shaolin-geïnspireerd · beginnersbeweging
yang|Тайцзи Ян · избранные медленные разделы|Yang tai chi · seçilmiş yavaş bölümler|Yang-tai chi · gekozen langzame onderdelen
dance|Групповой танец · мягкий ритм|Grup dansı · yumuşak ritim|Groepsdans · rustig ritme
`);
const descriptions=table(`
cheng37|Названия и номера 37 форм следуют руководству общества Шичжун. В каждом разделе игры отрабатывается одна целевая поза; повторы, переходы и завершение сохранены в данных, но не полностью анимированы. Изучайте полную последовательность с преподавателем.|37 ad ve numara Shizhong Derneği el kitabını izler. Her oyun bölümü tek hedef duruşu çalıştırır; tekrarlar, bağlantılar ve kapanış veride saklıdır ancak tümü canlandırılmaz. Tam diziyi öğretmeninizle öğrenin.|De 37 namen en nummers volgen het handboek van de Shizhong-vereniging. Elk spelonderdeel oefent één doelhouding; herhalingen, overgangen en afsluiting zijn als gegevens bewaard maar niet volledig geanimeerd. Leer de volledige reeks bij een leraar.
tai12|Двенадцать коротких разделов доступной работы рук и ног тайцзи; это не утверждённая школой форма из двенадцати поз.|Kolay tai chi el ve ayak çalışmasının on iki kısa bölümü; bir ekolün onaylı on iki duruşluk formu değildir.|Twaalf korte onderdelen met toegankelijk hand- en voetenwerk van tai chi; geen erkende twaalfhoudingenvorm van een school.
baduanjin|Восемь традиционных названий сверены с источником спортивной администрации. В игре позы адаптированы к небольшой, комфортной амплитуде; слова об органах и болезнях в названиях не являются обещанием лечения.|Sekiz geleneksel ad spor idaresi kaynağıyla karşılaştırılmıştır. Oyun duruşları hafif ve rahat hareketlere uyarlar; dizelerdeki organ ve hastalık adları tedavi iddiası değildir.|Acht traditionele namen zijn vergeleken met de bron van de sportadministratie. Het spel past de houdingen aan tot lichte, comfortabele bewegingen; orgaan- en ziektenamen in de verzen zijn geen medische beloften.
taekwondo|Подготовка, блоки, медленный прямой удар рукой и низкий передний удар ногой; это не урок пхумсэ или реального поединка.|Hazırlık, bloklar, yavaş düz yumruk ve alçak ön tekme; poomsae veya gerçek karşılaşma dersi değildir.|Voorbereiding, blokkeringen, een langzame rechte stoot en lage voorwaartse trap; geen poomsae- of praktische sparles.
judo|Поклон стоя, естественная и защитная стойки, шаги и повороты. Курс не демонстрирует броски, страховку при падении или приземления.|Ayakta selam, doğal ve savunma duruşları, adımlar ve dönüşler. Bu ders fırlatmaları, düşüş tekniklerini veya yere inişleri göstermez.|Staande buiging, natuurlijke en verdedigende standen, stappen en draaien. Deze les toont geen worpen, valbreken of landingen.
sumo|Основная стойка, низкий сико, скользящие шаги и тэппо в воздухе; без столкновений и реальной борьбы.|Temel duruş, alçak shiko, kayma adımları ve havada teppo; çarpışma veya gerçek güreş yoktur.|Basisstand, lage shiko, glijdende stappen en teppo in de lucht; zonder botsingen of echt worstelen.
martial|Вводная игра с акцентом на китайские движения рук и стойки; разные региональные традиции не объединяются в один стиль.|Çin dövüş sanatlarının el hareketleri ve duruşlarına odaklanan giriş oyunu; bütün bölgesel gelenekler tek bir tarz sayılmaz.|Een inleidend spel rond Chinees handwerk en standen, zonder alle regionale tradities als één stijl te behandelen.
taijisword|Восемь разделов управления виртуальным мечом; это не полная форма меча Чжэна или соревновательная форма из 32 движений.|Sekiz sanal kılıç kontrol bölümü; tam Cheng kılıç formu veya 32 hareketlik yarışma formu değildir.|Acht onderdelen voor een virtueel zwaard; geen volledige Cheng-zwaardvorm of wedstrijdvorm met 32 bewegingen.
qigong|Шесть разделов естественного дыхания и мягкого движения; без задержек дыхания и принудительных глубоких вдохов.|Altı doğal nefes ve yumuşak hareket bölümü; nefes tutma veya zorla derin nefes alma yoktur.|Zes onderdelen met natuurlijke adem en zachte beweging, zonder de adem vast te houden of diep ademen te forceren.
chen|Восемь названий взяты из опубликованного списка Чэнь Чжэнлэя. Позы не воспроизводят наматывание шёлка, выброс силы или полную работу тела.|Sekiz ad Chen Zhenglei'nin yayımlanmış listesinden alınmıştır. Duruşlar ipek sarma, güç salma veya bütün beden yöntemini yeniden üretmez.|Acht namen uit de gepubliceerde lijst van Chen Zhenglei. De houdingen bootsen geen zijdewinden, krachtuitgifte of volledige lichaamsmethode na.
shaolin|Игра с общими основами: стойкой всадника, луком и ударами рукой. Она не претендует на официальную форму или линию передачи монастыря Шаолинь.|At duruşu, yay duruşu ve yumruk gibi ortak temellere dayanan oyun; Shaolin Tapınağı'nın resmî formu veya öğretim silsilesi olduğu iddia edilmez.|Spel met algemene basisbewegingen zoals paardenstand, boogstand en stoten. Het claimt geen officiële vorm of afstamming van de Shaolin-tempel.
yang|Избранные распространённые названия стиля Ян; это не полная форма из 103 поз и не другая сокращённая форма.|Yang tarzından seçilmiş yaygın adlar; tam 103 duruşluk form veya başka bir kısa form değildir.|Gekozen gebruikelijke Yang-namen; geen volledige vorm van 103 houdingen of andere korte vorm.
dance|Восемь оригинальных разделов лёгких шагов и движений рук, без коммерческих песен и заимствованной хореографии.|Hafif adım ve kol hareketlerinden sekiz özgün bölüm; ticari şarkı veya başkasından kopyalanmış koreografi yoktur.|Acht originele onderdelen met rustige stappen en armen, zonder commerciële liedjes of gekopieerde choreografie.
`);
const sources=table(`
cheng37|Руководство общества Шичжун на домене мемориала Чжэн Маньцина|Cheng Man-ching anıtı alan adındaki Shizhong Derneği el kitabı|Shizhong-handboek op het domein van het Cheng Man-ching-monument
tai12|Оригинальная игровая последовательность|Oyunun özgün düzenlemesi|Originele spelreeks
baduanjin|Главное управление спорта: фиксированные позы бадуаньцзинь|Genel Spor İdaresi: Baduanjin sabit duruşları|Algemene sportadministratie: vaste Baduanjin-houdingen
taekwondo|Отдельные названия из терминологии Куккивона|Bazı adlar için Kukkiwon terimleri|Bepaalde namen uit Kukkiwon-terminologie
judo|Категории движений из учебных материалов Всеяпонской федерации дзюдо|Temel hareket kategorileri için Tüm Japonya Judo Federasyonu öğretim kaynakları|Basiscategorieën uit lesmateriaal van de Japanse judofederatie
sumo|Названия сико, суриаси и тэппо из источников Японской ассоциации сумо|Japonya Sumo Birliği'nin shiko, suriashi ve teppo adları|Shiko-, suriashi- en tepponamen van de Japanse sumovereniging
martial|Общие движения, собранные для игры|Oyun için birleştirilmiş genel hareketler|Algemene bewegingen voor het spel samengebracht
taijisword|Оригинальные разделы с виртуальным мечом|Özgün sanal kılıç bölümleri|Originele onderdelen met virtueel zwaard
qigong|Оригинальные разделы мягкого движения|Özgün yumuşak hareket bölümleri|Originele rustige bewegingsonderdelen
chen|Список восьми форм Chen Zhenglei Ltd|Chen Zhenglei Ltd'nin sekiz formluk listesi|Lijst van acht vormen van Chen Zhenglei Ltd
shaolin|Общие основы без одобрения монастыря Шаолинь|Shaolin Tapınağı onayı olmayan genel temeller|Algemene basis, zonder goedkeuring van de Shaolin-tempel
yang|Названия из открытых списков Yang Family Tai Chi|Yang Family Tai Chi'nin açık listelerindeki adlar|Namen uit openbare lijsten van Yang Family Tai Chi
dance|Оригинальные движения и порядок игры|Oyunun özgün hareketleri ve sırası|Originele bewegingen en volgorde van het spel
`);
const note={ru:'Трёхмерные цели, интерполяция и указания созданы для игры и не проверены преподавателем. Это не сертифицированная полная форма и не обучение бою.',tr:'3B hedefler, ara hareketler ve ipuçları oyun için hazırlanmıştır ve eğitmen tarafından doğrulanmamıştır. Onaylı tam form veya dövüş eğitimi değildir.',nl:'3D-doelen, interpolaties en aanwijzingen zijn voor het spel gemaakt en niet door een leraar getoetst. Geen gecertificeerde volledige vorm of gevechtstraining.'};
const spelling={ru:'В форме 4 используется обычный иероглиф 捋; в форме 37 сохранено написание источника 彎躬射虎.',tr:'4. formda yaygın 捋 karakteri, 37. formda kaynaktaki 彎躬射虎 yazımı korunur.',nl:'Vorm 4 gebruikt het gangbare teken 捋; vorm 37 behoudt de bronspelling 彎躬射虎.'};
const benefits=table(`
balance|Тренировать перенос веса и равновесие; это общая цель упражнения, а не доказанный лечебный эффект данного движения.|Ağırlık aktarımı ve dengeyi çalıştırır; bu genel egzersiz hedefidir, hareketin kanıtlanmış tedavi etkisi değildir.|Gewichtsverplaatsing en balans oefenen; dit is een algemeen oefendoel, geen bewezen therapeutisch effect van deze beweging.
coordination|Тренировать согласованность рук, ног и корпуса и запоминание движений.|Kolların, bacakların ve gövdenin uyumunu ve hareket hatırlamayı çalıştırır.|Coördinatie van armen, benen en romp en het onthouden van bewegingen oefenen.
mobility|Тренировать подвижность плеч, тазобедренных суставов и корпуса в комфортном диапазоне.|Omuz, kalça ve gövde hareketliliğini rahat sınırlar içinde çalıştırır.|Comfortabele beweeglijkheid van schouders, heupen en romp oefenen.
breath|Тренировать естественное дыхание, внимание и медленный ритм движений.|Doğal nefesi, dikkati ve yavaş hareket ritmini çalıştırır.|Natuurlijke ademhaling, aandacht en een rustig bewegingsritme oefenen.
legs|Тренировать опору ног, шаги и контроль позы без глубоких приседаний или растяжки через силу.|Derin çömelme veya zorlanmış esneme olmadan bacak desteğini, adımları ve duruş kontrolünü çalıştırır.|Beensteun, voetenwerk en houdingscontrole oefenen zonder diepe hurkzit of geforceerd rekken.
rhythm|Тренировать ритм, согласованность левой и правой сторон и мягкое движение всего тела.|Ritmi, sağ-sol uyumunu ve hafif tüm beden hareketini çalıştırır.|Ritme, links-rechtscoördinatie en rustige beweging van het hele lichaam oefenen.
`);
const words={
ru:{left:'левую',right:'правую',waist:'на уровне талии',chest:'на уровне груди',head:'рядом с головой',front:'вперёд',side:'в сторону',back:'немного назад',neutral:'в удобное положение',arm:(s,h,d)=>`Расположите ${s} руку ${h} и мягко переместите ${d}.`,lift:s=>`Слегка поднимите ${s} стопу, сохраняя устойчивость опорной ноги.`,step:s=>`Сделайте небольшой шаг вперёд, перемещая ${s} стопу.`,backStep:s=>`Сделайте небольшой шаг назад, перемещая ${s} стопу, не отклоняясь корпусом назад.`,wide:'Поставьте стопы на удобной ширине.',parallel:'Сохраняйте устойчивость стоп, не скрещивайте их.',turn:s=>`Немного поверните талию ${s==='левую'?'влево':'вправо'}; колени и носки направлены одинаково.`,centre:'Держите корпус по центру, расслабьте плечи.',low:'Немного согните колени, без глубокого приседа.',soft:'Оставьте колени мягкими и дышите естественно.'},
tr:{left:'sol',right:'sağ',waist:'bel hizasına',chest:'göğüs hizasına',head:'başın yanına',front:'öne',side:'yana',back:'biraz geriye',neutral:'rahat bir konuma',arm:(s,h,d)=>`${s==='sol'?'Sol':'Sağ'} eli ${h} yerleştirip yumuşakça ${d} götürün.`,lift:s=>`${s==='sol'?'Sol':'Sağ'} ayağı yalnızca biraz kaldırın; destek bacağını sabit tutun.`,step:s=>`${s==='sol'?'Sol':'Sağ'} ayakla öne küçük bir adım atın.`,backStep:s=>`${s==='sol'?'Sol':'Sağ'} ayakla geriye küçük bir adım atın; gövdeyi geriye yatırmayın.`,wide:'Ayakları rahat bir genişliğe açın.',parallel:'Ayakları çaprazlamadan sabit tutun.',turn:s=>`Beli biraz ${s==='sol'?'sola':'sağa'} çevirin; dizler ve ayak parmakları aynı yöne baksın.`,centre:'Gövdeyi ortada, omuzları gevşek tutun.',low:'Dizleri hafifçe bükün, derin çömelmeyin.',soft:'Dizleri yumuşak bırakın ve doğal nefes alın.'},
nl:{left:'linker',right:'rechter',waist:'bij de taille',chest:'bij de borst',head:'naast het hoofd',front:'naar voren',side:'opzij',back:'iets naar achteren',neutral:'naar een comfortabele positie',arm:(s,h,d)=>`Plaats de ${s}hand ${h} en beweeg deze rustig ${d}.`,lift:s=>`Hef de ${s}voet slechts een beetje en houd het standbeen stabiel.`,step:s=>`Zet met de ${s}voet een kleine stap naar voren.`,backStep:s=>`Zet met de ${s}voet een kleine stap naar achteren zonder achterover te leunen.`,wide:'Zet de voeten op een comfortabele breedte.',parallel:'Houd de voeten stabiel zonder ze te kruisen.',turn:s=>`Draai de taille iets naar ${s==='linker'?'links':'rechts'}; knieën en tenen wijzen dezelfde kant op.`,centre:'Houd de romp centraal en ontspan de schouders.',low:'Buig de knieën licht, zonder diepe hurkzit.',soft:'Houd de knieën soepel en adem natuurlijk.'}
};
const guards=table(`
noImpact|Двигайтесь медленно только в воздухе; не ударяйте людей, столбы или другие предметы.|Yalnızca havada yavaşça çalışın; insanlara, direklere veya nesnelere vurmayın.|Oefen alleen langzaam in de lucht; sla geen mensen, palen of andere voorwerpen.
noLock|Не запирайте локти и не напрягайте запястья; расслабьте плечи и шею.|Dirsekleri kilitlemeyin, bilekleri kasmayın; omuzları ve boynu gevşetin.|Zet ellebogen niet op slot en span polsen niet aan; ontspan schouders en nek.
noBreathForce|Не задерживайте дыхание и не заставляйте себя глубоко вдыхать.|Nefesi tutmayın ve derin nefesi zorlamayın.|Houd je adem niet vast en forceer geen diepe ademhaling.
noHighKick|Поднимайте ногу невысоко и с контролем; не стремитесь к высоким ударам и не отклоняйтесь назад.|Bacağı alçak ve kontrollü kaldırın; yüksek tekme aramayın, geriye yaslanmayın.|Houd de beenheffing laag en beheerst; probeer geen hoge trappen en leun niet achterover.
noTwistKnee|Целевая поза игры не воспроизводит полный поворот. Не скручивайте опорное колено и не поворачивайтесь через силу.|Oyunun son duruşu tam dönüşü göstermez. Destek dizini burmayın, dönüşü zorlamayın.|De eindhouding toont geen volledige draai. Verdraai de steunende knie niet en forceer de draai niet.
lotus|Это только конечная поза с низкой ногой, без полного вращения или хлопка по стопе.|Bu yalnızca alçak bacaklı son duruştur; tam dönüş veya ayağa vurma gösterilmez.|Dit is alleen een eindhouding met laag geheven been, geen volledige draai of klap op de voet.
sword|Используйте только виртуальный меч игры; настоящий меч не нужен. Оставьте свободное место вокруг.|Yalnızca oyunun sanal kılıcını kullanın; gerçek kılıç gerekmez. Çevrenizde boş alan bırakın.|Gebruik alleen het virtuele zwaard; een echt zwaard is niet nodig. Houd ruimte om je heen vrij.
noStamp|Мягко и управляемо опускайте стопу; не прыгайте и не топайте с силой.|Ayağı yumuşak ve kontrollü indirin; zıplamayın veya sertçe yere vurmayın.|Zet de voet zacht en beheerst neer; spring of stamp niet hard.
noNeckForce|Пусть взгляд следует за телом; не выкручивайте шею, не трясите головой и не поворачивайте талию рывком.|Bakış gövdeyi izlesin; boynu zorlamayın, başı savurmayın, beli aniden çevirmeyin.|Laat de blik het lichaam volgen; forceer de nek niet, schud het hoofd niet en draai de taille niet abrupt.
noDeepReach|Опускайтесь лишь до комфортного уровня; вытягивайте спину, не бросая тело к земле.|Yalnızca rahat seviyeye alçalın; yere atılmadan sırtı uzun tutun.|Zak alleen zover als comfortabel is; houd de rug lang zonder naar de grond te duiken.
noTherapy|Традиционные слова в названии не обещают лечебного эффекта.|Addaki geleneksel ifadeler tedavi vaadi değildir.|Traditionele woorden in de naam zijn geen belofte van genezing.
`);
function cues(pose,lang,m,c){
 const w=words[lang],out=[];
 for(const side of ['left','right']){const v=pose.hands[side];out.push(w.arm(w[side],v[1]>1.72?w.head:v[1]>1.2?w.chest:w.waist,v[2]>.3?w.front:v[2]<-.05?w.back:Math.abs(v[0])>.5?w.side:w.neutral));}
 const lifted=Object.keys(pose.feet).find(s=>pose.feet[s][1]>.09),forward=Object.keys(pose.feet).find(s=>pose.feet[s][2]>.2),backward=Object.keys(pose.feet).find(s=>pose.feet[s][2]<-.2);
 out.push(lifted?w.lift(w[lifted]):forward?w.step(w[forward]):backward?w.backStep(w[backward]):Math.abs(pose.feet.left[0])>.32?w.wide:w.parallel);
 out.push(Math.abs(pose.waist)>.12?w.turn(w[pose.waist<0?'left':'right']):w.centre,pose.crouch>.16?w.low:w.soft);
 const source=m.cues.en.join(' '),add=new Set(['noLock']);
 if(/strike|hit |punch|teppo|shoulder alignment/i.test(source+' '+m.name.en))add.add('noImpact');
 if(/breath/i.test(source)||c.id==='qigong')add.add('noBreathForce');
 if(lifted||/kick/i.test(m.name.en))add.add('noHighKick');
 if(/complete turn|support knee/.test(source))add.add('noTwistKnee');
 if(/spin|foot slap/.test(source))add.add('lotus');
 if(c.id==='taijisword')add.add('sword');
 if(c.id==='sumo'||/stamp|jump|heel raise/.test(source+' '+m.name.en))add.add('noStamp');
 if(/neck|head|behind/.test(source+' '+m.name.en))add.add('noNeckForce');
 if(/ground|floor|downward|Reach down/.test(source+' '+m.name.en))add.add('noDeepReach');
 if(c.id==='baduanjin')add.add('noTherapy');
 for(const key of add)out.push(guards[key][lang]);
 return out;
}
export function applyCurriculumLocalesV4(curricula){
 for(const c of curricula)for(const lang of langs){
  c.name[lang]=courseNames[c.id][lang];c.description[lang]=descriptions[c.id][lang];
  c.sourceNote[lang]=[sources[c.id][lang],c.id==='cheng37'?spelling[lang]:null,note[lang]].filter(Boolean).join(' ');
  for(const m of c.moves){
   if(!names[m.name.en]?.[lang])throw new Error(`Missing curriculum v4 name ${m.name.en}/${lang}`);
   m.name[lang]=names[m.name.en][lang];m.cues[lang]=cues(m.pose,lang,m,c);m.benefits[lang]=benefits[m.benefitType][lang];
   for(const next of m.continuations||[]){if(!names[next.name.en]?.[lang])throw new Error(`Missing continuation v4 ${next.name.en}/${lang}`);next.name[lang]=names[next.name.en][lang];}
  }
 }
}
