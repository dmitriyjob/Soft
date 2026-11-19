// "Interactive lessons" scene: three small live replicas of real lesson moments.
const LESSONS=[
 {id:'fano',tab:'№ 4 · Кодирование',url:'infa-ion.ru/lessons/4',href:'https://infa-ion.ru/lessons/4/#5.1',ms:10500},
 {id:'link',tab:'№ 3 · Базы данных',url:'infa-ion.ru/lessons/3',href:'https://infa-ion.ru/lessons/3/presentation.html#6.2',ms:9000},
 {id:'game',tab:'№ 19–21 · Теория игр',url:'infa-ion.ru/lessons/19-21',href:'https://infa-ion.ru/lessons/19-21/#3',ms:12000}
];
const W=800,H=460;
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

export function lessonsMarkup(){
 return `<div class="lx-layout"><div class="lx-copy"><p class="eyebrow">06 / Интерактивные уроки</p><h2>Не слайды,<br>а <span class="accent">живые уроки</span></h2><p class="lx-lead">Каждую тему разбираем анимацией шаг за шагом. А что-то можно потрогать самому.</p><ul class="lx-facts"><li><b>Шаг за шагом</b><span>Анимация повторяет ход решения</span></li><li><b>Можно потрогать</b><span>Коды, таблицы и игры — прямо в браузере</span></li><li><b>Ссылка остаётся у тебя</b><span>Пересмотришь урок перед практикой</span></li></ul></div><div class="lx-stage lesson-demos"><div class="lx-tabs" role="tablist" aria-label="Фрагменты уроков">${LESSONS.map((l,i)=>`<button type="button" role="tab" data-lx-tab="${i}" aria-selected="${i===0}"><span>${l.tab}</span><i class="lx-prog" aria-hidden="true"></i></button>`).join('')}</div><div class="lx-window"><div class="lx-bar"><span class="lx-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lx-url"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/></svg><span data-lx-url>${LESSONS[0].url}</span></span><a class="lx-open" data-lx-open href="${LESSONS[0].href}" target="_blank" rel="noopener">Открыть урок ↗</a></div><div class="lx-viewport"><div class="lx-canvas" role="tabpanel" aria-live="polite"></div></div></div><p class="lx-hint">Наведи, нажми, сыграй — это настоящие фрагменты уроков.</p></div></div>`;
}

/* ---------- Demo 1: uneven code, glue and decode ---------- */
const CODES={'Б':['10','k'],'А':['010','t'],'О':['00','n']};
const WORD='БАОБАБ';
function fano(canvas,ctx){
 const tiles=[...WORD].map((ch,i)=>`<div class="fa-tile fa-${CODES[ch][1]}" style="--i:${i}"><b>${ch}</b><i class="fa-code">${CODES[ch][0]}</i></div>`).join('');
 const bits=[...WORD].flatMap((ch,li)=>[...CODES[ch][0]].map(bit=>({bit,li,tone:CODES[ch][1]})));
 canvas.innerHTML=`<div class="fa"><div class="fa-head"><p class="lx-eyebrow">Неравномерный код</p><h3 class="fa-title"><span data-fa-title>Склеиваем:</span> <em data-fa-accent>14 знаков</em></h3></div><div class="fa-table"><p class="lx-eyebrow">Таблица кодов</p>${Object.entries(CODES).map(([ch,[code,t]])=>`<div class="fa-${t}"><b>${ch}</b><code>${code}</code></div>`).join('')}</div><p class="fa-ready" data-fa-ready>Готово: <b></b></p><div class="fa-tiles">${tiles}</div><p class="lx-eyebrow fa-mem">Так слово лежит в памяти</p><div class="fa-strip">${bits.map((b,i)=>`<span class="fa-bit fa-${b.tone}" style="--i:${i}">${b.bit}</span>`).join('')}</div><svg class="fa-brackets" viewBox="0 0 800 70" aria-hidden="true"></svg><div class="fa-out" data-fa-out>БАОБАБ</div><button type="button" class="lx-replay" data-fa-replay hidden>↻ Ещё раз</button></div>`;
 const root=canvas.querySelector('.fa');const brackets=canvas.querySelector('.fa-brackets');const ready=canvas.querySelector('[data-fa-ready] b');
 const tileEls=[...canvas.querySelectorAll('.fa-tile')];const bitEls=[...canvas.querySelectorAll('.fa-bit')];
 const at=(fn,ms)=>ctx.later(fn,ms);
 function run(){
  root.className='fa';ready.textContent='';brackets.innerHTML='';canvas.querySelector('[data-fa-replay]').hidden=true;
  canvas.querySelector('[data-fa-title]').textContent='Склеиваем:';canvas.querySelector('[data-fa-accent]').textContent='14 знаков';
  tileEls.forEach(t=>t.classList.remove('coded'));bitEls.forEach(b=>b.classList.remove('on','dim'));
  at(()=>root.classList.add('in'),60);
  tileEls.forEach((t,i)=>at(()=>t.classList.add('coded'),650+i*230));
  at(()=>root.classList.add('glue'),2300);
  bitEls.forEach((b,i)=>at(()=>b.classList.add('on'),2450+i*70));
  at(()=>{root.classList.add('decode');canvas.querySelector('[data-fa-title]').textContent='Декодируем';canvas.querySelector('[data-fa-accent]').textContent='слева направо'},4100);
  // Bracket every group of bits, then name the letter under it.
  const strip=canvas.querySelector('.fa-strip');let start=0;
  [...WORD].forEach((ch,li)=>{const len=CODES[ch][0].length;const from=start;start+=len;at(()=>{
   const a=bitEls[from].getBoundingClientRect(),b=bitEls[from+len-1].getBoundingClientRect(),box=strip.getBoundingClientRect(),scale=box.width/strip.offsetWidth||1;
   const x0=(a.left-box.left)/scale+strip.offsetLeft+2,x1=(b.right-box.left)/scale+strip.offsetLeft-2,mid=(x0+x1)/2,t=CODES[ch][1];
   brackets.insertAdjacentHTML('beforeend',`<g class="fa-br fa-${t}"><path d="M${x0} 4v8q0 6 6 6H${x1-6}q6 0 6-6V4" pathLength="1"/><text x="${mid}" y="54" text-anchor="middle">${ch}</text></g>`);
   for(let k=from;k<from+len;k++)bitEls[k].classList.add('dim');ready.textContent+=ch;
  },4500+li*520)});
  at(()=>root.classList.add('done'),4500+6*520+250);
  at(()=>{canvas.querySelector('[data-fa-replay]').hidden=false;ctx.done()},4500+6*520+1500);
 }
 canvas.querySelector('[data-fa-replay]').addEventListener('click',()=>{ctx.clear();run()});
 run();
}

/* ---------- Demo 2: two tables linked by an article number ---------- */
const MOVES=[['02.08.2021','M1',1,200,'Поступление'],['02.08.2021','M1',22,200,'Поступление'],['02.08.2021','M3',1,100,'Поступление'],['02.08.2021','M3',22,100,'Поступление'],['07.08.2021','M1',1,180,'Продажа'],['07.08.2021','M1',22,147,'Продажа']];
const GOODS=[[1,'Гель для деликатной стирки','1000'],[22,'Антисептик для рук гель','500']];
function link(canvas,ctx){
 canvas.innerHTML=`<div class="lk"><h3 class="lk-title">Связь по <em>артикулу</em></h3><div class="lk-sheet lk-moves"><p class="lk-name"><i></i>Движение товаров</p><table><thead><tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr><tr><th>1</th><td>Дата</td><td>Магазин</td><td>Артикул</td><td>Упаковок</td><td>Тип</td></tr></thead><tbody>${MOVES.map((r,i)=>`<tr data-lk-row="${i}" data-art="${r[2]}" style="--i:${i}"><th>${i+2}</th><td>${r[0]}</td><td>${r[1]}</td><td class="lk-key">${r[2]}</td><td class="lk-num">${r[3]}</td><td>${r[4]}</td></tr>`).join('')}</tbody></table></div><div class="lk-sheet lk-goods"><p class="lk-name"><i></i>Товар</p><table><thead><tr><th></th><th>A</th><th>B</th><th>C</th></tr><tr><th>1</th><td>Артикул</td><td>Наименование</td><td>В упак.</td></tr></thead><tbody>${GOODS.map((g,i)=>`<tr data-art="${g[0]}" data-lk-good="${g[0]}"><th>${i+2}</th><td class="lk-key">${g[0]}</td><td>${g[1]}</td><td class="lk-num">${g[2]}</td></tr>`).join('')}</tbody></table></div><svg class="lk-wires" viewBox="0 0 ${W} ${H}" aria-hidden="true"></svg><p class="lk-note">Наведи на строку — увидишь, какой это товар</p></div>`;
 const root=canvas.querySelector('.lk');const wires=canvas.querySelector('.lk-wires');
 const rows=[...canvas.querySelectorAll('[data-lk-row]')];const goods=Object.fromEntries([...canvas.querySelectorAll('[data-lk-good]')].map(r=>[r.dataset.lkGood,r]));
 const local=(el)=>{const c=canvas.getBoundingClientRect(),r=el.getBoundingClientRect(),s=c.width/W||1;return {l:(r.left-c.left)/s,r:(r.right-c.left)/s,t:(r.top-c.top)/s,b:(r.bottom-c.top)/s}};
 function draw(){
  wires.innerHTML=rows.map((row,i)=>{const a=local(row),g=local(goods[row.dataset.art]);const y1=(a.t+a.b)/2,y2=(g.t+g.b)/2,x1=a.r+6,x2=g.l-6,cx=(x1+x2)/2;return `<g class="lk-wire lk-a${row.dataset.art}" data-wire="${i}"><path d="M${x1} ${y1}C${cx} ${y1} ${cx} ${y2} ${x2} ${y2}" pathLength="1"/><circle cx="${x1}" cy="${y1}" r="3.5"/></g>`}).join('');
 }
 const focus=i=>{root.classList.toggle('has-focus',i!=null);rows.forEach((r,k)=>r.classList.toggle('is-focus',k===i));Object.values(goods).forEach(g=>g.classList.toggle('is-focus',i!=null&&g.dataset.art===rows[i].dataset.art));wires.querySelectorAll('[data-wire]').forEach((w,k)=>w.classList.toggle('is-focus',k===i))};
 rows.forEach((row,i)=>{row.addEventListener('pointerenter',()=>{ctx.manual();focus(i)});row.addEventListener('pointerleave',()=>focus(null))});
 ctx.later(()=>{draw();root.classList.add('in')},40);
 rows.forEach((row,i)=>ctx.later(()=>{wires.querySelector(`[data-wire="${i}"]`)?.classList.add('on');row.classList.add('lit');goods[row.dataset.art].classList.add('lit');focus(i)},900+i*620));
 ctx.later(()=>focus(null),900+rows.length*620+300);
 ctx.later(()=>ctx.done(),900+rows.length*620+2200);
 ctx.onResize=draw;
}

/* ---------- Demo 3: Petya vs Vanya, the stone game ---------- */
const PETYA={shirt:'#B9521D',sleeve:'#853D20',hair:'<path d="M71 63q-20-20-4-29-3-21 18-19 11-14 26-2 21-5 22 15 20 9 2 32l-7-21q-13 4-23-7-11 12-25 9l-4 23z" fill="#664338"/>'};
const VANYA={shirt:'#3977A7',sleeve:'#245779',hair:'<path d="M69 60q-10-37 23-39 38-7 44 26l-6 18-7-23q-22 14-43 4l-5 18z" fill="#31313B"/><path d="M73 29q21-27 48 0" fill="#31313B"/>'};
const person=p=>`<svg viewBox="0 0 200 260" aria-hidden="true"><ellipse cx="100" cy="248" rx="67" ry="8" fill="#E1E0DE"/><path d="M70 169h62l5 66h-27l-9-44-7 44H66z" fill="#303A43"/><path d="M65 231h30v15H54q-2-11 11-15m45 0h28q14 4 15 15h-43z" fill="#23282D"/><path d="M66 101q34-17 68 0l6 75q-40 13-79 0z" fill="${p.shirt}"/><path d="M91 96v17q9 10 19 0V93" fill="#E9AC87"/><path d="M72 113l-15 48 17 9 13-45" fill="${p.sleeve}"/><path d="M57 160q-5 17 7 22 9 3 12-10l-3-9z" fill="#F2BF9B"/><g class="gm-arm"><path d="M129 111q13-1 20 16l10 24-19 8-18-31" fill="${p.shirt}"/><path d="M141 150q15-7 21-3l17-4q10 2 4 10l-24 13q-10 3-18-8z" fill="#F2BF9B"/><path d="M166 142l5-8 13 1 6 10-7 7-15-2z" fill="#A6A699" stroke="#7A7D73" stroke-width="1.5"/></g><ellipse cx="101" cy="65" rx="31" ry="38" fill="#F2BF9B"/><circle cx="71" cy="69" r="7" fill="#F2BF9B"/><circle cx="131" cy="69" r="7" fill="#F2BF9B"/>${p.hair}<path d="M83 58h10m17 0h10" stroke="#583C33" stroke-width="3" stroke-linecap="round"/><ellipse cx="89" cy="67" rx="2.7" ry="3.5" fill="#2D3035"/><ellipse cx="115" cy="67" rx="2.7" ry="3.5" fill="#2D3035"/><path d="M101 69l-3 9h6m-13 7q11 10 21-1" fill="none" stroke="#B6765A" stroke-width="2.5" stroke-linecap="round"/><path d="M82 126h33m-31 8h20" stroke="#FFF" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/></svg>`;
const START=10,GOAL=50;const MOVES_G=[{label:'+2',f:s=>s+2},{label:'×3',f:s=>s*3}];
const memo=new Map();
function winning(s){if(memo.has(s))return memo.get(s);const r=MOVES_G.some(m=>{const n=m.f(s);return n>=GOAL||!winning(n)});memo.set(s,r);return r}
function bestMove(s){const good=MOVES_G.filter(m=>{const n=m.f(s);return n>=GOAL||!winning(n)});const pool=good.length?good:MOVES_G;return pool[Math.floor(Math.random()*pool.length)]}
function game(canvas,ctx){
 canvas.innerHTML=`<div class="gm"><p class="gm-status" data-gm-status>Твой ход</p><div class="gm-player gm-petya is-you"><div class="gm-figure">${person(PETYA)}</div><b>Петя</b><small>это ты</small></div><div class="gm-player gm-vanya"><div class="gm-figure gm-flip">${person(VANYA)}</div><b>Ваня</b><small>компьютер</small></div><div class="gm-pile" data-gm-pile></div><div class="gm-ground"></div><strong class="gm-count" data-gm-count>${START}</strong><div class="gm-moves">${MOVES_G.map((m,i)=>`<button type="button" class="gm-move" data-gm-move="${i}">${m.label}</button>`).join('')}</div><p class="gm-rules">Начинаем с ${START} камней · ход: +2 или ×3 · побеждает тот, кто первым наберёт ${GOAL}+</p><button type="button" class="lx-replay gm-again" data-gm-again hidden>↻ Сыграть ещё</button></div>`;
 const root=canvas.querySelector('.gm');const pile=canvas.querySelector('[data-gm-pile]');const count=canvas.querySelector('[data-gm-count]');const status=canvas.querySelector('[data-gm-status]');
 const buttons=[...canvas.querySelectorAll('[data-gm-move]')];const again=canvas.querySelector('[data-gm-again]');
 let s=START,turn='petya',over=false,busy=false,drawn=0;
 function stones(n,fresh){
  const shown=Math.min(n,36);let html='',k=0;
  for(let row=0,cap=8;k<shown&&cap>0;row++,cap--){for(let c=0;c<cap&&k<shown;c++,k++){const x=(c-(cap-1)/2)*25,y=-row*19,shade=['#B4B3A8','#A6A699','#9A9B8F','#C2C1B7'][(k*7)%4];html+=`<i class="gm-stone${k>=drawn&&fresh?' new':''}" style="--x:${x}px;--y:${y}px;--d:${(k-drawn)*28}ms;--c:${shade}"></i>`}}
  pile.innerHTML=html;drawn=shown;
 }
 function paint(){status.textContent=over?status.textContent:turn==='petya'?'Твой ход':'Ход Вани…';root.dataset.turn=turn;buttons.forEach(b=>b.disabled=over||busy||turn!=='petya')}
 function throwStone(who,done){
  const fig=canvas.querySelector(`.gm-${who} .gm-figure`);fig.classList.remove('throw');void fig.offsetWidth;fig.classList.add('throw');
  if(reducedMotion()){done();return}
  const rock=document.createElement('i');rock.className='gm-stone gm-flying';root.append(rock);
  const from=who==='petya'?{x:228,y:220}:{x:572,y:220};const to={x:400,y:300};
  rock.animate([{transform:`translate(${from.x}px,${from.y}px) rotate(0deg)`},{transform:`translate(${(from.x+to.x)/2}px,${from.y-120}px) rotate(200deg)`,offset:.5},{transform:`translate(${to.x}px,${to.y}px) rotate(360deg)`}],{duration:620,easing:'cubic-bezier(.3,.1,.4,1)'}).finished.then(()=>{rock.remove();done()}).catch(()=>{rock.remove();done()});
 }
 function move(i,who){
  if(over||busy)return;busy=true;paint();const m=MOVES_G[i];
  const flag=document.createElement('span');flag.className=`gm-flag gm-flag-${who}`;flag.textContent=m.label;root.append(flag);ctx.later(()=>flag.remove(),1300);
  throwStone(who,()=>{
   s=m.f(s);count.textContent=String(s);count.animate?.([{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.34,1.45,.55,1)'});stones(s,true);busy=false;
   if(s>=GOAL){over=true;status.textContent=who==='petya'?'Петя победил! 🎉':'Ваня победил';root.classList.add(who==='petya'?'won':'lost');paint();again.hidden=false;if(who==='petya')ctx.confetti?.(canvas);ctx.later(()=>ctx.done(),2600);return}
   turn=who==='petya'?'vanya':'petya';paint();
   if(turn==='vanya')ctx.later(()=>move(MOVES_G.indexOf(bestMove(s)),'vanya'),900);
   else if(ctx.auto())ctx.later(()=>move(MOVES_G.indexOf(bestMove(s)),'petya'),1000);
  });
 }
 function reset(){s=START;turn='petya';over=false;busy=false;drawn=0;root.classList.remove('won','lost');again.hidden=true;count.textContent=String(s);stones(s,true);paint();if(ctx.auto())ctx.later(()=>move(MOVES_G.indexOf(bestMove(s)),'petya'),1300)}
 buttons.forEach(b=>b.addEventListener('click',()=>{ctx.manual();move(Number(b.dataset.gmMove),'petya')}));
 again.addEventListener('click',()=>{ctx.manual();ctx.clear();reset()});
 reset();
}

const DEMOS={fano,link,game};

export function bindLessons(section,{confetti}={}){
 const stage=section.querySelector('.lx-stage');const viewport=section.querySelector('.lx-viewport');const canvas=section.querySelector('.lx-canvas');
 const tabs=[...section.querySelectorAll('[data-lx-tab]')];const url=section.querySelector('[data-lx-url]');const open=section.querySelector('[data-lx-open]');
 let current=-1,manual=false,disposed=false,timers=new Set(),onResize=null;
 const ctx={
  later(fn,ms){const t=setTimeout(()=>{timers.delete(t);if(!disposed)fn()},ms);timers.add(t);return t},
  clear(){timers.forEach(clearTimeout);timers.clear()},
  done(){if(!manual&&!disposed)show((current+1)%LESSONS.length)},
  manual(){if(manual)return;manual=true;stage.classList.add('is-manual');tabs.forEach(t=>t.querySelector('.lx-prog').getAnimations().forEach(a=>a.cancel()))},
  auto:()=>!manual&&!reducedMotion(),
  confetti:(el)=>confetti?.(el),
  set onResize(fn){onResize=fn}
 };
 // Scale the 800×460 canvas to the window, whatever the screen.
 let scale=1;
 const fit=()=>{scale=Math.max(.4,Math.min(viewport.clientWidth/W,(viewport.clientHeight||H)/H));canvas.style.setProperty('--lx-scale',scale.toFixed(4));onResize?.()};
 const ro=new ResizeObserver(fit);ro.observe(viewport);
 function show(i){
  ctx.clear();onResize=null;current=i;const lesson=LESSONS[i];
  tabs.forEach((t,k)=>{t.setAttribute('aria-selected',String(k===i));const bar=t.querySelector('.lx-prog');bar.getAnimations().forEach(a=>a.cancel());if(k===i&&!manual&&!reducedMotion())bar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:lesson.ms,easing:'linear',fill:'forwards'})});
  url.textContent=lesson.url;open.href=lesson.href;canvas.dataset.demo=lesson.id;
  fit();DEMOS[lesson.id](canvas,ctx);fit();
  if(!reducedMotion())canvas.animate([{opacity:0,filter:'blur(6px)',transform:`scale(${scale}) translateY(10px)`},{opacity:1,filter:'blur(0)',transform:`scale(${scale})`}],{duration:450,easing:'cubic-bezier(.22,1,.36,1)'});
 }
 tabs.forEach((t,i)=>t.addEventListener('click',()=>{ctx.manual();show(i)}));
 canvas.addEventListener('pointerdown',()=>ctx.manual());
 show(0);
 return {dispose(){disposed=true;ctx.clear();ro.disconnect()}};
}
