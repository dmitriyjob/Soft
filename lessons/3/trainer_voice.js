/* Озвучка: короткая очередь предзагрузки, один аудиоконтекст, отмена и единые часы субтитров. */
window.VO = (() => {
  'use strict';
  const KEY = 'ion3_voice', VERSION = 'audio-sync-20261101';
  const st = { vol: 0.85, muted: false };
  try { Object.assign(st, JSON.parse(localStorage.getItem(KEY)) || {}); } catch {}
  st.vol = Number.isFinite(+st.vol) ? Math.max(0, Math.min(1, +st.vol)) : 0.85;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };
  const plain = s => String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  const id = s => { const t = plain(s); let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) >>> 0; return h.toString(36); };
  const has = s => !!(window.VOICE_FILES && window.VOICE_FILES[id(s)]);
  const readSec = s => Math.max(1.4, plain(s).length / 17);
  const listeners = new Set(), cache = new Map();
  let ctx = null, gain = null, active = null, state = 'idle', queue = [], warming = 0;
  const notify = next => { state = next; listeners.forEach(f => f()); };
  const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

  function context() {
    if (ctx) return ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx(); gain = ctx.createGain(); gain.connect(ctx.destination);
    gain.gain.value = st.muted ? 0 : st.vol;
    ctx.onstatechange = () => {
      if (!active || active.ended) return;
      if (ctx.state === 'running') start(active);
      else notify('blocked');
    };
    return ctx;
  }
  function unlock() {
    try {
      const c = context(); if (!c) return;
      if (c.state !== 'running') c.resume().then(() => { if (active) start(active); }).catch(() => { if (active) notify('blocked'); });
      else if (active) start(active);
    } catch { if (active) notify('error'); }
  }
  // Resume inside a real gesture, before asynchronous loading or slide animation.
  document.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  document.addEventListener('keydown', unlock, { capture: true });
  document.addEventListener('click', unlock, { capture: true, passive: true });

  function trim() {
    let bytes = [...cache.values()].reduce((n, e) => n + (e.buffer ? e.buffer.length * e.buffer.numberOfChannels * 4 : e.bytes?.byteLength || 0), 0);
    for (const [key, e] of cache) {
      if (cache.size <= 12 && bytes <= 24 * 1024 * 1024) break;
      if (!e.ready || active?.key === key) continue;
      bytes -= e.buffer ? e.buffer.length * e.buffer.numberOfChannels * 4 : e.bytes?.byteLength || 0;
      cache.delete(key);
    }
  }
  function asset(key) {
    if (cache.has(key)) { const e = cache.get(key); cache.delete(key); cache.set(key, e); return e; }
    const e = { controller: new AbortController(), ready: false, bytes: null, buffer: null, decoding: null };
    cache.set(key, e);
    const timer = setTimeout(() => e.controller.abort(), 10000);
    e.promise = fetch(`voice/${key}.mp3?v=${VERSION}`, { signal: e.controller.signal }).then(r => {
      if (!r.ok) throw Error(`Audio ${r.status}`);
      return r.arrayBuffer();
    }).then(bytes => { e.bytes = bytes; e.ready = true; trim(); return e; }).catch(error => {
      if (cache.get(key) === e) cache.delete(key);
      throw error;
    }).finally(() => clearTimeout(timer));
    // Speculative requests may be abandoned; their errors must not escape.
    e.promise.catch(() => {});
    return e;
  }
  async function decoded(e) {
    await e.promise;
    if (e.buffer) return e.buffer;
    const c = context(); if (!c) throw Error('Audio unavailable');
    if (!e.decoding) e.decoding = c.decodeAudioData(e.bytes.slice(0)).then(b => { e.buffer = b; e.bytes = null; trim(); return b; });
    return e.decoding;
  }
  function pump() {
    while (warming < 2 && queue.length) {
      const key = queue.shift(); warming++;
      const e = asset(key);
      (ctx ? decoded(e) : e.promise).catch(() => {}).finally(() => { warming--; pump(); });
    }
  }
  function preload(texts) {
    queue = [...new Set(texts.filter(t => t && has(t)).map(id))].filter(key => key !== active?.key).slice(0, 3);
    pump();
  }

  function finish(p, ok, next = ok ? 'idle' : 'error') {
    if (p.ended) return;
    p.ended = true;
    p.started.resolve(false); p.duration.resolve(p.buffer?.duration || p.seconds); p.done.resolve(ok);
    p.ticks.forEach(cancelAnimationFrame); p.ticks.clear();
    if (p.source) { p.source.onended = null; try { p.source.stop(); } catch {} p.source.disconnect(); }
    if (active === p) notify(next);
  }
  function stop() {
    const p = active; active = null;
    if (p) {
      if (p.asset && !p.asset.ready) { if (cache.get(p.key) === p.asset) cache.delete(p.key); p.asset.controller.abort(); }
      finish(p, false, 'idle');
    }
    notify('idle');
  }
  function start(p) {
    if (p !== active || p.ended || !p.buffer) return;
    if (!ctx || ctx.state !== 'running') { notify('blocked'); return; }
    if (!p.source) {
      const source = ctx.createBufferSource(); source.buffer = p.buffer; source.connect(gain);
      p.source = source; p.atTime = ctx.currentTime;
      source.onended = () => finish(p, true);
      try { source.start(); } catch { finish(p, false); return; }
      p.duration.resolve(p.buffer.duration); p.started.resolve(true);
    }
    notify('playing');
  }
  function play(text) {
    stop();
    const seconds = readSec(text || '');
    if (!text || !has(text)) return { audio: false, dur: Promise.resolve(seconds), started: Promise.resolve(false), done: null };
    const p = { key: id(text), seconds, source: null, buffer: null, asset: null, ended: false,
      atTime: 0, started: deferred(), duration: deferred(), done: deferred(), ticks: new Set() };
    active = p; notify('loading');
    const clock = () => p.source ? Math.min(p.buffer.duration, Math.max(0, ctx.currentTime - p.atTime)) : 0;
    const at = (seconds, fn) => {
      const tick = () => { p.ticks.delete(raf); if (p.ended || active !== p) return;
        if (clock() >= seconds) fn(); else { raf = requestAnimationFrame(tick); p.ticks.add(raf); }
      };
      let raf = requestAnimationFrame(tick); p.ticks.add(raf);
    };
    unlock();
    (async () => {
      for (let attempt = 0; attempt < 2 && active === p && !p.ended; attempt++) {
        try {
          p.asset = asset(p.key); p.buffer = await decoded(p.asset);
          if (active === p && !p.ended) start(p);
          return;
        } catch {
          if (active !== p || p.ended) return;
          if (cache.get(p.key) === p.asset) cache.delete(p.key);
          if (attempt === 1) finish(p, false);
        }
      }
    })();
    return { audio: true, started: p.started.promise, dur: p.duration.promise, done: p.done.promise, clock, at };
  }

  function type(el, html, durMs, clock) {
    el.innerHTML = html;
    const nodes = [], walk = n => { n.childNodes.forEach(c => { if (c.nodeType === 3) nodes.push([c, c.textContent]); else walk(c); }); };
    walk(el);
    const total = nodes.reduce((a, n) => a + n[1].length, 0);
    nodes.forEach(n => { n[0].textContent = ''; }); el.classList.add('typing');
    let raf = 0, t0 = performance.now(), fin = false;
    const draw = k => { let left = Math.round(total * k); nodes.forEach(([n, s]) => { const take = Math.max(0, Math.min(s.length, left)); n.textContent = s.slice(0, take); left -= take; }); };
    const step = t => { if (fin) return; const elapsed = clock ? clock() * 1000 : t - t0;
      const k = Math.min(1, elapsed / Math.max(300, durMs)); draw(k); if (k < 1) raf = requestAnimationFrame(step); else finish(); };
    function finish() { if (fin) return; fin = true; cancelAnimationFrame(raf); draw(1); el.classList.remove('typing'); }
    raf = requestAnimationFrame(step); return { finish };
  }

  function apply() { if (gain) gain.gain.value = st.muted ? 0 : st.vol; save(); listeners.forEach(f => f()); }
  function setVol(v) { st.vol = Math.max(0, Math.min(1, v)); st.muted = st.vol === 0; apply(); }
  function toggleMute() { st.muted = !st.muted; if (!st.muted && st.vol === 0) st.vol = 0.6; apply(); }
  window.addEventListener('pagehide', stop);
  const ICON = (on, lvl) => `<svg viewBox="0 0 24 24"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor"/>${on ? (lvl > 0.5 ? '<path d="M15.2 8.6a5 5 0 0 1 0 6.8M17.8 6.2a8.5 8.5 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' : '<path d="M15.2 8.6a5 5 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>') : '<path d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'}</svg>`;
  function mount(box) {
    if (!box || box._vo) return; box._vo = true;
    box.classList.add('vo');
    box.innerHTML = `<button class="vo-b" title="Громкость диктора"></button><div class="vo-pop"><button class="vo-m"></button><input type="range" min="0" max="100" step="1"><span class="vo-v"></span></div>`;
    const b = box.querySelector('.vo-b'), pop = box.querySelector('.vo-pop'), r = box.querySelector('input'), m = box.querySelector('.vo-m'), v = box.querySelector('.vo-v');
    const upd = () => { const on = !st.muted && st.vol > 0; box.dataset.state = state; b.title = state === 'blocked' ? 'Включить звук' : state === 'loading' ? 'Загрузка озвучки' : 'Громкость диктора'; b.setAttribute('aria-label', b.title); b.innerHTML = ICON(on, st.vol); m.innerHTML = ICON(on, st.vol); r.value = Math.round((st.muted ? 0 : st.vol) * 100); v.textContent = (st.muted ? 0 : Math.round(st.vol * 100)) + '%'; r.style.setProperty('--p', r.value + '%'); box.classList.toggle('muted', !on); };
    r.setAttribute('aria-label', 'Громкость диктора'); m.setAttribute('aria-label', 'Выключить или включить звук'); listeners.add(upd); upd();
    b.addEventListener('click', e => { e.stopPropagation(); if (state === 'blocked') { unlock(); return; } box.classList.toggle('open'); });
    m.addEventListener('click', e => { e.stopPropagation(); toggleMute(); });
    r.addEventListener('input', () => setVol(r.value / 100));
    pop.addEventListener('mousedown', e => e.stopPropagation());
    document.addEventListener('mousedown', e => { if (!box.contains(e.target)) box.classList.remove('open'); });
  }
  return { play, stop, preload, unlock, type, id, has, plain, readSec, mount, setVol, toggleMute, get vol() { return st.vol; }, get muted() { return st.muted; } };
})();
