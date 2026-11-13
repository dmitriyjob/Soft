'use strict';
// Additional reveal stages and subnet lessons. All addresses are calculated as unsigned IPv4 values.
function paddingExplanation(){
 const digits=(bits,side)=>[...bits].map((bit,i)=>`<span class="place-bit ${bit==='1'?'significant':side}" style="--arrival:${i*65}ms">${bit}</span>`).join('');
 return `<div class="padding-comparison" hidden><div class="place-row"><b>вес разряда</b><div class="place-digits">${[128,64,32,16,8,4,2,1].map(n=>`<small>${n}</small>`).join('')}</div></div><div class="place-row"><b>нули слева</b><div class="place-digits">${digits('00000001','left-zero')}</div><strong class="correct">= 1 ✓</strong><span>число не изменилось</span></div><div class="place-row"><b>нули справа</b><div class="place-digits">${digits('10000000','right-zero')}</div><strong class="incorrect">= 128 ×</strong><span>уже другое число!</span></div></div><div class="binary-complete" hidden><code>11000000.10101000.00000000.00000001</code><p>Каждый кусочек — <strong>ровно 8</strong> символов. Не хватает — дописываем нули <strong>слева</strong>.</p></div>`;
}
function updatePadding(){
 $('#slide .binary-rule').hidden=step>=6;
 $('#slide .padding-comparison').hidden=step!==6;
 $('#slide .binary-complete').hidden=step!==7;
}
const streetHomes=[{house:7,x:135,floors:2,color:'#f3ece3',prefix:'192.168.1.'},{house:12,x:490,floors:3,color:'#eceaf4',prefix:'10.34.168.'},{house:25,x:845,floors:2,color:'#e7f0e8',prefix:'85.143.7.'}];
const streetTitles=['Как письмо находит <em>квартиру?</em>','Номер дома — <span class="network-ink">общий</span>','Номер квартиры — <em>у каждой свой</em>','Квартира 5 — <em>в каждом доме</em>','Сначала <span class="network-ink">дом</span>, потом <em>квартира</em>','А теперь — <em>IP-адрес</em>'];
const streetNotes=[
 'На улице дома, в домах квартиры. Чтобы письмо дошло, на конверте пишут два числа: <b class="network-ink">номер дома</b> и <strong>номер квартиры</strong>.',
 'У всех квартир одного дома <b class="network-ink">номер дома одинаковый</b>. Дом 12 — общий для кв. 1, кв. 2… кв. 9.',
 'А <strong>номер квартиры</strong> у каждой свой. Двух квартир 5 в одном доме не бывает.',
 'Но кв. 5 есть и в доме 7, и в доме 12, и в доме 25. Одно «кв. 5» — непонятно, куда нести. А <code>дом 12, кв. 5</code> — такая квартира одна на всей улице.',
 'Почтальон сначала ищет <b class="network-ink">дом</b> — идёт по улице и смотрит на таблички. В нужном доме ищет <strong>квартиру</strong>.<small>Кликни любую квартиру — письмо поедет туда.</small>',
 '<div class="analogy-tags"><span>номер дома → <b class="network-ink">адрес сети</b></span><span>номер квартиры → <strong>номер устройства</strong></span></div>IP-адрес устроен так же: начало — <b class="network-ink">сеть</b>, конец — <strong>устройство</strong>. В этом примере маска /24: граница проходит после третьего числа.'
];
function streetLesson(){
 const windowSvg='<rect class="apartment-window" x="23" y="9" width="35" height="20" rx="3"/><path d="M40.5 9v20M23 19h35" fill="none" stroke="#566477" stroke-width="2"/>';
 const houses=streetHomes.map(home=>{
  const top=home.floors===3?45:125;
  const flats=Array.from({length:home.floors*3},(_,i)=>{const n=i+1,x=home.x+12+(i%3)*88,y=275-Math.floor(i/3)*80;return `<g class="apartment" data-apartment="${home.house}:${n}" data-x="${x+40}" data-y="${y+35}" transform="translate(${x} ${y})" role="button" tabindex="-1" aria-label="Дом ${home.house}, квартира ${n}"><rect class="apartment-card" width="81" height="72" rx="12"/>${windowSvg}<g class="flat-delivery-tag"><rect x="-1" y="-12" width="83" height="16" rx="6" fill="#23804c"/><text x="40.5" y="-1" fill="white" text-anchor="middle" font-size="9" font-weight="700">доставлено ✓</text></g><text class="flat-house" x="40.5" y="44">дом ${home.house}</text><rect class="flat-badge" x="19" y="47" width="43" height="17" rx="6"/><text class="flat-number" x="40.5" y="60">кв. ${n}</text><text class="flat-ip" x="40.5" y="53"><tspan>${home.prefix}</tspan><tspan class="host-ink">${n}</tspan></text></g>`;}).join('');
  return `<g class="street-house" data-house="${home.house}"><rect x="${home.x}" y="${top+20}" width="285" height="${380-top}" fill="${home.color}" stroke="#30343b" stroke-width="2"/><path d="M${home.x-12} ${top+20}l20 -20h269l20 20z" fill="#202125"/><rect class="house-sign" x="${home.x+101}" y="${top+30}" width="83" height="29" rx="8"/><text class="house-number" x="${home.x+142.5}" y="${top+50}">дом ${home.house}</text><rect class="network-sign" x="${home.x+47}" y="${top+30}" width="191" height="29" rx="8"/><text class="network-address" x="${home.x+142.5}" y="${top+50}">сеть ${home.prefix}0</text>${flats}<rect x="${home.x+120}" y="360" width="44" height="40" rx="8" fill="#202125"/><circle cx="${home.x+155}" cy="381" r="2" fill="#e7cb75"/></g>`;
 }).join('');
 return `<div class="kicker">АНАЛОГИЯ · УЛИЦА, ДОМА, КВАРТИРЫ</div><h2 id="street-title">${streetTitles[0]}</h2><div class="street-stage"><svg class="street-scene" viewBox="0 0 1200 465" aria-label="Почта и дома 7, 12, 25 с квартирами"><g><rect x="6" y="280" width="103" height="120" rx="2" fill="white" stroke="#30343b" stroke-width="2"/><rect y="265" width="115" height="16" rx="5" fill="#202125"/><text x="57" y="312" text-anchor="middle" font-size="12" font-weight="700" letter-spacing="2">ПОЧТА</text><rect x="44" y="329" width="27" height="18" rx="2" fill="none" stroke="#e46e50" stroke-width="2"/><path d="m44 329 13.5 10L71 329" fill="none" stroke="#e46e50" stroke-width="2"/><rect x="40" y="365" width="34" height="35" rx="6" fill="#202125"/></g>${houses}${[451,806].map(x=>`<g><rect x="${x}" y="365" width="7" height="35" rx="3" fill="#947255"/><ellipse cx="${x+3}" cy="350" rx="19" ry="25" fill="#80b392"/></g>`).join('')}<rect y="400" width="1200" height="12" rx="4" fill="#ded9cf"/><rect y="412" width="1200" height="49" rx="12" fill="#484d56"/><path d="M15 437h1170" stroke="#ddd" stroke-width="3" stroke-dasharray="29 27"/><rect x="1055" y="425" width="130" height="25" rx="4" fill="#244d85" stroke="white" stroke-width="1.5"/><text x="1120" y="442" fill="white" text-anchor="middle" font-size="11" letter-spacing="1" font-weight="700">ул. ПОЧТОВАЯ</text><g class="street-envelope" opacity="0"><rect x="-95" y="-17" width="190" height="34" rx="8" fill="#fffdf7" stroke="#c9b69a" stroke-width="2"/><text class="street-envelope-address" y="5" text-anchor="middle" font-size="14" font-family="monospace" font-weight="700">кому: дом 12, кв. 5</text></g></svg></div><div class="street-controls" hidden><label class="street-target-label">Адрес <select id="street-target" aria-label="Выбрать дом и квартиру">${streetHomes.flatMap(h=>Array.from({length:h.floors*3},(_,i)=>`<option value="${h.house}:${i+1}"${h.house===12&&i===4?' selected':''}>Дом ${h.house}, кв. ${i+1}</option>`)).join('')}</select></label><span id="street-status" role="status"></span><button type="button" class="replay-street">Повторить доставку</button></div><div class="lesson-note" id="street-note">${streetNotes[0]}</div>`;
}
let streetFrame=0,streetGeneration=0,streetMotion=null,streetTarget='12:5';
function stopStreet(){streetGeneration++;cancelAnimationFrame(streetFrame);streetFrame=0;streetMotion=null;}
function drawStreet(elapsed){
 const m=streetMotion;if(!m)return true;
 elapsed=Math.max(0,elapsed);
 const segment=Math.min(2,Math.floor(elapsed/800)),p=ease(Math.min(1,(elapsed-segment*800)/650)),done=elapsed>=2400;
 const a=m.points[segment],b=m.points[segment+1],x=done?b[0]:mix(a[0],b[0],p),y=done?b[1]:mix(a[1],b[1],p);
 m.parcel.setAttribute('transform',`translate(${x} ${y}) scale(${segment===2?mix(1,.6,p):1})`);m.parcel.setAttribute('opacity',done?'0':'1');
 $('#slide').querySelectorAll('.apartment').forEach(el=>el.classList.toggle('flat-delivered',done&&el===m.target));
 $('#slide').querySelectorAll('.street-house').forEach(el=>el.classList.toggle('house-found',elapsed>=1600&&Number(el.dataset.house)===m.house));
 $('#street-status').textContent=done?`Доставлено ✓ Дом ${m.house}, квартира ${m.flat}`:segment===0?'Ищем номер дома…':segment===1?(m.house===7?'Дом 7 — нужный':'Дом 7 — не тот. Идём дальше…'):`Дом ${m.house} ✓ Теперь квартира ${m.flat}`;
 return done;
}
function startStreet(target=streetTarget){
 stopStreet();streetTarget=target;$('#street-target').value=target;const [house,flat]=target.split(':').map(Number),home=streetHomes.find(h=>h.house===house),el=$(`#slide [data-apartment="${target}"]`);if(!home||!el)return;
 const parcel=$('#slide .street-envelope');parcel.querySelector('text').textContent=`кому: дом ${house}, кв. ${flat}`;
 streetMotion={house,flat,target:el,parcel,points:[[57,437],[home.house===7?210:277,437],[home.x+142,437],[Number(el.dataset.x),Number(el.dataset.y)]]};
 const token=streetGeneration;if(reduceMotion()){drawStreet(2400);return;}
 drawStreet(0);const start=performance.now();const tick=now=>{if(token!==streetGeneration)return;if(!drawStreet(now-start))streetFrame=requestAnimationFrame(tick);else streetFrame=0;};streetFrame=requestAnimationFrame(tick);
}
function updateStreet(){
 $('#street-title').innerHTML=streetTitles[step];$('#street-note').innerHTML=streetNotes[step];
 $('#slide .street-controls').hidden=step!==4;
 $('#slide').querySelectorAll('.apartment').forEach(el=>{el.setAttribute('tabindex',step===4?'0':'-1');el.setAttribute('role',step===4?'button':'img');});
 if(step===4)startStreet();else{stopStreet();$('#slide .street-envelope').setAttribute('opacity','0');$('#slide').querySelectorAll('.flat-delivered,.house-found').forEach(el=>el.classList.remove('flat-delivered','house-found'));}
}
function splitLesson(){return `<div class="kicker">IP-АДРЕС · ДВЕ ЧАСТИ</div><h2>Один адрес — <em>сеть и устройство</em></h2><p class="lead">Как «дом 12, квартира 5», только в двоичной записи.</p><div class="split-address"><span class="network-part">192.168.1</span><span>.</span><span class="host-part">35</span></div><div class="split-labels">${reveal(1,'<b>Общая часть</b><p>Определяет сеть — как номер дома.</p>','card network-card')}${reveal(1,'<b>Номер устройства</b><p>Различает устройства внутри сети — как номер квартиры.</p>','card host-card')}</div>${reveal(2,'Здесь сеть <b class="network-ink">192.168.1.0</b>, маска <code>255.255.255.0</code> или <code>/24</code>. Именно <strong>маска</strong> определяет границу. В другом примере она может проходить внутри любого байта.','lesson-note split-note')}`;}
const demoIP=[192,168,1,35];
function bitStrip(values,cls=''){return `<div class="bit-strip ${cls}">${values.map(value=>`<div class="strip-octet">${[...value.toString(2).padStart(8,'0')].map(bit=>`<span data-bit="${bit}">${bit}</span>`).join('')}</div>`).join('')}</div>`;}
function andLesson(){return `<div class="kicker">МАСКА · ПОБИТОВОЕ И</div><h2>Маска оставляет <span class="network-ink">часть сети</span></h2><div class="and-legend"><span><b>1</b> — сохранить бит IP</span><span><b>0</b> — заменить бит на 0</span></div><div class="and-table"><div class="and-line"><b>IP</b>${bitStrip(demoIP)}<code>192.168.1.35</code></div>${reveal(1,`<b>Маска</b>${bitStrip([255,255,255,0],'mask-strip')}<code>255.255.255.0</code>`,'and-line')}${reveal(2,`<b>Сеть</b>${bitStrip([192,168,1,0],'network-strip')}<code>192.168.1.0</code>`,'and-line and-result')}</div>${reveal(2,'<strong>IP И маска = адрес сети.</strong> Первые 24 бита сохранились. Восьмерку бит устройства заменили нулями.','lesson-note')}<div class="and-truth card">Побитовое И: <code>1 И 1 = 1</code><span>Любая другая пара даёт <b>0</b>.</span></div>`;}
function maskRuleLesson(){return `<div class="kicker">МАСКА · ПРАВИЛО</div><h2>Сначала <span class="network-ink">единицы</span>, затем <em>нули</em></h2><p class="lead">В маске единицы идут подряд слева. После первого нуля единиц уже нет.</p><div class="mask-example card"><span class="correct">✓ Корректная маска /26</span>${bitStrip([255,255,255,192],'mask-strip')}<code>255.255.255.192</code></div>${reveal(1,`<span class="incorrect">× Нарушен порядок битов</span>${bitStrip([255,255,255,160],'invalid-strip')}<code>255.255.255.160</code><p>В последнем байте <b>10100000</b>: единица появилась после нуля.</p>`,'mask-example card')}${reveal(2,'<b>Длина префикса /26</b> — это 26 единиц в маске. Оставшиеся 32 − 26 = <strong>6 бит</strong> отведены устройствам: всего <strong>2⁶ = 64 адреса</strong>.','lesson-note')}`;}
let maskPrefix=24;
function subnetFor(prefix){
 const mask=prefix===0?0:(0xffffffff<<(32-prefix))>>>0;
 const ip=demoIP.reduce((n,octet)=>n*256+octet,0),network=(ip&mask)>>>0,total=2**(32-prefix),broadcast=network+total-1;
 const address=n=>[24,16,8,0].map(shift=>(n>>>shift)&255).join('.');
 return {mask,network,total,broadcast,maskAddress:address(mask),networkAddress:address(network),broadcastAddress:address(broadcast)};
}
function maskLab(){return `<div class="kicker">МАСКА · ПОПРОБУЙ САМ</div><h2 id="mask-lab-title">Где заканчивается <span class="network-ink">сеть?</span></h2><p class="lead">Один IP-адрес: <code>192.168.1.35</code>. Меняем только маску.</p><div class="prefix-control card"><label for="mask-prefix">Длина префикса <output id="prefix-value">/24</output></label><input id="mask-prefix" type="range" min="0" max="32" step="1" value="24" aria-describedby="prefix-help"><div class="range-scale"><span>/0</span><span>/8</span><span>/16</span><span>/24</span><span>/32</span></div><p id="prefix-help">Двигай границу: синие биты — сеть, оранжевые — устройство.</p></div><div class="live-mask"><div class="mask-line"><b>Маска</b><div id="live-mask-bits" class="bit-strip">${Array.from({length:4},()=>`<div class="strip-octet">${Array.from({length:8},()=>'<span>0</span>').join('')}</div>`).join('')}</div></div><div class="prefix-legend"><span><i class="network-dot"></i><b id="network-bit-count">24</b> бита сети</span><span><i class="host-dot"></i><b id="host-bit-count">8</b> бит устройства</span></div></div><div class="subnet-results" aria-live="polite"><div class="card"><span>Маска</span><code id="mask-address"></code></div><div class="card"><span>Адрес сети</span><code id="network-address"></code></div><div class="card"><span>Адресов в блоке</span><strong id="address-count"></strong><small id="address-power"></small></div></div><div class="mask-presets">${[8,16,24,26,30,32].map(n=>`<button type="button" data-prefix="${n}">/${n}</button>`).join('')}<span id="block-end"></span></div><p class="mask-footnote" id="mask-footnote"></p>`;}
function paintMask(){
 const data=subnetFor(maskPrefix);$('#prefix-value').textContent='/'+maskPrefix;$('#mask-prefix').value=maskPrefix;$('#mask-prefix').setAttribute('aria-valuetext',`/${maskPrefix}, маска ${data.maskAddress}`);$('#mask-prefix').style.setProperty('--prefix-position',maskPrefix/32*100+'%');
 $('#mask-lab-title').innerHTML=['Где заканчивается <span class="network-ink">сеть?</span>','Больше единиц — <em>меньше адресов</em>','Двигай ползунок — <em>меняй маску</em>'][step];
 $('#live-mask-bits').querySelectorAll('span').forEach((el,i)=>{const network=i<maskPrefix;el.textContent=network?'1':'0';el.className=network?'network-bit':'host-bit';});
 $('#network-bit-count').textContent=maskPrefix;$('#host-bit-count').textContent=32-maskPrefix;$('#mask-address').textContent=data.maskAddress;$('#network-address').textContent=data.networkAddress;$('#address-count').textContent=new Intl.NumberFormat('ru-RU').format(data.total);$('#address-power').textContent=`2${superscript(32-maskPrefix)} = ${data.total.toLocaleString('ru-RU')}`;$('#block-end').textContent='Конец блока: '+data.broadcastAddress;
 $('#mask-footnote').textContent=maskPrefix===32?'Маска /32 задаёт один адрес.':maskPrefix===31?'В блоке /31 два адреса. На соединении «точка-точка» оба могут использоваться.':`Считаем все адреса блока. В обычной подсети для устройств доступно на два меньше: ${(data.total-2).toLocaleString('ru-RU')} (без адреса сети и широковещательного адреса).`;
 $('#slide').querySelectorAll('[data-prefix]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.prefix)===maskPrefix)));
}
function superscript(n){return [...String(n)].map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]).join('');}
function initMask(){$('#mask-prefix').addEventListener('input',e=>{maskPrefix=Number(e.target.value);paintMask();});}
function extensionClick(e){
 const flat=e.target.closest('[data-apartment]');if(flat){if(current===6&&step===4)startStreet(flat.dataset.apartment);return true;}
 const button=e.target.closest('button');if(button?.matches('.replay-street')){startStreet();return true;}
 if(button?.matches('[data-prefix]')){maskPrefix=Number(button.dataset.prefix);paintMask();return true;}
 return false;
}
function extensionKey(e){
 const flat=e.target.closest('[data-apartment]');if(flat&&current===6&&step===4&&['Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();startStreet(flat.dataset.apartment);return true;}
 return false;
}
