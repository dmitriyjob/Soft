'use strict';
const $=s=>document.querySelector(s);
const show=(n,body,cls='')=>`<div class="reveal ${cls}" data-step="${n}">${body}</div>`;
const fraction=(a,b)=>`<span class="audio-fraction"><span>${a}</span><span>${b}</span></span>`;
const f=s=>`<div class="sound-formula">${s}</div>`;
const waveValues=[.1,.3,.56,.8,.9,.85,.63,.25,-.2,-.6,-.83,-.75,-.4,.12,.55,.69,.5,.1,-.32,-.51,-.4,0];
function wave(){
 const points=waveValues.map((v,i)=>[80+i*23,230-v*130]);
 return `<svg class="sound-wave" viewBox="0 0 640 440" role="img" aria-label="Одна секунда звукового сигнала: измерения через равные промежутки времени"><g class="wave-grid">${[100,165,230,295,360].map(y=>`<path d="M80 ${y}H563"/>`).join('')}${points.map(([x])=>`<path d="M${x} 85V375"/>`).join('')}</g><g class="wave-stems">${points.map(([x,y])=>`<path d="M${x} 230V${y}"/>`).join('')}</g><polyline class="wave-line" points="${points.map(p=>p.join(',')).join(' ')}"/>${points.map(([x,y])=>`<circle class="wave-dot" cx="${x}" cy="${y}" r="4.5"/>`).join('')}<g class="wave-axis axis-time"><path d="M80 382H585l-9 -5m9 5l-9 5"/><text x="330" y="416" text-anchor="middle">Время</text><text x="80" y="405">0</text><text x="550" y="405">1 с</text></g><g class="wave-axis axis-level"><path d="M63 375V75l-5 9m5 -9l5 9"/><text transform="translate(30 230) rotate(-90)" text-anchor="middle">Сила сигнала от микрофона</text></g><g class="wave-second"><path d="M80 61V47H563V61"/><text x="322" y="32" text-anchor="middle">1 секунда звука</text></g></svg>`;
}
function sampledWave(){
 const y=x=>180-98*Math.sin((x-20)/740*Math.PI*2.05-.28);
 const curve=Array.from({length:241},(_,i)=>`${i?'L':'M'}${(20+i*740/240).toFixed(1)} ${y(20+i*740/240).toFixed(1)}`).join(' ');
 return `<svg class="sound-wave sampled-wave" viewBox="0 0 800 360" role="img" aria-label="Звуковая волна и ступенчатые результаты измерений"><g class="sample-stems"></g><path class="sample-stair"/><path class="sample-curve" d="${curve}"/><g class="sample-dots"></g><g class="wave-axis axis-time"><path d="M20 310H770l-9 -5m9 5l-9 5"/><text x="395" y="345" text-anchor="middle">Время</text><text x="20" y="335">0</text><text x="745" y="335">1 с</text></g><g class="wave-axis axis-level"><path d="M18 310V35l-5 9m5 -9l5 9"/><text transform="translate(7 180) rotate(-90)" text-anchor="middle">Сила сигнала</text></g><g class="wave-second"><path d="M20 30V18H760V30"/><text x="390" y="13" text-anchor="middle">1 секунда звука</text></g></svg>`;
}
function paintSamples(rate){
 const svg=document.querySelector('.sampled-wave');if(!svg)return;
 const count=Number(rate),y=x=>180-98*Math.sin((x-20)/740*Math.PI*2.05-.28),step=740/count;
 let stair=`M20 ${y(20).toFixed(1)}`,stems='',dots='';
 for(let i=0;i<count;i++){
  const x=20+i*step,next=20+(i+1)*step,level=y(x);
  stair+=`H${next.toFixed(1)} V${y(next).toFixed(1)}`;
  stems+=`<path d="M${x.toFixed(1)} ${level.toFixed(1)}V310"/>`;
  dots+=`<circle cx="${x.toFixed(1)}" cy="${level.toFixed(1)}" r="2.6"/>`;
 }
 svg.querySelector('.sample-stair').setAttribute('d',stair);
 svg.querySelector('.sample-stems').innerHTML=stems;
 svg.querySelector('.sample-dots').innerHTML=dots;
 document.querySelector('.sampling-value').textContent=rate+' кГц';
 document.querySelector('.sampling-count').textContent=(count*1000).toLocaleString('ru-RU')+' замеров в секунду';
}
function channelCard(k,title){return `<div class="channel-card"><div class="channel-art">${Array.from({length:k},(_,i)=>`<svg viewBox="0 0 220 45" aria-hidden="true"><path pathLength="1" style="--wave-delay:${i*120}ms" d="M5 23H25Q35 23 40 8T60 23T80 23T100 23T120 23T140 23T160 23T180 23H215"/><text x="8" y="12">${i+1}</text></svg>`).join('')}</div><h3>${title}</h3><p>${k} ${k===1?'канал':k===2?'канала':'канала'}</p><strong>k = ${k}</strong></div>`;}
const numbered=(n,label,body,step)=>show(step,`<span class="step-no">${n}</span><div><div class="step-title">${label}</div>${body}</div>`,'audio-step');
function comparisonLesson(){
 const row=(n,html)=>show(n,html,'comparison-formula');
 return `<div class="audio-intro"><h2>Разбор: повторная запись</h2><div class="problem-card">Музыкальный фрагмент без сжатия записали сначала в формате <span data-given="1">моно</span>. Размер файла — <span data-given="2">72 Мбайт</span>. Затем тот же фрагмент записали в формате <span data-given="3">стерео</span>: глубина кодирования стала <span data-given="4">в 3 раза выше</span>, а частота дискретизации — <span data-given="5">в 4,5 раза ниже</span>. Каков <span data-given="6">размер второго файла в Мбайтах</span>?</div></div><div class="comparison-solution"><div class="comparison-columns"><section class="comparison-column">${show(9,'<h3>Было</h3>')}${row(9,'I₁ = k₁ · ν₁ · i₁ · t₁')}${row(10,'k₁ = <strong>1</strong> · моно')}${row(11,'<strong>72 Мбайт</strong> = 1 · ν₁ · i₁ · t₁')}</section><section class="comparison-column">${show(9,'<h3>Стало</h3>')}${row(9,'X = k₂ · ν₂ · i₂ · t₂')}${row(12,'k₂ = <strong>2</strong> · стерео')}${row(13,'i₂ = <strong>3i₁</strong>')}${row(14,`ν₂ = ${fraction('<strong>ν₁</strong>','4,5')}`)}${row(15,'X = 2 · ν₂ · i₂ · t₂')}${row(16,`X = 2 · ${fraction('<strong>ν₁</strong>','4,5')} · 3<strong>i₁</strong> · t₂`)}</section></div><div class="comparison-steps">${ratioComparison()}</div></div>`;
}
function transmissionLesson(){
 const ring='<span class="find-target">t<svg class="find-ring" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="30" rx="47" ry="27" pathLength="1"/></svg></span>';
 return `<div class="audio-intro"><h2>Разбор: передача голосового сообщения</h2><div class="problem-card">Голосовое сообщение длительностью <span data-given="1">3 минуты</span> записали в формате <span data-given="2">стерео</span> с разрешением <span data-given="3">24 бита</span> и частотой дискретизации <span data-given="4">54 000 измерений в секунду</span>. Без сжатия его передали по каналу со скоростью <span data-given="5">3200 бит/с</span>. Сколько <span data-given="6">минут</span> заняла передача?</div></div><div class="transmission-solution"><div class="transmission-formulas"><section>${show(9,'<p>Переданная информация</p><div class="transmission-equation">I = v · '+ring+'<sub>передачи</sub></div><small>v — скорость канала</small>')}</section><section>${show(10,'<p>Объём звукозаписи</p><div class="transmission-equation">I = k · ν · i · t<sub>записи</sub></div><small>ν — частота дискретизации</small>')}</section></div><div class="transmission-givens">${show(11,'t<sub>записи</sub> = 3 · 60 = <strong>180 с</strong>','recording-time')}${show(12,'k = <strong>2</strong>','recording-channels')}${show(13,'i = <strong>24 бита</strong>','recording-depth')}${show(14,'ν = <strong>54 000 Гц</strong>','recording-frequency')}${show(15,'v = <strong>3200 бит/с</strong>','channel-speed')}</div><div class="transmission-work">${numbered(1,'Выразим время передачи',`${show(17,`t<sub>передачи</sub> = ${fraction('I','v')}`,'transmission-derivation')}${show(18,`t<sub>передачи</sub> = ${fraction('k · ν · i · t<sub>записи</sub>','v')}`,'transmission-derivation')}`,17)}${numbered(2,'Подставим данные',`t<sub>передачи</sub> = ${fraction('2 · 54 000 · 24 · 180','3200')}`,19)}${numbered(3,'Мы нашли время в секундах','t<sub>передачи</sub> = <strong>145 800 с</strong>',20)}${numbered(4,'Переведём секунды в минуты',`${fraction('145 800','60')} = <strong>2430 минут</strong>`,21)}${show(22,'<div class="audio-answer">Ответ: <strong>2430</strong></div>')}</div></div>`;
}
// Separate the required storage capacity from a request for the integer part.
const storageTitles=[
 'Задача № 31114: объём сообщения',
 'Стерео — значит <em>k = 2</em>',
 'Герцы — <em>ν</em>, биты — <em>i</em>',
 'Время — <em>в секунды</em>',
 'Килобайты: делим на <em>1024 · 8</em>',
 'Считаем на <em>калькуляторе</em>',
 'Ответ: <em>13 993</em>'
];
function storageLesson(){
 return `<div class="case-label">№ 31114 · ОБЪЁМ ЗВУКОВОЙ ЗАПИСИ</div>
 <h2 class="case-heading">${storageTitles[0]}</h2>
 <div class="case-problem">Лена записывает голосовое сообщение для своей подруги. Перед отправкой сообщение оцифровывается в формате <span data-given="1">стерео</span> с частотой дискретизации <span data-given="2">12 000 Гц</span> и глубиной кодирования <span data-given="2">24 бит</span>. Определите <span data-given="6" class="storage-demand">наименьшее количество</span> <span data-given="4">Кбайт</span>, <span data-given="6" class="storage-demand">необходимое для сохранения</span> сообщения в памяти (без учёта заголовка), если его длительность — <span data-given="3">3 минуты 19 секунд</span>. В ответе укажите только число.</div>
 <div class="storage-work">
 ${show(1,`<div class="case-label">ДАНО</div><div class="storage-value"><b>k</b> = 2<small>стерео — два канала</small></div>${show(2,'<div class="storage-value"><b>ν</b> = 12 000 Гц</div><div class="storage-value"><b>i</b> = 24 бит<small>биты — глубина кодирования</small></div>')}${show(3,'<div class="storage-value"><b>t</b> = 3 · 60 + 19 = 199 с</div>')}`,'storage-card storage-givens')}
 ${show(4,`<div class="case-label">ОБЪЁМ В КБАЙТАХ</div><div class="storage-equation">${fraction('k · ν · i · t','1024 · 8')}</div><div class="storage-equation">${fraction('2 · 12 000 · 24 · 199','1024 · 8')}</div>`,'storage-card storage-calculation')}
 ${show(5,'<div class="case-label">КАЛЬКУЛЯТОР</div><div class="calculator-screen"><div>114 624 000 ÷ 8 ÷ 1024 =</div><output>13 992,1875</output></div><p>Точный объём сообщения в Кбайтах</p>','storage-card storage-calculator')}
 </div>
 ${show(6,'<span class="storage-exact">13 992,1875</span><span>→</span><p>«Наименьшее, <b>необходимое для сохранения</b>»<br>Округляем <b>вверх</b>, чтобы всё поместилось.</p><strong class="storage-result">13 993</strong>','storage-answer')}`;
}
const roundingTitles=[
 'Почему <em>13 993</em>, а не 13 992?',
 'Читай, <em>что спрашивают</em>',
 'В ответ — <em>только целую часть</em>',
 'Перечитай <em>вопрос</em>'
];
function capacityCard(fits){
 return `<section class="capacity-card" style="--fill-delay:${fits?1.05:.15}s;--fill-end:${fits?59.375:100}%"><div class="capacity-heading"><h3>Память на ${fits?'13 993':'13 992'} Кбайт</h3><b class="${fits?'fits':'overflows'}">${fits?'влезло ✓':'не влезло ×'}</b></div><div class="capacity-ticks ${fits?'':'short'}"><span>13 991</span><span>13 992</span>${fits?'<span>13 993</span>':''}</div><div class="capacity-bar ${fits?'fits':'overflows'}" role="img" aria-label="${fits?'Сообщение занимает 13 992,1875 Кбайт и помещается в 13 993 Кбайт':'Сообщение не помещается в 13 992 Кбайт: не хватает 0,1875 Кбайт'}"><span class="capacity-fill"><span class="capacity-recording"></span><span class="capacity-tail"></span></span><span class="capacity-limit" aria-hidden="true"></span></div><p>${fits?'Всё поместилось, ещё и место осталось. Берём <b>с запасом</b>.':'Не хватает <b>0,1875 Кбайт</b> — конец сообщения <b>потеряется</b>.'}</p></section>`;
}
function roundingLesson(){
 return `<div class="rounding-heading"><div class="case-label">ЛОВУШКА ЕГЭ · ОКРУГЛЕНИЕ</div><button class="capacity-replay" type="button" aria-label="Повторить анимацию заполнения памяти"><span aria-hidden="true">↻</span> Повторить заполнение</button></div><h2 class="case-heading">${roundingTitles[0]}</h2>
 <div class="rounding-layout"><div class="capacity-column">${capacityCard(false)}${capacityCard(true)}
 ${show(3,'Перед тем как записать ответ — <b>всегда перечитывай, что спрашивают</b>. Если просят <strong>только целую часть</strong>, отбрось дробь.','rounding-reminder')}</div>
 <div class="rounding-examples">${show(1,`<div class="rounding-rules"><section class="rounding-rule"><div class="case-label">ЗАДАЧА № 31114</div><p>«…наименьшее количество Кбайт, <b>необходимое для сохранения</b>… В ответе укажите только число»</p><div class="rule-result rule-up">13 992,1875 → 13 993<small>ОКРУГЛЯЕМ ВВЕРХ</small></div></section><section class="rounding-rule integer-rule"><div class="case-label">ПРИМЕР ПРО КВАДРО</div><p>«…В ответе укажите <strong>только целую часть</strong> полученного числа»</p><div class="rule-result rule-integer">13 992,18 → 13 992<small>ОТБРОСИТЬ ДРОБЬ</small></div></section></div>`)}
 ${show(2,`<section class="integer-example"><div class="case-label">КВАДРО · 5 МИНУТ · ОБЪЁМ В МБАЙТАХ</div><p>Музыкальный фрагмент длительностью <b>5 минут</b> записан в формате <b>квадро</b> с частотой <b>40 кГц</b> и <b>16-битным разрешением</b>. Сжатия нет. Найдите объём файла в Мбайтах. В ответе укажите <strong class="integer-instruction">только целую часть</strong> числа.</p><div class="integer-givens">k = 4 · ν = 40 000 Гц · i = 16 бит · t = 300 с</div><div class="integer-equation">${fraction('4 · 40 000 · 16 · 300','8 · 1024 · 1024')}<span>= 91<span class="discarded">,552734375</span> → <strong>91</strong></span></div><div class="integer-takeaway"><b>ТОЛЬКО ЦЕЛУЮ ЧАСТЬ</b><span>Дробную часть отбрасываем: 91,552734375 → 91.</span></div></section>`)}
 </div></div><p class="capacity-caption">На схеме увеличен последний участок записи: от 13 991 Кбайт.</p>`;
}

// The same variables and the same 72 MB recording as in the worked example.
function ratioComparison(){
 const cancel=s=>`<span class="ratio-cancel">${s}</span>`;
 return `${show(17,`<div class="ratio-panel"><span class="ratio-label">Было / Стало<br>t₁ = t₂</span><div class="ratio-equation">${fraction(`1 · ${cancel('ν₁')} · ${cancel('i₁')} · ${cancel('t₁')}`,`2 · (${cancel('ν₁')}/4,5) · 3${cancel('i₁')} · ${cancel('t₂')}`)}<span>=</span>${fraction('72','X')}</div></div>`)}
 ${show(18,'Длительность та же: t₁ = t₂. Сокращаем ν₁, i₁ и равные t₁, t₂. Умножаем крест-накрест.','ratio-explanation')}
 ${show(19,'<div class="ratio-result">X = 72 · 2 · 3 / 4,5 = <strong>96 Мбайт</strong></div>')}`;
}
const mixerOptions={
 k:{label:'Каналы k',options:[[1,'моно'],[2,'стерео'],[4,'квадро']]},
 i:{label:'Глубина i',options:[[.25,'÷ 4'],[.5,'÷ 2'],[1,'как было'],[2,'× 2'],[3,'× 3'],[4,'× 4']]},
 nu:{label:'Частота ν',options:[[1/4.5,'÷ 4,5'],[.5,'÷ 2'],[1/1.5,'÷ 1,5'],[1,'как было'],[1.5,'× 1,5'],[2,'× 2']]},
 t:{label:'Время t',options:[[.5,'÷ 2'],[1,'как было'],[2,'× 2'],[3,'× 3']]}
};
let mixerState={k:1,i:1,nu:1,t:1};
const audioNumber=value=>value.toLocaleString('ru-RU',{maximumFractionDigits:3});
function mixerLesson(){
 return `<div class="case-label">ВО СКОЛЬКО РАЗ · ПУЛЬТ</div><h2>Покрути — объём <em>изменится во столько же раз</em></h2>
 <div class="mixer-layout"><section class="mixer-controls" aria-label="Параметры новой записи"><p class="mixer-baseline">Было: <b>моно, 72 Мбайт</b>. Меняй параметры новой записи.</p>
 ${Object.entries(mixerOptions).map(([key,group])=>`<div class="mixer-row"><h3>${group.label}</h3><div class="mixer-segments" role="group" aria-label="${group.label}">${group.options.map(([value,label])=>`<button type="button" class="mixer-option" data-mixer-factor="${key}" data-value="${value}" aria-pressed="${value===1}">${label}</button>`).join('')}</div></div>`).join('')}
 <div class="mixer-actions"><button type="button" class="mixer-preset">Как в задаче</button><button type="button" class="mixer-reset">Сбросить</button></div>
 <div class="mixer-equation" aria-live="polite"><span>I₂ = </span><span data-mixer-expression>72 = <strong>72 Мбайт</strong></span></div>
 <p class="mixer-note">Каналы, глубина, частота и время <b>перемножаются</b>. Каждый параметр меняет объём во столько же раз.</p></section>
 <section class="mixer-chart" aria-label="Сравнение объёма записей"><div class="mixer-columns" role="img" aria-label="Было 72 Мбайт, стало 72 Мбайт"><div class="mixer-column"><div class="mixer-bar mixer-before" style="--bar-size:92.592593%"><div class="mixer-bar-label"><small>было</small><b>72 Мбайт</b></div></div></div><div class="mixer-column"><div class="mixer-bar mixer-after" style="--bar-size:92.592593%"><div class="mixer-bar-label"><small>стало</small><b><span data-mixer-volume>72</span> Мбайт</b></div></div></div></div><p class="mixer-change" aria-live="polite">Объём не изменился</p></section></div>`;
}
function paintMixer(){
 const root=$('#slide'),{k,i,nu,t}=mixerState,ratio=k*i*nu*t,value=72*ratio,max=Math.max(1,ratio)*1.08;
 root.querySelectorAll('[data-mixer-factor]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.value)===mixerState[button.dataset.mixerFactor])));
 const terms=Object.values(mixerState).filter(value=>value!==1).map(value=>value<1?` ÷ ${audioNumber(1/value)}`:` · ${audioNumber(value)}`).join('');
 root.querySelector('[data-mixer-expression]').innerHTML=`72${terms} = <strong>${audioNumber(value)} Мбайт</strong>`;
 root.querySelector('[data-mixer-volume]').textContent=audioNumber(value);
 root.querySelector('.mixer-before').style.setProperty('--bar-size',`${100/max}%`);
 root.querySelector('.mixer-after').style.setProperty('--bar-size',`${ratio/max*100}%`);
 root.querySelector('.mixer-columns').setAttribute('aria-label',`Было 72 Мбайт, стало ${audioNumber(value)} Мбайт`);
 root.querySelector('.mixer-change').textContent=Math.abs(ratio-1)<1e-10?'Объём не изменился':ratio>1?`Объём увеличился: × ${audioNumber(ratio)}`:`Объём уменьшился: ÷ ${audioNumber(1/ratio)}`;
}
function handleMixer(button){
 if(button.matches('.mixer-option'))mixerState[button.dataset.mixerFactor]=Number(button.dataset.value);
 else if(button.matches('.mixer-preset'))mixerState={k:2,i:3,nu:1/4.5,t:1};
 else if(button.matches('.mixer-reset'))mixerState={k:1,i:1,nu:1,t:1};
 paintMixer();
}

const soundQuestions=[
 {title:'Что такое частота дискретизации ν?',options:['Сколько бит на один отсчёт','Сколько каналов в записи','Громкость звука','Сколько раз за секунду «режем» звук'],correct:3,explanation:'Частота ν — число измерений сигнала за одну секунду. Измеряется в герцах.'},
 {title:'Файл в формате «стерео». Чему равно k?',options:['2','1','4','8'],correct:0,explanation:'Стерео — два канала: k = 2. Для моно k = 1, для квадро k = 4.'},
 {title:'Запись длится 2 минуты 5 секунд. Чему равно t?',options:['7,5','125','205','25'],correct:1,explanation:'Время подставляем в секундах: 2 · 60 + 5 = 125 с.'},
 {title:'Объём получился в битах. Как сразу перевести в Кбайты?',options:['Умножить на 8','Разделить на 1024','Разделить на 8 · 1024','Разделить на 1000'],correct:2,explanation:'Сначала делим на 8 — получаем байты. Затем на 1024 — получаем Кбайты.'},
 {title:'Вышло 512,3 Кбайт. Вопрос: «наименьшее количество Кбайт, необходимое для сохранения». Ответ?',options:['512','512,3','500','513'],correct:3,explanation:'Нужно целое количество Кбайт, которого хватит для всей записи. Округляем вверх: 512,3 → 513.'},
 {title:'Звук перезаписали: стерео вместо моно, частота в 2 раза меньше. Объём…',note:'Глубина кодирования и длительность записи не изменились.',options:['не изменился','вырос в 2 раза','вырос в 4 раза','уменьшился в 2 раза'],correct:0,explanation:'Каналов стало вдвое больше, частота вдвое меньше: 2 · ½ = 1. Объём не изменился.'}
];
const soundQuizKey='soft-sound-quiz-v1';
let soundAnswers=Array(6).fill(null);
try{const saved=JSON.parse(sessionStorage.getItem(soundQuizKey));if(Array.isArray(saved)&&saved.length===6&&saved.every(x=>x===null||Number.isInteger(x)&&x>=0&&x<4))soundAnswers=saved;}catch{}
function saveSoundAnswers(){try{sessionStorage.setItem(soundQuizKey,JSON.stringify(soundAnswers));}catch{}}
const soundScore=()=>soundQuestions.reduce((score,q,i)=>score+Number(soundAnswers[i]===q.correct),0);
function renderSoundQuiz(){
 const host=$('#slide .sound-quiz-host'),result=buildStep===6,score=soundScore();
 const progress=`<div class="sound-quiz-progress" aria-label="${result?'Результат':`Вопрос ${buildStep+1} из 6`}">${soundQuestions.map((q,i)=>`<span class="${!result&&i===buildStep?'current ':''}${soundAnswers[i]===q.correct?'correct':soundAnswers[i]!==null?'incorrect':''}" ${!result&&i===buildStep?'aria-current="step"':''} aria-label="Вопрос ${i+1}${soundAnswers[i]===null?'':soundAnswers[i]===q.correct?': верно':': неверно'}"></span>`).join('')}</div>`;
 if(result){
  const answered=soundAnswers.filter(x=>x!==null).length;
  host.innerHTML=`<div class="sound-quiz-top"><div class="case-label">ИТОГ</div>${progress}</div><h2>${score===6?'Отлично! Всё получилось':score>=4?'Хороший результат':'Есть над чем поработать'}</h2><div class="sound-quiz-score"><strong>${score}</strong><span>из 6 правильно</span></div>${answered<6?`<p class="sound-quiz-skipped">Без ответа: ${6-answered}. Можно вернуться к вопросам.</p>`:''}<button type="button" class="sound-quiz-restart">Пройти заново</button>`;
 }else{
  const q=soundQuestions[buildStep],selected=soundAnswers[buildStep],answered=selected!==null;
  host.innerHTML=`<div class="sound-quiz-top"><div class="case-label">ВОПРОС ${buildStep+1} ИЗ 6</div>${progress}</div><h2>${q.title}</h2>${q.note?`<p class="sound-quiz-note">${q.note}</p>`:''}<div class="sound-quiz-options" role="group" aria-label="Варианты ответа">${q.options.map((option,i)=>`<button type="button" class="sound-quiz-option ${answered&&i===q.correct?'correct':answered&&i===selected?'incorrect':''}" data-sound-answer="${i}" aria-pressed="${selected===i}" aria-disabled="${answered}"><span class="sound-option-letter">${'АБВГ'[i]}</span><span>${option}</span>${answered&&i===q.correct?'<b aria-label="Правильный ответ">✓</b>':answered&&i===selected?'<b aria-label="Неверный ответ">×</b>':''}</button>`).join('')}</div><div class="sound-quiz-feedback ${answered?selected===q.correct?'correct':'incorrect':''}" role="status">${answered?`<b>${selected===q.correct?'Верно!':'Пока неверно.'}</b> ${q.explanation}`:''}</div>`;
 }
 stylizeNu(host);
}
function answerSoundQuestion(choice){
 if(buildStep>=6||soundAnswers[buildStep]!==null)return;
 soundAnswers[buildStep]=Number(choice);saveSoundAnswers();renderSoundQuiz();
 // Replacing the answer buttons must not lose keyboard focus.
 $('#slide [data-sound-answer="'+choice+'"]').focus();
}
function restartSoundQuiz(){
 soundAnswers=Array(6).fill(null);saveSoundAnswers();buildStep=0;
 history.replaceState(null,'',`#${current}`);update();$('#slide').scrollTop=0;$('#slide h2').setAttribute('tabindex','-1');$('#slide h2').focus({preventScroll:true});
}
function soundCheatsheet(){
 const card=(title,body,cls='')=>`<section class="sound-cheat-card ${cls}"><h3>${title}</h3>${body}</section>`;
 return `<h2>Шпаргалка № 7 · <em>звук</em></h2><div class="sound-cheat-grid">
 ${card('ФОРМУЛА','<div class="sound-cheat-formula">I = k · ν · i · t</div><p>Получаем <b>биты</b>. Всё перемножаем. Запись без сжатия и заголовков.','formula-card')}
 ${card('ν — ЧАСТОТА','<p>Измерений за 1 секунду. <b>Гц</b>.<br>1 кГц = 1000 Гц.</p>')}
 ${card('i — ГЛУБИНА','<p>Видишь <b>биты</b> — это она. Ещё «разрешение», «глубина кодирования».</p>')}
 ${card('t — ВРЕМЯ','<p>Сразу в <b>секунды</b>:<br>3 мин 19 с = 199 с.</p>')}
 ${card('k — КАНАЛЫ','<p>Моно <b>1</b> · стерео <b>2</b> · квадро <b>4</b>. Число каналов ищем в тексте.</p>')}
 ${card('ЕДИНИЦЫ','<p>Кбайт: I / (8 · 1024).<br>Мбайт: I / (8 · 1024 · 1024).</p>')}
 ${card('«НЕОБХОДИМОЕ ДЛЯ СОХРАНЕНИЯ»','<p>Округляем <b>вверх</b>:<br>13 992,1875 → 13 993.</p>','rounding-card')}
 ${card('«ТОЛЬКО ЦЕЛУЮ ЧАСТЬ»','<p><b>Отбрасываем</b> дробь:<br>91,552734375 → 91.</p>','rounding-card')}
 ${card('ВО СКОЛЬКО РАЗ','<p>Было / Стало = I₁ / I₂. Общие переменные сокращаем, остаются <b>множители</b>.</p>')}
 </div>`;
}

const slides=[
{title:'Звук.',group:'Начало',type:'intro',steps:0,body:`<div class="kicker">УРОК 07 · ЕГЭ ПО ИНФОРМАТИКЕ</div><div class="hero"><div class="audio-hero-art">${wave()}</div><div class="hero-text"><h1>Звук.</h1><p class="lead">Разберём задание №7 ЕГЭ:<br>как посчитать объём звуковой записи.</p><a class="primary" href="#2">Начать урок <span>→</span></a></div></div>`},
{title:'Из чего же состоит звук?',group:'Звук',type:'signal',steps:5,body:`<h2>Из чего же состоит звук?</h2><div class="sampling-layout"><div class="sampling-graph">${sampledWave()}<p class="sampling-caption">Схема: показана часть измерений, чтобы было видно каждый замер.</p></div><div class="sampling-side"><div class="sampling-card"><div class="sampling-eyebrow">Частота дискретизации</div><div class="sampling-value">48 кГц</div><div class="sampling-count">48 000 замеров в секунду</div><input class="sampling-slider" type="range" min="6" max="48" step="6" value="48" aria-label="Частота дискретизации, кГц"><div class="sampling-ticks"><span>6</span><span>12</span><span>24</span><span>48</span></div></div><div class="sampling-note">Каждый замер — число. Чаще замеры — точнее звук, но больше файл.</div><div class="sampling-copy">${show(4,'<p><strong>Точки</strong> — моменты измерения через равные промежутки времени.</p>')}${show(5,'<p>Значение сигнала в каждый момент сохраняется <strong>двоичным кодом одинаковой длины</strong>.</p>')}</div></div></div>`},
{title:'Частота дискретизации',group:'Звук',steps:4,body:`<h2>Частота дискретизации</h2><div class="theory-layout"><div>${show(1,'<p class="large-copy"><strong>Частота дискретизации</strong> — количество равных временных интервалов в одной секунде.</p>')}${show(2,f('ν')+'<p class="small">Греческая буква «ню»</p>')}${show(3,'<p class="large-copy">Измеряется в <strong>герцах (Гц)</strong>.</p>')}</div><div>${show(4,'<div class="intervals">'+Array.from({length:8},()=>'<span></span>').join('')+'</div><p class="interval-label">1 секунда → 8 равных интервалов</p>'+f('ν = 8 Гц')+'<p>Частота показывает, на сколько одинаковых временных интервалов разбивается одна секунда. Чем выше частота, тем чаще измеряем сигнал.</p>')}</div></div>`},
{title:'Битовая глубина',group:'Звук',steps:7,body:`<h2>Битовая глубина</h2><div class="depth-lead">${show(1,'<p>Мы уже знаем <strong>количество измерений в одной секунде</strong> — это частота дискретизации ν.</p>')}${show(2,'<p>Если узнаем, <strong>сколько бит занимает одно измерение</strong>, сможем найти объём одной секунды звука.</p>')}</div><div class="theory-layout depth-layout"><div>${show(3,'<p class="large-copy">Каждый измеренный уровень сигнала записывается <strong>одинаковым количеством бит</strong>.</p>')}${show(4,'<p class="large-copy">Это количество называется <strong>битовой глубиной</strong>.</p><p class="small">Глубина кодирования, разрешение, разрешение кодирования.</p>')}${show(5,'<p class="large-copy">Обозначаем <strong>i</strong>, измеряем в <strong>битах</strong>.</p>')}</div><div>${show(5,'<div class="sample-code"><span class="sample-dot"></span><span>→</span><div class="code-bits">0 1 1 0 1 0 0 1</div></div><p class="small">Пример: 8 бит на одно измерение</p>')}${show(6,f('I<sub>1 с</sub> = ν · i'))}${show(7,'<p>Количество измерений за секунду умножаем на число бит в одном измерении — получаем <strong>объём одной секунды в битах</strong> для одного канала.</p>')}</div></div>`},
{title:'Как ищем размер одной секунды?',group:'Формула',steps:6,body:`<h2>Как ищем размер одной секунды?</h2><div class="product-explainer">${show(1,'<strong>ν</strong><p>Количество измерений<br>за секунду</p>')}${show(2,'<span class="operator">×</span><strong>i</strong><p>Бит в каждом<br>измерении</p>')}${show(3,'<span class="operator">=</span><strong>I<sub>1 с</sub></strong><p>Объём одной секунды<br>в битах</p>')}</div>${show(4,'<p class="large-copy">Количество измерений умножаем на размер каждого измерения.</p>')}${show(5,'<p class="large-copy"><strong>t</strong> — продолжительность звукозаписи. Измеряется в <strong>секундах</strong>.</p>')}${show(6,f('I = ν · i · t')+'<p class="small">Объём записи одного канала в битах, без сжатия и заголовков.</p>')}`},
{title:'Каналы звука',group:'Формула',steps:5,body:`<h2>Каналы звука</h2><div class="channel-grid">${show(1,channelCard(1,'Моно'))}${show(2,channelCard(2,'Стерео'))}${show(3,channelCard(4,'Квадро'))}</div>${show(4,'<p class="large-copy"><strong>Стерео → × 2.</strong> Два звуковых потока записываются параллельно.</p>')}${show(5,'<p class="large-copy"><strong>Квадро → × 4.</strong> Четыре звуковых потока записываются параллельно.</p>')}`},
{title:'Объём звукового файла',group:'Формула',steps:5,body:`<h2>Объём звукового файла</h2><p class="lead">Четыре множителя — одна формула.</p><div class="final-formula">I = ${show(1,'k','factor')}${show(2,'· ν','factor')}${show(3,'· i','factor')}${show(4,'· t','factor')}</div><div class="factor-grid">${show(1,'<b>k</b><p>Число каналов</p>')}${show(2,'<b>ν</b><p>Частота дискретизации<br>в Гц</p>')}${show(3,'<b>i</b><p>Глубина кодирования<br>в битах</p>')}${show(4,'<b>t</b><p>Продолжительность звукозаписи<br>в секундах</p>')}</div>${show(5,'<p class="large-copy">Получаем <strong>объём в битах</strong>.</p>')}`},
{title:'Задача № 31114: объём сообщения',group:'Практика',type:'storage-worked',steps:6,body:storageLesson()},
{title:'Округление: только целую часть',group:'Практика',type:'rounding',steps:3,body:roundingLesson()},
{title:'Разбор: повторная запись',group:'Практика',type:'comparison',steps:19,body:comparisonLesson()},
{title:'Пульт: меняем параметры записи',group:'Практика',type:'mixer',steps:0,body:mixerLesson()},
{title:'Проверь себя: 6 вопросов',group:'Закрепление',type:'sound-quiz',steps:6,body:'<div class="sound-quiz-host"></div>'},
{title:'Шпаргалка: звук',group:'Закрепление',type:'sound-cheatsheet',steps:0,body:soundCheatsheet()},
{title:'Разбор: время передачи',group:'Практика',type:'transmission-worked',steps:22,body:transmissionLesson()}
];
let current=1,buildStep=0;
$('#outline').innerHTML=slides.map((s,i)=>`${i===0||slides[i-1].group!==s.group?`<div class="group-name">${s.group}</div>`:''}<a href="#${i+1}" data-slide="${i+1}"><span>${String(i+1).padStart(2,'0')}</span>${s.title}</a>`).join('');
function resize(){const stage=$('#stage');$('#slide-frame').style.setProperty('--scale',matchMedia('(max-width:700px)').matches?1:Math.min(stage.clientWidth/1360,stage.clientHeight/800));}
new ResizeObserver(resize).observe($('#stage'));
function toggleMenu(open){document.body.classList.toggle('menu-open',open);$('#sidebar').hidden=!open;$('#sidebar').inert=!open;$('#menu').setAttribute('aria-expanded',String(open));$('#menu').title=$('#menu').ariaLabel=open?'Скрыть боковое меню':'Показать боковое меню';resize();}
$('#menu').onclick=()=>toggleMenu(!document.body.classList.contains('menu-open'));
$('#outline').onclick=e=>{if(e.target.closest('a')&&matchMedia('(max-width:700px)').matches)toggleMenu(false);};
function update(){const s=slides[current-1],el=$('#slide');const previous=Number(el.dataset.step);el.dataset.step=buildStep;if(((s.type==='storage-worked'&&buildStep===6)||(s.type==='comparison'&&buildStep===19)||(s.type==='transmission-worked'&&buildStep===22)||(s.type==='sound-quiz'&&buildStep===6&&soundScore()===6))&&previous!==buildStep)celebrate();el.querySelectorAll('[data-step]').forEach(e=>{const visible=buildStep>=+e.dataset.step;e.classList.toggle('visible',visible);e.setAttribute('aria-hidden',String(!visible));});el.classList.toggle('problem-at-top',['worked-audio','comparison','transmission-worked'].includes(s.type)&&buildStep>=8);el.querySelectorAll('[data-given]').forEach(e=>e.classList.toggle('highlight',buildStep>=+e.dataset.given));el.querySelectorAll('[data-factor]').forEach(e=>e.classList.toggle('highlight',buildStep>=({t:10,k:11,nu:12,i:13}[e.dataset.factor])));el.querySelectorAll('.find-target').forEach(e=>e.classList.toggle('find-marked',buildStep>=(s.type==='transmission-worked'?16:14)));el.querySelectorAll('.ratio-cancel').forEach(e=>e.classList.toggle('cancelled',buildStep>=18));if(s.type==='storage-worked')el.querySelector('.case-heading').innerHTML=storageTitles[buildStep];if(s.type==='rounding')el.querySelector('.case-heading').innerHTML=roundingTitles[buildStep];if(s.type==='sound-quiz')renderSoundQuiz();$('#next').innerHTML=s.type==='sound-quiz'&&buildStep<6?(buildStep===5?'Показать результат':'Следующий вопрос'):'Далее <span>→</span>';$('#prev').disabled=current===1&&buildStep===0;$('#next').disabled=current===slides.length&&buildStep===s.steps;$('#status').textContent=s.type==='sound-quiz'?(buildStep===6?`Результат: ${soundScore()} из 6 правильно`:soundQuestions[buildStep].title):s.title;}
function stylizeVolumes(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];
 while(walker.nextNode()){const node=walker.currentNode;if(/\bI\b/.test(node.textContent)&&!node.parentElement.closest('svg,.volume-symbol'))nodes.push(node);}
 for(const node of nodes){const fragment=document.createDocumentFragment();node.textContent.split(/(\bI\b)/).forEach(part=>{if(part!=='I'){fragment.append(document.createTextNode(part));return;}const symbol=document.createElement('span');symbol.className='volume-symbol';symbol.setAttribute('role','img');symbol.setAttribute('aria-label','I');symbol.innerHTML='<svg viewBox="0 0 32 44" aria-hidden="true"><path d="M5 5H27M16 5V39M5 39H27" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>';fragment.append(symbol);});node.replaceWith(fragment);}
}
function stylizeNu(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode())if(walker.currentNode.textContent.includes('ν')&&!walker.currentNode.parentElement.closest('svg,.nu-symbol'))nodes.push(walker.currentNode);
 for(const node of nodes){const fragment=document.createDocumentFragment();node.textContent.split('ν').forEach((part,i)=>{if(i){const symbol=document.createElement('span');symbol.className='nu-symbol';symbol.setAttribute('role','img');symbol.setAttribute('aria-label','ню');symbol.innerHTML='<svg viewBox="0 0 34 48" aria-hidden="true"><path d="M12 5C29 7 31 19 25 31C22 37 17 42 14 44C10 39 9 31 6 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';fragment.append(symbol);}fragment.append(document.createTextNode(part));});node.replaceWith(fragment);}
}
function celebrate(){
 document.querySelectorAll('.confetti-burst').forEach(e=>e.remove());
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const layer=document.createElement('div');layer.className='confetti-burst';layer.setAttribute('aria-hidden','true');document.body.append(layer);
 const colors=['#E46E50','#244D85','#23804c','#e4b550','#f29e80'],width=innerWidth,height=innerHeight,animations=[];
 for(let side=0;side<2;side++)for(let i=0;i<80;i++){
  const piece=document.createElement('span'),spread=((i*37)%79)/79,lift=((i*53)%83)/83;
  piece.className='confetti';Object.assign(piece.style,{background:colors[i%colors.length],left:side?'100%':'0',top:'72%',width:(10+i%7)+'px',height:(14+i%11)+'px',borderRadius:i%4===0?'50%':'2px'});layer.append(piece);
  const distance=width*(.25+.5*spread)*(side?-1:1),rotation=(side?-1:1)*(450+i*17),frames=[];
  for(let n=0;n<=24;n++){const t=n/24,x=distance*(1-(1-t)**2),y=height*(-(1.5+.8*lift)*t+2.3*t*t);frames.push({transform:`translate(${x}px,${y}px) rotate(${rotation*t}deg)`,opacity:t<.06?t/.06:t>.8?(1-t)/.2:1,offset:t});}
  animations.push(piece.animate(frames,{duration:1400+i%8*50,delay:i%7*8,easing:'linear',fill:'both'}).finished.catch(()=>{}));
 }
 Promise.all(animations).then(()=>layer.remove());
}
function captureSlide(){
 document.querySelectorAll('.slide-outgoing').forEach(e=>e.remove());
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return null;
 const source=document.querySelector('#slide'),copy=source.cloneNode(true);copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));copy.classList.add('slide-outgoing');copy.setAttribute('aria-hidden','true');copy.inert=true;source.parentElement.append(copy);copy.scrollTop=source.scrollTop;return copy;
}
function fadeSlides(copy,shared){
 if(!copy)return;
 if(shared)copy.querySelectorAll('.sound-wave,.bird-grid').forEach(e=>e.style.visibility='hidden');
 copy.animate([{opacity:1},{opacity:0}],{duration:550,easing:'ease-in-out',fill:'forwards'}).finished.catch(()=>{}).finally(()=>copy.remove());
 document.querySelector('#slide').animate([{opacity:0},{opacity:1}],{duration:550,easing:'ease-in-out'});
}
function render(){document.querySelectorAll('.confetti-burst').forEach(e=>e.remove());const match=location.hash.match(/^#(\d+)(?:\.(\d+))?$/);let n=match?Number(match[1]):1;if(n<1||n>slides.length)n=1;current=n;const s=slides[n-1];buildStep=Math.min(Number(match?.[2]||0),s.steps);const hash=`#${n}${buildStep?'.'+buildStep:''}`;if(location.hash!==hash)history.replaceState(null,'',hash);$('#slide').className=`audio-slide audio-${s.type||'theory'}`;$('#slide').innerHTML=s.body;stylizeVolumes($('#slide'));stylizeNu($('#slide'));if(s.type==='signal'){const slider=$('.sampling-slider');slider.addEventListener('input',e=>paintSamples(e.target.value));paintSamples(slider.value);}if(s.type==='mixer')paintMixer();$('#slide').scrollTop=0;document.title=`${s.title} · Задание 7 — звук`;document.querySelectorAll('#outline a').forEach(a=>{const active=+a.dataset.slide===n;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});update();resize();}
function go(delta){const s=slides[current-1];if((delta>0&&buildStep<s.steps)||(delta<0&&buildStep>0)){buildStep+=delta;history.replaceState(null,'',`#${current}${buildStep?'.'+buildStep:''}`);update();if(s.type==='sound-quiz')$('#slide').scrollTop=0;return;}const next=current+delta;if(next>0&&next<=slides.length){const step=delta<0?slides[next-1].steps:0;location.hash=`${next}${step?'.'+step:''}`;}}
function replayCapacity(){const slide=$('#slide');slide.querySelectorAll('.capacity-card').forEach(card=>card.getAnimations({subtree:true}).forEach(animation=>{animation.currentTime=0;animation.play();}));}
$('#next').onclick=()=>go(1);$('#prev').onclick=()=>go(-1);$('#slide').onclick=e=>{const button=e.target.closest('button');if(button?.matches('.mixer-option,.mixer-preset,.mixer-reset')){handleMixer(button);return;}if(button?.matches('[data-sound-answer]')){answerSoundQuestion(button.dataset.soundAnswer);return;}if(button?.matches('.sound-quiz-restart')){restartSoundQuiz();return;}if(slides[current-1].type==='sound-quiz')return;if(e.target.closest('.capacity-replay')){replayCapacity();return;}if(!e.target.closest('a,button')&&buildStep<slides[current-1].steps)go(1);};
let flight=null;
window.addEventListener('hashchange',()=>{if(flight){flight.cancel();flight=null;}const next=Number(location.hash.slice(1).split('.')[0]);const old=((current===1&&next===2)||(current===2&&next===1))&&!matchMedia('(prefers-reduced-motion: reduce)').matches?$('.sound-wave'):null;let copy,box;if(old){box=old.getBoundingClientRect();copy=old.cloneNode(true);copy.classList.add('flying-wave');Object.assign(copy.style,{position:'fixed',left:box.x+'px',top:box.y+'px',width:box.width+'px',height:box.height+'px',zIndex:100,pointerEvents:'none',transformOrigin:'0 0'});old.querySelectorAll('.wave-axis,.wave-second').forEach((g,i)=>{copy.querySelectorAll('.wave-axis,.wave-second')[i].style.opacity=getComputedStyle(g).opacity;});document.body.append(copy);}const outgoing=captureSlide();render();fadeSlides(outgoing,!!copy);if(copy){const target=$('.sound-wave'),end=target.getBoundingClientRect();target.style.visibility='hidden';copy.querySelectorAll('.wave-axis,.wave-second').forEach((g,i)=>g.animate([{opacity:getComputedStyle(g).opacity},{opacity:getComputedStyle(target.querySelectorAll('.wave-axis,.wave-second')[i]).opacity}],{duration:900,fill:'forwards'}));flight=copy.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${end.x-box.x}px,${end.y-box.y}px) scale(${end.width/box.width},${end.height/box.height})`}],{duration:900,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});flight.finished.catch(()=>{}).finally(()=>{copy.remove();target.style.visibility='';});}});
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,select,textarea'))return;if(e.key==='ArrowRight'){e.preventDefault();go(1);}if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}if(e.key==='Escape')toggleMenu(false);});
render();
