import {correctionFeedback, referenceChoices} from './correction-feedback.mjs';
import {questionLessonReference} from './lesson-reference.mjs';
import {reviewLinksFor} from './review-links.mjs';
import {questionLocation} from './paper.mjs';
import {assignmentRecords} from '../homework/learning-model.js';
export const visibleQuestions = (s) => {
 const original = new Map((s.rubricSnapshot || []).map(q => [q.id, q]));
 return (s.publishedGrade?.questionsSnapshot || s.rubricSnapshot || []).map(q=>({id:q.id,prompt:q.prompt,type:q.type||'short',maxPoints:q.maxPoints,knowledge:q.knowledge||'',options:q.options||[],questionImages:q.questionImages||[],paperLocation:questionLocation(s.paperSnapshot,q.id),lessonReference:questionLessonReference({...original.get(q.id),...q},s.paperSnapshot)}));
};
// Answer keys belong only to the student's published, imported result detail.
export function offlineResultQuestions(submission, visible) {
  if (submission.status !== 'published' || !(submission.offlineEvidence||submission.offlineMakeup?.mode==='questions')) return visible;
  const marked = new Set((submission.publishedGrade?.questions || []).filter(q => Number.isFinite(q.score)).map(q => String(q.id)));
  const snapshot = new Map((submission.rubricSnapshot || []).map(q => [String(q.id), q]));
  return visible.map(q => {
    const ref = snapshot.get(String(q.id));
    if (!ref || ref.manualGradingRequired || !marked.has(String(q.id))) return q;
    if (q.type === 'choice') return {...q, correctOptions: referenceChoices(ref)};
    return {...q, referenceAnswer: typeof ref.answer === 'string' ? ref.answer.trim() : ''};
  });
}
export function reviewDraft(s, entry, actor, at) {
  const draft=s.teacherReviewDraft;
  // Choice-only submissions have no AI job. Missing job IDs do not imply an existing draft.
  const previous=draft&&draft.jobId===s.jobId?draft.questions||[]:[];
  return {jobId:s.jobId,revision:(draft?.revision||0)+1,questions:[...previous.filter(q=>q.id!==entry.id),entry],savedAt:at,actor};
}
export function publishedResult(s, result, actor, at, note='', source='teacher', model='') {
  if(s.publishedGrade) s.gradeHistory=[...(s.gradeHistory||[]),structuredClone(s.publishedGrade)];
  s.publishedGrade={...result,questions:result.questions.map(q=>({...q,type:s.rubricSnapshot.find(r=>r.id===q.id)?.type||'short'})),
    teacherNote:note,publishedAt:at,answerVersion:s.version,revision:(s.gradeHistory?.length||0)+1,source,model,
    questionsSnapshot:visibleQuestions({...s,publishedGrade:null})};
  if(s.offlineMakeup?.mode==='questions' && s.offlineMakeup.maxPoints>0 && result.maxPoints>0 && Number.isFinite(result.total)){
    s.publishedGrade.total=s.offlineMakeup.scorePolicy==='cap-raw'
      ? Math.min(result.total,s.offlineMakeup.maxPoints)
      : Math.round(result.total/result.maxPoints*s.offlineMakeup.maxPoints*1e6)/1e6;
    s.publishedGrade.maxPoints=s.offlineMakeup.maxPoints;
  }
  s.status='published';s.updatedAt=at;
  s.reviewRequests=(s.reviewRequests||[]).map(r=>r.status==='open'?{...r,status:'resolved',resolvedAt:at,resolvedBy:actor}:r);
  return s;
}
export function mistakeRows(submissions, assignments, notes=[], bindings=[], {progressOnly=false}={}) {
  const rows=[];
 const noteKey=(student,assignment,question)=>JSON.stringify([student,assignment,question]);
 const noteMap=new Map(notes.map(n=>[noteKey(n.studentId,n.assignmentId,n.questionId),n]));
  for(const record of assignmentRecords(submissions,assignments)){
    if(!record.grade)continue;
    const visible=progressOnly?null:new Map(visibleQuestions(record.effective).map(q=>[q.id,q]));
    const snapshot=new Map((record.effective.rubricSnapshot||[]).map(q=>[q.id,q]));
    const fallbackMap=record.effective.version!=null && record.effective.version===record.assignment.version ? new Map((record.assignment.rubric||[]).map(q=>[q.id,q])) : new Map();
    for(const [index,q] of (record.grade.questions || []).entries()){
      if(q.score==null||q.score>=q.maxPoints)continue;
      const ref=visible?.get(q.id)||{};
      const raw=snapshot.get(q.id);
      const fallback=fallbackMap.get(q.id);
      const meta=noteMap.get(noteKey(record.studentId,record.assignmentId,q.id));
      const last = meta?.corrections?.at(-1);
      const submittedAt = record.effective.submittedAt || record.effective.createdAt;
      const sameSubmission = last && (last.submissionId ? last.submissionId === record.effective.id : !submittedAt || last.createdAt >= submittedAt);
      const feedback=sameSubmission ? correctionFeedback(raw||fallback,last) : null;
      const submitted=Boolean(sameSubmission && (last.text?.trim() || last.choice || last.files?.length));
      const progressStatus=!submitted || feedback?.state==='incorrect' ? 'todo' : meta.status==='mastered' ? 'mastered' : 'review';
      if(progressOnly){rows.push({submissionId:record.effective.id,questionId:q.id,progressStatus});continue;}
      rows.push({progressStatus,choiceMode:raw?.choiceMode||fallback?.choiceMode||'single',
        correctionFeedback:feedback,assignmentId:record.assignmentId,assignmentTitle:record.assignment.title||'作业',course:record.assignment.course||'',studentId:record.studentId,
        libraryQuestionId:raw?.libraryQuestionId||fallback?.libraryQuestionId||null,source:'assignment',
        libraryUnit:record.assignment.libraryUnit||null,submissionId:record.effective.id,questionId:q.id,questionNumber:index+1,prompt:ref.prompt||'',type:ref.type||'short',knowledge:ref.knowledge||'',
        originalChoice:record.effective.choices?.[q.id]||'',
        lessonReference:questionLessonReference({...fallback,...raw,...ref},record.assignment),
        review:reviewLinksFor({...ref,id:q.id},record.assignment,bindings.find(b=>b.assignmentId===record.assignmentId)),options:ref.options||[],questionImages:ref.questionImages||[],score:q.score,maxPoints:q.maxPoints,evidence:q.evidence,feedback:q.feedback,publishedAt:record.grade.publishedAt,
        paper:record.effective.paperSnapshot||null,paperLocation:questionLocation(record.effective.paperSnapshot,q.id),
        gradeRevision:record.grade.revision||1,pendingUpdate:record.pendingUpdate,
        note:meta?.note||'',status:meta?.status||'todo',corrections:meta?.corrections||[],revision:meta?.revision||0});
    }
  }
  return rows;
}
