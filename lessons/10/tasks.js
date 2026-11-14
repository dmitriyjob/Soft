'use strict';
const ipTasks={
 network:{number:245,type:1,ip:[217,8,244,3],mask:[255,255,252,0],network:[217,8,244,0],answerPrefix:22,titles:['Адрес сети по IP и маске','Переводим в <em>двоичную</em>','Умножаем <em>побитово</em>','Лайфхак: считаем <em>один байт</em>','Ответ: <em>217.8.244.0</em>']},
 maximum:{number:250,type:2,ip:[111,81,200,27],network:[111,81,192,0],answerPrefix:20,titles:['Наибольший третий байт маски','Наибольший третий байт маски','Где в сети 1 — в маске <em>1</em>','Где у IP 1, а у сети 0 — <em>0</em>','Между ними — <em>выбор границы</em>','Наибольшее → ставим <em>единицы: 240</em>']},
 minimum:{number:10154,type:2,ip:[148,195,140,28],network:[148,195,140,0],answerPrefix:22,titles:['Наименьшее количество единиц в маске','Наименьшее количество единиц в маске','Последняя 1 сети — в маске <em>1</em>','Первая «погашенная» 1 — <em>0</em>','Между — <em>выбор</em>','Наименьшее → <em>нули: 8 + 8 + 6 = 22</em>']}
};
let taskExpanded={},taskPrefix=22,taskAnimations=[],taskAnimationGeneration=0;
const taskBits=values=>values.map(n=>toByte(n)).join('');
function maskConstraints(task){
 const ip=taskBits(task.ip),network=taskBits(task.network);
 const minimum=network.lastIndexOf('1')+1;
 const firstOff=[...ip].findIndex((bit,i)=>bit==='1'&&network[i]==='0');
 return {minimum,maximum:firstOff<0?32:firstOff};
}
function taskByteRow(kind,label,values,expandable=true){
 const octets=Array.from({length:4},(_,i)=>{
  const content=`<span class="octet-decimal">${values?values[i]:''}</span><span class="octet-bits">${Array.from({length:8},(_,col)=>`<span class="address-bit" data-task-bit="${i*8+col}"><span class="task-result-digit">${values?toByte(values[i])[col]:kind==='mask'?'?':''}</span></span>`).join('')}</span>${expandable?'<small>8 бит ▸</small>':''}`;
  return expandable?`<button class="expandable-byte task-byte" type="button" data-task-expand="${kind}:${i}" aria-expanded="false" aria-label="${label}: число ${values[i]}, показать восемь бит">${content}</button>`:`<div class="expandable-byte task-byte expanded">${content}</div>`;
 }).join('');
 return `<div class="reveal-byte-row task-byte-row task-${kind}" data-task-row="${kind}"><b>${label}</b><div class="expandable-octets">${octets}</div><code class="task-row-address"></code></div>`;
}
function ipTaskLesson(id){
 const task=ipTasks[id],direct=id==='network';
 const banner=direct?`<span><b>IP-адрес:</b> ${task.ip.join('.')}</span><span><b>Маска:</b> ${task.mask.join('.')}</span><span>→ найдите адрес сети</span>`:`<span><b>IP:</b> ${task.ip.join('.')}</span><span><b>Адрес сети:</b> ${task.network.join('.')}</span><span>→ ${id==='maximum'?'наибольшее значение <strong>третьего байта</strong> маски?':'наименьшее количество единиц в маске?'}</span>`;
 return `<div class="kicker">ЗАДАЧА ${task.number} · ТИП ${task.type}${direct?'':' · ВОССТАНАВЛИВАЕМ МАСКУ'}</div><h2 id="ip-task-title">${task.titles[0]}</h2><div class="task-banner">${banner}</div><div class="task-bit-table" data-task-id="${id}"><div class="task-network-labels" hidden><span>ЧАСТЬ СЕТИ</span><span>ЧАСТЬ УЗЛА</span></div>${taskByteRow('ip','IP',task.ip)}${taskByteRow('mask','Маска',direct?task.mask:null,direct)}${taskByteRow('network',direct?'Сеть':'Сеть (дано)',direct?null:task.network,!direct)}${dividerHandle('task-divider','Длина префикса для проверки маски',0,32,task.answerPrefix)}</div><div class="lesson-note task-note" id="ip-task-note"></div><div class="task-tools"><span id="task-progress" role="status"></span><button class="task-replay" type="button" hidden>Повторить вычисление</button><div class="task-prefix-presets" hidden>${[18,19,20,21,22,23,24,27,28].map(n=>`<button type="button" data-task-prefix="${n}">/${n}</button>`).join('')}</div></div><div class="task-check" id="task-check" role="status" hidden></div><div class="task-confetti" aria-hidden="true"></div>`;
}
function stopTaskAnimations(){taskAnimationGeneration++;taskAnimations.forEach(animation=>animation.cancel());taskAnimations=[];document.querySelector('#slide .task-confetti')?.replaceChildren();}
function setTaskRow(kind,values,force=false){
 const row=$(`#slide [data-task-row="${kind}"]`);
 row.querySelectorAll('.task-byte').forEach((octet,i)=>{
  const expanded=force||Boolean(taskExpanded[kind]?.[i]);octet.classList.toggle('expanded',expanded);if(octet.tagName==='BUTTON')octet.setAttribute('aria-expanded',String(expanded));
  octet.querySelector('.octet-decimal').textContent=values?values[i]:'';
  octet.querySelectorAll('.address-bit').forEach((el,col)=>{const bit=values?toByte(values[i])[col]:kind==='mask'?'?':'';el.querySelector('.task-result-digit').textContent=bit;el.dataset.bit=bit;});
 });
 row.querySelector('.task-row-address').textContent=values&&force?values.join('.'):kind==='mask'&&!values?'?':'';
}
function animateTaskResult(){
 if(reduceMotion())return;
 const token=taskAnimationGeneration,frame=$('#slide-frame').getBoundingClientRect(),scale=matchMedia('(max-width:700px)').matches?1:frame.width/1360;
 const result=[...$('#slide .task-network').querySelectorAll('.address-bit')];
 $('#slide .task-network .task-row-address').style.visibility='hidden';
 result.forEach((cell,i)=>{
  const source=$(`#slide .task-ip [data-task-bit="${i}"]`),mask=$(`#slide .task-mask [data-task-bit="${i}"]`),a=source.getBoundingClientRect(),b=cell.getBoundingClientRect();
  const digit=cell.querySelector('.task-result-digit');
  const animation=digit.animate([{opacity:0,transform:`translate(${(a.left-b.left)/scale}px,${(a.top-b.top)/scale}px) scale(.85)`},{opacity:1,offset:.2},{opacity:1,transform:'translate(0,0) scale(1)'}],{duration:650,delay:i*55,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});
  taskAnimations.push(animation,mask.animate([{boxShadow:'0 0 0 2px '+(mask.dataset.bit==='1'?'#2ebd8e':'#b35837')},{boxShadow:'0 0 0 0 transparent'}],{duration:750,delay:i*55}));
 });
 $('#task-progress').textContent='Применяем маску слева направо…';
 Promise.all(taskAnimations.map(animation=>animation.finished.catch(()=>{}))).then(()=>{if(token===taskAnimationGeneration&&$('#task-progress')){$('#task-progress').textContent='Готово: 32 бита адреса сети получены.';$('#slide .task-network .task-row-address').style.visibility='';}});
}
function taskConfetti(){
 if(reduceMotion())return;const host=$('#slide .task-confetti');host.replaceChildren();const colors=['#244d85','#e46e50','#23804c','#b88325','#7954ba'];
 for(let i=0;i<36;i++){
  const piece=document.createElement('i');piece.style.left=(i*37%100)+'%';piece.style.background=colors[i%colors.length];host.append(piece);
  taskAnimations.push(piece.animate([{opacity:0,transform:`translate(0,35px) rotate(${i*29}deg)`},{opacity:1,offset:.15},{opacity:0,transform:`translate(${(i%7-3)*17}px,-${110+i%6*22}px) rotate(${i*29+220}deg)`}],{duration:1700+i%4*120,delay:i%9*40,fill:'both',easing:'ease-out'}));
 }
}
function updateIPTask(id,previous){
 const task=ipTasks[id],direct=id==='network',bounds=maskConstraints(task),root=$('#slide');
 const changingStep=previous!==step;
 if(changingStep){stopTaskAnimations();root.querySelector('.task-confetti').replaceChildren();}
 if(step===5&&changingStep)taskPrefix=task.answerPrefix;
 $('#ip-task-title').innerHTML=task.titles[step];
 setTaskRow('ip',task.ip,step>=1);
 if(direct){
  setTaskRow('mask',task.mask,step>=1);setTaskRow('network',step>=2?task.network:null,true);
  $('#slide .task-network .task-row-address').style.visibility='';
  const labels=$('#slide .task-network-labels');labels.hidden=step<2;labels.style.setProperty('--task-cut','68.75%');
  $('#task-divider-bar').hidden=step<2;$('#task-divider').disabled=true;$('#task-divider span').textContent='/22';
  root.classList.toggle('task-shortcut',step>=3);root.classList.toggle('task-answer',step===4);
  root.querySelectorAll('.task-byte-row .address-bit').forEach(el=>el.classList.toggle('task-erased',step>=3&&el.closest('.task-network')&&taskBits(task.ip)[Number(el.dataset.taskBit)]==='1'&&Number(el.dataset.taskBit)>=22));
  root.querySelectorAll('.task-ip .task-byte').forEach((el,i)=>el.classList.toggle('task-middle-octet',step>=3&&i===2));
  for(const kind of ['mask','network'])root.querySelectorAll(`.task-${kind} .task-byte`).forEach((el,i)=>{el.classList.toggle('task-copy-octet',step>=3&&i<2);el.classList.toggle('task-middle-octet',step>=3&&i===2);el.classList.toggle('task-zero-octet',step>=3&&i===3);});
  $('#ip-task-note').innerHTML=[
   'Дано: IP и маска. Нужно найти <strong>адрес сети</strong> — применить побитовое И.<small>Кликни по числам — переведём в двоичную. Или жми «Дальше».</small>',
   'Каждое число — в 8 бит. <code>255</code> — это восемь единиц, <code>252</code> = 255 − 3 = <code>11111100</code>.',
   'Где в маске <strong>1</strong> — бит остаётся, где <strong>0</strong> — получается 0. Вычисляем каждый разряд независимо.',
   '<strong>217</strong> и <strong>8</strong> стоят над 255 — копируем. Под нулём — <strong>0</strong>. Считать нужно только третий байт: <code>11110100 &amp; 11111100 = 11110100</code> = <strong>244</strong>.',
   'Адрес сети — <strong>217.8.244.0</strong>. Первые 22 бита — часть сети, оставшиеся 10 бит обнулены.'
  ][step];
  $('#slide .task-replay').hidden=step<2;$('#slide .task-prefix-presets').hidden=true;$('#task-check').hidden=true;
  $('#task-progress').textContent=step>=2?'Готово: 32 бита адреса сети получены.':'';
  if(step===2&&previous<2)animateTaskResult();
 }else{
  setTaskRow('network',task.network,step>=1);
  const chosen=step===5?prefixOctets(taskPrefix):null;setTaskRow('mask',chosen,true);
  root.querySelectorAll('.task-mask .address-bit').forEach((el,i)=>{
   let state='unknown',bit='?';
   if(step>=2&&i<bounds.minimum){state='required-one';bit='1';}
   if(step>=3&&i>=bounds.maximum){state='required-zero';bit='0';}
   if(step>=4&&i>=bounds.minimum&&i<bounds.maximum)state='flexible';
   if(step===5){bit=i<taskPrefix?'1':'0';state=i>=bounds.minimum&&i<bounds.maximum?'flexible':i<taskPrefix?'required-one':'required-zero';}
   el.className='address-bit task-'+state;el.dataset.bit=bit;el.querySelector('.task-result-digit').textContent=bit;
  });
  root.querySelectorAll('.task-ip .address-bit,.task-network .address-bit').forEach(el=>{const i=Number(el.dataset.taskBit);el.classList.toggle('task-important',step>=2&&i===bounds.minimum-1||step>=3&&i===bounds.maximum);});
  $('#task-divider-bar').hidden=step!==5;$('#task-divider').disabled=step!==5;$('#task-divider').setAttribute('aria-valuenow',taskPrefix);$('#task-divider').setAttribute('aria-valuetext','/'+taskPrefix+', маска '+prefixOctets(taskPrefix).join('.'));$('#task-divider span').textContent='/'+taskPrefix;
  $('#slide .task-network-labels').hidden=true;$('#slide .task-replay').hidden=true;$('#slide .task-prefix-presets').hidden=step!==5;
  root.querySelectorAll('[data-task-prefix]').forEach(button=>{const value=Number(button.dataset.taskPrefix);button.hidden=id==='maximum'?![18,19,20,21].includes(value):![21,22,23,24,27,28].includes(value);button.setAttribute('aria-pressed',String(value===taskPrefix));});
  const maximumNotes=[
   'Переводим IP и адрес сети в двоичную. Нужно <strong>восстановить маску</strong> — такую, чтобы IP &amp; маска = сеть.<small>Кликни по числам — переведём в двоичную. Или жми «Дальше».</small>',
   'Переводим IP и адрес сети в двоичную. Нужно <strong>восстановить маску</strong> — такую, чтобы IP &amp; маска = сеть.',
   'Если в адресе сети стоит <strong>1</strong>, то и в маске там 1 — иначе получился бы 0. Единицы маски идут подряд: <strong>всё левее</strong> — тоже единицы. Обязательны первые <strong>18</strong> единиц.',
   'Здесь у IP <strong>1</strong>, а в сети <strong>0</strong>. Значит маска «погасила» этот бит — в ней <strong>0</strong>. А после нуля в маске только нули.',
   'В жёлтых клетках IP содержит нули, поэтому результат не меняется. Но в маске сохраняем порядок: <strong>сначала единицы, затем нули</strong>. Возможны /18, /19 и /20.',
   'Спрашивают <strong>наибольшее</strong> — значит, единиц побольше: <code>11110000</code> = <strong>240</strong>. Тяни границу и проверь: на /21 сеть уже не совпадёт.'
  ];
  const minimumNotes=[
   'Снова восстанавливаем маску по IP и адресу сети. Начинаем с перевода в двоичную.<small>Кликни по числам — переведём в двоичную. Или жми «Дальше».</small>',
   'Снова восстанавливаем маску по IP и адресу сети. Начинаем с перевода в двоичную.',
   'Самая правая единица адреса сети — в третьем байте. В маске до неё <strong>обязательно единицы</strong>: 8 + 8 + 6 = <strong>22</strong>.',
   'В четвёртом байте у IP есть единица, а в сети там <strong>0</strong> → в маске <strong>0</strong>, и дальше только нули.',
   'Жёлтые места не меняют сеть: у IP там нули. Выбираем границу, сохраняя порядок единиц и нулей. Подходят префиксы <strong>от /22 до /27</strong>.',
   'Нужно <strong>наименьшее</strong> количество единиц — в жёлтые ставим нули. Единиц: 8 + 8 + 6 = <strong>22</strong>. Маска <code>255.255.252.0</code>.'
  ];
  $('#ip-task-note').innerHTML=(id==='maximum'?maximumNotes:minimumNotes)[step];
  $('#task-progress').textContent=step===4?`Допустимые префиксы: /${bounds.minimum}…/${bounds.maximum}`:'';
  $('#task-check').hidden=step!==5;
  if(step===5){const calculated=task.ip.map((value,i)=>value&chosen[i]),matches=calculated.every((value,i)=>value===task.network[i]);$('#task-check').className='task-check '+(matches?'matches':'mismatch');$('#task-check').textContent=`Проверка /${taskPrefix}: IP & маска = ${calculated.join('.')} ${matches?'✓ Сеть совпадает':'× Сеть не совпадает'}`;}
 }
 if((direct&&step>=2)||(!direct&&step===5))positionDivider('task-divider',direct?22:taskPrefix,root.querySelectorAll('.task-ip .address-bit'));
 if(changingStep&&step===(direct?4:5))taskConfetti();
}
function initIPTask(id){
 taskExpanded={ip:[false,false,false,false],mask:[false,false,false,false],network:[false,false,false,false]};taskPrefix=ipTasks[id].answerPrefix;
 if(id!=='network')bindDivider('task-divider','.task-ip .address-bit',0,32,()=>taskPrefix,value=>{taskPrefix=value;updateIPTask(id,step);});
}
function ipTaskClick(event){
 const button=event.target.closest('button');if(!button)return false;const s=slides[current-1];if(s.type!=='ip-task')return false;
 if(button.dataset.taskExpand){if(step===0){const [kind,index]=button.dataset.taskExpand.split(':');taskExpanded[kind][Number(index)]=!taskExpanded[kind][Number(index)];updateIPTask(s.task,step);}return true;}
 if(button.matches('.task-replay')){stopTaskAnimations();animateTaskResult();return true;}
 if(button.dataset.taskPrefix){taskPrefix=Number(button.dataset.taskPrefix);updateIPTask(s.task,step);return true;}
 return false;
}
addEventListener('resize',()=>{const s=slides[current-1];if(s.type==='ip-task'&&(s.task==='network'?step>=2:step===5))positionDivider('task-divider',s.task==='network'?22:taskPrefix,$('#slide').querySelectorAll('.task-ip .address-bit'));});
