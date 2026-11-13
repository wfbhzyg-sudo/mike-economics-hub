import {reviewLinksFor} from './review-links.mjs';
import {questionLocation} from './paper.mjs';
import {assignmentRecords} from '../homework/learning-model.js';
export const visibleQuestions = (s) => (s.publishedGrade?.questionsSnapshot || s.rubricSnapshot || []).map(q=>({id:q.id,prompt:q.prompt,type:q.type||'short',maxPoints:q.maxPoints,knowledge:q.knowledge||'',options:q.options||[],questionImages:q.questionImages||[],paperLocation:questionLocation(s.paperSnapshot,q.id)}));
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
  s.status='published';s.updatedAt=at;
  s.reviewRequests=(s.reviewRequests||[]).map(r=>r.status==='open'?{...r,status:'resolved',resolvedAt:at,resolvedBy:actor}:r);
  return s;
}
export function mistakeRows(submissions, assignments, notes=[], bindings=[]) {
  const rows=[];
  for(const record of assignmentRecords(submissions,assignments)){
    if(!record.grade)continue;
    for(const q of record.grade.questions){
      if(q.score==null||q.score>=q.maxPoints)continue;
      const ref=visibleQuestions(record.effective).find(r=>r.id===q.id)||{};
      const meta=notes.find(n=>n.studentId===record.studentId&&n.assignmentId===record.assignmentId&&n.questionId===q.id);
      rows.push({assignmentId:record.assignmentId,assignmentTitle:record.assignment.title||'作业',course:record.assignment.course||'',studentId:record.studentId,
        libraryUnit:record.assignment.libraryUnit||null,submissionId:record.effective.id,questionId:q.id,prompt:ref.prompt||'',type:ref.type||'short',knowledge:ref.knowledge||'',
        review:reviewLinksFor({...ref,id:q.id},record.assignment,bindings.find(b=>b.assignmentId===record.assignmentId)),options:ref.options||[],questionImages:ref.questionImages||[],score:q.score,maxPoints:q.maxPoints,evidence:q.evidence,feedback:q.feedback,publishedAt:record.grade.publishedAt,
        paper:record.effective.paperSnapshot||null,paperLocation:questionLocation(record.effective.paperSnapshot,q.id),
        gradeRevision:record.grade.revision||1,pendingUpdate:record.pendingUpdate,
        note:meta?.note||'',status:meta?.status||'todo',corrections:meta?.corrections||[],revision:meta?.revision||0});
    }
  }
  return rows;
}
