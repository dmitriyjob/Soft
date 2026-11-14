/* ion_inf · №13 — IP-адреса и маски: библиотека и виджеты урока */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const task = () => { let t = 0; return { next: () => ++t, alive: k => k === t, stop: () => ++t }; };
const NS = 'http://www.w3.org/2000/svg';
const S = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const H = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
const animOf = o => o.dir > 0 && !o.enter && !reduced();
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const card = (t, h, cls = '') => `<div class="fcard ${cls}"><h3>${t}</h3>${h}</div>`;
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
const fmt = n => Number(n).toLocaleString('ru-RU').replace(/\s/g, ' ');

const DP = window.DP = {};
DP.toast = msg => { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1900); };
const toast = DP.toast;
const confetti = (n = 90) => {
  if (reduced()) return;
  const cols = ['#B9521D', '#FFD8BE', '#2F855A', '#1F6FEB', '#6B46C1', '#B7791F', '#1D1D1F'], A = $('#app');
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div'); d.className = 'confetti';
    d.style.left = (Math.random() * 1600) + 'px'; d.style.background = cols[i % cols.length];
    A.appendChild(d);
    const dx = (Math.random() - .5) * 300, rot = Math.random() * 720;
    d.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${dx}px, ${920 + Math.random() * 120}px) rotate(${rot}deg)` }],
      { duration: 1800 + Math.random() * 1400, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 300 }).onfinish = () => d.remove();
  }
};

/* ================= арифметика IP ================= */
const ip2n = s => { const p = String(s).trim().split('.'); if (p.length !== 4) return null; let n = 0; for (const x of p) { if (!/^\d{1,3}$/.test(x) || +x > 255) return null; n = n * 256 + +x; } return n >>> 0; };
const n2ip = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
const maskN = p => p <= 0 ? 0 : p >= 32 ? 0xFFFFFFFF : ((0xFFFFFFFF << (32 - p)) >>> 0);
const bitsOf = n => Array.from({ length: 32 }, (_, i) => (n >>> (31 - i)) & 1);
const AND = (a, b) => (a & b) >>> 0;
const OR = (a, b) => (a | b) >>> 0;
const bcast = (ip, p) => OR(AND(ip, maskN(p)), (~maskN(p)) >>> 0);
const validP = (ip, net) => [...Array(33).keys()].filter(p => AND(ip, maskN(p)) === net);
const byteOf = (n, b) => (n >>> (24 - 8 * b)) & 255;
const bin8 = x => x.toString(2).padStart(8, '0');
const binIP = n => [0, 1, 2, 3].map(b => bin8(byteOf(n, b))).join('.');
const netStr = (ip, p) => n2ip(AND(ip, maskN(p))) + '/' + p;

/* ================= битовая доска ================= */
class Bits {
  constructor(host, o = {}) {
    this.o = o = Object.assign({ cw: 31, ch: 60, lw: 112, dw: 182, color: false, div: false, drag: false, p: 24, onP: null }, o);
    host.innerHTML = ''; host.className = 'bits' + (o.cls ? ' ' + o.cls : '') + (o.div ? ' hasdiv' : '');
    ['cw', 'ch', 'lw', 'dw'].forEach(k => host.style.setProperty('--' + k, o[k] + 'px'));
    this.host = host; this.R = {}; this.order = [];
    this.body = H('div', 'bbody', host);
    this.fx = H('div', 'bfx', host);
    (o.rows || []).forEach(r => this.addRow(r));
    if (o.div) {
      this.dv = H('div', 'bdiv', host); this.dh = H('div', 'bdh', this.dv, '<span></span>');
      this.zl = H('div', 'bzone net', host, 'адрес сети'); this.zr = H('div', 'bzone host', host, 'адрес узла');
      if (o.drag) this.dragify();
    }
    this.p = o.p;
  }
  addRow({ k, label, v = null, cls = '', dec }) {
    const el = H('div', 'brow ' + cls, this.body); el.dataset.k = k;
    const lab = H('div', 'blab', el, label);
    const cells = [], octs = [], fos = [];
    for (let o8 = 0; o8 < 4; o8++) {
      const g = H('div', 'boct', el);
      for (let b = 0; b < 8; b++) { const c = H('i', 'bc', g); c.dataset.i = o8 * 8 + b; cells.push(c); }
      const fo = H('div', 'bfo', g, '<b></b><small>8 бит ▸</small>');
      g.addEventListener('pointerdown', e => { if (g.classList.contains('fold')) e.stopPropagation(); });
      g.addEventListener('click', e => { if (!g.classList.contains('fold')) return; e.stopPropagation(); this.openOct(k, o8, true); });
      octs.push(g); fos.push(fo);
      if (o8 < 3) H('b', 'bdot', el, '.');
    }
    const decEl = H('div', 'bdec', el);
    this.R[k] = { el, lab, cells, octs, fos, dec: decEl, v: null }; this.order.push(k);
    if (v !== null) this.set(k, v, { dec });
    return this.R[k];
  }
  row(k) { return this.R[k]; }
  set(k, v, o = {}) {
    const r = this.R[k]; if (!r) return;
    const arr = Array.isArray(v) ? v : bitsOf(v);
    r.v = arr;
    arr.forEach((b, i) => {
      const c = r.cells[i], t = b === null || b === undefined ? '' : String(b);
      if (c.textContent !== t) { c.textContent = t; if (o.pop && !reduced()) { c.classList.remove('pp'); void c.offsetWidth; c.classList.add('pp'); } }
      c.classList.toggle('one', t === '1'); c.classList.toggle('zero', t === '0'); c.classList.toggle('q', t === '?');
    });
    if (o.dec !== undefined) r.dec.innerHTML = o.dec;
    else r.dec.innerHTML = arr.every(b => b === 0 || b === 1) ? n2ip(arr.reduce((s, b) => s * 2 + b, 0)) : '';
    r.fos.forEach((f, o8) => { const part = arr.slice(o8 * 8, o8 * 8 + 8); f.firstChild.textContent = part.every(b => b === 0 || b === 1) ? part.reduce((s, b) => s * 2 + b, 0) : part.every(b => b === '?') ? '?' : ''; });
  }
  /* свёрнутые байты: десятичное число, клик — открываются 8 бит */
  foldRows(keys, on = true) {
    keys.forEach(k => { const r = this.R[k]; if (!r) return; r.octs.forEach(g => { g.classList.add('inst'); g.classList.toggle('fold', on); }); r.el.classList.toggle('allfold', on); });
    void this.host.offsetWidth; this.octsAll().forEach(g => g.classList.remove('inst'));
    this.host.classList.toggle('foldhint', this.octsAll().some(g => g.classList.contains('fold')));
  }
  octsAll() { return this.order.flatMap(k => this.R[k].octs); }
  isFolded(k) { return this.R[k].octs.some(g => g.classList.contains('fold')); }
  openOct(k, o8, anim) {
    const r = this.R[k], g = r.octs[o8]; if (!g.classList.contains('fold')) return;
    const cs = r.cells.slice(o8 * 8, o8 * 8 + 8);
    if (anim && !reduced()) { cs.forEach((c, j) => { c.style.transitionDelay = (j * 45) + 'ms'; }); setTimeout(() => cs.forEach(c => { c.style.transitionDelay = ''; }), 900); g.classList.remove('fold'); }
    else { g.classList.add('inst'); g.classList.remove('fold'); void g.offsetWidth; g.classList.remove('inst'); }
    r.el.classList.toggle('allfold', r.octs.every(x => x.classList.contains('fold')));
    this.host.classList.toggle('foldhint', this.octsAll().some(x => x.classList.contains('fold')));
  }
  async unfold(keys, alive, gap = 120) {
    const list = [];
    for (let o8 = 0; o8 < 4; o8++) keys.forEach(k => { const r = this.R[k]; if (r && r.octs[o8].classList.contains('fold')) list.push([k, o8]); });
    if (reduced()) { list.forEach(([k, o8]) => this.openOct(k, o8, false)); return true; }
    for (const [k, o8] of list) { if (alive && !alive()) return false; this.openOct(k, o8, true); await wait(gap); }
    if (list.length) await wait(450);
    return !alive || alive();
  }
  setBit(k, i, b, pop) { const r = this.R[k]; const a = (r.v || Array(32).fill('')).slice(); a[i] = b; this.set(k, a, { pop: false, dec: r.dec.innerHTML }); if (pop && !reduced()) { const c = r.cells[i]; c.classList.remove('pp'); void c.offsetWidth; c.classList.add('pp'); } }
  dec(k, html) { this.R[k].dec.innerHTML = html; }
  show(k, on = true) { this.R[k].el.classList.toggle('off', !on); }
  mark(k, i, cls, on = true) { const r = this.R[k]; if (r && r.cells[i]) r.cells[i].classList.toggle(cls, on); }
  markRange(k, a, b, cls, on = true) { for (let i = a; i < b; i++) this.mark(k, i, cls, on); }
  col(i, cls, on = true) { this.order.forEach(k => this.mark(k, i, cls, on)); }
  clear(...cls) { $$('.bc', this.host).forEach(c => cls.forEach(x => c.classList.remove(x))); $$('.boct', this.host).forEach(c => cls.forEach(x => c.classList.remove(x))); }
  oct(k, o8, cls, on = true) { const r = this.R[k]; if (r) r.cells[o8 * 8].parentElement.classList.toggle(cls, on); }
  rel(el) { const hr = this.host.getBoundingClientRect(), k = hr.width / (this.host.offsetWidth || 1) || 1, r = el.getBoundingClientRect(); return { x: (r.left - hr.left) / k, y: (r.top - hr.top) / k, w: r.width / k, h: r.height / k }; }
  bx(i) {
    const cells = this.R[this.order[0]].cells;
    if (i <= 0) { const r = this.rel(cells[0]); return r.x - 4; }
    if (i >= 32) { const r = this.rel(cells[31]); return r.x + r.w + 4; }
    const a = this.rel(cells[i - 1]), b = this.rel(cells[i]);
    return (a.x + a.w + b.x) / 2;
  }
  setP(p, o = {}) {
    p = Math.max(o.min ?? 0, Math.min(o.max ?? 32, p)); this.p = p;
    if (this.o.color) this.order.forEach(k => { if (this.R[k].el.classList.contains('nocolor')) return; this.R[k].cells.forEach((c, i) => { c.classList.toggle('net', i < p); c.classList.toggle('host', i >= p); }); });
    if (this.dv) {
      const x = this.bx(p), x0 = this.bx(0), x1 = this.bx(32);
      this.dv.style.left = x + 'px'; this.dh.firstChild.textContent = '/' + p;
      this.zl.style.left = x0 + 'px'; this.zl.style.width = Math.max(0, x - x0) + 'px';
      this.zr.style.left = x + 'px'; this.zr.style.width = Math.max(0, x1 - x) + 'px';
      this.zl.classList.toggle('tiny', x - x0 < 90); this.zr.classList.toggle('tiny', x1 - x < 90);
    }
    if (o.fire !== false && this.o.onP) this.o.onP(p);
  }
  divOn(on) { if (this.dv) { this.host.classList.toggle('divon', on); } }
  dragify() {
    let down = false;
    const near = cx => { const hr = this.host.getBoundingClientRect(), k = hr.width / (this.host.offsetWidth || 1) || 1, x = (cx - hr.left) / k; let best = 0, bd = 1e9; for (let i = 0; i <= 32; i++) { const d = Math.abs(this.bx(i) - x); if (d < bd) { bd = d; best = i; } } return best; };
    const go = e => { if (!this.host.classList.contains('divon') || this.locked) return; const p = near(e.clientX); if (p !== this.p) this.setP(p); };
    this.host.addEventListener('pointerdown', e => { if (!this.host.classList.contains('divon') || this.locked) return; if (e.target.closest('input,button,.boct.fold')) return; down = true; this.host.setPointerCapture(e.pointerId); this.host.classList.add('dragging'); go(e); });
    this.host.addEventListener('pointermove', e => { if (down) go(e); });
    const up = () => { down = false; this.host.classList.remove('dragging'); };
    this.host.addEventListener('pointerup', up); this.host.addEventListener('pointercancel', up);
  }
  /* бит падает из строки a в строку c сквозь строку b */
  fall(a, b, c, i, res, ms = 520) {
    const A = this.R[a].cells[i], C = this.R[c].cells[i], pa = this.rel(A), pc = this.rel(C), bit = this.R[a].v[i];
    const f = H('i', 'bfall ' + (bit ? 'one' : 'zero'), this.fx, String(bit));
    f.style.left = pa.x + 'px'; f.style.top = pa.y + 'px'; f.style.width = pa.w + 'px'; f.style.height = pa.h + 'px';
    const gate = this.R[b].cells[i], open = this.R[b].v[i] === 1;
    gate.classList.add(open ? 'gopen' : 'gshut'); setTimeout(() => gate.classList.remove('gopen', 'gshut'), ms + 200);
    const dy = pc.y - pa.y;
    const kill = bit === 1 && !open;
    const an = f.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: `translateY(${dy * .55}px)`, opacity: 1, offset: .55 }, { transform: `translateY(${dy}px)`, opacity: kill ? .0 : 1 }], { duration: ms, easing: 'cubic-bezier(.5,0,.7,1)' });
    return new Promise(r => { an.onfinish = () => { f.remove(); this.setBit(c, i, res, true); if (kill) this.mark(c, i, 'killed'); r(); }; });
  }
  async andAnim(a, b, c, alive, stagger = 55) {
    const A = this.R[a].v, B = this.R[b].v, ps = [];
    this.set(c, Array(32).fill(''), { dec: '' });
    for (let i = 0; i < 32; i++) {
      if (!alive()) return false;
      this.col(i, 'bscan'); setTimeout(() => this.col(i, 'bscan', false), 260);
      ps.push(this.fall(a, b, c, i, A[i] & B[i]));
      await wait(stagger);
    }
    await Promise.all(ps); return alive();
  }
}

/* шаг 0 — байты свёрнуты (кликай), шаг 1 — раскрываются, дальше — как было */
function foldWrap(w, keys, capSel) {
  const inner = w.step, F = task();
  w.step = async function (el, s, o) {
    const fk = F.next(), alive = () => F.alive(fk), b = this.b, calm = Object.assign({}, o, { dir: 0 });
    if (s === 0) {
      await inner.call(this, el, 0, calm); if (!alive()) return;
      b.foldRows(keys, true);
      const c = $(capSel, el); if (c) c.insertAdjacentHTML('beforeend', '<span class="fhint"><b>Кликни по числам</b> — переведём в двоичную. Или жми «Дальше».</span>');
      return;
    }
    const r = inner.call(this, el, s - 1, s === 1 ? calm : o);
    if (s === 1 && animOf(o)) await b.unfold(keys, alive); else b.foldRows(keys, false);
    return r;
  };
  const lv = w.leave; w.leave = function (el) { F.stop(); if (lv) lv.call(this, el); };
  return w;
}

/* ================= табло (split-flap) ================= */
class Flap {
  constructor(parent, cls = '') {
    const e = this.el = H('div', 'flap ' + cls, parent);
    e.innerHTML = '<div class="fh fu"><span></span></div><div class="fh fd"><span></span></div><div class="fl"><div class="fh ff"><span></span></div><div class="fh fb"><span></span></div></div>';
    const sp = $$('span', e); this.su = sp[0]; this.sd = sp[1]; this.ff = sp[2]; this.fb = sp[3]; this.leaf = $('.fl', e);
    this.c = ' '; this.paint(' ');
  }
  paint(c) { this.su.textContent = this.sd.textContent = this.ff.textContent = this.fb.textContent = c; this.c = c; }
  flip(c, ms = 110) {
    return new Promise(res => {
      const old = this.c; this.c = c;
      this.su.textContent = c; this.sd.textContent = old; this.ff.textContent = old; this.fb.textContent = c;
      const an = this.leaf.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-180deg)' }], { duration: ms, easing: 'ease-in' });
      an.onfinish = () => { this.sd.textContent = c; this.ff.textContent = c; res(); };
    });
  }
  async to(c, alive, set = '0123456789') {
    if (c === this.c) return;
    if (reduced()) { this.paint(c); return; }
    const n = ri(1, 3), seq = [];
    for (let i = 0; i < n; i++) seq.push(set[ri(0, set.length - 1)]);
    seq.push(c);
    for (const x of seq) { if (alive && !alive()) { this.paint(c); return; } await this.flip(x); }
  }
}

const W = {};

/* ================= 1 · титул: табло ================= */
const HERO = [
  ['192.168.0.1', 'домашний роутер'], ['8.8.8.8', 'DNS Google'], ['127.0.0.1', 'localhost — это ты сам'],
  ['10.34.168.35', 'адрес с доски на занятии'], ['255.255.240.0', 'а это уже маска сети'], ['192.160.0.0', 'адрес сети: IP & маска']
];
W.hero = {
  init(el) {
    this.T = task(); this.rows = [];
    const host = $('#heroRows', el);
    for (let r = 0; r < 4; r++) {
      const row = H('div', 'brd-row', host), d = H('div', 'brd-dec', row), a = H('i', 'brd-ar', row, '→'), b = H('div', 'brd-bin', row);
      const dec = [0, 1, 2].map(() => new Flap(d, 'dec')), bin = [...Array(8)].map(() => new Flap(b, 'bin'));
      this.rows.push({ dec, bin, a });
    }
    this.i = 0;
  },
  step(el, s, o) { if (o.enter) this.loop(el); },
  leave() { this.T.stop(); },
  async loop(el) {
    const k = this.T.next(), alive = () => this.T.alive(k);
    while (alive()) {
      const [ip, cap] = HERO[this.i % HERO.length]; this.i++;
      $('#heroCap', el).textContent = cap; $('#heroIp', el).textContent = ip;
      const parts = ip.split('.').map(Number), jobs = [];
      parts.forEach((v, r) => {
        const ds = String(v).padStart(3, ' '), bs = bin8(v);
        this.rows[r].dec.forEach((f, j) => jobs.push(wait(j * 40 + r * 70).then(() => f.to(ds[j], alive))));
        this.rows[r].bin.forEach((f, j) => { f.el.classList.toggle('one', bs[j] === '1'); jobs.push(wait(160 + j * 45 + r * 70).then(() => f.to(bs[j], alive, '01'))); });
      });
      await Promise.all(jobs); if (!alive()) return;
      await wait(3200);
    }
  }
};

/* ================= зачем адрес: письмо → пакет ================= */
const AD = { phone: [150, 250], r1: [470, 120], r2: [700, 330], r3: [930, 130], srv: [1250, 240] };
const AD_L = [['phone', 'r1'], ['r1', 'r2'], ['r2', 'r3'], ['r3', 'srv'], ['r1', 'r3']];
const ease2 = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const tween = (ms, fn, alive) => new Promise(res => {
  if (reduced()) { fn(1, 1); return res(true); }
  const t0 = performance.now();
  const tick = now => { if (alive && !alive()) return res(false); const k = Math.min(1, Math.max(0, now - t0) / ms); fn(ease2(k), k); if (k < 1) requestAnimationFrame(tick); else res(true); };
  requestAnimationFrame(tick);
});
const LET = {
  go: { from: ['От: Ион', 'Москва, ул. Ленина, 12, кв. 5'], to: ['Кому: Ане', 'г. Казань, ул. Баумана,', 'д. 7, кв. 3'] },
  back: { from: ['От: Аня', 'Казань, ул. Баумана, 7, кв. 3'], to: ['Кому: Иону', 'г. Москва, ул. Ленина,', 'д. 12, кв. 5'] }
};
W.addr = {
  init(el) {
    this.T = task(); this.el = el;
    const g = this.svg = $('#adG', el);
    g.innerHTML = `<defs><linearGradient id="cloudG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF3FB"/><stop offset="1" stop-color="#E3EBF7"/></linearGradient></defs>`;
    /* ---------- сцена «почта» ---------- */
    const s0 = this.s0 = S('g', { class: 'ad-s0' }, g);
    const roads = S('g', { class: 'ad-roads' }, s0);
    AD_L.forEach(([a, b], i) => {
      const p = { x1: AD[a][0], y1: AD[a][1], x2: AD[b][0], y2: AD[b][1] };
      S('line', Object.assign({ class: 'ad-road' + (i === 4 ? ' alt' : '') }, p), roads);
      S('line', Object.assign({ class: 'ad-road-c' + (i === 4 ? ' alt' : '') }, p), roads);
    });
    this.po = {};
    [['r1', 'Почта · Москва'], ['r2', 'Сортировка'], ['r3', 'Почта · Казань']].forEach(([id, name]) => {
      const [x, y] = AD[id], p = S('g', { class: 'ad-po', transform: `translate(${x} ${y})` }, s0);
      S('rect', { x: -54, y: -30, width: 108, height: 60, rx: 8, class: 'ad-po-b' }, p);
      S('rect', { x: -62, y: -42, width: 124, height: 16, rx: 6, class: 'ad-po-r' }, p);
      S('rect', { x: -40, y: -16, width: 34, height: 24, rx: 3, class: 'ad-po-s' }, p);
      S('path', { d: 'M-40 -16 L-23 -3 L-6 -16', class: 'ad-po-sf' }, p);
      S('rect', { x: 10, y: -8, width: 24, height: 38, rx: 3, class: 'ad-po-d' }, p);
      const t = S('text', { x: 0, y: 50, class: 'ad-po-t' }, p); t.textContent = name;
      const bb = S('g', { class: 'ad-bub', transform: 'translate(0 -70)' }, p);
      const br = S('rect', { x: -96, y: -20, width: 192, height: 38, rx: 13 }, bb);
      S('path', { d: 'M-9 17 L0 28 L9 17 Z' }, bb);
      const bt = S('text', { x: 0, y: 0 }, bb);
      this.po[id] = { g: p, bb, bt, br };
    });
    const house = (pos, cls, role, who, plate) => {
      const [x, y] = pos, h = S('g', { class: 'ad-house ' + cls, transform: `translate(${x} ${y})` }, s0);
      S('path', { d: 'M-84 -6 L0 -80 L84 -6 Z', class: 'ad-roof' }, h);
      S('rect', { x: -66, y: -8, width: 132, height: 94, rx: 6, class: 'ad-wall' }, h);
      S('rect', { x: -14, y: 36, width: 28, height: 50, rx: 3, class: 'ad-door' }, h);
      [-50, 24].forEach(dx => S('rect', { x: dx, y: 8, width: 26, height: 22, rx: 3, class: 'ad-win' }, h));
      const pl = S('g', { class: 'ad-hpl' }, h); S('rect', { x: -84, y: 96, width: 168, height: 30, rx: 9 }, pl);
      const pt = S('text', { x: 0, y: 111 }, pl); pt.textContent = plate;
      const r = S('text', { x: 0, y: -116, class: 'ad-role' }, h); r.textContent = role;
      const w = S('text', { x: 0, y: -92, class: 'ad-who' }, h); w.textContent = who;
      return h;
    };
    this.hA = house(AD.phone, 'snd', 'ОТПРАВИТЕЛЬ', 'Ион', 'Москва · Ленина, 12');
    this.hB = house(AD.srv, 'rcv', 'ПОЛУЧАТЕЛЬ', 'Аня', 'Казань · Баумана, 7');
    const mailbox = (x, y, mirror) => {
      const mb = S('g', { class: 'ad-mb', transform: `translate(${x} ${y})${mirror ? ' scale(-1 1)' : ''}` }, s0);
      S('rect', { x: -3, y: 6, width: 6, height: 70, class: 'ad-mb-p' }, mb);
      S('path', { d: 'M-22 8 V-10 a22 18 0 0 1 44 0 V8 Z', class: 'ad-mb-b' }, mb);
      S('rect', { x: -14, y: -4, width: 28, height: 5, rx: 2, class: 'ad-mb-s' }, mb);
      const flag = S('g', { class: 'ad-mb-f' }, mb); S('rect', { x: 22, y: -16, width: 4, height: 24 }, flag); S('rect', { x: 22, y: -16, width: 18, height: 11, rx: 2 }, flag);
      const bx = Math.max(x, 96), bb = S('g', { class: 'ad-bub ok', transform: `translate(${bx} ${y - 72})` }, s0);
      S('rect', { x: -78, y: -20, width: 156, height: 38, rx: 13 }, bb); S('path', { d: `M${x - bx - 9} 17 L${x - bx} 28 L${x - bx + 9} 17 Z` }, bb);
      const t = S('text', { x: 0, y: 0 }, bb); t.textContent = 'Доставлено ✓';
      return { flag, bb };
    };
    this.mbB = mailbox(1352, 262, false); this.mbA = mailbox(44, 270, true);
    /* ---------- сцена «интернет» ---------- */
    const s1 = this.s1 = S('g', { class: 'ad-s1' }, g);
    S('path', { d: 'M330 180 C 300 60, 470 10, 560 60 C 620 -10, 780 0, 820 70 C 900 20, 1080 40, 1060 150 C 1140 200, 1110 330, 1000 340 C 990 430, 820 440, 760 390 C 690 450, 520 440, 500 370 C 380 400, 300 300, 330 180 Z', class: 'ad-cloud' }, s1);
    const lab = S('text', { x: 700, y: 52, class: 'ad-cloud-t' }, s1); lab.textContent = 'ИНТЕРНЕТ';
    AD_L.forEach(([a, b], i) => S('line', { x1: AD[a][0], y1: AD[a][1], x2: AD[b][0], y2: AD[b][1], class: 'ad-link' + (i === 4 ? ' alt' : '') }, s1));
    this.rt = {};
    [['r1', '62.105.4.1'], ['r2', '188.43.0.17'], ['r3', '213.180.1.9']].forEach(([id, ip]) => {
      const [x, y] = AD[id], r = S('g', { class: 'ad-router', transform: `translate(${x} ${y})` }, s1);
      S('rect', { x: -44, y: -20, width: 88, height: 40, rx: 12 }, r);
      [-24, -8, 8, 24].forEach(dx => S('circle', { cx: dx, cy: 0, r: 4, class: 'led' }, r));
      S('path', { d: 'M-26 -20 L-34 -46 M26 -20 L34 -46', class: 'ant' }, r);
      const t = S('text', { x: 0, y: 44, class: 'ad-ipsm' }, r); t.textContent = ip;
      this.rt[id] = r;
    });
    const ph = S('g', { class: 'ad-dev', transform: `translate(${AD.phone[0]} ${AD.phone[1] - 20})` }, s1);
    S('rect', { x: -44, y: -80, width: 88, height: 164, rx: 18, class: 'ad-phone' }, ph); S('rect', { x: -36, y: -68, width: 72, height: 136, rx: 8, class: 'ad-scr' }, ph);
    S('rect', { x: -26, y: -54, width: 52, height: 10, rx: 5, class: 'ad-bar' }, ph); S('rect', { x: -26, y: -36, width: 40, height: 8, rx: 4, class: 'ad-bar2' }, ph); S('rect', { x: -26, y: -22, width: 46, height: 8, rx: 4, class: 'ad-bar2' }, ph);
    const sv = S('g', { class: 'ad-dev', transform: `translate(${AD.srv[0]} ${AD.srv[1] - 14})` }, s1);
    for (let i = 0; i < 4; i++) { S('rect', { x: -64, y: -90 + i * 44, width: 128, height: 36, rx: 8, class: 'ad-rack' }, sv); S('circle', { cx: 44, cy: -72 + i * 44, r: 5, class: 'led' }, sv); S('rect', { x: -48, y: -76 + i * 44, width: 60, height: 8, rx: 4, class: 'ad-slot' }, sv); }
    this.chips = {};
    [['phone', 'Телефон', '95.24.13.7', 112], ['srv', 'Сервер игры', '185.12.24.7', 130]].forEach(([id, nm, ip, dy]) => {
      const [x, y] = AD[id], c = S('g', { class: 'ad-chip', transform: `translate(${x} ${y + dy})` }, s1);
      S('rect', { x: -86, y: -22, width: 172, height: 44, rx: 14 }, c);
      const t = S('text', { x: 0, y: 1, class: 'ad-chip-ip' }, c); t.textContent = ip;
      const n = S('text', { x: 0, y: -34, class: 'ad-chip-n' }, c); n.textContent = nm;
      this.chips[id] = c;
    });
    /* ---------- конверт-пакет (интернет) ---------- */
    const env = this.env = S('g', { class: 'ad-pkt' }, g);
    S('rect', { x: -84, y: -48, width: 168, height: 96, rx: 10, class: 'ad-env' }, env);
    S('path', { d: 'M-84 -48 L0 4 L84 -48', class: 'ad-env-flap' }, env);
    this.envTo = S('text', { x: -72, y: 22, class: 'ad-env-t' }, env); this.envFrom = S('text', { x: -72, y: 40, class: 'ad-env-t2' }, env);
    /* ---------- письмо (почта) ---------- */
    const lt = this.lt = S('g', { class: 'ad-let' }, g), li = S('g', { class: 'ad-let-i' }, lt);
    S('rect', { x: -104, y: -64, width: 208, height: 128, rx: 8, class: 'ad-lp' }, li);
    S('rect', { x: -98, y: -58, width: 196, height: 116, rx: 5, class: 'ad-lb ad-lb1' }, li);
    S('rect', { x: -98, y: -58, width: 196, height: 116, rx: 5, class: 'ad-lb ad-lb2' }, li);
    S('rect', { x: 62, y: -50, width: 28, height: 34, rx: 2, class: 'ad-lst' }, li);
    S('path', { d: 'M68 -26 l8 -14 l8 14 Z', class: 'ad-lst-i' }, li);
    [10, 24, 38].forEach(y => S('line', { x1: -14, y1: y + 3, x2: 92, y2: y + 3, class: 'ad-lline' }, li));
    this.lf = [S('text', { x: -90, y: -38, class: 'ad-lfk' }, li), S('text', { x: -90, y: -26, class: 'ad-lfs' }, li)];
    this.lto = [S('text', { x: -12, y: 10, class: 'ad-ltk' }, li), S('text', { x: -12, y: 24, class: 'ad-lts' }, li), S('text', { x: -12, y: 38, class: 'ad-lts' }, li)];
    this.pm = [0, 1].map(i => { const m = S('g', { class: 'ad-pm', transform: `translate(${36 - i * 34} ${-26 + i * 4}) rotate(${-16 + i * 22})` }, li); S('circle', { r: 19 }, m); S('circle', { r: 13, class: 'in' }, m); const t = S('text', { y: 1 }, m); return { m, t }; });
    this.li = li;
    this.letter('go'); this.placeL(700, 186, 2.05, -3);
  },
  letter(kind) {
    const L = LET[kind]; this.lt.classList.toggle('reply', kind === 'back');
    L.from.forEach((t, i) => { this.lf[i].textContent = t; }); L.to.forEach((t, i) => { this.lto[i].textContent = t; });
    this.pm.forEach(p => p.m.classList.remove('on'));
  },
  stamp(i, txt) { const p = this.pm[i]; p.t.textContent = txt; p.m.classList.remove('on'); void p.m.getBBox; p.m.classList.add('on'); },
  placeL(x, y, s, r = 0) { this.L = { x, y, s, r }; this.lt.setAttribute('transform', `translate(${x} ${y}) rotate(${r}) scale(${s})`); },
  async moveL(to, ms, alive) { const f = Object.assign({}, this.L); return tween(ms, e => this.placeL(f.x + (to.x - f.x) * e, f.y + (to.y - f.y) * e, f.s + (to.s - f.s) * e, f.r + ((to.r || 0) - f.r) * e), alive); },
  bubble(id, txt, on = true) { const b = this.po[id]; if (!b) return; if (txt) { b.bt.textContent = txt; const w = Math.max(120, txt.length * 10.4 + 34); b.br.setAttribute('x', -w / 2); b.br.setAttribute('width', w); } b.bb.classList.toggle('on', on); b.g.classList.toggle('hit', on); },
  async route(pts, bubbles, stamps, alive) {
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = AD[pts[i]];
      if (!await this.moveL({ x, y: y + 4, s: .58, r: 0 }, 760, alive)) return false;
      const id = pts[i];
      if (bubbles[id]) {
        this.bubble(id, bubbles[id]);
        if (stamps[id] !== undefined) this.stamp(stamps[id][0], stamps[id][1]);
        await wait(reduced() ? 0 : 900); if (!alive()) return false;
        this.bubble(id, null, false);
      }
    }
    return true;
  },
  place([x, y]) { this.env.setAttribute('transform', `translate(${x} ${y - 6})`); },
  leave() { this.T.stop(); Object.keys(this.po).forEach(id => this.bubble(id, null, false)); },
  async travel(pts, alive) {
    for (let i = 1; i < pts.length; i++) {
      const [a, b] = [AD[pts[i - 1]], AD[pts[i]]];
      if (!await tween(650, e => this.place([a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]), alive)) return false;
      const r = this.rt[pts[i]]; if (r) { r.classList.add('hit'); setTimeout(() => r.classList.remove('hit'), 500); await wait(240); }
    }
    return true;
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), g = this.svg;
    g.classList.toggle('net', s >= 3); g.classList.toggle('post', s >= 1 && s <= 2);
    Object.keys(this.po).forEach(id => this.bubble(id, null, false));
    this.env.classList.toggle('on', s >= 4 && s <= 5); this.env.classList.toggle('back', s === 5);
    Object.values(this.chips).forEach(c => c.classList.toggle('on', s >= 3)); Object.values(this.rt).forEach(r => r.classList.toggle('glow', s === 6));
    this.lt.classList.toggle('off', s >= 3);
    const H1 = ['Зачем вообще нужен <em>адрес</em>?', 'Письмо едет <em>по адресу</em>', 'Ответ — <em>обратно</em>', 'В интернете — <em>то же самое</em>', 'Пакет летит <em>по IP-адресу</em>', 'Ответ — <em>по адресу отправителя</em>', 'IP-адрес — <em>номер устройства</em> в сети'];
    $('#adHead', el).innerHTML = H1[s];
    const C = [
      'Адрес однозначно определяет место: <b>город, улица, дом, квартира</b>. На конверте их два — <b>кому</b> и <b>от кого</b>.',
      'Почта читает адрес <b>«кому»</b> и передаёт письмо дальше — пока оно не попадёт в нужный дом и квартиру.',
      'Аня хочет ответить. Куда? Адрес отправителя написан на конверте — ответ едет <b>обратно</b> по нему.',
      'В интернете всё так же. Вместо квартир — <b>устройства</b>, вместо почты — <b>роутеры</b>, а вместо адреса — <b>IP-адрес</b>.',
      'Телефон отправляет запрос. На «конверте» — <b>кому</b> и <b>от кого</b>. Роутеры читают адрес и передают дальше.',
      'Сервер видит, <b>откуда</b> пришёл запрос, и отправляет ответ по этому адресу. Без адреса ответ бы потерялся.',
      '<b>IP-адрес</b> — уникальный номер устройства в сети. В одной сети у всех устройств адреса <b>разные</b>.'
    ];
    $('#adCap', el).innerHTML = C[s];
    if (s >= 3) $('#adCap', el).insertAdjacentHTML('beforeend', s === 3 ? '<div class="ad-map"><span>квартира <i>→</i> <b>устройство</b></span><span>почта <i>→</i> <b>роутер</b></span><span>адрес <i>→</i> <b>IP-адрес</b></span></div>' : '');
    /* письмо */
    const MBB = { x: 1352, y: 256, s: .14, r: 0 }, MBA = { x: 44, y: 264, s: .14, r: 0 };
    const deliver = (side, on) => { const m = side === 'A' ? this.mbA : this.mbB, h = side === 'A' ? this.hA : this.hB; m.flag.classList.toggle('up', on); m.bb.classList.toggle('on', on); h.classList.toggle('lit', on); };
    deliver('A', s === 2); deliver('B', s === 1);
    this.lt.classList.toggle('gone', s === 1 || s === 2);
    if (s === 0) { this.letter('go'); this.placeL(700, 186, 2.05, -3); return; }
    if (s === 1) {
      this.letter('go');
      if (!anim) { this.stamp(0, 'МОСКВА'); this.stamp(1, 'КАЗАНЬ'); this.placeL(MBB.x, MBB.y, MBB.s, 0); return; }
      deliver('B', false); this.lt.classList.remove('gone');
      this.placeL(700, 186, 2.05, -3);
      await wait(250); if (!alive()) return;
      if (!await this.moveL({ x: AD.phone[0] + 30, y: AD.phone[1] + 10, s: .58, r: 0 }, 800, alive)) return;
      await wait(200); if (!alive()) return;
      const ok = await this.route(['phone', 'r1', 'r2', 'r3', 'srv'], { r1: 'В Казань? → дальше', r2: 'Казань — туда →', r3: 'Баумана, 7 — везу!' }, { r1: [0, 'МОСКВА'], r3: [1, 'КАЗАНЬ'] }, alive);
      if (!ok) return;
      if (!await this.moveL({ x: MBB.x, y: MBB.y - 30, s: .3, r: 0 }, 500, alive)) return;
      if (!await this.moveL(MBB, 260, alive)) return;
      this.lt.classList.add('gone'); deliver('B', true);
      return;
    }
    if (s === 2) {
      this.letter('back');
      if (!anim) { this.stamp(0, 'КАЗАНЬ'); this.stamp(1, 'МОСКВА'); this.placeL(MBA.x, MBA.y, MBA.s, 0); return; }
      deliver('A', false); this.lt.classList.remove('gone');
      this.placeL(AD.srv[0] - 30, AD.srv[1] + 10, .3, 0);
      await this.moveL({ x: AD.srv[0] - 30, y: AD.srv[1] + 10, s: .58, r: 0 }, 350, alive); if (!alive()) return;
      await wait(250); if (!alive()) return;
      const ok = await this.route(['srv', 'r3', 'r1', 'phone'], { r3: 'В Москву? → дальше', r1: 'Ленина, 12 — везу!' }, { r3: [0, 'КАЗАНЬ'], r1: [1, 'МОСКВА'] }, alive);
      if (!ok) return;
      if (!await this.moveL({ x: MBA.x, y: MBA.y - 30, s: .3, r: 0 }, 500, alive)) return;
      if (!await this.moveL(MBA, 260, alive)) return;
      this.lt.classList.add('gone'); deliver('A', true);
      return;
    }
    /* интернет */
    if (s === 4) {
      this.envTo.textContent = 'кому: 185.12.24.7'; this.envFrom.textContent = 'от: 95.24.13.7';
      if (anim) { this.place(AD.phone); await wait(350); if (!alive()) return; await this.travel(['phone', 'r1', 'r2', 'r3', 'srv'], alive); }
      else this.place(AD.srv);
    }
    if (s === 5) {
      this.envTo.textContent = 'кому: 95.24.13.7'; this.envFrom.textContent = 'от: 185.12.24.7';
      if (anim) { this.place(AD.srv); await wait(300); if (!alive()) return; await this.travel(['srv', 'r3', 'r1', 'phone'], alive); }
      else this.place(AD.phone);
    }
  }
};

/* ================= сети и устройства (после аналогии с домами) ================= */
const ICO = {
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19.5h20"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  tv: '<rect x="2.5" y="4" width="19" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/>',
  pc: '<rect x="3" y="3.5" width="18" height="12" rx="1.5"/><path d="M9 20.5h6M12 15.5v5"/>',
  board: '<rect x="2" y="3.5" width="20" height="12.5" rx="1"/><path d="M7.5 21l2.5-5M16.5 21l-2.5-5M6 8h8M6 11h5"/>',
  printer: '<path d="M6 9V3.5h12V9"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 13.5h10v7H7z"/>',
  term: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><rect x="8" y="5.5" width="8" height="5" rx="1"/><path d="M8.5 14h1M11.5 14h1M14.5 14h1M8.5 17.5h1M11.5 17.5h1M14.5 17.5h1"/>',
  tablet: '<rect x="4" y="2.5" width="16" height="19" rx="2.5"/><path d="M11 18.5h2"/>'
};
const ico = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`;
const NETS = [
  { name: 'Дом · Wi-Fi', net: '192.168.1', devs: [['laptop', 'Ноутбук', 2], ['phone', 'Телефон', 5], ['tv', 'Телевизор', 7]] },
  { name: 'Школа', net: '10.34.168', devs: [['pc', 'Компьютер', 5], ['printer', 'Принтер', 12], ['board', 'Доска', 35]] },
  { name: 'Кафе', net: '85.143.7', devs: [['term', 'Касса', 5], ['tablet', 'Планшет', 9], ['laptop', 'Ноутбук', 20]] }
];
const ipHTML = (net, h) => `<i class="np">${net}</i><i class="nh">.${h}</i>`;
const relIn = (el, root) => { const R = root.getBoundingClientRect(), k = R.width / (root.offsetWidth || 1) || 1, r = el.getBoundingClientRect(); return { x: (r.left - R.left + r.width / 2) / k, y: (r.top - R.top + r.height / 2) / k }; };
W.nets = {
  init(el) {
    this.T = task(); this.el = el; this.root = $('#nt', el); this.s = 0;
    const svg = $('#ntSvg', el);
    svg.innerHTML = '<defs><linearGradient id="ntCl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF3FB"/><stop offset="1" stop-color="#E1E9F6"/></linearGradient></defs>';
    [[220, 400], [704, 704], [1188, 1008]].forEach(([x, cx]) => S('path', { d: `M${x} 118 C ${x} 96, ${cx} 110, ${cx} 84`, class: 'nt-link' }, svg));
    S('path', { d: 'M420 70 C 380 20, 470 -8, 540 14 C 580 -14, 680 -16, 720 8 C 770 -14, 900 -8, 920 24 C 1000 18, 1020 72, 980 88 C 960 108, 880 104, 860 96 C 800 112, 640 112, 600 98 C 540 112, 440 108, 420 70 Z', class: 'nt-cloud' }, svg);
    const t = S('text', { x: 704, y: 56, class: 'nt-cloud-t' }, svg); t.textContent = 'ИНТЕРНЕТ';
    const host = $('#ntBlds', el); this.B = [];
    NETS.forEach((N, ni) => {
      const b = H('div', 'nbl', host); b.style.left = (ni * 484) + 'px'; b.style.animationDelay = (ni * 120) + 'ms';
      const rt = H('div', 'nb-rt', b, '<i></i><i></i><span><b></b><b></b><b></b></span>');
      const top = H('div', 'nb-top', b, `<span class="nb-name">${N.name}</span><span class="nb-plate"><small>сеть</small> <b>${N.net}</b>.0</span>`);
      const fl = H('div', 'nb-flats', b), devs = [];
      N.devs.forEach(([ic, nm, h]) => {
        const d = H('button', 'nd', fl, `<span class="nd-ic">${ico(ic)}</span><span class="nd-n">${nm}</span><span class="nd-ip">${ipHTML(N.net, h)}</span><span class="nd-kv">№ ${h}</span>`);
        d.dataset.h = h; d.dataset.n = ni; if (h === 5) d.classList.add('five');
        d.addEventListener('click', e => { e.currentTarget.blur(); this.click(ni, h, d); });
        devs.push({ el: d, h, nm });
      });
      this.B.push({ el: b, rt, devs, N });
    });
    this.pkt = $('#ntPkt', el);
  },
  dev(n, h) { return this.B[n].devs.find(d => d.h === h); },
  leave() { this.T.stop(); this.pkt.classList.remove('on'); },
  async send(fn, fh, tn, th, alive) {
    const P = this.pkt, root = this.root, to = $('.nt-pk-to', P), tip = $('.nt-pk-tip', P);
    const src = this.dev(fn, fh), dst = this.dev(tn, th), N = this.B[tn].N;
    to.innerHTML = 'кому: ' + ipHTML(N.net, th);
    P.classList.remove('lnet', 'lhost', 'in'); tip.textContent = '';
    $$('.nd', root).forEach(d => d.classList.remove('got', 'src'));
    src.el.classList.add('src');
    const at = p => { P.style.left = p.x + 'px'; P.style.top = p.y + 'px'; };
    const go = async (a, b, ms) => tween(ms, e => at({ x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e }), alive);
    const pos = { sd: relIn(src.el, root), sr: relIn(this.B[fn].rt, root), dr: relIn(this.B[tn].rt, root), dd: relIn(dst.el, root) };
    at(pos.sd); P.classList.add('on');
    const hit = n => { const r = this.B[n].rt; r.classList.add('hit'); setTimeout(() => r.classList.remove('hit'), 700); };
    await wait(reduced() ? 0 : 300); if (!alive()) return;
    if (!await go(pos.sd, pos.sr, 550)) return; hit(fn);
    if (fn !== tn) {
      P.classList.add('lnet'); tip.innerHTML = `какая сеть? → <b>${N.net}</b>`;
      const c1 = { x: pos.sr.x, y: 52 }, c2 = { x: pos.dr.x, y: 52 };
      if (!await go(pos.sr, c1, 420)) return;
      if (!await go(c1, c2, fn === tn ? 0 : 900)) return;
      if (!await go(c2, pos.dr, 420)) return; hit(tn);
      await wait(reduced() ? 0 : 450); if (!alive()) return;
    } else { tip.innerHTML = 'та же сеть — сразу к устройству'; await wait(reduced() ? 0 : 500); if (!alive()) return; }
    P.classList.remove('lnet'); P.classList.add('lhost'); tip.innerHTML = `какое устройство? → <b>.${th}</b>`;
    if (!await go(pos.dr, pos.dd, 550)) return;
    dst.el.classList.add('got'); P.classList.add('in');
    return true;
  },
  click(n, h, d) {
    if (this.s < 4) return;
    if (n === 0 && h === 2) { toast('Это отправитель — ноутбук дома'); return; }
    const k = this.T.next(); this.send(0, 2, n, h, () => this.T.alive(k));
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), R = this.root;
    this.s = s;
    for (let i = 1; i <= 5; i++) R.classList.toggle('s' + i, s >= i);
    R.classList.toggle('live', s >= 4);
    $$('.nd', R).forEach(d => d.classList.remove('got', 'src'));
    if (s < 4) this.pkt.classList.remove('on', 'lnet', 'lhost');
    const H1 = ['С IP — <em>то же самое</em>', 'Начало адреса — <em class="em-n">адрес сети</em>', 'Конец адреса — <em>номер устройства</em>', 'Номер <em>5</em> — в каждой сети', 'Сначала <em class="em-n">в сеть</em>, потом <em>к устройству</em>', 'Отправь <em>сам</em>'];
    $('#ntHead', el).innerHTML = H1[s];
    const C = [
      'Вместо улицы — интернет, вместо домов — <b class="cnet">сети</b>: домашний Wi-Fi, школа, кафе. Вместо квартир — <b class="chost">устройства</b>. У каждого устройства свой IP-адрес.',
      'У всех устройств одной сети <b>начало адреса одинаковое</b>. Это <b class="cnet">адрес сети</b> — как номер дома, общий для всех квартир.',
      'А последнее число у каждого своё — это <b class="chost">номер устройства</b> (узла) в сети. Как номер квартиры в доме.',
      'Номер <b>5</b> есть и дома, и в школе, и в кафе — как квартира 5 в разных домах. Но полные адреса разные: <span class="mono">192.168.1.5</span>, <span class="mono">10.34.168.5</span>, <span class="mono">85.143.7.5</span>.',
      'Письмо с ноутбука на школьную доску. Роутеры в интернете смотрят на <b class="cnet">адрес сети</b> — в какую сеть везти (как почтальон на номер дома). А роутер школы — на <b class="chost">номер устройства</b>.',
      'Кликни по любому устройству — отправим ему письмо с домашнего ноутбука.<span class="nt-note">Здесь граница — по последней точке. Но так бывает не всегда: где именно она проходит, говорит <b>маска</b>. Это дальше.</span>'
    ];
    $('#ntCap', el).innerHTML = C[s];
    if (s === 4) {
      if (anim) { await wait(500); if (!alive()) return; await this.send(0, 2, 1, 35, alive); }
      else { this.pkt.classList.remove('on'); this.dev(1, 35).el.classList.add('got'); this.dev(0, 2).el.classList.add('src'); }
    }
    if (s === 5) this.pkt.classList.remove('on');
  }
};

/* ================= аналогия: улица, дома, квартиры ================= */
const UL = [
  { n: 7, fl: 2, net: '192.168.1', c: '#F3ECE2' },
  { n: 12, fl: 3, net: '10.34.168', c: '#ECE9F3' },
  { n: 25, fl: 2, net: '85.143.7', c: '#E7F0E8' }
];
const UL_WIN = '<span class="ul-win"><i></i><i></i></span>';
W.street = {
  init(el) {
    this.T = task(); this.el = el; this.root = $('#ul', el); this.s = 0; this.ip = false;
    this.pkt = $('#ulPkt', el); this.post = $('#ulPost', el);
    const host = $('#ulHs', el); this.Hs = [];
    UL.forEach((d, hi) => {
      const h = H('div', 'ul-h', host); h.style.left = (158 + hi * 414) + 'px'; h.style.animationDelay = (hi * 120) + 'ms';
      h.style.setProperty('--fac', d.c);
      H('div', 'ul-roof', h);
      const body = H('div', 'ul-body', h);
      const plate = H('div', 'ul-plate', H('div', 'ul-top', body));
      const grid = H('div', 'ul-fl', body), flats = [];
      for (let r = d.fl - 1; r >= 0; r--) for (let c = 1; c <= 3; c++) {
        const f = r * 3 + c;
        const b = H('button', 'ul-f', grid, `${UL_WIN}<span class="ul-lb"></span>`);
        if (f === 5) b.classList.add('five');
        b.addEventListener('click', e => { e.currentTarget.blur(); this.click(hi, f); });
        flats[f] = b;
      }
      const door = H('div', 'ul-door', body, '<i></i>');
      this.Hs.push({ d, el: h, plate, flats, door });
    });
    [0, 1].forEach(i => { const t = H('i', 'ul-tree', host); t.style.left = (158 + i * 414 + 340 + 37 - 23) + 'px'; });
    this.label(false);
  },
  label(anim) {
    this.Hs.forEach(({ d, plate, flats }, hi) => {
      plate.innerHTML = this.ip ? `<small>сеть</small> <b>${d.net}</b>.0` : `<small>дом</small> <b>${d.n}</b>`;
      plate.classList.toggle('ip', this.ip);
      flats.forEach((b, f) => {
        if (!b) return;
        const lb = $('.ul-lb', b);
        lb.innerHTML = this.ip ? `<span class="ul-ip">${ipHTML(d.net, f)}</span>` : `<i class="uh">дом ${d.n}</i><i class="uf">кв. ${f}</i>`;
        lb.classList.remove('flip'); plate.classList.remove('flip');
        if (anim) { void lb.offsetWidth; lb.style.animationDelay = (hi * 140 + f * 35) + 'ms'; lb.classList.add('flip'); plate.style.animationDelay = (hi * 140) + 'ms'; plate.classList.add('flip'); }
      });
    });
  },
  clear() {
    this.pkt.classList.remove('on', 'lnet', 'lhost', 'in');
    $$('.ul-f', this.root).forEach(b => b.classList.remove('got'));
    this.Hs.forEach(H => H.plate.classList.remove('hit', 'nope'));
  },
  leave() { this.T.stop(); this.clear(); },
  async send(hi, f, alive) {
    const P = this.pkt, R = this.root, to = $('.nt-pk-to', P), tip = $('.nt-pk-tip', P), Hh = this.Hs[hi], d = Hh.d, dst = Hh.flats[f];
    const net = this.ip;
    to.innerHTML = 'кому: ' + (net ? ipHTML(d.net, f) : `<i class="np">дом ${d.n}</i>, <i class="nh">кв. ${f}</i>`);
    this.clear(); tip.innerHTML = '';
    const at = p => { P.style.left = p.x + 'px'; P.style.top = p.y + 'px'; };
    const go = (a, b, ms) => tween(reduced() ? 0 : ms, e => at({ x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e }), alive);
    const roadY = relIn($('.ul-road', R), R).y, st = relIn(this.post, R);
    let cur = { x: st.x, y: st.y + 20 };
    at(cur); P.classList.add('on', 'lnet');
    tip.innerHTML = net ? `ищем сеть <b>${d.net}</b>…` : `ищем дом <b>${d.n}</b>…`;
    await wait(reduced() ? 0 : 350); if (!alive()) return;
    const down = { x: cur.x + 40, y: roadY };
    if (!await go(cur, down, 300)) return; cur = down;
    for (let j = 0; j <= hi; j++) {
      const x = relIn(this.Hs[j].door, R).x, nxt = { x, y: roadY };
      if (!await go(cur, nxt, Math.abs(nxt.x - cur.x) * 1.15)) return; cur = nxt;
      const pl = this.Hs[j].plate;
      if (j < hi) {
        pl.classList.add('nope'); tip.innerHTML = net ? `${this.Hs[j].d.net} — не та сеть` : `дом ${this.Hs[j].d.n} — не тот`;
        await wait(reduced() ? 0 : 520); if (!alive()) return; pl.classList.remove('nope');
        tip.innerHTML = net ? `ищем сеть <b>${d.net}</b>…` : `ищем дом <b>${d.n}</b>…`;
      } else {
        pl.classList.add('hit'); tip.innerHTML = net ? `сеть <b>${d.net}</b> ✓` : `дом <b>${d.n}</b> ✓`;
        await wait(reduced() ? 0 : 600); if (!alive()) return;
      }
    }
    P.classList.remove('lnet'); P.classList.add('lhost');
    tip.innerHTML = net ? `теперь устройство <b>.${f}</b>` : `теперь квартира <b>${f}</b>`;
    const dr = relIn(Hh.door, R);
    if (!await go(cur, dr, 380)) return;
    if (!await go(dr, relIn(dst, R), 520)) return;
    dst.classList.add('got'); P.classList.add('in');
    return true;
  },
  click(hi, f) {
    if (this.s < 4) return;
    const k = this.T.next(); this.send(hi, f, () => this.T.alive(k));
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), R = this.root;
    this.s = s;
    for (let i = 1; i <= 5; i++) R.classList.toggle('s' + i, s >= i);
    R.classList.toggle('live', s >= 4);
    this.clear();
    const ip = s >= 5; if (ip !== this.ip) { this.ip = ip; this.label(anim); }
    $('#ulHead', el).innerHTML = ['Как письмо находит <em>квартиру</em>?', 'Номер дома — <em class="em-n">общий</em>', 'Номер квартиры — <em>у каждой свой</em>', 'Квартира 5 — <em>в каждом доме</em>', 'Сначала <em class="em-n">дом</em>, потом <em>квартира</em>', 'А теперь — <em>IP-адрес</em>'][s];
    const C = [
      'На улице дома, в домах квартиры. Чтобы письмо дошло, на конверте пишут два числа: <b class="cnet">номер дома</b> и <b class="chost">номер квартиры</b>.',
      'У всех квартир одного дома <b class="cnet">номер дома одинаковый</b>. Дом 12 — общий для кв. 1, кв. 2… кв. 9.',
      'А <b class="chost">номер квартиры</b> у каждой свой. Двух квартир 5 в одном доме не бывает.',
      'Но кв. 5 есть и в доме 7, и в доме 12, и в доме 25. Одно «кв. 5» — непонятно, куда нести. А <span class="mono">дом 12, кв. 5</span> — такая квартира одна на всей улице.',
      'Почтальон сначала ищет <b class="cnet">дом</b> — идёт по улице и смотрит на таблички. В нужном доме ищет <b class="chost">квартиру</b>.<span class="nt-note">Кликни любую квартиру — письмо поедет туда.</span>',
      '<span class="ul-map"><span>номер дома <i>→</i> <b class="cnet">адрес сети</b></span><span>номер квартиры <i>→</i> <b class="chost">номер устройства</b></span></span>IP-адрес устроен так же: начало — <b class="cnet">адрес сети</b>, конец — <b class="chost">номер устройства</b> в ней.'
    ];
    $('#ulCap', el).innerHTML = C[s];
    if (s === 4) {
      if (anim) { await wait(450); if (!alive()) return; await this.send(1, 5, alive); }
      else this.Hs[1].flats[5].classList.add('got');
    }
  }
};

/* ================= 4 байта ================= */
const BYQ = [['10.34.168.35', true, 'Да: четыре числа, все от 0 до 255. Этот адрес был у нас на доске.'], ['256.10.1.1', false, 'Нет: 256 в один байт не влезет, максимум 255.'], ['192.168.1', false, 'Нет: только три числа, а нужно четыре.'], ['0.0.0.0', true, 'Формально да: четыре нуля — допустимые байты.'], ['1.2.3.4.5', false, 'Нет: пять чисел — лишнее.']];
W.bytes = {
  init(el) {
    const host = $('#byChips', el);
    BYQ.forEach(([t, ok, why]) => {
      const b = H('button', 'by-chip', host, `<span class="mono">${t}</span><i></i>`);
      b.addEventListener('click', e => { e.currentTarget.blur(); b.classList.add(ok ? 'ok' : 'no'); $('i', b).textContent = ok ? '✓' : '✕'; toast(why); });
    });
  },
  step(el, s) {
    $('#byHead', el).innerHTML = ['Четыре числа <em>через точку</em>', 'Каждое число — <em>1 байт</em>', '1 байт = <em>8 бит</em>', 'Байт: от 0 до <em>255</em>', 'Проверь себя'][s];
    $('#byIp', el).classList.toggle('lift', s >= 1);
  }
};

/* ================= собери байт ================= */
W.byte = {
  init(el) {
    this.el = el; this.v = 0; this.goal = null;
    const row = $('#swRow', el); this.sw = [];
    [128, 64, 32, 16, 8, 4, 2, 1].forEach((w, i) => {
      const b = H('button', 'sw', row, `<small>${w}</small><span class="sw-k"><i></i></span><b>0</b>`);
      b.addEventListener('click', e => { e.currentTarget.blur(); this.v ^= (128 >> i); this.render(true); });
      this.sw.push(b);
    });
    const goals = $('#swGoals', el); H('span', 'sw-gl', goals, 'Собери:');
    [192, 168, 255, 1, 10, 34].forEach(n => { const b = H('button', 'sw-g', goals, String(n)); b.addEventListener('click', e => { e.currentTarget.blur(); this.goal = n; $$('.sw-g', goals).forEach(x => x.classList.toggle('on', x === b)); this.render(); toast(`Собери ${n} переключателями`); }); });
    const inp = $('#calcIn', el);
    inp.addEventListener('input', () => { const t = inp.value.replace(/\D/g, ''); inp.value = t; if (t === '') return; const n = +t; if (n > 255) { inp.classList.add('bad'); toast('Больше 255 в байт не влезет'); return; } inp.classList.remove('bad'); this.v = n; this.render(); });
    this.render();
  },
  render(flash) {
    const v = this.v, el = this.el;
    this.sw.forEach((b, i) => { const on = !!(v & (128 >> i)); b.classList.toggle('on', on); $('b', b).textContent = on ? 1 : 0; });
    const parts = [128, 64, 32, 16, 8, 4, 2, 1].filter(w => v & w);
    $('#swSum', el).innerHTML = `<span class="mono">${bin8(v)}</span> <i>=</i> ${parts.length ? parts.join(' + ') + (parts.length > 1 ? ' = ' : '') : ''}<b>${parts.length > 1 || !parts.length ? v : ''}</b>`;
    if (parts.length === 1) $('#swSum', el).innerHTML = `<span class="mono">${bin8(v)}</span> <i>=</i> <b>${v}</b>`;
    $('#calcV', el).textContent = v; $('#cDec', el).textContent = v; $('#cHex', el).textContent = v.toString(16).toUpperCase(); $('#cOct', el).textContent = v.toString(8);
    $('#cBin', el).textContent = bin8(v).replace(/(\d{4})(\d{4})/, '$1 $2');
    if (this.goal !== null && v === this.goal) { confetti(60); toast(`Есть! ${v} = ${bin8(v)}`); $$('.sw-g', el).forEach(x => { if (x.classList.contains('on')) x.classList.add('done'); }); this.goal = null; }
  },
  step() {}
};

/* ================= 192.168.0.1 → двоичный: ровно 8 бит ================= */
W.tobin = {
  init(el) {
    this.T = task(); this.rows = [];
    const host = $('#tbRows', el);
    [192, 168, 0, 1].forEach(v => {
      const r = H('div', 'tb-row', host); H('b', 'tb-dec', r, String(v)); H('i', 'tb-ar', r, '→');
      const fl = H('div', 'tb-fl', r), flaps = [...Array(8)].map(() => new Flap(fl, 'bin fbig'));
      const cnt = H('span', 'tb-cnt', r), note = H('span', 'tb-note', r);
      this.rows.push({ r, v, flaps, cnt, note });
    });
  },
  leave() { this.T.stop(); },
  count(row, n) { row.cnt.classList.add('on'); row.cnt.classList.toggle('good', n === 8); row.cnt.classList.toggle('bad', n < 8); row.cnt.innerHTML = n === 8 ? '8 бит ✓' : `${n} из 8`; },
  async render(row, st, anim, alive, note) {
    const bs = bin8(row.v), short = row.v.toString(2), lead = 8 - short.length;
    row.r.classList.toggle('on', st !== 'off');
    row.note.innerHTML = note || '';
    if (st === 'off') { row.cnt.classList.remove('on'); row.flaps.forEach(f => { f.el.classList.remove('pad', 'one', 'hole'); f.paint(' '); }); return; }
    if (st === 'short' || (st === 'pad' && anim)) {
      const n = short.length;
      row.flaps.forEach((f, j) => { f.el.classList.toggle('hole', j < lead); f.el.classList.remove('pad'); f.el.classList.toggle('one', j >= lead && bs[j] === '1'); if (j < lead) f.paint(' '); });
      this.count(row, n);
      const jobs = row.flaps.map((f, j) => j >= lead ? (anim ? wait((j - lead) * 70).then(() => f.to(bs[j], alive, '01')) : f.paint(bs[j])) : null);
      await Promise.all(jobs);
      if (st === 'short') return;
      await wait(reduced() ? 0 : 900); if (!alive()) return;
      for (let j = lead - 1; j >= 0; j--) {
        const f = row.flaps[j]; f.el.classList.remove('hole'); f.el.classList.add('pad');
        await f.to('0', alive, '0'); this.count(row, 8 - j);
        await wait(reduced() ? 0 : 70); if (!alive()) return;
      }
      return;
    }
    /* full / pad без анимации */
    this.count(row, 8);
    const jobs = [];
    row.flaps.forEach((f, j) => {
      f.el.classList.remove('hole'); f.el.classList.toggle('pad', st === 'pad' && j < lead); f.el.classList.toggle('one', bs[j] === '1');
      if (anim) jobs.push(wait(j * 70).then(() => f.to(bs[j], alive, '01'))); else f.paint(bs[j]);
    });
    await Promise.all(jobs);
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), R = this.rows;
    const ST = [s >= 1 ? 'full' : 'off', s >= 2 ? 'full' : 'off', s >= 4 ? 'pad' : s === 3 ? 'short' : 'off', s >= 5 ? 'pad' : 'off'];
    const NOTE = [
      '128 + 64 — уже <b>8 цифр</b>',
      '128 + 32 + 8 — тоже <b>8</b>',
      ST[2] === 'short' ? 'калькулятор выдаёт просто <b>«0»</b> — одна цифра' : 'дописали <b>7 нулей слева</b>',
      'было «1» → дописали <b>7 нулей слева</b>'
    ];
    R.forEach((row, i) => row.r.classList.toggle('cur', (s === 1 && i === 0) || (s === 2 && i === 1) || ((s === 3 || s === 4) && i === 2) || (s === 5 && i === 3)));
    const jobs = R.map((row, i) => {
      const fresh = (i === 0 && s === 1) || (i === 1 && s === 2) || (i === 2 && (s === 3 || s === 4)) || (i === 3 && s === 5);
      if (i === 2 && s === 4 && anim) return this.padOnly(row, alive, NOTE[2]);
      return this.render(row, ST[i], anim && fresh, alive, ST[i] === 'off' ? '' : NOTE[i]);
    });
    const H1 = ['192.168.0.1 — <em>в двоичном</em>', '192.168.0.1 — <em>в двоичном</em>', '192.168.0.1 — <em>в двоичном</em>', 'Ноль — это <em>одна цифра</em>?', 'Дописываем <em>нули слева</em>', 'Единица — <em>тоже 8 бит</em>', 'Почему нули <em>именно слева</em>?', 'Так адрес видит <em>компьютер</em>'];
    $('#tbHead', el).innerHTML = H1[s];
    const line = $('#tbLine', el);
    line.classList.toggle('on', s >= 3);
    if (s === 3 || s === 4 || s === 5) line.innerHTML = '<div class="tb-rule"><b>Правило:</b> каждый кусочек IP — <b>ровно 8 цифр</b>. Калькулятор и <span class="mono">bin()</span> лишние нули не пишут — дописываем их <b>слева</b> сами.</div>';
    else if (s === 6) {
      const cells = t => [...t].map(c => `<i class="${c === '1' ? 'one' : ''}">${c}</i>`).join('');
      line.innerHTML = `<div class="tb-cmp"><div class="tb-cr pv"><span>вес разряда</span>${[128, 64, 32, 16, 8, 4, 2, 1].map(w => `<i>${w}</i>`).join('')}<em></em></div>
        <div class="tb-cr ok"><span>нули слева</span>${cells('00000001')}<em>= 1 ✓ <small>число не изменилось</small></em></div>
        <div class="tb-cr bad"><span>нули справа</span>${cells('10000000')}<em>= 128 ✕ <small>уже другое число!</small></em></div></div>`;
    } else if (s >= 7) line.innerHTML = '<span class="mono">11000000.10101000.00000000.00000001</span><small>Каждый кусочек — <b>ровно 8</b> символов. Не хватает — дописываем нули <b>слева</b>.</small>';
    else line.innerHTML = '';
    await Promise.all(jobs);
  },
  async padOnly(row, alive, note) {
    const bs = bin8(row.v), lead = 8 - row.v.toString(2).length;
    row.r.classList.add('on'); row.note.innerHTML = note;
    row.flaps.forEach((f, j) => { if (j >= lead) f.paint(bs[j]); });
    for (let j = lead - 1; j >= 0; j--) {
      const f = row.flaps[j]; f.el.classList.remove('hole'); f.el.classList.add('pad');
      await f.to('0', alive, '0'); if (!alive()) return; this.count(row, 8 - j);
      await wait(reduced() ? 0 : 70); if (!alive()) return;
    }
  }
};

/* ================= дом и квартира ================= */
function digitGrid(host, rows, n) {
  host.innerHTML = ''; const R = {};
  rows.forEach(([k, label, cls]) => {
    const el = H('div', 'dg-row ' + (cls || ''), host); H('span', 'dg-lab', el, label);
    const cells = [...Array(n)].map(() => H('i', 'dg-c', el));
    R[k] = { el, cells };
  });
  const div = H('div', 'dg-div', host);
  return { R, div, host, set(k, s, pop) { [...s].forEach((c, i) => { const e = R[k].cells[i]; if (e.textContent !== c) { e.textContent = c; if (pop && !reduced()) { e.classList.remove('pp'); void e.offsetWidth; e.classList.add('pp'); } } }); },
    at(i) { const c = R[rows[0][0]].cells, hr = host.getBoundingClientRect(), k = hr.width / (host.offsetWidth || 1) || 1; if (i >= c.length) { const r = c[c.length - 1].getBoundingClientRect(); return (r.right - hr.left) / k + 6; } const r = c[i].getBoundingClientRect(); return (r.left - hr.left) / k - 6; },
    divAt(i) { div.style.left = this.at(i) + 'px'; } };
}
/* палку в digitGrid можно таскать мышью */
function dragBar(g, min, max, onCut, onGrab) {
  const host = g.host; host.classList.add('dragbar');
  H('div', 'dg-h', g.div, '<span>‹</span><b></b><span>›</span>');
  let down = false;
  const near = cx => { const hr = host.getBoundingClientRect(), k = hr.width / (host.offsetWidth || 1) || 1, x = (cx - hr.left) / k; let best = min, bd = 1e9; for (let i = min; i <= max; i++) { const d = Math.abs(g.at(i) - x); if (d < bd) { bd = d; best = i; } } return best; };
  host.addEventListener('pointerdown', e => { down = true; onGrab && onGrab(); host.setPointerCapture(e.pointerId); host.classList.add('dragging'); onCut(near(e.clientX)); });
  host.addEventListener('pointermove', e => { if (down) onCut(near(e.clientX)); });
  const up = () => { down = false; host.classList.remove('dragging'); };
  host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
}
/* многоэтажка: k мест под квартиру → до 10^k квартир */
function tower(svg, k, home, flat) {
  svg.innerHTML = '';
  const rows = [2, 3, 5, 7, 8][k - 1], cols = 5, ww = 36, wh = 24, gx = 14, gy = 14;
  const bw = cols * ww + (cols - 1) * gx + 44, bh = rows * wh + (rows - 1) * gy + 96, x0 = 40 + (300 - bw) / 2 + 30, y1 = 470, y0 = y1 - bh, cx = x0 + bw / 2;
  S('rect', { x: 20, y: y1, width: 400, height: 6, rx: 3, class: 'hs-ground' }, svg);
  S('rect', { x: x0, y: y0, width: bw, height: bh, rx: 10, class: 'hs-b' }, svg);
  S('rect', { x: x0 - 10, y: y0 - 16, width: bw + 20, height: 24, rx: 8, class: 'hs-roof' }, svg);
  const pw = Math.max(118, 70 + home.length * 15);
  S('rect', { x: cx - pw / 2, y: y0 - 62, width: pw, height: 40, rx: 11, class: 'hs-plate' }, svg);
  const pt = S('text', { x: cx, y: y0 - 42, class: 'hs-plate-t' }, svg); pt.textContent = 'дом ' + home;
  const n = rows * cols, lit = ((parseInt(flat, 10) * 7 + 3) % rows) * cols + cols - 1;
  let lw = null;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c, x = x0 + 22 + c * (ww + gx), y = y0 + 24 + r * (wh + gy);
    const w = S('rect', { x, y, width: ww, height: wh, rx: 4, class: 'hs-w' + (i === lit ? ' lit' : '') }, svg);
    if (i === lit) lw = { x, y };
  }
  S('rect', { x: cx - 22, y: y1 - 50, width: 44, height: 50, rx: 4, class: 'hs-door' }, svg);
  if (lw) {
    const tw = 36 + flat.length * 13, tx = x0 + bw + 16, ty = lw.y + wh / 2;
    S('path', { d: `M${lw.x + ww} ${ty} H${tx}`, class: 'hs-tagl' }, svg);
    S('rect', { x: tx, y: ty - 17, width: tw + 22, height: 34, rx: 10, class: 'hs-tag' }, svg);
    const t = S('text', { x: tx + 11 + tw / 2, y: ty + 1, class: 'hs-tag-t' }, svg); t.textContent = 'кв. ' + flat;
  }
  const cap = S('text', { x: cx, y: y1 + 34, class: 'hs-cnt' }, svg);
  cap.innerHTML = `${k} ${plural(k, 'место', 'места', 'мест')} под квартиру → до <tspan>${fmt(10 ** k)}</tspan> квартир`;
}
const HS = '512466';
W.house = {
  init(el) {
    this.T = task(); this.el = el; this.cut = 3; this.s = 0;
    this.g = digitGrid($('#hsGrid', el), [['a', 'Адрес'], ['m', 'Маска', 'mask'], ['r', 'Дом', 'res']], 6);
    this.g.set('a', HS);
    dragBar(this.g, 1, 5, c => { if (c !== this.cut) this.setCut(c); }, () => this.T.next());
  },
  leave() { this.T.stop(); },
  setCut(c) {
    this.cut = c; const g = this.g, s = this.s, home = HS.slice(0, c), flat = HS.slice(c), z = '0'.repeat(6 - c);
    g.divAt(c);
    g.R.a.cells.forEach((e, i) => { e.classList.toggle('dhome', i < c); e.classList.toggle('dflat', i >= c); });
    g.set('m', '1'.repeat(c) + z, s >= 1); g.R.m.cells.forEach((e, i) => e.classList.toggle('m1', i < c));
    if (s >= 2) { g.set('r', home + z); g.R.r.cells.forEach((e, i) => { e.classList.toggle('dhome', i < c && s >= 3); e.classList.toggle('dz', i >= c); }); }
    tower($('#hsG', this.el), 6 - c, home, flat);
    const C = [
      `Номер записан одной строкой: <span class="mono">${HS}</span>. Палка после ${c}-й цифры → <b class="cnet">дом ${home}</b>, <b class="chost">квартира ${flat}</b>. Сдвинь — и дом уже другой! <b>Непонятно</b>, где граница.`,
      `Подсказка — <b>маска</b>: единицы над домом, нули над квартирой. Двигай палку — маска едет вместе с ней: <span class="mono">${'1'.repeat(c) + z}</span>.`,
      `Умножаем цифру на цифру: на 1 — остаётся, на 0 — ноль. Получаем номер дома: <span class="mono">${home + z}</span>.`,
      `Слева от границы — <b class="cnet">дом ${home}</b> (адрес сети). Справа — <b class="chost">квартира ${flat}</b> (адрес узла).`,
      'IP-адрес = <b class="cnet">адрес сети</b> + <b class="chost">адрес узла</b>. Маска показывает границу: где единицы — сеть, где нули — устройство. Только всё <b>в двоичном</b>.'
    ];
    $('#hsCap', this.el).innerHTML = C[s];
    $('#hsHead', this.el).innerHTML = ['Где тут <em>дом</em>, а где <em>квартира</em>?', 'Подсказка — <em>маска</em>', 'Умножаем <em>цифра на цифру</em>', `Дом <em>${home}</em>, квартира <em>${flat}</em>`, 'С IP — <em>то же самое</em>'][s];
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), g = this.g;
    this.s = s;
    g.R.m.el.classList.toggle('off', s < 1); g.R.r.el.classList.toggle('off', s < 2);
    g.div.classList.add('on');
    $$('.dg-c', g.host).forEach(c => c.classList.remove('pp'));
    if (s === 0) {
      this.setCut(3);
      const opts = [1, 2, 4, 5, 3]; let i = 0;
      await wait(1400);
      while (alive()) { this.setCut(opts[i++ % opts.length]); await wait(reduced() ? 2400 : 1300); }
      return;
    }
    if (s === 1 || o.dir < 0) this.setCut(3); else this.setCut(this.cut);
    if (s === 2 && anim) {
      const c = this.cut, res = HS.slice(0, c) + '0'.repeat(6 - c);
      g.set('r', '      ');
      for (let i = 0; i < 6; i++) { await wait(220); if (!alive()) return; g.set('r', res.slice(0, i + 1).padEnd(6, ' '), true); g.R.r.cells[i].classList.toggle('dz', i >= c); }
    }
  }
};

/* ================= как поделить IP? ================= */
const MK_IP = ip2n('192.168.0.1'), MK_M = ip2n('255.240.0.0');
W.split = {
  init(el) {
    this.T = task(); this.el = el;
    this.b = new Bits($('#spB', el), { rows: [{ k: 'ip', label: 'IP', v: MK_IP }], div: true, p: 16, ch: 66 });
    this.b.zl.textContent = 'адрес сети?'; this.b.zr.textContent = 'адрес узла?';
  },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), b = this.b;
    $('#spHead', el).innerHTML = ['Как поделить <em>IP-адрес</em>?', 'Где <em>граница</em>?'][s];
    const side = $('#spSide', el);
    if (s === 0) {
      b.foldRows(['ip'], true); b.host.classList.remove('divvis', 'zones');
      side.innerHTML = card('Вопрос', 'IP-адрес состоит из двух частей: <b class="cnet">адрес сети</b> и <b class="chost">адрес узла</b> (устройства). Где кончается одно и начинается другое?') + card('Компьютер видит двоичный', '<b>Кликни по числу</b> — откроются его 8 бит. Или жми «Дальше» — откроются все.');
      return;
    }
    side.innerHTML = card('Пополам? По точкам?', 'Хочется поделить пополам или по точке. Но <b>угадать нельзя</b>: граница бывает в любом месте — даже посреди байта.') + card('Что поможет', 'Разберёмся на привычном — <b>дом и квартира</b>. А потом вернёмся к IP.', 'dark');
    if (anim) { if (!await b.unfold(['ip'], alive)) return; } else b.foldRows(['ip'], false);
    b.host.classList.add('divvis', 'zones');
    const pos = [[16, 'пополам?'], [24, 'по точке?'], [8, 'по точке?'], [12, '?'], [20, '?'], [27, '?']]; let i = 0;
    while (alive()) { const [p, t] = pos[i++ % pos.length]; b.setP(p, { fire: false }); b.dh.firstChild.textContent = t; await wait(reduced() ? 2400 : 1200); }
  }
};

/* ================= маска ================= */
const MKQ = [['255.255.255.0', true], ['255.255.0.255', false], ['255.240.0.0', true], ['255.255.250.0', false], ['255.255.255.252', true]];
W.mask = {
  init(el) {
    this.T = task(); this.el = el;
    this.b = new Bits($('#mkB', el), { rows: [{ k: 'ip', label: 'IP', v: MK_IP }, { k: 'm', label: 'Маска', v: MK_M, cls: 'mask' }], div: true, drag: true, color: false, p: 12, onP: p => this.onP(p) });
    const host = $('#mkChips', el);
    MKQ.forEach(([t, ok]) => {
      const b = H('button', 'by-chip', host, `<span class="mono">${t}</span><i></i>`);
      b.addEventListener('click', e => {
        e.currentTarget.blur(); b.classList.add(ok ? 'ok' : 'no'); $('i', b).textContent = ok ? '✓' : '✕';
        const bs = binIP(ip2n(t)); let html = ''; let z = false;
        for (const ch of bs) { if (ch === '.') { html += '<i>.</i>'; continue; } const bad = z && ch === '1'; if (ch === '0') z = true; html += `<b class="${ch === '1' ? 'one' : 'zero'}${bad ? ' bad' : ''}">${ch}</b>`; }
        $('#mkBin', this.el).innerHTML = `<span>${t}</span><div>${html}</div><small>${ok ? 'Сначала единицы, потом нули — <b>маска</b>.' : 'После нуля снова единица — <b>так нельзя</b>.'}</small>`;
      });
    });
  },
  onP(p) {
    if (!this.free) return;
    this.b.set('m', maskN(p), { dec: n2ip(maskN(p)) });
    const lv = $('#mkLive', this.el);
    if (lv) lv.innerHTML = `<small>сейчас</small><b>/${p}</b><span class="mono">${n2ip(maskN(p))}</span><em>${p} ${plural(p, 'единица', 'единицы', 'единиц')} · ${32 - p} ${plural(32 - p, 'ноль', 'нуля', 'нулей')}</em>`;
  },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), b = this.b;
    this.free = false; b.divOn(false);
    b.host.classList.toggle('divvis', s >= 1); b.host.classList.toggle('zones', s >= 2);
    b.o.color = s >= 2; b.clear('net', 'host'); b.set('m', MK_M); b.setP(12, { fire: false });
    const H1 = ['Для этого есть <em>маска</em>', 'Сначала единицы, <em>потом нули</em>', 'Тяни границу — <em>выбирай маску</em>', 'Это <em>маска</em>?'];
    $('#mkHead', el).innerHTML = H1[s];
    const side = $('#mkSide', el);
    if (s === 0) {
      b.foldRows(['m'], true);
      side.innerHTML = card('Маска сети', 'Ещё 32 бита — такие же 4 байта через точку. Здесь: <span class="mono">255.240.0.0</span>.') + '<p class="small sp-hint"><b>Кликни по числам маски</b> — посмотрим, что внутри.</p>';
      return;
    }
    if (s === 1) {
      side.innerHTML = card('Правило', 'В маске сначала <b>подряд единицы</b>, потом <b>подряд нули</b>. Они не перемешиваются: после нуля — <b>только ноль</b>.') + '<p class="small">Граница одна. Здесь — после 12-й единицы.</p>';
      if (anim) await b.unfold(['m'], alive); else b.foldRows(['m'], false);
      return;
    }
    b.foldRows(['m'], false);
    side.innerHTML = card('Как делить', 'Ведём границу по маске и поднимаем вверх. <b>Слева</b> — <b class="cnet">адрес сети</b>, <b>справа</b> — <b class="chost">адрес узла</b>.', s === 2 ? 'dark' : '') + '<div class="mk-live" id="mkLive"></div><p class="small sp-hint"><b>Тяни ромбик</b> над битами — маска меняется вместе с границей.</p>';
    this.free = true; b.divOn(true); b.setP(12);
  }
};

/* ================= IP & маска ================= */
W.and = {
  init(el) {
    this.T = task(); this.el = el;
    this.b = new Bits($('#anB', el), { rows: [{ k: 'ip', label: 'IP', v: MK_IP }, { k: 'm', label: 'Маска', v: MK_M, cls: 'mask' }, { k: 'r', label: 'Сеть', v: Array(32).fill(''), cls: 'res' }], div: true, drag: true, color: false, p: 12, onP: p => this.onP(p) });
  },
  onP(p) {
    if (!this.free) return;
    const b = this.b, m = maskN(p), r = AND(MK_IP, m);
    b.clear('killed'); b.set('m', m); b.set('r', r, { dec: `<b class="hl">${n2ip(r)}</b>` });
    bitsOf(MK_IP).forEach((x, i) => { if (x && i >= p) b.mark('r', i, 'killed'); });
    $('#anCap', this.el).innerHTML = `Маска <span class="mono">/${p}</span> = ${n2ip(m)} → адрес сети <b>${n2ip(r)}</b>. Слева от границы биты переписались, справа — нули.`;
  },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), b = this.b;
    this.free = false; b.divOn(false);
    b.clear('killed', 'net', 'host', 'hot'); $$('.boct', b.host).forEach(x => x.classList.remove('copy', 'zero8', 'calc8'));
    b.set('m', MK_M);
    b.host.classList.toggle('divvis', s >= 2); b.host.classList.toggle('zones', s >= 2); b.setP(12, { fire: false });
    $('#anTT', el).classList.toggle('dim', s >= 2);
    const cap = $('#anCap', el);
    const H1 = ['IP <em>&amp;</em> маска = адрес сети', 'Биты падают <em>сквозь маску</em>', 'Слева — как было, <em>справа — нули</em>', 'Адрес сети: <em>192.160.0.0</em>', 'Лайфхак: <em>255 и 0</em>', 'Двигай маску — <em>сеть пересчитается</em>'];
    $('#anHead', el).innerHTML = H1[s];
    const done = () => { b.set('r', AND(MK_IP, MK_M)); bitsOf(MK_IP).forEach((x, i) => { if (x && !bitsOf(MK_M)[i]) b.mark('r', i, 'killed'); }); };
    if (s === 0) { b.foldRows(['ip', 'm'], true); b.set('r', Array(32).fill(''), { dec: '' }); cap.innerHTML = 'Чтобы найти адрес сети, IP <b>побитово умножают</b> на маску: каждый бит на бит под ним. По-научному — <b>поразрядная конъюнкция</b>.<span class="fhint"><b>Кликни по числам</b> — откроются биты.</span>'; return; }
    if (s === 1) {
      cap.innerHTML = 'Где в маске <b>1</b> — бит IP проходит насквозь. Где <b>0</b> — ворота закрыты, внизу получается <b>0</b>.';
      if (anim) { b.set('r', Array(32).fill(''), { dec: '' }); if (!await b.unfold(['ip', 'm'], alive, 90)) return; const ok = await b.andAnim('ip', 'm', 'r', alive, 50); if (!ok) return; done(); } else { b.foldRows(['ip', 'm'], false); done(); }
      return;
    }
    b.foldRows(['ip', 'm'], false);
    done();
    b.o.color = true; b.setP(12, { fire: false }); b.o.color = false;
    if (s === 2) { cap.innerHTML = 'Слева от границы маски адрес сети <b>совпадает с IP</b>. Справа — <b>одни нули</b>. Красным — единицы, которые маска «погасила».'; return; }
    if (s === 3) { b.dec('r', '<b class="hl">192.160.0.0</b>'); cap.innerHTML = 'Переводим обратно байтами: <span class="mono">11000000 → 192</span>, <span class="mono">10100000 → 160</span>, дальше нули. Адрес сети — <b>192.160.0.0</b>.'; return; }
    b.dec('r', '<b class="hl">192.160.0.0</b>');
    if (s === 4) {
      b.oct('m', 0, 'copy'); b.oct('r', 0, 'copy'); b.oct('m', 2, 'zero8'); b.oct('m', 3, 'zero8'); b.oct('r', 2, 'zero8'); b.oct('r', 3, 'zero8'); b.oct('m', 1, 'calc8'); b.oct('r', 1, 'calc8'); b.oct('ip', 1, 'calc8');
      cap.innerHTML = 'Байт маски <b>255</b> — байт IP <b>копируем</b>. Байт маски <b>0</b> — пишем <b>0</b>. Переводить в двоичную нужно только <b>один пограничный</b> байт.';
      return;
    }
    b.clear('net', 'host');
    this.free = true; b.divOn(true); b.setP(12);
  }
};

/* ================= страница КИМ ================= */
const offIn = (e, root) => { let x = 0, y = 0; while (e && e !== root) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y }; };
W.kim = {
  step(el, s) {
    const view = $('.kimv', el), page = $('.kimp', el), zones = $$('.kz', page);
    const VW = view.clientWidth, VH = view.clientHeight, PW = page.offsetWidth, PH = page.offsetHeight;
    let k, tx, ty, rot = 0;
    if (!s) { k = Math.min(VH * 0.95 / PH, VW * 0.95 / PW, 1.3); tx = (VW - PW * k) / 2; ty = (VH - PH * k) / 2 + 4; rot = -0.9; }
    else {
      const z = zones[Math.min(s, zones.length) - 1], p = offIn(z, page), w = z.offsetWidth, h = z.offsetHeight;
      k = Math.min(VW * 0.92 / w, VH * 0.8 / h, 1.75); tx = VW / 2 - (p.x + w / 2) * k; ty = VH / 2 - (p.y + h / 2) * k;
      ty = Math.min(18, Math.max(ty, VH - PH * k - 18));
    }
    page.style.transform = `translate(${tx}px,${ty}px) scale(${k}) rotate(${rot}deg)`;
    zones.forEach((z, i) => { z.classList.toggle('on', i === s - 1); z.classList.toggle('read', i < s); z.classList.toggle('mute', s === 2 && i === 0); });
    const cap = $('#kimCap', el);
    cap.classList.toggle('on', s > 0);
    cap.innerHTML = ['', 'Это <b>определение маски</b>. Оно одинаковое в каждой задаче — один раз понял, дальше не перечитываешь.', 'А вот это читаем внимательно: <b>что дано</b> и <b>что найти</b>.'][s];
  }
};

/* ================= разбор: шаблон «восстанови маску» ================= */
function lastOne(n) { for (let i = 31; i >= 0; i--) if ((n >>> (31 - i)) & 1) return i; return -1; }
function firstKill(ip, net) { for (let i = 0; i < 32; i++) if (((ip >>> (31 - i)) & 1) && !((net >>> (31 - i)) & 1)) return i; return 32; }
function maskRecon(el, ids, IP, NET, opt) {
  const W0 = {
    init(el) {
      this.T = task(); this.el = el;
      this.b = new Bits($(ids.b, el), { rows: [{ k: 'ip', label: 'IP', v: IP }, { k: 'm', label: 'Маска', v: Array(32).fill('?'), cls: 'mask', dec: '?' }, { k: 'n', label: 'Сеть (дано)', v: NET, cls: 'given' }], div: true, drag: true, color: false, p: opt.ans,
        onP: p => this.onDrag(p) });
      this.a = lastOne(NET) + 1; this.z = firstKill(IP, NET);
    },
    leave() { this.T.stop(); },
    onDrag(p) {
      if (!this.free) return; const b = this.b;
      b.clear('must1', 'must0', 'maybe');
      b.set('m', maskN(p), { dec: n2ip(maskN(p)) });
      const got = AND(IP, maskN(p)), ok = got === NET;
      b.host.classList.toggle('good', ok); b.host.classList.toggle('bad', !ok);
      $(ids.cap, this.el).innerHTML = ok ? `Маска <span class="mono">/${p}</span> = ${n2ip(maskN(p))} — <span class="ok">сеть совпадает ✓</span>` : `Маска <span class="mono">/${p}</span> даёт сеть ${n2ip(got)} — <span class="no">не совпадает ✕</span>`;
    },
    async step(el, s, o) {
      const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), b = this.b, { a, z } = this;
      this.free = false; b.divOn(false); b.host.classList.remove('good', 'bad', 'divvis', 'zones');
      b.clear('must1', 'must0', 'maybe', 'why', 'net', 'host');
      const m = Array(32).fill('?');
      if (s >= 1) for (let i = 0; i < a; i++) m[i] = 1;
      if (s >= 2) for (let i = z; i < 32; i++) m[i] = 0;
      if (s >= 4) for (let i = a; i < z; i++) m[i] = opt.max ? 1 : 0;
      const pop = anim;
      b.set('m', m, { pop, dec: s >= 4 ? n2ip(maskN(opt.ans)) : '?' });
      if (s >= 1) { for (let i = 0; i < a; i++) b.mark('m', i, 'must1'); b.mark('n', a - 1, 'why'); }
      if (s >= 2) { for (let i = z; i < 32; i++) b.mark('m', i, 'must0'); if (z < 32) { b.mark('ip', z, 'why'); b.mark('n', z, 'why'); } }
      if (s >= 3) for (let i = a; i < z; i++) b.mark('m', i, 'maybe');
      $(ids.head, el).innerHTML = opt.heads[s];
      $(ids.cap, el).innerHTML = opt.caps[s];
      if (s >= 4) {
        b.host.classList.add('divvis'); b.setP(opt.ans, { fire: false });
        if (anim) confetti(50);
        this.free = true; b.divOn(true);
      }
    }
  };
  return W0;
}
W.t250 = maskRecon(null, { b: '#t2B', head: '#t2Head', cap: '#t2Cap' }, ip2n('111.81.200.27'), ip2n('111.81.192.0'), {
  ans: 20, max: true,
  heads: ['Наибольший третий байт маски', 'Где в сети 1 — в маске <em>1</em>', 'Где у IP 1, а у сети 0 — <em>0</em>', 'Между ними — <em>что угодно</em>', 'Наибольшее → ставим <em>единицы</em>: 240'],
  caps: [
    'Переводим IP и адрес сети в двоичную. Нужно <b>восстановить маску</b> — такую, чтобы IP &amp; маска = сеть.',
    'Если в адресе сети стоит <b>1</b>, то и в маске там 1 — иначе получился бы 0. А раз единицы в маске идут подряд, <b>всё левее</b> — тоже единицы.',
    'Здесь у IP <b>1</b>, а в сети <b>0</b>. Значит, маска «погасила» этот бит — в ней <b>0</b>. А после нуля в маске только нули.',
    'В жёлтых клетках может быть и 0, и 1: на результат они не влияют — у IP там нули. Вариантов маски несколько.',
    'Спрашивают <b>наибольшее</b> — значит, единиц побольше: <span class="mono">11110000</span> = <b>240</b>. Тяни границу и проверь: на /21 сеть уже не совпадёт.'
  ]
});
W.t154 = maskRecon(null, { b: '#t3B', head: '#t3Head', cap: '#t3Cap' }, ip2n('148.195.140.28'), ip2n('148.195.140.0'), {
  ans: 22, max: false,
  heads: ['Наименьшее количество единиц в маске', 'Последняя 1 сети — в маске <em>1</em>', 'Первая «погашенная» 1 — <em>0</em>', 'Между — <em>выбор</em>', 'Наименьшее → <em>нули</em>: 8 + 8 + 6 = 22'],
  caps: [
    'Снова восстанавливаем маску по IP и адресу сети. Начинаем с перевода в двоичную.',
    'Самая правая единица адреса сети — в третьем байте. В маске до неё <b>обязательно единицы</b>.',
    'В четвёртом байте у IP есть единица, а в сети там <b>0</b> → в маске <b>0</b>, и дальше только нули.',
    'Жёлтые места — <b>что угодно</b>: 0 или 1, сеть от этого не изменится.',
    'Нужно <b>наименьшее</b> количество единиц — в жёлтые ставим нули. Единиц: 8 + 8 + 6 = <b>22</b>.'
  ]
});

/* ================= задача 245: адрес сети ================= */
const T1 = { ip: ip2n('217.8.244.3'), m: ip2n('255.255.252.0') };
W.t245 = {
  init(el) { this.T = task(); this.el = el; this.b = new Bits($('#t1B', el), { rows: [{ k: 'ip', label: 'IP', v: T1.ip }, { k: 'm', label: 'Маска', v: T1.m, cls: 'mask' }, { k: 'r', label: 'Сеть', v: Array(32).fill(''), cls: 'res' }], div: true, p: 22 }); },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), b = this.b;
    b.clear('killed'); $$('.boct', b.host).forEach(x => x.classList.remove('copy', 'zero8', 'calc8'));
    b.host.classList.toggle('divvis', s >= 2); b.host.classList.toggle('zones', s >= 2); b.setP(22);
    if (s >= 2) b.foldRows(['ip', 'm'], false);
    const cap = $('#t1Cap', el);
    const H1 = ['Адрес сети по IP и маске', 'Переводим в <em>двоичную</em>', 'Умножаем <em>побитово</em>', 'Лайфхак: считаем <em>один байт</em>', 'Ответ: <em>217.8.244.0</em>'];
    $('#t1Head', el).innerHTML = H1[s];
    const done = () => { b.set('r', AND(T1.ip, T1.m)); bitsOf(T1.ip).forEach((x, i) => { if (x && !bitsOf(T1.m)[i]) b.mark('r', i, 'killed'); }); };
    if (s <= 1) {
      b.set('r', Array(32).fill(''), { dec: '' });
      cap.innerHTML = s === 0 ? 'Дано: IP и маска. Нужно найти <b>адрес сети</b> — то есть умножить одно на другое.<span class="fhint"><b>Кликни по числам</b> — переведём в двоичную. Или жми «Дальше».</span>' : 'Каждое число — в 8 бит. <span class="mono">255</span> — это восемь единиц, <span class="mono">252</span> = 255 − 3 = <span class="mono">11111100</span>.';
      if (s === 0) b.foldRows(['ip', 'm'], true); else if (anim) await b.unfold(['ip', 'm'], alive); else b.foldRows(['ip', 'm'], false);
      return;
    }
    if (s === 2) {
      cap.innerHTML = 'Где в маске 1 — бит остаётся, где 0 — получается 0.';
      if (anim) { const ok = await b.andAnim('ip', 'm', 'r', alive, 45); if (!ok) return; } done(); return;
    }
    done();
    b.oct('m', 0, 'copy'); b.oct('m', 1, 'copy'); b.oct('r', 0, 'copy'); b.oct('r', 1, 'copy');
    b.oct('m', 3, 'zero8'); b.oct('r', 3, 'zero8'); b.oct('m', 2, 'calc8'); b.oct('r', 2, 'calc8'); b.oct('ip', 2, 'calc8');
    if (s === 3) { cap.innerHTML = '<b>217</b> и <b>8</b> стоят над 255 — копируем. Под нулём — <b>0</b>. Считать нужно только третий байт: <span class="mono">11110100 &amp; 11111100 = 11110100</span> = 244.'; return; }
    b.dec('r', '<b class="hl">217.8.244.0</b>');
    cap.innerHTML = 'Адрес сети — <b>217.8.244.0</b>. В старых вариантах ответ кодировали буквами из таблицы — сейчас пишем числа.';
    if (anim) confetti(60);
  }
};

/* ================= два узла ================= */
const T4 = { a: ip2n('157.127.182.76'), b: ip2n('157.127.190.80') };
W.t2n = {
  init(el) {
    this.T = task(); this.el = el;
    this.b = new Bits($('#t4B', el), { rows: [{ k: 'a', label: 'IP₁', v: T4.a }, { k: 'b', label: 'IP₂', v: T4.b }, { k: 'na', label: 'Сеть₁', v: Array(32).fill(''), cls: 'res' }, { k: 'nb', label: 'Сеть₂', v: Array(32).fill(''), cls: 'res' }], div: true, drag: true, p: 21, onP: p => this.show(p) });
    let d = 0; while (d < 32 && ((T4.a >>> (31 - d)) & 1) === ((T4.b >>> (31 - d)) & 1)) d++; this.d = d;
  },
  leave() { this.T.stop(); },
  show(p) {
    const b = this.b, na = AND(T4.a, maskN(p)), nb = AND(T4.b, maskN(p)), diff = na !== nb;
    b.set('na', na, { dec: n2ip(na) + '/' + p }); b.set('nb', nb, { dec: n2ip(nb) + '/' + p });
    b.host.classList.toggle('good', diff); b.host.classList.toggle('bad', !diff);
    if (this.free) $('#t4Cap', this.el).innerHTML = diff ? `При /${p} сети <span class="ok">разные ✓</span>` : `При /${p} сети <span class="no">одинаковые ✕</span> — граница ещё не дошла до различия`;
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), b = this.b, d = this.d;
    this.free = false; b.divOn(false); b.clear('same', 'diff'); b.host.classList.remove('good', 'bad');
    b.show('na', s >= 2); b.show('nb', s >= 2); b.host.classList.toggle('divvis', s >= 2);
    const H1 = ['Два узла — <em>разные</em> подсети', 'Ищем первое <em>различие</em>', 'Маска /20 — сети <em>одинаковые</em>', 'Маска /21 — <em>разные</em>! Ответ 21'];
    $('#t4Head', el).innerHTML = H1[s];
    const cap = $('#t4Cap', el);
    if (s === 0) { cap.innerHTML = 'Переводим оба адреса в двоичную и ставим друг под другом.'; return; }
    if (s === 1) {
      cap.innerHTML = `Идём слева направо. Пока биты <b>совпадают</b>, любая маска даст одинаковую сеть. Первое различие — бит №${d + 1}.`;
      for (let i = 0; i <= d; i++) { if (anim) { await wait(70); if (!alive()) return; } b.col(i, i < d ? 'same' : 'diff'); }
      return;
    }
    for (let i = 0; i <= d; i++) b.col(i, i < d ? 'same' : 'diff');
    const p = s === 2 ? d : d + 1; b.setP(p);
    if (s === 2) { cap.innerHTML = `Маска из ${d} единиц обрывается <b>прямо перед</b> различием — сети совпали. Не подходит.`; return; }
    cap.innerHTML = `Маска должна «захватить» различающийся бит: единиц минимум <b>${d + 1}</b>. Тяни границу — проверь.`;
    this.free = true; b.divOn(true);
    if (anim) confetti(50);
  }
};

/* ================= квартиры: 10^k → 2^k ================= */
W.flats = {
  init(el) {
    this.T = task(); this.el = el; this.k = 3; this.mode = null;
    const r = $('#flRange', el);
    r.addEventListener('input', () => { this.k = +r.value; this.slider(true); });
  },
  leave() { this.T.stop(); },
  top(mode, k) {
    const host = $('#flTop', this.el);
    if (mode === 'dec') {
      if (this.mode === 'dec') return;
      host.className = 'fl-top hs-grid'; host.innerHTML = '';
      const g = digitGrid(host, [['a', 'Дом + кв.'], ['m', 'Маска', 'mask']], 6);
      g.set('a', '512113'); g.set('m', '111100'); g.div.classList.add('on');
      g.R.a.cells.forEach((c, i) => c.classList.add(i < 4 ? 'dhome' : 'dflat')); g.R.m.cells.forEach((c, i) => c.classList.toggle('m1', i < 4));
      requestAnimationFrame(() => g.divAt(4));
    } else {
      const bits = Array.from({ length: 16 }, (_, i) => i < 16 - k ? 1 : 0);
      host.className = 'fl-top ms';
      host.innerHTML = '<span class="ms-l">маска<small>последние 16 бит</small></span><span class="ms-dots">…</span>' + bits.map((x, i) => `${i === 8 ? '<i class="ms-dot">.</i>' : ''}<i class="ms-c ${x ? 'one' : 'z'}">${x}</i>`).join('') + `<span class="ms-n">${k} ${plural(k, 'ноль', 'нуля', 'нулей')} = ${k} ${plural(k, 'место', 'места', 'мест')}</span>`;
    }
    this.mode = mode;
  },
  odo(k, base) {
    const host = $('#odo', this.el); host.innerHTML = ''; host.className = 'odo' + (base === 2 ? ' bin' : '') + (k > 6 ? ' sm' : '');
    this.wh = [...Array(k)].map(() => H('i', 'ow', host, '<b>0</b>'));
    this.base = base; this.K = k;
  },
  odoSet(n) { const t = n.toString(this.base).padStart(this.K, '0'); this.wh.forEach((w, i) => { const b = w.firstChild; if (b.textContent !== t[i]) { b.textContent = t[i]; w.classList.remove('roll'); void w.offsetWidth; w.classList.add('roll'); } }); },
  bld(n, o = {}) {
    const host = $('#flBld', this.el);
    const cols = o.cols || 2 ** Math.ceil(Math.log2(n) / 2), rows = Math.ceil(n / cols);
    const gap = cols > 16 ? 2 : 4, sz = Math.min(96, Math.floor((400 - (Math.max(cols, rows) - 1) * gap) / Math.max(cols, rows)));
    host.innerHTML = '<div class="fb-h"><b class="fbF"></b><span class="fbS"></span></div>';
    const grid = H('div', 'fb-g', host); grid.style.gridTemplateColumns = `repeat(${cols}, ${sz}px)`; grid.style.gap = gap + 'px'; grid.style.setProperty('--sz', sz + 'px');
    this.wins = [];
    for (let i = 0; i < n; i++) { const w = H('i', 'fb-w', grid); if (o.labels) w.innerHTML = `<span>${o.labels(i)}</span>`; this.wins.push(w); }
    grid.classList.toggle('lab', !!o.labels && sz >= 40);
  },
  head(f, sub) { const h = $('#flBld', this.el); $('.fbF', h).innerHTML = f; $('.fbS', h).innerHTML = sub; },
  lightTo(m) { this.wins.forEach((w, i) => w.classList.toggle('on', i <= m)); },
  count(max, ms, alive) {
    if (reduced()) { this.odoSet(max); this.lightTo(max); return Promise.resolve(true); }
    let last = -1;
    return tween(ms, (e, k) => { const n = Math.min(max, Math.floor(k * (max + 1))); if (n !== last) { last = n; this.odoSet(n); this.lightTo(n); } }, alive);
  },
  async overflow(alive) {
    const host = $('#odo', this.el), g = H('i', 'ow ghost', null, '<b>1</b>'); host.insertBefore(g, host.firstChild);
    this.wh.forEach(w => { w.firstChild.textContent = '0'; w.classList.remove('roll'); void w.offsetWidth; w.classList.add('roll'); });
    const tag = H('span', 'odo-x', host, '100? места нет!');
    await wait(1500); if (!alive()) return;
    g.classList.add('out'); tag.remove(); await wait(380); g.remove(); this.odoSet(99);
  },
  async slider(animate) {
    const k = this.k, el = this.el, n = 2 ** k;
    $('#flKv', el).textContent = k; $('#flRange', el).value = k;
    this.top('bin', k); this.odo(k, 2);
    $('#odoH', el).innerHTML = `номер устройства · <b>${k} ${plural(k, 'место', 'места', 'мест')}</b>, на каждом 0 или 1`;
    this.bld(n, { labels: k <= 4 ? (i => i.toString(2).padStart(k, '0')) : null });
    this.head(`2<sup>${k}</sup> = ${fmt(n)}`, `${plural(n, 'адрес', 'адреса', 'адресов')} в сети`);
    $('#odoEq', el).innerHTML = `${'0'.repeat(k)} … ${'1'.repeat(k)} → <b>${fmt(n)}</b>`;
    const t = this.T.next(), alive = () => this.T.alive(t);
    if (animate) await this.count(n - 1, Math.min(1500, 300 + n * 40), alive); else { this.odoSet(n - 1); this.lightTo(n - 1); }
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o);
    $('#flK', el).classList.toggle('on', s === 4);
    const H1 = ['Сколько квартир <em>в доме</em>?', 'Два места → <em>100 квартир</em>', 'В двоичном — <em>только 0 и 1</em>', 'Ещё место → <em>вдвое больше</em>', '<em>2</em> в степени <em>нулей</em>', '29 единиц → <em>8 адресов</em>'];
    $('#flHead', el).innerHTML = H1[s];
    const cap = $('#flCap', el), eq = $('#odoEq', el), oh = $('#odoH', el);
    if (s <= 1) {
      this.top('dec'); this.odo(2, 10); oh.innerHTML = 'номер квартиры · <b>2 места</b>, на каждом 0…9';
      this.bld(100, { cols: 10 });
      if (s === 0) {
        this.odoSet(13); this.wins[13].classList.add('on', 'cur'); eq.innerHTML = 'сейчас: квартира <b>13</b>';
        this.head('дом 5121', 'сколько тут квартир?');
        cap.innerHTML = 'Маска отделила номер дома <b>5121</b>. Под номер квартиры осталось <b>два места</b> — сейчас там 13. Сколько всего квартир может быть в этом доме?';
        return;
      }
      this.head('10 · 10 = 10<sup>2</sup> = 100', 'квартир в доме');
      cap.innerHTML = 'В два места помещаются номера от <b>00</b> до <b>99</b>: 10 вариантов на первом месте × 10 на втором = <b>100</b>. Сотую уже <b>некуда записать</b>.';
      eq.innerHTML = '00 … 99 → <b>100</b> номеров';
      if (anim) { this.lightTo(-1); if (!await this.count(99, 2200, alive)) return; await wait(250); if (!alive()) return; await this.overflow(alive); }
      else { this.odoSet(99); this.lightTo(99); }
      return;
    }
    if (s === 4) {
      cap.innerHTML = 'Двигай ползунок: каждый новый ноль в маске — ещё одно место, и дом <b>удваивается</b>. Адресов = 2<sup>нулей</sup> = 2<sup>32 − единиц</sup>.';
      return this.slider(anim);
    }
    const KB = s === 2 ? 2 : 3;
    this.top('bin', KB); this.odo(KB, 2);
    oh.innerHTML = `номер устройства · <b>${KB} ${plural(KB, 'место', 'места', 'мест')}</b>, на каждом 0 или 1`;
    if (s === 5) {
      this.k = 3; $('#flKv', el).textContent = 3; $('#flRange', el).value = 3;
      this.bld(8, { labels: i => i.toString(2).padStart(3, '0') }); this.odoSet(7); this.lightTo(7);
      this.head('2<sup>3</sup> = 8', 'адресов в сети'); eq.innerHTML = '000 … 111 → <b>8</b>';
      cap.innerHTML = '<div class="fl-f">29 единиц → 32 − 29 = <b>3</b> нуля → 2<sup>3</sup> = <b>8</b></div><div class="fl-f sm">А если в маске 2 единицы? 30 нулей → 2<sup>30</sup> ≈ <b>миллиард</b> адресов. Чем меньше единиц — тем больше «дом».</div>';
      return;
    }
    if (s === 2) {
      this.bld(4, { labels: i => i.toString(2).padStart(2, '0') });
      this.head('2 · 2 = 2<sup>2</sup> = 4', 'адреса в сети');
      cap.innerHTML = 'А в IP-адресе на каждом месте только <b>0 или 1</b> — два варианта, а не десять. Два места: <span class="mono">00, 01, 10, 11</span> — всего <b>4</b>.';
      eq.innerHTML = '00, 01, 10, 11 → <b>4</b>';
      if (anim) { this.lightTo(-1); for (let n = 0; n < 4; n++) { await wait(n ? 560 : 300); if (!alive()) return; this.odoSet(n); this.lightTo(n); } }
      else { this.odoSet(3); this.lightTo(3); }
      return;
    }
    this.bld(8, { labels: i => { const t = i.toString(2).padStart(3, '0'); return `<b>${t[0]}</b>${t.slice(1)}`; } });
    this.wins.forEach((w, i) => w.classList.toggle('nw', i >= 4));
    this.head('2 · 2 · 2 = 2<sup>3</sup> = 8', 'адресов в сети');
    cap.innerHTML = 'Добавили одно место — адресов стало <b>вдвое больше</b>: те же четыре с <b>0</b> впереди и ещё четыре с <b>1</b> впереди.';
    eq.innerHTML = '000 … 111 → <b>8</b>';
    if (anim) { this.odoSet(3); this.lightTo(3); await wait(500); for (let n = 4; n < 8; n++) { await wait(420); if (!alive()) return; this.odoSet(n); this.lightTo(n); } }
    else { this.odoSet(7); this.lightTo(7); }
  }
};

/* ================= первый и последний ================= */
W.reserved = {
  init(el) {
    this.T = task(); this.el = el;
    const host = $('#rsDoors', el); this.doors = [];
    for (let i = 0; i < 8; i++) {
      const d = H('div', 'rs-d', host, `<div class="rs-wv"></div><div class="rs-di">${ico(i === 7 ? 'pc' : 'pc')}</div><div class="rs-dt"><small>192.168.1.</small>${i}</div><div class="rs-db mono">${i.toString(2).padStart(3, '0')}</div><div class="rs-dl"></div>`);
      d.style.animationDelay = (i * 60) + 'ms'; this.doors.push(d);
    }
    $('#rsTop', el).innerHTML = '<span>маска <b>/29</b></span><i>→</i><span>нулей 32 − 29 = <b>3</b></span><i>→</i><span>2<sup>3</sup> = <b>8</b> адресов: от <span class="mono">.0</span> до <span class="mono">.7</span></span><small>под каждым — его последние 3 бита (часть узла)</small>';
  },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o);
    $('#rsPlate', el).classList.toggle('on', s >= 1);
    this.doors.forEach((d, i) => {
      d.classList.toggle('net', s >= 1 && i === 0); d.classList.toggle('bc', s >= 2 && i === 7); d.classList.toggle('pc', s >= 3 && i > 0 && i < 7);
      d.classList.remove('ping');
      $('.rs-dl', d).textContent = s >= 1 && i === 0 ? 'адрес сети' : s >= 2 && i === 7 ? 'всем!' : s >= 3 ? 'компьютер' : '';
    });
    $('#rsHead', el).innerHTML = ['Сеть /29 — <em>8 адресов</em>', 'Первый — <em>адрес сети</em>', 'Последний — <em>широковещательный</em>', '8 − 2 = <em>6 компьютеров</em>'][s];
    if (s === 2 && anim) {
      await wait(450);
      for (let r = 0; r < 2; r++) {
        for (let i = 6; i >= 0; i--) { if (!alive()) return; const d = this.doors[i]; d.classList.remove('ping'); void d.offsetWidth; d.classList.add('ping'); await wait(90); }
        await wait(500);
      }
    }
  }
};

/* ================= задача 10166 ================= */
const T5 = ip2n('255.255.254.0');
W.t166 = {
  init(el) { this.T = task(); this.el = el; this.b = new Bits($('#t5B', el), { rows: [{ k: 'm', label: 'Маска', v: T5, cls: 'mask' }], div: true, p: 23 }); },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), b = this.b, f = $('#t5F', el);
    b.clear('cnt'); b.host.classList.toggle('divvis', s >= 1); b.host.classList.toggle('zones', s >= 1); b.setP(23);
    const H1 = ['Маска 255.255.254.0 — сколько компьютеров?', 'Считаем <em>нули</em>: 9', '2<sup>9</sup> = <em>512</em> адресов', '512 − 2 = <em>510</em>'];
    $('#t5Head', el).innerHTML = H1[s];
    if (s === 0) { f.innerHTML = '<div class="t5-row"><span>255 → 11111111</span><span>255 → 11111111</span><span>254 → 11111110</span><span>0 → 00000000</span></div>'; return; }
    if (s === 1) {
      f.innerHTML = '<div class="t5-big">единиц: 8 + 8 + 7 = 23 &nbsp;→&nbsp; нулей: 32 − 23 = <b id="t5Z">0</b></div>';
      for (let i = 23; i < 32; i++) { if (anim) { await wait(120); if (!alive()) return; } b.mark('m', i, 'cnt'); const z = $('#t5Z', el); if (z) z.textContent = i - 22; }
      return;
    }
    for (let i = 23; i < 32; i++) b.mark('m', i, 'cnt');
    if (s === 2) { f.innerHTML = '<div class="t5-big">адресов = 2<sup>9</sup> = <b>512</b></div><p class="small">Девять мест под «номер квартиры» — 512 вариантов от 000000000 до 111111111.</p>'; return; }
    f.innerHTML = '<div class="t5-big">512 − 2 = <b class="ans">510</b></div><p class="small">Адрес сети и широковещательный не используются — вычитаем два. Ответ: <b>510</b>.</p>';
    if (anim) confetti(60);
  }
};

/* ================= ≥ 60 узлов ================= */
const T6 = { ip: ip2n('175.122.80.13'), net: ip2n('175.122.80.0'), need: 60 };
W.t60 = {
  init(el) {
    this.T = task(); this.el = el;
    this.b = new Bits($('#t6B', el), { rows: [{ k: 'ip', label: 'IP', v: T6.ip }, { k: 'n', label: 'Сеть (дано)', v: T6.net, cls: 'given' }, { k: 'm', label: 'Маска', v: maskN(24), cls: 'mask' }], div: true, drag: true, p: 24, ch: 54, onP: p => this.onP(p) });
    const tab = $('#t6Tab', el); this.tr = {};
    tab.innerHTML = '<div class="t6-h"><span>маска</span><span>сеть совпала</span><span>узлов</span></div>';
    for (let p = 18; p <= 30; p++) {
      const ok1 = AND(T6.ip, maskN(p)) === T6.net, h = 2 ** (32 - p) - 2, ok2 = h >= T6.need;
      const r = H('div', 't6-r', tab, `<span class="mono">/${p}</span><span class="c1">${ok1 ? '✓' : '✕'}</span><span class="c2">${fmt(h)}<i>${ok2 ? '✓' : '✕'}</i></span>`);
      r.dataset.p = p; r.classList.toggle('ok1', ok1); r.classList.toggle('ok2', ok2); this.tr[p] = r;
      r.addEventListener('click', () => { if (this.free) this.b.setP(p); });
    }
  },
  leave() { this.T.stop(); },
  onP(p) {
    const b = this.b; b.set('m', maskN(p), { dec: n2ip(maskN(p)) });
    Object.values(this.tr).forEach(r => r.classList.toggle('cur', +r.dataset.p === p));
    if (!this.free) return;
    const ok1 = AND(T6.ip, maskN(p)) === T6.net, h = 2 ** (32 - p) - 2;
    $('#t6Cap', this.el).innerHTML = `/${p}: сеть ${ok1 ? '<span class="ok">совпадает</span>' : '<span class="no">не совпадает</span>'}, узлов ${fmt(h)} ${h >= 60 ? '<span class="ok">≥ 60</span>' : '<span class="no">< 60</span>'}`;
  },
  async step(el, s, o) {
    const anim = animOf(o), tab = $('#t6Tab', el), b = this.b;
    this.free = s >= 3; b.divOn(s >= 3);
    tab.classList.toggle('s1', s >= 1); tab.classList.toggle('s2', s >= 2); tab.classList.toggle('s3', s >= 3);
    b.host.classList.toggle('divvis', s >= 1);
    b.setP(s >= 3 ? 26 : 24);
    const H1 = ['Сколько масок, если узлов <em>≥ 60</em>?', 'Условие 1: сеть <em>совпадает</em>', 'Условие 2: узлов <em>≥ 60</em>', 'Оба условия: <em>7 масок</em>', '6 мест под выбор + 1 = <em>7</em>'];
    $('#t6Head', el).innerHTML = H1[s];
    const C = [
      'IP и адрес сети уже в двоичном. Каждая маска — это граница. Какие границы подходят?',
      'Адрес сети должен получиться <b>175.122.80.0</b>: маска от <b>/20</b> до <b>/28</b>.',
      'Узлов <b>2<sup>нулей</sup> − 2 ≥ 60</b> → нулей минимум <b>6</b> (2<sup>6</sup> − 2 = 62) → маска не больше <b>/26</b>.',
      'Подходят /20, /21, …, /26 — всего <b>7</b> масок. Тяни границу или кликай по строкам таблицы.',
      'Последние 6 нулей обязательны. Перед ними 6 мест «на выбор»: единиц там может быть 0, 1, 2, … 6 — это <b>7</b> вариантов.'
    ];
    this.free = s >= 3;
    if (s < 3) $('#t6Cap', el).innerHTML = C[s]; else { $('#t6Cap', el).innerHTML = C[s]; if (s === 3 && anim) confetti(50); }
  }
};

/* ================= демоверсия 2026 ================= */
const T7 = { ip: ip2n('191.128.66.83'), m: ip2n('255.192.0.0'), p: 10 };
W.tdemo = {
  init(el) { this.T = task(); this.el = el; this.b = new Bits($('#t7B', el), { rows: [{ k: 'ip', label: 'IP', v: T7.ip }, { k: 'm', label: 'Маска', v: T7.m, cls: 'mask' }, { k: 'n', label: 'Сеть', v: Array(32).fill(''), cls: 'res' }, { k: 'h', label: 'Ответ', v: Array(32).fill(''), cls: 'res2' }], div: true, p: 10 }); },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), b = this.b, net = AND(T7.ip, T7.m), bc = bcast(T7.ip, T7.p);
    b.host.classList.toggle('divvis', true); b.host.classList.toggle('zones', s >= 1); b.setP(10);
    b.show('n', s >= 1); b.show('h', s >= 2); b.clear('flip', 'last');
    const H1 = ['Наибольший IP <em>компьютера</em> в сети', 'Адрес сети: <em>191.128.0.0</em>', 'Узел — все единицы: <em>нельзя!</em>', 'Предпоследний: <em>…255.254</em>', 'Ответ: <em>191191255254</em>'];
    $('#t7Head', el).innerHTML = H1[s];
    const cap = $('#t7Cap', el);
    if (s === 0) { cap.innerHTML = 'Маска <span class="mono">255.192.0.0</span> = 8 + 2 = <b>10 единиц</b>. Слева от границы — сеть, справа — место для «квартир».'; return; }
    b.set('n', net);
    if (s === 1) { cap.innerHTML = 'IP &amp; маска → адрес сети <b>191.128.0.0</b>. Это «номер дома». Справа — 22 места под номер компьютера.'; return; }
    if (s === 2) {
      cap.innerHTML = 'Самый большой номер — <b>все единицы</b> в части узла: 191.191.255.255. Но это <b>широковещательный</b> адрес, компьютеру его выдать нельзя.';
      const h = bitsOf(net);
      if (anim) { b.set('h', h); for (let i = 10; i < 32; i++) { await wait(55); if (!alive()) return; h[i] = 1; b.set('h', h.slice(), { dec: '' }); b.mark('h', i, 'flip'); } }
      b.set('h', bc, { dec: '<s>' + n2ip(bc) + '</s>' }); for (let i = 10; i < 32; i++) b.mark('h', i, 'flip');
      return;
    }
    const hm = (bc - 1) >>> 0;
    b.set('h', hm, { dec: '<b class="hl">' + n2ip(hm) + '</b>' }); for (let i = 10; i < 31; i++) b.mark('h', i, 'flip'); b.mark('h', 31, 'last');
    if (s === 3) { cap.innerHTML = 'Берём <b>предпоследний</b>: последний бит → 0. Получаем <b>191.191.255.254</b>.'; return; }
    cap.innerHTML = 'Записываем без точек: <b class="mono">191191255254</b>. Эта задача была на прошлом ЕГЭ и в демоверсии.';
    if (anim) confetti(80);
  }
};

/* ================= песочница: сетевой калькулятор ================= */
W.lab = {
  init(el) {
    this.el = el; this.ip = ip2n('192.168.10.77');
    this.b = new Bits($('#labB', el), { rows: [{ k: 'ip', label: 'IP', v: this.ip }, { k: 'm', label: 'Маска', v: maskN(24), cls: 'mask' }, { k: 'n', label: 'Сеть', v: 0, cls: 'res' }, { k: 'bc', label: 'Broadcast', v: 0, cls: 'res2' }], div: true, drag: true, color: true, p: 24, onP: p => this.calc(p) });
    this.b.divOn(true); this.b.host.classList.add('divvis', 'zones');
    const inp = $('#labIp', el);
    inp.addEventListener('input', () => { const n = ip2n(inp.value); inp.classList.toggle('bad', n === null); if (n === null) return; this.ip = n; this.b.set('ip', n); this.calc(this.b.p); });
    $('#labRnd', el).addEventListener('click', e => { e.currentTarget.blur(); this.ip = ((ri(1, 223) << 24) | (ri(0, 255) << 16) | (ri(0, 255) << 8) | ri(0, 255)) >>> 0; inp.value = n2ip(this.ip); inp.classList.remove('bad'); this.b.set('ip', this.ip); this.b.setP(ri(16, 29)); });
  },
  calc(p) {
    const b = this.b, m = maskN(p), net = AND(this.ip, m), bc = bcast(this.ip, p), k = 32 - p, n = 2 ** k;
    b.set('m', m); b.set('n', net); b.set('bc', bc);
    b.o.color = true; ['ip', 'm', 'n', 'bc'].forEach(r => b.R[r].cells.forEach((c, i) => { c.classList.toggle('net', i < p); c.classList.toggle('host', i >= p); }));
    const hosts = Math.max(0, n - 2);
    $('#labOut', this.el).innerHTML = [
      ['Маска', n2ip(m), `/${p} — ${p} ${plural(p, 'единица', 'единицы', 'единиц')}`],
      ['Адрес сети', n2ip(net), 'нули в части узла'],
      ['Широковещательный', n2ip(bc), 'единицы в части узла'],
      ['Компьютерам', hosts ? `${n2ip((net + 1) >>> 0)} … ${n2ip((bc - 1) >>> 0)}` : '—', 'первый и последний — нельзя'],
      ['Адресов', `2<sup>${k}</sup> = ${fmt(n)}`, `компьютеров: ${fmt(hosts)}`]
    ].map(([t, v, s], i) => `<div class="lo${i === 4 ? ' dark' : ''}"><small>${t}</small><b>${v}</b><span>${s}</span></div>`).join('');
  },
  step() { this.b.setP(this.b.p); }
};

/* ================= Python ================= */
const PYK = /\b(from|import|for|in|if|print|range|str|int|strict|False|True)\b/g;
function hl(line) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let out = '', rest = line;
  const ci = rest.indexOf('#'); let com = '';
  if (ci >= 0) { com = rest.slice(ci); rest = rest.slice(0, ci); }
  const parts = rest.split(/('[^']*')/);
  parts.forEach((p, i) => {
    if (i % 2) out += `<span class="s">${esc(p)}</span>`;
    else out += esc(p).replace(PYK, m => `<span class="${/print|range|str|int/.test(m) ? 'f' : m === 'strict' ? 'a' : /False|True/.test(m) ? 'c' : 'k'}">${m}</span>`).replace(/\b(\d+)\b/g, '<span class="n">$1</span>').replace(/\b(ip_network|num_addresses|broadcast_address)\b/g, '<span class="m">$1</span>');
  });
  return out + (com ? `<span class="cm">${esc(com)}</span>` : '');
}
const loopNet = ip => [...Array(32)].map((_, i) => netStr(ip2n(ip), i + 1));
const PY = [
  { tab: 'Байт маски', head: 'Перебираем <em>все маски</em>',
    code: ['from ipaddress import *', '', 'for m in range(1, 33):', "    n = ip_network('220.128.112.142/' + str(m), strict=False)", '    print(n)'],
    out: () => loopNet('220.128.112.142').map(t => ({ t, hl: t === '220.128.96.0/19' })),
    side: card('Задача', 'IP <span class="mono">220.128.112.142</span>, сеть <span class="mono">220.128.96.0</span>. Третий байт маски?') + card('Читаем вывод', 'Нужная сеть — <b>/19</b>: 19 единиц = 8 + 8 + <b>3</b>. Третий байт — <span class="mono">11100000</span>.<span class="eq">int(\'11100000\', 2) → 224</span>', 'dark') },
  { tab: 'Наименьший байт', head: 'Подходящих масок <em>две</em>',
    code: ['from ipaddress import *', '', 'for m in range(1, 33):', "    n = ip_network('111.81.208.27/' + str(m), strict=False)", '    print(n)'],
    out: () => loopNet('111.81.208.27').map(t => ({ t, hl: t.startsWith('111.81.192.0/') })),
    side: card('Задача', 'IP <span class="mono">111.81.208.27</span>, сеть <span class="mono">111.81.192.0</span>. <b>Наименьшее</b> значение третьего байта маски?') + card('Читаем вывод', 'Сеть 111.81.192.0 — и при <b>/18</b>, и при <b>/19</b>. Наименьшая — /18: 8 + 8 + <b>2</b> → <span class="mono">11000000</span> = <b>192</b>.', 'dark') },
  { tab: 'Два узла', head: 'Первая маска, где сети <em>разные</em>',
    code: ['from ipaddress import *', '', 'for m in range(1, 33):', "    n1 = ip_network('157.127.182.76/' + str(m), strict=False)", "    n2 = ip_network('157.127.190.80/' + str(m), strict=False)", '    if n1 != n2:', '        print(m, n1, n2)'],
    out: () => { const r = []; for (let m = 1; m <= 32; m++) { const a = netStr(T4.a, m), b = netStr(T4.b, m); if (a !== b) r.push({ t: `${m} ${a} ${b}`, hl: m === 21 }); } return r; },
    side: card('Задача', 'Узлы <span class="mono">157.127.182.76</span> и <span class="mono">157.127.190.80</span> в разных подсетях. Наименьшее количество единиц в масках?') + card('Читаем вывод', 'Печатаются только маски, при которых сети <b>разные</b>. Первая строка — <b>21</b>. Это ответ.', 'dark') },
  { tab: 'Фишки', head: 'Что ещё умеет <em>ip_network</em>',
    code: ['from ipaddress import *', '', "n = ip_network('191.128.66.83/255.192.0.0', strict=False)", 'print(n)                        # адрес сети', 'print(n.num_addresses - 2)      # компьютеров', 'print(n.broadcast_address - 1)  # наибольший IP компьютера'],
    out: () => [{ t: '191.128.0.0/10' }, { t: '4194302' }, { t: '191.191.255.254', hl: true }],
    side: card('Маска двумя способами', 'После слэша — <b>число единиц</b> (<span class="mono">/19</span>) или <b>маска целиком</b> (<span class="mono">/255.192.0.0</span>).') + card('strict=False', 'Без него Python ругается, если IP — не адрес сети. С ним — сам считает сеть.', 'dark') }
];
W.py = {
  init(el) {
    this.T = task(); this.el = el; this.cur = 0;
    const tabs = $('#pyTabs', el);
    PY.forEach((t, i) => { const b = H('button', '', tabs, t.tab); b.addEventListener('click', e => { e.currentTarget.blur(); window.__deck.show(window.__deck.cur, i, 1); }); });
    $('#pyRun', el).addEventListener('click', e => { e.currentTarget.blur(); this.run(this.cur, true, true); });
  },
  leave() { this.T.stop(); },
  async run(i, anim, typeOnly) {
    const k = this.T.next(), alive = () => this.T.alive(k), P = PY[i], el = this.el, code = $('#pyCode', el), out = $('#pyOut', el);
    this.cur = i;
    $$('#pyTabs button', el).forEach((b, j) => b.classList.toggle('on', j === i));
    $('#pyHead', el).innerHTML = P.head; $('#pySide', el).innerHTML = P.side;
    out.innerHTML = '';
    const lines = P.code;
    if (anim && !typeOnly) {
      code.innerHTML = '';
      for (let li = 0; li < lines.length; li++) {
        const L = lines[li]; let shown = '';
        const row = H('div', 'cl', code);
        for (let c = 0; c < L.length; c += 3) { if (!alive()) return; shown = L.slice(0, c + 3); row.innerHTML = hl(shown) + '<i class="caret"></i>'; await wait(14); }
        row.innerHTML = hl(L) || '&nbsp;';
      }
      await wait(250); if (!alive()) return;
    } else code.innerHTML = lines.map(L => `<div class="cl">${hl(L) || '&nbsp;'}</div>`).join('');
    const res = P.out(), path = '<div class="ol dim">C:\\Users\\ion\\13.py</div>';
    out.innerHTML = path;
    let hit = null;
    for (const r of res) {
      if (anim) { await wait(res.length > 10 ? 28 : 160); if (!alive()) return; }
      const d = H('div', 'ol' + (r.hl ? ' hl' : ''), out, r.t);
      if (r.hl && !hit) hit = d;
    }
    H('div', 'ol dim', out, 'Process finished with exit code 0');
    if (hit) { const box = out.parentElement; box.scrollTo({ top: Math.max(0, hit.offsetTop - box.clientHeight / 2), behavior: anim ? 'smooth' : 'auto' }); }
  },
  step(el, s, o) { this.run(s, animOf(o) || o.enter && !reduced()); }
};

/* ================= квиз ================= */
const QUIZ = [
  { q: 'Сколько бит в IP-адресе (IPv4)?', opts: ['32', '4', '8', '255'], a: 0, ex: '4 байта по 8 бит — <b>32 бита</b>.' },
  { q: 'Какое число не может быть частью IP-адреса?', opts: ['256', '0', '255', '127'], a: 0, ex: 'В байт помещается максимум 11111111 = <b>255</b>. 256 — уже 9 бит.' },
  { q: 'Какая из этих записей — правильная маска?', opts: ['255.255.248.0', '255.255.0.255', '255.250.0.0', '0.255.255.255'], a: 0, ex: '248 = 11111000 — единицы, потом нули. В остальных после нуля снова идут единицы.' },
  { q: 'IP 10.5.7.9, маска 255.255.0.0. Адрес сети?', opts: ['10.5.0.0', '10.5.7.0', '0.0.7.9', '10.0.0.0'], a: 0, ex: 'Под 255 копируем, под 0 — нули: <b>10.5.0.0</b>.' },
  { q: 'В маске 26 единиц. Сколько компьютеров можно подключить?', opts: ['62', '64', '26', '6'], a: 0, ex: 'Нулей 32 − 26 = 6. 2<sup>6</sup> − 2 = <b>62</b>.' },
  { q: 'Почему первый и последний адрес сети не дают компьютерам?', opts: ['Это адрес сети и широковещательный', 'Они слишком короткие', 'Их забирает роутер Wi-Fi', 'Так удобнее считать'], a: 0, ex: 'Все нули в части узла — <b>адрес сети</b>, все единицы — <b>широковещательный</b> (broadcast).' }
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
      $('#qzAgain', el).addEventListener('click', e => { e.currentTarget.blur(); this.ans = []; window.__deck.show(window.__deck.cur, 0, -1); });
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

W.t250 = foldWrap(W.t250, ['ip', 'n'], '#t2Cap');
W.t154 = foldWrap(W.t154, ['ip', 'n'], '#t3Cap');
W.t2n = foldWrap(W.t2n, ['a', 'b'], '#t4Cap');
W.t166 = foldWrap(W.t166, ['m'], '#t5F');
W.t60 = foldWrap(W.t60, ['ip', 'n'], '#t6Cap');
W.tdemo = foldWrap(W.tdemo, ['ip', 'm'], '#t7Cap');

window.IP = { ip2n, n2ip, maskN, AND, bcast, validP, Bits };
window.DECK = { sections: { 1: 'IP-адрес', 2: 'Маска', 3: 'Задачи', 4: 'Сколько адресов', 5: 'Python', 6: 'Итог' }, key: 'soft:interactive:13:v1', prefix: 'soft13', widgets: W };
})();
