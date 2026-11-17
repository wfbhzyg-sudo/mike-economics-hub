// Preserve legacy offline denominators; never infer a full mark from a student's score.
export function scoreMaximum(assignment={},grades=[]) {
  const positive=value=>Number.isFinite(Number(value))&&Number(value)>0;
  if(positive(assignment.maxPoints))return Number(assignment.maxPoints);
  const rubric=(assignment.rubric||assignment.questions||[]).reduce((n,q)=>n+Number(q.maxPoints||0),0);
  if(positive(rubric))return rubric;
  const known=grades.map(g=>Number(g?.maxPoints)).filter(positive);
  if(known.length)return Math.max(...known);
  if(!assignment.maxAdjusted&&positive(assignment.declaredMax))return Number(assignment.declaredMax);
  return null;
}
