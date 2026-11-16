/* ion_inf · №1 — графы и таблицы: библиотека и виджеты урока */
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
const P = i => 'П' + (i + 1);
const shuffle = (a, rnd = Math.random) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const animOf = o => o.dir > 0 && !o.enter && !reduced();

/* тосты и конфетти — deck.js берёт тост из window.DP */
const DP = window.DP = {};
DP.toast = msg => { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1900); };
const confetti = (n = 90) => {
  if (reduced()) return;
  const cols = ['#B9521D', '#FFD8BE', '#2F855A', '#2B6CB0', '#6B46C1', '#B7791F', '#1D1D1F'], A = $('#app');
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div'); d.className = 'confetti';
    d.style.left = (Math.random() * 1600) + 'px'; d.style.background = cols[i % cols.length];
    A.appendChild(d);
    const dx = (Math.random() - .5) * 300, rot = Math.random() * 720;
    d.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${dx}px, ${920 + Math.random() * 120}px) rotate(${rot}deg)` }],
      { duration: 1800 + Math.random() * 1400, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 300 }).onfinish = () => d.remove();
  }
};

/* ================= геометрия ================= */
function fitPts(nodes, W, H, pad) {
  const xs = Object.values(nodes).map(p => p[0]), ys = Object.values(nodes).map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min((W - 2 * pad) / ((x1 - x0) || 1), (H - 2 * pad) / ((y1 - y0) || 1));
  const ox = (W - (x1 - x0) * k) / 2, oy = (H - (y1 - y0) * k) / 2, out = {};
  for (const v in nodes) out[v] = [ox + (nodes[v][0] - x0) * k, oy + (nodes[v][1] - y0) * k];
  return out;
}
const segDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L; t = Math.max(0, Math.min(1, t)); return Math.hypot(a[0] + t * dx - p[0], a[1] + t * dy - p[1]); };
const angDist = (a, b) => { let d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; };

/* ================= граф ================= */
class GraphView {
  constructor(svg, o) {
    o = this.o = Object.assign({ R: 26, W: 600, H: 400, pad: 46, weights: false, tagDir: {}, badgeDir: {} }, o);
    this.svg = svg; svg.innerHTML = ''; svg.classList.add('gx');
    svg.setAttribute('width', o.W); svg.setAttribute('height', o.H); svg.setAttribute('viewBox', `0 0 ${o.W} ${o.H}`);
    this.pos = o.pos ? Object.assign({}, o.pos) : fitPts(o.nodes, o.W, o.H, o.pad);
    this.L = { e: S('g', {}, svg), h: S('g', {}, svg), w: S('g', {}, svg), x: S('g', {}, svg), n: S('g', {}, svg), t: S('g', {}, svg) };
    this.E = new Map(); this.N = {}; this.B = {}; this.T = {}; this.lab = {}; this.ext = {};
    Object.keys(this.pos).forEach(v => this.addNode(v));
    (o.edges || []).forEach(([a, b, w]) => this.addEdge(a, b, w));
    this.place();
  }
  key(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
  edge(a, b) { return this.E.get(this.key(a, b)); }
  has(a, b) { return this.E.has(this.key(a, b)); }
  nbrs(v) { const r = []; this.E.forEach(e => { if (e.a === v) r.push(e.b); else if (e.b === v) r.push(e.a); }); return r; }
  deg(v) { return this.nbrs(v).length; }
  get vs() { return Object.keys(this.pos); }
  addEdge(a, b, w) {
    if (this.has(a, b)) return this.edge(a, b);
    const el = S('line', { class: 'gx-e' }, this.L.e), hit = S('line', { class: 'gx-hit' }, this.L.h), t = S('text', { class: 'gx-w' }, this.L.w);
    hit.dataset.a = a; hit.dataset.b = b;
    t.textContent = w ?? '';
    const e = { a, b, w, el, t, hit }; this.E.set(this.key(a, b), e);
    this.wcls(e); this.placeEdge(e); return e;
  }
  wcls(e) { e.t.setAttribute('class', 'gx-w' + (this.o.weights && e.w !== undefined && e.w !== '' && e.w !== null ? '' : ' off')); }
  setW(a, b, w) { const e = this.edge(a, b); if (!e) return; e.w = w; e.t.textContent = w ?? ''; this.wcls(e); }
  delEdge(a, b) { const e = this.edge(a, b); if (!e) return; e.el.remove(); e.t.remove(); e.hit.remove(); this.E.delete(this.key(a, b)); }
  addNode(v) {
    const g = S('g', { class: 'gx-n', 'data-v': v }, this.L.n); S('circle', { r: this.o.R + 9, class: 'ring' }, g); S('circle', { r: this.o.R, class: 'core' }, g); const t = S('text', {}, g); t.textContent = v; this.lab[v] = t;
    const b = S('g', { class: 'gx-b' }, this.L.t); S('circle', { r: 15 }, b); S('text', {}, b);
    const tg = S('g', { class: 'gx-t' }, this.L.t); S('rect', { rx: 10, height: 30, y: -15 }, tg); S('text', {}, tg);
    this.N[v] = g; this.B[v] = b; this.T[v] = tg;
  }
  setLabel(v, s) { this.lab[v].textContent = s; }
  tr(el, x, y) { const t = `translate(${x}px, ${y}px)`; el.style.transform = t; el.style.setProperty('--tr', t); }
  angles(v) { const [x, y] = this.pos[v]; return this.nbrs(v).map(u => Math.atan2(this.pos[u][1] - y, this.pos[u][0] - x)); }
  best(v, av, posAt, hw, hh, placed, segs, prefer) {
    const R = this.o.R; let best = prefer, bs = -Infinity;
    for (let i = 0; i < 24; i++) {
      const a = -Math.PI + i * Math.PI / 12, [px, py] = posAt(a);
      let sc = av.length ? Math.min(...av.map(b => angDist(a, b))) : Math.PI;
      sc += 0.3 * (1 - angDist(a, prefer) / Math.PI);
      for (const u in this.pos) { if (u === v) continue; const [ux, uy] = this.pos[u]; const d = Math.hypot(Math.max(0, Math.abs(px - ux) - hw), Math.max(0, Math.abs(py - uy) - hh)); if (d < R + 8) sc -= 2 + 2 * (1 - d / (R + 8)); else if (d < R + 44) sc -= .7 * (1 - (d - R - 8) / 36); }
      for (const [qx, qy, qw, qh] of placed) if (Math.abs(px - qx) < hw + qw + 3 && Math.abs(py - qy) < hh + qh + 3) sc -= 2.5;
      for (const [p, q, a1, b1] of segs) { if (a1 === v || b1 === v) continue; if (segDist([px, py], p, q) < Math.max(hw, hh) + 2) sc -= 1.3; }
      if (px - hw < 0 || px + hw > this.o.W || py - hh < 0 || py + hh > this.o.H) sc -= 1;
      if (sc > bs) { bs = sc; best = a; }
    }
    return best;
  }
  place() {
    const R = this.o.R, placed = [], segs = [...this.E.values()].map(e => [this.pos[e.a], this.pos[e.b], e.a, e.b]);
    for (const v in this.pos) this.tr(this.N[v], this.pos[v][0], this.pos[v][1]);
    for (const v in this.pos) {
      const [x, y] = this.pos[v], av = this.angles(v), tw = this.tagW(v);
      const tAt = a => { const d = R + Math.abs(Math.cos(a)) * (tw / 2 + 6) + Math.abs(Math.sin(a)) * 21; return [x + Math.cos(a) * d, y + Math.sin(a) * d]; };
      const ta = this.o.tagDir[v] !== undefined ? this.o.tagDir[v] * Math.PI / 180 : this.best(v, av, tAt, tw / 2 + 3, 16, placed, segs, Math.PI / 2);
      const tp = tAt(ta); placed.push([tp[0], tp[1], tw / 2 + 3, 16]); this.tr(this.T[v], tp[0], tp[1]);
      const bAt = a => [x + Math.cos(a) * (R + 9), y + Math.sin(a) * (R + 9)];
      const ba = this.o.badgeDir[v] !== undefined ? this.o.badgeDir[v] * Math.PI / 180 : this.best(v, av, bAt, 15, 15, placed, segs, -Math.PI / 4);
      const bp = bAt(ba); placed.push([bp[0], bp[1], 15, 15]); this.tr(this.B[v], bp[0], bp[1]);
    }
    this.E.forEach(e => this.placeEdge(e));
  }
  tagW(v) { const t = this.T[v].lastChild.textContent || 'П0'; return Math.max(44, t.length * 11 + 18); }
  placeEdge(e) {
    const p = this.pos[e.a], q = this.pos[e.b]; if (!p || !q) return;
    [e.el, e.hit].forEach(l => { l.setAttribute('x1', p[0]); l.setAttribute('y1', p[1]); l.setAttribute('x2', q[0]); l.setAttribute('y2', q[1]); });
    e.el.style.setProperty('--len', Math.hypot(q[0] - p[0], q[1] - p[1]).toFixed(1));
    e.t.setAttribute('x', (p[0] + q[0]) / 2); e.t.setAttribute('y', (p[1] + q[1]) / 2);
  }
  async morph(to, ms = 900, alive = () => true) {
    const from = Object.assign({}, this.pos);
    if (reduced()) { Object.assign(this.pos, to); this.place(); return; }
    const t0 = performance.now();
    await new Promise(res => {
      const tick = now => {
        if (!alive()) return res();
        const k = Math.min(1, Math.max(0, now - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        for (const v in to) this.pos[v] = [from[v][0] + (to[v][0] - from[v][0]) * e, from[v][1] + (to[v][1] - from[v][1]) * e];
        this.place(); if (k < 1) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
  }
  cls(v, name, on = true) { const g = this.N[v]; if (g) name.split(' ').forEach(n => g.classList.toggle(n, on)); }
  ecls(a, b, name, on = true) { const e = this.edge(a, b); if (!e) return; name.split(' ').forEach(n => { e.el.classList.toggle(n, on); if (n !== 'draw' && n !== 'off') e.t.classList.toggle(n, on); }); }
  allE(name, on = true) { this.E.forEach(e => this.ecls(e.a, e.b, name, on)); }
  allN(name, on = true) { for (const v in this.N) this.cls(v, name, on); }
  clear(...names) {
    for (const v in this.N) names.forEach(n => { this.N[v].classList.remove(n); });
    this.E.forEach(e => names.forEach(n => { e.el.classList.remove(n); e.t.classList.remove(n); }));
  }
  reset() {
    for (const v in this.N) { this.N[v].setAttribute('class', 'gx-n' + (this.N[v].classList.contains('click') ? ' click' : '')); this.badge(v, null); this.tag(v, null); }
    this.E.forEach(e => { e.el.setAttribute('class', 'gx-e'); this.wcls(e); });
    this.L.x.innerHTML = '';
  }
  badge(v, text, cls = '', pop = false) {
    const b = this.B[v]; if (!b) return;
    if (text === null || text === undefined) { b.setAttribute('class', 'gx-b'); return; }
    b.lastChild.textContent = text; b.setAttribute('class', 'gx-b on ' + cls);
    if (pop && !reduced()) { b.classList.remove('pulse'); void b.getBBox(); b.classList.add('pulse'); }
  }
  tag(v, text, cls = '', pop = false) {
    const t = this.T[v]; if (!t) return;
    if (text === null || text === undefined) { t.setAttribute('class', 'gx-t'); return; }
    t.lastChild.textContent = text; const w = Math.max(44, String(text).length * 11 + 18);
    t.firstChild.setAttribute('width', w); t.firstChild.setAttribute('x', -w / 2);
    t.setAttribute('class', 'gx-t on ' + cls);
    if (pop && !reduced()) { t.classList.remove('pop'); void t.getBBox(); t.classList.add('pop'); }
    this.place();
  }
  shake(v) { const g = this.N[v]; if (!g || reduced()) return; g.classList.remove('shake'); void g.getBBox(); g.classList.add('shake'); }
  center(v) { return this.pos[v]; }
  /* крестик «дороги нет» на середине отрезка */
  cross(a, b) { const p = this.pos[a], q = this.pos[b]; const t = S('text', { class: 'gx-x', x: (p[0] + q[0]) / 2, y: (p[1] + q[1]) / 2 }, this.L.x); t.textContent = '✕'; return t; }
  ghost(a, b, cls = 'ghost') { const p = this.pos[a], q = this.pos[b]; return S('line', { class: 'gx-e ' + cls, x1: p[0], y1: p[1], x2: q[0], y2: q[1] }, this.L.x); }
  axis(x1, y1, x2, y2) { return S('line', { class: 'gx-axis', x1, y1, x2, y2 }, this.L.x); }
  drawIn(a, b) { const e = this.edge(a, b); if (!e) return; e.el.classList.remove('off', 'draw'); if (reduced()) return; void e.el.getBBox(); e.el.classList.add('draw'); }
}

/* ================= таблица ================= */
class MatrixView {
  constructor(host, o) {
    o = this.o = Object.assign({ cw: 54, ch: 46, deg: true, labels: P, val: () => '', fc: 20, fh: 16 }, o);
    host.innerHTML = ''; host.classList.add('mx-wrap'); host.classList.toggle('nodeg', !o.deg); this.host = host;
    const box = H('div', 'mx-box', host), t = H('table', 'mx', box); this.table = t;
    t.style.setProperty('--cw', o.cw + 'px'); t.style.setProperty('--ch', o.ch + 'px'); t.style.setProperty('--fc', o.fc + 'px'); t.style.setProperty('--fh', o.fh + 'px');
    const n = this.n = o.n;
    const hr = H('tr', '', t); H('th', 'c0', hr); this.ch = [];
    for (let j = 0; j < n; j++) this.ch.push(H('th', 'chd', hr, o.labels(j)));
    this.rh = []; this.td = [];
    for (let i = 0; i < n; i++) {
      const tr = H('tr', '', t); const th = H('th', 'rhd', tr, o.labels(i)); th.dataset.i = i; this.rh.push(th); this.td.push([]);
      for (let j = 0; j < n; j++) { const td = H('td', 'c' + (i === j ? ' dg' : ''), tr); td.dataset.i = i; td.dataset.j = j; this.td[i].push(td); }
    }
    this.ch.forEach((th, j) => { th.dataset.j = j; });
    this.Lx = H('div', 'mx-l', host); this.Rx = H('div', 'mx-r', host);
    this.tg = []; this.dg = [];
    for (let i = 0; i < n; i++) { this.tg.push(H('div', 'mx-tag', this.Lx)); this.dg.push(H('div', 'mx-deg', this.Rx)); }
    this.dh = H('div', 'mx-dh', this.Rx, 'степень');
    this.fill(); this.layout();
  }
  layout() {
    const hr = this.host.getBoundingClientRect(), k = hr.width / (this.host.offsetWidth || 1) || 1;
    const mid = el => { const r = el.getBoundingClientRect(); return (r.top + r.height / 2 - hr.top) / k; };
    this.rh.forEach((th, i) => { const y = mid(th) + 'px'; this.tg[i].style.top = y; this.dg[i].style.top = y; });
    this.dh.style.top = mid(this.ch[0]) + 'px';
  }
  get(i, j) { return this.M ? this.M[i][j] : ''; }
  set(i, j, v, pop = false) {
    if (i === j) return; const td = this.td[i][j];
    td.innerHTML = v === '' || v === null || v === undefined ? '' : (pop && !reduced() ? `<span class="pp">${v}</span>` : String(v));
  }
  fill() { for (let i = 0; i < this.n; i++) for (let j = 0; j < this.n; j++) this.set(i, j, this.o.val(i, j)); }
  blank() { for (let i = 0; i < this.n; i++) for (let j = 0; j < this.n; j++) this.set(i, j, ''); }
  cls(i, j, name, on = true) { const td = this.td[i] && this.td[i][j]; if (td) name.split(' ').forEach(n => td.classList.toggle(n, on)); }
  pair(i, j, name, mir = name, on = true) { this.cls(i, j, name, on); this.cls(j, i, mir, on); }
  row(i, name, on = true) { this.rh[i].classList.toggle(name, on); this.td[i].forEach((td, j) => { if (j !== i) td.classList.toggle(name, on); }); }
  col(j, name, on = true) { this.ch[j].classList.toggle(name, on); this.td.forEach((r, i) => { if (i !== j) r[j].classList.toggle(name, on); }); }
  head(i, name, on = true) { this.rh[i].classList.toggle(name, on); }
  clear(...names) { $$('th, td', this.table).forEach(e => names.forEach(n => e.classList.remove(n))); }
  reset(keep = []) {
    $$('td.c', this.table).forEach(td => { const c = ['c']; if (+td.dataset.i === +td.dataset.j) c.push('dg'); keep.forEach(k => { if (td.classList.contains(k)) c.push(k); }); td.className = c.join(' '); });
    $$('th', this.table).forEach(th => { const c = [th.classList.contains('rhd') ? 'rhd' : th.classList.contains('chd') ? 'chd' : 'c0']; keep.forEach(k => { if (th.classList.contains(k)) c.push(k); }); th.className = c.join(' '); });
    for (let i = 0; i < this.n; i++) { this.tag(i, null); this.deg(i, null); }
    this.degHead(false);
  }
  deg(i, v, cls = '', pop = false) {
    const d = this.dg[i]; if (v === null || v === undefined) { d.className = 'mx-deg'; return; }
    d.textContent = v; d.className = 'mx-deg on ' + cls;
    if (pop && !reduced()) { d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop'); }
  }
  degHead(on) { this.dh.classList.toggle('on', on); }
  tag(i, text, cls = '') { const t = this.tg[i]; if (text === null || text === undefined) { t.className = 'mx-tag'; return; } t.textContent = text; t.className = 'mx-tag on ' + cls; }
  clickable(on = true) { $$('td.c:not(.dg), th.rhd', this.table).forEach(e => e.classList.toggle('click', on)); }
}

/* матрица смежности → степени, соседи */
const mk = (n, list) => { const M = [...Array(n)].map(() => Array(n).fill('')); list.forEach(([a, b, w]) => { M[a - 1][b - 1] = M[b - 1][a - 1] = w; }); return M; };
const degsM = M => M.map(r => r.filter(x => x !== '').length);
const nbrsM = (M, i) => M[i].map((x, j) => x !== '' ? j : -1).filter(j => j >= 0);

/* наведение: клетка ↔ дорога, вершина ↔ строка */
function linkHover(gv, mv, st) {
  const inv = () => { const r = {}; for (const v in st.map) if (st.map[v] !== undefined) r[st.map[v]] = v; return r; };
  const off = () => { mv.clear('hv', 'hvm'); gv.clear('hv'); };
  mv.table.addEventListener('mouseover', e => {
    const td = e.target.closest('td.c'), th = e.target.closest('th.rhd'); off();
    if (th) { const i = +th.dataset.i, v = inv()[i]; th.classList.add('hv'); if (v !== undefined) gv.cls(v, 'hv'); return; }
    if (!td || td.classList.contains('dg')) return;
    const i = +td.dataset.i, j = +td.dataset.j; mv.cls(i, j, 'hv'); mv.cls(j, i, 'hvm'); mv.rh[i].classList.add('hv'); mv.ch[j].classList.add('hv');
    const m = inv(); if (m[i] !== undefined) gv.cls(m[i], 'hv'); if (m[j] !== undefined) gv.cls(m[j], 'hv');
    if (m[i] !== undefined && m[j] !== undefined && gv.has(m[i], m[j])) gv.ecls(m[i], m[j], 'hv');
  });
  mv.table.addEventListener('mouseleave', off);
  gv.svg.addEventListener('mouseover', e => {
    off();
    const n = e.target.closest('.gx-n'), h = e.target.closest('.gx-hit');
    if (n) { const v = n.dataset.v; gv.cls(v, 'hv'); const i = st.map[v]; if (i !== undefined) { mv.rh[i].classList.add('hv'); } return; }
    if (h) { const a = h.dataset.a, b = h.dataset.b; gv.ecls(a, b, 'hv'); const i = st.map[a], j = st.map[b]; if (i !== undefined && j !== undefined) { mv.cls(i, j, 'hv'); mv.cls(j, i, 'hvm'); } }
  });
  gv.svg.addEventListener('mouseleave', off);
}

/* лучи «вершина → строка таблицы» поверх слайда */
class Beams {
  constructor(svg, slide) { this.svg = svg; this.slide = slide; svg.setAttribute('viewBox', '0 0 1600 724'); }
  rel(el) { const s = this.slide.getBoundingClientRect(), k = s.width / (this.slide.offsetWidth || 1), r = el.getBoundingClientRect(); return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k }; }
  draw(a, b, anim = true) {
    if (!a || !b) return;
    const p = this.rel(a), q = this.rel(b);
    const x1 = p.x + p.w + 2, y1 = p.y + p.h / 2, x2 = q.x - 4, y2 = q.y + q.h / 2;
    const dx = Math.max(60, Math.abs(x2 - x1) * .5);
    const path = S('path', { d: `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`, class: 'beam' }, this.svg);
    path.style.setProperty('--len', path.getTotalLength().toFixed(1));
    if (anim && !reduced()) path.classList.add('draw');
    S('circle', { cx: x1, cy: y1, r: 5, class: 'beam-dot' }, this.svg); S('circle', { cx: x2, cy: y2, r: 5, class: 'beam-dot' }, this.svg);
    return path;
  }
  /* метка перелетает из вершины в строку таблицы по дуге и оставляет тающий след */
  fly(a, b, text) {
    if (!a || !b || reduced()) return;
    const p = this.rel(a), q = this.rel(b);
    const x1 = p.x + p.w / 2, y1 = p.y + p.h / 2, x2 = q.x + q.w / 2, y2 = q.y + q.h / 2;
    const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - 150;
    const at = t => [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2];
    const trail = S('path', { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, class: 'beam trail' }, this.svg);
    trail.style.setProperty('--len', trail.getTotalLength().toFixed(1)); trail.classList.add('draw');
    setTimeout(() => trail.remove(), 1700);
    const chip = H('div', 'flychip', this.slide, text), fr = [];
    for (let k = 0; k <= 24; k++) { const t = k / 24, [x, y] = at(t); fr.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1 + Math.sin(Math.PI * t) * .4})`, opacity: k === 24 ? .2 : 1 }); }
    chip.animate(fr, { duration: 950, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' }).onfinish = () => chip.remove();
  }
  clear() { this.svg.innerHTML = ''; $$('.flychip', this.slide).forEach(c => c.remove()); }
}

/* ================= задачи с занятия ================= */
const T1 = {
  n: 7, M: mk(7, [[1, 2, 45], [1, 4, 10], [2, 4, 30], [2, 6, 55], [3, 5, 15], [3, 6, 60], [4, 6, 20], [4, 7, 35], [5, 6, 55], [6, 7, 45]]),
  nodes: { А: [843, 476], Б: [934, 343], Д: [1040, 362], В: [968, 476], Е: [1124, 476], К: [1263, 476], Г: [1044, 546] },
  edges: [['А', 'Б'], ['А', 'В'], ['Б', 'В'], ['В', 'Д'], ['Д', 'Е'], ['В', 'Е'], ['В', 'Г'], ['Е', 'Г'], ['Е', 'К'], ['Г', 'К']],
  kl: { А: [-14, 0], Б: [-2, -16], Д: [6, -17], В: [-4, 17], Е: [13, -13], К: [2, -16], Г: [-12, 12] }
};
const T2 = {
  n: 8, M: mk(8, [[1, 6, 13], [1, 8, 2], [2, 4, 53], [2, 7, 5], [3, 4, 1], [3, 5, 21], [4, 7, 30], [5, 6, 8], [5, 8, 39], [7, 8, 3]]),
  nodes: { C: [1104, 526], E: [1300, 526], D: [1161, 603], H: [1251, 603], G: [1346, 624], B: [1161, 661], A: [1104, 726], F: [1300, 726] },
  edges: [['C', 'E'], ['C', 'D'], ['C', 'A'], ['D', 'H'], ['H', 'E'], ['E', 'G'], ['G', 'F'], ['A', 'B'], ['B', 'F'], ['A', 'F']],
  kl: { C: [-12, -14], E: [12, -14], D: [6, -17], H: [12, 13], G: [15, 2], B: [12, -13], A: [-6, 18], F: [10, 17] },
  disp: { C: [0, 0], E: [420, 0], D: [110, 95], H: [300, 95], G: [520, 145], B: [160, 220], A: [0, 300], F: [420, 300] },
  map: { A: 6, B: 1, C: 7, D: 0, E: 4, F: 3, G: 2, H: 5 }
};
const T3 = {
  n: 7, M: mk(7, [[1, 2, 12], [1, 6, 7], [2, 5, 8], [3, 6, 11], [3, 7, 14], [4, 6, 5], [5, 6, 15], [6, 7, 9]]),
  nodes: { Б: [925, 416], В: [1063, 416], Д: [953, 468], А: [841, 536], Г: [997, 536], Ж: [1144, 536], Е: [997, 638] },
  edges: [['А', 'Б'], ['Б', 'В'], ['В', 'Г'], ['Д', 'Г'], ['А', 'Г'], ['Г', 'Ж'], ['Г', 'Е'], ['Е', 'Ж']]
};
const T4 = {
  n: 7, M: mk(7, [[1, 2, 10], [1, 3, 15], [2, 4, 13], [2, 5, 17], [3, 5, 19], [3, 7, 9], [4, 5, 10], [4, 6, 20], [4, 7, 11], [5, 7, 20], [6, 7, 25]]),
  nodes: { А: [811, 580], Б: [927, 465], Д: [1167, 465], Г: [1051, 578], Ж: [1297, 576], В: [927, 688], Е: [1168, 688] },
  edges: [['А', 'Б'], ['А', 'В'], ['Б', 'Д'], ['Б', 'Г'], ['В', 'Г'], ['В', 'Е'], ['Г', 'Д'], ['Г', 'Е'], ['Д', 'Е'], ['Д', 'Ж'], ['Е', 'Ж']]
};

/* доска разбора: граф + таблица + лучи + наведение */
class Board {
  constructor(el, T, ids, o = {}) {
    this.el = el; this.T = T; this.M = T.M; this.map = {};
    this.gv = new GraphView($(ids.g, el), Object.assign({ nodes: T.disp || T.nodes, edges: T.edges, W: 640, H: 400, R: 26, pad: 50 }, o.g || {}));
    this.mv = new MatrixView($(ids.m, el), Object.assign({ n: T.n, val: (i, j) => T.M[i][j], cw: 54, ch: 46 }, o.m || {}));
    this.beams = new Beams($(ids.b, el), el);
    const L = this.gv.svg.closest('.sv-l'); if (L) L.style.width = this.gv.o.W + 'px';
    this.dT = degsM(T.M); this.dG = {}; this.gv.vs.forEach(v => { this.dG[v] = this.gv.deg(v); });
    linkHover(this.gv, this.mv, this);
  }
  reset() { this.map = {}; this.gv.reset(); this.mv.reset(); this.beams.clear(); }
  degT(cls = () => '') { this.mv.degHead(true); this.dT.forEach((d, i) => this.mv.deg(i, d, cls(d, i))); }
  degG(cls = () => '') { for (const v in this.dG) this.gv.badge(v, this.dG[v], cls(this.dG[v], v)); }
  setMap(v, i, cls = 'ok', pop = false) {
    if (i === null) { delete this.map[v]; this.gv.tag(v, null); return; }
    this.map[v] = i; this.gv.tag(v, P(i), cls, pop); this.mv.tag(i, v, cls);
  }
  beam(v, i, anim) { if (anim) this.beams.fly($('circle', this.gv.N[v]), this.mv.tg[i].classList.contains('on') ? this.mv.tg[i] : this.mv.rh[i], v); }
  answer(a, b, cls = 'ans') { const i = this.map[a], j = this.map[b]; this.gv.ecls(a, b, cls); if (i !== undefined && j !== undefined) { this.mv.cls(i, j, cls); this.mv.cls(j, i, 'mir'); } return this.M[i][j]; }
}
/* универсальный пошаговый проигрыватель: шаги 1..s, анимируется только последний */
async function play(F, s, anim, alive) {
  for (let i = 1; i <= s; i++) {
    if (!alive()) return;
    const f = F[i]; if (f) await f(anim && i === s, i === s);
  }
}
const uniqSet = arr => { const c = {}; arr.forEach(d => { c[d] = (c[d] || 0) + 1; }); return d => c[d] === 1; };

const W = {};

/* ================= 1 · титул: живой граф ⇄ таблица ================= */
const HN = { А: [60, 190], Б: [170, 60], В: [170, 320], Г: [290, 190], Д: [390, 70], Е: [390, 310] };
const HE = [['А', 'Б', 12], ['А', 'Г', 9], ['Б', 'Г', 15], ['Б', 'В', 10], ['В', 'Г', 7], ['Г', 'Д', 6], ['Д', 'Е', 14], ['Г', 'Е', 21]];
const HL = Object.keys(HN);
W.hero = {
  init(el) {
    this.el = el; this.T = task();
    this.gv = new GraphView($('#heroG', el), { nodes: HN, edges: HE, W: 390, H: 440, R: 25, pad: 34, weights: true });
    this.beams = new Beams($('#heroB', el), el);
  },
  build(labels, val) { this.mv = new MatrixView($('#heroM', this.el), { n: 6, cw: 52, ch: 48, fc: 19, fh: 15, labels, val }); },
  step(el, s, o) { if (o.enter) this.loop(); },
  leave() { this.T.stop(); },
  async loop() {
    const k = this.T.next(), alive = () => this.T.alive(k), cap = $('#heroCap', this.el), gv = this.gv;
    const say = h => { cap.innerHTML = h; };
    const idx = v => HL.indexOf(v);
    while (alive()) {
      this.beams.clear(); gv.reset(); gv.allE('off'); gv.E.forEach(e => e.t.classList.add('off'));
      this.build(i => HL[i], () => ''); say('&nbsp;');
      await wait(700); if (!alive()) return;
      for (const [a, b, w] of shuffle(HE.slice())) {
        gv.drawIn(a, b); gv.edge(a, b).t.classList.remove('off'); gv.ecls(a, b, 'hl');
        const i = idx(a), j = idx(b); this.mv.set(i, j, w, true); this.mv.set(j, i, w, true); this.mv.pair(i, j, 'hl', 'mir');
        say(`Дорога <b>${a}–${b}</b> · ${w} км → две клетки`);
        await wait(reduced() ? 300 : 820); if (!alive()) return;
        gv.ecls(a, b, 'hl', false); this.mv.clear('hl', 'mir');
      }
      say('Степени: сколько дорог у каждой вершины');
      HL.forEach((v, i) => { gv.badge(v, gv.deg(v), '', true); this.mv.deg(i, gv.deg(v), '', true); }); this.mv.degHead(true);
      await wait(2200); if (!alive()) return;
      /* в задаче номера перемешаны */
      const perm = shuffle([0, 1, 2, 3, 4, 5]); /* вершина HL[v] → строка perm[v] */
      const inv = []; perm.forEach((r, v) => { inv[r] = v; });
      const M = [...Array(6)].map(() => Array(6).fill(''));
      HE.forEach(([a, b, w]) => { M[perm[idx(a)]][perm[idx(b)]] = M[perm[idx(b)]][perm[idx(a)]] = w; });
      this.build(P, (i, j) => M[i][j]); this.mv.degHead(true);
      degsM(M).forEach((d, i) => this.mv.deg(i, d));
      say('А в задаче вместо букв — номера, и они перемешаны');
      await wait(2300); if (!alive()) return;
      const r = perm[idx('Г')];
      gv.badge('Г', 5, 'uni', true); this.mv.deg(r, 5, 'uni', true); gv.cls('Г', 'hl');
      say('У <b>Г</b> пять дорог, и в таблице пятёрка одна — значит');
      await wait(1500); if (!alive()) return;
      this.beams.fly($('circle', gv.N['Г']), this.mv.rh[r], 'Г'); await wait(reduced() ? 0 : 900); if (!alive()) return;
      gv.tag('Г', P(r), '', true); this.mv.tag(r, 'Г'); this.mv.head(r, 'sel');
      say(`<b>Г = ${P(r)}</b>. Так и решается первый номер`);
      await wait(3600); if (!alive()) return;
    }
  }
};

/* ================= соцсеть ================= */
const SN = { Дмитрий: [120, 250, 'a1', 'Д'], Артём: [330, 90, 'a2', 'А'], Ион: [330, 410, 'a3', 'И'], Артур: [540, 250, 'a4', 'А'] };
const SE = [['Дмитрий', 'Артём'], ['Дмитрий', 'Ион'], ['Артём', 'Артур'], ['Ион', 'Артур']];
const SCOL = { a1: '#1D1D1F', a2: '#2B6CB0', a3: '#2F855A', a4: '#B9521D' };
W.social = {
  init(el) {
    this.T = task(); const svg = $('#soG', el); svg.setAttribute('viewBox', '0 0 640 500'); svg.setAttribute('width', 640);
    this.E = {}; this.N = {};
    const gE = S('g', {}, svg), gX = S('g', {}, svg), gN = S('g', {}, svg);
    this.sug = S('line', { class: 'so-e sug off', x1: SN.Дмитрий[0], y1: SN.Дмитрий[1], x2: SN.Артур[0], y2: SN.Артур[1] }, gE);
    this.q = S('text', { class: 'so-q', x: (SN.Дмитрий[0] + SN.Артур[0]) / 2, y: SN.Дмитрий[1] }, gE); this.q.textContent = '?';
    SE.forEach(([a, b]) => { this.E[a + b] = S('line', { class: 'so-e', x1: SN[a][0], y1: SN[a][1], x2: SN[b][0], y2: SN[b][1] }, gE); });
    this.gX = gX;
    for (const v in SN) {
      const [x, y, c, ini] = SN[v], g = S('g', { class: 'so-n', transform: `translate(${x},${y})` }, gN);
      S('circle', { r: 46, fill: SCOL[c] }, g); const t = S('text', { class: 'ini' }, g); t.textContent = ini;
      const nm = S('text', { class: 'nm', y: 74 }, g); nm.textContent = v === 'Дмитрий' ? 'Дмитрий (ты)' : v; this.N[v] = g;
    }
  },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o);
    const vis = { Дмитрий: s >= 0, Артём: s >= 1, Ион: s >= 1, Артур: s >= 2 };
    for (const v in this.N) this.N[v].classList.toggle('off', !vis[v]);
    this.E['ДмитрийАртём'].classList.toggle('off', s < 1); this.E['ДмитрийИон'].classList.toggle('off', s < 1);
    this.E['АртёмАртур'].classList.toggle('off', s < 2); this.E['ИонАртур'].classList.toggle('off', s < 2);
    Object.values(this.E).forEach(e => e.classList.remove('hl'));
    this.sug.classList.toggle('off', s < 3); this.q.style.opacity = s >= 3 ? 1 : 0;
    this.gX.innerHTML = '';
    $$('#soFeed .ph-row', el).forEach(r => r.classList.toggle('off', s < 1));
    $('#soNote', el).classList.toggle('on', s >= 3);
    $('#soMore', el).classList.toggle('on', s >= 4);
    $('#soHead', el).innerHTML = s >= 4 ? 'Графы <em>повсюду</em>' : s === 3 ? 'Путь длины два: <em>возможно, вы знакомы</em>' : 'Откуда соцсеть знает твоих <em>друзей</em>?';
    if (s === 3) {
      Object.values(this.E).forEach(e => e.classList.add('hl'));
      if (anim) {
        const dots = [['Дмитрий', 'Артём', 'Артур'], ['Дмитрий', 'Ион', 'Артур']];
        for (let rep = 0; rep < 2 && alive(); rep++) {
          const ds = dots.map(() => S('circle', { r: 9, class: 'so-dot' }, this.gX));
          const t0 = performance.now(), T = 1400;
          await new Promise(res => { const tick = now => { if (!alive()) return res(); const kk = Math.min(1, Math.max(0, now - t0) / T);
            dots.forEach((p, i) => { const seg = kk < .5 ? 0 : 1, u = kk < .5 ? kk * 2 : (kk - .5) * 2, A = SN[p[seg]], B = SN[p[seg + 1]];
              ds[i].setAttribute('cx', A[0] + (B[0] - A[0]) * u); ds[i].setAttribute('cy', A[1] + (B[1] - A[1]) * u); });
            if (kk < 1) requestAnimationFrame(tick); else res(); }; requestAnimationFrame(tick); });
          this.gX.innerHTML = '';
        }
      }
    }
  }
};

/* ================= граф в таблице ================= */
const MN = { Б: [260, 70], А: [90, 340], В: [430, 340] };
W.matrix = {
  init(el) {
    this.T = task();
    this.gv = new GraphView($('#mxG', el), { nodes: MN, edges: [['А', 'Б', 10], ['Б', 'В', 25]], W: 440, H: 420, R: 34, pad: 50 });
    this.gv.vs.forEach(v => { this.gv.lab[v].style.fontSize = '28px'; });
    this.L = ['А', 'Б', 'В'];
    this.mv = new MatrixView($('#mxM', el), { n: 3, cw: 96, ch: 84, fc: 30, fh: 24, deg: true, labels: i => this.L[i] });
    this.mv.blank();
  },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k);
    const anim = animOf(o), gv = this.gv, mv = this.mv, side = $('#mxSide', el), L = this.L;
    gv.reset(); mv.reset(); mv.blank(); gv.L.x.innerHTML = '';
    $('#mxM', el).classList.toggle('on', s >= 1);
    const star = (i, j, pop) => { mv.set(i, j, '<span class="star">✱</span>', pop); };
    const card = (t, h, cls = '') => `<div class="fcard ${cls}"><h3>${t}</h3>${h}</div>`;
    const head = h => { $('#mxHead', el).innerHTML = h; };
    if (s >= 4) { star(0, 1); star(1, 0); star(1, 2); star(2, 1); }
    else { if (s >= 2) star(0, 1, anim && s === 2); }
    if (s === 0) { head('Компьютер не видит <em>картинку</em>'); side.innerHTML = card('Вопрос', 'Мы смотрим на рисунок и сразу понимаем, что с чем связано. А как <b>хранить</b> граф в компьютере? Не фотографией же.'); return; }
    if (s === 1) { head('Граф можно записать <em>таблицей</em>'); side.innerHTML = card('Таблица', 'Выписываем вершины <b>дважды</b>: в первую строку и в первый столбец. Это одни и те же пункты.'); return; }
    if (s === 2) {
      head('Есть ли дорога <em>А–Б</em>?'); mv.row(0, 'band'); mv.col(1, 'band'); mv.cls(0, 1, 'hl'); gv.ecls('А', 'Б', 'hl'); gv.cls('А', 'hl'); gv.cls('Б', 'hl');
      side.innerHTML = card('Пересечение', 'Строка <b>А</b> и столбец <b>Б</b> встретились в одной клетке. В ней <b>отметка</b> — значит, дорога есть.'); return;
    }
    if (s === 3) {
      head('А дорога <em>А–В</em>?'); mv.row(0, 'band'); mv.col(2, 'band'); mv.cls(0, 2, 'bad'); mv.set(0, 2, '<span class="x">✕</span>', anim);
      gv.ghost('А', 'В', 'bad'); gv.cross('А', 'В'); gv.cls('А', 'hl'); gv.cls('В', 'hl');
      side.innerHTML = card('Пусто', 'На пересечении строки <b>А</b> и столбца <b>В</b> ничего нет — <b>дороги нет</b>. И на рисунке их правда ничего не соединяет.'); return;
    }
    if (s === 4) {
      head('Каждая дорога — <em>дважды</em>'); mv.pair(0, 1, 'hl', 'mir'); mv.pair(1, 2, 'hl', 'mir');
      side.innerHTML = card('Симметрия', 'А–Б и Б–А — <b>одна и та же дорога</b>, поэтому таблица зеркальна относительно серой диагонали.') +
        card('Диагональ', 'Серые клетки — дорога из пункта <b>в самого себя</b>. Таких не бывает, клетки пустые.'); return;
    }
    if (s === 6) {
      head('Степень — <em>по таблице</em>');
      mv.set(0, 1, 10); mv.set(1, 0, 10); mv.set(1, 2, 25); mv.set(2, 1, 25);
      gv.o.weights = true; gv.E.forEach(e => gv.wcls(e)); gv.o.weights = false;
      side.innerHTML = card('Строка = вершина', 'Степень по таблице — сколько <b>заполненных клеток</b> в строке. У Б их две — и на рисунке у Б две дороги.') + '<div class="dg-count" id="mxCnt">0</div>';
      mv.row(1, 'band'); gv.cls('Б', 'hl'); mv.degHead(true);
      const cnt = $('#mxCnt', side), cells = [0, 2];
      if (anim) { for (let i = 0; i < cells.length; i++) { await wait(450); if (!alive()) return; mv.cls(1, cells[i], 'scn'); gv.ecls('Б', L[cells[i]], 'hl'); cnt.textContent = i + 1; } await wait(400); if (!alive()) return; }
      cells.forEach(j => { mv.cls(1, j, 'scn'); gv.ecls('Б', L[j], 'hl'); }); cnt.textContent = 2;
      mv.deg(1, 2, 'uni', anim); gv.badge('Б', 2, 'uni', anim);
      if (anim) { await wait(500); if (!alive()) return; }
      mv.deg(0, 1, '', anim); mv.deg(2, 1, '', anim); gv.badge('А', 1); gv.badge('В', 1);
      return;
    }
    head('Вместо звёздочек — <em>километры</em>');
    mv.set(0, 1, 10, anim); mv.set(1, 0, 10, anim); mv.set(1, 2, 25, anim); mv.set(2, 1, 25, anim);
    gv.o.weights = true; gv.E.forEach(e => gv.wcls(e)); gv.o.weights = false;
    side.innerHTML = card('Как на ЕГЭ', 'В задачах в клетках стоят <b>длины дорог</b>. Число на пересечении — длина дороги между этими пунктами.', 'dark') + '<p class="small">Наведи на клетку — подсветится её зеркальная пара.</p>';
  }
};
/* наведение в маленькой таблице */
W.matrix.initHover = true;

/* ================= песочница ================= */
const SBN = { А: [100, 110], Б: [300, 50], В: [500, 110], Г: [500, 330], Д: [300, 390], Е: [100, 330] };
const SBL = Object.keys(SBN);
W.sandbox = {
  init(el) {
    this.el = el; this.sel = null;
    this.gv = new GraphView($('#sbG', el), { pos: SBN, nodes: SBN, edges: [], W: 600, H: 440, R: 30, weights: true });
    this.mv = new MatrixView($('#sbM', el), { n: 6, cw: 62, ch: 54, fc: 21, labels: i => SBL[i] });
    this.mv.clickable(); this.gv.allN('click');
    this.st = { map: {} }; SBL.forEach((v, i) => { this.st.map[v] = i; });
    linkHover(this.gv, this.mv, this.st);
    this.preset();
    this.gv.svg.addEventListener('click', e => { const n = e.target.closest('.gx-n'); if (n) this.pick(n.dataset.v); else if (!e.target.closest('.gx-hit')) this.unsel(); const h = e.target.closest('.gx-hit'); if (h) this.toggle(h.dataset.a, h.dataset.b); });
    this.mv.table.addEventListener('click', e => { const td = e.target.closest('td.c'); if (!td || td.classList.contains('dg')) return; this.toggle(SBL[+td.dataset.i], SBL[+td.dataset.j]); });
    $('#sbRand', el).addEventListener('click', e => { e.currentTarget.blur(); this.random(); });
    $('#sbClear', el).addEventListener('click', e => { e.currentTarget.blur(); [...this.gv.E.values()].forEach(x => this.gv.delEdge(x.a, x.b)); this.sync(); });
  },
  preset() { [['А', 'Б', 12], ['Б', 'В', 7], ['В', 'Г', 15], ['Б', 'Д', 20]].forEach(([a, b, w]) => this.gv.addEdge(a, b, w)); this.sync(); },
  random() {
    [...this.gv.E.values()].forEach(x => this.gv.delEdge(x.a, x.b));
    const pairs = []; SBL.forEach((a, i) => SBL.forEach((b, j) => { if (i < j) pairs.push([a, b]); }));
    shuffle(pairs).slice(0, 6 + Math.floor(Math.random() * 3)).forEach(([a, b]) => this.gv.addEdge(a, b, 3 + Math.floor(Math.random() * 58)));
    this.sync(); DP.toast('Новый граф');
  },
  unsel() { if (this.sel) this.gv.cls(this.sel, 'sel', false); this.sel = null; this.mv.clear('sel'); },
  pick(v) {
    if (!this.sel) { this.sel = v; this.gv.cls(v, 'sel'); this.mv.head(SBL.indexOf(v), 'sel'); return; }
    if (this.sel === v) { this.unsel(); return; }
    const a = this.sel; this.unsel(); this.toggle(a, v);
  },
  toggle(a, b) {
    if (a === b) return;
    if (this.gv.has(a, b)) { this.gv.delEdge(a, b); DP.toast(`Дорогу ${a}–${b} убрали`); }
    else { const w = 3 + Math.floor(Math.random() * 58); this.gv.addEdge(a, b, w); this.gv.drawIn(a, b); DP.toast(`Новая дорога ${a}–${b}: ${w} км`); }
    this.sync(true, a, b);
  },
  sync(pop = false, a, b) {
    const gv = this.gv, mv = this.mv; this.gv.place();
    mv.blank(); mv.clear('hl', 'mir');
    gv.E.forEach(e => { const i = SBL.indexOf(e.a), j = SBL.indexOf(e.b); const p = pop && ((e.a === a && e.b === b) || (e.a === b && e.b === a)); mv.set(i, j, e.w, p); mv.set(j, i, e.w, p); if (p) mv.pair(i, j, 'hl', 'mir'); });
    mv.degHead(true); SBL.forEach((v, i) => { mv.deg(i, gv.deg(v)); gv.badge(v, gv.deg(v)); });
    const m = gv.E.size, cells = mv.td.flat().filter(td => td.textContent !== '').length, sum = SBL.reduce((s, v) => s + gv.deg(v), 0);
    $('#sbStats', this.el).innerHTML = `<div>дорог<b>${m}</b></div><div>заполненных клеток<b>${cells}</b></div><div>сумма степеней<b>${sum}</b></div><div class="ok">клеток = 2 × дорог<b>${cells === 2 * m ? '✓' : '✕'}</b></div>`;
  },
  step() {}
};

/* ================= два сотрудника ================= */
W.story = {
  init(el) {
    this.T = task(); this.el = el;
    this.gv = new GraphView($('#stG', el), { nodes: T1.nodes, edges: T1.edges, W: 560, H: 300, R: 22, pad: 34 });
    this.mv = new MatrixView($('#stM', el), { n: 7, cw: 42, ch: 36, fc: 15, fh: 13, deg: false, val: (i, j) => T1.M[i][j] });
  },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), gv = this.gv, mv = this.mv;
    gv.reset(); mv.reset();
    $('#stMid', el).classList.toggle('on', s >= 2);
    $('#stHead', el).innerHTML = s >= 3 ? 'Кто есть <em>кто</em>?' : 'Два сотрудника <em>не договорились</em>';
    if (s < 1) { gv.allE('off'); gv.allN('off'); } else gv.allN('off', false);
    if (s < 2) mv.blank(); else mv.fill();
    if (s === 1 && anim) {
      gv.allE('off'); gv.vs.forEach((v, i) => { const g = gv.N[v]; g.style.animationDelay = (i * 60) + 'ms'; g.classList.add('pop'); });
      await wait(450); for (const [a, b] of T1.edges) { if (!alive()) return; gv.drawIn(a, b); await wait(110); }
    }
    if (s === 2 && anim) {
      mv.blank(); const cells = [];
      for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) if (T1.M[i][j] !== '') cells.push([i, j]);
      for (const [i, j] of cells) { if (!alive()) return; mv.set(i, j, T1.M[i][j], true); mv.set(j, i, T1.M[i][j], true); await wait(120); }
    }
    if (s >= 3) { gv.allN('hl'); [0, 1, 2, 3, 4, 5, 6].forEach(i => mv.head(i, 'hv')); }
  }
};

/* ================= страница КИМ ================= */
const offIn = (e, root) => { let x = 0, y = 0; while (e && e !== root) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y }; };
function kimTable(host, T) {
  let h = '<table class="kt"><tr><td></td>' + [...Array(T.n)].map((_, j) => `<td>${P(j)}</td>`).join('') + '</tr>';
  for (let i = 0; i < T.n; i++) h += `<tr><td>${P(i)}</td>` + T.M[i].map((x, j) => `<td${i === j ? ' class="kd"' : ''}>${x}</td>`).join('') + '</tr>';
  host.innerHTML = h + '</table>';
}
function kimGraph(svg, T, W0 = 340, H0 = 230) {
  const pos = fitPts(T.nodes, W0, H0, 22); svg.setAttribute('width', W0); svg.setAttribute('height', H0); svg.setAttribute('viewBox', `0 0 ${W0} ${H0}`);
  T.edges.forEach(([a, b]) => S('line', { x1: pos[a][0], y1: pos[a][1], x2: pos[b][0], y2: pos[b][1] }, svg));
  for (const v in pos) { S('circle', { cx: pos[v][0], cy: pos[v][1], r: 3.6 }, svg); const d = (T.kl && T.kl[v]) || [0, -15]; const t = S('text', { x: pos[v][0] + d[0], y: pos[v][1] + d[1] }, svg); t.textContent = v; }
}
W.kim = {
  init(el) {
    if ($('#k1T', el)) { kimTable($('#k1T', el), T1); kimGraph($('#k1G', el), T1, 360, 200); }
    if ($('#k2T', el)) { kimTable($('#k2T', el), T2); kimGraph($('#k2G', el), T2, 300, 230); }
  },
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

/* ================= разбор 1: уникальные степени ================= */
W.solve1 = {
  init(el) { this.T = task(); this.b = new Board(el, T1, { g: '#s1G', m: '#s1M', b: '#s1B' }, { g: { W: 680, H: 400 }, m: { cw: 58, ch: 50 } }); },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), B = this.b, gv = B.gv, mv = B.mv;
    B.reset();
    const cap = (h) => { const c = $('#s1Cap', el); c.innerHTML = h; c.classList.remove('anim'); void c.offsetWidth; c.classList.add('anim'); };
    const head = h => { $('#s1Head', el).innerHTML = h; };
    const chain = [];
    const uniq = uniqSet(B.dT);
    const F = {
      1: async (a) => {
        B.mv.degHead(true);
        if (a) for (let i = 0; i < 7; i++) { if (!alive()) return; nbrsM(B.M, i).forEach(j => mv.cls(i, j, 'scn')); mv.deg(i, B.dT[i], '', true); await wait(260); mv.clear('scn'); }
        B.degT();
      },
      2: async (a) => {
        if (a) for (const v of gv.vs) { if (!alive()) return; gv.badge(v, B.dG[v], '', true); await wait(170); }
        B.degG();
      },
      3: async () => {
        B.degT(d => uniq(d) ? 'uni' : 'dim'); B.degG(d => uniq(d) ? 'uni' : 'dim');
      },
      4: async (a, cur) => { match('В', 5, a, cur); },
      5: async (a, cur) => { match('Е', 3, a, cur); },
      6: async (a, cur) => { match('Г', 1, a, cur); },
      7: async (a) => {
        mv.row(5, 'band'); mv.col(1, 'band'); const w = B.answer('В', 'Г'); gv.cls('В', 'hl'); gv.cls('Г', 'hl');
        chain.push(`<span class="ans">Ответ: ${w}</span>`); if (a) confetti(50);
      }
    };
    const match = (v, i, a, cur) => {
      B.setMap(v, i, cur ? '' : 'ok', a); gv.cls(v, cur ? 'hl' : 'ok'); mv.head(i, cur ? 'sel' : 'ok');
      chain.push(`<span class="${cur ? 'cur' : ''}">${v} <i>=</i> ${P(i)}</span>`);
      if (cur) B.beam(v, i, a);
    };
    await play(F, s, anim, alive); if (!alive()) return;
    $('#s1Ch', el).innerHTML = chain.join('');
    const C = [
      ['Длина дороги <em>В–Г</em>', 'Буквы на рисунке и номера в таблице <b>никак не связаны</b>. Нужен признак, который есть и там, и там.'],
      ['Степени по <em>таблице</em>', 'В каждой строке считаем заполненные клетки и пишем справа: <b>2, 3, 2, 4, 2, 5, 2</b>.'],
      ['Степени по <em>рисунку</em>', 'У каждой вершины считаем дороги. У В их пять, у Е — четыре, у Г — три.'],
      ['Ищем <em>уникальные</em>', 'Двоек много — их пока не трогаем. А <b>5, 4 и 3</b> встречаются по одному разу и там, и там.'],
      ['<em>В</em> = П6', 'Степень 5 — только у <b>В</b> на рисунке и только у <b>П6</b> в таблице. Значит, это один и тот же пункт.'],
      ['<em>Е</em> = П4', 'Четыре дороги — только у <b>Е</b> и у <b>П4</b>.'],
      ['<em>Г</em> = П2', 'Три дороги — только у <b>Г</b> и у <b>П2</b>. Оба пункта из вопроса найдены!'],
      ['Ответ: <em>55</em>', 'Строка <b>П6</b>, столбец <b>П2</b> — на пересечении <b>55</b>. Проверка: П2–П6 тоже 55, таблица симметрична.']
    ][s];
    head(C[0]); cap(C[1]);
    $('#s1Eye', el).textContent = s >= 4 ? 'Разбор · сопоставляем' : 'Разбор';
  }
};

/* ================= разбор 2: перебор с проверкой соседей ================= */
W.solve2 = {
  init(el) { this.T = task(); this.b = new Board(el, T2, { g: '#s2G', m: '#s2M', b: '#s2B' }, { g: { W: 640, H: 390, R: 25 }, m: { cw: 52, ch: 45, fc: 19 } }); },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), B = this.b, gv = B.gv, mv = B.mv, M = B.M;
    B.reset();
    const chain = [];
    const two = d => d === 2 ? 'two' : '';
    const nb = (v, i, cls = 'nb') => { gv.nbrs(v).forEach(u => gv.ecls(v, u, 'blue')); nbrsM(M, i).forEach(j => mv.cls(i, j, cls)); };
    const put = (v, i, a, cur, extra = []) => {
      B.setMap(v, i, cur ? '' : 'ok', a); gv.cls(v, cur ? 'hl' : 'ok'); mv.head(i, cur ? 'sel' : 'ok');
      if (cur) B.beam(v, i, a);
      extra.forEach(([x, y]) => { gv.ecls(x, y, 'ok'); mv.pair(B.map[x], B.map[y], 'ok', 'ok'); });
    };
    const done = (txt) => chain.push(`<span>${txt}</span>`);
    const F = {
      1: async () => { B.degT(two); B.degG(two); },
      2: async () => { B.degT(two); B.degG(two); },
      3: async (a, cur) => {
        if (!cur) return;
        B.setMap('B', 0, 'q', a); gv.cls('B', 'hl'); mv.head(0, 'sel'); nb('B', 0); B.beam('B', 0, a);
        gv.nbrs('B').forEach(u => gv.badge(u, B.dG[u], 'uni')); nbrsM(M, 0).forEach(j => mv.deg(j, B.dT[j], B.dT[j] === 2 ? 'bad' : 'uni'));
        if (a) { await wait(900); if (!alive()) return; gv.shake('B'); }
        chain.push('<span class="bad">B = П1</span>');
      },
      4: async (a, cur) => {
        put('D', 0, a, cur); if (cur) nb('D', 0);
        if (cur && a) await wait(500); if (!alive()) return;
        put('H', 5, a && cur, cur); put('C', 7, a && cur, cur);
        done('D = П1'); done('H = П6'); done('C = П8');
        if (cur) { chain.splice(-3, 3, '<span class="cur">D = П1</span>', '<span class="cur">H = П6</span>', '<span class="cur">C = П8</span>'); }
      },
      5: async (a, cur) => { put('E', 4, a, cur, [['C', 'E']]); chain.push(`<span class="${cur ? 'cur' : ''}">E = П5</span>`); },
      6: async (a, cur) => { put('G', 2, a, cur); chain.push(`<span class="${cur ? 'cur' : ''}">G = П3</span>`); },
      7: async (a, cur) => { put('F', 3, a, cur); chain.push(`<span class="${cur ? 'cur' : ''}">F = П4</span>`); },
      8: async (a, cur) => { put('A', 6, a, cur, [['A', 'F']]); chain.push(`<span class="${cur ? 'cur' : ''}">A = П7</span>`); },
      9: async (a, cur) => { put('B', 1, a, cur, [['A', 'B']]); chain.push(`<span class="${cur ? 'cur' : ''}">B = П2</span>`); },
      10: async (a) => {
        gv.clear('ok', 'hl'); mv.clear('ok', 'sel'); gv.allN('ok'); for (let i = 0; i < 8; i++) mv.head(i, 'ok');
        gv.allE('dim'); gv.ecls('A', 'B', 'dim', false); gv.ecls('H', 'D', 'dim', false);
        B.answer('A', 'B'); B.answer('H', 'D');
        chain.length = 0; chain.push('<span>A–B <i>=</i> П7–П2 <i>=</i> 5</span>', '<span>H–D <i>=</i> П6–П1 <i>=</i> 13</span>', '<span class="ans">5 + 13 = 18</span>');
        if (a) confetti(70);
      }
    };
    await play(F, s, anim, alive); if (!alive()) return;
    if (s > 4 && s < 10) { const prev = { 5: ['H', 5], 6: ['E', 4], 7: ['G', 2], 8: ['C', 7], 9: ['F', 3] }[s]; nb(prev[0], prev[1]); gv.cls(prev[0], 'blue'); }
    $('#s2Ch', el).innerHTML = chain.join('');
    const C = [
      ['Сумма <em>A–B</em> + <em>H–D</em>', 'Начинаем как обычно — со степеней. Посмотрим, что они дадут.'],
      ['Степени: <em>только 2 и 3</em>', 'В таблице: 2, 2, 2, 3, 3, 2, 3, 3. На рисунке — тоже четыре двойки и четыре тройки.'],
      ['Уникальных <em>нет</em>', 'Ни одна степень не встречается один раз. Сразу ничего не сопоставить — значит, <b>перебор</b>. Но умный: с проверкой соседей.'],
      ['Пробуем: <em>B = П1</em>?', 'У П1 соседи П6 и П8 — степени <b>2 и 3</b>. У B соседи A и F — степени <b>3 и 3</b>. <span class="no">Не сходится</span> — B точно не П1.'],
      ['Тогда <em>D = П1</em>', 'У D соседи C и H — степени <b>3 и 2</b>, как у П1 (П8 и П6). <span class="ok">Сходится!</span> Значит, H = П6 (двойка), C = П8 (тройка).'],
      ['Соседи П6 → <em>E = П5</em>', 'У П6 соседи П1 и П5. П1 — это D, значит, второй сосед H — E = П5. Степени 3 = 3, и дорога C–E есть: П8–П5 = 39 <span class="ok">✓</span>'],
      ['Соседи П5 → <em>G = П3</em>', 'У П5 соседи П3, П6, П8. П6 и П8 уже заняты (H и C), остаётся G = П3. Степени 2 = 2 <span class="ok">✓</span>'],
      ['Соседи П3 → <em>F = П4</em>', 'У П3 соседи П4 и П5. П5 — это E, значит, F = П4. Степени 3 = 3 <span class="ok">✓</span>'],
      ['Соседи П8 → <em>A = П7</em>', 'У П8 соседи П1, П5, П7. Свободен П7 — это A. И дорога A–F есть: П7–П4 = 30 <span class="ok">✓</span>'],
      ['Последний: <em>B = П2</em>', 'У П4 соседи П2, П3, П7. Остался П2 — это B. Дорога A–B: П7–П2 = 5 <span class="ok">✓</span> Все сошлось.'],
      ['Ответ: <em>18</em>', 'A–B = П7–П2 = <b>5</b>, H–D = П6–П1 = <b>13</b>. Сумма — <b>18</b>.']
    ][s];
    $('#s2Head', el).innerHTML = C[0];
    const c = $('#s2Cap', el); c.innerHTML = C[1]; c.classList.remove('anim'); void c.offsetWidth; c.classList.add('anim');
  }
};

/* ================= симметрия: бабочка ================= */
function butterfly(svg) {
  svg.innerHTML = `<defs><linearGradient id="wingG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD8BE"/><stop offset="1" stop-color="#E8955E"/></linearGradient></defs>
  <line class="axis" x1="200" y1="8" x2="200" y2="292"/>
  <g class="wl"><path class="wing" d="M196 140 C150 40 60 10 34 54 C12 92 60 136 120 150 C64 160 40 214 70 246 C104 280 170 224 196 168 Z"/>
    <circle class="spot" cx="92" cy="80" r="15"/><circle class="spot" cx="104" cy="214" r="10"/><circle cx="64" cy="66" r="7" fill="#fff"/></g>
  <g class="wr"><path class="wing" d="M204 140 C250 40 340 10 366 54 C388 92 340 136 280 150 C336 160 360 214 330 246 C296 280 230 224 204 168 Z"/>
    <circle class="spot" cx="308" cy="80" r="15"/><circle class="spot" cx="296" cy="214" r="10"/><circle cx="336" cy="66" r="7" fill="#fff"/></g>
  <ellipse class="body" cx="200" cy="154" rx="9" ry="70"/><path d="M196 88 C188 62 176 46 162 40 M204 88 C212 62 224 46 238 40" stroke="#1D1D1F" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}
W.sym = {
  init(el) {
    this.T = task(); butterfly($('#syFly', el));
    this.b = new Board(el, T3, { g: '#syG', m: '#syM', b: '#syB' }, { g: { W: 660, H: 400, R: 27 }, m: { cw: 58, ch: 50 } });
  },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), B = this.b, gv = B.gv, mv = B.mv;
    B.reset();
    $('#syFly', el).classList.toggle('on', s === 0); gv.svg.classList.toggle('hide', s === 0); $('#syDemo', el).classList.toggle('on', s === 0);
    $('#syM', el).style.opacity = s === 0 ? 0 : 1; $('#syM', el).style.transition = 'opacity .5s';
    const chain = [];
    const uniq = uniqSet(B.dT);
    if (s >= 1) { B.degT(d => uniq(d) ? 'uni' : ''); B.degG(d => uniq(d) ? 'uni' : ''); }
    if (s >= 2) {
      const cur = s === 2;
      B.setMap('Г', 5, cur ? '' : 'ok', anim && cur); B.setMap('Д', 3, cur ? '' : 'ok', anim && cur);
      gv.cls('Г', cur ? 'hl' : 'ok'); gv.cls('Д', cur ? 'hl' : 'ok'); mv.head(5, cur ? 'sel' : 'ok'); mv.head(3, cur ? 'sel' : 'ok');
      if (cur) { B.beam('Г', 5, anim); B.beam('Д', 3, anim); }
      chain.push('<span>Г = П6</span>', '<span>Д = П4</span>');
    }
    const axis = () => { const p = gv.pos['Г'], e = gv.pos['Е'], j = gv.pos['Ж'], mx = (e[0] + j[0]) / 2, my = (e[1] + j[1]) / 2; const dx = mx - p[0], dy = my - p[1]; const ax = gv.axis(p[0] - dx * .35, p[1] - dy * .35, p[0] + dx * 1.45, p[1] + dy * 1.45); requestAnimationFrame(() => ax.classList.add('on')); };
    if (s === 3) {
      B.setMap('Е', 2, '', anim); B.setMap('Ж', 6, '', anim); gv.cls('Е', 'hl'); gv.cls('Ж', 'hl'); mv.head(2, 'sel'); mv.head(6, 'sel');
      B.answer('Е', 'Ж'); B.beam('Е', 2, anim); B.beam('Ж', 6, anim);
      chain.push('<span class="cur">Е = П3</span>', '<span class="cur">Ж = П7</span>', '<span class="ans">Е–Ж = 14</span>');
    }
    if (s === 4) {
      axis();
      const swap = async () => {
        B.setMap('Е', 6, '', anim); B.setMap('Ж', 2, '', anim); gv.cls('Е', 'hl'); gv.cls('Ж', 'hl'); mv.head(2, 'sel'); mv.head(6, 'sel');
        B.answer('Е', 'Ж');
      };
      if (anim) {
        B.setMap('Е', 2, ''); B.setMap('Ж', 6, ''); gv.cls('Е', 'hl'); gv.cls('Ж', 'hl'); B.answer('Е', 'Ж');
        await wait(700); if (!alive()) return;
        gv.tag('Е', null); gv.tag('Ж', null); mv.tag(2, null); mv.tag(6, null);
        await wait(350); if (!alive()) return;
      }
      await swap(); if (anim) confetti(40);
      chain.push('<span class="cur">Е = П7</span>', '<span class="cur">Ж = П3</span>', '<span class="ans">Е–Ж = 14</span>');
    }
    $('#syCh', el).innerHTML = chain.join('');
    const C = [
      ['Симметричный граф — <em>бабочка</em>', 'У бабочки есть ось: левое крыло — зеркало правого. Поменяй их местами — <b>ничего не изменится</b>. С графами так же.'],
      ['Длина дороги <em>Е–Ж</em>', 'Ставим степени. Уникальные есть: <b>5</b> и <b>1</b>. А двоек — целых пять.'],
      ['<em>Г</em> = П6, <em>Д</em> = П4', 'Пять дорог — только у Г и П6. Одна дорога — только у Д и П4.'],
      ['Е и Ж: <em>П3 и П7</em>', 'Е и Ж — соседи Г и соединены друг с другом. Среди соседей П6 так связаны только <b>П3 и П7</b>. Пусть Е = П3, Ж = П7: Е–Ж = <b>14</b>.'],
      ['А если наоборот? <em>Тоже 14</em>', 'Е = П7, Ж = П3 — и снова <b>14</b>. Е и Ж зеркальны: их не различить, но <b>и не нужно</b>. Ответ один — 14.']
    ][s];
    $('#syHead', el).innerHTML = C[0];
    const c = $('#syCap', el); c.innerHTML = C[1]; c.classList.remove('anim'); void c.offsetWidth; c.classList.add('anim');
    $('#syEye', el).textContent = s === 0 ? 'Модуль 2' : 'Модуль 2 · задача 80';
  }
};

/* ================= дополнительное условие ================= */
const C_BAD = { А: 0, Ж: 5, Г: 4, Д: 6, Е: 3, Б: 2, В: 1 };
const C_OK = { А: 0, Ж: 5, Г: 4, Д: 3, Е: 6, Б: 1, В: 2 };
W.cond = {
  init(el) { this.T = task(); this.b = new Board(el, T4, { g: '#cdG', m: '#cdM', b: '#cdB' }, { g: { W: 660, H: 390, R: 27 }, m: { cw: 58, ch: 50 } }); },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), B = this.b, gv = B.gv, mv = B.mv, M = B.M;
    B.reset();
    const chain = [];
    const axis = () => { const a = gv.pos['А'], j = gv.pos['Ж']; const ax = gv.axis(a[0] - 40, a[1], j[0] + 40, j[1]); requestAnimationFrame(() => ax.classList.add('on')); };
    if (s >= 1) { B.degT(); B.degG(); axis(); }
    const fixed = ['А', 'Ж', 'Г'];
    if (s >= 2) {
      fixed.forEach(v => { B.setMap(v, C_OK[v], s === 2 ? '' : 'ok', anim && s === 2); gv.cls(v, s === 2 ? 'hl' : 'ok'); mv.head(C_OK[v], s === 2 ? 'sel' : 'ok'); });
      chain.push('<span>А = П1</span>', '<span>Ж = П6</span>', '<span>Г = П5</span>');
      if (s === 2) B.beam('Г', 4, anim);
    }
    const lay = (L, cls) => { ['Д', 'Е', 'Б', 'В'].forEach(v => { B.setMap(v, L[v], cls, anim); gv.cls(v, 'hl'); mv.head(L[v], 'sel'); }); };
    const cmp = L => {
      const gd = M[L.Г][L.Д], ge = M[L.Г][L.Е];
      gv.ecls('Г', 'Д', 'hl'); gv.ecls('Г', 'Е', 'blue'); mv.pair(L.Г, L.Д, 'hl', 'mir'); mv.pair(L.Г, L.Е, 'nb', 'nb');
      return [gd, ge];
    };
    if (s === 3) {
      lay(C_BAD, ''); const [gd, ge] = cmp(C_BAD);
      chain.push(`<span>Д = П7</span>`, `<span>Е = П4</span>`, `<span class="bad">ГД = ${gd} &lt; ГЕ = ${ge}</span>`);
      if (anim) { await wait(900); if (!alive()) return; gv.shake('Д'); gv.shake('Е'); }
    }
    if (s === 4) {
      if (anim) {
        lay(C_BAD, 'bad'); cmp(C_BAD); await wait(700); if (!alive()) return;
        ['Д', 'Е', 'Б', 'В'].forEach(v => gv.tag(v, null)); mv.clear('hl', 'mir', 'nb', 'sel'); gv.clear('hl', 'blue');
        [0, 1, 2, 3, 4, 5, 6].forEach(i => { if (!fixed.some(v => C_OK[v] === i)) mv.tag(i, null); });
        await wait(400); if (!alive()) return;
      }
      lay(C_OK, 'ok'); const [gd, ge] = cmp(C_OK);
      gv.ecls('А', 'Б', 'ans'); mv.pair(0, 1, 'ans', 'mir');
      chain.push(`<span class="ok">ГД = ${gd} &lt; ГЕ = ${ge}</span>`, '<span>Б = П2</span>', `<span class="ans">А–Б = ${M[0][1]}</span>`);
      if (anim) confetti(60);
    }
    $('#cdCh', el).innerHTML = chain.join('');
    const C = [
      ['Длина <em>А–Б</em>, если <span class="nw">ГД &lt; ГЕ</span>', 'Новое — <b>дополнительное условие</b>. Зачем оно? Сейчас увидим.'],
      ['Граф — <em>зеркальный</em>', 'Ось проходит через А, Г и Ж. Верх и низ одинаковые: Б ↔ В, Д ↔ Е. Степени: двойки, тройки и четвёрки.'],
      ['Ось на месте: <em>А, Ж, Г</em>', 'А — двойка с соседями-тройками → <b>П1</b>. Ж — двойка с соседями-четвёрками → <b>П6</b>. Г — четвёрка, у которой нет соседа-двойки → <b>П5</b>.'],
      ['Первая расстановка: <span class="no nw">не подходит</span>', 'Пусть Д = П7, Е = П4. Тогда ГД = 20, ГЕ = 10. А по условию ГД должно быть <b>меньше</b> ГЕ — <span class="no">мимо</span>.'],
      ['Переворачиваем бабочку → <em>10</em>', 'Меняем верх и низ: Д = П4, Е = П7. Теперь ГД = 10 &lt; ГЕ = 20 <span class="ok">✓</span> Тогда Б = П2, и А–Б = П1–П2 = <b>10</b>.']
    ][s];
    $('#cdHead', el).innerHTML = C[0];
    const c = $('#cdCap', el); c.innerHTML = C[1]; c.classList.remove('anim'); void c.offsetWidth; c.classList.add('anim');
  }
};

/* ================= тренажёр: генератор задач ================= */
const LET = 'АБВГДЕЖКЛМ'.split('');
const segPt = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L; t = Math.max(0, Math.min(1, t)); return Math.hypot(a[0] + t * dx - p[0], a[1] + t * dy - p[1]); };
const cross = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
function isoAll(n, adjG, adjT, dG, dT, limit = 5000) {
  const order = [...Array(n).keys()].sort((a, b) => dG[b] - dG[a]), map = Array(n).fill(-1), used = Array(n).fill(false), out = [];
  const go = k => {
    if (out.length >= limit) return;
    if (k === n) { out.push(map.slice()); return; }
    const v = order[k];
    for (let r = 0; r < n; r++) {
      if (used[r] || dT[r] !== dG[v]) continue;
      let ok = true;
      for (let q = 0; q < k && ok; q++) { const u = order[q]; if (adjG[v][u] !== adjT[r][map[u]]) ok = false; }
      if (!ok) continue;
      map[v] = r; used[r] = true; go(k + 1); used[r] = false; map[v] = -1;
    }
  };
  go(0); return out;
}
function genPuzzle(mode) {
  for (let att = 0; att < 600; att++) {
    const n = mode === 'easy' ? (Math.random() < .5 ? 6 : 7) : (Math.random() < .4 ? 7 : 8);
    const cells = shuffle([...Array(12).keys()]).slice(0, n);
    const pts = cells.map(c => [80 + (c % 4) * 160 + (Math.random() - .5) * 70, 70 + Math.floor(c / 4) * 130 + (Math.random() - .5) * 50]);
    const cand = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (d > 300) continue;
      if (pts.some((p, q) => q !== i && q !== j && segPt(p, pts[i], pts[j]) < 40)) continue;
      cand.push([i, j, d]);
    }
    shuffle(cand); cand.sort((a, b) => (a[2] + Math.random() * 120) - (b[2] + Math.random() * 120));
    const par = [...Array(n).keys()], find = x => par[x] === x ? x : (par[x] = find(par[x]));
    const E = [], deg = Array(n).fill(0), maxD = mode === 'easy' ? 5 : 4;
    const crosses = (i, j) => E.filter(([a, b]) => a !== i && a !== j && b !== i && b !== j && cross(pts[a], pts[b], pts[i], pts[j])).length;
    let xc = 0;
    for (const [i, j] of cand) { if (find(i) !== find(j) && deg[i] < maxD && deg[j] < maxD && crosses(i, j) === 0) { par[find(i)] = find(j); E.push([i, j]); deg[i]++; deg[j]++; } }
    if (E.length !== n - 1) continue;
    const extra = mode === 'easy' ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 2);
    for (const [i, j] of shuffle(cand.slice())) {
      if (E.length >= n - 1 + extra) break;
      if (E.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) continue;
      if (deg[i] >= maxD || deg[j] >= maxD) continue;
      const c = crosses(i, j); if (xc + c > 1) continue;
      E.push([i, j]); deg[i]++; deg[j]++; xc += c;
    }
    if (E.length < n - 1 + extra) continue;
    const cnt = {}; deg.forEach(d => { cnt[d] = (cnt[d] || 0) + 1; });
    const uniqV = [...Array(n).keys()].filter(v => cnt[deg[v]] === 1);
    if (mode === 'easy' && uniqV.length < 2) continue;
    if (mode === 'exam' && uniqV.length > 2) continue;
    const perm = shuffle([...Array(n).keys()]);
    const adjG = [...Array(n)].map(() => Array(n).fill(false)), adjT = [...Array(n)].map(() => Array(n).fill(false));
    const M = [...Array(n)].map(() => Array(n).fill(''));
    const ws = shuffle([...Array(58)].map((_, i) => i + 3)).slice(0, E.length);
    E.forEach(([a, b], k) => { adjG[a][b] = adjG[b][a] = true; const r = perm[a], q = perm[b]; adjT[r][q] = adjT[q][r] = true; M[r][q] = M[q][r] = ws[k]; });
    const dT = degsM(M), sols = isoAll(n, adjG, adjT, deg, dT);
    if (!sols.length || sols.length >= 5000) continue;
    const det = ([a, b]) => { const w = M[sols[0][a]][sols[0][b]]; return sols.every(m => M[m[a]][m[b]] === w); };
    let qs = E.filter(det);
    if (mode === 'exam') { const hard = qs.filter(([a, b]) => !uniqV.includes(a) && !uniqV.includes(b)); if (hard.length) qs = hard; else continue; }
    else { const mid = qs.filter(([a, b]) => !(uniqV.includes(a) && uniqV.includes(b))); if (mid.length) qs = mid; }
    if (!qs.length) continue;
    const q1 = qs[Math.floor(Math.random() * qs.length)];
    const sum = mode === 'exam' && qs.length > 1 && Math.random() < .35;
    let q2 = null; if (sum) { const rest = qs.filter(e => e !== q1 && !(e.includes(q1[0]) && e.includes(q1[1]))); if (rest.length) q2 = rest[Math.floor(Math.random() * rest.length)]; }
    const L = shuffle(LET.slice()).slice(0, n).sort((a, b) => LET.indexOf(a) - LET.indexOf(b));
    const nodes = {}; pts.forEach((p, i) => { nodes[L[i]] = p; });
    const ans = M[sols[0][q1[0]]][sols[0][q1[1]]] + (q2 ? M[sols[0][q2[0]]][sols[0][q2[1]]] : 0);
    return { n, L, nodes, edges: E.map(([a, b]) => [L[a], L[b]]), M, sols, q: [q1, q2].filter(Boolean).map(([a, b]) => [L[a], L[b]]), ans, deg, uniqV };
  }
  return null;
}
W.trainer = {
  init(el) {
    this.el = el; this.mode = 'easy'; this.T = task();
    try { this.score = +localStorage.getItem('soft1_tr_score') || 0; } catch (e) { this.score = 0; }
    $$('#trMode button', el).forEach(b => b.addEventListener('click', e => { e.currentTarget.blur(); this.mode = b.dataset.m; this.fresh(); }));
    $('#trNew', el).addEventListener('click', e => { e.currentTarget.blur(); this.fresh(); });
    $('#trHint', el).addEventListener('click', e => { e.currentTarget.blur(); this.hint(); });
    $('#trSolve', el).addEventListener('click', e => { e.currentTarget.blur(); this.solve(); });
    $('#trCheck', el).addEventListener('click', e => { e.currentTarget.blur(); this.check(); });
    $('#trDeg', el).addEventListener('click', e => { e.currentTarget.blur(); this.degOn = !this.degOn; e.currentTarget.classList.toggle('on', this.degOn); this.showDeg(); });
    $('#trIn', el).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.check(); } });
    this.fresh();
  },
  step() {},
  msg(h) { $('#trMsg', this.el).innerHTML = h; },
  fresh() {
    const el = this.el; $$('#trMode button', el).forEach(b => b.classList.toggle('on', b.dataset.m === this.mode));
    const p = this.p = genPuzzle(this.mode); if (!p) { this.msg('Не получилось собрать задачу — нажми «Новая задача».'); return; }
    const T = { n: p.n, M: p.M, nodes: p.nodes, edges: p.edges };
    const og = $('#trG', el), ng = og.cloneNode(false); og.replaceWith(ng);
    this.b = new Board(el, T, { g: '#trG', m: '#trM', b: '#trB' }, { g: { W: 640, H: 410, R: 25, pad: 56 }, m: { cw: p.n > 7 ? 48 : 52, ch: p.n > 7 ? 41 : 44, fc: 18 } });
    this.b.gv.allN('click'); this.b.mv.clickable(); this.sel = null; this.done = false;
    this.degOn = false; $('#trDeg', el).classList.remove('on');
    const qh = p.q.map(([a, b]) => `<em>${a}–${b}</em>`);
    $('#trHead', el).innerHTML = p.q.length > 1 ? `Найди сумму ${qh.join(' + ')}` : `Найди длину дороги ${qh[0]}`;
    p.q.forEach(([a, b]) => { this.b.gv.cls(a, 'blue'); this.b.gv.cls(b, 'blue'); });
    const inp = $('#trIn', el); inp.value = ''; inp.className = '';
    this.msg('Кликни вершину на рисунке, потом строку таблицы — так ты запишешь, кто есть кто. Или считай в уме и сразу вводи ответ.');
    this.b.gv.svg.onclick = e => { const n = e.target.closest('.gx-n'); if (n) this.pickV(n.dataset.v); };
    this.b.mv.table.onclick = e => { const c = e.target.closest('td.c, th.rhd'); if (!c) return; this.pickR(+c.dataset.i); };
    this.renderScore();
  },
  showDeg() {
    const B = this.b; if (!B) return;
    if (this.degOn) { B.degT(); B.degG(); } else { B.mv.degHead(false); B.dT.forEach((_, i) => B.mv.deg(i, null)); B.gv.vs.forEach(v => B.gv.badge(v, null)); }
  },
  renderScore() { $('#trScore', this.el).textContent = this.score ? `решено: ${this.score}` : ''; },
  pickV(v) {
    const gv = this.b.gv;
    if (this.sel === v) { gv.cls(v, 'sel', false); this.sel = null; return; }
    if (this.sel) gv.cls(this.sel, 'sel', false);
    this.sel = v; gv.cls(v, 'sel');
    this.msg(`Вершина <b>${v}</b>: степень ${gv.deg(v)}. Теперь кликни строку таблицы.`);
  },
  pickR(i) {
    const B = this.b, gv = B.gv, v = this.sel;
    if (!v) { this.msg('Сначала кликни вершину на рисунке.'); return; }
    gv.cls(v, 'sel', false); this.sel = null;
    if (B.map[v] === i) { B.mv.tag(i, null); B.setMap(v, null); this.validate(); this.msg(`Метку с <b>${v}</b> сняли.`); return; }
    for (const u in B.map) if (B.map[u] === i) { B.setMap(u, null); }
    if (B.map[v] !== undefined) B.mv.tag(B.map[v], null);
    B.setMap(v, i, '', true);
    this.validate(v);
  },
  validate(last) {
    const B = this.b, gv = B.gv, mv = B.mv, p = this.p, L = p.L;
    gv.clear('bad'); mv.clear('bad'); gv.allE('bad', false);
    let err = null;
    for (const v in B.map) {
      const i = B.map[v]; let bad = false;
      if (B.dT[i] !== gv.deg(v)) { bad = true; if (v === last) err = `Степени не совпадают: у <b>${v}</b> — ${gv.deg(v)}, у <b>${P(i)}</b> — ${B.dT[i]}.`; }
      for (const u in B.map) {
        if (u === v) continue; const j = B.map[u], g = gv.has(u, v), t = B.M[i][j] !== '';
        if (g !== t) { bad = true; if (g) gv.ecls(u, v, 'bad'); else mv.pair(i, j, 'bad', 'bad'); if (v === last && !err) err = g ? `На рисунке <b>${v}–${u}</b> соединены, а в таблице ${P(i)} и ${P(j)} — нет.` : `В таблице ${P(i)} и ${P(j)} соединены, а на рисунке <b>${v}</b> и <b>${u}</b> — нет.`; }
      }
      B.setMap(v, i, bad ? 'bad' : '');
      if (bad && v === last) gv.shake(v);
    }
    /* сверка с возможными решениями */
    const idx = v => L.indexOf(v);
    const ok = p.sols.filter(m => Object.entries(B.map).every(([v, i]) => m[idx(v)] === i));
    const k = Object.keys(B.map).length;
    if (err) { this.msg(`<span class="no">Не то.</span> ${err}`); return; }
    if (k && !ok.length) { this.msg('<span class="no">Где-то противоречие.</span> По отдельности всё сходится, но вместе такой расстановки нет. Попробуй переставить.'); return; }
    if (k === p.n) { for (const v in B.map) B.setMap(v, B.map[v], 'ok'); this.msg('<span class="ok">Всё сопоставлено!</span> Найди число на пересечении и введи ответ.'); return; }
    if (last) this.msg(`<b>${last} = ${P(B.map[last])}</b> — пока без противоречий. Дальше!`);
  },
  consistent() { const B = this.b, L = this.p.L; return this.p.sols.filter(m => Object.entries(B.map).every(([v, i]) => m[L.indexOf(v)] === i)); },
  hint() {
    const B = this.b, p = this.p, L = p.L, gv = B.gv;
    let ok = this.consistent();
    if (!ok.length) {
      const bad = Object.keys(B.map).find(v => !p.sols.some(m => m[L.indexOf(v)] === B.map[v])) || Object.keys(B.map)[0];
      B.mv.tag(B.map[bad], null); B.setMap(bad, null); this.validate();
      this.msg(`Подсказка: <b>${bad}</b> стоит неверно — метку сняли. Проверь степени и соседей.`); return;
    }
    const free = L.filter(v => B.map[v] === undefined);
    if (!free.length) { this.msg('Всё уже сопоставлено — осталось найти число в таблице.'); return; }
    const cnt = {}; B.dT.forEach(d => { cnt[d] = (cnt[d] || 0) + 1; });
    const forced = free.filter(v => ok.every(m => m[L.indexOf(v)] === ok[0][L.indexOf(v)]));
    const uq = forced.filter(v => cnt[gv.deg(v)] === 1);
    let v, why;
    if (uq.length) { v = uq[0]; why = `степень ${gv.deg(v)} встречается один раз — и на рисунке, и в таблице`; }
    else if (forced.length) {
      const near = forced.filter(u => gv.nbrs(u).some(w => B.map[w] !== undefined));
      v = (near.length ? near : forced)[0]; why = near.length ? `это единственный вариант среди соседей уже найденных вершин` : `по степеням и соседям других вариантов нет`;
    } else { v = free[0]; why = 'тут симметрия: годится любой из зеркальных вариантов, ответ от этого не изменится'; }
    const i = ok[0][L.indexOf(v)];
    B.setMap(v, i, '', true); B.beams.clear(); B.beam(v, i, true);
    this.validate(); this.msg(`Подсказка: <b>${v} = ${P(i)}</b> — ${why}.`);
  },
  solve() {
    const B = this.b, p = this.p, L = p.L, gv = B.gv;
    const ok = this.consistent(), m = (ok.length ? ok : p.sols)[0];
    Object.keys(B.map).forEach(v => { B.mv.tag(B.map[v], null); B.setMap(v, null); });
    L.forEach((v, k) => B.setMap(v, m[k], 'ok'));
    gv.clear('bad'); B.mv.clear('bad');
    p.q.forEach(([a, b]) => B.answer(a, b));
    this.msg(`Ответ: <b>${p.ans}</b>. ${p.q.length > 1 ? 'Складываем два числа с пересечений.' : 'Число на пересечении строк.'} Попробуй следующую — с ней справишься сам!`);
    this.done = true;
  },
  check() {
    const inp = $('#trIn', this.el), v = parseInt(inp.value.replace(/\s/g, ''), 10);
    if (!inp.value.trim()) { inp.focus(); return; }
    inp.className = '';
    void inp.offsetWidth;
    if (v === this.p.ans) {
      inp.className = 'ok'; this.p.q.forEach(([a, b]) => { if (this.b.map[a] !== undefined && this.b.map[b] !== undefined) this.b.answer(a, b); else this.b.gv.ecls(a, b, 'ans'); });
      if (!this.done) { this.score++; try { localStorage.setItem('soft1_tr_score', this.score); } catch (e) {} this.renderScore(); }
      this.done = true; confetti(80); this.msg(`<span class="ok">Верно — ${this.p.ans}!</span> Жми «Новая задача», чтобы закрепить.`);
    } else { inp.className = 'bad'; this.msg(`<span class="no">Нет, не ${v}.</span> Проверь сопоставление: сходятся ли степени и все дороги?`); }
  }
};

/* ================= квиз ================= */
const QUIZ = [
  { q: 'Что такое степень вершины?', opts: ['Сколько дорог выходит из вершины', 'Самая длинная дорога из вершины', 'Номер вершины в таблице', 'Сумма длин всех дорог'], a: 0, ex: 'Степень — <b>число дорог</b> у вершины. В таблице это число заполненных клеток в строке.' },
  { q: 'В строке П3 заполнены три клетки: 8, 15 и 21. Какая степень у П3?', opts: ['3', '44', '21', '8'], a: 0, ex: 'Считаем <b>клетки</b>, а не складываем числа. Три клетки — три дороги — степень <b>3</b>.' },
  { q: 'Почему таблица симметрична относительно серой диагонали?', opts: ['Дорога А–Б — это та же дорога Б–А', 'Так её удобнее рисовать', 'Все дороги одинаковой длины', 'Это случайность'], a: 0, ex: 'Каждая дорога записана <b>дважды</b>: в строке одного пункта и в строке другого.' },
  { q: 'В таблице 18 заполненных клеток. Сколько дорог на схеме?', opts: ['9', '18', '36', '6'], a: 0, ex: 'Каждая дорога даёт <b>две</b> клетки: 18 : 2 = <b>9</b> дорог. Удобная проверка перед решением.' },
  { q: 'Степени в таблице и на рисунке — только двойки и тройки. С чего начать?', opts: ['Взять вершину и проверить степени её соседей', 'Ответ найти нельзя', 'Сопоставить по длине линий на рисунке', 'Взять самое большое число из таблицы'], a: 0, ex: 'Уникальных нет — значит, <b>перебор с проверкой соседей</b>: предполагаем, сверяем степени соседей, при противоречии — пробуем другое.' },
  { q: 'Вершины Е и Ж зеркальны — их можно поменять местами. Спрашивают длину Е–Ж. Что с ответом?', opts: ['Он один и тот же при любой расстановке', 'У задачи два ответа', 'Задачу решить нельзя', 'Нужно взять меньшее из чисел'], a: 0, ex: 'Дорога Е–Ж при перестановке остаётся той же клеткой таблицы — ответ <b>один</b>. А вот про Г–Е без доп. условия спросить нельзя.' }
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

/* таблица на слайде «граф в таблице» тоже откликается на наведение */
const _mxInit = W.matrix.init;
W.matrix.init = function (el) { _mxInit.call(this, el); this.st = { map: { А: 0, Б: 1, В: 2 } }; linkHover(this.gv, this.mv, this.st); };

window.G1 = { GraphView, MatrixView, Board, Beams, genPuzzle, isoAll, T1, T2, T3, T4, $, $$, S, H, P, wait, reduced, task, animOf, confetti, shuffle, fitPts, uniqSet, segDist, linkHover, mk, degsM, nbrsM };
window.DECK = { sections: { 1: 'Граф', 2: 'Степень', 3: 'Таблица', 4: 'Задание', 5: 'Симметрия', 6: 'Практика' }, key: 'soft:interactive:1:v1', prefix: 'soft1', widgets: W };
})();
