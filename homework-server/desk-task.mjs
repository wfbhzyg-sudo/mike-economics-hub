import {audienceSql} from './assignment-audience.mjs';
import {classKey} from '../homework/course-scope.js';
import {assignmentState} from '../homework/learning-model.js';
import {assignmentOpensLater} from '../homework/assignment-navigation.js';

// Both the paper count and the drill-down use the latest effective submission.
function teacherPending(table){
  return `WITH latest AS (
      SELECT DISTINCT ON (a.id,s.data->>'studentId') s.id
      FROM ${table} a JOIN ${table} s ON s.kind='submission' AND s.data->>'assignmentId'=a.id
      WHERE a.kind='assignment' AND a.data->>'teacherId'=$1 AND a.data->>'deletedAt' IS NULL
        AND a.data->>'published'='true' AND s.data->>'status'<>'draft'
        AND s.data->>'manualScoreEntry' IS DISTINCT FROM 'true'
      ORDER BY a.id,s.data->>'studentId',coalesce(s.data->>'submittedAt',s.data->>'createdAt','') DESC,s.id DESC
    ), pending AS (
      SELECT s.id,s.data->>'status' AS status,
        coalesce(s.data->'reviewRequests' @> '[{"status":"open"}]'::jsonb,false) AS requested
      FROM latest JOIN ${table} s USING(id) WHERE s.data->>'status'<>'returned'
    )`;
}

export async function deskSubmissions(db,user,queue){
  const table=db.table;
  const {rows}=await db.query(`${teacherPending(table)}
    SELECT s.id, a.data->>'title' AS title,
      coalesce(u.data->>'name',s.data->>'studentName','学生') AS name,
      s.data->>'submittedAt' AS "submittedAt"
    FROM pending p JOIN ${table} s ON s.id=p.id
    JOIN ${table} a ON a.id=s.data->>'assignmentId'
    LEFT JOIN ${table} u ON u.kind='user' AND u.id=s.data->>'studentId'
    WHERE CASE WHEN $2='requests' THEN p.requested ELSE p.status='needs_review' AND NOT p.requested END
    ORDER BY s.data->>'submittedAt' DESC NULLS LAST,s.id`,[user.id,queue]);
  return rows;
}

// Fetch only fields used to select a task. In particular, never load papers,
// rubrics, attachment bodies or full grading histories for the notebook.
export async function deskTask(db,user,now=Date.now(),effectiveZeros=rows=>rows){
  const table=db.table;
  if(user.role==='teacher'){
    const {rows}=await db.query(`${teacherPending(table)} SELECT count(*) FILTER(WHERE status='needs_review' AND NOT requested)::int AS grading,
        count(*) FILTER(WHERE requested)::int AS requests FROM pending`,[user.id]);
    const task=rows[0];
    return task.grading||task.requests?task:null;
  }
  if(user.role!=='student'||!user.classIds?.length)return null;
  const [assignments,submissions]=await Promise.all([
    db.query(`SELECT id,data->>'title' AS title,data->>'dueAt' AS "dueAt",
      data->>'opensAt' AS "opensAt",data->>'allowLate'='true' AS "allowLate",
      (data->>'allowResubmit') IS DISTINCT FROM 'false' AS "allowResubmit",
      data->>'makeupMode' AS "makeupMode",data->>'format' AS format,data->>'offline'='true' AS offline
      FROM ${table} WHERE kind='assignment' AND data->>'published'='true'
        AND data->>'deletedAt' IS NULL AND (data->'classIds') ?| $1::text[] AND ${audienceSql('$2','$3')}
      ORDER BY created DESC,id`,[user.classIds,user.classIds.map(classKey),user.id]),
    db.query(`SELECT id,data->>'assignmentId' AS "assignmentId",data->>'status' AS status,
      data->>'submittedAt' AS "submittedAt",data->>'updatedAt' AS "updatedAt",data->>'createdAt' AS "createdAt",
      data->>'manualScoreEntry'='true' AS "manualScoreEntry",data ? 'offlineMakeup' AS "offlineMakeup",
      CASE WHEN data#>>'{publishedGrade,total}' IS NOT NULL THEN jsonb_build_object('total',data#>'{publishedGrade,total}') END AS "publishedGrade"
      FROM ${table} WHERE kind='submission' AND data->>'studentId'=$1`,[user.id]),
  ]);
  const byWork=Map.groupBy(await effectiveZeros(submissions.rows,assignments.rows),s=>s.assignmentId);
  const pending=assignments.rows.filter(a=>!assignmentOpensLater(a,now)&&assignmentState(a,byWork.get(a.id)||[],now).key==='todo');
  // Upcoming deadlines, then the most recent eligible late work, then undated work.
  const rank=a=>!a.dueAt?2:Date.parse(a.dueAt)<now?1:0;
  pending.sort((a,b)=>rank(a)-rank(b)||(rank(a)===1?-1:1)*((Date.parse(a.dueAt)||0)-(Date.parse(b.dueAt)||0)));
  const a=pending[0];
  return a?{id:a.id,title:a.title,dueAt:a.dueAt}:null;
}
