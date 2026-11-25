(() => {
  const full = document.getElementById('practiceFull');
  full.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
      else await document.documentElement.requestFullscreen?.();
    } catch {}
  });
  document.addEventListener('fullscreenchange', () => {
    const on = !!document.fullscreenElement;
    full.setAttribute('aria-pressed', String(on));
    full.setAttribute('aria-label', on ? 'Выйти из полного экрана' : 'Полный экран');
  });
  const loader = document.getElementById('practiceLoader');
  const stage = document.getElementById('stage');
  const retry = document.getElementById('practiceRetry');
  const files = ['data.js', 'voice/voice.js', 'trainer_voice.js', 'trainer.js', 'trainer_guide.js', 'trainer_intro.js', 'trainer-ui.js'];
  retry.addEventListener('click', () => location.reload());
  function asset(url, css = false) {
    return new Promise((resolve, reject) => {
      const el = document.createElement(css ? 'link' : 'script');
      const timer = setTimeout(() => reject(new Error('Loading timed out: ' + url)), 30000);
      el.onload = () => { clearTimeout(timer); resolve(); };
      el.onerror = () => { clearTimeout(timer); reject(new Error('Unable to load: ' + url)); };
      if (css) { el.rel = 'stylesheet'; el.href = url; }
      else { el.src = url; el.async = false; }
      document.head.append(el);
    });
  }
  const frame = () => new Promise(requestAnimationFrame);
  async function start() {
    try {
      // Give the loading view a paint before parsing the workbook and building the grid.
      await frame(); await frame();
      await Promise.all([asset('trainer.css', true), asset('trainer-ui.css', true)]);
      for (const src of files) await asset(src);
      if (!window.TR || !window.TG || !window.TI) throw new Error('Practice did not initialize');
      window.TG.ready();
      await frame();
      stage.inert = false; stage.setAttribute('aria-busy', 'false');
      document.body.classList.remove('practice-loading');
      loader.hidden = true;
    } catch (error) {
      console.error(error);
      loader.classList.add('failed');
      document.getElementById('practiceLoadTitle').textContent = 'Не удалось загрузить практикум';
      retry.hidden = false;
    }
  }
  start();
})();
