const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function cropDrag({mode='draw',box,start,point,width,height,min=12}){
 const [x,y]=point.map((n,i)=>clamp(n,0,i?height:width));
 if(mode==='draw')return [Math.min(start[0],x),Math.min(start[1],y),Math.max(start[0],x),Math.max(start[1],y)];
 const b=box.slice(),dx=x-start[0],dy=y-start[1];
 if(mode==='move'){const w=b[2]-b[0],h=b[3]-b[1],left=clamp(b[0]+dx,0,width-w),top=clamp(b[1]+dy,0,height-h);return [left,top,left+w,top+h];}
 if(mode.includes('w'))b[0]=clamp(b[0]+dx,0,b[2]-min);
 if(mode.includes('e'))b[2]=clamp(b[2]+dx,b[0]+min,width);
 if(mode.includes('n'))b[1]=clamp(b[1]+dy,0,b[3]-min);
 if(mode.includes('s'))b[3]=clamp(b[3]+dy,b[1]+min,height);
 return b;
}
