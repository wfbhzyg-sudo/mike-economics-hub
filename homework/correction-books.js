import {openPDF,pdfLibrary} from './pdf-reader.js';

const names={open:'待交回',queued:'待验收',running:'验收中',passed:'已通过',revise:'需补充',manual:'待教师核对'};
export function openBooks({ctx,selection,onRefresh}){
 const {main,h,api,post,state}=ctx;
 const dialog=document.createElement('dialog');dialog.className='cb-dialog';main.append(dialog);
 let book,books=[],parts=[],timer,working=false,step=selection?'basket':'books',observed=new Map(),docs=new Map();
 const $=s=>dialog.querySelector(s);
 const fresh=()=>dialog.isConnected&&dialog.open;
 function close(){if(working)return;dialog.close();}
 dialog.addEventListener('cancel',e=>{if(working)e.preventDefault();});
 dialog.onclose=()=>{clearTimeout(timer);for(const d of docs.values())d.then(v=>v.destroy()).catch(()=>{});dialog.remove();};
 dialog.showModal();
 const header=(title)=>'<header><h2>'+h(title)+'</h2><button type="button" data-close aria-label="关闭">×</button></header>';
 function frame(title,body){dialog.innerHTML=header(title)+'<div class="cb-body">'+body+'</div><p data-message role="status"></p>';bind();}
 function lockControls(busy){
   const body=dialog.querySelector('.cb-body');if(body)body.inert=busy;
   const input=dialog.querySelector('[data-upload]');if(input)input.disabled=busy;
 }
 function bind(){dialog.querySelector('[data-close]').onclick=close;lockControls(working);}
 function message(t){if($('[data-message]'))$('[data-message]').textContent=t;}
 async function act(fn){if(working)return;working=true;lockControls(true);dialog.setAttribute('aria-busy','true');try{await fn();}catch(e){message(e.message);}finally{working=false;lockControls(false);dialog.removeAttribute('aria-busy');}}
 const pdfLink=()=>'<a class="secondary" data-paper-download download href="/api/homework/correction-books/'+encodeURIComponent(book.id)+'/pdf">下载 PDF</a>';
 const title=i=>i.tag+' · '+i.title+' · 原题 '+i.number;
 function basket(){const rows=[...selection.values()];
 frame('核对错题册 · '+rows.length+' / 30',rows.map((m,i)=>{
 const versions=[m,...(m.occurrences||[])];
 return '<div class="cb-line"><b>Q'+String(i+1).padStart(2,'0')+'</b>'+(versions.length===1?'<span>'+h(m.assignmentTitle)+' · 原题 '+h(m.questionNumber)+'</span>':'<select aria-label="选择订正来源" data-source="'+i+'">'+versions.map((v,k)=>'<option value="'+k+'">'+h(v.assignmentTitle)+' · 原题 '+h(v.questionNumber)+'</option>').join('')+'</select>')+'</div>';
 }).join('')+'<footer><button class="primary" data-make>制作错题册</button></footer>');
 for(const el of dialog.querySelectorAll('[data-source]')){const i=Number(el.dataset.source),choices=[rows[i],...(rows[i].occurrences||[])];el.onchange=()=>rows[i]=choices[Number(el.value)];}
 $('[data-make]').onclick=()=>act(async()=>{book=(await post('correction-books',{items:rows.map(m=>({assignmentId:m.assignmentId,questionId:m.questionId}))})).book;await showBook();});
 }
 async function shelf(){
 step='books';books=(await api('correction-books')).books;if(!fresh())return;
 frame('我的错题册',books.length?books.map((b,i)=>'<button class="cb-book" data-book="'+i+'"><b>'+h(b.code)+'</b><span>'+new Date(b.createdAt).toLocaleDateString()+' · '+b.items.length+' 题　›</span></button>').join(''):'<p>在左侧勾选错题，即可制作第一本错题册。</p>');
 for(const el of dialog.querySelectorAll('[data-book]'))el.onclick=()=>act(async()=>{book=books[Number(el.dataset.book)];parts=[];await showBook();});
 }
 async function receipts(){
 const current=book.id,r=await api('correction-books/'+current+'/receipts');
 if(!fresh()||step!=='book'||book.id!==current)return;
 $('[data-receipts]').innerHTML=r.receipts.map((v,i)=>'<div class="cb-line"><b>'+h(v.tag)+'</b><span>'+h(book.items[i].title)+' · 原题 '+h(book.items[i].number)+(book.items[i].source==='mock'?' · 模考练习':book.items[i].credit?' · 可补分':' · 仅验收')+'</span><small title="'+h(v.feedback)+'">'+h(names[v.status]||v.status)+'</small></div>').join('');
 clearTimeout(timer);if(r.receipts.some(v=>['queued','running'].includes(v.status)))timer=setTimeout(()=>receipts().catch(e=>message(e.message)),5000);
 const latest=r.receipts.map(v=>v.status).join(',');
 if(observed.has(current)&&observed.get(current)!==latest)onRefresh?.();
 observed.set(current,latest);
 }
 async function showBook(){clearTimeout(timer);step='book';frame(book.code,'<div class="cb-tools"><button class="text-button" data-shelf>我的错题册</button>'+pdfLink()+'<label class="primary cb-pick">交回 PDF / 照片<input data-upload type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp"></label></div><div data-receipts></div>');$('[data-shelf]').onclick=()=>act(shelf);
 $('[data-upload]').onchange=e=>{const files=[...e.target.files];e.target.value='';act(()=>upload(files));};void receipts().catch(e=>message(e.message));}
 async function upload(files){
 if(!files.length)return;
 for(const f of files){
 message('正在读取 '+f.name);
 const response=await fetch('/api/homework/files?purpose=correction-source&name='+encodeURIComponent(f.name),{method:'POST',headers:{'X-CSRF-Token':state.csrf},body:f});
 const answer=await response.json();if(!response.ok)throw Error(answer.error||'文件上传失败');
 const file=answer.file,prefix='correction-books/'+book.id;
 const mapped=await post(prefix+'/pages',{fileId:file.id});
 for(let p of mapped.pages){
   if(p.mode==='manual'&&(file.mime.startsWith('image/')||mapped.pages.length<=3)){
     try{p=(await post(prefix+'/recognize',{fileId:file.id,page:p.page})).page;}catch{/* The student can locate an unreadable photo manually. */}
   }
   parts.push({file,page:p.page,mode:p.mode,inspected:Boolean(p.inspected),locked:p.tag||'',tag:['answer','photo'].includes(p.mode)?p.tag:'',box:null});
 }
 }
 mapping();
 }
 function mapping(){
 step='map';clearTimeout(timer);
 frame('核对题号',parts.map((p,i)=>{
 const blocked=['foreign','stem'].includes(p.mode);
 return '<div class="cb-line cb-map"><span>'+h(p.file.name)+' · p.'+p.page+(p.box?' · 已框选':'')+'</span>'+(blocked?'<small>'+({foreign:'其他册，已跳过',stem:'原题页，已跳过'})[p.mode]+'</small>':'<select aria-label="第 '+(i+1)+' 个区域对应题号" data-map="'+i+'"><option value="">跳过此页</option>'+book.items.filter(it=>!p.locked||p.locked===it.tag).map(it=>'<option value="'+it.tag+'" '+(it.tag===p.tag?'selected':'')+'>'+h(title(it))+'</option>').join('')+'</select><button data-crop="'+i+'">预览 / 框选</button>'+(p.mode==='manual'?'<button data-split="'+i+'">同页另题</button>'+(p.inspected?'':'<button data-read="'+i+'">识别题签</button>'):'')+(parts.slice(0,i).some(prev=>p.tag&&prev.tag===p.tag)?'<button data-earlier="'+i+'">提前一页</button>':''))+'</div>';
 }).join('')+'<footer><button class="secondary" data-back>返回错题册</button><button class="primary" data-submit>交回订正</button></footer>');
 for(const el of dialog.querySelectorAll('[data-map]'))el.onchange=()=>{parts[+el.dataset.map].tag=el.value;mapping();};
 for(const el of dialog.querySelectorAll('[data-earlier]'))el.onclick=()=>{const i=+el.dataset.earlier,p=parts[i],j=parts.slice(0,i).findLastIndex(prev=>prev.tag===p.tag);if(j>=0){[parts[i],parts[j]]=[parts[j],parts[i]];mapping();}};
 for(const el of dialog.querySelectorAll('[data-read]'))el.onclick=()=>act(async()=>{const p=parts[+el.dataset.read],recognized=(await post('correction-books/'+book.id+'/recognize',{fileId:p.file.id,page:p.page})).page;Object.assign(p,{mode:recognized.mode,inspected:true,locked:recognized.tag||'',tag:['photo','answer'].includes(recognized.mode)?recognized.tag:''});mapping();});
 for(const el of dialog.querySelectorAll('[data-crop]'))el.onclick=()=>act(()=>crop(+el.dataset.crop));
 for(const el of dialog.querySelectorAll('[data-split]'))el.onclick=()=>{const i=+el.dataset.split;parts.splice(i+1,0,{...parts[i],tag:'',box:null});mapping();};
 $('[data-back]').onclick=()=>act(showBook);
 $('[data-submit]').onclick=()=>act(async()=>{
 const selected=parts.filter(p=>p.tag&&!['stem','foreign'].includes(p.mode));
 if(!selected.length)throw Error('请先把作答页对应到题号。');
 const at=(p,q)=>p.file.id===q.file.id&&p.page===q.page;
 for(const p of selected)if(selected.some(q=>q!==p&&at(p,q))&&!p.box)throw Error('同一页有多道题，请分别框选各题作答区域。');
 let sent=0;
 for(const tag of new Set(selected.map(p=>p.tag))){
 const batch=selected.filter(p=>p.tag===tag);
 message('正在交回 '+tag);await post('correction-books/'+book.id+'/return',{tag,parts:batch.map(p=>({fileId:p.file.id,page:p.page,box:p.box}))});sent++;
 }
 parts=[];await showBook();message('已处理 '+sent+' 道题，可在这里查看验收结果。');onRefresh?.();
 });
 }
 async function crop(index){
 const p=parts[index];let src='/api/homework/files/'+encodeURIComponent(p.file.id);
 if(p.file.mime==='application/pdf'){
 if(!docs.has(p.file.id))docs.set(p.file.id,pdfLibrary().then(lib=>openPDF(p.file.id,lib).promise));
 const page=await (await docs.get(p.file.id)).getPage(p.page),base=page.getViewport({scale:1}),v=page.getViewport({scale:Math.min(1.5,900/base.width)});
 const canvas=document.createElement('canvas');canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);
 await page.render({canvasContext:canvas.getContext('2d'),viewport:v}).promise;src=canvas.toDataURL('image/jpeg',.84);
 }
 frame('框选作答区域','<div class="cb-crop"><img alt="作答页" draggable="false"><i></i></div><footer><button data-cancel>取消</button><button class="primary" data-save>使用此区域</button></footer>');
 const stage=$('.cb-crop'),img=$('img'),mark=$('.cb-crop i');img.src=src;let box=p.box||(p.mode==='answer'?[.065,.58,.87,.34]:[0,0,1,1]),anchor;
 const paint=()=>Object.assign(mark.style,{left:box[0]*100+'%',top:box[1]*100+'%',width:box[2]*100+'%',height:box[3]*100+'%'});
 const point=e=>{const r=stage.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))];};
 stage.onpointerdown=e=>{anchor=point(e);stage.setPointerCapture(e.pointerId);};stage.onpointermove=e=>{if(!anchor)return;const [x,y]=point(e);box=[Math.min(anchor[0],x),Math.min(anchor[1],y),Math.abs(anchor[0]-x),Math.abs(anchor[1]-y)];paint();};
 stage.onpointerup=stage.onpointercancel=()=>{anchor=null;};paint();
 $('[data-cancel]').onclick=mapping;$('[data-save]').onclick=()=>{if(box[2]<.025||box[3]<.025)return message('请拖出完整的作答区域');p.box=box;mapping();};
 }
 if(selection)basket();else{frame('我的错题册','');act(shelf);}
 return ()=>{if(dialog.open)dialog.close();};
}
