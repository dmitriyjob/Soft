// Живые сцены пробного: класс из 30, доска с презентацией и голосом, доски учеников,
// платформа IONINF, установка программ и сбор расписания. Всё — свои файлы, CSP script-src 'self'.
const NS='http://www.w3.org/2000/svg';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function svg(tag,attrs,parent){const n=document.createElementNS(NS,tag);for(const k in attrs||{})n.setAttribute(k,attrs[k]);if(parent)parent.append(n);return n}
function el(tag,cls,parent,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;if(parent)parent.append(n);return n}
const easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const linear=t=>t;
let uid=0;

/* ---------- отменяемое время ---------- */
function token(instant){return{alive:true,instant,timers:[]}}
function kill(tk){if(!tk)return;tk.alive=false;tk.timers.forEach(clearTimeout)}
function wait(tk,ms){if(tk.instant)return Promise.resolve();return new Promise(res=>{tk.timers.push(setTimeout(()=>{if(tk.alive)res()},ms))})}
function tween(tk,ms,fn,ez=easeIO){
 if(tk.instant){fn(1);return Promise.resolve()}
 return new Promise(res=>{const t0=performance.now();const tick=now=>{if(!tk.alive)return;const t=Math.min(1,Math.max(0,(now-t0)/ms));fn(ez(t));if(t<1)requestAnimationFrame(tick);else res()};requestAnimationFrame(tick)});
}
function timeline(){let timers=[];return{at(ms,fn){timers.push(setTimeout(fn,ms))},clear(){timers.forEach(clearTimeout);timers=[]}}}

/* ---------- доска ---------- */
function makeBoard(parent,W,H){
 const s=svg('svg',{viewBox:`0 0 ${W} ${H}`,class:'bd-svg',preserveAspectRatio:'xMidYMin meet'},parent);
 const defs=svg('defs',{},s);const id=`lv-grid-${++uid}`;
 const pat=svg('pattern',{id,width:20,height:20,patternUnits:'userSpaceOnUse'},defs);svg('path',{d:'M20 0H0V20',class:'bd-gridline'},pat);
 return{s,defs,gridFill:`url(#${id})`};
}
function hand(parent,defs,x,y,text,cls,size){
 const id=`lv-clip-${++uid}`;const cp=svg('clipPath',{id},defs);const rect=svg('rect',{x:x-6,y:y-size*1.3,width:0,height:size*1.9},cp);
 const g=svg('g',{'clip-path':`url(#${id})`},parent);const t=svg('text',{x,y,class:`bd-hand ${cls||''}`,'font-size':size},g);
 String(text).split(/\^(\d+)/).forEach((part,i)=>{if(!part)return;if(i%2){const sup=svg('tspan',{dy:-size*.4,'font-size':size*.62},t);sup.textContent=part;const back=svg('tspan',{dy:size*.4},t);back.textContent=' '}else{const sp=svg('tspan',{},t);sp.textContent=part}});
 return{t,rect,x,y};
}
function hideHand(h){h.rect.setAttribute('width','0')}
function write(tk,h,ms,cur){
 if(tk.instant){h.rect.setAttribute('width','3000');return Promise.resolve()}
 let w=200;try{w=h.t.getBBox().width+14}catch{}
 return tween(tk,ms,k=>{h.rect.setAttribute('width',String(w*k));if(cur)cur.at(h.x+w*k-8,h.y-4)},linear);
}
function printed(parent,x,y,text,maxW,lh,cls){
 const t=svg('text',{x,y,class:cls},parent);let line=svg('tspan',{x,dy:0},t);let cur='';
 text.split(' ').forEach(word=>{const test=cur?cur+' '+word:word;line.textContent=test;if(line.getComputedTextLength()>maxW&&cur){line.textContent=cur;line=svg('tspan',{x,dy:lh},t);cur=word;line.textContent=word}else cur=test});
 return t;
}
const stroke=(parent,d,cls)=>svg('path',{d,class:cls},parent);
function hidePath(p){const L=p.getTotalLength();p.setAttribute('stroke-dasharray',`${L} ${L}`);p.setAttribute('stroke-dashoffset',String(L))}
function draw(tk,p,ms,cur,ez=easeIO){const L=p.getTotalLength();p.setAttribute('stroke-dasharray',`${L} ${L}`);return tween(tk,ms,k=>{p.setAttribute('stroke-dashoffset',String(L*(1-k)));if(cur&&!tk.instant){const q=p.getPointAtLength(L*k);cur.at(q.x,q.y)}},ez)}
function cursor(parent,name,color,cls){
 const g=svg('g',{class:`bd-cur ${cls||''}`},parent);
 svg('path',{d:'M0 0L0 15.5L4.2 11.6L7.1 18.2L9.9 17L7 10.6L12.6 10.4Z',fill:color,class:'bd-cur-arrow'},g);
 const pill=svg('g',{transform:'translate(11 17)'},g);svg('rect',{width:name.length*6.6+14,height:17,rx:8.5,fill:color},pill);
 const t=svg('text',{x:7,y:12.2,class:'bd-cur-name'},pill);t.textContent=name;
 const c={g,x:0,y:0,at(x,y){c.x=x;c.y=y;g.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`)},
  move(tk,x,y,ms=600,ez=easeIO){const x0=c.x,y0=c.y;return tween(tk,ms,k=>c.at(x0+(x-x0)*k,y0+(y-y0)*k),ez)},show(on){g.classList.toggle('is-on',on)}};
 return c;
}
function fakeCursor(root){
 const c=$('.fake-cursor',root);
 const pos=(node,fx=.5,fy=.55)=>{const r=root.getBoundingClientRect(),q=node.getBoundingClientRect();const sc=r.width/root.offsetWidth||1;return[(q.left-r.left+q.width*fx)/sc,(q.top-r.top+q.height*fy)/sc]};
 return{to(node,fx,fy){const[x,y]=pos(node,fx,fy);c.style.setProperty('--x',`${x}px`);c.style.setProperty('--y',`${y}px`)},
  xy(x,y,ms){if(ms!=null)c.style.setProperty('--move',`${ms}ms`);c.style.setProperty('--x',`${x}px`);c.style.setProperty('--y',`${y}px`)},
  show(on){c.classList.toggle('is-on',on)},click(){c.classList.remove('is-click');void c.offsetWidth;c.classList.add('is-click')},dur(ms){c.style.setProperty('--move',`${ms}ms`)}};
}

/* ---------- говорящие головы ---------- */
const PEOPLE={
 ion:{name:'Ион',skin:'#E8C0A2',hair:'#1D1916',shirt:'#1E2433',bg:'#FFE2CF',style:'curly',beard:true},
 anya:{name:'Аня',skin:'#F3D0B6',hair:'#7A4A2A',shirt:'#2F855A',bg:'#DDF3E4',style:'long'},
 misha:{name:'Миша',skin:'#EBC6A8',hair:'#D7A13E',shirt:'#2B6CB0',bg:'#DCE8F7',style:'short'},
 katya:{name:'Катя',skin:'#F5D5BF',hair:'#A23B2A',shirt:'#B83280',bg:'#F8DDEB',style:'bob'},
 dima:{name:'Дима',skin:'#E2B694',hair:'#2B2422',shirt:'#805AD5',bg:'#E8E0FA',style:'short',glasses:true}
};
function face(p,parent){
 const s=svg('svg',{viewBox:'0 0 48 48',class:'hd'},parent);
 svg('circle',{cx:24,cy:24,r:24,fill:p.bg},s);
 const clip=`hd-${++uid}`;const cp=svg('clipPath',{id:clip},svg('defs',{},s));svg('circle',{cx:24,cy:24,r:24},cp);
 const g=svg('g',{'clip-path':`url(#${clip})`},s);
 if(p.style==='long'||p.style==='bob')svg('path',{d:p.style==='long'?'M11.5 22C11 9 37 9 36.5 22L38 41C33 43 15 43 10 41Z':'M12 22C11.5 9 36.5 9 36 22L36.5 33C32 35 16 35 11.5 33Z',fill:p.hair},g);
 svg('path',{d:'M5 50C7 39 15 35.5 24 35.5C33 35.5 41 39 43 50Z',fill:p.shirt},g);
 svg('rect',{x:20.5,y:28,width:7,height:9,rx:3,fill:p.skin},g);
 svg('ellipse',{cx:24,cy:21,rx:10,ry:11.5,fill:p.skin},g);
 if(p.style==='curly')[[14.5,13],[18,9.2],[22.5,7.4],[27.5,7.6],[31.5,9.6],[34.2,13.4],[16,15.6],[32.6,16.6],[20.4,11.6],[26,10.6]].forEach(([x,y])=>svg('circle',{cx:x,cy:y,r:4.4,fill:p.hair},g));
 if(p.style==='short')svg('path',{d:'M13.6 19C13 9.5 19 6.6 24 6.6C30 6.6 35.4 9.5 34.6 19C32 13.6 28 12.4 24 12.4C20 12.4 16 13.4 13.6 19Z',fill:p.hair},g);
 if(p.style==='long'||p.style==='bob')svg('path',{d:'M13 18C14 9.5 20 7.6 24 7.6C29 7.6 34 10 35 18C31 14 22.5 12.5 13 18Z',fill:p.hair},g);
 if(p.beard){svg('path',{d:'M14.2 21.5C14.6 30 19.6 33.6 24 33.6C28.4 33.6 33.4 30 33.8 21.5C31.6 26.6 28.2 28 24 28C19.8 28 16.4 26.6 14.2 21.5Z',fill:p.hair},g);svg('path',{d:'M19.6 25.4Q24 23.4 28.4 25.4Q24 26.4 19.6 25.4Z',fill:p.hair},g)}
 const eyes=svg('g',{class:'hd-eyes'},g);svg('circle',{cx:20,cy:21,r:1.35,fill:'#231F20'},eyes);svg('circle',{cx:28,cy:21,r:1.35,fill:'#231F20'},eyes);
 if(p.glasses){svg('circle',{cx:20,cy:21,r:3.7,class:'hd-glass'},g);svg('circle',{cx:28,cy:21,r:3.7,class:'hd-glass'},g);svg('path',{d:'M23.7 21H24.3',class:'hd-glass'},g)}
 svg('ellipse',{cx:24,cy:p.beard?27.4:27,rx:2.5,ry:1,fill:p.beard?'#7A3328':'#9A4436',class:'hd-mouth'},g);
 return s;
}
function callStrip(stage,ids){
 const strip=el('div','call',stage);const tiles={};
 ids.forEach(id=>{const t=el('div','call-p',strip);face(PEOPLE[id],t);tiles[id]=t});
 const say=el('div','call-say',stage);const sayFace=el('span','call-say-face',say);const sayTxt=el('b','',say);el('span','call-say-sub',say,'говорит');const bars=el('i','call-bars',say);for(let i=0;i<5;i++)el('i','',bars);
 return{talk(id){Object.entries(tiles).forEach(([k,t])=>t.classList.toggle('is-talking',k===id));if(id){sayFace.textContent='';face(PEOPLE[id],sayFace);sayTxt.textContent=PEOPLE[id].name;say.classList.add('is-on')}else say.classList.remove('is-on')},
  show(on){strip.classList.toggle('is-on',on);if(!on)say.classList.remove('is-on')}};
}

/* ---------- подгонка под экран слайда ---------- */
// Слайд не должен прокручиваться на компьютере: если сцена выше экрана, уменьшаем живое окно ровно на перебор.
const desktop=()=>innerWidth>760;
function shrinkToStage(section,measure,setH){
 const stageEl=section.closest('#stage');if(!stageEl||!desktop())return;
 let prev=Infinity,lastH=0;
 for(let k=0;k<4;k++){const over=section.offsetHeight-stageEl.clientHeight;if(over<=1)return;
  // уменьшение не помогло (выше уже другая колонка) — возвращаем прошлый размер
  if(over>=prev-1){if(lastH)setH(lastH,measure());return}
  prev=over;const h=measure();if(!h)return;lastH=h;setH(Math.max(200,h-over-2),h)}
}
function watch(section,targets,apply){
 const stageEl=section.closest('#stage');const list=[...targets,stageEl].filter(Boolean);let raf=0,last='';
 const run=()=>{const key=list.map(t=>`${t.clientWidth}:${t===stageEl?t.clientHeight:0}`).join();if(key===last)return;last=key;apply()};
 const ro=new ResizeObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(run)});list.forEach(t=>ro.observe(t));
 run();return()=>{cancelAnimationFrame(raf);ro.disconnect()};
}

/* ---------- студия: рамка, подгонка, бесконечный показ ---------- */
// Сцена рисуется в своём размере (800×500 или 400×560) и вписывается в свободное место слайда.
function studio(section,host,build,{maxScale=1.3,people,sayBottom=false,callInBar=false}={}){
 const frame=el('div','lv-frame lv-rise',host);const st=el('div','lv-stage',frame);const view=el('div','lv-view',st);const capEl=el('p','lv-cap',st);
 if(sayBottom)st.classList.add('say-bottom');
 if(callInBar)st.classList.add('call-in-bar');
 const narrow=host.clientWidth>0&&host.clientWidth<560;frame.classList.toggle('is-narrow',narrow);
 const W=narrow?400:800,H=narrow?560:500;
 const fitFrame=()=>{const aw=host.clientWidth||W;let sc=Math.min(maxScale,aw/W);frame.style.width=`${Math.floor(W*sc)}px`;
  shrinkToStage(section,()=>frame.offsetHeight,(nh,h)=>{sc*=nh/h;frame.style.width=`${Math.floor(W*sc)}px`})};
 const call=people?callStrip(st,people):null;if(call){call.show(true);st.classList.add('has-call')}
 const cap=t=>{capEl.textContent=t;capEl.classList.remove('is-new');void capEl.offsetWidth;capEl.classList.add('is-new')};
 const scene=build(view,narrow,call,W,H);
 let tk=null,alive=true;
 const unwatch=watch(section,[host],fitFrame);
 async function loop(){
  if(reduced()){tk=token(true);await scene.play(tk,cap);call?.talk(null);scene.final?.();return}
  while(alive){tk=token(false);const my=tk;await scene.play(my,cap);if(!alive||!my.alive)return;await wait(my,900)}
 }
 const start=()=>{loop()};
 const ready=document.fonts?.load?Promise.race([document.fonts.load('20px "Bad Script"'),new Promise(r=>setTimeout(r,1200))]):Promise.resolve();
 Promise.all([ready,new Promise(r=>setTimeout(r,reduced()?0:950))]).then(()=>{if(alive)start()});
 return{dispose(){alive=false;kill(tk);unwatch();scene.dispose?.()}};
}

/* ================= теория: презентация → доска ================= */
function theoryScene(view,narrow,call,W,H){
 view.classList.add('act-pres');
 const pres=el('div','pres',view);if(narrow)pres.classList.add('is-narrow');
 pres.style.width=`${W}px`;pres.style.height=`${H}px`;
 const fitPres=()=>{const w=view.clientWidth;if(w)pres.style.setProperty('--sc',String(w/W))};
 const presRo=new ResizeObserver(fitPres);presRo.observe(view);
 const body=el('div','pres-body',pres);
 el('p','pres-eyebrow',body,'Кодирование звука · задание 7');
 const h=el('h4','pres-title',body);h.append('Чем ');el('span','',h,'чаще замеры');h.append(', тем точнее звук');
 const plotBox=el('div','pres-plot',body);
 const PW=narrow?352:470,PH=narrow?170:210;
 const ps=svg('svg',{viewBox:`0 0 ${PW} ${PH}`,class:'pres-svg'},plotBox);
 const O={x:18,y:PH-18,w:PW-34,mid:(PH-18)/2+4,amp:(PH-18)*.36};
 svg('path',{d:`M${O.x} ${O.y}H${O.x+O.w+8}M${O.x} ${O.y}V8`,class:'pres-axis'},ps);
 const f=u=>O.mid-O.amp*Math.sin(u*2*Math.PI*1.15+.35);
 let wd=`M${O.x} ${f(0).toFixed(1)}`;for(let i=1;i<=120;i++){const u=i/120;wd+=`L${(O.x+u*O.w).toFixed(1)} ${f(u).toFixed(1)}`}
 svg('path',{d:wd,class:'pres-wave'},ps);
 const samplesG=svg('g',{class:'pres-samples'},ps);const stepsP=svg('path',{class:'pres-steps'},ps);
 const q=8;const quant=y=>O.y-Math.round((O.y-y)/q)*q;
 function plot(n){samplesG.textContent='';const st=O.w/n;let d=`M${O.x} ${quant(f(0)).toFixed(1)}`;
  for(let k=1;k<=n;k++){const x=O.x+k*st,y=f(k/n);svg('path',{d:`M${x.toFixed(1)} ${O.y}V${y.toFixed(1)}`},samplesG);svg('circle',{cx:x.toFixed(1),cy:y.toFixed(1),r:n>30?1.4:2.2},samplesG);d+=`H${x.toFixed(1)}V${quant(y).toFixed(1)}`}
  stepsP.setAttribute('d',d);plotBox.classList.remove('is-flash');void plotBox.offsetWidth;plotBox.classList.add('is-flash')}
 const side=el('div','pres-side',body);const ctl=el('div','pres-ctl',side);el('span','pres-ctl-l',ctl,'Частота дискретизации');
 const val=el('b','pres-val',ctl,'6 кГц');const sub=el('small','pres-sub',ctl,'6 000 замеров в секунду');
 const track=el('div','pres-track',ctl);const fill=el('i','pres-fill',track);const thumb=el('b','pres-thumb',track);
 const ticks=el('div','pres-ticks',ctl);['6','12','24','48'].forEach(t=>el('span','',ticks,t));
 if(!narrow)el('p','pres-note',side,'Каждый замер — число. Чаще замеры — точнее звук, но больше файл.');
 const nav=el('div','pres-nav',pres);el('span','pres-menu',nav,'☰ Меню');const mid=el('span','pres-mid',nav);el('span','pres-pg',mid,'‹  05 / 24  ›');const next=el('span','pres-next',mid,'Дальше');if(!narrow)el('span','pres-notes',nav,'Пояснения');
 el('i','pres-prog',pres);
 const pcur=el('span','fake-cursor pres-cursor',pres);
 const VALS=[[6,'6 кГц','6 000'],[12,'12 кГц','12 000'],[24,'24 кГц','24 000'],[48,'48 кГц','48 000']];
 function setVal(i){const[n,t,s]=VALS[i];val.textContent=t;sub.textContent=`${s} замеров в секунду`;const p=i/3*100;thumb.style.setProperty('--p',`${p}%`);fill.style.setProperty('--p',`${p}%`);plot(n)}
 const presCur={to(node,fx=.5,fy=.5){const r=pres.getBoundingClientRect(),q=node.getBoundingClientRect();const sc=r.width/pres.offsetWidth||1;pcur.style.setProperty('--x',`${(q.left-r.left+q.width*fx)/sc}px`);pcur.style.setProperty('--y',`${(q.top-r.top+q.height*fy)/sc}px`)},show(on){pcur.classList.toggle('is-on',on)},click(){pcur.classList.remove('is-click');void pcur.offsetWidth;pcur.classList.add('is-click')}};
 // доска
 const boardWrap=el('div','board-act',view);
 const {s,defs,gridFill}=makeBoard(boardWrap,W,H);
 svg('rect',{width:W,height:H,fill:'#FBFBFC'},s);svg('rect',{width:W,height:H,fill:gridFill},s);
 const P=narrow?{x:12,y:12,w:376,h:536,head:40}:{x:40,y:22,w:720,h:456,head:44};
 svg('rect',{x:P.x,y:P.y,width:P.w,height:P.h,class:'bd-page'},s);svg('rect',{x:P.x,y:P.y,width:P.w,height:P.head,class:'bd-page-head'},s);
 const title=svg('text',{x:P.x+18,y:P.y+P.head/2+5,class:'bd-title'},s);title.textContent=narrow?'Ион · Задание 7':'Ион  ·  Задание 7  ·  Кодирование звука';
 const TX=P.x+(narrow?16:24);
 printed(s,TX,P.y+P.head+(narrow?28:34),'Звук записан в моно с частотой 8 кГц и глубиной кодирования 16 бит. Запись длится 10 секунд. Сколько Кбайт занимает файл?',narrow?P.w-32:470,narrow?17:21,'bd-print'+(narrow?' bd-print-sm':''));
 svg('path',{d:`M${P.x} ${narrow?150:158}H${P.x+P.w}`,class:'bd-rule'},s);
 const L=narrow?[[TX,192,'V = ν · i · t · k','bd-ink',25],[TX,226,'ν = 8000 Гц, i = 16 бит','bd-navy',16],[TX,250,'t = 10 с, k = 1','bd-navy',16],[TX,292,'V = 8000 · 16 · 10 · 1','bd-ink',19],[TX,324,'= 1 280 000 бит','bd-ink',19],[TX,356,'= 160 000 байт','bd-ink',19],[TX,388,'≈ 156 Кбайт','bd-ink',19],[TX+10,452,'Ответ: 156','bd-orange',24]]
  :[[TX,206,'V = ν · i · t · k','bd-ink',30],[440,200,'ν = 8000 Гц,  i = 16 бит','bd-navy',18],[440,228,'t = 10 с,  k = 1','bd-navy',18],[TX,278,'V = 8000 · 16 · 10 · 1 = 1 280 000 бит','bd-ink',22],[TX,320,'1 280 000 бит : 8 = 160 000 байт','bd-ink',22],[TX,362,'160 000 байт : 1024 ≈ 156 Кбайт','bd-ink',22],[TX+12,432,'Ответ: 156','bd-orange',28]];
 const lines=L.map(([x,y,t,c,z])=>hand(s,defs,x,y,t,c,z));const ans=L[L.length-1];
 const box=stroke(s,narrow?`M${ans[0]-12} ${ans[1]-30}h150v44h-150z`:`M${ans[0]-14} ${ans[1]-34}h176v50h-176z`,'bd-pen bd-orange bd-thick');
 const ion=cursor(s,'Ион','#B9521D','is-ion');
 function reset(){view.classList.add('act-pres');view.classList.remove('act-board');setVal(0);presCur.show(false);lines.forEach(hideHand);hidePath(box);ion.show(false);ion.at(W+20,120)}
 async function play(tk,cap){
  reset();cap('Теорию рассказываю на интерактивной презентации');
  call.talk('ion');presCur.show(true);presCur.to(next,.5,.5);await wait(tk,700);
  for(let i=1;i<=2;i++){presCur.to(thumb,.5,.5);await wait(tk,650);presCur.click();setVal(i);await wait(tk,700);presCur.to(track,i===1?.62:.95,.5);await wait(tk,500)}
  call.talk('katya');cap('Вопросы — голосом, в любой момент');await wait(tk,2300);
  call.talk('ion');presCur.to(thumb,.5,.5);await wait(tk,500);presCur.click();setVal(3);await wait(tk,1300);
  presCur.to(next,.5,.55);await wait(tk,700);presCur.click();await wait(tk,250);
  view.classList.remove('act-pres');view.classList.add('act-board');presCur.show(false);
  cap('Задание разбираем на доске');await wait(tk,500);
  ion.show(true);await ion.move(tk,TX,L[0][1]-8,600);
  for(let i=0;i<lines.length-1;i++){await write(tk,lines[i],narrow?560:680,ion);await wait(tk,120)}
  await write(tk,lines[lines.length-1],520,ion);await draw(tk,box,560,ion);
  call.talk(null);await ion.move(tk,W-50,H-30,700);await wait(tk,2200);
 }
 reset();fitPres();
 return{play,final(){view.classList.remove('act-pres');view.classList.add('act-board')},dispose(){presRo.disconnect()}};
}

/* ================= практика: доски учеников ================= */
function practiceScene(view,narrow,call,W,H){
 const BAR=28;const {s,defs,gridFill}=makeBoard(view,W,H);
 const clipId=`lv-world-${++uid}`;const cp=svg('clipPath',{id:clipId},defs);svg('rect',{x:0,y:BAR,width:W,height:H-BAR},cp);
 const world=svg('g',{},svg('g',{'clip-path':`url(#${clipId})`},s));
 svg('rect',{x:-W,y:-H,width:W*3,height:H*3,fill:'#FBFBFC'},world);svg('rect',{x:-W,y:-H,width:W*3,height:H*3,fill:gridFill},world);
 const bar=svg('g',{},s);svg('rect',{width:W,height:BAR,class:'bd-bar'},bar);const bt=svg('text',{x:12,y:18.5,class:'bd-bar-t'},bar);bt.textContent=narrow?'Группа 1 · Информатика':'Группа 1  |  Информатика 2027';
 const ALL=[
  {id:'anya',color:'#2F855A',task:'№ 7. Камера делает снимки 768 × 600 пикселей. Файл — не больше 420 Кбайт, сжатия нет. Сколько цветов максимум в палитре?',sol:['768 · 600 · i ≤ 420 · 2^13','i ≤ 7,4  →  i = 7','N = 2^7 = 128'],ans:'128'},
  {id:'misha',color:'#2B6CB0',task:'№ 11. Пароль — 15 символов из 12 букв. Символ — минимум бит, пароль — целое число байт. Сколько байт на 20 паролей?',sol:['12 букв → i = 4 бита','15 · 4 = 60 бит → 8 байт','8 · 20 = 160 байт'],ans:'160'},
  {id:'katya',color:'#B83280',task:'№ 7. Рисунок 1024 × 512 пикселей, палитра из 256 цветов. Сколько Кбайт занимает рисунок?',sol:['256 = 2^8 → i = 8 бит','1024 · 512 · 8 бит','= 512 Кбайт'],ans:'512'},
  {id:'dima',color:'#805AD5',task:'№ 11. Номер — 10 символов: 26 букв и 10 цифр. Символ — минимум бит, номер — целое число байт. Сколько байт на 50 номеров?',sol:['26 + 10 = 36 символов','10 · 6 = 60 бит → 8 байт','8 · 50 = 400 байт'],ans:'400',stuck:true}
 ];
 const people=narrow?[ALL[0],ALL[3]]:ALL;
 const cw=narrow?176:172,gap=narrow?16:18,n=people.length,x0=(W-(n*cw+(n-1)*gap))/2,y0=BAR+14,ch=H-BAR-26;
 const SY=[150,180,226],ANS_Y=286;
 const cols=people.map(p=>{
  const ci=people.indexOf(p);const gx=x0+ci*(cw+gap);const g=svg('g',{transform:`translate(${gx} ${y0})`},world);
  svg('rect',{width:cw,height:ch,class:'bd-col'},g);svg('rect',{width:cw,height:26,class:'bd-col-head'},g);svg('circle',{cx:14,cy:13,r:8,fill:p.color},g);
  const nt=svg('text',{x:28,y:17.5,class:'bd-col-name'},g);nt.textContent=PEOPLE[p.id].name;
  printed(g,8,41,p.task,cw-16,12,'bd-task');
  svg('path',{d:`M0 104H${cw}`,class:'bd-rule'},g);const sl=svg('text',{x:8,y:121,class:'bd-label'},g);sl.textContent='Решение:';
  const sol=p.sol.map((t,i)=>hand(g,defs,8,p.stuck&&i>0?SY[i]+28:SY[i]-(i?0:6),t,'bd-ink',14.5));
  svg('path',{d:`M0 ${ANS_Y-24}H${cw}`,class:'bd-rule'},g);const al=svg('text',{x:8,y:ANS_Y,class:'bd-label'},g);al.textContent='Ответ:';
  const ans=hand(g,defs,50,ANS_Y+2,p.ans,'bd-ink',19);const tick=stroke(g,`M${cw-30} ${ANS_Y-9}l5 6l11 -13`,'bd-pen bd-check');
  svg('path',{d:`M0 ${ANS_Y+14}H${cw}`,class:'bd-rule'},g);
  for(let i=0;i<4;i++)svg('rect',{x:8,y:ANS_Y+30+i*8,width:cw-24-((i*37)%40),height:3.2,rx:1.6,class:'bd-txt'},g);
  svg('rect',{x:0,y:ch-24,width:cw,height:2.6,class:'bd-module-line'},g);const mt=svg('text',{x:cw/2,y:ch-7,class:'bd-module','text-anchor':'middle'},g);mt.textContent='Модуль 2';
  return{g,gx,p,sol,ans,tick,cur:cursor(world,PEOPLE[p.id].name,p.color)};
 });
 const stuck=cols.find(c=>c.p.stuck);
 const hint=hand(stuck.g,defs,8,SY[1]+2,'2^6 = 64 ≥ 36 → 6 бит','bd-orange',14.5);
 const hintBox=stroke(stuck.g,`M4 ${SY[1]-16}h${cw-10}v24h${-(cw-10)}z`,'bd-pen bd-orange');
 const ion=cursor(world,'Ион','#B9521D','is-ion');
 const scaleTo=narrow?1.6:1.85;
 function setZoom(k){const s1=1+(scaleTo-1)*k;const fx=stuck.gx+cw/2,fy=y0+196;const tx=(W/2-fx*s1)*k,ty=((BAR+(H-BAR)/2)-fy*s1)*k;world.setAttribute('transform',`translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s1.toFixed(4)})`)}
 const abs=(c,x,y)=>[c.gx+x,y0+y];const via=c=>({at:(x,y)=>c.cur.at(c.gx+x,y0+y)});const viaIon=c=>({at:(x,y)=>ion.at(c.gx+x,y0+y)});
 function reset(){setZoom(0);cols.forEach(c=>{c.sol.forEach(hideHand);hideHand(c.ans);hidePath(c.tick);c.cur.show(false);c.cur.at(...abs(c,cw*.7,ch*.8))});hideHand(hint);hidePath(hintBox);ion.show(false);ion.at(W+30,BAR+10)}
 async function student(tk,c,i){await wait(tk,300+i*420);c.cur.show(true);await c.cur.move(tk,...abs(c,12,SY[0]-10),520);
  for(const h of c.sol){await write(tk,h,780+i*60,via(c));await wait(tk,260)}
  await c.cur.move(tk,...abs(c,50,ANS_Y-6),380);await write(tk,c.ans,420,via(c));await c.cur.move(tk,...abs(c,cw*.6,ANS_Y+46+i*6),700)}
 async function stuckStudent(tk){stuck.cur.show(true);await stuck.cur.move(tk,...abs(stuck,12,SY[0]-10),520);await write(tk,stuck.sol[0],900,via(stuck));await stuck.cur.move(tk,...abs(stuck,cw*.42,SY[1]+4),500)}
 async function play(tk,cap){
  reset();call.talk(null);cap(narrow?'Каждый решает на своей доске':'Каждый решает на своей доске — я вижу все сразу');
  await Promise.all([...cols.filter(c=>!c.p.stuck).map((c,i)=>student(tk,c,i)),stuckStudent(tk)]);
  call.talk('dima');cap('Дима спрашивает голосом — подключаюсь');await wait(tk,1900);
  ion.show(true);call.talk('ion');
  await Promise.all([ion.move(tk,...abs(stuck,10,SY[1]-6),900),tween(tk,1000,setZoom)]);
  await write(tk,hint,1100,viaIon(stuck));await draw(tk,hintBox,520,viaIon(stuck));
  call.talk(null);await ion.move(tk,...abs(stuck,cw*.82,SY[2]+40),420);
  for(const h of stuck.sol.slice(1)){await write(tk,h,760,via(stuck));await wait(tk,200)}
  await stuck.cur.move(tk,...abs(stuck,50,ANS_Y-6),320);await write(tk,stuck.ans,420,via(stuck));
  await ion.move(tk,...abs(stuck,cw-30,ANS_Y-9),380);await draw(tk,stuck.tick,320,viaIon(stuck));
  cap('Разобрались ✓');await wait(tk,500);await tween(tk,950,k=>setZoom(1-k));
  for(const c of cols){if(c===stuck)continue;await ion.move(tk,...abs(c,cw-30,ANS_Y-9),360);await draw(tk,c.tick,260,viaIon(c))}
  await ion.move(tk,W-40,H-30,700);await wait(tk,2200);
 }
 reset();
 return{play};
}

/* ================= «окна» сайтов ================= */
// Окно сайта: макет в «родной» ширине, масштаб — по ширине колонки и по высоте экрана слайда.
function fitWindow(section,{maxScale=1.3}={}){
 const win=$('.win',section),body=$('.win-body',win),inner=body.firstElementChild,wrap=win.parentElement;
 const apply=()=>{const w=wrap.clientWidth;if(!w)return;const narrow=!!body.dataset.fitNarrow&&w<520;const design=Number(narrow?body.dataset.fitNarrow:body.dataset.fit);
  inner.classList.toggle('is-narrow',narrow);inner.style.width=`${design}px`;const natural=inner.offsetHeight;
  const set=sc=>{inner.style.setProperty('--fit',String(sc));body.style.height=`${Math.ceil(natural*sc)}px`;win.style.width=`${Math.floor(design*sc)+2}px`};
  let sc=Math.min(maxScale,(w-2)/design);set(sc);
  shrinkToStage(section,()=>body.offsetHeight,nh=>{sc=nh/natural;set(sc)})};
 return watch(section,[wrap],apply);
}
const winBar=url=>`<div class="win-bar"><i></i><i></i><i></i><span>${url}</span></div>`;

/* ================= 1. класс из 30 (сцена «Сложность в цифрах») ================= */
export function classMarkup(){
 return `<div class="lv-klass"><div class="lv-kstats"><div class="lv-kstat" data-ks="1"><strong>1 из 6</strong><p>не преодолел<br> минимальный порог</p></div><div class="lv-kstat" data-ks="2"><strong>1 из 5</strong><p>набирает<br> 80+ баллов</p></div><div class="lv-krank"><img src="imported/assets/slide-04-2.png" alt="Грустный бегемотик"><div><strong>2-е место</strong><p>по сложности*</p></div></div></div><div class="klass-stage" data-state="-1" aria-hidden="true"><p class="klass-cap">Класс из 30 выпускников</p><div class="klass-grid"></div><p class="klass-count"><b data-klass-n>30</b><span data-klass-unit>выпускников сдают информатику</span></p></div></div>`;
}
export function bindClass(section,{direction=1}={}){
 const grid=$('.klass-grid',section),stage=$('.klass-stage',section),num=$('[data-klass-n]',section),unit=$('[data-klass-unit]',section),stats=$$('[data-ks]',section);
 const FAIL=[2,9,13,21,26],TOP=[0,5,11,17,23,28];const figs=[];
 for(let i=0;i<30;i++){const f=el('span','kf',grid);f.style.setProperty('--i',String((i%10)+Math.floor(i/10)*3));const b=el('span','kf-badge',f);if(FAIL.includes(i))b.textContent='✕';if(TOP.includes(i))b.textContent='80+';figs.push(f)}
 const STATES=[[30,'выпускников сдают информатику'],[5,'из 30 — ниже порога'],[6,'из 30 — 80+ баллов']];
 let raf=0;
 const count=to=>{cancelAnimationFrame(raf);if(reduced()){num.textContent=String(to);return}const from=Number(num.textContent)||0,t0=performance.now();const tick=now=>{const t=Math.min(1,Math.max(0,(now-t0)/600));num.textContent=String(Math.round(from+(to-from)*(1-Math.pow(1-t,3))));if(t<1)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)};
 const api={steps:2,step:0,label:n=>n===1?'Дальше: кто не сдаёт':'Дальше: кто набирает 80+',
  go(n){api.step=n;stage.dataset.state=String(n);stats.forEach(s=>s.classList.toggle('is-on',Number(s.dataset.ks)===n));stats.forEach(s=>s.classList.toggle('is-dim',n>0&&Number(s.dataset.ks)!==n));
   figs.forEach((f,j)=>{f.classList.toggle('is-fail',n===1&&FAIL.includes(j));f.classList.toggle('is-top',n===2&&TOP.includes(j))});const[v,u]=STATES[n];count(v);unit.textContent=u;api.onChange?.()},
  dispose(){cancelAnimationFrame(raf)}};
 api.go(direction<0?2:0);
 const fitGrid=()=>{grid.style.width='';shrinkToStage(section,()=>grid.offsetHeight,(nh,h)=>{grid.style.width=`${Math.floor(grid.offsetWidth*nh/h)}px`})};
 const unwatch=watch(section,[stage],fitGrid);
 const dispose0=api.dispose;api.dispose=()=>{dispose0();unwatch()};
 return api;
}

/* ================= кольцо 19 из 27 (сцена «Программирование») ================= */
// 27 делений по кругу; оранжевые загораются ровно в такт счётчику в центре.
export function ringMarkup(code=19){
 const R=78,C=90,gap=2.4;let d='';
 for(let i=0;i<27;i++){const a0=(i/27)*360+gap/2,a1=((i+1)/27)*360-gap/2;const p=a=>[C+R*Math.cos(a*Math.PI/180),C+R*Math.sin(a*Math.PI/180)];const[x0,y0]=p(a0),[x1,y1]=p(a1);
  d+=`<path class="cr-seg${i<code?' cr-code':''}" d="M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}"/>`}
 return `<svg class="code-ring" viewBox="0 0 180 180" aria-hidden="true">${d}</svg>`;
}
export function bindRing(section){
 const num=$('.code-count>strong',section),segs=$$('.cr-code',section);let raf=0;const t0=performance.now();
 const paint=v=>segs.forEach((s,i)=>s.classList.toggle('is-lit',i<v));
 if(reduced()){paint(segs.length);return{dispose(){}}}
 paint(0);
 const tick=now=>{const v=parseInt(num.textContent,10)||0;paint(Math.min(segs.length,v));if(now-t0<2600)raf=requestAnimationFrame(tick);else paint(segs.length)};
 raf=requestAnimationFrame(tick);
 return{dispose(){cancelAnimationFrame(raf)}};
}

/* ================= 2. платформа IONINF (сцена «Автоматическая проверка») ================= */
export function ctMarkup(){
 let cells='';for(let n=1;n<=9;n++)for(let k=0;k<2;k++)cells+=`<span class="${n<=2&&k===0?'bad':'ok'}">${n}</span>`;
 return `<div class="win win-ct lv-win lv-rise" aria-label="Платформа IONINF: ответ 128 засчитан, решение прикреплено, результат 7 из 9">${winBar('ion-inf.cloudtext.ru')}<div class="win-body" data-fit="920" data-fit-narrow="440"><div class="ct" data-ct><div class="ct-top"><b class="ct-logo"><span>ION</span>INF</b><i class="ct-burger"></i><span class="ct-prof">Профиль<i></i></span></div><aside class="ct-side"><span class="is-on"><i class="ct-ic"></i>Работы<em>9</em></span><span><i class="ct-ic ct-ic2"></i>Материалы</span></aside><div class="ct-view"><div class="ct-scroll"><section class="ct-card ct-res"><h5>Результат: <span data-ct-res>7 из 9 (78%)</span></h5><div class="ct-cells">${cells}</div><p class="ct-legend"><i class="ok"></i>- правильный ответ <i class="bad"></i>- неправильный ответ</p></section><section class="ct-card ct-work"><header>Номер 7.1 (Изображения)<span class="ct-icons"><i></i><i></i></span></header><div class="ct-in"><p class="ct-caps">!!! ИНСТРУКЦИЯ ПО ПРИКРЕПЛЕНИЮ ОТВЕТА !!!</p><p class="ct-caps">В ПОЛЕ ПОД ЗАДАНИЕМ ВПИСЫВАЕМ ТОЛЬКО ОТВЕТ (ТАК КАК НАПИСАНО В ЗАДАНИИ)</p><div class="ct-q"><span class="ct-n">2</span><div class="ct-qbox"><small>№ 51 Джобс 31.08.2020 (Уровень: Базовый)</small><p>Камера делает фотоснимки 768 на 600 пикселей. При этом объём файла с изображением не может превышать 420 Кбайт, упаковка данных не производится. Какое максимальное количество цветов можно использовать в палитре изображения?</p></div></div><div class="ct-ans"><span data-ct-typed>128</span><i class="ct-caret"></i><span class="ct-hint">← Ответ</span></div><div class="ct-ok">Правильный ответ на вопрос</div><p class="ct-caps">!! В ПОЛЕ «СКРИН РЕШЕНИЯ» ВСТАВЛЯЕМ ТОЛЬКО СКРИНШОТ С РЕШЕНИЕМ !!</p><div class="ct-q"><span class="ct-n">2</span><div class="ct-field">Скрин решения (shift + win + s):</div></div><div class="ct-shot"><svg viewBox="0 0 820 300" class="ct-sheet" data-ct-sheet></svg><span class="ct-calc">7,466666666666667</span></div></div></section></div></div><span class="fake-cursor" aria-hidden="true"></span></div></div></div>`;
}
export function bindCt(section){
 const ct=$('[data-ct]',section),scroll=$('.ct-scroll',ct),typed=$('[data-ct-typed]',ct),res=$('[data-ct-res]',ct),cells=$$('.ct-cells span',ct),shot=$('.ct-shot',ct),sheet=$('[data-ct-sheet]',ct),ans=$('.ct-ans',ct);
 const unfit=fitWindow(section);
 const cur=fakeCursor(ct);
 const defs=svg('defs',{},sheet);const pid=`ct-grid-${++uid}`;const pat=svg('pattern',{id:pid,width:14,height:14,patternUnits:'userSpaceOnUse'},defs);svg('path',{d:'M14 0H0V14',class:'ct-gridline'},pat);
 svg('rect',{width:820,height:300,fill:'#FCFBFA'},sheet);svg('rect',{width:820,height:300,fill:`url(#${pid})`},sheet);
 const HL=[[26,52,'768 × 600'],[26,104,'V ≤ 420 Кбайт'],[26,156,'Найти N'],[330,52,'768 · 600 · i ≤ 420 · 2^13 бит'],[330,104,'i ≤ 7,4'],[330,156,'i = 7'],[330,208,'N ≤ 2^7'],[330,262,'N = 128']];
 const hl=HL.map(([x,y,t])=>hand(sheet,defs,x,y,t,'ct-ink',30));const under=stroke(sheet,'M330 274q70 -5 136 1','bd-pen ct-under');
 const toY=node=>{let y=0,n=node;while(n&&n!==scroll){y+=n.offsetTop;n=n.offsetParent}return y};
 const scrollTo=y=>scroll.style.setProperty('--sy',`${-Math.max(0,y)}px`);
 let tk=null,alive=true;
 function reset(){typed.textContent='';ct.classList.remove('s-ok','s-shot','s-typing');hl.forEach(hideHand);hidePath(under);cur.show(false);res.textContent='0 из 9 (0%)';cells.forEach(c=>c.classList.remove('is-on'));scrollTo(toY($('.ct-work',ct))-18)}
 async function play(t){
  reset();await wait(t,900);cur.show(true);cur.to(ans,.3,.55);await wait(t,700);cur.click();ct.classList.add('s-typing');
  for(const ch of '128'){await wait(t,240);typed.textContent+=ch}
  await wait(t,500);ct.classList.remove('s-typing');ct.classList.add('s-ok');await wait(t,1500);
  scrollTo(toY(shot)-120);await wait(t,800);cur.to(shot,.5,.45);await wait(t,600);cur.click();ct.classList.add('s-shot');
  for(const h of hl)await write(t,h,260);
  await tween(t,300,k=>under.setAttribute('stroke-dashoffset',String(under.getTotalLength()*(1-k))));
  await wait(t,900);cur.show(false);scrollTo(0);await wait(t,700);
  let ok=0;for(let i=0;i<cells.length;i++){const c=cells[i];c.classList.add('is-on');if(i%2===0&&c.classList.contains('ok'))ok++;if(i%2===1)res.textContent=`${ok} из 9 (${Math.round(ok/9*100)}%)`;await wait(t,70)}
  res.textContent='7 из 9 (78%)';await wait(t,3200);
 }
 (async()=>{if(reduced()){tk=token(true);await play(tk);return}await document.fonts?.ready;await new Promise(r=>setTimeout(r,500));while(alive){tk=token(false);const my=tk;await play(my);if(!alive||!my.alive)return}})();
 return{dispose(){alive=false;kill(tk);unfit()}};
}

/* ================= 3. soft.infa-ion.ru (сцена «Программы и файлы») ================= */
export function softMarkup(){
 const steps=[['Откройте установщик','Нажмите «Скачать» выше и дождитесь окончания загрузки. Нажмите на файл python-3.13.16-amd64.exe в загрузках браузера.',1,455,267,[[[58,40,317,68],[225,180]]]],
  ['Включите PATH и установите','1 — обязательно поставьте галочку Add python.exe to PATH внизу окна. 2 — затем нажмите Install Now.',2,654,401,[[[183,367,195,24],[442,320]],[[185,136,143,33],[421,113]]]],
  ['Дождитесь установки','Пока заполняется зелёная полоса, ничего нажимать не нужно. Не закрывайте окно и не нажимайте Cancel.',3,651,402,[[[182,200,460,25],[492,292]]]],
  ['Закройте установщик','Надпись Setup was successful означает, что установка закончена. Нажмите Close.',4,656,399,[[[558,363,86,28],[493,313]]]]];
 const panes=steps.map(([t,txt,n,w,h,marks],i)=>{const ov=marks.map(([[x,y,bw,bh],[fx,fy]],k)=>{const tx=Math.min(Math.max(fx,x),x+bw),ty=Math.min(Math.max(fy,y),y+bh);return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="5" class="sw-box"/><path d="M${fx} ${fy}L${tx} ${ty}" class="sw-arrow"/><circle cx="${fx}" cy="${fy}" r="13" class="sw-dot"/><text x="${fx}" y="${fy+4.5}" text-anchor="middle" class="sw-dot-n">${k+1}</text>`}).join('');
  return `<div class="sw-pane" data-i="${i}"><h6>${t}</h6><p>${txt}</p><figure class="sw-shot"><img src="imported/assets/soft-step-${n}.webp" width="${w}" height="${h}" alt="" decoding="async"><svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${ov}</svg></figure></div>`}).join('')
  +`<div class="sw-pane" data-i="4"><h6>Проверьте Python</h6><p>Откройте командную строку: Win + R, введите cmd и нажмите Enter. Выполните команду ниже — должно появиться Python 3.13.16.</p><div class="sw-term"><code><span class="sw-cmd">py -3.13 --version</span><span class="sw-out">Python 3.13.16</span></code></div></div>`;
 return `<div class="win lv-win lv-rise" aria-label="Сайт программ: установка Python по шагам">${winBar('soft.infa-ion.ru')}<div class="win-body" data-fit="720" data-fit-narrow="430"><div class="sw" data-soft><div class="sw-top"><b>@ion_inf</b><span class="sw-btn sw-btn-sm">Написать Иону</span></div><div class="sw-panel"><div class="sw-row1"><div><h5>Установка Python</h5><p class="sw-q">Какая у вас система?</p><div class="sw-os"><span class="is-on">Windows x64</span><span>macOS</span></div></div><span class="sw-reset">Сбросить</span></div><span class="sw-btn sw-dl"><em>Скачать Python 3.13.16</em><s></s></span><hr><span class="sw-btn sw-tab">Установка</span><div class="sw-guide"><ol class="sw-steps"><li>Откройте установщик</li><li>Включите PATH и установите</li><li>Дождитесь установки</li><li>Закройте установщик</li><li>Проверьте Python</li></ol><div class="sw-stage">${panes}<div class="sw-nav"><span class="sw-ghost">Назад</span><span class="sw-btn sw-next">Следующий шаг</span></div></div></div></div><span class="fake-cursor" aria-hidden="true"></span></div></div></div>`;
}
export function bindSoft(section){
 const root=$('[data-soft]',section);const unfit=fitWindow(section);
 const steps=$$('.sw-steps li',root),panes=$$('.sw-pane',root),next=$('.sw-next',root),dl=$('.sw-dl',root),back=$('.sw-ghost',root);
 const cur=fakeCursor(root);const T=timeline();
 const set=i=>{steps.forEach((li,k)=>{li.classList.toggle('is-on',k===i);li.classList.toggle('is-done',k<i)});panes.forEach((p,k)=>p.classList.toggle('is-on',k===i));back.classList.toggle('is-on',i>0);next.textContent=i===steps.length-1?'Готово':'Следующий шаг'};
 function run(){T.clear();set(0);root.classList.remove('s-dl');cur.show(true);cur.dur(0);cur.to(root,.62,.9);
  T.at(80,()=>{cur.dur(700);cur.to(dl,.5,.55)});T.at(900,()=>{cur.click();root.classList.add('s-dl')});
  let t=2600;for(let i=1;i<steps.length;i++){T.at(t,()=>cur.to(next,.5,.55));T.at(t+700,()=>{cur.click();set(i)});t+=i===steps.length-1?2800:2500}
  T.at(t,()=>cur.to(root,.86,.95));T.at(t+2400,run)}
 set(0);if(reduced())set(steps.length-1);else T.at(1000,run);
 return{dispose(){T.clear();unfit()}};
}

/* ================= 4. schedule.infa-ion.ru (сцена «Подберём удобное время») ================= */
export function scheduleMarkup(){
 const days=[['ПН','Понедельник'],['ВТ','Вторник'],['СР','Среда'],['ЧТ','Четверг'],['ПТ','Пятница'],['СБ','Суббота'],['ВС','Воскресенье']];
 const head=days.map(([a,b])=>`<span><small>${a}</small><b>${b}</b></span>`).join('');
 const hours=Array.from({length:11},(_,i)=>`<span>${12+i}:00</span>`).join('');
 const cols=days.map(()=>'<div class="sc2-day"></div>').join('');
 return `<div class="win lv-win lv-rise" aria-label="Сервис расписания: отмечаешь свободное время по неделе">${winBar('schedule.infa-ion.ru')}<div class="win-body" data-fit="600" data-fit-narrow="430"><div class="sc2" data-sched2><div class="sc2-steps"><span>Шаг 2 из 3</span><span>Время</span><i></i></div><p class="sc2-eyebrow">Обычная учебная неделя</p><div class="sc2-titlerow"><div><h5>Когда вам удобно заниматься</h5><p>Отметьте все свободные промежутки от 90 минут, а не только самый удобный.</p></div><div class="sc2-count"><b data-sc2-n>0</b><span>интервалов</span></div></div><div class="sc2-meta"><span>Ваше местное время · МСК</span><span>Минимум 90 минут</span></div><div class="sc2-cal"><div class="sc2-head"><span class="sc2-msk">МСК</span>${head}</div><div class="sc2-body"><div class="sc2-hours">${hours}</div>${cols}</div></div><div class="sc2-foot"><span class="sc2-back">‹ Назад</span><span class="sc2-ok">Подтвердить время ›</span></div><div class="sc2-toast"><span class="sc2-ava">И</span><div><b>Время отправлено</b><p>Соберу группы и пришлю расписание в&nbsp;Telegram</p></div></div><span class="fake-cursor" aria-hidden="true"></span></div></div></div>`;
}
export function bindSchedule(section){
 const root=$('[data-sched2]',section);const unfit=fitWindow(section);
 const cols=$$('.sc2-day',root),count=$('[data-sc2-n]',root),ok=$('.sc2-ok',root),toast=$('.sc2-toast',root);
 const START=12,SPAN=10;const place=(node,a,b)=>{node.style.setProperty('--t',`${(a-START)/SPAN*100}%`);node.style.setProperty('--h',`${(b-a)/SPAN*100}%`)};
 [[0,12,13],[6,12.5,14],[1,15.5,17],[2,16.25,17.75],[4,16.25,18],[5,15.5,16.5],[0,18,19.5],[1,18,19.5],[2,18,19.5],[3,18.25,19.75],[4,18,19.5],[2,19.75,21.25]].forEach(([d,a,b])=>{const n=el('div','sc2-na',cols[d]);el('i','sc2-lock',n);el('span','',n,'Время недоступно');place(n,a,b)});
 const fmt=h=>`${Math.floor(h)}:${h%1?'30':'00'}`;
 const blocks=[[3,14,16],[1,13,15],[5,17,19],[6,15,17]].map(([d,a,b])=>{const n=el('div','sc2-pick',cols[d]);el('b','',n,`${fmt(a)}–${fmt(b)}`);el('i','',n,'×');place(n,a,a+.01);return{n,d,a,b}});
 const cur=fakeCursor(root);const T=timeline();
 const setN=k=>{count.textContent=String(k);ok.classList.toggle('is-on',k>0)};
 const spot=(d,h)=>{const c=cols[d];const r=root.getBoundingClientRect(),q=c.getBoundingClientRect();const sc=r.width/root.offsetWidth||1;return[(q.left-r.left+q.width*.55)/sc,(q.top-r.top+q.height*(h-START)/SPAN)/sc]};
 const final=()=>{blocks.forEach(b=>{place(b.n,b.a,b.b);b.n.classList.add('is-on','is-done')});setN(blocks.length);toast.classList.add('is-on')};
 function run(){T.clear();toast.classList.remove('is-on');blocks.forEach(b=>{b.n.classList.remove('is-on','is-done');place(b.n,b.a,b.a+.01)});setN(0);cur.show(true);
  let t=500;blocks.forEach((b,i)=>{T.at(t,()=>{const[x,y]=spot(b.d,b.a+.1);cur.xy(x,y,650)});t+=750;
   T.at(t,()=>{b.n.classList.add('is-on');place(b.n,b.a,b.b);const[x,y]=spot(b.d,b.b-.05);cur.xy(x,y,900)});t+=950;
   T.at(t,()=>{b.n.classList.add('is-done');setN(i+1)});t+=380});
  T.at(t,()=>{cur.dur(650);cur.to(ok,.5,.55)});T.at(t+800,()=>cur.click());T.at(t+1000,()=>toast.classList.add('is-on'));T.at(t+1400,()=>cur.show(false));T.at(t+5600,run)}
 if(reduced())final();else T.at(900,run);
 return{dispose(){T.clear();unfit()}};
}

/* ================= 5–6. занятие: теория и практика ================= */
export const theoryStage=()=>'<div class="lv-host" data-lv-theory></div>';
export const practiceStage=()=>'<div class="lv-host lv-host-wide" data-lv-practice></div>';
export function bindTheory(section){return studio(section,$('[data-lv-theory]',section),theoryScene,{maxScale:1.12,people:['ion','anya','misha','katya','dima']})}
export function bindPractice(section){return studio(section,$('[data-lv-practice]',section),practiceScene,{maxScale:1.35,people:['ion','anya','misha','katya','dima'],sayBottom:true,callInBar:true})}
