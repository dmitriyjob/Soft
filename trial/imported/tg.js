// Telegram scene: a live phone where the bot messages arrive one step at a time.
const ico={
 pin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5Zm3 10v6"/></svg>',
 link:'<svg class="tg-out" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2h6v6M10 2 3 9"/></svg>',
 back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',
 plane:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 17-7-3 17-5-6-3 4v-6l9-8-11 7Z"/></svg>'
};
const points=[
 ['📌','Все ссылки — в закрепе','Zoom, домашка, доска, записи и решения в один клик'],
 ['📚','Новая домашка','Бот сразу пришлёт ссылку и дедлайн'],
 ['⏰','Напоминание о занятии','За час до начала — чтобы не пропустить'],
 ['📊','Отчёт по домашкам','Видно, сколько уже сдали']
];
const labels=['','новая домашка','напоминание о занятии','отчёт по домашкам'];
const avatar=(letter,tone)=>`<span class="tg-avatar tg-avatar-${tone}" aria-hidden="true">${letter}</span>`;
const pinned=`<article class="tg-msg is-shown" data-tg-msg="0">${avatar('А','green')}<div class="tg-bubble tg-wide"><header class="tg-from tg-green">Автомайзер <span class="tg-badge">админ</span></header><img class="tg-banner" data-tg-fallback="Всё для занятий" data-tone="pinned" src="imported/assets/tg-pinned.webp" alt="Баннер «Всё для занятий»" width="932" height="306" decoding="async"><div class="tg-text"><p class="tg-big">📅 <b>Среда, 18:00 МСК</b></p><p>💻 ID Zoom: <code>••• ••• ••••</code><br>🔑 Код доступа: <code>••••••</code></p></div><div class="tg-keys"><span class="tg-key tg-key-main">💻 Подключиться${ico.link}</span><span class="tg-key">🏠 Домашка${ico.link}</span><span class="tg-key">📝 Доска${ico.link}</span><span class="tg-key">🎥 Записи${ico.link}</span><span class="tg-key">📚 Решения${ico.link}</span><span class="tg-key">📣 Мой канал${ico.link}</span><span class="tg-key">🛠 Программы${ico.link}</span></div><time>📌 12:01</time></div></article>`;
const homework=`<article class="tg-msg" data-tg-msg="1">${avatar('Н','blue')}<div class="tg-bubble"><header class="tg-from tg-blue">Напоминалкин</header><img class="tg-banner" data-tg-fallback="Новая домашка" data-tone="homework" src="imported/assets/tg-homework.webp" alt="Баннер «Новая домашка»" width="632" height="312" decoding="async"><div class="tg-text"><p>📚 <b>Домашка №3 — Количество упаковок</b> уже доступна</p><p>⏰ <b>Дедлайн: вторник, 10 ноября, 23:59 МСК</b></p><p>Лучше не откладывай на последний вечер 🙂</p></div><time>16:20</time></div><span class="tg-key tg-key-under">Открыть${ico.link}</span></article>`;
const lesson=`<article class="tg-msg" data-tg-msg="2">${avatar('Н','blue')}<div class="tg-bubble"><header class="tg-from tg-blue">Напоминалкин</header><img class="tg-banner" data-tg-fallback="Занятие через час" data-tone="lesson" src="imported/assets/tg-lesson.webp" alt="Баннер «Занятие через час»" width="632" height="312" decoding="async"><div class="tg-text"><p>Начинаем в <b>18:00</b> по МСК.<br>До встречи!</p></div><time>17:00</time></div></article>`;
const report=`<article class="tg-msg" data-tg-msg="3">${avatar('Н','blue')}<div class="tg-bubble"><header class="tg-from tg-blue">Напоминалкин</header><img class="tg-banner" data-tg-fallback="Отчёт по домашкам" data-tone="report" src="imported/assets/tg-report.webp" alt="Баннер «Отчёт по домашкам»" width="932" height="462" decoding="async"><div class="tg-text"><p>Сдано <b data-tg-done>65</b> из <b>70</b> — <b data-tg-pct>93%</b></p><div class="tg-meter" aria-hidden="true"><i></i></div></div><time>21:00</time></div></article>`;

export function telegramMarkup(){
 return `<div class="tg-layout"><div class="tg-copy"><p class="eyebrow">05 / Telegram</p><h2>Всё важное —<br><span class="accent">в одном чате</span></h2><p class="tg-lead">Домашки живут на платформе, а в Telegram бот напоминает о занятиях и держит все ссылки под рукой.</p><ol class="tg-points">${points.map(([icon,title,text],i)=>`<li data-tg-point="${i}"><button type="button" data-tg-go="${i}"><span class="tg-point-icon" aria-hidden="true">${icon}</span><span><strong>${title}</strong><small>${text}</small></span></button></li>`).join('')}</ol></div><div class="tg-device" aria-label="Пример чата занятий в Telegram"><div class="tg-phone"><div class="tg-screen"><div class="tg-status" aria-hidden="true"><span>17:00</span><i class="tg-island"></i><span class="tg-sys"><b></b><b></b><b></b><b></b><em></em></span></div><div class="tg-head"><span class="tg-back">${ico.back}</span>${avatar('i','accent')}<div><strong>Информатика · ЕГЭ</strong><small>группа занятий</small></div></div><div class="tg-pinbar">${ico.pin}<div><strong>Закреплённое сообщение</strong><small>Всё для занятий · Среда, 18:00 МСК</small></div></div><div class="tg-chat"><div class="tg-feed"><p class="tg-day">Сегодня</p>${pinned}${homework}${lesson}${report}<article class="tg-msg tg-typing-msg" aria-hidden="true">${avatar('Н','blue')}<div class="tg-bubble tg-typing"><i></i><i></i><i></i></div></article></div></div><div class="tg-compose" aria-hidden="true"><span>Сообщение</span></div><div class="tg-push" aria-hidden="true"><span class="tg-push-app">${ico.plane}</span><div><header><strong>Напоминалкин</strong><small>сейчас</small></header><p><b>Занятие через час</b></p><p>Начинаем в 18:00 по МСК. До встречи!</p></div></div></div></div></div></div>`;
}

export function bindTelegram(section,{direction=1}={}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const device=section.querySelector('.tg-device');const phone=section.querySelector('.tg-phone');
 const feed=section.querySelector('.tg-feed');const push=section.querySelector('.tg-push');const typing=section.querySelector('.tg-typing-msg');
 const msgs=[...section.querySelectorAll('[data-tg-msg]')];const rows=[...section.querySelectorAll('[data-tg-point]')];
 const timers=new Set();let step=0,disposed=false,token=0;
 // If a banner file is missing, draw a clean typographic banner instead of a broken image.
 section.querySelectorAll('img[data-tg-fallback]').forEach(img=>{const swap=()=>{if(img.hidden)return;img.hidden=true;const div=document.createElement('div');div.className='tg-banner tg-banner-fallback';div.dataset.tone=img.dataset.tone;div.innerHTML=`<span>${img.dataset.tgFallback}</span>`;img.after(div)};if(img.complete&&img.getAttribute('src')&&!img.naturalWidth)swap();img.addEventListener('error',swap,{once:true})});
 const later=(fn,ms)=>{const t=setTimeout(()=>{timers.delete(t);if(!disposed)fn()},ms);timers.add(t);return t};
 const clearAll=()=>{timers.forEach(clearTimeout);timers.clear()};
 // The phone is designed at 380×760 and scaled to the room the scene has.
 const stage=section.closest('#stage');
 const fit=()=>{const room=(stage?.clientHeight||innerHeight-180)-56;const s=Math.max(.56,Math.min(1.08,room/770));phone.style.setProperty('--tg-scale',s.toFixed(3));device.style.setProperty('--tg-h',`${Math.round(770*s)}px`);device.style.setProperty('--tg-w',`${Math.round(400*s)}px`)};
 const ro=new ResizeObserver(fit);ro.observe(stage||device);fit();
 function paintPoints(){rows.forEach((row,i)=>{row.classList.toggle('is-active',i===step);row.classList.toggle('is-done',i<step);row.querySelector('button').setAttribute('aria-current',i===step?'step':'false')})}
 function pushFeed(){
  // Bottom-anchored feed: newer messages push the history up. Animate that push.
  if(reduced)return;const before=feed.getBoundingClientRect().height;
  return ()=>{const delta=feed.getBoundingClientRect().height-before;if(delta>0)feed.animate([{transform:`translateY(${delta}px)`},{transform:'none'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'})};
 }
 function reveal(msg,animate){
  const done=animate?pushFeed():null;msg.classList.add('is-shown');done?.();
  if(animate&&!reduced){msg.animate([{opacity:0,transform:'translateY(14px) scale(.96)',filter:'blur(4px)'},{opacity:1,transform:'none',filter:'none'}],{duration:520,easing:'cubic-bezier(.34,1.3,.55,1)'})}
  if(msg.dataset.tgMsg==='3')meter(msg,animate);
 }
 function meter(msg,animate){
  const bar=msg.querySelector('.tg-meter i');const done=msg.querySelector('[data-tg-done]');const pct=msg.querySelector('[data-tg-pct]');
  if(!animate||reduced){bar.style.width='93%';done.textContent='65';pct.textContent='93%';return}
  bar.style.width='0%';const start=performance.now();const my=token;
  const tick=now=>{if(disposed||my!==token)return;const t=Math.min(1,(now-start-250)/1300);const e=t<0?0:1-(1-t)**3;bar.style.width=`${93*e}%`;done.textContent=String(Math.round(65*e));pct.textContent=`${Math.round(93*e)}%`;if(t<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
 }
 function typingThen(fn){
  if(reduced){fn();return}
  const done=pushFeed();typing.classList.add('is-shown');done?.();
  later(()=>{typing.classList.remove('is-shown');fn()},760);
 }
 function showPush(){
  if(reduced)return;push.classList.remove('is-out');push.classList.add('is-in');
  later(()=>{push.classList.add('is-out');push.classList.remove('is-in')},2600);
 }
 function go(n,dir=1){
  n=Math.max(0,Math.min(3,n));clearAll();token++;typing.classList.remove('is-shown');push.classList.remove('is-in','is-out');
  const animate=dir>0&&n===step+1;step=n;paintPoints();
  msgs.forEach((msg,i)=>{if(i>n)msg.classList.remove('is-shown')});
  msgs.forEach((msg,i)=>{if(i<n&&!msg.classList.contains('is-shown'))reveal(msg,false)});
  const target=msgs[n];
  if(!animate){reveal(target,false);return}
  if(n===2){showPush();later(()=>reveal(target,true),420)}
  else typingThen(()=>reveal(target,true));
 }
 section.querySelectorAll('[data-tg-go]').forEach(button=>button.addEventListener('click',()=>{const n=Number(button.dataset.tgGo);go(n,n>step?1:-1);api.onChange?.()}));
 const api={steps:3,get step(){return step},go,label:n=>labels[n]?`Дальше: ${labels[n]}`:'',onChange:null,dispose(){disposed=true;clearAll();ro.disconnect()}};
 if(direction<0)go(3,-1);else{step=0;paintPoints();msgs.forEach((m,i)=>m.classList.toggle('is-shown',i===0))}
 return api;
}
