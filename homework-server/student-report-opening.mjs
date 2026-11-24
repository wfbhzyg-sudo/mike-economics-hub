import {subjectInfo} from '../homework/subject-catalog.js';
import {resultParts} from './student-report.mjs';

const subjects = {mixed:'综合',unknown:'未分类'};
const round = n => Math.round(n*10)/10;

// The model receives compact, scoped facts. Each observation can be reproduced
// without sending a name, an assignment title, an answer or a teacher comment.
export function openingEvidence(report) {
  const facts=[];
  for(const course of report.courses){
    const subject=subjectInfo(course.course)?.short||subjects[course.course];
    if(!subject)continue;
    const add=(key,text)=>facts.push({id:course.course+'.'+key,text});
    const graded=course.graded;
    const parts=course.cells.map(resultParts).filter(Boolean);
    const recovered=round(parts.reduce((sum,p)=>sum+(p.recovered||0),0));
    if(recovered>0)add('recovery','你在'+subject+'作业中通过订正补回了 '+recovered+' 分');
    if(Number.isFinite(course.trend)){
      const delta=course.trend;
      add('trend',subject+'最近三份作业的平均得分率'+(delta===0?'与此前三份持平':'较此前三份'+(delta>0?'提高':'下降')+'了 '+Math.abs(delta)+' 个百分点'));
    }
    if(graded>0&&Number.isFinite(course.average))add('average','本期 '+graded+' 份已出分的'+subject+'作业，平均得分率为 '+course.average+'%');
    for(const axis of course.evidence?.axes||[]){
      const name=subjectInfo(course.course)?.skills[axis.skill-1]?.name;
      if(name&&axis.count>0&&axis.band)add('skill'+axis.skill,subject+'的「'+name+'」已有 '+axis.count+' 道独立题记录，课堂表现为第 '+axis.band+' 档');
    }
    if(Number.isFinite(course.evidence?.first))add('independent',subject+'独立首答得分率为 '+course.evidence.first+'%');
    if(Number.isFinite(course.evidence?.transfer)&&course.evidence.transferCount>0){
      add('transfer',subject+'订正后已尝试 '+course.evidence.transferCount+' 道同技能新题，正确率为 '+course.evidence.transfer+'%');
    }
    if(course.verified>0)add('verified',subject+'已有 '+course.verified+' 道错题通过订正');
    if(course.pending>0)add('pending',subject+'还有 '+course.pending+' 道错题可回看订正');
    const latest=report.includeMock&&course.mockHistory?.[0];
    if(latest&&Number.isFinite(latest.rate)){
      add('practice',subject+'最近一次自主模考正确率为 '+latest.rate+'%');
    }
  }
  return facts;
}

export function recordOpening(facts) {
  if(!facts.length)return '本期可用于评价的学习记录还较少。完成下一份练习后，可以在这里回看自己的进展。';
  const observation=facts.find(f=>f.id.endsWith('.recovery'))||facts.find(f=>f.id.endsWith('.trend'))||facts[0];
  return observation.text+'。';
}

// Reports may reopen a cached comment created before the wording changed.
export function publicOpening(text) {
  const provider = /deep[\s-]*seek|深度求索/i;
  if (!text || !provider.test(text)) return text;
  const attribution = /^\s*(?:根据\s*)?(?:deep[\s-]*seek|深度求索)\s*(?:的)?(?:分析认为|分析|建议|评语|认为|提示)?\s*(?:[：:，,]\s*|(?=你|先|可以|从|试着|继续))/i;
  return (text.match(/[^。！？!?\n]+[。！？!?]*|\n+/gu) || [])
    .map(sentence => sentence.replace(attribution, ''))
    .filter(sentence => !provider.test(sentence))
    .join('').trim().replace(/^[。！？!?\s]+/u,'');
}

export function modelOpening(result,facts) {
  const ids=result?.observations;
  if(!Array.isArray(ids)||ids.length<1||ids.length>2||new Set(ids).size!==ids.length)return null;
  const observations=ids.map(id=>facts.find(f=>f.id===id));
  if(observations.some(f=>!f))return null;
  const action=typeof result.nextStep==='string'?result.nextStep.trim():'';
  // All numerical statements belong to the verified observations, not the free-text advice.
  if(!action||action.length>52||!/[\u3400-\u9fff]/u.test(action)||/[\d０-９%％<>\r\n]|https?:|一定能|预测考分|注定/.test(action))return null;
  return publicOpening(observations.map(f=>f.text).join('。')+'。'+action.replace(/[。！？.!?]+$/u,'')+'。');
}
