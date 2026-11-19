import {scenes as original} from './content.js?v=d4d85e83151d';
const questions=[
 'К какому результату хочешь прийти?',
 'Как готовишься сейчас?',
 'С какими сложностями сейчас сталкиваешься?',
 'Что для тебя важно в занятиях с репетитором?'
];
function bindGoals(section,{direction}){
 const card=section.querySelector('.goal-question'), counter=section.querySelector('.goal-counter');
 let step=direction<0?3:0,animation;
 const paint=()=>{card.textContent=questions[step];counter.textContent=`${step+1} / ${questions.length}`;};
 const api={steps:3,get step(){return step;},label:n=>`Дальше: ${questions[n]}`,go(n){
  step=Math.max(0,Math.min(3,n));animation?.cancel();paint();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)animation=card.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out'});
  api.onChange?.();
 },dispose(){animation?.cancel();section.removeEventListener('click',click);}};
 const click=e=>{if(e.target.closest('button,a,input'))return;if(step<3)api.go(step+1);};
 section.addEventListener('click',click);paint();return api;
}
export const introduction=[
 {...original[0],html:original[0].html.replace('<p class="eyebrow">Групповое пробное</p>','')},
 {id:'about-dmitriy',chapter:0,title:'Дмитрий Валерьевич',className:'about-scene dmitriy-scene',html:`<div class="scene-grid"><div><p class="eyebrow">Твой преподаватель</p><h2>По эту сторону<br>экрана — <span class="accent">Дмитрий<br>Валерьевич</span></h2><p class="about-description">Преподаватель информатики</p><ul class="plus-list"><li>Сдал ЕГЭ на <strong>100 баллов</strong></li><li>Выпустил <strong>100+ высокобалльников (80+)</strong></li><li>Разработал <strong>собственную программу подготовки</strong></li></ul><div class="stats-inline"><div><strong class="accent">4</strong><span>года преподавания</span></div><div><strong>4,8</strong><span>средний балл ОГЭ</span></div><div><strong>85</strong><span>средний балл ЕГЭ</span></div></div></div><figure class="teacher-figure"><img class="dmitriy-portrait" src="LIZ04641-retouched.jpg?v=d4d85e83151d" width="4000" height="6000" fetchpriority="high" alt="Дмитрий Валерьевич за ноутбуком"></figure></div>`},
 {id:'goals',chapter:0,title:'Давай поговорим о целях',className:'goals-scene',html:`<div class="goals-content"><p class="eyebrow">Твои цели и ожидания</p><h2>Давай поговорим о целях.</h2><div class="goal-question" aria-live="polite"></div><p class="goal-counter"></p><p class="goal-hint">Нажми на слайд или «Показать», чтобы перейти к следующему вопросу</p></div>`,bind:bindGoals}
];
