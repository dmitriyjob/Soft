/* Sound laboratory adapted from the sample-and-hold demonstration in ion_inf lesson 7. */
(() => {
 'use strict';
 const track = new URL('./audio-demo.mp3', document.currentScript.src);
 const presets = [['Робот',2000,3],['Рация',4000,5],['Телефон',8000,8],['Ретро-игра',11025,4],['Как на CD',44100,16],['Студия',48000,24]];
 let events=null;
 let root=null, context=null, output=null, original=null, loading=null, source=null, mode=null, token=0, frame=0, started=0;
 let rate=8000, bits=8, volume=.35;
 const cache=new Map(), fmt=n=>n.toLocaleString('ru-RU',{maximumFractionDigits:1});
 const find=s=>root?.querySelector(s);
 function status(text){const el=find('[data-demo-status]');if(el)el.textContent=text;}
 function controls(){
  root?.querySelectorAll('[data-demo-play]').forEach(b=>{const on=b.dataset.demoPlay===mode;b.setAttribute('aria-pressed',String(on));b.classList.toggle('playing',on);b.textContent=on?'■ Остановить':b.dataset.demoPlay==='original'?'▶ Оригинал':'▶ Цифровой звук';});
 }
 function stop(){
  ++token;cancelAnimationFrame(frame);frame=0;
  if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}
  mode=null;controls();
 }
 async function load(){
  if(original)return original;
  if(!loading)loading=(async()=>{
   const response=await fetch(track);if(!response.ok)throw Error('Не удалось загрузить звуковой фрагмент. Нажми воспроизведение ещё раз.');
   const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
   const decoder=Offline?new Offline(1,1,48000):context;
   if(!decoder)throw Error('Для загрузки нажми «Оригинал».');
   const buffer=await decoder.decodeAudioData(await response.arrayBuffer());
   const mono=decoder.createBuffer(1,buffer.length,buffer.sampleRate),data=mono.getChannelData(0);
   for(let c=0;c<buffer.numberOfChannels;c++){const channel=buffer.getChannelData(c);for(let i=0;i<data.length;i++)data[i]+=channel[i]/buffer.numberOfChannels;}
   original=mono;return mono;
  })().catch(e=>{loading=null;throw e;});
  return loading;
 }
 function digital(){
  const key=rate+'|'+bits;if(cache.has(key))return cache.get(key);
  const input=original.getChannelData(0),out=context?context.createBuffer(1,input.length,original.sampleRate):new AudioBuffer({numberOfChannels:1,length:input.length,sampleRate:original.sampleRate});
  const data=out.getChannelData(0),step=original.sampleRate/rate,half=2**(bits-1);
  let next=0,held=0;
  for(let i=0;i<data.length;i++){
   if(i>=next){const x=input[Math.min(input.length-1,Math.floor(next))];held=bits>=16?x:(Math.max(-half,Math.min(half-1,Math.floor(x*half)))+.5)/half;next+=step;}
   data[i]=held;
  }
  if(cache.size>=12)cache.clear();cache.set(key,out);return out;
 }
 function plot(){
  if(!root||!original)return;
  const data=original.getChannelData(0),quantized=digital().getChannelData(0),sr=original.sampleRate;
  const start=Math.min(Math.floor(sr*2.19),Math.max(0,data.length-Math.ceil(sr*.012))),n=Math.min(Math.ceil(sr*.012),data.length-start);
  let peak=.1;for(let i=start;i<start+n;i++)peak=Math.max(peak,Math.abs(data[i]),Math.abs(quantized[i]));
  const path=values=>{let d='';for(let j=0;j<n;j++){d+=(j?'L':'M')+(20+j/(n-1)*860).toFixed(1)+' '+(130-values[start+j]/peak*90).toFixed(1);}return d;};
  find('[data-original-wave]').setAttribute('d',path(data));find('[data-digital-wave]').setAttribute('d',path(quantized));
  const levels=find('[data-demo-levels]');levels.innerHTML='';
  if(bits<=5){const half=2**(bits-1);for(let j=-half;j<half;j++){const y=130-(j+.5)/half/peak*90;if(y<20||y>240)continue;levels.insertAdjacentHTML('beforeend',`<path d="M20 ${y}H880"/>`);}}
 }
 function update(){
  if(!root)return;
  find('[data-demo-rate]').value=rate;find('[data-demo-bits]').value=bits;
  find('[data-rate-range]').value=Math.round(Math.log(rate/300)/Math.log(160)*1000);find('[data-bits-range]').value=bits;
  find('[data-demo-size]').textContent=`${fmt(rate)} × ${bits} = ${fmt(rate*bits)} бит/с · ${fmt(rate*bits/8/1024)} Кбайт за секунду (моно)`;
  find('[data-demo-resolution]').textContent=`${fmt(2**bits)} уровней сигнала`;
  root.querySelectorAll('[data-demo-preset]').forEach(b=>{const p=presets[+b.dataset.demoPreset];b.setAttribute('aria-pressed',String(p[1]===rate&&p[2]===bits));});
  plot();
 }
 function progress(){
  if(!source||!root)return;
  const fraction=Math.min(1,(context.currentTime-started)/original.duration);find('[data-demo-progress]').value=fraction;
  frame=requestAnimationFrame(progress);
 }
 async function play(which,offset=0){
  stop();const request=token;mode=which;controls();status('Загружаем звук…');
  try{
   if(!context){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Этот браузер не поддерживает воспроизведение звука.');context=new AC();output=context.createGain();output.gain.value=volume;output.connect(context.destination);}
   await context.resume();await load();
   if(request!==token||!root?.isConnected)return;
   const node=context.createBufferSource();node.buffer=which==='original'?original:digital();node.connect(output);
   const at=Math.max(0,Math.min(offset,original.duration-.01));source=node;started=context.currentTime-at;
   node.onended=()=>{if(source!==node)return;source=null;node.disconnect();mode=null;cancelAnimationFrame(frame);controls();status('Фрагмент завершён. Можно сравнить с другим вариантом.');};
   node.start(0,at);controls();plot();status(which==='original'?'Играет оригинал':'Играет цифровой звук');progress();
  }catch(e){if(request!==token)return;stop();status(e.message||'Не удалось воспроизвести звук. Попробуй ещё раз.');}
 }
 function change(){
  const offset=source?context.currentTime-started:0,live=mode==='digital';update();if(live)void play('digital',offset);
 }
 const api=window.SoundDemo={
  view(){return `<h2>Послушай <em>цифровой звук</em></h2><p class="demo-intro">Один фрагмент — разное качество. Уменьши частоту или глубину и сравни с оригиналом.</p><div class="demo-layout"><div class="demo-visual"><svg viewBox="0 0 900 280" class="demo-wave" role="img" aria-label="12 миллисекунд сигнала: исходная волна и цифровая ступенчатая запись"><g data-demo-levels></g><path data-original-wave></path><path data-digital-wave></path><text x="20" y="268">0</text><text x="810" y="268">12 мс</text></svg><div class="demo-legend"><span>Оригинал</span><span>Цифровой звук</span></div><div class="demo-playback"><button type="button" data-demo-play="original" aria-pressed="false">▶ Оригинал</button><button type="button" data-demo-play="digital" aria-pressed="false">▶ Цифровой звук</button><button type="button" data-demo-stop>Стоп</button></div><progress data-demo-progress max="1" value="0" aria-label="Воспроизведение фрагмента"></progress><label class="demo-volume">Громкость <input data-demo-volume type="range" min="0" max="100" value="35"></label><p data-demo-status role="status" aria-live="polite">Нажми «Оригинал» или «Цифровой звук».</p></div><div class="demo-settings"><label>Частота дискретизации, Гц<input data-demo-rate type="number" min="300" max="48000" step="1" value="8000"></label><input data-rate-range type="range" min="0" max="1000" value="647" aria-label="Частота дискретизации"><label>Битовая глубина, бит<input data-demo-bits type="number" min="1" max="24" value="8"></label><input data-bits-range type="range" min="1" max="24" value="8" aria-label="Битовая глубина"><p data-demo-resolution></p><div data-demo-size></div></div></div><div class="demo-presets" role="group" aria-label="Пресеты качества">${presets.map(([name,nu,b],i)=>`<button type="button" data-demo-preset="${i}" aria-pressed="false"><b>${name}</b><span>${fmt(nu)} Гц · ${b} бит</span></button>`).join('')}</div>`;},
  mount(host){
   if(events)events.abort();events=new AbortController();
   stop();root=host;update();
   root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-demo-play')){const which=b.dataset.demoPlay;if(mode===which){stop();status('Остановлено.');}else void play(which);}
    if(b.hasAttribute('data-demo-stop')){stop();status('Остановлено.');}
    if(b.hasAttribute('data-demo-preset')){const p=presets[+b.dataset.demoPreset];rate=p[1];bits=p[2];update();void play('digital');}
   },{signal:events.signal});
   const number=(attr,set,min,max)=>find(attr).addEventListener('change',e=>{const n=Number(e.target.value);if(Number.isFinite(n)&&e.target.value.trim())set(Math.max(min,Math.min(max,Math.round(n))));change();});
   number('[data-demo-rate]',n=>rate=n,300,48000);number('[data-demo-bits]',n=>bits=n,1,24);
   find('[data-rate-range]').addEventListener('input',e=>{rate=Math.round(300*160**(+e.target.value/1000));change();});
   find('[data-bits-range]').addEventListener('input',e=>{bits=+e.target.value;change();});
   find('[data-demo-volume]').value=volume*100;find('[data-demo-volume]').addEventListener('input',e=>{volume=+e.target.value/100;if(output)output.gain.setTargetAtTime(volume,context.currentTime,.02);});
   const hostRoot=root;load().then(()=>{if(root===hostRoot&&root.isConnected)plot();}).catch(e=>{if(root===hostRoot)status(e.message);});
  },
  leave(){stop();events?.abort();events=null;root=null;},
 };
 addEventListener('pagehide',()=>api.leave());
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();status('Остановлено.');}});
})();
