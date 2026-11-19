let turn=0;
let autoplay=true;
const cycleMs=90000;
const tau=Math.PI*2;
// Cache each closed path at layout time; animation only interpolates positions.
function ellipse(rx,ry,cw,ch){
 const points=[];let length=0;
 for(let i=0;i<=720;i++){
  const angle=i/720*tau,point={x:Math.sin(angle)*rx,y:-Math.cos(angle)*ry,length};
  if(i){const previous=points[i-1];length+=Math.hypot((point.x-previous.x)/cw,(point.y-previous.y)/ch);point.length=length;}
  points.push(point);
 }
 return {points,length};
}
function position(path,fraction){
 const distance=wrap(fraction,1)*path.length;
 let low=0,high=path.points.length-1;
 while(high-low>1){const middle=(low+high)>>1;if(path.points[middle].length<distance)low=middle;else high=middle;}
 const a=path.points[low],b=path.points[high],mix=(distance-a.length)/(b.length-a.length);
 return {x:a.x+(b.x-a.x)*mix,y:a.y+(b.y-a.y)*mix};
}
const wrap=(n,count)=>((n%count)+count)%count;

export function bindScoreGallery(stage){
 const root=stage.querySelector('.evidence-gallery');if(!root)return ()=>{};
 const board=root.querySelector('.evidence-board');const cards=[...root.querySelectorAll('.evidence-card')];
 const lines=[...root.querySelectorAll('[data-evidence-line]')];
 const status=root.querySelector('[data-evidence-status]');
 const previous=root.querySelector('[data-score-previous]');const next=root.querySelector('[data-score-next]');
 const playback=root.querySelector('[data-score-autoplay]');
 let current=turn,target=turn,frame=0,last=0,layout,manual=null,hovered=false,focused=false,disposed=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function measure(){
  const w=board.clientWidth,h=board.clientHeight,narrow=w<=760;
  const cw=narrow?Math.max(58,Math.min(70,w*.1)):Math.max(84,Math.min(108,h*.22));
  const ch=narrow?Math.max(46,Math.min(50,cw*.7)):Math.max(50,Math.min(74,h*.145));
  const average=narrow?Math.min(84,(w-2*cw-28)/2.5):Math.max(76,Math.min(112,h*.4-94));
  root.dataset.orbitLayout=narrow?'single':'double';
  root.style.setProperty('--evidence-card-width',`${cw}px`);
  root.style.setProperty('--evidence-card-height',`${ch}px`);
  root.style.setProperty('--evidence-average-size',`${average}px`);
  const rx=(w-cw)/2-10,ry=(h-ch)/2-10;
  layout={cx:w/2,cy:h/2,narrow,outer:ellipse(rx,ry,cw,ch),inner:narrow?null:ellipse(rx*.6,ry*.6,cw,ch)};
  root.querySelector('.evidence-connections').setAttribute('viewBox',`0 0 ${w} ${h}`);
 }
 function draw(){
  const {cx,cy,narrow,outer,inner}=layout;
  cards.forEach((card,i)=>{
   const outside=narrow||i<17;
   const path=outside?outer:inner;
   const phase=current/cards.length;
   const offset=narrow?i/cards.length:outside?i/17:(i-17)/8+1/16;
   const point=position(path,offset+phase),x=cx+point.x,y=cy+point.y;
   card.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
   lines[i].setAttribute('x1',cx);lines[i].setAttribute('y1',cy);lines[i].setAttribute('x2',x);lines[i].setAttribute('y2',y);
  });
  root.dataset.turn=String(wrap(current,cards.length));
 }
 function announce(){
  const shown=cards;
  status.textContent=`Результаты вокруг среднего балла: ${shown.map(card=>card.querySelector('b').textContent).join(', ')} баллов.`;
 }
 function canRotate(){return autoplay&&!reduced.matches&&!hovered&&!focused&&!document.hidden&&!document.querySelector('dialog[open]');}
 function updatePlayback(){
  playback.hidden=reduced.matches;
  const label=autoplay?'Приостановить вращение':'Продолжить вращение';
  playback.setAttribute('aria-label',label);playback.title=label;
  playback.querySelector('path').setAttribute('d',autoplay?'M9 5v14M15 5v14':'m9 5 10 7-10 7V5');
  root.dataset.autoRotating=String(canRotate()&&!manual);
 }
 function sync(){
  if(disposed)return;
  updatePlayback();
  if(manual||canRotate()){if(!frame){last=0;frame=requestAnimationFrame(tick);}}
  else{cancelAnimationFrame(frame);frame=0;last=0;}
 }
 function tick(now){
  frame=0;if(disposed)return;
  const elapsed=last?Math.min(now-last,80):0;last=now;
  if(manual){
   const t=Math.min(1,(now-manual.at)/700);
   current=manual.from+(target-manual.from)*(1-(1-t)**3);
   if(t===1){current=wrap(target,cards.length);target=current;manual=null;root.setAttribute('aria-busy','false');}
   turn=current;draw();if(!manual)announce();
  }else if(canRotate()){
   current=wrap(current+elapsed*cards.length/cycleMs,cards.length);target=current;turn=current;draw();
  }
  updatePlayback();
  if(manual||canRotate())frame=requestAnimationFrame(tick);else last=0;
 }
 function go(delta){
  target=(manual?target:Math.round(current))+delta;
  if(reduced.matches){current=wrap(target,cards.length);target=current;turn=current;manual=null;draw();announce();root.setAttribute('aria-busy','false');sync();return;}
  manual={from:current,at:performance.now()};root.setAttribute('aria-busy','true');sync();
 }
 const onPrevious=()=>go(-1),onNext=()=>go(1);
 const onKey=e=>{focused=true;sync();if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();go(e.key==='ArrowRight'?1:-1);}};
 const onEnter=e=>{if(e.pointerType!=='touch'&&e.target.closest('.evidence-shot')){hovered=true;sync();}};
 const onLeave=e=>{hovered=!!e.relatedTarget&&root.contains(e.relatedTarget)&&!!e.relatedTarget.closest('.evidence-shot');sync();};
 const onFocus=e=>{focused=e.target.matches(':focus-visible');sync();};
 const onBlur=e=>{focused=!!e.relatedTarget&&root.contains(e.relatedTarget)&&e.relatedTarget.matches(':focus-visible');sync();};
 const onPlayback=()=>{autoplay=!autoplay;sync();};
 const onReduced=()=>{if(reduced.matches&&manual){current=wrap(target,cards.length);target=current;turn=current;manual=null;draw();announce();root.setAttribute('aria-busy','false');}sync();};
 previous.addEventListener('click',onPrevious);next.addEventListener('click',onNext);root.addEventListener('keydown',onKey);
 playback.addEventListener('click',onPlayback);root.addEventListener('pointerover',onEnter);root.addEventListener('pointerout',onLeave);root.addEventListener('focusin',onFocus);root.addEventListener('focusout',onBlur);
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',onReduced);
 const dialogs=new MutationObserver(sync);document.querySelectorAll('dialog').forEach(dialog=>dialogs.observe(dialog,{attributes:true,attributeFilter:['open']}));
 const observer=new ResizeObserver(()=>{measure();draw();sync();});
 measure();draw();announce();root.setAttribute('aria-busy','false');observer.observe(board);sync();
 return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();dialogs.disconnect();previous.removeEventListener('click',onPrevious);next.removeEventListener('click',onNext);root.removeEventListener('keydown',onKey);playback.removeEventListener('click',onPlayback);root.removeEventListener('pointerover',onEnter);root.removeEventListener('pointerout',onLeave);root.removeEventListener('focusin',onFocus);root.removeEventListener('focusout',onBlur);document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',onReduced);};
}
