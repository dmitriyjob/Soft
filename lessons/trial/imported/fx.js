// Motion layer: everything here is decoration on top of the lesson. If it fails, the lesson still works.
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE='cubic-bezier(.22,1,.36,1)';
let sceneCleanup=[];

/* ---------- headings: words rise out of a blur ---------- */
function splitWords(el,{letters=false}={}){
 if(el.dataset.fxSplit)return 0;el.dataset.fxSplit='1';
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];
 while(walker.nextNode()){const n=walker.currentNode;if(n.nodeValue.trim()&&!n.parentElement.closest('.sr-only'))nodes.push(n)}
 let i=0;
 for(const node of nodes){
  const accent=!!node.parentElement.closest('.accent');const frag=document.createDocumentFragment();
  for(const part of node.nodeValue.split(/(\s+)/)){
   if(!part)continue;
   if(/^\s+$/.test(part)){frag.append(part);continue}
   const outer=document.createElement('span');outer.className='fx-w';
   if(letters){for(const ch of part){const inner=document.createElement('span');inner.className='fx-l'+(accent?' fx-acc':'');inner.style.setProperty('--d',i++);inner.textContent=ch;outer.append(inner)}}
   else{const inner=document.createElement('span');inner.className='fx-wi'+(accent?' fx-acc':'');inner.style.setProperty('--d',i++);inner.textContent=part;outer.append(inner)}
   frag.append(outer);
  }
  node.replaceWith(frag);
 }
 return i;
}

/* ---------- eyebrows: binary noise settles into the words ---------- */
function decrypt(el,delay=0){
 if(el.children.length||!el.textContent.trim())return;
 const final=el.textContent;const chars=[...final];const start=performance.now()+delay;const dur=Math.min(900,300+chars.length*18);let raf=0;
 el.setAttribute('aria-label',final);el.classList.add('fx-decrypt');
 const tick=now=>{const p=Math.max(0,(now-start)/dur);if(p>=1){el.textContent=final;el.classList.remove('fx-decrypt');return}
  const shown=Math.floor(p*chars.length);el.textContent=chars.map((c,k)=>k<shown||c===' '||c==='/'||c==='·'?c:(Math.random()<.5?'0':'1')).join('');raf=requestAnimationFrame(tick)};
 raf=requestAnimationFrame(tick);sceneCleanup.push(()=>{cancelAnimationFrame(raf);el.textContent=final});
}

/* ---------- numbers count up to their value ---------- */
const COUNT=['.display-number','.featured-score>strong','.other-scores strong','.exam-facts strong','.stats-inline strong','.evidence-verdict>strong','.code-count>strong','.score-equation strong','.price','.single-price','.referral-grid strong','.case-score strong','.platform-video-scene h2 .accent'].join(',');
function countUp(el,delay=250){
 if(el.textContent.includes('–'))return;
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node,match;
 while((node=walker.nextNode())){match=node.nodeValue.match(/\d[\d   ]*(?:[.,]\d+)?/);if(match)break}
 if(!match)return;
 const raw=match[0].trimEnd();const sep=(raw.match(/[   ]/)||[''])[0];const dec=(raw.match(/[.,](\d+)$/)||[])[1]||'';const point=raw.includes(',')?',':'.';
 const value=parseFloat(raw.replace(/[   ]/g,'').replace(',','.'));if(!(value>=4))return;
 const before=node.nodeValue.slice(0,match.index),after=node.nodeValue.slice(match.index+raw.length);
 const fmt=v=>{let [int,fr]=v.toFixed(dec.length).split('.');if(sep)int=int.replace(/\B(?=(\d{3})+(?!\d))/g,sep);return int+(fr?point+fr:'')};
 const start=performance.now()+delay,dur=1300;let raf=0;el.classList.add('fx-counting');
 node.nodeValue=before+fmt(0)+after;
 const tick=now=>{const t=Math.max(0,Math.min(1,(now-start)/dur));const e=t===1?1:1-Math.pow(2,-10*t);node.nodeValue=before+fmt(value*e)+after;if(t<1)raf=requestAnimationFrame(tick);else el.classList.remove('fx-counting')};
 raf=requestAnimationFrame(tick);sceneCleanup.push(()=>{cancelAnimationFrame(raf);node.nodeValue=before+raw+after});
}

/* ---------- blocks arrive one after another ---------- */
const STAGGER=['.intro-subtitle','.plus-list li','.stats-inline>div','.question-list li','.difficulty-grid>div','.score-comparison>div','.other-scores>div','.university-grid>article','.admissions-note','.exam-facts>div','.exam-details>div','.method-legend>div','.task-tile','.hard-tasks','.programming-summary>div','.scale-tables>table','.station-steps li','.parts-grid>div','.fear-quotes p','.prepared-lead','.platform-freedoms li','.platform-lead','.platform-proof-pair figure','.service-lead','.service-link','.curriculum-lead','.curriculum-evidence>*','.fact-rows>div','.support-encouragement','.feature-columns>div','.group-sequence','.theory-evidence>*','.lesson-fragments>*','.lead-muted','.practice-support','.case-layout>*','.price-columns>div','.referral-grid>div','.question-prompts li','.taxi-rating','.website-summary','.website-qr','.tg-lead','.tg-points li','.tg-device','.lx-lead','.lx-facts li','.lx-stage','.trend-subtitle','.chart-scroll','.footnote','.you-mascot','.teacher-figure','.mood-image','.money-hippo','.price-hippo','.station-image','.task-screenshot','.machine-photo','.platform-video-layout>button','.service-layout>button','.student-practice-layout>button','.teacher-boards','.questions-photo','.taxi-driver-photo','.comments-screenshot','.intro-subtitle','.about-description','.evidence-gallery'].join(',');
function stagger(section,base){
 const items=[...section.querySelectorAll(STAGGER)].filter(el=>!el.closest('.lesson-demos,.tg-phone,.machine-root,[data-format-step],.agenda'));
 let k=0;
 for(const el of items){
  const tiles=el.classList.contains('task-tile');const d=base+(tiles?Number([...el.parentElement.children].indexOf(el))*22+120:Math.min(k++,16)*70);
  const a=el.animate(tiles?[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'none'}]:[{opacity:0,transform:'translateY(22px)',filter:'blur(6px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:tiles?520:820,delay:d,easing:tiles?'cubic-bezier(.34,1.5,.55,1)':EASE,fill:'backwards'});
  sceneCleanup.push(()=>a.cancel());
 }
}

/* ---------- spotlight + gentle tilt on cards and screenshots ---------- */
const SPOT=['.university-logo','.exam-days>span','.price-columns>div','.platform-screenshot','.service-screenshot','.curriculum-screenshot','.student-board','.teacher-boards','.station-image','.task-screenshot','.lesson-fragments>button','.questions-photo','.taxi-driver-photo','.machine-photo','.website-qr a','.lx-window'].join(',');
const TILT='.platform-screenshot,.service-screenshot,.curriculum-screenshot,.student-board,.station-image,.lesson-fragments>button,.questions-photo,.taxi-driver-photo,.machine-photo,.website-qr a';
function spotlight(section){
 section.querySelectorAll(SPOT).forEach(el=>{
  el.classList.add('fx-spot');const tilt=el.matches(TILT);
  const move=e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.style.setProperty('--mx',`${x*100}%`);el.style.setProperty('--my',`${y*100}%`);if(tilt&&!reduced())el.style.transform=`perspective(1100px) rotateX(${(.5-y)*4}deg) rotateY(${(x-.5)*5}deg) translateY(-2px)`};
  const leave=()=>{if(tilt)el.style.transform=''};
  el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);
  sceneCleanup.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave)});
 });
}

/* ---------- confetti ---------- */
let confettiCanvas=null,particles=[],confettiRaf=0;
export function confetti(target,{count=140,colors=['#B9521D','#FFB58C','#2F855A','#2B6CB0','#E9B800','#FFD8BE']}={}){
 if(reduced())return;
 if(!confettiCanvas){confettiCanvas=document.createElement('canvas');confettiCanvas.className='fx-confetti';document.body.append(confettiCanvas)}
 const dpr=Math.min(2,devicePixelRatio||1);confettiCanvas.width=innerWidth*dpr;confettiCanvas.height=innerHeight*dpr;
 let x=innerWidth/2,y=innerHeight*.55;
 if(target?.getBoundingClientRect){const r=target.getBoundingClientRect();x=r.left+r.width/2;y=r.top+r.height/2}else if(target&&'x' in target){x=target.x;y=target.y}
 for(let i=0;i<count;i++){const a=-Math.PI/2+(Math.random()-.5)*Math.PI*1.1,v=7+Math.random()*9;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,w:5+Math.random()*7,h:8+Math.random()*9,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:colors[i%colors.length],life:0})}
 if(!confettiRaf){const ctx=confettiCanvas.getContext('2d');const step=()=>{ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,innerWidth,innerHeight);particles=particles.filter(p=>p.life<220&&p.y<innerHeight+40);for(const p of particles){p.life++;p.vx*=.985;p.vy=p.vy*.985+.32;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.globalAlpha=Math.min(1,(220-p.life)/40);ctx.fillStyle=p.c;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(p.life*.12+p.r)));ctx.restore()}confettiRaf=particles.length?requestAnimationFrame(step):0;if(!particles.length)ctx.clearRect(0,0,innerWidth,innerHeight)};confettiRaf=requestAnimationFrame(step)}
}

/* ---------- ambient background: aurora on dark/peach, binary field on title scenes ---------- */
const bg={canvas:null,ctx:null,mode:'none',raf:0,last:0,cells:[],cols:0,rows:0,mx:-999,my:-999,dpr:1,t0:performance.now(),glyphs:null};
function bgResize(){const c=bg.canvas;bg.dpr=Math.min(1.5,devicePixelRatio||1);c.width=Math.round(innerWidth*bg.dpr);c.height=Math.round(innerHeight*bg.dpr);const size=24;bg.cols=Math.ceil(innerWidth/size);bg.rows=Math.ceil(innerHeight/size);bg.cells=Array.from({length:bg.cols*bg.rows},()=>({v:Math.random()<.5?0:1,a:0}))}
function glyphSprites(color){const out=[];for(const ch of ['0','1']){const c=document.createElement('canvas');const s=Math.round(24*bg.dpr);c.width=s;c.height=s;const x=c.getContext('2d');x.fillStyle=color;x.font=`500 ${Math.round(13*bg.dpr)}px ui-monospace,SFMono-Regular,Menlo,monospace`;x.textAlign='center';x.textBaseline='middle';x.fillText(ch,s/2,s/2+1);out.push(c)}return out}
function bgFrame(now){
 bg.raf=0;if(bg.mode==='none'||document.hidden)return;
 if(now-bg.last<40){bg.raf=requestAnimationFrame(bgFrame);return}bg.last=now;
 const {ctx,canvas}=bg;const w=canvas.width,h=canvas.height,t=(now-bg.t0)/1000;ctx.clearRect(0,0,w,h);
 if(bg.mode==='dark'||bg.mode==='peach'){
  const blobs=bg.mode==='dark'?[[.18,.25,.55,'255,150,90',.16],[.82,.7,.6,'185,82,29',.22],[.6,.15,.45,'120,110,255',.07]]:[[.2,.3,.6,'255,255,255',.42],[.85,.75,.55,'255,160,110',.4],[.55,.1,.4,'255,236,220',.5]];
  blobs.forEach(([bx,by,br,rgb,alpha],i)=>{const x=(bx+Math.sin(t*.13+i*2)*.07)*w,y=(by+Math.cos(t*.11+i)*.08)*h,r=br*Math.max(w,h);const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${alpha})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)});
  if(bg.mode==='dark'&&bg.mx>-999){const g=ctx.createRadialGradient(bg.mx*bg.dpr,bg.my*bg.dpr,0,bg.mx*bg.dpr,bg.my*bg.dpr,320*bg.dpr);g.addColorStop(0,'rgba(255,181,140,.10)');g.addColorStop(1,'rgba(255,181,140,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
 }else if(bg.mode==='binary'){
  if(!bg.glyphs){bg.glyphs=glyphSprites('#1D1D1F');bg.accentGlyphs=glyphSprites('#B9521D')}
  const s=24*bg.dpr;const [g0,g1]=bg.glyphs;const [a0,a1]=bg.accentGlyphs;
  for(let r=0;r<bg.rows;r++)for(let c=0;c<bg.cols;c++){
   const cell=bg.cells[r*bg.cols+c];if(Math.random()<.006)cell.v^=1;
   const x=c*24+12,y=r*24+12;const d=Math.hypot(x-bg.mx,y-bg.my);const near=Math.max(0,1-d/190);
   // Fade toward the left so the title column stays calm.
   const fadeX=Math.min(1,Math.max(0,(x/innerWidth-.32)/.4));
   cell.a+=((near*.9)-cell.a)*.18;
   const base=.06*fadeX;
   ctx.globalAlpha=Math.min(1,base+cell.a*.36*(.35+.65*fadeX));ctx.drawImage(cell.a>.12?(cell.v?a1:a0):(cell.v?g1:g0),c*s,r*s);
  }
  ctx.globalAlpha=1;
 }
 bg.raf=requestAnimationFrame(bgFrame);
}
function setBackground(mode){
 if(reduced())mode='none';
 if(!bg.canvas){bg.canvas=document.createElement('canvas');bg.canvas.className='fx-bg';bg.canvas.setAttribute('aria-hidden','true');document.body.prepend(bg.canvas);bg.ctx=bg.canvas.getContext('2d');bgResize();addEventListener('resize',()=>{bgResize();bg.glyphs=null});addEventListener('pointermove',e=>{bg.mx=e.clientX;bg.my=e.clientY},{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!bg.raf)bg.raf=requestAnimationFrame(bgFrame)})}
 if(mode==='binary'&&!bg.glyphs){bg.glyphs=glyphSprites('#1D1D1F');bg.accentGlyphs=glyphSprites('#B9521D')}
 bg.mode=mode;bg.canvas.dataset.mode=mode;
 if(mode==='none'){bg.ctx.clearRect(0,0,bg.canvas.width,bg.canvas.height);return}
 if(!bg.raf)bg.raf=requestAnimationFrame(bgFrame);
}

/* ---------- chrome: chapter pill, magnetic "next", click sparks ---------- */
function movePill(){
 const nav=document.querySelector('.chapters');const pill=nav?.querySelector('.fx-pill');const active=nav?.querySelector('[aria-current]');
 if(!pill||!active)return;pill.style.width=`${active.offsetWidth+24}px`;pill.style.transform=`translateX(${active.offsetLeft-12}px)`;pill.classList.add('on');
}
function sparks(e){
 if(reduced())return;const target=e.target.closest('button,a,label');if(!target||target.disabled)return;
 const wrap=document.createElement('div');wrap.className='fx-spark';wrap.style.left=`${e.clientX}px`;wrap.style.top=`${e.clientY}px`;
 for(let i=0;i<8;i++){const s=document.createElement('i');s.style.setProperty('--a',`${i*45}deg`);wrap.append(s)}
 document.body.append(wrap);setTimeout(()=>wrap.remove(),600);
}
function magnetic(){
 const btn=document.querySelector('#next');if(!btn)return;
 addEventListener('pointermove',e=>{if(reduced())return;const r=btn.getBoundingClientRect();const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const d=Math.hypot(dx,dy);if(d<130){const k=(1-d/130)*.22;btn.style.transform=`translate(${dx*k}px,${dy*k}px)`}else if(btn.style.transform)btn.style.transform=''},{passive:true});
}

let started=false;
export function init(){
 if(started)return;started=true;
 const nav=document.querySelector('.chapters');if(nav&&!nav.querySelector('.fx-pill')){const pill=document.createElement('i');pill.className='fx-pill';pill.setAttribute('aria-hidden','true');nav.prepend(pill)}
 addEventListener('resize',movePill);
 document.addEventListener('pointerdown',sparks,{passive:true});
 magnetic();
 document.documentElement.classList.add('fx-ready');
}

export function unmount(){sceneCleanup.forEach(fn=>{try{fn()}catch{}});sceneCleanup=[]}

export function mount(section,scene,{direction=1}={}){
 init();movePill();
 const tone=scene.tone||'light';
 setBackground(tone==='dark'?'dark':tone==='peach'?'peach':['welcome','prepared','website','questions'].includes(scene.id)?'binary':'none');
 if(reduced())return;
 const heading=section.querySelector('h1,h2');
 const hope=scene.id==='hope';
 section.querySelectorAll('h1,h2').forEach(h=>{if(!h.closest('.lesson-demos,.tg-phone'))splitWords(h,{letters:hope})});
 section.querySelectorAll('.eyebrow').forEach((el,i)=>decrypt(el,80+i*60));
 const words=heading?heading.querySelectorAll('.fx-wi,.fx-l').length:0;
 stagger(section,Math.min(700,260+words*45));
 section.querySelectorAll(COUNT).forEach(el=>countUp(el,380));
 spotlight(section);
 section.querySelectorAll('.chart-point').forEach((p,i)=>p.style.setProperty('--i',i));
 if(hope){const t=setTimeout(()=>confetti({x:innerWidth/2,y:innerHeight*.62},{count:170}),650);sceneCleanup.push(()=>clearTimeout(t))}
 if(scene.id==='rating'){
  const onRate=e=>{if(e.target.name==='lesson-rating'&&e.target.value==='5')confetti(e.target.closest('.rating-stars'),{colors:['#FFD21F','#FFE680','#E9B800','#B9521D','#FFFFFF']})};
  section.addEventListener('change',onRate);sceneCleanup.push(()=>section.removeEventListener('change',onRate));
 }
 section.classList.add('fx-on');
}
