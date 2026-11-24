'use strict';

function celebrate(slide) {
  clearConfetti(slide);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#B9521D', '#FFD8BE', '#2F855A', '#1F6FEB', '#6B46C1', '#B7791F'];
  for (let i = 0; i < 72; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.setAttribute('aria-hidden', 'true');
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[i % colors.length];
    slide.append(piece);
    const drift = (Math.random() - .5) * 300;
    const rotation = Math.random() * 720;
    piece.animate([{ transform: 'translateY(0)' }, { transform: `translate(${drift}px, 960px) rotate(${rotation}deg)` }],
      { duration: 1800 + Math.random() * 1400, delay: Math.random() * 300, easing: 'cubic-bezier(.2,.6,.4,1)' })
      .onfinish = () => piece.remove();
  }
}

function clearConfetti(slide) {
  slide.querySelectorAll('.confetti').forEach(piece => piece.remove());
}

function integerAnswer(input) {
  const value = input.value.trim();
  return /^\d+$/.test(value) ? Number(value) : NaN;
}

function alphabetTasks() {
  const letters = [
    null,
    { text: 'латинские буквы без учёта регистра', count: 26 },
    { text: 'латинские буквы обоих регистров', count: 52 }
  ];
  const digits = { text: 'десятичные цифры', count: 10 };
  const signs = [
    null,
    { text: 'три знака (!, ?, #)', count: 3 },
    { text: 'шесть знаков (!, ?, #, @, %, &)', count: 6 },
    { text: '1020 специальных символов', count: 1020 }
  ];
  const tasks = [];
  const list = new Intl.ListFormat('ru', { type: 'conjunction' });
  for (const letterSet of letters) {
    for (const digitSet of [null, digits]) {
      for (const signSet of signs) {
        const sets = [letterSet, digitSet, signSet].filter(Boolean);
        if (!sets.length) continue;
        tasks.push({
          condition: 'В пароле разрешены ' + list.format(sets.map(set => set.text)) + '. Какова мощность алфавита N?',
          counts: sets.map(set => set.count),
          size: sets.reduce((sum, set) => sum + set.count, 0)
        });
      }
    }
  }
  return tasks;
}

const bitTrainer = {
  leave: clearConfetti,
  init(slide) {
    const get = selector => slide.querySelector(selector);
    const sizeInput = get('#size-input'), bitInput = get('#bit-input');
    const bitStage = get('#bit-stage'), feedback = get('.feedback'), target = get('#target-size');
    const tasks = alphabetTasks();
    let task = tasks.find(example => example.size === 65);
    let remaining = tasks.filter(example => example !== task);
    let solved = false;

    function resetBits() {
      bitStage.disabled = true;
      target.textContent = 'N';
      bitInput.value = '';
      solved = false;
      feedback.textContent = '';
      feedback.classList.remove('correct');
      clearConfetti(slide);
    }
    function showTask() {
      resetBits();
      sizeInput.value = '';
      get('#alphabet-task').textContent = task.condition;
    }
    get('#new-task').addEventListener('click', () => {
      if (!remaining.length) remaining = tasks.filter(example => example !== task);
      const index = Math.floor(Math.random() * remaining.length);
      task = remaining.splice(index, 1)[0];
      showTask();
      sizeInput.focus();
    });
    sizeInput.addEventListener('input', resetBits);
    get('#size-form').addEventListener('submit', event => {
      event.preventDefault();
      if (integerAnswer(sizeInput) !== task.size) {
        feedback.textContent = 'Посчитай разные символы в перечисленных наборах и сложи количества.';
        return;
      }
      bitStage.disabled = false;
      target.textContent = task.size;
      const sum = task.counts.length > 1 ? task.counts.join(' + ') + ' = ' : '';
      feedback.textContent = `Верно! N = ${sum}${task.size}. Теперь найди наименьшее целое i.`;
      bitInput.focus();
    });
    bitInput.addEventListener('input', () => {
      feedback.textContent = '';
      feedback.classList.remove('correct');
    });
    get('#bit-form').addEventListener('submit', event => {
      event.preventDefault();
      const bits = integerAnswer(bitInput), minimum = Math.ceil(Math.log2(task.size));
      const correct = bits === minimum;
      feedback.classList.toggle('correct', correct);
      if (correct) {
        feedback.textContent = `Верно! N = ${task.size}, i = ${bits}. Проверка: ${2 ** (bits - 1)} < ${task.size} ≤ ${2 ** bits}.`;
        if (!solved) celebrate(slide);
        solved = true;
      } else if (!Number.isSafeInteger(bits)) {
        feedback.textContent = 'Введи целое число бит.';
      } else {
        feedback.textContent = bits < minimum ? 'Кодов мало. Увеличь число бит.' : 'Кодов хватает и при меньшем числе бит. Попробуй ещё раз.';
      }
    });
    showTask();
  }
};

const readingStages = [
  'Читаем условие',
  'Дано · длина и алфавит',
  'Дано · правила хранения',
  'Дано · записи в базе',
  'Найти · объём и единицы ответа'
];

function focusCondition(slide, step) {
  const view = slide.querySelector('.kimv');
  const page = view.querySelector('.kimp');
  const paragraphs = new Set();
  for (const mark of page.querySelectorAll('[data-read]')) {
    const phase = Number(mark.dataset.read);
    mark.classList.toggle('read', phase <= step);
    if (phase === step) paragraphs.add(mark.closest('p'));
  }
  const width = view.clientWidth, height = view.clientHeight;
  let scale = Math.min(.95 * width / page.offsetWidth, .95 * height / page.offsetHeight, 1.3);
  let x = (width - page.offsetWidth * scale) / 2;
  let y = (height - page.offsetHeight * scale) / 2;
  if (paragraphs.size) {
    const zones = [...paragraphs];
    const top = Math.min(...zones.map(p => p.offsetTop));
    const bottom = Math.max(...zones.map(p => p.offsetTop + p.offsetHeight));
    const column = zones[0];
    scale = Math.min(.92 * width / column.offsetWidth, .86 * height / (bottom - top), 1.75);
    x = width / 2 - (column.offsetLeft + column.offsetWidth / 2) * scale;
    y = height / 2 - (top + bottom) / 2 * scale;
  }
  page.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${step ? 0 : -.9}deg)`;
  slide.querySelector('.reading-stage').textContent = readingStages[step];
}

const practice = {
  leave: clearConfetti,
  init(slide) {
    const form = slide.querySelector('.try-answer');
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (integerAnswer(form.elements.answer) === Number(slide.querySelector('.board-answer b').textContent)) {
        form.elements.answer.blur();
        window.__deck.show(window.__deck.cur, Number(slide.dataset.steps));
      } else {
        form.querySelector('output').textContent = 'Проверь округление одной записи и единицы ответа.';
      }
    });
  },
  step(slide, step) {
    const solutionStep = step - (readingStages.length - 1);
    const reading = solutionStep <= 0;
    slide.querySelector('.condition').hidden = !reading;
    slide.querySelector('.solution-view').hidden = reading;
    slide.querySelector('.try-answer').hidden = solutionStep !== 0;
    if (reading) focusCondition(slide, step);
    slide.querySelectorAll('.timeline li').forEach((item, i) => {
      item.classList.toggle('active', i + 1 === solutionStep);
      item.classList.toggle('done', i + 1 < solutionStep);
    });
    if (!step) slide.querySelector('.try-answer').reset();
    if (step === Number(slide.dataset.steps)) celebrate(slide);
    else clearConfetti(slide);
  }
};

window.DECK = {
  sections: { 1: 'Пароль и алфавит', 2: 'Биты и байты', 3: 'Запись в базе', 4: 'Практика' },
  key: 'soft:interactive:11-passwords', prefix: 'soft11', widgets: { trainer: bitTrainer, practice }
};

window.NOTES = {
  start: ['Прочитайте ABBA, заменяя A на 0, а B на 1. Для хранения четырёх получившихся бит задаче достаточно одного байта.'],
  length: ['Спросите, сколько позиций займут два одинаковых символа подряд. Длина меняется с каждым новым символом.'],
  alphabet: ['Даже если в конкретном пароле встретились только две буквы, код должен предусматривать любой символ, разрешённый условием.'],
  bits: ['Дописав один бит, получаем два продолжения каждого старого кода. Поэтому число кодов с каждым битом удваивается.'],
  trainer: ['Для первого условия складываем 52 буквы, 10 цифр и 3 знака. Для 65 символов шести бит мало: 2⁶ = 64. Берём 7 бит. Кнопка «Новое условие» меняет наборы символов.'],
  bytes: ['Второй байт берём целиком, даже когда последний бит остался свободным. Округление каждого символа до байта завысило бы объём.'],
  record: ['Уточните единицы. Дополнительные сведения в примере уже заданы в байтах и относятся к каждой записи.'],
  algorithm: ['Попросите ученика назвать единицы после каждого шага: символы, биты на символ, байты на пароль, байты на запись и объём всей базы.'],
  identifiers: ['Сначала предложите решить самостоятельно. Для 1020 специальных символов и десяти цифр десяти бит уже мало.', [10, '1265 = 158 × 8 + 1. Один оставшийся бит требует ещё одного байта на каждый идентификатор.']],
  users: ['Сначала определите размер пароля. 16 байт дополнительных сведений прибавляются для каждого из 20 пользователей.'],
  summary: ['Сверьте единицы в последней строке своего решения с вопросом задачи.']
};
