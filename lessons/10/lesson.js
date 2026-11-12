'use strict';

const $ = selector => document.querySelector(selector);
const live = $('#live');
const video = $('#motion');
const still = $('#still');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let current = 1;
let step = 0;
let generation = 0;
let frameCallback = null;
let stopAt = 0;
let loopClip = false;
const answers = Array(6).fill(null);
const ranCode = Array(4).fill(false);
const controls = { byte: 0, byteTouched: false, boundary: 8, boundaryTouched: false, mask: 12, maskTouched: false, ip: '192.168.10.77', prefix: 24, calcTouched: false, capacity: 3, capacityTouched: false };

const b8 = n => Number(n).toString(2).padStart(8, '0');
const parseIP = value => {
  const parts = value.trim().split('.');
  return parts.length === 4 && parts.every(p => /^\d{1,3}$/.test(p) && Number(p) <= 255) ? parts.map(Number) : null;
};
const ipText = value => [24,16,8,0].map(shift => (value >>> shift) & 255).join('.');
function networkInfo(ip, prefix) {
  const parts = parseIP(ip);
  if (!parts || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
  const number = parts.reduce((sum, part) => sum * 256 + part, 0);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (number & mask) >>> 0;
  const total = 2 ** (32 - prefix);
  return { mask: ipText(mask), network: ipText(network), broadcast: ipText(network + total - 1), first: ipText(network + 1), last: ipText(network + total - 2), total, hosts: prefix <= 30 ? total - 2 : null };
}

function resize() {
  const mobile = matchMedia('(max-width:700px)').matches;
  const toolbar = $('#toolbar');
  const destination = mobile ? document.body : $('#deck');
  if (toolbar.parentElement !== destination) destination.append(toolbar);
  const scale = Math.min(innerWidth / 1920, (innerHeight - (mobile ? 52 : 0)) / (mobile ? 964 : 1024));
  document.documentElement.style.setProperty('--scale', scale);
}
addEventListener('resize', resize);

function stopMotion() {
  video.pause();
  video.classList.remove('visible');
  if (frameCallback !== null) {
    if (video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(frameCallback);
    else cancelAnimationFrame(frameCallback);
    frameCallback = null;
  }
  video.onseeked = null;
}
const heroSegments = [[.05, 2.18], [297.1, 298.25]];
let heroPart = 0;
function monitorMotion(token) {
  if (token !== generation) return;
  const next = (_now, metadata) => {
    if (token !== generation) return;
    const time = metadata ? metadata.mediaTime : video.currentTime;
    if (time >= stopAt - .025) {
      if (loopClip) {
        heroPart = (heroPart + 1) % heroSegments.length;
        video.pause();
        playSegment(...heroSegments[heroPart], token, true);
      } else stopMotion();
      return;
    }
    monitorMotion(token);
  };
  frameCallback = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(next) : requestAnimationFrame(next);
}
function playSegment(start, end, token, loop = false) {
  if (reducedMotion.matches || token !== generation || end <= start) return;
  stopAt = end;
  loopClip = loop;
  const begin = () => {
    if (token !== generation) return;
    video.onseeked = () => {
      if (token !== generation) return;
      video.onseeked = null;
      // Some servers without byte-range support complete every seek at 0.
      // Retain the matching still instead of displaying another slide.
      if (Math.abs(video.currentTime - start) > .15) { stopMotion(); return; }
      video.classList.add('visible');
      video.play().then(() => monitorMotion(token)).catch(() => { if (token === generation) stopMotion(); });
    };
    video.currentTime = start;
  };
  if (video.readyState >= 1) begin();
  else video.addEventListener('loadedmetadata', begin, { once: true });
}
function playRecorded(record, token, loop = false) {
  // Navigation plays a recorded transition and stops at its reference frame.
  // The two recorded title examples rotate while the title remains open.
  if (loop) { heroPart = 0; playSegment(...heroSegments[0], token, true); }
  else playSegment(Math.max(0, record.start - .04), record.posterTime, token);
}
video.addEventListener('error', stopMotion);
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stopMotion(); });

function hotspot(label, x, y, width, height, action, extraClass = '') {
  const button = document.createElement('button');
  button.className = 'hotspot ' + extraClass;
  button.style.cssText = `left:${x}px;top:${y}px;width:${width}px;height:${height}px`;
  button.setAttribute('aria-label', label);
  button.title = label;
  button.onclick = action;
  live.append(button);
  return button;
}
function surface(id, className = '') {
  const element = document.createElement('section');
  element.id = id;
  element.className = 'live-surface ' + className;
  live.append(element);
  return element;
}
function panel(id, open) {
  const element = $('#' + id);
  element.hidden = !open;
  const button = id === 'outline' ? $('#menu') : $('#notes');
  button.setAttribute('aria-expanded', String(open));
  if (open) element.querySelector('a,button')?.focus();
  else button.focus();
}
$('#menu').onclick = $('#jump').onclick = () => panel('outline', $('#outline').hidden);
$('#notes').onclick = () => panel('notes-panel', $('#notes-panel').hidden);
document.querySelectorAll('[data-close]').forEach(button => button.onclick = () => {
  if (button.dataset.close === 'help') $('#help').close();
  else panel(button.dataset.close, false);
});
$('#outline nav').innerHTML = REFERENCE.map(s => `<a href="#${s.number}" data-slide="${s.number}"><span>${String(s.number).padStart(2,'0')}</span>${s.title}</a>`).join('');
$('#outline nav').onclick = event => {
  const link = event.target.closest('a');
  if (!link) return;
  event.preventDefault();
  panel('outline', false);
  current = Number(link.dataset.slide);
  step = 0;
  render(false);
};
function fullscreen() {
  const result = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
  result?.catch(() => { $('#status').textContent = 'Полноэкранный режим недоступен в этом окне.'; });
}
$('#fullscreen').onclick = fullscreen;

function render(animate = false) {
  const token = ++generation;
  stopMotion();
  const slide = REFERENCE[current - 1];
  step = Math.max(0, Math.min(step, slide.states.length - 1));
  const record = slide.states[step];
  live.replaceChildren();
  $('#viewport').dataset.hash = record.hash;
  $('#viewport').dataset.ready = 'false';
  still.alt = `${slide.title}. ${slide.note}`;
  still.src = record.poster;
  still.decode().then(() => {
    if (token !== generation) return;
    $('#viewport').dataset.ready = 'true';
    if (current === 1) playRecorded(record, token, true);
    else if (animate && ![4,8,10,22,23,24].includes(current) && !(current === 17 && step >= 4)) playRecorded(record, token);
  }).catch(() => { if (token === generation) $('#status').textContent = 'Не удалось загрузить кадр. Обновите страницу.'; });
  const hash = '#' + record.hash;
  if (location.hash !== hash) history.replaceState(null, '', hash);
  document.title = `${slide.title} · №10`;
  $('#counter').textContent = String(current).padStart(2, '0') + ' / 26';
  $('#prev').disabled = current === 1 && step === 0;
  $('#next').textContent = current === 24 && step < 6 ? 'Следующий вопрос' : current === 26 && step === slide.states.length - 1 ? 'Сначала' : 'Дальше';
  $('#progress i').style.width = (current / 26 * 100) + '%';
  $('#notes-panel h2').textContent = slide.title;
  $('#notes-panel p').textContent = slide.note;
  $('#status').textContent = `${slide.title}. Слайд ${current} из 26, шаг ${step + 1} из ${slide.states.length}.`;
  document.querySelectorAll('#outline a').forEach(a => {
    const active = Number(a.dataset.slide) === current;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (current === 4) initByte();
  if (current === 8) initBoundary(false);
  if (current === 10 && step >= 2) initBoundary(true);
  if (current === 17 && step >= 4) initCapacity();
  if (current === 22) initCalculator();
  if (current === 23) initCode();
  if (current === 24) initQuiz();
  if (current === 1) {
    [[2,206,633,150,48],[10,368,633,126,48],[12,505,633,142,48],[17,206,691,237,48],[23,455,691,130,48],[25,598,691,110,48]].forEach(([n,x,y,w,h]) => hotspot(REFERENCE[n-1].title,x,y,w,h,() => { current=n;step=0;render(); }));
  }
  const following = slide.states[step + 1] || REFERENCE[current]?.states[0];
  if (following) { const preload = new Image(); preload.src = following.poster; }
}
function go(direction) {
  const lastStep = REFERENCE[current - 1].states.length - 1;
  if (direction > 0) {
    if (step < lastStep) step++;
    else { current = current === 26 ? 1 : current + 1; step = 0; }
  } else {
    if (step > 0) step--;
    else if (current > 1) { current--; step = REFERENCE[current - 1].states.length - 1; }
    else return;
  }
  render(direction > 0);
}
function readHash() {
  const match = location.hash.match(/^#(\d+)(?:\.(\d+))?$/);
  current = match ? Math.max(1, Math.min(26, Number(match[1]))) : 1;
  step = match ? Number(match[2] || 0) : 0;
  render(false);
}
$('#next').onclick = () => go(1);
$('#prev').onclick = () => go(-1);
$('#viewport').onclick = event => {
  if (!event.target.closest('button,input,textarea,a,.live-surface')) go(1);
};
addEventListener('hashchange', readHash);
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,[contenteditable]')) return;
  if (event.key === 'Escape') {
    if (!$('#outline').hidden) panel('outline',false);
    if (!$('#notes-panel').hidden) panel('notes-panel',false);
    $('#help').close();
    return;
  }
  if ($('#help').open || !$('#outline').hidden || !$('#notes-panel').hidden) return;
  if (event.key === 'ArrowRight' || (event.key === ' ' && !event.target.closest('button,a'))) { event.preventDefault(); go(1); }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
  else if (event.key === 'Home') { event.preventDefault(); current=1;step=0;render(); }
  else if (event.key === 'End') { event.preventDefault();current=26;step=0;render(); }
  else if (event.key.toLowerCase() === 'm' || event.key.toLowerCase() === 'ь') panel('outline', true);
  else if (event.key.toLowerCase() === 'n' || event.key.toLowerCase() === 'т') panel('notes-panel', true);
  else if (event.key.toLowerCase() === 'f' || event.key.toLowerCase() === 'а') fullscreen();
  else if (event.key === '?') $('#help').showModal();
});

function initByte() {
  if (controls.byteTouched) { drawByte(); return; }
  [128,64,32,16,8,4,2,1].forEach((weight,i) => {
    const button = hotspot(`Бит ${weight}`,221 + i * 111.5,209,69,129,() => setByte(controls.byte ^ weight),'byte-hotspot');
    button.setAttribute('aria-pressed','false');
  });
  [192,168,255,1,10,34].forEach((n,i) => hotspot(`Собрать ${n}`,296 + i * 83.5,507,73,50,() => setByte(n),'byte-hotspot'));
  const input = document.createElement('input');
  input.type='number';input.min='0';input.max='255';input.inputMode='numeric';input.className='hotspot-input byte-hotspot';
  input.style.cssText='left:1349px;top:460px;width:345px;height:50px';input.setAttribute('aria-label','Введите число от 0 до 255');
  input.oninput=()=>{const n=Number(input.value);if(input.value!==''&&Number.isInteger(n)&&n>=0&&n<=255){setByte(n);$('#byte-input').focus();}};
  live.append(input);
}
function setByte(value) {
  controls.byte=value;controls.byteTouched=true;
  live.querySelectorAll('.byte-hotspot').forEach(e=>e.remove());
  drawByte();
}
function drawByte() {
  let root=$('#byte-live');
  if(!root){
    root=surface('byte-live');
    root.innerHTML=`<div class="byte-controls"><div class="byte-weights">${[128,64,32,16,8,4,2,1].map(n=>`<span>${n}</span>`).join('')}</div><div class="byte-switches">${[128,64,32,16,8,4,2,1].map(n=>`<button class="byte-switch" data-weight="${n}" aria-label="Бит ${n}"></button>`).join('')}</div><div class="byte-digits">${Array.from({length:8},()=>'<span>0</span>').join('')}</div><div class="byte-equation"><code id="byte-binary"></code><span>=</span><strong id="byte-value"></strong></div><div class="byte-presets"><b>Собери:</b>${[192,168,255,1,10,34].map(n=>`<button data-byte="${n}">${n}</button>`).join('')}</div></div><div class="programmer"><div class="programmer-title">≡ &nbsp; Программист</div><div class="programmer-value"></div>${['HEX','DEC','OCT','BIN'].map(base=>`<div class="programmer-base"><span>${base}</span><b data-base="${base}"></b></div>`).join('')}<input id="byte-input" type="number" min="0" max="255" placeholder="Введи число 0–255" aria-label="Введите число от 0 до 255"><p>Калькулятор Windows → ≡ → «Программист». В Python: <code>bin(192)</code> — нули слева дописать самому.</p></div>`;
    root.querySelectorAll('[data-weight]').forEach(button=>button.onclick=()=>setByte(controls.byte ^ Number(button.dataset.weight)));
    root.querySelectorAll('[data-byte]').forEach(button=>button.onclick=()=>setByte(Number(button.dataset.byte)));
    $('#byte-input').oninput=event=>{const input=event.target,n=Number(input.value),valid=input.value!==''&&Number.isInteger(n)&&n>=0&&n<=255;input.setAttribute('aria-invalid',String(!valid));if(valid){controls.byte=n;drawByte();}};
  }
  const bits=b8(controls.byte);
  root.querySelectorAll('[data-weight]').forEach((button,i)=>{button.classList.toggle('on',bits[i]==='1');button.setAttribute('aria-pressed',String(bits[i]==='1'));});
  root.querySelectorAll('.byte-digits span').forEach((span,i)=>{span.textContent=bits[i];span.classList.toggle('on',bits[i]==='1');});
  $('#byte-binary').textContent=bits;$('#byte-value').textContent=controls.byte;
  $('.programmer-value').textContent=controls.byte;
  const bases={HEX:controls.byte.toString(16).toUpperCase(),DEC:String(controls.byte),OCT:controls.byte.toString(8),BIN:bits.slice(0,4)+' '+bits.slice(4)};
  Object.entries(bases).forEach(([base,value])=>root.querySelector(`[data-base="${base}"]`).textContent=value);
}

function nativeRow(label,ip,prefix,plain=false) {
  let index=0;
  return `<div class="native-row ${plain?'plain':''}"><span class="native-label">${label}</span><div class="native-groups">${ip.split('.').map(n=>`<div class="native-octet">${[...b8(n)].map(bit=>{const at=index++;return `<span class="native-bit ${at<prefix?'network-bit':'host-bit'} ${bit==='1'?'one':''}" data-bit="${at}">${bit}</span>`;}).join('')}</div>`).join('')}</div><code class="native-decimal">${ip}</code></div>`;
}
function makePrefix(parent,mode,prefix,getIP,onChange,active=false) {
  const root=document.createElement('div');root.className='prefix-widget '+(mode==='mask'?'mask-live':'');root.style.background='transparent';
  if(mode==='boundary')root.style.height='130px';
  const fill=document.createElement('div');root.append(fill);
  const range=document.createElement('input');range.type='range';range.className='prefix-range';range.min='0';range.max='32';range.step='1';range.value=prefix;range.setAttribute('aria-label','Количество единиц в маске');root.append(range);
  const hit=document.createElement('button');hit.className='hotspot';hit.setAttribute('aria-label','Изменить границу щелчком или перетаскиванием');hit.style.cssText=`left:120px;top:46px;width:1196px;height:${mode==='calc'?304:mode==='mask'?144:64}px;z-index:4;cursor:col-resize`;root.append(hit);
  parent.append(root);
  function draw(value) {
    range.value=value;
    const ip=getIP(),info=networkInfo(ip,value);
    root.style.background='var(--paper)';
    const rows=[nativeRow('IP',ip,value)];
    if(mode!=='boundary')rows.push(nativeRow('Маска',info.mask,value));
    if(mode==='calc')rows.push(nativeRow('Сеть',info.network,value,true),nativeRow('Broadcast',info.broadcast,value,true));
    fill.innerHTML=`<div class="prefix-band"><span class="network" style="width:${value/32*100}%">АДРЕС СЕТИ</span><span class="host" style="width:${(32-value)/32*100}%">АДРЕС УЗЛА</span></div><div class="native-rows">${rows.join('')}</div><div class="prefix-handle" style="left:${120+1196*value/32}px"><b>/${value}</b></div>${mode==='mask'?`<div class="prefix-current"><small>СЕЙЧАС</small><strong>/${value}</strong><code>${info.mask}</code><span>${value} единиц · ${32-value} нулей</span></div>`:''}`;
  }
  function change(value) {onChange(value);draw(value);}
  range.oninput=()=>change(Number(range.value));
  function fromPointer(event) {
    const rect=hit.getBoundingClientRect();
    const p=Math.max(0,Math.min(32,Math.round((event.clientX-rect.left)/rect.width*32)));
    change(p);
  }
  hit.onpointerdown=event=>{event.preventDefault();hit.setPointerCapture(event.pointerId);fromPointer(event);};
  hit.onpointermove=event=>{if(hit.hasPointerCapture(event.pointerId))fromPointer(event);};
  hit.onpointerup=event=>{if(hit.hasPointerCapture(event.pointerId))hit.releasePointerCapture(event.pointerId);};
  if(active)draw(prefix);
  return {root,draw,range};
}
function initBoundary(mask) {
  const key=mask?'mask':'boundary',touched=key+'Touched';
  makePrefix(live,mask?'mask':'boundary',!controls[touched]&&!mask?(step===0?16:8):controls[key],()=> '192.168.0.1',value=>{controls[key]=value;controls[touched]=true;},controls[touched]);
}
function initCalculator() {
  const root=surface('calc-live');root.style.background='transparent';
  const fill=document.createElement('div');root.append(fill);
  const input=document.createElement('input');input.type='text';input.spellcheck=false;input.autocomplete='off';input.value=controls.ip;input.id='calc-ip';input.className='hotspot-input';input.style.cssText='left:92px;top:0;width:278px;height:52px';input.setAttribute('aria-label','IP-адрес');root.append(input);
  const random=document.createElement('button');random.className='hotspot';random.style.cssText='left:387px;top:0;width:140px;height:52px';random.setAttribute('aria-label','Случайный IP-адрес');root.append(random);
  const prefix=makePrefix(root,'calc',controls.prefix,()=>controls.ip,value=>{controls.prefix=value;controls.calcTouched=true;draw();},controls.calcTouched);
  prefix.range.id='calc-prefix';
  function draw() {
    root.style.background='var(--paper)';input.classList.add('active');random.classList.add('active');random.textContent='Случайный';
    const p=controls.prefix,info=networkInfo(controls.ip,p);
    fill.innerHTML=`<div class="calc-controls"><label for="calc-ip">IP-адрес</label><span class="calc-hint">тяни ромбик над битами или кликай по ним</span></div><div id="ip-error" class="calc-error" aria-live="polite"></div><div class="calc-cards" aria-live="polite">${[
      ['МАСКА',info.mask,`/${p} — ${p} единиц`],
      ['АДРЕС СЕТИ',info.network,'нули в части узла'],
      ['ШИРОКОВЕЩАТЕЛЬНЫЙ',info.broadcast,'единицы в части узла'],
      ['КОМПЬЮТЕРАМ',p<=30?info.first+' … '+info.last:'Особый случай /'+p,p<=30?'первый и последний — нельзя':'правило «минус 2» не применяется'],
      ['АДРЕСОВ',`2<sup>${32-p}</sup> = ${info.total.toLocaleString('ru-RU')}`,p<=30?'компьютеров: '+info.hosts.toLocaleString('ru-RU'):'особая подсеть']
    ].map(([title,value,note],i)=>`<div class="native-card ${i===4?'dark':''}"><small>${title}</small><b>${value}</b><p>${note}</p></div>`).join('')}</div>`;
    const valid=!!parseIP(input.value);input.setAttribute('aria-invalid',String(!valid));$('#ip-error').textContent=valid?'':'Нужны четыре числа от 0 до 255 через точки.';
  }
  input.onfocus=()=>input.classList.add('active');
  input.oninput=()=>{
    controls.calcTouched=true;
    const parts=parseIP(input.value);draw();
    if(!parts){input.setAttribute('aria-invalid','true');$('#ip-error').textContent='Нужны четыре числа от 0 до 255 через точки.';return;}
    input.setAttribute('aria-invalid','false');controls.ip=parts.join('.');draw();prefix.draw(controls.prefix);
  };
  random.onclick=()=>{const examples=['10.5.7.9','172.16.37.146','191.128.66.83','192.168.10.77'].filter(ip=>ip!==controls.ip);controls.ip=examples[Math.floor(Math.random()*examples.length)];input.value=controls.ip;controls.calcTouched=true;input.setAttribute('aria-invalid','false');draw();prefix.draw(controls.prefix);};
  if(controls.calcTouched)draw();
}

function initCapacity() {
  if (!controls.capacityTouched) controls.capacity = step >= 5 ? 6 : 3;
  if(controls.capacityTouched){drawCapacity();return;}
  const range=document.createElement('input');range.type='range';range.min='1';range.max='10';range.value=controls.capacity;range.setAttribute('aria-label','Нулей в маске');range.style.cssText='position:absolute;left:348px;top:472px;width:360px;height:32px;opacity:0;cursor:ew-resize';
  range.oninput=()=>{controls.capacity=Number(range.value);controls.capacityTouched=true;drawCapacity();};live.append(range);
}
function drawCapacity() {
  let root=$('#capacity-live');
  if(!root){root=surface('capacity-live');root.innerHTML='<div id="capacity-drawing"></div><label class="capacity-slider" style="position:absolute;left:0;top:292px">нулей в маске <input id="capacity-range" type="range" min="1" max="10" aria-label="Нулей в маске"><b id="capacity-k"></b></label>';$('#capacity-range').oninput=event=>{controls.capacity=Number(event.target.value);drawCapacity();};}
  const k=controls.capacity,count=2**k,cols=count<=8?Math.min(4,count):10,cells=count<=8?count:100;
  $('#capacity-drawing').innerHTML=`<div class="capacity-mask">маска &nbsp; ${'1'.repeat(16-k)}<strong>${'0'.repeat(k)}</strong></div><div class="capacity-counter"><small>номер устройства · <b style="display:inline;font:inherit;letter-spacing:0">${k} места</b>, на каждом 0 или 1</small><b>${'1'.repeat(Math.min(k,8))}</b><p>${'0'.repeat(k)} … ${'1'.repeat(k)} → ${count}</p></div><div class="capacity-note" style="position:absolute;left:0;top:359px">Двигай ползунок: каждый новый ноль в маске — ещё одно место, и дом <strong style="color:#b64f1b">удваивается</strong>. Адресов = 2<sup>нулей</sup> = 2<sup>32 − единиц</sup>.</div><div class="capacity-building"><h2>2<sup>${k}</sup> = ${count}</h2><p>адресов в сети</p><div class="capacity-grid" style="grid-template-columns:repeat(${cols},1fr)">${Array.from({length:cells},(_,i)=>`<i class="${i<count?'on':''}" style="height:${count<=8?104:36}px">${count<=8?i.toString(2).padStart(k,'0'):''}</i>`).join('')}</div></div>`;
  $('#capacity-range').value=k;$('#capacity-k').textContent=k;
}

function codeLines(tab) {
  if(tab===0)return Array.from({length:32},(_,i)=>{const prefix=i+1,info=networkInfo('220.128.112.142',prefix);return {text:info.network+'/'+prefix,selected:info.network==='220.128.96.0'};});
  if(tab===1)return Array.from({length:32},(_,i)=>i+1).filter(p=>networkInfo('111.81.208.27',p).network==='111.81.192.0').map(p=>({text:networkInfo('111.81.208.27',p).mask,selected:true}));
  if(tab===2)return Array.from({length:32},(_,i)=>i+1).filter(p=>networkInfo('157.127.182.76',p).network!==networkInfo('157.127.190.80',p).network).map((p,i)=>({text:`${p} ${networkInfo('157.127.182.76',p).network}/${p} ${networkInfo('157.127.190.80',p).network}/${p}`,selected:i===0}));
  const info=networkInfo('191.128.66.83',10);
  return [info.network+'/10',String(info.hosts),info.last].map((text,i)=>({text,selected:i===2}));
}
function initCode() {
  const output=document.createElement('div');output.id='code-output';output.innerHTML='<div class="output-header">Run</div><div class="output-lines" aria-live="polite"></div>';live.append(output);
  // The last tab has one extra editor line in the recording.
  if(step===3){output.style.top='402px';output.style.height='324px';output.querySelector('.output-lines').style.height='286px';}
  const run=()=>{
    ranCode[step]=true;
    const lines=output.querySelector('.output-lines');lines.replaceChildren();
    const path=document.createElement('span');path.textContent='C:\\Users\\ion\\13.py';path.className='muted';lines.append(path);
    codeLines(step).forEach(line=>{const span=document.createElement('span');span.textContent=line.text;if(line.selected)span.className='selected';lines.append(span);});
    const finished=document.createElement('span');finished.textContent='Process finished with exit code 0';finished.className='muted';lines.append(finished);
    if(step===0)lines.scrollTop=15*27;
  };
  hotspot('Run — выполнить пример',1123,170,76,34,run,'code-run-hit');
  [[0,290,114,'Байт маски'],[1,408,154,'Наименьший байт'],[2,575,93,'Два узла'],[3,673,80,'Фишки']].forEach(([tab,x,w,label])=>hotspot(label,x,161,w,47,()=>{step=tab;render(false);},'code-tab-hit'));
  if(ranCode[step])run();
}

const quiz=[
  {q:'Сколько бит в IP-адресе (IPv4)?',options:['4','8','255','32'],correct:3,explanation:'4 байта × 8 бит = 32 бита.'},
  {q:'Какое число не может быть частью IP-адреса?',options:['256','0','255','127'],correct:0,explanation:'Каждый байт — число от 0 до 255. 256 уже не помещается в 8 бит.'},
  {q:'Какая из этих записей — правильная маска?',options:['0.255.255.255','255.255.248.0','255.255.0.255','255.250.0.0'],correct:1,explanation:'248 = 11111000 — единицы, потом нули. В остальных после нуля снова идут единицы.'},
  {q:'IP 10.5.7.9, маска 255.255.0.0. Адрес сети?',options:['0.0.7.9','10.0.0.0','10.5.0.0','10.5.7.0'],correct:2,explanation:'255 сохраняет первые два байта, 0 обнуляет последние два: 10.5.0.0.'},
  {q:'В маске 26 единиц. Сколько компьютеров можно подключить?',options:['64','26','6','62'],correct:3,explanation:'32 − 26 = 6 нулей. 2⁶ = 64 адреса, компьютерам 64 − 2 = 62.'},
  {q:'Почему первый и последний адрес сети не дают компьютерам?',options:['Это адрес сети и широковещательный','Они слишком короткие','Их забирает роутер Wi-Fi','Так удобнее считать'],correct:0,explanation:'Все нули в части узла — адрес сети, все единицы — широковещательный (broadcast).'}
];
function initQuiz() {
  const score=answers.filter((answer,i)=>answer===quiz[i].correct).length;
  const root=surface('quiz-live');root.classList.add('reference-quiz');
  const dots=Array.from({length:6},(_,i)=>`<i class="${answers[i]===quiz[i].correct?'correct':step===i?'active':''}"></i>`).join('');
  if(step===6){
    root.classList.remove('reference-quiz');
    root.innerHTML=`<div class="kicker">ИТОГ</div><div class="quiz-steps">${dots}</div><h1 style="font-size:62px;margin-top:47px">${score===6?'Идеально!':score>=4?'Хорошая работа!':'Попробуем ещё раз'}</h1><div class="quiz-score"><strong>${score}</strong><span>из 6 правильно</span><button id="retry-quiz">Пройти заново</button></div>`;
    $('#retry-quiz').onclick=()=>{answers.fill(null);step=0;render();};
    return;
  }
  const q=quiz[step],chosen=answers[step],answered=chosen!==null;
  root.innerHTML=`<h1 class="sr-only">${q.q}</h1><div class="quiz-steps">${dots}</div><div class="quiz-options">${q.options.map((option,i)=>`<button data-choice="${i}" aria-label="${['А','Б','В','Г'][i]}. ${option}" class="${chosen===i?(i===q.correct?'right':'wrong'):answered?'dim':''}"><b>${['А','Б','В','Г'][i]}</b><span>${option}</span></button>`).join('')}</div><div class="quiz-feedback ${answered&&chosen!==q.correct?'wrong':''}" aria-live="polite">${answered?(chosen===q.correct?q.explanation:'Пока неверно. Попробуй ещё раз.') : ''}</div><div class="quiz-bottom-mask" aria-hidden="true"></div>`;
  root.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
    const answer=Number(button.dataset.choice),previous=answers[step];answers[step]=answer;
    root.remove();initQuiz();
    if(answer===q.correct&&previous!==q.correct)celebrate();
  });
}
function celebrate() {
  if(reducedMotion.matches)return;
  document.querySelectorAll('.confetti-layer').forEach(layer=>layer.remove());
  const layer=document.createElement('div');layer.className='confetti-layer';layer.setAttribute('aria-hidden','true');$('#viewport').append(layer);
  const animations=[];
  for(let side=0;side<2;side++)for(let i=0;i<60;i++){
    const particle=document.createElement('i');particle.style.left=(side?100:0)+'%';particle.style.background=['#b44e23','#368d69','#347bd4','#6433b2','#d8a531','#1c1c1e'][i%6];layer.append(particle);
    const x=(450+(i*71%1000))*(side?-1:1),lift=900+(i*43%600);
    const frames=Array.from({length:31},(_,j)=>{const t=j/30;return {transform:`translate(${x*(1-(1-t)**2)}px,${-lift*t+1500*t*t}px) rotate(${t*(700+i*31)}deg)`,opacity:t>.85?(1-t)/.15:1};});
    animations.push(particle.animate(frames,{duration:2200+i%9*90,delay:i%7*12,fill:'both'}).finished.catch(()=>{}));
  }
  Promise.all(animations).then(()=>layer.remove());
}

resize();
readHash();
