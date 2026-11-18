'use strict';
(() => {
  const part = document.documentElement.dataset.lessonPart;
  const slide = document.querySelector('#slide');
  if (!['1', '2', '3'].includes(part) || !slide) return;
  const key = 'soft-lesson7-progress-v1';
  const read = () => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch { return {}; }
  };
  const saved = read()[part];
  if (new URLSearchParams(location.search).get('resume') === '1' && saved &&
      Number.isInteger(saved.slide) && saved.slide === current &&
      Number.isInteger(saved.step) && saved.step >= 0) {
    buildStep = Math.min(saved.step, slides[current - 1].steps || 0);
    if (typeof updateBuild === 'function') updateBuild();
    else update();
  }
  const remember = () => {
    if (!Number.isInteger(current) || current < 1 || current > slides.length) return;
    const data = read();
    data[part] = {slide: current, step: Number(slide.dataset.step) || 0};
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  };
  new MutationObserver(remember).observe(slide, {attributes: true, attributeFilter: ['data-step']});
  addEventListener('pagehide', remember);
  remember();
})();
