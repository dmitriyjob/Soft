'use strict';

// The graph and all 20 table entries reproduce the supplied task.
const vertices = {
  'А': [58, 225, -22, 8], 'Б': [145, 70, -5, -25],
  'В': [230, 225, -20, 32], 'Д': [320, 90, -6, -25],
  'Е': [420, 225, 16, -12], 'Г': [330, 315, -20, 32],
  'К': [600, 225, 0, -22]
};
const edges = ['АБ','АВ','БВ','ВД','ДЕ','ВЕ','ВГ','ЕГ','ЕК','ГК'];
const roads = [[1,2,45],[1,4,10],[2,4,30],[2,6,55],[3,5,15],
  [3,6,60],[4,6,20],[4,7,35],[5,6,55],[6,7,45]];
const matrix = Array.from({length:7},()=>Array(7).fill(null));
roads.forEach(([a,b,d])=>{matrix[a-1][b-1]=d;matrix[b-1][a-1]=d;});
const degree = v => edges.filter(e=>e.includes(v)).length;
const reveal = (n,html,cls='') => `<div class="build-in ${cls}" data-reveal="${n}">${html}</div>`;
const note = text => `<div class="note">${text}</div>`;

function graph({mapped=[],terms=false,counts=false}={}) {
  const lines=edges.map(e=>{
    const [a,b]=[vertices[e[0]],vertices[e[1]]];
    return `<g data-edge="${e}"><path class="edge" d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}"/><path class="edge-emphasis" pathLength="1" d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}"/></g>`;
  }).join('');
  const nodes=Object.entries(vertices).map(([v,[x,y,dx,dy]],i)=>`<g data-vertex="${v}"><circle class="vertex-halo" cx="${x}" cy="${y}" r="19"/><circle class="vertex" cx="${x}" cy="${y}" r="6"/><text class="vertex-label" x="${x+dx}" y="${y+dy}">${v}</text>${['В','Г'].includes(v)?`<text class="vertex-number ${mapped.includes(v)?'is-visible':''}" data-map="${v}" x="${v==='В'?x-35:x+19}" y="${v==='В'?y+60:y+32}">П${v==='В'?6:2}</text>`:''}${counts?`<g class="build-in degree-badge" data-reveal="${i+1}"><circle cx="${x+23}" cy="${y-26}" r="15"/><text x="${x+23}" y="${y-20}">${degree(v)}</text></g>`:''}</g>`).join('');
  const annotations=terms?`<g class="build-in graph-annotation" data-reveal="1"><text x="476" y="90">вершина</text><path d="M560 102 Q600 130 600 196"/><path d="M593 184L600 198L607 184"/></g><g class="build-in graph-annotation" data-reveal="2"><text x="340" y="25">ребро</text><path d="M385 37 Q406 68 382 140"/><path d="M379 126L381 142L392 132"/></g>`:'';
  return `<svg class="road-graph" data-shared="graph" viewBox="0 0 660 385" role="img" aria-label="Схема дорог: АБ, АВ, БВ, ВД, ДЕ, ВЕ, ВГ, ЕГ, ЕК, ГК.">${lines}${nodes}${annotations}<g class="graph-distance"><rect x="246" y="262" width="54" height="30" rx="8"/><text x="273" y="284">55</text></g></svg>`;
}

function table({counts=false}={}) {
  return `<div class="road-table-wrap" data-shared="table"><table class="road-table"><caption class="sr-only">Длины дорог в километрах. Пустая ячейка означает отсутствие прямой дороги.</caption><thead><tr><th aria-label="Пункт"></th>${matrix.map((_,i)=>`<th scope="col" data-col="${i+1}">П${i+1}</th>`).join('')}${counts?'<th class="count-heading" scope="col">Связи</th>':''}</tr></thead><tbody>${matrix.map((row,r)=>`<tr data-row="${r+1}"><th scope="row">П${r+1}</th>${row.map((v,c)=>`<td data-r="${r+1}" data-c="${c+1}" class="${r===c?'diagonal':''}"${v===null?` aria-label="${r===c?'Тот же пункт':'Нет прямой дороги'}"`:''}><span>${v??''}</span></td>`).join('')}${counts?`<td class="count-cell"><span class="build-in" data-reveal="${r+1}">${row.filter(v=>v!==null).length}</span></td>`:''}</tr>`).join('')}</tbody></table></div>`;
}
function pair(options={}) {
  return `<div class="evidence-pair"><section class="table-evidence"><div class="mini-label">Таблица · расстояния в км</div>${table(options)}</section><section class="graph-evidence"><div class="mini-label">Схема дорог</div>${graph(options)}</section></div>`;
}

const slides = [
  {group:'Знакомство',title:'Графы и таблицы',type:'intro',steps:0,body:`<div class="hero"><div class="hero-text"><h1>Одна сеть.<br>Два способа<br>её увидеть.</h1><p class="lead">Сопоставляем схему дорог и таблицу.<br>Находим расстояние между пунктами.</p><div class="tag-row"><span class="tag">ЗАДАНИЕ 1</span><span class="tag">ГРАФЫ</span><span class="tag">РАЗБОР ПРИМЕРА</span></div><a class="primary" href="#2">Начать разбор <span>→</span></a><div class="hero-caption">Щелчок или → — следующий шаг<br>← — вернуться назад</div></div><div class="hero-graph">${graph()}</div></div>`},
  {group:'Знакомство',title:'Задача со схемой дорог',type:'problem',steps:2,body:`<p class="problem-text">На рисунке схема дорог Н-ского района изображена в виде графа, а в таблице содержатся сведения о длинах этих дорог <b>в километрах</b>.</p>${pair()}<p class="problem-text bottom-condition">Таблицу и схему рисовали независимо друг от друга. <span data-condition="1">Нумерация пунктов в таблице никак не связана с буквами на графе.</span></p><p class="target-question" data-condition="2">Какова длина дороги из пункта <b>В</b> в пункт <b>Г</b>?</p>`},
  {group:'Как читать граф',title:'Вершины, рёбра и связи',type:'terms',steps:3,body:`<div class="concept-layout"><div>${graph({terms:true})}</div><div class="concept-copy">${reveal(1,'<h3>Вершина — населённый пункт</h3><p>На схеме это точка с буквой.</p>')}${reveal(2,'<h3>Ребро — дорога</h3><p>Линия соединяет два пункта.</p>')}${reveal(3,'<h3>Степень вершины — число связей</h3><p>У А две связи: с Б и В.<br>Значит, степень А равна <strong>2</strong>.</p>')}</div></div>${reveal(3,note('Граф и таблицу объединяет <b>наличие связей</b>. Именно по ним мы будем сопоставлять буквы и номера.'))}`},
  {group:'Как читать граф',title:'Считаем связи на графе',type:'degrees',steps:8,body:`<div class="concept-layout"><div>${graph({counts:true})}</div><div class="degree-list">${Object.keys(vertices).map((v,i)=>reveal(i+1,`<span>${v}</span><span>${degree(v)} ${degree(v)===5?'связей':'связи'}</span><small>${degree(v)>2?'уникально':'повторяется'}</small>`,'degree-row')).join('')}</div></div>${reveal(8,note('<b>В — 5, Е — 4, Г — 3.</b> Начинаем с вершин, у которых количество связей не повторяется. Вершины А, Б, Д и К имеют по 2 связи.'))}`},
  {group:'Как читать таблицу',title:'Числа в строке — связи пункта',type:'table-counts',steps:8,body:`<div class="table-lesson"><div>${table({counts:true})}</div><div class="table-explanation"><p class="lead">Каждое число показывает длину <b>одной прямой дороги</b>.</p><p class="lead">Считаем заполненные ячейки в строке или столбце.</p>${reveal(2,'<div class="example-read">П2 → П1, П4, П6<br><strong>3 числа = 3 связи</strong></div>')}${reveal(8,note('У П6 — <b>5 связей</b>, у П4 — <b>4</b>, у П2 — <b>3</b>. Эти количества встречаются по одному разу.'))}</div></div><p class="small table-footnote">Пустая ячейка — прямой дороги нет. Серые ячейки — пересечение пункта с самим собой.</p>`},
  {group:'Решение',title:'Находим вершину В',type:'match-v',steps:7,body:`<p class="lead">Пять связей — уникальный признак вершины В.</p>${pair()}<div class="reasoning"><div class="neighbor-sequence">${['А','Б','Д','Е','Г'].map((v,i)=>`<span class="build-in" data-reveal="${i+1}">В–${v}</span>`).join('')}</div>${reveal(6,'В строке <b>П6</b> пять чисел: 55, 60, 20, 55, 45.','reason-line')}${reveal(7,'<span class="mapping">В = П6</span><span>Единственная вершина с пятью связями.</span>','mapping-line')}</div>`},
  {group:'Решение',title:'Находим вершину Г',type:'match-g',steps:5,body:`<p class="lead">Три связи — уникальный признак вершины Г.</p>${pair({mapped:['В']})}<div class="reasoning"><div class="neighbor-sequence">${['В','Е','К'].map((v,i)=>`<span class="build-in" data-reveal="${i+1}">Г–${v}</span>`).join('')}</div>${reveal(4,'В строке <b>П2</b> три числа: 45, 30, 55.','reason-line')}${reveal(5,'<span class="mapping">Г = П2</span><span>Теперь известны оба конца нужной дороги.</span>','mapping-line')}</div>`},
  {group:'Решение',title:'Читаем длину дороги В–Г',type:'distance',steps:5,body:`<div class="known-points"><span>В = <b>П6</b></span><span>Г = <b>П2</b></span></div>${pair({mapped:['В','Г']})}<div class="distance-steps">${reveal(1,'Берём строку <b>П6</b>.','read-step')}${reveal(2,'Находим столбец <b>П2</b>.','read-step')}${reveal(3,'На пересечении — <strong>55</strong>.','read-step')}</div>${reveal(4,'П2 → П6 и П6 → П2 — одна дорога. В симметричной ячейке тоже 55.','symmetry-note')}${reveal(5,'<span>ОТВЕТ</span><strong>55</strong><small>км</small>','final-answer')}`},
  {group:'Итог',title:'Как решать такие задания',type:'summary',steps:4,body:`<div class="summary-layout"><div class="summary-steps">${reveal(1,'<span>01</span><div><h3>Сосчитайте связи</h3><p>У каждой вершины и в каждой строке таблицы.</p></div>','summary-item')}${reveal(2,'<span>02</span><div><h3>Найдите уникальные количества</h3><p>В нашем примере: В — 5 связей, Г — 3.</p></div>','summary-item')}${reveal(3,'<span>03</span><div><h3>Сопоставьте буквы и номера</h3><p>В = П6, Г = П2. Для ответа этого достаточно.</p></div>','summary-item')}${reveal(4,'<span>04</span><div><h3>Прочитайте пересечение</h3><p>Строка П6, столбец П2 → <strong>55 км</strong>.</p></div>','summary-item')}</div><div class="summary-aside"><div class="mini-label">Запомните</div><p>Сначала — связи.<br>Потом — номера.<br>Затем — расстояние.</p>${reveal(4,note('Если число связей повторяется, сравнивайте, <b>с какими вершинами</b> соединён пункт.'))}</div></div>`}
];

const $=s=>document.querySelector(s);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let current=1,buildStep=0,pendingStep=0;
let group='';
$('#outline').innerHTML=slides.map((s,i)=>{
  const heading=group!==s.group?`<div class="group-name">${s.group}</div>`:'';group=s.group;
  return `${heading}<a href="#${i+1}" data-slide="${i+1}"><span>${String(i+1).padStart(2,'0')}</span>${s.title}</a>`;
}).join('');
function resize(){const stage=$('#stage');$('#slide-frame').style.setProperty('--scale',matchMedia('(max-width:700px)').matches?1:Math.min(stage.clientWidth/1360,stage.clientHeight/800));}
new ResizeObserver(resize).observe($('#stage'));
function toggleMenu(open){
  document.body.classList.toggle('menu-open',open);$('#sidebar').hidden=!open;$('#sidebar').inert=!open;
  $('#menu').setAttribute('aria-expanded',String(open));
  $('#menu').title=open?'Скрыть боковое меню':'Показать боковое меню';$('#menu').setAttribute('aria-label',$('#menu').title);
  try{localStorage.setItem('lesson1-sidebar',String(open));}catch{}resize();
}
function render(){
  let n=Number(location.hash.slice(1));if(!Number.isInteger(n)||n<1||n>slides.length)n=1;
  current=n;const s=slides[n-1];buildStep=Math.min(pendingStep,s.steps);pendingStep=0;
  if(location.hash!==`#${n}`)history.replaceState(null,'',`#${n}`);
  const el=$('#slide');el.className=`slide-${s.type}`;el.dataset.slide=String(n);
  el.innerHTML=`<div class="kicker">${s.type==='intro'?'УРОК 01 · ЕГЭ ПО ИНФОРМАТИКЕ':s.group.toUpperCase()}</div>${s.type==='intro'?'':`<h2>${s.title}</h2>`}${s.body}`;
  el.scrollTop=0;document.title=`${s.title} · Задание 1`;
  document.querySelectorAll('#outline a').forEach(a=>{const active=Number(a.dataset.slide)===n;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  updateBuild();resize();
}
function updateBuild(){
  const s=slides[current-1],el=$('#slide');el.dataset.step=String(buildStep);
  el.querySelectorAll('[data-reveal]').forEach(part=>{
    const show=buildStep>=Number(part.dataset.reveal);part.classList.toggle('is-visible',show);part.setAttribute('aria-hidden',String(!show));part.inert=!show;
  });
  el.querySelectorAll('[data-condition]').forEach(p=>p.classList.toggle('highlight',buildStep>=Number(p.dataset.condition)));
  let activeEdges=[],activeVertex='',row=0,col=0;
  if(s.type==='terms'&&buildStep>=3){activeEdges=['АБ','АВ'];activeVertex='А';}
  if(s.type==='degrees'&&buildStep>0){activeVertex=Object.keys(vertices)[Math.min(buildStep,7)-1];activeEdges=edges.filter(e=>e.includes(activeVertex));}
  if(s.type==='table-counts')row=Math.min(buildStep,7);
  if(s.type==='match-v'){activeVertex=buildStep?'В':'';activeEdges=['АВ','БВ','ВД','ВЕ','ВГ'].slice(0,buildStep);if(buildStep>=6)row=6;}
  if(s.type==='match-g'){activeVertex=buildStep?'Г':'';activeEdges=['ВГ','ЕГ','ГК'].slice(0,buildStep);if(buildStep>=4)row=2;}
  if(s.type==='distance'){if(buildStep>=1)row=6;if(buildStep>=2)col=2;if(buildStep>=3)activeEdges=['ВГ'];}
  el.querySelectorAll('[data-edge]').forEach(e=>e.classList.toggle('is-active',activeEdges.includes(e.dataset.edge)));
  el.querySelectorAll('[data-vertex]').forEach(e=>e.classList.toggle('is-active',e.dataset.vertex===activeVertex));
  el.querySelectorAll('[data-row]').forEach(e=>e.classList.toggle('is-active',Number(e.dataset.row)===row));
  el.querySelectorAll('[data-c],[data-col]').forEach(e=>e.classList.toggle('column-active',Number(e.dataset.c||e.dataset.col)===col));
  el.querySelectorAll('[data-map]').forEach(e=>{
    const show=s.type==='distance'||(s.type==='match-g'&&e.dataset.map==='В')||(s.type==='match-v'&&e.dataset.map==='В'&&buildStep>=7)||(s.type==='match-g'&&e.dataset.map==='Г'&&buildStep>=5);
    e.classList.toggle('is-visible',show);e.setAttribute('aria-hidden',String(!show));
  });
  el.querySelectorAll('[data-r]').forEach(e=>{
    const primary=e.dataset.r==='6'&&e.dataset.c==='2',mirror=e.dataset.r==='2'&&e.dataset.c==='6';
    e.classList.toggle('answer-cell',s.type==='distance'&&((primary&&buildStep>=3)||(mirror&&buildStep>=4)));
  });
  el.querySelector('.graph-distance')?.classList.toggle('is-visible',s.type==='distance'&&buildStep>=3);
  $('#prev').disabled=current===1&&buildStep===0;
  $('#next').disabled=current===slides.length&&buildStep===s.steps;
  $('#next').innerHTML=$('#next').disabled?'Готово ✓':buildStep<s.steps?'Следующий шаг <span>→</span>':'Далее <span>→</span>';
  $('#progress').textContent=`${String(current).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}${s.steps?` · шаг ${buildStep} из ${s.steps}`:''}`;
  const description=`${s.title}.${s.steps?` Шаг ${buildStep} из ${s.steps}.`:''}`;
  $('#status').textContent=description;el.setAttribute('aria-label',description);
}

// Same 550 ms crossfade and 650 ms shared-illustration movement as lesson 7.
// Keep the road diagram/table in view when moving between explanation slides.
let transitionAnimations=[];
function cancelTransition(){transitionAnimations.forEach(a=>a.cancel());transitionAnimations=[];document.querySelectorAll('.slide-outgoing,.shared-flight').forEach(e=>e.remove());$('#slide').querySelectorAll('[data-shared]').forEach(e=>e.style.visibility='');}
function transition(){
  cancelTransition();
  if(reduced()){render();return;}
  const el=$('#slide'),outgoing=el.cloneNode(true);outgoing.removeAttribute('id');outgoing.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));outgoing.classList.add('slide-outgoing');outgoing.setAttribute('aria-hidden','true');outgoing.inert=true;
  const shared=Array.from(el.querySelectorAll('[data-shared]')).map(e=>({key:e.dataset.shared,box:e.getBoundingClientRect(),copy:e.cloneNode(true)}));
  el.parentElement.append(outgoing);outgoing.scrollTop=el.scrollTop;render();
  const fade=outgoing.animate([{opacity:1},{opacity:0}],{duration:550,easing:'ease-in-out',fill:'forwards'});transitionAnimations.push(fade);fade.finished.catch(()=>{}).finally(()=>outgoing.remove());
  transitionAnimations.push(el.animate([{opacity:0},{opacity:1}],{duration:550,easing:'ease-in-out'}));
  for(const {key,box,copy} of shared){
    const target=el.querySelector(`[data-shared="${key}"]`);
    // A count column changes the table shape, so use the regular crossfade there.
    if(!target||box.width===0||(key==='table'&&(copy.querySelector('.count-cell')||target.querySelector('.count-cell'))))continue;
    const end=target.getBoundingClientRect();outgoing.querySelector(`[data-shared="${key}"]`).style.visibility='hidden';target.style.visibility='hidden';
    copy.classList.add('shared-flight');copy.setAttribute('aria-hidden','true');copy.inert=true;
    Object.assign(copy.style,{position:'fixed',left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px',margin:'0',zIndex:'40',pointerEvents:'none',transformOrigin:'0 0'});
    // Scale table text with its source slide as well as its outer geometry.
    if(key==='table')copy.style.fontSize=getComputedStyle(target).fontSize;
    document.body.append(copy);
    const animation=copy.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${end.left-box.left}px,${end.top-box.top}px) scale(${end.width/box.width},${end.height/box.height})`,opacity:0}],{duration:650,easing:'ease-in-out'});
    transitionAnimations.push(animation);animation.finished.catch(()=>{}).finally(()=>{copy.remove();target.style.visibility='';});
  }
}
function go(delta){
  cancelTransition();const s=slides[current-1];
  if(delta===1&&buildStep<s.steps){buildStep++;updateBuild();return;}
  if(delta===-1&&buildStep>0){buildStep--;updateBuild();return;}
  const n=current+delta;if(n>=1&&n<=slides.length){pendingStep=delta<0?slides[n-1].steps:0;location.hash=String(n);}
}
$('#menu').addEventListener('click',()=>toggleMenu(!document.body.classList.contains('menu-open')));
$('#outline').addEventListener('click',e=>{if(e.target.closest('a')){pendingStep=0;if(matchMedia('(max-width:700px)').matches)toggleMenu(false);}});
$('#slide').addEventListener('click',e=>{if(e.target.closest('a,button,input,select,label,textarea,details,summary'))return;if(buildStep<slides[current-1].steps)go(1);});
$('#prev').addEventListener('click',()=>go(-1));$('#next').addEventListener('click',()=>go(1));
window.addEventListener('hashchange',transition);
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){toggleMenu(false);$('#menu').focus();return;}
  if(e.target.closest('input,select,textarea,summary')||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.key==='ArrowRight'){e.preventDefault();go(1);}if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}
  if((e.key===' '||e.key==='Enter')&&!e.target.closest('a,button')&&(e.target===document.body||e.target.closest('#slide'))){e.preventDefault();go(1);}
});
$('.skip').addEventListener('click',e=>{e.preventDefault();$('#slide').focus();});
try{toggleMenu(localStorage.getItem('lesson1-sidebar')==='true');}catch{toggleMenu(false);}
render();
