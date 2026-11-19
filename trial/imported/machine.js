export const program={q0:{'λ':['λ','L','q1']},q1:{'λ':['1','R','q2'],'0':['1','R','q2'],'1':['0','L','q1']},q2:{'λ':['1','S','q2'],'0':['0','R','q2'],'1':['1','R','q2']}};
export const pretty=q=>q.replace('0','₀').replace('1','₁').replace('2','₂');
export function simulate(input){
 const bits=Number(input).toString(2);let tape={};[...bits].forEach((s,i)=>tape[i]=s);
 let head=bits.length,state='q0';const history=[{tape:{...tape},head,state,halted:false,command:null}];
 for(let n=0;n<100;n++){
  const read=tape[head]??'λ';const command=program[state]?.[read];if(!command)throw new Error(`Нет команды: ${state}, ${read}`);
  const from={state,read,head};const [write,direction,newState]=command;tape[head]=write;
  if(direction==='L')head--;else if(direction==='R')head++;state=newState;
  history.push({tape:{...tape},head,state,halted:direction==='S',command:{...from,write,direction,newState}});if(direction==='S')break;
 }
 const last=history.at(-1);const output=Object.keys(last.tape).map(Number).sort((a,b)=>a-b).map(k=>last.tape[k]).filter(s=>s!=='λ').join('');
 return {bits,history,output,result:parseInt(output,2)};
}
export const programTable=()=>`<table class="program-table" aria-label="Программа машины Тьюринга"><thead><tr><th scope="col" aria-label="Состояние"></th>${['λ','0','1'].map(s=>`<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>${Object.entries(program).map(([state,commands])=>`<tr><th scope="row">${pretty(state)}</th>${['λ','0','1'].map(s=>`<td>${commands[s]?commands[s].map((v,i)=>i===2?pretty(v):v).join(', '):''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
export function machineMarkup(title,eyebrow,practice=false){return `<p class="eyebrow">${eyebrow}</p><div class="machine-title"><h2>${title}</h2><span class="machine-step">Такт 00</span></div><div class="machine-root" data-practice="${practice}"><div class="machine-status"><span>Состояние <strong data-state>q₀</strong></span><span>Читает <strong data-read>λ</strong></span><button class="text-button" data-reset>Сначала</button></div><div class="tape-viewport" aria-label="Лента и читающая головка"><div class="tape-world"><div class="tape-cells"></div><div class="machine-head"><svg viewBox="0 0 24 18" aria-hidden="true"><path d="M3 16 12 4l9 12"/></svg><span data-head-state>q₀</span><span class="head-label">головка</span></div></div></div><div class="machine-bottom"><div><p class="small-label">Программа</p>${programTable()}</div><div class="machine-discussion"><p class="machine-prompt">${practice?'Твой ход.<br>Какая команда следующая?':'Что записываем?<br>Куда двигаемся?'}</p><p class="executed-command" data-command>Найди команду по состоянию и символу.</p><div class="machine-result" hidden><p class="small-label">Результат</p><strong data-result></strong><p data-conclusion></p></div></div></div></div>`}
export function createMachine(root,input,onChange){
 const run=simulate(input);let step=0;const busy=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const cellsEl=root.querySelector('.tape-cells');const viewport=root.querySelector('.tape-viewport');const world=root.querySelector('.tape-world');const headEl=root.querySelector('.machine-head');const min=-2,max=run.bits.length+1;const cells=[];
 for(let p=min;p<=max;p++){const el=document.createElement('div');el.className='tape-cell';el.dataset.position=p;cellsEl.append(el);cells.push(el)}
 function position(s){const cell=Number.parseFloat(getComputedStyle(root).getPropertyValue('--cell'))||62;const width=cells.length*cell;const at=(s.head-min)*cell;const available=viewport.clientWidth;const pan=width<=available?(available-width)/2:Math.max(available-width,Math.min(0,available/2-at-cell/2));world.style.transform=`translateX(${pan}px)`;headEl.style.transform=`translateX(${at}px)`;headEl.style.width=`${cell}px`;}
 function draw(s){
  cells.forEach((el,i)=>{const p=i+min;el.textContent=s.tape[p]??'λ';el.classList.toggle('is-reading',p===s.head);el.setAttribute('aria-label',`Клетка ${p}: ${el.textContent}${p===s.head?', здесь головка':''}`)});
  root.querySelector('[data-state]').textContent=pretty(s.state);root.querySelector('[data-read]').textContent=s.tape[s.head]??'λ';root.querySelector('[data-head-state]').textContent=pretty(s.state);position(s);
  root.closest('.scene').querySelector('.machine-step').textContent=`Такт ${String(step).padStart(2,'0')} / ${run.history.length-1}`;
  const command=root.querySelector('[data-command]');const result=root.querySelector('.machine-result');
  if(s.halted){result.hidden=false;root.querySelector('[data-result]').textContent=`${run.output}₂ = ${run.result}₁₀`;root.querySelector('[data-conclusion]').textContent='Число увеличилось на 1, затем справа добавилась 1. Машина остановилась.';root.querySelector('.machine-prompt').textContent='Готово.';command.textContent=`Выполнено: ${s.command.write}, ${s.command.direction}, ${pretty(s.command.newState)}. Остановка.`;const stage=root.closest('#stage');if(result.getBoundingClientRect().bottom>stage.getBoundingClientRect().bottom)result.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});}
  else{result.hidden=true;root.querySelector('.machine-prompt').innerHTML=root.dataset.practice==='true'?'Твой ход.<br>Какая команда следующая?':'Что записываем?<br>Куда двигаемся?';command.textContent=s.command?`Выполнено: ${s.command.write}, ${s.command.direction}, ${pretty(s.command.newState)}`:'Найди команду по состоянию и символу.'}
 }
 const observer=new ResizeObserver(()=>position(run.history[step]));observer.observe(viewport);
 function announce(){const s=run.history[step];document.querySelector('#announcer').textContent=s.halted?`Машина остановилась. Ответ ${run.result}.`:`Такт ${step}. Состояние ${pretty(s.state)}. Читает ${s.tape[s.head]??'пустой символ'}.`;}
 const api={get step(){return step},get busy(){return busy},get finished(){return run.history[step].halted},next(){if(this.finished)return;step++;draw(run.history[step]);announce();onChange()},previous(){if(step===0)return;step--;draw(run.history[step]);announce();onChange()},reset(){step=0;draw(run.history[0]);announce();onChange()},getState(){const s=run.history[step];return {input,step,totalSteps:run.history.length-1,state:s.state,read:s.tape[s.head]??'λ',head:s.head,tape:{...s.tape},halted:s.halted,busy,result:s.halted?run.result:null}},destroy(){observer.disconnect()}};
 root.querySelector('[data-reset]').addEventListener('click',()=>api.reset());draw(run.history[0]);return api;
}
