// Artwork is in paper coordinates so the grain, lettering and ink curl with the leaf.
const navy='#253b44', walnut='#6b4b30', green='#396852', red='#a44b3e', blue='#496783';
const hand='"Desk Hand","Kaiti SC",KaiTi,serif';

function line(g,points,color,width=2){
  g.beginPath();
  points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
  g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.stroke();
}
function label(g,value,x,y,size,color=navy,font=hand){
  g.fillStyle=color;g.font='400 '+size+'px '+font;g.fillText(value,x,y);
}
function fill(g,points,color){
  g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
  g.closePath();g.fillStyle=color;g.fill();
}
function dot(g,x,y,r,color){
  g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=color;g.fill();
}
function arrow(g,x,y,color){
  line(g,[[x-28,y],[x,y],[x-9,y-7]],color,3);line(g,[[x,y],[x-9,y+7]],color,3);
}
function candle(g,x,high,low,open,close){
  const color=close<open?green:red;
  line(g,[[x,high],[x,low]],color,3);
  g.fillStyle=color;g.fillRect(x-9,Math.min(open,close),18,Math.abs(open-close));
}
function archive(g){
  fill(g,[[24,59],[606,43],[611,110],[25,118]],'#b89c74');
  fill(g,[[32,46],[596,34],[597,99],[34,115]],'#faf2d9');
  for(const y of [55,63])line(g,[[295,y],[576,y-5]],'#c5b89b',1.5);
  fill(g,[[0,94],[166,94],[192,70],[680,70],[680,374],[0,374]],'#cda876');
  line(g,[[0,94],[166,94],[192,70],[680,70]],walnut,3);
  g.save();g.translate(51,134);g.rotate(-.022);
  g.fillStyle='#a7875d';g.fillRect(2,4,349,158);
  g.fillStyle='#f4e9ce';g.fillRect(0,0,349,158);
  g.strokeStyle='#988360';g.lineWidth=2;g.strokeRect(9,9,331,140);
  label(g,'ARCHIVE',24,44,20,walnut,'Georgia');label(g,'资料库',22,119,68,navy);g.restore();
  // The two brass eyelets and their figure-eight tie close the folder.
  for(const y of [156,248]){dot(g,523,y,24,'#966c42');dot(g,523,y,19,'#bc8d56');dot(g,523,y,6,walnut);}
  line(g,[[522,156],[540,170],[506,232],[522,251],[538,237],[507,171],[520,157]],'#785633',3);
  line(g,[[518,247],[497,271],[482,276]],'#785633',3);arrow(g,630,322,walnut);
}
function markets(g,ink){
  label(g,'NEBS',31,87,69,red,'Georgia');
  label(g,'模拟股票大赛',253,84,52);
  line(g,[[31,105],[647,105]],navy,3);line(g,[[31,112],[647,112]],navy,1);
  for(const y of [159,209,259,309])line(g,[[47,y],[590,y]],'#b6aa90',1.4);
  const candles=[[75,220,318,246,287],[138,234,332,298,257],[201,194,289,262,220],[264,197,272,217,248],[327,170,259,236,193],[390,150,222,202,174],[453,161,243,183,213]];
  for(const args of candles)candle(g,...args);
  candle(ink,516,122,227,207,153);
  line(g,[[346,121],[336,205],[341,330]],'#ab987d48',3);
  line(g,[[350,122],[340,205],[345,331]],'#fff7de99',2);
  arrow(g,636,323,navy);
}
function graphPaper(g,ink){
  for(let x=0;x<680;x+=25)line(g,[[x,0],[x,374]],'#779e922c',1.2);
  for(let y=0;y<374;y+=25)line(g,[[0,y],[680,y]],'#779e9244',1.2);
  line(g,[[31,0],[31,374]],'#c18a7366',2);
  label(g,'AP 微观学习材料',55,90,52);
  line(g,[[109,136],[109,312],[532,312]],navy,3);
  label(g,'P',85,145,23,navy,'Georgia');label(g,'Q',537,322,23,navy,'Georgia');
  g.setLineDash([5,7]);line(g,[[110,220],[308,220],[308,311]],'#6d827b',1.7);g.setLineDash([]);
  line(ink,[[148,148],[308,220],[468,292]],red,5);
  line(ink,[[148,292],[308,220],[468,148]],green,5);dot(ink,308,220,7,navy);
  label(g,'S',480,154,24,green,'Georgia');label(g,'D',480,295,24,red,'Georgia');
  arrow(g,636,323,green);
}
function macro(g){
  g.fillStyle='#607a8c';g.fillRect(0,0,36,374);
  for(const y of [57,179,304]){dot(g,18,y,6,'#334b59');dot(g,18,y-1,3,'#c5c4b2');}
  label(g,'AP 宏观学习材料',62,90,52);line(g,[[60,111],[646,111]],blue,2);
  const series=[[86,279],[138,258],[183,266],[241,216],[288,230],[342,187],[390,201],[448,150],[505,169],[563,135]];
  for(const y of [167,220,274])line(g,[[82,y],[609,y]],'#73899b5c',1.2);
  fill(g,[...series,[563,295],[86,295]],'#a2baca75');line(g,series,blue,4.5);
  for(const [x,y] of series.filter((_,i)=>i%3===0))dot(g,x,y,4,blue);
  line(g,[[82,139],[82,297],[604,297]],navy,2);
  arrow(g,636,323,blue);
}
const designs={
  resources:{stock:'#dfbd8a',paint:archive},
  nebs:{stock:'#f3e4ce',paint:markets,axis:'up'},
  'micro-materials':{stock:'#e6edda',paint:graphPaper,axis:'right'},
  'macro-materials':{stock:'#dbe4e7',paint:macro},
};
export function paperDesign(id){return designs[id];}

export function paintResourcePaper(fiber,design){
  const face=document.createElement('canvas');face.width=680;face.height=374;
  const g=face.getContext('2d');g.fillStyle=design.stock;g.fillRect(0,0,680,374);
  let inkCanvas,ink;
  if(design.axis){
    inkCanvas=document.createElement('canvas');inkCanvas.width=340;inkCanvas.height=187;
    ink=inkCanvas.getContext('2d');ink.scale(.5,.5);
  }
  design.paint(g,ink);
  g.globalCompositeOperation='multiply';g.globalAlpha=.33;g.drawImage(fiber,0,0,680,374);
  return {face,inkCanvas};
}
