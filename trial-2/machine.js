// Each rule writes a symbol, moves (or stops), and sets the next state.
const rules = [
  { 'λ': ['λ', 'L', 1] },
  { 'λ': ['1', 'R', 2], '0': ['1', 'R', 2], '1': ['0', 'L', 1] },
  { 'λ': ['1', 'S', 2], '0': ['0', 'R', 2], '1': ['1', 'R', 2] }
];
const states = ['q₀', 'q₁', 'q₂'];
const symbols = ['λ', '0', '1'];

function execute(input) {
  const tape = ['λ', 'λ', ...input, 'λ', 'λ'];
  let head = input.length + 2;
  let state = 0;
  let previous = '';
  let halted = false;
  const frames = [];
  while (true) {
    frames.push({ tape: [...tape], head, state, previous, halted });
    if (halted) return frames;
    const [write, move, next] = rules[state][tape[head]];
    tape[head] = write;
    previous = [write, move, states[next]].join(', ');
    state = next;
    head += move === 'L' ? -1 : move === 'R' ? 1 : 0;
    halted = move === 'S';
  }
}

export function prepareMachine(section) {
  const frames = execute(section.dataset.input);
  const root = section.querySelector('.simulator');
  const firstPage = Number(section.dataset.page);
  root.innerHTML = `
    <div class="machine-status"><strong class="tick"></strong><span class="readout"></span></div>
    <div class="tape"></div>
    <div class="machine-lower"><table class="program"><caption>Программа</caption><thead><tr><th scope="col">Сост.</th>
    ${symbols.map(s => `<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>
    ${rules.map((row, i) => `<tr><th scope="row">${states[i]}</th>${symbols.map(s => {
      if (!row[s]) return '<td>—</td>';
      const [write, move, next] = row[s];
      const command = [write, move, states[next]].join(', ');
      return `<td><button data-state="${i}" data-symbol="${s}" aria-label="${states[i]}, символ ${s}. Команда ${command}">${command}</button></td>`;
    }).join('')}</tr>`).join('')}</tbody></table>
    <div class="machine-question"><h3></h3><p class="message" aria-live="polite"></p><p class="previous"></p></div></div>`;
  let step = 0;

  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-symbol]');
    if (!button) return;
    const frame = frames[step];
    if (Number(button.dataset.state) === frame.state && button.dataset.symbol === frame.tape[frame.head]) {
      location.hash = String(firstPage + step + 1);
    } else {
      root.querySelector('.message').textContent = `Посмотри на строку ${states[frame.state]} и столбец ${frame.tape[frame.head]}.`;
    }
  });

  function render(index) {
    step = index;
    const { tape, head, state, previous, halted } = frames[index];
    root.querySelector('.tick').textContent = `Такт ${index} / ${frames.length - 1}`;
    root.querySelector('.readout').textContent = `Состояние ${states[state]} · Читает ${tape[head]}`;
    const tapeView = root.querySelector('.tape');
    tapeView.setAttribute('role', 'img');
    tapeView.setAttribute('aria-label', `Лента: ${tape.join(' ')}. Головка в ячейке ${head + 1} слева.`);
    tapeView.innerHTML = tape.map((symbol, i) => `<span aria-hidden="true" class="${i === head ? 'head' : ''}">${symbol}</span>`).join('');
    root.querySelectorAll('button[data-symbol]').forEach(button => { button.disabled = halted; });
    const binary = tape.filter(s => s !== 'λ').join('');
    root.querySelector('h3').textContent = halted ? `${binary}₂ = ${parseInt(binary, 2)}₁₀` : 'Какая команда следующая?';
    root.querySelector('.message').textContent = halted
      ? 'Машина увеличила число на единицу и приписала справа ещё одну единицу.'
      : 'Выбери команду в таблице по состоянию головки и символу под ней.';
    root.querySelector('.previous').textContent = previous
      ? `Выполнено: ${previous}${halted ? ' · остановка' : ''}`
      : 'Начало: головка справа от числа.';
  }
  return { render, length: frames.length };
}
