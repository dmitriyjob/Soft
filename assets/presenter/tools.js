// The other decks already implement these controls in their native viewer.
(() => {
  const find = selector => document.querySelector(selector);
  const slide = find('#slide') || find('#stage');
  const layer = document.createElement('div');
  layer.className = 'presenter-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<svg class="presenter-ink"></svg><div class="presenter-spot" hidden></div><div class="presenter-laser" hidden></div><div class="presenter-blank" hidden></div>';
  document.body.append(layer);
  const [ink, spot, laser, blank] = layer.children;
  const notice = document.createElement('div');
  notice.className = 'presenter-notice';
  notice.setAttribute('role', 'status');
  document.body.append(notice);
  let timer;
  function announce(message) {
    notice.textContent = message;
    clearTimeout(timer);
    timer = setTimeout(() => notice.textContent = '', 1600);
  }

  let help = find('#help-dialog');
  if (!help) {
    help = document.createElement('dialog');
    help.className = 'presenter-help';
    help.innerHTML = '<header><h2>Управление</h2><button aria-label="Закрыть">×</button></header><dl></dl>';
    document.body.append(help);
    help.querySelector('button').onclick = () => help.close();
    const button = document.createElement('button');
    button.className = 'presenter-help-button';
    button.textContent = '?';
    button.setAttribute('aria-label','Управление (H)');
    button.onclick = () => help.showModal();
    find('.sidebar-hint').append(' ', button);
  }
  const shortcuts = [
    ['→ / Пробел','Следующий шаг'], ['←','Назад'], ['G','Оглавление'], ['F','Полный экран'],
    ['L','Лазерная указка'], ['D','Рисовать поверх слайда'], ['C','Стереть рисунок'],
    ['S','Прожектор'], ['B','Скрыть экран'], ['R','Заново этот слайд'],
    ['N','Пояснение, если есть'], ['Q','Вопрос, если есть'],
    ['Home / End','В начало / в конец'], ['H / ?','Управление'], ['Esc','Закрыть окно или инструмент']
  ];
  help.querySelector('dl').innerHTML = shortcuts.map(([key, action]) => '<dt>'+key+'</dt><dd>'+action+'</dd>').join('');

  let drawing = false, pointer = null, stroke = null;
  function clear() { ink.replaceChildren(); pointer = null; stroke = null; }
  function pen(on) {
    drawing = on;
    layer.classList.toggle('drawing', on);
    notice.textContent = '';
    pointer = null;
  }
  // Limit the drawing surface to the content so navigation buttons still work.
  function fit() {
    const r = slide.getBoundingClientRect();
    Object.assign(ink.style, {left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
  }
  new ResizeObserver(fit).observe(slide);
  addEventListener('resize', fit);
  fit();
  function appendPoint(e) {
    const point = ink.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    stroke.points.appendItem(point.matrixTransform(ink.getScreenCTM().inverse()));
  }
  ink.addEventListener('pointerdown', e => {
    if (!drawing || pointer !== null || e.button !== 0) return;
    pointer = e.pointerId;
    ink.setPointerCapture(pointer);
    stroke = document.createElementNS('http://www.w3.org/2000/svg','polyline');
    if (!ink.childElementCount) {
      const r = ink.getBoundingClientRect();
      ink.setAttribute('viewBox', '0 0 '+r.width+' '+r.height);
      ink.setAttribute('preserveAspectRatio', 'none');
    }
    ink.append(stroke);
    appendPoint(e);
    appendPoint(e);
    e.preventDefault();
  });
  ink.addEventListener('pointermove', e => {
    if (pointer === e.pointerId) appendPoint(e);
  });
  ink.addEventListener('lostpointercapture', () => { pointer = null; });
  let x = innerWidth/2, y = innerHeight/2;
  function position() {
    layer.style.setProperty('--px',x+'px');
    layer.style.setProperty('--py',y+'px');
  }
  position();
  addEventListener('pointermove', e => {
    x=e.clientX; y=e.clientY;
    if (!spot.hidden || !laser.hidden) position();
  });
  let slideNumber = location.hash.split('.')[0];
  new MutationObserver(() => {
    const next = location.hash.split('.')[0];
    if (next !== slideNumber) { clear(); slideNumber = next; }
  }).observe(slide,{childList:true});
  function jump(where) {
    if (window.lesson) {
      const state=window.lesson.getState();
      find('#overview-list').children[where==='first'?0:where==='last'?state.total-1:state.index].click();
    } else if (window.__turtleLesson) {
      const deck=window.__turtleLesson;
      deck.show(where==='first'?0:where==='last'?deck.N-1:deck.cur,0);
    } else {
      const links=document.querySelectorAll('#outline a');
      if (where==='current') render();
      else location.hash=links[where==='first'?0:links.length-1].hash;
    }
    clear();
  }
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input,select,textarea,[contenteditable="true"]')) return;
    const dialog=find('dialog[open]');
    const key=e.key==='?'?'KeyH':e.code;
    if (dialog) {
      if (dialog===help && (key==='Escape'||key==='KeyH')) help.close();
      else return;
    } else if (key==='Escape') {
      if (!blank.hidden) blank.hidden=true;
      else if (drawing) pen(false);
      else if (!laser.hidden) laser.hidden=true;
      else if (!spot.hidden) spot.hidden=true;
      else return;
    } else if (!blank.hidden && key!=='KeyB') {
      // Keep the concealed slide in place until the presenter restores it.
    } else {
      switch (key) {
        case 'KeyH': help.showModal(); break;
        case 'KeyL': laser.hidden=!laser.hidden; position(); break;
        case 'KeyS': spot.hidden=!spot.hidden; position(); break;
        case 'KeyD': pen(!drawing); announce(drawing?'Рисование включено · C — стереть':'Рисование выключено'); break;
        case 'KeyC': clear(); announce('Рисунок стёрт'); break;
        case 'KeyB': blank.hidden=!blank.hidden; break;
        case 'KeyR': jump('current'); break;
        case 'Home': jump('first'); break;
        case 'End': jump('last'); break;
        case 'KeyG': (find('#overview-open')||find('#menu')).click(); break;
        case 'KeyF':
          (document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>announce('Полный экран недоступен'));
          break;
        case 'KeyN':
        case 'KeyQ': {
          const item=slide.querySelector(key==='KeyN'?'details':'input:not([type="range"]):not([type="hidden"]),textarea');
          if (!item) announce(key==='KeyN'?'На этом слайде нет пояснения':'На этом слайде нет вопроса');
          else if (key==='KeyN') item.open=!item.open;
          else item.focus();
          break;
        }
        default: return;
      }
    }
    e.preventDefault();
    e.stopImmediatePropagation();
  },true);
})();
