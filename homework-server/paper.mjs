// Student-visible paper metadata is independent of the private answer source.
export function capturePaper(a, questions=a.rubric||[], version=a.version||0){
 return {version,title:a.title,instructions:a.instructions||'',readingScope:a.readingScope||'',submissionGuide:a.submissionGuide||'',questionFiles:[...(a.questionFiles||[])],mainQuestionFile:a.mainQuestionFile||a.questionFiles?.[0]||null,locations:questions.filter(q=>q.paperFileId&&q.paperPage).map(q=>({id:q.id,fileId:q.paperFileId,page:q.paperPage})),updatedAt:new Date().toISOString(),changeNote:a.paperChangeNote||''};
}
export const paperOf=a=>a.publishedPaper||capturePaper(a);
export const questionLocation=(paper,id)=>paper?.locations?.find(q=>q.id===id)||null;
