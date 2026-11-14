/* ion_inf · движок интерактивной презентации (урок №10) */
(() => {
'use strict';
const CFG = window.DECK || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app'), deck = $('#deck');
const slides = $$('.slide', deck);
const N = slides.length;
const SECTIONS = CFG.sections, KEY = CFG.key, P = CFG.prefix, W = CFG.widgets || {};
const pad = n => String(n).padStart(2, '0');
const toast = msg => window.DP ? DP.toast(msg) : null;
let SCALE = 1;

/* ---------------- scaling ---------------- */
let notesOpen = false, dockHidden = false;
const dock = $('.viewer-dock'), dockRestore = $('#dockRestore');
const DOCK_KEY = 'soft10_dock_hidden';
try { dockHidden = localStorage.getItem(DOCK_KEY) === '1'; } catch {}
const NOTES_W = () => Math.min(480, Math.max(380, innerWidth * 0.3));
const notesDock = () => innerWidth >= 1100;
function fit() {
  const nw = notesOpen && notesDock() ? NOTES_W() : 0, aw = innerWidth - nw;
  const dockHeight = dockHidden ? 0 : dock.getBoundingClientRect().height;
  const ah = Math.max(1, innerHeight - dockHeight);
  document.documentElement.style.setProperty('--dock-height', dockHeight + 'px');
  SCALE = Math.min(aw / 1600, ah / 900);
  app.style.top = (ah / 2) + 'px';
  app.style.left = (aw / 2) + 'px';
  app.style.transform = `translate(-50%,-50%) scale(${SCALE})`;
  document.documentElement.style.setProperty('--nw', NOTES_W() + 'px');
}
addEventListener('resize', fit);
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(dock);
fit();

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
  if (enter && i !== cur && inited.has(cur)) { const old = slides[cur], widget = W[old.dataset.w]; if (widget && widget.leave) widget.leave(old); }
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
$$('button', tabs).forEach(b => b.addEventListener('click', e => { e.currentTarget.blur(); setMenu(false); show(slides.findIndex(s => s.dataset.sec === b.dataset.sec), 0, 1); }));

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
function toggleOv(id) { setMenu(false); const o = $('#' + id), on = !o.classList.contains('open'); closeOv(); o.classList.toggle('open', on); }
function closeOv() { $$('.ov').forEach(o => o.classList.remove('open')); }
$$('.ov').forEach(o => o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-close]')) closeOv(); }));
$('#bToc').addEventListener('click', e => { e.currentTarget.blur(); toggleOv('ovToc'); });
$('#bHelp').addEventListener('click', e => { e.currentTarget.blur(); toggleOv('ovHelp'); });
async function fullscreen() { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.(); else await document.exitFullscreen?.(); } catch {} }
addEventListener('fullscreenchange', () => { $('#bFull').setAttribute('aria-pressed', String(!!document.fullscreenElement)); fit(); });
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

/* Controls open only on click, never on hover. */
const BC = document.body.classList;
function syncDock() {
  BC.toggle('dock-hidden', dockHidden);
  dock.setAttribute('aria-hidden', String(dockHidden));
  dock.inert = dockHidden;
  if (dockRestore) {
    dockRestore.hidden = !dockHidden;
    dockRestore.setAttribute('aria-expanded', String(!dockHidden));
  }
  fit();
}
function setDockHidden(on, focus = true) {
  dockHidden = on;
  if (on) { setMenu(false); setNotes(false); closeOv(); }
  syncDock();
  try { localStorage.setItem(DOCK_KEY, on ? '1' : '0'); } catch {}
  if (focus) (on ? dockRestore : $('#bHideDock'))?.focus({ preventScroll: true });
}
$('#bHideDock')?.addEventListener('click', () => setDockHidden(true));
dockRestore?.addEventListener('click', () => setDockHidden(false));
function setMenu(on) {
  if (on && dockHidden) setDockHidden(false, false);
  BC.toggle('showtop', on);
  $('#hTop').setAttribute('aria-expanded', String(on));
  $('#lessonMenu').setAttribute('aria-hidden', String(!on));
  $('#lessonMenu').inert = !on;
  if (on) { setNotes(false); $('#menuClose').focus({preventScroll:true}); }
}
$('#hTop').addEventListener('click', () => setMenu(!BC.contains('showtop')));
$('#menuClose').addEventListener('click', () => { setMenu(false); $('#hTop').focus(); });
document.addEventListener('click', e => {
  if (BC.contains('showtop') && !e.target.closest('#lessonMenu,#hTop')) setMenu(false);
});

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
  if (on && dockHidden) setDockHidden(false, false);
  notesOpen = on; BC.toggle('notes-open', on);
  $('#nTab').setAttribute('aria-expanded', String(on));
  $('#notes').setAttribute('aria-hidden', String(!on)); $('#notes').inert = !on;
  if (on) setMenu(false);
  fit(); renderNotes();
  try { localStorage.setItem(P + '_notes', on ? '1' : '0'); } catch (e) {}
}
$('#nTab').addEventListener('click', e => { e.currentTarget.blur(); setNotes(!notesOpen); });
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
  if (k === 'Escape') { if (BC.contains('showtop')) { setMenu(false); $('#hTop').focus(); return; } if (notesOpen) { setNotes(false); $('#nTab').focus(); return; } if ($('.ask.open')) { closeAsks(); return; } if (ovOpen()) closeOv(); else if (drawOn) setDraw(false); else if (laserOn) setLaser(false); else if (spot.classList.contains('on')) spot.classList.remove('on'); else if (!$('#blank').classList.contains('on') && dockHidden) setDockHidden(false); $('#blank').classList.remove('on'); return; }
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
  const sc = e.target.closest('.scrollable, .nowheel');
  if (sc && sc.scrollHeight > sc.clientHeight) return;
  e.preventDefault();
  const now = Date.now(); if (now - wheelT < 700) return;
  wheelAcc += e.deltaY;
  if (Math.abs(wheelAcc) > 40) { wheelAcc > 0 ? next() : prev(); wheelAcc = 0; wheelT = now; }
}, { passive: false });
let tx = null;
deck.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
deck.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 60) dx < 0 ? next() : prev(); tx = null; });

/* Shared slide links also work inside an already-open part. */
addEventListener('hashchange', () => {
 const target = location.hash.match(/^#(\d+)(?:\.(\d+))?$/);
 if(target) { setMenu(false); show(+target[1]-1, +(target[2]||0)); }
});
/* start */
syncDock();
try { if (!dockHidden && localStorage.getItem(P + '_notes') === '1' && notesDock()) { setNotes(true); } } catch (e) {}
const m = location.hash.match(/^#(\d+)(?:\.(\d+))?/);
show(m ? +m[1] - 1 : 0, m && m[2] ? +m[2] : 0, 1);
requestAnimationFrame(() => requestAnimationFrame(() => BC.add('ready')));
window.__deck = { show, next, prev, setNotes, get cur() { return cur; }, get step() { return step; }, N };
})();

