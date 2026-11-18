import {scenes,chapters} from './selected.js?v=c10203d6c68a';
import {createMachine} from './machine.js?v=c10203d6c68a';
import {bindScoreGallery} from './gallery.js?v=c10203d6c68a';
import {bindImages,createImagePreloader} from './images.js?v=c10203d6c68a';
import * as fx from './fx.js?v=c10203d6c68a';
const $=s=>document.querySelector(s);const stage=$('#stage');let index=0;let busy=false;let machine=null;let wheelTotal=0;let wheelAt=0;let formatStep=0;let sceneTransition=Promise.resolve();
const rating={value:0,tags:new Set(),tip:'none'};
let disposeGallery=()=>{};
let bound=null,stepper=null;
let disposeImages=()=>{},disposeZoomImages=()=>{};
const preloadNearbyImages=createImagePreloader(scenes);
function bindRating(){
 const stars=stage.querySelector('.rating-stars');if(!stars)return;
 const status=stage.querySelector('.rating-status');
 const words=['Как вам поездка?','Нужно лучше','Есть над чем поработать','Неплохо','Хорошо','Отлично'];
 const paint=(value=rating.value)=>{
  stars.querySelectorAll('label').forEach(label=>{const input=label.querySelector('input');input.checked=Number(input.value)===rating.value;label.classList.toggle('filled',Number(input.value)<=value)});
  status.textContent=words[rating.value];
 };
 stars.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{rating.value=Number(input.value);paint()}));
 stars.querySelectorAll('label').forEach(label=>label.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')paint(Number(label.querySelector('input').value))}));
 stars.addEventListener('pointerleave',()=>paint());
 stage.querySelectorAll('[data-rating-tag]').forEach(button=>{button.setAttribute('aria-pressed',String(rating.tags.has(button.dataset.ratingTag)));button.addEventListener('click',()=>{const tag=button.dataset.ratingTag;rating.tags.has(tag)?rating.tags.delete(tag):rating.tags.add(tag);button.setAttribute('aria-pressed',String(rating.tags.has(tag)))});});
 const paintTip=()=>{stage.querySelectorAll('[name="lesson-tip"]').forEach(input=>{input.checked=input.value===rating.tip})};
 stage.querySelectorAll('[name="lesson-tip"]').forEach(input=>input.addEventListener('change',()=>{rating.tip=input.value;paintTip()}));
 paint();paintTip();
}
function mountScene(n,direction=1){
 if(n<0||n>=scenes.length)return;machine?.destroy();disposeGallery();disposeImages();try{bound?.dispose?.()}catch{}bound=null;stepper=null;fx.unmount();machine=null;index=n;formatStep=0;
 history.replaceState(null,'','#'+(index+1));
 const scene=scenes[index];stage.innerHTML=`<section class="scene entering ${direction<0?'back':''} ${scene.className||''}" aria-labelledby="scene-heading">${scene.html}</section>`;
 const section=stage.querySelector('.scene');section.dataset.ready='false';
 stage.scrollTop=0;const heading=stage.querySelector('h1,h2');if(heading)heading.id='scene-heading';
 document.body.dataset.scene=scene.id;document.body.dataset.tone=scene.tone||'light';
 $('#chapter-label').textContent=`0${scene.chapter+1} / ${chapters[scene.chapter]}`;$('#scene-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;$('#progress-fill').style.width=`${(index+1)/scenes.length*100}%`;
 $('#previous').disabled=index===0;$('#next').disabled=index===scenes.length-1;$('#next').textContent=index===scenes.length-1?'Готово':'Дальше';
 document.querySelectorAll('.chapters button').forEach((b,i)=>{if(Number(b.dataset.chapter)===scene.chapter)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
 document.querySelectorAll('.overview-item').forEach((b,i)=>{b.classList.toggle('current',i===index);b.setAttribute('aria-current',i===index?'step':'false')});
 stage.querySelectorAll('[data-zoom]').forEach(b=>{const im=b.querySelector('img');if(!im.hidden&&!b.hasAttribute('aria-label'))b.setAttribute('aria-label',`Увеличить: ${b.dataset.zoom}`);b.addEventListener('click',()=>{disposeZoomImages();$('#zoom-image').src=im.src;$('#zoom-image').alt=im.alt;$('#image-title').textContent=b.dataset.zoom;$('#image-dialog').dataset.kind=b.dataset.zoomKind||(b.dataset.zoom.startsWith('Полное')?'condition':'image');disposeZoomImages=bindImages($('.image-scroll'));$('#image-dialog').showModal();$('.image-scroll').scrollTop=0;$('.image-scroll').scrollLeft=0})});
 $('#announcer').textContent=`Экран ${index+1}. ${scene.title}`;
 if(scene.id==='formats'){formatStep=direction<0?2:0;paintFormats()}else updateNextScene();
 bindRating();
 disposeGallery=bindScoreGallery(stage);
 disposeImages=bindImages(stage);
 preloadNearbyImages(index);
 if(scene.machine){machine=createMachine(stage.querySelector('.machine-root'),scene.machine,updateMachineNav);updateMachineNav()}
 if(scene.bind){bound=scene.bind(section,{direction,confetti:fx.confetti});if(bound&&bound.steps){stepper=bound;stepper.onChange=paintStepper;paintStepper()}}
 try{fx.mount(section,scene,{direction})}catch(error){console.warn('fx',error)}
}
// Keep navigation locked only until the actual scene transition finishes.
export function renderScene(n,direction=1){
 if(n<0||n>=scenes.length)return Promise.resolve();
 if(busy)return sceneTransition.then(()=>renderScene(n,direction));
 busy=true;stage.setAttribute('aria-busy','true');
 sceneTransition=(async()=>{
  const old=stage.querySelector('.scene');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{
   if(old&&!reduced&&typeof document.startViewTransition==='function'){
    stage.dataset.transition='crossfade';
    const toneChanges=(document.body.dataset.tone||'light')!==(scenes[n].tone||'light');
    document.documentElement.dataset.sceneTransition=toneChanges?'theme':'stage';
    const transition=document.startViewTransition(()=>mountScene(n,direction));
    // A hidden document may skip the snapshots while still mounting the scene.
    transition.ready.catch(()=>{});
    await transition.finished;
   }else{
    stage.dataset.transition=reduced?'none':'fade';
    if(old&&!reduced){
     old.inert=true;
     await old.animate([{opacity:1},{opacity:0}],{duration:180,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{});
    }
    mountScene(n,direction);
    const section=stage.querySelector('.scene');
    if(reduced)section.classList.remove('entering');
    else{
     const entrance=section.getAnimations().find(animation=>animation.animationName==='scene-fade');
     if(entrance)await entrance.finished.catch(()=>{});
    }
   }
  }finally{
   stage.querySelector('.scene').dataset.ready='true';
   delete document.documentElement.dataset.sceneTransition;
   stage.setAttribute('aria-busy','false');busy=false;
  }
 })();
 return sceneTransition;
}
function updateNextScene(){
 const label=$('#next-scene');
 label.textContent=index===scenes.length-1?'':`Дальше: ${scenes[index+1].title}`;
 if(machine&&!machine.finished)label.textContent='Дальше: следующий такт';
 if(scenes[index].id==='formats'&&formatStep<2)label.textContent=formatStep===0?'Дальше: индивидуальный формат':'Дальше: индивидуально-групповой формат';
 if(stepper&&stepper.step<stepper.steps)label.textContent=stepper.label(stepper.step+1);
}
// Scenes with their own steps (Telegram) reveal one part per «Показать».
function paintStepper(){if(!stepper)return;$('#next').textContent=stepper.step<stepper.steps?'Показать':'Дальше';updateNextScene()}
function paintFormats(){
 stage.querySelectorAll('[data-format-step]').forEach(element=>{const visible=Number(element.dataset.formatStep)<=formatStep;element.classList.toggle('revealed',visible);element.setAttribute('aria-hidden',String(!visible));element.inert=!visible});
 $('#next').textContent=formatStep<2?'Показать':'Дальше';
 $('#announcer').textContent=formatStep===1?'Индивидуальный формат':formatStep===2?'Индивидуально-групповой формат':'Формат занятий';
 updateNextScene();
}
function updateMachineNav(){if(!machine)return;updateNextScene();$('#previous').disabled=machine.busy;$('#next').textContent=machine.finished?'Дальше':'Следующий такт';$('#next').disabled=machine.busy;const reset=stage.querySelector('[data-reset]');if(reset)reset.disabled=machine.busy;}
export function next(){if(busy)return;if(scenes[index].id==='formats'&&formatStep<2){formatStep++;paintFormats();stage.querySelector(`[data-format-step="${formatStep}"]`).scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return}if(stepper&&stepper.step<stepper.steps){stepper.go(stepper.step+1,1);paintStepper();return}if(machine&&!machine.finished){machine.next();return}if(index<scenes.length-1){renderScene(index+1)}}
export function previous(){if(busy)return;if(scenes[index].id==='formats'&&formatStep>0){formatStep--;paintFormats();return}if(stepper&&stepper.step>0){stepper.go(stepper.step-1,-1);paintStepper();return}if(machine&&machine.step>0){machine.previous();return}if(index>0){renderScene(index-1,-1)}}
$('.chapters').innerHTML=chapters.map((t,i)=>scenes.some(s=>s.chapter===i)?`<button data-chapter="${i}"><span>0${i+1}</span>${t}</button>`:'').join('');document.querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>renderScene(scenes.findIndex(s=>s.chapter===Number(b.dataset.chapter)))));
$('#overview-list').innerHTML=scenes.map((s,i)=>`<button class="overview-item" data-scene="${i}"><span>${String(i+1).padStart(2,'0')}</span>${s.title}</button>`).join('');document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>{$('#overview-dialog').close();renderScene(Number(b.dataset.scene))}));
$('#next').addEventListener('click',next);$('#previous').addEventListener('click',previous);$('#home').addEventListener('click',()=>renderScene(0));$('#overview-open').addEventListener('click',()=>$('#overview-dialog').showModal());$('#help-open').addEventListener('click',()=>$('#help-dialog').showModal());
document.querySelectorAll('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
$('#image-dialog').addEventListener('close',()=>{disposeZoomImages();$('#zoom-image').removeAttribute('src')});
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{$('#announcer').textContent='Полный экран недоступен в этом браузере.'}}$('#fullscreen').addEventListener('click',fullscreen);
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.closest('.taxi-rating,.score-gallery,.image-load-notice,.lesson-demos'))return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();next()}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();previous()}else if(e.key.toLowerCase()==='g')$('#overview-dialog').showModal();else if(e.key.toLowerCase()==='f')fullscreen();else if(e.key==='Home')renderScene(0);else if(e.key==='End')renderScene(scenes.length-1)});
stage.addEventListener('wheel',e=>{if(machine||document.querySelector('dialog[open]')||e.target.closest('.score-gallery,.lesson-demos,.tg-phone'))return;const atTop=stage.scrollTop<=2;const atBottom=stage.scrollTop+stage.clientHeight>=stage.scrollHeight-2;if((e.deltaY>0&&!atBottom)||(e.deltaY<0&&!atTop))return;const now=Date.now();if(now-wheelAt>220)wheelTotal=0;wheelAt=now;wheelTotal+=e.deltaY;if(Math.abs(wheelTotal)>130){if(wheelTotal>0)next();else previous();wheelTotal=0}},{passive:true});
window.lesson={goTo:(id)=>{const n=scenes.findIndex(s=>s.id===id);if(n>=0)return renderScene(n)},next,previous,getState:()=>({scene:scenes[index].id,index,total:scenes.length,formatStep:scenes[index].id==='formats'?formatStep:null,step:stepper?stepper.step:null,machine:machine?.getState()??null})};
renderScene(Math.max(0,Math.min(scenes.length-1,(Number(location.hash.slice(1))||1)-1)));
addEventListener('hashchange',()=>renderScene(Math.max(0,Math.min(scenes.length-1,(Number(location.hash.slice(1))||1)-1))));
const context=document.modelContext;
if(context?.registerTool){
 const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 const tools=[
  {name:'read_lesson_state',title:'Состояние занятия',description:'Read the current scene and machine step without changing anything.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>window.lesson.getState()},
  {name:'navigate_lesson',title:'Открыть экран занятия',description:'Navigate to one existing lesson scene. It resets the machine to its initial state on machine scenes.',inputSchema:{type:'object',properties:{sceneId:{type:'string',enum:scenes.map(s=>s.id)}},required:['sceneId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){if(!input||Object.keys(input).length!==1||typeof input.sceneId!=='string'||!scenes.some(s=>s.id===input.sceneId))throw new Error('Неизвестный экран занятия.');await window.lesson.goTo(input.sceneId);return window.lesson.getState()}},
  {name:'step_turing_machine',title:'Выполнить один такт',description:'Execute exactly one command on the current machine scene and wait for its animation. It does not navigate to another scene.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){if(input&&Object.keys(input).length)throw new Error('Этот такт не принимает параметры.');if(!machine)throw new Error('Сначала открой тренировку или решение.');if(machine.busy)throw new Error('Дождись завершения текущего такта.');if(machine.finished)throw new Error('Машина уже остановилась.');const active=machine;active.next();await new Promise(resolve=>{const id=setInterval(()=>{if(active!==machine||!active.busy){clearInterval(id);resolve()}},30)});return window.lesson.getState()}}
 ];
 for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{}}
}
