'use strict';
const $=q=>document.querySelector(q),screen=$('#screen');
let slides=[],current=0,step=0,pending=0,timer=null;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const maxSteps=s=>s.states.length>1?s.states.length-1:s.states[0].parts.length;
function fit(){const host=$('#canvas-wrap'),style=getComputedStyle(host),width=host.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),height=host.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);screen.style.width=Math.max(1,Math.min(width,height*16/9))+'px';}
new ResizeObserver(fit).observe($('#canvas-wrap'));
function toggleMenu(open){document.body.classList.toggle('menu-open',open);$('#sidebar').hidden=!open;$('#sidebar').inert=!open;$('#menu').setAttribute('aria-expanded',String(open));$('#menu').ariaLabel=open?'Скрыть содержание':'Открыть содержание';}
$('#menu').onclick=()=>toggleMenu(!document.body.classList.contains('menu-open'));
function stop(){clearInterval(timer);timer=null;$('#play').textContent='Проиграть такты';}
function place(el,part){Object.assign(el.style,{left:part.x+'%',top:part.y+'%',width:part.w+'%',height:part.h+'%'});}
function image(src,cls){const e=document.createElement('img');e.src=src;e.alt='';e.className=cls;e.draggable=false;return e;}
function preload(){const s=slides[current],next=s.states[Math.min(step+1,s.states.length-1)];[next.image,next.head?.image,...next.parts.map(p=>p.image)].filter(Boolean).forEach(src=>{const im=new Image();im.src=src;});}
function controls(){const s=slides[current],max=maxSteps(s);$('#prev').disabled=current===0&&step===0;$('#next').disabled=current===slides.length-1&&step===max;$('#next').textContent=step<max?'Следующий шаг →':'Следующий слайд →';$('#replay').disabled=step===0;$('#play').hidden=!s.states[0].head;$('#status').textContent=s.title;document.title=s.title+' · Пробное занятие';$('#transcript').textContent=s.states[s.states.length>1?step:0].text;preload();}
function update(){const s=slides[current];if(s.states.length===1){screen.querySelectorAll('.part').forEach((p,i)=>p.classList.toggle('visible',i<step));controls();return;}
 const state=s.states[step],base=screen.querySelector('.base');const old=base.cloneNode();old.classList.add('leaving');screen.append(old);base.src=state.image;
 if(reduced())old.remove();else old.animate([{opacity:1},{opacity:0}],{duration:550,easing:'ease-in-out',fill:'forwards'}).finished.catch(()=>{}).finally(()=>old.remove());
 const head=screen.querySelector('.pointer');if(head&&state.head){head.src=state.head.image;place(head,state.head);}controls();}
function render(){stop();let n=Number(location.hash.slice(1));if(!Number.isInteger(n)||n<1||n>slides.length)n=1;current=n-1;step=Math.min(pending,maxSteps(slides[current]));pending=0;history.replaceState(null,'','#'+n);screen.replaceChildren();const s=slides[current],state=s.states[s.states.length>1?step:0];screen.append(image(state.image,'base'));
 state.parts.forEach((p,i)=>{const im=image(p.image,'part'+(i<step?' visible':''));place(im,p);screen.append(im);});if(state.head){const head=image(state.head.image,'pointer');place(head,state.head);screen.append(head);}
 screen.setAttribute('aria-label',s.title);$('#outline').querySelectorAll('a').forEach(a=>{const active=Number(a.dataset.slide)===n;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});controls();fit();if(!reduced())screen.animate([{opacity:.1},{opacity:1}],{duration:500,easing:'ease-in-out'});}
function go(dir){if(!slides.length)return;stop();const max=maxSteps(slides[current]);if(dir>0&&step<max){step++;update();return;}if(dir<0&&step>0){step--;update();return;}const next=current+dir;if(next<0||next>=slides.length)return;pending=dir<0?maxSteps(slides[next]):0;location.hash='#'+(next+1);}
$('#next').onclick=()=>go(1);$('#prev').onclick=()=>go(-1);$('#replay').onclick=()=>{stop();step=0;update();};$('#play').onclick=()=>{if(timer){stop();return;}if(step===maxSteps(slides[current])){step=0;update();}$('#play').textContent='Пауза';timer=setInterval(()=>{if(step>=maxSteps(slides[current])){stop();return;}step++;update();},1400);};
screen.onclick=()=>{if(slides.length&&step<maxSteps(slides[current]))go(1);};
$('#outline').onclick=e=>{if(e.target.closest('a')&&matchMedia('(max-width:700px)').matches)toggleMenu(false);};
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}}
$('#fullscreen').onclick=fullscreen;
addEventListener('hashchange',()=>{if(slides.length)render();});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select'))return;if(['ArrowRight','PageDown'].includes(e.key)||([' ','Enter'].includes(e.key)&&!e.target.closest('button,a'))){e.preventDefault();go(1);}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(-1);}if(e.key==='Escape'){toggleMenu(false);stop();}if(e.key.toLowerCase()==='f')fullscreen();});
fetch('./slides.json').then(r=>{if(!r.ok)throw Error('Не удалось загрузить слайды');return r.json();}).then(data=>{slides=data;$('#outline').innerHTML=slides.map((s,i)=>`${i===0||slides[i-1].group!==s.group?`<div class="group">${s.group}</div>`:''}<a href="#${i+1}" data-slide="${i+1}">${s.title}</a>`).join('');render();}).catch(()=>{screen.textContent='Не удалось загрузить презентацию. Обновите страницу.';});
