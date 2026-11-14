/* Continuation adapted from ion_inf lesson 4. */
(() => {
'use strict';
let active = null, previous = -1;
const $ = (s, r = active) => r.querySelector(s);
const $$ = (s, r = active) => [...r.querySelectorAll(s)];
const app = document.getElementById('slide-frame');
const fmt = n => Number(n).toLocaleString('ru-RU').replace(/\s/g, ' ');
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el, to, ms = 1100, suf = '') {
  if (reduced()) { setNum(el, to, suf); return; }
  const t0 = performance.now(), from = 0, tok = (el._cu = (el._cu || 0) + 1);
  const tick = now => {
    if (tok !== el._cu) return;
    const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(Math.round(from + (to - from) * e)) + suf;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function setNum(el, v, suf = '') { el._cu = (el._cu || 0) + 1; el.textContent = fmt(v) + suf; }
function confetti(n = 90) {
  if (reduced()) return;
  const cols = ['#B9521D', '#FFD8BE', '#2F855A', '#2B6CB0', '#6B46C1', '#B7791F', '#1D1D1F'];
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div'); d.className = 'confetti';
    d.style.left = (Math.random() * 1600) + 'px'; d.style.background = cols[i % cols.length];
    app.appendChild(d);
    const dx = (Math.random() - .5) * 300, rot = Math.random() * 720;
    d.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${dx}px, ${920 + Math.random() * 120}px) rotate(${rot}deg)` }],
      { duration: 1800 + Math.random() * 1400, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 300 }).onfinish = () => d.remove();
  }
}
function toast(msg) { const t = document.getElementById('status'); t.textContent = msg;  }
const znak = n => n % 10 === 1 && n % 100 !== 11 ? 'знак' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'знака' : 'знаков';


/* =================================================================== */
/*                     WIDGETS · задание 4                             */
/* =================================================================== */
const W = {};

/* цвета букв: Б — терракота, А — синий, О — зелёный, Т — фиолетовый */
const LC = {
  'Б': ['var(--k)', 'var(--k-bg)'], 'А': ['var(--t)', 'var(--t-bg)'], 'О': ['var(--n)', 'var(--n-bg)'], 'Т': ['var(--z)', 'var(--z-bg)'],
  'Р': ['var(--n)', 'var(--n-bg)'], 'Н': ['var(--z)', 'var(--z-bg)'], 'С': ['var(--a)', 'var(--a-bg)'], 'Я': ['#8E8E93', '#EDEDF0']
};
const cv = L => LC[L] ? `--c:${LC[L][0]};--cb:${LC[L][1]}` : '';
const CODES0 = { 'Б': '10', 'А': '010', 'О': '00' };
const CODES1 = { 'Б': '10', 'А': '010', 'О': '00', 'Т': '01' };
const WORD = 'БАОБАБ';
const encode = (word, codes) => [...word].map(ch => codes[ch]).join('');
const BITS = encode(WORD, CODES0);            // 10010001001010
/* декодирование как на занятии: читаем по знаку, как только набранное есть в таблице — это буква */
function greedy(bits, codes) {
  const inv = Object.fromEntries(Object.entries(codes).filter(([, v]) => v).map(([k, v]) => [v, k]));
  const out = [], log = []; let buf = '', start = 0;
  for (let i = 0; i < bits.length; i++) {
    buf += bits[i];
    if (inv[buf]) { out.push({ ch: inv[buf], a: start, b: i + 1 }); log.push({ buf, ch: inv[buf], i }); buf = ''; start = i + 1; }
    else log.push({ buf, ch: null, i });
  }
  return { out, log, rest: buf };
}
/* все способы прочитать код (не больше limit) */
function parses(bits, codes, limit = 4) {
  const ent = Object.entries(codes).filter(([, c]) => c);
  const out = [];
  const go = (i, acc) => {
    if (out.length >= limit) return;
    if (i === bits.length) { out.push(acc.join('')); return; }
    for (const [L, c] of ent) if (bits.startsWith(c, i)) go(i + c.length, acc.concat(L));
  };
  go(0, []); return out;
}
function parseCount(bits, codes) {
  const ent = Object.values(codes).filter(Boolean), memo = new Array(bits.length + 1).fill(-1);
  const go = i => { if (i === bits.length) return 1; if (memo[i] >= 0) return memo[i]; let n = 0; for (const c of ent) if (bits.startsWith(c, i)) n += go(i + c.length); return (memo[i] = Math.min(n, 1e6)); };
  return go(0);
}
function ctabHTML(codes, o = {}) {
  return `<div class="ch">${o.title || 'Таблица кодов'}</div>` + Object.entries(codes).map(([L, c]) =>
    `<div class="crow${o.newL === L ? ' new' : ''}" data-l="${L}" style="${cv(L)}"><b>${L}</b><span class="mono">${c}</span><small>${c.length} ${znak(c.length)}</small></div>`).join('');
}

/* ---- КИМ-страница (камера) ---- */
const offIn = (e, root) => { let x = 0, y = 0; while (e && e !== root) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y }; };
W.kim = {
  step(el, s) {
    const view = $('.kimv', el), page = $('.kimp', el), zones = $$('.kz', page);
    const VW = view.clientWidth, VH = view.clientHeight, PW = page.offsetWidth, PH = page.offsetHeight;
    let k, tx, ty, rot = 0;
    if (!s) { k = Math.min(VH * 0.95 / PH, VW * 0.95 / PW, 1.3); tx = (VW - PW * k) / 2; ty = (VH - PH * k) / 2 + 4; rot = -0.9; }
    else {
      const z = zones[Math.min(s, zones.length) - 1], p = offIn(z, page), w = z.offsetWidth, h = z.offsetHeight;
      k = Math.min(VW * 0.92 / w, VH * 0.86 / h, 1.75); tx = VW / 2 - (p.x + w / 2) * k; ty = VH / 2 - (p.y + h / 2) * k;
      ty = Math.min(18, Math.max(ty, VH - PH * k - 18));
    }
    page.style.transform = `translate(${tx}px,${ty}px) scale(${k}) rotate(${rot}deg)`;
    zones.forEach((z, i) => { z.classList.toggle('on', i === s - 1); z.classList.toggle('read', i < s); });
  }
};

/* ---- два этапа: картинка из пикселей ---- */


/* ---- кодируем БАОБАБ ---- */
W.encode = {
  init(el) {
    $('#encTab', el).innerHTML = ctabHTML(CODES0);
    $('#encCols', el).innerHTML = [...WORD].map(L => `<div class="ecol" style="${cv(L)}"><div class="etile">${L}</div><div class="earr">↓</div><div class="ecode">${CODES0[L]}</div></div>`).join('');
    $('#encBits', el).innerHTML = [...WORD].map(L => [...CODES0[L]].map(b => `<div class="bit" style="${cv(L)}">${b}</div>`).join('')).join('');
  },
  step(el, s) {
    const cols = $('#encCols', el);
    cols.classList.toggle('joined', s === 0); cols.classList.toggle('split', s >= 1); cols.classList.toggle('coded', s >= 2);
    $('#encTab', el).classList.toggle('showlen', s >= 4);
    $('#encHead', el).innerHTML = ['Кодируем <em>БАОБАБ</em>', 'Шаг 1: делим на <em>символы</em>', 'Шаг 2: код для <em>каждой буквы</em>', `Склеиваем: <em>${BITS.length} знаков</em>`, 'Коды <em>разной длины</em>'][s];
  }
};

/* ---- декодирование и неоднозначность ---- */
const DEC = { 0: { codes: CODES0, newL: null }, 1: { codes: CODES1, newL: 'Т' } };
const CW = 62;
function bracket(row, a, b, L) {
  const d = document.createElement('div'); d.className = 'pbr';
  d.style.cssText = `left:${a * CW}px;width:${(b - a) * CW - 6}px;${cv(L)}`; d.innerHTML = `<b>${L}</b>`; row.appendChild(d);
}
W.decode = {
  tok: 0,
  init(el) {
    const k = el.dataset.dec, D = DEC[k];
    $(`#dec${k}Tab`, el).innerHTML = ctabHTML(D.codes, { newL: D.newL });
    const bits = $(`#dec${k}Bits`, el); bits.classList.add('plain');
    bits.innerHTML = [...BITS].map(b => `<div class="bit">${b}</div>`).join('');
  },
  leave() { this.tok++; },
  async step(el, s, o) {
    const k = el.dataset.dec, D = DEC[k], tok = ++this.tok;
    const bits = $$(`#dec${k}Bits .bit`, el), up = $(`#dec${k}Up`, el), dn = $(`#dec${k}Dn`, el), rd = $(`#dec${k}Read`, el), out = $(`#dec${k}Out`, el), tab = $(`#dec${k}Tab`, el);
    const g = greedy(BITS, D.codes);
    bits.forEach(b => { b.className = 'bit'; b.style.removeProperty('--c'); });
    $(`#dec${k}Bits`, el).classList.toggle('plain', s === 0);
    up.innerHTML = ''; dn.innerHTML = ''; out.innerHTML = '';
    $$('.crow', tab).forEach(r => r.classList.remove('hit'));
    if (k === '1') $('#dec1Head', el).innerHTML = ['Добавим букву <em>Т = 01</em>', 'Читаем заново: <em>БТОТОББ</em>?!', 'Один код — <em>два слова</em>', 'Это <em>неоднозначность</em>'][s];
    if (s === 0) {
      rd.innerHTML = k === '0' ? '<span>Читаем по одному знаку и после каждого смотрим в таблицу</span>' : '<span>Слово не меняли — в памяти <b class="fin">тот же код</b>. Читаем его заново</span>';
      return;
    }
    const paint = m => { for (let i = m.a; i < m.b; i++) { bits[i].classList.add('done'); bits[i].style.setProperty('--c', LC[m.ch][0]); } bracket(dn, m.a, m.b, m.ch); };
    if (o.dir > 0 && !o.enter && s === 1 && !reduced()) {
      let start = 0;
      for (const e of g.log) {
        bits.forEach((b, i) => b.classList.toggle('buf', i >= start && i <= e.i));
        rd.innerHTML = `<span>Читаю</span><span class="mono">${e.buf}</span>` + (e.ch ? `<span class="yes">→ есть, это ${e.ch}</span>` : '<span class="no">— нет в таблице</span>');
        if (e.ch) {
          const row = $(`.crow[data-l="${e.ch}"]`, tab); row.classList.add('hit');
          await wait(520); if (tok !== this.tok) return;
          row.classList.remove('hit'); bits.forEach(b => b.classList.remove('buf'));
          paint(g.out.find(m => m.b === e.i + 1)); start = e.i + 1;
          await wait(160);
        } else await wait(420);
        if (tok !== this.tok) return;
      }
    } else g.out.forEach(paint);
    bits.forEach(b => b.classList.remove('buf'));
    const word = g.out.map(m => m.ch).join('');
    rd.innerHTML = `<span>Готово:</span><b class="fin">${word}</b>`;
    if (k === '0') { out.innerHTML = `<span class="w ok">${word}</span>`; return; }
    out.innerHTML = `<span class="w bad">${word}</span>`;
    if (s >= 2) {
      greedy(BITS, CODES0).out.forEach(m => bracket(up, m.a, m.b, m.ch));
      up.insertAdjacentHTML('beforeend', '<span class="plab">как задумано</span>');
      dn.insertAdjacentHTML('beforeend', '<span class="plab">прочитали</span>');
      out.innerHTML = `<span class="w ok">${WORD}</span><span class="eq">или</span><span class="w bad">${word}</span>`;
      rd.innerHTML = '<span>Оба варианта <b class="fin">подходят</b> — какой верный, непонятно</span>';
    }
  }
};

/* ---- дерево кода: общий рендер ---- */
function treeSet(codes, siblings = true) {
  const s = new Set();
  codes.forEach(c => { for (let i = 1; i <= c.length; i++) s.add(c.slice(0, i)); });
  if (siblings) [...s].forEach(c => s.add(c.slice(0, -1) + (c.endsWith('0') ? '1' : '0')));
  return s;
}
function renderCodeTree(box, codes, o = {}) {
  const set = treeSet(codes, o.siblings !== false);
  const kids = c => ['0', '1'].map(b => c + b).filter(k => set.has(k));
  const lv = {};
  const leaves = c => lv[c] ?? (lv[c] = kids(c).length ? kids(c).reduce((a, k) => a + leaves(k), 0) : 1);
  const total = Math.max(1, leaves(''));
  const D = Math.max(1, ...[...set].map(c => c.length));
  const Wd = box.clientWidth || 1000, Hd = box.clientHeight || 600;
  const top = o.top ?? 24, bottom = o.bottom ?? 80;
  const levelH = Math.min(o.maxLevel || 118, (Hd - top - bottom) / D);
  const slotW = Wd / total, pos = {};
  const walk = (c, x0) => { pos[c] = { x: x0 + leaves(c) * slotW / 2, y: top + c.length * levelH }; let x = x0; kids(c).forEach(k => { walk(k, x); x += leaves(k) * slotW; }); };
  walk('', 0);
  const list = [...set].sort((a, b) => a.length - b.length || (a < b ? -1 : 1));
  let svg = '', html = `<div class="croot" style="left:${pos[''].x}px;top:${pos[''].y}px"></div>`;
  list.forEach(c => {
    const p = pos[c.slice(0, -1)], q = pos[c];
    svg += `<line class="ce" data-c="${c}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`;
    if (o.labels) { const dx = c.endsWith('0') ? -17 : 17; html += `<span class="cel" data-c="${c}" style="left:${(p.x + q.x) / 2 + dx}px;top:${(p.y + q.y) / 2 - 8}px">${c.slice(-1)}</span>`; }
    html += `<div class="cnode" data-c="${c}" style="left:${q.x}px;top:${q.y}px"><b>${c}</b><span class="clt"></span></div>`;
  });
  box.innerHTML = `<svg class="tsvg" width="${Wd}" height="${Hd}">${svg}</svg>${html}`;
  Object.assign(box, { _pos: pos, _set: set, _lh: levelH, _sw: slotW, _w: Wd });
}
const ADD = ['show', 'cross', 'found'], REP = ['free', 'pick', 'trap', 'spare', 'got'];
function mkState(o = {}) {
  const st = { letter: {}, asks: {}, ghost: [], askBad: [] };
  ADD.concat(REP).forEach(k => { st[k] = new Set(); });
  Object.entries(o).forEach(([k, v]) => { st[k] = (ADD.includes(k) || REP.includes(k)) ? new Set(v) : v; });
  return st;
}
function treeState(steps, s) {
  const st = mkState();
  for (let i = 0; i <= s && i < steps.length; i++) {
    const p = steps[i];
    ADD.forEach(k => (p[k] || []).forEach(c => st[k].add(c)));
    (p.uncross || []).forEach(c => st.cross.delete(c));
    REP.forEach(k => { if (p[k]) st[k] = new Set(p[k]); });
    Object.entries(p.letter || {}).forEach(([c, l]) => { if (l) st.letter[c] = l; else delete st.letter[c]; });
    Object.assign(st.asks, p.asks || {});
    ['ghost', 'askBad', 'head', 'note', 'tone', 'inf', 'cnt'].forEach(k => { if (p[k] !== undefined) st[k] = p[k]; });
  }
  return st;
}
function paintTree(box, st) {
  $('.croot', box)?.classList.toggle('on', st.show.size > 0);
  $$('.cnode', box).forEach(n => {
    const c = n.dataset.c, L = st.letter[c];
    n.classList.toggle('on', st.show.has(c));
    n.classList.toggle('let', !!L);
    $('.clt', n).textContent = L || '';
    REP.concat('cross').forEach(k => n.classList.toggle(k, !!st[k]?.has(c)));
  });
  $$('.ce, .cel', box).forEach(e => e.classList.toggle('on', st.show.has(e.dataset.c)));
  $$('.cghost, .cinf, .ceg', box).forEach(e => e.remove());
  const svg = $('svg', box);
  (st.ghost || []).forEach(c => {
    const p = box._pos[c]; if (!p) return;
    const dy = box._lh * .95, dx = Math.min(58, box._sw * .33), y1 = p.y + (st.letter[c] ? 70 : 24);
    ['0', '1'].forEach((b, k) => {
      const x = p.x + (k ? dx : -dx), y = p.y + dy;
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('class', 'ceg'); ln.setAttribute('x1', p.x); ln.setAttribute('y1', y1); ln.setAttribute('x2', x); ln.setAttribute('y2', y - 18);
      svg.appendChild(ln);
      const g = document.createElement('div'); g.className = 'cghost'; g.style.left = x + 'px'; g.style.top = y + 'px'; g.textContent = c + b; box.appendChild(g);
    });
  });
  if (st.inf) {
    const p = box._pos[st.inf.c];
    if (p) { const d = document.createElement('div'); d.className = 'cinf'; d.style.left = p.x + 'px'; d.style.top = (p.y + 66) + 'px'; d.innerHTML = st.inf.t; box.appendChild(d); }
  }
}

/* ---- деревья уроков ---- */
const T1 = ['0', '1000', '1001', '101', '1100', '1101', '111'];
const TREES = {
  t1: {
    codes: T1, labels: true, given: [['А', '0'], ['Б', '1100'], ['В', '1000']], ask: ['Г'],
    steps: [
      { show: ['0', '1'], head: 'Начинаем с <em>0</em> и <em>1</em>', note: 'Влево — дописываем <b>0</b>, вправо — <b>1</b>. Ищем в дереве данные коды.' },
      { letter: { '0': 'А' }, found: ['А'], head: '<em>0</em> — это А', note: 'Нашли данный код — подчёркиваем, подписываем букву, а в условии <b>зачёркиваем</b>.' },
      { show: ['10', '11'], head: 'Из 1: <em>10</em> и <em>11</em>', note: 'Раскрываем узел — рисуем <b>сразу обе</b> ветки: влево 10, вправо 11.' },
      { show: ['100', '101', '1000', '1001'], letter: { '1000': 'В' }, found: ['В'], head: '10 → 100 → <em>1000 — это В</em>', note: 'Идём к 1000: из 10 влево — 100, из 100 влево — 1000. Это <b>В</b>.' },
      { show: ['110', '111', '1100', '1101'], letter: { '1100': 'Б' }, found: ['Б'], head: '11 → 110 → <em>1100 — это Б</em>', note: 'Все данные коды найдены. Осталось понять, куда поставить <b>Г</b>.' }
    ]
  },
  w1: {
    codes: T1, given: [['А', '0'], ['Б', '1100'], ['В', '1000']], ask: ['Г'],
    steps: [
      { show: [...treeSet(T1)], letter: { '0': 'А', '1000': 'В', '1100': 'Б' }, found: ['А', 'Б', 'В'], head: 'Куда поставить <em>Г</em>?', note: 'Дерево построено. Где для Г есть место?' },
      { ghost: ['0', '1000', '1100'], head: 'Ниже букв — <em>нельзя</em>', note: 'Всё, что ниже 1000, начинается на 1000: <b>10000</b>, <b>10001</b>… Тогда код В станет началом кода Г.' },
      { ghost: [], cross: ['1', '10', '100', '11', '110'], head: 'Выше букв — тоже <em>нельзя</em>', note: '<b>100</b> — начало 1000 (В), <b>11</b> — начало 1100 (Б). Узлы на пути к буквам зачёркиваем.' },
      { free: ['1001', '101', '1101', '111'], head: 'Рядом — <em>можно</em>', note: 'Свободны четыре ветки: <b>1001, 101, 1101, 111</b>.' },
      { free: ['1001', '1101'], pick: ['101', '111'], head: 'Кратчайшие: <em>101</em> и <em>111</em>', note: 'У двух свободных веток длина 3 — это кратчайшие коды. Какой выбрать?' },
      { free: ['1001', '1101', '101'], pick: ['111'], letter: { '111': 'Г' }, asks: { 'Г': '111' }, tone: 'good', head: '111 &gt; 101 → <em>Г = 111</em>', note: '«Если таких слов несколько — с наибольшим числовым значением»: 111 больше 101. <b>Ответ: 111</b>.' }
    ]
  },
  t3: {
    codes: ['00', '01', '100', '101', '110', '1110', '1111'], given: [['А', '00'], ['Б', '01'], ['В', '110'], ['Г', '101'], ['Д', '100']], ask: ['Я'], alpha: 33,
    steps: [
      { show: ['0', '1', '00', '01', '10', '11'], letter: { '00': 'А', '01': 'Б' }, found: ['А', 'Б'], cross: ['0'], cnt: { n: 2 }, head: 'А = 00, Б = 01', note: 'Ветка 0 занята целиком: в ней А и Б.' },
      { show: ['100', '101', '110', '111'], letter: { '100': 'Д', '101': 'Г', '110': 'В' }, found: ['В', 'Г', 'Д'], cross: ['1', '10', '11'], free: ['111'], cnt: { n: 5 }, head: 'Свободна одна ветка — <em>111</em>', note: 'Пять букв на месте. Свободной осталась только <b>111</b>.' },
      { free: [], pick: ['111'], letter: { '111': 'Я?' }, asks: { 'Я': '111?' }, cnt: { n: 6 }, head: 'Я = 111?', note: 'Самый короткий свободный код — 111. Записываем в ответ?' },
      { pick: [], trap: ['111'], tone: 'warn', askBad: ['Я'], cnt: { n: 6, bad: true }, head: 'Так — <em>0 баллов</em>', note: '«<b>Все</b> буквы русского алфавита» — их 33. Закодировано 6, а свободных веток больше нет: остальным <b>27 буквам</b> некуда встать.' },
      { show: ['1110', '1111'], trap: [], askBad: [], cross: ['111'], letter: { '111': null, '1111': 'Я', '1110': 'запас' }, spare: ['1110'], pick: ['1111'], asks: { 'Я': '1111' }, tone: 'good', cnt: { n: 6, ok: true }, inf: { c: '1110', t: '↓ ещё 27 букв<br>и сколько угодно' }, head: 'Я = <em>1111</em>, а 1110 — запас', note: 'Раскрываем 111. <b>1111</b> отдаём Я — оно больше 1110. А <b>1110</b> оставляем пустой: из неё вырастет сколько угодно кодов.' }
    ]
  },
  t4: {
    codes: ['00', '010', '0110', '0111', '10', '11'], given: [['С', '00'], ['Р', '010'], ['Н', '11']], ask: ['А', 'Т', 'Я'],
    steps: [
      { show: ['0', '1', '00', '01', '10', '11', '010', '011'], letter: { '00': 'С', '010': 'Р', '11': 'Н' }, found: ['С', 'Р', 'Н'], cross: ['0', '1', '01'], free: ['10', '011'], head: 'Свободны <em>10</em> и <em>011</em>', note: 'Данные коды на месте. Свободных веток две: <b>10</b> — длина 2 и <b>011</b> — длина 3.' },
      { free: ['011'], pick: ['10'], letter: { '10': 'А' }, asks: { 'А': '10' }, head: 'А чаще всех → <em>А = 10</em>', note: 'А встречается <b>3 раза</b> — отдаём ей самый короткий код.' },
      { free: [], pick: [], trap: ['011'], letter: { '011': 'Т' }, asks: { 'Т': '011' }, askBad: ['Я'], tone: 'warn', head: 'Т = 011… а где <em>Я</em>?', note: 'Свободные ветки кончились, а <b>Я</b> без кода! В слове её нет, но она есть в наборе букв. Так — <b>0 баллов</b>.' },
      { show: ['0110', '0111'], trap: [], askBad: [], cross: ['011'], letter: { '011': null, '0110': 'Я', '0111': 'Т' }, got: ['10', '0110', '0111'], asks: { 'Т': '0111', 'Я': '0110' }, tone: 'good', head: 'Раскрываем 011: <em>Я и Т</em>', note: 'Теперь место есть у всех шести букв. Т стала длиннее — 0111, зато Я поместилась.' }
    ]
  }
};
W.ctree = {
  init(el) {
    const cfg = TREES[el.dataset.tree], side = $('.tside', el);
    $('.given', el).innerHTML = cfg.given.map(([L, c]) => `<div class="gv" data-g="${L}"><b>${L}</b><span>${c}</span></div>`).join('') +
      (cfg.ask || []).map(L => `<div class="gv gq" data-a="${L}"><b>${L}</b><span>?</span></div>`).join('');
    if (cfg.alpha) side.insertAdjacentHTML('beforeend', `<div class="tcnt"><span><b>0</b> из ${cfg.alpha} букв закодировано<i></i></span></div>`);
  },
  step(el, s, o) {
    const cfg = TREES[el.dataset.tree], box = $('.treebox', el);
    if (!box._pos || box._w !== box.clientWidth) renderCodeTree(box, cfg.codes, cfg);
    const st = treeState(cfg.steps, s);
    paintTree(box, st);
    $('.th', el).innerHTML = st.head || '';
    $$('.gv[data-g]', el).forEach(g => g.classList.toggle('found', st.found.has(g.dataset.g)));
    $$('.gv[data-a]', el).forEach(g => {
      const L = g.dataset.a, v = st.asks[L];
      $('span', g).textContent = v || '?';
      g.classList.toggle('done', !!v && st.tone === 'good');
      g.classList.toggle('bad', st.askBad.includes(L));
    });
    const nt = $('.tnote', el), html = st.note || '';
    if (nt.innerHTML !== html) { nt.innerHTML = html; nt.classList.remove('fresh'); void nt.offsetWidth; nt.classList.add('fresh'); }
    nt.classList.toggle('warn', st.tone === 'warn'); nt.classList.toggle('good', st.tone === 'good');
    const cnt = $('.tcnt', el);
    if (cnt) { $('b', cnt).textContent = st.cnt ? st.cnt.n : 0; cnt.classList.toggle('bad', !!st.cnt?.bad); $('i', cnt).textContent = st.cnt?.ok ? ' · место для остальных есть' : ''; }
    if (st.tone === 'good' && o.dir > 0 && !o.enter && s === cfg.steps.length - 1) confetti(50);
  }
};

/* ---- лесенка против ровного дерева ---- */
const SUMS = {
  A: ['1', '01', '000', '0010', '00110', '001110', '001111'],
  B: ['1', '01', '0000', '0001', '0010', '00110', '00111']
};
const SL = 'АБВГДЕЖ';
W.sum = {
  init(el) {
    Object.entries(SUMS).forEach(([k, codes]) => {
      const box = $('#sum' + k, el);
      renderCodeTree(box, codes, { top: 20, bottom: 52, maxLevel: 74 });
      paintTree(box, mkState({ show: [...box._set], letter: Object.fromEntries(codes.map((c, i) => [c, SL[i]])) }));
      const sum = codes.reduce((a, c) => a + c.length, 0);
      $('#len' + k, el).innerHTML = codes.map((c, i) => `<span>${SL[i]}<i>${c.length}</i></span>`).join('') + `<span class="eq">= ${sum}</span>`;
    });
  },
  step(el, s, o) {
    const fwd = o.dir > 0 && !o.enter;
    if (s === 1 && fwd) countUp($('#sumAs', el), 27, 900); else setNum($('#sumAs', el), 27);
    if (s === 2 && fwd) countUp($('#sumBs', el), 25, 900); else setNum($('#sumBs', el), 25);
    $$('.duo-c', el)[1].classList.toggle('win', s >= 3);
  }
};

/* ---- тренажёр: собери дерево ---- */
const PRESETS = {
  seven: { fixed: [['А', '1'], ['Б', '01']], roots: ['00'], letters: ['В', 'Г', 'Д', 'Е', 'Ж'], w: {}, best: 25, label: 'сумма длин всех букв', tip: 'Сделай длины ровнее — без «лесенки».' },
  word: { fixed: [['С', '00'], ['Р', '010'], ['Н', '11']], roots: ['10', '011'], letters: ['А', 'Т', 'Я'], w: { 'А': 3, 'Т': 2, 'Я': 0, 'С': 1, 'Р': 1, 'Н': 1 }, best: 21, label: 'знаков в ТАРАНТАС', tip: 'Частой букве — самый короткий код.' }
};
W.build = {
  init(el) {
    this.el = el; this.p = 'seven'; this.exp = new Set(); this.fresh = []; this.won = {};
    $$('#bdPre button', el).forEach(b => b.addEventListener('click', e => {
      e.currentTarget.blur(); this.p = b.dataset.p; this.exp.clear();
      $$('#bdPre button', el).forEach(x => x.classList.toggle('on', x === b)); this.draw();
    }));
    $('#bdReset', el).addEventListener('click', e => { e.currentTarget.blur(); this.exp.clear(); this.draw(); });
    this.draw();
  },
  step() {},
  leaves() {
    const out = [], walk = c => { if (this.exp.has(c)) { walk(c + '0'); walk(c + '1'); } else out.push(c); };
    PRESETS[this.p].roots.forEach(walk); return out;
  },
  draw() {
    const P = PRESETS[this.p], el = this.el, box = $('#bdTree', el), wt = L => P.w[L] ?? 1;
    const leaves = this.leaves();
    renderCodeTree(box, P.fixed.map(f => f[1]).concat(leaves), { top: 26, bottom: 74, maxLevel: 104 });
    const order = leaves.slice().sort((a, b) => a.length - b.length || (a < b ? -1 : 1));
    const lets = P.letters.slice().sort((a, b) => wt(b) - wt(a));
    const assign = {}; lets.forEach((L, i) => { if (order[i]) assign[order[i]] = L; });
    const letter = Object.fromEntries(P.fixed.map(([L, c]) => [c, L]));
    Object.assign(letter, assign);
    paintTree(box, mkState({ show: [...box._set], letter, got: Object.keys(assign) }));
    $$('.cnode', box).forEach(n => {
      const c = n.dataset.c, leaf = leaves.includes(c), inner = this.exp.has(c);
      n.classList.toggle('click', leaf || inner); n.classList.toggle('open', leaf && !assign[c]); n.classList.toggle('inner', inner);
      if (this.fresh.includes(c)) n.classList.add('fresh');
      n.onclick = leaf ? () => this.split(c) : inner ? () => this.join(c) : null;
      if (leaf || inner) n.title = leaf ? 'Разделить ветку' : 'Свернуть ветку';
    });
    this.fresh = [];
    $$('.cnode.click', box).forEach(accessibleNode);
    const codeOf = L => Object.keys(assign).find(k => assign[k] === L);
    const rows = P.fixed.map(([L, c]) => ({ L, c, fixed: true })).concat(P.letters.map(L => ({ L, c: codeOf(L) })));
    $('#bdList', el).innerHTML = rows.map(r => `<div class="bl${r.fixed ? ' fixed' : r.c ? ' got' : ' miss'}"><b>${r.L}</b><span class="${r.c ? 'mono' : 'nm'}">${r.c || 'нет места'}</span><small>${r.c ? (this.p === 'word' ? `${r.c.length}×${wt(r.L)}` : r.c.length) : ''}</small></div>`).join('');
    const missing = rows.filter(r => !r.c).map(r => r.L), extra = leaves.length - P.letters.length;
    const sum = rows.reduce((a, r) => a + (r.c ? r.c.length * wt(r.L) : 0), 0);
    $('#bdSumL', el).textContent = P.label;
    $('#bdSum', el).textContent = missing.length ? '—' : sum;
    const msg = $('#bdMsg', el); let cls = '', t;
    if (missing.length) {
      cls = 'bad';
      t = missing.includes('Я') && this.p === 'word' ? '<b>Я</b> без кода — это 0 баллов! В слове её нет, но код нужен. Раздели свободную ветку.' : `Не хватает места: <b>${missing.join(', ')}</b> без кода. Нажми на свободную ветку, чтобы разделить её.`;
    } else if (extra > 0) { cls = 'warn'; t = `Лишняя пустая ветка. Сверни её — коды станут короче.`; }
    else if (sum === P.best) { cls = 'ok'; t = `<b>Минимум!</b> ${sum} — это и есть ответ.`; if (!this.won[this.p]) { this.won[this.p] = 1; confetti(60); } }
    else { cls = 'warn'; t = `Сумма ${sum}. Можно короче. ${P.tip}`; }
    msg.className = 'bd-msg ' + cls; msg.innerHTML = t;
    $('#bdBest', el).textContent = this.won[this.p] ? '✓ минимум найден' : '';
  },
  split(c) { if (c.length >= 6) { toast('Слишком длинный код — раскрой ветку повыше'); return; } this.exp.add(c); this.fresh = [c + '0', c + '1']; this.draw(); },
  join(c) { [...this.exp].forEach(k => { if (k.startsWith(c)) this.exp.delete(k); }); this.draw(); }
};

/* ---- проверка условия Фано ---- */
const FC_L = ['Б', 'А', 'О', 'Т'];
const FC_PRE = { lesson: { 'Б': '10', 'А': '010', 'О': '00', 'Т': '01' }, fix: { 'Б': '10', 'А': '010', 'О': '00', 'Т': '11' }, mine: { 'Б': '', 'А': '', 'О': '', 'Т': '' } };
W.check = {
  init(el) {
    this.el = el;
    $('#fcRows', el).innerHTML = FC_L.map(L => `<label class="fr" style="${cv(L)}"><b>${L}</b><input data-l="${L}" inputmode="numeric" maxlength="6" autocomplete="off" spellcheck="false" aria-label="Код буквы ${L}"><span class="st"></span></label>`).join('');
    $$('#fcRows input', el).forEach(i => i.addEventListener('input', () => {
      const v = i.value.replace(/[^01]/g, '').slice(0, 6); if (v !== i.value) i.value = v;
      $$('#fcPre button', el).forEach(b => b.classList.toggle('on', b.dataset.p === 'mine'));
      this.eval();
    }));
    $$('#fcPre button', el).forEach(b => b.addEventListener('click', e => { e.currentTarget.blur(); this.set(b.dataset.p); }));
    this.set('lesson');
  },
  step() {},
  set(p) {
    $$('#fcPre button', this.el).forEach(b => b.classList.toggle('on', b.dataset.p === p));
    $$('#fcRows input', this.el).forEach(i => { i.value = FC_PRE[p][i.dataset.l]; });
    if (p === 'mine') $('#fcRows input', this.el).focus({ preventScroll: true });
    this.eval();
  },
  eval() {
    const el = this.el, codes = {};
    $$('#fcRows input', el).forEach(i => { codes[i.dataset.l] = i.value; });
    const ent = Object.entries(codes).filter(([, c]) => c), issues = [], bad = new Set();
    ent.forEach(([a, ca]) => ent.forEach(([b, cb]) => {
      if (a >= b && ca === cb && a !== b) { issues.push(`<b>${b}</b> и <b>${a}</b> — одинаковые коды <span class="mono">${ca}</span>`); bad.add(a).add(b); }
      else if (a !== b && ca !== cb && cb.startsWith(ca)) { issues.push(`<span class="mono">${a} = ${ca}</span> — начало <span class="mono">${b} = ${cb}</span>`); bad.add(a).add(b); }
    }));
    $$('.fr', el).forEach(r => {
      const L = $('input', r).dataset.l, c = codes[L];
      r.classList.toggle('bad', bad.has(L)); r.classList.toggle('ok', !!c && !bad.has(L));
      $('.st', r).textContent = !c ? '' : bad.has(L) ? '✗' : '✓';
    });
    const msg = $('#fcMsg', el), empty = FC_L.filter(L => !codes[L]);
    if (issues.length) { msg.className = 'fc-msg bad'; msg.innerHTML = '✗ Условие Фано нарушено:<br>' + issues.slice(0, 3).join('<br>'); }
    else if (empty.length) { msg.className = 'fc-msg'; msg.innerHTML = `Введи коды из 0 и 1${ent.length ? ` — осталось: <b>${empty.join(', ')}</b>` : ''}.`; }
    else { msg.className = 'fc-msg ok'; msg.innerHTML = '✓ Условие Фано выполнено: ни один код не начало другого.'; }
    const wd = $('#fcWord', el);
    if (['Б', 'А', 'О'].every(L => codes[L])) {
      const bits = encode(WORD, codes), n = parseCount(bits, codes), ps = parses(bits, codes, 3);
      wd.innerHTML = `<div>${WORD} → <span class="mono">${bits}</span></div><div>Способов прочитать: <b>${n > 999 ? 'больше 1000' : n}</b></div><div>${ps.map(p => `<span class="pw${p === WORD ? '' : ' bad'}">${p}</span>`).join('')}${n > ps.length ? '<span class="pw bad">…</span>' : ''}</div>`;
    } else wd.innerHTML = '';
    const box = $('#fcTree', el);
    if (!ent.length) { box.innerHTML = ''; return; }
    renderCodeTree(box, ent.map(e => e[1]), { top: 26, bottom: 70, maxLevel: 96 });
    const letter = {}; ent.forEach(([L, c]) => { letter[c] = letter[c] ? letter[c] + '/' + L : L; });
    paintTree(box, mkState({ show: [...box._set], letter, trap: ent.filter(([L]) => bad.has(L)).map(e => e[1]), got: ent.filter(([L]) => !bad.has(L)).map(e => e[1]) }));
  }
};

/* ---- азбука Морзе ---- */
const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', 0: '-----' };
const MCOLS = ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ1', '234567890'];
const MGROUP = { 1: 'ET', 2: 'AIMN', 3: '1234567890' };
W.morse = {
  init(el) {
    let h = '';
    for (let r = 0; r < 9; r++) MCOLS.forEach(col => { const ch = col[r]; h += `<div class="mc" data-ch="${ch}"><b>${ch}</b><span>${[...MORSE[ch]].map(x => `<i class="${x === '.' ? 'd' : 'l'}"></i>`).join('')}</span></div>`; });
    $('#morse', el).innerHTML = h;
  },
  step(el, s) {
    const g = MGROUP[s] || '';
    $('#morse', el).classList.toggle('hl', s > 0);
    $$('.mc', el).forEach(c => c.classList.toggle('on', g.includes(c.dataset.ch)));
    $('#mrHead', el).innerHTML = ['Азбука <em>Морзе</em>', '<em>E</em> и <em>T</em> — один знак', 'Частые буквы — <em>коротко</em>', 'Редкие цифры — <em>по 5 знаков</em>'][s];
  }
};

/* ---- ТАРАНТАС: частоты ---- */
const TW = 'ТАРАНТАС';
const TCNT = [['А', 3], ['Т', 2], ['Р', 1], ['Н', 1], ['С', 1], ['Я', 0]];
W.count = {
  init(el) {
    $('#cntWord', el).innerHTML = [...TW].map(L => `<div class="wt" style="${cv(L)}">${L}</div>`).join('');
    $('#cntList', el).innerHTML = TCNT.map(([L, n]) => `<div class="cnt" data-l="${L}" style="${cv(L)}"><b>${L}</b><div><span>×${n}</span><small></small></div></div>`).join('');
  },
  step(el, s) {
    $('#cntWord', el).classList.toggle('col', s >= 1);
    $('#cntList', el).classList.toggle('on', s >= 1);
    $$('.cnt', el).forEach(c => {
      const L = c.dataset.l, given = 'РНС'.includes(L), ya = L === 'Я';
      c.style.display = ya && s < 2 ? 'none' : '';
      c.classList.toggle('given', s >= 2 && given);
      c.classList.toggle('unk', s >= 2 && !given && !ya);
      c.classList.toggle('ghost', ya);
      $('small', c).textContent = s < 2 ? '' : given ? 'код дан' : ya ? 'нет в слове, но код нужен' : 'ищем код';
    });
  }
};

/* ---- длина слова ---- */
W.cost = {
  step(el, s, o) {
    const n = $('#costN', el);
    if (s >= 2) { if (o.dir > 0 && !o.enter) { countUp(n, 21, 900); confetti(50); } else setNum(n, 21); }
    $('#costH', el).textContent = s >= 2 ? '21 знак' : 'сколько знаков?';
  }
};

/* ---- шпаргалка: памятка-дерево ---- */
W.cheat = {
  init(el) {
    const box = $('#csTree', el);
    renderCodeTree(box, T1, { top: 18, bottom: 70, maxLevel: 64 });
    paintTree(box, mkState({ show: [...box._set], letter: { '0': 'А', '1000': 'В', '1100': 'Б', '111': 'Г' }, cross: ['1', '10', '100', '11', '110'], free: ['1001', '101', '1101'], pick: ['111'] }));
  }
};

/* ---- квиз ---- */
const QUIZ = [
  { q: 'Какой набор кодов удовлетворяет условию Фано?', opts: ['<span class="mono">0, 10, 110, 111</span>', '<span class="mono">0, 01, 11</span>', '<span class="mono">1, 10, 00</span>', '<span class="mono">00, 01, 001</span>'], a: 0, ex: 'В первом наборе ни один код не начало другого. Во втором <b>0</b> — начало 01, в третьем <b>1</b> — начало 10, в четвёртом <b>00</b> — начало 001.' },
  { q: 'А = 0, Б = 10, В = 110. Какой код для Г самый короткий?', opts: ['<span class="mono">111</span>', '<span class="mono">11</span>', '<span class="mono">01</span>', '<span class="mono">1110</span>'], a: 0, ex: '<b>01</b> начинается с 0 — это А. <b>11</b> — начало 110 (В). Свободна ветка <b>111</b>. Код 1110 тоже подходит, но он длиннее.' },
  { q: 'Почему «БАОБАБ» прочитали как «БТОТОББ»?', opts: ['Код Т = 01 — начало кода А = 010', 'У букв коды разной длины', 'Читали справа налево', 'Буквы Т нет в слове'], a: 0, ex: 'Нарушено условие Фано: код Т — начало кода А. Разная длина сама по себе не проблема, проблема — в «началах».' },
  { q: 'Все 33 буквы алфавита закодированы. А = 00, Б = 01, В = 10, Г = 110. Минимальный код для Я с наибольшим значением?', opts: ['<span class="mono">1111</span>', '<span class="mono">111</span>', '<span class="mono">1110</span>', '<span class="mono">11</span>'], a: 0, ex: 'Свободна только <b>111</b>. Если отдать её Я, остальным буквам места не останется. Раскрываем: 1110 — запас, Я = <b>1111</b> — оно больше.' },
  { q: 'Кодируем слово КОЛОКОЛ. Какой букве выгоднее всего дать самый короткий код?', opts: ['О — встречается 3 раза', 'К — первая в слове', 'Л — последняя в слове', 'Всем одинаковый'], a: 0, ex: 'К и Л — по 2 раза, О — 3 раза. Каждый знак в коде О повторится трижды, поэтому ей — самый короткий код.' },
  { q: 'А = 1, нужно закодировать ещё три буквы. Какая минимальная общая длина кодов всех четырёх букв?', opts: ['9', '8', '10', '7'], a: 0, ex: 'Под 0 нужны три кода: 00, 010, 011 — это 2 + 3 + 3 = 8. Плюс А = 1. Итого <b>9</b>.' }
];
W.quiz = {
  ans: [],
  init(el) {
    $('#qzDots', el).innerHTML = QUIZ.map(() => '<i></i>').join('');
    QUIZ.forEach((q, qi) => { const order = q.opts.map((_, i) => i); const rot = (qi * 3 + 1) % 4; q.order = order.slice(rot).concat(order.slice(0, rot)); });
  },
  render(el, s) {
    const box = $('#qzBox', el), dots = $$('#qzDots i', el);
    dots.forEach((d, i) => { d.className = this.ans[i] === undefined ? (i === s ? 'cur' : '') : (this.ans[i] === QUIZ[i].a ? 'ok' : 'bad'); });
    if (s >= QUIZ.length) {
      const ok = this.ans.filter((a, i) => a === QUIZ[i].a).length;
      $('#qzNum', el).textContent = 'Итог';
      box.innerHTML = `<h1 style="margin-top:30px">${ok === QUIZ.length ? 'Идеально!' : ok >= 4 ? 'Отлично!' : 'Есть над чем поработать'}</h1><div style="display:flex;align-items:baseline;gap:20px;margin-top:20px"><div class="big" style="color:var(--accent)">${ok}</div><div class="lead">из ${QUIZ.length} правильно</div></div><button class="btn" id="qzAgain" style="margin-top:28px">Пройти заново</button>`;
      $('#qzAgain', el).addEventListener('click', e => { e.currentTarget.blur(); this.ans = []; window.dispatchEvent(new CustomEvent('fano-restart')); });
      if (ok >= 5) confetti(110);
      return;
    }
    const q = QUIZ[s], a = this.ans[s], done = a !== undefined;
    $('#qzNum', el).textContent = `Вопрос ${s + 1} из ${QUIZ.length}`;
    box.innerHTML = `<h1 class="qzh">${q.q}</h1><div class="qz${done ? ' done' : ''}">${q.order.map((oi, k) => `<button data-o="${oi}" class="${done ? (oi === q.a ? 'right' : (oi === a ? 'wrong' : '')) : ''}"><i>${'АБВГ'[k]}</i>${q.opts[oi]}</button>`).join('')}</div><div class="expl${done ? ' on' : ''}">${q.ex}</div>`;
    $$('.qz button', box).forEach(b => b.addEventListener('click', e => { e.currentTarget.blur(); if (this.ans[s] !== undefined) return; this.ans[s] = +b.dataset.o; this.render(el, s); if (this.ans[s] === q.a) confetti(30); }));
  },
  step(el, s) { this.render(el, s); }
};


window.FanoContinuation = {
 slides: [{"title": "Ловушка: весь алфавит", "group": "Дерево кода", "steps": 2, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"3\" data-id=\"kim3\" data-title=\"Ловушка: весь алфавит\" data-steps=\"2\" data-w=\"kim\">\n    <div class=\"kimv\"><div class=\"kimp\">\n      <div class=\"kim-hd\"><span>ЕГЭ · ИНФОРМАТИКА, 11 класс</span><span>Задача № 238</span></div>\n      <div class=\"kim-task\"><div class=\"kim-n\">4</div><div class=\"kim-body\">\n        <div class=\"kz kz-a\"><p><span class=\"kmark\">Все заглавные буквы русского алфавита</span> закодированы неравномерным двоичным кодом, в котором никакое кодовое слово не является началом другого кодового слова. Это условие обеспечивает возможность однозначной расшифровки закодированных сообщений. Кодовые слова для некоторых букв известны: <span class=\"kmark\">А – 00, Б – 01, В – 110, Г – 101, Д – 100</span>.</p></div>\n        <div class=\"kz kz-b\"><p>Укажите возможный <span class=\"kmark\">код минимальной длины для буквы Я</span>. Если таких кодов несколько, укажите тот из них, который имеет <span class=\"kmark\">максимальное числовое значение</span>.</p></div>\n        <p class=\"kans\">Ответ: <i></i></p>\n      </div></div>\n    </div></div>\n    <div class=\"asks\"><div class=\"ask\"><button><i>?</i>Где тут подвох?</button><div class=\"ans\">В первых словах: «<b>все</b> буквы русского алфавита». Их 33 — и для каждой должно найтись место в дереве.</div></div></div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Ещё один номер — с одной из главных хитростей задания 4. Здесь специально пытаются подловить.</p><p>Прочитай первые слова: «<b>все</b> заглавные буквы русского алфавита закодированы». Известны коды пяти букв: А, Б, В, Г, Д.</p><p>Нужен код минимальной длины для Я, а если вариантов несколько — с максимальным числовым значением.</p>"}, {"title": "Оставляем пустую ветку", "group": "Дерево кода", "steps": 4, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"3\" data-id=\"tree3\" data-title=\"Оставляем пустую ветку\" data-steps=\"4\" data-w=\"ctree\" data-tree=\"t3\">\n    <div class=\"eyebrow\">№ 238 · все 33 буквы</div>\n    <h1 class=\"th\"></h1>\n    <div class=\"tlay\"><div class=\"tside\"><div class=\"given\"></div><div class=\"tnote\"></div></div><div class=\"treebox ctb\"></div></div>\n    <div class=\"asks\"><div class=\"ask\"><button><i>?</i>А если букв всего шесть?</button><div class=\"ans\">Тогда запас не нужен: Я = <b>111</b>. Всегда считай, <b>сколько букв</b> нужно закодировать и сколько уже есть.</div></div></div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Строим дерево только там, где необходимо, лишний раз ветки не увеличиваем. И обязательно вычёркиваем найденные буквы.</p><p>А, Б, В, Г, Д на месте. Свободна одна ветка — 111.</p><p>Хочется ответить Я = 111. Если так сделать — получим 0 баллов.</p><p>Почему? Закодированы <b>все</b> буквы алфавита — их 33. А сейчас закодировано шесть. Куда записать седьмую, восьмую, девятую? Места нет — условие нарушено.</p><p>Поэтому всегда считаем, сколько букв дали и сколько закодировали. Все 33 сейчас записывать не нужно, но должна быть такая возможность. Раскрываем 111: 1111 — буква Я, а 1110 оставляем пустой. Из пустой ветки можно сколько угодно строить вниз и закодировать хоть сто тридцать три буквы. <b>Ответ: 1111.</b></p>"}, {"title": "Минимальная общая длина", "group": "Сумма длин", "steps": 2, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"4\" data-id=\"kim2\" data-title=\"Минимальная общая длина\" data-steps=\"2\" data-w=\"kim\">\n    <div class=\"kimv\"><div class=\"kimp\">\n      <div class=\"kim-hd\"><span>ЕГЭ · ИНФОРМАТИКА, 11 класс</span><span>Задача № 110</span></div>\n      <div class=\"kim-task\"><div class=\"kim-n\">4</div><div class=\"kim-body\">\n        <div class=\"kz kz-a\"><p>По каналу связи передаются сообщения, содержащие только <span class=\"kmark\">семь букв: А, Б, В, Г, Д, Е и Ж</span>. Для передачи используется двоичный код, удовлетворяющий условию Фано. Для буквы А используется кодовое слово <span class=\"kmark\">1</span>; для буквы Б используется кодовое слово <span class=\"kmark\">01</span>.</p></div>\n        <div class=\"kz kz-b\"><p>Какова <span class=\"kmark\">минимальная общая длина</span> кодовых слов <span class=\"kmark\">для всех семи букв</span>?</p></div>\n        <p class=\"kans\">Ответ: <i></i></p>\n      </div></div>\n    </div></div>\n    <div class=\"asks\"><div class=\"ask\"><button><i>?</i>Что тут нового?</button><div class=\"ans\">Кодируем не одну букву, а <b>сразу пять</b>. И от того, как раскроем дерево, зависит итоговая длина.</div></div></div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Чуть более продвинутый номер: кодируем не одну букву, а сразу много.</p><p>Семь букв: А, Б, В, Г, Д, Е, Ж. Известны А = 1 и Б = 01.</p><p>Нужна <b>минимальная общая длина</b> кодов всех семи букв. От того, как мы закодируем, зависит, какая длина получится.</p>"}, {"title": "Лесенка или ровно", "group": "Сумма длин", "steps": 3, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"4\" data-id=\"sum\" data-title=\"Лесенка или ровно\" data-steps=\"3\" data-w=\"sum\">\n    <div class=\"eyebrow\">№ 110 · А = 1, Б = 01, ещё пять букв</div>\n    <h1>Два дерева — <em>две суммы</em></h1>\n    <div class=\"duo\">\n      <div class=\"duo-c\" data-s=\"1\"><div class=\"duo-h\"><b>Лесенкой</b><span class=\"duo-s bad\" id=\"sumAs\">27</span></div><div class=\"treebox ctb sm\" id=\"sumA\"></div><div class=\"lens\" id=\"lenA\"></div></div>\n      <div class=\"duo-c\" data-s=\"2\"><div class=\"duo-h\"><b>Ровно</b><span class=\"duo-s good\" id=\"sumBs\">25</span></div><div class=\"treebox ctb sm\" id=\"sumB\"></div><div class=\"lens\" id=\"lenB\"></div></div>\n    </div>\n    <div class=\"defcard\" data-s=\"3\">Длины должны быть <b>примерно одинаковыми</b>: 4 4 4 5 5 — короче, чем 3 4 5 6 6.</div>\n    <div class=\"asks\"><div class=\"ask\"><button><i>?</i>Как быстро проверить себя?</button><div class=\"ans\">Посмотри на длины. Если они «в разброс» — 3, 4, 5, 6, 6 — почти наверняка можно короче. Хорошо, когда они рядом: 2 2 3 3, 3 3 3, 4 4 5.</div></div></div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Закодируем двумя способами и сравним. А = 1 и Б = 01 не меняются, оставшиеся пять букв кладём под 00.</p><p>Первый способ — «лесенкой»: В = 000, Г = 0010, Д = 00110, Е и Ж — по шесть знаков. Длины 1, 2, 3, 4, 5, 6, 6 — в сумме 27.</p><p>Второй способ — ровнее: В = 0000, Г = 0001, Д = 0010, Е = 00110, Ж = 00111. Длины 1, 2, 4, 4, 4, 5, 5 — в сумме 25. Это меньше, значит, правильный ответ — <b>25</b>.</p><p>Как это прочувствовать? В первом варианте длины в разброс — от 3 до 6. Во втором все примерно на одном месте — 4 и 5. Когда буквы встречаются одинаково часто, стремимся, чтобы коды были <b>примерно одной длины</b>: 2 2 3 3 или 2 2 2 3 лучше, чем 1 2 3 4.</p>"}, {"title": "Собери дерево сам", "group": "Сумма длин", "steps": 0, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"4\" data-id=\"build\" data-title=\"Собери дерево сам\" data-steps=\"0\" data-w=\"build\">\n    <div class=\"row\" style=\"align-items:flex-end;gap:24px\">\n      <div class=\"col\"><div class=\"eyebrow\">Тренажёр</div><h1 style=\"margin-bottom:0\">Собери дерево сам</h1></div>\n      <div class=\"seg\" id=\"bdPre\"><button data-p=\"seven\" class=\"on\">№ 110 · семь букв</button><button data-p=\"word\">ТАРАНТАС</button></div>\n    </div>\n    <div class=\"bd\">\n      <div class=\"treebox ctb bd-tree\" id=\"bdTree\"></div>\n      <div class=\"bd-side\">\n        <p class=\"bd-hint\">Нажми на <b>свободную</b> ветку — она разделится на две. Нажми на раскрытую — свернётся.</p>\n        <div class=\"bd-list\" id=\"bdList\"></div>\n        <div class=\"bd-sum\"><small id=\"bdSumL\">сумма длин</small><b id=\"bdSum\">—</b><span id=\"bdBest\"></span></div>\n        <div class=\"bd-msg\" id=\"bdMsg\" role=\"status\" aria-live=\"polite\"></div>\n        <button class=\"btn\" id=\"bdReset\">Сбросить</button>\n      </div>\n    </div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Тренажёр: строй дерево сам. Нажимай на свободные ветки, чтобы разделить их на две. Буквы сами встают в самые короткие свободные места.</p><p>Режим «№ 110» — та же задача с семью буквами: найди минимальную сумму длин. Режим «ТАРАНТАС» — задача из следующего раздела: там важно, сколько раз встречается каждая буква.</p>"}, {"title": "Азбука Морзе", "group": "Слово и частоты", "steps": 3, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"5\" data-id=\"morse\" data-title=\"Азбука Морзе\" data-steps=\"3\" data-w=\"morse\">\n    <div class=\"eyebrow\">Зачем неравномерный код</div>\n    <h1 id=\"mrHead\">Азбука <em>Морзе</em></h1>\n    <div class=\"row\" style=\"gap:40px;align-items:flex-start\">\n      <div class=\"morse\" id=\"morse\"></div>\n      <div class=\"mr-side\">\n        <div class=\"mr-it\" data-s=\"1\"><b>1 знак</b><span><span class=\"mono\">E</span> и <span class=\"mono\">T</span> — самые частые буквы в английских текстах</span></div>\n        <div class=\"mr-it\" data-s=\"2\"><b>2 знака</b><span><span class=\"mono\">A I M N</span> — A, I и N тоже среди самых частых букв</span></div>\n        <div class=\"mr-it\" data-s=\"3\"><b>5 знаков</b><span>цифры встречаются редко — им не жалко длинного кода</span></div>\n      </div>\n    </div>\n    <div class=\"defcard\" data-s=\"3\">Чем <b>чаще</b> символ встречается, тем <b>короче</b> его код. В этом и смысл неравномерного кодирования.</div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Для чего вообще нужно неравномерное кодирование? Посмотрим на азбуку Морзе.</p><p>Буквы E и T кодируются одним знаком. Создатели азбуки проанализировали тексты и поняли, что E и T встречаются в сообщениях чаще всего.</p><p>A, I, M, N — двумя знаками. A, I и N тоже входят в число самых частых букв.</p><p>А цифры — по пять знаков: их используют редко, на них можно и потратить побольше. Суть неравномерного кодирования — подобрать коды исходя из того, <b>как часто</b> мы их используем: самые частые символы — самые короткие. Так сообщения передаются быстрее.</p>"}, {"title": "Кодируем целое слово", "group": "Слово и частоты", "steps": 3, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"5\" data-id=\"kim4\" data-title=\"Кодируем целое слово\" data-steps=\"3\" data-w=\"kim\">\n    <div class=\"kimv\"><div class=\"kimp\">\n      <div class=\"kim-hd\"><span>ЕГЭ · ИНФОРМАТИКА, 11 класс</span><span>№ 28925 · ЕГКР 18.04.26</span></div>\n      <div class=\"kim-task\"><div class=\"kim-n\">4</div><div class=\"kim-body\">\n        <div class=\"kz kz-a\"><p>По каналу связи передаются сообщения, содержащие только буквы из набора: <span class=\"kmark\">А, Н, Р, С, Т, Я</span>. Для передачи используется двоичный код, удовлетворяющий условию Фано. Кодовые слова для некоторых букв известны: <span class=\"kmark\">С – 00, Р – 010, Н – 11</span>.</p></div>\n        <div class=\"kz kz-b\"><p>Для оставшихся букв <span class=\"kmark\">А, Т и Я</span> кодовые слова неизвестны.</p></div>\n        <div class=\"kz kz-c\"><p>Какое количество двоичных знаков требуется для кодирования <span class=\"kmark\">слова ТАРАНТАС</span>, если известно, что оно закодировано <span class=\"kmark\">минимально возможным</span> количеством двоичных знаков?</p></div>\n        <p class=\"kim-note\"><i>Примечание.</i> Условие Фано означает, что никакое кодовое слово не является началом другого кодового слова. Это обеспечивает возможность однозначной расшифровки закодированных сообщений.</p>\n        <p class=\"kans\">Ответ: <i></i></p>\n      </div></div>\n    </div></div>\n    <div class=\"asks\"><div class=\"ask\"><button><i>?</i>Это сложный тип?</button><div class=\"ans\">Да, считается самым сложным: кодируем <b>целое слово</b>. Такой номер был на последнем ЕГЭ — скорее всего, будет и у вас.</div></div></div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Номер, который использует эту идею. Такой был на последнем ЕГЭ — его считают самым сложным типом: кодируем <b>целое слово</b>.</p><p>Буквы — А, Н, Р, С, Т, Я. Известны коды С = 00, Р = 010, Н = 11.</p><p>Коды А, Т и Я неизвестны — их подбираем мы.</p><p>Спрашивают, сколько знаков займёт слово ТАРАНТАС, если закодировать его минимально возможным количеством знаков.</p>"}, {"title": "Считаем буквы в слове", "group": "Слово и частоты", "steps": 2, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"5\" data-id=\"count\" data-title=\"Считаем буквы в слове\" data-steps=\"2\" data-w=\"count\">\n    <div class=\"eyebrow\">№ 28925 · сначала частоты</div>\n    <h1>Сколько раз встречается <em>каждая буква</em>?</h1>\n    <div class=\"wtiles\" id=\"cntWord\"></div>\n    <div class=\"cnts\" id=\"cntList\"></div>\n    <div class=\"defcard\" data-s=\"2\">Буквы встречаются <b>разное</b> число раз — значит, не «ровно», а самой частой — <b>самый короткий</b> код.</div>\n    <div class=\"asks\"><div class=\"ask\"><button><i>?</i>Зачем тут Я, если её нет в слове?</button><div class=\"ans\">Она есть в наборе букв — значит, ей тоже нужен код, иначе условие нарушено. Это главная ловушка задачи — смотри следующий слайд.</div></div></div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Кодируем не просто буквы, а слово. На что стоит обратить внимание?</p><p>Сколько раз встречается каждая буква: А — 3 раза, Т — 2 раза, Р, Н и С — по одному.</p><p>В прошлом номере все буквы встречались одинаково — поэтому коды делали «средними». Здесь частоты разные: значит, сначала самый короткий код — самой частой букве, потом чуть длиннее, и так далее. И не забываем про Я.</p>"}, {"title": "Дерево для ТАРАНТАС", "group": "Слово и частоты", "steps": 4, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"5\" data-id=\"tree4\" data-title=\"Дерево для ТАРАНТАС\" data-steps=\"4\" data-w=\"ctree\" data-tree=\"t4\">\n    <div class=\"eyebrow\">№ 28925 · С = 00, Р = 010, Н = 11</div>\n    <h1 class=\"th\"></h1>\n    <div class=\"tlay\"><div class=\"tside\"><div class=\"given\"></div><div class=\"tnote\"></div></div><div class=\"treebox ctb\"></div></div>\n    <div class=\"asks\"><div class=\"ask\"><button><i>?</i>Можно поменять местами данные коды?</button><div class=\"ans\">Нет. Коды С, Р и Н даны в условии — их не трогаем. Подбираем только А, Т и Я.</div></div></div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Строим дерево по данным кодам.</p><p>Свободны 10 (длина 2) и 011 (длина 3). Самый короткий — 10, отдаём его частой А.</p><p>Дальше хочется взять 011 для Т — и получить 0 баллов. Хитрость в другом: где буква Я? Всегда считаем, сколько букв дано — шесть, и сколько закодировали — пять. Специально дают незаметную букву, которой нет в слове.</p><p>Правильно — раскрыть 011: Я = 0110, Т = 0111. Данные коды при этом не трогаем — менять их местами нельзя.</p>"}, {"title": "Длина слова", "group": "Слово и частоты", "steps": 2, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"5\" data-id=\"cost\" data-title=\"Длина слова\" data-steps=\"2\" data-w=\"cost\">\n    <div class=\"eyebrow\">№ 28925 · считаем знаки</div>\n    <h1>ТАРАНТАС — <em id=\"costH\">сколько знаков?</em></h1>\n    <table class=\"mtab cost\" id=\"costTab\">\n      <tr><th>буква</th><th>код</th><th>длина</th><th>раз в слове</th><th>знаков</th></tr>\n      <tr><td><b>Т</b></td><td class=\"mono\">0111</td><td>4</td><td data-s=\"1\">× 2</td><td data-s=\"1\"><b>8</b></td></tr>\n      <tr><td><b>А</b></td><td class=\"mono\">10</td><td>2</td><td data-s=\"1\">× 3</td><td data-s=\"1\"><b>6</b></td></tr>\n      <tr><td><b>Р</b></td><td class=\"mono\">010</td><td>3</td><td data-s=\"1\">× 1</td><td data-s=\"1\"><b>3</b></td></tr>\n      <tr><td><b>Н</b></td><td class=\"mono\">11</td><td>2</td><td data-s=\"1\">× 1</td><td data-s=\"1\"><b>2</b></td></tr>\n      <tr><td><b>С</b></td><td class=\"mono\">00</td><td>2</td><td data-s=\"1\">× 1</td><td data-s=\"1\"><b>2</b></td></tr>\n      <tr class=\"dimrow\"><td><b>Я</b></td><td class=\"mono\">0110</td><td>4</td><td data-s=\"1\">× 0</td><td data-s=\"1\"><b>0</b></td></tr>\n    </table>\n    <div class=\"cost-ans\" data-s=\"2\"><small>Ответ</small><b id=\"costN\">21</b></div>\n    <div class=\"asks\"><div class=\"ask\"><button><i>?</i>А если раскрыть 10, а не 011?</button><div class=\"ans\">А = 100, Т = 101, Я = 011: 3·3 + 3·2 + 3 + 2 + 2 = <b>22</b>. Длиннее: частой А выгоднее короткий код 10.</div></div></div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Считаем длину слова ТАРАНТАС.</p><p>Для каждой буквы: длина кода × сколько раз она встречается. Т: 4 × 2 = 8, А: 2 × 3 = 6, Р — 3, Н — 2, С — 2. Я в слове нет — 0.</p><p>8 + 6 + 3 + 2 + 2 = <b>21</b>. Такой номер внимательно: тут сразу две ловушки — частоты и забытая буква.</p>"}, {"title": "Проверь себя", "group": "Итоги и практика", "steps": 6, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"6\" data-id=\"quiz\" data-title=\"Проверь себя\" data-steps=\"6\" data-w=\"quiz\" data-btn=\"Следующий вопрос\">\n    <div style=\"display:flex;align-items:center;justify-content:space-between\">\n      <div class=\"eyebrow\" id=\"qzNum\">Вопрос 1 из 6</div>\n      <div class=\"dots\" id=\"qzDots\"></div>\n    </div>\n    <div id=\"qzBox\"></div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Шесть вопросов по уроку. Выбери ответ — сразу увидишь объяснение.</p><p>Ищем, где один код — начало другого.</p><p>Построй дерево: А, Б, В — где свободно?</p><p>Вспомни Т = 01 и А = 010.</p><p>Ловушка «весь алфавит».</p><p>Считаем частоты букв.</p><p>Сумма длин: раскрываем под 0.</p>"}, {"title": "Шпаргалка", "group": "Итоги и практика", "steps": 0, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"6\" data-id=\"cheat\" data-title=\"Шпаргалка\" data-steps=\"0\" data-w=\"cheat\">\n    <h1>Шпаргалка №4</h1>\n    <div class=\"csg\">\n      <div class=\"csc\"><h3>Условие Фано</h3><p>Ни одно кодовое слово не начало другого. В дереве буквы стоят только в <b>концах веток</b>.</p></div>\n      <div class=\"csc\"><h3>Дерево</h3><p>Старт — 0 и 1. Влево <b>+0</b>, вправо <b>+1</b>, сразу обе ветки. Нашёл код — подпиши букву, в условии зачеркни.</p></div>\n      <div class=\"csc\"><h3>Куда можно</h3><p>Не выше и не ниже букв — только <b>свободные</b> ветки рядом.</p></div>\n      <div class=\"csc\"><h3>Кратчайший код</h3><p>Самая верхняя свободная ветка. Несколько — бери <b>наибольшее</b> число: 111 &gt; 101.</p></div>\n      <div class=\"csc\"><h3>Сумма длин</h3><p>Длины — <b>ровные</b>: 4 4 4 5 5, а не лесенка 3 4 5 6 6. Целое слово — частым буквам короткие коды.</p></div>\n      <div class=\"csc hot\"><h3>Считай буквы</h3><p>Место должно быть для <b>всех</b>. «Весь алфавит» — оставь одну <b>пустую ветку</b>.</p></div>\n    </div>\n    <div class=\"cs-tree\"><div class=\"cs-leg\"><span class=\"lg-l\">буква</span><span class=\"lg-x\">выше и ниже букв — нельзя</span><span class=\"lg-f\">свободно — можно</span><span class=\"lg-p\">ответ</span></div><div class=\"treebox ctb sm\" id=\"csTree\"></div></div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Всё задание 4 на одном экране. Сфотографируй или открой перед домашкой.</p>"}, {"title": "Алгоритм на экзамене", "group": "Итоги и практика", "steps": 6, "extension": true, "body": "<div class=\"extension-shell\"><section class=\"fano-extension slide cur\" data-sec=\"6\" data-id=\"algo\" data-title=\"Алгоритм на экзамене\" data-steps=\"6\">\n    <div class=\"row\" style=\"gap:80px;height:100%\">\n      <div class=\"col\" style=\"flex:1.25\">\n        <div class=\"eyebrow\">На экзамене</div>\n        <h1>Алгоритм решения</h1>\n        <ul class=\"check\">\n          <li data-s=\"1\"><i>1</i>Выпиши данные коды и все буквы, которые нужно закодировать.</li>\n          <li data-s=\"2\"><i>2</i>Построй дерево до данных кодов: подпиши буквы, в условии зачеркни.</li>\n          <li data-s=\"3\"><i>3</i>Найди свободные ветки — не выше и не ниже букв.</li>\n          <li data-s=\"4\"><i>4</i>Посчитай буквы: всем хватит места? Весь алфавит — оставь пустую ветку.</li>\n          <li data-s=\"5\"><i>5</i>Раздай коды: кратчайший, длины ровно, частым буквам — короче.</li>\n          <li data-s=\"6\"><i>6</i>Что просят: код, его длину или сумму? Несколько вариантов — наибольшее число.</li>\n        </ul>\n      </div>\n      <div class=\"col\" style=\"flex:.75;display:flex;flex-direction:column;justify-content:center;align-items:flex-start\">\n        <div class=\"tbadge xl\"><b>№4</b></div>\n        <h2 style=\"font-size:44px;margin-top:26px\">Вопросы?</h2>\n        <p class=\"lead\">Дальше — модули 1–3 и домашка по №4.</p>\n      </div>\n    </div>\n  </section></div>", "question": "Пояснения к слайду", "answer": "<p>Порядок действий на экзамене.</p><p>Сначала выпиши данные коды и посчитай, сколько всего букв нужно закодировать.</p><p>Строй дерево: влево +0, вправо +1, сразу обе ветки. Нашёл код — подпиши и зачеркни.</p><p>Свободно только то, что рядом: не выше и не ниже букв.</p><p>Все ли буквы помещаются? «Весь алфавит» — оставь пустую ветку.</p><p>Раздай коды: кратчайший — сверху; для суммы — длины ровно; для слова — частым буквам короче.</p><p>Перечитай вопрос: что именно записать в ответ. Задачи этого номера нужно именно нарешать — как билеты: вопросы лёгкие, но без практики не получится.</p>"}],
 mount(el) {
  active = el.querySelector('.fano-extension'); previous = -1;
  const widget = W[active.dataset.w];
  if (widget && widget.init) widget.init(active);
  active.querySelectorAll('.cnode.click').forEach(accessibleNode);
  active.addEventListener('click', e => { const button=e.target.closest('.ask > button'); if(button){ const box=button.parentElement; box.classList.toggle('open'); button.setAttribute('aria-expanded',String(box.classList.contains('open'))); } });
 },
 update(s) {
  if (!active || !active.isConnected) return;
  active.querySelectorAll('[data-s]').forEach(el=>{ const v=el.dataset.s; const on=v.includes('-') ? s>=+v.split('-')[0] && s<=+v.split('-')[1] : s>=+v;el.classList.toggle('on',on);el.setAttribute('aria-hidden',String(!on)); });
  const widget=W[active.dataset.w];
  if(widget && widget.step)widget.step(active,s,{dir:s>=previous?1:-1,enter:previous<0});
  previous=s;
  active.querySelectorAll('.cnode.click').forEach(accessibleNode);
 }
};
function accessibleNode(el) {
 el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label',(el.title||'Ветка')+' '+el.dataset.c);
 el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();el.click();active.querySelectorAll('.cnode.click').forEach(accessibleNode);}};
}
})();
