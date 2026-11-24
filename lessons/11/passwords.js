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

const bitTrainer = {
  leave: clearConfetti,
  init(slide) {
    const get = selector => slide.querySelector(selector);
    const letters = get('#letters'), digits = get('#digits'), special = get('#special');
    const sizeInput = get('#size-input'), bitInput = get('#bit-input');
    const bitStage = get('#bit-stage'), feedback = get('.feedback'), target = get('#target-size');
    const components = () => [Number(letters.value), digits.checked ? 10 : 0, Number(special.value)].filter(Boolean);
    const size = () => components().reduce((sum, count) => sum + count, 0);
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
    function changeAlphabet() {
      resetBits();
      sizeInput.value = '';
      const empty = size() === 0;
      sizeInput.disabled = empty;
      get('#size-form button').disabled = empty;
      if (empty) feedback.textContent = 'Добавь в алфавит хотя бы один набор символов.';
    }
    get('.alphabet-controls').addEventListener('change', changeAlphabet);
    sizeInput.addEventListener('input', resetBits);
    get('#size-form').addEventListener('submit', event => {
      event.preventDefault();
      if (integerAnswer(sizeInput) !== size()) {
        feedback.textContent = 'Посчитай разные символы в выбранных наборах и сложи количества.';
        return;
      }
      bitStage.disabled = false;
      target.textContent = size();
      feedback.textContent = 'Верно. Теперь найди наименьшее целое i.';
      bitInput.focus();
    });
    bitInput.addEventListener('input', () => {
      feedback.textContent = '';
      feedback.classList.remove('correct');
    });
    get('#bit-form').addEventListener('submit', event => {
      event.preventDefault();
      const bits = integerAnswer(bitInput), minimum = Math.ceil(Math.log2(size()));
      const correct = bits === minimum;
      feedback.classList.toggle('correct', correct);
      if (correct) {
        feedback.textContent = `Верно! N = ${size()}, i = ${bits}. Проверка: ${2 ** (bits - 1)} < ${size()} ≤ ${2 ** bits}.`;
        if (!solved) celebrate(slide);
        solved = true;
      } else if (!Number.isSafeInteger(bits)) {
        feedback.textContent = 'Введи целое число бит.';
      } else {
        feedback.textContent = bits < minimum ? 'Кодов мало. Увеличь число бит.' : 'Кодов хватает и при меньшем числе бит. Попробуй ещё раз.';
      }
    });
    changeAlphabet();
  }
};

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
    slide.querySelector('.condition').hidden = step > 0;
    slide.querySelector('.solution-view').hidden = step === 0;
    slide.querySelectorAll('.timeline li').forEach((item, i) => {
      item.classList.toggle('active', i + 1 === step);
      item.classList.toggle('done', i + 1 < step);
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
  trainer: ['Составьте алфавит из двух регистров латинских букв и десяти цифр. Получится 62 символа — хватает 6 бит. Добавьте три спецсимвола: теперь N = 65, понадобится 7 бит.'],
  bytes: ['Второй байт берём целиком, даже когда последний бит остался свободным. Округление каждого символа до байта завысило бы объём.'],
  record: ['Уточните единицы. Дополнительные сведения в примере уже заданы в байтах и относятся к каждой записи.'],
  algorithm: ['Попросите ученика назвать единицы после каждого шага: символы, биты на символ, байты на пароль, байты на запись и объём всей базы.'],
  identifiers: ['Сначала предложите решить самостоятельно. Для 1020 специальных символов и десяти цифр десяти бит уже мало.', [3, '1265 = 158 × 8 + 1. Один оставшийся бит требует ещё одного байта на каждый идентификатор.']],
  users: ['Сначала определите размер пароля. 16 байт дополнительных сведений прибавляются для каждого из 20 пользователей.'],
  summary: ['Сверьте единицы в последней строке своего решения с вопросом задачи.']
};
