'use strict';
(() => {
  const refresh = () => {
    let progress = {};
    try { progress = JSON.parse(localStorage.getItem('soft-lesson7-progress-v1') || '{}') || {}; } catch {}
    const sound = progress['2'];
    if (sound?.layout === 'sound-original-v1') {
      if (sound.slide === 9) sound.step = 0;
      if (sound.slide > 9) sound.slide--;
      sound.layout = 'sound-v2';
      try { localStorage.setItem('soft-lesson7-progress-v1', JSON.stringify(progress)); } catch {}
    }
    document.querySelectorAll('.part-card').forEach(card => {
      const link = card.querySelector('.part-open');
      const start = card.querySelector('.part-start');
      const part = card.dataset.part;
      const saved = progress[part];
      const valid = saved && (part !== '2' || saved.layout === 'sound-v2') && Number.isInteger(saved.slide) && saved.slide >= 1 &&
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
