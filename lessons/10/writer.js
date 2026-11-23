
window.LESSON_ID = "zadanie-10-part-1";
/* Разделы урока и пояснения к каждому экрану (панель N).
   [n, 'текст'] — абзац к шагу n; '!' в начале — совет (жёлтый фон). */
window.SECTIONS = { 1: 'Задача', 2: 'Регистр', 3: 'Слово целиком', 4: 'Сноски и главы', 5: 'Дефисы', 6: 'Шпаргалка', 7: 'Практика' };
window.NOTES = {
  start: [
    'Номер 10 — поиск в текстовом документе. Справа идёт живой поиск: сначала находится всё, где есть буквы «суд», потом включается «Слова целиком» — и остаются только отдельные слова.',
    'Спроси класс: почему число уменьшилось? К ответу придём на третьем разделе.',
    '!Листай <kbd>→</kbd> <kbd>←</kbd> или пробелом. <kbd>N</kbd> — эта панель, <kbd>Q</kbd> — вопрос на слайде, <kbd>G</kbd> — оглавление.'
  ],
  about: [
    'Карточки открываются по нажатию — по порядку кнопкой «Дальше» или кликом в любом порядке.',
    [1, 'Ищем слово или сочетание букв. «суд» может быть словом целиком, а может прятаться в «посуде».'],
    [2, 'Файл .docx — обычный текстовый документ. На уроке работаем в LibreOffice Writer.'],
    [3, 'В ответ — одно число. Руками ничего не считаем.'],
    [4, 'Технически нужна одна комбинация: Ctrl + H. Вся задача — правильно настроить поиск.']
  ],
  ctrlh: [
    'Справа — макет LibreOffice Writer. Он настоящий: можно вписать любое слово, ставить галочки и нажимать «Найти все».',
    [1, 'Ctrl + H открывает «Найти и заменить». Работает и настоящее сочетание клавиш, пока открыт этот экран.'],
    [2, 'Поле «Найти»: что ищем. Без пробелов по краям — иначе «суд » найдёт только слова, после которых пробел.'],
    [3, 'Первая галочка — регистр. Ей посвящён следующий раздел.'],
    [4, 'Вторая галочка — «Слова целиком». Самая важная.'],
    [5, '«Найти все» выделяет совпадения и пишет их количество. Это число мы и записываем — иногда после вычитания.']
  ],
  case: [
    [1, 'Строчные — маленькие: а, б, в, г.'],
    [2, 'Прописные — большие: А, Б, В, Г.'],
    [3, 'Мнемоника: прописные — от «прописывать»: большую букву выводят красиво.'],
    [4, 'Галочка «Учитывать регистр» — это приказ «ищи ровно так, как я написал».'],
    [5, 'Нет галочки — «регистр не важен, ищи любые».']
  ],
  'case-live': [
    'Текст из трёх абзацев — каждое совпадение видно глазами.',
    [1, 'Без галочки «суд» находит 6: Суд, Судья, посуду, суд, Подсудимый, Суд.'],
    [2, 'С галочкой — только 3, где «суд» написано маленькими буквами.'],
    [3, 'Пишем «Суд» с большой буквы — ещё 3. Вместе 6.'],
    [4, '«Подсудимый» начинается с большой П, но буквы «суд» внутри маленькие — поэтому он найден. Регистр проверяет сами искомые буквы.']
  ],
  'case-rule': [
    'Переводим фразу из задания в положение галочки. Ответы открываются по нажатию.',
    [4, 'Главное: регистр не упомянут или перечислены оба варианта — галочку не ставим.']
  ],
  whole: [
    'Ключевая идея номера: одни и те же буквы встречаются в тексте двумя способами.',
    [1, 'Слово целиком: отдельный «суд», рядом нет букв.'],
    [2, 'В составе: посуда, подсудимый, судья — «суд» лишь кусочек.'],
    [3, '«Суд» с большой буквы — всё равно отдельное слово.'],
    [4, 'Ловушка: «суду» — то же слово в другом падеже, но компьютер падежей не знает. Для него «суду» — не «суд», то есть «в составе».'],
    [5, '«рассудок» — в составе.'],
    [6, '«сударь» — к суду отношения не имеет, но буквы те же. Компьютер найдёт и его.']
  ],
  modes: [
    'Вторая галочка — самая важная. Компьютер умеет только два режима.',
    [1, 'Галочка стоит — находит только отдельные слова: 3.'],
    [2, 'Галочки нет — находит всё, где есть буквы «суд»: 6.'],
    [3, 'Режима «только в составе» нет. Спроси класс, как его получить.'],
    [4, 'Всего минус целиком — остаётся «в составе». Это главная формула номера.']
  ],
  'whole-live': [
    [1, 'Без галочек — 6.'],
    [2, '«Слова целиком» — 3.'],
    [3, '6 − 3 = 3 — столько раз «суд» встречается в составе других слов.'],
    [4, 'Раскраска — только для урока, в LibreOffice её нет. Синие — целиком, оранжевые — в составе. Оранжевых ровно 3.']
  ],
  task1: [
    'Задание в формате ЕГЭ. Сначала читаем и решаем, какие нужны галочки.',
    [1, 'Нужен вариант 2) — в составе. Значит, всего − целиком.'],
    [2, '«суд» или «Суд» — регистр не важен, галочку не ставим.'],
    [3, '«не считая сносок» — новое. Разберём на следующем экране.']
  ],
  footnote: [
    'Файл побольше: рассказ из пяти глав в двух частях, со сносками.',
    [1, 'Сноска: цифра в тексте и пояснение внизу страницы.'],
    [2, 'Поиск находит «суд» и в сносках: «сударь», «судья». Всего 31.'],
    [3, 'Навигатор: F5 или значок компаса на панели. Строка «Сноски» → правая кнопка → «Удалить все сноски». В макете можно и крестиком.'],
    [4, 'После удаления сносок — 29.'],
    '!Сноски удаляем до поиска — так проще, чем вычитать.'
  ],
  'task1-solve': [
    'Сноски уже удалены. Осталось два поиска и вычитание.',
    [1, 'Без галочек: 29.'],
    [2, 'Слова целиком: 7.'],
    [3, 'Ответ: 29 − 7 = 22.'],
    [4, 'Если забыть про сноски: 31 − 7 = 24.']
  ],
  chapters: [
    'Задача 2: только главы III и IV. Как в «Войне и мире»: «в тексте глав VIII и IX».',
    [1, 'Навигатор → Заголовки. Правая кнопка → «Удалить заголовок» или Delete. Заголовок удаляется вместе со всем текстом главы.'],
    [2, 'Удаляем название, главы I, II и V. Заголовки частей оставляем — внутри них нужные главы.'],
    [3, '«он» без галочек — 7.'],
    [4, 'Слова целиком — 2.'],
    [5, '7 − 2 = 5.'],
    [6, 'Удалишь «Часть первая» — пропадут все её главы, и нужная III тоже. Ctrl+Z возвращает.']
  ],
  hyphen: [
    [1, '«как» с галочкой «Слова целиком» — 5.'],
    [2, 'Одно из них — «как-то». Это одно слово, но компьютер считает дефис границей слова.'],
    [3, 'Для компьютера дефис — как пробел. Значит, со словами через дефис он считает неправильно. А в задании про дефисы могут даже не написать.']
  ],
  dehyph: [
    [1, 'Найти: дефис. Заменить: «к» — любая русская буква.'],
    [2, '«Заменить все»: все слова с дефисом склеились. «каккто» — уже точно одно слово.'],
    [3, 'Снова «как» целиком — 4. Лишнее «как-то» больше не считается.'],
    [4, 'Правило урока: дефис меняем всегда, в каждой задаче.'],
    '!Вопрос <kbd>Q</kbd>: если ищем «кто», буква «к» создаст лишние совпадения (что-то → чтокто). Тогда меняем на «ж».'
  ],
  task3: [
    [1, 'Регистр не важен — не ставим. Отдельные слова — «Слова целиком».'],
    [2, 'Сначала дефисы. Заменяем при снятой галочке «Слова целиком», иначе дефис не найдётся.'],
    [3, '«как» целиком — 4.'],
    [4, '«что» целиком — 5.'],
    [5, 'Ответ: 4 + 5 = 9.'],
    [6, 'Отменили замену (Ctrl+Z): «что» стало 8. Без замены вышло бы 5 + 8 = 13.']
  ],
  algo: [
    'Пять шагов на любое задание. Сначала спроси, какой шаг следующий, потом открывай.',
    '!Порядок важен: сноски и главы удаляем до замены дефисов и до поиска.'
  ],
  phrases: [
    'Шпаргалка: фраза из задания → что делаем. Пусть ученики отвечают раньше, чем открываешь.',
    [8, 'Задача со звёздочкой: «ход», но не «приход». Из всех «ход» вычитаем отдельные слова «ход» и все «приход».']
  ],
  mistakes: [
    'Четыре ошибки. Числа — из задач этого урока.'
  ],
  trainer: [
    'Случайные задачи по тому же рассказу. Решать прямо в редакторе справа: Ctrl+H — поиск, F5 — навигатор, Ctrl+Z — отмена.',
    'Неверный ответ — подсказка, где ошибка: сноски, главы или дефисы.',
    '«Файл заново» возвращает документ в исходный вид.'
  ],
  summary: [
    'Четыре вывода. Пусть ученики сначала вспомнят сами.'
  ]
};

/* ion_inf · общие помощники для виджетов */
(() => {
'use strict';
const U = {};
U.$ = (s, r = document) => r.querySelector(s);
U.$$ = (s, r = document) => [...r.querySelectorAll(s)];
U.fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
U.plural = (n, a, b, c) => { const m = Math.abs(n) % 100, d = m % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d >= 2 && d <= 4 ? b : c; };
U.sleep = ms => new Promise(r => setTimeout(r, ms));
U.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
U.pick = arr => arr[Math.floor(Math.random() * arr.length)];
U.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
U.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
U.reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
U.h = (tag, attrs = {}, html = '') => { const e = document.createElement(tag); for (const k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k === 'style') e.style.cssText = attrs[k]; else e.setAttribute(k, attrs[k]); } if (html) e.innerHTML = html; return e; };

/* плавно докрутить число */
U.countTo = (el, to, ms = 700, from) => {
  if (!el) return;
  const f = from !== undefined ? from : (+el.dataset.v || 0);
  el.dataset.v = to;
  if (el._raf) cancelAnimationFrame(el._raf);
  if (U.reduced() || ms <= 0) { el.textContent = U.fmt(to); return; }
  const t0 = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
    el.textContent = U.fmt(f + (to - f) * e);
    if (p < 1) el._raf = requestAnimationFrame(tick);
  };
  el._raf = requestAnimationFrame(tick);
};
U.setNum = (el, v) => { if (!el) return; if (el._raf) cancelAnimationFrame(el._raf); el.dataset.v = v; el.textContent = U.fmt(v); };

/* проигрыватель итераций: tick() возвращает false, когда всё */
class Player {
  constructor(o) { Object.assign(this, { speed: 4, tick: () => false, render: () => {}, onState: () => {}, maxPerFrame: 200000 }, o); this.on = false; this.done = false; this.acc = 0; this._f = this._f.bind(this); }
  play() { if (this.done) return; if (this.on) return; this.on = true; this.last = performance.now(); this.acc = 1; requestAnimationFrame(this._f); this.onState(true); }
  pause() { if (!this.on) return; this.on = false; this.onState(false); }
  toggle() { this.on ? this.pause() : this.play(); }
  stepOnce() { this.pause(); if (this.done) return; if (this.tick() === false) this.finish(); this.render(true); }
  finish() { this.done = true; this.on = false; this.onState(false, true); }
  reset() { this.pause(); this.done = false; this.acc = 0; }
  _f(now) {
    if (!this.on) return;
    const dt = Math.min(100, now - this.last); this.last = now;
    this.acc += dt * this.speed / 1000;
    let n = 0;
    while (this.acc >= 1 && n < this.maxPerFrame) {
      this.acc -= 1; n++;
      if (this.tick() === false) { this.render(n === 1); this.finish(); return; }
    }
    if (n) this.render(n === 1 && this.speed < 30);
    requestAnimationFrame(this._f);
  }
}
U.Player = Player;

/* итератор по произведению: индексы как одометр */
U.prodIter = sizes => {
  const idx = sizes.map(() => 0); let first = true, done = sizes.some(s => s === 0);
  return {
    idx,
    next() {
      if (done) return null;
      if (first) { first = false; return { idx, changed: sizes.length - 1 }; }
      for (let i = sizes.length - 1; i >= 0; i--) {
        if (idx[i] + 1 < sizes[i]) { idx[i]++; return { idx, changed: i }; }
        idx[i] = 0;
      }
      done = true; return null;
    },
    reset() { idx.fill(0); first = true; done = sizes.some(s => s === 0); }
  };
};

/* одометр-барабаны */
class Odo {
  constructor(host, alphas, o = {}) {
    this.host = host; this.o = Object.assign({ cell: 96, w: 92, font: 54, colors: true, labels: false }, o);
    this.build(alphas);
  }
  build(alphas) {
    this.alphas = alphas.slice(); this.host.innerHTML = ''; this.reels = [];
    this.host.classList.add('odo');
    const { cell, w, font } = this.o;
    alphas.forEach((a, i) => {
      const r = U.h('div', { class: `reel c${(i % 4) + 1}`, style: `width:${w}px;height:${cell * 3}px` });
      const strip = U.h('div', { class: 'strip' });
      const seq = (a + a + a).split('');
      strip.innerHTML = seq.map(ch => `<b style="height:${cell}px;font-size:${font}px">${ch}</b>`).join('');
      r.appendChild(strip);
      if (this.o.labels) r.appendChild(U.h('span', { class: 'rl' }, this.o.labels[i] || ''));
      this.host.appendChild(r);
      this.reels.push({ el: r, strip, a, pos: 0 });
      this.place(i, 0, false);
    });
  }
  place(i, j, anim) {
    const R = this.reels[i], L = R.a.length, cell = this.o.cell;
    if (!L) return;
    const target = L + j;
    if (anim && !U.reduced()) {
      let from = L + R.pos;
      let to = target;
      if (j < R.pos) to = 2 * L + j; // перескок через край: крутим вниз
      R.strip.style.transition = 'none';
      R.strip.style.transform = `translateY(${-(from - 1) * cell}px)`;
      R.strip.offsetHeight;
      R.strip.style.transition = `transform ${this.o.dur || 260}ms cubic-bezier(.3,1.4,.5,1)`;
      R.strip.style.transform = `translateY(${-(to - 1) * cell}px)`;
      clearTimeout(R.t);
      if (to !== target) R.t = setTimeout(() => { R.strip.style.transition = 'none'; R.strip.style.transform = `translateY(${-(target - 1) * cell}px)`; }, (this.o.dur || 260) + 30);
    } else {
      clearTimeout(R.t);
      R.strip.style.transition = 'none';
      R.strip.style.transform = `translateY(${-(target - 1) * cell}px)`;
    }
    R.pos = j;
    U.$$('b', R.strip).forEach((b, k) => b.classList.toggle('cur', k === target));
  }
  set(idx, anim) { idx.forEach((j, i) => { if (this.reels[i] && (this.reels[i].pos !== j || !anim)) this.place(i, j, anim); }); }
  word() { return this.reels.map(r => r.a[r.pos]).join(''); }
}
U.Odo = Odo;

/* перелёт элемента: клон летит от a к b (координаты сцены) */
U.fly = (fromEl, toEl, o = {}) => new Promise(res => {
  const D = window.DECK; if (!D) return res();
  const a = D.rel(fromEl), b = D.rel(toEl);
  const c = fromEl.cloneNode(true);
  c.classList.add('flyer');
  Object.assign(c.style, { position: 'absolute', left: a.x + 'px', top: a.y + 'px', width: a.w + 'px', height: a.h + 'px', margin: 0, zIndex: 50, transition: `transform ${o.ms || 900}ms cubic-bezier(.65,0,.25,1)` });
  D.stage.appendChild(c);
  c.offsetHeight;
  const sx = b.w / a.w, sy = b.h / a.h;
  c.style.transformOrigin = '0 0';
  c.style.transform = `translate(${b.x - a.x}px,${b.y - a.y}px) scale(${o.keepSize ? 1 : sx},${o.keepSize ? 1 : sy})`;
  setTimeout(() => { c.remove(); res(); }, (o.ms || 900) + 20);
});

window.U = U;
})();

/* сгенерировано tools/gen_text.py из tools/story.py */
window.TEXTS = {"book": {"blocks": [["h0", "Дело о разбитой посуде"], ["sub", "учебный рассказ"], ["h1", "Часть первая"], ["h2", "Глава I"], ["p", "В уездном городе N суд начинался ровно в девять. Судья Пётр Ильич Кротов приходил раньше всех, ставил на стол стакан чаю и как-то особенно строго смотрел на часы. Суд, говорил он, — это прежде всего порядок."], ["p", "В то утро порядок нарушил трактирщик Савельев. Он ворвался в зал, размахивая осколком тарелки, и закричал с порога:"], ["p", "— Господин судья, разбили всю посуду! Что теперь делать?"], ["p", "— Что разбили, того не склеишь, — рассудил Пётр Ильич. — Садитесь и рассказывайте по порядку. Суд никуда не торопится."], ["h2", "Глава II"], ["p", "Савельев рассказывал долго и путано. Вечером в трактире сидели приказчик Мухин, отставной поручик и какой-то заезжий француз. Француз всё время кланялся и повторял: «Pardon, monsieur!»{1} Около полуночи на кухне раздался страшный звон: вся посуда, что стояла на полках, оказалась на полу."], ["p", "— Кто-нибудь видел, как это случилось? — спросил судья."], ["p", "— Никто не видел. Но Мухин-то рядом был! — воскликнул трактирщик. — Он как раз выходил из кухни."], ["p", "Так приказчик Мухин стал подсудимым."], ["h2", "Глава III"], ["p", "Подсудимый стоял бледный и всё время что-то шептал. Судья спросил, что он делал на кухне в такой час."], ["p", "— Ходил за водой, конечно, — ответил Мухин. — Я ни при чём, господин судья. Посудите сами: зачем мне бить чужую посуду?"], ["p", "— Судить буду я, — сухо заметил Пётр Ильич. — А вы отвечайте на вопросы."], ["p", "В зале зашептались. Пересуды в городе N любили больше, чем сам суд, и к обеду о деле знала вся улица."], ["h1", "Часть вторая"], ["h2", "Глава IV"], ["p", "Тут дело приняло неожиданный ход. Свидетелем вызвали кухарку Агафью. Она вошла, поклонилась суду и сказала:"], ["p", "— Мухин тут ни при чём. Я своими глазами видела, как на полку прыгнул кот Барон. Он у нас вечно ищет, где что-нибудь лежит. Прыгнул — полка и рухнула с таким звоном, что я чуть не оглохла."], ["p", "— Кот? — переспросил судья."], ["p", "— Mon Dieu!{2} — ахнул француз, и весь зал засмеялся."], ["p", "Пётр Ильич постучал по столу: суд — не балаган, и смеяться здесь не положено."], ["h2", "Глава V"], ["p", "Судья долго молчал, а потом объявил решение:"], ["p", "— Суд постановил: Мухина отпустить, трактирщику впредь ставить посуду на нижние полки, а кота Барона как подсудимого, у которого нет ни рассудка, ни денег, — простить."], ["p", "Савельев что-то проворчал, но спорить не стал. А француз пожал судье руку и сказал: «C’est la vie, monsieur le juge».{3}"], ["p", "С тех пор в городе N говорят: суд у нас скорый, но справедливый. Главное — найти настоящего виновника, даже если у него хвост."]], "fn": {"1": "Простите, сударь! (фр.)", "2": "Боже мой! (фр.)", "3": "Такова жизнь, господин судья (фр.)"}}, "mini": {"blocks": [["p", "Суд начинался ровно в девять. Судья приходил раньше всех и строго смотрел на часы."], ["p", "— Разбили всю посуду! — закричал трактирщик. — Пусть решает суд!"], ["p", "Подсудимый молчал. «Суд разберётся», — шептали в зале."]], "fn": {}}};

/* ion_inf · макет LibreOffice Writer: документ, «Найти и заменить» (Ctrl+H), навигатор (заголовки, сноски).
   Поиск устроен как в LibreOffice: «Найти все» без пересечений; «Слова целиком» — слева и справа не буква и не цифра,
   поэтому дефис для компьютера — граница слова (как-то → «как» + «то»). */
(() => {
'use strict';
const { $, $$, h, esc, sleep, countTo, setNum, plural } = U;
const FNCH = '';                     // якорь сноски внутри строки
const isW = c => !!c && /[\p{L}\p{N}]/u.test(c);
const LEVEL = { h0: 1, h1: 1, h2: 2 };
const DEAD = window.DEAD = { dead: true };   // анимацию прервали: бросаем, чтобы цепочка остановилась
const alive = tok => { if (tok && tok.dead) throw DEAD; };

/* ---------- модель документа ---------- */
class DocModel {
  constructor(src) {
    if (src.blocks && Array.isArray(src.blocks[0])) {
      this.blocks = src.blocks.map(([t, s]) => {
        const fns = []; s = s.replace(/\{(\d+)\}/g, (_, n) => { fns.push(+n); return FNCH; });
        return { t, s, fns };
      });
      this.fn = Object.assign({}, src.fn);
    } else { this.blocks = src.blocks.map(b => ({ t: b.t, s: b.s, fns: b.fns.slice() })); this.fn = Object.assign({}, src.fn); }
  }
  clone() { return new DocModel({ blocks: this.blocks, fn: this.fn }); }
  /* единицы поиска: текст блока, затем тексты его сносок */
  units() {
    const out = [];
    this.blocks.forEach((b, bi) => {
      out.push({ key: 'b' + bi, s: b.s });
      b.fns.forEach(n => { if (this.fn[n] != null) out.push({ key: 'f' + n, s: this.fn[n] }); });
    });
    return out;
  }
  static find(s, q, mc, ww) {
    const res = []; if (!q) return res;
    const hay = mc ? s : s.toLowerCase(), nd = mc ? q : q.toLowerCase();
    let i = 0;
    while (true) {
      const j = hay.indexOf(nd, i); if (j < 0) break;
      const e = j + nd.length, whole = !isW(s[j - 1]) && !isW(s[e]);
      if (ww && !whole) { i = j + 1; continue; }
      res.push([j, e, whole]); i = e;
    }
    return res;
  }
  findAll(q, mc, ww) {
    const map = {}; let total = 0, whole = 0;
    this.units().forEach(u => { const r = DocModel.find(u.s, q, mc, ww); if (r.length) { map[u.key] = r; total += r.length; whole += r.filter(x => x[2]).length; } });
    return { map, total, whole };
  }
  replaceAll(q, rep, mc, ww) {
    const marks = {}; let n = 0;
    const doOne = (s, key) => {
      const r = DocModel.find(s, q, mc, ww); if (!r.length) return s;
      let out = '', last = 0; const mk = [];
      r.forEach(([a, b]) => { out += s.slice(last, a); mk.push([out.length, out.length + rep.length]); out += rep; last = b; });
      out += s.slice(last); n += r.length; marks[key] = mk; return out;
    };
    this.blocks.forEach((b, bi) => { b.s = doOne(b.s, 'b' + bi); });
    Object.keys(this.fn).forEach(k => { this.fn[k] = doOne(this.fn[k], 'f' + k); });
    return { n, marks };
  }
  deleteFootnotes() { let n = 0; this.blocks.forEach(b => { n += b.fns.length; b.s = b.s.split(FNCH).join(''); b.fns = []; }); this.fn = {}; return n; }
  get fnCount() { return this.blocks.reduce((a, b) => a + b.fns.length, 0); }
  headings() { return this.blocks.map((b, i) => ({ i, t: b.t, s: b.s, lv: LEVEL[b.t] })).filter(x => x.lv); }
  /* «Удалить заголовок»: заголовок и всё до следующего заголовка того же или более высокого уровня */
  chapterRange(i) { const lv = LEVEL[this.blocks[i].t]; let j = i + 1; while (j < this.blocks.length && !(LEVEL[this.blocks[j].t] && LEVEL[this.blocks[j].t] <= lv)) j++; return [i, j]; }
  deleteHeading(i) { const [a, b] = this.chapterRange(i); return this.blocks.splice(a, b - a); }
  idxOf(text) { return this.blocks.findIndex(b => LEVEL[b.t] && b.s === text); }
  words() { let n = 0; this.blocks.forEach(b => { n += (b.s.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) || []).length; }); return n; }
}

/* ---------- отрисовка текста с подсветкой ---------- */
function renderStr(s, hits, marks, fnNum, color) {
  // события: начало/конец подсветки, начало/конец «заменено», якорь сноски
  const ev = [];
  (hits || []).forEach(([a, b, w]) => { ev.push([a, 1, `<mark class="hit${color ? (w ? ' w' : ' p') : ''}">`]); ev.push([b, 0, '</mark>']); });
  (marks || []).forEach(([a, b]) => { ev.push([a, 2, '<span class="repd">']); ev.push([b, -1, '</span>']); });
  ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  let out = '', last = 0, fi = 0;
  const flush = upto => {
    let seg = s.slice(last, upto);
    out += esc(seg).replace(new RegExp(FNCH, 'g'), () => `<sup class="fnm">${fnNum[fi++] || '*'}</sup>`);
    last = upto;
  };
  ev.forEach(([p, , tag]) => { flush(p); out += tag; });
  flush(s.length);
  return out;
}

const MENU = ['Файл', 'Правка', 'Вид', 'Вставка', 'Формат', 'Стили', 'Таблица', 'Форма', 'Сервис', 'Окно', 'Справка'];
const ICO = {
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
  find: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></svg>',
  nav: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

/* ---------- окно редактора ---------- */
class Writer {
  constructor(host, o = {}) {
    this.o = Object.assign({ doc: 'book', file: '10-1.docx', nav: false, dlg: false, color: false, navOpenable: true }, o);
    this.host = host; host._wr = this; this.src = TEXTS[this.o.doc];
    this.ls = {};
    this.build();
    this.reset();
  }
  on(ev, cb) { (this.ls[ev] = this.ls[ev] || []).push(cb); }
  emit(ev, d) { (this.ls[ev] || []).forEach(cb => { try { cb(d); } catch (e) { console.error(e); } }); }
  build() {
    const H = this.host; H.classList.add('wr'); H.innerHTML = `
      <div class="wr-title"><span class="wr-logo"></span><span class="wr-fname">${this.o.file} — LibreOffice Writer</span><span class="sp"></span><i></i><i></i><i></i></div>
      <div class="wr-menu">${MENU.map(m => `<span>${m}</span>`).join('')}</div>
      <div class="wr-tb">
        <button class="wr-ib b-undo" title="Отменить (Ctrl+Z)">${ICO.undo}</button>
        <span class="wr-sep"></span>${'<i></i>'.repeat(5)}<span class="wr-sep"></span>
        <button class="wr-ib b-find" title="Найти и заменить (Ctrl+H)">${ICO.find}</button>
        <button class="wr-ib b-nav" title="Навигатор (F5)">${ICO.nav}</button>
        <span class="wr-sep"></span>${'<i></i>'.repeat(7)}
      </div>
      <div class="wr-main">
        <div class="wr-canvas scrollable"><div class="wr-pages"></div></div>
        <aside class="wr-nav nowheel">
          <div class="nav-h">Навигатор</div>
          <div class="nav-body scrollable">
            <div class="nav-cat on"><b>Заголовки</b></div>
            <div class="nav-tree"></div>
            <div class="nav-cat dis"><b>Таблицы</b></div>
            <div class="nav-cat dis"><b>Изображения</b></div>
            <div class="nav-cat dis"><b>Закладки</b></div>
            <div class="nav-cat dis"><b>Гиперссылки</b></div>
            <div class="nav-cat dis"><b>Комментарии</b></div>
            <div class="nav-cat fnc" data-fn="1"><b>Сноски</b><span class="cnt"></span><button class="nav-del" title="Удалить все сноски">${ICO.del}</button></div>
          </div>
        </aside>
      </div>
      <div class="wr-status"><span class="st-pg"></span><span class="st-w"></span><span class="sp"></span><span class="st-sel"></span></div>
      <div class="wr-dlg nowheel">
        <div class="dlg-h"><b>Найти и заменить</b><button class="dlg-x" title="Закрыть">✕</button></div>
        <label class="dlg-row"><span>Найти:</span><input class="f-q" spellcheck="false" autocomplete="off"></label>
        <div class="dlg-chk">
          <label class="chk ck-mc"><input type="checkbox"><i></i><span>Учитывать регистр</span></label>
          <label class="chk ck-ww"><input type="checkbox"><i></i><span>Слова целиком</span></label>
        </div>
        <div class="dlg-res"><span class="res-t"></span></div>
        <label class="dlg-row"><span>Заменить:</span><input class="f-r" spellcheck="false" autocomplete="off"></label>
        <div class="dlg-btns"><button class="b-fa">Найти все</button><button class="b-ra">Заменить все</button></div>
      </div>
      <div class="wr-ctx"></div>`;
    this.$ = s => $(s, H);
    this.pages = this.$('.wr-pages'); this.canvas = this.$('.wr-canvas');
    this.fq = this.$('.f-q'); this.fr = this.$('.f-r');
    this.cmc = this.$('.ck-mc input'); this.cww = this.$('.ck-ww input');
    this.res = this.$('.dlg-res'); this.resT = this.$('.res-t');
    this.ctx = this.$('.wr-ctx');
    // события
    this.$('.b-fa').addEventListener('click', e => { e.currentTarget.blur(); this.findAll({ user: true }); });
    this.$('.b-ra').addEventListener('click', e => { e.currentTarget.blur(); this.replaceAll({ user: true }); });
    this.fq.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.findAll({ user: true }); } });
    this.fr.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.replaceAll({ user: true }); } });
    [this.fq, this.fr].forEach(f => f.addEventListener('input', () => this.stale()));
    [this.cmc, this.cww].forEach(c => c.addEventListener('change', () => { this.stale(); this.emit('opt'); }));
    this.$('.dlg-x').addEventListener('click', () => this.openDlg(false));
    this.$('.b-find').addEventListener('click', e => { e.currentTarget.blur(); this.openDlg(!this.dlgOn); if (this.dlgOn) this.fq.focus(); });
    this.$('.b-nav').addEventListener('click', e => { e.currentTarget.blur(); if (this.o.navOpenable) this.openNav(!this.navOn); });
    this.$('.b-undo').addEventListener('click', e => { e.currentTarget.blur(); this.undo(); });
    this.$('.fnc .nav-del').addEventListener('click', e => { e.stopPropagation(); this.deleteFootnotes({ user: true }); });
    this.$('.fnc').addEventListener('contextmenu', e => { e.preventDefault(); this.menu(e, [['Удалить все сноски', '', () => this.deleteFootnotes({ user: true })]]); });
    H.addEventListener('click', e => { if (!e.target.closest('.wr-ctx')) this.ctx.classList.remove('on'); });
    this.$('.nav-tree').addEventListener('click', e => {
      const del = e.target.closest('.nav-del'), row = e.target.closest('.nav-row'); if (!row) return;
      if (del) { this.deleteHeading(+row.dataset.i, { user: true }); return; }
      this.select(+row.dataset.i);
    });
    this.$('.nav-tree').addEventListener('contextmenu', e => {
      const row = e.target.closest('.nav-row'); if (!row) return; e.preventDefault();
      this.select(+row.dataset.i);
      this.menu(e, [['Перейти', 'Enter', () => this.goto(+row.dataset.i)], ['Удалить заголовок', 'Delete', () => this.deleteHeading(+row.dataset.i, { user: true })]]);
    });
  }
  menu(e, items) {
    const r = this.host.getBoundingClientRect(), sc = (window.DECK && DECK.scale) || 1;
    this.ctx.innerHTML = items.map((it, k) => `<button data-k="${k}"><span>${it[0]}</span><kbd>${it[1]}</kbd></button>`).join('');
    this.ctx.style.left = Math.min((e.clientX - r.left) / sc, this.host.offsetWidth - 250) + 'px';
    this.ctx.style.top = (e.clientY - r.top) / sc + 'px';
    this.ctx.classList.add('on');
    $$('button', this.ctx).forEach(b => b.onclick = ev => { ev.stopPropagation(); this.ctx.classList.remove('on'); items[+b.dataset.k][2](); });
  }

  /* ---------- состояние ---------- */
  reset(o = {}) {
    this.gen = (this.gen || 0) + 1;
    this.doc = new DocModel(this.src); this.hist = [];
    this.hits = null; this.marks = null; this.sel = -1; this.color = this.o.color; this.gone = new Set();
    this.fq.value = ''; this.fr.value = ''; this.cmc.checked = false; this.cww.checked = false;
    this.resT.textContent = ''; this.res.className = 'dlg-res';
    this.openDlg(o.dlg !== undefined ? o.dlg : this.o.dlg, true); this.openNav(o.nav !== undefined ? o.nav : this.o.nav, true);
    this.ctx.classList.remove('on');
    this.render(); this.canvas.scrollTop = 0;
  }
  snap() { this.hist.push(this.doc.clone()); if (this.hist.length > 30) this.hist.shift(); }
  undo() { if (!this.hist.length) { DECK.toast && DECK.toast('Отменять нечего'); return false; } this.doc = this.hist.pop(); this.hits = null; this.marks = null; this.res.className = 'dlg-res'; this.resT.textContent = ''; this.render(); this.emit('change', { kind: 'undo' }); return true; }
  openDlg(on, inst) { this.dlgOn = on; this.host.classList.toggle('dlg-on', on); if (inst) this.host.classList.add('inst'), requestAnimationFrame(() => this.host.classList.remove('inst')); }
  openNav(on, inst) { this.navOn = on; this.host.classList.toggle('nav-on', on); if (inst) this.host.classList.add('inst'), requestAnimationFrame(() => this.host.classList.remove('inst')); }
  setColor(on) { this.color = on; this.render(); }
  get q() { return this.fq.value; }
  stale() { if (this.hits) this.res.classList.add('stale'); }
  set(o) { // мгновенно выставить поля
    if (o.q !== undefined) this.fq.value = o.q;
    if (o.r !== undefined) this.fr.value = o.r;
    if (o.mc !== undefined) this.cmc.checked = o.mc;
    if (o.ww !== undefined) this.cww.checked = o.ww;
  }
  async type(field, text, tok, cps = 9) {
    const f = field === 'r' ? this.fr : this.fq;
    f.value = ''; f.classList.add('typing'); this.stale();
    try { for (let k = 1; k <= text.length; k++) { alive(tok); f.value = text.slice(0, k); await sleep(U.reduced() ? 0 : 1000 / cps); } alive(tok); }
    finally { f.classList.remove('typing'); }
  }
  async tick(which, val, tok) {
    const c = which === 'mc' ? this.cmc : this.cww, lab = c.parentElement;
    alive(tok); lab.classList.add('press'); await sleep(260); lab.classList.remove('press'); alive(tok);
    c.checked = val; this.stale(); this.emit('opt');
  }
  async press(sel, tok) { alive(tok); const b = this.$(sel); b.classList.add('press'); await sleep(220); b.classList.remove('press'); alive(tok); }

  /* ---------- действия ---------- */
  findAll(o = {}) {
    const q = this.fq.value, r = this.doc.findAll(q, this.cmc.checked, this.cww.checked);
    this.hits = r.map; this.marks = null; this.lastRes = r;
    this.res.className = 'dlg-res on' + (r.total ? '' : ' none');
    const cnt = `<b class="res-n">${r.total}</b>`;
    this.resT.innerHTML = !q ? 'Введите, что искать' : r.total ? `Найдено: ${cnt}` + (this.color ? `<small><i class="w"></i>${r.whole} целиком · <i class="p"></i>${r.total - r.whole} в составе</small>` : '') : 'Ничего не найдено';
    if (r.total && o.anim !== false) { const n = this.$('.res-n'); countTo(n, r.total, 600, 0); }
    this.render(o.anim !== false);
    if (r.total) {
      $('.wr-status .st-sel', this.host).textContent = `Выделено: ${r.total} ${plural(r.total, 'фрагмент', 'фрагмента', 'фрагментов')}`;
      if (o.scroll !== false) this.scrollToHit();
    } else $('.wr-status .st-sel', this.host).textContent = '';
    this.emit('find', { q, mc: this.cmc.checked, ww: this.cww.checked, total: r.total, whole: r.whole, user: !!o.user });
    return r.total;
  }
  clearHits() { this.hits = null; this.res.className = 'dlg-res'; this.resT.textContent = ''; this.render(); }
  replaceAll(o = {}) {
    const q = this.fq.value, rep = this.fr.value;
    if (!q) { this.res.className = 'dlg-res on none'; this.resT.textContent = 'Введите, что заменить'; return 0; }
    this.snap();
    const r = this.doc.replaceAll(q, rep, this.cmc.checked, this.cww.checked);
    if (!r.n) this.hist.pop();
    this.hits = null; this.marks = r.marks;
    this.res.className = 'dlg-res on' + (r.n ? ' rep' : ' none');
    this.resT.innerHTML = r.n ? `Заменено: <b class="res-n">${r.n}</b>` : 'Ничего не найдено';
    this.render(true);
    if (r.n && o.scroll !== false) this.scrollToHit('.repd');
    this.emit('change', { kind: 'replace', q, rep, n: r.n, user: !!o.user });
    return r.n;
  }
  deleteFootnotes(o = {}) {
    if (!this.doc.fnCount) { if (o.user && DECK.toast) DECK.toast('Сносок в документе нет'); return o.anim === false ? 0 : Promise.resolve(0); }
    const go = () => {
      this.snap(); const n = this.doc.deleteFootnotes(); this.hits = null; this.res.className = 'dlg-res'; this.resT.textContent = '';
      this.render(); this.emit('change', { kind: 'fn', n, user: !!o.user });
      if (o.user && DECK.toast) DECK.toast(`Удалено сносок: ${n}`);
      return n;
    };
    if (o.anim === false || U.reduced()) return o.anim === false ? go() : Promise.resolve(go());
    const cat = this.$('.fnc'); cat.classList.add('dying');
    $$('.fns, .fnm', this.pages).forEach(e => e.classList.add('dying'));
    const g = this.gen;
    return sleep(650).then(() => { cat.classList.remove('dying'); if (g !== this.gen) return 0; return go(); });
  }
  select(i) { this.sel = i; $$('.nav-row', this.host).forEach(r => r.classList.toggle('sel', +r.dataset.i === i)); }
  goto(i) { const el = $(`[data-b="${i}"]`, this.pages); if (el) this.scrollEl(el); }
  async deleteHeading(i, o = {}) {
    if (typeof i === 'string') i = this.doc.idxOf(i);
    if (i < 0 || !this.doc.blocks[i] || !LEVEL[this.doc.blocks[i].t]) return false;
    const [a, b] = this.doc.chapterRange(i);
    const rows = $$('.nav-row', this.host).filter(r => +r.dataset.i >= a && +r.dataset.i < b);
    const blocks = $$('[data-b]', this.pages).filter(e => +e.dataset.b >= a && +e.dataset.b < b);
    if (o.anim !== false && !U.reduced()) {
      const g = this.gen;
      if (o.scroll !== false && blocks[0]) this.scrollEl(blocks[0], true);
      rows.forEach(r => r.classList.add('dying')); blocks.forEach(e => e.classList.add('dying'));
      await sleep(o.fast ? 380 : 620);
      if (g !== this.gen) return false;
    }
    this.snap(); const gone = this.doc.deleteHeading(i);
    this.hits = null; this.res.className = 'dlg-res'; this.resT.textContent = ''; this.sel = -1;
    this.render(); this.emit('change', { kind: 'del', text: gone[0].s, n: gone.length, user: !!o.user });
    return true;
  }

  /* ---------- отрисовка ---------- */
  render(animHits) {
    const d = this.doc, fnNum = {}; let k = 0;
    d.blocks.forEach(b => b.fns.forEach(n => { fnNum[n] = ++k; }));
    // страницы: новая перед главой (h2), если перед ней не заголовок части; и перед частью (h1)
    const pages = []; let cur = null;
    d.blocks.forEach((b, i) => {
      const prev = d.blocks[i - 1];
      if (!cur || (b.t === 'h1') || (b.t === 'h2' && !(prev && prev.t === 'h1'))) { cur = []; pages.push(cur); }
      cur.push(i);
    });
    const H = this.hits || {}, M = this.marks || {};
    let hi = 0;
    this.pages.innerHTML = pages.map(pg => {
      const fns = [];
      const body = pg.map(i => {
        const b = d.blocks[i];
        const html = renderStr(b.s, H['b' + i], M['b' + i], b.fns.map(n => fnNum[n]), this.color);
        b.fns.forEach(n => fns.push(n));
        const tag = { h0: 'h3', sub: 'div', h1: 'h4', h2: 'h5', p: 'p' }[b.t];
        return `<${tag} class="d-${b.t}" data-b="${i}">${html}</${tag}>`;
      }).join('');
      const fnHtml = fns.length ? `<div class="fns">${fns.map(n => `<p data-f="${n}"><sup>${fnNum[n]}</sup> ${renderStr(d.fn[n], H['f' + n], M['f' + n], [], this.color)}</p>`).join('')}</div>` : '';
      return `<div class="pg"><div class="pg-in">${body}</div>${fnHtml}</div>`;
    }).join('') || '<div class="pg empty"><div class="pg-in"><p class="d-p" style="color:#aaa">Документ пуст</p></div></div>';
    if (animHits && !U.reduced()) $$('mark.hit', this.pages).forEach((m, i) => { m.style.animationDelay = Math.min(i * 40, 900) + 'ms'; m.classList.add('in'); });
    // навигатор
    const hs = d.headings();
    this.$('.nav-tree').innerHTML = hs.map(x => `<div class="nav-row l${x.lv}${x.i === this.sel ? ' sel' : ''}" data-i="${x.i}"><span>${esc(x.s)}</span><button class="nav-del" title="Удалить заголовок">${ICO.del}</button></div>`).join('') || '<div class="nav-empty">нет заголовков</div>';
    const fc = d.fnCount; this.$('.fnc .cnt').textContent = fc || '';
    this.$('.fnc').classList.toggle('dis', !fc);
    // статус
    this.$('.st-pg').textContent = `Страница 1 из ${pages.length || 1}`;
    const w = d.words(); this.$('.st-w').textContent = `${w} ${plural(w, 'слово', 'слова', 'слов')}`;
    if (!this.hits) this.$('.st-sel').textContent = '';
  }
  scrollEl(el, smooth = true) {
    const c = this.canvas, top = el.offsetTop - 40;
    let p = el, y = 0; while (p && p !== c) { y += p.offsetTop; p = p.offsetParent; }
    c.scrollTo({ top: Math.max(0, y - 60), behavior: smooth && !U.reduced() ? 'smooth' : 'auto' });
  }
  scrollToHit(sel = 'mark.hit') { const m = $(sel, this.pages); if (!m) return; const c = this.canvas, cr = c.getBoundingClientRect(), mr = m.getBoundingClientRect(); if (mr.top < cr.top || mr.bottom > cr.bottom) this.scrollEl(m); }
  scrollToText(text) { const el = $$('[data-b], .fns p', this.pages).find(e => e.textContent.includes(text)); if (el) this.scrollEl(el); return el; }
  find$(text) { return $$('mark.hit', this.pages).filter(m => (m.parentElement.textContent || '').includes(text)); }
}

window.Writer = Writer; window.DocModel = DocModel;

/* Ctrl+H, Ctrl+Z, Delete — для редактора на текущем слайде */
addEventListener('keydown', e => {
  const sl = window.DECK && DECK.slide; if (!sl) return;
  const host = $('.wr', sl); if (!host || !host._wr) return;
  const wr = host._wr, inField = e.target.matches && e.target.matches('input, textarea');
  if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyH' || e.code === 'KeyF')) { e.preventDefault(); e.stopPropagation(); wr.openDlg(true); wr.fq.focus(); wr.fq.select(); return; }
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !inField) { e.preventDefault(); wr.undo(); return; }
  if (e.key === 'F5' && wr.o.navOpenable) { e.preventDefault(); wr.openNav(!wr.navOn); return; }
  if ((e.key === 'Delete') && !inField && wr.sel >= 0 && wr.navOn) { e.preventDefault(); e.stopPropagation(); wr.deleteHeading(wr.sel, { user: true }); }
}, true);
})();

/* №10 · виджеты экранов. Каждый экран с редактором описан как набор состояний по шагам:
   state(wr, s) — мгновенно привести редактор к шагу s (при переходе назад или прыжке),
   anim[s](wr, tok) — то же самое, но анимацией (при нажатии «Дальше» на шаг вперёд). */
(() => {
'use strict';
const { $, $$, h, sleep, countTo, setNum, esc, pick, shuffle, plural } = U;
const W = window.W = window.W || {};
const live = tok => !tok || !tok.dead;
const nap = async (ms, tok) => { if (tok && tok.dead) throw DEAD; await sleep(U.reduced() ? Math.min(ms, 60) : ms); if (tok && tok.dead) throw DEAD; };
const quiet = e => { if (e !== DEAD) console.error(e); };

/* ---------- общий каркас для экранов с редактором ---------- */
function mkWriter(el, extra = {}) {
  const host = $('.wr', el);
  return new Writer(host, Object.assign({ doc: host.dataset.doc || 'book', file: host.dataset.file || '10-1.docx' }, extra));
}
function marks(el, s) {
  $$('[data-k]', el).forEach(x => { const k = +x.dataset.k; x.classList.toggle('hot', k === s); if (x.classList.contains('srow')) x.classList.toggle('done', k < s); });
}
function scene(cfg) {
  return {
    init(el) {
      el._wr = mkWriter(el, cfg.opts || {});
      el._s = 0;
      cfg.init && cfg.init(el, el._wr);
    },
    step(el, s, ctx) {
      const wr = el._wr;
      // анимируем только шаг «на один вперёд» и только если прошлая анимация закончилась; иначе — мгновенно
      const animate = !ctx.enter && ctx.dir > 0 && el._s === s - 1 && !el._busy && cfg.anim && cfg.anim[s];
      if (el._tok) el._tok.dead = true;
      const tok = el._tok = { dead: false };
      marks(el, s);
      el._s = s;
      if (animate) { el._busy = true; cfg.anim[s](wr, tok, el).catch(quiet).finally(() => { if (el._tok === tok) el._busy = false; }); }
      else { el._busy = false; wr.reset(cfg.base || {}); cfg.state(wr, s, el); }
    },
    leave(el) { if (el._tok) el._tok.dead = true; },
    reset(el) { el._s = -1; }
  };
}
/* мгновенные помощники */
const F = (wr, q, mc = false, ww = false, o = {}) => { wr.set({ q, mc, ww }); return wr.findAll(Object.assign({ anim: false }, o)); };
async function findAnim(wr, tok, q, o = {}) {
  if (q !== undefined && wr.q !== q) await wr.type('q', q, tok);
  if (o.mc !== undefined && wr.cmc.checked !== o.mc) await wr.tick('mc', o.mc, tok);
  if (o.ww !== undefined && wr.cww.checked !== o.ww) await wr.tick('ww', o.ww, tok);
  await nap(200, tok); await wr.press('.b-fa', tok);
  return wr.findAll({ scroll: o.scroll });
}

/* поддельное контекстное меню у элемента навигатора */
async function fakeMenu(wr, target, items, hot, tok, ms = 1100) {
  const host = wr.host, r = host.getBoundingClientRect(), t = target.getBoundingClientRect(), sc = DECK.scale;
  wr.ctx.innerHTML = items.map((it, k) => `<button class="${k === hot ? 'hot' : ''}"><span>${it[0]}</span><kbd>${it[1] || ''}</kbd></button>`).join('');
  wr.ctx.style.left = Math.min((t.left - r.left) / sc + 60, host.offsetWidth - 250) + 'px';
  wr.ctx.style.top = ((t.top - r.top) / sc + t.height / sc - 4) + 'px';
  wr.ctx.classList.add('on');
  await nap(ms, tok);
  wr.ctx.classList.remove('on');
}

/* ============ 01 · титул: живой поиск ============ */
W.hero = {
  init(el) {
    const pg = $('.hv-pg', el), src = TEXTS.mini.blocks.map(b => b[1]);
    pg.innerHTML = src.map(s => {
      const r = DocModel.find(s, 'суд', false, false); let out = '', last = 0;
      r.forEach(([a, b, w]) => { out += esc(s.slice(last, a)) + `<mark data-w="${w ? 1 : 0}">${esc(s.slice(a, b))}</mark>`; last = b; });
      return `<p>${out + esc(s.slice(last))}</p>`;
    }).join('');
  },
  async loop(el, tok) {
    const ms = $$('.hv-pg mark', el), n = $('.hv-n', el), chip = $('.hv-chip', el);
    while (live(tok)) {
      ms.forEach(m => m.className = ''); chip.classList.remove('on'); setNum(n, 0);
      await nap(900, tok);
      for (let i = 0; i < ms.length && live(tok); i++) { ms[i].classList.add('on'); setNum(n, i + 1); n.classList.remove('flash'); void n.offsetWidth; n.classList.add('flash'); await nap(520, tok); }
      await nap(1500, tok); if (!live(tok)) break;
      chip.classList.add('on');
      ms.forEach(m => m.classList.add(m.dataset.w === '1' ? 'w' : 'off'));
      countTo(n, ms.filter(m => m.dataset.w === '1').length, 600);
      await nap(2600, tok);
    }
  },
  step(el, s, ctx) { if (ctx.enter) { if (el._tok) el._tok.dead = true; const tok = el._tok = { dead: false }; if (U.reduced()) { $$('.hv-pg mark', el).forEach(m => m.classList.add('on')); setNum($('.hv-n', el), 6); } else this.loop(el, tok).catch(quiet); } },
  leave(el) { if (el._tok) el._tok.dead = true; }
};

/* ============ 01 · Ctrl+H: части диалога ============ */
const PARTS = ['.dlg-row', '.ck-mc', '.ck-ww', '.b-fa'];
function pins(wr, n, glow) {
  const dlg = $('.wr-dlg', wr.host);
  if (!$('.pin', dlg)) PARTS.forEach((sel, i) => dlg.appendChild(h('span', { class: 'pin', 'data-i': i + 1 }, String(i + 1))));
  PARTS.forEach((sel, i) => {
    const part = $(sel, dlg), pin = $(`.pin[data-i="${i + 1}"]`, dlg);
    const L = part.offsetLeft, T = part.offsetTop;
    pin.style.left = (i === 3 ? L - 36 : L - 38) + 'px';
    pin.style.top = (T + part.offsetHeight / 2 - 15 + (i === 0 ? 6 : 0)) + 'px';
    pin.classList.toggle('on', i < n);
    part.classList.toggle('glow', i === glow);
  });
}
W.ctrlh = scene({
  opts: { dlg: false },
  base: { dlg: false },
  state(wr, s, el) {
    $$('.kc', el).forEach(k => k.classList.remove('dn'));
    wr.openDlg(s >= 1, true);
    pins(wr, Math.max(0, s - 1), s >= 2 ? s - 2 : -1);
  },
  anim: {
    async 1(wr, tok, el) {
      const c = $('.k-ctrl', el), hk = $('.k-h', el);
      c.classList.add('dn'); await nap(380, tok); hk.classList.add('dn'); await nap(260, tok);
      wr.openDlg(true); pins(wr, 0, -1);
      await nap(420, tok); hk.classList.remove('dn'); c.classList.remove('dn');
    },
    async 2(wr) { pins(wr, 1, 0); }, async 3(wr) { pins(wr, 2, 1); }, async 4(wr) { pins(wr, 3, 2); }, async 5(wr) { pins(wr, 4, 3); }
  }
});

/* ============ 02 · регистр на тексте ============ */
W.caseLive = scene({
  opts: { dlg: true }, base: { dlg: true },
  state(wr, s) {
    if (s === 1) F(wr, 'суд');
    if (s === 2) F(wr, 'суд', true);
    if (s === 3) F(wr, 'Суд', true);
    if (s === 4) { F(wr, 'суд', true); afterPrefix(wr, 'Под').forEach(m => m.classList.add('ping')); }
  },
  anim: {
    async 1(wr, tok) { await findAnim(wr, tok, 'суд', { mc: false, ww: false }); },
    async 2(wr, tok) { await findAnim(wr, tok, 'суд', { mc: true }); },
    async 3(wr, tok) { await findAnim(wr, tok, 'Суд', { mc: true }); },
    async 4(wr, tok) { await findAnim(wr, tok, 'суд', { mc: true }); afterPrefix(wr, 'Под').forEach(m => m.classList.add('ping')); }
  }
});
const afterPrefix = (wr, pre) => $$('mark.hit', wr.pages).filter(m => new RegExp(pre + '$').test((m.previousSibling && m.previousSibling.textContent) || ''));

/* ============ 03 · два режима ============ */
const WHOLE = [0, 3, 5];
W.modes = {
  step(el, s) {
    $$('.md', el).forEach((m, k) => m.classList.toggle('hot', s === k + 1));
    const [a, b] = $$('.md-words', el);
    $$('.wd', a).forEach((w, i) => { const wh = WHOLE.includes(i); w.className = 'wd' + (s >= 1 ? (wh ? ' w' : ' dim') : ''); w.innerHTML = s >= 1 && wh ? `<u>${w.textContent}</u>` : w.textContent; });
    $$('.wd', b).forEach((w, i) => { const wh = WHOLE.includes(i), t = w.textContent; w.className = 'wd' + (s >= 2 ? (wh ? ' w' : ' p') : ''); w.innerHTML = s >= 2 ? t.replace(/суд/i, m => `<u>${m}</u>`) : t; });
    $$('.mbar i', el).forEach((x, i) => { const wh = WHOLE.includes(i); x.className = wh ? (s >= 4 ? 'w x' : 'w') : 'p'; });
  }
};

/* ============ 03 · всего минус целиком ============ */
W.wholeLive = scene({
  opts: { dlg: true }, base: { dlg: true },
  state(wr, s) {
    if (s === 1) F(wr, 'суд');
    if (s === 2 || s === 3) F(wr, 'суд', false, true);
    if (s === 4) { wr.setColor(true); F(wr, 'суд'); }
  },
  anim: {
    async 1(wr, tok) { await findAnim(wr, tok, 'суд', { mc: false, ww: false }); },
    async 2(wr, tok) { await findAnim(wr, tok, 'суд', { ww: true }); },
    async 3() {},
    async 4(wr, tok) { wr.setColor(true); await findAnim(wr, tok, 'суд', { ww: false }); }
  }
});

/* ============ 04 · сноски ============ */
function fnRing(wr, on) {
  const m = $('.fnm', wr.pages), f = $('.fns', wr.pages);
  [m, f].forEach(x => x && x.classList.toggle('ring', on));
  if (on && m) wr.scrollEl(m.closest('.pg'), true);
}
W.footnote = scene({
  base: { dlg: false, nav: false },
  state(wr, s) {
    if (s === 1) fnRing(wr, true);
    if (s === 2) { wr.openDlg(true); F(wr, 'суд', false, false, { scroll: false }); pingFn(wr); }
    if (s === 3) { wr.openNav(true); wr.deleteFootnotes({ anim: false }); }
    if (s === 4) { wr.deleteFootnotes({ anim: false }); wr.openDlg(true); F(wr, 'суд'); }
  },
  anim: {
    async 1(wr) { fnRing(wr, true); },
    async 2(wr, tok) {
      fnRing(wr, false); wr.openDlg(true); await nap(300, tok);
      await findAnim(wr, tok, 'суд', { mc: false, ww: false, scroll: false });
      pingFn(wr);
    },
    async 3(wr, tok) {
      wr.openDlg(false); wr.clearHits(); await nap(250, tok);
      wr.openNav(true); await nap(650, tok);
      const cat = $('.fnc', wr.host); cat.classList.add('flash');
      await fakeMenu(wr, cat, [['Удалить все сноски', '']], 0, tok, 1200);
      cat.classList.remove('flash');
      await wr.deleteFootnotes();
    },
    async 4(wr, tok) { wr.openNav(false); await nap(350, tok); wr.openDlg(true); await nap(300, tok); await findAnim(wr, tok, 'суд', { mc: false, ww: false }); }
  }
});
function pingFn(wr) {
  const fm = $$('.fns mark.hit', wr.pages);
  fm.forEach(m => m.classList.add('ping'));
  if (fm[0]) wr.scrollEl(fm[0].closest('.pg'), true);
}

/* ============ 04 · решение задачи 1 ============ */
W.solve1 = scene({
  base: { dlg: true },
  state(wr, s) {
    wr.deleteFootnotes({ anim: false }); wr.hist = [];
    if (s === 1) F(wr, 'суд');
    if (s >= 2) F(wr, 'суд', false, true);
  },
  anim: {
    async 1(wr, tok) { await findAnim(wr, tok, 'суд', { mc: false, ww: false }); },
    async 2(wr, tok) { await findAnim(wr, tok, 'суд', { ww: true }); },
    async 3() {}, async 4() {}
  }
});

/* ============ 04 · главы ============ */
const DEL2 = ['Дело о разбитой посуде', 'Глава I', 'Глава II', 'Глава V'];
async function delChapters(wr, tok, list, fast) {
  for (const t of list) {
    const row = $$('.nav-row', wr.host).find(r => r.textContent === t);
    if (row) { wr.select(+row.dataset.i); await nap(fast ? 120 : 260, tok); }
    await wr.deleteHeading(t, { fast: true });
    await nap(fast ? 120 : 200, tok);
  }
}
W.chapters = scene({
  base: { nav: true, dlg: false },
  state(wr, s) {
    if (s >= 2) DEL2.forEach(t => wr.deleteHeading(t, { anim: false }));
    if (s >= 3) { wr.openNav(s >= 6); wr.openDlg(s < 6); }
    if (s === 3) F(wr, 'он');
    if (s >= 4 && s <= 5) F(wr, 'он', false, true);
    wr.hist = [];
  },
  anim: {
    async 1(wr, tok) {
      const row = $$('.nav-row', wr.host).find(r => r.textContent === 'Глава I');
      if (!row) return; wr.select(+row.dataset.i); await nap(300, tok);
      await fakeMenu(wr, row, [['Перейти', 'Enter'], ['Удалить заголовок', 'Delete']], 1, tok, 1500);
      wr.select(-1);
    },
    async 2(wr, tok) { await delChapters(wr, tok, DEL2); },
    async 3(wr, tok) { wr.openNav(false); await nap(300, tok); wr.openDlg(true); await nap(350, tok); await findAnim(wr, tok, 'он', { mc: false, ww: false }); },
    async 4(wr, tok) { await findAnim(wr, tok, 'он', { ww: true }); },
    async 5() {},
    async 6(wr, tok) {
      wr.openDlg(false); wr.clearHits(); await nap(200, tok); wr.openNav(true); await nap(600, tok);
      const row = $$('.nav-row', wr.host).find(r => r.textContent === 'Часть первая');
      if (row) { wr.select(+row.dataset.i); await nap(500, tok); }
      await wr.deleteHeading('Часть первая');
      DECK.toast('Глава III пропала вместе с частью! Ctrl+Z…');
      await nap(1700, tok);
      wr.undo(); wr.hist = [];
      const r2 = $$('.nav-row', wr.host).find(r => r.textContent === 'Глава III'); if (r2) r2.classList.add('flash');
    }
  }
});

/* ============ 05 · дефисы ============ */
const hyphenHits = wr => $$('mark.hit', wr.pages).filter(m => /^-/.test((m.nextSibling && m.nextSibling.textContent) || ''));
W.hyphen = scene({
  base: { dlg: true },
  state(wr, s) {
    if (s >= 1) F(wr, 'как', false, true, { scroll: false });
    if (s >= 2) { hyphenHits(wr).forEach(m => m.classList.add('flag')); const m = hyphenHits(wr)[0]; if (m) wr.scrollEl(m, false); }
  },
  anim: {
    async 1(wr, tok) { await findAnim(wr, tok, 'как', { mc: false, ww: true }); },
    async 2(wr, tok) { const hs = hyphenHits(wr); if (hs[0]) wr.scrollEl(hs[0], true); await nap(500, tok); hs.forEach(m => m.classList.add('flag')); },
    async 3() {}
  }
});
W.dehyph = scene({
  base: { dlg: true },
  state(wr, s) {
    if (s === 1) wr.set({ q: '-', r: 'к' });
    if (s >= 2) { wr.set({ q: '-', r: 'к' }); wr.replaceAll({ scroll: false }); }
    if (s >= 3) F(wr, 'как', false, true);
    wr.hist = [];
  },
  anim: {
    async 1(wr, tok) { await wr.type('q', '-', tok); await nap(250, tok); await wr.type('r', 'к', tok); },
    async 2(wr, tok) { await wr.press('.b-ra', tok); wr.replaceAll(); },
    async 3(wr, tok) { await findAnim(wr, tok, 'как', { ww: true }); },
    async 4() {}
  }
});
W.task3 = scene({
  base: { dlg: true },
  state(wr, s) {
    if (s >= 2 && s <= 5) { wr.set({ q: '-', r: 'к' }); wr.replaceAll({ scroll: false }); }
    if (s === 3) F(wr, 'как', false, true);
    if (s === 4 || s === 5) F(wr, 'что', false, true);
    if (s === 6) { wr.set({ r: '' }); F(wr, 'что', false, true); }
    wr.hist = [];
  },
  anim: {
    async 1(wr, tok) { await wr.tick('ww', true, tok); await nap(500, tok); await wr.tick('ww', false, tok); },
    async 2(wr, tok) { await wr.type('q', '-', tok); await wr.type('r', 'к', tok); await nap(200, tok); await wr.press('.b-ra', tok); wr.replaceAll(); },
    async 3(wr, tok) { await findAnim(wr, tok, 'как', { ww: true }); },
    async 4(wr, tok) { await findAnim(wr, tok, 'что', { ww: true }); },
    async 5() {},
    async 6(wr, tok) { wr.undo(); await nap(500, tok); await findAnim(wr, tok, 'что', { ww: true }); }
  }
});

/* ============ 07 · тренажёр ============ */
const CH = ['Глава I', 'Глава II', 'Глава III', 'Глава IV', 'Глава V'];
const ROMAN = { 'Глава I': 'I', 'Глава II': 'II', 'Глава III': 'III', 'Глава IV': 'IV', 'Глава V': 'V' };
const SCOPES = [
  null, null,
  { keep: ['Глава II', 'Глава III'], say: 'в тексте глав II и III' },
  { keep: ['Глава IV', 'Глава V'], say: 'в тексте второй части' },
  { keep: ['Глава I'], say: 'в тексте главы I' },
  { keep: ['Глава III', 'Глава IV'], say: 'в тексте глав III и IV' },
  { keep: ['Глава I', 'Глава II', 'Глава III'], say: 'в тексте первой части' }
];
const cap = w => w[0].toUpperCase() + w.slice(1);
const TYPES = [
  { k: 'part', words: ['суд', 'он', 'полк', 'кот'], text: (w, sc) => `Определите, сколько раз${sc} встречаются слова с сочетанием букв «${w}» или «${cap(w)}» в составе других слов, но не как отдельное слово. В ответе укажите только число.` },
  { k: 'whole', words: ['суд', 'он', 'что', 'как', 'Мухин', 'кот'], text: (w, sc) => `Определите, сколько раз${sc} встречается слово «${w}» как отдельное слово (регистр написания не имеет значения; слово с дефисом, например «${w}-то», — это другое слово). В ответе укажите только число.` },
  { k: 'lower', words: ['суд', 'что', 'он'], text: (w, sc) => `Определите, сколько раз${sc} встречается отдельное слово «${w}», записанное со строчной буквы. Слова с дефисом учитывать не следует. В ответе укажите только число.` },
  { k: 'any', words: ['суд', 'он', 'посуд', 'полк', 'ход'], text: (w, sc) => `Определите, сколько раз${sc} встречается сочетание букв «${w}» в любом месте слова — отдельно или внутри других слов. Регистр не важен. В ответе укажите только число.` },
  { k: 'sum', words: [['как', 'что'], ['что', 'он'], ['суд', 'кот']], text: (p, sc) => `Определите, сколько раз${sc} встречаются отдельные слова «${p[0]}» и «${p[1]}» (регистр не важен; слова с дефисами учитывать не следует). В ответе укажите суммарное количество.` },
  { k: 'hod', words: [['ход', 'приход']], text: (p, sc) => `Определите, сколько раз${sc} встречаются слова с сочетанием букв «${p[0]}», не содержащие сочетание «${p[1]}». Отдельное слово «${p[0]}» учитывать не следует. Регистр не важен. В ответе укажите только число.` }
];
function solveTask(t) {
  const d = new DocModel(TEXTS.book), steps = [], naive = {};
  const letter = [].concat(t.w).join('').includes('к') ? 'ж' : 'к';
  const cnt = (doc, q, mc, ww) => doc.findAll(q, mc, ww).total;
  // формула на подготовленном документе
  const formula = doc => {
    const W1 = [].concat(t.w);
    if (t.k === 'part') { const a = cnt(doc, W1[0], false, false), b = cnt(doc, W1[0], false, true); return { v: a - b, parts: [[`«${W1[0]}»: ☐ регистр ☐ целиком → Найти все`, a], ['☑ Слова целиком → Найти все', b]], eq: `${a} − ${b} = ${a - b}` }; }
    if (t.k === 'whole') { const a = cnt(doc, W1[0], false, true); return { v: a, parts: [[`«${W1[0]}»: ☐ регистр ☑ целиком → Найти все`, a]], eq: `${a}` }; }
    if (t.k === 'lower') { const a = cnt(doc, W1[0], true, true); return { v: a, parts: [[`«${W1[0]}»: ☑ регистр ☑ целиком → Найти все`, a]], eq: `${a}` }; }
    if (t.k === 'any') { const a = cnt(doc, W1[0], false, false); return { v: a, parts: [[`«${W1[0]}»: ☐ регистр ☐ целиком → Найти все`, a]], eq: `${a}` }; }
    if (t.k === 'sum') { const a = cnt(doc, W1[0], false, true), b = cnt(doc, W1[1], false, true); return { v: a + b, parts: [[`«${W1[0]}»: ☑ целиком`, a], [`«${W1[1]}»: ☑ целиком`, b]], eq: `${a} + ${b} = ${a + b}` }; }
    if (t.k === 'hod') { const a = cnt(doc, W1[0], false, false), b = cnt(doc, W1[0], false, true), c = cnt(doc, W1[1], false, false); return { v: a - b - c, parts: [[`«${W1[0]}»: всего`, a], [`«${W1[0]}»: ☑ целиком`, b], [`«${W1[1]}»: всего`, c]], eq: `${a} − ${b} − ${c} = ${a - b - c}` }; }
  };
  // наивные ответы — чтобы подсказать, где ошибка
  if (t.fn) { const d0 = new DocModel(TEXTS.book); prep(d0, { fn: false, keep: t.keep, letter }); naive.fn = formula(d0).v; }
  if (t.keep) { const d0 = new DocModel(TEXTS.book); prep(d0, { fn: t.fn, keep: null, letter }); naive.keep = formula(d0).v; }
  { const d0 = new DocModel(TEXTS.book); prep(d0, { fn: t.fn, keep: t.keep, letter: null }); naive.hy = formula(d0).v; }
  const info = prep(d, { fn: t.fn, keep: t.keep, letter });
  if (info.fn) steps.push(['Навигатор → Сноски → Удалить все сноски', '']);
  if (info.del.length) steps.push([`Навигатор → удалить: ${info.del.map(x => '«' + x + '»').join(', ')}`, '']);
  steps.push([`Ctrl+H: «-» → «${letter}», Заменить все`, info.hy ? `${info.hy} шт.` : '']);
  const f = formula(d);
  f.parts.forEach(p => steps.push(p));
  steps.push(['Ответ: ' + f.eq, '']);
  return { v: f.v, steps, naive };
}
function prep(d, { fn, keep, letter }) {
  const info = { fn: 0, del: [], hy: 0 };
  if (fn) info.fn = d.deleteFootnotes();
  if (keep) {
    // удаляем название, лишние части целиком (если в них нет нужных глав) и лишние главы
    const hs = () => d.headings();
    const parts = hs().filter(x => x.t === 'h1').map(x => x.s);
    const t0 = hs().find(x => x.t === 'h0'); if (t0) { d.deleteHeading(t0.i); info.del.push(t0.s); }
    parts.forEach(p => {
      const i = d.idxOf(p); const [a, b] = d.chapterRange(i);
      const chs = d.blocks.slice(a, b).filter(x => x.t === 'h2').map(x => x.s);
      if (!chs.some(c => keep.includes(c))) { d.deleteHeading(i); info.del.push(p); }
    });
    CH.forEach(c => { if (!keep.includes(c)) { const i = d.idxOf(c); if (i >= 0) { d.deleteHeading(i); info.del.push(c); } } });
  }
  if (letter) info.hy = d.replaceAll('-', letter, false, false).n;
  return info;
}
function genTask(prevKey) {
  for (let tries = 0; tries < 200; tries++) {
    const T = pick(TYPES), w = pick(T.words), sc = pick(SCOPES);
    const hasFn = !sc || sc.keep.some(c => ['Глава II', 'Глава IV', 'Глава V'].includes(c));
    const fn = hasFn && Math.random() < .6;
    const t = { k: T.k, w, keep: sc ? sc.keep : null, fn };
    const key = JSON.stringify(t); if (key === prevKey) continue;
    const r = solveTask(t);
    if (r.v <= 0 || r.v > 60) continue;
    const scTxt = (sc ? ' ' + sc.say : '') + (fn ? ', не считая сносок,' : '');
    t.text = T.text(w, scTxt);
    t.key = key; t.r = r;
    return t;
  }
}
W.trainer = {
  init(el) {
    const wr = el._wr = mkWriter(el, { dlg: false, nav: false });
    el._n = 0; el._ok = 0; el._tries = 0;
    const inp = $('.tr-in', el);
    $('.tr-new', el).addEventListener('click', e => { e.currentTarget.blur(); this.newTask(el); });
    $('.tr-check', el).addEventListener('click', e => { e.currentTarget.blur(); this.check(el); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.check(el); } });
    $('.tr-solve', el).addEventListener('click', e => { e.currentTarget.blur(); this.solve(el); });
    $('.tr-reset', el).addEventListener('click', e => { e.currentTarget.blur(); wr.reset(); DECK.toast('Файл открыт заново'); });
    this.newTask(el);
  },
  newTask(el) {
    const t = el._t = genTask(el._t && el._t.key); el._n++; el._solved = false;
    $('.tr-no', el).textContent = `задача ${el._n}`;
    $('.tr-text', el).innerHTML = esc(t.text).replace(/«([^»]+)»/g, '«<b>$1</b>»');
    const inp = $('.tr-in', el); inp.value = ''; inp.className = 'tr-in';
    $('.tr-msg', el).className = 'tr-msg'; $('.tr-msg', el).innerHTML = 'Реши в редакторе справа: <kbd>Ctrl</kbd>+<kbd>H</kbd> — поиск, <kbd>F5</kbd> — навигатор.';
    $('.tr-sol', el).innerHTML = '';
    el._wr.reset();
    this.score(el);
  },
  score(el) { $('.tr-score', el).textContent = el._n > 1 || el._ok ? `верно: ${el._ok}` : ''; },
  check(el) {
    const inp = $('.tr-in', el), msg = $('.tr-msg', el), v = parseInt(inp.value, 10), t = el._t;
    if (isNaN(v)) { msg.className = 'tr-msg'; msg.textContent = 'Введи число.'; inp.focus(); return; }
    if (v === t.r.v) {
      inp.className = 'tr-in ok'; msg.className = 'tr-msg ok'; msg.innerHTML = '<b>Верно!</b> Жми «Новая задача».';
      if (!el._solved) { el._ok++; el._solved = true; } this.score(el);
    } else {
      inp.className = 'tr-in'; void inp.offsetWidth; inp.className = 'tr-in bad';
      const nv = t.r.naive; let why = 'Проверь галочки и формулу.';
      if (t.fn && v === nv.fn) why = 'Похоже, остались <b>сноски</b>.';
      else if (t.keep && v === nv.keep) why = 'Похоже, не удалены <b>лишние главы</b>.';
      else if (v === nv.hy) why = 'Похоже, не заменены <b>дефисы</b>.';
      msg.className = 'tr-msg bad'; msg.innerHTML = `Не сходится. ${why}`;
    }
  },
  solve(el) {
    const t = el._t;
    $('.tr-sol', el).innerHTML = t.r.steps.map(([a, v], i) => `<div style="animation-delay:${i * 90}ms"><b>${i + 1}</b><span>${esc(a)}</span>${v !== '' ? `<span class="v">${v}</span>` : ''}</div>`).join('');
  },
  step() {}, leave() {}
};

})();

/* ion_inf · движок интерактивного урока: шаги, пояснения, вопросы, инструменты преподавателя */
(() => {
'use strict';
const { $, $$ } = U;
const stage = $('#stage'), deck = $('#deck');
const slides = $$('.slide', deck), N = slides.length;
const SEC = window.SECTIONS || {}, W = window.W || {}, NOTES = window.NOTES || {};
const pad = n => String(n).padStart(2, '0');
const KEY = 'soft:interactive:10:writer:v2';
const BC = document.body.classList;
let SCALE = 1, cur = -1, step = 0, notesOpen = false;
const inited = new Set();

/* ---------- toast ---------- */
const toastEl = $('#toast'); let toastT;
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 1800); }

/* ---------- scale ---------- */
const NW = () => Math.min(460, Math.max(360, innerWidth * 0.28));
function fit() {
  const docked = notesOpen && innerWidth >= 1100;
  const nw = docked ? NW() : 0;
  document.documentElement.style.setProperty('--nw', nw + 'px');
  document.documentElement.style.setProperty('--nwf', (innerWidth >= 1100 ? NW() : Math.min(420, innerWidth)) + 'px');
  const top = $('#top').offsetHeight, dock = $('#dock').offsetHeight;
  const aw = innerWidth - nw, ah = innerHeight - top - dock;
  SCALE = Math.max(0.1, Math.min(aw / 1600, ah / 900));
  stage.style.left = (aw / 2 - 800) + 'px';
  stage.style.top = (top + ah / 2 - 450) + 'px';
  stage.style.transform = `scale(${SCALE})`;
}
addEventListener('resize', fit);

U.syncRv = el => { const s = cur >= 0 && slides[cur] === el ? step : 0; $$('[data-r]', el).forEach(e => e.classList.toggle('open', s >= +e.dataset.r)); };
window.DECK = {
  get scale() { return SCALE; }, stage, toast,
  rel(el) { const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: (r.left - s.left) / SCALE, y: (r.top - s.top) / SCALE, w: r.width / SCALE, h: r.height / SCALE }; },
  next: () => next(), prev: () => prev(), go: (id, s = 0) => show(typeof id === 'number' ? id : slides.findIndex(x => x.dataset.id === id), s, 1),
  get step() { return step; }, get slide() { return slides[cur]; },
  refresh: () => chrome()
};

/* ---------- steps ---------- */
const stepsOf = i => +(slides[i].dataset.steps || 0);
function applySteps(el, s) {
  $$('[data-s]', el).forEach(e => {
    const v = e.dataset.s; let on;
    if (v.includes('-')) { const [a, b] = v.split('-').map(Number); on = s >= a && s <= b; } else on = s >= +v;
    e.classList.toggle('on', on);
  });
  $$('[data-r]', el).forEach(e => e.classList.toggle('open', s >= +e.dataset.r || e.dataset.man === '1'));
  $$('[data-m]', el).forEach(e => { e.classList.toggle('lit', s >= +e.dataset.m); e.classList.toggle('now', s === +e.dataset.m); });
  $$('.ide', el).forEach(ide => { let n = 0; $$('.ln', ide).forEach(ln => { const vis = !ln.hasAttribute('data-s') || ln.classList.contains('on'); if (vis) { const i = ln.querySelector('i'); if (i) i.textContent = ++n; } }); });
}
function show(i, s = 0, dir = 1) {
  if (i < 0 || isNaN(i)) i = 0;
  i = Math.min(N - 1, i); s = Math.max(0, Math.min(stepsOf(i), s));
  const enter = i !== cur;
  if (enter && cur >= 0 && inited.has(cur)) { const o = slides[cur], w = W[o.dataset.w]; if (w && w.leave) try { w.leave(o); } catch (e) { console.error(e); } }
  cur = i; step = s;
  slides.forEach((el, k) => { el.classList.toggle('cur', k === cur); el.classList.toggle('back', k < cur); el.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
  const el = slides[cur], w = W[el.dataset.w];
  if (w && !inited.has(cur)) { try { w.init && w.init(el); } catch (e) { console.error(e); } inited.add(cur); }
  if (enter || dir < 0) $$('[data-man]', el).forEach(e => { if (+e.dataset.r > step) delete e.dataset.man; });
  applySteps(el, step);
  if (w && w.step) try { w.step(el, step, { dir, enter }); } catch (e) { console.error(e); }
  if (enter) { clearInk(); closeAsks(); }
  chrome(); renderNotes();
  try { localStorage.setItem(KEY, JSON.stringify({ slide: i+1, id: el.dataset.id, title: el.dataset.title, step })); } catch (e) {}
  try { const hash = '#' + el.dataset.id + (step ? '.' + step : ''); if (location.hash !== hash) history.replaceState(null, '', hash); } catch (e) {}
}
function next() { const w0 = W[slides[cur].dataset.w]; if (w0 && w0.next && w0.next(slides[cur], step) === true) { chrome(); return; } if (step < stepsOf(cur)) show(cur, step + 1, 1); else if (cur < N - 1) show(cur + 1, 0, 1); else show(0, 0, 1); }
function prev() { if (step > 0) show(cur, step - 1, -1); else if (cur > 0) show(cur - 1, stepsOf(cur - 1), -1); }

/* ---------- chrome ---------- */
const tabs = $('#tabs');
tabs.innerHTML = Object.entries(SEC).map(([k, v]) => `<button data-sec="${k}"><i>${pad(k)}</i>${v}</button>`).join('');
$$('button', tabs).forEach(b => b.addEventListener('click', () => { b.blur(); show(slides.findIndex(s => s.dataset.sec === b.dataset.sec), 0, 1); }));
const bar = $('#bar'), barFill = $('#bar i');
(function ticks() {
  let last = slides[0].dataset.sec;
  slides.forEach((s, i) => { if (s.dataset.sec !== last) { last = s.dataset.sec; const t = document.createElement('b'); t.style.left = (i / N * 100) + '%'; bar.appendChild(t); } });
})();
bar.addEventListener('click', e => { const r = bar.getBoundingClientRect(); show(Math.floor((e.clientX - r.left) / r.width * N), 0, 1); });
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const STEPI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5l8 7-8 7"/></svg>';
function btnLabel() {
  const el = slides[cur], st = stepsOf(cur), w = W[el.dataset.w];
  if (w && w.btn) { const l = w.btn(el, step); if (l) return [l, true]; }
  if (step < st) { const labels = (el.dataset.btns || '').split('|'); return [labels[step] || 'Дальше', true]; }
  return [cur === N - 1 ? 'В начало' : 'Дальше', false];
}
function chrome() {
  const el = slides[cur], sec = el.dataset.sec, more = step < stepsOf(cur);
  $$('button', tabs).forEach(b => b.classList.toggle('on', b.dataset.sec === sec));
  $('#dSec').textContent = `${pad(sec)} · ${SEC[sec]}`;
  $('#dNext').textContent = more ? 'Дальше: следующий шаг на этом экране' : (cur < N - 1 ? 'Дальше: ' + slides[cur + 1].dataset.title : 'Это последний экран');
  const frac = (cur + (stepsOf(cur) ? step / stepsOf(cur) : 1)) / N;
  barFill.style.width = (Math.max(frac, 1 / N) * 100) + '%';
  $('#cnt').textContent = `${pad(cur + 1)} / ${pad(N)}`;
  const [l, inSlide] = btnLabel();
  $('#bNext').innerHTML = `<span>${l}</span>${inSlide ? STEPI : ARROW}`;
  $('#bPrev').disabled = cur === 0 && step === 0;
  $$('#tocList button').forEach(b => b.classList.toggle('on', +b.dataset.i === cur));
  $('#nTitle').textContent = el.dataset.title;
}
$('#bNext').addEventListener('click', e => { e.currentTarget.blur(); next(); });
$('#bPrev').addEventListener('click', e => { e.currentTarget.blur(); prev(); });

/* ---------- TOC ---------- */
(function buildToc() {
  let h = '', last = 0;
  slides.forEach((s, i) => {
    if (+s.dataset.sec !== last) { last = +s.dataset.sec; h += `<h4>${pad(last)} · ${SEC[last]}</h4>`; }
    h += `<button data-i="${i}"><i>${pad(i + 1)}</i>${s.dataset.title}</button>`;
  });
  $('#tocList').innerHTML = h;
  $$('#tocList button').forEach(b => b.addEventListener('click', () => { closeOv(); show(+b.dataset.i, 0, 1); }));
})();

/* ---------- overlays ---------- */
const ovOpen = () => $$('.ov.open').length > 0;
function toggleOv(id) { const o = $('#' + id), on = !o.classList.contains('open'); closeOv(); o.classList.toggle('open', on); }
function closeOv() { $$('.ov').forEach(o => o.classList.remove('open')); }
$$('.ov').forEach(o => o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-close]')) closeOv(); }));
$('#bHelp').addEventListener('click', e => { e.currentTarget.blur(); toggleOv('ovHelp'); });
$('#bToc').addEventListener('click', e => { e.currentTarget.blur(); toggleOv('ovToc'); });
$('#bMenu').addEventListener('click', e => { e.currentTarget.blur(); toggleOv('ovToc'); });

/* ---------- ink / laser / spot ---------- */
const ink = $('#ink'), ctx = ink.getContext('2d'), laser = $('#laser'), spot = $('#spot');
let drawOn = false, drawing = false, laserOn = false, lastP = null;
function clearInk() { ctx.clearRect(0, 0, 1600, 900); }
const toStage = e => { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) / SCALE, y: (e.clientY - r.top) / SCALE }; };
ink.addEventListener('pointerdown', e => { if (!drawOn) return; drawing = true; lastP = toStage(e); ink.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.arc(lastP.x, lastP.y, 2.6, 0, 7); ctx.fillStyle = '#E5322D'; ctx.fill(); });
ink.addEventListener('pointermove', e => {
  if (!drawing) return; const p = toStage(e);
  ctx.strokeStyle = '#E5322D'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(lastP.x, lastP.y); ctx.lineTo(p.x, p.y); ctx.stroke(); lastP = p;
});
ink.addEventListener('pointerup', () => { drawing = false; });
function setDraw(on) { drawOn = on; ink.classList.toggle('on', on); $('#bDraw').classList.toggle('on', on); toast(on ? 'Рисование включено · C стирает' : 'Рисование выключено'); }
function setLaser(on) { laserOn = on; BC.toggle('laser', on); laser.style.display = on ? 'block' : 'none'; toast(on ? 'Лазерная указка' : 'Указка выключена'); }
addEventListener('pointermove', e => {
  if (laserOn) { laser.style.left = e.clientX + 'px'; laser.style.top = e.clientY + 'px'; }
  if (spot.classList.contains('on')) { spot.style.setProperty('--sx', e.clientX + 'px'); spot.style.setProperty('--sy', e.clientY + 'px'); }
});
$('#bDraw').addEventListener('click', e => { e.currentTarget.blur(); setDraw(!drawOn); });

/* ---------- notes ---------- */
const nBody = $('#nBody');
function renderNotes() {
  const el = slides[cur], arr = NOTES[el.dataset.id] || [];
  nBody.innerHTML = arr.length ? arr.map(x => {
    const [n, t] = Array.isArray(x) ? x : [0, x];
    const tip = t.startsWith('!');
    const cls = [n > step ? 'fut' : '', n === step && n > 0 ? 'now' : '', tip ? 'tip' : ''].join(' ');
    return `<p class="${cls}">${n > 0 ? `<span class="st">ШАГ ${n}</span>` : ''}${tip ? t.slice(1) : t}</p>`;
  }).join('') : '<p>На этом экране всё видно без пояснений.</p>';
  const now = $('p.now', nBody);
  if (now && notesOpen) nBody.scrollTo({ top: Math.max(0, now.offsetTop - nBody.clientHeight / 3), behavior: 'smooth' });
}
function setNotes(on) { notesOpen = on; BC.toggle('notes-open', on); $('#bNotes').classList.toggle('on', on); fit(); setTimeout(fit, 520); renderNotes(); }
$('#bNotes').addEventListener('click', e => { e.currentTarget.blur(); setNotes(!notesOpen); });
$('#nClose').addEventListener('click', () => setNotes(false));

/* ---------- asks ---------- */
function closeAsks() { $$('.ask.open').forEach(a => a.classList.remove('open')); }
deck.addEventListener('click', e => {
  const rv = e.target.closest('.rv, .rvc, .qc, .fc');
  if (rv && !rv.classList.contains('open')) {
    const r = +(rv.dataset.r || 0);
    // карточка следующего шага = «Дальше» (вместе с анимацией шага); остальные открываются сами по себе
    if (r && r === step + 1 && slides[cur].contains(rv)) { next(); return; }
    rv.classList.add('open'); if (r) rv.dataset.man = '1';
    rv.dispatchEvent(new CustomEvent('reveal', { bubbles: true })); return;
  }
  const b = e.target.closest('.ask>button');
  if (b) { const a = b.parentElement, on = !a.classList.contains('open'); closeAsks(); a.classList.toggle('open', on); b.blur(); return; }
  if (!e.target.closest('.ask')) closeAsks();
});
function toggleAsk() { const a = $('.ask', slides[cur]); if (!a) { toast('На этом экране нет вопроса'); return; } const on = !a.classList.contains('open'); closeAsks(); a.classList.toggle('open', on); }

/* ---------- fullscreen ---------- */
function fullscreen() {
  try { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => toast('Полный экран недоступен в этом окне')); else document.exitFullscreen(); } catch (e) { toast('Полный экран недоступен в этом окне'); }
}
$('#bFull').addEventListener('click', e => { e.currentTarget.blur(); fullscreen(); });
document.addEventListener('fullscreenchange', () => setTimeout(fit, 60));

/* ---------- keys ---------- */
addEventListener('keydown', e => {
  if (e.target.matches && e.target.matches('input, textarea, select, [contenteditable]')) { if (e.key === 'Escape') e.target.blur(); return; }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('button, a')) return;
  const k = e.key, c = e.code;
  const w = W[slides[cur].dataset.w];
  if (w && w.key && w.key(slides[cur], e) === true) { e.preventDefault(); return; }
  if (k === 'Escape') {
    if (ovOpen()) return closeOv();
    if ($('.ask.open')) return closeAsks();
    if ($('#blank').classList.contains('on')) return $('#blank').classList.remove('on');
    if (drawOn) return setDraw(false);
    if (laserOn) return setLaser(false);
    if (spot.classList.contains('on')) return spot.classList.remove('on');
    if (notesOpen) return setNotes(false);
    return;
  }
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
  else if (c === 'KeyR') { const w2 = W[slides[cur].dataset.w]; if (w2 && w2.reset) w2.reset(slides[cur]); show(cur, 0, -1); toast('Экран сначала'); }
});
$('#blank').addEventListener('click', () => $('#blank').classList.remove('on'));

/* ---------- wheel & swipe ---------- */
let wheelT = 0, wheelAcc = 0;
deck.addEventListener('wheel', e => {
  const t = e.target;
  if (t.closest('input, textarea, .scrollable, .nowheel')) return;
  e.preventDefault();
  const now = Date.now(); if (now - wheelT < 650) return;
  wheelAcc += e.deltaY;
  if (Math.abs(wheelAcc) > 50) { wheelAcc > 0 ? next() : prev(); wheelAcc = 0; wheelT = now; }
}, { passive: false });
let tx = null, ty = null;
deck.addEventListener('touchstart', e => { if (e.target.closest('input, textarea, .scrollable, .nowheel, button')) { tx = null; return; } tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
deck.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev(); tx = null; });

/* ---------- start ---------- */
fit();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
const previousSlides = new Map([
  ['search', 'ctrlh'], ['writer-case', 'case-live'], ['writer-whole', 'whole-live'],
  ['hem-hyphen', 'hyphen'], ['kuprin-count', 'task1-solve'], ['tolstoy-count', 'chapters'],
  ['hem-count', 'task3'], ['practice', 'trainer']
]);
function fromHash() {
  const match = location.hash.match(/^#([a-z0-9-]+)(?:\.(\d+))?$/);
  if (!match) return [-1, 0];
  const id = previousSlides.get(match[1]) || match[1];
  const index = slides.findIndex(s => s.dataset.id === id);
  return [index, previousSlides.has(match[1]) ? 0 : Number(match[2] || 0)];
}
addEventListener('hashchange', () => {
  const [i, s] = fromHash();
  if (i >= 0 && (i !== cur || s !== step)) show(i, s);
});
const [start, startStep] = fromHash();
let sv;
try {
  sv = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (sv && previousSlides.has(sv.id)) sv = {id: previousSlides.get(sv.id), step: 0};
} catch {}
show(start >= 0 ? start : 0, startStep);
if (start < 0) {
  try {
    if (sv && sv.id && sv.id !== slides[0].dataset.id) {
      const i = slides.findIndex(s => s.dataset.id === sv.id);
      if (i > 0) {
        const r = $('#resume'); r.querySelector('span').textContent = `Продолжить: «${slides[i].dataset.title}»`;
        r.classList.add('on'); r.onclick = () => { r.classList.remove('on'); show(i, Number.isInteger(sv.step) ? sv.step : 0, 1); };
        setTimeout(() => r.classList.remove('on'), 9000);
      }
    }
  } catch (e) {}
}
})();
