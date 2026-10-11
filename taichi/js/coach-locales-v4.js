/** Additional deterministic course guidance, never presented as AI generation. */
export const addedCoachNames={ru:'Russian',tr:'Turkish',nl:'Dutch'};
const defaults={
  ru:{name:'текущее движение',cues:'Двигайтесь медленно, стойте устойчиво и удобно, расслабьте руки; колени направляйте в сторону носков.',pain:/боль|болит|болят|головокруж|кружится голова|травм/iu,advice:'При боли, головокружении или травме остановите упражнение. Игровая оценка не определяет безопасность движения. Обратитесь к преподавателю; если симптомы сохраняются, получите медицинскую помощь.'},
  tr:{name:'bu hareket',cues:'Yavaş hareket edin, rahat ve dengeli durun, kolları gevşetin; dizleri ayak parmaklarıyla aynı yönde tutun.',pain:/ağrı|acıyor|baş dön|başım dön|yaralan|sakatlan/iu,advice:'Ağrı, baş dönmesi veya yaralanma varsa egzersizi durdurun. Oyun puanı hareketin güvenli olduğunu göstermez. Eğitmeninizden yardım isteyin; belirtiler sürerse bir sağlık uzmanına danışın.'},
  nl:{name:'deze beweging',cues:'Beweeg langzaam, sta comfortabel en stabiel, ontspan de armen en houd knieën en tenen in dezelfde richting.',pain:/\b(?:pijn|duizelig\w*|blessure\w*|gewond)\b/iu,advice:'Stop bij pijn, duizeligheid of een blessure. De spelscore bepaalt niet of bewegen veilig is. Vraag hulp aan de docent; laat aanhoudende klachten medisch beoordelen.'}
};
export function addedLocaleGuide(f){
  const d=defaults[f.lang];if(!d)return null;
  if(d.pain.test(f.question||''))return d.advice;
  const name=f.name||d.name,cues=f.cues||d.cues;
  if(f.lang==='ru')return `Памятка к занятию | ${name}: ${cues}${f.score?` Оценка позы персонажа: ${f.score}.`:''} Наблюдайте за руками, ногами и поворотом корпуса преподавателя, затем тренируйтесь по частям. Это памятка к занятию, а не ответ генеративной модели.`;
  if(f.lang==='tr')return `Ders rehberi | ${name}: ${cues}${f.score?` Oyun duruş puanı: ${f.score}.`:''} Öğretmenin ellerini, ayaklarını ve bel dönüşünü izleyip aşamalar hâlinde çalışın. Bu, ders bilgilerinin özetidir; üretken model yanıtı değildir.`;
  return `Leswijzer | ${name}: ${cues}${f.score?` Houdingsscore in het spel: ${f.score}.`:''} Let op de handen, voeten en rompdraaiing van de docent en oefen in stappen. Dit is lesinformatie, geen antwoord van een generatief model.`;
}
