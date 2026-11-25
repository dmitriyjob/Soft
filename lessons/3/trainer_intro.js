/* Вступление к уровню: условие как на ЕГЭ → что ищем → проблема → ВПР → план */
(() => {
'use strict';
const T = window.TR, TG = window.TG, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ov = $('#intro'), vis = $('#inVis');
let lv = 1, spec = null, list = [], si = 0, timers = [], only = null, built = '', maxSi = 0;
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
const clearT = () => { timers.forEach(clearTimeout); timers = []; $$('.fly', vis).forEach(f => f.remove()); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const COL = { 'Что считаем': '#EBA771', 'Товар': '#8AB8EF', 'Тип операции': '#C0ACED', 'Где': '#8BCBAD', 'Когда': '#ED9BBB' };
const colOf = lab => COL[lab] || '#EBA771';

/* ---------- страница КИМ ---------- */
const KEY_SVG = '<svg class="key" viewBox="0 0 16 16"><circle cx="5" cy="8" r="3.2" fill="none" stroke="#D8BE6E" stroke-width="1.8"/><path d="M8 8h7M12.5 8v2.6M14.5 8v2" stroke="#D8BE6E" stroke-width="1.8" fill="none"/></svg>';
function kimHTML() {
  const demo = spec.db === 'demo', month = demo ? 'июня 2025 г.' : 'августа 2021 г.';
  let k = 0;
  const q = spec.q.replace(/<mark>(.*?)<\/mark>/g, (m, t) => `<span class="fm" data-k="${k++}">${t}</span>`).replace(/\s*В ответе запишите только число\.$/, '');
  return `<div class="ik-page">
    <div class="kim-hd"><span>ЕГЭ · ИНФОРМАТИКА, 11 класс</span><span>${demo ? 'Демоверсия 2027 · задание 3' : 'Задание 3'}</span></div>
    <div class="kim-task"><div class="kim-n">3</div><div class="kim-body">
      <div class="kz">
        <p>Задание выполняется с использованием прилагаемого файла.</p>
        <p>В файле приведён фрагмент базы данных «Продукты» о поставках товаров в магазины районов города. База данных состоит из трёх таблиц.</p>
        <p>Таблица «Движение товаров» содержит записи о поступлении товаров в магазины в течение ${month}, а также информацию о проданных товарах. Поле <i>Тип операции</i> содержит значение <i>Поступление</i> или <i>Продажа</i>, а в соответствующее поле <i>Количество упаковок, шт.</i> внесена информация о том, сколько упаковок товара поступило в магазин или было продано в течение дня. Заголовок таблицы имеет следующий вид.</p>
        <table class="kt"><tr><td>ID операции</td><td>Дата</td><td>ID магазина</td><td>Артикул</td><td>Количество упаковок, шт.</td><td>Тип операции</td></tr></table>
        <p>Таблица «Товар» содержит информацию об основных характеристиках каждого товара. Заголовок таблицы имеет следующий вид.</p>
        <table class="kt"><tr><td>Артикул</td><td>Отдел</td><td>Наименование товара</td><td>Ед_изм</td><td>Количество в упаковке</td><td>Цена за упаковку</td></tr></table>
        <p>Таблица «Магазин» содержит информацию о местонахождении магазинов. Заголовок таблицы имеет следующий вид.</p>
        <table class="kt"><tr><td>ID магазина</td><td>Район</td><td>Адрес</td></tr></table>
        <p>На рисунке приведена схема указанной базы данных.</p>
        <div class="ksch"></div>
      </div>
      <div class="kz kq">
        <p class="kqp">${q}</p>
        <p>В ответе запишите только число.</p>
        <div class="kans">Ответ: <i></i>.</div>
      </div>
    </div></div>
    <div class="fframe"><i></i><i></i><i></i><i></i></div>
  </div>`;
}
function kimSchema(box) {
  const B = [
    { id: 'kT', name: 'Товар', x: 0, y: 46, w: 218, f: ['Артикул', 'Отдел', 'Наименование товара', 'Ед_изм', 'Количество в упаковке', 'Цена за упаковку'] },
    { id: 'kM', name: 'Движение товаров', x: 296, y: 0, w: 236, f: ['ID операции', 'Дата', 'ID магазина', 'Артикул', 'Количество упаковок, шт.', 'Тип операции'] },
    { id: 'kS', name: 'Магазин', x: 612, y: 64, w: 176, f: ['ID магазина', 'Район', 'Адрес'] }
  ];
  box.innerHTML = '<div class="ksch-in"><svg></svg>' + B.map(b => `<div class="kbox" data-b="${b.id}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px"><div class="kh">${b.name}</div>${b.f.map((f, i) => `<div class="kf" data-f="${f}">${i === 0 ? KEY_SVG : ''}${f}</div>`).join('')}</div>`).join('') + '</div>';
  const fld = (bid, name) => { const b = $(`[data-b="${bid}"]`, box), f = $(`.kf[data-f="${name}"]`, b); return { l: b.offsetLeft, r: b.offsetLeft + b.offsetWidth, y: b.offsetTop + f.offsetTop + f.offsetHeight / 2 }; };
  const line = (a, b, la, lb) => { const x1 = a.r, x2 = b.l, mx = (x1 + x2) / 2; return `<path d="M${x1},${a.y} H${mx} V${b.y} H${x2}" fill="none" stroke="#333" stroke-width="1.4"/><text x="${x1 + 6}" y="${a.y - 5}" font-size="15" font-family="Arial">${la}</text><text x="${x2 - 16}" y="${b.y - 5}" font-size="${lb === '∞' ? 19 : 15}" font-family="Arial">${lb}</text>`; };
  const draw = () => { $('svg', box).innerHTML = line(fld('kT', 'Артикул'), fld('kM', 'Артикул'), '1', '∞') + line(fld('kM', 'ID магазина'), fld('kS', 'ID магазина'), '∞', '1'); };
  const fit = () => { const inner = $('.ksch-in', box), w = box.clientWidth || 730, k = Math.min(1, w / 790); inner.style.transform = `scale(${k})`; inner.style.marginLeft = Math.max(0, (w - 790 * k) / 2) + 'px'; box.style.height = (222 * k) + 'px'; };
  draw(); fit(); requestAnimationFrame(fit); document.fonts && document.fonts.ready.then(() => { draw(); fit(); });
}

/* ---------- мини-таблицы (настоящие строки из базы) ---------- */
function pickRows() {
  const D = spec.D, W = spec.where;
  const inW = id => { const s = spec.shop.get(id); return W.keepVals.includes(W.field === 'addr' ? s[2] : s[1]); };
  const isT = a => spec.names.includes(spec.prod.get(a)[2]);
  const inP = m => spec.dates.includes(D.dates[m[1]]);
  const find = f => D.mv.find(f);
  const r1 = find(m => isT(m[3]) && inW(m[2]) && !m[5] && inP(m));
  const r2 = find(m => m[2] === r1[2] && !isT(m[3]) && m[1] === r1[1]);
  const r3 = find(m => isT(m[3]) && !inW(m[2]));
  const r4 = find(m => isT(m[3]) && inW(m[2]) && m[5] && inP(m)) || find(m => !isT(m[3]) && !inW(m[2]) && m[5]);
  const r5 = find(m => !isT(m[3]) && !inW(m[2]) && m !== r3);
  const rows = [r1, r2, r3, r4, r5].filter(Boolean).filter((m, i, a) => a.indexOf(m) === i).sort((a, b) => a[0] - b[0]);
  const shops = [...new Set(rows.map(m => m[2]))].sort((a, b) => +a.slice(1) - +b.slice(1));
  const arts = [...new Set(rows.map(m => m[3]))].sort((a, b) => a - b);
  return { rows, shops, arts };
}
function tablesHTML() {
  const P = pickRows(), D = spec.D; vis._P = P;
  const mvRows = P.rows.map((m, i) => `<tr data-r="${i}"><td>${m[0]}</td><td>${D.dates[m[1]]}</td><td class="k-shop">${m[2]}</td><td class="k-art">${m[3]}</td><td>${m[4]}</td><td>${m[5] ? 'Продажа' : 'Поступление'}</td><td class="nc nc-d"></td><td class="nc nc-n"></td></tr>`).join('');
  const pr = P.arts.map(a => { const p = spec.prod.get(a); return `<tr data-a="${a}"><td>${a}</td><td>${esc(p[1])}</td><td class="v-n">${esc(p[2])}</td></tr>`; }).join('');
  const sh = P.shops.map(id => { const s = spec.shop.get(id); return `<tr data-s="${id}"><td>${id}</td><td class="v-d">${esc(s[1])}</td><td>${esc(s[2])}</td></tr>`; }).join('');
  return `<div class="it">
    <div class="itb main"><div class="itt">Движение товаров <small><span class="cu" data-to="${D.mv.length}">0</span> строк</small></div>
      <table class="itab"><tr class="h"><th>ID операции</th><th data-h="date">Дата</th><th data-h="shop">ID магазина</th><th data-h="art">Артикул</th><th data-h="qty">Количество упаковок</th><th data-h="type">Тип операции</th><th class="nc nh" data-h="dist">Район</th><th class="nc nh" data-h="name">Наименование</th></tr>${mvRows}<tr class="more"><td colspan="8">… ещё ${(D.mv.length - P.rows.length).toLocaleString('ru-RU')} строк</td></tr></table></div>
    <div class="it-row">
      <div class="itb prod"><div class="itt">Товар</div><table class="itab"><tr class="h"><th>Артикул</th><th>Отдел</th><th data-h="pname">Наименование товара</th></tr>${pr}</table></div>
      <div class="itb shop"><div class="itt">Магазин</div><table class="itab"><tr class="h"><th>ID магазина</th><th data-h="sdist">Район</th><th>Адрес</th></tr>${sh}</table></div>
    </div>
    <div class="vf" id="vf"><span class="vf-p vf0"><code>=ВПР(</code></span><span class="vf-p vf1"><code>C2</code><small>ключ: ID магазина</small></span><span class="vf-p vf2"><code>;$Магазин.$A:$C</code><small>где искать</small></span><span class="vf-p vf3"><code>;2</code><small>какой столбец вернуть</small></span><span class="vf-p vf4"><code>;0)</code><small>точное совпадение</small></span></div>
  </div>`;
}
const rel = el => { const a = T.rr(el), b = T.rr(vis); return { x: a.x - b.x, y: a.y - b.y, w: a.w, h: a.h }; };
function tag(el, text, color, cls = '') {
  const R = rel(el), d = document.createElement('div');
  d.className = 'itag ' + cls; d.style.setProperty('--c', color); d.innerHTML = text;
  vis.appendChild(d);
  d.style.left = (R.x + R.w / 2) + 'px'; d.style.top = (R.y - 8) + 'px';
  return d;
}
function countUp(el) { el.textContent = Number(el.dataset.to).toLocaleString('ru-RU'); }
function fly(fromEl, toEl, text, color, dur = 650) {
  return new Promise(res => {
    const a = rel(fromEl), b = rel(toEl), d = document.createElement('div');
    d.className = 'fly'; d.textContent = text; d.style.setProperty('--c', color);
    vis.appendChild(d);
    const w = d.offsetWidth, h = d.offsetHeight;
    const x0 = a.x + a.w / 2 - w / 2, y0 = a.y + a.h / 2 - h / 2, x1 = b.x + b.w / 2 - w / 2, y1 = b.y + b.h / 2 - h / 2;
    d.style.left = x0 + 'px'; d.style.top = y0 + 'px';
    const an = d.animate([{ transform: 'translate(0,0) scale(.9)', opacity: 0 }, { transform: `translate(${(x1 - x0) * .15}px,${(y1 - y0) * .15 - 14}px) scale(1.06)`, opacity: 1, offset: .2 }, { transform: `translate(${x1 - x0}px,${y1 - y0}px) scale(1)`, opacity: 1 }], { duration: dur, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' });
    an.onfinish = () => { d.remove(); res(); };
    timers.push(setTimeout(() => { if (d.isConnected) { d.remove(); res(); } }, dur + 400));
  });
}
const sleep = ms => new Promise(r => later(r, ms));

/* ---------- сцены: каждая — набор «реплик» диктора с действием на экране ---------- */
const focusList = () => spec.focus || [];
const H = h => $(`[data-h="${h}"]`, vis);
function markFocus(i, on = true) {
  const page = $('.ik-page', vis), fr = $('.fframe', vis), m = $$('.fm', vis)[i], F = focusList()[i] || [''];
  if (!m) return;
  m.style.setProperty('--c', colOf(F[0])); m.classList.add('on');
  if (!on) return;
  const R = m.getBoundingClientRect(), P = page.getBoundingClientRect(), k = T.realK();
  Object.assign(fr.style, { left: ((R.left - P.left) / k - 5) + 'px', top: ((R.top - P.top) / k - 3) + 'px', width: (R.width / k + 10) + 'px', height: (R.height / k + 6) + 'px' });
  fr.style.setProperty('--c', colOf(F[0])); fr.classList.add('on');
}
const chip = i => $(`.fchip[data-i="${i}"]`);
const scrollQ = () => { const v = $('.ik-view', vis), q = $('.kq', vis); if (v && q) v.scrollTo({ top: Math.max(0, q.offsetTop - 210), behavior: 'smooth' }); };
function problemTags(part) {
  const F = focusList(), add = (lab, h) => { if (!F.find(x => x[0] === lab)) return; const t = tag(H(h), `<b>${lab}</b>`, colOf(lab)); later(() => t.classList.add('on'), 30); };
  if (part === 0) { add('Когда', 'date'); add('Что считаем', 'qty'); }
  if (part === 1) { add('Где', 'sdist'); add('Товар', 'pname'); }
  if (part === 2) { const q1 = tag(H('shop'), 'нет района', '#F29694', 'bad'), q2 = tag(H('art'), 'нет названия', '#F29694', 'bad'); later(() => { q1.classList.add('on'); q2.classList.add('on'); }, 30); $$('.k-shop, .k-art, [data-h="shop"], [data-h="art"]', vis).forEach(c => c.classList.add('miss')); }
}
const SC = {
  task: {
    k: 'Условие', grp: 'kim', h: () => only ? 'Условие' : 'Задание целиком',
    next: () => only ? 'К таблице →' : lv === 4 ? 'Начать экзамен →' : 'Что ищем? →',
    enter() { const v = $('.ik-view', vis); v.classList.remove('find'); $$('.fm', vis).forEach(m => m.classList.remove('on')); $('.fframe', vis).classList.remove('on'); $('.kq', vis).classList.remove('glow'); if (!only) v.scrollTo({ top: 0 }); },
    beats: () => only ? [] : lv === 1 ? [
      { say: 'Это задание три — так оно выглядит на экзамене. Прочитай условие сам.' },
      { wait: 'Прочитал →', say: 'Самое важное — в последнем абзаце. Там вопрос.', run: () => { scrollQ(); $('.kq', vis).classList.add('glow'); }, fin: () => { scrollQ(); $('.kq', vis).classList.add('glow'); } }
    ] : lv === 4 ? [{ say: 'Это экзамен. Подсказок не будет — только проверка ошибок. Прочитай условие и нажми «Начать».' }]
      : [{ say: 'Новая задача. Сначала прочитай условие.' }]
  },
  find: {
    k: 'Что ищем', grp: 'kim', h: () => 'Что нужно найти',
    next: () => lv === 1 ? 'Где это лежит? →' : 'План →',
    extra: () => `<div class="fchips">${focusList().map(([lab, mean], i) => `<div class="fchip" data-i="${i}" style="--c:${colOf(lab)}"><b>${lab}</b><q>${esc(($$('.fm', vis)[i] || {}).textContent || '')}</q><span>${mean}</span></div>`).join('')}</div>`,
    enter() { const v = $('.ik-view', vis); v.classList.add('find'); $('.kq', vis).classList.remove('glow'); $$('.fm', vis).forEach(m => m.classList.remove('on')); scrollQ(); },
    beats: () => focusList().map(([lab, mean, say], i) => ({
      say, midAt: 0.5,
      run: () => { markFocus(i); chip(i).classList.add('on'); },
      mid: () => chip(i).classList.add('open'),
      fin: () => { markFocus(i, false); chip(i).classList.add('on', 'open'); if (i === focusList().length - 1) $('.fframe', vis).classList.remove('on'); }
    }))
  },
  problem: {
    k: 'Проблема', grp: 'tables', h: () => 'Где это лежит',
    next: () => 'Как собрать? →',
    enter() { const it = $('.it', vis); it.classList.remove('vl', 'vldone'); resetVL(); $$('.itag', vis).forEach(t => t.remove()); const cu = $('.cu', vis); if (cu) countUp(cu); },
    beats: () => [
      { say: 'Даты, количество и тип операции есть в «Движении товаров».', run: () => problemTags(0), fin: () => {} },
      { say: 'А район — только в таблице «Магазин». Название товара — только в «Товаре».', run: () => problemTags(1), fin: () => {} },
      { say: 'В «Движении товаров» вместо них коды. Значит, сначала соберём всё в одну таблицу.', run: () => problemTags(2), fin: () => {} }
    ]
  },
  vlookup: {
    k: 'Решение', grp: 'tables', h: () => 'Собираем всё в одну таблицу',
    next: () => 'План →',
    enter() { $$('.itag', vis).forEach(t => t.remove()); resetVL(); const it = $('.it', vis); it.classList.add('vl'); it.classList.remove('vldone'); },
    beats: () => [
      { say: 'Поможет функция ВПР. Она берёт код магазина, находит его в таблице «Магазин» и приносит район.', run: my => passVL('shop', my), fin: () => fillVL('shop') },
      { say: 'Записывается так: ключ, где искать, номер столбца и ноль — точное совпадение.', run: my => showVF(my), fin: () => { $('#vf').classList.add('on'); $$('.vf-p', vis).forEach(p => p.classList.add('on')); } },
      { say: 'Так же по артикулу принесём название товара. Теперь всё в одной таблице!', run: my => passVL('prod', my), fin: () => { fillVL('prod'); $('.it', vis).classList.add('vldone'); } }
    ]
  },
  plan: {
    k: 'План', grp: 'plan', h: () => 'План',
    next: () => 'Начать →',
    enter() { $$('.ppg', vis).forEach(g => g.classList.remove('on')); },
    beats: () => [{
      say: ({ 1: 'План такой: собрать таблицу, оставить нужные строки, посчитать и записать ответ. Я буду подсказывать каждый шаг. Поехали!', 2: 'План тот же. Но теперь подсказка — одна на этап. Куда нажимать, решаешь сам.', 3: 'Теперь только план. Застрянешь — жми «Подсказка».' })[lv] || '',
      run: () => $$('.ppg', vis).forEach((g, i) => later(() => g.classList.add('on'), 150 + i * 380)),
      fin: () => $$('.ppg', vis).forEach(g => g.classList.add('on'))
    }]
  }
};
function resetVL() {
  $$('.nc', vis).forEach(c => { if (c.tagName === 'TD') c.textContent = ''; c.classList.remove('fill'); });
  $$('.hot, .key, .miss', vis).forEach(c => c.classList.remove('hot', 'key', 'miss'));
  $$('.vf-p', vis).forEach(p => p.classList.remove('on')); const vf = $('#vf'); if (vf) vf.classList.remove('on');
}
const VLDEF = { shop: ['k-shop', 's', m => m[2], 'v-d', 'nc-d', '#8BCBAD'], prod: ['k-art', 'a', m => m[3], 'v-n', 'nc-n', '#8AB8EF'] };
function fillVL(tbl) {
  const [, , keyOf, valCls, cellCls] = VLDEF[tbl], P = vis._P;
  $$('.main tr[data-r]', vis).forEach((tr, i) => { const t = $(`.${tbl} tr[data-${VLDEF[tbl][1]}="${keyOf(P.rows[i])}"]`, vis); if (!t) return; const c = $('.' + cellCls, tr); c.textContent = $('.' + valCls, t).textContent; c.classList.add('fill'); });
  $$('.key, .hot', vis).forEach(c => c.classList.remove('key', 'hot'));
}
async function passVL(tbl, my) {
  const [keyCls, dk, keyOf, valCls, cellCls, color] = VLDEF[tbl], P = vis._P, rows = $$('.main tr[data-r]', vis);
  for (let i = 0; i < rows.length; i++) {
    if (my !== run) return;
    const tr = rows[i], key = $('.' + keyCls, tr), target = $(`.${tbl} tr[data-${dk}="${keyOf(P.rows[i])}"]`, vis);
    if (!target) continue;
    key.classList.add('key'); target.classList.add('hot');
    const d = i ? 360 : 700;
    await fly(key, $('td', target), String(keyOf(P.rows[i])), color, d); if (my !== run) return;
    const val = $('.' + valCls, target);
    await fly(val, $('.' + cellCls, tr), val.textContent, color, d); if (my !== run) return;
    const cell = $('.' + cellCls, tr); cell.textContent = val.textContent; cell.classList.add('fill');
    key.classList.remove('key'); target.classList.remove('hot');
    await sleep(i ? 50 : 250);
  }
}
async function showVF(my) { $('#vf').classList.add('on'); for (let k = 0; k < 5; k++) { await sleep(k ? 520 : 150); if (my !== run) return; $('.vf' + k, vis).classList.add('on'); } }
function planHTML() {
  const st = TG.G.stages;
  return `<div class="pp">${TG.GROUPS.map((g, gi) => {
    const items = st.filter(x => x.g === gi); if (!items.length) return '';
    return `<div class="ppg"><div class="ppg-n">${gi + 1}</div><div class="ppg-b"><b>${g}</b><small>${TG.GROUP_SUB[gi]}</small></div></div>`;
  }).join('')}</div>`;
}

/* ---------- каркас ---------- */
function buildVis(grp) {
  if (built === grp + lv) return;
  built = grp + lv; clearT();
  if (grp === 'kim') {
    vis.innerHTML = `<div class="ik-view"><div class="ik-pad">${kimHTML()}</div></div><div class="ik-scroll">прокрути ↓</div>`;
    kimSchema($('.ksch', vis));
    const v = $('.ik-view', vis); v.addEventListener('scroll', () => { $('.ik-scroll', vis).classList.toggle('off', v.scrollTop > 60); }, { passive: true });
  } else if (grp === 'tables') vis.innerHTML = tablesHTML();
  else vis.innerHTML = planHTML();
  vis.className = 'in-vis g-' + grp;
}
function splitIn(el, text) { el.innerHTML = text.split(' ').map((w, i) => `<span style="animation-delay:${i * 50}ms">${w}</span>`).join(' '); }

/* реплики */
let run = 0, beats = [], bi = 0, tw = null, beatBusy = false;
const say = $('#inSay'), sayT = $('#inSayT');
function nextLabel() {
  const B = beats[bi];
  if (B && B.wait && !beatBusy) return B.wait;
  if (bi < beats.length) return 'Дальше →';
  return SC[list[si]].next();
}
function updBtn() { const b = $('#inNext'); b.textContent = nextLabel(); b.classList.toggle('ready', bi >= beats.length || (beats[bi] && beats[bi].wait && !beatBusy)); }
async function playFrom(k) {
  const my = ++run;
  for (bi = k; bi < beats.length; bi++) {
    const B = beats[bi];
    if (B.wait && !B._go) { beatBusy = false; updBtn(); return; }
    beatBusy = true; updBtn();
    say.classList.remove('talk', 'idle'); say.classList.add('loading');
    say.setAttribute('aria-busy', 'true'); sayT.innerHTML = '';
    const p = VO.play(B.say);
    const nextSection = list[si + 1];
    VO.preload([...beats.slice(bi + 1).map(b => b.say), ...(nextSection ? SC[nextSection].beats().map(b => b.say) : [])]);
    const started = p.audio ? await p.started : false; if (my !== run) return;
    say.classList.remove('loading'); say.setAttribute('aria-busy', 'false');
    if (p.audio && !started) { sayT.innerHTML = B.say; beatBusy = false; updBtn(); return; }
    const dur = await p.dur; if (my !== run) return;
    say.classList.add('talk');
    tw = VO.type(sayT, B.say, dur * 1000, started ? p.clock : null);
    if (B.mid) {
      const mid = () => { if (my === run) B.mid(); };
      if (started) p.at(dur * (B.midAt || 0.5), mid);
      else later(mid, dur * 1000 * (B.midAt || 0.5));
    }
    const vis2 = B.run ? Promise.resolve(B.run(my)) : Promise.resolve();
    await Promise.all([p.audio ? p.done : sleep(dur * 1000), vis2]); if (my !== run) return;
    tw.finish(); say.classList.remove('talk'); if (B.mid) B.mid(); if (B.fin) B.fin();
    await sleep(380); if (my !== run) return;
  }
  beatBusy = false; say.classList.remove('talk'); updBtn();
}
function skipBeat() {
  // мгновенно завершить текущую реплику и перейти к следующей
  const B = beats[bi]; run++; VO.stop(); clearT();
  if (tw) tw.finish(); say.classList.remove('talk', 'loading'); say.setAttribute('aria-busy', 'false');
  if (B && !(B.wait && !B._go && !beatBusy)) { if (B.mid) B.mid(); if (B.fin) B.fin(); bi++; }
  if (beats[bi] && beats[bi].wait) beats[bi]._go = true;
  playFrom(bi);
}
function show(i) {
  si = Math.max(0, Math.min(list.length - 1, i)); maxSi = Math.max(maxSi, si);
  const key = list[si], sc = SC[key];
  run++; VO.stop(); clearT();
  if (tw) { tw.finish(); tw = null; }
  buildVis(sc.grp);
  $('#inSteps').innerHTML = list.length > 1 ? list.map((k, j) => `<button class="${j < si ? 'done' : j === si ? 'cur' : ''}" data-j="${j}" ${j > maxSi ? 'disabled' : ''} title="${SC[k].k}"><i>${j < si ? '✓' : j + 1}</i><u>${SC[k].k}</u></button>`).join('<em></em>') : '';
  $$('#inSteps button').forEach(b => b.addEventListener('click', () => { if (+b.dataset.j !== si) show(+b.dataset.j); }));
  splitIn($('#inH'), sc.h());
  $('#inExtra').innerHTML = sc.extra ? sc.extra() : '';
  $('#inBack').style.visibility = si > 0 ? '' : 'hidden';
  $('#inSkip').style.display = (only || list.length < 2) ? 'none' : '';
  if (key !== 'problem') $$('.itag', vis).forEach(t => t.remove());
  sc.enter && sc.enter();
  beats = sc.beats(); beats.forEach(b => { b._go = false; });
  say.style.display = beats.length ? '' : 'none';
  sayT.innerHTML = ''; say.classList.add('idle');
  bi = 0; beatBusy = false; updBtn();
  VO.preload(beats.map(b => b.say));
  playFrom(0);
}
function open(n, opt = {}) {
  lv = n; spec = TG.G.spec; only = opt.only || null; built = ''; maxSi = 0;
  list = only === 'task' ? ['task'] : n === 1 ? ['task', 'find', 'problem', 'vlookup', 'plan'] : n === 4 ? ['task'] : ['task', 'find', 'plan'];
  $('#inLevels').style.display = only ? 'none' : '';
  ov.classList.add('on'); show(0);
}
function close() { run++; VO.stop(); clearT(); if (tw) { tw.finish(); tw = null; } say.classList.remove('talk', 'loading'); say.setAttribute('aria-busy', 'false'); ov.classList.remove('on'); }
function done() { const wasOnly = only; close(); if (!wasOnly) TG.begin(); }
function next() {
  const B = beats[bi];
  if (B && B.wait && !beatBusy) { B._go = true; playFrom(bi); return; }
  if (bi < beats.length) { skipBeat(); return; }
  if (si < list.length - 1) show(si + 1); else done();
}
$('#inNext').addEventListener('click', e => { e.currentTarget.blur(); next(); });
$('#inBack').addEventListener('click', e => { e.currentTarget.blur(); show(si - 1); });
$('#inSkip').addEventListener('click', () => done());
$('#inLevels').addEventListener('click', () => { close(); TG.openMap(); });
$('#inReplay').addEventListener('click', e => { e.stopPropagation(); e.currentTarget.blur(); show(si); });
say.addEventListener('click', () => { if (beatBusy) skipBeat(); });
VO.mount($('#inVol'));
VO.preload(SC.task.beats().map(b => b.say));
addEventListener('keydown', e => {
  if (!ov.classList.contains('on')) return;
  e.stopImmediatePropagation();
  if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); if (si > 0) show(si - 1); else { close(); TG.openMap(); } }
  else if (e.key === 'Escape') { e.preventDefault(); done(); }
  else if (e.key === 'm' || e.key === 'ь') { VO.toggleMute(); }
}, true);
/* все реплики уровня — для генерации озвучки */
function script(n) {
  const keep = [lv, spec, only, list];
  lv = n; spec = TG.G.spec; only = null;
  const L = n === 1 ? ['task', 'find', 'problem', 'vlookup', 'plan'] : n === 4 ? ['task'] : ['task', 'find', 'plan'];
  const out = L.flatMap(k => SC[k].beats().map(b => b.say)).filter(Boolean);
  [lv, spec, only, list] = keep;
  return out;
}
window.TI = { open, close, script, get on() { return ov.classList.contains('on'); }, show: i => show(i), next, get si() { return si; }, get bi() { return bi; } };
})();
