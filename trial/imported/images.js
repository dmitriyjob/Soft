import {imageSizes} from './image-sizes.js?v=d4d85e83151d';

function imageKey(source){
 return new URL(source,document.baseURI).pathname.replace(/^\//,'');
}

// Each scene owns its listeners and timers, so late requests cannot alter a new scene.
export function bindImages(root){
 const images=[...root.querySelectorAll('img[src]')];
 if(!images.length)return ()=>{};
 const lifecycle=new AbortController();
 const timers=new Set();
 let disposed=false,noticeReady=false;
 const notice=document.createElement('div');
 notice.className='image-load-notice';notice.hidden=true;notice.setAttribute('role','status');
 const message=document.createElement('span');
 const retryButton=document.createElement('button');
 retryButton.type='button';retryButton.className='secondary-button';retryButton.textContent='Повторить загрузку';
 notice.append(message,retryButton);root.append(notice);
 const jobs=[];
 const later=(fn,delay)=>{const timer=setTimeout(()=>{timers.delete(timer);fn()},delay);timers.add(timer);return timer};
 const cancel=timer=>{clearTimeout(timer);timers.delete(timer)};
 function paintNotice(){
  if(disposed)return;
  const visible=jobs.filter(job=>!job.image.hidden);
  const failed=visible.filter(job=>job.state==='failed').length;
  const loading=visible.filter(job=>job.state==='loading').length;
  notice.hidden=!failed&&(!loading||!noticeReady);
  retryButton.hidden=!failed;
  message.textContent=failed
   ?(failed===1?'Изображение не загрузилось.':'Некоторые изображения не загрузились.')
   :(loading===1?'Загружаем изображение…':'Загружаем изображения…');
 }
 for(const image of images){
  const source=image.getAttribute('src');
  const size=imageSizes[imageKey(source)];
  if(size){image.setAttribute('width',size[0]);image.setAttribute('height',size[1])}
  image.loading='eager';image.decoding='async';
  const job={image,state:'loading',retry:null};jobs.push(job);
  let attempts=0,timeout,retryTimer,retryScheduled=false;
  const setState=state=>{job.state=state;image.dataset.imageState=state;paintNotice()};
  const clear=()=>{cancel(timeout);cancel(retryTimer);retryScheduled=false};
  const loaded=()=>{if(disposed||!image.naturalWidth)return;clear();setState('loaded')};
  const arm=()=>{cancel(timeout);timeout=later(failed,15000)};
  function request(){
   if(disposed)return;
   clear();setState('loading');
   const url=new URL(source,document.baseURI);
   // A distinct URL also recovers browsers that kept a failed response in their cache.
   url.searchParams.set('image-retry',Date.now().toString(36)+'-'+attempts);
   arm();image.src=url.href;
  }
  function failed(){
   if(disposed||job.state!=='loading'||retryScheduled)return;
   cancel(timeout);
   if(attempts>=2){setState('failed');return}
   attempts++;retryScheduled=true;
   retryTimer=later(request,attempts===1?350:1200);
  }
  job.retry=()=>{attempts=0;request()};
  image.addEventListener('load',loaded,{signal:lifecycle.signal});
  image.addEventListener('error',failed,{signal:lifecycle.signal});
  image.dataset.imageState='loading';
  if(image.complete&&image.naturalWidth)loaded();
  else if(image.complete)failed();
  else arm();
 }
 later(()=>{noticeReady=true;paintNotice()},400);
 const retryFailed=()=>jobs.filter(job=>job.state==='failed').forEach(job=>job.retry());
 retryButton.addEventListener('click',retryFailed,{signal:lifecycle.signal});
 window.addEventListener('online',retryFailed,{signal:lifecycle.signal});
 paintNotice();
 return ()=>{disposed=true;lifecycle.abort();timers.forEach(clearTimeout);timers.clear();notice.remove()};
}

export function createImagePreloader(scenes){
 const sources=scenes.map(scene=>[...new Set([...scene.html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match=>match[1]))]);
 const retained=new Map(),inflight=new Set();
 let queue=[];
 function pump(){
  while(inflight.size<2&&queue.length){
   const source=queue.shift();
   if(retained.has(source)||inflight.has(source))continue;
   inflight.add(source);
   const image=new Image();image.decoding='async';image.fetchPriority='low';
   let finished=false;
   const timeout=setTimeout(()=>finish(false),15000);
   function finish(ok){
    if(finished)return;finished=true;clearTimeout(timeout);image.onload=null;image.onerror=null;inflight.delete(source);
    if(ok){
     retained.set(source,image);
     // Keep only a small decoded working set. The browser still keeps downloaded files in its HTTP cache.
     while(retained.size>16)retained.delete(retained.keys().next().value);
    }else image.removeAttribute('src');
    pump();
   }
   image.onload=()=>{const decoding=image.decode?.();Promise.resolve(decoding).catch(()=>{}).then(()=>finish(true))};
   image.onerror=()=>finish(false);image.src=source;
  }
 }
 // Download (not decode) the rest of the deck in the background, two files at a time.
 let warmed=false;
 function warmAll(from){
  if(warmed||typeof fetch!=='function')return;warmed=true;
  const order=[];for(let i=from+3;i<sources.length;i++)order.push(i);for(let i=0;i<from;i++)order.push(i);
  const files=[...new Set(order.flatMap(i=>sources[i]||[]))];let active=0;
  const next=()=>{while(active<2&&files.length){const source=files.shift();active++;fetch(source,{priority:'low',credentials:'same-origin'}).then(r=>r.blob()).catch(()=>{}).finally(()=>{active--;next()})}};
  const start=()=>next();
  if('requestIdleCallback' in window)requestIdleCallback(start,{timeout:2500});else setTimeout(start,1200);
 }
 return index=>{
  queue=[...new Set([index+1,index+2,index-1].flatMap(i=>sources[i]||[]))].filter(source=>!retained.has(source)&&!inflight.has(source));
  pump();
  warmAll(index);
 };
}
