import { prepareMachine } from './machine.js';

const stage = document.querySelector('#stage');
const sections = [...stage.querySelectorAll('section[data-page]')];
const chapters = [
  { first: 1, title: 'Знакомство' },
  { first: 8, title: 'Экзамен' },
  { first: 18, title: 'Машина Тьюринга' },
  { first: 48, title: 'Подготовка' },
  { first: 55, title: 'Занятия' },
  { first: 61, title: 'Форматы и вопросы' }
];
const total = Number(sections.at(-1).dataset.page);
const machines = new Map();
const toc = document.querySelector('#toc');
const contents = document.querySelector('#contents');
const back = document.querySelector('#back');
const forward = document.querySelector('#forward');
const pad = n => String(n).padStart(2, '0');
let page;
let current;

function addScoreScale() {
  const values = [7,14,20,27,34,40,43,46,48,51,54,56,59,62,64,67,70,72,75,78,80,83,85,88,90,93,95,98,100];
  const root = document.querySelector('#score-scale');
  for (let start = 0; start < values.length; start += 10) {
    const table = document.createElement('table');
    table.setAttribute('aria-label', `Перевод первичных баллов с ${start + 1} до ${Math.min(start + 10, values.length)}`);
    table.innerHTML = '<thead><tr><th>Первичный</th><th>Тестовый</th></tr></thead><tbody>' +
      values.slice(start, start + 10).map((score, i) => {
        const style = score === 85 ? 'target' : score >= 80 ? 'high' : '';
        return `<tr class="${style}"><td>${start + i + 1}</td><td>${score}</td></tr>`;
      }).join('') + '</tbody>';
    root.append(table);
  }
}

function addPrices(section) {
  const monthly = section.dataset.price === 'month';
  const unit = monthly ? 'в месяц' : 'за занятие';
  const duration = monthly ? '4 занятия по 90–120 минут' : 'Одно занятие 90–120 минут';
  const extra = monthly ? '4 мини-занятия один на один по необходимости.' : 'Мини-занятие один на один по необходимости.';
  section.insertAdjacentHTML('beforeend', `
    <div class="cards"><article><h3>Индивидуально-групповой</h3>
    <p class="tariff">${monthly ? '8 000' : '2 000'} ₽ <small>${unit}</small></p><p>${duration}.</p></article>
    <article class="tint"><h3>Расширенный</h3>
    <p class="tariff">${monthly ? '10 000' : '2 500'} ₽ <small>${unit}</small></p><p>${duration}. ${extra}</p></article></div>
    <p class="included"><b>В обоих форматах</b> — теория в группе, индивидуальная практика,
    ${monthly ? 'от четырёх домашних работ с видеоразборами' : 'домашняя работа с видеоразбором'},
    авторский пробник каждый месяц, поддержка, помощь с поступлением и доступ ко всем сервисам.</p>`);
}

function prepareSections() {
  for (const section of sections) {
    const first = Number(section.dataset.page);
    const chapter = chapters.findLast(item => item.first <= first);
    if (first !== 1) {
      const label = document.createElement('p');
      label.className = 'chapter-label';
      label.textContent = chapter.title;
      section.prepend(label);
    }
    if (section.hasAttribute('data-question')) {
      section.insertAdjacentHTML('beforeend', '<label class="question-box">Заметка для обсуждения<textarea placeholder="Можно ответить устно или записать пару слов"></textarea></label>');
    }
    if (section.dataset.price) addPrices(section);
    if (section.dataset.input) machines.set(section, prepareMachine(section));
  }
  addScoreScale();
}

function prepareNavigation() {
  for (const chapter of chapters) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = chapter.title;
    details.append(summary);
    const end = chapters[chapters.indexOf(chapter) + 1]?.first ?? total + 1;
    for (const section of sections) {
      const first = Number(section.dataset.page);
      if (first < chapter.first || first >= end) continue;
      const length = machines.get(section)?.length ?? 1;
      const range = length === 1 ? pad(first) : `${first}–${first + length - 1}`;
      const link = document.createElement('a');
      link.href = '#' + first;
      link.innerHTML = `<span>${range}</span>${section.dataset.name}`;
      details.append(link);
    }
    details.dataset.first = chapter.first;
    toc.append(details);
    const marker = document.createElement('a');
    marker.href = '#' + chapter.first;
    marker.title = chapter.title;
    marker.setAttribute('aria-label', chapter.title);
    document.querySelector('#chapter-links').append(marker);
  }
}

function render() {
  const hash = location.hash.slice(1);
  const requested = /^\d+$/.test(hash) ? Number(hash) : 1;
  const next = Math.max(1, Math.min(total, requested));
  if (hash && hash !== String(next)) history.replaceState(null, '', '#' + next);
  if (page === next) return;
  const previousPage = page;
  page = next;
  const section = sections.findLast(s => Number(s.dataset.page) <= page);
  const chapter = chapters.findLast(item => item.first <= page);
  if (contents.open) contents.close();
  if (current !== section) {
    if (current) current.hidden = true;
    section.hidden = false;
    current = section;
    window.scrollTo(0, 0);
  }
  machines.get(section)?.render(page - Number(section.dataset.page));
  const position = `${pad(page)} / ${total}`;
  document.querySelector('#page-count').textContent = position;
  document.querySelector('#chapter-name').textContent = chapter.title;
  document.querySelector('#announcement').textContent = `Слайд ${page} из ${total}. ${section.dataset.name}`;
  document.title = `${section.dataset.name} · Пробный урок`;
  back.disabled = page === 1;
  forward.disabled = page === total;
  for (const marker of document.querySelectorAll('#chapter-links a, #toc a')) {
    const active = marker.hash === '#' + (toc.contains(marker) ? section.dataset.page : chapter.first);
    if (active) marker.setAttribute('aria-current', 'page');
    else marker.removeAttribute('aria-current');
  }
  if (previousPage && (document.activeElement === document.body || document.activeElement.closest('section[hidden]'))) {
    stage.focus({ preventScroll: true });
  }
}

function turn(delta) {
  const target = page + delta;
  if (target >= 1 && target <= total) location.hash = String(target);
}

prepareSections();
prepareNavigation();
for (const form of document.querySelectorAll('.example-check')) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const correct = form.elements.answer.value.trim() === form.dataset.answer;
    form.querySelector('.feedback').textContent = correct ? 'Верно.' : 'Пока не совпало. Проверь вычисление и попробуй ещё раз.';
  });
}
render();
window.addEventListener('hashchange', render);
back.addEventListener('click', () => turn(-1));
forward.addEventListener('click', () => turn(1));
document.querySelector('#open-menu').addEventListener('click', () => {
  const currentLink = toc.querySelector('[aria-current]');
  for (const group of toc.querySelectorAll('details')) group.open = group.contains(currentLink);
  contents.showModal();
  currentLink.scrollIntoView({ block: 'nearest' });
});
toc.addEventListener('click', event => {
  if (event.target.closest('a')) contents.close();
});
contents.querySelector('[data-close]').addEventListener('click', () => contents.close());
contents.addEventListener('click', event => {
  if (event.target !== contents) return;
  const r = contents.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) contents.close();
});
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
    contents.open || event.target.closest('textarea,input,select,[contenteditable="true"]')) return;
  if (event.key === ' ' && event.target.closest('button,a')) return;
  const changes = { ArrowRight: 1, PageDown: 1, ' ': 1, ArrowLeft: -1, PageUp: -1, Home: 1 - page, End: total - page };
  if (!Object.hasOwn(changes, event.key)) return;
  event.preventDefault();
  turn(changes[event.key]);
});
