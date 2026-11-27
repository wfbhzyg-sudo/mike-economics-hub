// Render with the viewing device's Chinese fonts. Keep only one tile of pixels in memory.
let painter;
function loadPainter(){
  if(!painter)painter=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='/teacher/html2canvas-1.4.1.js';
    script.onload=()=>resolve(window.html2canvas);
    script.onerror=()=>{script.remove();painter=null;reject(Error('图像组件暂未载入'));};
    document.head.append(script);
  });
  return painter;
}
const u32=n=>Uint8Array.of(n>>>24,n>>>16,n>>>8,n);
const crcTable=Array.from({length:256},(_,v)=>{for(let i=0;i<8;i++)v=v&1?(v>>>1)^0xedb88320:v>>>1;return v>>>0;});
function chunk(tag,bytes){
  const type=new TextEncoder().encode(tag);
  let crc=0xffffffff;
  for(const list of [type,bytes])for(const b of list)crc=crcTable[(crc^b)&255]^(crc>>>8);
  return new Blob([u32(bytes.length),type,bytes,u32(~crc)]);
}

// Older WebKit can still save a single PNG using uncompressed DEFLATE blocks.
// Rows remain tiled and no full-height canvas is allocated.
function storedDeflate(append){
  let a=1,b=0;append(Uint8Array.of(0x78,0x01));
  return {
    write(bytes){
      for(let i=0;i<bytes.length;i+=65535){
        const row=bytes.subarray(i,i+65535),n=row.length;
        const block=new Uint8Array(5+n);
        block.set([0,n&255,n>>>8,(~n)&255,((~n)>>>8)&255]);block.set(row,5);append(block);
        for(const value of row){a=(a+value)%65521;b=(b+a)%65521;}
      }
    },
    close(){append(Uint8Array.of(1,0,0,255,255,...u32((b<<16)|a)));},
    async abort(){}
  };
}

async function renderImage(main){
  const paint=await loadPainter(),frame=document.createElement('iframe');
  frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
  frame.style.cssText='position:fixed;left:-12000px;top:0;width:1040px;height:900px;border:0;pointer-events:none';
  document.body.append(frame);
  try{
    const d=frame.contentDocument;
    // html2canvas clones into standards mode. Measure in the same mode or the final rows drift out of a long export.
    d.open();d.write('<!doctype html><html lang="zh-CN"><head></head><body></body></html>');d.close();
    for(const s of document.querySelectorAll('head style'))d.head.append(d.importNode(s,true));
    const paper=d.importNode(main,true);
    paper.classList.add('report-export');
    paper.querySelectorAll('.actions,.online-only,template').forEach(x=>x.remove());
    d.body.append(paper);
    await d.fonts.ready;
    const width=Math.ceil(paper.getBoundingClientRect().width),height=Math.ceil(paper.getBoundingClientRect().height);
    const scale=2,common={scale,windowWidth:1040,windowHeight:900,scrollX:0,scrollY:0,width,logging:false,backgroundColor:'#fcfcf8'};
    const parts=[Uint8Array.of(137,80,78,71,13,10,26,10),chunk('IHDR',Uint8Array.of(...u32(width*scale),...u32(height*scale),8,2,0,0,0))];
    const append=bytes=>parts.push(chunk('IDAT',bytes));
    const zip=window.CompressionStream?new CompressionStream('deflate'):null;
    const writer=zip?zip.writable.getWriter():storedDeflate(append);
    const output=zip?zip.readable.pipeTo(new WritableStream({write:append})):Promise.resolve();
    output.catch(()=>{});
    try{
      for(let y=0;y<height;y+=384){
        const canvas=await paint(paper,{...common,y,height:Math.min(384,height-y)});
        try{
          const {data}=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
          const stride=canvas.width*3+1,scan=new Uint8Array(stride*canvas.height);
          for(let row=0;row<canvas.height;row++){
            let dest=row*stride+1,src=row*canvas.width*4;
            // Each RGB scanline starts with the PNG "no filter" byte.
            for(let x=0;x<canvas.width;x++,src+=4){scan[dest++]=data[src];scan[dest++]=data[src+1];scan[dest++]=data[src+2];}
          }
          await writer.write(scan);
        }finally{canvas.width=canvas.height=1;}
      }
      await writer.close();await output;
    }catch(error){await writer.abort(error).catch(()=>{});throw error;}
    parts.push(chunk('IEND',new Uint8Array()));
    return new Blob(parts,{type:'image/png'});
  }finally{frame.remove();}
}
export async function saveReportPng(main){
  const blob=await renderImage(main),url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download=main.dataset.filename;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
