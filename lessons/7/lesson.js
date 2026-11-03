'use strict';
const row=(a,b)=>`<div class="row"><b>${a}</b><span>${b}</span></div>`;
const note=(s,orange=false)=>`<div class="note ${orange?'orange':''}">${s}</div>`;
const formula=s=>`<div class="formula-box"><div class="formula">${s}</div></div>`;
const steps=items=>`<ol class="steps">${items.map(x=>`<li>${x}</li>`).join('')}</ol>`;
const answer=s=>`<div class="answer-line"><span>ОТВЕТ</span>${s}</div>`;
const panel=(title,body)=>`<div class="panel"><h3>${title}</h3>${body}</div>`;
const quiz=(id,title,question,unit,value,hint,solution)=>({group:'Практика',title,type:'quiz',quiz:{id,value},body:`<div class="mini-label">Самостоятельно</div><p class="question">${question}</p><form class="quiz-form" data-answer="${value}"><label class="answer-label" for="answer-${id}">Ваш ответ · ${unit}</label><div class="input-row"><input id="answer-${id}" name="answer" type="text" inputmode="decimal" autocomplete="off" placeholder="Введите число" aria-describedby="feedback-${id}"><button class="primary" type="submit">Проверить →</button></div><p id="feedback-${id}" class="feedback" aria-live="polite"></p></form><details><summary>Нужна подсказка</summary><p>${hint}</p></details><details><summary>Показать решение</summary><p>${solution}</p></details>`});
// Editable pixel diagram reconstructed from the supplied bird reference.
function bird(letters=false){
 const colors={B:'#244D85',W:'#EAE7E4',G:'#a8abb0',Y:'#E46E50',K:'#30343B'};
 const map=Array.from({length:26},()=>Array(26).fill('B'));
 const bands={6:[16,18],7:[15,19],8:[15,19],9:[15,19],10:[15,18],11:[13,18],12:[11,19],13:[9,19],14:[8,19],15:[6,19],16:[4,18],17:[5,17],18:[9,15]};
 for(const [y,[a,b]] of Object.entries(bands))for(let x=a;x<=b;x++)map[y][x]='W';
 for(const [y,a,b] of [[13,11,13],[14,9,13],[15,8,12],[16,8,11]])for(let x=a;x<=b;x++)map[y][x]='G';
 map[8][18]='K';for(const [y,a,b] of [[8,20,21],[9,20,22],[19,12,12],[19,14,14],[20,12,12],[20,14,14],[21,12,15]])for(let x=a;x<=b;x++)map[y][x]='Y';
 let cells='',labels='';map.forEach((r,y)=>r.forEach((color,x)=>{cells+=`<rect x="${x*20}" y="${y*20}" width="20" height="20" fill="${colors[color]}" stroke="#30343B" stroke-width=".65"/>`;if(letters)labels+=`<text x="${x*20+10}" y="${y*20+14}" fill="${color==='B'||color==='K'?'#ffffff':'#30343B'}">i</text>`;}));
 return `<svg class="bird-grid" viewBox="0 0 520 520" role="img" aria-label="Пиксельная птица на синем фоне, сетка 26 на 26">${cells}${letters?`<g class="pixel-letters build-in" data-reveal="3" text-anchor="middle" font-family="Georgia,serif" font-style="normal" font-size="14">${labels}</g>`:''}</svg>`;
}
const reveal=(n,html,cls='')=>`<div class="build-in ${cls}" data-reveal="${n}">${html}</div>`;
function diagram(){return `<h2 class="diagram-title">Считаем объём изображения</h2><div class="formula-demo" id="formula-demo"><div class="demo-formula">I = <span data-factor="a">a</span> · <span data-factor="b">b</span> · <span data-factor="i">i</span></div><div class="factor-definitions">${reveal(1,'<b>a</b> — кол-во пикселей по ширине')}${reveal(2,'<b>b</b> — кол-во пикселей по длине')}</div><div class="diagram-picture"><div class="width-brace build-in" data-reveal="1"><span><b>a</b> — ширина</span><svg viewBox="0 0 520 28" preserveAspectRatio="none" aria-hidden="true"><path d="M1 27 Q1 14 18 14 H240 Q260 14 260 1 Q260 14 280 14 H502 Q519 14 519 27"/></svg></div>${bird(true)}<div class="height-brace build-in" data-reveal="2"><svg viewBox="0 0 28 520" preserveAspectRatio="none" aria-hidden="true"><path d="M1 1 Q14 1 14 18 V240 Q14 260 27 260 Q14 260 14 280 V502 Q14 519 1 519"/></svg><span><b>b</b> — длина</span></div></div>${reveal(3,'<b>i</b> — количество <strong>бит</strong> на пиксель','pixel-definition')}${reveal(4,`<div class="i-origin">i</div><svg class="i-arrows" viewBox="0 0 450 100" aria-hidden="true"><defs><marker id="i-tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><g fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#i-tip)"><path d="M225 2C225 40 55 25 55 85"/><path d="M225 2V85"/><path d="M225 2C225 40 395 25 395 85"/></g></svg><div class="i-labels"><span>Цвет</span><span>Прозрачность</span><span>Доп. инфа<br>и т. д.</span></div><p class="i-note">Состав данных пикселя зависит от формата и условия задачи.</p>`,'i-breakdown')}</div>`;}
function bits(){return `<div class="bits-stage"><div class="byte-cluster">${reveal(1,`<div class="bit-caption">Один кубик — один бит: 0 или 1</div><div class="bit-cubes">${[0,1,0,0,1,1,0,1].map(v=>`<span class="bit-cube">${v}</span>`).join('')}</div>`,'bits-group')}${reveal(2,`<div class="byte-brace"><svg viewBox="0 0 940 35" preserveAspectRatio="none" aria-hidden="true"><path d="M1 1Q1 18 20 18H450Q470 18 470 34Q470 18 490 18H920Q939 18 939 1"/></svg><div><b>8 бит</b> = <strong>1 байт</strong></div></div>`,'byte-group')}</div><div class="byte-unit-list">${[['1 байт','8 бит'],['1 Кбайт','1024 байта'],['1 Мбайт','1024 Кбайт'],['1 Гбайт','1024 Мбайт']].map(([a,b],i)=>reveal(i+3,`<b>${a}</b><span>=</span><span>${b.replace(/^(\d+)/, '<strong>$1</strong>')}</span>`,'byte-unit-row')).join('')}</div></div>`;}
function unitDiagram(){
 const node=(x,text,n)=>`<g class="build-in" data-reveal="${n}"><text x="${x}" y="115" text-anchor="middle" class="unit-node">${text}</text></g>`;
 const arrow=(from,to,number,n,back=false)=>{const mid=(from+to)/2;return `<g class="build-in conversion-arrow" data-reveal="${n}"><path d="M${from} ${back?136:80} Q${mid} ${back?206:6} ${to} ${back?136:80}" marker-end="url(#unit-tip)"/><text x="${mid}" y="${back?210:24}" text-anchor="middle">${back?'×':'÷'} ${number}</text></g>`;};
 return `<svg class="unit-diagram" viewBox="0 0 1080 235" role="img" aria-label="Биты делим на 8, затем дважды на 1024 до Мбайт. В обратную сторону умножаем."><defs><marker id="unit-tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#E46E50"/></marker></defs>${node(950,'бит',1)}${node(670,'байт',2)}${node(390,'Кбайт',3)}${node(110,'Мбайт',4)}${arrow(925,695,8,2)}${arrow(645,415,1024,3)}${arrow(365,135,1024,4)}${arrow(135,365,1024,5,true)}${arrow(415,645,1024,6,true)}${arrow(695,925,8,7,true)}</svg>`;
}
function conversions(){return `<div class="conversion-scheme">${unitDiagram()}</div><div class="conversion-examples"><div class="conversion-example">${reveal(8,'<h3>Из бит в Кбайты</h3><div class="conversion-start">65 536 бит</div>')}${reveal(9,'<span>÷ <b>8</b></span><span>= <strong>8192 байта</strong></span>','conversion-line')}${reveal(10,'<span>÷ <b>1024</b></span><span>= <strong>8 Кбайт</strong></span>','conversion-line')}</div><div class="conversion-example">${reveal(11,'<h3>Из Мбайт в биты</h3><div class="conversion-start">2 Мбайт</div>')}${reveal(12,'<span>× <b>1024</b></span><span>= <strong>2048 Кбайт</strong></span>','conversion-line')}${reveal(13,'<span>× <b>1024</b></span><span>= <strong>2 097 152 байта</strong></span>','conversion-line')}${reveal(14,'<span>× <b>8</b></span><span>= <strong>16 777 216 бит</strong></span>','conversion-line')}</div></div>`;}
function paletteLesson(){return `<div class="palette-layout"><div class="combinations-side"><div class="power-formula">2<sup>i</sup></div>${reveal(1,`<p class="combination-definition"><b>2<sup>i</sup></b> — количество двоичных комбинаций</p><label class="lab-control">i = <select id="combinations-bits" aria-label="Количество бит для двоичных комбинаций"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label><div id="binary-codes" class="binary-codes"></div><p id="binary-count" class="small" aria-live="polite"></p>`)}</div>${reveal(2,`<p class="palette-key">Находим <strong>минимальное целое i</strong>, при котором сможем закодировать <strong>N цветов</strong></p><div class="palette-inequality">2<sup>i</sup> ≥ N</div><div class="panel"><div class="mini-label">Попробуйте изменить глубину</div><label class="lab-control">Глубина <select id="palette-bits"><option value="1">1 бит</option><option value="2">2 бита</option><option value="3">3 бита</option><option value="4">4 бита</option></select></label><div id="palette" class="palette"></div><div id="palette-info" class="small" aria-live="polite"></div></div>`,'palette-side')}</div>`;}
function workedExample(){
 const part=(n,html,cls='')=>`<span class="build-in calculation-part ${cls}" data-reveal="${n}">${html}</span>`;
 const label=(n,text)=>`<span class="solution-label"><span class="solution-number">${n}</span><span>${text}</span></span>`;
 return `<div class="worked-intro"><h2>Считаем объём картинки</h2><div class="problem-card"><p class="worked-question">Изображение размером <span data-condition="size">512 × 256 пикселей</span> использует <span data-condition="colors">64 цвета</span>. Цвет каждого пикселя кодируется минимальным одинаковым числом бит. Коды идут подряд, без сжатия и заголовка. Найдите <span data-condition="target">объём в Кбайтах</span>.</p></div></div><div class="worked-solution"><div class="worked-equations"><div class="equation-column">${reveal(5,'I = <span data-known="size">a</span> · <span data-known="size">b</span> · <span data-unknown="i">i</span>','worked-formula')}${reveal(6,'a = <b>512</b>, &nbsp; b = <b>256</b>','equation-givens given-size')}</div><div class="equation-column">${reveal(5,'2<sup><span data-unknown="i">i</span></sup> ≥ <span data-known="colors">N</span>','worked-formula')}${reveal(7,'N = <b>64</b>','equation-givens given-colors')}</div></div>${reveal(8,`${label(1,'Находим i')}<div class="calculation">2<sup>i</sup> ≥ 64 &nbsp; → &nbsp; i = <strong>6</strong>${part(9,'&nbsp;бит','unit-accent depth-unit')}</div>`,'solution-line find-depth')}${reveal(10,`${label(2,'Объём в битах')}<div class="calculation"><span>I = a · b · i</span>${part(11,' = 512 · 256 · 6','volume-substitution')}${part(12,' = <strong>786 432</strong>','volume-result')}${part(13,'&nbsp;бит','unit-accent volume-unit')}</div>`,'solution-line calculate-volume')}${reveal(14,`${label(3,'Сначала в байты')}<div class="calculation">786 432 <span class="unit-accent">бита</span> <b class="conversion-op">÷ 8</b> = <strong>98 304</strong> <span class="unit-accent">байта</span></div>`,'solution-line to-bytes')}${reveal(15,`${label(4,'Теперь в Кбайты')}<div class="calculation">98 304 <span class="unit-accent">байта</span> <b class="conversion-op">÷ 1024</b> = <strong>96</strong> <span class="unit-accent">Кбайт</span></div>`,'solution-line to-kbytes')}${reveal(16,'Ответ: <strong>96</strong>','plain-answer')}</div>`;
}
function workedColors(){
 const label=(n,text)=>`<span class="solution-label"><span class="solution-number">${n}</span><span>${text}</span></span>`;
 return `<div class="worked-intro"><h2>Находим количество цветов</h2><div class="problem-card"><p class="worked-question">Для изображения <span data-condition="size">640 × 480 пикселей</span> выделено не более <span data-condition="memory">300 Кбайт</span>. Сжатия и заголовка нет, коды пикселей идут подряд и имеют одинаковую длину. Каково <span data-condition="target">максимальное число цветов</span>?</p></div></div><div class="worked-solution"><div class="worked-equations"><div class="equation-column">${reveal(5,'I = <span data-known="size">a</span> · <span data-known="size">b</span> · <span data-unknown="i">i</span>','worked-formula')}${reveal(6,'a = <b>640</b>, &nbsp; b = <b>480</b>','equation-givens given-size')}</div><div class="equation-column">${reveal(5,'N = 2<sup><span data-unknown="i">i</span></sup>','worked-formula')}${reveal(7,'I ≤ <b>300 Кбайт</b>','equation-givens given-colors')}</div></div>${reveal(8,`${label(1,'Переводим в биты')}<div class="calculation">300 · 8192 = <strong>2 457 600</strong> <span class="unit-accent">бит</span></div>`,'solution-line')}${reveal(9,`${label(2,'Находим i')}<div class="calculation">2 457 600 ÷ (640 · 480) = <strong>8 бит</strong> на пиксель</div>`,'solution-line')}${reveal(10,`${label(3,'Находим палитру')}<div class="calculation">N = 2<sup>8</sup> = <strong>256 цветов</strong></div>`,'solution-line')}${reveal(11,'Ответ: <strong>256</strong>','plain-answer')}</div>`;
}
function percentLesson(){
 const frac=(top,bottom)=>`<span class="math-fraction"><span>${top}</span><span>${bottom}</span></span>`;
 const part=(n,html,cls='')=>`<span class="build-in ${cls}" data-reveal="${n}">${html}</span>`;
 const num=n=>`<span class="percent-step-number">${n}</span>`;
 const equation=(n,until,html)=>`<div class="build-in percent-equation-stage" data-reveal="${n}" data-until="${until}">${html}</div>`;
 return `<div class="percent-intro"><h2>Проценты · количество цветов</h2><div class="problem-card"><p class="worked-question">Для растрового изображения <span data-pct="size">640 × 480 пикселей</span> отведено <span data-pct="memory">230 Кбайт</span>. <span data-pct="compressed">При сохранении данные сжимаются</span>: итоговый файл становится <span data-pct="less">на 25% меньше</span> <span data-pct="original">ИСХОДНОГО</span>. Коды пикселей имеют одинаковую длину и записаны подряд. Какое максимальное <span data-pct="target">количество цветов</span> можно использовать?</p></div></div><div class="percent-explanation">${reveal(8,'<span class="percent-caption">Мы знаем, что</span><div class="percent-formula">I'+part(9,'<small class="original-marker">ориг.</small>')+' = a · b · i</div>','percent-known')}<div class="percent-misconception">${reveal(10,'<span class="wrong-equation">230 Кбайт = 640 · 480 · i</span>','percent-wrong')}${reveal(12,'В формуле — <b>исходный</b> объём. 230 Кбайт — объём <b>сжатого</b> файла.','percent-correction')}</div>${reveal(13,'<b>Правило:</b> за 100% берём то, с чем сравниваем.','percent-rule')}</div><div class="percent-analysis"><div class="percent-table-wrap"><table class="percent-table"><thead><tr><th></th><th>I</th><th>%</th></tr></thead><tbody><tr><th>Сжатый</th><td>${part(18,'230 Кбайт')}</td><td>${part(17,'75%')}</td></tr><tr><th>Оригинал</th><td>${part(19,'X')}</td><td>${part(16,'100%')}</td></tr></tbody></table><svg class="percent-cross build-in" data-reveal="20" viewBox="0 0 600 210" preserveAspectRatio="none" aria-hidden="true"><path d="M300 48 L500 165 M500 48 L300 165"/></svg></div><div class="percent-calculations">${reveal(22,`${num(1)}X = ${frac('230 · 100','75')} Кбайт`,'percent-line percent-x')} ${reveal(23,`${num(2)}<div class="percent-equation-slot">${equation(23,23,'I<sub>ориг.</sub> = a · b · i')}${equation(24,31,`I ориг. = ${frac('230 · 100','75')} <b class="bits-multiplier">· 8 · 1024</b> <span class="conversion-caption">переводим в биты</span>`)}${equation(25,31,`<span class="divide-source">640 · 480</span> · i ≤ ${frac('230 · 100 · 8 · 1024','75')} ${part(26,' | ÷ (640 · 480)','divide-hint')}`)}</div>`,'percent-line percent-solution-two')}${reveal(27,`${num(3)}i ≤ ${frac('230 · 100 · 8 · 1024','75 · <span class="divide-target">640 · 480</span>')} ≈ <strong>8,1778</strong>${part(28,'При i = 9 сжатое изображение займёт 253,125 Кбайт — больше выделенных 230 Кбайт.','nine-bit-note')}`,'percent-line percent-bound')}${reveal(29,`${num(4)}i<sub>max</sub> = <strong>8 бит</strong>`,'percent-line')}${reveal(30,`${num(5)}N = 2<sup>8</sup> = <strong>256 цветов</strong>`,'percent-line')}${reveal(31,'Ответ: <strong>256</strong>','percent-answer')}</div></div>`;
}
let slides=[
{group:'Начало',title:'О чём этот урок',type:'intro',body:`<div class="hero"><div class="hero-art">${bird()}</div><div class="hero-text"><h1>Графика.<br><em>Всё в битах.</em></h1><p class="lead">Разберём задание №7 ЕГЭ:<br>как посчитать объём изображения.</p><a class="primary" href="#2">Начать урок <span>→</span></a></div></div>`},
{group:'Графика',title:'Считаем объём изображения',type:'diagram',steps:4,bare:true,body:diagram()},
{group:'Графика',title:'Биты, байты и единицы',type:'bits',steps:6,body:bits()},
{group:'Графика',title:'Учимся переводить',type:'conversion',steps:14,body:conversions()},
{group:'Графика',title:'Пиксель и палитра',type:'palette',steps:2,bare:true,body:paletteLesson()},
{group:'Графика',title:'Разбор: размер картинки',type:'worked',steps:16,bare:true,body:workedExample()},
{group:'Графика',title:'Разбор: сколько цветов',type:'worked',variant:'colors',steps:11,bare:true,body:workedColors()},
{group:'Передача данных',title:'Скорость и время',body:`<p class="lead">Объём файла связывает задачи на кодирование с задачами на передачу данных.</p>${formula('t<sub>передачи</sub> = I / v')}<div class="grid2">${panel('Пример','<p>Изображение размером <b>12 Мбайт</b> передаётся со скоростью <b>256 Кбайт/с</b>.</p><div class="formula">12 · 1024 / 256 = 48 с</div>')}${panel('Проверка единиц','<p>Если скорость в бит/с, объём должен быть в битах. Если скорость в Кбайт/с — объём в Кбайтах.</p><p class="small">Объём файла и скорость должны быть выражены в согласованных единицах.</p>')}</div>${note('Не добавляем задержки и служебный трафик, если они не указаны в задаче.')}`},
{group:'Передача данных',title:'Сжатие и заголовки',body:`<p class="lead">Сначала считаем исходные данные, затем применяем условия хранения или передачи.</p><div class="rows">${row('Уменьшили объём на 25%','Осталось 75% → умножаем на 0,75')}${row('Сжали до 25% исходного','Осталось 25% → умножаем на 0,25')}${row('Уменьшили в 4 раза','Делим исходный объём на 4')}</div><div class="panel"><h3>Пример: 10 изображений</h3><p>Данные каждого изображения занимают 200 Кбайт. Их объём уменьшили на 25%, после чего добавили к каждому файлу заголовок 4 Кбайт.</p><div class="formula">10 · (200 · 0,75 + 4) = 1540 <small>Кбайт</small></div></div>${note('Заголовок добавляем в том порядке, который задан условием. Не считаем его сжатым автоматически.',true)}`},
{group:'Передача данных',title:'Алгоритм решения',body:`<p class="lead">Один маршрут для большинства задач №7.</p>${steps(['<b>Определите, что кодируется.</b><small>Изображение: a · b · i. Найдите ширину, длину и глубину цвета.</small>','<b>Переведите входные величины.</b><small>Проверьте биты, байты и Кбайты. Размеры изображения должны быть в пикселях.</small>','<b>Вычислите объём данных.</b><small>Сохраняйте точные значения до последнего шага.</small>','<b>Учтите дополнительные условия.</b><small>Число файлов, сжатие, заголовки, скорость передачи.</small>','<b>Ответьте именно на вопрос.</b><small>Переведите в нужные единицы, выберите направление округления.</small>'])}`},
{group:'Передача данных',title:'Частые ошибки',body:`<div class="rows">${row('«256 цветов → 256 бит»','Нет: 256 = 2⁸ → 8 бит')}${row('«1 Кбайт = 1000 байт»','В этих задачах: 1 Кбайт = 1024 байта')}${row('«20 цветов → 4 бита»','4 бит мало: нужны 5 бит')}${row('«Любую дробь округляем вниз»','Направление зависит от вопроса')}</div>${note('<b>Быстрая самопроверка:</b> больше пикселей или бит на пиксель — больше объём. Если результат ведёт себя наоборот, проверьте формулу.')}`},
quiz(15,'Практика: изображение','Изображение <b>1024 × 512</b> пикселей имеет палитру <b>16 цветов</b>. Каждый пиксель кодируется минимальным одинаковым числом бит, коды записаны подряд. Сжатия и заголовка нет. Найдите объём в Кбайтах.','Кбайт',256,'Сначала найдите i из равенства 16 = 2ⁱ.','i = 4 бита. I = 1024 · 512 · 4 / 8192 = <b>256 Кбайт</b>.'),
quiz(16,'Практика: палитра','Для картинки <b>320 × 256</b> пикселей выделено <b>100 Кбайт</b>. Коды всех пикселей одинаковой длины и записаны подряд; сжатия и заголовка нет. Какое максимальное число цветов можно использовать?','цветов',1024,'Переведите 100 Кбайт в биты и разделите на количество пикселей.','i = ⌊100 · 8192 / (320 · 256)⌋ = 10 бит. N = 2¹⁰ = <b>1024 цвета</b>.'),
quiz(17,'Практика: передача','Объём файла с изображением <b>8 Мбайт</b> уменьшили на <b>25%</b>. Сжатый файл передают по каналу со скоростью <b>128 Кбайт/с</b>. Сколько секунд займёт передача? Служебный трафик не учитывается.','секунд',48,'После сжатия осталось 75% исходного объёма.','Осталось 8 · 0,75 = 6 Мбайт. t = 6 · 1024 / 128 = <b>48 секунд</b>.'),
{group:'Итоги',title:'Шпаргалка',type:'summary',body:`<p class="lead">Главное — выбрать формулу и не потерять единицы.</p><div class="grid2">${panel('Изображение','<div class="formula">I = a · b · i</div><p class="small">N<sub>max</sub> = 2ⁱ при известной глубине</p>')}${panel('Палитра','<div class="formula">2<sup>i</sup> ≥ N</div><p class="small">N — число цветов<br>i — число бит на пиксель</p>')}</div>`}
];
// Remove the slides identified by their original positions, before rebuilding navigation.
slides=slides.filter((_,i)=>![8,9,10,12,13,14].includes(i+1));
slides.splice(7,0,{group:'Проценты',title:'Сжатие изображения',type:'percent',steps:31,bare:true,body:percentLesson()});
const $=s=>document.querySelector(s);
let current=1,buildStep=0,pendingStep=0,state={};
try{state=JSON.parse(localStorage.getItem('informatics-7-graphics-v2')||'{}');if(!state||Array.isArray(state)||typeof state!=='object')state={};}catch{}
function persist(){try{localStorage.setItem('informatics-7-graphics-v2',JSON.stringify(state));}catch{}}
let group='';$('#outline').innerHTML=slides.map((s,i)=>{let heading='';if(group!==s.group){group=s.group;heading=`<div class="group-name">${group}</div>`;}return `${heading}<a href="#${i+1}" data-slide="${i+1}"><span>${String(i+1).padStart(2,'0')}</span>${s.title}</a>`;}).join('');
function resize(){const stage=$('#stage');const mobile=matchMedia('(max-width:700px)').matches;$('#slide-frame').style.setProperty('--scale',mobile?1:Math.min(stage.clientWidth/1360,stage.clientHeight/800));}
new ResizeObserver(resize).observe($('#stage'));
function toggleMenu(open){document.body.classList.toggle('menu-open',open);$('#sidebar').hidden=!open;$('#sidebar').inert=!open;$('#menu').setAttribute('aria-expanded',String(open));const label=open?'Скрыть боковое меню':'Показать боковое меню';$('#menu').setAttribute('aria-label',label);$('#menu').title=label;try{localStorage.setItem('lesson7-sidebar',String(open));}catch{}resize();}
$('#menu').addEventListener('click',()=>toggleMenu(!document.body.classList.contains('menu-open')));
$('#outline').addEventListener('click',e=>{if(e.target.closest('a')&&matchMedia('(max-width:700px)').matches)toggleMenu(false);});
function stylizeVolumes(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];
 while(walker.nextNode()){const node=walker.currentNode;if(/\bI\b/.test(node.textContent)&&!node.parentElement.closest('svg,.volume-symbol'))nodes.push(node);}
 for(const node of nodes){const fragment=document.createDocumentFragment();node.textContent.split(/(\bI\b)/).forEach(part=>{if(part!=='I'){fragment.append(document.createTextNode(part));return;}const symbol=document.createElement('span');symbol.className='volume-symbol';symbol.setAttribute('role','img');symbol.setAttribute('aria-label','I');symbol.innerHTML='<svg viewBox="0 0 32 44" aria-hidden="true"><path d="M5 5H27M16 5V39M5 39H27" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>';fragment.append(symbol);});node.replaceWith(fragment);}
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
function render(){
 let n=Number(location.hash.slice(1));if(!Number.isInteger(n)||n<1||n>slides.length)n=1;
 current=n;const s=slides[n-1];buildStep=Math.min(pendingStep,s.steps||0);pendingStep=0;
 if(location.hash!==`#${n}`)history.replaceState(null,'',`#${n}`);
 const el=$('#slide');el.className=`slide-${s.type||'content'}`;el.dataset.slide=String(n);
 el.innerHTML=`${s.bare?'':`<div class="kicker">${s.type==='intro'?'УРОК 07 · ЕГЭ ПО ИНФОРМАТИКЕ':s.group.toUpperCase()}</div>`}${s.type==='intro'||s.bare?'':`<h2>${s.title}</h2>`}${s.body}`;
 stylizeVolumes(el);el.scrollTop=0;document.title=`${s.title} · Задание 7 — изображения`;
 document.querySelectorAll('#outline a').forEach(a=>{const active=Number(a.dataset.slide)===n;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
 if(s.type==='palette'){
  $('#combinations-bits').addEventListener('change',e=>setDepth(e.target.value));
  $('#palette-bits').addEventListener('change',e=>setDepth(e.target.value));setDepth(1);
 }
 if(s.quiz){
  const input=$('.quiz-form input'),key=s.quiz.id;
  if(state[key]?.value)input.value=state[key].value;if(state[key]?.correct)feedback('Верно! Задача решена.','good');
  $('.quiz-form').addEventListener('submit',e=>{e.preventDefault();const raw=input.value.trim().replace(',','.');if(!/^\d+(\.\d+)?$/.test(raw)){feedback('Введите число без единиц измерения.','bad');return;}const correct=Number(raw)===s.quiz.value;state[key]={value:input.value,correct};persist();feedback(correct?'Верно! Можно переходить дальше.':'Пока не сходится. Проверьте единицы или откройте подсказку.',correct?'good':'bad');});
 }
 updateBuild();resize();
}
function updateBuild(){
 const s=slides[current-1],el=$('#slide');const source=s.type==='percent'&&buildStep===27&&el.dataset.step==='26'?el.querySelector('.divide-source'):null;const sourceBox=source?.getBoundingClientRect();el.dataset.step=String(buildStep);
 el.querySelectorAll('[data-reveal]').forEach(part=>{const show=buildStep>=Number(part.dataset.reveal)&&(!part.dataset.until||buildStep<=Number(part.dataset.until));part.classList.toggle('is-visible',show);part.setAttribute('aria-hidden',String(!show));part.inert=!show;});
 if(sourceBox&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const destination=el.querySelector('.divide-target');const end=destination?.getBoundingClientRect();if(end){const moving=source.cloneNode(true);Object.assign(moving.style,{position:'fixed',left:sourceBox.left+'px',top:sourceBox.top+'px',width:sourceBox.width+'px',zIndex:'100',pointerEvents:'none',color:'#E46E50',transformOrigin:'0 0'});document.body.append(moving);destination.style.visibility='hidden';moving.animate([{transform:'translate(0,0)'},{transform:`translate(${end.left-sourceBox.left}px,${end.top-sourceBox.top}px)`}],{duration:750,easing:'ease-in-out'}).finished.catch(()=>{}).finally(()=>{moving.remove();destination.style.visibility='';});}}
 if(s.type==='diagram')el.querySelectorAll('[data-factor]').forEach(f=>f.classList.toggle('highlight',f.dataset.factor===['','a','b','i','i'][buildStep]));
 el.classList.toggle('units-open',s.type==='bits'&&buildStep>=3);
 el.classList.toggle('byte-joined',s.type==='bits'&&buildStep>=2);
 el.classList.toggle('problem-at-top',(s.type==='worked'&&buildStep>=4)||(s.type==='percent'&&buildStep>=7));
 if(s.type==='percent'){el.classList.toggle('percent-wrong-crossed',buildStep>=11);el.classList.toggle('percent-cleared',buildStep>=14);el.classList.toggle('percent-table-mode',buildStep>=15);el.classList.toggle('percent-table-shift',buildStep>=21);el.querySelectorAll('[data-pct]').forEach(f=>f.classList.toggle('highlight',buildStep>=({size:1,memory:2,compressed:3,less:4,target:5,original:6}[f.dataset.pct])));}
 if(s.type==='worked'){
  el.querySelectorAll('[data-condition]').forEach(f=>f.classList.toggle('highlight',buildStep>=({size:1,colors:2,memory:2,target:3}[f.dataset.condition])));
  el.querySelectorAll('[data-known]').forEach(f=>f.classList.toggle('highlight',buildStep>=(f.dataset.known==='size'?6:7)));
  el.querySelectorAll('[data-unknown]').forEach(f=>f.classList.toggle('highlight',buildStep>=8));
 }
 $('#prev').disabled=current===1&&buildStep===0;
 $('#next').disabled=current===slides.length&&buildStep===(s.steps||0);
 $('#next').innerHTML=$('#next').disabled?'Готово ✓':buildStep<(s.steps||0)?'Следующий шаг <span>→</span>':'Далее <span>→</span>';
 const description=s.steps?`${s.title}. Шаг ${buildStep} из ${s.steps}.`:s.title;
 $('#status').textContent=description;el.setAttribute('aria-label',description);
}
function setDepth(value){
 const i=Number(value),count=2**i;$('#combinations-bits').value=String(i);$('#palette-bits').value=String(i);
 const codes=Array.from({length:count},(_,k)=>k.toString(2).padStart(i,'0'));
 $('#binary-codes').innerHTML=codes.map(code=>`<span class="binary-code">${code}</span>`).join('');
 $('#binary-count').textContent=`2${['','¹','²','³','⁴'][i]} = ${count} ${count<=4?'комбинации':'комбинаций'}`;
 const colors=['#E46E50','#3B6FFF','#FFC145','#9B5DE5','#FF8F59','#00A8E8','#F15BB5','#5B3CC4','#EA526F','#2D5DA1','#D48C00','#7928A1','#F7A6B8','#A6B8FF','#703F2C','#1F2430'];
 $('#palette').innerHTML=codes.map((code,k)=>`<div class="palette-cell"><div class="swatch" style="background:${colors[k]}" role="img" aria-label="Цвет с кодом ${code}"></div><span class="swatch-code">${code}</span></div>`).join('');
 $('#palette-info').textContent=`${i} ${i===1?'бит':'бита'} на пиксель → до ${count} цветов. Каждой комбинации соответствует свой цвет.`;
}
function feedback(message,kind){const el=$('.feedback');el.textContent=message;el.className=`feedback ${kind}`;}
function go(delta){
 const s=slides[current-1];
 if(delta===1&&buildStep<(s.steps||0)){buildStep++;updateBuild();return;}
 if(delta===-1&&buildStep>0){buildStep--;updateBuild();return;}
 const n=current+delta;if(n>=1&&n<=slides.length){pendingStep=delta<0?(slides[n-1].steps||0):0;location.hash=String(n);}
}
$('#slide').addEventListener('click',e=>{if(e.target.closest('a,button,input,select,label,option,textarea,details,summary'))return;const s=slides[current-1];if(buildStep<(s.steps||0)){buildStep++;updateBuild();}});
$('#prev').addEventListener('click',()=>go(-1));$('#next').addEventListener('click',()=>go(1));window.addEventListener('hashchange',()=>{
 const next=Number(location.hash.slice(1)); const animated=(current===1&&next===2)||(current===2&&next===1);
 const old=animated&&!matchMedia('(prefers-reduced-motion: reduce)').matches?document.querySelector('.bird-grid'):null;
 let copy,box;if(old){box=old.getBoundingClientRect();copy=old.cloneNode(true);Object.assign(copy.style,{position:'fixed',left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px',zIndex:'100',pointerEvents:'none',margin:'0',transformOrigin:'0 0'});document.body.append(copy);}
 const outgoing=captureSlide();render();fadeSlides(outgoing,!!copy);
 if(copy){const target=document.querySelector('.bird-grid');if(!target){copy.remove();return;}const end=target.getBoundingClientRect();target.style.visibility='hidden';const animation=copy.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${end.left-box.left}px,${end.top-box.top}px) scale(${end.width/box.width},${end.height/box.height})`}],{duration:650,easing:'ease-in-out'});animation.finished.catch(()=>{}).finally(()=>{copy.remove();target.style.visibility='';});}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){toggleMenu(false);$('#menu').focus();return;}
 if(e.target.closest('input,select,textarea,summary')||e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.key==='ArrowRight'){e.preventDefault();go(1);}if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}
 if((e.key===' '||e.key==='Enter')&&!e.target.closest('a,button')&&(e.target===document.body||e.target.closest('#slide'))){e.preventDefault();go(1);}
});
$('.skip').addEventListener('click',e=>{e.preventDefault();$('#slide').focus();});
try{toggleMenu(localStorage.getItem('lesson7-sidebar')==='true');}catch{toggleMenu(false);}
render();
