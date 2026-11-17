// Coordinates are mathematical: x points right, y points up; the turtle starts facing up.
export const opening = [['forward',9],['right',90],['forward',10],['left',90]];
export const rectangle = Array.from({length:2},()=>[['forward',9],['right',90],['forward',10],['right',90]]).flat();
export function trace(commands, count=commands.length) {
 let x=0,y=0,heading=90;const points=[[x,y]],states=[{x,y,heading,points:[...points]}];
 for(const [command,value] of commands.slice(0,count)){
  if(command==='forward'){x=Math.round((x+value*Math.cos(heading*Math.PI/180))*1e9)/1e9||0;y=Math.round((y+value*Math.sin(heading*Math.PI/180))*1e9)/1e9||0;points.push([x,y]);}
  else heading+=command==='left'?value:-value;
  states.push({x,y,heading,points:points.map(p=>[...p])});
 }
 return states;
}
export const A={x:0,y:0,w:6,h:4}, B={x:3,y:2,w:5,h:4};
export function contains(r,x,y,boundary=true){return boundary?x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h:x>r.x&&x<r.x+r.w&&y>r.y&&y<r.y+r.h;}
export function lattice(a,b=null,operation='a',boundary=true){
 const minX=Math.min(a.x,b?.x??a.x),maxX=Math.max(a.x+a.w,b?b.x+b.w:a.x+a.w),minY=Math.min(a.y,b?.y??a.y),maxY=Math.max(a.y+a.h,b?b.y+b.h:a.y+a.h),points=[];
 for(let x=Math.ceil(minX);x<=Math.floor(maxX);x++)for(let y=Math.ceil(minY);y<=Math.floor(maxY);y++){
  const inA=contains(a,x,y,boundary),inB=b?contains(b,x,y,boundary):false;
  if(operation==='intersection'?inA&&inB:operation==='union'?inA||inB:operation==='b'?inB:inA)points.push([x,y]);
 }
 return points;
}
export function overlap(a,b){const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y);return{x,y,w:Math.max(0,Math.min(a.x+a.w,b.x+b.w)-x),h:Math.max(0,Math.min(a.y+a.h,b.y+b.h)-y)};}
export const area=r=>r.w*r.h;
export const perimeter=r=>2*(r.w+r.h);
