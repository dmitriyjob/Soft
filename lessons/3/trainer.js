/* Тренажёр «Задание 3» — интерфейс LibreOffice Calc: ядро таблицы, формулы, автофильтр, буфер обмена */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const stage = $('#stage');
let K = 1;
function fit() { K = Math.min(innerWidth / 1600, Math.max(1, innerHeight - 60) / 900); stage.style.transform = `translate(-50%,-50%) scale(${K})`; }
addEventListener('resize', () => { fit(); render(); }); fit();
const realK = () => stage.getBoundingClientRect().width / 1600 || K;
function rr(el) { const a = el.getBoundingClientRect(), s = stage.getBoundingClientRect(), k = realK(); return { x: (a.left - s.left) / k, y: (a.top - s.top) / k, w: a.width / k, h: a.height / k }; }

/* ============================ helpers ============================ */
const LET = i => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
const CIDX = s => { let n = 0; for (const ch of s.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
const addr = (r, c) => LET(c) + (r + 1);
const RH = 21, NCOL = 30, DEFW = 86;
const isErr = v => typeof v === 'string' && /^(#Н\/Д|#ИМЯ\?|#ЗНАЧ!|#ССЫЛКА!|#ДЕЛ\/0!|Ошибка:\d+)$/.test(v);
const fmtNum = n => { if (!isFinite(n)) return '#ЗНАЧ!'; const r = Math.round(n * 1e10) / 1e10; return String(r).replace('.', ','); };
const sheetRef = name => /^[A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё_]*$/.test(name) ? name : `'${name}'`;
const toast = (msg, ms = 2400) => { const t = $('#toast'); t.innerHTML = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), ms); };
const dparse = s => { const m = /^(\d\d)\.(\d\d)\.(\d{4})$/.exec(s); return m ? +m[3] * 10000 + +m[2] * 100 + +m[1] : null; };
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

/* ============================ workbook ============================ */
const WB = { sheets: [], cur: 0, task: 'lesson', ver: 0 };
function mkSheet(name, rows, widths, dateCols = []) {
  return { name, v: rows.map(r => r.slice()), f: [], cv: [], w: widths.slice(), dateCols, af: null, act: { r: 0, c: 0 }, sel: { r1: 0, c1: 0, r2: 0, c2: 0, mode: 'cell' }, sx: 0, sy: 0, ver: 0 };
}
function buildBook(task) {
  const D = task === 'demo' ? window.DB_31500 : window.DB_LESSON;
  const mvName = task === 'demo' ? 'Движение_товаров' : 'Движение товаров';
  const mv = [['ID операции', 'Дата', 'ID магазина', 'Артикул', 'Количество упаковок, шт.', 'Тип операции']].concat(
    D.mv.map(m => [m[0], D.dates[m[1]], m[2], m[3], m[4], m[5] ? 'Продажа' : 'Поступление']));
  const pr = [['Артикул', 'Отдел', 'Наименование товара', 'Ед_изм', 'Количество в упаковке', 'Цена за упаковку']].concat(D.prods.map(p => p.slice()));
  const sh = [['ID магазина', 'Район', 'Адрес']].concat(D.shops.map(s => s.slice()));
  const mvW = [96, 92, 104, 76, 178, 118, 150, 236, 150, 120, 110];
  WB.sheets = [mkSheet(mvName, mv, mvW, [1]), mkSheet('Товар', pr, [76, 150, 250, 70, 168, 140]), mkSheet('Магазин', sh, [104, 140, 190])];
  WB.cur = 0; WB.task = task; WB.base = 3; WB.undo = []; clip = null; edit = null;
  $('#docName').textContent = task === 'demo' ? 'ЕГЭ 2027 демо — задание 3.ods' : 'Задание 3.ods';
  recalc();
}
const S = () => WB.sheets[WB.cur];
const nrows = sh => sh.v.length;
const ncols = sh => sh.v.reduce((m, r) => Math.max(m, r.length), 0);
const raw = (sh, r, c) => { const row = sh.v[r]; const x = row ? row[c] : undefined; return x === undefined || x === null ? '' : x; };
const fx = (sh, r, c) => (sh.f[r] && sh.f[r][c]) || null;
function setCell(sh, r, c, value, formula) {
  while (sh.v.length <= r) sh.v.push([]);
  sh.v[r][c] = formula ? '' : value;
  if (formula) { (sh.f[r] = sh.f[r] || [])[c] = formula; } else if (sh.f[r]) delete sh.f[r][c];
  sh.ver++;
}
function trimSheet(sh) { while (sh.v.length > 1 && sh.v[sh.v.length - 1].every((x, c) => (x === '' || x === undefined) && !fx(sh, sh.v.length - 1, c))) sh.v.pop(); }

/* ============================ formula engine ============================ */
const REF_RE = /^(\$?(?:'[^']+'|[A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё_]*)\.)?(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?|\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3})(?![\wА-Яа-яЁё(.])/;
function tokenize(src) {
  const T = []; let i = 0;
  while (i < src.length) {
    const ch = src[i], rest = src.slice(i);
    if (/\s/.test(ch)) { i++; continue; }
    let m;
    if ((m = /^"((?:[^"]|"")*)"/.exec(rest))) { T.push({ t: 'str', v: m[1].replace(/""/g, '"') }); i += m[0].length; continue; }
    if ((m = REF_RE.exec(rest))) { T.push({ t: 'ref', sheet: m[1] ? m[1].replace(/^\$/, '').replace(/\.$/, '').replace(/^'|'$/g, '') : null, a: m[2] }); i += m[0].length; continue; }
    if ((m = /^\d+(?:[.,]\d+)?/.exec(rest))) { T.push({ t: 'num', v: parseFloat(m[0].replace(',', '.')) }); i += m[0].length; continue; }
    if ((m = /^([A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё_.]*)\s*\(/.exec(rest))) { T.push({ t: 'fn', v: m[1].toUpperCase() }); i += m[0].length; continue; }
    if ((m = /^[A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё_]*/.exec(rest))) { T.push({ t: 'name', v: m[0] }); i += m[0].length; continue; }
    if ((m = /^(<>|<=|>=|[-+*/&^=<>();,:])/.exec(rest))) { T.push({ t: 'op', v: m[0] === ',' ? ';' : m[0] }); i += m[0].length; continue; }
    throw 'Ошибка:509';
  }
  return T;
}
function parse(src) {
  const T = tokenize(src); let p = 0;
  const peek = () => T[p], take = () => T[p++];
  const isOp = v => peek() && peek().t === 'op' && peek().v === v;
  function expr() { let a = cmp(); return a; }
  function cmp() { let a = cat(); while (peek() && peek().t === 'op' && ['=', '<', '>', '<=', '>=', '<>'].includes(peek().v)) { const o = take().v; a = { k: 'bin', o, a, b: cat() }; } return a; }
  function cat() { let a = add(); while (isOp('&')) { take(); a = { k: 'bin', o: '&', a, b: add() }; } return a; }
  function add() { let a = mul(); while (isOp('+') || isOp('-')) { const o = take().v; a = { k: 'bin', o, a, b: mul() }; } return a; }
  function mul() { let a = pw(); while (isOp('*') || isOp('/')) { const o = take().v; a = { k: 'bin', o, a, b: pw() }; } return a; }
  function pw() { let a = un(); while (isOp('^')) { take(); a = { k: 'bin', o: '^', a, b: un() }; } return a; }
  function un() { if (isOp('-')) { take(); return { k: 'neg', a: un() }; } if (isOp('+')) { take(); return un(); } return atom(); }
  function atom() {
    const t = take(); if (!t) throw 'Ошибка:511';
    if (t.t === 'num') return { k: 'num', v: t.v };
    if (t.t === 'str') return { k: 'str', v: t.v };
    if (t.t === 'ref') return { k: 'ref', sheet: t.sheet, a: t.a };
    if (t.t === 'name') { const u = t.v.toUpperCase(); if (u === 'ИСТИНА' || u === 'TRUE') return { k: 'num', v: 1 }; if (u === 'ЛОЖЬ' || u === 'FALSE') return { k: 'num', v: 0 }; return { k: 'name', v: t.v }; }
    if (t.t === 'fn') {
      const args = [];
      if (isOp(')')) { take(); return { k: 'fn', v: t.v, args }; }
      for (;;) {
        if (isOp(';')) { args.push({ k: 'empty' }); take(); continue; }
        args.push(expr());
        if (isOp(';')) { take(); if (isOp(')')) { args.push({ k: 'empty' }); } continue; }
        if (isOp(')')) { take(); break; }
        throw peek() ? 'Ошибка:509' : 'Ошибка:508';
      }
      return { k: 'fn', v: t.v, args };
    }
    if (t.t === 'op' && t.v === '(') { const e = expr(); if (!isOp(')')) throw 'Ошибка:508'; take(); return e; }
    throw 'Ошибка:509';
  }
  const e = expr(); if (p < T.length) throw (T[p].v === ')' ? 'Ошибка:508' : 'Ошибка:509');
  return e;
}
const CACHE = new Map();
function compile(f) { let a = CACHE.get(f); if (!a) { try { a = parse(f.slice(1)); } catch (e) { a = { k: 'err', v: typeof e === 'string' ? e : 'Ошибка:509' }; } CACHE.set(f, a); } return a; }
function sheetByName(n) { if (n === null) return null; const L = n.toLowerCase(); return WB.sheets.findIndex(s => s.name.toLowerCase() === L); }
function parseA1(a, sh) {
  const s = a.replace(/\$/g, '').toUpperCase();
  let m = /^([A-Z]{1,3})(\d+)(?::([A-Z]{1,3})(\d+))?$/.exec(s);
  if (m) { const r1 = +m[2] - 1, c1 = CIDX(m[1]), r2 = m[3] ? +m[4] - 1 : r1, c2 = m[3] ? CIDX(m[3]) : c1; return { r1: Math.min(r1, r2), c1: Math.min(c1, c2), r2: Math.max(r1, r2), c2: Math.max(c1, c2), single: !m[3] }; }
  m = /^([A-Z]{1,3}):([A-Z]{1,3})$/.exec(s);
  if (m) { const c1 = CIDX(m[1]), c2 = CIDX(m[2]); return { r1: 0, c1: Math.min(c1, c2), r2: Math.max(0, nrows(sh) - 1), c2: Math.max(c1, c2), cols: true }; }
  return null;
}
class Rng { constructor(si, g) { this.si = si; Object.assign(this, g); } }
let GEN = 0;
function val(si, r, c) {
  const sh = WB.sheets[si], f = fx(sh, r, c);
  if (!f) return raw(sh, r, c);
  const cv = sh.cv[r] || (sh.cv[r] = []);
  const e = cv[c];
  if (e && e.g === GEN) return e.busy ? 'Ошибка:522' : e.v;
  cv[c] = { g: GEN, busy: true };
  let v; try { v = ev(compile(f), si); } catch (x) { v = typeof x === 'string' ? x : '#ЗНАЧ!'; }
  if (v instanceof Rng) v = v.single ? val(v.si, v.r1, v.c1) : '#ЗНАЧ!';
  if (v === undefined || v === null) v = '';
  cv[c] = { g: GEN, v };
  return v;
}
const num = x => { if (x instanceof Rng) x = x.single ? val(x.si, x.r1, x.c1) : (() => { throw '#ЗНАЧ!'; })(); if (isErr(x)) throw x; if (x === '') return 0; if (typeof x === 'number') return x; throw '#ЗНАЧ!'; };
const scal = x => { if (x instanceof Rng) { if (!x.single) throw '#ЗНАЧ!'; x = val(x.si, x.r1, x.c1); } if (isErr(x)) throw x; return x; };
function eqv(a, b) { if (typeof a === 'number' && typeof b === 'number') return a === b; if (typeof a === 'string' && typeof b === 'string') return a.toLowerCase() === b.toLowerCase(); return false; }
function* cellsOf(x, visibleOnly) {
  if (x instanceof Rng) { const sh = WB.sheets[x.si], vis = visibleOnly ? visSet(sh) : null; for (let r = x.r1; r <= Math.min(x.r2, nrows(sh) - 1); r++) { if (vis && r > 0 && !vis.has(r)) continue; for (let c = x.c1; c <= x.c2; c++) yield val(x.si, r, c); } }
  else yield x;
}
const FN = {
  'ВПР': (a, si) => vlookup(a, si), 'VLOOKUP': (a, si) => vlookup(a, si),
  'СУММ': (a, si) => sumOf(a, si, false), 'SUM': (a, si) => sumOf(a, si, false),
  'ПРОМЕЖУТОЧНЫЕ.ИТОГИ': (a, si) => subtotal(a, si), 'SUBTOTAL': (a, si) => subtotal(a, si),
  'СЧЁТ': (a, si) => { let n = 0; a.forEach(x => { for (const v of cellsOf(ev(x, si))) if (typeof v === 'number') n++; }); return n; },
  'СРЗНАЧ': (a, si) => { let s = 0, n = 0; a.forEach(x => { for (const v of cellsOf(ev(x, si))) if (typeof v === 'number') { s += v; n++; } }); if (!n) throw '#ДЕЛ/0!'; return s / n; },
  'ОКРУГЛ': (a, si) => { const x = num(ev(a[0], si)), d = a[1] ? num(ev(a[1], si)) : 0; const k = Math.pow(10, d); return Math.round(x * k) / k; },
  'ЦЕЛОЕ': (a, si) => Math.floor(num(ev(a[0], si)))
};
FN['СЧЕТ'] = FN['СЧЁТ'];
function sumOf(args, si, visOnly) { let s = 0; args.forEach(x => { const v0 = ev(x, si); for (const v of cellsOf(v0, visOnly)) { if (isErr(v)) throw v; if (typeof v === 'number') s += v; } }); return s; }
function subtotal(args, si) {
  const k = num(ev(args[0], si)) % 100, rest = args.slice(1);
  if (k === 9) return sumOf(rest, si, true);
  let s = 0, n = 0, m = 0; rest.forEach(x => { for (const v of cellsOf(ev(x, si), true)) { if (v !== '') m++; if (typeof v === 'number') { s += v; n++; } } });
  if (k === 1) { if (!n) throw '#ДЕЛ/0!'; return s / n; } if (k === 2) return n; if (k === 3) return m; throw '#ЗНАЧ!';
}
function vlookup(a, si) {
  if (a.length < 3) throw 'Ошибка:511';
  const key = scal(ev(a[0], si)), R = ev(a[1], si);
  if (!(R instanceof Rng)) throw '#ЗНАЧ!';
  const n = num(ev(a[2], si)); const idx = Math.floor(n);
  if (idx < 1) throw '#ЗНАЧ!'; if (idx > R.c2 - R.c1 + 1) throw '#ССЫЛКА!';
  const exact = a[3] && a[3].k !== 'empty' ? num(ev(a[3], si)) === 0 : false;
  const sh = WB.sheets[R.si], last = Math.min(R.r2, nrows(sh) - 1);
  if (exact) { for (let r = R.r1; r <= last; r++) if (eqv(val(R.si, r, R.c1), key)) return val(R.si, r, R.c1 + idx - 1); throw '#Н/Д'; }
  let hit = -1; for (let r = R.r1; r <= last; r++) { const v = val(R.si, r, R.c1); if (typeof v !== typeof key) continue; if (v <= key) hit = r; else break; }
  if (hit < 0) throw '#Н/Д'; return val(R.si, hit, R.c1 + idx - 1);
}
function ev(n, si) {
  switch (n.k) {
    case 'num': case 'str': return n.v;
    case 'empty': return '';
    case 'err': throw n.v;
    case 'name': throw '#ИМЯ?';
    case 'neg': return -num(ev(n.a, si));
    case 'ref': {
      const tsi = n.sheet === null ? si : sheetByName(n.sheet); if (tsi < 0) throw '#ССЫЛКА!';
      const g = parseA1(n.a, WB.sheets[tsi]); if (!g) throw '#ССЫЛКА!';
      if (g.single) return new Rng(tsi, g);
      return new Rng(tsi, g);
    }
    case 'bin': {
      if (n.o === '&') return String(scal(ev(n.a, si))) + String(scal(ev(n.b, si)));
      if (['=', '<', '>', '<=', '>=', '<>'].includes(n.o)) { const x = scal(ev(n.a, si)), y = scal(ev(n.b, si)); const r = { '=': eqv(x, y), '<>': !eqv(x, y), '<': x < y, '>': x > y, '<=': x <= y, '>=': x >= y }[n.o]; return r ? 1 : 0; }
      const x = num(ev(n.a, si)), y = num(ev(n.b, si));
      if (n.o === '+') return x + y; if (n.o === '-') return x - y; if (n.o === '*') return x * y; if (n.o === '^') return Math.pow(x, y);
      if (n.o === '/') { if (y === 0) throw '#ДЕЛ/0!'; return x / y; }
    }
    // falls through
    case 'fn': { const f = FN[n.v]; if (!f) throw '#ИМЯ?'; return f(n.args, si); }
  }
  throw '#ЗНАЧ!';
}
function recalc() { GEN++; WB.sheets.forEach((sh, si) => { sh.f.forEach((row, r) => { if (row) row.forEach((f, c) => { if (f) val(si, r, c); }); }); sh.ver++; }); WB.ver++; }
function shown(sh, r, c) {
  const si = WB.sheets.indexOf(sh);
  const v = fx(sh, r, c) ? val(si, r, c) : raw(sh, r, c);
  return v;
}
const disp = v => typeof v === 'number' ? fmtNum(v) : String(v);
/* shift relative row refs when filling */
function shiftFormula(f, dr) {
  let out = '', i = 0;
  while (i < f.length) {
    if (f[i] === '"') { const j = f.indexOf('"', i + 1); const e = j < 0 ? f.length : j + 1; out += f.slice(i, e); i = e; continue; }
    const prev = i ? f[i - 1] : '';
    const m = /^(\$?(?:'[^']+'|[A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё_]*)\.)?(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?|\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3})(?![\wА-Яа-яЁё(.])/.exec(f.slice(i));
    if (m && !/[\wА-Яа-яЁё]/.test(prev)) {
      out += (m[1] || '') + m[2].replace(/(\$?[A-Za-z]{1,3})(\$?)(\d+)/g, (_, col, d, row) => col + d + (d ? row : Math.max(1, +row + dr)));
      i += m[0].length; continue;
    }
    out += f[i]; i++;
  }
  return out;
}

/* ============================ autofilter ============================ */
function afValues(sh, c) {
  const set = new Map();
  for (let r = 1; r < nrows(sh); r++) { const d = disp(shown(sh, r, c)); if (!set.has(d)) set.set(d, shown(sh, r, c)); }
  const arr = [...set.entries()];
  const isDate = sh.dateCols.includes(c);
  arr.sort((a, b) => {
    if (isDate) return (dparse(a[0]) || 0) - (dparse(b[0]) || 0);
    if (typeof a[1] === 'number' && typeof b[1] === 'number') return a[1] - b[1];
    if (a[0] === '') return 1; if (b[0] === '') return -1;
    return a[0].localeCompare(b[0], 'ru');
  });
  return arr.map(x => x[0]);
}
function visSet(sh) {
  if (!sh.af || !Object.values(sh.af.crit).some(Boolean)) return null;
  if (sh._visV === sh.ver + ':' + WB.ver && sh._vis) return sh._vis;
  const crit = Object.entries(sh.af.crit).filter(([, s]) => s);
  const vis = new Set();
  for (let r = 1; r < nrows(sh); r++) if (crit.every(([c, s]) => s.has(disp(shown(sh, r, +c))))) vis.add(r);
  sh._vis = vis; sh._visV = sh.ver + ':' + WB.ver; return vis;
}
function dispRows(sh) {
  const key = sh.ver + ':' + WB.ver + ':' + (sh.af ? JSON.stringify(Object.keys(sh.af.crit)) : '');
  if (sh._dr && sh._drK === key) return sh._dr;
  const vis = visSet(sh), n = nrows(sh), extra = 60;
  let rows;
  if (!vis) { rows = null; sh._drLen = Math.max(n + extra, 120); }
  else { rows = [0]; for (let r = 1; r < n; r++) if (vis.has(r)) rows.push(r); for (let r = n; r < n + extra; r++) rows.push(r); sh._drLen = rows.length; }
  sh._dr = rows; sh._drK = key;
  if (rows) { sh._rmap = new Map(rows.map((r, i) => [r, i])); } else sh._rmap = null;
  return rows;
}
const drLen = sh => { dispRows(sh); return sh._drLen; };
const rowAt = (sh, di) => { const d = dispRows(sh); return d ? (di < d.length ? d[di] : d[d.length - 1] + (di - d.length + 1)) : di; };
const dIdx = (sh, r) => { const d = dispRows(sh); if (!d) return r; const m = sh._rmap.get(r); return m === undefined ? -1 : m; };
const rowVisible = (sh, r) => dIdx(sh, r) >= 0;
function afToggle() {
  const sh = S(); pushUndo();
  if (sh.af) { sh.af = null; toast('Автофильтр выключен'); }
  else { sh.af = { c1: 0, c2: Math.max(0, ncols(sh) - 1), crit: {} }; toast('Автофильтр включён: стрелки появились в заголовках'); }
  sh.ver++; render(); changed();
}
function afActiveCount(sh) { const v = visSet(sh); return v ? v.size : null; }

/* ============================ edit state ============================ */
let edit = null; // { si, r, c, text, pend:{s,e} | null, anchor }
let clip = null;
const ced = $('#ced'), fIn = $('#fInput');
const isFormulaEdit = () => edit && edit.text.startsWith('=');
function caretEl() { return document.activeElement === fIn ? fIn : ced; }
function caret() { const el = caretEl(); return el.selectionStart ?? edit.text.length; }
function pointable() {
  if (!isFormulaEdit()) return false;
  const p = caret(); if (edit.pend && p === edit.pend.e) return true;
  const before = edit.text.slice(0, p).replace(/\s+$/, '');
  return /[=(;:+\-*/&^<>,]$/.test(before);
}
function beginEdit(initial, keepCaret) {
  const sh = S();
  if (edit) return;
  const r = sh.act.r, c = sh.act.c;
  const cur = fx(sh, r, c) || disp(raw(sh, r, c));
  edit = { si: WB.cur, r, c, text: initial === undefined ? cur : initial, pend: null };
  hideAnts();
  syncEditors(true);
  render();
  if (!keepCaret) { const el = ced.style.display === 'block' ? ced : fIn; el.focus({ preventScroll: true }); const L = edit.text.length; el.setSelectionRange(L, L); }
  changed();
}
/* скрытый приёмник ввода: ловит буквы, IME и русскую раскладку, когда ячейка не редактируется */
const sink = $('#sink'); let composing = false;
function focusSink() { if (!edit && started && document.activeElement !== sink && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('.sidebar, .afpop'))) sink.focus({ preventScroll: true }); }
sink.addEventListener('compositionstart', () => { composing = true; });
sink.addEventListener('compositionend', () => { composing = false; if (sink.value && !edit) { const v = sink.value; sink.value = ''; beginEdit(v); } });
sink.addEventListener('input', () => { if (composing) return; const v = sink.value; sink.value = ''; if (!v) return; if (!edit) beginEdit(v); else { const t = edit.text + v; setEditText(t, t.length); } });
function syncEditors(force) {
  if (!edit) return;
  if (force || ced.value !== edit.text) ced.value = edit.text;
  if (force || fIn.value !== edit.text) fIn.value = edit.text;
}
function setEditText(t, caretPos) {
  edit.text = t; syncEditors();
  const el = WB.cur === edit.si && document.activeElement !== fIn ? ced : fIn;
  if (document.activeElement !== el) el.focus();
  el.setSelectionRange(caretPos, caretPos);
  render(); changed();
}
function insertRef(ref) {
  const p = caret();
  let t = edit.text, s = p;
  if (edit.pend && p === edit.pend.e) { s = edit.pend.s; t = t.slice(0, s) + t.slice(p); }
  t = t.slice(0, s) + ref + t.slice(s);
  edit.pend = { s, e: s + ref.length };
  setEditText(t, s + ref.length);
}
function refText(r1, c1, r2, c2, cols) {
  const pre = WB.cur !== edit.si ? '$' + sheetRef(S().name) + '.' : '';
  if (cols) return pre + LET(Math.min(c1, c2)) + '1:' + LET(Math.max(c1, c2)) + '1048576';
  const a = addr(Math.min(r1, r2), Math.min(c1, c2)), b = addr(Math.max(r1, r2), Math.max(c1, c2));
  return pre + (a === b ? a : a + ':' + b);
}
function toggleAbs() {
  if (!isFormulaEdit()) return;
  const t = edit.text, p = caret();
  const re = /(\$?(?:'[^']+'|[A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё_]*)\.)?(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?|\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3})(?![\wА-Яа-яЁё(.])/g;
  let m, hit = null;
  while ((m = re.exec(t))) { if (m.index <= p && p <= m.index + m[0].length) { hit = m; } if (m.index > p) break; }
  if (!hit) { toast('Поставь курсор на ссылку (например, после A:C) и нажми Shift+F4'); return; }
  const body = hit[2];
  let nb;
  if (/^\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3}$/.test(body)) nb = body.includes('$') ? body.replace(/\$/g, '') : body.replace(/(^|:)([A-Za-z]+)/g, '$1$$$2');
  else {
    const first = /^(\$?)([A-Za-z]+)(\$?)(\d+)/.exec(body); const st = (first[1] ? 2 : 0) + (first[3] ? 1 : 0); // 0 rel, 3 abs, 1 row-abs, 2 col-abs
    const next = { 0: [1, 1], 3: [0, 1], 1: [1, 0], 2: [0, 0] }[st]; // [colAbs,rowAbs]
    nb = body.replace(/\$?([A-Za-z]+)\$?(\d+)/g, (_, c, r) => (next[0] ? '$' : '') + c + (next[1] ? '$' : '') + r);
  }
  const s = hit.index + (hit[1] || '').length, nt = t.slice(0, s) + nb + t.slice(s + body.length);
  edit.pend = null;
  setEditText(nt, s + nb.length);
}
function commit(dir = 'down') {
  if (!edit) return;
  const e = edit; edit = null;
  const sh = WB.sheets[e.si]; let t = e.text;
  pushUndo();
  if (t.startsWith('=')) {
    // как в LibreOffice: недостающие закрывающие скобки дописываются
    const open = (t.match(/\(/g) || []).length - (t.match(/\)/g) || []).length;
    if (open > 0 && !/[;(]\s*$/.test(t)) t += ')'.repeat(open);
    t = t.replace(/^=\s*(впр|vlookup)\s*\(/i, m => m.toUpperCase());
    t = normRefs(t);
    setCell(sh, e.r, e.c, '', t);
  } else if (t.trim() === '') setCell(sh, e.r, e.c, '', null);
  else if (/^-?\d+([.,]\d+)?$/.test(t.trim())) setCell(sh, e.r, e.c, parseFloat(t.trim().replace(',', '.')), null);
  else setCell(sh, e.r, e.c, t, null);
  trimSheet(sh); recalc();
  WB.cur = e.si;
  const v = val(e.si, e.r, e.c);
  if (isErr(v)) setTimeout(() => toast(errHint(v, t)), 50);
  document.activeElement && document.activeElement.blur();
  setTimeout(focusSink, 0);
  if (dir === 'down') moveAct(1, 0, false); else if (dir === 'up') moveAct(-1, 0, false); else if (dir === 'right') moveAct(0, 1, false); else selectCell(e.r, e.c);
  render(); changed();
}
function normRefs(t) {
  let out = '', i = 0;
  while (i < t.length) {
    if (t[i] === '"') { const j = t.indexOf('"', i + 1); const e = j < 0 ? t.length : j + 1; out += t.slice(i, e); i = e; continue; }
    const m = /^(\$?(?:'[^']+'|[A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё_]*)\.)?(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?|\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3})(?![\wА-Яа-яЁё(.])/.exec(t.slice(i));
    if (m && !/[\wА-Яа-яЁё]/.test(i ? t[i - 1] : '')) { let pre = m[1] || ''; if (pre) { const nm = pre.replace(/^\$/, '').replace(/\.$/, '').replace(/^'|'$/g, ''); const si = sheetByName(nm); if (si >= 0) pre = (pre.startsWith('$') ? '$' : '') + sheetRef(WB.sheets[si].name) + '.'; } out += pre + m[2].toUpperCase(); i += m[0].length; continue; }
    const fm = /^([A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё_.]*)\s*\(/.exec(t.slice(i));
    if (fm && !/[\wА-Яа-яЁё]/.test(i ? t[i - 1] : '')) { out += fm[1].toUpperCase() + '('; i += fm[0].length; continue; }
    out += t[i]; i++;
  }
  return out;
}
function errHint(v, t) {
  if (/[А-Яа-яЁё]\d/.test(t.replace(/"[^"]*"/g, '').replace(/[А-Яа-яЁё_]+\./g, '').replace(/^=\s*[А-ЯЁ.]+\(/i, '')))
    return `<b>${v}</b> — похоже, ссылка набрана русскими буквами. C2, A:C пишутся латиницей`;
  if (v === '#Н/Д') return '<b>#Н/Д</b> — ВПР не нашла ключ: проверь лист, диапазон и 0 в конце';
  if (v === '#ИМЯ?') return '<b>#ИМЯ?</b> — неизвестное имя: опечатка в функции или ссылка русскими буквами';
  if (v === '#ССЫЛКА!') return '<b>#ССЫЛКА!</b> — номер столбца больше ширины диапазона или нет такого листа';
  if (/^Ошибка:50[89]/.test(v)) return `<b>${v}</b> — ошибка в записи формулы: скобки или точки с запятой`;
  return `В ячейке ошибка <b>${v}</b>`;
}
function cancelEdit() { if (!edit) return; WB.cur = edit.si; edit = null; document.activeElement && document.activeElement.blur(); setTimeout(focusSink, 0); render(); changed(); }

/* ============================ selection ============================ */
function selectCell(r, c, extend) {
  const sh = S(); r = Math.max(0, r); c = Math.max(0, Math.min(NCOL - 1, c));
  if (extend) { sh.sel = { r1: Math.min(sh.anchor.r, r), r2: Math.max(sh.anchor.r, r), c1: Math.min(sh.anchor.c, c), c2: Math.max(sh.anchor.c, c), mode: 'cell' }; sh.act = { r, c }; sh.act = { r: sh.anchor.r, c: sh.anchor.c }; }
  else { sh.act = { r, c }; sh.anchor = { r, c }; sh.sel = { r1: r, c1: c, r2: r, c2: c, mode: 'cell' }; }
  scrollIntoView(sh.act.r, sh.act.c);
}
function selectCols(c1, c2) { const sh = S(); sh.sel = { r1: 0, r2: 1048575, c1: Math.min(c1, c2), c2: Math.max(c1, c2), mode: 'cols' }; sh.act = { r: 0, c: Math.min(c1, c2) }; }
function selectRows(r1, r2) { const sh = S(); sh.sel = { r1: Math.min(r1, r2), r2: Math.max(r1, r2), c1: 0, c2: 1023, mode: 'rows' }; sh.act = { r: Math.min(r1, r2), c: 0 }; }
function selectAll() { const sh = S(); sh.sel = { r1: 0, c1: 0, r2: 1048575, c2: 1023, mode: 'all' }; sh.act = { r: 0, c: 0 }; render(); changed(); }
function moveAct(dr, dc, extend) {
  const sh = S(); let { r, c } = extend && sh.ext ? sh.ext : sh.act;
  if (dr) { let di = dIdx(sh, r); if (di < 0) di = 0; di = Math.max(0, di + dr); r = rowAt(sh, di); }
  c = Math.max(0, Math.min(NCOL - 1, c + dc));
  if (extend) { sh.ext = { r, c }; sh.sel = { r1: Math.min(sh.anchor.r, r), r2: Math.max(sh.anchor.r, r), c1: Math.min(sh.anchor.c, c), c2: Math.max(sh.anchor.c, c), mode: 'cell' }; scrollIntoView(r, c); }
  else { sh.ext = null; selectCell(r, c); }
}

/* ============================ undo / clipboard ============================ */
function snap() { return { cur: WB.cur, sheets: WB.sheets.map(s => ({ name: s.name, v: s.v.map(r => r.slice()), f: s.f.map(r => r ? r.slice() : r), w: s.w.slice(), dateCols: s.dateCols, af: s.af ? { c1: s.af.c1, c2: s.af.c2, crit: Object.fromEntries(Object.entries(s.af.crit).map(([k, v]) => [k, v ? new Set(v) : v])) } : null })) }; }
function pushUndo() { WB.undo.push(snap()); if (WB.undo.length > 40) WB.undo.shift(); }
function undo() {
  const s = WB.undo.pop(); if (!s) { toast('Нечего отменять'); return; }
  const old = WB.sheets;
  WB.sheets = s.sheets.map((x, i) => { const o = old.find(q => q.name === x.name) || {}; const sh = mkSheet(x.name, x.v, x.w, x.dateCols); sh.f = x.f; sh.af = x.af; sh.act = o.act || sh.act; sh.sel = o.sel || sh.sel; sh.sx = o.sx || 0; sh.sy = o.sy || 0; return sh; });
  WB.cur = Math.min(s.cur, WB.sheets.length - 1); recalc(); hideAnts(); render(); window.TR && TR.onUndo && TR.onUndo(); changed(); toast('Отменено');
}
function usedRange(sh) { return { r1: 0, c1: 0, r2: nrows(sh) - 1, c2: Math.max(0, ncols(sh) - 1) }; }
function selRange(sh) { const s = sh.sel; if (s.mode === 'all') return usedRange(sh); const u = usedRange(sh); return { r1: s.r1, c1: s.c1, r2: Math.min(s.r2, s.mode === 'cell' ? s.r2 : u.r2), c2: Math.min(s.c2, s.mode === 'cell' ? s.c2 : u.c2) }; }
function copySel() {
  if (edit) return;
  const sh = S(), g = selRange(sh), rows = [];
  for (let r = g.r1; r <= g.r2; r++) { if (r > 0 && !rowVisible(sh, r) && visSet(sh)) continue; const row = []; for (let c = g.c1; c <= g.c2; c++) row.push(shown(sh, r, c)); rows.push(row); }
  clip = { si: WB.cur, g, rows, ver: WB.ver };
  showAnts(); render(); changed();
  toast(visSet(sh) ? `Скопировано ${rows.length} ${plural(rows.length, 'строка', 'строки', 'строк')} — только видимые после фильтра` : `Скопировано: ${rows.length} × ${g.c2 - g.c1 + 1}`);
}
function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c); }
function pasteClip() {
  if (edit) return;
  if (!clip) { toast('Буфер пуст: сначала скопируй (Ctrl+C)'); return; }
  const sh = S(), { r, c } = sh.act; pushUndo();
  clip.rows.forEach((row, i) => row.forEach((v, j) => setCell(sh, r + i, c + j, v === '' ? '' : v, null)));
  if (WB.cur >= WB.base && clip.si < WB.base) WB.sheets[clip.si].w.forEach((w, i) => { if (!sh._wset) sh.w[c + i] = w; });
  sh._wset = true;
  const src = WB.sheets[clip.si]; if (src && src.dateCols.length) sh.dateCols = src.dateCols.map(d => d - clip.g.c1 + c).filter(d => d >= 0);
  recalc(); sh.sel = { r1: r, c1: c, r2: r + clip.rows.length - 1, c2: c + clip.rows[0].length - 1, mode: 'cell' };
  sh.flash = { r1: r, r2: r + clip.rows.length - 1, c1: c, c2: c + clip.rows[0].length - 1, t: performance.now() };
  render(); changed(); toast(`Вставлено строк: ${clip.rows.length}`);
}
function clearSel() {
  const sh = S(), g = selRange(sh); pushUndo();
  for (let r = g.r1; r <= g.r2; r++) for (let c = g.c1; c <= g.c2; c++) if (raw(sh, r, c) !== '' || fx(sh, r, c)) setCell(sh, r, c, '', null);
  trimSheet(sh); recalc(); render(); changed();
}
function addSheet() {
  if (edit) commit('none');
  pushUndo();
  let n = WB.sheets.length + 1; while (WB.sheets.some(s => s.name === 'Лист' + n)) n++;
  const sh = mkSheet('Лист' + n, [[]], Array(NCOL).fill(DEFW));
  WB.sheets.push(sh); WB.cur = WB.sheets.length - 1; sh._new = true;
  hideAnts(false); render(); changed();
}
function switchSheet(i) {
  if (i === WB.cur || i < 0 || i >= WB.sheets.length) return;
  if (edit && !isFormulaEdit()) commit('none');
  const p = edit ? caret() : 0;
  WB.cur = i; closePops(); render(); changed();
  if (edit) { fIn.focus({ preventScroll: true }); fIn.setSelectionRange(p, p); } else focusSink();
}

/* ============================ fill ============================ */
function fillDown(c1, c2, rFrom, rTo) {
  const sh = S(); if (rTo <= rFrom) return 0; pushUndo();
  for (let c = c1; c <= c2; c++) {
    const f = fx(sh, rFrom, c), v = raw(sh, rFrom, c);
    for (let r = rFrom + 1; r <= rTo; r++) { if (f) setCell(sh, r, c, '', shiftFormula(f, r - rFrom)); else setCell(sh, r, c, v, null); }
  }
  recalc(); sh.flash = { r1: rFrom, r2: rTo, c1, c2, t: performance.now() };
  render(); changed(); return rTo - rFrom;
}
function autoFill() {
  const sh = S(), g = sh.sel.mode === 'cell' ? sh.sel : { r1: sh.act.r, r2: sh.act.r, c1: sh.act.c, c2: sh.act.c };
  const r0 = g.r2;
  const extentOf = c => { if (c < 0) return -1; let r = r0 + 1; if (raw(sh, r, c) === '' && !fx(sh, r, c)) return -1; while (r + 1 < nrows(sh) && (raw(sh, r + 1, c) !== '' || fx(sh, r + 1, c))) r++; return r; };
  let end = extentOf(g.c1 - 1); if (end < 0) end = extentOf(g.c2 + 1);
  if (end <= r0) { toast('Нечего протягивать: рядом нет заполненного столбца'); return; }
  const n = fillDown(g.c1, g.c2, g.r1, end);
  sh.sel = { r1: g.r1, r2: end, c1: g.c1, c2: g.c2, mode: 'cell' };
  render(); toast(`Формула протянута до строки ${end + 1} — заполнено ${n} ${plural(n, 'ячейка', 'ячейки', 'ячеек')}`);
}
function autoSum() {
  if (edit) { if (isFormulaEdit()) return; commit('none'); }
  const sh = S(), { r, c } = sh.act;
  let rs = r - 1; while (rs >= 0 && typeof shown(sh, rs, c) === 'number') rs--;
  let t;
  if (rs < r - 1) t = `=СУММ(${addr(rs + 1, c)}:${addr(r - 1, c)})`;
  else { let cs = c - 1; while (cs >= 0 && typeof shown(sh, r, cs) === 'number') cs--; t = cs < c - 1 ? `=СУММ(${addr(r, cs + 1)}:${addr(r, c - 1)})` : '=СУММ()'; }
  beginEdit(t);
  if (t === '=СУММ()') { ced.setSelectionRange(6, 6); }
}

/* ============================ grid rendering ============================ */
const gs = $('#gscroll'), gsp = $('#gspace'), cellsEl = $('#cells'), colIn = $('#colhdrIn'), rowIn = $('#rowhdrIn');
function colX(sh) { const xs = [0]; for (let c = 0; c < NCOL; c++) xs.push(xs[c] + (sh.w[c] || DEFW)); return xs; }
function scrollIntoView(r, c) {
  const sh = S(), xs = colX(sh), di = dIdx(sh, r); if (di < 0) return;
  const y = di * RH, h = gs.clientHeight - 16, x = xs[c], w = gs.clientWidth - 16;
  if (y < gs.scrollTop) gs.scrollTop = y; else if (y + RH > gs.scrollTop + h) gs.scrollTop = y + RH - h;
  if (x < gs.scrollLeft) gs.scrollLeft = x; else if (xs[c + 1] > gs.scrollLeft + w) gs.scrollLeft = xs[c + 1] - w;
}
let lastSheetShown = -1;
function render(scrollOnly = false) {
  const sh = S(), xs = colX(sh), si = WB.cur;
  if (lastSheetShown !== si) { if (lastSheetShown >= 0 && WB.sheets[lastSheetShown]) { WB.sheets[lastSheetShown].sx = gs.scrollLeft; WB.sheets[lastSheetShown].sy = gs.scrollTop; } }
  const total = drLen(sh);
  gsp.style.width = xs[NCOL] + 'px'; gsp.style.height = (total * RH) + 'px';
  if (lastSheetShown !== si) { gs.scrollLeft = sh.sx || 0; gs.scrollTop = sh.sy || 0; lastSheetShown = si; }
  const st = gs.scrollTop, sl = gs.scrollLeft, vh = gs.clientHeight, vw = gs.clientWidth;
  const d0 = Math.max(0, Math.floor(st / RH) - 2), d1 = Math.min(total - 1, Math.ceil((st + vh) / RH) + 2);
  let c0 = 0; while (c0 < NCOL - 1 && xs[c0 + 1] < sl) c0++;
  let c1 = c0; while (c1 < NCOL - 1 && xs[c1] < sl + vw) c1++;
  const sel = sh.sel, g = sel, flash = sh.flash && performance.now() - sh.flash.t < 900 ? sh.flash : null;
  const afOn = sh.af, vis = visSet(sh), NC = ncols(sh);
  let h = '';
  for (let di = d0; di <= d1; di++) {
    const r = rowAt(sh, di), y = di * RH;
    for (let c = c0; c <= c1; c++) {
      let v = shown(sh, r, c);
      const empty = v === '';
      let cls = 'c', txt = empty ? '' : disp(v);
      if (typeof v === 'number' || (sh.dateCols.includes(c) && r > 0 && !empty)) cls += ' n';
      if (isErr(v)) cls += ' err';
      let w = xs[c + 1] - xs[c], extra = '';
      if (!empty && typeof v === 'string' && !cls.includes(' n')) {
        // текст наползает на пустые соседние ячейки, как в Calc
        let k = c + 1, ww = w; const tw = txt.length * 7.6 + 8;
        while (tw > ww && k < NCOL && shown(sh, r, k) === '' && !(afOn && r === 0 && k <= afOn.c2)) { ww += xs[k + 1] - xs[k]; k++; }
        if (ww > w) { w = ww; cls += ' ov'; extra = 'background:var(--cell-bg);'; }
      }
      if (flash && r >= flash.r1 && r <= flash.r2 && c >= flash.c1 && c <= flash.c2) cls += ' flash';
      const afb = afOn && r === 0 && c >= afOn.c1 && c <= Math.max(afOn.c2, NC - 1) ? `<i class="afb${afOn.crit[c] ? ' on' : ''}" data-afc="${c}"></i>` : '';
      if (empty && !afb) continue;
      h += `<div class="${cls}" style="left:${xs[c]}px;top:${y}px;width:${w}px;${extra}${afb ? 'padding-right:20px;' : ''}">${escH(txt)}${afb}</div>`;
    }
  }
  if (cellsEl._html !== h) { cellsEl.innerHTML = h; cellsEl._html = h; }
  drawColLines(xs, total);
  // headers
  let ch = '';
  const fullC = sel.mode === 'cols' || sel.mode === 'all';
  for (let c = c0; c <= c1; c++) { const on = c >= g.c1 && c <= g.c2; ch += `<div class="ch${on ? (fullC ? ' full' : ' sel') : ''}" data-c="${c}" style="left:${xs[c]}px;width:${xs[c + 1] - xs[c]}px">${LET(c)}</div>`; }
  if (colIn._html !== ch) { colIn.innerHTML = ch; colIn._html = ch; } colIn.style.transform = `translateX(${-sl}px)`;
  let rh = ''; const fullR = sel.mode === 'rows' || sel.mode === 'all';
  for (let di = d0; di <= d1; di++) { const r = rowAt(sh, di), on = r >= g.r1 && r <= g.r2, gap = vis && di > 0 && rowAt(sh, di - 1) !== r - 1; rh += `<div class="rh${on ? (fullR ? ' full' : ' sel') : ''}${gap ? ' gap' : ''}" data-r="${r}" style="top:${di * RH}px">${r + 1}</div>`; }
  if (rowIn._html !== rh) { rowIn.innerHTML = rh; rowIn._html = rh; } rowIn.style.transform = `translateY(${-st}px)`;
  // selection boxes
  const box = (r1, c1b, r2, c2b) => {
    let a = dIdx(sh, r1), b = dIdx(sh, r2);
    if (a < 0) { for (let r = r1; r <= r2; r++) { a = dIdx(sh, r); if (a >= 0) break; } }
    if (b < 0) { for (let r = r2; r >= r1; r--) { b = dIdx(sh, r); if (b >= 0) break; } }
    if (a < 0 || b < 0) return null;
    return { x: xs[Math.max(0, c1b)], y: a * RH, w: xs[Math.min(NCOL, c2b + 1)] - xs[Math.max(0, c1b)], h: (b - a + 1) * RH };
  };
  const sb = $('#selbox'), ab = $('#actbox');
  const multi = g.r1 !== g.r2 || g.c1 !== g.c2;
  const sr = multi ? box(g.r1, g.c1, Math.min(g.r2, rowAt(sh, total - 1)), Math.min(g.c2, NCOL - 1)) : null;
  if (sr && !(edit && WB.cur !== edit.si)) Object.assign(sb.style, { display: 'block', left: sr.x + 'px', top: sr.y + 'px', width: sr.w + 'px', height: sr.h + 'px' }); else sb.style.display = 'none';
  const ar = box(sh.act.r, sh.act.c, sh.act.r, sh.act.c);
  const showAct = ar && !(edit && WB.cur !== edit.si);
  if (showAct) Object.assign(ab.style, { display: 'block', left: (ar.x - 1) + 'px', top: (ar.y - 1) + 'px', width: (ar.w + 1) + 'px', height: (ar.h + 1) + 'px' }); else ab.style.display = 'none';
  // fill handle sits at bottom-right of the selection
  const fh = $('#fh');
  if (showAct && !edit) { fh.style.display = 'block'; const tr = sr || ar; fh.style.left = (tr.x + tr.w - ar.x - 3) + 'px'; fh.style.top = (tr.y + tr.h - ar.y - 3) + 'px'; fh.style.right = 'auto'; fh.style.bottom = 'auto'; } else fh.style.display = 'none';
  // in-cell editor
  if (edit && edit.si === WB.cur && ar) { Object.assign(ced.style, { display: 'block', left: ar.x + 'px', top: ar.y + 'px', minWidth: ar.w + 'px', width: Math.max(ar.w, edit.text.length * 8 + 20) + 'px' }); }
  else ced.style.display = 'none';
  // marching ants
  const an = $('#copyant');
  if (clip && clip.si === WB.cur && clip.ants) { const cg = clip.g, rb = box(cg.r1, cg.c1, cg.r2, cg.c2); if (rb) Object.assign(an.style, { display: 'block', left: (rb.x - 1) + 'px', top: (rb.y - 1) + 'px', width: (rb.w + 2) + 'px', height: (rb.h + 2) + 'px' }); else an.style.display = 'none'; } else an.style.display = 'none';
  drawRefBoxes(xs, box);
  formulaTip(ar);
  if (!scrollOnly) { renderTabs(); renderStatus(); }
  if (!edit) { const v = fx(sh, sh.act.r, sh.act.c) || disp(raw(sh, sh.act.r, sh.act.c)); if (document.activeElement !== fIn) fIn.value = v; }
  const nb = $('#nameBox'); if (document.activeElement !== nb) nb.value = multi && sel.mode === 'cell' ? `${addr(g.r1, g.c1)}:${addr(g.r2, g.c2)}` : sel.mode === 'cols' ? `${LET(g.c1)}1:${LET(g.c2)}1048576` : sel.mode === 'all' ? 'A1:AMJ1048576' : addr(sh.act.r, sh.act.c);
  window.TR && TR.onRender && TR.onRender();
}
let gridColumns = "";
function drawColLines(xs, total) {
  const key = xs.join(","); if (key === gridColumns) return; gridColumns = key;
  // vertical grid lines via a repeating background on the space element
  const stops = []; for (let c = 1; c <= NCOL; c++) stops.push(`linear-gradient(var(--gline), var(--gline)) ${xs[c] - 1}px 0 / 1px 100% no-repeat`);
  gsp.style.background = stops.join(',') + `, linear-gradient(to bottom, transparent ${RH - 1}px, var(--gline) ${RH - 1}px) 0 0 / 100% ${RH}px`;
}
const escH = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const REFCOL = ['#2F6FD6', '#D32F2F', '#8E24AA', '#2E7D32', '#EF6C00'];
function drawRefBoxes(xs, box) {
  const el = $('#refboxes');
  if (!isFormulaEdit()) { el.innerHTML = ''; return; }
  let h = '', k = 0;
  const re = /(\$?(?:'[^']+'|[A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё_]*)\.)?(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?|\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3})(?![\wА-Яа-яЁё(.])/g;
  let m; const t = edit.text;
  while ((m = re.exec(t))) {
    if (m.index && /[\wА-Яа-яЁё]/.test(t[m.index - 1])) continue;
    const col = REFCOL[k++ % REFCOL.length];
    const tsi = m[1] ? sheetByName(m[1].replace(/^\$/, '').replace(/\.$/, '').replace(/^'|'$/g, '')) : edit.si;
    if (tsi !== WB.cur) continue;
    const g = parseA1(m[2], S()); if (!g) continue;
    const b = g.cols ? { x: xs[g.c1], y: 0, w: xs[g.c2 + 1] - xs[g.c1], h: drLen(S()) * RH } : box(g.r1, g.c1, g.r2, g.c2);
    if (b) h += `<i style="left:${b.x - 1}px;top:${b.y - 1}px;width:${b.w + 1}px;height:${b.h + 1}px;border-color:${col}"></i>`;
  }
  el.innerHTML = h;
}
const SIG = { 'ВПР': ['Критерий поиска', 'Массив', 'Индекс', 'Режим сортировки'], 'VLOOKUP': ['Критерий поиска', 'Массив', 'Индекс', 'Режим сортировки'], 'СУММ': ['Число 1', 'Число 2', '…'], 'ПРОМЕЖУТОЧНЫЕ.ИТОГИ': ['Функция', 'Диапазон', '…'] };
function formulaTip(ar) {
  const tip = $('#ftip');
  if (!isFormulaEdit()) { tip.style.display = 'none'; return; }
  const before = edit.text.slice(0, caret());
  const stack = []; let inStr = false;
  for (let i = 0; i < before.length; i++) {
    const ch = before[i]; if (ch === '"') inStr = !inStr; if (inStr) continue;
    if (ch === '(') { const m = /([A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё_.]*)\s*$/.exec(before.slice(0, i)); stack.push({ fn: m ? m[1].toUpperCase() : '', arg: 0 }); }
    else if (ch === ')') stack.pop(); else if ((ch === ';' || ch === ',') && stack.length) stack[stack.length - 1].arg++;
  }
  const top = stack[stack.length - 1];
  if (!top || !SIG[top.fn]) { tip.style.display = 'none'; return; }
  tip.innerHTML = top.fn + '(' + SIG[top.fn].map((a, i) => i === Math.min(top.arg, SIG[top.fn].length - 1) ? `<b>${a}</b>` : a).join('; ') + ')';
  if (edit.si === WB.cur && ar) { tip.style.left = ar.x + 'px'; tip.style.top = (ar.y + RH + 3) + 'px'; tip.style.display = 'block'; }
  else { tip.style.left = (gs.scrollLeft + 10) + 'px'; tip.style.top = (gs.scrollTop + 4) + 'px'; tip.style.display = 'block'; }
}
let scrollFrame = 0;
gs.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; render(true); });
}, { passive: true });

/* ============================ tabs / status ============================ */
function renderTabs() {
  const el = $('#tabs');
  const html = WB.sheets.map((s, i) => `<div class="tab${i === WB.cur ? ' on' : ''}${s._new ? ' new' : ''}" data-si="${i}">${escH(s.name)}</div>`).join('');
  if (el._h !== html) { el.innerHTML = html; el._h = html; WB.sheets.forEach(s => { s._new = false; }); }
}
function renderStatus() {
  const sh = S();
  $('#stSheet').textContent = `Лист ${WB.cur + 1} из ${WB.sheets.length}`;
  const vis = visSet(sh);
  $('#stRec').textContent = vis ? `Найдено записей: ${vis.size} из ${nrows(sh) - 1}` : '';
  const g = selRange(sh); let s = 0, n = 0, cnt = 0;
  const big = (g.r2 - g.r1 + 1) * (g.c2 - g.c1 + 1) > 60000;
  if (!big && (g.r1 !== g.r2 || g.c1 !== g.c2)) for (let r = g.r1; r <= g.r2; r++) { if (vis && r > 0 && !vis.has(r)) continue; for (let c = g.c1; c <= g.c2; c++) { const v = shown(sh, r, c); if (v !== '') cnt++; if (typeof v === 'number') { s += v; n++; } } }
  else { const v = shown(sh, sh.act.r, sh.act.c); if (typeof v === 'number') { s = v; n = 1; } if (v !== '') cnt = 1; }
  $('#stSum').textContent = n ? `Среднее: ${fmtNum(s / n)}; Сумма: ${fmtNum(s)}` : `Среднее: ; Сумма: 0`;
}
$('#tabs').addEventListener('mousedown', e => { const t = e.target.closest('.tab'); if (!t) return; e.preventDefault(); switchSheet(+t.dataset.si); });
$('#tabs').addEventListener('contextmenu', e => { e.preventDefault(); openCtx(e, [['Вставить лист в конец…', addSheet], ['Удалить лист…', null], ['Переименовать лист…', null]]); });
$('#tAdd').addEventListener('click', () => addSheet());

/* ============================ ants ============================ */
function showAnts() { if (clip) clip.ants = true; }
function hideAnts(rerender = true) { if (clip) clip.ants = false; if (rerender) {} }

/* ============================ mouse on grid ============================ */
function hit(e) {
  const sh = S(), xs = colX(sh), b = gsp.getBoundingClientRect(), k = realK();
  const x = (e.clientX - b.left) / k, y = (e.clientY - b.top) / k;
  let c = 0; while (c < NCOL - 1 && xs[c + 1] <= x) c++;
  const di = Math.max(0, Math.floor(y / RH));
  return { r: rowAt(sh, Math.min(di, drLen(sh) - 1)), c };
}
let drag = null;
gsp.addEventListener('mousedown', e => {
  if (e.button === 2) return;
  closePops();
  let afb = e.target.closest('.afb');
  if (!afb && !edit && e.target.id !== 'fh') { // щедрая зона: клик рядом со стрелкой тоже открывает фильтр
    const p0 = hit(e), xs0 = colX(S()), b0 = gsp.getBoundingClientRect(), x0 = (e.clientX - b0.left) / realK();
    if (p0.r === 0 && xs0[p0.c + 1] !== undefined && xs0[p0.c + 1] - x0 <= 24) afb = $(`.afb[data-afc="${p0.c}"]`);
  }
  if (afb) { e.preventDefault(); e.stopPropagation(); if (edit) commit('none'); afOpen(+afb.dataset.afc); return; }
  if (e.target.id === 'fh') { e.preventDefault(); if (edit) return; drag = { kind: 'fill', start: S().sel }; return; }
  if (e.target === ced) return;
  const p = hit(e); const sh = S();
  if (edit) {
    if (pointable() || (isFormulaEdit() && WB.cur !== edit.si)) { e.preventDefault(); drag = { kind: 'ref', a: p }; insertRef(refText(p.r, p.c, p.r, p.c)); return; }
    commit('none');
  }
  e.preventDefault();
  if (e.shiftKey) { if (!sh.anchor) sh.anchor = { ...sh.act }; sh.sel = { r1: Math.min(sh.anchor.r, p.r), r2: Math.max(sh.anchor.r, p.r), c1: Math.min(sh.anchor.c, p.c), c2: Math.max(sh.anchor.c, p.c), mode: 'cell' }; }
  else { selectCell(p.r, p.c); drag = { kind: 'sel', a: p }; }
  hideAnts(); render(); changed(); focusSink();
});
gsp.addEventListener('dblclick', e => {
  if (e.target.id === 'fh') { e.preventDefault(); drag = null; $('#filldrag').style.display = 'none'; autoFill(); return; }
  if (e.target.closest('.afb') || edit) return;
  const p = hit(e); selectCell(p.r, p.c); beginEdit();
});
gsp.addEventListener('contextmenu', e => {
  e.preventDefault(); if (edit) return;
  const p = hit(e), sh = S(); const g = sh.sel;
  if (!(p.r >= g.r1 && p.r <= g.r2 && p.c >= g.c1 && p.c <= g.c2)) { selectCell(p.r, p.c); render(); }
  openCtx(e, [['Вырезать', () => { copySel(); toast('В тренажёре «Вырезать» работает как «Копировать»'); }, 'Ctrl+X'], ['Копировать', copySel, 'Ctrl+C'], ['Вставить', pasteClip, 'Ctrl+V'], ['Специальная вставка', null], '-', ['Вставить строки выше', null], ['Удалить строки', null], '-', ['Удалить содержимое…', clearSel, 'Delete'], ['Формат ячеек…', null]]);
});
addEventListener('mousemove', e => {
  if (!drag) return;
  if (drag.kind === 'sel') { const p = hit(e), sh = S(); sh.sel = { r1: Math.min(drag.a.r, p.r), r2: Math.max(drag.a.r, p.r), c1: Math.min(drag.a.c, p.c), c2: Math.max(drag.a.c, p.c), mode: 'cell' }; render(); }
  else if (drag.kind === 'ref') { const p = hit(e); insertRef(refText(drag.a.r, drag.a.c, p.r, p.c)); }
  else if (drag.kind === 'colref') { const c = colHit(e); insertRef(refText(0, drag.c, 0, c, true)); }
  else if (drag.kind === 'cols') { const c = colHit(e); selectCols(drag.c, c); render(); }
  else if (drag.kind === 'fill') {
    const p = hit(e), sh = S(), g = drag.start, xs = colX(sh), a = dIdx(sh, g.r1), b = dIdx(sh, Math.max(p.r, g.r2));
    drag.to = Math.max(p.r, g.r2);
    Object.assign($('#filldrag').style, { display: 'block', left: xs[g.c1] + 'px', top: a * RH + 'px', width: (xs[g.c2 + 1] - xs[g.c1]) + 'px', height: (b - a + 1) * RH + 'px' });
  }
});
addEventListener('mouseup', () => {
  if (drag && drag.kind === 'fill') { $('#filldrag').style.display = 'none'; if (drag.to > drag.start.r2) { const g = drag.start; fillDown(g.c1, g.c2, g.r1, drag.to); S().sel = { r1: g.r1, r2: drag.to, c1: g.c1, c2: g.c2, mode: 'cell' }; render(); } }
  if (drag && (drag.kind === 'sel' || drag.kind === 'cols')) changed();
  drag = null;
});
function colHit(e) { const sh = S(), xs = colX(sh), b = $('#colhdr').getBoundingClientRect(), k = realK(); const x = (e.clientX - b.left) / k + gs.scrollLeft; let c = 0; while (c < NCOL - 1 && xs[c + 1] <= x) c++; return c; }
$('#colhdr').addEventListener('mousedown', e => {
  e.preventDefault(); closePops(); const c = colHit(e);
  if (edit) { if (pointable() || (isFormulaEdit() && WB.cur !== edit.si)) { drag = { kind: 'colref', c }; insertRef(refText(0, c, 0, c, true)); return; } commit('none'); }
  if (e.shiftKey && S().sel.mode === 'cols') selectCols(S().sel.c1, c); else { selectCols(c, c); drag = { kind: 'cols', c }; }
  render(); changed();
});
$('#rowhdr').addEventListener('mousedown', e => {
  e.preventDefault(); closePops(); if (edit) commit('none');
  const b = $('#rowhdr').getBoundingClientRect(), k = realK(), di = Math.floor(((e.clientY - b.top) / k + gs.scrollTop) / RH);
  const r = rowAt(S(), di); selectRows(r, r); render(); changed();
});
$('#corner').addEventListener('mousedown', e => { e.preventDefault(); closePops(); if (edit) commit('none'); selectAll(); focusSink(); });

/* ============================ keyboard ============================ */
const mod = e => e.ctrlKey || e.metaKey;
ced.addEventListener('input', () => { edit.text = ced.value; edit.pend = null; syncEditors(); render(); changed(); });
fIn.addEventListener('input', () => { if (!edit) return; edit.text = fIn.value; edit.pend = null; syncEditors(); render(); changed(); });
fIn.addEventListener('focus', () => { if (!edit) { const p = fIn.selectionStart; beginEdit(undefined, true); fIn.focus(); try { fIn.setSelectionRange(p, p); } catch (x) {} } });
[ced, fIn].forEach(el => el.addEventListener('keydown', e => {
  if (!edit) return;
  if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commit(e.shiftKey ? 'up' : 'down'); }
  else if (e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); commit('right'); }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancelEdit(); }
  else if (e.key === 'F4' || (mod(e) && (e.key === 't' || e.key === 'T' || e.code === 'KeyT'))) { e.preventDefault(); e.stopPropagation(); toggleAbs(); }
  else setTimeout(() => { render(); changed(); }, 0);
}));
['click', 'keyup'].forEach(ev2 => [ced, fIn].forEach(el => el.addEventListener(ev2, () => { if (edit) { formulaTip(null); render(); } })));
document.addEventListener('keydown', e => {
  const ae = document.activeElement;
  if (ae && ae !== sink && (ae === ced || ae === fIn || ae.matches('input, textarea'))) return;
  if (!started || e.defaultPrevented) return;
  if (composing || e.isComposing || e.keyCode === 229) return;
  const sh = S();
  if (edit) { // фокус потерялся во время ввода — продолжаем редактирование
    if (e.key === 'Enter') { e.preventDefault(); commit('down'); return; }
    if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); return; }
    if (e.key === 'Tab') { e.preventDefault(); commit('right'); return; }
    if (e.key === 'F4') { e.preventDefault(); toggleAbs(); return; }
    if (e.key.length === 1 && !mod(e)) { e.preventDefault(); const t = edit.text + e.key; edit.pend = null; setEditText(t, t.length); return; }
    return;
  }
  if (e.key === 'Escape') { closePops(); if (clip) { clip.ants = false; render(); } return; }
  if (mod(e) && e.shiftKey && (e.code === 'KeyL')) { e.preventDefault(); afToggle(); return; }
  if (mod(e) && e.code === 'KeyC') { e.preventDefault(); copySel(); return; }
  if (mod(e) && e.code === 'KeyX') { e.preventDefault(); copySel(); return; }
  if (mod(e) && e.code === 'KeyV') { e.preventDefault(); pasteClip(); return; }
  if (mod(e) && e.code === 'KeyZ') { e.preventDefault(); undo(); return; }
  if (mod(e) && e.code === 'KeyA') { e.preventDefault(); selectAll(); return; }
  if (mod(e) && e.key === 'Home') { e.preventDefault(); selectCell(0, 0); render(); changed(); return; }
  if (mod(e)) return;
  const arrows = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  if (arrows[e.key]) { e.preventDefault(); if (!e.shiftKey) sh.ext = null; moveAct(...arrows[e.key], e.shiftKey); render(); changed(); return; }
  if (e.key === 'Enter') { e.preventDefault(); moveAct(e.shiftKey ? -1 : 1, 0); render(); changed(); return; }
  if (e.key === 'Tab') { e.preventDefault(); moveAct(0, e.shiftKey ? -1 : 1); render(); changed(); return; }
  if (e.key === 'F2') { e.preventDefault(); beginEdit(); return; }
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); clearSel(); return; }
  if (e.key.length === 1) { e.preventDefault(); beginEdit(e.key); return; }
});
$('#nameBox').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return; e.preventDefault();
  const m = /^\s*([A-Za-z]{1,3})(\d+)\s*$/.exec(e.target.value);
  if (m) { selectCell(+m[2] - 1, CIDX(m[1])); e.target.blur(); render(); changed(); } else toast('Введи адрес ячейки, например E14');
});
$('#bSum').addEventListener('click', () => autoSum());
$('#bEq').addEventListener('click', () => { if (!edit) beginEdit('='); });
$('#bWizard').addEventListener('click', () => toast('Мастер функций в тренажёре не нужен — формулу пишем руками'));

/* ============================ autofilter popup ============================ */
const afp = $('#afPop');
let pop = null;
function afOpen(c) {
  const sh = S(); if (!sh.af) return;
  const vals = afValues(sh, c), crit = sh.af.crit[c];
  pop = { c, vals, checked: new Set(crit ? vals.filter(v => crit.has(v)) : vals), search: '', exp: new Set(), date: sh.dateCols.includes(c) };
  afRender();
  const btn = $(`.afb[data-afc="${c}"]`), xs = colX(sh), g = rr(gsp), v = rr(gs);
  let x = g.x + xs[c], y = btn ? rr(btn).y + 18 : v.y;
  afp.style.left = Math.max(v.x, Math.min(x, 1600 - 364 - 304)) + 'px'; afp.style.top = Math.max(v.y, y) + 'px';
  afp.classList.add('open'); changed();
  setTimeout(() => { const i = $('.asrch input', afp); i && i.focus(); }, 30);
}
function afShownVals() { if (!pop.search) return pop.vals; const q = pop.search.toLowerCase(); return pop.vals.filter(v => v.toLowerCase().includes(q)); }
function afEffective() { return pop.search ? new Set(afShownVals()) : pop.checked; }
function afRender() {
  const shownV = afShownVals(), eff = afEffective();
  let list = '';
  if (pop.date && !pop.search) {
    const tree = {};
    pop.vals.forEach(v => { const m = /^(\d\d)\.(\d\d)\.(\d{4})$/.exec(v); if (!m) { (tree['—'] = tree['—'] || {})['—'] = [...((tree['—'] || {})['—'] || []), v]; return; } ((tree[m[3]] = tree[m[3]] || {})[m[2]] = (tree[m[3]][m[2]] || [])).push(v); });
    for (const y of Object.keys(tree)) {
      const yv = Object.values(tree[y]).flat(), yAll = yv.every(v => eff.has(v)), ySome = yv.some(v => eff.has(v)), yk = 'Y' + y, yo = pop.exp.has(yk);
      list += `<label data-node="${yk}" data-vals="${yv.join('|')}"><span class="tw" data-tw="${yk}">${yo ? '▾' : '▸'}</span><input type="checkbox"${yAll ? ' checked' : ''} data-ind="${!yAll && ySome ? 1 : 0}">${y}</label>`;
      if (!yo) continue;
      for (const mo of Object.keys(tree[y])) {
        const mv = tree[y][mo], mAll = mv.every(v => eff.has(v)), mSome = mv.some(v => eff.has(v)), mk = yk + 'M' + mo, mopen = pop.exp.has(mk);
        list += `<label class="lv1" data-node="${mk}" data-vals="${mv.join('|')}"><span class="tw" data-tw="${mk}">${mopen ? '▾' : '▸'}</span><input type="checkbox"${mAll ? ' checked' : ''} data-ind="${!mAll && mSome ? 1 : 0}">${MONTHS[+mo - 1] || mo}</label>`;
        if (!mopen) continue;
        mv.forEach(v => { list += `<label class="lv2" data-v="${escA(v)}"><span class="tw"></span><input type="checkbox"${eff.has(v) ? ' checked' : ''}>${v.slice(0, 2)}</label>`; });
      }
    }
  } else list = shownV.map(v => `<label data-v="${escA(v)}"><input type="checkbox"${eff.has(v) ? ' checked' : ''}>${v === '' ? '(пусто)' : escH(v)}</label>`).join('') || '<div style="padding:6px;color:#888">Ничего не найдено</div>';
  const all = shownV.every(v => eff.has(v)), some = shownV.some(v => eff.has(v));
  afp.innerHTML = `
    <div class="ai" data-a="sort"><span class="aic">↑</span>Сортировать по возрастанию</div>
    <div class="ai" data-a="sort"><span class="aic">↓</span>Сортировать по убыванию</div>
    <div class="ai" data-a="sort"><span class="aic"></span>Пользовательская сортировка</div>
    <div class="asep"></div>
    <div class="ai" data-a="na"><span class="aic"></span>Фильтр по цвету<span class="ar">▸</span></div>
    <div class="ai" data-a="na"><span class="aic"></span>Пустые</div>
    <div class="ai" data-a="na"><span class="aic"></span>Непустые</div>
    <div class="ai" data-a="na"><span class="aic"></span>Первые 10</div>
    <div class="ai" data-a="na"><span class="aic"></span>Стандартный фильтр…</div>
    <div class="asrch"><span style="color:#888">⌕</span><input placeholder="Поиск элементов…" value="${escA(pop.search)}"></div>
    <div class="alist">${list}</div>
    <div class="aall"><input type="checkbox" id="afAll"${all ? ' checked' : ''}><label for="afAll">Все</label><span class="ib"><i title="Показать только текущий">✓</i><i title="Скрыть только текущий">✕</i></span></div>
    <div class="abtns"><button class="def" data-a="ok">OK</button><button data-a="cancel">Отмена</button></div>`;
  $$('input[data-ind="1"]', afp).forEach(i => { i.indeterminate = true; });
  const allI = $('#afAll', afp); if (!all && some) allI.indeterminate = true;
  const si = $('.asrch input', afp);
  si.addEventListener('input', () => { pop.search = si.value; const p = si.selectionStart; afRender(); const n = $('.asrch input', afp); n.focus(); n.setSelectionRange(p, p); changed(); });
  si.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); afOk(); } if (e.key === 'Escape') { e.preventDefault(); closePops(); } });
}
const escA = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
afp.addEventListener('mousedown', e => {
  const tw = e.target.closest('[data-tw]');
  if (tw && tw.dataset.tw) { e.preventDefault(); afExpand(tw.dataset.tw); return; }
  const a = e.target.closest('[data-a]');
  if (a) { e.preventDefault(); const k = a.dataset.a; if (k === 'ok') afOk(); else if (k === 'cancel') closePops(); else if (k === 'sort') { closePops(); toast('Сортировка в этом задании не нужна — нужен фильтр по значениям'); } else toast('В тренажёре используем список значений ниже'); return; }
  const lab = e.target.closest('label');
  if (lab && lab.closest('.alist')) { e.preventDefault(); afClickLabel(lab); return; }
  if (e.target.id === 'afAll' || (e.target.tagName === 'LABEL' && e.target.htmlFor === 'afAll')) { e.preventDefault(); afSetAll(!afShownVals().every(v => afEffective().has(v))); }
});
function afExpand(k) { if (pop.exp.has(k)) pop.exp.delete(k); else pop.exp.add(k); afRender(); changed(); }
function afClickLabel(lab) {
  if (pop.search) { pop.checked = new Set(afShownVals()); pop.search = ''; }
  if (lab.dataset.v !== undefined) { const v = lab.dataset.v; pop.checked.has(v) ? pop.checked.delete(v) : pop.checked.add(v); }
  else if (lab.dataset.vals) { const vs = lab.dataset.vals.split('|'), allOn = vs.every(v => pop.checked.has(v)); vs.forEach(v => allOn ? pop.checked.delete(v) : pop.checked.add(v)); }
  afRender(); changed();
}
function afToggleValue(v) { if (pop.search) { pop.checked = new Set(afShownVals()); pop.search = ''; } pop.checked.has(v) ? pop.checked.delete(v) : pop.checked.add(v); afRender(); changed(); }
function afSetAll(on) { const vs = afShownVals(); if (pop.search) { pop.search = ''; } vs.forEach(v => on ? pop.checked.add(v) : pop.checked.delete(v)); afRender(); changed(); }
function afSetSearch(q) { pop.search = q; afRender(); changed(); }
function afOk() {
  const sh = S(), eff = afEffective(); pushUndo();
  sh.af.crit[pop.c] = eff.size === pop.vals.length ? null : new Set(eff);
  if (eff.size === 0) { toast('Не выбрано ни одного значения — фильтр скроет всё'); }
  sh.ver++; closePops(); gs.scrollTop = 0; render(); changed();
}
function closePops() {
  const had = afp.classList.contains('open') || $('#menuPop').classList.contains('open') || $('#ctxPop').classList.contains('open');
  afp.classList.remove('open'); pop = null; $('#menuPop').classList.remove('open'); $('#ctxPop').classList.remove('open'); $$('.menubar > div').forEach(m => m.classList.remove('open')); openMenuName = null;
  if (had) changed();
}
document.addEventListener('mousedown', e => {
  if (!e.target.closest('.afpop, .menu, .menubar, .ctx, .afb, .ctip, .sidebar, .startov')) { if (afp.classList.contains('open') || $('#menuPop').classList.contains('open') || $('#ctxPop').classList.contains('open')) closePops(); }
}, true);

/* ============================ menus & toolbars ============================ */
const MENUS = {
  'Файл': [['Создать', null, 'Ctrl+N'], ['Открыть…', null, 'Ctrl+O'], ['Последние документы', null, '▸'], '-', ['Сохранить', () => toast('Это тренажёр — сохранять не нужно'), 'Ctrl+S'], ['Сохранить как…', null], ['Экспорт в PDF…', null], '-', ['Печать…', null, 'Ctrl+P'], '-', ['Закрыть', null]],
  'Правка': [['Отменить', () => undo(), 'Ctrl+Z'], ['Вернуть', null, 'Ctrl+Y'], '-', ['Вырезать', () => copySel(), 'Ctrl+X'], ['Копировать', () => copySel(), 'Ctrl+C'], ['Вставить', () => pasteClip(), 'Ctrl+V'], ['Вставить как…', null, '▸'], '-', ['Выделить всё', () => selectAll(), 'Ctrl+A'], '-', ['Найти и заменить…', null, 'Ctrl+H'], ['Заполнить', null, '▸'], ['Удалить содержимое…', () => clearSel(), 'Delete']],
  'Вид': [['Обычный', null], ['Разметка страницы', null], '-', ['Панели инструментов', null, '▸'], ['Строка формул', null], ['Строка состояния', null], ['Заголовки', null], ['Боковая панель', null, 'Ctrl+F5'], '-', ['Масштаб', null, '▸']],
  'Вставка': [['Изображение…', null], ['Диаграмма…', null], ['Сводная таблица…', null], '-', ['Функция…', () => toast('Формулу ВПР напишем руками — так быстрее'), 'Ctrl+F2'], ['Специальный символ…', null], ['Гиперссылка…', null, 'Ctrl+K'], ['Комментарий', null]],
  'Формат': [['Ячейки…', null, 'Ctrl+1'], ['Строки', null, '▸'], ['Столбцы', null, '▸'], '-', ['Объединить и центрировать', null], ['Условное форматирование', null, '▸']],
  'Стили': [['По умолчанию', null], ['Заголовок 1', null], ['Акцент', null]],
  'Лист': [['Вставить ячейки…', null], ['Вставить строки', null, '▸'], ['Вставить столбцы', null, '▸'], '-', ['Вставить лист…', () => addSheet()], ['Вставить лист в конец…', () => addSheet()], ['Удалить лист…', null], ['Переименовать лист…', null]],
  'Данные': [['Сортировка…', () => toast('Сортировка в этом задании не нужна')], ['Сортировать по возрастанию', () => toast('Сортировка в этом задании не нужна')], ['Сортировать по убыванию', () => toast('Сортировка в этом задании не нужна')], ['Автофильтр', () => afToggle(), 'Ctrl+Shift+L', 'af'], ['Ещё фильтры', null, '▸'], '-', ['Определить диапазон…', null], ['Выбрать диапазон…', null], ['Обновить диапазон', null], '-', ['Промежуточные итоги…', null], ['Проверка…', null], ['Текст по столбцам…', null], ['Консолидация…', null], ['Группа и структура', null, '▸']],
  'Сервис': [['Орфография…', null, 'F7'], ['Подбор параметра…', null], ['Макросы', null, '▸'], '-', ['Параметры…', null, 'Alt+F12']],
  'Окно': [['Новое окно', null], ['Закрыть окно', null, 'Ctrl+W']],
  'Справка': [['Справка LibreOffice', null, 'F1'], ['Что это?', null], '-', ['О тренажёре', () => toast('Тренажёр по заданию 3 ЕГЭ · ion_inf. Интерфейс повторяет LibreOffice Calc', 3500)]]
};
let openMenuName = null;
const mb = $('#menubar');
mb.innerHTML = Object.keys(MENUS).map(m => `<div data-m="${m}">${m}</div>`).join('');
function openMenu(name) {
  if (edit) commit('none');
  const items = MENUS[name], pm = $('#menuPop'), anchor = $(`.menubar > div[data-m="${name}"]`);
  $$('.menubar > div').forEach(m => m.classList.toggle('open', m === anchor));
  pm.innerHTML = items.map((it, i) => it === '-' ? '<div class="msep"></div>' : `<div class="mi${it[1] ? '' : ' dis'}" data-i="${i}"${it[3] ? ` data-id="${it[3]}"` : ''}><span class="chk">${it[3] === 'af' && S().af ? '✓' : ''}</span>${it[0]}<span class="mk">${it[2] || ''}</span></div>`).join('');
  const b = rr(anchor); pm.style.left = b.x + 'px'; pm.style.top = (b.y + b.h + 1) + 'px';
  pm.classList.add('open'); openMenuName = name; changed();
}
mb.addEventListener('mousedown', e => { const m = e.target.closest('[data-m]'); if (!m) return; e.preventDefault(); if (openMenuName === m.dataset.m) closePops(); else { closePops(); openMenu(m.dataset.m); } });
mb.addEventListener('mouseover', e => { const m = e.target.closest('[data-m]'); if (m && openMenuName && openMenuName !== m.dataset.m) { closePops(); openMenu(m.dataset.m); } });
$('#menuPop').addEventListener('mousedown', e => { const it = e.target.closest('.mi'); if (!it || it.classList.contains('dis')) { e.preventDefault(); return; } e.preventDefault(); const fn = MENUS[openMenuName][+it.dataset.i][1]; closePops(); fn && fn(); });
function openCtx(e, items) {
  const pm = $('#ctxPop'), s = stage.getBoundingClientRect(), k = realK();
  pm.innerHTML = items.map((it, i) => it === '-' ? '<div class="msep"></div>' : `<div class="mi${it[1] ? '' : ' dis'}" data-i="${i}">${it[0]}<span class="mk">${it[2] || ''}</span></div>`).join('');
  pm._items = items; pm.style.left = ((e.clientX - s.left) / k) + 'px'; pm.style.top = ((e.clientY - s.top) / k) + 'px'; pm.classList.add('open');
}
$('#ctxPop').addEventListener('mousedown', e => { const it = e.target.closest('.mi'); if (!it) return; e.preventDefault(); const fn = $('#ctxPop')._items[+it.dataset.i][1]; closePops(); fn && fn(); });

/* icons (Colibre-like) */
const IC = {
  new: '<path d="M5 2h7l3 3v13H5z" fill="#fff" stroke="#666"/><path d="M12 2v3h3" fill="none" stroke="#666"/>',
  open: '<path d="M2 6h6l2 2h8v9H2z" fill="#F2C55C" stroke="#B88A22"/>',
  save: '<rect x="3" y="3" width="14" height="14" rx="1.5" fill="#3D7BC4"/><rect x="6" y="3" width="8" height="5" fill="#fff"/><rect x="6" y="11" width="8" height="6" fill="#DCE8F6"/>',
  pdf: '<path d="M5 2h7l3 3v13H5z" fill="#fff" stroke="#666"/><rect x="4" y="10" width="12" height="5" rx="1" fill="#D93025"/><text x="10" y="14.2" text-anchor="middle" font-size="4.4" font-family="Arial" font-weight="700" fill="#fff">PDF</text>',
  print: '<rect x="5" y="2" width="10" height="5" fill="#fff" stroke="#666"/><rect x="2" y="7" width="16" height="7" rx="1.5" fill="#777"/><rect x="5" y="11" width="10" height="7" fill="#fff" stroke="#666"/>',
  prev: '<rect x="4" y="2" width="12" height="16" fill="#fff" stroke="#666"/><circle cx="11" cy="11" r="3" fill="none" stroke="#3D7BC4" stroke-width="1.6"/><path d="M13 13l3 3" stroke="#3D7BC4" stroke-width="1.8"/>',
  cut: '<circle cx="6" cy="15" r="2.5" fill="none" stroke="#444" stroke-width="1.5"/><circle cx="14" cy="15" r="2.5" fill="none" stroke="#444" stroke-width="1.5"/><path d="M7.5 13L14 3M12.5 13L6 3" stroke="#666" stroke-width="1.4"/>',
  copy: '<rect x="3" y="3" width="9" height="11" fill="#fff" stroke="#666"/><rect x="8" y="7" width="9" height="11" fill="#fff" stroke="#3D7BC4"/>',
  paste: '<rect x="3" y="4" width="12" height="14" rx="1" fill="#C9A26B" stroke="#8D6A3A"/><rect x="6" y="2.5" width="6" height="3" rx="1" fill="#777"/><rect x="8" y="8" width="9" height="10" fill="#fff" stroke="#666"/>',
  clone: '<path d="M4 16l8-8 3 3-8 8H4z" fill="#F2C55C" stroke="#9A7A2C"/><path d="M12 8l2-2 3 3-2 2" fill="#777"/>',
  clear: '<text x="3" y="14" font-family="Georgia" font-size="12" font-style="italic" fill="#444">A</text><path d="M10 15l6-8" stroke="#D93025" stroke-width="2"/>',
  undo: '<path d="M7 5L3 9l4 4" fill="none" stroke="#3D7BC4" stroke-width="1.9"/><path d="M3.5 9H12a5 5 0 0 1 0 10H9" fill="none" stroke="#3D7BC4" stroke-width="1.9"/>',
  redo: '<path d="M13 5l4 4-4 4" fill="none" stroke="#888" stroke-width="1.9"/><path d="M16.5 9H8a5 5 0 0 0 0 10h3" fill="none" stroke="#888" stroke-width="1.9"/>',
  find: '<circle cx="8.5" cy="8.5" r="5" fill="#fff" stroke="#555" stroke-width="1.7"/><path d="M12 12l5 5" stroke="#555" stroke-width="2.2"/>',
  spell: '<text x="1.5" y="10" font-family="Arial" font-size="8" font-weight="700" fill="#444">ABC</text><path d="M4 14l3 3 8-8" fill="none" stroke="#2E9B3C" stroke-width="2"/>',
  row: '<rect x="2" y="7" width="16" height="6" fill="#DCE8F6" stroke="#3D7BC4"/><path d="M2 4h16M2 16h16" stroke="#999"/>',
  col: '<rect x="7" y="2" width="6" height="16" fill="#DCE8F6" stroke="#3D7BC4"/><path d="M4 2v16M16 2v16" stroke="#999"/>',
  sort: '<path d="M5 3v14M2 14l3 3 3-3" fill="none" stroke="#444" stroke-width="1.5"/><path d="M10 5h8M10 10h6M10 15h4" stroke="#3D7BC4" stroke-width="2"/>',
  sortA: '<text x="1" y="9" font-family="Arial" font-size="7.5" font-weight="700" fill="#3D7BC4">A</text><text x="1" y="18" font-family="Arial" font-size="7.5" font-weight="700" fill="#444">Z</text><path d="M14 3v14M11 14l3 3 3-3" fill="none" stroke="#444" stroke-width="1.5"/>',
  sortD: '<text x="1" y="9" font-family="Arial" font-size="7.5" font-weight="700" fill="#444">Z</text><text x="1" y="18" font-family="Arial" font-size="7.5" font-weight="700" fill="#3D7BC4">A</text><path d="M14 3v14M11 14l3 3 3-3" fill="none" stroke="#444" stroke-width="1.5"/>',
  filter: '<path d="M2.5 3h15l-6 7v6l-3 2v-8z" fill="#F2C55C" stroke="#9A7A2C" stroke-linejoin="round"/>',
  image: '<rect x="2" y="4" width="16" height="12" rx="1" fill="#9BC4E8" stroke="#3D7BC4"/><path d="M2 15l5-5 4 4 3-3 4 4" fill="#4C9A3C"/><circle cx="14" cy="7.5" r="1.6" fill="#F2C55C"/>',
  chart: '<rect x="3" y="10" width="3" height="7" fill="#3D7BC4"/><rect x="8.5" y="5" width="3" height="12" fill="#E8833A"/><rect x="14" y="8" width="3" height="9" fill="#4C9A3C"/>',
  pivot: '<rect x="2" y="2" width="16" height="16" fill="#fff" stroke="#666"/><rect x="2" y="2" width="16" height="4" fill="#DCE8F6"/><rect x="2" y="2" width="5" height="16" fill="#DCE8F6"/><path d="M2 6h16M7 2v16" stroke="#666"/>',
  omega: '<text x="10" y="16" text-anchor="middle" font-family="Georgia" font-size="16" fill="#444">Ω</text>',
  link: '<path d="M8 12l4-4" stroke="#3D7BC4" stroke-width="1.8"/><rect x="2" y="9" width="8" height="5" rx="2.5" transform="rotate(-45 6 11.5)" fill="none" stroke="#3D7BC4" stroke-width="1.6"/><rect x="10" y="6" width="8" height="5" rx="2.5" transform="rotate(-45 14 8.5)" fill="none" stroke="#3D7BC4" stroke-width="1.6"/>',
  note: '<path d="M3 3h14v10H9l-4 4v-4H3z" fill="#FFF5B0" stroke="#B8A030"/>',
  hdr: '<rect x="4" y="2" width="12" height="16" fill="#fff" stroke="#666"/><rect x="5.5" y="3.5" width="9" height="3" fill="#3D7BC4"/><rect x="5.5" y="13.5" width="9" height="3" fill="#3D7BC4"/>',
  area: '<rect x="3" y="3" width="14" height="14" fill="#fff" stroke="#666" stroke-dasharray="2 1.5"/><rect x="6" y="6" width="8" height="8" fill="#DCE8F6"/>',
  freeze: '<rect x="2" y="2" width="16" height="16" fill="#fff" stroke="#666"/><path d="M2 7h16M7 2v16" stroke="#3D7BC4" stroke-width="2"/>',
  split: '<rect x="2" y="2" width="16" height="16" fill="#fff" stroke="#666"/><path d="M2 10h16M10 2v16" stroke="#666" stroke-width="1.8"/>',
  draw: '<path d="M3 17l2-6 9-9 4 4-9 9z" fill="#F2C55C" stroke="#9A7A2C"/><circle cx="5" cy="5" r="3" fill="none" stroke="#3D7BC4" stroke-width="1.5"/>',
  bold: '<text x="5" y="15.5" font-family="Arial" font-size="14" font-weight="800" fill="#222">Ж</text>',
  ital: '<text x="6" y="15.5" font-family="Georgia" font-size="14" font-style="italic" fill="#222">К</text>',
  und: '<text x="5.5" y="14" font-family="Arial" font-size="13" fill="#222">Ч</text><path d="M4 17h12" stroke="#222" stroke-width="1.4"/>',
  fcol: '<text x="5" y="13.5" font-family="Arial" font-size="12" font-weight="700" fill="#222">A</text><rect x="3" y="15" width="14" height="3" fill="#D93025"/>',
  bcol: '<path d="M4 12l6-8 5 5-6 6z" fill="#fff" stroke="#555"/><rect x="3" y="15" width="14" height="3" fill="#FFE600"/>',
  aL: '<path d="M3 5h14M3 9h9M3 13h14M3 17h9" stroke="#444" stroke-width="1.6"/>',
  aC: '<path d="M3 5h14M5.5 9h9M3 13h14M5.5 17h9" stroke="#444" stroke-width="1.6"/>',
  aR: '<path d="M3 5h14M8 9h9M3 13h14M8 17h9" stroke="#444" stroke-width="1.6"/>',
  wrap: '<path d="M3 5h14M3 10h11a3 3 0 0 1 0 6h-4M12 14l-2 2 2 2" fill="none" stroke="#444" stroke-width="1.5"/>',
  merge: '<rect x="2" y="5" width="16" height="10" fill="#fff" stroke="#666"/><path d="M5 10h10M7 8l-2 2 2 2M13 8l2 2-2 2" fill="none" stroke="#3D7BC4" stroke-width="1.4"/>',
  vT: '<path d="M3 3h14" stroke="#3D7BC4" stroke-width="2"/><path d="M6 6h8M6 9h8" stroke="#444" stroke-width="1.5"/>',
  vM: '<path d="M6 8h8M6 12h8" stroke="#444" stroke-width="1.5"/><path d="M3 10h1M16 10h1" stroke="#3D7BC4" stroke-width="2"/>',
  vB: '<path d="M3 17h14" stroke="#3D7BC4" stroke-width="2"/><path d="M6 11h8M6 14h8" stroke="#444" stroke-width="1.5"/>',
  cur: '<rect x="2" y="5" width="16" height="10" rx="1.5" fill="#6DB060" stroke="#3D7A30"/><circle cx="10" cy="10" r="2.8" fill="#DFF0D8"/>',
  pct: '<text x="3" y="15" font-family="Arial" font-size="13" font-weight="700" fill="#444">%</text>',
  numf: '<text x="1.5" y="14" font-family="Arial" font-size="9" font-weight="700" fill="#444">0,0</text>',
  date: '<rect x="3" y="4" width="14" height="13" rx="1" fill="#fff" stroke="#666"/><rect x="3" y="4" width="14" height="4" fill="#D93025"/><text x="10" y="15.5" text-anchor="middle" font-family="Arial" font-size="6.5" font-weight="700" fill="#444">31</text>',
  decA: '<text x="1" y="13" font-family="Arial" font-size="7.5" font-weight="700" fill="#444">,00</text><path d="M13 15h5M15.5 12.5v5" stroke="#2E9B3C" stroke-width="1.6"/>',
  decD: '<text x="1" y="13" font-family="Arial" font-size="7.5" font-weight="700" fill="#444">,0</text><path d="M13 15h5" stroke="#D93025" stroke-width="1.6"/>',
  indI: '<path d="M8 5h9M8 9h9M8 13h9M3 17h14M3 7l3 2.5L3 12" fill="none" stroke="#444" stroke-width="1.5"/>',
  indD: '<path d="M8 5h9M8 9h9M8 13h9M3 17h14M6 7L3 9.5 6 12" fill="none" stroke="#444" stroke-width="1.5"/>',
  brd: '<rect x="3" y="3" width="14" height="14" fill="none" stroke="#444" stroke-width="1.5"/><path d="M10 3v14M3 10h14" stroke="#999" stroke-dasharray="1.5 1.5"/>',
  cond: '<rect x="2" y="3" width="16" height="4" fill="#E8833A"/><rect x="2" y="8" width="11" height="4" fill="#F2C55C"/><rect x="2" y="13" width="6" height="4" fill="#4C9A3C"/>'
};
const svg = k => `<svg viewBox="0 0 20 20">${IC[k] || ''}</svg>`;
const STD = [['new', 'Создать', 1], ['open', 'Открыть'], ['save', 'Сохранить', 1], '|', ['pdf', 'Экспорт в PDF'], ['print', 'Печать'], ['prev', 'Предварительный просмотр'], '|', ['cut', 'Вырезать', 0, 'copy'], ['copy', 'Копировать (Ctrl+C)', 0, 'copy'], ['paste', 'Вставить (Ctrl+V)', 1, 'paste'], ['clone', 'Клонировать форматирование'], ['clear', 'Очистить прямое форматирование'], '|', ['undo', 'Отменить (Ctrl+Z)', 1, 'undo'], ['redo', 'Вернуть', 1], '|', ['find', 'Найти и заменить'], ['spell', 'Орфография'], '|', ['row', 'Строка', 1], ['col', 'Столбец', 1], '|', ['sort', 'Сортировка', 0, 'sort'], ['sortA', 'Сортировать по возрастанию', 0, 'sort'], ['sortD', 'Сортировать по убыванию', 0, 'sort'], ['filter', 'Автофильтр (Ctrl+Shift+L)', 0, 'af'], '|', ['image', 'Вставить изображение'], ['chart', 'Вставить диаграмму'], ['pivot', 'Сводная таблица'], '|', ['omega', 'Специальный символ', 1], ['link', 'Гиперссылка'], ['note', 'Комментарий'], '|', ['hdr', 'Колонтитулы'], ['area', 'Задать область печати', 1], ['freeze', 'Закрепить строки и столбцы', 1], ['split', 'Разделить окно'], '|', ['draw', 'Функции рисования']];
const FMT = ['font', 'size', ['bold', 'Полужирный'], ['ital', 'Курсив'], ['und', 'Подчёркнутый', 1], '|', ['fcol', 'Цвет шрифта', 1], ['bcol', 'Цвет фона', 1], '|', ['aL', 'По левому краю'], ['aC', 'По центру'], ['aR', 'По правому краю'], '|', ['wrap', 'Переносить текст'], ['merge', 'Объединить и центрировать'], '|', ['vT', 'По верхнему краю'], ['vM', 'По центру по вертикали'], ['vB', 'По нижнему краю'], '|', ['cur', 'Денежный', 1], ['pct', 'Процентный'], ['numf', 'Числовой'], ['date', 'Дата'], ['decA', 'Добавить десятичный знак'], ['decD', 'Удалить десятичный знак'], '|', ['indI', 'Увеличить отступ'], ['indD', 'Уменьшить отступ'], '|', ['brd', 'Обрамление', 1], ['cond', 'Условное форматирование', 1]];
function tb(el, list) {
  el.innerHTML = list.map(it => {
    if (it === '|') return '<span class="vs"></span>';
    if (it === 'font') return '<div class="cb" style="width:170px">Liberation Sans</div>';
    if (it === 'size') return '<div class="cb" style="width:70px">10 пт</div>';
    return `<button class="ic${it[2] ? ' wd' : ''}" title="${it[1]}" data-act="${it[3] || ''}" data-ic="${it[0]}">${svg(it[0])}</button>`;
  }).join('');
}
tb($('#tbStd'), STD); tb($('#tbFmt'), FMT);
$$('.tbar .ic').forEach(b => b.addEventListener('mousedown', e => {
  e.preventDefault(); const a = b.dataset.act;
  if (a === 'copy') copySel(); else if (a === 'paste') pasteClip(); else if (a === 'undo') undo(); else if (a === 'af') { if (edit) commit('none'); afToggle(); }
  else if (a === 'sort') toast('Сортировка в этом задании не нужна');
}));

/* ============================ boot & API ============================ */
let started = false;
function changed() { $('[data-act="af"]').classList.toggle('on', !!(S() && S().af)); window.TR && TR.onChange && TR.onChange(); }
function reset(task) { closePops(); buildBook(task); lastSheetShown = -1; gs.scrollTop = 0; gs.scrollLeft = 0; selectCell(0, 0); render(); changed(); }

window.TR = {
  WB, S, val, shown, disp, raw, fx, nrows, ncols, addr, LET, CIDX, RH, colX, visSet, dIdx, rowAt, rr, realK, wait, toast, sheetByName,
  get edit() { return edit; }, get clip() { return clip; }, get pop() { return pop; }, get menu() { return openMenuName; },
  get started() { return started; }, set started(v) { started = v; if (v) setTimeout(focusSink, 50); },
  focusSink,
  reset, render, selectCell, selectAll, selectCols, beginEdit, setEditText, insertRef, refText, toggleAbs, commit, cancelEdit, switchSheet, addSheet,
  copySel, pasteClip, autoFill, autoSum, afToggle, afOpen, afOk, afExpand, afToggleValue, afSetAll, afSetSearch, afEffective, openMenu, closePops, undo,
  caret: () => edit ? caret() : 0,
  els: { gs, gsp, ced, fIn, afp }
};
reset('lesson');
})();
