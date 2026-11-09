/* Small shared maths for the gallery and its liquid index. */
(() => {
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function releaseVelocity(samples,now){
    const recent=samples.filter(p=>now-p.t<=110);
    if(recent.length<2||now-recent[recent.length-1].t>85)return 0;
    const first=recent[0],last=recent[recent.length-1];
    return clamp((last.p-first.p)/Math.max(8,last.t-first.t),-3,3);
  }
  function coastStep(position,velocity,dt,min,max){
    const decay=Math.exp(-dt/260);
    const next=clamp(position+velocity*260*(1-decay),min,max);
    return {position:next,velocity:next===min||next===max?0:velocity*decay};
  }
  function progressAt(position,anchors){
    if(!anchors.length||position<=anchors[0])return 0;
    for(let i=1;i<anchors.length;i++)if(position<=anchors[i])return i-1+clamp((position-anchors[i-1])/Math.max(1,anchors[i]-anchors[i-1]),0,1);
    return anchors.length-1;
  }
  // Same cubic as the panel WAAPI animation, not a separate approximate curve.
  function ease(t){
    t=clamp(t,0,1);let u=t;
    for(let i=0;i<6;i++){
      const x=3*(1-u)*(1-u)*u*.22+3*(1-u)*u*u*.36+u*u*u;
      const dx=3*(1-u)*(1-u)*.22+6*(1-u)*u*(.36-.22)+3*u*u*(1-.36);
      if(dx<.00001)break;u=clamp(u-(x-t)/dx,0,1);
    }
    return 1-Math.pow(1-u,3);
  }
  // A neutral guide line rounds into a circle as the travelling selection reaches it.
  function liquidLine(distance,strain=0,vertical=false,direction=1){
    const near=clamp(1-Math.abs(distance),0,1),m=near*near*(3-2*near);
    const flow=Math.min(5,strain*.3)*m*(1-m);
    const w=22-14*m+(vertical?0:flow*2),h=2+6*m+(vertical?flow*2:0),r=Math.min(w,h)/2;
    const x=w/2,y=h/2,k=.55228475*r,shift=flow*.25*direction;
    const n=v=>Number(v.toFixed(3));
    return `M ${n(-x+r)} ${n(-y)} H ${n(x-r)} C ${n(x-r+k)} ${n(-y)} ${n(x)} ${n(-y+r-k)} ${n(x)} ${n(-y+r)} V ${n(y-r)} C ${n(x)} ${n(y-r+k)} ${n(x-r+k)} ${n(y)} ${n(x-r)} ${n(y)} H ${n(-x+r)} C ${n(-x+r-k-shift)} ${n(y)} ${n(-x-shift)} ${n(y-r+k)} ${n(-x)} ${n(y-r)} V ${n(-y+r)} C ${n(-x)} ${n(-y+r-k)} ${n(-x+r-k)} ${n(-y)} ${n(-x+r)} ${n(-y)} Z`;
  }
  // A moving head and tapered neck connect the neutral guide shapes in flight.
  function liquidTransfer(tail,strain){
    const neck=Math.max(4,tail),r=4+Math.min(1,strain/24),n=v=>Number(v.toFixed(3));
    return `M 0 ${n(-r)} C 3 ${n(-r)} 4.5 -2 4.5 0 C 4.5 2 3 ${n(r)} 0 ${n(r)} C -5 ${n(r)} ${n(-neck*.35)} 1.1 ${n(-neck)} 0 C ${n(-neck*.35)} -1.1 -5 ${n(-r)} 0 ${n(-r)} Z`;
  }
  window.HubMotion={clamp,releaseVelocity,coastStep,progressAt,ease,liquidLine,liquidTransfer};
})();
