'use strict';
(() => {
  const refresh = () => {
    let progress = {};
    try { progress = JSON.parse(localStorage.getItem('soft-lesson7-progress-v1') || '{}') || {}; } catch {}
    document.querySelectorAll('.part-card').forEach(card => {
      const link = card.querySelector('.part-open');
      const start = card.querySelector('.part-start');
      const part = card.dataset.part;
      const saved = progress[part];
      const valid = saved && Number.isInteger(saved.slide) && saved.slide >= 1 &&
        saved.slide <= Number(link.dataset.max) && Number.isInteger(saved.step) && saved.step >= 0;
      const action = valid ? 'Продолжить' : 'Смотреть';
      link.textContent = `${action} часть ${part}`;
      link.href = `${link.dataset.start}${valid ? '?resume=1#'+saved.slide : '#1'}`;
      link.setAttribute('aria-label', `${action} часть ${part} — ${card.querySelector('h2').textContent}`);
      start.hidden = !valid;
    });
  };
  refresh();
  addEventListener('pageshow', refresh);
  addEventListener('storage', refresh);
})();
