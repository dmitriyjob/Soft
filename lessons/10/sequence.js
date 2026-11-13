'use strict';
// Reference sequence inserted after the existing #7.2; earlier slides keep their URLs.
const localNetworks=[
 {name:'Дом · Wi-Fi',prefix:'192.168.1.',devices:[['laptop','Ноутбук',2],['phone','Телефон',5],['screen','Телевизор',7]]},
 {name:'Школа',prefix:'10.34.168.',devices:[['screen','Компьютер',5],['printer','Принтер',12],['board','Доска',35]]},
 {name:'Кафе',prefix:'85.143.7.',devices:[['till','Касса',5],['tablet','Планшет',9],['laptop','Ноутбук',20]]}
];
function deviceIcon(type){
 const drawing={laptop:'<rect x="14" y="17" width="36" height="26" rx="3"/><path d="M9 49h46"/>',phone:'<rect x="21" y="10" width="23" height="43" rx="5"/><path d="M30 47h5"/>',screen:'<rect x="10" y="14" width="44" height="31" rx="3"/><path d="M32 45v9M22 54h20"/>',tablet:'<rect x="15" y="11" width="34" height="43" rx="5"/><path d="M29 48h6"/>',printer:'<path d="M18 24V11h28v13M19 43H11V26h43v17h-8M19 35h27v18H19zM24 43h17"/><path d="M44 29h3"/>',board:'<rect x="8" y="13" width="48" height="32" rx="2"/><path d="m25 45-7 11m21-11 7 11M17 24h23M17 31h14"/>',till:'<rect x="17" y="9" width="31" height="46" rx="4"/><rect x="23" y="15" width="19" height="12" rx="1"/><path d="M24 35h2m7 0h2m6 0h1M24 42h2m7 0h2m6 0h1M24 49h2m7 0h9"/>'}[type];
 return `<svg class="device-icon" viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">${drawing}</g></svg>`;
}
function smallRouter(){return '<svg class="small-router" viewBox="0 0 84 54" aria-hidden="true"><path d="m23 20-7-16m46 16 7-16" stroke="#30343b" stroke-width="3" stroke-linecap="round"/><rect x="7" y="19" width="70" height="28" rx="10" fill="#202125"/><g fill="#2ec79b"><circle cx="28" cy="33" r="3.2"/><circle cx="42" cy="33" r="3.2"/><circle cx="56" cy="33" r="3.2"/></g></svg>';}
const networksTitles=['С IP — <em>то же самое</em>','Начало адреса — <span class="network-ink">адрес сети</span>','Конец адреса — <em>номер устройства</em>','Номер <em>5</em> — в каждой сети','Сначала <span class="network-ink">в сеть</span>, потом <em>к устройству</em>'];
const networksNotes=[
 'Вместо улицы — интернет, вместо домов — <b class="network-ink">сети</b>: домашний Wi-Fi, школа, кафе. Вместо квартир — <strong>устройства</strong>. У каждого устройства свой IP-адрес.',
 'У всех устройств одной сети <strong>начало адреса одинаковое</strong>. Оно определяет сеть — как номер дома, общий для всех квартир. Здесь все три сети имеют маску <code>/24</code>.',
 'А последнее число у каждого своё — это <strong>номер устройства</strong> (узла) в сети. Как номер квартиры в доме. Так устроен наш пример с маской <code>/24</code>.',
 'Номер <strong>5</strong> есть и дома, и в школе, и в кафе — как квартира 5 в разных домах. Но полные адреса разные: <code>192.168.1.5</code>, <code>10.34.168.5</code>, <code>85.143.7.5</code>.',
 'Письмо с ноутбука на школьную доску. Маршрут ведёт сначала в <b class="network-ink">нужную сеть</b>, затем к <strong>нужному устройству</strong>. Это учебная схема: устройство отправителя — 192.168.1.2, получателя — 10.34.168.35.'
];
function networksLesson(){
 return `<div class="kicker">АДРЕС СЕТИ И НОМЕР УСТРОЙСТВА</div><h2 id="networks-title">${networksTitles[0]}</h2><div class="networks-visual"><svg class="network-sky" viewBox="0 0 1200 150" aria-hidden="true"><path d="M355 94C260 104 294 5 399 22C435-1 525-3 570 15C620-7 741-1 754 28C843 15 880 83 804 96C721 116 646 94 600 105C516 119 462 105 437 101C390 113 373 105 355 94Z" fill="#e8f0fa" stroke="#c7d8ee" stroke-width="1.6"/><text x="580" y="65" text-anchor="middle" fill="#8ca6cb" font-family="Arial" font-weight="700" font-size="13" letter-spacing="5">ИНТЕРНЕТ</text><g fill="none" stroke="#9db1cd" stroke-width="3"><path d="M185 143v-19C185 105 296 125 300 94M600 143v-38M1015 143v-19C1015 105 884 125 875 94"/></g></svg><div class="network-panels">${localNetworks.map((network,ni)=>`<section class="local-network" data-network="${ni}"><div class="panel-router" data-router="${ni}">${smallRouter()}</div><header><h3>${network.name}</h3><span class="net-address">сеть ${network.prefix}0</span></header><div class="network-devices">${network.devices.map(([icon,name,host],di)=>`<div class="network-device" data-device="${ni}:${di}" data-host="${host}"><span class="device-sender">отправитель</span><span class="device-delivered">доставлено ✓</span>${deviceIcon(icon)}<span class="device-name">${name}</span><code><span class="device-prefix">${network.prefix}</span><span class="device-host">${host}</span></code><span class="device-number">№ ${host}</span></div>`).join('')}</div></section>`).join('')}</div><div class="network-parcel" hidden><b>кому: <span>10.34.168</span>.35</b><small id="packet-routing-hint">какая сеть? → 10.34.168.0</small></div></div><div class="network-delivery-controls" hidden><span id="network-delivery-status" role="status"></span><button class="replay-network-delivery" type="button">Повторить доставку</button></div><div class="lesson-note networks-note" id="networks-note">${networksNotes[0]}</div>`;
}
let networkDeliveryFrame=0,networkDeliveryGeneration=0,networkDelivery=null;
function stopNetworkDelivery(){networkDeliveryGeneration++;cancelAnimationFrame(networkDeliveryFrame);networkDeliveryFrame=0;networkDelivery=null;}
function drawNetworkDelivery(elapsed){
 const m=networkDelivery;if(!m)return true;elapsed=Math.max(0,elapsed);
 const segment=Math.min(3,Math.floor(elapsed/900)),p=ease(Math.min(1,(elapsed-segment*900)/740)),done=elapsed>=3600;
 const a=m.points[segment],b=m.points[segment+1];m.parcel.style.left=(done?b[0]:mix(a[0],b[0],p))+'%';m.parcel.style.top=(done?b[1]:mix(a[1],b[1],p))+'%';m.parcel.hidden=done;
 const school=elapsed>=2700;$('#packet-routing-hint').textContent=school?'какое устройство? → 35':'какая сеть? → 10.34.168.0';
 $('#slide [data-device="1:2"]').classList.toggle('delivery-complete',done);
 $('#network-delivery-status').textContent=done?'Доставлено ✓ Школа · доска · 10.34.168.35':['Ноутбук → домашний роутер','Домашний роутер → интернет','Интернет → сеть школы','Роутер школы → доска № 35'][segment];return done;
}
function startNetworkDelivery(){
 stopNetworkDelivery();const stage=$('#slide .networks-visual'),rect=stage.getBoundingClientRect();
 const point=selector=>{const r=$(selector).getBoundingClientRect();return [(r.left+r.width/2-rect.left)/rect.width*100,(r.top+r.height/2-rect.top)/rect.height*100];};
 networkDelivery={parcel:$('#slide .network-parcel'),points:[point('#slide [data-device="0:0"]'),point('#slide [data-router="0"]'),[50,12],point('#slide [data-router="1"]'),point('#slide [data-device="1:2"]')]};
 const token=networkDeliveryGeneration;if(reduceMotion()){drawNetworkDelivery(3600);return;}
 drawNetworkDelivery(0);const start=performance.now();const tick=now=>{if(token!==networkDeliveryGeneration)return;if(!drawNetworkDelivery(now-start))networkDeliveryFrame=requestAnimationFrame(tick);else networkDeliveryFrame=0;};networkDeliveryFrame=requestAnimationFrame(tick);
}
const boundaryOctets=[192,168,0,1];
let expandedIP=[false,false,false,false],expandedMask=[false,false,false,false];
function revealByteRow(kind,values,open=false){
 return `<div class="reveal-byte-row" data-byte-kind="${kind}"><b>${kind==='ip'?'IP':'Маска'}</b><div class="expandable-octets">${values.map((value,i)=>`<button class="expandable-byte${open?' expanded':''}" type="button" data-expand="${kind}:${i}" aria-label="${kind==='ip'?'Число IP':'Число маски'} ${value}: показать 8 бит" aria-expanded="${open}"><span class="octet-decimal">${value}</span><span class="octet-bits">${[...toByte(value)].map(bit=>`<span class="address-bit" data-bit="${bit}">${bit}</span>`).join('')}</span><small>8 бит ▸</small></button>`).join('')}</div><code class="expanded-address">${values.join('.')}</code></div>`;
}
function boundaryIPLesson(){return `<div class="kicker">АДРЕС СЕТИ И АДРЕС УЗЛА</div><h2 id="boundary-ip-title">Как поделить <em>IP-адрес?</em></h2><div class="ip-boundary-demo"><div class="guess-boundary" hidden><span>АДРЕС СЕТИ?</span><span>АДРЕС УЗЛА?</span><i>пополам?</i></div>${revealByteRow('ip',boundaryOctets)}</div><div class="explanation-pair"><div class="card"><div class="mini-label" id="boundary-question-label">ВОПРОС</div><p id="boundary-question">IP-адрес состоит из двух частей: <b class="network-ink">адрес сети</b> и <strong>адрес узла</strong> (устройства). Где кончается одно и начинается другое?</p></div><div class="card" id="boundary-tip"><div class="mini-label" id="boundary-tip-label">КОМПЬЮТЕР ВИДИТ ДВОИЧНЫЙ</div><p id="boundary-tip-text"><strong>Кликни по числу</strong> — откроются его 8 бит. Или жми «Дальше» — откроются все.</p></div></div>`;}
let decimalBoundary=3;
const decimalAddress='512466';
function dividerHandle(id,label,min,max,value){return `<div class="division-bar" id="${id}-bar"><button type="button" class="division-handle" id="${id}" role="slider" tabindex="0" aria-label="${label}" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${value}" aria-orientation="horizontal">‹ <span>${value}</span> ›</button></div>`;}
function decimalHouse(){return `<svg class="decimal-house" viewBox="0 0 430 370" aria-label="Дом и квартира из выбранных частей адреса"><rect class="decimal-house-body" x="65" y="90" width="265" height="250" rx="10" fill="#f3ece3" stroke="#30343b" stroke-width="2.5"/><rect x="56" y="70" width="282" height="22" rx="7" fill="#202125"/><rect x="140" y="27" width="125" height="36" rx="10" fill="#244d85"/><text id="decimal-house-number" x="202" y="51" text-anchor="middle" fill="white" font-size="19" font-weight="700">дом 512</text>${Array.from({length:25},(_,i)=>`<rect x="${86+i%5*47}" y="${108+Math.floor(i/5)*36}" width="34" height="22" rx="3" fill="${i===4?'#ffd65b':'#dce8f4'}" stroke="${i===4?'#b35837':'#8ca6cb'}" stroke-width="1.7"/>`).join('')}<path d="M308 119h38" stroke="#b35837" stroke-width="2" stroke-dasharray="4 3"/><rect x="345" y="104" width="82" height="30" rx="9" fill="#b35837"/><text id="decimal-flat-number" x="386" y="125" text-anchor="middle" fill="white" font-size="15" font-weight="700">кв. 466</text><rect x="177" y="293" width="41" height="47" rx="5" fill="#202125"/><path d="M10 343h375" stroke="#ded9cf" stroke-width="5" stroke-linecap="round"/><text id="decimal-capacity" x="213" y="367" text-anchor="middle" fill="#767980" font-size="14">3 места под квартиру → до 1 000 вариантов</text></svg>`;}
function decimalMaskLesson(){
 const row=(name,kind)=>`<div class="decimal-demo-row ${kind}"><b>${name}</b><div class="decimal-demo-digits">${[...decimalAddress].map((n,i)=>`<span data-decimal-position="${i}">${kind==='decimal-source'?n:kind==='decimal-mask-row'?(i<3?'1':'0'):(i<3?n:'0')}</span>`).join('')}</div></div>`;
 return `<div class="kicker">АНАЛОГИЯ · ДВИГАЙ ГРАНИЦУ</div><h2 id="decimal-mask-title">Где тут <em>дом</em>, а где <em>квартира?</em></h2><div class="decimal-mask-layout"><div><div class="decimal-demo card">${row('Адрес','decimal-source')}${row('Маска','decimal-mask-row')}${row('Дом','decimal-result')}${dividerHandle('decimal-divider','Граница между номером дома и квартиры',1,5,3)}</div><div class="lesson-note" id="decimal-mask-note"></div><p class="decimal-analogy-note">Десятичная аналогия. В IP-адресе делим двоичные разряды.</p></div>${decimalHouse()}</div>`;
}
let boundaryPrefix=12;
const maskOptions=['255.255.255.0','255.255.0.255','255.240.0.0','255.255.250.0','255.255.255.252'];
function boundaryMaskLesson(){return `<div class="kicker">МАСКА</div><h2 id="boundary-mask-title">Для этого есть <em>маска</em></h2><div class="mask-boundary-demo"><div class="mask-division-labels" hidden><span>АДРЕС СЕТИ</span><span>АДРЕС УЗЛА</span></div>${revealByteRow('ip',boundaryOctets,true)}${revealByteRow('mask',[255,240,0,0])}${dividerHandle('mask-divider','Длина префикса маски',0,32,12)}</div><div class="mask-reference-bottom"><div><div class="card mask-reference-note"><div class="mini-label" id="mask-reference-label">МАСКА СЕТИ</div><p id="mask-reference-description">Ещё 32 бита — такие же 4 байта через точку. Здесь: <code>255.240.0.0</code>.</p></div><div class="current-mask-summary card" hidden><span>СЕЙЧАС</span><b id="boundary-prefix-output">/12</b><code id="boundary-mask-output">255.240.0.0</code><small id="boundary-count-output">12 единиц · 20 нулей</small></div><p class="mask-reference-hint" id="mask-reference-hint">Кликни по числам маски — посмотрим, что внутри.</p></div><div class="mask-validator card" hidden><div class="mini-label">ЭТО МАСКА? <small>КЛИКНИ</small></div><div class="address-options">${maskOptions.map(value=>`<button type="button" data-check-mask="${value}">${value}</button>`).join('')}</div><p id="mask-validation-feedback" role="status"></p></div></div>`;}
function prefixOctets(prefix){return Array.from({length:4},(_,i)=>parseInt(('1'.repeat(prefix)+'0'.repeat(32-prefix)).slice(i*8,i*8+8),2));}
function validSubnetMask(value){return validIPv4(value)&&/^1*0*$/.test(value.split('.').map(n=>toByte(Number(n))).join(''));}
function paintExpanded(kind,values,force){
 const state=kind==='ip'?expandedIP:expandedMask;
 $('#slide').querySelectorAll(`[data-expand^="${kind}:"]`).forEach((button,i)=>{const open=force||state[i];button.classList.toggle('expanded',open);button.setAttribute('aria-expanded',String(open));button.querySelector('.octet-decimal').textContent=values[i];button.querySelectorAll('.address-bit').forEach((el,col)=>{const bit=toByte(values[i])[col];el.textContent=bit;el.dataset.bit=bit;});});
}
function paintDecimalMask(previous=-1){
 const cut=decimalBoundary,home=decimalAddress.slice(0,cut),flat=decimalAddress.slice(cut),mask='1'.repeat(cut)+'0'.repeat(6-cut),result=home+'0'.repeat(6-cut);
 $('#decimal-mask-title').innerHTML=['Где тут <em>дом</em>, а где <em>квартира?</em>','Подсказка — <em>маска</em>','Умножаем <em>цифра на цифру</em>',`Дом <em>${home}</em>, квартира <em>${flat}</em>`,'С IP — <em>то же самое</em>'][step];
 $('.decimal-mask-row').hidden=step<1;$('.decimal-result').hidden=step<2;
 $('#slide').querySelectorAll('[data-decimal-position]').forEach(el=>{const i=Number(el.dataset.decimalPosition),network=i<cut;el.classList.toggle('decimal-network',network);el.classList.toggle('decimal-host',!network);if(el.closest('.decimal-mask-row'))el.textContent=mask[i];if(el.closest('.decimal-result'))el.textContent=result[i];});
 $('#decimal-house-number').textContent='дом '+home;$('#decimal-flat-number').textContent='кв. '+flat;$('#decimal-capacity').textContent=`${6-cut} места под квартиру → ${Math.pow(10,6-cut).toLocaleString('ru-RU')} вариантов`;
 $('#decimal-mask-note').innerHTML=[`Номер записан одной строкой: <code>${decimalAddress}</code>. Граница после ${cut}-й цифры → <b class="network-ink">дом ${home}</b>, <strong>квартира ${flat}</strong>. Сдвинь — и дом уже другой! Без подсказки непонятно, где граница.`,`Подсказка — <strong>маска</strong>: единицы над домом, нули над квартирой. Двигай границу — маска едет вместе с ней: <code>${mask}</code>.`,`Умножаем цифру на цифру: на 1 — остаётся, на 0 — ноль. Получаем <b class="network-ink">часть дома</b>: <code>${result}</code>.`,`Слева от границы — <b class="network-ink">дом ${home}</b>, справа — <strong>квартира ${flat}</strong>. Нули в строке «Дом» сохраняют места разрядов.`,`IP-адрес содержит <b class="network-ink">часть сети</b> и <strong>часть узла</strong>. Маска показывает границу: где единицы — сеть, где нули — устройство. Только всё <strong>в двоичном</strong>.`][step];
 $('#decimal-divider').setAttribute('aria-valuenow',cut);$('#decimal-divider').setAttribute('aria-valuetext',`Дом ${home}, квартира ${flat}`);$('#decimal-divider span').textContent='│';positionDivider('decimal-divider',cut,$('#slide .decimal-source').querySelectorAll('[data-decimal-position]'));
 if(step===2&&previous<2&&!reduceMotion())$('#slide').querySelectorAll('.decimal-result span').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(10px) scale(.7)'},{opacity:1,transform:'none'}],{duration:400,delay:i*85,fill:'backwards'}));
}
function paintBoundaryMask(){
 const prefix=step===0||step===1?12:boundaryPrefix,values=prefixOctets(prefix),address=values.join('.');
 $('#boundary-mask-title').innerHTML=['Для этого есть <em>маска</em>','Сначала единицы, <em>потом нули</em>','Тяни границу — <em>выбирай маску</em>','Это <em>маска?</em>'][step];
 paintExpanded('ip',boundaryOctets,true);paintExpanded('mask',values,step>=1);
 $('#slide [data-byte-kind="mask"] .expanded-address').textContent=address;
 $('#mask-divider-bar').hidden=step===0;$('#mask-divider').disabled=step<2;$('#mask-divider').setAttribute('aria-valuenow',prefix);$('#mask-divider').setAttribute('aria-valuetext',`/${prefix}, маска ${address}`);$('#mask-divider span').textContent='/'+prefix;
 $('#slide .mask-division-labels').hidden=step<2;$('#slide .current-mask-summary').hidden=step<2;$('#slide .mask-validator').hidden=step<3;
 $('#slide .mask-reference-bottom').classList.toggle('with-mask-quiz',step===3);$('#slide .mask-reference-note').classList.toggle('dark-note',step===2);
 $('#mask-reference-label').textContent=['МАСКА СЕТИ','ПРАВИЛО','КАК ДЕЛИТЬ','КАК ДЕЛИТЬ'][step];
 $('#mask-reference-description').innerHTML=[`Ещё 32 бита — такие же 4 байта через точку. Здесь: <code>${address}</code>.`,'В маске сначала <strong>подряд единицы</strong>, потом <strong>подряд нули</strong>. Они не перемешиваются: после нуля — только ноль.','Ведём границу по маске и поднимаем вверх. <b class="network-ink">Слева — часть сети</b>, <strong>справа — часть узла</strong>.','Ведём границу по маске и поднимаем вверх. <b class="network-ink">Слева — часть сети</b>, <strong>справа — часть узла</strong>.'][step];
 $('#mask-reference-hint').textContent=step===0?'Кликни по числам маски — посмотрим, что внутри.':step===1?'Граница одна. Здесь — после 12-й единицы.':'Тяни ручку над битами — маска меняется вместе с границей. Стрелки клавиатуры тоже работают.';
 $('#boundary-prefix-output').textContent='/'+prefix;$('#boundary-mask-output').textContent=address;$('#boundary-count-output').textContent=`${prefix} единиц · ${32-prefix} нулей`;
 for(const kind of ['ip','mask'])$('#slide').querySelectorAll(`[data-expand^="${kind}:"] .address-bit`).forEach((el,i)=>{el.classList.toggle('is-network',step>=2&&i<prefix);el.classList.toggle('is-host',step>=2&&i>=prefix);});
 positionDivider('mask-divider',prefix,$('#slide [data-byte-kind="ip"]').querySelectorAll('.address-bit'));
 const label=$('#slide .mask-division-labels');label.style.setProperty('--cut',prefix/32*100+'%');
}
function positionDivider(id,cut,cells){
 const bar=$('#'+id+'-bar'),box=bar.parentElement.getBoundingClientRect(),items=[...cells].map(el=>el.getBoundingClientRect());if(!items.length)return;
 const x=cut===0?items[0].left:cut===items.length?items.at(-1).right:(items[cut-1].right+items[cut].left)/2;
 bar.style.left=(x-box.left)/box.width*100+'%';$('#'+id).style.transform=`translateX(${cut===0?'0':cut===items.length?'-100%':'-50%'})`;
}
function bindDivider(id,selector,min,max,get,set){
 const handle=$('#'+id);let dragging=false;
 const move=e=>{const cells=[...$('#slide').querySelectorAll(selector)].map(el=>el.getBoundingClientRect());let closest=min,distance=Infinity;for(let cut=min;cut<=max;cut++){const x=cut===0?cells[0].left:cut===cells.length?cells.at(-1).right:(cells[cut-1].right+cells[cut].left)/2;const d=Math.abs(e.clientX-x);if(d<distance){closest=cut;distance=d;}}if(closest!==get())set(closest);};
 handle.addEventListener('pointerdown',e=>{if(handle.disabled)return;e.preventDefault();dragging=true;handle.setPointerCapture(e.pointerId);});
 handle.addEventListener('pointermove',e=>{if(dragging)move(e);});handle.addEventListener('pointerup',e=>{dragging=false;if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);});handle.addEventListener('pointercancel',()=>dragging=false);handle.addEventListener('lostpointercapture',()=>dragging=false);
 handle.addEventListener('keydown',e=>{let value=get();if(['ArrowRight','ArrowUp'].includes(e.key))value++;else if(['ArrowLeft','ArrowDown'].includes(e.key))value--;else if(e.key==='Home')value=min;else if(e.key==='End')value=max;else return;e.preventDefault();e.stopPropagation();set(Math.max(min,Math.min(max,value)));});
}
function initSequence(type){
 if(type==='boundary-ip')expandedIP=[false,false,false,false];
 if(type==='boundary-mask'){expandedMask=[false,false,false,false];bindDivider('mask-divider','[data-byte-kind="ip"] .address-bit',0,32,()=>boundaryPrefix,value=>{boundaryPrefix=value;paintBoundaryMask();});}
 if(type==='decimal-mask')bindDivider('decimal-divider','.decimal-source [data-decimal-position]',1,5,()=>decimalBoundary,value=>{decimalBoundary=value;paintDecimalMask(step);});
}
function updateSequence(type,previous){
 if(type==='networks'){$('#networks-title').innerHTML=networksTitles[step];$('#networks-note').innerHTML=networksNotes[step];$('#slide .network-delivery-controls').hidden=step!==4;if(step===4)startNetworkDelivery();else{stopNetworkDelivery();$('#slide .network-parcel').hidden=true;$('#slide [data-device="1:2"]').classList.remove('delivery-complete');}}
 if(type==='boundary-ip'){paintExpanded('ip',boundaryOctets,step>=1);$('#boundary-ip-title').innerHTML=step?'Где <em>граница?</em>':'Как поделить <em>IP-адрес?</em>';$('#slide .guess-boundary').hidden=!step;$('#boundary-question-label').textContent=step?'ПОПОЛАМ? ПО ТОЧКАМ?':'ВОПРОС';$('#boundary-question').innerHTML=step?'Хочется поделить пополам или по точке. Но <strong>угадать нельзя</strong>: граница бывает в любом месте — даже посреди байта.':'IP-адрес состоит из двух частей: <b class="network-ink">адрес сети</b> и <strong>адрес узла</strong> (устройства). Где кончается одно и начинается другое?';$('#boundary-tip').classList.toggle('dark-note',Boolean(step));$('#boundary-tip-label').textContent=step?'ЧТО ПОМОЖЕТ':'КОМПЬЮТЕР ВИДИТ ДВОИЧНЫЙ';$('#boundary-tip-text').innerHTML=step?'Разберёмся на привычном — <strong>дом и квартира</strong>. А потом вернёмся к IP.':'<strong>Кликни по числу</strong> — откроются его 8 бит. Или жми «Дальше» — откроются все.';}
 if(type==='decimal-mask')paintDecimalMask(previous);
 if(type==='boundary-mask')paintBoundaryMask();
}
function sequenceClick(e){
 const button=e.target.closest('button');if(!button)return false;
 if(button.matches('.division-handle'))return true;
 if(button.matches('.replay-network-delivery')){startNetworkDelivery();return true;}
 if(button.dataset.expand){const [kind,index]=button.dataset.expand.split(':'),state=kind==='ip'?expandedIP:expandedMask;if((slides[current-1].type==='boundary-ip'&&step===0)||(slides[current-1].type==='boundary-mask'&&kind==='mask'&&step===0)){state[Number(index)]=!state[Number(index)];paintExpanded(kind,kind==='ip'?boundaryOctets:[255,240,0,0],false);}return true;}
 if(button.dataset.checkMask){const value=button.dataset.checkMask,valid=validSubnetMask(value);button.classList.toggle('is-valid',valid);button.classList.toggle('is-invalid',!valid);button.textContent=value+(valid?' ✓':' ×');button.setAttribute('aria-label',value+(valid?' — корректная маска':' — некорректная маска'));$('#mask-validation-feedback').textContent=valid?'Верно: подряд единицы, затем подряд нули.':`Не маска: ${value.split('.').map(n=>toByte(Number(n))).join('.')} — единица появилась после нуля.`;return true;}
 return false;
}
function sequenceKey(e){return Boolean(e.target.closest('.division-handle')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Enter',' '].includes(e.key));}
addEventListener('resize',()=>{const type=slides[current-1]?.type;if(type==='decimal-mask')paintDecimalMask(step);if(type==='boundary-mask')paintBoundaryMask();});
