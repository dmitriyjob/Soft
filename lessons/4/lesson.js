'use strict';
const $=q=>document.querySelector(q);
const reveal=(n,html,cls='')=>`<div class="reveal ${cls}" data-show="${n}">${html}</div>`;
const letters=[...'БАОБАБ'],codes={Б:'10',А:'010',О:'00'},colors={Б:'b',А:'a',О:'o'};
const binary=letters.map(c=>codes[c]).join('');
const table=()=>`<div class="code-table"><div class="eyebrow">ТАБЛИЦА КОДОВ</div>${Object.entries(codes).map(([char,code])=>`<div class="code-table-row ${colors[char]}"><b>${char}</b><code>${code}</code><small>${code.length} ${code.length===2?'знака':'знака'}</small></div>`).join('')}</div>`;
const heart=()=>`<div class="pixel-heart" aria-label="Сердце из пикселей">${['01100110','11111111','11111111','11111111','01111110','00111100','00011000','00000000'].flatMap(row=>[...row].map(x=>`<i class="${x==='1'?'painted':''}"></i>`)).join('')}</div>`;
const chars=letters.map(c=>`<span class="char ${colors[c]}">${c}</span>`).join('');
const lock='<svg viewBox="0 0 32 36" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="15" width="22" height="17" rx="3"/><path d="M10 15V9a6 6 0 0 1 12 0v6M16 21v6"/></svg>';
let offset=0;const bitData=letters.flatMap((char,group)=>[...codes[char]].map((bit,j)=>({char,group,bit,index:offset++})));const ends=[];let total=0;letters.forEach(c=>{total+=codes[c].length;ends.push(total);});
const extendedTable=()=>table().replace('</div></div>','</div><div class="code-table-row t new-code"><b>Т</b><code>01</code></div></div>');
const alternate=[...'БТОТОББ'];
function partition(word,codeMap,cls){let at=1;return `<div class="partition ${cls}">${word.map((c,i)=>{const start=at,len=codeMap[c].length;at+=len;return `<span class="partition-group ${c==='Т'?'t':colors[c]}" style="grid-column:${start}/span ${len};--order:${i}">${c}</span>`;}).join('')}</div>`;}
function ambiguity(){return `<div class="kicker">ПРОБЛЕМА НЕРАВНОМЕРНОГО КОДА</div><h2 id="ambiguity-title">Добавим букву <em>Т = 01</em></h2><div class="demo-layout">${extendedTable()}<div class="amb-area"><p class="amb-intro">Слово не меняли — в памяти <strong>тот же код</strong>. Читаем его заново.</p>${reveal(2,'<div class="partition-label">КАК ЗАДУМАНО</div>'+partition(letters,codes,'partition-top'),'original-partition')}<div class="amb-stream">${[...binary].map(b=>`<span class="bit-token">${b}</span>`).join('')}</div>${reveal(1,partition(alternate,{...codes,Т:'01'},'partition-bottom')+'<div class="partition-label">ПРОЧИТАЛИ</div>','alternate-partition')}<div class="amb-words">${reveal(2,'БАОБАБ','word-badge intended')}${reveal(2,'или','or-word')}${reveal(1,'БТОТОББ','word-badge alternative')}</div></div></div>${reveal(3,'<strong>Неоднозначность:</strong> одна двоичная строка допускает разные расшифровки. Исходное сообщение нельзя восстановить однозначно.','lesson-note ambiguity-note')}`;}
function prefixReason(){return `<div class="kicker">ИЩЕМ ПРИЧИНУ</div><h2>Почему код <em>сломался?</em></h2><div class="prefix-layout"><div><div class="prefix-pair"><span class="letter-badge t">Т</span><code><mark>01</mark></code></div><div class="prefix-pair"><span class="letter-badge a">А</span><code><mark>01</mark>0</code></div>${reveal(1,'Код Т — <strong>начало</strong> кода А. Прочитав 01, нельзя сразу понять: это уже Т или ещё начало А.','prefix-explain')}</div>${reveal(2,'<div class="eyebrow">УСЛОВИЕ ФАНО</div><h3>Ни одно кодовое слово не должно быть <em>началом</em> другого кодового слова.</h3><p>При выполнении этого условия сообщение можно однозначно читать слева направо.</p>','card accented fano-rule')}</div>${reveal(3,'<div class="validation-good"><b>✓ Т = 11</b><span>Не конфликтует с Б = 10, А = 010 и О = 00.</span></div><div class="validation-bad"><b>× 110</b><span>После выбора Т = 11 код 110 для другой буквы уже не подойдёт: начинается с 11.</span></div>','validation-examples')}`;}
function trainer(){return `<div class="kicker">ТРЕНАЖЁР</div><div class="trainer-heading"><h2>Проверь код на Фано</h2><div class="presets" role="group" aria-label="Набор кодов"><button data-preset="lesson" class="selected">Как на уроке</button><button data-preset="fixed">Т = 11</button><button data-preset="custom">Свой код</button></div></div><div class="trainer-layout"><div><div class="trainer-fields">${['Б','А','О','Т'].map((char,i)=>`<label class="trainer-field ${char==='Т'?'t':colors[char]}" data-letter="${char}"><b>${char}</b><input type="text" id="code-${i}" data-code="${char}" value="${char==='Т'?'01':codes[char]}" maxlength="8" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="Двоичный код буквы ${char}"><span class="field-status" aria-hidden="true"></span></label>`).join('')}</div><div id="fano-feedback" aria-live="polite"></div><div class="trainer-word">БАОБАБ → <code id="trainer-binary"></code></div><div id="parses-info" aria-live="polite"></div><div id="parses-list"></div></div><div class="tree-panel"><div id="code-tree" role="img" aria-label="Дерево введённых двоичных кодов"></div><p class="tree-caption">Код буквы должен заканчиваться в отдельном листе — без продолжения к другой букве.</p></div></div>`;}
function analyzeCodes(map){
 const entries=Object.entries(map),invalid=entries.filter(([,code])=>!/^[01]{1,8}$/.test(code)),valid=entries.filter(([,code])=>/^[01]{1,8}$/.test(code)),conflicts=[];
 for(let i=0;i<valid.length;i++)for(let j=i+1;j<valid.length;j++){
  const a=valid[i],b=valid[j];
  if(a[1].startsWith(b[1])||b[1].startsWith(a[1]))conflicts.push(a[1].length<=b[1].length?[a,b]:[b,a]);
 }
 return {invalid,conflicts};
}
function decodeVariants(sequence,map){const entries=Object.entries(map),memo=Array(sequence.length+1).fill(0n);memo[sequence.length]=1n;for(let i=sequence.length-1;i>=0;i--)for(const [,code] of entries)if(sequence.startsWith(code,i))memo[i]+=memo[i+code.length];const examples=[];function walk(i,text){if(examples.length>=6)return;if(i===sequence.length){examples.push(text);return;}for(const [char,code] of entries)if(sequence.startsWith(code,i)&&memo[i+code.length]>0n)walk(i+code.length,text+char);}walk(0,'');return {count:memo[0].toString(),examples};}
function drawCodeTree(map,conflicts){const nodes=new Set(['']),labels=new Map();Object.entries(map).forEach(([char,code])=>{if(!/^[01]{1,8}$/.test(code))return;labels.set(code,[...(labels.get(code)||[]),char]);for(let i=1;i<=code.length;i++)nodes.add(code.slice(0,i));});for(const n of [...nodes])if(nodes.has(n+'0')||nodes.has(n+'1')){nodes.add(n+'0');nodes.add(n+'1');}let leaf=0;const pos=new Map();function layout(n){if(!nodes.has(n+'0')&&!nodes.has(n+'1')){pos.set(n,leaf++);return pos.get(n);}pos.set(n,(layout(n+'0')+layout(n+'1'))/2);return pos.get(n);}layout('');const depth=Math.max(2,...[...nodes].map(n=>n.length)),height=depth*83+80,x=n=>leaf===1?320:40+pos.get(n)*560/(leaf-1),y=n=>30+n.length*83;let svg=`<svg viewBox="0 0 640 ${height}" aria-hidden="true">`;for(const n of nodes)if(n)svg+=`<path d="M${x(n.slice(0,-1))} ${y(n.slice(0,-1))}L${x(n)} ${y(n)}"/>`;for(const n of nodes){const chars=labels.get(n)||[],bad=conflicts.some(([a,b])=>a[1]===n||b[1]===n);svg+=`<g class="tree-node ${bad?'conflict':chars.length?'assigned':''}"><circle cx="${x(n)}" cy="${y(n)}" r="${n?19:5}"/><text x="${x(n)}" y="${y(n)+5}" text-anchor="middle">${n}</text>${chars.length?`<text class="tree-letter" x="${x(n)}" y="${y(n)+43}" text-anchor="middle">${chars.join(', ')}</text>`:''}</g>`;}$('#code-tree').innerHTML=svg+'</svg>';}
function updateTrainer(){
 const map={};document.querySelectorAll('[data-code]').forEach(e=>map[e.dataset.code]=e.value);
 const {invalid,conflicts}=analyzeCodes(map),empty=Object.values(map).every(code=>code===''),malformed=invalid.some(([,code])=>code!==''),incomplete=invalid.length>0;
 document.querySelectorAll('.trainer-field').forEach(e=>{
  const code=map[e.dataset.letter],bad=(code!==''&&!/^[01]{1,8}$/.test(code))||conflicts.some(pair=>pair.some(([c])=>c===e.dataset.letter));
  e.classList.toggle('has-error',bad);e.querySelector('.field-status').textContent=code===''?'':bad?'×':'✓';e.querySelector('input').setAttribute('aria-invalid',String(bad));
 });
 const feedback=$('#fano-feedback');feedback.className=malformed||conflicts.length?'validation-bad':incomplete?'validation-pending':'validation-good';feedback.replaceChildren();
 const title=document.createElement('strong');
 title.textContent=empty?'Задайте свой двоичный код для каждой буквы.':malformed?'Код должен содержать от 1 до 8 знаков: только 0 и 1.':conflicts.length?'Условие Фано нарушено':incomplete?'Заполните оставшиеся коды.':'Условие Фано выполнено';feedback.append(title);
 if(conflicts.length){const msg=document.createElement('p');msg.textContent=conflicts.map(([a,b])=>a[1]===b[1]?`${a[0]} и ${b[0]} имеют одинаковый код ${a[1]}.`:`${a[0]} = ${a[1]} — начало ${b[0]} = ${b[1]}.`).join(' ');feedback.append(msg);}
 $('#trainer-binary').textContent=incomplete?'—':letters.map(c=>map[c]).join('');$('#parses-list').replaceChildren();
 if(!incomplete){
  const variants=decodeVariants(letters.map(c=>map[c]).join(''),map);$('#parses-info').textContent='Способов прочитать: '+variants.count;
  variants.examples.forEach(word=>{const badge=document.createElement('span');badge.textContent=word;badge.className=word==='БАОБАБ'?'parse intended':'parse alternative';$('#parses-list').append(badge);});
 }else $('#parses-info').textContent=empty?'':malformed?'Исправьте коды, чтобы проверить расшифровку.':'После заполнения всех полей появятся расшифровки.';
 if(Object.values(map).some(code=>/^[01]{1,8}$/.test(code)))drawCodeTree(map,conflicts);
 else $('#code-tree').innerHTML='<div class="empty-code-tree">Введите коды — здесь появится дерево.</div>';
}
function initTrainer(){
 document.querySelectorAll('[data-preset]').forEach(button=>button.onclick=()=>{
  document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('selected',b===button));
  const custom=button.dataset.preset==='custom';
  document.querySelectorAll('[data-code]').forEach(e=>e.value=custom?'':e.dataset.code==='Т'?(button.dataset.preset==='fixed'?'11':'01'):codes[e.dataset.code]);
  updateTrainer();if(custom)document.querySelector('[data-code]').focus();
 });
 document.querySelectorAll('[data-code]').forEach(e=>e.addEventListener('input',()=>{document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('selected',b.dataset.preset==='custom'));updateTrainer();}));updateTrainer();
}
// The worked tree keeps fixed node positions as each branch is revealed.
const examTreeCodes={А:'0',Б:'1100',В:'1000'};
const examTreePositions={
 '':{x:480,y:30},'0':{x:90,y:130},'1':{x:570,y:130},
 '10':{x:385,y:230},'11':{x:755,y:230},
 '100':{x:310,y:330},'101':{x:490,y:330},'110':{x:675,y:330},'111':{x:855,y:330},
 '1000':{x:245,y:435},'1001':{x:375,y:435},'1100':{x:610,y:435},'1101':{x:740,y:435},
 '00':{x:30,y:225,ghost:true},'01':{x:150,y:225,ghost:true},
 '10000':{x:180,y:530,ghost:true},'10001':{x:310,y:530,ghost:true},
 '11000':{x:545,y:530,ghost:true},'11001':{x:675,y:530,ghost:true}
};
function treeAlgorithm(){
 const steps=[
  ['старт: 0 и 1','Дерево всегда начинается с двух веток — нолика и единички.','<span class="mini-tree-pill">0</span><span class="mini-tree-pill">1</span>'],
  ['влево +0 · вправо +1','Идём влево — дописываем в конец 0, вправо — дописываем 1.','<span class="mini-tree-pill">10</span><i>→</i><span class="mini-tree-pill">100</span><span class="mini-tree-pill">101</span>'],
  ['сразу обе ветки','Раскрыл узел — рисуй обоих детей: и влево, и вправо.','<span class="mini-tree-pill">11</span><i>→</i><span class="mini-tree-pill">110</span><span class="mini-tree-pill">111</span>'],
  ['нашёл код — подпиши','Нашёл данное кодовое слово — подчеркни, подпиши букву, а в условии зачеркни.','<span class="mini-tree-pill assigned">1000 <b>В</b></span>']
 ];
 return `<div class="kicker">АЛГОРИТМ</div><h2>Как строить дерево</h2><div class="tree-algorithm">${steps.map(([title,text,example],i)=>reveal(i+1,`<span class="algorithm-number">${i+1}</span><div class="algorithm-text"><h3>${title}</h3><p>${text}</p></div><div class="algorithm-example" aria-hidden="true">${example}</div>`,'tree-algorithm-row')).join('')}</div>`;
}
function workedTreeMarkup(){
 const labels={'0':'А','1000':'В','1100':'Б','111':'Г'};
 let svg='<svg class="worked-code-tree" viewBox="0 0 910 565" aria-hidden="true">';
 for(const [code,p] of Object.entries(examTreePositions)){
  if(!code)continue;
  const parent=examTreePositions[code.slice(0,-1)],startY=parent.y+(p.ghost?58:0),endY=p.y-(p.ghost?18:0);
  svg+=`<g class="worked-tree-edge ${p.ghost?'ghost':''}" data-child="${code}"><path ${p.ghost?'':'pathLength="1"'} d="M${parent.x} ${startY}L${p.x} ${endY}"/>${p.ghost?'':`<text x="${(parent.x+p.x)/2+7}" y="${(startY+endY)/2-7}">${code.slice(-1)}</text>`}</g>`;
 }
 for(const [code,p] of Object.entries(examTreePositions)){
  if(!code){svg+=`<g class="worked-tree-node" data-node=""><circle class="tree-root" cx="${p.x}" cy="${p.y}" r="5"/></g>`;continue;}
  const width=p.ghost?code.length*11+25:code.length*17+28,height=p.ghost?31:40;
  svg+=`<g class="worked-tree-node ${p.ghost?'ghost':''}" data-node="${code}"><rect class="node-halo" x="${p.x-width/2-6}" y="${p.y-height/2-6}" width="${width+12}" height="${height+12}" rx="${height/2+6}"/><rect class="node-pill" x="${p.x-width/2}" y="${p.y-height/2}" width="${width}" height="${height}" rx="${height/2}"/><text class="node-code" x="${p.x}" y="${p.y+8}">${code}</text><path class="node-strike" d="M${p.x-width/2+9} ${p.y+7}L${p.x+width/2-9} ${p.y-7}"/>${labels[code]?`<path class="node-underline" d="M${p.x-width/2+5} ${p.y+25}v2q0 7 7 7h${width-24}q7 0 7-7v-2"/><text class="node-letter" x="${p.x}" y="${p.y+58}">${labels[code]}</text>`:''}${p.ghost?`<circle class="ghost-cross-circle" cx="${p.x+width/2}" cy="${p.y-height/2}" r="9"/><text class="ghost-cross" x="${p.x+width/2}" y="${p.y-height/2+5}">×</text>`:''}</g>`;
 }
 return svg+'</svg>';
}
function workedTree(){
 return `<div class="kicker" id="tree-kicker">№ 23363 · А = 0, Б = 1100, В = 1000</div><h2 id="tree-title">Начинаем с <em>0</em> и <em>1</em></h2><div class="tree-workbench"><div class="tree-instructions"><div class="exam-tree-codes">${[...Object.entries(examTreeCodes),['Г','?']].map(([letter,code])=>`<div class="exam-code-row ${letter==='Г'?'unknown':''}" data-exam-letter="${letter}"><span class="exam-code-content"><b>${letter}</b><code>${code}</code></span></div>`).join('')}</div><div class="exam-tree-note" id="tree-step-note" aria-live="polite"></div></div><div class="worked-tree-panel" id="worked-tree-panel" role="img" aria-label="Пошаговое построение дерева двоичного кода">${workedTreeMarkup()}</div></div>`;
}
function updateWorkedTree(){
 const solving=current===13;
 const titles=solving?[
  'Куда поставить <em>Г</em>?','Ниже букв — <em>нельзя</em>','Выше букв — тоже <em>нельзя</em>','Рядом — <em>можно</em>','Кратчайшие: <em>101</em> и <em>111</em>','111 &gt; 101 → <em>Г = 111</em>'
 ]:[
  'Начинаем с <em>0</em> и <em>1</em>','<em>0</em> — это А','Из 1: <em>10</em> и <em>11</em>','10 → 100 → <em>1000 — это В</em>','11 → 110 → <em>1100 — это Б</em>'
 ];
 const notes=solving?[
  'Дерево построено. Где для Г есть место?',
  'Ниже занятой буквы — нельзя: её код станет <strong>началом</strong> нового. Например, <strong>10000</strong> и <strong>10001</strong> начинаются с 1000 (В). То же верно для потомков А и Б.',
  '<strong>100</strong> — начало 1000 (В), <strong>11</strong> — начало 1100 (Б). Узлы на пути к буквам зачёркиваем.',
  'Свободны четыре ветки: <strong>1001, 101, 1101, 111</strong>.',
  'У двух свободных веток длина 3 — это кратчайшие коды. Какой выбрать?',
  '«Если таких слов несколько — с наибольшим числовым значением»: 111 больше 101. <strong>Ответ: 111.</strong>'
 ]:[
  'Влево — дописываем <strong>0</strong>, вправо — <strong>1</strong>. Ищем в дереве данные коды.',
  'Нашли данный код — подчёркиваем, подписываем букву, а в условии <strong>зачёркиваем</strong>.',
  'Раскрываем узел — рисуем <strong>сразу обе ветки</strong>: влево 10, вправо 11.',
  'Идём к 1000: из 10 влево — 100, из 100 влево — 1000. Это <strong>В</strong>.',
  'Все данные коды найдены. Осталось понять, куда поставить <strong>Г</strong>.'
 ];
 $('#tree-title').innerHTML=titles[step];$('#tree-step-note').innerHTML=notes[step];$('#tree-step-note').classList.toggle('is-answer',solving&&step===5);
 $('#tree-kicker').textContent=solving?'№ 23363 · ИЩЕМ КОД ДЛЯ Г':'№ 23363 · А = 0, Б = 1100, В = 1000';
 const visible=new Set(['','0','1']),assigned=new Set();
 if(solving||step>=1)assigned.add('0');
 if(solving||step>=2){visible.add('10');visible.add('11');}
 if(solving||step>=3){['100','101','1000','1001'].forEach(code=>visible.add(code));assigned.add('1000');}
 if(solving||step>=4){['110','111','1100','1101'].forEach(code=>visible.add(code));assigned.add('1100');}
 const blocked=new Set(solving&&step>=2?['1','10','100','11','110']:[]);
 const available=new Set(solving&&step>=3?['1001','101','1101','111']:[]);
 if(solving&&step===1)Object.entries(examTreePositions).forEach(([code,p])=>{if(p.ghost)visible.add(code);});
 $('#worked-tree-panel').querySelectorAll('[data-node]').forEach(node=>{
  const code=node.dataset.node,chosen=solving&&step===5&&code==='111',candidate=solving&&step===4&&['101','111'].includes(code);
  node.classList.toggle('is-visible',visible.has(code));node.classList.toggle('assigned',assigned.has(code)||chosen);node.classList.toggle('blocked',blocked.has(code));node.classList.toggle('available',available.has(code)&&!candidate&&!chosen);node.classList.toggle('candidate',candidate);node.classList.toggle('chosen',chosen);
 });
 $('#worked-tree-panel').querySelectorAll('[data-child]').forEach(edge=>edge.classList.toggle('is-visible',visible.has(edge.dataset.child)));
 $('#slide').querySelectorAll('[data-exam-letter]').forEach(row=>{
  const letter=row.dataset.examLetter;
  row.classList.toggle('done',letter!=='Г'&&assigned.has(examTreeCodes[letter]));row.classList.toggle('final-answer',letter==='Г'&&solving&&step===5);
  if(letter==='Г')row.querySelector('code').textContent=solving&&step===5?'111':'?';
 });
 $('#worked-tree-panel').setAttribute('aria-label',solving?step>=3?'Даны А = 0, Б = 1100, В = 1000. Свободные коды: 1001, 101, 1101, 111.'+' '+(step>=4?'Кратчайшие: 101 и 111. ':'')+(step===5?'Выбран наибольший: Г = 111.':''):'Дерево известных кодов А = 0, Б = 1100, В = 1000; проверяем запрещённые продолжения и начала.':`Построение дерева. Найдены ${[...assigned].join(', ')||'только начальные ветки 0 и 1'}.`);
}
function celebrateTreeAnswer(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 document.querySelectorAll('.lesson-celebration').forEach(e=>e.remove());
 const layer=document.createElement('div');layer.className='lesson-celebration';layer.setAttribute('aria-hidden','true');$('#slide-frame').append(layer);
 const animations=[];
 for(let side=0;side<2;side++)for(let i=0;i<45;i++){
  const p=document.createElement('i');p.style.left=(side?100:0)+'%';p.style.background=['#E46E50','#244D85','#12666b','#d2a247'][i%4];layer.append(p);
  const x=(350+i*37%520)*(side?-1:1),lift=700+i*31%430;
  const frames=Array.from({length:25},(_,j)=>{const t=j/24;return {transform:`translate(${x*(1-(1-t)**2)}px,${-lift*t+1250*t*t}px) rotate(${t*(500+i*23)}deg)`,opacity:t>.8?(1-t)/.2:1};});
  animations.push(p.animate(frames,{duration:1700+i%7*70,delay:i%6*12,fill:'both'}).finished.catch(()=>{}));
 }
 Promise.all(animations).then(()=>layer.remove());
}

const slides=[
 {title:'Кодирование: условие Фано',group:'Начало',steps:0,body:`<div class="cover"><div><div class="kicker">ЗАДАНИЕ 04 · ЕГЭ ПО ИНФОРМАТИКЕ</div><h1>Кодирование:<br>условие <em>Фано</em></h1><div class="cover-hint"><kbd>→</kbd> листать <kbd>←</kbd> назад</div></div><ol class="roadmap">${['Что такое кодирование','Условие Фано','Дерево кода','Минимальная длина','Слово и частоты букв'].map((t,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span>${t}</li>`).join('')}</ol></div>`},
 {title:'Кодирование и шифрование',group:'Кодирование',steps:2,question:'Зачем вообще кодировать?',answer:'Чтобы представить информацию в форме, удобной для хранения, передачи и обработки. В двоичном коде используются два знака: 0 и 1.',body:`<div class="kicker">НЕ ПУТАЕМ</div><h2>Кодирование <em>≠</em> шифрование</h2><div class="two-cards">${reveal(1,`<div class="card-icon muted">${lock}</div><h3>Шифрование</h3><p>Помогает <strong>скрыть информацию</strong>, чтобы прочитать её мог только тот, кому она предназначена.</p><div class="example"><code>ПРИВЕТ</code><span>→</span><code>ТУЛЕИХ</code></div>`,'card')}${reveal(2,'<div class="card-icon">01</div><h3>Кодирование</h3><p>Представляем информацию <strong>в виде кода</strong>. В этом уроке будем заменять символы нулями и единицами.</p><div class="example"><code>Б</code><span>→</span><code class="accent-code">10</code></div>','card accented')}</div>${reveal(2,'В двоичном представлении используются <strong>0 и 1</strong>: так можно записывать текст, изображения и звук.','lesson-note')}`},
 {title:'Два этапа кодирования',group:'Кодирование',steps:3,question:'Пробел — тоже символ?',answer:'Да. Если в сообщении есть пробелы или знаки препинания, им тоже нужны коды — если условие задачи не говорит иначе.',body:`<div class="kicker">КАК ЭТО РАБОТАЕТ</div><h2>Два этапа кодирования</h2><div class="stages">${reveal(1,`<div class="card-icon dark">1</div><h3>Дискретизация</h3><p>Разбиваем целое на отдельные элементы.</p><div class="pixel-example">${heart()}<span>→</span><p>изображение — набор <strong>пикселей</strong></p></div>${reveal(2,`<div class="text-example"><div class="mini-chars">${letters.map(c=>`<b>${c}</b>`).join('')}</div><span>→</span><p>текст — набор <strong>символов</strong>: букв, пробелов и знаков препинания</p></div>`)}`,'card discretization')}${reveal(3,'<div class="card-icon">2</div><h3>Кодирование</h3><p>Каждому элементу назначаем код из 0 и 1.</p><div class="example"><i class="pixel-sample"></i><span>→</span><code class="accent-code">1101</code></div><div class="example"><code>Б</code><span>→</span><code class="accent-code">10</code></div>','card accented')}</div>`},
 {title:'Кодируем БАОБАБ',group:'Пример',steps:4,question:'А равномерный код — это как?',answer:'При равномерном кодировании все символы получают коды одинаковой длины. Например: Б — 00, А — 01, О — 10.',body:`<div class="kicker">НЕРАВНОМЕРНЫЙ КОД</div><h2 id="encoding-title">Кодируем <em>БАОБАБ</em></h2><div class="demo-layout">${table()}<div class="encoding-area"><div class="letter-track">${chars}</div>${reveal(2,`<div class="code-track">${letters.map(c=>`<div class="code-cell ${colors[c]}"><span>↓</span><code>${codes[c]}</code></div>`).join('')}</div>`)}${reveal(3,`<div class="memory-label">ТАК СЛОВО ЛЕЖИТ В ПАМЯТИ</div><div class="bit-stream">${bitData.map(d=>`<span class="bit-token ${colors[d.char]}">${d.bit}</span>`).join('')}</div>`,'memory')}</div></div>${reveal(4,'<strong>Неравномерный код</strong> — коды символов имеют разную длину. Здесь у Б и О по 2 бита, а у А — 3.','lesson-note')}`},
 {title:'Декодируем слева направо',group:'Пример',steps:14,question:'Как понять, где кончается буква?',answer:'Сверяем прочитанное начало с таблицей. В нашем примере ни один код не является началом другого, поэтому совпадение можно сразу заменить буквой. Это и есть условие Фано для чтения слева направо.',body:`<div class="kicker">ОБРАТНО В ТЕКСТ</div><h2>Декодируем <em>слева направо</em></h2><div class="demo-layout">${table()}<div class="decoding-area"><p class="decode-intro">Читаем по одному биту и каждый раз сверяемся с таблицей.</p><div class="decode-stream">${bitData.map(d=>`<span class="bit-token" data-bit="${d.index}" data-color="${colors[d.char]}">${d.bit}</span>`).join('')}</div><div class="decoded-word decode-partition">${letters.map((c,i)=>`<span class="decoded-group ${colors[c]}" data-end="${ends[i]}" style="grid-column:${(i?ends[i-1]:0)+1}/span ${codes[c].length}" aria-hidden="true"><i aria-hidden="true"></i><b>${c}</b></span>`).join('')}</div><p id="read-status" class="read-status" aria-live="polite">Начнём с первого бита.</p></div></div><div class="decode-result" aria-live="polite"></div>`},
 {title:'Один код — два слова',group:'Условие Фано',steps:3,question:'Чем это опасно?',answer:'Одна и та же последовательность битов может соответствовать разным сообщениям. Получатель не сможет однозначно восстановить исходный текст.',body:ambiguity()},
 {title:'Почему код сломался?',group:'Условие Фано',steps:3,question:'А если нужно 33 буквы?',answer:'Кодов должно хватить для всего алфавита. Например, 6-битных кодов достаточно для 33 букв: имеется 64 различных комбинации одинаковой длины. Неравномерные коды тоже возможны, если выполнено условие Фано.',body:prefixReason()},
 {title:'Проверь код на Фано',group:'Практика',steps:0,body:trainer()},
 {title:'Каким должен быть код',group:'Итог',steps:3,body:`<div class="kicker">ЗАДАЧА</div><h2>Каким должен быть код</h2><div class="requirements">${reveal(1,'<div class="card-icon">1</div><h3>Условие Фано</h3><p>Ни один код не является началом другого — читаем однозначно.</p><div class="require-example"><code class="good-code">0 · 10 · 110</code><code class="bad-code">01 · 010</code></div>','card')}${reveal(2,'<div class="card-icon">2</div><h3>Минимальная длина</h3><p>Если нужен минимальный объём, выбираем самый короткий допустимый вариант.</p><div class="length-example"><div><i style="--bar:70%"></i><b>25 бит</b></div><div class="longer"><i style="--bar:85%"></i><b>27 — больше</b></div></div>','card')}${reveal(3,'<div class="card-icon">3</div><h3>Хватает на все буквы</h3><p>Нужно закодировать 4 буквы — оставляем место для всех четырёх.</p><div class="required-letters">А　Б　В　Г <b>✓</b></div>','card')}</div>${reveal(3,'Проверять эти требования удобно с помощью <strong>дерева кода</strong>.','lesson-note')}`}
,
 {title:'Задача: кратчайший код для Г',group:'Разбор задачи',steps:3,question:'Это сложное задание?',answer:'Начнём с условий: выпишем известные коды, сохраним условие Фано и будем искать свободный код минимальной длины. Если таких кодов несколько, сравним их числовые значения.',body:`<div class="kicker">РАЗБОР ЗАДАЧИ</div><h2>Ищем <em>кратчайший код</em></h2><div class="exam-task"><div class="exam-task-header"><span>ЕГЭ · информатика · задание 4</span><span>№ 23363 · резервный день 19.06.25</span></div><div class="exam-task-text"><p>По каналу связи передаются сообщения, содержащие только <span data-emphasize="1">четыре буквы: А, Б, В, Г</span>. Для передачи используется двоичный код, <span data-emphasize="1">удовлетворяющий условию Фано</span>.</p><p>Для букв А, Б, В используются такие кодовые слова: <span data-emphasize="2" class="known-exam-codes">А — 0; Б — 1100; В — 1000</span>.</p><p>Укажите <span data-emphasize="3">кратчайшее кодовое слово для буквы Г</span>, при котором код допускает однозначное декодирование. Если таких слов несколько, укажите код <span data-emphasize="3">с наибольшим числовым значением</span>.</p><p class="exam-task-note"><b>Примечание.</b> Условие Фано означает, что никакое кодовое слово не является началом другого кодового слова. Это обеспечивает возможность однозначной расшифровки закодированных сообщений.</p><div class="exam-answer-line">Ответ: <span aria-hidden="true"></span></div></div></div>`}
,
 {title:'Как строить дерево',group:'Разбор задачи',steps:4,question:'Зачем зачёркивать?',answer:'В условии зачёркиваем уже найденный код, чтобы не искать его повторно. В дереве отмечаем запрещённые начала кодов: их нельзя назначать новой букве, иначе нарушится условие Фано.',body:treeAlgorithm()},
 {title:'Строим дерево известных кодов',group:'Разбор задачи',steps:4,body:workedTree()},
 {title:'Выбираем код для Г',group:'Разбор задачи',steps:5,question:'Б = 1100 начинается с 11. Г = 111 — нарушение?',answer:'Нет. Общий префикс 11 разрешён. Нарушение возникает, когда целое кодовое слово является началом другого. Ни 1100 не начинается с 111, ни 111 не начинается с 1100.',body:workedTree()}
];
let current=1,step=0;
$('#outline').innerHTML=slides.map((s,i)=>`${i===0||s.group!==slides[i-1].group?`<div class="group-name">${s.group}</div>`:''}<a href="#${i+1}" data-slide="${i+1}">${s.title}</a>`).join('');
function resize(){const e=$('#stage');$('#slide-frame').style.setProperty('--scale',matchMedia('(max-width:700px)').matches?1:Math.min(e.clientWidth/1360,e.clientHeight/800));}
new ResizeObserver(resize).observe($('#stage'));
function menu(open){document.body.classList.toggle('menu-open',open);$('#sidebar').hidden=!open;$('#sidebar').inert=!open;$('#menu').setAttribute('aria-expanded',String(open));resize();}
$('#menu').onclick=()=>menu(!document.body.classList.contains('menu-open'));
function setHash(){history.replaceState(null,'',`#${current}${step?'.'+step:''}`);}
function update(){const el=$('#slide'),s=slides[current-1],previousStep=Number(el.dataset.step);el.dataset.step=step;el.querySelectorAll('[data-emphasize]').forEach(e=>e.classList.toggle('emphasized',step>=Number(e.dataset.emphasize)));el.querySelectorAll('[data-show]').forEach(e=>{const visible=step>=Number(e.dataset.show);e.classList.toggle('visible',visible);e.setAttribute('aria-hidden',String(!visible));});
 if(current===4){const titles=['Кодируем <em>БАОБАБ</em>','Шаг 1: делим на <em>символы</em>','Шаг 2: код для <em>каждой буквы</em>','Склеиваем: <em>14 бит</em>','Коды <em>разной длины</em>'];const h=$('#encoding-title');if(h.innerHTML!==titles[step]){h.innerHTML=titles[step];if(!matchMedia('(prefers-reduced-motion: reduce)').matches)h.animate([{opacity:.3},{opacity:1}],{duration:350});}}
 if(current===6){const titles=['Добавим букву <em>Т = 01</em>','Читаем заново: <em>БТОТОББ?!</em>','Один код — <em>два слова</em>','Это <em>неоднозначность</em>'];$('#ambiguity-title').innerHTML=titles[step];}
 if(current===5){el.querySelectorAll('[data-bit]').forEach(e=>{const i=Number(e.dataset.bit);e.className='bit-token'+(i<step?' read '+e.dataset.color:'')+(i===step-1&&step<binary.length?' current-bit':'');});el.querySelectorAll('[data-end]').forEach(e=>{const decoded=step>=Number(e.dataset.end);e.classList.toggle('decoded',decoded);e.setAttribute('aria-hidden',String(!decoded));});const done=ends.filter(x=>x<=step).length,start=done?ends[done-1]:0,prefix=binary.slice(start,step);$('#read-status').textContent=step===14?'10 → Б. Последняя буква найдена.':step===0?'Начнём с первого бита.':prefix?`Прочитали ${prefix}. Такого кода пока нет — читаем дальше.`:`${codes[letters[done-1]]} → ${letters[done-1]}. Буква найдена; начинаем новый код.`;$('.decode-result').textContent=step===14?'Получили слово БАОБАБ. Все 14 бит прочитаны.':'';}
 if(current===12||current===13)updateWorkedTree();
 if(current===13&&step===5&&previousStep!==5)celebrateTreeAnswer();
 $('#prev').disabled=current===1&&step===0;$('#next').disabled=current===slides.length&&step===s.steps;$('#status').textContent=s.title;setHash();}
function render(){const match=location.hash.match(/^#(\d+)(?:\.(\d+))?$/);current=match?Math.max(1,Math.min(slides.length,Number(match[1]))):1;step=Math.min(Number(match?.[2]||0),slides[current-1].steps);const s=slides[current-1],el=$('#slide');document.querySelectorAll('.lesson-celebration').forEach(e=>e.remove());el.dataset.step='-1';el.className='lesson-four slide-'+current;el.innerHTML=s.body+(s.question?`<button class="question" aria-expanded="false" aria-controls="helper"><b>?</b>${s.question}</button><div id="helper" class="helper" hidden>${s.answer}</div>`:'');el.scrollTop=0;if(current===8)initTrainer();if(s.question)$('.question').onclick=()=>{const open=$('#helper').hidden;$('#helper').hidden=!open;$('.question').setAttribute('aria-expanded',String(open));};document.title=s.title+' · Задание 4';$('#outline').querySelectorAll('a').forEach(a=>{const active=Number(a.dataset.slide)===current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});update();resize();}
function go(dir){const s=slides[current-1];if(dir>0&&step<s.steps){step++;update();return;}if(dir<0&&step>0){step--;update();return;}const next=current+dir;if(next<1||next>slides.length)return;location.hash='#'+next+(dir<0&&slides[next-1].steps?'.'+slides[next-1].steps:'');}
$('#next').onclick=()=>go(1);$('#prev').onclick=()=>go(-1);$('#slide').onclick=e=>{if(!e.target.closest('a,button,input,select,.helper')&&step<slides[current-1].steps)go(1);};$('#outline').onclick=e=>{if(e.target.closest('a')&&matchMedia('(max-width:700px)').matches)menu(false);};
addEventListener('hashchange',()=>{const old=$('#slide').cloneNode(true);old.removeAttribute('id');old.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));old.classList.add('outgoing');old.inert=true;old.setAttribute('aria-hidden','true');$('#slide-frame').append(old);render();if(matchMedia('(prefers-reduced-motion: reduce)').matches){old.remove();return;}old.animate([{opacity:1},{opacity:0}],{duration:500,easing:'ease-in-out'}).finished.catch(()=>{}).finally(()=>old.remove());$('#slide').animate([{opacity:0},{opacity:1}],{duration:500,easing:'ease-in-out'});});
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,select,textarea'))return;if(e.key==='ArrowRight'||(e.key===' '&&!e.target.closest('button,a'))){e.preventDefault();go(1);}if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}if(e.key==='Escape'){menu(false);if($('#helper')){$('#helper').hidden=true;$('.question').setAttribute('aria-expanded','false');}}});render();
