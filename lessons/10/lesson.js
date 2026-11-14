'use strict';
const $=selector=>document.querySelector(selector);
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const octets=[192,168,0,1];
const weights=[128,64,32,16,8,4,2,1];
const toByte=value=>value.toString(2).padStart(8,'0');
const reveal=(n,html,cls='')=>`<div class="reveal ${cls}" data-show="${n}">${html}</div>`;
const tile=(value,cls='')=>`<span class="flip-tile ${cls}"><span class="digit-value">${value}</span></span>`;
function cover(){
 return `<div class="ip-cover"><section><div class="cover-label"><b>№10</b><span>ЕГЭ ПО ИНФОРМАТИКЕ · БЫВШИЙ №13</span></div><h1>IP-адреса<br>и <em>маски</em></h1><p class="lead">Как устроен адрес любого устройства в интернете — и как по нему найти сеть, дом и квартиру.</p><div class="topic-pills">${['IP-адрес','Маска','Задачи','Сколько адресов','Python','Итог'].map((s,i)=>`<span><small>0${i+1}</small>${s}</span>`).join('')}</div><p class="cover-hint"><kbd>→</kbd> листать <kbd>←</kbd> назад</p></section><section class="router-board" aria-label="IP-адрес роутера 192.168.0.1 в десятичной и двоичной записи"><div class="router-board-heading"><span><i></i> домашний роутер</span><b>192.168.0.1</b></div>${octets.map(n=>`<div class="router-byte"><div class="decimal-tiles">${[...String(n).padStart(3,' ')].map(c=>tile(c)).join('')}</div><span class="conversion-arrow">→</span><div class="cover-byte">${[...toByte(n)].map(c=>tile(c,c==='1'?'one':'')).join('')}</div></div>`).join('')}<div class="board-labels"><span>ДЕСЯТИЧНЫЙ</span><span>ДВОИЧНЫЙ · 8 БИТ</span></div></section></div>`;
}
const journeyTitles=['Зачем вообще нужен <em>адрес?</em>','Письмо едет <em>по адресу</em>','Ответ идёт <em>обратно</em>','В интернете — <em>то же самое</em>','Пакет летит <em>по IP-адресу</em>','Ответ сервера — <em>на телефон</em>'];
const journeyNotes=[
 'Адрес однозначно определяет место: <strong>город, улица, дом, квартира</strong>. На конверте их два — <strong>кому и от кого</strong>.',
 'Почта читает адрес <strong>«кому»</strong> и передаёт письмо дальше — пока оно не попадёт в нужный дом и квартиру.',
 'Для ответа меняем <strong>отправителя и получателя</strong> местами. Письмо проходит те же почтовые отделения в обратную сторону.',
 'В интернете всё так же. Вместо квартир — <strong>устройства</strong>, вместо почты — <strong>роутеры</strong>, а вместо адреса — <strong>IP-адрес</strong>.<div class="analogy-tags"><span>квартира → <b>устройство</b></span><span>почта → <b>роутер</b></span><span>адрес → <b>IP-адрес</b></span></div>',
 'Телефон отправляет запрос. На «конверте» — <strong>кому и от кого</strong>. Маршрутизаторы читают адрес и передают данные дальше.',
 'Сервер игры отправляет ответ <strong>телефону</strong>. Адреса меняются местами, пакет проходит через маршрутизаторы в обратную сторону.'
];
function journey(){return `<div class="kicker">IP-АДРЕС · ИДЕЯ</div><h2 id="journey-title">${journeyTitles[0]}</h2><div class="journey-stage">${routeScene('post')}${routeScene('internet')}</div><div class="journey-controls"><span id="journey-status" role="status"></span><button class="replay-journey" type="button" hidden>Повторить маршрут</button></div><div class="lesson-note" id="journey-note">${journeyNotes[0]}</div>`;}
const byteTitles=['Четыре числа <em>через точку</em>','Каждое число — <em>1 байт</em>','1 байт = <em>8 бит</em>','Байт: от 0 до <em>255</em>','Проверь себя'];
const addressOptions=['10.34.168.35','256.10.1.1','192.168.1','0.0.0.0','1.2.3.4.5'];
function validIPv4(value){const parts=value.split('.');return parts.length===4&&parts.every(p=>/^(0|[1-9]\d{0,2})$/.test(p)&&Number(p)<=255);}
function bytesLesson(){
 return `<div class="kicker">ИЗ ЧЕГО СОСТОИТ IP-АДРЕС</div><h2 id="byte-title">${byteTitles[0]}</h2><div class="ip-octets">${octets.map((n,i)=>`${i?'<span class="ip-dot" aria-hidden="true">.</span>':''}<div class="ip-octet"><b>${n}</b>${reveal(1,'1 байт','byte-underline')}${reveal(2,'8 бит','byte-badge')}</div>`).join('')}</div><div class="byte-cards">${reveal(2,'<h3>4 × 8 = 32 бита</h3><p>столько бит в IPv4-адресе</p>','card')}${reveal(3,'<h3>каждое число 0…255</h3><p>8 единиц = 11111111₂ = 255.<br>Больше в один байт не влезет.</p>','card')}${reveal(4,`<div class="mini-label">ЭТО IP-АДРЕС? <small>КЛИКНИ</small></div><div class="address-options">${addressOptions.map(value=>`<button type="button" data-address="${value}" aria-label="Проверить адрес ${value}">${value}</button>`).join('')}</div><p id="ip-feedback" role="status"></p>`,'card address-quiz')}</div>`;
}
let byteValue=0;
function byteLab(){
 return `<div class="kicker">ПЕРЕВОД В ДВОИЧНУЮ · ПОПРОБУЙ САМ</div><h2>Собери <em>байт</em></h2><div class="byte-lab"><section><div class="bit-switches" role="group" aria-label="Восемь разрядов байта">${weights.map(weight=>`<button class="bit-switch" type="button" role="switch" aria-checked="false" aria-label="Разряд ${weight}" data-weight="${weight}"><span class="bit-weight">${weight}</span><span class="switch-track"><span class="switch-knob"></span></span><span class="switch-digit">0</span></button>`).join('')}</div><div class="byte-total" aria-live="polite"><code id="lab-binary">00000000</code><span>=</span><strong id="lab-decimal">0</strong></div><div class="byte-presets"><span>Собери:</span>${[192,168,255,1,10,34].map(value=>`<button type="button" data-byte="${value}">${value}</button>`).join('')}</div><button class="reset-byte" type="button">Сбросить тумблеры</button></section><section class="programmer"><h3><span aria-hidden="true">≡</span> Программист</h3><output id="calculator-decimal">0</output><dl><div><dt>HEX</dt><dd id="calculator-hex">0</dd></div><div class="selected-base"><dt>DEC</dt><dd id="calculator-dec">0</dd></div><div><dt>OCT</dt><dd id="calculator-oct">0</dd></div><div><dt>BIN</dt><dd id="calculator-bin">0000 0000</dd></div></dl><label class="sr-only" for="byte-input">Целое число от 0 до 255</label><input id="byte-input" type="text" inputmode="numeric" autocomplete="off" placeholder="введи число 0–255" aria-describedby="byte-input-feedback" aria-invalid="false"><p id="byte-input-feedback" role="status"></p><p class="calculator-note">Калькулятор Windows → ≡ → «Программист». В Python: <code>bin(192)</code> — нули слева дописать самому.</p></section></div>`;
}
const binaryTitles=['192.168.0.1 — <em>в двоичном</em>','192.168.0.1 — <em>в двоичном</em>','192.168.0.1 — <em>в двоичном</em>','Ноль — это <em>одна цифра?</em>','Дописываем <em>нули слева</em>','Единица — <em>тоже 8 бит</em>','Почему нули <em>именно слева?</em>','Так адрес видит <em>компьютер</em>'];
function binaryLesson(){
 return `<div class="kicker">КАК АДРЕС ВИДИТ КОМПЬЮТЕР</div><h2 id="binary-title">${binaryTitles[0]}</h2><div class="binary-board">${octets.map((n,row)=>`<div class="binary-row" data-octet-row="${row}"><div class="binary-decimal">${n}</div><span class="binary-arrow">→</span><div class="binary-octet" aria-label="Двоичная запись числа ${n}">${weights.map((weight,col)=>`<span class="flip-tile" data-column="${col}"><span class="digit-value"></span></span>`).join('')}</div><div class="binary-comment"><span class="binary-count"></span><span class="binary-explain"></span></div></div>`).join('')}</div>${reveal(3,'<strong>Правило:</strong> каждый кусочек IPv4 — <strong>ровно 8 цифр</strong>. Калькулятор и <code>bin()</code> лишние нули не пишут — дописываем их <strong>слева</strong> сами.','binary-rule')}`;
}
const slides=[
 {title:'IP-адреса и маски',group:'Начало',type:'cover',steps:0,body:cover()},
 {title:'Зачем устройству адрес',group:'IP-адрес',type:'journey',steps:5,body:journey()},
 {title:'Четыре числа — 32 бита',group:'IP-адрес',type:'bytes',steps:4,body:bytesLesson()},
 {title:'Собери байт',group:'Двоичная запись',type:'lab',steps:0,body:byteLab()},
 {title:'192.168.0.1 в двоичном',group:'Двоичная запись',type:'binary',steps:7,body:binaryLesson()+paddingExplanation()},
 {title:'Дома, квартиры и сети',group:'Адрес сети',type:'street',steps:5,body:streetLesson()},
 {title:'Сеть и устройство',group:'Адрес сети',type:'split',steps:2,body:splitLesson()},
 {title:'Дом, школа и кафе',group:'Адрес сети',type:'networks',steps:4,body:networksLesson()},
 {title:'Где граница IP-адреса',group:'Граница адреса',type:'boundary-ip',steps:1,body:boundaryIPLesson()},
 {title:'Дом и квартира: двигай границу',group:'Граница адреса',type:'decimal-mask',steps:4,body:decimalMaskLesson()},
 {title:'Маска: выбирай границу',group:'Маска',type:'boundary-mask',steps:3,body:boundaryMaskLesson()},
 {title:'Как работает маска',group:'Маска',type:'and',steps:2,body:andLesson()},
 {title:'Задача 245: адрес сети',group:'Задачи',type:'ip-task',task:'network',steps:4,body:ipTaskLesson('network')},
 {title:'Задача 250: наибольший байт',group:'Задачи',type:'ip-task',task:'maximum',steps:5,body:ipTaskLesson('maximum')},
 {title:'Задача 10154: минимум единиц',group:'Задачи',type:'ip-task',task:'minimum',steps:5,body:ipTaskLesson('minimum')},
 {title:'Единицы, затем нули',group:'Маска',type:'mask-rule',steps:2,body:maskRuleLesson()},
 {title:'Измени маску',group:'Маска',type:'mask-lab',steps:2,body:maskLab()}
];
let current=1,step=0;
let journeyFrame=0,journeyGeneration=0,journeyMotion=null;
let digitAnimations=[],digitGeneration=0;
const ease=value=>value<.5?4*value**3:1-(-2*value+2)**3/2;
const mix=(a,b,p)=>a+(b-a)*p;
function stopJourney(){journeyGeneration++;cancelAnimationFrame(journeyFrame);journeyFrame=0;journeyMotion=null;}
function drawJourney(elapsed){
 const motion=journeyMotion;if(!motion)return true;
 const progress=Math.max(0,elapsed-motion.intro),segment=Math.min(3,Math.floor(progress/900));
 const p=Math.min(1,(progress-segment*900)/780),finished=progress>=3600;
 const a=motion.points[segment],b=motion.points[segment+1];
 let x=mix(a[0],b[0],ease(p)),y=mix(a[1],b[1],ease(p)),scale=motion.scale,angle=Math.sin(p*Math.PI)*(motion.reverse?4:-4);
 if(elapsed<motion.intro){const t=ease(elapsed/motion.intro);x=mix(600,motion.points[0][0],t);y=mix(205,motion.points[0][1],t);scale=mix(2.5,motion.scale,t);angle=mix(-3,0,t);}
 if(finished){[x,y]=motion.points[4];angle=0;}
 motion.parcel.setAttribute('transform',`translate(${x} ${y}) rotate(${angle}) scale(${scale})`);
 motion.parcel.style.opacity=finished&&motion.kind==='post'?'0':'1';
 const nodes=motion.svg.querySelectorAll('.route-node');
 nodes.forEach((node,index)=>{const order=motion.reverse?4-index:index;node.classList.toggle('visited',elapsed>=motion.intro&&(finished||order<=segment));node.classList.toggle('delivered',finished&&order===4);});
 const target=motion.points[4],tag=motion.svg.querySelector('.delivery-tag');
 tag.setAttribute('transform',`translate(${target[0]+15} ${target[1]-82})`);tag.setAttribute('opacity',finished?'1':'0');
 const text=finished?`Доставлено: ${motion.labels[4]}`:`${motion.labels[segment]} → ${motion.labels[segment+1]}`;
 if($('#journey-status').textContent!==text)$('#journey-status').textContent=text;
 return finished;
}
function startJourney(kind,reverse,intro=false){
 stopJourney();const svg=$(`#slide .${kind}-scene`),parcel=svg.querySelector('.route-parcel');
 parcel.innerHTML=kind==='post'?mailDrawing():packetDrawing();
 if(kind==='post'&&reverse){const text=parcel.querySelectorAll('text');['От: Аня','Казань, ул. Баумана, 7, кв. 3','Кому: Иону','г. Москва, ул. Ленина,','д. 12, кв. 5'].forEach((s,i)=>text[i].textContent=s);}
 if(kind==='internet'&&reverse){parcel.querySelector('.packet-to').textContent='кому: 95.24.13.7';parcel.querySelector('.packet-from').textContent='от: 185.12.24.7';}
 const points=reverse?journeyPoints.slice().reverse():journeyPoints,labels=reverse?journeyLabels[kind].slice().reverse():journeyLabels[kind];
 journeyMotion={svg,parcel,kind,reverse,points,labels,intro:intro?450:0,scale:kind==='post'?.72:1};
 const token=journeyGeneration,total=journeyMotion.intro+3600;
 if(reduceMotion()){drawJourney(total);return;}
 drawJourney(0);const started=performance.now();
 const tick=now=>{if(token!==journeyGeneration)return;if(!drawJourney(now-started))journeyFrame=requestAnimationFrame(tick);else journeyFrame=0;};
 journeyFrame=requestAnimationFrame(tick);
}
function updateJourney(previous){
 const internet=step>=3;
 $('#journey-title').innerHTML=journeyTitles[step];$('#journey-note').innerHTML=journeyNotes[step];
 $('#slide .post-scene').classList.toggle('scene-visible',!internet);$('#slide .internet-scene').classList.toggle('scene-visible',internet);
 $('#slide .post-scene').classList.toggle('overview',step===0);
 $('.replay-journey').hidden=step===0||step===3;
 if(step===0){stopJourney();const svg=$('#slide .post-scene');svg.querySelectorAll('.route-node').forEach(n=>n.classList.remove('visited','delivered'));svg.querySelector('.delivery-tag').setAttribute('opacity','0');const parcel=svg.querySelector('.route-parcel');parcel.innerHTML=mailDrawing();parcel.style.opacity='1';parcel.setAttribute('transform','translate(600 205) rotate(-3) scale(2.5)');$('#journey-status').textContent='';}
 else if(step===3){stopJourney();const svg=$('#slide .internet-scene');svg.querySelector('.route-parcel').style.opacity='0';svg.querySelector('.delivery-tag').setAttribute('opacity','0');svg.querySelectorAll('.route-node').forEach(n=>n.classList.remove('visited','delivered'));$('#journey-status').textContent='';}
 else startJourney(internet?'internet':'post',step===2||step===5,step===1&&previous===0);
}
function paintByte(syncInput=true){
 const bits=toByte(byteValue);
 $('#slide').querySelectorAll('[data-weight]').forEach((button,index)=>{const on=bits[index]==='1';button.setAttribute('aria-checked',String(on));button.querySelector('.switch-digit').textContent=on?'1':'0';});
 $('#lab-binary').textContent=bits;$('#lab-decimal').textContent=byteValue;
 $('#calculator-decimal').textContent=byteValue;$('#calculator-dec').textContent=byteValue;$('#calculator-hex').textContent=byteValue.toString(16).toUpperCase();$('#calculator-oct').textContent=byteValue.toString(8);$('#calculator-bin').textContent=bits.slice(0,4)+' '+bits.slice(4);
 if(syncInput)$('#byte-input').value=String(byteValue);
 $('#byte-input').setAttribute('aria-invalid','false');$('#byte-input-feedback').textContent='';
}
function initByteLab(){
 paintByte(false);
 $('#byte-input').addEventListener('input',event=>{
  const raw=event.target.value.trim();if(raw===''){byteValue=0;paintByte(false);return;}
  if(!/^\d{1,3}$/.test(raw)||Number(raw)>255){event.target.setAttribute('aria-invalid','true');$('#byte-input-feedback').textContent='Нужно целое число от 0 до 255.';return;}
  byteValue=Number(raw);paintByte(false);
 });
}
function stopDigits(){digitGeneration++;digitAnimations.forEach(a=>a.cancel());digitAnimations=[];}
function animateDigits(elements,delay=60){
 if(reduceMotion())return Promise.resolve();
 const animations=elements.map((element,i)=>element.animate([{opacity:0,transform:'perspective(300px) translateY(12px) rotateX(-60deg)'},{opacity:1,transform:'perspective(300px) translateY(0) rotateX(0)'}],{duration:450,delay:90+i*delay,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'}));
 digitAnimations.push(...animations);return Promise.all(animations.map(a=>a.finished.catch(()=>{})));
}
function paintBinary(previous){
 stopDigits();const token=digitGeneration;
 $('#binary-title').innerHTML=binaryTitles[step];
 const notes=['128 + 64 — уже 8 цифр','128 + 32 + 8 — тоже 8','дописали 7 нулей слева','было «1» → дописали 7 нулей слева'];
 $('#slide').querySelectorAll('[data-octet-row]').forEach((row,index)=>{
  const active=index<2?step>=index+1:index===2?step>=3:step>=5;
  const short=index===2&&step===3;
  row.classList.toggle('inactive',!active);row.classList.toggle('active',active);
  const padded=index>=2&&active&&!short;
  row.querySelectorAll('.flip-tile').forEach((cell,col)=>{
   const visible=active&&(!short||col===7);cell.classList.toggle('blank',active&&!visible);cell.classList.toggle('one',visible&&toByte(octets[index])[col]==='1');cell.classList.toggle('padded',padded&&col<7);cell.querySelector('.digit-value').textContent=visible?toByte(octets[index])[col]:'';
  });
  const badge=row.querySelector('.binary-count'),note=row.querySelector('.binary-explain');badge.textContent=active?(short?'1 из 8':'8 бит ✓'):'';badge.className='binary-count '+(short?'bad':'good');note.textContent=active?(short?'калькулятор выдаёт просто «0» — одна цифра':notes[index]):'';note.classList.toggle('current',index===(step<=2?step-1:step<=4?2:3));
 });
 if(step<=previous||step===0||step>5)return;
 const index=step===1?0:step===2?1:step<=4?2:3,row=$(`#slide [data-octet-row="${index}"]`);
 if(step===1||step===2)animateDigits([...row.querySelectorAll('.digit-value')]);
 else if(step===3)animateDigits([row.querySelector('[data-column="7"] .digit-value')]);
 else{
  const badge=row.querySelector('.binary-count');badge.textContent='1 из 8';badge.className='binary-count bad';
  const finish=()=>{if(token!==digitGeneration||!row.isConnected)return;badge.textContent='8 бит ✓';badge.className='binary-count good';};
  if(reduceMotion())finish();else animateDigits([...row.querySelectorAll('.flip-tile.padded .digit-value')].reverse(),90).then(finish);
 }
}
function resize(){const host=$('#stage');$('#slide-frame').style.setProperty('--scale',matchMedia('(max-width:700px)').matches?1:Math.min(host.clientWidth/1360,host.clientHeight/800));}
new ResizeObserver(resize).observe($('#stage'));
function menu(open){document.body.classList.toggle('menu-open',open);$('#sidebar').hidden=!open;$('#sidebar').inert=!open;$('#menu').setAttribute('aria-expanded',String(open));$('#menu').setAttribute('aria-label',open?'Скрыть содержание':'Показать содержание');resize();}
function setHash(){history.replaceState(null,'',`#${current}${step?'.'+step:''}`);}
function update(){
 const root=$('#slide'),previous=Number(root.dataset.step),s=slides[current-1];root.dataset.step=String(step);
 root.querySelectorAll('[data-show]').forEach(element=>{const visible=step>=Number(element.dataset.show);element.classList.toggle('visible',visible);element.setAttribute('aria-hidden',String(!visible));element.inert=!visible;});
 if(s.type==='journey')updateJourney(previous);
 if(s.type==='bytes')$('#byte-title').innerHTML=byteTitles[step];
 if(s.type==='binary'){paintBinary(previous);updatePadding();}
 if(s.type==='street')updateStreet();
 if(s.type==='mask-lab')paintMask();
 updateSequence(s.type,previous);
 if(s.type==='ip-task')updateIPTask(s.task,previous);
 $('#prev').disabled=current===1&&step===0;$('#next').disabled=current===slides.length&&step===s.steps;
 $('#slide-count').textContent=`${String(current).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
 $('#status').textContent=root.querySelector('h2')?.textContent||s.title;setHash();
}
function render(){
 stopJourney();stopDigits();stopStreet();stopNetworkDelivery();stopTaskAnimations();const match=location.hash.match(/^#(\d+)(?:\.(\d+))?$/);let n=Number(match?.[1]||1);if(n<1||n>slides.length)n=1;current=n;step=Math.min(Number(match?.[2]||0),slides[n-1].steps);
 const s=slides[n-1],root=$('#slide');root.className='lesson-ten slide-'+s.type;root.dataset.step='-1';root.innerHTML=s.body;root.scrollTop=0;
 if(s.type==='lab')initByteLab();
 if(s.type==='street')$('#street-target').addEventListener('change',e=>startStreet(e.target.value));
 if(s.type==='mask-lab')initMask();
 initSequence(s.type);
 if(s.type==='ip-task')initIPTask(s.task);
 document.title=s.title+' · Задание 10';$('#outline').querySelectorAll('a').forEach(a=>{const active=Number(a.dataset.slide)===n;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 update();resize();
}
function go(direction){
 const s=slides[current-1];
 if(direction>0&&step<s.steps){step++;update();return;}
 if(direction<0&&step>0){step--;update();return;}
 const next=current+direction;if(next<1||next>slides.length)return;location.hash=`#${next}${direction<0&&slides[next-1].steps?'.'+slides[next-1].steps:''}`;
}
$('#outline').innerHTML=slides.map((s,i)=>`${i===0||slides[i-1].group!==s.group?`<div class="group-name">${s.group}</div>`:''}<a href="#${i+1}" data-slide="${i+1}"><span>${String(i+1).padStart(2,'0')}</span>${s.title}</a>`).join('');
$('#menu').onclick=()=>menu(!document.body.classList.contains('menu-open'));
$('#prev').onclick=()=>go(-1);$('#next').onclick=()=>go(1);
$('#outline').onclick=e=>{if(e.target.closest('a')&&matchMedia('(max-width:700px)').matches)menu(false);};
$('#slide').onclick=e=>{
 if(ipTaskClick(e))return;
 if(sequenceClick(e))return;
 if(extensionClick(e))return;
 const button=e.target.closest('button');
 if(button?.matches('.replay-journey')){startJourney(step>=3?'internet':'post',step===2||step===5);return;}
 if(button?.matches('[data-weight]')){byteValue^=Number(button.dataset.weight);paintByte();return;}
 if(button?.matches('[data-byte]')){byteValue=Number(button.dataset.byte);paintByte();return;}
 if(button?.matches('.reset-byte')){byteValue=0;paintByte();return;}
 if(button?.matches('[data-address]')){
  const value=button.dataset.address,valid=validIPv4(value);button.classList.toggle('is-valid',valid);button.classList.toggle('is-invalid',!valid);button.textContent=value+(valid?' ✓':' ×');button.setAttribute('aria-label',value+(valid?' — корректная запись IPv4':' — некорректная запись IPv4'));
  $('#ip-feedback').textContent=valid?(value==='0.0.0.0'?'Запись корректная. 0.0.0.0 — специальный IPv4-адрес.':'Верно: четыре числа от 0 до 255.'):(value.startsWith('256')?'256 больше 255: такое число не помещается в байт.':'В IPv4-адресе должно быть ровно четыре числа.');return;
 }
 if(!e.target.closest('button,a,input,label,select,textarea')&&step<slides[current-1].steps)go(1);
};
addEventListener('hashchange',()=>{
 const old=$('#slide').cloneNode(true);old.removeAttribute('id');old.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));old.classList.add('outgoing');old.setAttribute('aria-hidden','true');old.inert=true;$('#slide-frame').append(old);render();
 if(reduceMotion()){old.remove();return;}
 old.animate([{opacity:1},{opacity:0}],{duration:500,easing:'ease-in-out',fill:'forwards'}).finished.catch(()=>{}).finally(()=>old.remove());$('#slide').animate([{opacity:0},{opacity:1}],{duration:500,easing:'ease-in-out'});
});
document.addEventListener('keydown',e=>{
 if(sequenceKey(e))return;
 if(extensionKey(e))return;
 if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select'))return;
 if(e.key==='ArrowRight'||([' ','Enter'].includes(e.key)&&!e.target.closest('button,a'))){e.preventDefault();go(1);}
 if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}
 if(e.key==='Escape')menu(false);
});
render();
