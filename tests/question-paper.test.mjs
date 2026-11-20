import test from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument, degrees} from 'pdf-lib';
import sharp from 'sharp';
import {getDocument, OPS} from 'pdfjs-dist/legacy/build/pdf.mjs';
import {questionPaperPDF} from '../homework-server/question-paper.mjs';
import {createSelfPractice} from '../homework-server/self-practice.mjs';

async function unpack(bytes) {
  const pdf=await getDocument({data:new Uint8Array(bytes),useSystemFonts:true}).promise;
  try {
    const pages=[];
    for(let n=1;n<=pdf.numPages;n++){
      const page=await pdf.getPage(n);
      const {items}=await page.getTextContent(), ops=await page.getOperatorList();
      pages.push({text:items.map(x=>x.str).join(' '),rotation:page.rotate,
        imageWidths:ops.fnArray.flatMap((v,i)=>v===OPS.paintImageXObject?[ops.argsArray.slice(0,i).filter((m,k)=>ops.fnArray[k]===OPS.transform && m[0]>1).at(-1)[0]]:[]),
        images:ops.fnArray.filter(x=>x===OPS.paintImageXObject).length});
    }
    return pages;
  } finally {await pdf.destroy();}
}

test('exports ordered cross-page figures, shared material, written choices and original PDF pages; private keys never enter the paper',async()=>{
  const img=await sharp({create:{width:770,height:340,channels:3,background:'#eeeeee'}}).png().toBuffer();
  const narrow=await sharp({create:{width:385,height:110,channels:3,background:'#eee'}}).png().toBuffer();
  const extra=await PDFDocument.create();extra.addPage([650,410]).drawText('Landscape original');
  extra.addPage([600,800]).setRotation(degrees(90));const original=await extra.save();
  const seen=[];
  const questions=[{id:'a',prompt:'Coffee producers face different costs.',questionImages:['material','continued'],
    options:[{label:'A',text:'First option'},{label:'B',text:'Last option'}],correctOptions:['B'],criteria:'NEVER_PRINT'},
    {id:'b',prompt:'Use the preceding chart',questionImages:['material'],options:['A','B'],optionText:{B:'Other choice'}},
    {id:'c',type:'short',prompt:'说明价格变化',maxPoints:3,answer:'NEVER_PRINT'}];
  const bytes=await questionPaperPDF({paper:{title:'AP 宏观经济学 · 2026-11-20 00时27分',questionFiles:['material','continued','original'],answerFiles:['secret']},
    questions,readAttachment:async id=>{seen.push(id);return id==='original'?{mime:'application/pdf',bytes:original}:{mime:'image/png',bytes:id==='continued'?narrow:img};}});
  assert.deepEqual(seen,['material','continued','original']);
  const pages=await unpack(bytes),text=pages.map(p=>p.text).join(' ').replace(/ +/g,' ');
  assert.match(text,/宏观经济学/);assert.ok(text.replace(/\s/g,'').includes('2026-11-2000时27分'));assert.match(text,/Coffee producers face different costs/);assert.match(text,/第 1 题.*First option.*Last option.*第 2 题.*Other choice.*第 3 题.*说明价格变化.*Landscape original/);
  assert.doesNotMatch(text,/NEVER_PRINT/);assert.equal(pages.reduce((n,p)=>n+p.images,0),3);
  const [stem,crop]=pages.flatMap(p=>p.imageWidths);assert.ok(Math.abs(stem-2*crop)<0.01);
  assert.equal(pages.at(-1).rotation,90);assert.match(pages.at(-2).text,/Landscape original/);
});

test('long questions continue with a heading, include the last word, fail on an unavailable crop',async()=>{
  const q={prompt:'A change in expected returns shifts investment. '.repeat(130)+'FINALWORD',type:'short'};
  const pages=await unpack(await questionPaperPDF({paper:{title:'长题'},questions:[q]}));
  assert.ok(pages.length>=2);assert.match(pages[1].text,/（续）/);assert.match(pages.at(-1).text,/FINALWORD/);
  await assert.rejects(questionPaperPDF({paper:{title:'Missing'},questions:[{questionImages:['missing']}],
    readAttachment:async()=>{throw Error('missing crop');}}),/missing crop/);
});

test('mock export checks ownership, accepts active and submitted snapshots and performs no write or timer update',async()=>{
  const attempt={id:'p',type:'self-practice-attempt',studentId:'me',course:'macro',questions:[{id:'Q2',answer:'B',options:['A','B'],optionText:{A:'One'},questionImages:['fig']},{id:'Q1',options:['A','B']}]};
  const db={get:async()=>attempt},sent=[];
  const handler=createSelfPractice({db,sendQuestionPaper:async(...args)=>sent.push(args.at(-1))});
  const get=(id,role='student')=>handler.handle({req:{url:'/api/homework/self-practice/attempts/p/pdf'},route:['self-practice','attempts','p','pdf'],method:'GET',user:{id,role}});
  attempt.status='created';await assert.rejects(get('me'),/开始模考后/);
  attempt.status='active';await assert.rejects(get('another'),/未找到/);await assert.rejects(get('me','teacher'),/仅对学生/);
  await get('me');attempt.status='submitted';await get('me');
  assert.equal(sent.length,2);assert.deepEqual(sent[0].map(q=>q.id),['Q2','Q1']);
  assert.deepEqual(sent[0][0].questionImages,['fig']);assert.equal(sent[0][0].answer,undefined);
});
