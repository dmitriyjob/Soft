/* ion_inf · №7 часть 2 — передача данных: скорость, время, объём, задачи */
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
const tween = (ms, fn, alive, lin) => new Promise(res => {
  if (reduced() || ms <= 0) { fn(1, 1); return res(true); }
  const t0 = performance.now();
  const tick = now => { if (alive && !alive()) return res(false); const k = Math.min(1, Math.max(0, now - t0) / ms); fn(lin ? k : ease2(k), k); if (k < 1) requestAnimationFrame(tick); else res(true); };
  requestAnimationFrame(tick);
});
const loop = () => { let id = 0; return { start(fn) { cancelAnimationFrame(id); const tick = t => { if (fn(t) !== false) id = requestAnimationFrame(tick); else id = 0; }; id = requestAnimationFrame(tick); }, stop() { cancelAnimationFrame(id); id = 0; } }; };
const setupCv = (cv, w, h) => { const d = 2; cv.width = w * d; cv.height = h * d; cv.style.width = w + 'px'; cv.style.height = h + 'px'; const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); return g; };
const W = {};
if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };
const toast = msg => { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2100); };
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
const blurOnUp = el => el.addEventListener('change', () => el.blur());

/* ================= канал: биты летят по трубе ================= */
function drawPipe(g, w, h, o) {
  /* o: { prog 0..1, t (сек анимации), label, left, right, speed } */
  g.clearRect(0, 0, w, h); g.fillStyle = '#141417'; g.fillRect(0, 0, w, h);
  const y = h * .46, x0 = 120, x1 = w - 120;
  g.fillStyle = '#26262B'; g.beginPath(); g.roundRect(x0 - 10, y - 34, x1 - x0 + 20, 68, 34); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; g.stroke();
  g.save(); g.beginPath(); g.roundRect(x0 - 6, y - 28, x1 - x0 + 12, 56, 28); g.clip();
  if (o.flow) {
    g.font = '800 22px "SF Mono", ui-monospace, Menlo, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const sp = o.speed || 1, n = 28;
    for (let i = 0; i < n; i++) {
      const ph = ((o.t * .22 * sp + i / n) % 1), x = x0 + ph * (x1 - x0), yy = y + Math.sin(i * 2.1) * 12, bit = (i * 7 + Math.floor(o.t * 3)) % 3 ? '1' : '0';
      g.fillStyle = `rgba(253,186,116,${.35 + .65 * Math.sin(ph * Math.PI)})`; g.fillText(bit, x, yy);
    }
  }
  g.restore();
  /* файл слева, ноутбук справа */
  const file = (x, y) => { g.fillStyle = '#F4F4F5'; g.beginPath(); g.moveTo(x - 30, y - 40); g.lineTo(x + 14, y - 40); g.lineTo(x + 30, y - 24); g.lineTo(x + 30, y + 40); g.lineTo(x - 30, y + 40); g.closePath(); g.fill(); g.fillStyle = '#D4D4D8'; g.beginPath(); g.moveTo(x + 14, y - 40); g.lineTo(x + 14, y - 24); g.lineTo(x + 30, y - 24); g.closePath(); g.fill(); g.fillStyle = '#B9521D'; g.fillRect(x - 18, y - 6, 36, 6); g.fillRect(x - 18, y + 6, 26, 6); g.fillRect(x - 18, y + 18, 32, 6); };
  const lap = (x, y) => { g.fillStyle = '#E4E4E7'; g.beginPath(); g.roundRect(x - 44, y - 34, 88, 56, 6); g.fill(); g.fillStyle = '#1F6FEB'; g.fillRect(x - 38, y - 28, 76 * Math.max(.04, o.prog), 44); g.fillStyle = '#E4E4E7'; g.beginPath(); g.roundRect(x - 56, y + 22, 112, 10, 4); g.fill(); };
  file(60, y); lap(w - 60, y);
  g.font = '700 14px -apple-system, Inter, Arial'; g.textAlign = 'center'; g.fillStyle = '#A1A1AA';
  if (o.left) g.fillText(o.left, 60, y + 66); if (o.right) g.fillText(o.right, w - 60, y + 66);
  /* прогресс */
  const by = h - 74; g.fillStyle = '#26262B'; g.beginPath(); g.roundRect(40, by, w - 80, 16, 8); g.fill();
  const gr = g.createLinearGradient(40, 0, w - 40, 0); gr.addColorStop(0, '#B9521D'); gr.addColorStop(1, '#F08A4B');
  g.fillStyle = gr; g.beginPath(); g.roundRect(40, by, Math.max(16, (w - 80) * o.prog), 16, 8); g.fill();
  g.textAlign = 'left'; g.fillStyle = '#E4E4E7'; g.font = '800 22px "SF Mono", ui-monospace, Menlo, monospace'; if (o.label) g.fillText(o.label, 40, h - 26);
  g.textAlign = 'right'; g.fillStyle = '#FDBA74'; if (o.label2) g.fillText(o.label2, w - 40, h - 26);
}

/* ================= титул ================= */
W.hero = {
  init(el) { this.g = setupCv($('#heroCv', el), 620, 400); this.L = loop(); },
  leave() { this.L.stop(); },
  step() {
    const t0 = performance.now();
    this.L.start(now => {
      const t = (now - t0) / 1000, cyc = t % 7.5, prog = Math.min(1, cyc / 5), done = cyc >= 5;
      drawPipe(this.g, 620, 400, { flow: !done, t, prog, left: '100 Мбайт', right: done ? 'готово ✓' : 'качаю…', speed: 1.3, label: `${fmt(prog * 100)} / 100 Мбайт`, label2: `${fmt(Math.min(5, cyc), 1)} с · 20 Мбайт/с` });
    });
  }
};

/* ================= дорога: S = v · t, ползунки ================= */
/* для каждого шага: что ищем, единицы и диапазоны ползунков */
const ROAD = [
  { h: 'Расстояние = <em>скорость · время</em>', f: 'S = v · t', hl: 'S', tu: 'ч', vu: 'км/ч', d: { S: 200, v: 100, t: 2 },
    r: { v: [10, 150, 10], t: [.5, 5, .5] }, sec: 2 },
  { h: 'Скорость = <em>расстояние / время</em>', f: 'v = S / t', hl: 'v', tu: 'мин', vu: 'км/мин', d: { S: 100, v: 10, t: 10 },
    r: { S: [10, 300, 10], t: [5, 60, 5] }, sec: 1.4 },
  { h: 'Время = <em>расстояние / скорость</em>', f: 't = S / v', hl: 't', tu: 'ч', vu: 'км/ч', d: { S: 100, v: 50, t: 2 },
    r: { S: [10, 400, 10], v: [10, 150, 10] }, sec: 2 }
];
const n2 = x => fmt(x, 2);
W.road = {
  init(el) {
    this.T = task(); this.el = el; this.s = 0; this.val = {};
    $$('.rd-m', el).forEach(m => { const r = $('.rd-r', m); blurOnUp(r); r.addEventListener('input', () => { this.val[m.dataset.k] = +r.value; this.calc(); this.T.next(); this.place(true); }); });
  },
  leave() { this.T.stop(); },
  calc() {
    const R = ROAD[this.s], v = this.val;
    if (R.hl === 'S') v.S = v.v * v.t; else if (R.hl === 'v') v.v = v.S / v.t; else v.t = v.S / v.v;
    const el = this.el, U = { S: 'км', v: R.vu, t: R.tu };
    $$('.rd-m', el).forEach(m => { const k = m.dataset.k; $('b', m).textContent = `${n2(v[k])} ${U[k]}`; });
    const sub = { S: `S = ${n2(v.v)} · ${n2(v.t)} = <b>${n2(v.S)} км</b>`, v: `v = ${n2(v.S)} / ${n2(v.t)} = <b>${n2(v.v)} ${R.vu}</b>`, t: `t = ${n2(v.S)} / ${n2(v.v)} = <b>${n2(v.t)} ${R.tu}</b>` }[R.hl];
    $('#rdSub', el).innerHTML = sub;
    const cap = {
      S: `Едем со скоростью <b>${n2(v.v)} км/ч</b> ${n2(v.t)} ${plural(v.t % 1 ? 2 : v.t, 'час', 'часа', 'часов')}. Какое расстояние проехали? Скорость умножить на время: <b>${n2(v.S)} км</b>.`,
      v: `Проехали <b>${n2(v.S)} км за ${n2(v.t)} мин</b>. Какая скорость? Делим расстояние на время: <b>${n2(v.v)} км в минуту</b>.`,
      t: `Нужно проехать <b>${n2(v.S)} км</b> со скоростью <b>${n2(v.v)} км/ч</b>. Сколько ехать? Расстояние делим на скорость: <b>${n2(v.t)} ${plural(v.t % 1 ? 2 : v.t, 'час', 'часа', 'часов')}</b>.`
    }[R.hl];
    $('#rdCap', el).innerHTML = cap + '<span class="rd-hint">Двигай ползунки — машина и ответ пересчитаются.</span>';
    /* шкала дороги: 200 км или больше, если не помещаемся */
    const max = Math.max(200, Math.ceil(v.S / 200) * 200);
    if (max !== this.max) { this.max = max; $('#rdKm', el).innerHTML = [0, 1, 2, 3, 4].map(i => `<span>${i ? fmt(max * i / 4) + ' км' : '0'}</span>`).join(''); }
  },
  place(smooth) {
    const car = $('#rdCar', this.el); car.classList.toggle('drive', !smooth);
    car.style.left = (this.val.S / this.max * 100) + '%'; $('#rdOdo', this.el).textContent = n2(this.val.S) + ' км';
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = !o.enter || o.dir > 0, R = ROAD[s];
    this.s = s; this.val = Object.assign({}, R.d);
    $('#rdHead', el).innerHTML = R.h; $('#rdF', el).textContent = R.f;
    $$('.rd-m', el).forEach(m => {
      const key = m.dataset.k, need = key === R.hl, r = $('.rd-r', m);
      m.classList.toggle('need', need);
      if (!need) { const [a, z, st] = R.r[key]; r.min = a; r.max = z; r.step = st; r.value = this.val[key]; }
    });
    this.calc();
    const car = $('#rdCar', el), odo = $('#rdOdo', el), S = this.val.S;
    const go = e => { car.style.left = (e * S / this.max * 100) + '%'; odo.textContent = fmt(e * S) + ' км'; };
    car.classList.add('drive');
    if (anim && !reduced()) { car.classList.add('moving'); go(0); await wait(300); if (!alive()) return; await tween(R.sec * 1000, go, alive); car.classList.remove('moving'); }
    if (!alive()) return;
    this.place(false);
    $$('.rd-m.need', el).forEach(m => { m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop'); });
  }
};

/* ================= скачивание: каждую секунду проходит v Мбайт ================= */
const BITS = '0110100101110010110100011011001011101001010011100101101';
function drawDl(g, w, h, o) {
  /* o: { V, v, tau — прошедшее время в секундах, run } */
  const V = o.V, v = o.v, T = V / v, tau = Math.min(T, o.tau), full = Math.floor(T + 1e-9), part = V - full * v, n = Math.ceil(T - 1e-9);
  const got = Math.min(V, tau * v);
  g.clearRect(0, 0, w, h); g.fillStyle = '#141417'; g.fillRect(0, 0, w, h);
  const y = 112, x0 = 128, x1 = w - 128;
  /* труба */
  g.fillStyle = '#26262B'; g.beginPath(); g.roundRect(x0 - 10, y - 38, x1 - x0 + 20, 76, 38); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; g.stroke();
  g.font = '700 14px -apple-system, Inter, Arial'; g.textAlign = 'center'; g.fillStyle = '#A1A1AA';
  g.fillText(`каждую секунду по каналу проходит ${fmt(v)} Мбайт`, w / 2, y - 52);
  /* порция этой секунды летит по трубе */
  g.save(); g.beginPath(); g.roundRect(x0 - 4, y - 32, x1 - x0 + 8, 64, 32); g.clip();
  if (o.run && tau < T) {
    const k = Math.floor(tau), amt = k < full ? v : part, dur = amt / v, ph = Math.min(1, (tau - k) / dur);
    const cw = 70 + 110 * (amt / v), cx = x0 - cw / 2 + ph * (x1 - x0 + cw);
    g.fillStyle = 'rgba(240,138,75,.16)'; g.fillRect(x0 - 4, y - 32, cx - x0 + 4 - cw / 2, 64);
    g.fillStyle = '#B9521D'; g.beginPath(); g.roundRect(cx - cw / 2, y - 26, cw, 52, 12); g.fill();
    g.font = '700 11px "SF Mono", ui-monospace, Menlo, monospace'; g.fillStyle = 'rgba(255,255,255,.38)'; g.textAlign = 'left';
    [-17, 21].forEach((dy, r) => { const sh = (k * 7 + r * 9) % 20; g.fillText(BITS.slice(sh, sh + Math.floor((cw - 12) / 6.7)), cx - cw / 2 + 6, y + dy); });
    g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = '800 18px "SF Mono", ui-monospace, Menlo, monospace';
    g.fillText(`${fmt(amt, 2)} Мбайт`, cx, y + 6);
  } else if (!o.run) {
    g.font = '800 20px "SF Mono", ui-monospace, Menlo, monospace'; g.textAlign = 'center';
    for (let i = 0; i < 26; i++) { const x = x0 + 14 + i * (x1 - x0 - 28) / 25; g.fillStyle = 'rgba(253,186,116,.18)'; g.fillText(BITS[(i * 3) % BITS.length], x, y + 7); }
  }
  g.restore();
  /* файл (сколько осталось) и ноутбук (сколько пришло) */
  const fx = 62, left = V - got;
  g.fillStyle = '#F4F4F5'; g.beginPath(); g.moveTo(fx - 30, y - 40); g.lineTo(fx + 14, y - 40); g.lineTo(fx + 30, y - 24); g.lineTo(fx + 30, y + 40); g.lineTo(fx - 30, y + 40); g.closePath(); g.fill();
  g.fillStyle = '#B9521D'; const fh = 72 * (left / V); g.fillRect(fx - 24, y + 36 - fh, 48, fh);
  const lx = w - 62; g.fillStyle = '#E4E4E7'; g.beginPath(); g.roundRect(lx - 46, y - 36, 92, 60, 6); g.fill();
  g.fillStyle = '#0F172A'; g.fillRect(lx - 40, y - 30, 80, 48); g.fillStyle = '#1F6FEB'; const lh = 48 * (got / V); g.fillRect(lx - 40, y + 18 - lh, 80, lh);
  g.fillStyle = '#E4E4E7'; g.beginPath(); g.roundRect(lx - 58, y + 24, 116, 10, 4); g.fill();
  g.font = '700 14px -apple-system, Inter, Arial'; g.textAlign = 'center'; g.fillStyle = '#A1A1AA';
  g.fillText(`осталось ${fmt(left, 1)}`, fx, y + 64); g.fillText(`пришло ${fmt(got, 1)}`, lx, y + 64);
  /* лента времени: каждая секунда — порция v Мбайт */
  const bx = 40, bw = w - 80, by = 218, bh = 40, gap = n <= 40 ? 3 : 0;
  g.textAlign = 'left'; g.font = '700 13px -apple-system, Inter, Arial'; g.fillStyle = '#A1A1AA';
  g.fillText(n <= 40 ? 'ПО СЕКУНДАМ: КАЖДЫЙ КУСОЧЕК — ТО, ЧТО ПРОШЛО ЗА 1 СЕКУНДУ' : `ПО СЕКУНДАМ: ${n} КУСОЧКОВ ПО ${fmt(v)} МБАЙТ`, bx, by - 12);
  for (let k = 0; k < n; k++) {
    const a = k / T, z = Math.min(1, (k + 1) / T), sx = bx + a * bw, sw = Math.max(1, (z - a) * bw - gap), amt = k < full ? v : part;
    g.fillStyle = '#26262B'; g.beginPath(); g.roundRect(sx, by, sw, bh, n <= 40 ? 6 : 0); g.fill();
    const fillK = Math.max(0, Math.min(1, (tau - k) / ((z - a) * T)));
    if (fillK > 0) { g.fillStyle = fillK >= 1 ? '#B9521D' : '#F08A4B'; g.beginPath(); g.roundRect(sx, by, sw * fillK, bh, n <= 40 ? 6 : 0); g.fill(); }
    if (n <= 16 && sw > 34) { g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '800 14px "SF Mono", ui-monospace, Menlo, monospace'; g.fillText((fillK >= 1 ? '+' : '') + fmt(amt, 2), sx + sw / 2, by + 25); }
  }
  /* отметки секунд */
  g.textAlign = 'center'; g.font = '700 13px "SF Mono", ui-monospace, Menlo, monospace'; g.fillStyle = '#71717A';
  const every = n <= 16 ? 1 : Math.ceil(n / 12);
  for (let k = 0; k <= full; k += every) { const x = bx + (k / T) * bw; if (k > 0 && x > bx + bw - 30) break; g.fillText(k ? `${k} с` : '0', x, by + bh + 18); }
  g.fillStyle = '#FDBA74'; g.textAlign = 'right'; g.fillText(`${fmt(T, 2)} с`, bx + bw, by + bh + 18);
  /* итог */
  g.textAlign = 'left'; g.fillStyle = '#E4E4E7'; g.font = '800 22px "SF Mono", ui-monospace, Menlo, monospace'; g.fillText(`${fmt(got, 1)} / ${fmt(V)} Мбайт`, 40, h - 22);
  g.textAlign = 'right'; g.fillStyle = '#FDBA74'; g.fillText(tau >= T - 1e-9 && o.run !== undefined && o.doneLbl ? `${fmt(T, 2)} с — скачано` : `${fmt(tau, 2)} с`, w - 40, h - 22);
}
W.dl = {
  init(el) {
    this.T = task(); this.el = el; this.g = setupCv($('#dlCv', el), 860, 360); this.V = 100; this.v = 20;
    const rV = $('#dlV', el), rv = $('#dlS', el); [rV, rv].forEach(blurOnUp);
    rV.addEventListener('input', () => { this.V = +rV.value; this.T.next(); $('#dlGo', el).classList.remove('on'); this.read(); this.idle(); });
    rv.addEventListener('input', () => { this.v = +rv.value; this.T.next(); $('#dlGo', el).classList.remove('on'); this.read(); this.idle(); });
    $('#dlGo', el).addEventListener('click', e => { e.currentTarget.blur(); this.run(); });
  },
  leave() { this.T.stop(); },
  read() {
    const el = this.el, t = this.V / this.v;
    $('#dlVv', el).textContent = this.V + ' Мбайт'; $('#dlSv', el).textContent = this.v + ' Мбайт/с';
    $('#dlEq', el).innerHTML = `t = <span>${this.V}</span> / <span>${this.v}</span> = <b>${fmt(t, 2)}&nbsp;с</b>`;
  },
  idle() { drawDl(this.g, 860, 360, { V: this.V, v: this.v, tau: 0, run: false }); },
  async run() {
    const k = this.T.next(), alive = () => this.T.alive(k), t = this.V / this.v;
    /* до 8 секунд — в реальном времени, дольше — ускоряем */
    const ms = Math.min(9000, Math.max(1800, t * 1000));
    $('#dlGo', this.el).classList.add('on');
    await tween(ms, (e, lin) => drawDl(this.g, 860, 360, { V: this.V, v: this.v, tau: lin * t, run: true }), alive, true);
    $('#dlGo', this.el).classList.remove('on');
    if (!alive()) return;
    drawDl(this.g, 860, 360, { V: this.V, v: this.v, tau: t, run: true, doneLbl: true });
  },
  async step(el, s, o) {
    $('#dlHead', el).innerHTML = ['Объём — как <em>расстояние</em>', '100 Мбайт по 20 Мбайт/с — <em>5 секунд</em>', 'Покрути <em>сам</em>'][s];
    $('#dlCtl', el).classList.toggle('on', s >= 2);
    if (s <= 1) { this.V = 100; this.v = 20; $('#dlV', el).value = 100; $('#dlS', el).value = 20; }
    this.read();
    if (s === 0) { this.T.next(); this.idle(); return; }
    if (s === 1 && (animOf(o) || o.enter)) return this.run();
    this.T.next(); this.idle();
  }
};

/* ================= треугольник ================= */
const SP = '<span class="spd">v</span>';
const TRI = { t: [`t = V / ${SP}`, 'Время: объём делим на скорость'], V: [`V = ${SP} · t`, 'Объём: скорость умножаем на время'], v: [`${SP} = V / t`, 'Скорость: объём делим на время'] };
W.tri = {
  init(el) { this.el = el; $$('.tri-k', el).forEach(b => b.addEventListener('click', e => { e.currentTarget.blur(); this.cover(b.dataset.k); })); },
  cover(key) {
    const el = this.el; $$('.tri-k', el).forEach(b => b.classList.toggle('cov', b.dataset.k === key));
    $('#triF', el).innerHTML = key ? `<b>${TRI[key][0]}</b><span>${TRI[key][1]}</span>` : '<span>Закрой пальцем то, что ищешь, — останется формула.</span>';
    $('#triBox', el).dataset.k = key || '';
  },
  step(el, s) {
    $('#triHead', el).innerHTML = ['Одна формула — <em>три вида</em>', 'Ищем время: <em>t = V / v</em>', 'Ищем объём: <em>V = v · t</em>', 'Ищем скорость: <em>v = V / t</em>'][s];
    this.cover([null, 't', 'V', 'v'][s]);
  }
};

/* ================= задача 166 ================= */
W.t166 = {
  init(el) { this.T = task(); this.el = el; },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o);
    $$('.tx-hl', el).forEach(h => h.classList.toggle('on', +h.dataset.k <= s && s >= 1));
    $$('.gv', el).forEach(g => g.classList.toggle('on', +g.dataset.s <= s));
    $('#t6V', el).classList.toggle('on', s >= 3); $('#t6T', el).classList.toggle('on', s >= 4); $('#t6Calc', el).classList.toggle('on', s >= 4); $('#t6Ans', el).classList.toggle('on', s >= 5);
    $('#t6Head', el).innerHTML = ['Стереоаудиофайл <em>передаётся</em>', 'Где <em>спрятали</em> стерео?', 'Два разных <em>«в секунду»</em>', 'Объём — <em>как умеем</em>', 'Время = <em>объём / скорость</em>', 'А спрашивают — <em>в минутах!</em>'][s];
    const scr = $('#t6Scr', el);
    if (s === 4 && anim) { await tween(1000, e => { scr.textContent = fmt(4320 * e); }, alive); if (alive()) scr.textContent = '4 320'; }
    else scr.textContent = s >= 4 ? '4 320' : '0';
  }
};

/* ================= пакеты снимков ================= */
W.pack = {
  init(el) { this.T = task(); this.el = el; const host = $('#pkGrid', el); this.tiles = [...Array(33)].map((_, i) => H('i', i === 32 ? 'x' : '', host)); },
  leave() { this.T.stop(); },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o);
    $$('.tx-hl', el).forEach(h => h.classList.toggle('on', +h.dataset.k <= s && s >= 1));
    $$('.pk-st', el).forEach(c => c.classList.toggle('on', +c.dataset.s <= s));
    $('#pkAns', el).classList.toggle('on', s >= 4);
    $('#pkHead', el).innerHTML = ['Камера шлёт <em>пакеты</em> фото', 'Одно фото: <em>i = 13</em>', 'Объём <em>одного снимка</em>', 'Сколько бит <em>успеем за 280 с</em>', 'Ответ: <em>32</em> снимка'][s];
    const show = n => this.tiles.forEach((t, i) => t.classList.toggle('on', i < n));
    if (s < 4) { show(s >= 2 ? 1 : 0); $('#pkBox', el).classList.toggle('on', s >= 3); return; }
    $('#pkBox', el).classList.add('on');
    if (anim) { show(0); for (let i = 1; i <= 33; i++) { await wait(55); if (!alive()) return; show(i); } }
    else show(33);
  }
};

/* ================= песочница ================= */
const SPEEDS = [['32 000 бит/с', 32000], ['256 000 бит/с', 256000], ['1 474 560 бит/с', 1474560], ['10 000 000 бит/с', 10000000]];
W.lab = {
  init(el) {
    this.T = task(); this.el = el; this.g = setupCv($('#lbCv', el), 820, 380); this.kind = 0; this.sp = 0;
    $$('#lbKind button', el).forEach((b, i) => b.addEventListener('click', e => { e.currentTarget.blur(); this.kind = i; this.upd(); }));
    $$('.lb-in input', el).forEach(x => x.addEventListener('input', () => this.upd()));
    const sh = $('#lbSp', el);
    SPEEDS.forEach(([t], i) => { const b = H('button', '', sh, t); b.addEventListener('click', e => { e.currentTarget.blur(); this.sp = i; $('#lbSpeed', el).value = SPEEDS[i][1]; this.upd(); }); });
    $('#lbSpeed', el).addEventListener('input', () => { this.sp = -1; this.upd(); });
    $('#lbGo', el).addEventListener('click', e => { e.currentTarget.blur(); this.run(); });
  },
  leave() { this.T.stop(); },
  val(id) { return Math.max(0, +$('#' + id, this.el).value || 0); },
  bits() {
    if (this.kind === 0) return { v: this.val('lA1') * this.val('lA2') * this.val('lA3') * this.val('lA4'), d: `${fmt(this.val('lA1'))} · ${this.val('lA2')} · ${this.val('lA3')} · ${this.val('lA4')}`, name: 'голосовое' };
    if (this.kind === 1) { const N = this.val('lB3'), i = N > 1 ? Math.ceil(Math.log2(N)) : 1; return { v: this.val('lB1') * this.val('lB2') * i * Math.max(1, this.val('lB4')), d: `${this.val('lB1')} · ${this.val('lB2')} · ${i} · ${Math.max(1, this.val('lB4'))}`, name: 'фото', note: `${fmt(N)} цветов → i = ${i} бит (2<sup>${i}</sup> = ${fmt(2 ** i)})` }; }
    return { v: this.val('lC1') * 8 * 1024 * 1024, d: `${this.val('lC1')} · 1024 · 1024 · 8`, name: 'файл' };
  },
  upd() {
    const el = this.el; $$('#lbKind button', el).forEach((b, i) => b.classList.toggle('cur', i === this.kind));
    $$('.lb-in', el).forEach((p, i) => p.classList.toggle('on', i === this.kind));
    $$('#lbSp button', el).forEach((b, i) => b.classList.toggle('cur', i === this.sp));
    const B = this.bits(), q = Math.max(1, +$('#lbSpeed', el).value || 1), t = B.v / q;
    this.cur = { B, q, t };
    $('#lbNote', el).innerHTML = B.note || '';
    $('#lbRes', el).innerHTML = `<div><small>объём <i>V</i></small><b>${fmt(B.v)} бит</b><span>${B.d}</span></div><div><small>скорость <i class="spd">v</i></small><b>${fmt(q)} бит/с</b></div><div class="hot"><small>время <i>t = V / v</i></small><b>${fmt(t, 2)} с</b><span>${t >= 60 ? '= ' + fmt(t / 60, 2) + ' мин' : ''}${t >= 3600 ? ' = ' + fmt(t / 3600, 2) + ' ч' : ''}</span></div>`;
    drawPipe(this.g, 820, 380, { flow: false, t: 0, prog: 0, left: B.name, right: 'получатель', label: '0 %', label2: '0 с' });
  },
  async run() {
    const k = this.T.next(), alive = () => this.T.alive(k), { t } = this.cur, ms = Math.min(6000, Math.max(1200, t * 1000)), t0 = performance.now(), B = this.cur.B;
    await tween(ms, (e, lin) => drawPipe(this.g, 820, 380, { flow: true, t: (performance.now() - t0) / 1000, prog: lin, speed: 1.4, left: B.name, right: 'качаю…', label: `${fmt(lin * 100)} %`, label2: `${fmt(lin * t, 1)} с из ${fmt(t, 1)}` }), alive, true);
    if (!alive()) return;
    drawPipe(this.g, 820, 380, { flow: false, t: 0, prog: 1, left: B.name, right: 'готово ✓', label: '100 %', label2: `${fmt(t, 2)} с` });
  },
  step() { this.upd(); }
};

/* ================= квиз ================= */
const QUIZ = [
  { q: 'Файл 600 Мбайт качается со скоростью 20 Мбайт/с. Сколько секунд?', opts: ['30', '12 000', '620', '3'], a: 0, ex: 't = V / v = 600 / 20 = <b>30 секунд</b>.' },
  { q: 'Скорость 32 000 бит/с, передача шла 10 секунд. Сколько бит передали?', opts: ['320 000', '3 200', '32 010', '3,2'], a: 0, ex: 'V = v · t = 32 000 · 10 = <b>320 000 бит</b>.' },
  { q: 'Время получилось 4320 секунд, а спрашивают минуты. Ответ?', opts: ['72', '4320', '259 200', '43,2'], a: 0, ex: '4320 / 60 = <b>72</b>. Перед ответом смотрим, в чём спрашивают.' },
  { q: 'В задаче «стереоаудиофайл». Чему равно n?', opts: ['2', '1', '4', 'не сказано'], a: 0, ex: 'Стерео спрятали внутри слова — но это всё равно <b>n = 2</b>.' },
  { q: 'За отведённое время успевает 32,3 снимка. Максимальное число снимков в пакете?', opts: ['32', '33', '32,3', '31'], a: 0, ex: 'Тридцать третий снимок <b>не успеет</b> — округляем вниз: <b>32</b>.' }
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
      if (ok >= 4) confetti(110);
      return;
    }
    const q = QUIZ[s], a = this.ans[s], done = a !== undefined;
    $('#qzNum', el).textContent = `Вопрос ${s + 1} из ${QUIZ.length}`;
    box.innerHTML = `<h1 class="qzh">${q.q}</h1><div class="qz${done ? ' done' : ''}">${q.order.map((oi, k) => `<button data-o="${oi}" class="${done ? (oi === q.a ? 'right' : (oi === a ? 'wrong' : '')) : ''}"><i>${'АБВГ'[k]}</i>${q.opts[oi]}</button>`).join('')}</div><div class="expl${done ? ' on' : ''}">${q.ex}</div>`;
    $$('.qz button', box).forEach(b => b.addEventListener('click', e => { e.currentTarget.blur(); if (this.ans[s] !== undefined) return; this.ans[s] = +b.dataset.o; this.render(el, s); if (this.ans[s] === q.a) confetti(30); }));
  },
  step(el, s) { this.render(el, s); }
};

window.DECK = { sections: { 1: 'Скорость', 2: 'Формула', 3: 'Задачи ЕГЭ', 4: 'Песочница', 5: 'Итог' }, key: 'ion:interactive:7-transfer:v1', prefix: 'ion7t', widgets: W };
})();
