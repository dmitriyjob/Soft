/* ion_inf · №1 — вступление: структуры данных, граф, такси, лабиринт, степень */
(() => {
'use strict';
const G = window.G1, W = window.DECK.widgets;
const { $, $$, S, H, wait, reduced, task, animOf, confetti, shuffle, GraphView, uniqSet } = G;
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const card = (t, h, cls = '') => `<div class="fcard ${cls}"><h3>${t}</h3>${h}</div>`;
const toast = m => window.DP && window.DP.toast(m);
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };

/* ================= структуры данных: куча → таблица ================= */
const SD = {
  names: ['Артём', 'Ион', 'Дмитрий', 'Артур'], subj: ['Информатика', 'Математика', 'Физика'], g: [[5, 4, 4], [4, 5, 3], [5, 5, 5], [3, 4, 5]],
  noise: ['среда', '12:40', 'дз · стр. 45', 'каб. 214', 'контрольная!', 'сменка', '8 «Б»', 'звонок 9:30', 'столовая']
};
W.struct = {
  init(el) {
    const st = this.st = $('#sdStage', el), R = rng(11); this.chips = [];
    const x0 = 24, y0 = 40, cw0 = 168, cw = 196, rh0 = 66, rh = 78, Wt = cw0 + 3 * cw, Ht = rh0 + 4 * rh;
    const grid = H('div', 'sd-grid', st); grid.style.cssText = `left:${x0}px;top:${y0}px;width:${Wt}px;height:${Ht}px`;
    H('div', 'sd-hrow', grid).style.height = rh0 + 'px';
    this.bandR = H('div', 'sd-band', grid); this.bandR.style.cssText = `top:${rh0 + rh}px;height:${rh}px;left:0;right:0`;
    this.bandC = H('div', 'sd-band', grid); this.bandC.style.cssText = `left:${cw0}px;width:${cw}px;top:0;bottom:0`;
    for (let r = 0; r < 4; r++) { const l = H('i', 'sd-l h', grid); l.style.top = (rh0 + r * rh) + 'px'; }
    for (let c = 0; c < 3; c++) { const l = H('i', 'sd-l v', grid); l.style.left = (cw0 + c * cw) + 'px'; }
    const add = (text, cls, tx, ty) => {
      const c = H('div', 'sd-chip ' + cls, st); H('span', '', c, String(text));
      c._t = tx === null ? null : [tx, ty]; c._c = [100 + R() * 600, 46 + R() * 400, (R() - .5) * 44];
      c.firstChild.style.animationDelay = (-R() * 5).toFixed(2) + 's'; c.firstChild.style.animationDuration = (2.6 + R() * 2.2).toFixed(2) + 's';
      this.chips.push(c); return c;
    };
    SD.subj.forEach((s, j) => add(s, 'sub', x0 + cw0 + j * cw + cw / 2, y0 + rh0 / 2));
    SD.names.forEach((n, i) => {
      add(n, 'nm', x0 + cw0 / 2, y0 + rh0 + i * rh + rh / 2);
      SD.g[i].forEach((g, j) => { const c = add(g, 'gr', x0 + cw0 + j * cw + cw / 2, y0 + rh0 + i * rh + rh / 2); if (i === 1 && j === 0) c.classList.add('key'); });
    });
    SD.noise.forEach(t => add(t, 'noise', null));
    this.order = shuffle(this.chips.slice(), R);
    this.place(false, false);
  },
  place(ord, anim) {
    this.order.forEach((c, k) => {
      c.style.transition = anim ? '' : 'none';
      c.style.transitionDelay = anim ? (ord ? k * 30 : k * 10) + 'ms' : '0ms';
      const gone = ord && !c._t, [x, y] = ord && c._t ? c._t : c._c, r = ord ? 0 : c._c[2];
      c.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${gone ? r * 4 : r}deg) scale(${gone ? .2 : 1})`;
      c.style.opacity = gone ? 0 : 1;
    });
    if (!anim) { void this.st.offsetWidth; this.order.forEach(c => { c.style.transition = ''; }); }
  },
  step(el, s, o) {
    const ord = s >= 1;
    this.place(ord, !o.enter && !reduced());
    this.st.classList.toggle('ord', ord); this.st.classList.toggle('ans', ord);
    const side = $('#sdSide', el);
    const H1 = ['Информации <em>очень много</em>', 'Та же информация — <em>в таблице</em>', 'Это и есть <em>структура данных</em>'];
    $('#sdHead', el).innerHTML = H1[s];
    if (s === 0) side.innerHTML = card('Вопрос', 'Какая оценка у <b>Иона</b> по <b>информатике</b>?') + '<p class="small">Найди в этой куче. Тяжело? А здесь всего один кусочек школьного журнала.</p>';
    else if (s === 1) side.innerHTML = card('Ответ: 4', 'Строка <b>Ион</b>, столбец <b>Информатика</b> — и ответ виден за секунду.') + '<p class="small">Мусор — среда, кабинет, сменка — в таблицу не попал. Структура сама наводит порядок.</p>';
    else side.innerHTML = card('Структура данных', 'Способ хранить информацию так, чтобы с ней было <b>удобно работать</b>: искать, добавлять, менять.', 'dark') + '<div class="chips"><span>список</span><span>таблица</span><span>дерево</span><span>граф</span></div>';
  }
};

/* ================= четыре структуры ================= */
W.kinds = {
  init(el) {
    /* таблица */
    const t = $('#kdV2', el); let h = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) h += `<rect x="${22 + c * 48}" y="${18 + r * 39}" width="46" height="37" rx="5" class="${r === 0 || c === 0 ? 'kh' : 'kc'}"/>`;
    t.innerHTML = h + '<rect class="kd-cell" x="70" y="57" width="46" height="37" rx="5"/>';
    /* дерево */
    const tr = $('#kdV3', el), N = [[140, 30, 'Диск'], [72, 95, 'Школа'], [208, 95, 'Игры'], [34, 160, 'Алгебра'], [110, 160, 'Инфа'], [208, 160, 'Сейвы']], L = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]];
    tr.innerHTML = L.map(([a, b], i) => `<path class="kd-br" style="--i:${i}" d="M${N[a][0]} ${N[a][1] + 14} V${(N[a][1] + N[b][1]) / 2} H${N[b][0]} V${N[b][1] - 14}"/>`).join('') +
      N.map(([x, y, w], i) => `<g class="kd-node" style="--i:${i}"><rect x="${x - 34}" y="${y - 14}" width="68" height="28" rx="8"/><text x="${x}" y="${y + 1}">${w}</text></g>`).join('');
    /* граф */
    const g = $('#kdV4', el), P = [[40, 60], [110, 30], [190, 52], [250, 110], [180, 150], [100, 160], [140, 95]], E = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [6, 1], [6, 4], [6, 2], [0, 6]];
    const pth = ids => 'M' + ids.map(i => P[i].join(' ')).join(' L');
    g.innerHTML = E.map(([a, b]) => `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" class="ke"/>`).join('') +
      [[0, 6, 4, 3], [5, 0, 1, 2], [3, 2, 6, 5], [1, 6, 4]].map((ids, i) => `<circle r="5" class="kp"><animateMotion dur="${2.2 + i * .5}s" repeatCount="indefinite" path="${pth(ids)}"/></circle>`).join('') +
      P.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" class="kv"/>`).join('');
  },
  step(el, s) {
    $$('.kd', el).forEach((c, i) => { c.classList.toggle('dim', s === 3 && i < 3); });
    $('#kdGraph', el).classList.toggle('hot', s >= 3);
    $('#kdHead', el).innerHTML = s >= 3 ? 'Сегодня — <em>графы</em>' : 'Как раскладывают <em>информацию</em>';
  }
};

/* ================= вершины и рёбра ================= */
const BN1 = { А: [110, 250], Б: [290, 90], В: [290, 410], Г: [520, 90], Д: [520, 410], Е: [710, 250] };
const BN2 = { Е: [130, 120], Г: [360, 60], Д: [170, 410], В: [450, 320], А: [710, 420], Б: [660, 150] };
const BE = [['А', 'Б', 12], ['А', 'В', 7], ['Б', 'В', 9], ['Б', 'Г', 15], ['В', 'Д', 20], ['Г', 'Д', 6], ['Г', 'Е', 11], ['Д', 'Е', 8]];
W.basic = {
  init(el) { this.T = task(); this.gv = new GraphView($('#bsG', el), { pos: BN1, nodes: BN1, edges: BE, W: 820, H: 500, R: 30, weights: true }); },
  leave() { this.T.stop(); },
  call(x, y, tx, ty, text) {
    const g = S('g', { class: 'gx-call' }, this.gv.L.x);
    S('line', { x1: x, y1: y, x2: tx, y2: ty }, g); S('circle', { cx: x, cy: y, r: 4 }, g);
    const w = text.length * 11 + 26; S('rect', { x: tx - w / 2, y: ty - 17, width: w, height: 34, rx: 11 }, g);
    const t = S('text', { x: tx, y: ty }, g); t.textContent = text; return g;
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), gv = this.gv, side = $('#bsSide', el);
    if (s < 6) { Object.assign(gv.pos, BN1); gv.place(); }
    gv.reset();
    gv.vs.forEach((v, i) => gv.setLabel(v, s === 3 ? String(i + 1) : v));
    if (s < 4) gv.E.forEach(e => e.t.classList.add('off'));
    const head = h => { $('#bsHead', el).innerHTML = h; };
    if (o.enter && s === 0 && !reduced()) { gv.svg.classList.remove('in'); void gv.svg.getBBox(); gv.svg.classList.add('in'); }
    if (s === 0) {
      head('Вот это — <em>граф</em>');
      side.innerHTML = card('Граф', 'Картинка из <b>точек и линий</b>. Она показывает, <b>что с чем связано</b>.') + '<p class="small">Разберём, из чего он состоит.</p>';
      return;
    }
    if (s === 1) {
      head('Это — <em>вершины</em>');
      side.innerHTML = card('Вершины', 'Кружки — это <b>вершины</b>. Любые объекты: города, люди, перекрёстки, компьютеры.') + '<div class="chips"><span>6 вершин</span></div>';
      gv.allE('dim');
      if (anim) for (const v of gv.vs) { if (!alive()) return; gv.cls(v, 'glow'); await wait(120); }
      gv.allN('glow');
      const [ax, ay] = gv.pos['А'], [ex, ey] = gv.pos['Е'];
      this.call(ax, ay - 34, ax + 20, ay - 104, 'вершина'); this.call(ex, ey + 34, ex - 30, ey + 104, 'вершина');
      return;
    }
    if (s === 2) {
      head('А это — <em>рёбра</em>');
      side.innerHTML = card('Рёбра', 'Линии между вершинами — <b>рёбра</b>. В задачах ЕГЭ их называют <b>дорогами</b>: ребро А–Б значит «из А в Б есть дорога».') + '<div class="chips"><span>8 рёбер</span></div>';
      gv.allN('mute');
      if (anim) for (const [a, b] of BE) { if (!alive()) return; gv.ecls(a, b, 'flow'); await wait(110); }
      gv.allE('flow');
      const [gx, gy] = gv.pos['Г'], [dx, dy] = gv.pos['Д'];
      this.call((gx + dx) / 2 + 3, (gy + dy) / 2, (gx + dx) / 2 + 120, (gy + dy) / 2 - 10, 'ребро');
      return;
    }
    if (s === 3) {
      head('Подписи — <em>любые</em>');
      side.innerHTML = card('Как подписать', 'Буквами, числами, именами — неважно. <b>Граф от этого не меняется</b>: связи те же.') + '<div class="chips"><span>А, Б, В…</span><span>1, 2, 3…</span><span>Москва, Тверь…</span></div>';
      return;
    }
    if (s === 4) {
      head('У дороги есть <em>длина</em>');
      side.innerHTML = card('Вес дороги', 'Рядом с дорогой пишут число — например, длину в <b>километрах</b>. В ЕГЭ эти числа спрятаны в таблицу.');
      return;
    }
    if (s === 5) {
      head('Дорога либо есть, <em>либо нет</em>');
      gv.ghost('А', 'Е', 'bad'); gv.cross('А', 'Е'); gv.cls('А', 'hl'); gv.cls('Е', 'hl');
      side.innerHTML = card('А и Е', 'Напрямую <b>не связаны</b>: дороги А–Е нет. Проехать можно только через другие пункты.') + '<p class="small">Третьего не дано: «половины дороги» не бывает.</p>';
      return;
    }
    head('Тот же граф — <em>другой рисунок</em>');
    side.innerHTML = card('Главное', 'Важно только, <b>кто с кем соединён</b>. Где нарисованы точки и какой длины линии — случайность.', 'dark') +
      '<p class="small">Поэтому на ЕГЭ рисунок <b>не в масштабе</b>: дорога в 6 км может выглядеть длиннее дороги в 20 км.</p>';
    if (anim) await gv.morph(BN2, 1300, alive); else { Object.assign(gv.pos, BN2); gv.place(); }
  }
};

/* ================= такси: карта → граф → волна → маршрут ================= */
const TX = { X: [60, 205, 350, 560, 705, 850], Y: [60, 190, 320, 450] };
const tid = (r, c) => r * 6 + c;
W.taxi = {
  init(el) {
    this.T = task(); this.el = el; this.s = 0;
    const svg = this.svg = $('#txG', el), R = rng(5);
    svg.setAttribute('viewBox', '0 0 910 510');
    this.P = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) this.P.push([TX.X[c], TX.Y[r]]);
    const E = [], skip = new Set([`${tid(1, 4)}-${tid(1, 5)}`, `${tid(2, 4)}-${tid(3, 4)}`]);
    const jam = { [`${tid(1, 2)}-${tid(1, 3)}`]: 11, [`${tid(3, 1)}-${tid(3, 2)}`]: 8, [`${tid(0, 3)}-${tid(0, 4)}`]: 7 };
    const push = (a, b, bridge) => { const key = `${a}-${b}`; if (skip.has(key)) return; E.push({ a, b, w: jam[key] || (bridge ? 4 : 2 + Math.floor(R() * 3)), jam: !!jam[key], bridge }); };
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { if (c === 2 && r !== 1 && r !== 3) continue; push(tid(r, c), tid(r, c + 1), c === 2); }
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) push(tid(r, c), tid(r + 1, c), false);
    this.E = E; this.adj = this.P.map(() => []); E.forEach((e, i) => { this.adj[e.a].push([e.b, e.w, i]); this.adj[e.b].push([e.a, e.w, i]); });
    /* карта */
    const defs = S('defs', {}, svg), cp = S('clipPath', { id: 'txClip' }, defs); S('rect', { x: 0, y: 0, width: 910, height: 510, rx: 26 }, cp);
    const map = this.map = S('g', { class: 'tx-map', 'clip-path': 'url(#txClip)' }, svg);
    S('rect', { x: 0, y: 0, width: 910, height: 510, rx: 26, class: 'tx-land' }, map);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const x = TX.X[c] + 17, y = TX.Y[r] + 17, w = TX.X[c + 1] - TX.X[c] - 34, h = TX.Y[r + 1] - TX.Y[r] - 34;
      if (c === 0 && r === 2) {
        S('rect', { x, y, width: w, height: h, rx: 12, class: 'tx-park' }, map);
        for (let t = 0; t < 7; t++) S('circle', { cx: x + 14 + R() * (w - 28), cy: y + 14 + R() * (h - 28), r: 7 + R() * 6, class: 'tx-tree' }, map);
        continue;
      }
      S('rect', { x, y, width: w, height: h, rx: 12, class: 'tx-block' }, map);
      if (c !== 2) for (let b = 0; b < 3; b++) { const bw = 18 + R() * 26, bh = 14 + R() * 22; S('rect', { x: x + 8 + R() * (w - bw - 16), y: y + 8 + R() * (h - bh - 16), width: bw, height: bh, rx: 4, class: 'tx-bld' }, map); }
    }
    S('path', { d: 'M418 -10 C 448 110, 398 240, 428 360 C 444 430, 420 480, 416 520 L 498 520 C 504 470, 520 410, 496 320 C 470 220, 520 110, 492 -10 Z', class: 'tx-river' }, map);
    E.forEach(e => { const [x1, y1] = this.P[e.a], [x2, y2] = this.P[e.b]; S('line', { x1, y1, x2, y2, class: e.bridge ? 'tx-street tx-bridge' : 'tx-street' }, map); });
    const lab = (x, y, t, rot = 0, cls = 'tx-lab') => { const n = S('text', { x, y, class: cls, transform: rot ? `rotate(${rot} ${x} ${y})` : '' }, map); n.textContent = t; };
    lab(455, 260, 'РЕКА', -78, 'tx-lab river'); lab(132, 196, 'Садовая'); lab(780, 456, 'Лесная'); lab(66, 125, 'Школьная', -90); lab(140, 384, 'Парк', 0, 'tx-lab park');
    /* граф */
    const gl = this.gl = S('g', { class: 'tx-graph' }, svg);
    this.gTree = S('g', {}, gl); const ge = S('g', {}, gl); this.route = S('g', {}, gl); const gw = S('g', {}, gl), gn = S('g', {}, gl);
    this.eEl = E.map(e => { const [x1, y1] = this.P[e.a], [x2, y2] = this.P[e.b]; return S('line', { x1, y1, x2, y2, class: 'tx-e' + (e.jam ? ' jam' : '') }, ge); });
    this.wEl = E.map(e => {
      const [x1, y1] = this.P[e.a], [x2, y2] = this.P[e.b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, g = S('g', { class: 'tx-w' + (e.jam ? ' jam' : ''), transform: `translate(${mx} ${my})` }, gw);
      S('rect', { x: -15, y: -12, width: 30, height: 24, rx: 8 }, g); const t = S('text', {}, g); t.textContent = e.w; return g;
    });
    this.vEl = this.P.map(([x, y], i) => { const c = S('circle', { cx: x, cy: y, r: 11, class: 'tx-v' }, gn); c.dataset.i = i; c.style.setProperty('--d', (x + y) / 900); return c; });
    this.dEl = this.P.map(([x, y]) => { const t = S('text', { x: x + 15, y: y - 16, class: 'tx-d' }, gn); return t; });
    /* такси и точка назначения */
    this.pin = S('g', { class: 'tx-pin' }, svg);
    S('circle', { r: 16, class: 'pulse' }, this.pin); S('path', { d: 'M0 0 C -15 -18 -15 -38 0 -38 C 15 -38 15 -18 0 0 Z' }, this.pin); S('circle', { cx: 0, cy: -25, r: 6, fill: '#fff' }, this.pin);
    this.car = S('g', { class: 'tx-car' }, svg);
    const cb = S('g', {}, this.car);
    S('rect', { x: -23, y: -13, width: 46, height: 26, rx: 8, class: 'body' }, cb); S('rect', { x: 2, y: -10, width: 11, height: 20, rx: 3, class: 'win' }, cb); S('rect', { x: -16, y: -10, width: 9, height: 20, rx: 3, class: 'win' }, cb);
    S('rect', { x: -5, y: -6, width: 6, height: 12, rx: 2, class: 'sign' }, cb); S('circle', { cx: 21, cy: -8, r: 2.4, class: 'lamp' }, cb); S('circle', { cx: 21, cy: 8, r: 2.4, class: 'lamp' }, cb);
    this.cb = cb; this.src = 0; this.dest = tid(3, 5);
    this.putCar(this.P[this.src], 0); this.putPin();
    svg.addEventListener('click', e => { const c = e.target.closest('.tx-v'); if (!c) return; this.pick(+c.dataset.i); });
  },
  leave() { this.T.stop(); },
  putCar([x, y], ang) { this.car.setAttribute('transform', `translate(${x} ${y})`); this.cb.setAttribute('transform', `rotate(${ang})`); },
  putPin() { const [x, y] = this.P[this.dest]; this.pin.setAttribute('transform', `translate(${x} ${y - 4})`); },
  dij(src) {
    const n = this.P.length, D = Array(n).fill(Infinity), prev = Array(n).fill(-1), pe = Array(n).fill(-1), done = Array(n).fill(false), order = [];
    D[src] = 0;
    for (let k = 0; k < n; k++) {
      let u = -1; for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || D[i] < D[u])) u = i;
      if (u < 0 || D[u] === Infinity) break; done[u] = true; order.push(u);
      for (const [v, w, ei] of this.adj[u]) if (D[u] + w < D[v]) { D[v] = D[u] + w; prev[v] = u; pe[v] = ei; }
    }
    return { D, prev, pe, order };
  },
  pathTo(t) { const p = []; for (let v = t; v >= 0; v = this.res.prev[v]) p.unshift(v); return p; },
  clearWave() {
    this.vEl.forEach(c => c.classList.remove('vis', 'path', 'dst')); this.dEl.forEach(t => { t.textContent = ''; t.classList.remove('on'); });
    this.gTree.innerHTML = ''; this.route.innerHTML = '';
  },
  async wave(anim, alive) {
    const r = this.res = this.dij(this.src), t0 = performance.now();
    for (const v of r.order) {
      if (anim) { const due = r.D[v] * 95 - (performance.now() - t0); if (due > 0) await wait(due); if (!alive()) return false; }
      this.vEl[v].classList.add('vis'); const t = this.dEl[v]; t.textContent = r.D[v]; t.classList.add('on');
      if (r.pe[v] >= 0) { const e = this.E[r.pe[v]], [x1, y1] = this.P[e.a], [x2, y2] = this.P[e.b]; S('line', { x1, y1, x2, y2, class: 'tx-sp' + (anim ? ' new' : '') }, this.gTree); }
    }
    return true;
  },
  async drive(anim, alive) {
    this.route.innerHTML = ''; this.vEl.forEach(c => c.classList.remove('path', 'dst'));
    const p = this.pathTo(this.dest), pts = p.map(v => this.P[v]);
    const d = 'M' + pts.map(q => q.join(' ')).join(' L');
    S('path', { d, class: 'tx-glow' }, this.route); const line = S('path', { d, class: 'tx-route' }, this.route);
    const len = line.getTotalLength(); line.style.setProperty('--len', len.toFixed(1));
    p.forEach(v => this.vEl[v].classList.add('path')); this.vEl[this.dest].classList.add('dst');
    const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    if (!anim || pts.length < 2) { const n = pts.length; this.putCar(pts[n - 1], n > 1 ? ang(pts[n - 2], pts[n - 1]) : 0); return; }
    line.classList.add('draw');
    await wait(500); if (!alive()) return;
    const segs = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push([pts[i - 1], pts[i], tot, L]); tot += L; }
    const T = Math.min(3600, 400 + tot * 2.6), t0 = performance.now();
    let curA = ang(pts[0], pts[1]);
    await new Promise(res => {
      const tick = now => {
        if (!alive()) return res();
        const k = Math.min(1, Math.max(0, now - t0) / T), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, at = e * tot;
        const sg = segs.find(q => at <= q[2] + q[3]) || segs[segs.length - 1], u = sg[3] ? (at - sg[2]) / sg[3] : 1;
        const x = sg[0][0] + (sg[1][0] - sg[0][0]) * u, y = sg[0][1] + (sg[1][1] - sg[0][1]) * u, ta = ang(sg[0], sg[1]);
        let da = ((ta - curA + 540) % 360) - 180; curA += da * .25;
        this.putCar([x, y], curA);
        if (k < 1) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
  },
  text(s) {
    const el = this.el, side = $('#txSide', el);
    const m = this.res ? this.res.D[this.dest] : 0;
    const p = this.res ? this.pathTo(this.dest) : [];
    const uses = (a, b) => p.some((v, i) => i && ((p[i - 1] === a && v === b) || (p[i - 1] === b && v === a)));
    const H1 = ['Как такси находит <em>дорогу</em>?', 'Перекрёстки — <em>вершины</em>', 'Улицы — <em>дороги</em> с минутами', 'Ищем от ближних к <em>дальним</em>', `Самый быстрый путь — <em>${m} мин</em>`];
    $('#txHead', el).innerHTML = H1[s];
    if (s === 0) side.innerHTML = card('Задача', 'Ты вызвал такси. Навигатор за секунду строит <b>самый быстрый</b> маршрут. Как он это делает?') + '<p class="small">Подсказка: он не видит ни домов, ни деревьев.</p>';
    if (s === 1) side.innerHTML = card('Перекрёстки', 'Для навигатора каждый перекрёсток — <b>вершина</b> графа. Дома, парк и река ему не нужны.');
    if (s === 2) side.innerHTML = card('Улицы', 'Улица между перекрёстками — <b>дорога</b>. Число на ней — сколько <b>минут</b> ехать.') + card('Пробки', '<span class="jam">Красные</span> дороги — пробки: минут больше, хотя улица та же.');
    if (s === 3) side.innerHTML = card('Волна', 'Компьютер идёт от такси <b>волной</b>: сначала ближние перекрёстки, потом дальше. У каждого пишет лучшее время.') + '<p class="small">Так он точно не пропустит короткий путь. Это алгоритм Дейкстры — его проходят в вузе.</p>';
    if (s >= 4) {
      const via = uses(tid(1, 2), tid(1, 3)) ? 'Едем через северный мост.' : uses(tid(3, 2), tid(3, 3)) ? 'Северный мост стоит в пробке — едем через южный.' : '';
      side.innerHTML = card('Маршрут', `<b>${m} ${plural(m, 'минута', 'минуты', 'минут')}</b> и ${p.length - 1} ${plural(p.length - 1, 'дорога', 'дороги', 'дорог')}. ${via}`, 'dark') + '<p class="small"><b>Кликни любой перекрёсток</b> — такси поедет туда.</p>';
    }
  },
  async pick(i) {
    if (this.s < 3) { toast('Сначала дойдём до поиска пути'); return; }
    if (i === this.src) { toast('Такси уже здесь'); return; }
    const k = this.T.next(), alive = () => this.T.alive(k);
    this.putCar(this.P[this.src], 0); this.dest = i; this.putPin(); this.s = 4; this.svg.classList.add('s4');
    this.text(4); await this.drive(!reduced(), alive);
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), svg = this.svg;
    this.s = s;
    svg.classList.toggle('instant', !anim);
    [1, 2, 3, 4].forEach(n => svg.classList.toggle('s' + n, s >= n));
    this.clearWave(); this.res = this.dij(this.src);
    this.putCar(this.P[this.src], 0); this.putPin();
    this.text(s);
    if (s >= 3) { const ok = await this.wave(anim && s === 3, alive); if (!ok || !alive()) return; }
    if (s >= 4) { this.text(4); await this.drive(anim, alive); }
  }
};

/* ================= лабиринт ================= */
const MZ = { C: 17, R: 9, cs: 46 };
W.maze = {
  init(el) {
    this.T = task(); this.el = el; this.seed = 4; this.s = 0;
    $('#mzNew', el).addEventListener('click', e => { e.currentTarget.blur(); this.seed++; this.build(); this.replay(); });
    this.build();
  },
  leave() { this.T.stop(); },
  build() {
    const { C, R, cs } = MZ, rnd = rng(this.seed * 7919 + 13), n = C * R, svg = $('#mzG', this.el);
    const id = (c, r) => r * C + c;
    const adj = [...Array(n)].map(() => []), seen = Array(n).fill(false), st = [0]; seen[0] = true;
    while (st.length) {
      const v = st[st.length - 1], c = v % C, r = (v / C) | 0;
      const nb = [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]].filter(([x, y]) => x >= 0 && y >= 0 && x < C && y < R && !seen[id(x, y)]);
      if (!nb.length) { st.pop(); continue; }
      const [x, y] = nb[Math.floor(rnd() * nb.length)], u = id(x, y);
      adj[v].push(u); adj[u].push(v); seen[u] = true; st.push(u);
    }
    /* пара лишних проходов — чтобы были циклы, как в настоящем графе */
    for (let t = 0; t < 3; t++) { const c = Math.floor(rnd() * (C - 1)), r = Math.floor(rnd() * R), a = id(c, r), b = id(c + 1, r); if (!adj[a].includes(b)) { adj[a].push(b); adj[b].push(a); } }
    this.adj = adj; this.start = 0; this.exit = n - 1;
    const has = (a, b) => adj[a].includes(b);
    svg.setAttribute('viewBox', `0 0 ${C * cs + 24} ${R * cs + 24}`); svg.innerHTML = '';
    const g = S('g', { transform: 'translate(12 12)' }, svg);
    S('rect', { x: -6, y: -6, width: C * cs + 12, height: R * cs + 12, rx: 14, class: 'mz-bg' }, g);
    const cen = v => [(v % C) * cs + cs / 2, ((v / C) | 0) * cs + cs / 2]; this.cen = cen;
    this.cell = []; this.num = [];
    const gc = S('g', { class: 'mz-cells' }, g), gn = S('g', { class: 'mz-nums' }, g);
    for (let v = 0; v < n; v++) {
      const x = (v % C) * cs, y = ((v / C) | 0) * cs; const rc = S('rect', { x: x + 1, y: y + 1, width: cs - 2, height: cs - 2, rx: 6, class: 'mz-c' }, gc); rc.dataset.v = v; this.cell.push(rc);
      const t = S('text', { x: x + cs / 2, y: y + cs / 2 + 1, class: 'mz-n' }, gn); this.num.push(t);
    }
    const ge = S('g', { class: 'mz-e' }, g);
    for (let v = 0; v < n; v++) for (const u of adj[v]) if (u > v) { const [x1, y1] = cen(v), [x2, y2] = cen(u); S('line', { x1, y1, x2, y2 }, ge); }
    const gv = S('g', { class: 'mz-v' }, g); for (let v = 0; v < n; v++) { const [x, y] = cen(v); S('circle', { cx: x, cy: y, r: 4.5 }, gv); }
    let d = '';
    for (let v = 0; v < n; v++) {
      const c = v % C, r = (v / C) | 0, x = c * cs, y = r * cs;
      if (r === 0) d += `M${x} ${y}h${cs}`; if (c === 0) d += `M${x} ${y}v${cs}`;
      if (c === C - 1 || !has(v, v + 1)) d += `M${x + cs} ${y}v${cs}`;
      if (r === R - 1 || !has(v, v + C)) d += `M${x} ${y + cs}h${cs}`;
    }
    S('path', { d, class: 'mz-w' }, g);
    this.routeG = S('g', {}, g);
    this.flag = S('g', { class: 'mz-flag' }, g); S('line', { x1: -6, y1: 14, x2: -6, y2: -16 }, this.flag); S('path', { d: 'M-6 -16 L14 -9 L-6 -2 Z' }, this.flag);
    this.runner = S('g', { class: 'mz-run' }, g); S('circle', { r: 14 }, this.runner); S('circle', { cx: -5, cy: -3, r: 3, class: 'eye' }, this.runner); S('circle', { cx: 5, cy: -3, r: 3, class: 'eye' }, this.runner); S('path', { d: 'M-5 5 Q0 9 5 5', class: 'smile' }, this.runner);
    /* волна BFS */
    const D = Array(n).fill(-1), prev = Array(n).fill(-1), q = [0]; D[0] = 0;
    while (q.length) { const v = q.shift(); for (const u of adj[v]) if (D[u] < 0) { D[u] = D[v] + 1; prev[u] = v; q.push(u); } }
    this.D = D; this.prev = prev; const mx = Math.max(...D); this.maxD = mx;
    const mix = (a, b, t) => Math.round(a + (b - a) * t);
    this.cell.forEach((rc, v) => { const t = D[v] / mx; rc.style.fill = `rgb(${mix(255, 236, t)},${mix(236, 150, t)},${mix(222, 96, t)})`; rc.style.setProperty('--d', D[v]); this.num[v].textContent = D[v]; this.num[v].style.setProperty('--d', D[v]); });
    svg.onclick = e => { const c = e.target.closest('.mz-c'); if (!c) return; this.setExit(+c.dataset.v); };
    this.putRunner(cen(0)); this.putFlag();
  },
  putRunner([x, y]) { this.runner.setAttribute('transform', `translate(${x} ${y})`); },
  putFlag() { const [x, y] = this.cen(this.exit); this.flag.setAttribute('transform', `translate(${x + 4} ${y})`); },
  path() { const p = []; for (let v = this.exit; v >= 0; v = this.prev[v]) p.unshift(v); return p; },
  async run(anim, alive) {
    this.routeG.innerHTML = ''; const p = this.path(), pts = p.map(this.cen);
    const d = 'M' + pts.map(q => q.join(' ')).join(' L'); const cs = S('path', { d, class: 'mz-case' }, this.routeG), line = S('path', { d, class: 'mz-route' }, this.routeG);
    cs.style.setProperty('--len', cs.getTotalLength().toFixed(1)); if (anim) cs.classList.add('draw');
    line.style.setProperty('--len', line.getTotalLength().toFixed(1));
    $('#mzHead', this.el).innerHTML = `Кратчайший путь: <em>${p.length - 1} ${plural(p.length - 1, 'шаг', 'шага', 'шагов')}</em>`;
    if (!anim) { this.putRunner(pts[pts.length - 1]); return; }
    line.classList.add('draw'); this.putRunner(pts[0]);
    const T = Math.min(4200, 260 + p.length * 70), t0 = performance.now();
    await new Promise(res => {
      const tick = now => {
        if (!alive()) return res();
        const k = Math.min(1, Math.max(0, now - t0) / T), f = k * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), u = f - i;
        this.putRunner([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u]);
        if (k < 1) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
    if (alive()) confetti(40);
  },
  async setExit(v) {
    if (this.s < 2) { toast('Сначала пустим волну'); return; }
    if (v === this.start) return;
    const k = this.T.next(), alive = () => this.T.alive(k);
    this.exit = v; this.putFlag(); this.s = 3; this.svg().classList.add('s3'); this.text(3);
    await this.run(!reduced(), alive);
  },
  svg() { return $('#mzG', this.el); },
  async replay() {
    const s = this.s, k = this.T.next(), alive = () => this.T.alive(k), svg = this.svg();
    this.text(s);
    svg.classList.add('instant'); svg.classList.remove('s2', 's3'); svg.classList.toggle('s1', s >= 1);
    void svg.getBBox(); svg.classList.remove('instant');
    if (s < 2) return;
    await wait(30); if (!alive()) return;
    svg.classList.add('s2');
    if (s >= 3) { svg.classList.add('s3'); await wait(reduced() ? 0 : Math.min(3200, this.maxD * 26 + 400)); if (!alive()) return; await this.run(!reduced(), alive); }
  },
  text(s) {
    const side = $('#mzSide', this.el);
    const H1 = ['Лабиринт — это тоже <em>граф</em>', 'Клетка — вершина, проход — <em>ребро</em>', 'Пускаем <em>волну</em>'];
    if (s < 3) $('#mzHead', this.el).innerHTML = H1[s];
    if (s === 0) side.innerHTML = card('Задача', 'Колобку нужно к флажку. Как найти <b>самый короткий</b> путь и не блуждать?') + '<p class="small">Бегать наугад — долго. А если посмотреть на лабиринт как на граф?</p>';
    if (s === 1) side.innerHTML = card('Граф', 'Каждая клетка — <b>вершина</b>. Если между соседними клетками нет стены — между ними <b>ребро</b>.') + '<p class="small">Стены больше не нужны: всё, что важно, — кто с кем соединён.</p>';
    if (s === 2) side.innerHTML = card('Волна', 'Из старта заливаем клетки по очереди: соседи — <b>1 шаг</b>, их соседи — <b>2 шага</b>… Как вода, которая растекается по коридорам.') + '<p class="small">Число в клетке — за сколько шагов до неё можно дойти.</p>';
    if (s >= 3) side.innerHTML = card('Путь', 'Волна дошла до флажка. Идём от него назад: каждый раз в клетку, где число <b>на 1 меньше</b>.', 'dark') + '<p class="small">Так ходят персонажи в играх и роботы-пылесосы. <b>Кликни любую клетку</b> — перенесу флажок.</p>';
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), svg = this.svg();
    this.s = s;
    svg.classList.toggle('instant', !anim);
    [1, 2, 3].forEach(n => svg.classList.toggle('s' + n, s >= n));
    this.routeG.innerHTML = ''; this.putRunner(this.cen(this.start));
    this.text(s);
    if (s >= 3) {
      if (anim) { await wait(200); if (!alive()) return; }
      await this.run(anim, alive);
    }
  }
};

/* ================= степень вершины ================= */
const DN = { А: [80, 230], Б: [260, 80], В: [210, 420], Г: [480, 280], Д: [570, 80] };
const DN2 = { А: [560, 410], Б: [330, 250], В: [560, 110], Г: [110, 110], Д: [110, 400] };
const DE = [['А', 'Б'], ['Б', 'В'], ['Б', 'Г'], ['Б', 'Д'], ['В', 'Г'], ['Г', 'Д']];
const DL = Object.keys(DN);
W.degree = {
  init(el) {
    this.T = task(); this.el = el;
    this.gv = new GraphView($('#dgG', el), { pos: DN, nodes: DN, edges: DE, W: 660, H: 480, R: 34 });
    this.gv.allN('click');
    this.gv.svg.addEventListener('click', e => { const n = e.target.closest('.gx-n'); if (n) this.count(n.dataset.v); });
  },
  leave() { this.T.stop(); },
  async count(v) {
    const k = this.T.next(), alive = () => this.T.alive(k), gv = this.gv;
    gv.clear('hl'); gv.cls(v, 'hl'); const nb = gv.nbrs(v);
    for (let i = 0; i < nb.length; i++) { await wait(reduced() ? 0 : 260); if (!alive()) return; gv.ecls(v, nb[i], 'hl'); gv.badge(v, i + 1, 'uni', true); }
    toast(`${gv.lab[v].textContent === '?' ? 'У этой вершины' : 'У ' + v} — ${nb.length} ${plural(nb.length, 'дорога', 'дороги', 'дорог')}`);
  },
  async step(el, s, o) {
    const k = this.T.next(), alive = () => this.T.alive(k), anim = animOf(o), gv = this.gv, side = $('#dgSide', el);
    if (s < 4) { Object.assign(gv.pos, DN); gv.place(); }
    gv.reset(); DL.forEach(v => gv.setLabel(v, v));
    const head = h => { $('#dgHead', el).innerHTML = h; };
    if (s === 0) {
      head('Степень <em>вершины</em>');
      side.innerHTML = card('Определение', 'Степень вершины — это <b>сколько дорог</b> из неё выходит.') + card('Как в жизни', 'Сколько у тебя друзей в графе соцсети — такая у тебя и степень. У Дмитрия два друга → степень <b>2</b>.') + '<p class="small">Кликни любую вершину — посчитаю её дороги.</p>';
      return;
    }
    if (s === 1) {
      head('Считаем у <em>Б</em>'); gv.cls('Б', 'hl');
      side.innerHTML = card('Вершина Б', 'Идём по кругу и считаем дороги, которые выходят из Б:') + '<div class="dg-count" id="dgCnt">0</div>';
      const nb = gv.nbrs('Б'), cnt = $('#dgCnt', side);
      if (anim) { for (let i = 0; i < nb.length; i++) { await wait(450); if (!alive()) return; gv.ecls('Б', nb[i], 'hl'); cnt.textContent = i + 1; gv.badge('Б', i + 1, 'uni', true); } await wait(300); if (!alive()) return; }
      nb.forEach(u => gv.ecls('Б', u, 'hl')); cnt.textContent = nb.length; gv.badge('Б', 4, 'uni');
      side.insertAdjacentHTML('beforeend', '<p class="small">Четыре дороги — <b>степень 4</b>.</p>');
      return;
    }
    if (s === 2) {
      head('Степени <em>всех вершин</em>');
      side.innerHTML = card('Итого', '<span class="eq">А — 1 · Б — 4 · В — 2<br>Г — 3 · Д — 2</span>') + '<p class="small">Самая «популярная» вершина — Б. Самая одинокая — А: у неё одна дорога.</p>';
      if (anim) for (const v of DL) { if (!alive()) return; gv.badge(v, gv.deg(v), '', true); await wait(220); }
      DL.forEach(v => gv.badge(v, gv.deg(v)));
      return;
    }
    DL.forEach(v => gv.badge(v, gv.deg(v)));
    if (s === 3) {
      head('Проверка: <em>× 2</em>');
      side.innerHTML = card('У дороги два конца', 'Каждая дорога касается <b>двух</b> вершин — значит, в степенях её посчитали дважды.<span class="eq">1 + 4 + 2 + 3 + 2 = 12</span><span class="eq">12 = 2 × 6 дорог</span>') + '<div class="dg-count" id="dgEnds">0</div><p class="small">концов у дорог. Не сходится — где-то ошибся в подсчёте.</p>';
      const ends = []; DE.forEach(([a, b]) => { const p = gv.pos[a], q = gv.pos[b], L = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / L, uy = (q[1] - p[1]) / L, off = 34 + 12; ends.push([p[0] + ux * off, p[1] + uy * off], [q[0] - ux * off, q[1] - uy * off]); });
      const cnt = $('#dgEnds', side);
      for (let i = 0; i < ends.length; i++) {
        if (anim) { await wait(150); if (!alive()) return; }
        S('circle', { cx: ends[i][0], cy: ends[i][1], r: 7, class: 'gx-end' + (anim ? ' pop' : '') }, gv.L.x); cnt.textContent = i + 1;
      }
      gv.allE('hl');
      return;
    }
    head('Подписи стёрли — <em>степени остались</em>');
    DL.forEach(v => gv.setLabel(v, '?'));
    const uq = uniqSet(DL.map(v => gv.deg(v)));
    side.innerHTML = card('Ключ к №1', 'Можно стереть подписи, можно перерисовать граф — а <b>число дорог</b> у вершины не изменится. По степеням и будем сопоставлять рисунок с таблицей.', 'dark') +
      '<p class="small">Степени 1, 3 и 4 встречаются по разу — такие вершины узнаются сразу.</p>';
    if (anim) { await wait(500); if (!alive()) return; await gv.morph(DN2, 1300, alive); if (!alive()) return; } else { Object.assign(gv.pos, DN2); gv.place(); }
    DL.forEach(v => { const d = gv.deg(v); gv.badge(v, d, uq(d) ? 'uni' : '', anim); });
  }
};
})();
