'use strict';

const bitTrainer = {
  init(slide) {
    const sizes = [8, 10, 26, 32, 52, 65, 1024, 1030];
    const target = slide.querySelector('#target-size');
    const feedback = slide.querySelector('#feedback');
    function addChoices(id, values, onSelect) {
      const group = slide.querySelector(id);
      for (const value of values) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = value;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          for (const choice of group.children) choice.setAttribute('aria-pressed', String(choice === button));
          onSelect(value);
        });
        group.append(button);
      }
    }
    addChoices('#sizes', sizes, size => {
      target.textContent = size;
      for (const button of slide.querySelector('#widths').children) button.setAttribute('aria-pressed', 'false');
      feedback.textContent = '';
      feedback.classList.remove('correct');
    });
    addChoices('#widths', Array.from({ length: 11 }, (_, i) => i + 1), bits => {
      const size = Number(target.textContent);
      const capacity = 2 ** bits;
      const minimum = capacity >= size && capacity / 2 < size;
      feedback.classList.toggle('correct', minimum);
      const power = '2' + String(bits).replace(/\d/g, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'[digit]);
      if (minimum) feedback.textContent = 'Верно! ' + capacity / 2 + ' < ' + size + ' ≤ ' + power + ' = ' + capacity + '.';
      else if (capacity < size) feedback.textContent = power + ' = ' + capacity + '. Для ' + size + ' символов кодов пока мало.';
      else feedback.textContent = power + ' = ' + capacity + '. Кодов хватает. Попробуй выделить меньше бит.';
    });
    slide.querySelector('#sizes').children[sizes.indexOf(10)].click();
  }
};

window.DECK = {
  sections: { 1: 'Пароль и алфавит', 2: 'Биты и байты', 3: 'Запись в базе', 4: 'Практика' },
  key: 'soft:interactive:11-passwords', prefix: 'soft11', widgets: { trainer: bitTrainer }
};

window.NOTES = {
  start: ['Прочитайте ABBA, заменяя A на 0, а B на 1. Для хранения четырёх получившихся бит задаче достаточно одного байта.'],
  length: ['Спросите, сколько позиций займут два одинаковых символа подряд. Длина меняется с каждым новым символом.'],
  alphabet: ['Даже если в конкретном пароле встретились только две буквы, код должен предусматривать любой символ, разрешённый условием.'],
  bits: ['Дописав один бит, получаем два продолжения каждого старого кода. Поэтому число кодов с каждым битом удваивается.'],
  trainer: ['Сравните N = 32 и N = 52. Для 32 символов пяти бит хватает ровно, для 52 потребуется шестой бит. Сравните также 1024 и 1030.'],
  bytes: ['Второй байт берём целиком, даже когда последний бит остался свободным. Округление каждого символа до байта завысило бы объём.'],
  record: ['Уточните единицы. Дополнительные сведения в примере уже заданы в байтах и относятся к каждой записи.'],
  identifiers: ['Сначала предложите решить самостоятельно. Для 1020 специальных символов и десяти цифр десяти бит уже мало.', [3, '1265 = 158 × 8 + 1. Один оставшийся бит требует ещё одного байта на каждый идентификатор.']],
  users: ['Сначала определите размер пароля. 16 байт дополнительных сведений прибавляются для каждого из 20 пользователей.'],
  summary: ['Сверьте единицы в последней строке своего решения с вопросом задачи.']
};
