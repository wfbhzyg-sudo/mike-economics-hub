import {readFile} from 'node:fs/promises';
import {PDFDocument,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
let fontBytes;
export async function exportWork({assignment,submission,grade,readAttachment}){
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
 fontBytes ||= await readFile(new URL('./fonts/NotoSansSC-Regular.ttf',import.meta.url));
 // Full embedding avoids CJK glyph loss in fontkit subset output. Loaded only for PDF download.
 const font=await doc.embedFont(fontBytes,{subset:false});
 let page,y;const color=rgb(.05,.12,.21);
 const next=()=>{page=doc.addPage([595.28,841.89]);y=790;};next();
 function paragraph(value,size=11){
  for(const raw of String(value||'').replace(/\r/g,'').split('\n')){
   let line='';
   for(const ch of raw){
    // Unsupported control characters never enter PDF operators.
    if(ch.charCodeAt(0)<32)continue;
    if(line&&font.widthOfTextAtSize(line+ch,size)>499){draw(line,size);line='';}line+=ch;
   }draw(line||' ',size);
  } y-=6;
 }
 function draw(line,size){if(y<size+48)next();page.drawText(line,{x:48,y,size,font,color});y-=size*1.65;}
 paragraph(assignment.title,21);
 paragraph(assignment.course||'经济学');
 if(submission){paragraph('提交时间 '+new Date(submission.submittedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}));paragraph('提交编号 '+submission.id.slice(0,12).toUpperCase());}
 if(grade){paragraph(`成绩 ${grade.total} / ${grade.maxPoints}`,17);paragraph(`评分标准 v${grade.answerVersion} · 成绩版本 ${grade.revision||1}`);for(const q of grade.questions){paragraph(`第 ${q.id} 题   ${q.score} / ${q.maxPoints}`,13);if(q.feedback)paragraph(q.feedback);if(q.evidence)paragraph('作答依据：'+q.evidence);}if(grade.teacherNote)paragraph(grade.teacherNote);}
 if(submission?.text){paragraph('文字作答',15);paragraph(submission.text);}
 if(!submission){paragraph(assignment.instructions||'');for(const q of assignment.rubric||assignment.questions||[]){paragraph(`第 ${q.id} 题   ${q.maxPoints} 分`,13);paragraph(q.prompt);}}
 const ids=submission?.files||assignment.questionFiles||[];
 for(const id of ids){const {bytes,mime}=await readAttachment(id);if(mime==='application/pdf'){const original=await PDFDocument.load(bytes);for(const p of await doc.copyPages(original,original.getPageIndices()))doc.addPage(p);}else{const img=mime==='image/png'?await doc.embedPng(bytes):await doc.embedJpg(bytes);const p=doc.addPage([595.28,841.89]);const factor=Math.min(499/img.width,746/img.height);p.drawImage(img,{x:(595.28-img.width*factor)/2,y:(841.89-img.height*factor)/2,width:img.width*factor,height:img.height*factor});}}
 doc.setTitle(assignment.title+' · '+(grade?'批改结果':submission?'我的作业':'题目'));
 doc.setAuthor('Mike 经济一页通');
 return Buffer.from(await doc.save());
}
