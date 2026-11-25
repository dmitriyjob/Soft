/* ion_inf · Задание №3 — движок презентации и интерактивные виджеты */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app'), deck = $('#deck');
const slides = $$('.slide', deck);
const N = slides.length;
const SECTIONS = { 1: 'База данных', 2: 'Задание №3', 3: 'Функция ВПР', 4: 'Фильтры и ответ', 5: 'Второй тип: масса', 6: 'Проверь себя' };
const pad = n => String(n).padStart(2, '0');
const fmt = n => Number(n).toLocaleString('ru-RU').replace(/\s/g, ' ');
const wait = ms => new Promise(r => setTimeout(r, ms));
let SCALE = 1;

/* ---------------- scaling ---------------- */
let notesOpen = false, menuOpen = false;
const NOTES_W = () => Math.min(480, Math.max(380, innerWidth * 0.3));
const notesDock = () => innerWidth >= 1100;
function fit() {
  const nw = notesOpen && notesDock() ? NOTES_W() : 0;
  const mw = menuOpen && notesDock() ? 320 : 0, aw = innerWidth - nw - mw;
  const ah = innerHeight - (innerWidth < 600 ? 126 : 76);
  SCALE = Math.min(aw / 1600, ah / 900);
  app.style.left = (mw + aw / 2) + 'px';
  app.style.top = (ah / 2) + 'px';
  app.style.transform = `translate(-50%,-50%) scale(${SCALE})`;
  document.documentElement.style.setProperty('--nw', NOTES_W() + 'px');
}
addEventListener('resize', fit); fit();
const realScale = () => app.getBoundingClientRect().width / 1600 || SCALE;
function rel(el, ref) {
  const a = el.getBoundingClientRect(), b = ref.getBoundingClientRect(), k = realScale();
  return { x: (a.left - b.left) / k, y: (a.top - b.top) / k, w: a.width / k, h: a.height / k };
}

/* ---------------- data ---------------- */
function makeDB(D) {
  const shop = new Map(D.shops.map(s => [s[0], s])), prod = new Map(D.prods.map(p => [p[0], p]));
  const rows = D.mv.map((m, i) => {
    const s = shop.get(m[2]), p = prod.get(m[3]);
    return { row: i + 2, id: m[0], di: m[1], date: D.dates[m[1]], shop: m[2], art: m[3], qty: m[4], type: m[5] ? 'Продажа' : 'Поступление',
             dist: s[1], addr: s[2], name: p[2], unit: p[3], per: p[4], dept: p[1], price: p[5] };
  });
  return { D, shop, prod, rows };
}
const L = makeDB(window.DB_LESSON), B = makeDB(window.DB_31500);
const dd = s => s.slice(0, 5);
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c); };
const esc = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/* ---------------- helpers ---------------- */
function grid(o) {
  const rn = o.rownum !== false, rs = o.rowStart || 1;
  let h = `<table class="g${o.compact ? ' compact' : ''}">`;
  if (o.letters) h += `<tr class="colL">${rn ? '<th class="ci"></th>' : ''}${o.cols.map((c, j) => `<th data-c="${j}">${o.letters[j] || ''}${o.badges ? `<span class="cn">${j + 1}</span>` : ''}</th>`).join('')}</tr>`;
  h += `<tr class="hd">${rn ? `<td class="ri">${rs}</td>` : ''}${o.cols.map((c, j) => `<th data-c="${j}"${c.w ? ` style="width:${c.w}px"` : ''}>${c.t}</th>`).join('')}</tr>`;
  o.rows.forEach((r, i) => {
    const num = o.rowNums ? o.rowNums[i] : rs + 1 + i;
    h += `<tr data-r="${i}">${rn ? `<td class="ri">${num}</td>` : ''}${r.map((v, j) => `<td data-c="${j}"${o.cols[j].num ? ' class="num"' : ''}>${v}</td>`).join('')}</tr>`;
  });
  return h + '</table>';
}
const cell = (t, r, c) => $(`tr[data-r="${r}"] td[data-c="${c}"]`, t);
const colCells = (t, c, withHead = true) => $$(`tr[data-r] td[data-c="${c}"]${withHead ? `, tr.hd th[data-c="${c}"]` : ''}`, t);
const clearCls = (root, ...cls) => cls.forEach(c => $$('.' + c, root).forEach(e => e.classList.remove(c)));
const sheetTitle = (name, extra = '') => `<div class="sh-title"><span class="ico">▦</span>${name}${extra}</div>`;
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
  const cols = ['#EBA771', '#F3CCAD', '#8BCBAD', '#8AB8EF', '#C0ACED', '#DFC582', '#F0EEE8'];
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div'); d.className = 'confetti';
    d.style.left = (Math.random() * 1600) + 'px'; d.style.background = cols[i % cols.length];
    app.appendChild(d);
    const dx = (Math.random() - .5) * 300, rot = Math.random() * 720;
    d.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${dx}px, ${920 + Math.random() * 120}px) rotate(${rot}deg)` }],
      { duration: 1800 + Math.random() * 1400, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 300 }).onfinish = () => d.remove();
  }
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1500); }

/* VLOOKUP formula slots (shared) */
function slotsHTML(fs = 34) {
  return `<span class="p" data-pre></span>
  <div class="slot s-k" data-sl="0"><div class="v">ключ</div><div class="c">что ищем</div></div><span class="sep" data-sep="0">;</span>
  <div class="slot s-t" data-sl="1"><div class="v">таблица</div><div class="c">где ищем · $ закрепляет</div></div><span class="sep" data-sep="1">;</span>
  <div class="slot s-n" data-sl="2"><div class="v">№</div><div class="c">какой столбец</div></div><span class="sep" data-sep="2">;</span>
  <div class="slot s-z" data-sl="3"><div class="v">0</div><div class="c">точное совпадение</div></div><span class="p" data-close></span>`;
}
const PH = ['ключ', 'таблица', '№', '0'];
function setSlot(root, i, state, val) {
  const s = $(`[data-sl="${i}"]`, root); s.classList.remove('act', 'ok');
  if (state) s.classList.add(state);
  $('.v', s).innerHTML = `<span style="white-space:nowrap">${state === 'ok' ? val : PH[i]}</span>`;
}
const DOL = t => t.replace(/\$/g, '<span class="d">$</span>');

/* =================================================================== */
/*                               WIDGETS                               */
/* =================================================================== */
const W = {};

/* ---- что такое БД ---- */
W.dbIntro = {
  init(el) {
    const rows = [['Чизбургер', 'Бургер', 'стандарт', '139', '300', 'Бургерная №1', 'ул. Красная, 5'],
      ['Гамбургер', 'Бургер', 'стандарт', '139', '250', 'Бургерная №1', 'ул. Красная, 5'],
      ['Гамбургер', 'Бургер', 'стандарт', '139', '250', 'Бургерная №2', 'ул. Пушкина, 12'],
      ['Наггетсы', 'Закуска', '6 шт.', '189', '270', 'Бургерная №2', 'ул. Пушкина, 12'],
      ['Картофель фри', 'Закуска', 'средний', '99', '340', 'Бургерная №3', 'ул. Ленина, 3'],
      ['Молочный коктейль', 'Напиток', '0,4 л', '149', '320', 'Бургерная №3', 'ул. Ленина, 3'],
      ['Кола', 'Напиток', '0,5 л', '109', '210', 'Бургерная №1', 'ул. Красная, 5']];
    const box = $('#dbi', el);
    box.innerHTML = sheetTitle('Меню бургерных') + grid({ cols: [{ t: 'Позиция' }, { t: 'Категория' }, { t: 'Размер' }, { t: 'Цена, ₽', num: true }, { t: 'Ккал', num: true }, { t: 'Заведение' }, { t: 'Адрес' }], rows, letters: 'ABCDEFG' });
    const t = $('table', box); t.style.fontSize = '21px';
    $$('td, th', t).forEach(c => { if (!c.closest('tr.colL')) c.style.height = '56px'; });
    t.addEventListener('mouseover', e => {
      clearCls(t, 'hv'); const td = e.target.closest('td[data-c]'); if (!td) return;
      $$('td[data-c]', td.parentElement).forEach(x => x.classList.add('hv')); colCells(t, td.dataset.c).forEach(x => x.classList.add('hv'));
    });
    t.addEventListener('mouseleave', () => clearCls(t, 'hv'));
  },
  step(el, s) {
    const t = $('#dbi table', el); clearCls(t, 'hi', 'ht', 'hk');
    if (s >= 1) $$('tr[data-r="2"] td[data-c]', t).forEach(c => c.classList.add('hi'));
    if (s >= 2) colCells(t, 3).forEach(c => c.classList.add('ht'));
    if (s >= 3) cell(t, 2, 3).classList.add('hk');
  }
};

/* ---- всё в одной таблице: цветные группы повторов ---- */
W.dupes = {
  init(el) {
    // сгруппировано: магазин → товар → дата, чтобы одинаковые цвета шли блоками
    const R = L.rows.filter(r => ['M1', 'M3'].includes(r.shop) && [1, 22].includes(r.art) && r.di <= 2)
      .sort((a, b) => a.shop.localeCompare(b.shop) || a.art - b.art || a.di - b.di);
    this.R = R;
    const rows = R.map(r => [r.date, r.shop, r.dist, r.addr, r.art, r.dept, r.name, `${r.per} ${r.unit}`, r.price, r.qty, r.type]);
    $('#dup', el).innerHTML = sheetTitle('Всё в одной таблице') + grid({ cols: [{ t: 'Дата' }, { t: 'ID маг.' }, { t: 'Район' }, { t: 'Адрес' }, { t: 'Артикул', num: true }, { t: 'Отдел' }, { t: 'Товар' }, { t: 'В упаковке', num: true }, { t: 'Цена', num: true }, { t: 'Упаковок', num: true }, { t: 'Тип' }], rows, letters: 'ABCDEFGHIJK' });
    // границы групп
    const t = $('#dup table', el);
    R.forEach((r, i) => { if (i && R[i - 1].shop !== r.shop) $(`tr[data-r="${i}"]`, t).classList.add('gsep'); else if (i && R[i - 1].art !== r.art) $(`tr[data-r="${i}"]`, t).classList.add('gsep2'); });
    const cnt = (f) => { const m = {}; R.forEach(r => { const k = f(r); m[k] = (m[k] || 0) + 1; }); return Object.values(m).reduce((a, n) => a + n - 1, 0); };
    this.extra = cnt(r => r.shop) * 2 + cnt(r => r.art) * 5;
  },
  step(el, s, o) {
    const t = $('#dup table', el); clearCls(t, 'g1', 'g2', 'g3', 'g4', 'gk1', 'gk2', 'gk3', 'gk4');
    this.R.forEach((r, i) => {
      if (s >= 1) { const g = r.shop === 'M1' ? 1 : 2; [2, 3].forEach(c => cell(t, i, c).classList.add('g' + g)); cell(t, i, 1).classList.add('gk' + g); }
      if (s >= 2) { const g = r.art === 1 ? 3 : 4; [5, 6, 7, 8].forEach(c => cell(t, i, c).classList.add('g' + g)); cell(t, i, 4).classList.add('gk' + g); }
    });
    const n = $('#dupN', el);
    if (s === 3 && o.dir > 0 && !o.enter) countUp(n, this.extra, 900); else setNum(n, s >= 3 ? this.extra : 0);
  }
};

/* ---- связанные таблицы ---- */
function linkTables(box, specs) {
  box.innerHTML = '<svg></svg>' + specs.map(s => `<div class="tbl sheet" id="${s.id}" style="left:${s.x}px;top:${s.y}px;width:${s.w}px">${sheetTitle(s.title)}${grid({ cols: s.cols, rows: s.rows, letters: s.letters, rowNums: s.rowNums, compact: s.compact })}</div>`).join('');
}
function drawLinks(box, pairs) {
  const svg = $('svg', box); svg.innerHTML = '';
  pairs.forEach(p => {
    const a = rel(p.from, box), b = rel(p.to, box), ta = rel(p.from.closest('.tbl, .pcard') || p.from, box);
    let x1 = ta.x + ta.w, y1 = a.y + a.h / 2, x2 = b.x, y2 = b.y + b.h / 2;
    if (p.rev) { const tb = rel(p.to.closest('.tbl, .pcard') || p.to, box); x1 = ta.x; x2 = tb.x + tb.w; }
    const mx = (x1 + x2) / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
    path.setAttribute('class', 'link on'); if (p.color) path.style.stroke = p.color; if (p.w) path.style.strokeWidth = p.w;
    svg.appendChild(path);
    [[x1, y1], [x2, y2]].forEach(([cx, cy]) => { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', 6); c.style.fill = p.color || 'var(--accent)'; svg.appendChild(c); });
  });
}
const sixRows = () => L.rows.filter(r => r.di === 0 && ['M1', 'M3'].includes(r.shop) && [1, 22].includes(r.art)).concat(L.rows.filter(r => r.di === 1 && r.shop === 'M1' && [1, 22].includes(r.art))).slice(0, 6);
const MV_SPEC = (id, R, x, y, w) => ({ id, title: 'Движение товаров', x, y, w, cols: [{ t: 'Дата' }, { t: 'ID магазина' }, { t: 'Артикул', num: true }, { t: 'Упаковок', num: true }, { t: 'Тип' }], rows: R.map(r => [r.date, r.shop, r.art, r.qty, r.type]), letters: 'ABCDE' });
const SHOP_SPEC = (id, x, y, w) => ({ id, title: 'Магазин', x, y, w, cols: [{ t: 'ID магазина' }, { t: 'Район' }, { t: 'Адрес' }], rows: [['M1', 'Центральный', 'просп. Мира, 45'], ['M3', 'Заречный', 'Колхозная, 11']], letters: 'ABC' });
const PROD_SPEC = (id, x, y, w) => ({ id, title: 'Товар', x, y, w, cols: [{ t: 'Артикул', num: true }, { t: 'Наименование' }, { t: 'Ед.' }, { t: 'В упак.', num: true }], rows: [[1, 'Гель для деликатной стирки', 'мл', 1000], [22, 'Антисептик для рук гель', 'мл', 500]], letters: 'ABCD' });

W.split = {
  init(el) {
    const box = $('#spl', el); this.R = sixRows();
    linkTables(box, [MV_SPEC('spM', this.R, 0, 40, 700), SHOP_SPEC('spS', 770, 0, 638), PROD_SPEC('spT', 770, 330, 638)]);
    ['spS', 'spT'].forEach(id => { $('#' + id, box).style.transition = 'opacity .7s var(--ease), transform .7s var(--ease)'; });
  },
  step(el, s) {
    const box = $('#spl', el);
    ['spS', 'spT'].forEach(id => { const t = $('#' + id, box); t.style.opacity = s >= 1 ? 1 : 0; t.style.transform = s >= 1 ? 'none' : 'translateX(-80px)'; });
  }
};

const KC = { M1: ['#EBA771', 'g1'], M3: ['#8AB8EF', 'g2'], 1: ['#8BCBAD', 'g3'], 22: ['#C0ACED', 'g4'] };
function keyLinks(el, boxSel, kind, s) {
  const box = $(boxSel, el), M = $('.tbl:nth-of-type(1) table', box), T = $('.tbl:nth-of-type(2) table', box);
  clearCls(box, 'g1', 'g2', 'g3', 'g4');
  const order = kind === 'shop' ? ['M1', 'M3'] : [1, 22], col = kind === 'shop' ? 1 : 2;
  const pairs = [];
  order.slice(0, s).forEach((key, ki) => {
    const [color, g] = KC[key];
    this_rows(box).forEach((r, i) => {
      const v = kind === 'shop' ? r.shop : r.art; if (v !== key) return;
      const c = cell(M, i, col); c.classList.add(g); pairs.push({ from: c, to: cell(T, ki, 0), color, w: 3 });
    });
    $$(`tr[data-r="${ki}"] td[data-c]`, T).forEach(c => c.classList.add(g));
  });
  requestAnimationFrame(() => drawLinks(box, pairs));
}
const this_rows = box => box._rows;
W.linkShop = {
  init(el) { const box = $('#lsh', el); box._rows = sixRows(); linkTables(box, [MV_SPEC('lsM', box._rows, 0, 30, 720), SHOP_SPEC('lsS', 860, 170, 548)]); },
  step(el, s) { keyLinks(el, '#lsh', 'shop', s); }
};
W.linkArt = {
  init(el) { const box = $('#lar', el); box._rows = sixRows(); linkTables(box, [MV_SPEC('laM', box._rows, 0, 30, 690), PROD_SPEC('laT', 770, 170, 638)]); },
  step(el, s) { keyLinks(el, '#lar', 'art', s); }
};

/* ---- поиск: одна таблица против трёх ---- */
const actRows = () => L.rows.filter(r => r.di === 0 && ['M1', 'M2', 'M3'].includes(r.shop) && [1, 2].includes(r.art)).slice(0, 6);
const TARGET_ID = 661;
const actWord = n => plural(n, 'действие', 'действия', 'действий');

W.one = {
  init(el) {
    const R = actRows(); this.R = R; this.ti = R.findIndex(r => r.id === TARGET_ID);
    $('#oneT', el).innerHTML = sheetTitle('Всё в одной таблице') + grid({
      cols: [{ t: 'ID операции', num: true }, { t: 'Дата' }, { t: 'ID маг.' }, { t: 'Район' }, { t: 'Адрес' }, { t: 'Артикул', num: true }, { t: 'Товар' }, { t: 'Упаковок', num: true }],
      rows: R.map(r => [r.id, r.date, r.shop, r.dist, r.addr, r.art, r.name, r.qty]), letters: 'ABCDEFGH' });
  },
  step(el, s, o) {
    const t = $('#oneT table', el); clearCls(t, 'hi', 'hn', 'hk');
    if (s >= 1) { $$(`tr[data-r="${this.ti}"] td[data-c]`, t).forEach(c => c.classList.add('hi')); [3, 6].forEach(c => cell(t, this.ti, c).classList.add('hk')); cell(t, this.ti, 7).classList.add('hn'); }
    const n = $('#oneN', el); if (s >= 1 && o.dir > 0 && !o.enter) countUp(n, 1, 400); else setNum(n, s >= 1 ? 1 : 0);
  }
};

W.three = {
  tok: 0,
  init(el) {
    const R = actRows(); this.R = R; this.ti = R.findIndex(r => r.id === TARGET_ID);
    const box = $('#act', el);
    linkTables(box, [
      { id: 'acM', title: 'Движение товаров', x: 0, y: 30, w: 720, cols: [{ t: 'ID операции', num: true }, { t: 'Дата' }, { t: 'ID магазина' }, { t: 'Артикул', num: true }, { t: 'Упаковок', num: true }], rows: R.map(r => [r.id, r.date, r.shop, r.art, r.qty]), letters: 'ABCDE' },
      { id: 'acS', title: 'Магазин', x: 790, y: 0, w: 618, cols: [{ t: 'ID магазина' }, { t: 'Район' }, { t: 'Адрес' }], rows: L.D.shops.slice(0, 3), letters: 'ABC', compact: true },
      { id: 'acT', title: 'Товар', x: 790, y: 318, w: 618, cols: [{ t: 'Артикул', num: true }, { t: 'Наименование' }, { t: 'Ед.' }], rows: L.D.prods.slice(0, 3).map(p => [p[0], p[2], p[3]]), letters: 'ABC', compact: true }
    ]);
    $$('#acCmp .blocks', el).forEach(b => { b.innerHTML = '<i></i>'.repeat(+b.dataset.n); });
  },
  step(el, s, o) {
    const box = $('#act', el), M = $('#acM table', box), S = $('#acS table', box), T = $('#acT table', box), i = this.ti;
    clearCls(box, 'hk', 'ht', 'hn', 'hi', 'focus', 'dim');
    const caps = ['&nbsp;', 'Открываем лист «Магазин»', 'Находим район — <b>Заречный</b>', 'Запоминаем ID магазина — <b>M3</b>', 'Открываем лист «Товар»', 'Находим <b>гель для деликатной стирки</b>', 'Запоминаем артикул — <b>1</b>', 'Открываем «Движение товаров»', 'Ищем M3 и артикул 1 — <b>100 упаковок</b>'];
    $('#acCap', el).innerHTML = s ? `<i>${s}</i>${caps[s]}` : '&nbsp;';
    setNum($('#acN', el), s); $('#acW', el).textContent = actWord(s);
    const mT = $('#acM', box), sT = $('#acS', box), tT = $('#acT', box);
    const focus = s === 0 ? null : s <= 3 ? sT : s <= 6 ? tT : mT;
    if (focus && s < 8) { focus.classList.add('focus'); [mT, sT, tT].forEach(x => { if (x !== focus) x.classList.add('dim'); }); }
    $('#acCmp', el).classList.toggle('on', s >= 8);
    if (s >= 2) cell(S, 2, 1).classList.add('hn');
    if (s >= 3) cell(S, 2, 0).classList.add('hk');
    if (s >= 5) cell(T, 0, 1).classList.add('hn');
    if (s >= 6) cell(T, 0, 0).classList.add('hk');
    if (s >= 8) {
      $$(`tr[data-r="${i}"] td[data-c]`, M).forEach(c => c.classList.add('hi'));
      [2, 3].forEach(c => cell(M, i, c).classList.add('hk'));
      cell(M, i, 4).classList.add('hn');
    }
  }
};

/* ---- решение: ВПР приносит столбцы ---- */
W.vfix = {
  tok: 0,
  init(el) {
    const R = actRows(); this.R = R; this.ti = R.findIndex(r => r.id === TARGET_ID);
    const box = $('#vfx', el);
    linkTables(box, [
      { id: 'vfS', title: 'Магазин', x: 0, y: 0, w: 600, cols: [{ t: 'ID магазина' }, { t: 'Район' }, { t: 'Адрес' }], rows: L.D.shops.slice(0, 3), letters: 'ABC', compact: true },
      { id: 'vfT', title: 'Товар', x: 640, y: 0, w: 768, cols: [{ t: 'Артикул', num: true }, { t: 'Наименование' }, { t: 'Ед.' }], rows: L.D.prods.slice(0, 3).map(p => [p[0], p[2], p[3]]), letters: 'ABC', compact: true },
      { id: 'vfM', title: 'Движение товаров', x: 0, y: 270, w: 1408, cols: [{ t: 'ID операции', num: true }, { t: 'Дата' }, { t: 'ID магазина' }, { t: 'Артикул', num: true }, { t: 'Упаковок', num: true }, { t: 'Район', w: 200 }, { t: 'Наименование', w: 380 }], rows: R.map(r => [r.id, r.date, r.shop, r.art, r.qty, '', '']), letters: 'ABCDEFG' }
    ]);
    box.insertAdjacentHTML('beforeend', '<div class="vffx" id="vfFx"><span class="fx">ƒx</span><span id="vfFt"></span></div>');
    const lay = () => { const hS = $('#vfS', box).offsetHeight, hT = $('#vfT', box).offsetHeight, top = Math.max(hS, hT); $('#vfFx', box).style.top = (top + 12) + 'px'; $('#vfM', box).style.top = (top + 74) + 'px'; };
    lay(); document.fonts && document.fonts.ready.then(lay);
    const M = $('#vfM table', box);
    [5, 6].forEach(c => { $$(`td[data-c="${c}"], th[data-c="${c}"]`, M).forEach(x => x.classList.add('newc')); });
  },
  fill(el, c, animate, tok) {
    const box = $('#vfx', el), M = $('#vfM table', box), S = $('#vfS table', box), T = $('#vfT table', box);
    const src = (r) => c === 5 ? cell(S, L.D.shops.findIndex(x => x[0] === r.shop), 1) : cell(T, L.D.prods.findIndex(p => p[0] === r.art), 1);
    const val = r => c === 5 ? r.dist : r.name;
    $$(`[data-c="${c}"]`, M).forEach(x => x.classList.add('shown'));
    if (!animate) { this.R.forEach((r, i) => { const d = cell(M, i, c); d.textContent = val(r); d.classList.add(c === 5 ? 'gdist' : 'gname'); }); return Promise.resolve(true); }
    return new Promise(res => {
      this.R.forEach((r, i) => setTimeout(() => {
        if (tok !== this.tok) return res(false);
        const sc = src(r), d = cell(M, i, c); sc.classList.add('flash'); setTimeout(() => sc.classList.remove('flash'), 500);
        const fl = document.createElement('div'); fl.className = 'flyer ' + (c === 5 ? 'fdist' : 'fname'); fl.textContent = val(r); el.appendChild(fl);
        const a = rel(sc, el), b = rel(d, el);
        fl.style.left = a.x + 'px'; fl.style.top = a.y + 'px';
        requestAnimationFrame(() => requestAnimationFrame(() => { fl.style.left = (b.x + 6) + 'px'; fl.style.top = (b.y + 6) + 'px'; }));
        setTimeout(() => { fl.remove(); if (tok !== this.tok) return; d.textContent = val(r); d.classList.add(c === 5 ? 'gdist' : 'gname', 'pop'); if (i === this.R.length - 1) res(true); }, 950);
      }, i * 230));
    });
  },
  async step(el, s, o) {
    const tok = ++this.tok, box = $('#vfx', el), M = $('#vfM table', box), fwd = o.dir > 0 && !o.enter;
    $$('.flyer', el).forEach(f => f.remove());
    clearCls(box, 'hi', 'hk', 'hn', 'shown', 'gdist', 'gname', 'pop', 'flash');
    this.R.forEach((_, i) => { cell(M, i, 5).textContent = ''; cell(M, i, 6).textContent = ''; });
    const fx = { 1: '=ВПР(<b class="k">C2</b>; <b class="t">$Магазин.$A:$C</b>; <b class="n">2</b>; <b class="z">0</b>)', 2: '=ВПР(<b class="k">D2</b>; <b class="t">$Товар.$A:$F</b>; <b class="n">3</b>; <b class="z">0</b>)' };
    $('#vfFt', el).innerHTML = fx[Math.min(s, 2)] || '';
    $('#vfFx', el).classList.toggle('on', s === 1 || s === 2);
    $('#vfHead', el).innerHTML = ['<em>ВПР</em> приносит район и товар', '1-я ВПР: <em>район</em> по ID магазина', '2-я ВПР: <em>товар</em> по артикулу', 'Снова всё в <em>одной строке</em>'][s];
    $('#vfCount', el).style.opacity = s >= 3 ? 1 : 0;
    if (s >= 1) { if (!(await this.fill(el, 5, fwd && s === 1, tok))) return; }
    if (s >= 2) { if (!(await this.fill(el, 6, fwd && s === 2, tok))) return; }
    if (s >= 3) { $$(`tr[data-r="${this.ti}"] td[data-c]`, M).forEach(c => c.classList.add('hi')); cell(M, this.ti, 0).classList.add('hk'); [5, 6].forEach(c => cell(M, this.ti, c).classList.add('hn')); }
  }
};

/* ---- три таблицы по отдельности ---- */
W.tbl1 = {
  init(el) {
    const R = L.rows.filter(r => ['M1', 'M2'].includes(r.shop) && [1, 2, 22].includes(r.art) && r.di <= 1).slice(0, 11);
    this.R = R;
    $('#t1', el).innerHTML = sheetTitle('Движение товаров') + grid({ cols: [{ t: 'ID операции', num: true }, { t: 'Дата' }, { t: 'ID магазина' }, { t: 'Артикул', num: true }, { t: 'Количество упаковок, шт.', num: true }, { t: 'Тип операции' }], rows: R.map(r => [r.id, r.date, r.shop, r.art, r.qty, r.type]), letters: 'ABCDEF', rowNums: R.map(r => r.row) });
  },
  step(el, s) {
    const t = $('#t1 table', el); clearCls(t, 'hk', 'ht', 'ty-in', 'ty-out');
    if (s >= 1) { colCells(t, 2).forEach(c => c.classList.add('hk')); colCells(t, 3).forEach(c => c.classList.add('ht')); }
    if (s >= 2) this.R.forEach((r, i) => cell(t, i, 5).classList.add(r.type === 'Поступление' ? 'ty-in' : 'ty-out'));
  }
};
W.tbl2 = {
  init(el) {
    $('#t2', el).innerHTML = sheetTitle('Магазин') + grid({ cols: [{ t: 'ID магазина', w: 200 }, { t: 'Район', w: 300 }, { t: 'Адрес' }], rows: L.D.shops, letters: 'ABC', compact: true });
    const t = $('#t2 table', el); t.style.fontSize = '18px'; $$('td, th', t).forEach(c => { if (!c.closest('tr.colL')) c.style.height = '31px'; });
  },
  step(el, s) {
    const t = $('#t2 table', el); clearCls(t, 'hk', 'g1', 'g2', 'g3');
    if (s >= 1) colCells(t, 0).forEach(c => c.classList.add('hk'));
    if (s >= 2) L.D.shops.forEach((x, i) => cell(t, i, 1).classList.add({ 'Центральный': 'g1', 'Промышленный': 'g2', 'Заречный': 'g3' }[x[1]]));
  }
};
W.tbl3 = {
  init(el) {
    const P = L.D.prods.slice(0, 11).concat([L.prod.get(22)]);
    this.P = P;
    $('#t3', el).innerHTML = sheetTitle('Товар') + grid({ cols: [{ t: 'Артикул', num: true }, { t: 'Отдел' }, { t: 'Наименование товара' }, { t: 'Ед_изм' }, { t: 'Количество в упаковке', num: true }, { t: 'Цена за упаковку', num: true }], rows: P, letters: 'ABCDEF', rowNums: P.map(p => p[0] + 1), compact: true });
    const t = $('#t3 table', el); t.style.fontSize = '18px'; $$('td, th', t).forEach(c => { if (!c.closest('tr.colL')) c.style.height = '38px'; });
  },
  step(el, s) {
    const t = $('#t3 table', el); clearCls(t, 'ht', 'hn');
    if (s >= 1) colCells(t, 0).forEach(c => c.classList.add('ht'));
    if (s >= 2) [2, 4].forEach(k => colCells(t, k).forEach(c => c.classList.add('hn')));
  }
};

/* ---- вопрос по кусочкам ---- */
function questionWidget(textSel, mapSel) {
  return {
    init(el) {
      const t = $(textSel, el), m = $(mapSel, el);
      $$('.fr', t).forEach(f => { f.classList.add('f' + f.dataset.f); f.addEventListener('click', () => { const on = !f.classList.contains('on'); f.classList.toggle('on', on); $(`.qm[data-f="${f.dataset.f}"]`, m).classList.toggle('on', on); }); });
      $$('.qm', m).forEach(c => c.classList.add('f' + c.dataset.f));
    },
    step(el, s) {
      $$('.fr', $(textSel, el)).forEach(f => f.classList.toggle('on', +f.dataset.f <= s));
      $$('.qm', $(mapSel, el)).forEach(c => c.classList.toggle('on', +c.dataset.f <= s));
    }
  };
}
W.question = questionWidget('#qText', '#qMap');
W.question2 = questionWidget('#q2Text', '#q2Map');
/* ---- страница КИМ: «фото» задания с камерой ---- */
const KEY_SVG = '<svg class="key" viewBox="0 0 16 16"><circle cx="5" cy="8" r="3.2" fill="none" stroke="#D8BE6E" stroke-width="1.8"/><path d="M8 8h7M12.5 8v2.6M14.5 8v2" stroke="#D8BE6E" stroke-width="1.8" fill="none"/></svg>';
function kimSchema(box) {
  const B = [
    { id: 'kT', name: 'Товар', x: 0, y: 46, w: 218, f: ['Артикул', 'Отдел', 'Наименование товара', 'Ед_изм', 'Количество в упаковке', 'Цена за упаковку'], key: 0 },
    { id: 'kM', name: 'Движение товаров', x: 296, y: 0, w: 236, f: ['ID операции', 'Дата', 'ID магазина', 'Артикул', 'Количество упаковок, шт.', 'Тип операции'], key: 0 },
    { id: 'kS', name: 'Магазин', x: 612, y: 64, w: 176, f: ['ID магазина', 'Район', 'Адрес'], key: 0 }
  ];
  box.innerHTML = '<svg></svg>' + B.map(b => `<div class="kbox" id="${b.id}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px"><div class="kh">${b.name}</div>${b.f.map((f, i) => `<div class="kf" data-f="${f}">${i === b.key ? KEY_SVG : ''}${f}</div>`).join('')}</div>`).join('');
  const fld = (bid, name) => { const b = $('#' + bid, box), f = $(`.kf[data-f="${name}"]`, b); return { l: b.offsetLeft, r: b.offsetLeft + b.offsetWidth, y: b.offsetTop + f.offsetTop + f.offsetHeight / 2 }; };
  const line = (a, b, la, lb) => {
    const x1 = a.r, x2 = b.l, mx = (x1 + x2) / 2;
    return `<path d="M${x1},${a.y} H${mx} V${b.y} H${x2}" fill="none" stroke="#333" stroke-width="1.4"/>` +
      `<text x="${x1 + 6}" y="${a.y - 5}" font-size="15" font-family="Arial">${la}</text><text x="${x2 - 16}" y="${b.y - 5}" font-size="${lb === '∞' ? 19 : 15}" font-family="Arial">${lb}</text>`;
  };
  const draw = () => {
    $('svg', box).innerHTML = line(fld('kT', 'Артикул'), fld('kM', 'Артикул'), '1', '∞') + line(fld('kM', 'ID магазина'), fld('kS', 'ID магазина'), '∞', '1');
  };
  draw(); document.fonts && document.fonts.ready.then(draw);
}
const offIn = (e, root) => { let x = 0, y = 0; while (e && e !== root) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y }; };
W.kim = {
  init(el) { $$('.ksch', el).forEach(kimSchema); },
  step(el, s) {
    const view = $('.kimv', el), page = $('.kimp', el);
    const VW = view.clientWidth, VH = view.clientHeight, PW = page.offsetWidth, PH = page.offsetHeight;
    let k, tx, ty, rot = 0;
    const zones = ['.kz-tables', '.kz-schema', '.kz-q'];
    if (!s) { k = Math.min(VH * 0.95 / PH, VW * 0.95 / PW); tx = (VW - PW * k) / 2; ty = (VH - PH * k) / 2 + 4; rot = -0.9; }
    else {
      const z = $(zones[s - 1], page), p = offIn(z, page), w = z.offsetWidth, h = z.offsetHeight;
      k = Math.min(VW * 0.92 / w, VH * 0.86 / h, 1.75); tx = VW / 2 - (p.x + w / 2) * k; ty = VH / 2 - (p.y + h / 2) * k;
      ty = Math.min(18, Math.max(ty, VH - PH * k - 18));   // не показываем пустой фон за краем листа
      if (PW * k > VW) tx = Math.min(18, Math.max(tx, VW - PW * k - 18));
    }
    page.style.transform = `translate(${tx}px,${ty}px) scale(${k}) rotate(${rot}deg)`;
    $$('.kz', page).forEach((z, i) => z.classList.toggle('on', i === s - 1));
    view.classList.toggle('zoomed', s > 0);
    const cap = $('.kimcap', el);
    cap.textContent = ['', 'Описание трёх таблиц', 'Схема: как связаны таблицы', 'Вопрос — читаем внимательно'][s];
    cap.classList.toggle('on', s > 0);
  }
};


/* ---- проблема: поля в разных таблицах ---- */
W.problem = {
  step(el, s) {
    $$('.pf.need, .pf.miss', el).forEach(p => p.classList.toggle('lit', s >= 1));
    const heads = ['Нужные поля — в <em>трёх</em> таблицах', 'А фильтровать нужно в <em>одной</em>', 'ВПР приносит их в «Движение»', 'План решения'];
    $('#prHead', el).innerHTML = heads[s];
    const box = $('#prb', el);
    requestAnimationFrame(() => drawLinks(box, s >= 2 ? [{ from: $('#pfR0', el), to: $('#pfR', el), rev: true, color: 'var(--accent)', w: 3 }, { from: $('#pfN0', el), to: $('#pfN', el), rev: true, color: 'var(--accent)', w: 3 }] : []));
  }
};

/* ---- конструктор ВПР ---- */
W.builder = {
  init(el) {
    const R = L.rows.slice(0, 6);
    const mv = grid({ cols: [{ t: 'ID операции', num: true }, { t: 'Дата' }, { t: 'ID магазина' }, { t: 'Артикул', num: true }, { t: 'Количество упаковок, шт.', num: true }, { t: 'Тип операции' }, { t: 'Район', w: 170 }],
      rows: R.map(r => [r.id, r.date, r.shop, r.art, r.qty, r.type, '']), letters: 'ABCDEFG' });
    const sh = grid({ cols: [{ t: 'ID магазина', w: 200 }, { t: 'Район', w: 240 }, { t: 'Адрес', w: 300 }], rows: L.D.shops.slice(0, 6), letters: 'ABC', badges: true });
    $('#bSheet', el).innerHTML = `<div class="fbar"><div class="nb" id="bNb">G2</div><div class="fx">ƒx</div><div class="fv" id="bFv"></div></div>
      <div id="bMv">${mv}</div><div id="bSh" style="display:none">${sh}</div>
      <div class="tabsbar"><span data-tab="mv" class="on">Движение товаров</span><span>Товар</span><span data-tab="sh">Магазин</span></div>`;
    $('#bFormula', el).innerHTML = slotsHTML();
  },
  step(el, s) {
    const root = $('#bFormula', el), mv = $('#bMv table', el), sh = $('#bSh table', el);
    const onSh = s >= 3 && s <= 6;
    $('#bMv', el).style.display = onSh ? 'none' : ''; $('#bSh', el).style.display = onSh ? '' : 'none';
    $$('.tabsbar span', el).forEach(t => t.classList.toggle('on', t.dataset.tab === (onSh ? 'sh' : 'mv')));
    clearCls(el, 'hk', 'ht', 'hn', 'hok', 'sel'); sh.classList.toggle('shownum', s >= 5);
    const g2 = cell(mv, 0, 6); g2.textContent = s >= 7 ? 'Центральный' : '';
    if (!onSh) g2.classList.add(s >= 7 ? 'hok' : 'sel');
    if (s >= 2 && s < 7) cell(mv, 0, 2).classList.add('hk');
    if (onSh) [0, 1, 2].forEach(c => colCells(sh, c).forEach(x => x.classList.add('ht')));
    if (s >= 5 && onSh) colCells(sh, 1).forEach(x => { x.classList.remove('ht'); x.classList.add('hn'); });
    $('#bNb', el).textContent = onSh ? 'A1:C19' : 'G2';
    // formula bar text
    const k = '<span class="k">C2</span>', tb = s >= 4 ? '<span class="t">$Магазин.$A:$C</span>' : '<span class="t">Магазин.A:C</span>';
    let f = '';
    if (s >= 1) f = '=ВПР(';
    if (s >= 2) f += k + ';';
    if (s >= 3) f += tb;
    if (s >= 5) f += ';<span class="n">2</span>';
    if (s >= 6) f += ';<span class="z">0</span>)';
    $('#bFv', el).innerHTML = f + (s < 7 ? '<span class="caret"></span>' : '');
    // slots
    $('[data-pre]', root).textContent = s >= 1 ? '=ВПР(' : (s === 0 ? '' : '');
    setSlot(root, 0, s >= 2 ? 'ok' : (s === 1 ? 'act' : ''), 'C2<small>M1</small>');
    setSlot(root, 1, s >= 3 ? 'ok' : (s === 2 ? 'act' : ''), s >= 4 ? DOL('$Магазин.$A:$C') : 'Магазин.A:C');
    setSlot(root, 2, s >= 5 ? 'ok' : (s === 4 ? 'act' : ''), '2<small>район</small>');
    setSlot(root, 3, s >= 6 ? 'ok' : (s === 5 ? 'act' : ''), '0');
    $$('[data-sep]', root).forEach((e, i) => e.classList.toggle('on', s >= [2, 5, 5][i]));
    $('[data-close]', root).textContent = s >= 6 ? ')' : '';
    $('#bRes', el).classList.toggle('off', s < 7);
    const heads = ['Встаём в G2 — сюда принесём район', 'Пишем «=ВПР(» и открываем скобку', '1. Что ищем? Ключ — ID магазина из C2',
      '2. Где ищем? Лист «Магазин», столбцы A:C', '2. Ставим $ — диапазон не съедет', '3. Какой столбец? ID = 1 · Район = 2 · Адрес = 3',
      '4. Ноль — ищем точное совпадение', 'Enter — район на месте!'];
    $('#bHead', el).textContent = heads[s];
    $('#bStepTitle', el).textContent = s === 0 ? 'ВПР по шагам' : `ВПР по шагам · шаг ${s} из 7`;
    if (s === 7) confettiSoft();
  }
};
function confettiSoft() { confetti(40); }

/* ---- тренажёр: как ищет компьютер ---- */
W.sim = {
  key: 'M1', n: 2, tok: 0,
  init(el) {
    const shops = L.D.shops;
    $('#simSheet', el).innerHTML = sheetTitle('Магазин') + grid({ cols: [{ t: 'ID магазина' }, { t: 'Район' }, { t: 'Адрес' }], rows: shops, letters: 'ABC', compact: true, badges: true }) + '<div class="scan" id="simScan"></div>';
    $('#simSheet table', el).classList.add('shownum');
    const keys = ['M1', 'M5', 'M9', 'M11', 'M17', 'M99'];
    $('#simKeys', el).innerHTML = keys.map(k => `<button data-k="${k}" class="${k === 'M99' ? 'miss' : ''}">${k}</button>`).join('');
    $$('#simKeys button', el).forEach(b => b.addEventListener('click', e => { e.currentTarget.blur(); this.key = b.dataset.k; this.reset(el); }));
    $$('#simN button', el).forEach(b => b.addEventListener('click', e => { e.currentTarget.blur(); this.n = +b.dataset.n; this.reset(el); }));
    $('#simGo', el).addEventListener('click', e => { e.currentTarget.blur(); this.run(el); });
  },
  ui(el) {
    $$('#simKeys button', el).forEach(b => b.classList.toggle('on', b.dataset.k === this.key));
    $$('#simN button', el).forEach(b => b.classList.toggle('on', +b.dataset.n === this.n));
    $('#simF', el).innerHTML = `<span class="p">=ВПР(</span><span class="tag kb">"${this.key}"</span><span class="p">;</span><span class="tag tb">$Магазин.$A:$C</span><span class="p">;</span><span class="tag nb">${this.n}</span><span class="p">;</span><span class="tag zb">0</span><span class="p">)</span>`;
    $('#simF', el).style.alignItems = 'center'; $$('#simF .tag', el).forEach(t => t.style.padding = '4px 10px');
  },
  chain(el, lit, found, rowNum, val) {
    const items = [`ключ ${this.key}`, found === false ? 'нет в столбце A' : `строка ${rowNum || '?'}`, `${this.n}-й столбец`, found === false ? '#Н/Д' : (val || 'результат')];
    $('#simChain', el).innerHTML = items.map((c, i) => (i ? `<span class="ar${i < lit ? ' on' : ''}">→</span>` : '') + `<span class="ch${i < lit ? ' on' : ''}">${c}</span>`).join('');
  },
  reset(el) {
    this.tok++; const t = $('#simSheet table', el); clearCls(t, 'hk', 'ht', 'hn', 'hok', 'hbad');
    $('#simScan', el).style.opacity = 0; const r = $('#simRes', el); r.classList.add('off'); r.classList.remove('err');
    $('#simNote', el).innerHTML = 'Компьютер идёт по <b>первому столбцу</b> сверху вниз, пока не встретит ключ. Потом шагает вправо до нужного столбца.';
    $$('.flyer', el).forEach(f => f.remove());
    this.ui(el); this.chain(el, 0);
  },
  async run(el) {
    this.reset(el); const tok = this.tok, box = $('#simSheet', el), t = $('table', box), scan = $('#simScan', el);
    const shops = L.D.shops; colCells(t, 0).forEach(c => c.classList.add('ht'));
    this.chain(el, 1);
    await wait(350); if (tok !== this.tok) return;
    scan.style.opacity = 1;
    let found = -1;
    for (let i = 0; i < shops.length; i++) {
      const tr = $(`tr[data-r="${i}"]`, t), p = rel(tr, box);
      scan.style.top = p.y + 'px'; scan.style.height = p.h + 'px';
      await wait(i < 3 ? 260 : 150); if (tok !== this.tok) return;
      if (shops[i][0] === this.key) { found = i; break; }
    }
    scan.style.opacity = 0;
    if (found < 0) {
      $('#simRes', el).textContent = '#Н/Д'; $('#simRes', el).classList.add('err'); $('#simRes', el).classList.remove('off');
      this.chain(el, 4, false);
      $('#simNote', el).innerHTML = `Ключа <b class="k">${this.key}</b> нет в первом столбце. Мы попросили <b class="z">точное совпадение (0)</b> — поэтому ошибка <b style="color:var(--bad)">#Н/Д</b>. Частая причина: лишний пробел или не тот лист.`;
      return;
    }
    const c0 = cell(t, found, 0); c0.classList.remove('ht'); c0.classList.add('hk');
    this.chain(el, 2, true, found + 2);
    await wait(500); if (tok !== this.tok) return;
    for (let j = 1; j < this.n; j++) { cell(t, found, j).classList.add('hi'); await wait(300); if (tok !== this.tok) return; }
    const tgt = cell(t, found, this.n - 1); tgt.classList.remove('hi', 'hk'); tgt.classList.add('hn');
    const val = shops[found][this.n - 1];
    this.chain(el, 3, true, found + 2, val);
    await wait(350); if (tok !== this.tok) return;
    // flyer
    const fl = document.createElement('div'); fl.className = 'flyer'; fl.textContent = val; el.appendChild(fl);
    const a = rel(tgt, el), res = $('#simRes', el); res.textContent = '→ ' + val;
    fl.style.left = a.x + 'px'; fl.style.top = a.y + 'px';
    const b = rel(res, el);
    requestAnimationFrame(() => { fl.style.left = b.x + 'px'; fl.style.top = b.y + 'px'; });
    await wait(900); if (tok !== this.tok) return;
    fl.remove(); res.classList.remove('off'); this.chain(el, 4, true, found + 2, val);
    $('#simNote', el).innerHTML = `Нашёл <b class="k">${this.key}</b> в строке ${found + 2}, отсчитал <b class="n">${this.n}-й</b> столбец и принёс «${val}».`;
  },
  step(el, s, o) {
    const plan = [null, ['M1', 2], ['M11', 3], ['M99', 2]];
    if (s === 0) { this.key = 'M1'; this.n = 2; this.reset(el); return; }
    [this.key, this.n] = plan[s];
    if (o.dir > 0 && !o.enter) this.run(el); else this.reset(el);
  }
};

/* ---- знак $ ---- */
W.dollar = {
  tok: 0, on: false,
  init(el) {
    const R = L.rows.slice(0, 8);
    this.R = R;
    $('#dlSheet', el).innerHTML = sheetTitle('Движение товаров') + grid({ cols: [{ t: 'ID магазина', w: 130 }, { t: 'Район', w: 170 }, { t: 'Формула в столбце G' }], rows: R.map(r => [r.shop, '', '']), letters: ['C', 'G', 'G'], rowStart: 1 });
    $$('#dlSheet td[data-c="2"]', el).forEach(c => { c.classList.add('mono'); c.style.fontSize = '14px'; });
    $('#dlSw', el).addEventListener('click', e => { e.currentTarget.blur(); this.on = !this.on; this.fill(el, true); });
  },
  formula(r) { return this.on ? `=ВПР(C${r};<b class="t">$Магазин.$A$2:$C$19</b>;2;0)` : `=ВПР(C${r};<b class="t">Магазин.A${r}:C${r + 17}</b>;2;0)`; },
  async fill(el, animate) {
    const tok = ++this.tok, t = $('#dlSheet table', el);
    $('#dlSw', el).classList.toggle('on', this.on); $('#dlLbl', el).textContent = this.on ? 'С $ (закреплено)' : 'Без $';
    clearCls(t, 'hbad', 'hok', 'sel');
    for (let i = 0; i < this.R.length; i++) { cell(t, i, 1).textContent = ''; cell(t, i, 2).innerHTML = ''; }
    for (let i = 0; i < this.R.length; i++) {
      const r = i + 2, ok = this.on || r <= 2;
      cell(t, i, 1).textContent = ok ? 'Центральный' : '#Н/Д';
      cell(t, i, 1).classList.add(ok ? 'hok' : 'hbad'); cell(t, i, 2).innerHTML = this.formula(r);
      if (animate) { cell(t, i, 1).classList.add('sel'); await wait(170); if (tok !== this.tok) return; cell(t, i, 1).classList.remove('sel'); }
    }
  },
  first(el) { // only the first formula typed
    ++this.tok; const t = $('#dlSheet table', el); clearCls(t, 'hbad', 'hok', 'sel');
    this.R.forEach((_, i) => { cell(t, i, 1).textContent = ''; cell(t, i, 2).innerHTML = ''; });
    cell(t, 0, 1).textContent = 'Центральный'; cell(t, 0, 1).classList.add('hok', 'sel'); cell(t, 0, 2).innerHTML = this.formula(2);
    $('#dlSw', el).classList.toggle('on', this.on); $('#dlLbl', el).textContent = this.on ? 'С $ (закреплено)' : 'Без $';
  },
  step(el, s, o) {
    const fwd = o.dir > 0 && !o.enter;
    if (s === 0) { this.on = false; this.first(el); }
    if (s === 1) { this.on = false; this.fill(el, fwd); }
    if (s >= 2) { this.on = true; this.fill(el, fwd && s === 2); }
    const c = $('#dlCnt', el);
    if (s === 3 && fwd) countUp(c, 4320, 1300); else setNum(c, s >= 3 ? 4320 : 0);
  }
};

/* ---- вторая ВПР ---- */
W.vlk2 = {
  n: 0,
  init(el) {
    const P = L.D.prods.slice(0, 7);
    this.P = P;
    $('#v2Sheet', el).innerHTML = sheetTitle('Товар') + grid({ cols: [{ t: 'Артикул', num: true }, { t: 'Отдел' }, { t: 'Наименование товара' }, { t: 'Ед_изм' }, { t: 'Количество в упаковке', num: true }, { t: 'Цена за упаковку', num: true }], rows: P, letters: 'ABCDEF', badges: true, compact: true });
    const t = $('#v2Sheet table', el); t.classList.add('shownum');
    $$('tr.hd th, tr.colL th[data-c]', t).forEach(h => { h.classList.add('click'); h.addEventListener('click', () => { this.n = +h.dataset.c + 1; this.paint(el); }); });
  },
  paint(el) {
    const t = $('#v2Sheet table', el); clearCls(t, 'hk', 'hn', 'hok', 'ht');
    cell(t, 0, 0).classList.add('hk');
    const n = this.n;
    $('#v2F', el).innerHTML = `<span class="p">=ВПР(</span><span class="tag kb">D2</span><span class="p">;</span><span class="tag tb">$Товар.$A:$F</span><span class="p">;</span><span class="tag nb">${n || '?'}</span><span class="p">;</span><span class="tag zb">0</span><span class="p">)</span>`;
    $('#v2F', el).style.alignItems = 'center'; $$('#v2F .tag', el).forEach(x => x.style.padding = '4px 10px');
    const r = $('#v2Res', el);
    if (!n) { r.classList.add('off'); return; }
    colCells(t, n - 1).forEach(c => c.classList.add('ht'));
    const tg = cell(t, 0, n - 1); tg.classList.remove('ht'); tg.classList.add(n === 1 ? 'hk' : 'hn');
    r.textContent = '→ ' + this.P[0][n - 1]; r.classList.remove('off');
  },
  step(el, s) { this.n = [0, 3, 4, 5][s]; this.paint(el); }
};

/* ---- живые фильтры ---- */
W.filters = {
  tok: 0,
  COLS: [{ k: 'date', t: 'Дата', f: true, w: 130 }, { k: 'shop', t: 'ID магазина', w: 130 }, { k: 'dist', t: 'Район', f: true, w: 170 }, { k: 'name', t: 'Наименование товара', f: true }, { k: 'qty', t: 'Упаковок, шт.', num: true, w: 150 }, { k: 'type', t: 'Тип операции', f: true, w: 190 }],
  init(el) {
    this.F = {}; this.vals = {};
    this.COLS.filter(c => c.f).forEach(c => { this.vals[c.k] = [...new Set(L.rows.map(r => r[c.k]))]; });
    this.vals.name.sort((a, b) => a.localeCompare(b, 'ru'));
    const box = $('#fSheet', el);
    box.innerHTML = sheetTitle('Движение товаров') +
      `<div style="position:relative"><table class="g" id="fT"><tr class="hd"><td class="ri">1</td>${this.COLS.map((c, j) => `<th data-c="${j}"${c.w ? ` style="width:${c.w}px"` : ''}>${c.t}${c.f ? `<span class="funnel" data-k="${c.k}">▾</span>` : ''}</th>`).join('')}</tr><tbody id="fB"></tbody></table>
      <div class="fdrop" id="fDrop"><div class="ft"></div><div class="list"></div></div></div>
      <div class="status"><span>Найдено записей: <b id="fCount">4320</b> из 4&nbsp;320</span><span>Σ упаковок (видимых): <b id="fSum">0</b></span><span id="fHint" style="margin-left:auto"></span></div>`;
    $$('.funnel', box).forEach(f => f.addEventListener('click', e => { e.stopPropagation(); this.open(el, f.dataset.k, true); }));
    box.addEventListener('click', e => { if (!e.target.closest('.fdrop') && !e.target.closest('.funnel')) this.close(el); });
  },
  visible() { return L.rows.filter(r => Object.entries(this.F).every(([k, set]) => !set || set.has(r[k]))); },
  render(el, animate) {
    const vis = this.visible(), B = $('#fB', el);
    B.innerHTML = vis.slice(0, 11).map(r => `<tr class="${animate ? 'fresh' : ''}"><td class="ri${Object.keys(this.F).some(k => this.F[k]) ? ' blue' : ''}">${r.row}</td>${this.COLS.map(c => `<td${c.num ? ' class="num"' : ''}>${c.k === 'date' ? r.date : r[c.k]}</td>`).join('')}</tr>`).join('') +
      (vis.length > 11 ? `<tr><td class="ri">⋮</td><td colspan="6" style="color:var(--muted)">… ещё ${fmt(vis.length - 11)} ${plural(vis.length - 11, 'строка', 'строки', 'строк')}</td></tr>` : '');
    const sum = vis.reduce((a, r) => a + r.qty, 0);
    const cnt = $('#fCount', el), sm = $('#fSum', el);
    if (animate) { countUp(cnt, vis.length, 700); countUp(sm, sum, 700); } else { setNum(cnt, vis.length); setNum(sm, sum); }
    $$('.funnel', el).forEach(f => f.classList.toggle('on', !!this.F[f.dataset.k]));
  },
  open(el, k, interactive) {
    const d = $('#fDrop', el), j = this.COLS.findIndex(c => c.k === k), th = $(`#fT th[data-c="${j}"]`, el);
    const p = rel(th, d.parentElement);
    d.style.left = Math.min(p.x, 1408 - 310) + 'px'; d.style.top = (p.y + p.h + 4) + 'px';
    $('.ft', d).textContent = '▾ ' + this.COLS[j].t;
    const set = this.F[k], all = !set;
    $('.list', d).innerHTML = `<label data-v="__all"><input type="checkbox"${all ? ' checked' : ''}>Выделить всё</label>` +
      this.vals[k].map(v => `<label data-v="${esc(v)}"><input type="checkbox"${all || set.has(v) ? ' checked' : ''}>${k === 'date' ? dd(v) : v}</label>`).join('');
    d.dataset.k = k; d.classList.add('open');
    if (interactive) $$('.list input', d).forEach(inp => inp.addEventListener('change', () => {
      const v = inp.parentElement.dataset.v;
      if (v === '__all') this.F[k] = inp.checked ? null : new Set();
      else { const s = this.F[k] ? new Set(this.F[k]) : new Set(this.vals[k]); inp.checked ? s.add(v) : s.delete(v); this.F[k] = s.size === this.vals[k].length ? null : s; }
      this.open(el, k, true); this.render(el, false);
    }));
  },
  close(el) { $('#fDrop', el).classList.remove('open'); },
  target(s) {
    const F = {};
    if (s >= 1) F.date = new Set(L.D.dates.filter(d => d.startsWith('02.08') || d.startsWith('07.08') || d.startsWith('09.08')));
    if (s >= 2) F.dist = new Set(['Центральный']);
    if (s >= 3) F.name = new Set(['Антисептик для рук гель']);
    if (s === 4) F.type = new Set(['Поступление']);
    if (s >= 5) F.type = new Set(['Продажа']);
    return F;
  },
  async step(el, s, o) {
    const tok = ++this.tok, heads = ['Фильтры: оставляем только нужное', '1. Дата: со 2 по 9 августа включительно', '2. Район: только Центральный', '3. Товар: антисептик для рук', '4. Тип операции: Поступление', '5. Тип операции: Продажа'];
    const hints = ['', '', '', '', '', ''];
    $('#fHead', el).textContent = heads[s]; $('#fHint', el).textContent = hints[s];
    const keyOf = [null, 'date', 'dist', 'name', 'type', 'type'][s];
    const T = this.target(s);
    if (o.dir > 0 && !o.enter && keyOf) {
      this.F = this.target(s - 1); this.render(el, false);
      this.open(el, keyOf, false); const d = $('#fDrop', el);
      await wait(500); if (tok !== this.tok) return;
      const want = T[keyOf];
      const labels = $$('.list label', d);
      for (const lb of labels) {
        const v = lb.dataset.v, inp = $('input', lb);
        const should = v === '__all' ? false : want.has(v);
        if (inp.checked !== should) {
          lb.classList.add('hl'); lb.scrollIntoView({ block: 'nearest' }); inp.checked = should;
          await wait(keyOf === 'name' ? 25 : 260); if (tok !== this.tok) return; lb.classList.remove('hl');
        }
      }
      const tgtLb = labels.find(lb => want.has(lb.dataset.v)); if (tgtLb) { tgtLb.classList.add('hl'); tgtLb.scrollIntoView({ block: 'center' }); }
      await wait(650); if (tok !== this.tok) return;
      this.close(el); this.F = T; this.render(el, true);
    } else { this.close(el); this.F = T; this.render(el, false); }
  }
};

/* ---- тип операции ---- */
W.types = {
  init(el) {
    const F = L.rows.filter(r => ['02.08', '07.08', '09.08'].includes(dd(r.date)) && r.dist === 'Центральный' && r.name === 'Антисептик для рук гель');
    const R = F.filter(r => r.type === 'Поступление').slice(0, 4).concat(F.filter(r => r.type === 'Продажа').slice(0, 3));
    this.R = R;
    $('#tyT', el).innerHTML = sheetTitle('Движение товаров') + grid({ cols: [{ t: 'Дата' }, { t: 'ID маг.' }, { t: 'Упаковок', num: true }, { t: 'Тип операции' }], rows: R.map(r => [r.date, r.shop, r.qty, r.type]), letters: 'BCEF', rowNums: R.map(r => r.row) });
  },
  step(el, s, o) {
    const t = $('#tyT table', el); clearCls(t, 'ty-in', 'ty-out');
    this.R.forEach((r, i) => {
      const inn = r.type === 'Поступление';
      if ((inn && (s === 1 || s === 3)) || (!inn && (s === 2 || s === 3))) [2, 3].forEach(c => cell(t, i, c).classList.add(inn ? 'ty-in' : 'ty-out'));
    });
    $$('[data-count]', el).forEach((c, i) => {
      const on = s >= i + 1;
      if (on && o.dir > 0 && s === i + 1 && !o.enter) countUp(c, +c.dataset.count, 1100); else setNum(c, on ? +c.dataset.count : 0);
    });
  }
};

/* ---- ловушка с суммой ---- */
W.sumtrap = {
  tok: 0,
  init(el) {
    const F = L.rows.filter(r => ['02.08', '07.08', '09.08'].includes(dd(r.date)) && r.dist === 'Центральный' && r.name === 'Антисептик для рук гель' && r.type === 'Поступление');
    this.F = F; this.all = L.rows.reduce((a, r) => a + r.qty, 0);
    const cols = [{ t: 'Дата' }, { t: 'ID маг.' }, { t: 'Артикул', num: true }, { t: 'Упаковок', num: true }, { t: 'Тип' }];
    const rows = F.map(r => [r.date, r.shop, r.art, r.qty, r.type]);
    $('#stA', el).innerHTML = sheetTitle('Движение товаров', ' · фильтр включён ▾') + grid({ cols, rows, letters: 'BCDEF', compact: true, rowNums: F.map(r => r.row) });
    $$('#stA td.ri', el).forEach(c => c.classList.add('blue'));
    $('#stB', el).innerHTML = sheetTitle('Лист4 · новый') + grid({ cols, rows, letters: 'BCDEF', compact: true });
    $('#stAr', el).textContent = `=СУММ(E2:E4321) → ${fmt(this.all)} ✗`;
    $('#stBr', el).textContent = `=СУММ(E2:E13) → ${fmt(F.reduce((a, r) => a + r.qty, 0))} ✓`;
  },
  async step(el, s, o) {
    const tok = ++this.tok;
    $('#stAr', el).classList.toggle('off', s < 1); $('#stBr', el).classList.toggle('off', s < 3);
    const rows = $$('#stB tr[data-r]', el);
    if (s >= 2 && o.dir > 0 && s === 2 && !o.enter) {
      rows.forEach(r => r.style.opacity = 0);
      for (const r of rows) { await wait(120); if (tok !== this.tok) return; r.style.opacity = 1; r.classList.add('fresh'); }
    } else rows.forEach(r => { r.style.opacity = s >= 2 ? 1 : 0; r.style.transition = 'opacity .4s'; });
  }
};

/* ---- ответ ---- */
W.answer = {
  step(el, s, o) {
    const n = $('#ansN', el);
    if (s >= 1) { if (o.dir > 0 && !o.enter) { countUp(n, 2089, 1400); setTimeout(() => confetti(), 900); } else setNum(n, 2089); }
    else { n._cu = (n._cu || 0) + 1; n.textContent = '?'; }
  }
};

/* ---- масса (№31500) ---- */
W.mass = {
  tok: 0,
  init(el) {
    const R = B.rows.filter(r => r.addr.includes('Прибрежная') && r.name.includes('Зефир') && r.type === 'Поступление' && r.di >= 2 && r.di <= 8);
    this.R = R; this.total = R.reduce((a, r) => a + r.qty * r.per, 0);
    $('#msSheet', el).innerHTML = sheetTitle('Лист4 · отфильтрованные строки') + grid({
      cols: [{ t: 'Дата' }, { t: 'Упаковок', num: true }, { t: 'Адрес' }, { t: 'Наименование' }, { t: 'В упаковке', num: true }, { t: 'Масса, г', num: true, w: 130 }],
      rows: R.map(r => [r.date, r.qty, r.addr, r.name, r.per, '']), letters: ['B', 'E', 'G', 'H', 'J', 'K'], compact: true });
    $$('#msSheet td, #msSheet th', el).forEach(c => { c.style.height = '25px'; c.style.paddingTop = '2px'; c.style.paddingBottom = '2px'; });
  },
  async step(el, s, o) {
    const tok = ++this.tok, t = $('#msSheet table', el), fwd = o.dir > 0 && !o.enter;
    clearCls(t, 'hn', 'sel');
    if (s >= 1) {
      for (let i = 0; i < this.R.length; i++) {
        const c = cell(t, i, 5); const v = this.R[i].qty * this.R[i].per;
        if (fwd && s === 1) { c.classList.add('sel'); c.textContent = fmt(v); await wait(70); if (tok !== this.tok) return; c.classList.remove('sel'); }
        else c.textContent = fmt(v);
        c.classList.add('hn');
      }
    } else this.R.forEach((_, i) => { cell(t, i, 5).textContent = ''; });
    const sm = $('#msSum', el), kg = $('#msKg', el);
    if (s >= 2) { if (fwd && s === 2) countUp(sm, this.total, 1100, ' г'); else setNum(sm, this.total, ' г'); } else setNum(sm, 0, ' г');
    if (s >= 3) { if (fwd && s === 3) { countUp(kg, this.total / 1000, 1100); setTimeout(() => confetti(60), 800); } else setNum(kg, this.total / 1000); } else setNum(kg, 0);
  }
};

/* ---- ловушки ---- */
W.traps = {
  init(el) { $$('.trap', el).forEach(t => t.addEventListener('click', () => t.classList.toggle('on'))); },
  step(el, s, o) {
    $$('.trap', el).forEach(t => t.classList.toggle('on', +t.dataset.t <= s));
    if (s === 4 && o.dir > 0 && !o.enter) confetti(50);
  }
};

/* ---- квиз ---- */
const QZ_SHOP = () => sheetTitle('Магазин') + grid({ cols: [{ t: 'ID магазина' }, { t: 'Район' }, { t: 'Адрес' }], rows: L.D.shops.slice(0, 8), letters: 'ABC', badges: true });
const QZ_PROD = () => sheetTitle('Товар') + grid({ cols: [{ t: 'Артикул', num: true }, { t: 'Отдел' }, { t: 'Наименование товара' }, { t: 'Ед_изм' }, { t: 'Количество в упаковке', num: true }, { t: 'Цена за упаковку', num: true }], rows: L.D.prods.slice(0, 3), letters: 'ABCDEF', badges: true });
const QUIZ = [
  { q: 'Что вернёт формула?', code: '=ВПР(<span class="k">"M5"</span>; <span class="t">$Магазин.$A:$C</span>; <span class="n">2</span>; <span class="z">0</span>)', vis: QZ_SHOP,
    opts: ['Центральный', 'ул. Гагарина, 17', 'M5', '#Н/Д'], a: 0,
    after(box) { const t = $('.qzr table', box); t.classList.add('shownum'); cell(t, 4, 0).classList.add('hk'); cell(t, 4, 1).classList.add('hn'); },
    ex: 'Нашли <b class="k">M5</b> в первом столбце, взяли <b class="n">2-й</b> столбец — Район: <b>Центральный</b>. Номер 3 дал бы адрес.' },
  { q: 'Зачем знаки $ в диапазоне таблицы?', opts: ['Чтобы при протягивании диапазон не съехал', 'Чтобы искать точное совпадение', 'Чтобы результат был в рублях', 'Без $ формула не запустится'], a: 0,
    ex: 'За точное совпадение отвечает 0. А $ <b>закрепляет</b> адреса, чтобы таблица не уезжала при протягивании.' },
  { q: '«На сколько увеличилось количество упаковок…» — что считаем?', opts: ['Поступление − Продажа', 'Только поступление', 'Только продажи', 'Поступление + Продажа'], a: 0,
    ex: 'Изменение = сколько пришло <b>минус</b> сколько ушло. Нужны обе суммы.' },
  { q: 'Нужна цена товара. Какой номер столбца писать в ВПР?', code: '=ВПР(<span class="k">D2</span>; <span class="t">$Товар.$A:$F</span>; <span class="qmark">?</span>; <span class="z">0</span>)', vis: QZ_PROD,
    opts: ['6', 'F', '5', '4'], a: 0, wide: true,
    after(box) { const t = $('.qzr table', box); t.classList.add('shownum'); colCells(t, 5).forEach(c => c.classList.add('hn')); },
    ex: 'Считаем столбцы диапазона с A: Артикул — 1, …, Цена — <b>6</b>. Буква F не подойдёт: ВПР ждёт <b>число</b>.' },
  { q: 'Таблицу отфильтровали. Как правильно посчитать сумму упаковок?', opts: ['Скопировать видимые строки на новый лист и там =СУММ', 'Написать =СУММ прямо под таблицей с фильтром', 'Снять фильтр и посчитать =СУММ по столбцу', 'Разницы нет — фильтр уже убрал лишние строки'], a: 0,
    ex: 'Фильтр строки только <b>прячет</b>. =СУММ на этом листе сложит и скрытые — выйдет 1 036 567 вместо 3 000. На новый лист копируются только видимые строки.' },
  { q: 'Поступило 200 упаковок по 250 г. Сколько это килограммов?', opts: ['50', '50 000', '450', '200'], a: 0,
    ex: '200 × 250 = 50 000 г. Делим на 1000 → <b>50 кг</b>. Ловушка: забыть перевести граммы.' }
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
      box.innerHTML = `<h1 style="margin-top:30px">${ok === QUIZ.length ? 'Идеально!' : ok >= 4 ? 'Отлично!' : 'Есть над чем поработать'}</h1>
        <div style="display:flex;align-items:baseline;gap:20px;margin-top:20px"><div class="big" style="color:var(--accent)">${ok}</div><div class="lead">из ${QUIZ.length} правильно</div></div>
        <p class="lead" style="margin-top:24px;max-width:900px">${ok === QUIZ.length ? 'Ты готов к №3. Осталось набить руку на реальных вариантах.' : 'Вернись к слайдам с ошибками: кнопка ← или оглавление (G).'}</p>
        <button class="btn" id="qzAgain" style="margin-top:28px">Пройти заново</button>`;
      $('#qzAgain', el).addEventListener('click', e => { e.currentTarget.blur(); this.ans = []; show(cur, 0, -1); });
      if (ok >= 5) confetti(110);
      return;
    }
    const q = QUIZ[s], a = this.ans[s], done = a !== undefined;
    $('#qzNum', el).textContent = `Вопрос ${s + 1} из ${QUIZ.length}`;
    const opts = `<div class="qz${done ? ' done' : ''}${q.vis ? ' one' : ''}">${q.order.map((oi, k) => `<button data-o="${oi}" class="${done ? (oi === q.a ? 'right' : (oi === a ? 'wrong' : '')) : ''}"><i>${'АБВГ'[k]}</i>${q.opts[oi]}</button>`).join('')}</div>`;
    const head = `<h1 class="qzh">${q.q}</h1>${q.code ? `<div class="card mono qzcode">${q.code}</div>` : ''}`;
    const expl = `<div class="expl${done ? ' on' : ''}">${q.ex}</div>`;
    box.innerHTML = q.vis && q.wide ? `<div class="qzwide">${head}<div class="qzr"><div class="sheet">${q.vis()}</div></div>${opts.replace(' one', ' four')}${expl}</div>` : q.vis ? `<div class="qzw"><div class="qzl">${head}${opts}${expl}</div><div class="qzr"><div class="sheet">${q.vis()}</div></div></div>` : head + opts + expl;
    if (done && q.after) q.after(box);
    $$('.qz button', box).forEach(b => b.addEventListener('click', e => {
      e.currentTarget.blur(); if (this.ans[s] !== undefined) return;
      this.ans[s] = +b.dataset.o; this.render(el, s);
      if (this.ans[s] === q.a) confetti(30);
    }));
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
  if (enter && slides[cur]) { const previous = W[slides[cur].dataset.w]; if (previous && 'tok' in previous) previous.tok++; }
  cur = i; step = s;
  slides.forEach((el, k) => { el.classList.toggle('cur', k === cur); el.classList.toggle('back', k < cur); });
  const el = slides[cur], w = W[el.dataset.w];
  if (w && !inited.has(cur)) { w.init && w.init(el); inited.add(cur); }
  applySteps(el, step);
  if (w && w.step) w.step(el, step, { dir, enter });
  if (enter) { clearInk(); closeAsks(); }
  chrome(); renderNotes(); try { localStorage.setItem('ion:interactive:3:v3', JSON.stringify({slide:cur+1,step,title:slides[cur].dataset.title})); } catch {}
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
  const frac = (cur + (stepsOf(cur) ? step / stepsOf(cur) : 1)) / N;
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
$('#bToc').addEventListener('click', e => { setMenu(false); toggleOv('ovToc'); });
$('#bHelp').addEventListener('click', e => { setMenu(false); toggleOv('ovHelp'); });
async function fullscreen() {
  try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.(); else await document.exitFullscreen?.(); } catch {}
}
addEventListener('fullscreenchange', () => {
  const on = !!document.fullscreenElement;
  $('#bFull').setAttribute('aria-pressed', String(on));
  $('#bFull').setAttribute('aria-label', on ? 'Выйти из полного экрана' : 'Полный экран');
  fit();
});
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

/* Explicit controls: movement never opens or closes a panel. */
const topBar = $('#lessonMenu'), BC = document.body.classList;
function setMenu(on) {
  menuOpen = on;
  BC.toggle('showtop', on);
  topBar.inert = !on;
  topBar.setAttribute('aria-hidden', String(!on));
  $('#hTop').setAttribute('aria-expanded', String(on));
  if (on && notesOpen) setNotes(false);
  fit();
}
$('#hTop').addEventListener('click', () => setMenu(!menuOpen));
$('#menuClose').addEventListener('click', () => { setMenu(false); $('#hTop').focus(); });
if (!/^https?:/.test(location.protocol)) BC.add('local');
else { const h = document.body.dataset.home; if (h) $('#homeLink').href = h; }

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
  notesOpen = on; BC.toggle('notes-open', on);
  $('#notes').inert = !on;
  $('#notes').setAttribute('aria-hidden', String(!on));
  $('#nTab').setAttribute('aria-expanded', String(on));
  if (on && menuOpen) setMenu(false);
  fit(); renderNotes();
  try { localStorage.setItem('ion3_notes', on ? '1' : '0'); } catch (e) {}
}
$('#nTab').addEventListener('click', e => { setNotes(!notesOpen); });
$('#nClose').addEventListener('click', e => { setNotes(false); $('#nTab').focus(); });
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
  if (k === 'Escape') { if (notesOpen) { setNotes(false); $('#nTab').focus(); return; } if (menuOpen) { setMenu(false); $('#hTop').focus(); return; } if ($('.ask.open')) { closeAsks(); return; } if (ovOpen()) closeOv(); else if (drawOn) setDraw(false); else if (laserOn) setLaser(false); else if (spot.classList.contains('on')) spot.classList.remove('on'); $('#blank').classList.remove('on'); return; }
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
  const sc = e.target.closest('.scrollable, .fdrop .list');
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
const m = location.hash.match(/^#(\d+)(?:\.(\d+))?/);
show(m ? +m[1] - 1 : 0, m && m[2] ? +m[2] : 0, 1);
requestAnimationFrame(() => requestAnimationFrame(() => BC.add('ready')));
window.__deck = { show, next, prev, setNotes, get cur() { return cur; }, get step() { return step; }, N };
})();
