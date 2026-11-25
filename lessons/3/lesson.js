(() => {
  // Preserve links shared before the lesson received its own start page.
  function openSharedSlide() {
    if (/^#\d+(?:\.\d+)?$/.test(location.hash)) {
      location.replace('presentation.html' + location.hash);
    }
  }
  addEventListener('hashchange', openSharedSlide);
  openSharedSlide();
  function restore() {
    const link = document.querySelector('[data-presentation]');
    const restart = document.querySelector('[data-restart]');
    link.href = 'presentation.html'; restart.hidden = true;
    const preview = document.querySelector('[data-preview]');
    if (preview) preview.href = link.href;
    try {
      const p = JSON.parse(localStorage.getItem('ion:interactive:3:v3') || 'null');
      if (!p || !Number.isInteger(p.slide) || p.slide < 1 || p.slide > 32 || !Number.isInteger(p.step) || p.step < 0 || p.step > 20 || (p.slide === 1 && !p.step)) return;
      link.href = `presentation.html#${p.slide}${p.step ? '.' + p.step : ''}`;
      restart.hidden = false;
      if (preview) preview.href = link.href;
    } catch {}
  }
  addEventListener('pageshow', restore); restore();
})();
