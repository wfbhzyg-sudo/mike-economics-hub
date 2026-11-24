import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {subjectIds,subjectInfo,unitIdentity,topicUnitNumber} from '../homework/subject-catalog.js';
import {automaticGradeReady} from '../homework/library-grading.js';

const kinds=['units','questions','files'];
const check=(ok,message)=>{if(!ok)throw new Error(message);};

// Checks an additive import in memory. The baseline is a read-only ID and metadata inventory.
export function checkContent(batch,baseline={}) {
  const used=new Set(),units=new Map(),files=new Set(),questions=new Map();
  function reserve(id,kind){
    check(typeof id==='string'&&id.trim()===id&&id.length>0,'缺少稳定编号 · '+kind);
    check(!used.has(id),'编号重复 · '+id);
    used.add(id);
  }
  function rows(group,kind){
    const input=group[kind]??[];
    check(Array.isArray(input),'需要列表 · '+kind);
    return input;
  }
  for(const group of [baseline,batch]){
    check(group&&typeof group==='object'&&!Array.isArray(group),'资料包格式无效');
    for(const field of Object.keys(group))check([...kinds,'topicAdditions'].includes(field),'未知资料字段 · '+field);
    for(const kind of kinds)for(const item of rows(group,kind)){
      reserve(item?.id,kind);
      if(kind==='units')units.set(item.id,{...item,topics:[...(item.topics||[])]});
      if(kind==='files')files.add(item.id);
      if(kind==='questions')questions.set(item.id,item);
    }
    for(const addition of rows(group,'topicAdditions')){
      const unit=units.get(addition.unitId);
      check(unit,'找不到新增章节所属单元 · '+addition.unitId);
      unit.topics.push(addition.topic);
    }
  }
  const changed=new Set([...rows(batch,'units').map(u=>u.id),...rows(batch,'topicAdditions').map(a=>a.unitId)]);
  const topicsByUnit=new Map();
  function topicsOf(id){
    if(topicsByUnit.has(id))return topicsByUnit.get(id);
    const unit=units.get(id),identity=unitIdentity(id);
    check(unit&&identity,'单元不存在或未登记 · '+id);
    const topics=new Set();
    for(const t of unit.topics){
      check(t&&topicUnitNumber(t.id)===identity.number&&!topics.has(t.id),'章节编号重复或不属于单元 · '+id+' / '+t?.id);
      topics.add(t.id);
    }
    topicsByUnit.set(id,topics);
    return topics;
  }
  for(const id of changed){
    const topics=topicsOf(id);
    for(const r of units.get(id).resources||[]){
      check(!r.topicId||topics.has(r.topicId),'资料章节无效 · '+id);
      check(!r.fileId||files.has(r.fileId),'资料文件缺失 · '+r.fileId);
    }
  }
  // Source titles may be reused across editions. Only a stable source ID can establish duplication.
  const originals=new Map();
  const sourceKey=q=>q.sourceId&&q.number!=null&&q.number!=='' ? JSON.stringify([unitIdentity(q.unitId)?.course,q.sourceId,String(q.number)]) : null;
  for(const q of rows(baseline,'questions')){
    const key=sourceKey(q);
    if(key&&!q.canonicalQuestionId)originals.set(key,q.id);
  }
  for(const q of rows(batch,'questions').filter(q=>!q.canonicalQuestionId)){
    const key=sourceKey(q);
    if(!key)continue;
    check(!originals.has(key),'同一原卷题号已有题目，请引用原题 · '+q.id);
    originals.set(key,q.id);
  }
  for(const q of rows(batch,'questions')){
    const identity=unitIdentity(q.unitId),topics=topicsOf(q.unitId);
    for(const t of [q.topic,...(q.relatedTopics||[])].filter(Boolean))check(topics.has(t),'题目章节无效 · '+q.id+' / '+t);
    check(['choice','short'].includes(q.type),'未知题型 · '+q.id);
    if(q.type==='choice')check(topics.has(q.topic),'选择题缺少主章节 · '+q.id);
    if(q.skill!=null&&q.skill!==''){
      const m=/^(\d+)(?:\.?[A-Za-z]|\.\d+)?$/.exec(String(q.skill));
      const skill=m&&subjectInfo(identity.course).skills.find(s=>s.id===Number(m[1]));
      check(skill&&(q.type!=='choice'||skill.choice),'技能不属于本学科或题型 · '+q.id);
    }
    check(Array.isArray(q.questionImages)&&q.questionImages.length>0&&q.questionImages.every(id=>files.has(id)),'题面切片缺失 · '+q.id);
    if(q.status==='ready')check(automaticGradeReady(q),'答案或评分点无法计分 · '+q.id);
    if(q.canonicalQuestionId){
      const canonical=questions.get(q.canonicalQuestionId);
      check(canonical&&canonical!==q&&!canonical.canonicalQuestionId&&unitIdentity(canonical.unitId)?.course===identity.course,'原题关联无效 · '+q.id);
    }
  }
  return {subjects:subjectIds.length,units:changed.size,questions:rows(batch,'questions').length,files:rows(batch,'files').length};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const [input,previous,...extra]=process.argv.slice(2);
    check(extra.length===0,'用法：node scripts/check-curriculum.mjs [新增资料.json] [已有资料清单.json]');
    const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
    console.log(JSON.stringify(checkContent(input?await read(input):{},previous?await read(previous):{})));
  }catch(e){console.error(e.message);process.exitCode=1;}
}
