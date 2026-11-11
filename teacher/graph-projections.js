// Axis readings share visibility with their authored point. Equal coordinates
// share one label; fixed geometry prevents reflow during a demonstration.
export function projectionLayout(s){
 const out={x:[],y:[]};
 for(const a of s.axisProjections||[]){const p=s.points?.[a.point];if(!p)continue;
  for(const axis of ['x','y']){let item=out[axis].find(q=>Math.abs(q.value-p[axis])<1e-5);
   if(!item){item={value:p[axis],symbol:a[axis+'Symbol'],points:[]};out[axis].push(item);}item.points.push(a.point);
  }
 }
 return out;
}
export function renderProjections(s,{x,y,axisX,axisY,L,H,B,e,tick}){
 const layout=projectionLayout(s),ink='var(--plot-ink,#293f4c)',paper='var(--plot-paper,#fcfcf8)';
 const lines=(s.axisProjections||[]).map(a=>{const p=s.points[a.point];return `<g data-projection-points="${a.point}"><path d="M${axisX},${y(p.y)} H${x(p.x)} V${axisY}" fill="none" stroke="${ink}" stroke-width="1.8" stroke-dasharray="5 4"/></g>`;}).join('');
 const labels=['x','y'].flatMap(axis=>{
  const items=layout[axis].sort((a,b)=>a.value-b.value),placed=[];
  return items.map(item=>{const text=`${item.symbol}=${tick(item.value)}`,pos=axis==='x'?x(item.value):y(item.value);
   // Two staggered rows for nearby quantity readings. Price labels use exact
   // coordinates; a small font and paper halo keep curves from crossing text.
   const width=text.length*7.5;let row=0;
   if(axis==='x'&&placed.some(p=>p.row===0&&Math.abs(pos-p.pos)<(width+p.width)/2+3))row=1;
   placed.push({pos,width,row});
   return `<g class="axis-projection-label" data-projection-points="${item.points.join(' ')}"><text x="${axis==='x'?pos:L-9}" y="${axis==='x'?H-B+21+row*17:pos+5}" text-anchor="${axis==='x'?'middle':'end'}" style="font-size:14px;font-weight:700" fill="${ink}" paint-order="stroke" stroke="${paper}" stroke-width="4" stroke-linejoin="round">${e(text)}</text></g>`;
  });
 }).join('');
 return {markup:lines+labels,layout};
}
