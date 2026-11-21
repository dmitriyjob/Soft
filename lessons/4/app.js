/* ion_inf · Задание 4 — движок презентации и интерактивные виджеты */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app'), deck = $('#deck');
const slides = $$('.slide', deck);
const N = slides.length;
const SECTIONS = { 1: 'Кодирование', 2: 'Условие Фано', 3: 'Дерево кода', 4: 'Сумма длин', 5: 'Слово и частоты', 6: 'Проверь себя' };
const KEY = 'ion:interactive:4:v1';
const pad = n => String(n).padStart(2, '0');
const fmt = n => Number(n).toLocaleString('ru-RU').replace(/\s/g, ' ');
const wait = ms => new Promise(r => setTimeout(r, ms));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let SCALE = 1;

/* ---------------- scaling ---------------- */
let notesOpen = false;
const NOTES_W = () => Math.min(480, Math.max(380, innerWidth * 0.3));
const notesDock = () => innerWidth >= 1100;
function fit() {
  const nw = notesOpen && notesDock() ? NOTES_W() : 0, aw = innerWidth - nw;
  SCALE = Math.min(aw / 1600, innerHeight / 900);
  app.style.left = (aw / 2) + 'px';
  app.style.transform = `translate(-50%,-50%) scale(${SCALE})`;
  document.documentElement.style.setProperty('--nw', NOTES_W() + 'px');
}
addEventListener('resize', fit); fit();

/* ---------------- helpers ---------------- */
function countUp(el, to, ms = 1100, suf = '') {
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
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1700); }
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
(function pixels() {
  const box = $('#pix'); if (!box) return;
  const P = ['01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000'];
  box.innerHTML = P.join('').split('').map(b => `<i class="${b === '1' ? 'on' : ''}"></i>`).join('');
})();

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
  rules: {
    codes: ['00', '01', '10', '11'], labels: true,
    given: [['A', '01'], ['B', '11']], ask: ['C', 'D'],
    steps: [
      { show: ['0', '1'], head: 'Начинаем с <em>корня</em>', note: 'Из корня выходят две ветви. Влево записываем <b>0</b>, вправо — <b>1</b>. Код буквы читаем по пути от корня.' },
      { show: ['01', '11'], letter: { '01': 'A', '11': 'B' }, found: ['A', 'B'], head: 'Сначала ставим <em>данные буквы</em>', note: 'Для A идём влево, затем вправо: <b>01</b>. Для B дважды идём вправо: <b>11</b>. Обе буквы стоят в листьях.' },
      { show: ['00', '10'], free: ['00', '10'], head: 'Отмечаем <em>свободные места</em>', note: 'Зелёным отмечены <b>00</b> и <b>10</b>. Это кратчайшие свободные коды. Узлы 0 и 1 занять нельзя: с них начинаются коды A и B.' },
      { free: [], got: ['00', '10'], letter: { '00': 'C', '10': 'D' }, asks: { C: '00', D: '10' }, tone: 'good', head: 'Если для C нужен <em>минимум</em>', note: 'Из двух кратчайших кодов выбираем для C меньший по числовому значению: <b>00</b>. Оставшийся код <b>10</b> получает D.' },
      { letter: { '00': 'D', '10': 'C' }, asks: { C: '10', D: '00' }, head: 'Если для C нужен <em>максимум</em>', note: 'Среди тех же двухбитных кодов больший — <b>10</b>. Теперь C получает <b>10</b>, а D — <b>00</b>. Коды A и B заданы условием.' }
    ]
  },
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
      if (leaf || inner) {
        n.title = leaf ? 'Разделить ветку' : 'Свернуть ветку';
        n.setAttribute('role', 'button');
        n.setAttribute('aria-label', n.title + ' ' + c);
        n.tabIndex = 0;
        n.onkeydown = e => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          e.stopPropagation();
          n.click();
          box.querySelector('.cnode[data-c="' + c + '"]')?.focus({ preventScroll: true });
        };
      }
    });
    this.fresh = [];
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
      $('#qzAgain', el).addEventListener('click', e => { e.currentTarget.blur(); this.ans = []; show(cur, 0, -1); });
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

/* =================================================================== */
/*                               ENGINE                                */
/* =================================================================== */
let cur = 0, step = 0;
const inited = new Set();
const stepsOf = i => +(slides[i].dataset.steps || 0);

function applySteps(el, s) {
  $$('[data-s]', el).forEach(e => {
    const v = e.dataset.s; let on;
    if (v.includes('-')) { const [a, b] = v.split('-').map(Number); on = s >= a && s <= b; } else on = s >= +v;
    e.classList.toggle('on', on);
  });
}
function show(i, s = 0, dir = 1) {
  i = Math.max(0, Math.min(N - 1, i)); s = Math.max(0, Math.min(stepsOf(i), s));
  const enter = i !== cur || !show.started; show.started = true;
  if (enter && i !== cur) { const old = slides[cur], widget = W[old.dataset.w]; if (widget && widget.leave) widget.leave(old); }
  cur = i; step = s;
  slides.forEach((el, k) => { el.classList.toggle('cur', k === cur); el.classList.toggle('back', k < cur); });
  const el = slides[cur], w = W[el.dataset.w];
  if (w && !inited.has(cur)) { w.init && w.init(el); inited.add(cur); }
  applySteps(el, step);
  if (w && w.step) w.step(el, step, { dir, enter });
  if (enter) { clearInk(); closeAsks(); }
  chrome(); renderNotes();
  try { localStorage.setItem(KEY, JSON.stringify({ slide: cur + 1, step, title: slides[cur].dataset.title })); } catch (e) {}
  try { history.replaceState(null, '', `#${cur + 1}${step ? '.' + step : ''}`); } catch (e) {}
}
function next() { if (step < stepsOf(cur)) show(cur, step + 1, 1); else if (cur < N - 1) show(cur + 1, 0, 1); else show(0, 0, 1); }
function prev() { if (step > 0) show(cur, step - 1, -1); else if (cur > 0) show(cur - 1, stepsOf(cur - 1), -1); }

const tabs = $('#tabs');
tabs.innerHTML = Object.entries(SECTIONS).map(([k, v]) => `<button data-sec="${k}"><i>${pad(k)}</i>${v}</button>`).join('');
$$('button', tabs).forEach(b => b.addEventListener('click', e => { e.currentTarget.blur(); show(slides.findIndex(s => s.dataset.sec === b.dataset.sec), 0, 1); }));

function chrome() {
  const el = slides[cur], sec = el.dataset.sec, more = step < stepsOf(cur);
  $$('button', tabs).forEach(b => b.classList.toggle('on', b.dataset.sec === sec));
  $('#fSec').textContent = `${pad(sec)} / ${SECTIONS[sec]}`;
  $('#fNext').textContent = more ? 'Дальше: следующий шаг' : (cur < N - 1 ? 'Дальше: ' + slides[cur + 1].dataset.title : 'Это последний экран');
  const frac = (cur + (stepsOf(cur) ? step / stepsOf(cur) : 1)) / N;
  $('#fBar').style.width = (Math.max(frac, 1 / N) * 100) + '%';
  $('#pBar').style.width = (Math.max(frac, 1 / N) * 100) + '%';
  $('#fCnt').textContent = `${pad(cur + 1)} / ${pad(N)}`;
  $('#bNext').textContent = more ? (el.dataset.btn || 'Дальше') : (cur === N - 1 ? 'Сначала' : 'Дальше');
  $('#bPrev').disabled = cur === 0 && step === 0;
  $$('#tocList button').forEach(b => b.classList.toggle('on', +b.dataset.i === cur));
}

/* TOC */
(function buildToc() {
  let h = '', last = 0;
  slides.forEach((s, i) => {
    if (+s.dataset.sec !== last) { last = +s.dataset.sec; h += `<h4>${pad(last)} · ${SECTIONS[last]}</h4>`; }
    h += `<button data-i="${i}"><i>${pad(i + 1)}</i>${s.dataset.title}</button>`;
  });
  $('#tocList').innerHTML = h;
  $$('#tocList button').forEach(b => b.addEventListener('click', () => { closeOv(); show(+b.dataset.i, 0, 1); }));
})();

/* overlays */
const ovOpen = () => $$('.ov.open').length > 0;
function toggleOv(id) { const o = $('#' + id), on = !o.classList.contains('open'); closeOv(); o.classList.toggle('open', on); }
function closeOv() { $$('.ov').forEach(o => o.classList.remove('open')); }
$$('.ov').forEach(o => o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-close]')) closeOv(); }));
$('#bToc').addEventListener('click', e => { e.currentTarget.blur(); toggleOv('ovToc'); });
$('#bHelp').addEventListener('click', e => { e.currentTarget.blur(); toggleOv('ovHelp'); });
function fullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }
$('#bFull').addEventListener('click', e => { e.currentTarget.blur(); fullscreen(); });
$('#bNext').addEventListener('click', e => { e.currentTarget.blur(); next(); });
$('#bPrev').addEventListener('click', e => { e.currentTarget.blur(); prev(); });

/* presenter tools */
const ink = $('#ink'), ctx = ink.getContext('2d'), laser = $('#laser'), spot = $('#spot');
let drawing = false, drawOn = false, laserOn = false, last = null;
function clearInk() { ctx.clearRect(0, 0, 1600, 900); }
function toApp(e) { const r = app.getBoundingClientRect(), k = r.width / 1600; return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }; }
ink.addEventListener('pointerdown', e => { if (!drawOn) return; drawing = true; last = toApp(e); ink.setPointerCapture(e.pointerId); });
ink.addEventListener('pointermove', e => {
  if (!drawing) return; const p = toApp(e);
  ctx.strokeStyle = '#E5484D'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
});
ink.addEventListener('pointerup', () => { drawing = false; });
function setDraw(on) { drawOn = on; ink.classList.toggle('on', on); toast(on ? 'Рисование включено · C — стереть' : 'Рисование выключено'); }
function setLaser(on) { laserOn = on; document.body.classList.toggle('laser', on); laser.style.display = on ? 'block' : 'none'; toast(on ? 'Лазерная указка' : 'Указка выключена'); }
addEventListener('mousemove', e => {
  if (laserOn) { laser.style.left = e.clientX + 'px'; laser.style.top = e.clientY + 'px'; }
  if (spot.classList.contains('on')) { const p = toApp(e); spot.style.setProperty('--sx', p.x + 'px'); spot.style.setProperty('--sy', p.y + 'px'); }
});

/* auto-hiding bars: top (sections) & bottom (navigation) */
const topBar = $('.top'), botBar = $('.bot'), hTop = $('#hTop'), hBot = $('#hBot'), BC = document.body.classList;
let mmT = 0;
addEventListener('mousemove', e => {
  BC.add('mm'); clearTimeout(mmT); mmT = setTimeout(() => BC.remove('mm'), 2400);
  if (ovOpen()) return;
  const p = toApp(e), inX = p.x > -400 && p.x < 2000;
  if (inX && p.y < 26 && p.y > -400) BC.add('showtop');
  else if (BC.contains('showtop') && p.y > 104 && !topBar.matches(':hover')) BC.remove('showtop');
  if (inX && p.y > 872 && p.y < 1400) BC.add('showbot');
  else if (BC.contains('showbot') && p.y < 796 && !botBar.matches(':hover')) BC.remove('showbot');
  hTop.classList.toggle('near', p.y < 160 && !BC.contains('showtop'));
  hBot.classList.toggle('near', p.y > 740 && !BC.contains('showbot'));
}, { passive: true });
[[hTop, 'showtop'], [hBot, 'showbot']].forEach(([h, c]) => { h.addEventListener('mouseenter', () => BC.add(c)); h.addEventListener('click', () => BC.toggle(c)); });
document.addEventListener('mouseleave', () => { BC.remove('showtop', 'showbot'); hTop.classList.remove('near'); hBot.classList.remove('near'); });
deck.addEventListener('touchstart', () => BC.remove('showtop', 'showbot'), { passive: true });
if (!/^https?:/.test(location.protocol)) BC.add('local');
else { const h = document.body.dataset.home; if (h) $('#homeLink').href = h; }
/* first visit: show where the bars live */
(function coach() {
  let n = 0; try { n = +localStorage.getItem('ion4_coach') || 0; localStorage.setItem('ion4_coach', n + 1); } catch (e) {}
  if (n >= 3) return;
  setTimeout(() => { BC.add('coach', 'mm'); setTimeout(() => BC.remove('coach'), 4200); }, 900);
})();

/* notes drawer */
const nBody = $('#nBody');
function renderNotes() {
  const el = slides[cur], sec = el.dataset.sec, arr = (window.NOTES || {})[el.dataset.id] || [];
  $('#nSec').textContent = `${pad(sec)} · ${SECTIONS[sec]}`;
  $('#nTitle').textContent = el.dataset.title;
  $('#nCnt').textContent = `${pad(cur + 1)} / ${pad(N)}`;
  if (nBody.dataset.for !== el.dataset.id) {
    nBody.dataset.for = el.dataset.id;
    const asks = $$('.ask', el).map(a => `<div class="nq"><span class="qi">?</span><b>${$('button', a).textContent.replace(/^\?/, '')}</b><p>${$('.ans', a).innerHTML}</p></div>`).join('');
    nBody.innerHTML = arr.map(it => { const [st, t] = Array.isArray(it) ? it : [null, it]; return `<p${st !== null ? ` data-ns="${st}"` : ''}>${t}</p>`; }).join('') +
      (asks ? `<div class="nqs"><h5>Вопросы со слайда</h5>${asks}</div>` : '');
    nBody.scrollTop = 0;
  }
  let curP = null;
  $$('p[data-ns]', nBody).forEach(p => { const st = +p.dataset.ns; p.classList.toggle('cur', st === step); p.classList.toggle('fut', st > step); if (st === step) curP = p; });
  if (curP && notesOpen) { const r = curP.offsetTop - nBody.clientHeight / 2 + curP.offsetHeight / 2; nBody.scrollTo({ top: Math.max(0, r), behavior: 'smooth' }); }
}
function setNotes(on) {
  notesOpen = on; BC.toggle('notes-open', on); fit(); renderNotes();
  try { localStorage.setItem('ion4_notes', on ? '1' : '0'); } catch (e) {}
}
$('#nTab').addEventListener('click', e => { e.currentTarget.blur(); setNotes(true); });
$('#nClose').addEventListener('click', e => { e.currentTarget.blur(); setNotes(false); });
$('#nPrev').addEventListener('click', e => { e.currentTarget.blur(); prev(); });
$('#nNext').addEventListener('click', e => { e.currentTarget.blur(); next(); });

/* ask-pills: click a question — the answer pops out */
function closeAsks() { $$('.ask.open').forEach(a => a.classList.remove('open')); }
document.addEventListener('click', e => {
  const b = e.target.closest('.ask > button');
  if (b) { const a = b.parentElement, on = !a.classList.contains('open'); closeAsks(); a.classList.toggle('open', on); b.blur(); return; }
  if (!e.target.closest('.ask')) closeAsks();
});
function toggleAsk() { const a = $('.ask', slides[cur]); if (!a) { toast('На этом слайде нет вопроса'); return; } const on = !a.classList.contains('open'); closeAsks(); a.classList.toggle('open', on); }

/* keyboard */
addEventListener('keydown', e => {
  if (e.target.matches && e.target.matches('input, textarea, select')) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('a, button')) return;
  const k = e.key, c = e.code;
  if (k === 'Escape') { if (notesOpen) { setNotes(false); $('#nTab').focus(); return; } if ($('.ask.open')) { closeAsks(); return; } if (ovOpen()) closeOv(); else if (drawOn) setDraw(false); else if (laserOn) setLaser(false); else if (spot.classList.contains('on')) spot.classList.remove('on'); $('#blank').classList.remove('on'); return; }
  if (k === '?' || c === 'KeyH') { toggleOv('ovHelp'); return; }
  if (c === 'KeyG') { toggleOv('ovToc'); return; }
  if (ovOpen()) return;
  if (k === 'ArrowRight' || k === ' ' || k === 'PageDown' || k === 'Enter' || k === 'ArrowDown') { e.preventDefault(); next(); }
  else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace' || k === 'ArrowUp') { e.preventDefault(); prev(); }
  else if (k === 'Home') show(0, 0, -1);
  else if (k === 'End') show(N - 1, stepsOf(N - 1), 1);
  else if (c === 'KeyF') fullscreen();
  else if (c === 'KeyN') setNotes(!notesOpen);
  else if (c === 'KeyQ') toggleAsk();
  else if (c === 'KeyL') setLaser(!laserOn);
  else if (c === 'KeyD') setDraw(!drawOn);
  else if (c === 'KeyC') { clearInk(); toast('Рисунок стёрт'); }
  else if (c === 'KeyS') { spot.classList.toggle('on'); toast(spot.classList.contains('on') ? 'Прожектор · веди мышью' : 'Прожектор выключен'); }
  else if (c === 'KeyB') $('#blank').classList.toggle('on');
  else if (c === 'KeyR') { show(cur, 0, -1); toast('Слайд сначала'); }
});

/* wheel & swipe */
let wheelT = 0, wheelAcc = 0;
deck.addEventListener('wheel', e => {
  const sc = e.target.closest('.scrollable');
  if (sc && sc.scrollHeight > sc.clientHeight) return;
  e.preventDefault();
  const now = Date.now(); if (now - wheelT < 700) return;
  wheelAcc += e.deltaY;
  if (Math.abs(wheelAcc) > 40) { wheelAcc > 0 ? next() : prev(); wheelAcc = 0; wheelT = now; }
}, { passive: false });
let tx = null;
deck.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
deck.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 60) dx < 0 ? next() : prev(); tx = null; });

/* start */
try { if (localStorage.getItem('ion4_notes') === '1' && notesDock()) { notesOpen = true; BC.add('notes-open'); fit(); } } catch (e) {}
function openFromHash() {
  const m = location.hash.match(/^#(\d+)(?:\.(\d+))?$/);
  show(m ? +m[1] - 1 : 0, m && m[2] ? +m[2] : 0, 1);
}
addEventListener('hashchange', openFromHash);
openFromHash();
requestAnimationFrame(() => requestAnimationFrame(() => BC.add('ready')));
window.__deck = { show, next, prev, setNotes, get cur() { return cur; }, get step() { return step; }, N };
})();
