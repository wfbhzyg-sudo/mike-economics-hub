import test from 'node:test';
import assert from 'node:assert/strict';
import {paperTag,correctionBooks} from '../homework-server/correction-books.mjs';
import {questionPaperPDF} from '../homework-server/question-paper.mjs';
import {openPDF} from '../homework-server/pdf-pages.mjs';
import {applyRecovery} from '../homework-server/correction-review.mjs';
const code='W-A123BC456D',book={code,items:[{tag:'Q01'},{tag:'Q02'}]};
test('paper matching uses the book AND item, accepts continuation headers and never guesses page order',()=>{
 assert.deepEqual(paperTag(code+' / Q02 / STEM '+code+' / Q02 / RESPONSE',book),{tag:'Q02',mode:'answer'});
 assert.equal(paperTag(code+' / Q01 / STEM',book).mode,'stem');
 assert.equal(paperTag(code+' / Q03 / RESPONSE',book).mode,'foreign');
 assert.equal(paperTag('W-0123456789 / Q01 / RESPONSE',book).mode,'foreign');
 assert.equal(paperTag('W-0123456789',book).mode,'foreign');
 assert.equal(paperTag('Q02',book).mode,'manual');
 assert.equal(paperTag(code+' / Q01 / RESPONSE '+code+' / Q02 / RESPONSE',book).mode,'manual');
});
test('a 30-item workbook preserves tags on long questions and has exactly one labeled answer area per question',async()=>{
 const questions=Array.from({length:30},(_,i)=>({id:String(i+1),type:'short',sourceLabel:'Topic 2.3 / Original '+(100+i),prompt:i===9?'Evaluate the evidence. '.repeat(700):'Draw and label both curves.'}));
 const bytes=await questionPaperPDF({paper:{title:'Workbook',workbook:code},questions,readAttachment:()=>assert.fail()});
 const doc=await openPDF(bytes),seen=[];
 const manifest={code,items:questions.map((q,i)=>({tag:'Q'+String(i+1).padStart(2,'0')}))};
 try{assert(doc.numPages>30);
 for(let n=1;n<=doc.numPages;n++){const content=(await (await doc.getPage(n)).getTextContent()).items.map(x=>x.str).join(' ');
 const {mode,tag}=paperTag(content,manifest);assert(['answer','stem'].includes(mode),'every page has a tag');if(mode==='answer')seen.push(tag);}
 assert.deepEqual(seen,manifest.items.map(i=>i.tag));}finally{await doc.destroy();}
});
test('creation enforces the server limit, checks each occurrence and deduplicates a shared bank question',async()=>{
 const user={id:'student',role:'student'},ctx={user,route:['correction-books'],method:'POST',rate(){},db:{get:()=>({type:'assignment',published:true,correctionCredit:true}),put:async()=>{}},
 correctionRows:async(u,a)=>a==='unknown'?[]:[{assignmentId:a,submissionId:'s'+a,questionId:'1',source:'assignment',prompt:'Example',libraryQuestionId:'shared',options:[],questionImages:[],questionNumber:1}],json:(_,v)=>v};
 const call=items=>correctionBooks({...ctx,body:async()=>({items})});
 await assert.rejects(call(Array(31).fill({})),/30/);
 await assert.rejects(call([{assignmentId:'unknown',questionId:'1'}]),/刷新/);
 await assert.rejects(call(['a','b'].map(assignmentId=>({assignmentId,questionId:'1'}))),/同一题/);
 await assert.rejects(correctionBooks({...ctx,user:{role:'teacher'}}),/学生/);
});
test('practice-only workbook verification cannot add class credit',()=>{
 const s=[{id:'s',assignmentId:'a',publishedGrade:{total:2,maxPoints:3}}];
 assert.deepEqual(applyRecovery(s,[{submissionId:'s',questionId:'1',status:'passed',practiceOnly:true}],[{id:'a'}]),s);
});
