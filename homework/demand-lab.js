// A fixed supply schedule and a parallel demand shift, measured in quantity units.
export function equilibrium(shift){
  const p=(90+shift)/3;
  return {p,q:10+p};
}
export function mountDemandLab(host,{teacher}){
  const x=q=>50+q*3.85,y=p=>237-p*3.2;
  const id='unit-two-demand-grid';
  let shift=0,drag=null,expanded=false;
  host.innerHTML=`<section class="demand-lab"><header><h3>Demand and market equilibrium</h3>${teacher?'<button type="button" data-project>投影</button>':''}</header>
  <p>Income rises in a market for a <strong><u>normal good</u></strong>（正常品）. How does equilibrium change?</p>
  <svg viewBox="0 0 480 278" aria-label="Supply and demand diagram" role="group">
    <defs><pattern id="${id}" width="19.25" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ccd5cd"/></pattern></defs>
    <rect x="50" y="23" width="403" height="214" fill="url(#${id})"/>
    <g stroke="#243744" fill="none"><path d="M50 20 V237 H455"/></g>
    <g fill="#233845" font-size="13"><text x="15" y="17">Price</text><text x="373" y="270">Quantity</text></g>
    <g data-traces></g><circle data-shift-handle r="11" stroke="white" stroke-width="3" fill="#1c6274" tabindex="0" role="slider" aria-label="Demand shift · 需求移动" aria-valuemin="0" aria-valuemax="30"></circle>
  </svg><div class="demand-controls"><button type="button" data-minus aria-label="Decrease demand">−</button><button type="button" data-plus aria-label="Increase demand">+</button><output aria-live="polite"></output><button type="button" data-reset>Reset</button></div></section>`;
  const section=host.firstElementChild,svg=section.querySelector('svg'),handle=section.querySelector('[data-shift-handle]'),output=section.querySelector('output'),traces=section.querySelector('[data-traces]');
  const curve=(q1,p1,q2,p2,color,dash=false)=>`<path d="M${x(q1)} ${y(p1)} L${x(q2)} ${y(p2)}" fill="none" stroke="${color}" stroke-width="2.4" ${dash?'stroke-dasharray="6 4"':''}/>`;
  function guides(q,p,dashed){return `<path d="M50 ${y(p)} H${x(q)} V237" fill="none" stroke="${dashed?'#7a7970':'#2a635b'}" ${dashed?'stroke-dasharray="4 4"':''}/>`;}
  function label(q,p,t){return `<text x="${x(q)}" y="${y(p)}" font-size="14" fill="#243744" stroke="#fafbf7" stroke-width="3" paint-order="stroke">${t}</text>`;}
  function update(value){
    shift=Math.max(0,Math.min(30,Math.round(value/3)*3));const {p,q}=equilibrium(shift);
    traces.innerHTML=curve(10,0,72,62,'#525c68')+label(73,62,'S')+curve(0,50,100,0,'#74756e',true)+guides(40,30,true)+
      (shift?guides(q,p,false):'')+curve(0,(100+shift)/2,96,(4+shift)/2,'#28695f')+
      (shift?label(92,1,'D₀'):'')+label(88,(12+shift)/2+4,shift?'D₁':'D₀')+label(40-3,30-6,'E₀')+(shift?label(q+2,p+2,'E₁'):'')+
      `<circle cx="${x(40)}" cy="${y(30)}" r="3" fill="#535957"/><circle cx="${x(q)}" cy="${y(p)}" r="3.5" fill="#28695f"/>`+
      label(-10,30,'P₀')+label(35,-6,'Q₀')+(shift?label(-6,p+2,'P₁')+label(q+1,-5,'Q₁'):'');
    handle.setAttribute('cx',x(64+shift));handle.setAttribute('cy',y(18));handle.setAttribute('aria-valuenow',shift);
    handle.setAttribute('aria-valuetext',`Demand shift +${shift}. Price ${p}, quantity ${q}.`);
    output.textContent=`P = ${p} · Q = ${q}`;section.querySelector('[data-minus]').disabled=!shift;section.querySelector('[data-plus]').disabled=shift===30;
  }
  function localX(e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(svg.getScreenCTM().inverse()).x;}
  handle.onpointerdown=e=>{if(e.button!==0||drag)return;drag={pointer:e.pointerId,x:localX(e),value:shift};handle.setPointerCapture(e.pointerId);};
  handle.onpointermove=e=>{if(drag?.pointer===e.pointerId)update(drag.value+(localX(e)-drag.x)/3.85);};
  handle.onlostpointercapture=handle.onpointercancel=()=>{drag=null;};
  handle.onkeydown=e=>{const values={ArrowRight:shift+3,ArrowUp:shift+3,ArrowLeft:shift-3,ArrowDown:shift-3,Home:0,End:30};if(e.key in values){e.preventDefault();update(values[e.key]);}};
  section.querySelector('[data-plus]').onclick=()=>update(shift+3);section.querySelector('[data-minus]').onclick=()=>update(shift-3);section.querySelector('[data-reset]').onclick=()=>update(0);
  if(teacher){const trigger=section.querySelector('[data-project]');trigger.onclick=()=>{
    if(expanded){section.parentElement.close();return;}
    const dialog=document.createElement('dialog');dialog.className='demand-projection';dialog.setAttribute('aria-label','Market equilibrium projection');host.append(dialog);dialog.append(section);
    dialog.onclose=()=>{expanded=false;host.prepend(section);dialog.remove();trigger.textContent='投影';trigger.focus();};expanded=true;trigger.textContent='退出投影';dialog.showModal();trigger.focus();
  };}
  update(0);
}
