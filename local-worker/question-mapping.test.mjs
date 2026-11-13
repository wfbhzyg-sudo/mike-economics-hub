import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {processJob, resolveQuestionIds} from './worker.mjs';
import {automaticGrade} from '../homework-server/validation.mjs';

const settings = {provider:'ollama',baseUrl:'http://127.0.0.1:11434',model:'fixture'};
const question = (id,extra={}) => ({id,type:'short',prompt:`Prompt ${id}`,answer:'PRIVATE ANSWER',maxPoints:1,scoringPoints:[{id:'1',criterion:'PRIVATE CRITERION',maxPoints:1}],...extra});
async function run(rubric, pages, answer = () => ({earned:0,sourceStatus:'readable'})) {
  const original=globalThis.fetch,requests=[];
  const bytes=await sharp({create:{width:20,height:20,channels:3,background:'white'}}).png().toBuffer();
  let page=0;
  globalThis.fetch=async(_url,options)=>{
    const body=JSON.parse(options.body),prompt=body.messages[1].content;
    requests.push({body,prompt});
    const result=prompt.startsWith('Transcribe')?pages[page++]:answer(prompt);
    return Response.json({message:{content:JSON.stringify(result)}});
  };
  try {
    const result=await processJob({kind:'grade',payload:{files:pages.map((_,i)=>String(i)),text:'',rubric}},settings,async()=>({bytes,mime:'image/png'}));
    return {result,requests,checked:automaticGrade(result,rubric)};
  } finally {globalThis.fetch=original;}
}

test('Number formatting normalizes only unique confirmed IDs; parent IDs never expand implicitly',()=>{
  const rubric=['a(i)','a(ii)','2a','2b(i)','2b(ii)'].map(question);
  assert.deepEqual(resolveQuestionIds(['Question A（ii）','2(b)(i)','2','1','unknown','2B(ii)'],rubric),['a(ii)','2b(i)','2b(ii)']);
  assert.deepEqual(resolveQuestionIds(['1-2'],[question('1.2'),question('12')]),[]);
  assert.deepEqual(resolveQuestionIds(['1.2'],[question('1.2'),question('12')]),['1.2']);
});

test('Ten subparts on reversed pages reach server-validated numeric drafts including zero',async()=>{
  const ids=['a(i)','a(ii)','a(iii)','a(iv)','b','2a','2b(i)','2b(ii)','2c','2d'];
  const rubric=ids.map(question);
  const {result,requests,checked}=await run(rubric,[
    {text:'SECOND PAGE WORK',readable:true,questionIds:ids.slice(5)},
    {text:'FIRST PAGE WORK',readable:true,questionIds:ids.slice(0,5)},
  ],prompt=>({earned:prompt.includes('question 2a.')?1:0,sourceStatus:'readable'}));
  assert.equal(result.protocolVersion,3);
  assert.equal(checked.questions.length,10);
  assert(checked.questions.every(q=>typeof q.score==='number'&&!q.needsReview));
  assert.equal(checked.total,1);
  for(const {prompt,body} of requests){
    if(prompt.startsWith('Transcribe')){
      assert(!prompt.includes('PRIVATE ANSWER'));assert(!prompt.includes('PRIVATE CRITERION'));
      assert.deepEqual(body.format.properties.questionIds.items.enum,ids);
    }else{
      assert.equal(body.messages[1].images.length,1);
      const second=prompt.match(/from question ([^.]+)\./)?.[1]?.startsWith('2');
      assert.equal(prompt.includes('SECOND PAGE WORK'),second);
      assert.equal(prompt.includes('FIRST PAGE WORK'),!second);
      assert.equal(body.options.num_predict,512);
      assert(!body.format.properties.needsReview);
    }
  }
});

test('An unrelated unreadable page cannot veto a readable question, but its own score stays null',async()=>{
  const {checked}=await run([question('1'),question('2')],[
    {text:'1 clear but incorrect',readable:true,questionIds:['1']},
    {text:'2 [unreadable]',readable:false,questionIds:['2']},
  ]);
  assert.equal(checked.questions[0].score,0);
  assert.equal(checked.questions[1].score,null);
});

test('A parent-only ID, foreign ID, or missing subpart cannot receive a guessed score',async()=>{
  for(const questionIds of [['2'],['foreign'],[]]){
    const {checked,requests}=await run([question('2b(i)')],[{text:'some answer',readable:true,questionIds}]);
    assert.equal(checked.questions[0].score,null);
    assert.equal(requests.length,1);
  }
});

test('Unreadable or absent source remains unscored even if a model returns a number',async()=>{
  for(const sourceStatus of ['unreadable','missing',undefined,'incorrect']){
    const {checked}=await run([question('1')],[{text:'1',readable:true,questionIds:['1']}],()=>({earned:1,sourceStatus}));
    assert.equal(checked.questions[0].score,null);
  }
});

test('More than three mapped pages never silently omit later evidence',async()=>{
  const {checked,requests}=await run([question('1')],Array.from({length:4},()=>({text:'1 continued',readable:true,questionIds:['1']})));
  assert.equal(checked.questions[0].score,null);assert.equal(requests.length,4);
});

test('Choice grading also ignores unrelated unreadable pages and never receives the teacher key',async()=>{
  const {checked}=await run([question('1',{type:'choice',correctOptions:['B'],choiceMode:'single'})],[
    {text:'1 B',readable:true,questionIds:['1']},{text:'unrelated blur',readable:false,questionIds:[]},
  ],prompt=>{assert(!prompt.includes('PRIVATE ANSWER'));assert(!prompt.includes('unrelated blur'));return {selectedOptions:['B'],mappingVerified:true,answerReadable:true,confirmedBlank:false};});
  assert.equal(checked.questions[0].score,1);
});

test('Per-question typed work is independent of another question attachment and explicit file binding survives absent OCR numbers',async()=>{
 const original=globalThis.fetch,requests=[],bytes=await sharp({create:{width:20,height:20,channels:3,background:'white'}}).png().toBuffer();
 globalThis.fetch=async(_url,options)=>{const b=JSON.parse(options.body),p=b.messages[1].content;requests.push(p);let r;
 if(p.startsWith('Transcribe'))r={text:'a visible drawing without a question number',readable:true,questionIds:[]};
 else if(p.startsWith('Grade ONLY')){assert(!p.includes('OTHER QUESTION TEXT'));r={earned:p.includes('question 1.')?1:0,sourceStatus:'readable'};}else throw Error('Unexpected request '+p.slice(0,50));return Response.json({message:{content:JSON.stringify(r)}})};
 try{const rubric=[question('1'),question('2',{prompt:'Draw a graph'})];const result=await processJob({kind:'grade',payload:{rubric,files:['photo'],text:'OTHER QUESTION TEXT',responses:{'1':{text:'FIRST ANSWER',files:['photo']},'2':{text:'SECOND ANSWER: drawing omitted',files:[]}}}},settings,async()=>({bytes,mime:'image/png'}));
 const checked=automaticGrade(result,rubric);assert.equal(checked.total,1);assert.equal(checked.questions[1].score,0);assert.equal(requests.length,3);assert(!requests[1].includes('SECOND ANSWER'));assert(!requests[2].includes('FIRST ANSWER'));assert(!requests[2].includes('a visible drawing'));
 }finally{globalThis.fetch=original;}
});
