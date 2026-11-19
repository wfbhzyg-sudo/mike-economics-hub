import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {sideName} from './catalog.js';

export const W=3.32,H=4.7,NOTE_W=2.67,NOTE_H=1.48;
export const corners=[[-1,-1],[1,-1],[-1,1],[1,1]];
export const lampHome=new T.Vector3(-4.07,1.52,.38);
export const penHome=new T.Vector3(3.98,-.86,.11);
const ink='#263546', serif='"Songti SC","Noto Serif CJK SC","STSong",Georgia,serif';
const stationary=new T.Vector3();

function canvas(w,h){return Object.assign(document.createElement('canvas'),{width:w,height:h});}
function texture(image){
  const t=new T.CanvasTexture(image);
  t.colorSpace=T.SRGBColorSpace;
  t.anisotropy=4;
  return t;
}
function stock(image,w,h,color){
  const c=canvas(w,h),g=c.getContext('2d');
  g.drawImage(image,0,0,w,h);
  if(color){
    g.globalCompositeOperation='multiply';
    g.fillStyle=color;
    g.fillRect(0,0,w,h);
    g.globalCompositeOperation='source-over';
  }
  return c;
}
function text(g,value,x,y,size,{align='left',font=serif,color=ink,weight=600}={}){
  g.fillStyle=color;
  g.font=`${weight} ${size}px ${font}`;
  g.textAlign=align;
  g.fillText(value,x,y);
}
function stroke(g,coords,color,width=1){
  g.strokeStyle=color;g.lineWidth=width;g.beginPath();
  coords.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
  g.stroke();
}
function inset(g,x,y,w,h,r,color,width){
  g.strokeStyle=color;g.lineWidth=width;
  g.beginPath();g.roundRect(x,y,w,h,r);g.stroke();
}
function coverSurface(image){
  const c=stock(image,680,960),g=c.getContext('2d');
  g.fillStyle='#302b251b';g.fillRect(0,0,680,960);
  const edge=g.createLinearGradient(0,0,90,0);edge.addColorStop(0,'#272b30');edge.addColorStop(.42,'#3c3331');edge.addColorStop(.87,'#4d3730');edge.addColorStop(1,'#3c281700');
  g.fillStyle=edge;g.fillRect(0,0,90,960);
  inset(g,61,23,593,914,21,'#2c1c129e',2);
  inset(g,72,34,571,891,16,'#e1b685a8',1);
  for(let y=45;y<919;y+=13)stroke(g,[[28,y],[34,y+5]],'#d7af7c9a',2.5);
  g.save();g.translate(357,170);
  for(const [r,c] of [[55,'#2c231a'],[63,'#d7ad7f']]){
    g.beginPath();g.ellipse(0,0,r,r*.84,0,0,2*Math.PI);g.lineWidth=1.9;g.strokeStyle=c;g.stroke();
  }
  stroke(g,[[-31,-22],[-31,25],[34,25]],'#282723',2);stroke(g,[[-25,17],[26,-21]],'#2a2e2c',2.8);stroke(g,[[-25,-15],[28,17]],'#50301d',2.8);
  g.restore();
  text(g,'Mike 的经济一页通',358,295,56,{align:'center',color:'#39271a',weight:700});
  text(g,'Mike 的经济一页通',357,293,56,{align:'center',color:'#f0d4a4',weight:700});
  stroke(g,[[236,325],[478,325]],'#433227a0',1);
  return c;
}
function paperSurface(image,archive,side,index){
  const c=stock(image,600,848),g=c.getContext('2d');
  const x=side===0?600:0,end=side===0?543:57;
  const shadow=g.createLinearGradient(x,0,end,0);shadow.addColorStop(0,'#49351948');shadow.addColorStop(.3,'#49351b21');shadow.addColorStop(1,'#49351b00');g.fillStyle=shadow;g.fillRect(0,0,600,848);
  const outer=x===0?600:0;
  const edge=g.createLinearGradient(outer,0,x===0?572:28,0);edge.addColorStop(0,'#9e846633');edge.addColorStop(1,'#9e846600');g.fillStyle=edge;g.fillRect(0,0,600,848);
  text(g,sideName(archive,side,index),52,73,34,{weight:700});
  stroke(g,[[49,102],[551,102]],'#8e816d93');
  stroke(g,[[49,752],[551,752]],'#9d8b71a8');
  text(g,String(index*2+side+1).padStart(2,'0'),300,802,22,{align:'center',font:'Georgia',color:'#5b5144'});
  return c;
}
function image(url){
  const i=new Image();i.src=url;return i.decode().then(()=>i);
}
async function noteSurface(paper,item){
  const c=stock(paper,680,374,item.tint),g=c.getContext('2d');
  const img=await image('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(item.svg));
  const highlight=g.createLinearGradient(0,0,0,65);highlight.addColorStop(0,'#fff7de53');highlight.addColorStop(1,'#fff7de00');
  g.fillStyle=highlight;g.fillRect(0,0,680,65);
  stroke(g,[[35,40],[645,38]],'#26354659',1.2);
  text(g,item.category,36,77,20,{font:'Georgia',weight:400,color:'#3e483c'});
  g.drawImage(img,34,103,231,182);
  const size=item.title.length>=10?36:44;
  let label=item.title;
  if(item.id==='nebs')label='NEBS 股票交易大赛';
  const metrics=()=>{
    g.font=`700 ${size}px ${serif}`;return g.measureText(label).width;
  };
  if(metrics()>370){
    g.save();g.translate(272,176);g.scale(370/metrics(),1);
    text(g,label,0,0,size,{weight:700});g.restore();
  }else text(g,label,272,176,size,{weight:700});
  text(g,item.description,275,223,24,{color:'#35453f',weight:500});
  stroke(g,[[37,296],[639,297]],'#26354655',1.25);
  stroke(g,[[592,326],[626,326],[615,316]],ink,2.2);stroke(g,[[626,326],[615,336]],ink,2.2);
  return c;
}
function material(color,map=null,params={}){
  return new T.MeshStandardMaterial({color,map,roughness:.9,...params});
}
function mesh(parent,geo,mat,x,y,z,shadow=true){
  const m=new T.Mesh(geo,mat);
  m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;
  parent.add(m);
  return m;
}
function rounded(parent,mat,x,y,z,w,h,d,radius){
  return mesh(parent,new RoundedBoxGeometry(w,h,d,3,radius),mat,x,y,z);
}
function flat(parent,mat,x,y,z,w,h,shadow=true){
  return mesh(parent,new T.PlaneGeometry(w,h),mat,x,y,z,shadow);
}
function disk(parent,mat,x,y,z,top,bottom,height,segments=48){
  const m=mesh(parent,new T.CylinderGeometry(top,bottom,height,segments),mat,x,y,z);
  m.rotation.x=Math.PI/2;
  return m;
}
function ring(parent,mat,x,y,z,r,t){
  return mesh(parent,new T.TorusGeometry(r,t,10,64),mat,x,y,z);
}
function noteGeometry() {
  const g=new T.PlaneGeometry(NOTE_W,NOTE_H,32,20),p=g.attributes.position;
  // Tiny, regular nicking along the outer cut edges catches the light when the corners lift.
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i);
    if(Math.abs(x)>NOTE_W/2-.01||Math.abs(y)>NOTE_H/2-.01)p.setXY(i,x+Math.sin(y*47)*.0035,y+Math.cos(x*51)*.0035);
  }
  g.morphAttributes.position=[.94,2.05].flatMap((span,index)=>corners.map(([sx,sy])=>{
    const limit=index===0?1.25:2.63,rad=span/limit;
    const points=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i);
      const dist=(NOTE_W/2-sx*x)*.72+(NOTE_H/2-sy*y)*.7;
      const a=Math.max(0,1-dist/span)*limit;
      const inset=rad*(a-Math.sin(a));
      points.set([x-inset*sx*.72,y-inset*sy*.7,rad*(1-Math.cos(a))],i*3);
    }
    return new T.BufferAttribute(points,3);
  }));
  g.morphAttributes.normal=g.morphAttributes.position.map(points=>{
    const shape=new T.BufferGeometry();
    shape.setIndex(g.index);shape.setAttribute('position',points);shape.computeVertexNormals();
    return shape.attributes.normal;
  });
  return g;
}
const BACK_OFFSET=-.003;
function cardGeometryBack(geo) {
  const rear=geo.clone(),idx=rear.index.array;
  for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];
  for(const n of [rear.attributes.normal,...rear.morphAttributes.normal]) for(let i=0;i<n.array.length;i++)n.array[i]*=-1;
  return rear;
}
function edgeShadow(){
  const c=canvas(160,100),g=c.getContext('2d');
  g.shadowColor='#332819b8';g.shadowBlur=7;g.shadowOffsetX=1;g.shadowOffsetY=3;
  g.fillStyle='#49382363';g.beginPath();g.roundRect(9,10,142,77,3);g.fill();
  return texture(c);
}
function makeCard(parent,item,slot,map,front,back,shade){
  const root=new T.Group();parent.add(root);root.rotation.order='YXZ';
  const rect=mesh(root,front,material('#ffffff',map),0,0,0);
  const rear=mesh(root,back,material(item.tint,null,{roughness:1}),0,0,BACK_OFFSET,false);
  rear.morphTargetInfluences=rect.morphTargetInfluences;
  const shadow=flat(root,new T.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false,opacity:.6}),.006,-.014,-.020,NOTE_W*1.145,NOTE_H*1.17,false);
  shadow.receiveShadow=false;
  return {root,rect,rear,shadow,flatGeo:front,item,y:slot%2===0?.88:-.81,scaleY:1,angle:[.027,-.037,-.021,.032][slot],corner:1,lift:0};
}
export function bendPoint(x,t,out){
  const phi=Math.PI*t,curve=Math.sin(Math.PI*t)*1.08/W;
  if(Math.abs(curve)<.00001)return out.set(x*Math.cos(phi),0,x*Math.sin(phi));
  return out.set((Math.sin(phi+curve*x)-Math.sin(phi))/curve,0,(Math.cos(phi)-Math.cos(phi+curve*x))/curve);
}
export const leafTangency=(x,t)=>Math.PI*t+Math.sin(Math.PI*t)*1.08*x/W;
function leafMesh(scene){
  const geom=new T.PlaneGeometry(W,H,40,18);
  geom.translate(W/2,0,0);
  const back=geom.clone(),idx=back.index.array;
  for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];
  const faces=[mesh(scene,geom,material('#fffaf0'),0,0,0),mesh(scene,back,material('#fffaf0'),0,0,0,false)];
  return {faces,base:geom.attributes.position.array.slice()};
}
export function curlHeight(x,y,direction,strength){
  const outer=Math.max(0,((direction*x)/W-.19)/.31);
  const bottom=Math.max(0,(-y/H-.32)/.18);
  return .26*strength*outer*outer*bottom*bottom;
}
export function bendLeaf(leaf,t,corner){
  for(const [f,face] of leaf.faces.entries()){
    const geo=face.geometry,p=geo.attributes.position,n=geo.attributes.normal;
    const offset=f===0?.001:-.001;
    for(let i=0;i<p.count;i++){
      const x=leaf.base[3*i],angle=leafTangency(x,t),sx=-Math.sin(angle),sz=Math.cos(angle);
      bendPoint(x,t,stationary);const y=leaf.base[3*i+1];
      const curled=curlHeight(x-W/2,y,1,corner);
      p.setXYZ(i,stationary.x+sx*(offset+curled),y,stationary.z+sz*(offset+curled));
      n.setXYZ(i,f?-sx:sx,0,f?-sz:sz);
    }
    p.needsUpdate=true;
    n.needsUpdate=true;
    face.frustumCulled=false;
  }
}
function shapingDesk(scene,image){
  const deskCanvas=canvas(1280,850),g=deskCanvas.getContext('2d');
  g.drawImage(image,0,0,1280,850);
  const top=flat(scene,material('#b6a090',texture(deskCanvas)),0,0,-.21,19,12,false);
  const glow=canvas(200,200),gradient=glow.getContext('2d'),r=gradient.createRadialGradient(100,100,15,100,100,100);
  r.addColorStop(0,'#ffd3a576');r.addColorStop(.55,'#f4b77330');r.addColorStop(1,'#ffbd8000');
  gradient.fillStyle=r;gradient.fillRect(0,0,200,200);
  const pool=flat(scene,new T.MeshBasicMaterial({map:texture(glow),transparent:true,depthWrite:false}),-2.7,1.76,-.195,7.4,6.6,false);
  pool.receiveShadow=false;
  return {top,pool};
}
function shapeLamp(scene){
  const root=new T.Group();root.position.copy(lampHome);root.position.z=0;scene.add(root);
  const brass=material('#b0945b',null,{metalness:.3,roughness:.48});
  const dark=material('#3a3b33');
  const green=material('#435a51',null,{roughness:.39,metalness:.22});
  disk(root,dark,-.23,.4,-.08,.48,.56,.15);
  disk(root,brass,-.23,.4,.022,.51,.50,.054);
  disk(root,green,-.23,.4,.079,.47,.49,.069);
  const arm=new T.CatmullRomCurve3([new T.Vector3(-.31,.48,.15),new T.Vector3(-.45,.44,.52),new T.Vector3(-.2,.25,.82),new T.Vector3(.39,-.06,.85)]);
  mesh(root,new T.TubeGeometry(arm,22,.059,10,false),brass,0,0,0);
  const shade=mesh(root,new T.SphereGeometry(.52,42,20,0,2*Math.PI,0,Math.PI*.53),green,.36,-.26,.61);
  shade.rotation.x=Math.PI/2;
  ring(root,brass,.36,-.26,.59,.512,.025);
  const shadeUnder=disk(root,material('#fff1ce',null,{emissive:'#e5a76a',emissiveIntensity:.3}),.36,-.26,.57,.495,.495,.034);
  ring(root,brass,.36,-.26,1.112,.085,.021);
  const button=disk(root,brass,-.24,.66,.16,.091,.103,.055);
  const bulb=new T.PointLight('#ffd0a3',10,8,2);
  bulb.position.set(-3.28,1.22,2.23);scene.add(bulb);
  return {root,bulb,shadeUnder,button};
}
function shapePencil(scene){
  const root=new T.Group();scene.add(root);root.position.copy(penHome);root.rotation.z=-1.10;
  const paint=material('#c8934e'),wood=material('#dab882'),lead=material('#263141'),metal=material('#afa6a2',null,{metalness:.4,roughness:.37}),eraser=material('#995b56');
  const rod=(a,x,tr,br,length,segments=6)=>{
    const m=mesh(root,new T.CylinderGeometry(tr,br,length,segments),a,x,0,0);
    m.rotation.z=Math.PI/2;return m;
  };
  rod(paint,.02,.063,.063,1.36);
  rod(wood,-.783,.017,.064,.245);
  rod(lead,-.925,.002,.022,.085);
  rod(metal,.745,.071,.07,.17,18);
  rod(eraser,.866,.061,.062,.14,18);
  for(const x of [.69,.74,.79])rod(metal,x,.072,.072,.018,18);
  return root;
}
export async function studio(chapters,mobile){
  const [table,skin,fiber]=await Promise.all(['walnut','leather','paper'].map(name=>image('/assets/notebook/'+name+'.webp')));
  const scene=new T.Scene();scene.background=new T.Color('#342720');
  const {pool}=shapingDesk(scene,table),lamp=shapeLamp(scene),pencil=shapePencil(scene);
  const book=new T.Group();book.name='Notebook';scene.add(book);
  const hinge=new T.Group();hinge.position.z=.14;book.add(hinge);
  const binding=material('#785133'),leafEdge=material('#d3bda1'),cream=material('#e9dcc2');
  rounded(book,binding,W/2,0,-.10,W+.17,H+.18,.16,.075);
  rounded(hinge,binding,-W/2,0,-.10,W+.17,H+.18,.15,.075);
  const coverArt=coverSurface(skin);
  const cover=flat(hinge,material('#fffaf1',texture(coverArt)),-W/2,0,-.178,W+.115,H+.13,false);
  cover.rotation.y=Math.PI;
  rounded(book,material('#463427'),0,0,-.09,.18,H+.11,.15,.055);
  for(const [parent,sign] of [[hinge,-1],[book,1]]){
    for(let k=0;k<7;k++){
      const offset=(k%3-1)*.009;
      rounded(parent,k%2===0?cream:leafEdge,sign*(W/2+offset),offset,-.033+k*.009,W+.01,H+.01,.010,.005);
    }
  }
  const fronts=noteGeometry(),backs=cardGeometryBack(fronts),shade=edgeShadow();
  const spreads=await Promise.all(chapters.map(async(chapter,i)=>{
    const surfaces=[0,1].map(j=>texture(paperSurface(fiber,chapter,j,i)));
    const sides=surfaces.map((map,j)=>{
      const face=mesh(book,new T.PlaneGeometry(W,H,16,12),material('#fffdf9',map),j===0?-W/2:W/2,0,j===0?.168:.035,false);
      face.frustumCulled=false;
      return face;
    });
    const cards=await Promise.all(chapter.entries.map(async (entry,slot)=>{
      if(!entry)return null;
      const img=await noteSurface(fiber,entry);
      const card=makeCard(book,entry,slot,texture(img),fronts,backs,shade);
      if(i===0&&slot===0){card.y=.54;card.scaleY=1.42;}
      return {...card,slot};
    }));
    const available=cards.filter(Boolean);
    for(const c of available){
      const left=c.slot<2;
      c.root.position.set(left?-W/2:W/2,c.y,left?.203:.070);
      c.root.rotation.z=c.angle;
    }
    return {sides,surfaces,cards:available};
  }));
  const leaf=leafMesh(book);
  const key=new T.DirectionalLight('#fff3df',2.48);key.position.set(-3.7,4.7,10.3);
  key.castShadow=true;key.shadow.mapSize.setScalar(mobile?1024:2048);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.bias=-.0004;key.shadow.normalBias=.024;key.shadow.radius=4;key.shadow.blurSamples=7;
  const room=new T.HemisphereLight('#d9e6ff','#96694e',1.62);scene.add(key,room);
  return {scene,book,hinge,spreads,leaf,lamp,pencil,pool,key,room,coverArt};
}
