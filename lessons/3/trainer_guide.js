/* Тренажёр «Задание 3» — 4 уровня с убывающими подсказками, проверяющий ошибок, автопоказ */
(() => {
'use strict';
const T = window.TR, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = T.wait, L = T.LET;
const isErr = v => typeof v === 'string' && /^(#Н\/Д|#ИМЯ\?|#ЗНАЧ!|#ССЫЛКА!|#ДЕЛ\/0!|Ошибка:\d+)$/.test(v);
const fmt = n => String(Math.round(n * 1e6) / 1e6).replace('.', ',');
const G = { lv: 0, spec: null, mode: 'full', i: 0, si: 0, steps: [], stages: [], auto: false, busy: false, answered: false, hints: true,
  tier: 0, cost: 0, shows: 0, errSeen: new Map(), wrong: 0, t0: 0, tEnd: 0, lastProg: 0, nudged: false, finished: false, watched: false };

const CALC_VOICE = {
  "trimRows": "При выделении столбцов появились номера строк. Удали цифры один и миллион сорок восемь тысяч пятьсот семьдесят шесть. Оставь только буквы столбцов и двоеточие. Имя листа не стирай.",
  "lockColumns": "Теперь поставь знак доллара перед каждой буквой столбца: перед первой буквой диапазона и перед последней. Доллар перед названием листа оставь. Так ссылка будет закреплена при копировании формулы.",
  "filter": "Нажми значок воронки на верхней панели. В заголовках таблицы появятся стрелки фильтров.",
  "sumType": "Напиши знак равно, затем СУММ и открывающую скобку. Пока не нажимай Enter.",
  "sumRange": "Теперь выдели мышью числа, которые нужно сложить: от первой ячейки с данными до последней. Заголовок и ячейку с самой формулой не включай.",
  "sumEnd": "Напечатай закрывающую скобку и нажми Enter.",
  "sumStage": "Встань под последним числом нужного столбца. Напиши равно, СУММ и открывающую скобку. Выдели мышью все числа этого столбца без заголовка. Закрой скобку и нажми Enter.",
  "lookupStage": "Начни формулу ВПР и выбери ячейку с ключом. После точки с запятой перейди на нужный лист и выдели столбцы таблицы поиска. Удали номера строк из ссылки. Поставь доллар перед каждой буквой столбца. Затем укажи номер столбца результата, ноль для точного поиска и закрой скобку. Нажми Enter и протяни формулу вниз.",
  "salesStage": "Вернись на лист движения товаров. Оставь в фильтре только продажи и скопируй видимые строки на новый лист. Под столбцом упаковок напиши равно, СУММ и открывающую скобку. Выдели числа мышью, закрой скобку и нажми Enter."
};

/* =============================== state helpers =============================== */
const S0 = () => T.WB.sheets[0];
const base = () => T.WB.base;
const onSheet = i => T.WB.cur === i;
const act = () => T.S().act;
const actAt = (r, c, si = 0) => onSheet(si) && act().r === r && act().c === c;
const editingAt = (r, c, si = 0) => !!T.edit && T.edit.si === si && T.edit.r === r && T.edit.c === c;
const et = () => (T.edit ? T.edit.text : '');
const setEq = (a, b) => { const A = a instanceof Set ? a : new Set(a); if (A.size !== b.length) return false; return b.every(x => A.has(x)); };
const hdrOK = (c, si = 0) => String(T.raw(T.WB.sheets[si], 0, c)).trim() !== '';
const hnorm = v => String(v).trim().toLowerCase().replace(/ё/g, 'е');
const hdrIs = (c, want, si = 0) => { const h = hnorm(T.raw(T.WB.sheets[si], 0, c)); return h !== '' && h.startsWith(hnorm(want)); };
const lookupHeaderIs = (c, o) => {
  const h = hnorm(T.raw(S0(), 0, c));
  if (o.sheet === 'Товар' && o.idx === 3) return /^(товар|наименование|название)(\b|\s|$)/u.test(h) || hdrIs(c, o.hdr);
  return hdrIs(c, o.hdr);
};
const crit = c => S0().af && S0().af.crit[c];
const critOK = (c, keep) => { const s = crit(c); return !!s && setEq(s, keep); };
const popOn = c => !!T.pop && T.pop.c === c && onSheet(0);
const effEq = (c, keep) => popOn(c) && setEq(T.afEffective(), keep);
let memo = { k: '', v: {} };
function cached(key, fn) { const k = T.WB.ver + '|' + T.WB.sheets.map(s => s.ver).join(',') + '|' + T.WB.sheets.length; if (memo.k !== k) memo = { k, v: {} }; if (!(key in memo.v)) memo.v[key] = fn(); return memo.v[key]; }
function cellOK(si, r, c, exp) { const sh = T.WB.sheets[si]; if (!sh || !T.fx(sh, r, c)) return false; return T.val(si, r, c) === exp; }
function colStat(c, expFn) {
  return cached('cs' + c, () => {
    const sh = S0(), n = dataRows(sh) + 1; let f = 0, err = 0, bad = 0;
    for (let r = 1; r < n; r++) { if (!T.fx(sh, r, c)) continue; f++; const v = T.val(0, r, c); if (isErr(v)) err++; else if (v !== expFn(r)) bad++; }
    return { f, err, bad, n: n - 1 };
  });
}
const colOK = (c, expFn) => { const s = colStat(c, expFn); return s.f === s.n && !s.err && !s.bad && s.n > 0; };
function dataRows(sh) { let n = 0; for (let r = 1; r < T.nrows(sh); r++) { if (typeof T.raw(sh, r, 0) === 'number') n++; else break; } return n; }
function findSheet(rowsN, qtySum) {
  return cached('fs' + rowsN + ':' + qtySum, () => {
    for (let i = base(); i < T.WB.sheets.length; i++) {
      const sh = T.WB.sheets[i]; if (dataRows(sh) !== rowsN) continue;
      let s = 0; for (let r = 1; r <= rowsN; r++) { const v = T.raw(sh, r, 4); if (typeof v === 'number') s += v; }
      if (s === qtySum) return i;
    }
    return -1;
  });
}
function sumOK(v) {
  return cached('sum' + v, () => {
    for (let i = base(); i < T.WB.sheets.length; i++) { const sh = T.WB.sheets[i]; for (let r = 0; r < sh.f.length; r++) { const row = sh.f[r]; if (!row) continue; for (let c = 0; c < row.length; c++) { if (!row[c]) continue; const x = T.val(i, r, c); if (typeof x === 'number' && Math.abs(x - v) < 1e-9) return true; } } }
    return false;
  });
}
const clipOK = rows => !!T.clip && T.clip.si === 0 && T.clip.rows.length === rows + 1 && T.clip.rows[0].length >= 7;
const freshSheet = () => T.WB.cur >= base() && T.nrows(T.S()) <= 1 && T.raw(T.S(), 0, 0) === '';
const allSel = () => { const s = T.S().sel; if (s.mode === 'all') return true; const n = T.nrows(T.S()) - 1, m = T.ncols(T.S()) - 1; return s.r1 === 0 && s.c1 === 0 && s.r2 >= n && s.c2 >= m; };

/* =============================== geometry =============================== */
const gs = T.els.gs;
function ensureVisible(r, c) {
  const sh = T.S(), xs = T.colX(sh), di = T.dIdx(sh, r); if (di < 0) return;
  const y = di * T.RH, h = gs.clientHeight - 20, x = xs[c], w = gs.clientWidth - 20; let moved = false;
  if (y < gs.scrollTop) { gs.scrollTop = Math.max(0, y - 40); moved = true; } else if (y + T.RH > gs.scrollTop + h) { gs.scrollTop = y + T.RH - h + 60; moved = true; }
  if (x < gs.scrollLeft) { gs.scrollLeft = x; moved = true; } else if (xs[c + 1] > gs.scrollLeft + w) { gs.scrollLeft = xs[c + 1] - w + 30; moved = true; }
  if (moved) T.render();
}
function cellRect(r, c, si) {
  if (si !== undefined && !onSheet(si)) return null;
  const sh = T.S(), xs = T.colX(sh), di = T.dIdx(sh, r); if (di < 0) return null;
  const g = T.rr(T.els.gsp), v = T.rr(gs);
  const R = { x: g.x + xs[c], y: g.y + di * T.RH, w: xs[c + 1] - xs[c], h: T.RH };
  if (R.y + R.h < v.y || R.y > v.y + v.h - 12 || R.x > v.x + v.w - 12 || R.x + R.w < v.x) return null;
  return R;
}
function colsRect(c1, c2) { const xs = T.colX(T.S()), h = T.rr($('#colhdr')); return { x: h.x + xs[c1] - gs.scrollLeft, y: h.y, w: xs[c2 + 1] - xs[c1], h: h.h }; }
const elR = el => { if (typeof el === 'string') el = $(el); return el && el.offsetParent !== null ? T.rr(el) : null; };
const tabEl = i => $(`#tabs .tab[data-si="${i}"]`);
const afbEl = c => { let e = $(`.afb[data-afc="${c}"]`); if (!e && onSheet(0)) { gs.scrollTop = 0; T.render(); e = $(`.afb[data-afc="${c}"]`); } return e; };
const popLabel = v => $$('#afPop .alist label').find(l => l.dataset.v === v);

/* =============================== fake cursor =============================== */
const cur = $('#fcur');
async function cmove(R) { if (!R) return; cur.style.display = 'block'; cur.style.left = (R.x + Math.min(R.w * 0.55, R.w - 6)) + 'px'; cur.style.top = (R.y + R.h * 0.55) + 'px'; await wait(560); }
async function cclick(R) { if (R) await cmove(R); cur.classList.remove('click'); void cur.offsetWidth; cur.classList.add('click'); await wait(200); }
async function typeText(s) {
  for (const ch of s) {
    if (!G.busy) return;
    if (!T.edit) T.beginEdit(ch); else { const e = T.edit, p = e.text.length; T.setEditText(e.text + ch, p + 1); }
    await wait(45);
  }
}
async function clickCell(r, c) { ensureVisible(r, c); await cclick(cellRect(r, c)); if (T.edit) T.cancelEdit(); T.selectCell(r, c); T.render(); }
async function pressEnter() { await wait(220); T.commit('down'); }
async function typeInCell(r, c, s) { if (!editingAt(r, c, T.WB.cur)) await clickCell(r, c); await typeText(s); await pressEnter(); }

/* =============================== tasks =============================== */
const LEVELS = [
  { n: 1, mode: 'full', modeName: 'Каждый шаг', mapMode: 'Подсказка на каждый клик', mapHint: 'Рамка покажет, куда нажать, карточка — что сделать и зачем', hintW: 100, task: 'Антисептик', taskSub: 'на сколько увеличилось', meter: 4,
    focus: [['Что считаем', 'поступило − продано', '«На сколько увеличилось» — значит, из того, что поступило, вычитаем то, что продали.'], ['Товар', 'фильтр по названию товара', 'Товар — антисептик для рук.'], ['Где', 'только магазины этого района', 'Нужны только магазины Центрального района.'], ['Когда', '02.08 – 09.08, обе границы входят', 'И период: со второго по девятое августа. «Включительно» — значит, границы тоже считаем.']], db: 'lesson', title: 'Антисептик: на сколько увеличилось', kind: 'diff',
    rules: 'Подсказка на каждый клик: рамка покажет, куда нажать, карточка — что сделать. Не получается — жми «Показать», и я сделаю шаг сам.',
    q: 'Используя информацию из приведённой базы данных, определите, <mark>на сколько увеличилось</mark> количество упаковок <mark>антисептика для рук</mark>, имеющихся в наличии в магазинах <mark>Центрального района</mark>, за период <mark>со 2 по 9 августа включительно</mark>. В ответе запишите только число.',
    dates: ['02.08.2021', '07.08.2021', '09.08.2021'], tree: ['Y2021', 'Y2021M08'], treeL: ['2021', 'Август'], period: 'со 2 по 9 августа',
    where: { field: 'dist', col: 6, hdr: 'Район', keep: ['Центральный'], mode: 'only' }, what: { search: 'антисептик', re: /^Антисептик для рук/, label: 'антисептик' }, types: ['Поступление', 'Продажа'] },
  { n: 2, mode: 'stage', modeName: 'Подсказка на этап', mapMode: 'Подсказка на этап', mapHint: 'Карточка скажет, что сделать на этапе. Куда нажимать — решаешь сам', hintW: 64, task: 'Отбеливатель', taskSub: 'сколько продано', meter: 3,
    focus: [['Что считаем', 'сумма упаковок', '«Сколько упаковок» — просто складываем упаковки.'], ['Товар', 'только отбеливатель', 'Товар — отбеливатель.'], ['Тип операции', 'только «Продажа»', '«Продано» — значит, берём только продажи.'], ['Где', 'только магазины этого района', 'Магазины Заречного района.'], ['Когда', '05.08 – 14.08, обе границы входят', 'Период — с пятого по четырнадцатое августа, включительно.']], db: 'lesson', title: 'Отбеливатель: сколько продано', kind: 'sum', type: 1,
    rules: 'Подсказка на каждый этап: что нужно получить и как. Куда нажимать — решаешь сам. Ошибёшься — проверяющий скажет, что не так. Застрял — «Показать этап».',
    q: 'Используя информацию из приведённой базы данных, определите, <mark>сколько упаковок</mark> <mark>отбеливателя</mark> было <mark>продано</mark> в магазинах <mark>Заречного района</mark> за период <mark>с 5 по 14 августа включительно</mark>. В ответе запишите только число.',
    dates: ['07.08.2021', '09.08.2021', '14.08.2021'], tree: ['Y2021', 'Y2021M08'], treeL: ['2021', 'Август'], period: 'с 5 по 14 августа',
    where: { field: 'dist', col: 6, hdr: 'Район', keep: ['Заречный'], mode: 'only' }, what: { search: 'отбеливатель', re: /^Отбеливатель/, label: 'отбеливатель' }, types: ['Продажа'], verb: '«продано»' },
  { n: 3, mode: 'plan', modeName: 'Только план', mapMode: 'Только план', mapHint: 'Справа план решения, намёки — по кнопке', hintW: 34, task: 'Пятновыводители', taskSub: 'объём в литрах', meter: 2,
    focus: [['Что считаем', 'упаковки × объём упаковки → литры', 'Нужен общий объём в литрах: упаковки умножаем на объём одной упаковки.'], ['Товар', 'все виды — ищем по слову', 'Все виды пятновыводителей — их несколько.'], ['Тип операции', 'только «Поступление»', '«Поступивших» — значит, только поступления.'], ['Где', 'только магазины этого района', 'Магазины Промышленного района.'], ['Когда', '05.08 – 14.08, обе границы входят', 'Период — с пятого по четырнадцатое августа, включительно.']], db: 'lesson', title: 'Пятновыводители: объём в литрах', kind: 'mass', type: 0, unit: 'л', small: 'мл', mHdr: 'Объём', perHdr: 'Объём упаковки',
    rules: 'Справа только план. Подсказки — по кнопке 💡: сначала намёк, потом подробно, потом покажу. Ошибёшься — проверяющий сразу подскажет, что не так.',
    q: 'Используя информацию из приведённой базы данных, определите <mark>общий объём (в литрах)</mark> <mark>всех видов пятновыводителей</mark>, <mark>поступивших</mark> в магазины <mark>Промышленного района</mark> за период <mark>с 5 по 14 августа включительно</mark>. В ответе запишите только число.',
    dates: ['07.08.2021', '09.08.2021', '14.08.2021'], tree: ['Y2021', 'Y2021M08'], treeL: ['2021', 'Август'], period: 'с 5 по 14 августа',
    where: { field: 'dist', col: 6, hdr: 'Район', keep: ['Промышленный'], mode: 'only' }, what: { search: 'Пятновыводитель', re: /^Пятновыводитель/, label: 'все пятновыводители', many: true }, types: ['Поступление'], verb: '«поступивших»' },
  { n: 4, mode: 'exam', modeName: 'Экзамен', mapMode: 'Экзамен', mapHint: 'Условие и таймер. Подсказок нет — только проверка ошибок', hintW: 6, task: 'Демо ЕГЭ 2027', taskSub: 'масса зефира', meter: 1,
    focus: [['Что считаем', 'упаковки × вес упаковки → кг', 'Нужна общая масса в килограммах.'], ['Товар', 'все виды зефира', 'Все виды зефира.'], ['Тип операции', 'только «Поступление»', '«Полученного» — значит, поступления.'], ['Где', 'магазины на Прибрежной улице', 'Магазины на Прибрежной улице.'], ['Когда', '05.06 – 19.06, обе границы входят', 'С пятого по девятнадцатое июня, включительно.']], db: 'demo', title: 'Демо ЕГЭ 2027: масса зефира', kind: 'mass', type: 0, unit: 'кг', small: 'г', mHdr: 'Масса', perHdr: 'Вес упаковки',
    rules: 'Как на экзамене: условие и таймер. План скрыт. Ошибки проверяющий всё равно покажет. Подсказка есть, но стоит звезду.',
    q: 'Используя информацию из приведённой базы данных, определите <mark>общую массу (в кг)</mark> <mark>всех видов зефира</mark>, <mark>полученного</mark> магазинами, расположенными <mark>на Прибрежной улице</mark>, за период <mark>с 5 по 19 июня включительно</mark>. В ответе запишите только число.',
    dates: null, tree: ['Y2025', 'Y2025M06'], treeL: ['2025', 'Июнь'], period: 'с 5 по 19 июня',
    where: { field: 'addr', col: 6, hdr: 'Адрес', search: 'Прибрежная', mode: 'search', re: /Прибрежн/, label: 'магазины на Прибрежной' }, what: { search: 'Зефир', re: /Зефир/, label: 'все виды зефира', many: true }, types: ['Поступление'], verb: '«полученного»' }
];
function prep(spec) {
  const D = spec.db === 'demo' ? window.DB_31500 : window.DB_LESSON;
  spec.D = D;
  spec.shop = new Map(D.shops.map(s => [s[0], s])); spec.prod = new Map(D.prods.map(p => [p[0], p]));
  if (!spec.dates) spec.dates = D.dates.filter(d => { const n = +d.slice(0, 2); return n >= 5 && n <= 19; });
  spec.drop = D.dates.filter(d => !spec.dates.includes(d));
  const W = spec.where;
  W.keepVals = W.keep || [...new Set(D.shops.map(s => W.field === 'addr' ? s[2] : s[1]))].filter(v => W.re.test(v));
  spec.names = D.prods.map(p => p[2]).filter(n => spec.what.re.test(n));
  // ВПР: какие столбцы приносим
  spec.lookups = [
    W.field === 'addr' ? { col: 6, hdr: 'Адрес', key: 2, keyName: 'ID магазина', sheet: 'Магазин', cols: 'A:C', idx: 3, need: 'Адрес', what: 'адрес магазина', ex: r => (spec.shop.get(T.raw(S0(), r, 2)) || [])[2] }
                       : { col: 6, hdr: 'Район', key: 2, keyName: 'ID магазина', sheet: 'Магазин', cols: 'A:C', idx: 2, need: 'Район', what: 'район', ex: r => (spec.shop.get(T.raw(S0(), r, 2)) || [])[1] },
    { col: 7, hdr: 'Наименование', key: 3, keyName: 'артикул', sheet: 'Товар', cols: 'A:F', idx: 3, need: 'Наименование товара', what: 'наименование товара', ex: r => (spec.prod.get(T.raw(S0(), r, 3)) || [])[2] }
  ];
  if (spec.kind === 'mass') spec.lookups.push({ col: 8, hdr: spec.perHdr, key: 3, keyName: 'артикул', sheet: 'Товар', cols: 'A:F', idx: 5, need: 'Количество в упаковке', what: 'количество в упаковке', ex: r => (spec.prod.get(T.raw(S0(), r, 3)) || [])[4] });
  spec.filters = [
    { col: 1, kind: 'date', label: 'Дата', keep: spec.dates },
    { col: 6, kind: W.mode, label: W.hdr, keep: W.keepVals, search: W.search },
    { col: 7, kind: 'search', label: 'Наименование', keep: spec.names, search: spec.what.search },
    { col: 5, kind: 'type', label: 'Тип операции', keep: [spec.types[0]], allowed: spec.types.map(t => [t]) }
  ];
  // ответ и ловушки
  const rowsOf = (mods = {}) => {
    const dates = (mods.dates || spec.dates);
    return D.mv.filter(m => dates.includes(D.dates[m[1]]) && W.keepVals.includes(W.field === 'addr' ? spec.shop.get(m[2])[2] : spec.shop.get(m[2])[1]) && spec.names.includes(spec.prod.get(m[3])[2]));
  };
  const qty = (rows, t) => rows.filter(m => m[5] === t).reduce((a, m) => a + m[4], 0);
  const mass = (rows, t) => rows.filter(m => m[5] === t).reduce((a, m) => a + m[4] * spec.prod.get(m[3])[4], 0);
  const R = rowsOf();
  spec.post = { n: R.filter(m => !m[5]).length, qty: qty(R, 0) }; spec.sale = { n: R.filter(m => m[5]).length, qty: qty(R, 1) };
  const traps = [];
  const minus = d => rowsOf({ dates: spec.dates.filter(x => x !== d) }), plus = d => rowsOf({ dates: spec.dates.concat([d]) });
  if (spec.kind === 'diff') {
    spec.answer = qty(R, 0) - qty(R, 1);
    traps.push([qty(R, 0), 'Это только <b>поступление</b>. «На сколько увеличилось» = поступление − продажа.'], [qty(R, 1), 'Это только <b>продажи</b>. Нужно поступление − продажа.'], [qty(R, 0) + qty(R, 1), 'Ты <b>сложил</b> поступление и продажи, а их нужно <b>вычесть</b>.'], [qty(R, 1) - qty(R, 0), 'Перепутан порядок: поступление − продажа, а не наоборот.']);
    spec.dates.forEach(d => { const r = minus(d); traps.push([qty(r, 0) - qty(r, 1), `Потерялась дата <b>${d.slice(0, 5)}</b> — «включительно» значит, граница входит.`]); });
    spec.drop.forEach(d => { const r = plus(d); traps.push([qty(r, 0) - qty(r, 1), `Лишняя дата <b>${d.slice(0, 5)}</b> — она вне периода «${spec.period}».`]); });
    spec.copies = [spec.post, spec.sale];
  } else if (spec.kind === 'sum') {
    spec.answer = qty(R, spec.type);
    traps.push([qty(R, 1 - spec.type), `Это <b>${spec.type ? 'поступление' : 'продажи'}</b>. ${spec.verb} — тип «${spec.types[0]}».`], [qty(R, 0) - qty(R, 1), 'Это поступление − продажа, а спрашивают только продажи.']);
    spec.dates.forEach(d => traps.push([qty(minus(d), spec.type), `Потерялась дата <b>${d.slice(0, 5)}</b> — «включительно» значит, граница входит.`]));
    spec.drop.forEach(d => traps.push([qty(plus(d), spec.type), `Лишняя дата <b>${d.slice(0, 5)}</b> — она вне периода «${spec.period}».`]));
    spec.copies = [spec.type ? spec.sale : spec.post];
  } else {
    const g = mass(R, 0); spec.grams = g; spec.answer = g / 1000; spec.copies = [spec.post];
    traps.push([qty(R, 0), `Это число <b>упаковок</b>, а нужен ${spec.unit === 'кг' ? 'вес' : 'объём'}: упаковки × количество в упаковке.`], [g, `Это ${spec.small} — переведи в ${spec.unit}: раздели на 1000.`], [mass(R, 1) / 1000, `Это <b>продажи</b>, а ${spec.verb} — это «Поступление».`]);
    spec.dates.forEach(d => traps.push([mass(minus(d), 0) / 1000, `Потерялась дата <b>${d.slice(0, 5)}</b> — «включительно» значит, граница входит.`]));
    spec.drop.forEach(d => traps.push([mass(plus(d), 0) / 1000, `Лишняя дата <b>${d.slice(0, 5)}</b> — она вне периода «${spec.period}».`]));
  }
  spec.traps = traps.filter(t => t[0] !== spec.answer);
  return spec;
}

/* =============================== step builders =============================== */
const info = (tip, opt = {}) => Object.assign({ info: true, tip }, opt);
function vlDetailed(o, again) {
  const c = o.col, Lc = L(c), keyL = L(o.key), si = T.sheetByName(o.sheet);
  const c2 = () => cellOK(0, 1, c, o.ex(1));
  const inEdit = () => editingAt(1, c) || c2();
  const re = rx => () => c2() || (editingAt(1, c) && rx.test(et()));
  const rngRe = `\\$${o.sheet}\\.\\$${o.cols[0]}:\\$${o.cols[2]}(?![A-Za-z\\d])`;
  const H = 'h' + c, GO = 'go' + c, ch = 'vl' + c, hOK = () => lookupHeaderIs(c, o);
  const hs = () => T.WB.sheets[si];
  const colList = () => { const h = hs(); const out = []; for (let k = 0; k <= T.CIDX(o.cols[2]); k++) out.push(`${L(k)} — ${T.raw(h, 0, k)} = <b>${k + 1}</b>`); return out.join(', '); };
  return [
    { id: H, tip: `Щёлкни ячейку <b>${Lc}1</b>.`, why: again ? `Ещё один новый столбец — «${o.hdr}».` : `В «Движении» нет района — добавим его новым столбцом. В первой строке заголовки, поэтому сначала подпишем столбец.`, cell: () => [0, c], done: () => hOK() || actAt(0, c) || editingAt(0, c), act: async () => clickCell(0, c) },
    { tip: `Напечатай <kbd>${o.hdr}</kbd> и нажми <kbd>Enter</kbd>.`, why: again ? '' : 'Заголовок нужен для фильтра: в списке стрелки ▾ столбец будет называться именно так.', cell: () => [0, c], valid: () => hOK() || actAt(0, c) || editingAt(0, c), back: H, done: () => hOK() && !editingAt(0, c), act: async () => typeInCell(0, c, o.hdr) },
    { id: GO, tip: `Встань в <b>${Lc}2</b>.`, why: `Формулу пишем один раз — для первой строки с данными. Потом протянем её на все 4 320 строк.`, cell: () => [1, c], done: () => c2() || (actAt(1, c) && !T.edit) || editingAt(1, c), act: async () => clickCell(1, c) },
    { tip: 'Напечатай <code>=ВПР(</code>', why: again ? `Снова ВПР — теперь она найдёт ${o.keyName} в таблице «${o.sheet}» и принесёт ${o.what}.` : `ВПР — «вертикальный просмотр». Функция найдёт ID магазина в таблице «Магазин» и принесёт оттуда район. Любая формула начинается со знака =.`, cell: () => [1, c], chain: ch, done: re(/^=\s*(ВПР|VLOOKUP)\s*\(/i), act: async () => { if (!editingAt(1, c)) await clickCell(1, c); await typeText('=ВПР('); } },
    { tip: `Щёлкни ячейку <b>${keyL}2</b> — это ключ.`, why: `Ключ — то, что есть в обеих таблицах и по чему они связаны: ${o.keyName}. В этой строке он в ${keyL}2. Щелчок сам вставит адрес в формулу — набирать не нужно.`, cell: () => [1, o.key], valid: inEdit, back: GO, chain: ch, done: re(new RegExp(`^=\\s*(ВПР|VLOOKUP)\\s*\\(\\s*\\$?${keyL}\\$?2\\s*(;|$)`, 'i')), act: async () => { ensureVisible(1, o.key); await cclick(cellRect(1, o.key)); T.insertRef(T.refText(1, o.key, 1, o.key)); } },
    { tip: 'Напечатай <kbd>;</kbd> (точку с запятой).', why: 'В LibreOffice аргументы функции разделяются точкой с запятой. Дальше второй аргумент — где искать.', el: '#fInput', valid: inEdit, back: GO, chain: ch, done: re(new RegExp(`^=\\s*(ВПР|VLOOKUP)\\s*\\(\\s*\\$?${keyL}\\$?2\\s*;`, 'i')), act: async () => typeText(';') },
    { tip: `Открой лист <b>«${o.sheet}»</b> — вкладка внизу.`, why: `${o.what[0].toUpperCase() + o.what.slice(1)} лежит в другой таблице — на листе «${o.sheet}». Пока набираешь формулу, можно переходить на другой лист: формула не сбросится, а ссылка подставится вместе с именем листа.`, el: () => tabEl(si), valid: inEdit, back: GO, chain: ch, done: () => c2() || (onSheet(si) && !!T.edit) || new RegExp(o.sheet + '\\.', 'i').test(et()), act: async () => { await cclick(elR(tabEl(si))); T.switchSheet(si); } },
    { tip: `Выдели столбцы <b>${o.cols}</b>: зажми заголовок <b>${o.cols[0]}</b> и протяни до <b>${o.cols[2]}</b>.`, why: `Это таблица, в которой ищем. Первым обязательно идёт столбец с ключом (${o.keyName} в A): ВПР ищет ключ только в первом столбце диапазона. Берём целые столбцы — так ничего не потеряется.`, rect: () => onSheet(si) ? colsRect(T.CIDX(o.cols[0]), T.CIDX(o.cols[2])) : null, valid: inEdit, back: GO, chain: ch,
      done: re(new RegExp(o.sheet + `'?\\.\\$?${o.cols[0]}\\$?\\d*:\\$?${o.cols[2]}(?![A-Za-z])`, 'i')),
      act: async () => { if (!onSheet(si)) T.switchSheet(si); const a = T.CIDX(o.cols[0]), b = T.CIDX(o.cols[2]); const r = colsRect(a, a); await cclick({ x: r.x, y: r.y, w: r.w * 0.5, h: r.h }); T.insertRef(T.refText(0, a, 0, a, true)); const r2 = colsRect(b, b); await cmove({ x: r2.x, y: r2.y, w: r2.w * 0.8, h: r2.h }); T.insertRef(T.refText(0, a, 0, b, true)); } },
    { tip: `Удали цифры <b>1</b> и <b>1048576</b> из диапазона. Должно остаться <code>${o.cols}</code>.`, why: 'Имя листа перед точкой оставь. Здесь используем ссылку на целые столбцы.', voice: CALC_VOICE.trimRows, el: '#fInput', valid: inEdit, back: GO, chain: ch,
      done: re(new RegExp(o.sheet + `'?\\.\\$?${o.cols[0]}:\\$?${o.cols[2]}(?=;|\\)|$)`, 'i')),
      act: async () => { const t = et().replace(new RegExp(`(\\$?${o.cols[0]})\\$?1:(\\$?${o.cols[2]})\\$?1048576`, 'i'), '$1:$2'); T.edit.pend = null; T.setEditText(t, t.length); await wait(260); } },
    { tip: `Поставь <b>$ перед каждой буквой</b>: <code>$${o.cols[0]}:$${o.cols[2]}</code>.`, why: `Получится <code>$${o.sheet}.$${o.cols[0]}:$${o.cols[2]}</code>. Доллар перед именем листа оставь.`, voice: CALC_VOICE.lockColumns, el: '#fInput', valid: inEdit, back: GO, chain: ch,
      done: re(new RegExp(rngRe, 'i')), act: async () => { const t = et().replace(new RegExp(`(\\$${o.sheet}\\.)\\$?${o.cols[0]}:\\$?${o.cols[2]}`, 'i'), (_, pre) => pre + '$' + o.cols[0] + ':$' + o.cols[2]); T.edit.pend = null; T.setEditText(t, t.length); await wait(260); } },
    { id: 'idx' + c, idxStep: o.idx, tip: `Напечатай <code>;${o.idx}</code> — номер столбца.`, why: () => `Третий аргумент — <b>какой по счёту столбец</b> выделенного диапазона вернуть. Считаем слева направо: ${colList()}. Нам нужен «${o.need}» — значит, <b>${o.idx}</b>. Номера видно над столбцами.`, el: '#fInput', valid: inEdit, back: GO, chain: ch,
      done: re(new RegExp(rngRe + `\\s*;\\s*${o.idx}(?!\\d)`, 'i')), act: async () => { await typeText(';' + o.idx); await wait(300); } },
    { tip: 'Напечатай <code>;0)</code> и нажми <kbd>Enter</kbd>.', why: 'Последний аргумент — способ поиска. <b>0</b> — точное совпадение: ищем ровно M1, а не «похожее» значение. Без нуля ВПР ищет приблизительно и может принести чужую строку. Скобка закрывает функцию.', el: '#fInput', valid: inEdit, back: GO, chain: ch, done: () => c2() && !T.edit, act: async () => { await typeText(';0)'); await pressEnter(); } }
  ];
}
function fillSteps(c, ex, label) {
  const ok = () => colOK(c, ex);
  return [
    { id: 'fsel' + c, tip: `Выдели <b>${L(c)}2</b>.`, why: 'Формула пока только в одной строке. Протянем её, чтобы значение появилось у каждой операции.', cell: () => onSheet(0) ? [1, c] : null, done: () => ok() || (actAt(1, c) && !T.edit && T.S().sel.r1 === T.S().sel.r2), act: async () => { if (!onSheet(0)) T.switchSheet(0); await clickCell(1, c); } },
    { tip: `Дважды щёлкни маленький квадратик в правом нижнем углу <b>${L(c)}2</b>.`, why: `Двойной щелчок по маркеру заполнения протягивает формулу ${label} — до конца соседних данных. Ключ в формуле сам меняется на 3, 4, 5-ю строку, а закреплённый $-диапазон остаётся на месте.`, el: '#fh', valid: () => ok() || actAt(1, c), back: 'fsel' + c, done: ok, act: async () => { await cclick(elR('#fh')); await wait(100); T.autoFill(); } }
  ];
}
function vlQuick(o) {
  return [...vlDetailed(o, true), ...fillSteps(o.col, o.ex, 'на все строки')];
}
function afSteps() {
  return [{ id: 'afm', tip: 'Нажми <b>значок воронки</b> на верхней панели.', why: 'В заголовках появятся стрелки фильтров.', voice: CALC_VOICE.filter, el: '.tbar [data-ic="filter"]', done: () => !!S0().af,
    act: async () => { if (!onSheet(0)) T.switchSheet(0); T.closePops(); await cclick(elR('.tbar [data-ic="filter"]')); if (!S0().af) T.afToggle(); } }];
}
function filterSteps(o) {
  const c = o.col, keep = o.keep, ok = () => critOK(c, keep), id = 'fo' + c + (o.tag || '');
  const valid = () => popOn(c) || ok();
  const steps = [{ id, tip: `Нажми стрелку <b>▾</b> в ячейке <b>${L(c)}1</b> (${o.label}).`, why: o.why || '', el: () => afbEl(c), done: () => ok() || popOn(c), act: async () => { if (!onSheet(0)) T.switchSheet(0); if (T.pop && T.pop.c !== c) T.closePops(); if (!popOn(c)) { await cclick(elR(afbEl(c))); T.afOpen(c); } } }];
  if (o.kind === 'date') {
    o.tree.forEach((k, i) => steps.push({ tip: i === 0 ? `Разверни <b>${o.treeL[0]}</b>: нажми треугольник ▸.` : `Теперь разверни <b>${o.treeL[i]}</b>.`, why: i === 0 ? 'В фильтре даты сгруппированы: год → месяц → день.' : '', el: () => $(`#afPop [data-tw="${k}"]`), valid, back: id,
      done: () => ok() || (popOn(c) && T.pop.exp.has(k)) || effEq(c, keep), act: async () => { await cclick(elR($(`#afPop [data-tw="${k}"]`))); if (!T.pop.exp.has(k)) T.afExpand(k); } }));
    o.drop.forEach((v, i) => steps.push({ tip: i === 0 ? `Сними галочку с <b>${v.slice(0, 2)}</b>.` : `И с <b>${v.slice(0, 2)}</b>.`, why: i === 0 ? `${v.slice(0, 5)} не входит в период «${o.period}». А границы периода — «включительно» — оставляем.` : '', el: () => popLabel(v), valid, back: id,
      done: () => ok() || effEq(c, keep) || (popOn(c) && !T.afEffective().has(v)), act: async () => { await cclick(elR(popLabel(v))); if (T.afEffective().has(v)) T.afToggleValue(v); } }));
    o.keep.forEach(v => steps.push({ tip: `Дата <b>${v.slice(0, 2)}</b> входит в период — отметь её.`, el: () => popLabel(v), valid, back: id, hidden: true,
      done: () => ok() || effEq(c, keep) || (popOn(c) && T.afEffective().has(v)), act: async () => { await cclick(elR(popLabel(v))); if (!T.afEffective().has(v)) T.afToggleValue(v); } }));
  } else if (o.kind === 'search') {
    steps.push({ tip: `В поле поиска напечатай <kbd>${o.search}</kbd>.`, why: `Поиск оставит в списке ${o.leftLabel || 'только подходящие значения'} — не нужно листать весь список и снимать галочки по одной.`, el: '#afPop .asrch', valid, back: id, done: () => ok() || effEq(c, keep),
      act: async () => { await cclick(elR('#afPop .asrch')); for (let i = 1; i <= o.search.length; i++) { T.afSetSearch(o.search.slice(0, i)); await wait(55); } } });
  } else {
    steps.push({ tip: 'Сними галочку <b>Все</b> внизу списка.', why: 'Так снимутся все значения разом, и останется отметить только нужное.', el: '#afPop .aall', valid, back: id, done: () => ok() || effEq(c, keep) || (popOn(c) && T.afEffective().size === 0) || (popOn(c) && [...T.afEffective()].every(v => keep.includes(v))), act: async () => { await cclick(elR('#afPop .aall')); T.afSetAll(false); } });
    keep.forEach(v => steps.push({ tip: `Отметь <b>${v}</b>.`, why: o.keepWhy || '', el: () => popLabel(v), valid, back: id, done: () => ok() || effEq(c, keep) || (popOn(c) && T.afEffective().has(v)), act: async () => { await cclick(elR(popLabel(v))); if (!T.afEffective().has(v)) T.afToggleValue(v); } }));
  }
  steps.push({ tip: 'Нажми <b>OK</b>.', why: 'Внизу, в строке состояния, будет видно, сколько записей осталось.', el: '#afPop [data-a="ok"]', valid, back: id, done: ok, act: async () => { await cclick(elR('#afPop [data-a="ok"]')); T.afOk(); } });
  return steps;
}
function copySteps(rows, qty, tag) {
  const pasted = () => findSheet(rows, qty) >= 0;
  return [
    { id: 'cs' + tag, tip: 'Щёлкни серый угол слева от <b>A</b> — выделится вся таблица.', why: 'Скопируем то, что осталось после фильтров. Копируются только видимые строки. Вместо щелчка можно нажать <kbd>Ctrl</kbd>+<kbd>A</kbd>.', el: '#corner', done: () => pasted() || clipOK(rows) || (onSheet(0) && allSel()), act: async () => { if (!onSheet(0)) T.switchSheet(0); await cclick(elR('#corner')); T.selectAll(); } },
    { tip: 'Скопируй: <kbd>Ctrl</kbd>+<kbd>C</kbd> (на Mac <kbd>⌘</kbd>+<kbd>C</kbd>).', why: 'Вокруг таблицы побежит пунктир — значит, скопировано. Можно и кнопкой «Копировать» на панели.', el: '.tbar [data-ic="copy"]', valid: () => pasted() || clipOK(rows) || (onSheet(0) && allSel()), back: 'cs' + tag, done: () => pasted() || clipOK(rows), act: async () => { await cclick(elR('.tbar [data-ic="copy"]')); T.copySel(); } },
    { tip: 'Создай новый лист: нажми <b>＋</b> внизу слева.', why: 'Считать сумму на листе с фильтром нельзя: СУММ сложит и скрытые строки. Поэтому переносим видимое на чистый лист.', el: '#tAdd', done: () => pasted() || freshSheet(), act: async () => { await cclick(elR('#tAdd')); T.addSheet(); } },
    { tip: 'Встань в <b>A1</b> и вставь: <kbd>Ctrl</kbd>+<kbd>V</kbd> (на Mac <kbd>⌘</kbd>+<kbd>V</kbd>).', why: 'На новом листе окажутся только отфильтрованные строки — их можно спокойно складывать.', cell: () => T.WB.cur >= base() ? [0, 0] : null, valid: () => pasted() || freshSheet() || T.WB.cur >= base(), back: 'cs' + tag, done: pasted, act: async () => { if (T.WB.cur < base()) { T.addSheet(); } await clickCell(0, 0); await cclick(elR('.tbar [data-ic="paste"]')); T.pasteClip(); } }
  ];
}
function sumSteps(rows, qty, target, col = 4) {
  const shIdx = () => findSheet(rows, qty), chain = 'sum' + target;
  const at = () => editingAt(rows + 1, col, shIdx()), done = () => sumOK(target) && !T.edit;
  const inEdit = () => done() || at();
  const prefix = () => done() || (at() && /^=\s*(СУММ|SUM)\s*\(/i.test(et()));
  const range = () => done() || (at() && new RegExp(`^=\\s*(СУММ|SUM)\\s*\\(\\s*\\$?${L(col)}\\$?2:\\$?${L(col)}\\$?${rows + 1}(?=\\)|$)`, 'i').test(et()));
  return [
    { id: 'ss' + target, tip: `Встань в <b>${L(col)}${rows + 2}</b> — прямо под последним числом.`, why: col === 4 ? 'Складываем столбец E — «Количество упаковок».' : `Складываем столбец ${L(col)} — «${G.spec ? G.spec.mHdr : ''}».`, cell: () => onSheet(shIdx()) ? [rows + 1, col] : null, done: () => sumOK(target) || (onSheet(shIdx()) && actAt(rows + 1, col, shIdx())) || at(), act: async () => { const i = shIdx(); if (!onSheet(i)) T.switchSheet(i); await clickCell(rows + 1, col); } },
    { tip: 'Напечатай <code>=СУММ(</code>', voice: CALC_VOICE.sumType, el: '#fInput', chain, done: prefix, act: async () => { if (!at()) await clickCell(rows + 1, col); await typeText('=СУММ('); } },
    { tip: `Выдели мышью <b>${L(col)}2:${L(col)}${rows + 1}</b>.`, why: 'Только числа — без заголовка и ячейки с формулой.', voice: CALC_VOICE.sumRange, el: '#gscroll', valid: inEdit, back: 'ss' + target, chain, done: range,
      act: async () => { ensureVisible(1, col); await cclick(cellRect(1, col)); T.insertRef(T.refText(1, col, 1, col)); ensureVisible(rows, col); await cmove(cellRect(rows, col)); T.insertRef(T.refText(1, col, rows, col)); } },
    { tip: 'Напечатай <code>)</code> и нажми <kbd>Enter</kbd>.', voice: CALC_VOICE.sumEnd, el: '#fInput', valid: inEdit, back: 'ss' + target, chain, done, act: async () => { await typeText(')'); await pressEnter(); } }
  ];
}
function massOK(spec) {
  return cached('mass', () => { const i = findSheet(spec.post.n, spec.post.qty); if (i < 0) return false; const sh = T.WB.sheets[i]; for (let r = 1; r <= spec.post.n; r++) { if (!T.fx(sh, r, 9)) return false; if (T.val(i, r, 9) !== T.raw(sh, r, 4) * T.raw(sh, r, 8)) return false; } return true; });
}
function massSteps(spec) {
  const n = spec.post.n, ms = () => findSheet(n, spec.post.qty), ok = () => massOK(spec);
  return [
    { tip: `Щёлкни <b>J1</b>, напечатай <kbd>${spec.mHdr}</kbd> и нажми <kbd>Enter</kbd>.`, why: `Спрашивают не упаковки, а ${spec.unit === 'кг' ? 'массу' : 'объём'}. Посчитаем его для каждой строки в новом столбце.`, cell: () => onSheet(ms()) ? [0, 9] : null, done: () => ok() || (ms() >= 0 && hdrOK(9, ms())), act: async () => { if (!onSheet(ms())) T.switchSheet(ms()); await typeInCell(0, 9, spec.mHdr); } },
    { id: 'mj2', tip: `В <b>J2</b> напиши <code>=E2*I2</code> и нажми <kbd>Enter</kbd>.`, why: `${spec.mHdr} строки = количество упаковок (E) × ${spec.perHdr.toLowerCase()} (I, его принесла ВПР). Например, 100 упаковок по 500 ${spec.small} = 50 000 ${spec.small}.`, cell: () => onSheet(ms()) ? [1, 9] : null, done: () => ok() || (ms() >= 0 && cellOK(ms(), 1, 9, T.raw(T.WB.sheets[ms()], 1, 4) * T.raw(T.WB.sheets[ms()], 1, 8)) && !T.edit), act: async () => { if (!onSheet(ms())) T.switchSheet(ms()); await typeInCell(1, 9, '=E2*I2'); } },
    { id: 'mjs', tip: 'Выдели <b>J2</b>.', why: 'Протянем формулу на все строки.', cell: () => onSheet(ms()) ? [1, 9] : null, done: () => ok() || (onSheet(ms()) && actAt(1, 9, ms()) && !T.edit), act: async () => { if (!onSheet(ms())) T.switchSheet(ms()); await clickCell(1, 9); } },
    { tip: `Дважды щёлкни квадратик в углу <b>J2</b> — ${spec.mHdr.toLowerCase()} посчитается во всех строках.`, el: '#fh', valid: () => ok() || actAt(1, 9, ms()), back: 'mjs', done: ok, act: async () => { await cclick(elR('#fh')); T.autoFill(); } }
  ];
}
function kgSteps(spec) {
  const n = spec.post.n, ms = () => findSheet(n, spec.post.qty);
  return [{ tip: `В <b>J${n + 3}</b> напиши <code>=J${n + 2}/1000</code> и нажми <kbd>Enter</kbd>.`, why: `Сумма получилась в ${spec.small === 'г' ? 'граммах' : 'миллилитрах'}, а ответ нужен в ${spec.unit === 'кг' ? 'килограммах' : 'литрах'}: 1 ${spec.unit} = 1000 ${spec.small}, поэтому делим на 1000.`, cell: () => onSheet(ms()) ? [n + 2, 9] : null, done: () => sumOK(spec.answer) && !T.edit, act: async () => { if (!onSheet(ms())) T.switchSheet(ms()); await typeInCell(n + 2, 9, `=J${n + 2}/1000`); } }];
}
const answerStep = (tipTxt) => ({ id: 'ans', tip: tipTxt, el: '#ansIn', done: () => G.answered, act: async () => { await cclick(elR('#ansIn')); $('#ansIn').value = String(G.spec.answer).replace('.', ','); await wait(250); checkAnswer(); } });

/* =============================== stages =============================== */
function buildStages(spec) {
  const st = [], P = spec.post, S = spec.sale, LK = spec.lookups;
  const copied = () => spec.copies.some(c => findSheet(c.n, c.qty) >= 0);
  const fdef = (f, extra = {}) => Object.assign({ col: f.col, label: f.label, kind: f.kind === 'type' ? 'only' : f.kind, keep: f.keep, search: f.search, tree: spec.tree, treeL: spec.treeL, drop: spec.drop, period: spec.period }, extra);
  const W = spec.where;
  const full = spec.mode === 'full';
  LK.forEach((o, i) => {
    const goal = () => colOK(o.col, o.ex) || copied();
    const h1 = `Принеси <b>${o.what}</b> в столбец ${L(o.col)} функцией ВПР.`;
    const h2 = `В <b>${L(o.col)}1</b> — заголовок «${o.hdr}». В <b>${L(o.col)}2</b> формула <code>=ВПР(${L(o.key)}2;$${o.sheet}.$${o.cols[0]}:$${o.cols[2]};${o.idx};0)</code>:<br>• ключ <b>${L(o.key)}2</b> — ${o.keyName}, он есть в обеих таблицах;<br>• таблица — лист «${o.sheet}», выдели столбцы ${o.cols}, удали номера строк и поставь $ перед обеими буквами;<br>• <b>${o.idx}</b> — «${o.need}» стоит ${o.idx}-м по счёту в ${o.cols};<br>• 0 — точное совпадение.<br>Потом двойной щелчок по уголку ${L(o.col)}2 — формула протянется на все строки.`;
    if (full) { st.push({ t: `ВПР: ${o.hdr.toLowerCase()}`, sub: `столбец ${L(o.col)}`, s: vlDetailed(o, i > 0), goal: () => cellOK(0, 1, o.col, o.ex(1)) || copied(), h1, h2, voice: CALC_VOICE.lookupStage, anchor: () => cellRect(1, o.col, 0) }); st.push({ t: i ? `Протянуть ${L(o.col)}` : 'Протянуть на все строки', s: fillSteps(o.col, o.ex, 'на все 4 320 строк'), goal, h1: 'Протяни формулу на все строки.', h2: `Выдели ${L(o.col)}2 и дважды щёлкни квадратик в его правом нижнем углу.`, anchor: () => cellRect(1, o.col, 0) }); }
    else st.push({ t: `ВПР: ${o.hdr.toLowerCase()}`, sub: `столбец ${L(o.col)}`, s: vlQuick(o), goal, h1, h2, voice: CALC_VOICE.lookupStage, anchor: () => cellRect(0, o.col, 0) });
  });
  st.push({ t: 'Автофильтр', s: afSteps(), goal: () => !!S0().af || copied(), h1: 'Включи автофильтр.', h2: 'Нажми <b>значок воронки</b> на верхней панели — в заголовках появятся стрелки фильтров.', voice: CALC_VOICE.filter, anchor: () => elR('.tbar [data-ic="filter"]') });
  const F = spec.filters;
  const fstage = (f, t, sub, h1, h2, extra) => ({ t, sub, s: filterSteps(fdef(f, Object.assign({ why: f.why, keepWhy: f.keepWhy }, extra || {}))), goal: () => critOK(f.col, f.keep) || copied(), h1, h2, anchor: () => elR(afbEl(f.col)) });
  F[0].why = `Первое условие из вопроса — период «${spec.period} включительно».`;
  st.push(fstage(F[0], 'Фильтр: даты', spec.period, `Оставь только даты ${spec.period} включительно.`, `Стрелка ▾ в «Дата» → раскрой ${spec.treeL[0]} → ${spec.treeL[1]} → сними галочки с ${spec.drop.map(d => d.slice(0, 2)).join(', ')}. «Включительно» — границы входят.`));
  F[1].why = `Условие: магазины ${W.mode === 'only' ? W.keepVals[0].replace(/ый$/, 'ого') + ' района' : W.label}. ${W.hdr} мы принесли ВПР в столбец ${L(F[1].col)}.`; F[1].keepWhy = 'Остальные районы не нужны.';
  F[2].why = `Условие: ${spec.what.label}. Названия товаров мы принесли ВПР в столбец ${L(F[2].col)}.`;
  F[3].why = spec.kind === 'diff' ? '«На сколько увеличилось» = поступление − продажа. Сначала посчитаем всё, что поступило, потом отдельно продажи.' : `${spec.verb} — это тип операции «${spec.types[0]}».`;
  F[3].keepWhy = F[3].why;
  if (W.mode === 'only') st.push(fstage(F[1], `Фильтр: ${W.hdr.toLowerCase()}`, W.keepVals[0], `Оставь только «${W.keepVals[0]}».`, `Стрелка ▾ в «${W.hdr}» → сними «Все» → отметь «${W.keepVals[0]}» → OK.`));
  else st.push(fstage(F[1], `Фильтр: ${W.hdr.toLowerCase()}`, W.search, `Оставь ${W.label}.`, `Стрелка ▾ в «${W.hdr}» → в поиске напиши «${W.search}» → OK.`, { leftLabel: W.label }));
  st.push(fstage(F[2], 'Фильтр: товар', spec.what.label, `Оставь ${spec.what.label}.`, `Стрелка ▾ в «Наименование» → в поиске напиши «${spec.what.search}» → OK.` + (spec.what.many ? ' Поиск оставит все виды сразу.' : ''), { leftLabel: spec.what.label }));
  const T0 = spec.types[0];
  const typeStage = fstage(F[3], `Фильтр: ${T0.toLowerCase()}`, spec.verb || '', spec.verb ? `${spec.verb} — какой это тип операции?` : `Оставь тип «${T0}».`, `Стрелка ▾ в «Тип операции» → оставь только «${T0}».`, { kind: 'only' });
  if (spec.kind === 'diff') typeStage.goal = () => critOK(5, [T0]) || findSheet(P.n, P.qty) >= 0;
  st.push(typeStage);
  const cp = spec.copies[0];
  st.push({ t: 'Копия на новый лист', s: (full ? [info(`Осталось <b>${cp.n}</b> строк — смотри «Найдено записей» внизу. Считать сумму прямо здесь нельзя: СУММ сложит и скрытые строки. Копируем видимое на новый лист.`)] : []).concat(copySteps(cp.n, cp.qty, 'a')), goal: () => findSheet(cp.n, cp.qty) >= 0,
    h1: 'Перенеси видимые строки на новый лист.', h2: 'Угол слева от A (выделить всё) → <kbd>Ctrl</kbd>+<kbd>C</kbd> → «＋» внизу → A1 → <kbd>Ctrl</kbd>+<kbd>V</kbd>. На листе с фильтром СУММ не считаем.', anchor: () => elR('#corner') });
  if (spec.kind === 'diff') {
    st.push({ t: 'Сумма поступлений', s: sumSteps(P.n, P.qty, P.qty).concat(full ? [info(`Поступило <b>${P.qty}</b> упаковок. Теперь то же самое для продаж.`)] : []), goal: () => sumOK(P.qty), h1: 'Посчитай сумму упаковок на новом листе.', h2: `В E${P.n + 2} напиши <code>=СУММ(</code>, выдели мышью <b>E2:E${P.n + 1}</b>, закрой скобку и нажми <kbd>Enter</kbd>.`, voice: CALC_VOICE.sumStage, anchor: () => elR('#fInput') });
    const sf = filterSteps(fdef(F[3], { kind: 'only', keep: ['Продажа'], tag: 's' })).map(s => Object.assign(s, { done: (d => () => sumOK(S.qty) || findSheet(S.n, S.qty) >= 0 || d())(s.done) }));
    st.push({ t: 'Продажи', sub: 'фильтр → копия → сумма', s: [{ tip: 'Вернись на лист <b>«Движение товаров»</b>.', el: () => tabEl(0), done: () => sumOK(S.qty) || onSheet(0), act: async () => { await cclick(elR(tabEl(0))); T.switchSheet(0); } }, ...sf, ...copySteps(S.n, S.qty, 's'), ...sumSteps(S.n, S.qty, S.qty)],
      goal: () => sumOK(S.qty), h1: 'То же самое для продаж.', h2: 'Лист «Движение» → фильтр «Тип операции» = Продажа → копия на новый лист. Под столбцом E напиши <code>=СУММ(</code>, выдели числа мышью, закрой скобку и нажми <kbd>Enter</kbd>.', voice: CALC_VOICE.salesStage, anchor: () => elR(tabEl(0)) });
    st.push({ t: 'Ответ', s: [answerStep(`«На сколько увеличилось» = поступило − продано. Впиши ответ справа: <b>${P.qty} − ${S.qty}</b>.`), ...(full ? [info(`Готово! Ответ <b>${spec.answer}</b>. Ты решил задание 3 так же, как на экзамене.`, { final: true })] : [])], goal: () => G.answered, h1: 'Впиши ответ.', h2: '«Увеличилось» = поступление − продажа.', anchor: () => elR('#ansIn') });
  } else if (spec.kind === 'sum') {
    st.push({ t: 'Сумма', s: sumSteps(cp.n, cp.qty, cp.qty), goal: () => sumOK(cp.qty), h1: 'Посчитай сумму упаковок на новом листе.', h2: `В E${cp.n + 2} напиши <code>=СУММ(</code>, выдели мышью <b>E2:E${cp.n + 1}</b>, закрой скобку и нажми <kbd>Enter</kbd>.`, voice: CALC_VOICE.sumStage, anchor: () => elR('#fInput') });
    st.push({ t: 'Ответ', s: [answerStep('Впиши сумму в поле <b>Ответ</b> справа.')], goal: () => G.answered, h1: 'Впиши ответ.', h2: 'Ответ — сумма упаковок на новом листе.', anchor: () => elR('#ansIn') });
  } else {
    const u = spec.unit === 'кг' ? 'массу' : 'объём';
    st.push({ t: `${spec.mHdr} каждой строки`, sub: 'упаковки × ' + spec.perHdr.toLowerCase(), s: massSteps(spec), goal: () => massOK(spec), h1: `Посчитай ${u} для каждой строки.`, h2: `В J1 — «${spec.mHdr}», в J2 — <code>=E2*I2</code> (упаковки × ${spec.perHdr.toLowerCase()}), потом двойной щелчок по уголку J2.`, anchor: () => elR(tabEl(T.WB.sheets.length - 1)) });
    st.push({ t: `Сумма в ${spec.small === 'г' ? 'граммах' : 'миллилитрах'}`, s: sumSteps(P.n, P.qty, spec.grams, 9), goal: () => sumOK(spec.grams), h1: `Сложи столбец «${spec.mHdr}».`, h2: `В J${P.n + 2} напиши <code>=СУММ(</code>, выдели мышью <b>J2:J${P.n + 1}</b>, закрой скобку и нажми <kbd>Enter</kbd>.`, voice: CALC_VOICE.sumStage, anchor: () => elR('#fInput') });
    st.push({ t: `Перевод в ${spec.unit === 'кг' ? 'килограммы' : 'литры'}`, s: kgSteps(spec), goal: () => sumOK(spec.answer), h1: `Переведи ${spec.small} в ${spec.unit}.`, h2: `Раздели сумму на 1000: в J${P.n + 3} — <code>=J${P.n + 2}/1000</code>.`, anchor: () => null });
    st.push({ t: 'Ответ', s: [answerStep(`Впиши ответ в поле <b>Ответ</b> справа — число ${spec.unit === 'кг' ? 'килограммов' : 'литров'}.`)], goal: () => G.answered, h1: 'Впиши ответ.', h2: `Ответ — в ${spec.unit}.`, anchor: () => elR('#ansIn') });
  }
  st.forEach(x => { x.g = /^(ВПР|Протянуть)/.test(x.t) ? 0 : /^(Автофильтр|Фильтр)/.test(x.t) ? 1 : x.t === 'Ответ' ? 3 : 2; });
  addRecaps(st, spec);
  return st;
}
/* итог этапа: короткая похвала + что получилось (озвучивается) */
function addRecaps(st, spec) {
  const LK = spec.lookups, nL = LK.length, full = spec.mode === 'full', cp = spec.copies[0], W = spec.where;
  const cap = x => x[0].toUpperCase() + x.slice(1);
  const big = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const lk = k => k === nL - 1 ? `Отлично! ${cap(LK[k].what)} на месте — всё собрано в одну таблицу.` : k === 0 ? `Супер, мы это сделали! ${cap(LK[k].what)} теперь есть в каждой строке.` : `Хорошо! И ${LK[k].what} — тоже в каждой строке.`;
  const fx = k => k === 0 ? `Есть! ВПР нашла ${LK[k].what} для первой строки. Теперь — на все строки.` : `Верно! ВПР принесла ${LK[k].what}. Протягиваем!`;
  let k = -1, f = 0;
  st.forEach(x => {
    if (/^ВПР/.test(x.t)) { k++; x.recap = full ? fx(k) : lk(k); }
    else if (/^Протянуть/.test(x.t)) x.recap = lk(k);
    else if (x.t === 'Автофильтр') x.recap = 'Хорошо! Стрелки в заголовках появились — можно фильтровать.';
    else if (/^Фильтр/.test(x.t)) {
      f++;
      if (f === 1) x.recap = `Отлично! Остались только даты ${spec.period}.`;
      else if (f === 2) x.recap = W.mode === 'only' ? `Супер! Остались только магазины ${W.keepVals[0].replace(/ый$/, 'ого')} района.` : `Супер! Остались только ${W.label}.`;
      else if (f === 3) x.recap = `Есть! Товар выбран — ${spec.what.label}.`;
      else x.recap = full ? 'Отлично! Все условия вопроса учтены.' : `Отлично! Все условия учтены — строк осталось: ${cp.n}.`;
    }
    else if (x.t === 'Копия на новый лист') x.recap = 'Супер! Нужные строки — на чистом листе. Теперь можно считать.';
    else if (x.t === 'Продажи') x.recap = `Отлично! Продано ${spec.sale.qty}. Осталось вычесть.`;
    else if (x.t === 'Сумма') x.recap = `Отлично! Сумма — ${cp.qty}. Это и есть ответ.`;
    else if (/каждой строки$/.test(x.t)) x.recap = `Супер! ${spec.mHdr} есть в каждой строке.`;
    else if (/^Сумма в /.test(x.t)) x.recap = `Есть! Всего ${big(spec.grams)} ${spec.small === 'г' ? 'граммов' : 'миллилитров'}.`;
    else if (/^Перевод в /.test(x.t)) x.recap = `Отлично! Получилось ${fmt(spec.answer)} ${spec.unit === 'кг' ? 'килограммов' : 'литров'} — осталось вписать ответ.`;
    if (full && x.s.length && x.s[x.s.length - 1].info) x.recap = '';
  });
}
const GROUPS = ['Собрать всё в одну таблицу', 'Оставить только нужные строки', 'Посчитать', 'Записать ответ'];
const GROUP_SUB = ['ВПР приносит район и название товара', 'автофильтр по условиям вопроса', 'копия на новый лист и сумма', 'число — в поле внизу'];

/* =============================== checker =============================== */
function vlArgs(f) {
  const m = /^=\s*([A-Za-zА-Яа-яЁё.]+)\s*\((.*)\)\s*$/.exec(f); if (!m) return null;
  const args = []; let depth = 0, cur2 = '', inS = false;
  for (const ch of m[2]) { if (ch === '"') inS = !inS; if (!inS) { if (ch === '(') depth++; if (ch === ')') depth--; if ((ch === ';' || ch === ',') && depth === 0) { args.push(cur2.trim()); cur2 = ''; continue; } } cur2 += ch; }
  args.push(cur2.trim()); return { fn: m[1].toUpperCase(), args };
}
const parseRng = s => { const m = /^(?:\$?'?([^'.]+?)'?\.)?(\$?)([A-Za-zА-Яа-яЁё]+)(\$?\d+)?(?::(\$?)([A-Za-zА-Яа-яЁё]+)(\$?\d+)?)?$/.exec(s.trim()); if (!m) return null; return { sheet: m[1] || null, abs: !!m[2], c1: m[3], r1: m[4] ? m[4].replace('$', '') : null, rAbs: m[4] ? m[4].startsWith('$') : false, c2: m[6] || m[3], r2: m[7] ? m[7].replace('$', '') : null }; };
const CYR = /[А-Яа-яЁё]/;
// G/H may be filled in either order. A named column keeps its meaning even
// while its formula is wrong; without a heading, use the lookup source/data.
function syncLookupColumns(spec) {
  if (T.edit || G.busy) return;
  const [where, product] = spec.lookups, sh = S0(), sampleRows = Math.min(5, dataRows(S0()));
  const evidence = c => {
    const roles = [where, product];
    const named = roles.map(o => lookupHeaderIs(c, o));
    if (named.some(Boolean)) return named.map(ok => ok ? 100 : 0);
    for (let r = 1; r <= sampleRows; r++) {
      const f = T.fx(sh, r, c), a = f && vlArgs(f);
      if (!a || !/^(ВПР|VLOOKUP)$/.test(a.fn) || a.args.length < 3) continue;
      const rng = parseRng(a.args[1]);
      const source = roles.map(o => rng?.sheet?.toLowerCase() === o.sheet.toLowerCase() && Number(a.args[2]) === o.idx);
      if (source.some(Boolean)) return source.map(ok => ok ? 30 : 0);
    }
    const values = roles.map(o => {
      let found = false;
      for (let r = 1; r <= sampleRows; r++) {
        const v = T.val(0, r, c);
        if (v === '' || isErr(v)) continue;
        if (v !== o.ex(r)) return 0;
        found = true;
      }
      return found ? 10 : 0;
    });
    return values;
  };
  const g = evidence(6), h = evidence(7);
  const normal = g[0] + h[1], swapped = g[1] + h[0];
  const whereCol = normal === swapped ? where.col : swapped > normal ? 7 : 6;
  if (where.col === whereCol) return;
  where.col = whereCol; product.col = whereCol === 6 ? 7 : 6;
  spec.where.col = where.col;
  spec.filters[1].col = where.col; spec.filters[2].col = product.col;
  memo = { k: '', v: {} };
  // Rebuild captured cells, highlights and demonstration steps together.
  const stage = G.steps[G.i]?.stage ?? 0;
  const offset = G.i - G.steps.findIndex(s => s.stage === stage);
  quiet();
  G.stages = buildStages(spec);
  G.steps = G.stages.flatMap((st, si) => st.s.map(s => Object.assign(s, { stage: si })));
  if (G.mode === 'full') G.i = Math.max(0, G.steps.findIndex(s => s.stage === stage)) + Math.max(0, offset);
  renderStages();
}
function diagText(spec, out) {
  // текст вместо формулы и мусор в новых столбцах главного листа
  const sh = S0(), n = dataRows(sh), lk = new Map(spec.lookups.map(o => [o.col, o]));
  const show = v => { const t = String(v); return t.length > 18 ? t.slice(0, 18) + '…' : t; };
  for (let c = 6; c < Math.max(T.ncols(sh), 10); c++) {
    if (T.edit && T.edit.si === 0 && T.edit.c === c) continue;
    const o = lk.get(c), h = T.raw(sh, 0, c);
    if (o && h !== '' && !T.fx(sh, 0, c) && !CYR.test(String(h))) out.push({ id: 'hd' + c, at: [0, 0, c], msg: `В <b>${L(c)}1</b> написано «${show(h)}». Это заголовок столбца — подпиши его понятно: <b>${o.hdr}</b>. По нему столбец потом найдёшь в фильтре.` });
    else if (o && h !== '' && !T.fx(sh, 0, c) && spec.mode === 'full' && !lookupHeaderIs(c, o)) out.push({ id: 'hn' + c + hnorm(h), at: [0, 0, c], msg: `В <b>${L(c)}1</b> написано «${show(h)}», а нужно <b>${o.hdr}</b>. Щёлкни ${L(c)}1 и напечатай заголовок целиком.` });
    let cnt = 0, first = -1;
    for (let r = 1; r <= n; r++) { const v = T.raw(sh, r, c); if (v !== '' && !T.fx(sh, r, c)) { cnt++; if (first < 0) first = r; } }
    if (!cnt) continue;
    const v = T.raw(sh, first, c);
    if (o && first === 1) out.push({ id: 'tx' + c, at: [0, 1, c], msg: `В <b>${L(c)}2</b> написан текст «${show(v)}», а нужна <b>формула</b>. Формула начинается со знака <b>=</b>: <code>=ВПР(${L(o.key)}2; …)</code>.` });
    else out.push({ id: 'tx' + c + '_' + first, at: [0, first, c], msg: `В <b>${L(c)}${first + 1}</b> лишний текст «${show(v)}»${cnt > 1 ? ` (и ещё ${cnt - 1} ${cnt - 1 === 1 ? 'ячейка' : 'ячеек'} в столбце ${L(c)})` : ''}. Удали его: выдели ячейку и нажми <kbd>Delete</kbd>.` });
  }
}
function diagLookup(o, out) {
  const sh = S0(), c = o.col, Lc = L(c), f = T.fx(sh, 1, c); if (!f) return;
  if (editingAt(1, c)) return;
  const v = T.val(0, 1, c), exp = o.ex(1), id = 'vl' + c, at = [0, 1, c];
  const push = (k, msg) => out.push({ id: id + k, at, msg });
  const a = vlArgs(f);
  if (/^Ошибка:5/.test(String(v)) || !a) { push('syn', `В ${Lc}2 ошибка записи формулы. Формат: <code>=ВПР(ключ; таблица; номер; 0)</code> — аргументы через <b>;</b>, скобки закрыты.`); return; }
  if (!/^(ВПР|VLOOKUP)$/.test(a.fn)) { if (v !== exp) push('fn', `В ${Lc}2 нужна функция <b>ВПР</b>, а не «${a.fn}».`); return; }
  if (a.args.length < 3) { push('argc', `В ВПР не хватает аргументов: нужно 4 — <code>=ВПР(ключ; таблица; номер; 0)</code>.`); return; }
  const key = parseRng(a.args[0]), rng = parseRng(a.args[1]), idx = Number(a.args[2]);
  if (key && CYR.test(key.c1)) { push('cyr', `Ключ <b>${a.args[0]}</b> набран русскими буквами. Адреса ячеек пишутся латиницей: <code>${L(o.key)}2</code>. Проще щёлкнуть по ячейке мышью.`); return; }
  if (rng && CYR.test(rng.c1 + rng.c2)) { push('cyr2', `Диапазон <b>${a.args[1]}</b> набран русскими буквами. Нужно латиницей: <code>$${o.sheet}.$${o.cols[0]}:$${o.cols[2]}</code>.`); return; }
  if (!key || key.r2 || T.CIDX(key.c1) !== o.key) { push('key', `Ключ — <b>${o.keyName}</b>, он в столбце ${L(o.key)}. Первым аргументом должно быть <code>${L(o.key)}2</code>, а сейчас «${a.args[0]}».`); return; }
  if (+key.r1 !== 2) { push('keyrow', `Ключ берём из той же строки: <code>${L(o.key)}2</code>, а не ${a.args[0]}.`); return; }
  if (!rng) { push('rng', `Второй аргумент — таблица: <code>$${o.sheet}.$${o.cols[0]}:$${o.cols[2]}</code>.`); return; }
  if (!rng.sheet) { push('nosheet', `Ищешь на этом же листе, а ${o.what} лежит на листе «<b>${o.sheet}</b>». Таблица: <code>$${o.sheet}.$${o.cols[0]}:$${o.cols[2]}</code> — выбери вкладку внизу во время ввода формулы.`); return; }
  if (rng.sheet.toLowerCase() !== o.sheet.toLowerCase()) { push('sheet', `Таблица взята с листа «${rng.sheet}», а ${o.what} — на листе «<b>${o.sheet}</b>».`); return; }
  if (T.CIDX(rng.c1) !== 0) { push('first', `ВПР ищет ключ в <b>первом</b> столбце диапазона. Начни диапазон со столбца A (там ${o.keyName}): <code>$${o.sheet}.$A:$${o.cols[2]}</code>.`); return; }
  const width = T.CIDX(rng.c2) - T.CIDX(rng.c1) + 1;
  if (!(idx >= 1)) { push('idx', `Третий аргумент — номер столбца числом. «${o.need}» — это <b>${o.idx}</b>.`); return; }
  if (idx > width) { push('wide', `Номер ${idx} больше ширины диапазона ${rng.c1}:${rng.c2} (${width} ст.). Расширь диапазон до ${o.cols[2]} или проверь номер.`); return; }
  if (idx !== o.idx) { const hs = T.WB.sheets[T.sheetByName(o.sheet)]; const h = hs ? T.raw(hs, 0, idx - 1) : '?'; push('idxw', `Номер <b>${idx}</b> — это столбец «${h}». Нам нужен «${o.need}» — он <b>${o.idx}</b>-й в ${o.cols}.`); return; }
  if (a.args.length < 4 || !/^(0|ЛОЖЬ|FALSE)$/i.test(a.args[3])) { push('zero', `Последний аргумент — <b>0</b> (точное совпадение). Без него ВПР ищет приблизительно и может принести чужую строку.`); return; }
  if (v !== exp) { push('val', `В ${Lc}2 получилось «${v}», а должно быть «${exp}». Проверь формулу.`); return; }
  // протягивание
  const s = colStat(c, o.ex);
  if (s.f > 1 && s.f < s.n && !T.edit) out.push({ id: id + 'part', at: [0, Math.min(s.n, s.f + 1), c], msg: `Формула есть только в ${s.f} из ${s.n} строк. Протяни до конца: двойной щелчок по квадратику в углу ${Lc}2.` });
  if (s.err || s.bad) {
    const f3 = T.fx(sh, 2, c), a3 = f3 && vlArgs(f3);
    if (a3 && a3.args[1] && a3.args[1].replace(/\s/g, '') !== a.args[1].replace(/\s/g, '')) out.push({ id: id + 'shift', at: [0, 2, c], msg: `Диапазон съехал при протягивании: в ${Lc}3 уже <code>${a3.args[1]}</code>. Удали номера строк диапазона и поставь $ перед обеими буквами столбцов в ${Lc}2 и протяни заново.` });
    else out.push({ id: id + 'rows', at, msg: `В ${s.err + s.bad} строках столбца ${Lc} неверный результат${s.err ? ' (#Н/Д)' : ''}. Проверь диапазон в формуле.` });
  }
}
function diagnose() {
  const spec = G.spec, out = []; if (!spec) return out;
  if (T.pop || T.menu) return null;
  syncLookupColumns(spec);
  diagText(spec, out);
  spec.lookups.forEach(o => diagLookup(o, out));
  // фильтры
  const sh = S0();
  if (sh.af) {
    const known = new Set(spec.filters.map(f => f.col));
    Object.entries(sh.af.crit).forEach(([c, set]) => {
      if (!set) return; c = +c;
      const hdr = T.raw(sh, 0, c), id = 'flt' + c, at = [0, 0, c];
      if (set.size === 0) { out.push({ id: id + 'e', at, msg: `Фильтр «${hdr}» скрыл все строки — не выбрано ни одного значения.` }); return; }
      if (!known.has(c)) { out.push({ id: id + 'x', at, msg: `Фильтр по «${hdr}» в этом задании не нужен — открой ▾ и отметь «Все».` }); return; }
      const F = spec.filters.find(x => x.col === c);
      const okSets = F.allowed || [F.keep];
      if (okSets.some(k => setEq(set, k))) return;
      const keep = okSets.length > 1 ? okSets.find(k => k.some(x => set.has(x))) || okSets[0] : okSets[0];
      const miss = keep.filter(x => !set.has(x)), extra = [...set].filter(x => !keep.includes(x));
      if (F.kind === 'date') {
        if (miss.length) out.push({ id: id + 'dm', at, msg: `Не хватает даты <b>${miss.map(d => d.slice(0, 5)).join(', ')}</b> — период «${spec.period}» включительно, границы входят.` });
        else out.push({ id: id + 'dx', at, msg: `Лишняя дата <b>${extra.map(d => d.slice(0, 5)).join(', ')}</b> — она вне периода «${spec.period}».` });
      } else if (F.kind === 'type') out.push({ id: id + 't', at, msg: spec.verb ? `${spec.verb[0].toUpperCase() + spec.verb.slice(1)} — это тип «<b>${spec.types[0]}</b>». В фильтре должен остаться только он.` : `В фильтре «Тип операции» должно остаться одно значение.` });
      else if (miss.length && !extra.length && keep.length > 1) out.push({ id: id + 'm', at, msg: `Выбраны не все нужные значения: нет «${miss[0]}»${miss.length > 1 ? ` и ещё ${miss.length - 1}` : ''}. Проще через поиск «${F.search || ''}».` });
      else out.push({ id: id + 'w', at, msg: `В фильтре «${hdr}» должно остаться: ${keep.length > 2 ? keep.length + ' значения со словом «' + (F.search || '') + '»' : keep.map(x => '«' + x + '»').join(', ')}${extra.length ? `. Лишнее: «${extra[0]}»` : ''}.` });
    });
  }
  // СУММ на листе с фильтром
  for (let r = 0; r < sh.f.length; r++) { const row = sh.f[r]; if (!row) continue; for (let c = 0; c < row.length; c++) { const f = row[c]; if (f && /(СУММ|SUM)\s*\(/i.test(f) && !/ПРОМЕЖУТОЧНЫЕ|SUBTOTAL/i.test(f)) out.push({ id: 'sum0', at: [0, r, c], msg: 'СУММ на листе с фильтром складывает и <b>скрытые</b> строки — ответ будет неверным. Скопируй видимые строки на новый лист и считай там. (Удали эту формулу: <kbd>Delete</kbd>.)' }); } }
  // скопированные листы
  const exp = spec.copies.map(c => c.n);
  for (let i = base(); i < T.WB.sheets.length; i++) {
    const s2 = T.WB.sheets[i], n = dataRows(s2); if (n < 1) continue;
    const id = 'cp' + i;
    if (T.ncols(s2) < 6) { out.push({ id: id + 'w', at: [i, 0, 0], msg: `На листе «${s2.name}» скопирована не вся таблица. Выдели всё (угол слева от A) и скопируй заново.` }); continue; }
    if (!exp.includes(n) && findSheet(spec.copies[0].n, spec.copies[0].qty) < 0 && (spec.copies.length < 2 || findSheet(spec.copies[1].n, spec.copies[1].qty) < 0)) out.push({ id: id + 'n' + n, at: [i, 0, 0], msg: `На листе «${s2.name}» ${n} строк, а после правильных фильтров их <b>${exp.join(' или ')}</b>. Проверь фильтры (проверяющий подсветит неверный) и скопируй заново.` });
    // формулы на листе
    for (let r = 0; r < s2.f.length; r++) { const row = s2.f[r]; if (!row) continue; for (let c = 0; c < row.length; c++) {
      const f = row[c]; if (!f) continue; const v = T.val(i, r, c);
      if (isErr(v)) { out.push({ id: id + 'e' + r + c, at: [i, r, c], msg: `В ${L(c)}${r + 1} ошибка ${v}. Проверь формулу: адреса латиницей, аргументы через ;.` }); continue; }
      const sm = /^=\s*(СУММ|SUM)\(\s*\$?([A-Z]+)\$?(\d+)\s*:\s*\$?([A-Z]+)\$?(\d+)\s*\)$/i.exec(f);
      if (sm) {
        const col = T.CIDX(sm[2]), r1 = +sm[3], r2 = +sm[5];
        if (r1 > 2 || r2 < n + 1) out.push({ id: id + 'sr' + r + c, at: [i, r, c], msg: `СУММ захватила не все строки: ${sm[2]}${r1}:${sm[4]}${r2}, а данные — в строках 2…${n + 1}.` });
        else if (spec.kind === 'mass' && col === 4 && !massOK(spec)) out.push({ id: id + 'sp' + r + c, at: [i, r, c], msg: `Это сумма <b>упаковок</b>, а нужен ${spec.unit === 'кг' ? 'вес' : 'объём'}. Сначала посчитай в столбце J для каждой строки: упаковки × ${spec.perHdr.toLowerCase()} (<code>=E2*I2</code>).` });
        else if (spec.kind !== 'mass' && col !== 4) out.push({ id: id + 'sc' + r + c, at: [i, r, c], msg: `Складываем столбец E — «Количество упаковок», а здесь столбец ${sm[2]}.` });
        continue;
      }
      if (spec.kind === 'mass' && r >= 1 && r <= n && c === 9 && v !== T.raw(s2, r, 4) * T.raw(s2, r, 8)) out.push({ id: id + 'm' + r, at: [i, r, c], msg: `${spec.mHdr} строки = упаковки (E) × ${spec.perHdr.toLowerCase()} (I): <code>=E${r + 1}*I${r + 1}</code>.` });
      if (spec.kind === 'mass' && /\/\s*(10|100|10000)\b/.test(f)) out.push({ id: id + 'k' + r, at: [i, r, c], msg: `В 1 ${spec.unit} — 1000 ${spec.small}. Делим на <b>1000</b>.` });
    } }
  }
  return out;
}
// показ ошибок
const echk = $('#echk'), ering = $('#eRing'), feed = $('#feed');
let curIssue = null, dismissed = new Set(), fixTimer = 0;
function issueRect(it) { const [si, r, c] = it.at; if (!onSheet(si)) return elR(tabEl(si)); ensureVisible(r, c); return cellRect(r, c, si); }
function runChecker() {
  if (!G.spec || !T.started || G.busy) return;
  if (T.edit) return;
  const iss = diagnose(); if (iss === null) return;
  const ids = new Set(iss.map(x => x.id));
  iss.forEach(it => {
    if (!G.errSeen.has(it.id)) { G.errSeen.set(it.id, { msg: it.msg, fixed: false }); feedAdd(it.id, it.msg, 'err'); }
    else { const e = G.errSeen.get(it.id); if (e.fixed) { e.fixed = false; feedAdd(it.id, it.msg, 'err'); } }
  });
  G.errSeen.forEach((e, id) => { if (!e.fixed && !ids.has(id)) { e.fixed = true; feedAdd(id, 'Исправлено: ' + strip(e.msg).slice(0, 70) + '…', 'ok'); } });
  updCount(iss.length);
  const it = iss.find(x => !dismissed.has(x.id + '|' + x.msg));
  if (it) showIssue(it);
  else if (curIssue && !ids.has(curIssue.id)) { echk.classList.add('fixed'); $('.eh', echk).textContent = 'Исправлено'; $('#eMsg').innerHTML = 'Отлично, ошибки больше нет.'; ering.classList.remove('on'); clearTimeout(fixTimer); fixTimer = setTimeout(hideIssue, 1600); curIssue = null; }
  else if (!it) hideIssue(true);
}
const strip = s => s.replace(/<[^>]+>/g, '');
function showIssue(it) {
  clearTimeout(fixTimer);
  const same = curIssue && curIssue.id === it.id && curIssue.msg === it.msg;
  curIssue = it;
  echk.classList.remove('fixed'); $('.eh', echk).textContent = 'Проверяющий';
  if (!same) $('#eMsg').innerHTML = it.msg;
  echk.classList.add('on');
  const R = issueRect(it);
  if (R) { Object.assign(ering.style, { left: (R.x - 2) + 'px', top: (R.y - 2) + 'px', width: (R.w + 4) + 'px', height: (R.h + 4) + 'px' }); if (!same) { ering.classList.remove('on'); void ering.offsetWidth; } ering.classList.add('on'); } else ering.classList.remove('on');
}
function hideIssue(keepRing) { echk.classList.remove('on', 'fixed'); ering.classList.remove('on'); curIssue = null; }
$('#eOk').addEventListener('click', () => { if (curIssue) dismissed.add(curIssue.id + '|' + curIssue.msg); hideIssue(); });
function feedAdd() {}
function updCount() {}
function feedReset() {}

/* =============================== engine =============================== */
const coach = $('#coach'), spot = $('#spot'), tip = $('#ctip');
function load(n) {
  quiet();
  const spec = prep(Object.assign({}, LEVELS[n - 1], { where: Object.assign({}, LEVELS[n - 1].where), what: Object.assign({}, LEVELS[n - 1].what) }));
  G.lv = n; G.spec = spec; G.mode = spec.mode; G.answered = false; G.i = 0; G.si = 0; G.auto = false; G.busy = false; G.tier = 0; G.cost = 0; G.shows = 0; G.wrong = 0; G.errSeen = new Map(); G.finished = false; G.watched = false; G.nudged = false; G.praised = new Set();
  dismissed = new Set(); hideIssue(); feedReset(); hideNudge();
  T.reset(spec.db);
  G.stages = buildStages(spec);
  G.steps = []; G.stages.forEach((st, si) => st.s.forEach(s => { s.stage = si; G.steps.push(s); }));
  G.t0 = Date.now(); G.tEnd = 0; G.lastProg = Date.now();
  $('#qBox').innerHTML = qShort(spec.q); $('#lvTag').textContent = n; $('#lvTitle').textContent = `Уровень ${n} из 4`; $('#lvSub').textContent = ({ full: 'Подсказка на каждый шаг', stage: 'Подсказка на этап', plan: 'Только план', exam: 'Экзамен' })[spec.mode];
  $('#timer').classList.toggle('exam', spec.mode === 'exam');
  $('#ansIn').value = ''; const m = $('#ansMsg'); m.textContent = ''; m.className = 'ansmsg';
  G.hints = true; buildHintCtl();
  renderStages(); progress(true); place();
}
function buildHintCtl() {
  const el = $('#hintCtl'), mode = G.mode;
  const reset = '<button class="sp-reset" id="bReset">↺ начать заново</button>';
  if (mode === 'full') el.innerHTML = `<div class="sp-row"><button class="sbb" id="bShowStep"><b>▶</b> Покажи этот шаг</button><button class="sbb" id="bAuto"><b>⏩</b> Реши за меня</button></div>` +
    `<div class="sp-note" id="hintNote">${G.hints ? 'Подсказка над таблицей показывает, куда нажать. Не получается — «Покажи этот шаг», и я сделаю его сам.' : 'Подсказки над таблицей скрыты. <a id="hintsBack">Вернуть</a>'}</div>${reset}`;
  else if (mode === 'stage') el.innerHTML = `<div class="sp-row one"><button class="sbb" id="bShowStage"><b>▶</b> Покажи этот этап</button></div><div class="sp-note">Карточка над таблицей говорит, что сделать на этапе. Как именно — решаешь сам.</div>${reset}`;
  else el.innerHTML = `<button class="sbb hintbtn" id="bHint"><span class="bulb">💡</span><span><span id="hintLbl">Подсказка</span><small id="hintSub">сначала намёк</small></span></button>${reset}`;
  const on = (id, fn) => { const b = $('#' + id); if (b) b.addEventListener('click', fn); };
  on('bShowStep', () => { if (!G.hints) { G.hints = true; G.collapsed = false; buildHintCtl(); } showStep(); });
  on('bAuto', () => autoplay());
  on('bShowStage', () => showStage());
  on('bReset', () => { G.auto = false; load(G.lv); T.started = true; begin(); T.toast('Начали заново'); });
  on('bHint', () => askHint());
  on('hintsBack', () => { G.hints = true; G.collapsed = false; buildHintCtl(); place(); });
  updHintBtn();
}
function updHintBtn() {
  const lbl = $('#hintLbl'), sub = $('#hintSub'); if (!lbl) return;
  const t = G.tier, free = G.mode === 'plan' && t === 0;
  lbl.textContent = ['Подсказка', 'Подробнее', 'Покажи, как', 'Покажи, как'][t];
  sub.textContent = [free ? 'намёк — бесплатно' : 'намёк · −звезда', 'как сделать', 'сделаю этап сам', 'сделаю этап сам'][t];
}
function idxOf(id) { const i = G.steps.findIndex(s => s.id === id); return i < 0 ? G.i : i; }
let checking = false;
function progress(silent) {
  if (checking || !G.steps.length) return; checking = true;
  try {
    syncLookupColumns(G.spec);
    if (G.mode === 'full') {
      const was = G.i, wasSt = curStageIdx(); let guard = 0;
      // формула набирается цепочкой шагов: если уже сделанный шаг цепочки «сломался» (не та ячейка, стёр «;»…) — вернуться к нему
      const cs = G.steps[G.i];
      if (cs && cs.chain) { let j = G.i - 1; while (j >= 0 && G.steps[j].chain === cs.chain) j--; for (let k = j + 1; k < G.i; k++) if (!G.steps[k].done()) { G.i = k; break; } }
      while (G.i < G.steps.length && guard++ < 80) {
        const s = G.steps[G.i];
        if (s.valid && !s.valid()) { const b = idxOf(s.back); if (b < G.i) { G.i = b; continue; } }
        if (!s.info && s.done()) { G.i++; continue; }
        break;
      }
      if (G.i !== was) {
        G.lastProg = Date.now(); if (!silent) flashTip(); renderStages(); enterStep(); tip.classList.remove('on'); spot.classList.remove('pulse'); void spot.offsetWidth; spot.classList.add('pulse');
        if (!silent) {
          const ns = curStageIdx();
          if (G.i < was) { if (!G.busy && !G.auto) oops(); }
          else if (ns > wasSt) stageDone(ns - 1);
          else if (!G.busy && !G.auto && G.steps[was] && !G.steps[was].info) stepPraise();
        }
      }
    } else {
      const was = G.si; let k = 0;
      while (k < G.stages.length && G.stages[k].goal && G.stages[k].goal()) k++;
      if (k !== was) { G.si = k; G.tier = 0; G.cardOff = false; G.lastProg = Date.now(); hideNudge(); updHintBtn(); if (!silent && k > was) { flashTip(); stageDone(k - 1); } renderStages(); }
    }
  } finally { checking = false; }
  place();
}
function enterStep() { const s = G.steps[G.i]; if (s && s.cell) { const c = s.cell(); if (c) ensureVisible(c[0], c[1]); } }
function next() { const s = G.steps[G.i]; if (!s) return; if (s.final) { finish(); return; } G.i++; renderStages(); enterStep(); progress(); }
function curStageIdx() { return G.mode === 'full' ? (G.steps[G.i] ? G.steps[G.i].stage : G.stages.length) : G.si; }
function renderStages() {
  const cs = curStageIdx(), el = $('#stages'), n = G.stages.length, done = Math.min(cs, n);
  $('#planCount').textContent = `${done} из ${n}`;
  if (G.mode === 'exam') {
    el.innerHTML = `<div class="pl-exam"><b>План скрыт — как на экзамене.</b> Решай сам. Ошибки я всё равно покажу.<div class="pl-bar"><i style="width:${Math.round(done / n * 100)}%"></i></div><small>пройдено этапов: ${done} из ${n}</small></div>`;
    return;
  }
  const curG = G.stages[cs] ? G.stages[cs].g : 4;
  let h = '';
  GROUPS.forEach((gname, g) => {
    const idx = G.stages.map((st, i) => st.g === g ? i : -1).filter(i => i >= 0); if (!idx.length) return;
    const gDone = idx.every(i => i < cs), gCur = g === curG;
    h += `<div class="pg${gDone ? ' done' : ''}${gCur ? ' cur' : ''}"><div class="pg-h"><i>${gDone ? '✓' : g + 1}</i><div><b>${gname}</b>${gCur || gDone ? '' : `<small>${GROUP_SUB[g]}</small>`}</div></div>`;
    if (gCur) {
      h += '<ol>' + idx.map(i => {
        const st = G.stages[i], st2 = i < cs ? 'done' : i === cs ? 'cur' : '';
        let extra = '';
        if (i === cs) {
          if (G.mode === 'full') { const loc = G.steps.filter(x => x.stage === i), k = loc.indexOf(G.steps[G.i]) + 1; extra = `<div class="ps-goal">${st.h1 || ''}</div><div class="ps-prog"><i style="width:${Math.round((k - 1) / loc.length * 100)}%"></i></div><small class="ps-k">шаг ${k} из ${loc.length}</small>`; }
          else if (G.mode === 'stage') extra = `<div class="ps-goal">${st.h1 || ''}</div>`;
        }
        return `<li class="${st2}"><i>${i < cs ? '✓' : ''}</i><div><span>${st.t}</span>${extra}</div></li>`;
      }).join('') + '</ol>';
    }
    h += '</div>';
  });
  if (el._h !== h) { el.innerHTML = h; el._h = h; }
  const li = $('#stages li.cur'); if (li) li.scrollIntoView({ block: 'nearest' });
}
let placeRaf = 0;
function place() { cancelAnimationFrame(placeRaf); placeRaf = requestAnimationFrame(placeNow); }
function card(o) {
  $('#ctStage').textContent = o.stage || ''; $('#ctNum').textContent = o.num || '';
  if ($('#ctBody')._h !== o.html) { $('#ctBody').innerHTML = o.html; $('#ctBody')._h = o.html; }
  $('#ctNext').style.display = o.nextBtn ? '' : 'none'; $('#ctNext').textContent = o.final ? 'Ура!' : 'Дальше';
  $('#ctShow').style.display = o.showBtn ? '' : 'none'; $('#ctShow').textContent = G.busy ? '…' : (o.showLabel || 'Показать ▶');
  tip.classList.toggle('lvl3', !!o.gold);
  const R = o.R, pad = 4, W = 360, H = tip.offsetHeight || 150;
  if (R) { Object.assign(spot.style, { left: (R.x - pad) + 'px', top: (R.y - pad) + 'px', width: (R.w + pad * 2) + 'px', height: (R.h + pad * 2) + 'px' }); spot.classList.add('on'); spot.classList.toggle('nodim', !!T.pop || !!T.menu || G.mode !== 'full'); }
  else spot.classList.remove('on');
  let x, y, side;
  if (R) {
    const cx = R.x + R.w / 2;
    if (R.y + R.h + 16 + H < 880) { side = 'b'; y = R.y + R.h + 16; x = cx - W / 2; }
    else if (R.y - 16 - H > 10) { side = 't'; y = R.y - 16 - H; x = cx - W / 2; }
    else if (R.x - 16 - W > 10) { side = 'l'; x = R.x - 16 - W; y = R.y + R.h / 2 - H / 2; }
    else { side = 'r'; x = R.x + R.w + 16; y = R.y + R.h / 2 - H / 2; }
    const ap = $('#afPop.open') || $('#menuPop.open');
    if (ap && side !== 'l' && side !== 'r') { const a = T.rr(ap); if (x < a.x + a.w && x + W > a.x) { side = 'r'; x = a.x + a.w + 16; y = Math.max(10, R.y + R.h / 2 - H / 2); if (x + W > 1590) { side = 'l'; x = a.x - W - 16; } } }
  } else { side = 'n'; x = 1600 - 364 - W - 30; y = 200; }
  x = Math.max(10, Math.min(1600 - W - 10, x)); y = Math.max(10, Math.min(900 - H - 10, y));
  tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.classList.add('on');
  const ar = $('#carr');
  if (side === 'b' || side === 't') { const ax = Math.max(16, Math.min(W - 30, R.x + R.w / 2 - x - 7)); Object.assign(ar.style, { display: 'block', left: ax + 'px', top: side === 'b' ? '-7px' : (H - 7) + 'px', transform: `rotate(${side === 'b' ? 45 : 225}deg)` }); }
  else if (side === 'l' || side === 'r') { const ay = Math.max(14, Math.min(H - 28, R.y + R.h / 2 - y - 7)); Object.assign(ar.style, { display: 'block', top: ay + 'px', left: side === 'r' ? '-7px' : (W - 7) + 'px', transform: `rotate(${side === 'r' ? -45 : 135}deg)` }); }
  else ar.style.display = 'none';
}
function stepRect(s) {
  try {
    if (s.rect) return s.rect();
    if (s.cell) { const c = s.cell(); return c ? cellRect(c[0], c[1]) : null; }
    if (s.el) { const e = typeof s.el === 'function' ? s.el() : $(s.el); return e ? elR(e) : null; }
  } catch (e) { /* ignore */ }
  return null;
}
function placeNow() {
  const on = T.started && !G.finished;
  let show = false;
  colNums();
  if (on && G.mode === 'full' && G.hints && G.steps[G.i]) {
    const s = G.steps[G.i], st = G.stages[s.stage];
    const tp = typeof s.tip === 'function' ? s.tip() : s.tip, wy = typeof s.why === 'function' ? s.why() : s.why;
    const html = `<div class="ta">${tp}</div>` + (wy ? `<div class="tw">${wy}</div>` : '');
    if (G.collapsed && !s.info) { pill(`Шаг ${G.i + 1}: ${strip(tp).slice(0, 46)}${strip(tp).length > 46 ? '…' : ''}`, stepRect(s)); show = false; coach.classList.remove('off'); tip.classList.remove('on'); quiet(); return; }
    card({ stage: st ? st.t : '', num: `шаг ${G.i + 1} из ${G.steps.length}`, html, R: stepRect(s), showBtn: !s.info, nextBtn: !!s.info, final: s.final });
    sayCard(s.voice || tp + ' ' + (wy || ''));
    show = true;
  } else if (on && G.mode !== 'full' && G.stages[G.si]) {
    const st = G.stages[G.si];
    const vis = (G.mode === 'stage' && !G.cardOff) || G.tier > 0;
    if (vis) {
      const t = G.mode === 'stage' ? 2 : G.tier;
      const html = t === 1 ? `💡 ${st.h1}` : st.h2;
      let R = null; if (t >= 2) { try { R = st.anchor && st.anchor(); } catch (e) { R = null; } }
      card({ stage: st.t, num: `этап ${G.si + 1} из ${G.stages.length}`, html, R, showBtn: G.mode === 'stage' || t >= 2, showLabel: 'Показать этап ▶', gold: G.mode !== 'stage' });
      sayCard(t >= 2 && st.voice || html);
      show = true;
    }
  }
  if (!show && on) quiet();
  coach.classList.toggle('off', !show);
  $('#cpill').classList.remove('on');
  if (!show) { spot.classList.remove('on'); tip.classList.remove('on'); }
  if (curIssue) { const R = issueRect(curIssue); if (R) Object.assign(ering.style, { left: (R.x - 2) + 'px', top: (R.y - 2) + 'px', width: (R.w + 4) + 'px', height: (R.h + 4) + 'px' }); }
}
let lastSay = '', voQ = null, voiceRun = 0;
function quiet() { voiceRun++; if (window.VO) VO.stop(); lastSay = ''; voQ = null; }
function warmCards() {
  if (!window.VO) return;
  const text = v => typeof v === 'function' ? v() : v || '';
  const future = G.mode === 'full'
    ? G.steps.slice(G.i + 1, G.i + 4).map(s => s.voice || text(s.tip) + ' ' + text(s.why))
    : G.stages.slice(G.si + 1, G.si + 4).map(s => s.voice || s.h2 || s.h1);
  VO.preload(future);
}
/* реплика карточки ждёт, пока договорит похвала / итог */
function playCard(t) {
  if (!voQ) { VO.play(t); warmCards(); return; }
  const w = voQ, generation = voiceRun;
  VO.preload([t]);
  w.then(() => { if (generation !== voiceRun || lastSay !== t || !T.started || G.auto) return; if (voQ && voQ !== w) playCard(t); else { VO.play(t); warmCards(); } });
}
function sayCard(text) { if (!window.VO || !T.started || G.auto) return; const t = VO.plain(text); if (t === lastSay) return; lastSay = t; if (VO.has(t)) playCard(t); }
function sayNow(text) {
  if (!window.VO || G.auto || !VO.has(text)) return 0;
  const p = VO.play(text); if (!p.done) return 0;
  const d = p.done; voQ = d; d.then(() => { if (voQ === d) voQ = null; });
  return p.dur;
}
/* похвала после действия и итог этапа */
const PRAISE = ['Отлично!', 'Супер!', 'Хорошо!', 'Окей!', 'Есть!', 'Класс!', 'Верно!', 'Так держать!', 'Молодец!', 'Точно!'];
const OOPS = 'Упс, тут что-то не то. Вернёмся на шаг назад.';
let lastPraise = '', praiseGap = 0, praiseT = 0, oopsAt = 0;
function praisePop(html, kind, ms) {
  const el = $('#praise'); if (!el) return;
  clearTimeout(praiseT);
  el.className = 'praise'; void el.offsetWidth;
  el.innerHTML = `<i>${kind === 'oops' ? '↩' : '✓'}</i><span>${html}</span>`;
  el.classList.add('on', kind);
  praiseT = setTimeout(() => { el.classList.remove('on'); el.classList.add('off'); }, ms);
}
function stepPraise() {
  let w; do { w = PRAISE[Math.floor(Math.random() * PRAISE.length)]; } while (w === lastPraise); lastPraise = w;
  const el = $('#cpr'); if (el) { el.classList.remove('on'); void el.offsetWidth; el.innerHTML = `<i>✓</i>${w}`; el.classList.add('on'); }
  if (++praiseGap >= 2 + (Math.random() < 0.5 ? 1 : 0)) { praiseGap = 0; sayNow(w); }
}
function stageDone(i) {
  const st = G.stages[i]; if (!st || !st.recap || G.praised.has(i)) return;
  G.praised.add(i); praiseGap = 0;
  const t = st.recap, m = /^(.+?[!.])\s+(.*)$/.exec(t);
  const html = m ? `<b>${m[1]}</b> ${m[2]}` : `<b>${t}</b>`;
  praisePop(html, 'recap', 3600);
  const d = sayNow(t);
  if (d && d.then) d.then(sec => { if ($('#praise').classList.contains('recap')) { clearTimeout(praiseT); praiseT = setTimeout(() => { const el = $('#praise'); el.classList.remove('on'); el.classList.add('off'); }, Math.max(3000, sec * 1000 + 700)); } });
}
function oops() {
  if (Date.now() - oopsAt < 4000) return; oopsAt = Date.now(); praiseGap = 0;
  praisePop(OOPS, 'oops', 2600); sayNow(OOPS);
}
function pill(text, R) {
  const p = $('#cpill'); $('span', p).textContent = text; p.classList.add('on');
  if (R) { Object.assign(spot.style, { left: (R.x - 4) + 'px', top: (R.y - 4) + 'px', width: (R.w + 8) + 'px', height: (R.h + 8) + 'px' }); spot.classList.add('on'); } else spot.classList.remove('on');
}
function colNums() {
  const box = $('#colnums'); let h = '';
  if (T.started && T.edit && T.edit.text.startsWith('=') && T.WB.cur !== T.edit.si) {
    const nm = T.S().name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\$?'?${nm}'?\\.\\$?([A-Za-z]+)(?:\\$?\\d+)?:\\$?([A-Za-z]+)`, 'gi'); let m, last = null;
    while ((m = re.exec(T.edit.text))) last = m;
    if (last) {
      const c1 = T.CIDX(last[1]), c2 = T.CIDX(last[2]), st = G.mode === 'full' ? G.steps[G.i] : null, need = st && st.idxStep ? st.idxStep : 0;
      for (let c = c1; c <= Math.min(c2, c1 + 12); c++) { const R = colsRect(c, c); if (R.x + R.w < 50 || R.x > 1230) continue; h += `<i class="${need === c - c1 + 1 ? 'need' : ''}" style="left:${R.x + R.w / 2 + 10}px;top:${R.y + 1}px">${c - c1 + 1}</i>`; }
      const RL = colsRect(Math.min(c2, c1 + 12), Math.min(c2, c1 + 12)); h += `<b style="left:${RL.x + RL.w + 8}px;top:${RL.y + 1}px">← номер столбца в диапазоне</b>`;
    }
  }
  if (box._h !== h) { box.innerHTML = h; box._h = h; }
}
function flashTip() { tip.classList.add('done-flash'); setTimeout(() => tip.classList.remove('done-flash'), 450); }
let chkT = 0;
T.onChange = () => { setTimeout(() => progress(), 0); clearTimeout(chkT); chkT = setTimeout(runChecker, 450); };
T.onRender = () => place();
T.onUndo = () => {
  if (G.spec) syncLookupColumns(G.spec);
  if (G.mode !== 'full') return;
  let i = 0;
  while (i < G.steps.length && i < G.i) { const s = G.steps[i]; if (s.final) break; if (s.info || s.done()) { i++; continue; } break; }
  if (i < G.i) { G.i = i; renderStages(); enterStep(); place(); }
};

/* =============================== show / hints / autoplay =============================== */
async function showStep() {
  const s = G.steps[G.i]; if (!s || G.busy) return;
  if (s.info) { next(); return; }
  G.busy = true; G.shows++; place();
  try { await s.act(); } catch (e) { console.warn(e); }
  await wait(220); G.busy = false; cur.style.display = G.auto ? 'block' : 'none'; progress(); runChecker();
}
async function runStage(st) {
  let guard = 0;
  while (!st.goal() && guard++ < 40 && G.busy) {
    let s = null;
    for (const x of st.s) { if (x.info || x.hidden && x.done()) continue; if (!x.done()) { s = x; break; } }
    if (!s) break;
    try { await s.act(); } catch (e) { console.warn(e); break; }
    await wait(180);
  }
}
async function showStage() {
  const st = G.stages[G.si]; if (!st || G.busy) return;
  G.cardOff = false;
  G.busy = true; G.cost += G.mode === 'stage' ? 1 : 2; G.shows++; hideNudge(); place();
  if (T.edit) T.cancelEdit(); T.closePops();
  await runStage(st);
  await wait(200); G.busy = false; cur.style.display = 'none'; progress(); runChecker();
}
function askHint() {
  if (G.busy) return;
  hideNudge();
  if (G.tier < 2) { G.tier++; if (!(G.mode === 'plan' && G.tier === 1)) G.cost++; updHintBtn(); place(); }
  else showStage();
}
$('#ctShow').addEventListener('click', () => { if (G.mode === 'full') showStep(); else showStage(); });
$('#ctNext').addEventListener('click', () => next());
$('#ctMin').addEventListener('click', () => { G.collapsed = true; place(); });
$('#cpill').addEventListener('click', () => { G.collapsed = false; place(); });
$('#ctClose').addEventListener('click', () => {
  if (G.mode === 'full') { G.hints = false; buildHintCtl(); T.toast('Подсказки скрыты — вернуть можно справа'); }
  else if (G.mode === 'stage') { G.cardOff = true; T.toast('Карточка скрыта до следующего этапа'); }
  else { G.tier = 0; updHintBtn(); }
  place();
});
async function autoplay() {
  if (G.auto) { G.auto = false; $('#bAuto').textContent = '⏩ Решить за меня'; return; }
  quiet();
  G.auto = true; G.watched = true; $('#bAuto').textContent = '⏸ Остановить';
  let stuck = 0;
  while (G.auto && G.i < G.steps.length) {
    const s = G.steps[G.i], before = G.i;
    if (s.final) break;
    if (s.info) { await wait(800); next(); continue; }
    await showStep();
    await wait(160); progress();
    if (G.i === before) { if (++stuck > 2) { T.toast('Автопоказ остановлен: таблица отличается от ожидаемой. Нажми «Заново».', 4000); break; } } else stuck = 0;
  }
  G.auto = false; cur.style.display = 'none'; const b = $('#bAuto'); if (b) b.textContent = '⏩ Решить за меня'; place();
}
async function autoStages() { // для проверки и «решить за меня» на уровнях 2–4
  G.watched = true;
  while (G.si < G.stages.length && !G.finished) {
    const before = G.si; G.busy = true;
    await runStage(G.stages[G.si]); G.busy = false; await wait(200); progress();
    if (G.si === before) return false;
  }
  return true;
}

/* =============================== stuck nudges =============================== */
const nudge = $('#nudge');
function hideNudge() { nudge.classList.remove('on'); const b = $('#bHint') || $('#bShowStage'); if (b) b.classList.remove('pulse', 'hintbtn-p'); }
setInterval(() => {
  if (!G.spec || !T.started) return;
  const sec = Math.floor(((G.tEnd || Date.now()) - G.t0) / 1000);
  $('#timer').textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  if (G.finished || G.busy || G.auto) return;
  const idle = (Date.now() - G.lastProg) / 1000, lim = { full: 999, stage: 50, plan: 40, exam: 80 }[G.mode];
  if (idle > lim && !nudge.classList.contains('on') && G.tier === 0) {
    const st = G.stages[G.si];
    const btn = $('#bHint') || $('#bShowStage');
    if (btn) { btn.classList.add('pulse'); const R = T.rr(btn); nudge.style.top = (R.y - 14) + 'px'; nudge.style.right = (1600 - R.x + 14) + 'px'; }
    $('#nudgeTxt').innerHTML = G.mode === 'stage' ? `Застрял на этапе «${st ? st.t : ''}»? Карточка подсказки — над таблицей, а «Показать этап» сделает его за тебя.` : `Застрял на этапе ${G.si + 1}? Возьми намёк — ${G.mode === 'plan' ? 'первый бесплатно' : 'он стоит звезду'}.`;
    $('#nudgeBtn').textContent = G.mode === 'stage' ? 'Показать этап' : 'Намёк';
    nudge.classList.add('on'); G.lastProg = Date.now();
  }
}, 1000);
$('#nudgeBtn').addEventListener('click', () => { hideNudge(); if (G.mode === 'stage') showStage(); else askHint(); });
$('#nudgeNo').addEventListener('click', () => { hideNudge(); G.lastProg = Date.now(); });

/* =============================== answer & results =============================== */
function checkAnswer() {
  const raw = $('#ansIn').value.trim().replace(/\s/g, '').replace(',', '.'), m = $('#ansMsg'), spec = G.spec;
  if (!raw) { m.textContent = 'Впиши число'; m.className = 'ansmsg bad'; return; }
  const v = +raw;
  if (Math.abs(v - spec.answer) < 1e-9) { m.innerHTML = `Верно! Ответ ${fmt(spec.answer)}.`; m.className = 'ansmsg ok'; G.answered = true; G.tEnd = Date.now(); progress(); setTimeout(finish, 700); return; }
  G.wrong++;
  const tr = spec.traps.find(t => Math.abs(t[0] - v) < 1e-9);
  let msg = tr ? tr[1] : 'Пока неверно. ';
  if (!tr) { const iss = diagnose() || []; msg += iss.length ? 'Проверяющий нашёл проблему — смотри внизу таблицы.' : 'Проверь фильтры и что именно считаем.'; if (iss.length) { dismissed.clear(); runChecker(); } }
  m.innerHTML = msg; m.className = 'ansmsg bad';
  const box = $('#ansIn'); box.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
}
function stars() {
  if (G.watched) return 0;
  let s = 3; const errs = [...G.errSeen.keys()].length;
  if (G.mode === 'full') { if (G.shows > 3) s--; if (errs > 3 || G.wrong > 1) s--; }
  else { if (G.cost >= 1) s--; if (G.cost >= 3) s--; if (G.wrong >= 1 || errs >= 4) s--; }
  return Math.max(1, s);
}
const PKEY = 'ion3_trainer_v2';
const loadProg = () => { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; } };
const saveProg = p => { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) {} };
function finish() {
  if (G.finished) return; quiet(); G.finished = true; G.tEnd = G.tEnd || Date.now(); place(); hideIssue(); hideNudge();
  const st = stars(), p = loadProg(); if (!p[G.lv] || st > p[G.lv]) p[G.lv] = st; saveProg(p);
  const sec = Math.floor((G.tEnd - G.t0) / 1000), tm = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  $$('#rStars i').forEach((i, k) => i.classList.toggle('on', k < st));
  $('#rTitle').textContent = G.watched ? 'Решение показано' : `Уровень ${G.lv} пройден!`;
  const fixed = [...G.errSeen.values()].filter(e => e.fixed).length;
  $('#rSub').innerHTML = G.watched ? 'Теперь попробуй сам — звёзды дают только за самостоятельное решение.' : (st === 3 ? 'Идеально: без лишних подсказок и ошибок.' : st === 2 ? 'Хорошо! Ещё раз — и будет три звезды.' : 'Пройдено. Попробуй ещё раз с меньшим числом подсказок.') + (G.lv < 4 ? `<br>Дальше: уровень ${G.lv + 1} — ${LEVELS[G.lv].modeName.toLowerCase()}.` : '<br>Это был финальный уровень — ты готов к заданию 3.');
  $('#rStats').innerHTML = `<div><b>${tm}</b><span>время</span></div><div><b>${G.mode === 'full' ? G.shows : G.cost}</b><span>${G.mode === 'full' ? 'показов' : 'подсказок'}</span></div><div><b>${fixed}</b><span>ошибок исправлено</span></div><div><b>${G.wrong}</b><span>неверных ответов</span></div>`;
  $('#rNext').style.display = G.lv < 4 ? '' : 'none';
  $('#resOv').classList.add('on'); celebrate(st);
}
function celebrate(st) {
  const cols = ['#B9521D', '#FFD8BE', '#2F855A', '#2B6CB0', '#6B46C1', '#18A303', '#F2B705'];
  for (let i = 0; i < 40 + st * 30; i++) {
    const d = document.createElement('div'); d.style.cssText = `position:absolute;z-index:99;top:-14px;left:${Math.random() * 1600}px;width:9px;height:13px;border-radius:2px;background:${cols[i % cols.length]};pointer-events:none`;
    $('#stage').appendChild(d);
    d.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${(Math.random() - .5) * 300}px, ${940 + Math.random() * 100}px) rotate(${Math.random() * 720}deg)` }], { duration: 1900 + Math.random() * 1300, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 400 }).onfinish = () => d.remove();
  }
}
$('#rNext').addEventListener('click', () => { $('#resOv').classList.remove('on'); startLevel(G.lv + 1); });
$('#rAgain').addEventListener('click', () => { $('#resOv').classList.remove('on'); startLevel(G.lv, { skipIntro: true }); });
$('#rMap').addEventListener('click', () => { $('#resOv').classList.remove('on'); openMap(); });
$('#ansBtn').addEventListener('click', checkAnswer);
$('#ansIn').addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(); });

/* =============================== campaign map =============================== */
const qShort = q => q.replace(/^Используя информацию из приведённой базы данных, определите,?\s*/, '').replace(/\s*В ответе запишите только число\.$/, '');
function openMap() {
  quiet(); T.started = false; G.finished = true; place(); hideIssue(); hideNudge();
  if (window.TI) window.TI.close();
  const p = loadProg(); let rec = 1; for (let i = 1; i <= 4; i++) { if (!p[i]) { rec = i; break; } rec = Math.min(4, i + 1); }
  $('#lvls').innerHTML = LEVELS.map(l => `<button class="mlv${l.n === rec ? ' rec' : ''}${p[l.n] ? ' passed' : ''}" data-n="${l.n}" style="--d:${l.n * 70}ms">
      
      <span class="mlv-top"><span class="mlv-n">${l.n}</span>${p[l.n] ? '<span class="mlv-tag ok">Пройден</span>' : ''}</span>
      <span class="mlv-mode">${['С подсказками', 'По этапам', 'По плану', 'Самостоятельно'][l.n - 1]}</span>
      <span class="mlv-task"><b>${l.task}</b>${l.taskSub}</span>
    </button>`).join('');
  $$('#lvls .mlv').forEach(c => {
    c.addEventListener('click', () => startLevel(+c.dataset.n));
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); });
  });
  $('#mpGoT').textContent = p[1] ? `Продолжить: уровень ${rec}` : 'Начать с уровня 1';
  $('#mpGo').onclick = () => startLevel(rec);
  const sm = $('#startOv'); sm.classList.remove('hide'); sm.classList.remove('play'); void sm.offsetWidth; sm.classList.add('play');
}
function begin() { G.t0 = Date.now(); G.tEnd = 0; G.lastProg = Date.now(); T.started = true; G.finished = false; renderStages(); progress(true); place(); }
function startLevel(n, opt = {}) {
  quiet();
  $('#startOv').classList.add('hide');
  load(n); T.started = false; place();
  if (opt.skipIntro || !window.TI) { begin(); return; }
  window.TI.open(n);
}
$('#toMap').addEventListener('click', () => openMap());
$('#bTask').addEventListener('click', () => { if (window.TI && G.lv) window.TI.open(G.lv, { only: 'task' }); });

/* =============================== boot =============================== */
const qs = new URLSearchParams(location.search);
const lvq = +(qs.get('lv') || (qs.get('task') === 'demo' ? 4 : 0));
if (window.VO) VO.mount($('#tVol'));
window.TG = { G, LEVELS, GROUPS, GROUP_SUB, load, begin, startLevel, openMap, progress, place, showStep, showStage, autoplay, autoStages, next, diagnose, runChecker, askHint, checkAnswer, finish, qShort, PRAISE, OOPS };
window.TG.ready = () => {
if (qs.has('go')) startLevel(lvq >= 1 && lvq <= 4 ? lvq : 1, { skipIntro: true });
else if (qs.has('intro')) setTimeout(() => startLevel(+qs.get('intro') || 1), 0);
else openMap();
};
})();
