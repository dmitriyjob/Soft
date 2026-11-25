(() => {
  const toggle = document.getElementById('practicePanelToggle');
  const sidebar = document.getElementById('sidebar');
  toggle.addEventListener('click', () => {
    const on = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(on));
    sidebar.hidden = !on;
    document.body.classList.toggle('practice-panel-hidden', !on);
    dispatchEvent(new Event('resize'));
  });
})();
