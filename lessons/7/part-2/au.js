/* ion_inf · №7 часть 1 — кодирование звука: звук в браузере, оцифровка, задачи */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const task = () => { let t = 0; return { next: () => ++t, alive: k => k === t, stop: () => ++t }; };
const H = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
const animOf = o => o.dir > 0 && !o.enter && !reduced();
const card = (t, h, cls = '') => `<div class="fcard ${cls}"><h3>${t}</h3>${h}</div>`;
const plural = (n, a, b, c) => { n = Math.abs(Math.trunc(n)); const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
const fmt = (n, d = 0) => Number(n).toLocaleString('ru-RU', { maximumFractionDigits: d }).replace(/\s/g, ' ');
const ease2 = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const tween = (ms, fn, alive) => new Promise(res => {
  if (reduced() || ms <= 0) { fn(1, 1); return res(true); }
  const t0 = performance.now();
  const tick = now => { if (alive && !alive()) return res(false); const k = Math.min(1, Math.max(0, now - t0) / ms); fn(ease2(k), k); if (k < 1) requestAnimationFrame(tick); else res(true); };
  requestAnimationFrame(tick);
});
const loop = () => { let id = 0; return { start(fn) { cancelAnimationFrame(id); const tick = t => { if (fn(t) !== false) id = requestAnimationFrame(tick); else id = 0; }; id = requestAnimationFrame(tick); }, stop() { cancelAnimationFrame(id); id = 0; }, get on() { return !!id; } }; };
const setupCv = (cv, w, h) => { const d = 2; cv.width = w * d; cv.height = h * d; cv.style.width = w + 'px'; cv.style.height = h + 'px'; const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); return g; };
const W = {};
const toast = msg => { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2100); };
const confetti = (n = 90, parent = $('#app')) => {
  if (reduced()) return;
  const cols = ['#B9521D', '#FFD8BE', '#2F855A', '#1F6FEB', '#6B46C1', '#B7791F', '#1D1D1F'];
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div'); d.className = 'confetti';
    d.style.left = (Math.random() * 1600) + 'px'; d.style.background = cols[i % cols.length];
    parent.appendChild(d);
    const dx = (Math.random() - .5) * 300, rot = Math.random() * 720;
    d.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${dx}px, ${920 + Math.random() * 120}px) rotate(${rot}deg)` }],
      { duration: 1800 + Math.random() * 1400, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 300 }).onfinish = () => d.remove();
  }
};
const blurOnUp = el => el.addEventListener('change', () => el.blur());

/* ================= звук в браузере ================= */
const C = { bg: '#141417', grid: 'rgba(255,255,255,.06)', wave: '#E7E5E4', acc: '#F08A4B', dot: '#FDBA74', dim: 'rgba(231,229,228,.35)', blue: '#7DB3FF' };
function synthVoice(ctx) {
  const sr = ctx.sampleRate, n = Math.floor(sr * 2.2), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
  const notes = [[0, .5, 220], [.5, 1, 277.2], [1, 1.5, 329.6], [1.5, 2.2, 440]];
  for (const [a, z, f] of notes) for (let k = Math.floor(a * sr); k < Math.floor(z * sr); k++) {
    const t = k / sr - a, env = Math.min(1, t * 30) * Math.exp(-t * 2.2);
    d[k] += env * (.55 * Math.sin(2 * Math.PI * f * t) + .25 * Math.sin(4 * Math.PI * f * t) + .12 * Math.sin(6 * Math.PI * f * t));
  }
  return b;
}
const AU = {
  ctx: null, buf: null, p: null, src: null, request: 0, cache: new Map(),
  ctxGet() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      const ctx = this.ctx = new AC();
      this.out = ctx.createGain(); this.out.gain.value = .95;
      if (ctx.createStereoPanner) {
        this.pan = ctx.createStereoPanner(); this.split = ctx.createChannelSplitter(2); this.merge = ctx.createChannelMerger(2);
        this.anL = ctx.createAnalyser(); this.anR = ctx.createAnalyser(); this.anL.fftSize = this.anR.fftSize = 2048;
        this.out.connect(this.pan); this.pan.connect(this.split);
        this.split.connect(this.anL, 0); this.split.connect(this.anR, 1);
        this.anL.connect(this.merge, 0, 0); this.anR.connect(this.merge, 0, 1); this.merge.connect(ctx.destination);
      } else { this.anL = this.anR = ctx.createAnalyser(); this.anL.fftSize = 2048; this.out.connect(this.anL); this.anL.connect(ctx.destination); }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  load() {
    if (this.p) return this.p;
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const dec = OAC ? new OAC(2, 1, 44100) : this.ctxGet(); if (!dec) return Promise.resolve(null);
    this.p = fetch('track.mp3').then(r => { if (!r.ok) throw new Error('fetch'); return r.arrayBuffer(); })
      .then(ab => new Promise((res, rej) => { const q = dec.decodeAudioData(ab, res, rej); if (q && q.catch) q.catch(rej); }))
      .catch(() => { this.synth = true; return synthVoice(dec); })
      .then(b => { this.buf = b; this.mono = this.mixMono(b, dec); return b; });
    return this.p;
  },
  mixMono(b, c) {
    if (b.numberOfChannels < 2) return b;
    const m = c.createBuffer(1, b.length, b.sampleRate), o = m.getChannelData(0), l = b.getChannelData(0), r = b.getChannelData(1);
    for (let k = 0; k < b.length; k++) o[k] = (l[k] + r[k]) / 2;
    return m;
  },
  stop() {
    ++this.request;
    if (this.src) { try { this.src.onended = null; this.src.stop(); } catch (e) {} this.src = null; }
    if (this.pan) { this.pan.pan.cancelScheduledValues(0); this.pan.pan.value = 0; }
    $$('.play.on').forEach(b => b.classList.remove('on'));
    if (this.onStop) { const f = this.onStop; this.onStop = null; f(); }
  },
  play(buf, o = {}) {
    this.stop();
    const ctx = this.ctxGet(); if (!ctx || !buf) return null;
    const s = ctx.createBufferSource(); s.buffer = buf; s.connect(this.out);
    if (this.pan) { const p = this.pan.pan, t = ctx.currentTime; p.cancelScheduledValues(0); p.setValueAtTime(0, t); if (o.pan) o.pan(p, t, buf.duration); }
    const off = Math.max(0, Math.min(buf.duration - .01, o.offset || 0)); s.loop = !!o.loop;
    s.start(0, off); this.src = s; this.loop = !!o.loop; this.t0 = ctx.currentTime - off; this.dur = buf.duration; this.onStop = o.onEnd || null;
    s.onended = () => { if (this.src === s) { this.src = null; $$('.play.on').forEach(b => b.classList.remove('on')); if (this.onStop) { const f = this.onStop; this.onStop = null; f(); } } };
    return s;
  },
  pos() { if (!this.src || !this.ctx) return -1; const p = (this.ctx.currentTime - this.t0) / this.dur; return this.loop ? p - Math.floor(p) : Math.min(1, p); },
  panNow() { return this.pan ? this.pan.pan.value : 0; },
  degrade(nu, bits) {
    const key = nu + '|' + bits; if (this.cache.has(key)) return this.cache.get(key);
    const src = this.mono, sr = src.sampleRate, d = src.getChannelData(0), out = this.ctxGet().createBuffer(1, d.length, sr), o = out.getChannelData(0);
    const step = sr / nu, half = Math.pow(2, bits - 1);
    let held = 0, next = 0;
    for (let k = 0; k < d.length; k++) {
      if (k >= next) { const x = d[Math.min(d.length - 1, Math.floor(next))]; held = bits >= 16 ? x : (Math.max(-half, Math.min(half - 1, Math.floor(x * half))) + .5) / half; next += step; }
      o[k] = held * .9;
    }
    if (this.cache.size > 40) this.cache.clear();
    this.cache.set(key, out); return out;
  }
};
/* кнопка «играть» */
function playBtn(btn, getBuf, o = {}) {
  btn.addEventListener('click', async e => {
    e.currentTarget.blur();
    if (btn.classList.contains('on')) { AU.stop(); return; }
    const ctx = AU.ctxGet(); if (!ctx) { toast('Браузер не умеет играть звук'); return; }
    AU.stop(); const request = AU.request;
    await AU.load();
    if (request !== AU.request || !btn.closest('.slide')?.classList.contains('cur')) return;
    const buf = getBuf(); if (!buf) return;
    AU.play(buf, o.opts ? o.opts() : {}); btn.classList.add('on');
    if (o.start) o.start();
  });
}
/* огибающая буфера */
function drawEnv(g, buf, x, y, w, h, col, upto = 1) {
  const d = buf.getChannelData(0), n = d.length, per = n / w;
  g.fillStyle = col;
  for (let i = 0; i < w * upto; i++) {
    let mn = 1, mx = -1; const a = Math.floor(i * per), b = Math.floor((i + 1) * per);
    for (let k = a; k < b; k += 4) { const v = d[k]; if (v < mn) mn = v; if (v > mx) mx = v; }
    const y1 = y + h / 2 - mx * h / 2, y2 = y + h / 2 - mn * h / 2;
    g.fillRect(x + i, y1, 1, Math.max(1, y2 - y1));
  }
}
function scopeBg(g, w, h) {
  g.clearRect(0, 0, w, h); g.fillStyle = C.bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let x = 0; x <= w; x += w / 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y <= h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
}
const tdBuf = new Float32Array(2048);
function drawLive(g, an, x, y, w, h, col, gain = 2.2) {
  an.getFloatTimeDomainData(tdBuf);
  let start = 0; for (let i = 1; i < 1024; i++) if (tdBuf[i - 1] < 0 && tdBuf[i] >= 0) { start = i; break; }
  g.strokeStyle = col; g.lineWidth = 3; g.lineJoin = 'round'; g.beginPath();
  for (let i = 0; i < 900; i++) { const v = tdBuf[start + i] || 0, px = x + i / 900 * w, py = y + h / 2 - Math.max(-1, Math.min(1, v * gain)) * h / 2 * .92; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.stroke();
}

/* ================= «нарисованная» волна и сетка ================= */
const F0 = x => .62 * Math.sin(2 * Math.PI * 1.15 * x - .9) + .28 * Math.sin(2 * Math.PI * 2.6 * x + .5) + .09 * Math.sin(2 * Math.PI * 7 * x);
const FMAX = (() => { let m = 0; for (let i = 0; i <= 1000; i++) m = Math.max(m, Math.abs(F0(i / 1000))); return m; })();
const F = x => F0(x) / FMAX * .86;
const qLev = (y, bits) => { const half = Math.pow(2, bits - 1); return (Math.max(-half, Math.min(half - 1, Math.floor(y * half))) + .5) / half; };
const quality = (nu, bits) => {
  let e = 0, n = 0; for (let i = 0; i < 2000; i++) { const x = i / 2000, k = Math.floor(x * nu), y = qLev(F(k / nu), bits); e += (F(x) - y) ** 2; n++; }
  return Math.max(0, Math.round(100 * (1 - Math.sqrt(e / n) / .55)));
};
class Grid {
  constructor(cv, w, h) { this.g = setupCv(cv, w, h); this.w = w; this.h = h; this.st = { draw: 1, cuts: 0, nu: 8, sweep: 1, levels: 0, bits: 3, dots: 0, snap: 0, hold: 0 }; this.px = 40; this.py = 26; }
  X(x) { return this.px + x * (this.w - 2 * this.px); }
  Y(y) { return this.h / 2 - y * (this.h / 2 - this.py); }
  set(o) { Object.assign(this.st, o); this.render(); }
  to(o, ms, alive) { const f = Object.assign({}, this.st); return tween(ms, e => { for (const k in o) this.st[k] = f[k] + (o[k] - f[k]) * e; this.render(); }, alive); }
  render() {
    const g = this.g, w = this.w, h = this.h, s = this.st, nu = Math.max(1, Math.round(s.nu)), bits = Math.max(1, Math.round(s.bits));
    scopeBg(g, w, h);
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 2; g.setLineDash([6, 6]);
    [0, 1].forEach(x => { g.beginPath(); g.moveTo(this.X(x), 8); g.lineTo(this.X(x), h - 8); g.stroke(); });
    g.setLineDash([]);
    if (s.levels > .01 && bits <= 7) {
      const half = Math.pow(2, bits - 1); g.strokeStyle = `rgba(125,179,255,${.45 * s.levels})`; g.lineWidth = 1.5;
      for (let j = -half; j < half; j++) { const y = this.Y((j + .5) / half); g.beginPath(); g.moveTo(this.X(0), y); g.lineTo(this.X(1), y); g.stroke(); }
    }
    if (s.cuts > .01) {
      g.strokeStyle = `rgba(240,138,75,${.55 * s.cuts})`; g.lineWidth = nu > 40 ? 1 : 2;
      for (let k = 0; k <= nu; k++) { const x = k / nu; if (x > s.sweep + 1e-9) break; g.beginPath(); g.moveTo(this.X(x), 10); g.lineTo(this.X(x), h - 10); g.stroke(); }
    }
    g.lineWidth = 3.5; g.lineJoin = 'round'; g.lineCap = 'round';
    g.strokeStyle = s.hold > .05 ? `rgba(231,229,228,${1 - .6 * s.hold})` : C.wave;
    g.beginPath(); const N = 400;
    for (let i = 0; i <= N * s.draw; i++) { const x = i / N, px = this.X(x), py = this.Y(F(x)); i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke();
    const pts = [];
    for (let k = 0; k < nu; k++) { const x = k / nu; if (x > s.sweep + 1e-9) break; const y0 = F(x), y1 = qLev(y0, bits); pts.push([x, y0 + (y1 - y0) * s.snap]); }
    if (s.hold > .01 && pts.length) {
      g.beginPath(); g.moveTo(this.X(pts[0][0]), this.Y(0));
      pts.forEach(([x, y], i) => { const x2 = i + 1 < pts.length ? pts[i + 1][0] : Math.min(1, x + 1 / nu); g.lineTo(this.X(x), this.Y(y)); g.lineTo(this.X(x2), this.Y(y)); });
      g.lineTo(this.X(Math.min(1, pts[pts.length - 1][0] + 1 / nu)), this.Y(0)); g.closePath();
      g.fillStyle = `rgba(240,138,75,${.16 * s.hold})`; g.fill();
      g.beginPath();
      pts.forEach(([x, y], i) => { const x2 = i + 1 < pts.length ? pts[i + 1][0] : Math.min(1, x + 1 / nu); i ? g.lineTo(this.X(x), this.Y(y)) : g.moveTo(this.X(x), this.Y(y)); g.lineTo(this.X(x2), this.Y(y)); });
      g.strokeStyle = `rgba(240,138,75,${s.hold})`; g.lineWidth = 4; g.stroke();
    }
    if (s.dots > .01) { g.fillStyle = `rgba(253,186,116,${s.dots})`; const r = nu > 40 ? 3.5 : 6; pts.forEach(([x, y]) => { g.beginPath(); g.arc(this.X(x), this.Y(y), r, 0, 7); g.fill(); }); }
  }
}

/* ================= титул ================= */
W.hero = {
  init(el) { this.el = el; this.g = setupCv($('#heroCv', el), 620, 400); this.L = loop(); playBtn($('#heroPlay', el), () => AU.buf); },
  leave() { this.L.stop(); AU.stop(); },
  step(el) {
    const g = this.g, w = 620, h = 400, cap = $('#heroCap', el), r = $('#heroR', el), t0 = performance.now();
    this.L.start(now => {
      const t = (now - t0) / 1000;
      scopeBg(g, w, h);
      if (AU.src) {
        cap.textContent = '«ДИНАСТИЯ» · живая волна'; r.textContent = '▶ звучит';
        drawLive(g, AU.anL, 10, 20, w - 20, h - 40, C.acc, 3);
        return;
      }
      const ph = t * .35, digital = Math.floor(t / 3.4) % 2 === 1, kf = Math.min(1, (t % 3.4) / .6);
      const fy = x => .55 * Math.sin(2 * Math.PI * (1.6 * x + ph)) + .25 * Math.sin(2 * Math.PI * (3.7 * x + ph * 1.7)) + .1 * Math.sin(2 * Math.PI * (9 * x - ph));
      cap.textContent = digital ? 'цифровой звук' : 'аналоговый звук'; r.textContent = digital ? 'ν = 24 · i = 3 бит' : 'непрерывная волна';
      g.lineWidth = 3.5; g.lineJoin = 'round'; g.strokeStyle = digital ? `rgba(231,229,228,${1 - .6 * kf})` : C.wave; g.beginPath();
      for (let i = 0; i <= 300; i++) { const x = i / 300, px = 14 + x * (w - 28), py = h / 2 - fy(x) * (h / 2 - 30); i ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.stroke();
      if (digital) {
        const nu = 24; g.strokeStyle = `rgba(240,138,75,${kf})`; g.lineWidth = 4; g.beginPath();
        for (let k = 0; k < nu; k++) { const x = k / nu, y = qLev(fy(x), 3), px = 14 + x * (w - 28), px2 = 14 + (k + 1) / nu * (w - 28), py = h / 2 - y * (h / 2 - 30); k ? g.lineTo(px, py) : g.moveTo(px, py); g.lineTo(px2, py); }
        g.stroke(); g.fillStyle = `rgba(253,186,116,${kf})`;
        for (let k = 0; k < nu; k++) { const x = k / nu, py = h / 2 - qLev(fy(x), 3) * (h / 2 - 30); g.beginPath(); g.arc(14 + x * (w - 28), py, 5, 0, 7); g.fill(); }
      }
    });
  }
};

/* ================= звук — это волна ================= */
W.wave = {
  init(el) {
    this.el = el; this.g = setupCv($('#wvCv', el), 900, 470); this.L = loop();
    playBtn($('#wvPlay', el), () => AU.buf, { start: () => this.run() });
  },
  leave() { this.L.stop(); AU.stop(); },
  async draw() {
    const g = this.g, w = 900, h = 470; scopeBg(g, w, h);
    g.fillStyle = 'rgba(255,255,255,.5)'; g.font = '700 13px -apple-system, Inter, Arial'; g.fillText(AU.buf ? `ВЕСЬ ФРАГМЕНТ · ${fmt(AU.buf.duration, 1)} С` : 'ВЕСЬ ФРАГМЕНТ', 18, 24); g.fillText('ПОД ЛУПОЙ · УВЕЛИЧИЛИ В 100 РАЗ', 18, 204);
    if (AU.buf) {
      drawEnv(g, AU.buf, 18, 34, w - 36, 140, 'rgba(231,229,228,.45)');
      const p = AU.pos(); if (p >= 0) { drawEnv(g, AU.buf, 18, 34, w - 36, 140, C.acc, p); g.fillStyle = '#fff'; g.fillRect(18 + p * (w - 36), 30, 2, 148); }
    } else { g.fillStyle = 'rgba(255,255,255,.35)'; g.font = '600 18px -apple-system, Inter, Arial'; g.fillText('Загружаю трек…', 18, 110); AU.load().then(() => this.draw()); }
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.moveTo(0, 186); g.lineTo(w, 186); g.stroke();
    if (AU.src) drawLive(g, AU.anL, 18, 216, w - 36, 240, C.acc, 3.4);
    else {
      g.strokeStyle = C.wave; g.lineWidth = 3; g.beginPath();
      for (let i = 0; i <= 400; i++) { const x = i / 400, y = .7 * Math.sin(2 * Math.PI * 5.2 * x) * (0.6 + .4 * Math.sin(2 * Math.PI * 1.3 * x)) + .18 * Math.sin(2 * Math.PI * 15.6 * x); const px = 18 + x * (w - 36), py = 336 - y * 108; i ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.stroke();
    }
  },
  run() { this.L.start(() => { this.draw(); if (!AU.src) { this.draw(); return false; } }); },
  step(el, s) {
    $('#wvHead', el).innerHTML = ['Звук в природе — это <em>волна</em>', 'А где у звука <em>части</em>?', 'Волна <em>цельная</em> — режем сами'][s];
    $('#wvCap', el).innerHTML = [
      'Нажми ▶ — фрагмент трека «Династия». Сверху весь фрагмент, снизу — он же под «лупой»: воздух колеблется, и микрофон пишет <b>волну</b>.',
      'Текст мы делили на <b>символы</b>, картинку — на <b>пиксели</b>, и каждой части давали код. А из каких частей состоит звук?',
      'У волны нет частей — она цельная, как кольцо: где начало, где конец? Поэтому звук <b>режут искусственно</b> — сначала по времени, потом по высоте.'
    ][s];
    $('#wvQ', el).classList.toggle('cut', s >= 2);
    this.draw();
  }
};

/* ================= режем по времени: ν ================= */
W.cuts = {
  init(el) {
    this.T = task(); this.el = el; this.G = new Grid($('#ctCv', el), 960, 540);
    const r = $('#ctNu', el); blurOnUp(r);
    r.addEventListener('input', () => { this.G.set({ nu: +r.value, sweep: 1, cuts: 1, dots: 1, hold: 1, snap: 0 }); this.read(); });
  },
  leave() { this.T.stop(); },
  read() {
    const nu = Math.round(this.G.st.nu), q = quality(nu, 16);
    $('#ctTag', this.el).innerHTML = `<b>${nu}</b> ${plural(nu, 'срез', 'среза', 'срезов')} за 1 секунду → ν = <b>${nu} Гц</b>`;
    $('#ctQ', this.el).style.setProperty('--q', q + '%'); $('#ctQv', this.el).textContent = q + '%';
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), G = this.G;
    $('#ctHead', el).innerHTML = ['Берём <em>одну секунду</em> звука', 'Режем волну <em>по времени</em>', 'Чаще режем — <em>точнее</em>', 'Частота дискретизации <em>ν</em>'][s];
    const side = $('#ctSide', el);
    side.innerHTML = [
      card('Как разбить волну?', 'Запись длится, например, 1 минуту 20 секунд. Берём из неё фрагмент длиной <b>1 секунда</b> — вот он.'),
      card('Режем на кусочки', 'В каждый момент среза записываем, где была волна, — получаются <b>точки</b>. Между ними звук «замирает» ступенькой.') + card('Вопрос', 'Как в физике называется количество чего-то <b>за одну секунду</b>?', 'dark'),
      card('Частота!', 'Чем чаще режем, тем больше точек и тем ближе ступеньки к настоящей волне — звук <b>качественнее</b>.'),
      card('Частота дискретизации', '<b>ν</b> (ню) — сколько срезов (отсчётов) за 1 секунду. Измеряется в <b>герцах</b>.<span class="eq">1 кГц = 1000 Гц</span>') + '<p class="small">Тяни ползунок под волной.</p>'
    ][s];
    $('#ctCtl', el).classList.toggle('on', s >= 3); $('#ctTag', el).classList.toggle('on', s >= 1);
    if (s === 0) { G.set({ cuts: 0, dots: 0, hold: 0, nu: 8, sweep: 1, snap: 0, levels: 0 }); if (anim) { G.set({ draw: 0 }); await G.to({ draw: 1 }, 1300, alive); } else G.set({ draw: 1 }); return; }
    G.set({ draw: 1, levels: 0, snap: 0 });
    if (s === 1) {
      this.G.set({ nu: 8 }); this.read();
      if (anim) { G.set({ cuts: 1, sweep: 0, dots: 1, hold: 0 }); await G.to({ sweep: 1 }, 1600, alive); if (!alive()) return; await G.to({ hold: 1 }, 600, alive); }
      else G.set({ cuts: 1, sweep: 1, dots: 1, hold: 1 });
      return;
    }
    if (s === 2) {
      G.set({ cuts: 1, sweep: 1, dots: 1, hold: 1 });
      if (anim) { G.set({ nu: 8 }); await G.to({ nu: 32 }, 1600, alive); } else G.set({ nu: 32 });
      this.read(); return;
    }
    G.set({ cuts: 1, sweep: 1, dots: 1, hold: 1, nu: +$('#ctNu', el).value }); this.read();
  }
};

/* ================= режем по высоте: i ================= */
W.depth = {
  init(el) {
    this.T = task(); this.el = el; this.G = new Grid($('#dpCv', el), 960, 540);
    const rn = $('#dpNu', el), rb = $('#dpBits', el); [rn, rb].forEach(blurOnUp);
    const upd = () => { this.G.set({ nu: +rn.value, bits: +rb.value, snap: 1, levels: 1, cuts: .6, dots: 1, hold: 1 }); this.read(); };
    rn.addEventListener('input', upd); rb.addEventListener('input', upd);
  },
  leave() { this.T.stop(); },
  read() {
    const nu = Math.round(this.G.st.nu), bits = Math.round(this.G.st.bits), q = quality(nu, bits);
    $('#dpTag', this.el).innerHTML = `i = <b>${bits} ${plural(bits, 'бит', 'бита', 'бит')}</b> → ${2 ** bits} ${plural(2 ** bits, 'уровень', 'уровня', 'уровней')} по высоте`;
    $('#dpNuV', this.el).textContent = nu + ' Гц'; $('#dpBitsV', this.el).textContent = bits + ' бит';
    $('#dpQ', this.el).style.setProperty('--q', q + '%'); $('#dpQv', this.el).textContent = q + '%';
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), G = this.G;
    $('#dpHead', el).innerHTML = ['Теперь режем <em>по высоте</em>', 'Точки <em>прилипают</em> к уровням', 'Был аналоговый — <em>стал цифровой</em>'][s];
    $('#dpSide', el).innerHTML = [
      card('Битовая глубина', 'По вертикали тоже режем — на уровни. Это <b>i</b> — битовая глубина. Измеряется в <b>битах</b>.') + card('Важно для ЕГЭ', 'Как именно считаются уровни, на ЕГЭ не нужно. Видишь в задаче <b>биты</b> — это битовая глубина. Её ещё называют <b>разрешением</b> или <b>глубиной кодирования</b>.', 'dark'),
      card('Что записываем', 'Каждая точка встаёт на ближайший уровень. Номер уровня и сохраняется — в <b>i</b> битах.'),
      card('Сетка = цифровой звук', 'Вертикальные срезы — <b>ν</b>, горизонтальные — <b>i</b>. Чем мельче сетка, тем звук ближе к живому — и тем <b>больше файл</b>.') + '<p class="small">Двигай оба ползунка.</p>'
    ][s];
    $('#dpCtl', el).classList.toggle('on', s >= 2);
    if (s === 0) {
      G.set({ draw: 1, cuts: .6, nu: 16, sweep: 1, dots: 1, hold: 1, snap: 0, bits: 3 });
      if (anim) { G.set({ levels: 0 }); await G.to({ levels: 1 }, 900, alive); } else G.set({ levels: 1 });
      this.read(); return;
    }
    if (s === 1) {
      G.set({ draw: 1, cuts: .6, nu: 16, sweep: 1, dots: 1, hold: 1, levels: 1, bits: 3 }); this.read();
      if (anim) { G.set({ snap: 0 }); await wait(250); await G.to({ snap: 1 }, 1100, alive); } else G.set({ snap: 1 });
      return;
    }
    G.set({ draw: 1, cuts: .6, sweep: 1, dots: 1, hold: 1, levels: 1, snap: 1, nu: +$('#dpNu', el).value, bits: +$('#dpBits', el).value }); this.read();
  }
};

/* ================= лаборатория: слушаем цифровой звук ================= */
const NU_MIN = 300, NU_MAX = 48000, BITS_MAX = 24;
const sl2nu = v => { const x = NU_MIN * Math.pow(NU_MAX / NU_MIN, v / 1000); return x < 1000 ? Math.round(x / 50) * 50 : x < 4000 ? Math.round(x / 100) * 100 : x < 20000 ? Math.round(x / 250) * 250 : Math.round(x / 500) * 500; };
const nu2sl = nu => Math.round(1000 * Math.log(nu / NU_MIN) / Math.log(NU_MAX / NU_MIN));
const nuTxt = nu => nu >= 10000 && nu % 100 === 0 || nu === 11025 || nu === 22050 || nu === 44100 ? (nu / 1000).toLocaleString('ru-RU') + ' кГц' : fmt(nu) + ' Гц';
const PRESETS = [['Робот', 2000, 3], ['Рация', 4000, 5], ['Телефон', 8000, 8], ['Ретро-игра', 11025, 4], ['Как на CD', 44100, 16], ['Студия', 48000, 24]];
W.lab = {
  init(el) {
    this.el = el; this.g = setupCv($('#lbCv', el), 940, 560); this.L = loop(); this.nu = 8000; this.bits = 8; this.mode = null; this.playRequest = 0;
    const rn = $('#lbNu', el), rb = $('#lbBits', el), ni = $('#lbNuIn', el), bi = $('#lbBitsIn', el); [rn, rb].forEach(blurOnUp);
    rn.addEventListener('input', () => { this.nu = sl2nu(+rn.value); this.upd(true); });
    rb.addEventListener('input', () => { this.bits = +rb.value; this.upd(true); });
    ni.addEventListener('change', () => { const v = Math.round(+ni.value || 0); this.nu = Math.max(NU_MIN, Math.min(NU_MAX, v)); rn.value = nu2sl(this.nu); this.upd(true); });
    bi.addEventListener('change', () => { const v = Math.round(+bi.value || 0); this.bits = Math.max(1, Math.min(BITS_MAX, v)); rb.value = this.bits; this.upd(true); });
    [ni, bi].forEach(x => x.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') x.blur(); }));
    const ph = $('#lbPre', el);
    PRESETS.forEach(([n, nu, b]) => { const x = H('button', 'pre', ph, `<b>${n}</b><span>${nuTxt(nu)}</span><span>${b} ${plural(b, 'бит', 'бита', 'бит')}</span>`); x.addEventListener('click', e => { e.currentTarget.blur(); this.nu = nu; this.bits = b; rn.value = nu2sl(nu); rb.value = b; this.upd(); this.play('dig'); }); });
    $('#lbOrig', el).addEventListener('click', e => { e.currentTarget.blur(); this.toggle('orig'); });
    $('#lbDig', el).addEventListener('click', e => { e.currentTarget.blur(); this.toggle('dig'); });
    rn.value = nu2sl(this.nu); rb.value = this.bits;
  },
  toggle(m) { if (this.mode === m) { this.stop(); return; } return this.play(m); },
  stop() { ++this.playRequest; AU.stop(); this.mode = null; this.L.stop(); this.draw(); },
  async play(m, off) {
    const ctx = AU.ctxGet(); if (!ctx) { toast('Браузер не умеет играть звук'); return; }
    const request = ++this.playRequest;
    AU.stop(); this.mode = m;
    await AU.load();
    if (request !== this.playRequest) return;
    AU.play(m === 'orig' ? AU.buf : AU.degrade(this.nu, this.bits), { offset: off || 0, onEnd: () => {
      if (request !== this.playRequest) return;
      this.mode = null; this.L.stop(); this.draw();
    } });
    $(m === 'orig' ? '#lbOrig' : '#lbDig', this.el).classList.add('on'); this.run();
  },
  /* ползунок двигают во время звучания — подменяем звук с того же места */
  swap() { if (!AU.src || this.mode !== 'dig') return; const off = AU.pos() * AU.dur; return this.play('dig', off); },
  leave() { this.stop(); },
  run() { this.L.start(() => { this.draw(); if (!AU.src) { this.draw(); return false; } }); },
  zoomAt() {
    if (this.z !== undefined) return this.z;
    if (!AU.synth && AU.mono.duration > 2.4) return (this.z = Math.floor(AU.mono.sampleRate * 2.19)); /* протяжная гласная в крике — чистая периодичная волна */
    const d = AU.mono.getChannelData(0), sr = AU.mono.sampleRate, win = Math.floor(sr * .012); let best = 0, bi = 0;
    for (let a = 0; a + win < d.length; a += Math.floor(win / 3)) { let e = 0; for (let k = a; k < a + win; k += 3) e += d[k] * d[k]; if (e > best) { best = e; bi = a; } }
    return (this.z = bi);
  },
  upd(live) {
    const el = this.el, nu = this.nu, bits = this.bits;
    $('#lbNuIn', el).value = nu; $('#lbBitsIn', el).value = bits;
    $('#lbBitsU', el).textContent = plural(bits, 'бит', 'бита', 'бит');
    const sec = nu * bits, lev = 2 ** bits;
    $('#lbSize', el).innerHTML = `<small>1 секунда такого звука (моно)</small><b>${fmt(nu)} · ${bits} = ${fmt(sec)} бит</b><span>≈ ${fmt(sec / 8 / 1024, 1)} Кбайт · по высоте 2<sup>${bits}</sup> = ${fmt(lev)} ${plural(lev, 'уровень', 'уровня', 'уровней')}</span>`;
    $$('#lbPre .pre', el).forEach((b, i) => b.classList.toggle('cur', PRESETS[i][1] === nu && PRESETS[i][2] === bits));
    if (live) this.swap();
    this.draw();
  },
  draw() {
    const g = this.g, w = 940, h = 560; scopeBg(g, w, h);
    g.font = '700 13px -apple-system, Inter, Arial'; g.fillStyle = 'rgba(255,255,255,.5)';
    g.fillText(this.mode === 'orig' ? 'ВЕСЬ ФРАГМЕНТ · ОРИГИНАЛ' : 'ВЕСЬ ФРАГМЕНТ · ЦИФРОВОЙ', 18, 24); g.fillText('ПОД ЛУПОЙ · 12 МИЛЛИСЕКУНД · БЕЛАЯ — ОРИГИНАЛ, ОРАНЖЕВАЯ — ЦИФРОВОЙ', 18, 178); g.strokeStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.moveTo(0, 160); g.lineTo(w, 160); g.stroke();
    if (!AU.mono) { g.fillStyle = 'rgba(255,255,255,.4)'; g.font = '600 18px -apple-system, Inter, Arial'; g.fillText('Загружаю трек…', 18, 360); AU.load().then(() => this.draw()); return; }
    const dig = AU.degrade(this.nu, this.bits), top = this.mode === 'orig' ? AU.buf : dig;
    drawEnv(g, top, 18, 34, w - 36, 112, 'rgba(231,229,228,.45)');
    const p = AU.pos(); if (p >= 0) { drawEnv(g, top, 18, 34, w - 36, 112, C.acc, p); g.fillStyle = '#fff'; g.fillRect(18 + p * (w - 36), 30, 2, 120); }
    const d = AU.mono.getChannelData(0), sr = AU.mono.sampleRate, a = this.zoomAt(), n = Math.floor(sr * .012);
    let m = 0; for (let k = a; k < a + n; k++) m = Math.max(m, Math.abs(d[k])); const sc = .9 / (m || 1);
    const X = k => 18 + (k - a) / n * (w - 36), Y = v => 372 - v * sc * 170;
    if (this.bits <= 6) { const half = 2 ** (this.bits - 1); g.strokeStyle = 'rgba(125,179,255,.28)'; g.lineWidth = 1; for (let j = -half; j < half; j++) { const v = (j + .5) / half; const y = Y(v * .9); if (y < 190 || y > h - 8) continue; g.beginPath(); g.moveTo(18, y); g.lineTo(w - 18, y); g.stroke(); } }
    g.strokeStyle = C.wave; g.lineWidth = 2.5; g.beginPath();
    for (let k = a; k < a + n; k++) { k === a ? g.moveTo(X(k), Y(d[k])) : g.lineTo(X(k), Y(d[k])); } g.stroke();
    const o = dig.getChannelData(0); g.strokeStyle = C.acc; g.lineWidth = 3.5; g.beginPath();
    for (let k = a; k < a + n; k++) { k === a ? g.moveTo(X(k), Y(o[k] / .9 * .9)) : g.lineTo(X(k), Y(o[k])); } g.stroke();
    const step = sr / this.nu; if (step > 3) { g.fillStyle = C.dot; for (let t = Math.ceil(a / step) * step; t < a + n; t += step) { const k = Math.floor(t); g.beginPath(); g.arc(X(k), Y(o[Math.min(o.length - 1, k + 1)]), 4.5, 0, 7); g.fill(); } }
  },
  step(el) { this.upd(); }
};

/* ================= секунды: запись ⇄ фрагменты по 1 с ================= */
/* огибающая всего трека «Династия» (150 с × 40 точек), 0…35 */
const ENV = 'yyxxxqxxxwwtqsoonmmlkikhifpxxxxxxwvxzrpponnmmlnjjgffsxwvwra4axxxxxwwvvxursrooolonljljhxxi8aimlnnmkmihiiovmdhedatxxxxxiaaabddfffflrspkfprqvxxxxxwuurrrronmnlosqsoqjddjlphiha6ikehkfa8dikijb88fdfcicedfourmjhb9eflhbcf98mgjhigfbfyyyyyyyyyyxwutustyyyywtokoxyyyyxxyyxxvvturmuwxusssjvyyzyywyxyxzvxrrnmpsqnrhikkzzyzxxxzwzyxwvutwttuvqnihjyzxxysahyyyyxxyywxxxuvvuptsunkmmmyyyyytnyyyyxxwuyuvxyvonnrlyyzyxmsyyxyyxvtqtrvwsrlmhmzyzyxryyzzyxxxxxxxuxsqqomlolmifdbbvttikhcbdihiefcbagdfjda7ghtxrlgeaghehhdba8ejfcbaaajxyyyyywyyxyxxstpooxzusuutsyyyxywxyyyxyyvutuwwwtxwsrnyyyzyxyxyxyvvurrqxssrpljimyyxyyxyxyzzyxxussywwwtoornyyyyxva7wyyyyxyxzxyxxttrsqwywqrnmxyyyyxvyywxxwssupppigefgbabbcd8656edhfeea336eggffccqyxxxvsxwxwxvqpmoyxxsprowvsqmdbb866vuujmkmnigcda976559aa898b8vunjha9979abcidrvwumhsonontxyyyxwxxxxrqtsssvzutspqorxxvvrruvxzxxuvvuwvulmqsupxxxxxvsuvvvxwwxwwyvuulmokkjwxyxwxxxyzxxwxxrwwqnsollixxxxxs98avxxwwvvvwwwvttutxwwxwysvtxyxwqmoljkuussrnorzskpnpqqxxxxvn9mqrsijnlxvwwxxqjimuyyxxxvvstsppnnmlmmmjjgfedcdcb9a87bpxk8cb899babba98699bcccbbpwxrikigioonlloc77odmxuusxyxyyyxxwxwxwxroppsxwulkjimyxxvomnrvvvuosroppkjlottrwxxxwtqutxxwwurrntzywmltwtsuwxwurvutwwwsuyxxwujnjkhptxxxxyrkjwxwvwwwwwxxwwwxvvvusuuonmtyyyxvrpvutskkieejwytqqmmgyyxyxxfdduutwwtuvrxqqrnndjwyyyxxwxxxxxxwnssxvwvsttpunnnomokeiqvnkruoloqihlkcbeuqumpnoqywxollggcrulbecdnpurusrqkixyxvuvtuxxxvwutsrzurvpmmuxyxxxwwvuvwyxptqpkom51112iyyyyyxxwwxxwxwusuwywwuommmxxxxxxxxxyzxwxutwwwsvqosorvxxxwtcsxyxwvuuvwxxxvvvotvywvvwxuvxxxxxwxxxwxwwvxprvymklkpruxyyyxqxxxxxvxstutxsrstqsyyyyxxxvvxvxxvlolkwwtstmowtqtsjgddcpvzkiklvsqrqphdgdcxmnlnpjlsvprtmfiaupninkb9kvsonefffxyxxsptvxxyxtxvqxwvvppmklxxyxxqnsxywwvtuwuwuwvsothlvxxxxvuxxyxxwxxwxywuxvvtwxvyyxxwwuwwzxxxxxumuuxuwxwvxxxxwujcuxxxxwwxxxxwutxvusssnpronxyyxwuxxxxxxxuuuuvxxuuuwsqnxyyxvosxxyuwxxtpuwrsqpqnotyxyxxwxxxxxvsxoxxrrvwpgdebcc9a876ryxj9isj88ulgb997yroqnlpi7vwwmeca9gpomacb99aqwnsqopvuvyyxxrvwsvsqpqpqvzwsosqqhvxwzztwvxxxwwwvwpvrlwwtwoyxyxxrxxxywxxxwsrssxxxvtngiwxxxxxxuyzywwyttqvwuvulijkxxxxxlndtxxxxxxxwxwnoywwruvxwumnixyxyyvtqumkvvtrpkmvvnhwllnxxyxxxpacumtkvtolssfpsqouvxxxxwqwxvwqpnnmlkjiiiigeedbab98777rul9fcda9bexrhc878vrspnhd8sqvpfb8tvtvkekf9bpogsxutpvxyyyxxvxxxxywuzrtuwlmjnmmxxxyxtuvvyxwxxysmuquuupjmvxxxwuuvwvwtxwxwonzvusuottsxwxxwxxxywutsrqrrnuvxuqjjwyxxxwnkqxxxvxxxxxxxxwvtxuqrwwvojkjxxxvwwxyyyxxwrnmrxwxwsvvluxxwxyvvvxwvmvxwwrpxwuljietonlidoif876354332101000000000000000018flnmostpgdeemlsqjijhprokh8323211122cgfhhkotqonjjmsuvvuwxxtrornxzzttxxxvuvywloqwpqpsrquxsnmpryyyyyyyzyyyzzzzzzyyzzzyyzkrlmgdzyxxpwwjttvmggmzzzyyyyyzzzzyyyyyyyyyyyzzzzzyzyyzyyyyxxxzyzyyyxzzyyyzzzyyyyyyyxyyzzzzzzzyyyyyyyyyyyyyyyzyyyzzzzzzzyxxzzvyvqovxwysplmplyvqifhzyyyyyyzyyyyyyyzzyzzyyyyzyyyusryzzyyyzzzyyxxxsozyyroruzzzyyzyzzzyzzzxytzsjlijqzyyyyyzyyyyyyzzzzzzzzwqqynyxllhxuxupvh9lzwurruzzyzyyyzzzyyyyyzzzzzzzzzzzzzyxxzzyzyzyzzzyyzzzzyzyzyzyyzzyyzzzzzzzzyyzzzzyyyxsyyyyyyzzzzzzyyyzyzyyzzzzzsqvvvzzxywvvqqvyqjfjjzzyyyyzzzyzyzzzzzzzzzzzyzzyyyrrzzyyyxyzzzzzyzyzxtytvpsyyyyyzzzzzzywwzywyssvonyzzyyyyzzzyzzzzzyyyzzyyzyzxifferyxxlypyvsihgafkyzyyyyyzzzyyyyyyyyyyzyzzyzyzyzyzzxxxxxxyyyyzzyxzyyyyzzyyzyyyyyyzyyyzyyyzyyyyyyyyyyyyyyyyyyyyxxyxxxxyzzyzxzzyzzxulihyyooqkgjlyyzzzzzzyxyyyyyzyyyyyyyzzzyxwwyzyyyyyzzzwxvwtxuywxsqxoyzyzyyzzzzzyyxvuspkkggiyzyyyyyyyyyyyyyxwxxwtquzzxqxkklzyzyifffgzsvmmmpzyyyyyyzzyyxyyyyzyzyyyzzyyywxvzzzxyyzyzyyyyyyyzzzyyyzzzyyyyyyzyyxyyyyzyyzwwxwyzzzzyzzzzyyyyyyyyyzyyzyyyxyyyxzzyxpuuqpmgkijrxyyyyzyzyyzzzzzyzzyzyyyzzzyxxxvuzzyyyxyyyyyyyzvztopnkqqyyyyyyzzyyyzyzyxolkdcdlzzyyyyyyyyyyyyzzzzzxyzzzzyzyyyzzyxxyyzzyzzxyyyzzzzzyyyzzzzyyyyzzzzzzzzzzzzzzzzzzyyzzwyyzyzyxxzzzzyyyyzyzyyyyzzzzyyyzzzzzzzyyzzzzzzzzzzzzzzyzzzzzzzzzzzzzyyzzzzyzzzzyzyyyyyxzzzzyzzzzzzzzyzzzzzzzzzzzzzzzzzzyzzyyzzxwyyzyzzuysqicmzzzzzzzzzzzxwtyxywrrpkizyzzyyyyzzzzzzzzzzzyyyzzyzzzzyyyzxzzyyyzzzzzzzzzzyzyyzzyzzyzyzzyyyyyzzzzzyzzzzzzzzyyzzzzzzzyxyzzzzzzzzzyyzzzzzyyyyyzzzzzzzyvyzzzzzyyzyzzzzzzyyyyyyzzzzyyyyzzzyzzzzzzzzzyyyzzzzzzyzzzzzzzyyyzzzzyyyzzyyyyyyzzzyzzzzzzyzyvwxvywmmfzzzzzzyzzyzyzwtsuwxuvmzzzzzzzyyzyzzyyyyzyyyyyyyzzywxxxyyyyyzzzyyzzzzyzyzzzxyyzyyyyzzyyzyyyyyyyyyyyyyyyzyxyyyyyyyyyyyzzyyyyzzzyyxxxxyzzyyyzzzzzzyyyxzyzzyyyxxzzzyyzzzzzyxxyzzzzyyyzzzyzzxxyyzyzyyzzyyyzyzzyzyxyyxxzzyyxxxyzyyyyyzzyyyyyyyyyyywvsqzzyxrqkwzzzyyyyyyyyywwuyxwvrgczzzyzyyyzyzywwxxyzyzyzyzzzyyyyyzzyzyyyzzzyyyyyyzzyyyxwyzzyzyyyzyyyzyzzzzyxyyyyzyyyyyyzyyxyyyyyzzyzyyyyyyyyyyzzyyyyyyzzzyyyyyzxyyyyyxxxyyyyyyyyyywwxyyzzzzzzzzyzyyyyyzyyyyxwxyzyyzzzyyyyyyyyyxyyyyyyzzyyzzzyyyyyyzzzyyyxyxxwztroqdyyzzzxxyzyyxuuusysmldekbzzzyyyxwxxyyxyxyxxxyuptyxxnnllyxyxtipsoxrpcbc7zyzyyyyyyyyyyyyyyzzyxwvvxyzvvtrxyyyyyzyzzyyyxxwzzyyyyxyyyyyyyyxyyyyyzzyyyyyyyzzyyyyyyzzzzzyyyzzzyyxxyxwyxxryvzxzuhfxyuolljlyyyyyyyxxvwwxzzyyyzzzzyyzzyzwxurxxwyyyyyyvuxwxpxzywoglouyyyyyyzzyyzxwvyytsomoouyyxxxxxzzzzyyyyyzyyxxxywwmwoonwwwxkjnunkrqd9aayzyyyyyzyyyzyyyyyzzzyyyyyyyyyyyzyyyxxxyyxyyyyyyzzyzyyyyyyyyyyyyzyzyzzyzyyyyyyzzzzyyyzzyyzyyzyzzzyxxxzyyyyxwwyzzyyxxyyyzyyyyyyzyxxxxyyyyxyyyyrsqnmpqrqqsqlnsvvrpqtuutubdedyvuxvzxwyvwyuuqnnzywrtunruttqmstxyyyyyyyzyyzzyyzyyyyzzzzzuqnmifxyxxqvvutuxtmfjkzzyyyyyyzzzyzyyyyyyyyyyzzzzyyzyzyxyyxwyyzyzyzzzzyyzzzzzyyyyyyyyyzzzzzzzzyyyyyxyyyyyyyyzzyyyzzzzzzyxwxzxyvrntyyzzqnmqkzysjfexyyyyyyyzyyyyyyyzyyzzyxyzzzzvssqyzzzyyzzzyxxxpszzyxnruyzzyyzyzyzzzzzxxyyuppjfjzzyyyyzyyyyyyyyzzzzzywrowqpxkklxzzzuttdfzzwsqxtzzzyyyzzzyyyyyzzzzzzzzzzzzzzxtwzzzzyyyzzyyzzzzyzyyyyyyyzyyyzzzzzzzzyzzzzyyyyxxyyyyvyzzzzzyyyyyyyyzzzzztsuvvzzzxyvttlvvxpfgjxzzyyyyzyzzzyzzzzzzzzzzzyyyzyrryzyyyxyyzzyzzzzzzuqouqsqotaadutuvtla4qxtuwqnnekyzyyuyyzyyzzyyzzyzzzzzzzzzyyyxxyyyyzzyzzyyyyxyyzyyyywyzzzxyxyyyyyyyyzzyyzzyzzzzzwxwxxyzyzyyyyyyzyyyyzyzyyyyyyyzyyyzyyyyyyyyyzyyyxyyyyyyyyyyxyyyyyzzzzzzzyyyzzyxxxzzyzyyxyyyzzzzzzzyzyyyxyyyyyyyyyxyyxyyyzzyyyyyyzzvxxwvqtzzxsoystyyyyyyzzzzzzywttolihggvyzyyyyyyyyyyyyyyyyyyxxzzyyyxxxxzzzyyxyyyzzzyzzzyyyxyxzzzyxxxyyzyzyyyzzyyyyyyzzyzyyzxzzyyyyyyyzzyyyyyzyyyyyyyyyyyyyyzyyyyxwwwyzzzyyzzzyyyyyyyyyzyyyzyyyyyyyyzyyyzzzyyyyyyyzyyyyzyzzzyzzzzyyyxjqtsurosldfkvvwhieflkimoorszxwmmljptsunhgjjzjemywtzto9de85czzuwpqbgejh98skjkkhiiijf421111110011001100010010001000000000000000000';
const envAt = i => parseInt(ENV[i % ENV.length], 36) / 35;
const SC = { W: 1408, H: 372, cols: 20, gap: 6, tw: 64, th: 40, maxT: 299, stripH: 132, stripY: 70 };
W.secs = {
  init(el) {
    this.T = task(); this.el = el; this.t = 150; this.glued = false;
    const host = $('#scTiles', el); this.tiles = [];
    for (let i = 0; i < SC.maxT; i++) {
      const d = H('div', 'sc-t', host), cv = H('canvas', '', d); this.paint(cv, i); this.tiles.push(d);
    }
    const m = $('#scM', el), s = $('#scS', el);
    const upd = () => { const mm = Math.max(0, Math.min(4, Math.round(+m.value || 0))), ss = Math.max(0, Math.min(59, Math.round(+s.value || 0))); this.T.next(); this.set(mm, ss); this.lay(this.glued, false); };
    m.addEventListener('input', upd); s.addEventListener('input', upd);
    [m, s].forEach(x => x.addEventListener('keydown', e => e.stopPropagation()));
    $('#scCut', el).addEventListener('click', e => { e.currentTarget.blur(); const k = this.T.next(); this.split(() => this.T.alive(k)); });
    $('#scGlue', el).addEventListener('click', e => { e.currentTarget.blur(); const k = this.T.next(); this.glue(() => this.T.alive(k)); });
  },
  paint(cv, i) {
    const g = setupCv(cv, SC.tw, SC.th), bw = SC.tw / 40; g.fillStyle = 'rgba(255,255,255,.88)';
    for (let j = 0; j < 40; j++) { const v = .06 + .66 * Math.pow(envAt(i * 40 + j), 2.2), hh = Math.max(1.5, v * (SC.th - 6)); g.fillRect(j * bw + bw * .18, SC.th / 2 - hh / 2, bw * .64, hh); }
  },
  leave() { this.T.stop(); },
  set(mm, ss) {
    const el = this.el, t = Math.min(SC.maxT, mm * 60 + ss); this.t = t; this.mm = mm; this.ss = ss;
    $('#scM', el).value = mm; $('#scS', el).value = ss;
    $('#scEq', el).innerHTML = `${mm} мин ${ss} с = <span>${mm} · 60 + ${ss}</span> = <b>${t} с</b>`;
  },
  label() {
    const el = this.el, t = this.t;
    $('#scCnt', el).innerHTML = this.glued ? `<b>1</b> запись длиной ${t} ${plural(t, 'секунда', 'секунды', 'секунд')}` : `<b>${t}</b> ${plural(t, 'фрагмент', 'фрагмента', 'фрагментов')} по 1 секунде <span class="sc-lg"><i class="m0"></i><i class="m1"></i>минуты по 60 <i class="s"></i>остаток</span>`;
    $('#scLb', el).innerHTML = `одна запись · <b>${this.mm}:${String(this.ss).padStart(2, '0')}</b>`;
    const r = $('#scRuler', el); r.innerHTML = '';
    for (let m = 0; m * 60 <= t; m++) H('span', '', r, `${m}:00`).style.left = (m * 60 / Math.max(1, t) * 100) + '%';
    if (t % 60) H('span', 'end', r, `${this.mm}:${String(this.ss).padStart(2, '0')}`).style.left = '100%';
    $('#scStage', el).classList.toggle('glued', this.glued);
    $('#scCut', el).classList.toggle('pri', this.glued); $('#scGlue', el).classList.toggle('pri', !this.glued);
  },
  /* mode: 'grid' | 'strip' | 'cut' (лента с щелями) */
  pos(i, mode) {
    const t = Math.max(1, this.t);
    if (mode === 'grid') {
      const rows = Math.ceil(t / SC.cols), th = Math.min(40, (SC.H - (rows - 1) * 5) / rows), c = i % SC.cols, r = Math.floor(i / SC.cols);
      return { x: c * (SC.tw + SC.gap), y: r * (th + 5), sx: 1, sy: th / SC.th };
    }
    const w = SC.W / t, gap = mode === 'cut' ? Math.min(3, w * .3) : 0;
    return { x: i * w + gap / 2, y: SC.stripY, sx: (w - gap) / SC.tw, sy: SC.stripH / SC.th };
  },
  lay(mode, stagger, rev) {
    const t = this.t, n = this.tiles.length;
    if (typeof mode === 'boolean') mode = mode ? 'strip' : 'grid';
    this.tiles.forEach((d, i) => {
      const on = i < t, p = this.pos(Math.min(i, Math.max(0, t - 1)), mode);
      d.style.transitionDelay = stagger && on ? (rev ? (t - 1 - i) : i) * Math.min(9, 1400 / t) + 'ms' : '0ms';
      d.style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.sx}, ${p.sy})`;
      d.style.opacity = on ? 1 : 0;
      d.className = 'sc-t ' + (i < 60 * this.mm ? 'm' + (Math.floor(i / 60) % 2) : 's');
    });
  },
  async split(alive, fast) {
    const ms = fast ? 0 : 1;
    if (!this.glued) { this.glued = true; this.label(); this.lay('strip', false); await wait(80 * ms); if (!alive()) return; }
    this.lay('cut', !fast); await wait((fast ? 0 : 1300)); if (!alive()) return;
    this.glued = false; this.label(); this.lay('grid', !fast);
  },
  async glue(alive, fast) {
    if (this.glued) return;
    this.lay('cut', !fast, true); await wait(fast ? 0 : 1700); if (!alive()) return;
    this.glued = true; this.label(); this.lay('strip', false);
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), V = [[2, 30], [3, 19], [this.mm ?? 2, this.ss ?? 30]][s];
    $('#scHead', el).innerHTML = ['Время <em>t</em> — в секундах', '3 минуты 19 секунд — это…', 'Попробуй <em>сам</em>'][s];
    $('#scCap', el).innerHTML = [
      'Весь трек длится <b>2 мин 30 с</b>. Мы режем его на кусочки по <b>1 секунде</b> — получается <b>150</b> фрагментов. Сколько секунд — столько фрагментов. Это <b>t</b>.',
      'Как в задаче с ЕГЭ: 3 · 60 + 19 = <b>199</b> секунд. 199 секундных кусочков склеиваются в одну запись — и обратно. Переводим в секунды <b>сразу</b>, ещё до формулы.',
      'Введи минуты и секунды. «Разрезать» — запись распадается на секунды, «Склеить» — секунды собираются обратно. Каждый кусочек — одна секунда звука.'
    ][s];
    el.querySelector('.sc-btns').classList.toggle('on', s >= 2);
    if (s === 0) {
      this.set(2, 30);
      if (o.dir > 0 && !reduced()) { this.glued = true; this.label(); this.lay('strip', false); await wait(700); if (!alive()) return; await this.split(alive); }
      else { this.glued = false; this.label(); this.lay('grid', false); }
      return;
    }
    if (s === 1) {
      this.set(3, 19);
      if (anim) { this.glued = false; this.label(); this.lay('grid', true); await wait(1500); if (!alive()) return; await this.glue(alive); }
      else { this.glued = true; this.label(); this.lay('strip', false); }
      return;
    }
    this.set(V[0], V[1]); this.label(); this.lay(this.glued, false);
  }
};

/* ================= каналы ================= */
const CH = [
  { k: 'mono', n: 1, t: 'Моно', d: 'Одна волна. Из обоих динамиков звучит <b>одно и то же</b> — что слева, что справа.' },
  { k: 'stereo', n: 2, t: 'Стерео', d: 'Две волны: одна для левого уха, другая для правого. Можно сделать эффект, будто звук <b>ходит вокруг</b>.' },
  { k: 'quad', n: 4, t: 'Квадро', d: 'Четыре волны — четыре динамика по углам зала: два спереди, два сзади. Звук <b>окружает со всех сторон</b>.' }
];
const QROT = 1.5; /* сколько кругов делает звук в квадро за фрагмент */
const QCOL = [C.acc, C.blue, '#6EE7B7', '#C4B5FD'];
W.chan = {
  init(el) {
    this.el = el; this.mode = 0; this.L = loop();
    this.gs = ['#chL', '#chR', '#chBL', '#chBR'].map(id => setupCv($(id, el), 400, 112));
    $$('#chSeg button', el).forEach((b, i) => b.addEventListener('click', e => { e.currentTarget.blur(); AU.stop(); this.setMode(i); }));
    playBtn($('#chPlay', el), () => AU.mono, {
      opts: () => ({ pan: (p, t, d) => {
        if (this.mode === 0) return;
        if (this.mode === 1) { [-1, 1, -1, 1].forEach((v, i) => p.linearRampToValueAtTime(v, t + d * (i + 1) / 4)); return; }
        const N = 240, cv = new Float32Array(N); for (let i = 0; i < N; i++) cv[i] = Math.sin(2 * Math.PI * QROT * i / (N - 1));
        try { p.setValueCurveAtTime(cv, t + .01, d - .02); } catch (e) {}
      } }),
      start: () => this.run()
    });
  },
  leave() { this.L.stop(); AU.stop(); },
  setMode(i) {
    this.mode = i; const el = this.el, c = CH[i];
    $$('#chSeg button', el).forEach((b, k) => b.classList.toggle('cur', k === i));
    $('#chStage', el).dataset.mode = c.k; $('#chSc', el).classList.toggle('quad', i === 2);
    $('#chN', el).innerHTML = `k = <b>${c.n}</b>`; $('#chD', el).innerHTML = c.d;
    $('#chLt', el).textContent = i === 2 ? 'левый передний' : 'левый канал';
    $('#chRt', el).textContent = i === 0 ? 'правый — тот же звук' : i === 2 ? 'правый передний' : 'правый канал';
    $('#chHint', el).textContent = i === 2 ? 'звук идёт по кругу. В наушниках слышно лево-право, а перёд-зад — только на четырёх колонках' : i === 1 ? 'лучше в наушниках — услышишь, как звук ходит слева направо' : 'в обоих ушах — одно и то же';
    this.draw();
  },
  run() { this.L.start(t => { this.draw(t); if (!AU.src) { this.draw(); return false; } }); },
  /* угол источника в квадро: 0 — спереди, по часовой */
  ang() { return 2 * Math.PI * QROT * Math.max(0, AU.pos()); },
  draw() {
    const w = 400, h = 112, live = !!AU.src, pan = live ? AU.panNow() : 0, q = this.mode === 2;
    const fw = q && live ? (1 + Math.cos(this.ang())) / 2 : 1, bw = q && live ? (1 - Math.cos(this.ang())) / 2 : 1;
    const WAVES = [x => .6 * Math.sin(2 * Math.PI * 3 * x) + .22 * Math.sin(2 * Math.PI * 8 * x), x => .55 * Math.sin(2 * Math.PI * (4.3 * x + .3)) + .25 * Math.sin(2 * Math.PI * 11 * x),
      x => .5 * Math.sin(2 * Math.PI * (2.2 * x + .6)) + .3 * Math.sin(2 * Math.PI * 6.5 * x), x => .45 * Math.sin(2 * Math.PI * (5.6 * x + .1)) + .3 * Math.sin(2 * Math.PI * 2 * x + 1)];
    this.gs.forEach((g, i) => {
      if (i >= 2 && !q) return;
      scopeBg(g, w, h);
      const side = i % 2 ? 'R' : 'L', col = this.mode === 0 ? C.acc : QCOL[q ? i : i % 2], wt = i < 2 ? fw : bw;
      if (live) { const an = side === 'L' ? AU.anL : AU.anR; if (an) drawLive(g, an, 8, 6, w - 16, h - 12, col, 3 * Math.max(.04, wt)); return; }
      const f = WAVES[this.mode === 0 ? 0 : i]; g.strokeStyle = col; g.lineWidth = 3; g.beginPath();
      for (let k = 0; k <= 300; k++) { const x = k / 300, px = 8 + x * (w - 16), py = h / 2 - f(x) * (h / 2 - 10); k ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.stroke();
    });
    const src = $('#chSrc', this.el); if (!src) return;
    let x = 260, y = 85;
    if (this.mode === 1) { const a = -Math.PI / 2 + pan * Math.PI / 2; x = 260 + Math.cos(a) * 150; y = 220 + Math.sin(a) * 150; }
    if (q) { const a = live ? this.ang() : 0; x = 260 + Math.sin(a) * 160; y = 220 - Math.cos(a) * 160; }
    src.setAttribute('cx', x); src.setAttribute('cy', y);
    $$('.spk', this.el).forEach(sp => {
      const s = sp.dataset.sp; let on = false;
      if (live) {
        if (this.mode === 0) on = s === 'l' || s === 'r';
        else if (this.mode === 1) on = (s === 'l' && pan < .2) || (s === 'r' && pan > -.2);
        else { const sx = s.includes('r') ? 1 : -1, sy = s.length === 2 ? 1 : -1, dx = x - 260, dy = y - 220; on = dx * sx > -60 && dy * sy > -60; }
      }
      sp.classList.toggle('on', on);
    });
  },
  step(el, s) {
    $('#chHead', el).innerHTML = ['Моно — <em>одна волна</em>', 'Стерео — <em>две волны</em>', 'Квадро — <em>четыре волны</em>', 'Каналы — буква <em>k</em>'][s];
    $('#chSum', el).classList.toggle('on', s >= 3);
    AU.stop(); this.setMode(Math.min(2, s));
  }
};

/* ================= формула ================= */
const FPARTS = [['k', 'каналы', 'моно 1 · стерео 2', 2], ['v', 'частота дискретизации', 'Гц', 12000], ['i', 'битовая глубина', 'бит', 24], ['t', 'время', 'секунд', 199]];
W.formula = {
  init(el) {
    this.el = el; const host = $('#fmIn', el);
    FPARTS.forEach(([sym, , u, v], i) => {
      const lab = H('label', 'fm-in', host, `<b>${sym}</b><input type="number" min="1" value="${v}"><small>${u}</small>`);
      $('input', lab).addEventListener('input', () => this.calc());
    });
  },
  calc() {
    const vals = $$('#fmIn input', this.el).map(x => Math.max(0, +x.value || 0)), v = vals.reduce((a, b) => a * b, 1);
    $('#fmOut', this.el).innerHTML = `<div><small>бит</small><b>${fmt(v)}</b></div><div><small>байт</small><b>${fmt(v / 8, 2)}</b></div><div><small>Кбайт</small><b>${fmt(v / 8 / 1024, 4)}</b></div><div><small>Мбайт</small><b>${fmt(v / 8 / 1024 / 1024, 4)}</b></div>`;
  },
  step(el, s) {
    $('#fmHead', el).innerHTML = ['Четыре буквы — <em>одна формула</em>', 'Всё просто <em>перемножаем</em>', 'Посчитай <em>сам</em>'][s];
    $('#fmEq', el).classList.toggle('on', s >= 1);
    $('#fmCards', el).classList.toggle('in', s >= 1);
    $('#fmCalc', el).classList.toggle('on', s >= 2);
    if (s >= 2) this.calc();
  }
};

/* ================= задача 31114 ================= */
W.soundAlgorithm = {
  step(el, step) {
    el.classList.toggle('algo-show-known', step >= 2);
    el.classList.toggle('algo-show-target', step >= 3);
    $$('.algo-timeline li', el).forEach((item, index) => {
      item.classList.toggle('is-active', index + 1 === step);
      item.classList.toggle('is-done', index + 1 < step);
    });
    $$('[data-reveal]', el).forEach(line => {
      const visible = step >= Number(line.dataset.reveal);
      line.classList.toggle('is-visible', visible);
      line.setAttribute('aria-hidden', String(!visible));
    });
  }
};

W.t31114 = {
  init(el) { this.T = task(); this.el = el; },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o);
    $$('.tx-hl', el).forEach(h => h.classList.toggle('on', +h.dataset.k <= s && s >= 1));
    $$('.gv', el).forEach(g => g.classList.toggle('on', +g.dataset.s <= s));
    $('#t1F', el).classList.toggle('on', s >= 4); $('#t1Calc', el).classList.toggle('on', s >= 5); $('#t1Ans', el).classList.toggle('on', s >= 6);
    $('#t1Head', el).innerHTML = ['Задача с ЕГЭ <em>18 июня</em>', 'Стерео — значит <em>k = 2</em>', 'Герцы — <em>ν</em>, биты — <em>i</em>', 'Время — <em>в секунды</em>', 'Килобайты: делим на <em>1024 · 8</em>', 'Считаем на <em>калькуляторе</em>', 'Ответ: <em>13 993</em>'][s];
    const scr = $('#t1Scr', el);
    if (s === 5 && anim) {
      const target = 13992.1875; scr.textContent = '0';
      await tween(1100, (e) => { scr.textContent = fmt(target * e, 4); }, alive); if (!alive()) return; scr.textContent = '13 992,1875';
    } else if (s >= 5) scr.textContent = '13 992,1875';
  }
};

/* ================= как округлять ================= */
W.round = {
  init(el) { this.T = task(); this.el = el; },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const anim = animOf(o);
    $('#rdHead', el).innerHTML = ['Почему <em>13 993</em>, а не 13 992?', 'Читай, <em>что спрашивают</em>', 'Задача 31353: <em>целая часть</em>', 'Перечитай <em>вопрос</em>'][s];
    const st = $('#rdStage', el); st.className = 'rd-stage s' + s;
    if (s === 0 && anim) { st.classList.add('go'); }
    else st.classList.add('done');
    if (s === 0) {
      st.classList.remove('done'); void st.offsetWidth; st.classList.add('done');
    }
  }
};

/* ================= во сколько раз: задача 160 ================= */
W.t160 = {
  init(el) {
    const frac = (top, bottom) => `<span class="cmp-fraction"><span>${top}</span><span>${bottom}</span></span>`;
    const sub = (x, n) => `${x}<sub>${n}</sub>`;
    const I1 = sub('I', 1), I2 = sub('I', 2);
    const cancel = x => `<span class="cmp-factor" data-factor="${x}">${sub(x,1)}</span>`;
    const terms = (index, values) => ['k', 'ν', 'i', 't'].map((x, j) =>
      `<span class="cmp-term" style="--order:${j}"><span data-form="ratio">${sub(x,index)}</span><span data-form="substitution">${values[j]}</span></span>`
    ).join(' · ');
    const numerator = terms(1, ['1', cancel('ν'), cancel('i'), cancel('t')]);
    const denominator = terms(2, ['2', frac(cancel('ν'), '1,5'), '4 · '+cancel('i'), cancel('t')]);
    $('#t6Frac', el).innerHTML = `
      <div class="cmp-equation pf">
        ${frac(I1,I2)} =
        <span class="cmp-insertion" data-form="substitution"><span>${frac('24',I2)} = </span></span>
        ${frac(numerator,denominator)}
      </div>
      <div class="cmp-simplified">${frac('24',I2)} = ${frac('1,5','2 · 4')} = ${frac('3','16')}</div>
      <div class="cmp-answer">${I2} = ${frac('24 · 16','3')} = <strong>128 Мбайт</strong></div>`;
  },
  step(el, s) {
    $('#t6Head', el).innerHTML = ['Файл <em>перезаписали</em>', 'Что <em>было</em>', 'Что <em>стало</em>', 'Составляем <em>отношение объёмов</em>', 'Подставляем <em>параметры</em>', 'Сокращаем <em>одинаковые множители</em>', 'Вычисляем <em>I₂</em>'][s];
    $$('.pr-col', el).forEach((c, i) => c.classList.toggle('on', s >= i + 1));
    const host = $('#t6Frac', el);
    host.classList.toggle('on', s >= 3);
    host.classList.toggle('cut', s >= 5);
    if (host.dataset.step !== String(s)) {
      this.leave(el);
      if (s === 6 && !reduced()) this.celebration = setTimeout(() => confetti(76, el), 350);
    }
    host.dataset.step = s;
    const reveal = (selector, visible) => {
      const line = $(selector, host);
      line.classList.toggle('shown', visible);
      line.setAttribute('aria-hidden', String(!visible));
    };
    reveal('.cmp-equation', s >= 3);
    for (const term of host.querySelectorAll('[data-form]')) {
      const visible = term.dataset.form === 'ratio' ? s === 3 : s >= 4;
      term.setAttribute('aria-hidden', String(!visible));
    }
    reveal('.cmp-simplified', s >= 5);
    reveal('.cmp-answer', s >= 6);
    $$('.tx-hl', el).forEach(h => h.classList.toggle('on', +h.dataset.k <= s && s >= 2));
  },
  leave(el) {
    clearTimeout(this.celebration);
    $$('.confetti', el).forEach(piece => piece.remove());
    delete $('#t6Frac', el).dataset.step;
  }
};

/* ================= пульт множителей ================= */
const MX = [
  { k: 'n', t: 'Каналы k', opts: [['моно', 1], ['стерео', 2], ['квадро', 4]], def: 0 },
  { k: 'i', t: 'Глубина i', opts: [['÷ 4', 1 / 4], ['÷ 2', 1 / 2], ['как было', 1], ['× 2', 2], ['× 4', 4]], def: 2 },
  { k: 'nu', t: 'Частота ν', opts: [['÷ 2', 1 / 2], ['÷ 1,5', 1 / 1.5], ['как было', 1], ['× 1,5', 1.5], ['× 2', 2]], def: 2 },
  { k: 't', t: 'Время t', opts: [['÷ 2', 1 / 2], ['как было', 1], ['× 2', 2], ['× 3', 3]], def: 1 }
];
const MXLAB = { n: ['', '· 2', '· 4'], i: ['/ 4', '/ 2', '', '· 2', '· 4'], nu: ['/ 2', '/ 1,5', '', '· 1,5', '· 2'], t: ['/ 2', '', '· 2', '· 3'] };
W.mix = {
  init(el) {
    this.el = el; this.sel = MX.map(m => m.def); const host = $('#mxRows', el);
    MX.forEach((m, mi) => {
      const r = H('div', 'mx-r', host, `<span class="mx-t">${m.t}</span><div class="mx-seg"></div>`);
      m.opts.forEach(([t], oi) => { const b = H('button', '', $('.mx-seg', r), t); b.addEventListener('click', e => { e.currentTarget.blur(); this.sel[mi] = oi; this.upd(); }); });
    });
    $('#mx160', el).addEventListener('click', e => { e.currentTarget.blur(); this.sel = [1, 4, 1, 1]; this.upd(); });
    $('#mxReset', el).addEventListener('click', e => { e.currentTarget.blur(); this.sel = MX.map(m => m.def); this.upd(); });
  },
  upd() {
    const el = this.el; let f = 1; const parts = [];
    MX.forEach((m, mi) => { const o = m.opts[this.sel[mi]]; f *= o[1]; const lab = MXLAB[m.k][this.sel[mi]]; if (lab) parts.push(lab); });
    $$('.mx-r', el).forEach((r, mi) => $$('.mx-seg button', r).forEach((b, oi) => b.classList.toggle('cur', oi === this.sel[mi])));
    const v = 24 * f;
    $('#mxEq', el).innerHTML = `I₂ = 24 ${parts.join(' ')} = <b>${fmt(v, 2)}</b> Мбайт`;
    const raz = x => Number.isInteger(Math.round(x * 100) / 100) ? plural(Math.round(x), 'раз', 'раза', 'раз') : 'раза';
    $('#mxF', el).innerHTML = f === 1 ? 'объём не изменился' : f > 1 ? `объём вырос в <b>${fmt(f, 2)}</b> ${raz(f)}` : `объём уменьшился в <b>${fmt(1 / f, 2)}</b> ${raz(1 / f)}`;
    const top = Math.max(24, v), sc = x => Math.max(2, 86 * x / top);
    $('#mxB1', el).style.setProperty('--h', sc(24) + '%'); $('#mxB2', el).style.setProperty('--h', sc(v) + '%');
    $('#mxB2v', el).textContent = fmt(v, 2) + ' Мбайт';
  },
  step() { this.upd(); }
};

/* ================= квиз ================= */
const QUIZ = [
  { q: 'Что такое частота дискретизации ν?', opts: ['Сколько раз за секунду «режем» звук', 'Сколько бит на один отсчёт', 'Сколько каналов в записи', 'Громкость звука'], a: 0, ex: 'Сколько срезов (отсчётов) за <b>1 секунду</b>. Измеряется в Гц.' },
  { q: 'Файл в формате «стерео». Чему равно k?', opts: ['2', '1', '4', '8'], a: 0, ex: 'Моно — 1, <b>стерео — 2</b>, квадро — 4.' },
  { q: 'Запись длится 2 минуты 5 секунд. Чему равно t?', opts: ['125', '205', '25', '7,5'], a: 0, ex: '2 · 60 + 5 = <b>125</b> секунд.' },
  { q: 'Объём получился в битах. Как сразу перевести в Кбайты?', opts: ['Разделить на 8 · 1024', 'Разделить на 1000', 'Умножить на 8', 'Разделить на 1024'], a: 0, ex: 'Биты → байты: ÷ 8. Байты → Кбайты: ÷ 1024. Вместе — <b>÷ 8192</b>.' },
  { q: 'Вышло 512,3 Кбайт. Вопрос: «наименьшее количество Кбайт, необходимое для сохранения». Ответ?', opts: ['513', '512', '512,3', '500'], a: 0, ex: 'Округляем <b>вверх</b>: в 512 Кбайт кусочек 0,3 не поместится.' },
  { q: 'Звук перезаписали: стерео вместо моно, частота в 2 раза меньше. Объём…', opts: ['не изменился', 'вырос в 2 раза', 'вырос в 4 раза', 'уменьшился в 2 раза'], a: 0, ex: 'k · 2, ν / 2 — множители сокращаются: <b>не изменился</b>.' }
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

function stopHiddenAudio() { const slide = document.querySelector('.slide.cur'); const widget = slide && W[slide.dataset.w]; widget?.leave?.(slide); AU.stop(); }
addEventListener('pagehide', stopHiddenAudio);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopHiddenAudio(); });
window.AU = AU;
window.DECK = { sections: { 1: 'Звук', 2: 'Оцифровка', 3: 'Формула', 4: 'Задачи ЕГЭ', 5: 'Во сколько раз', 6: 'Итог' }, key: 'soft:interactive:7-audio:v2', prefix: 'soft7a', widgets: W };
})();
