// Use the reference viewer's markup and styles inside an isolated presentation layer.
(() => {
  const sheet = new URL('../../lessons/13/styles.css', document.currentScript.src);
  const host = document.createElement('div');
  host.className = 'lesson-presenter';
  document.body.append(host);
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `
    <link rel="stylesheet" href="${sheet.href}">
    <style>
      :host { --bg:#F5F5F7; --ink:#1D1D1F; --muted:#6E6E73; --line:#D5D5D9; --line2:#E6E6EA; --accent:#B9521D; --peach2:#FFEBDD; --ease:cubic-bezier(.22,1,.36,1); --sans:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter","Helvetica Neue",Arial,sans-serif; font:normal 16px/normal var(--sans); color:var(--ink); font-synthesis:none; -webkit-font-smoothing:antialiased; }
      #app { pointer-events:none; }
      #ink { touch-action:none; }
      #blank.on,.notes:not([inert]) { pointer-events:auto; }
      .notes:not([inert]) { transform:none; }
      .notes[inert] { visibility:hidden; }
      .nx svg { width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7; }
    </style><div id="app"><canvas id="ink" width="1600" height="900"></canvas>
  <div id="spot"></div>
  <div id="blank">Экран скрыт · нажми B</div>
  <div class="toast" id="toast"></div>

  <div class="ov" id="ovToc"><div class="panel"><button class="x" data-close>✕</button><h2 style="font-size:34px;margin-bottom:6px">План занятия</h2><div class="toc" id="tocList"></div></div></div>
  <div class="ov" id="ovHelp"><div class="panel" style="width:1020px"><button class="x" data-close>✕</button><h2 style="font-size:34px;margin-bottom:18px">Управление</h2>
    <div class="keys">
      <div><kbd>→</kbd><kbd>Пробел</kbd> следующий шаг / экран</div>
      <div><kbd>←</kbd> назад</div>
      <div><kbd>N</kbd> пояснение к слайду</div>
      <div><kbd>Q</kbd> вопрос на слайде</div>
      <div><kbd>G</kbd> оглавление</div>
      <div><kbd>F</kbd> полный экран</div>
      <div><kbd>L</kbd> лазерная указка</div>
      <div><kbd>D</kbd> рисовать поверх слайда</div>
      <div><kbd>C</kbd> стереть рисунок</div>
      <div><kbd>S</kbd> прожектор</div>
      <div><kbd>B</kbd> скрыть экран</div>
      <div><kbd>R</kbd> заново этот слайд</div>
      <div><kbd>Home</kbd><kbd>End</kbd> в начало / в конец</div>
      <div><kbd>Esc</kbd> закрыть окно / инструмент</div>
    </div>

  </div></div></div>
    <aside class="notes" id="notes" aria-label="Пояснение к слайду" aria-hidden="true" inert>
  <div class="nhd"><div><small id="nSec"></small><b id="nTitle"></b></div><button class="nx" id="nClose" aria-label="Закрыть пояснения"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
  <div class="nbody" id="nBody"></div>
  <div class="nft"><button id="nPrev" title="Назад">←</button><span id="nCnt"></span><button id="nNext" title="Дальше">→</button></div>
</aside><div id="laser"></div>`;
  const $ = selector => root.querySelector(selector);
  const find = selector => document.querySelector(selector);
  const slide = find('#slide') || find('#stage');
  const app = $('#app'), ink = $('#ink'), ctx = ink.getContext('2d');
  const laser = $('#laser'), spot = $('#spot'), notes = $('#notes');
  let timer, pointer = null;

  function fit() {
    const scale = Math.min(innerWidth/1600, innerHeight/900);
    app.style.transform = 'translate(-50%,-50%) scale('+scale+')';
    host.style.setProperty('--nw', Math.min(innerWidth*.92, Math.min(480, Math.max(380,innerWidth*.3)))+'px');
  }
  fit();
  addEventListener('resize', fit);
  function toast(text) {
    $('#toast').textContent = text;
    $('#toast').classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(() => $('#toast').classList.remove('on'), 1400);
  }
  function point(e) {
    const r = app.getBoundingClientRect(), k = r.width/1600;
    return [(e.clientX-r.left)/k, (e.clientY-r.top)/k];
  }
  ink.onpointerdown = e => {
    if (pointer !== null || e.button !== 0) return;
    pointer = e.pointerId;
    ink.setPointerCapture(pointer);
    ctx.beginPath();
    ctx.moveTo(...point(e));
  };
  ink.onpointermove = e => {
    if (pointer !== e.pointerId) return;
    ctx.strokeStyle = '#E5484D'; ctx.lineWidth = 5;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.lineTo(...point(e)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(...point(e));
  };
  ink.onlostpointercapture = () => { pointer = null; };
  function clearInk() { ctx.clearRect(0,0,1600,900); }
  function draw(on) {
    ink.classList.toggle('on',on);
    toast(on?'Рисование включено · C — стереть':'Рисование выключено');
  }
  function setLaser(on) {
    host.classList.toggle('laser',on);
    laser.style.display = on?'block':'none';
    toast(on?'Лазерная указка':'Указка выключена');
  }
  addEventListener('pointermove', e => {
    laser.style.left=e.clientX+'px'; laser.style.top=e.clientY+'px';
    const [x,y] = point(e);
    spot.style.setProperty('--sx',x+'px'); spot.style.setProperty('--sy',y+'px');
  });

  const entries = () => [...document.querySelectorAll('#outline a,#overview-list [data-scene]')];
  const index = () => (parseInt(location.hash.slice(1),10)||1)-1;
  function select(i) {
    const entry = entries()[i];
    if (!entry) return;
    if (window.__turtleLesson) window.__turtleLesson.show(i,0);
    else if (find('#slide') && i===index()) render(); // Graphics deck's normal reset.
    else entry.click();
  }
  function step(forward) { find(forward?'#next':'#prev,#previous').click(); }
  function closeOverlay() { root.querySelectorAll('.ov.open').forEach(el=>el.classList.remove('open')); }
  function toggleOverlay(id) {
    const panel = $(id), open = !panel.classList.contains('open');
    if (find('#menu[aria-expanded="true"]')) find('#menu').click();
    closeOverlay();
    if (!open) return;
    if (id==='#ovToc') {
      const list=$('#tocList');
      list.replaceChildren();
      entries().forEach((entry,i)=>{
        const button=document.createElement('button');
        const number=document.createElement('i');
        number.textContent=String(i+1).padStart(2,'0');
        button.append(number,entry.textContent.replace(/^\s*\d+\s*/,''));
        button.classList.toggle('on',i===index());
        button.onclick=()=>{closeOverlay();select(i);};
        list.append(button);
      });
    }
    panel.classList.add('open');
  }
  root.querySelectorAll('.ov').forEach(el=>{
    el.setAttribute('role','dialog');
    el.setAttribute('aria-label',el.querySelector('h2').textContent);
    el.onclick=e=>{if(e.target===el || e.target.closest('[data-close]')) closeOverlay();};
  });
  // Use the current deck's authored text in the original notes drawer.
  function renderNotes() {
    if (notes.inert) return;
    const entry=entries()[index()];
    $('#nTitle').textContent=entry?.textContent.replace(/^\s*\d+\s*/,'')||document.title;
    $('#nSec').textContent=find('#chapter-label')?.textContent||'Пояснение к слайду';
    $('#nCnt').textContent=String(index()+1).padStart(2,'0')+' / '+entries().length;
    const body=$('#nBody');
    body.replaceChildren();
    for (const item of slide.querySelectorAll('p,details,li')) {
      if (!item.checkVisibility() || !item.innerText.trim()) continue;
      const p=document.createElement('p'); p.textContent=item.innerText; body.append(p);
    }
    if (!body.children.length) body.textContent='На этом слайде нет пояснения';
  }
  function setNotes(on) {
    notes.inert=!on; notes.setAttribute('aria-hidden',String(!on)); renderNotes();
  }
  $('#nClose').onclick=()=>setNotes(false);
  $('#nPrev').onclick=()=>step(false); $('#nNext').onclick=()=>step(true);
  let current=index();
  new MutationObserver(()=>{
    if (index()!==current) { current=index(); clearInk(); }
    renderNotes();
  }).observe(slide,{childList:true,subtree:true,attributes:true,attributeFilter:['data-step']});

  if (!find('#help-open') && !document.currentScript.hasAttribute('data-hide-help-button')) {
    const button=document.createElement('button');
    button.textContent='Управление'; button.onclick=()=>toggleOverlay('#ovHelp');
    find('.sidebar-hint').before(button);
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('#help-open,#overview-open');
    if (!button) return;
    e.stopImmediatePropagation();
    toggleOverlay(button.id==='help-open'?'#ovHelp':'#ovToc');
  },true);
  addEventListener('keydown',e=>{
    if (e.metaKey||e.ctrlKey||e.altKey||e.target.closest('input,select,textarea,[contenteditable="true"]')||find('dialog[open]')) return;
    const key=e.key==='?'?'KeyH':e.code;
    if (key==='Escape') {
      if (!notes.inert) setNotes(false);
      else if ($('.ov.open')) closeOverlay();
      else if (ink.classList.contains('on')) draw(false);
      else if (host.classList.contains('laser')) setLaser(false);
      else if (spot.classList.contains('on')) spot.classList.remove('on');
      else if (!$('#blank').classList.contains('on')) return;
      $('#blank').classList.remove('on');
    } else if (key==='KeyH') toggleOverlay('#ovHelp');
    else if (key==='KeyG') toggleOverlay('#ovToc');
    else if (!$('.ov.open')) {
      switch (key) {
        case 'KeyL': setLaser(!host.classList.contains('laser')); break;
        case 'KeyD': draw(!ink.classList.contains('on')); break;
        case 'KeyC': clearInk(); toast('Рисунок стёрт'); break;
        case 'KeyS': toast(spot.classList.toggle('on')?'Прожектор · веди мышью':'Прожектор выключен'); break;
        case 'KeyB': $('#blank').classList.toggle('on'); break;
        case 'KeyR': select(index()); toast('Слайд сначала'); break;
        case 'Home': select(0); break;
        case 'End': select(entries().length-1); break;
        case 'KeyF':
          (document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>{});
          break;
        case 'KeyN': setNotes(notes.inert); break;
        case 'KeyQ': {
          const question=slide.querySelector('.ask > button, .quiz-form input');
          if (question?.matches('button')) question.click();
          else if (question) question.focus();
          else toast('На этом слайде нет вопроса');
          break;
        }
        case 'ArrowDown': case 'Enter':
          if (e.target.closest('a,button,summary')) return;
          step(true); break;
        case 'ArrowUp': case 'Backspace': step(false); break;
        default: return;
      }
    }
    e.preventDefault(); e.stopImmediatePropagation();
  },true);
})();
