import {classKey} from '../homework/course-scope.js';
import {audienceSql} from './assignment-audience.mjs';
import pg from "pg";
import {
  randomUUID,
  randomBytes,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
export const id = () => randomUUID();
export const token = () => randomBytes(32).toString("base64url");
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const now = () => new Date().toISOString();
export function submissionTimeAfter(previous) {
  const last=Date.parse(previous?.submittedAt || previous?.createdAt);
  return new Date(Number.isFinite(last) ? Math.max(Date.now(),last+1) : Date.now()).toISOString();
}
export function passwordHash(value) {
  const salt = token();
  return `${salt}:${scryptSync(value, salt, 64).toString("hex")}`;
}
export function passwordMatches(value, encoded) {
  try {
    const [salt, expected] = encoded.split(":");
    return timingSafeEqual(
      scryptSync(value, salt, 64),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}
export function createStore(connectionString, schema = "homework") {
  if (!/^[a-z][a-z0-9_]*$/.test(schema))
    throw new Error("Invalid database schema");
  // Keep a bounded connection budget while allowing simultaneous classroom
  // saves to progress during network waits. Scope locks still serialize retries.
  const requestedPoolMax=Number(process.env.HOMEWORK_DB_POOL_MAX || 16);
  const pool = new pg.Pool({
    connectionString,
    ...(process.env.HOMEWORK_DB_TLS_CERT ? {ssl:{
      ca:Buffer.from(process.env.HOMEWORK_DB_TLS_CERT,'base64').toString(),
      rejectUnauthorized:true,
      checkServerIdentity:(_host,cert)=>cert.fingerprint256===process.env.HOMEWORK_DB_TLS_FINGERPRINT?undefined:new Error('Database TLS certificate changed; connection refused'),
    }} : {}),
    max: Number.isInteger(requestedPoolMax) && requestedPoolMax > 0
      ? Math.min(32, requestedPoolMax) : 16,
    connectionTimeoutMillis: 10000,
  });
  const table = `${schema}.records`,
    jobs = `${schema}.jobs`;
  const query = (sql, params = []) => pool.query(sql, params);
  // Only old online work needs the original confirmation timestamp.
  const firstPublicationJoin = `LEFT JOIN ${table} v ON v.id = a.id || ':v1' AND v.kind='answer-version'
    AND a.data->>'published'='true' AND a.data->>'publishedAt' IS NULL
    AND a.data->>'offline' IS DISTINCT FROM 'true' AND a.data->>'format' IS DISTINCT FROM 'score'`;
  const withPublication = ({data, first_publication}) =>
    first_publication ? {...data, publishedAt: first_publication} : data;
  const api = {
    pool,
    query,
    table,
    jobs,
    async get(key, client = pool) {
      return (
        await client.query(`SELECT data FROM ${table} WHERE id=$1`, [key])
      ).rows[0]?.data;
    },
    async getMany(keys, client = pool) {
      if (!keys.length) return [];
      return (await client.query(`SELECT data FROM ${table} WHERE id=ANY($1::text[])`, [[...new Set(keys)]]))
        .rows.map((row) => row.data);
    },
    async latestReceipt({studentId,assignmentId}, client = pool) {
      // Retry eligibility does not need answer snapshots, attachments, or older attempts.
      const {rows}=await client.query(`SELECT jsonb_build_object(
        'id',id,'assignmentId',data->'assignmentId','status',data->'status',
        'submittedAt',data->'submittedAt','createdAt',data->'createdAt',
        'manualScoreEntry',data->'manualScoreEntry','offlineMakeup',data->'offlineMakeup',
        'publishedGrade',CASE WHEN jsonb_typeof(data->'publishedGrade')='object' THEN
          jsonb_build_object('total',data#>'{publishedGrade,total}','maxPoints',data#>'{publishedGrade,maxPoints}') END
        ) AS receipt FROM ${table}
        WHERE kind='submission' AND data->>'studentId'=$1 AND data->>'assignmentId'=$2 AND data->>'status'<>'draft'
        ORDER BY COALESCE(data->>'submittedAt',data->>'createdAt','') DESC,id DESC LIMIT 1`,[studentId,assignmentId]);
      return rows.map(r=>r.receipt);
    },
    async teacherAssignments(teacherId, trash) {
      const {rows} = await pool.query(`SELECT a.data, v.data->>'confirmedAt' AS first_publication
        FROM ${table} a ${firstPublicationJoin}
        WHERE a.kind='assignment' AND a.data->>'teacherId'=$1
          AND (a.data->>'deletedAt' IS NOT NULL)=$2
        ORDER BY a.created DESC, a.id`, [teacherId, trash]);
      return rows.map(withPublication);
    },
    async studentAssignments(student, client=pool) {
      const classIds = [...new Set((student.classIds || []).map(classKey))];
      if (!classIds.length) return [];
      const storedIds = classIds.flatMap(key => [key, 'bookself-class:' + key]);
      const {rows} = await client.query(`SELECT a.data, v.data->>'confirmedAt' AS first_publication
        FROM ${table} a ${firstPublicationJoin}
        WHERE a.kind='assignment' AND a.data->>'published'='true' AND a.data->>'deletedAt' IS NULL
          AND a.data->'classIds' ?| $1::text[] AND ${audienceSql('$2','$3','a.data')}
        ORDER BY a.created DESC, a.id`, [storedIds, classIds, student.id]);
      return rows.map(withPublication);
    },
    async scheduledRecallQuestions(student, client=pool) {
      const classes=[...new Set((student.classIds||[]).map(classKey))];
      if(!classes.length)return [];
      const {rows}=await client.query(`SELECT a.data->'rubric' AS rubric, a.data->'draftRubric' AS draft
        FROM ${table} a WHERE a.kind='assignment' AND a.data->>'published' IS DISTINCT FROM 'true'
        AND a.data->>'deletedAt' IS NULL AND a.data->>'opensAt' IS NOT NULL
        AND a.data->'classIds' ?| $1::text[] AND ${audienceSql('$2','$3','a.data')}`,
        [classes.flatMap(id=>[id,'bookself-class:'+id]),classes,student.id]);
      return rows.flatMap(row=>[...(row.rubric||[]),...(row.draft||[])]);
    },
    async teacherWorklist(teacherId) {
      const {rows}=await pool.query(`SELECT jsonb_build_object(
        'id',s.id,'assignmentId',s.data->'assignmentId','studentId',s.data->'studentId',
        'studentName',COALESCE(s.data->'studentName',u.data->'name'),'classIds',s.data->'classIds',
        'status',s.data->'status','submittedAt',s.data->'submittedAt','createdAt',s.data->'createdAt',
        'manualScoreEntry',s.data->'manualScoreEntry','offlineMakeup',s.data->'offlineMakeup','version',s.data->'version',
        'reviewRequests',CASE WHEN s.data->'reviewRequests' @> '[{"status":"open"}]'::jsonb THEN '[{"status":"open"}]'::jsonb ELSE '[]'::jsonb END,
        'publishedGrade',CASE WHEN jsonb_typeof(s.data->'publishedGrade')='object' THEN jsonb_build_object(
          'total',s.data#>'{publishedGrade,total}','maxPoints',s.data#>'{publishedGrade,maxPoints}') END
      ) AS item FROM ${table} a JOIN ${table} s ON s.kind='submission' AND s.data->>'assignmentId'=a.id
      LEFT JOIN ${table} u ON u.id=s.data->>'studentId' AND u.kind='user'
      WHERE a.kind='assignment' AND a.data->>'teacherId'=$1 AND a.data->>'deletedAt' IS NULL`,[teacherId]);
      return rows.map(row=>row.item);
    },
    async reportSubmittedMocks(studentId){
      const {rows}=await pool.query(`SELECT id,data->>'studentId' AS "studentId",data->'classIds' AS "classIds",
        data->>'course' AS course,data->>'submittedAt' AS "submittedAt",jsonb_build_object('total',data#>'{result,total}',
        'maxPoints',data#>'{result,maxPoints}','durationSeconds',data#>'{result,durationSeconds}') AS result
        FROM ${table} WHERE kind='self-practice-attempt' AND data->>'studentId'=$1 AND data->>'status'='submitted'
        AND jsonb_typeof(data#>'{result,questions}')='array' AND data#>'{result,questions}'<>'[]'::jsonb`,[studentId]);
      return rows;
    },
    async reportCatalog(){
      const {rows}=await pool.query(`SELECT id, (SELECT jsonb_agg(jsonb_build_object('id',t->'id','name',t->'name','title',t->'title'))
        FROM jsonb_array_elements(COALESCE(data->'topics','[]')) t) AS topics FROM ${table} WHERE kind='library-unit'`);
      return rows;
    },
    async reportQuestionRefs(ids){
      if(!ids.length)return [];
      const {rows}=await pool.query(`SELECT id,data->>'skill' AS skill,data->>'topic' AS topic,data->>'unitId' AS "unitId",
        data->'version' AS version FROM ${table} WHERE kind='library-question' AND id=ANY($1::text[])`,[[...new Set(ids)]]);
      return rows;
    },
    async reportExamRows(ids){
      if(!ids.length)return [];
      // Use grade snapshots on the server. Select only scalar evidence, never whole answer sheets.
      const {rows}=await pool.query(`WITH attempts AS (
        SELECT s.id,s.data,s.data->>'assignmentId' AS assignment,s.data->>'studentId' AS person,
          COALESCE(s.data->>'submittedAt',s.data->>'createdAt') AS stamp,
          first_value(coalesce(s.data#>>'{publishedGrade,absent}','false')) OVER (
            PARTITION BY s.data->>'assignmentId',s.data->>'studentId'
            ORDER BY COALESCE(s.data->>'submittedAt',s.data->>'createdAt') DESC,s.id DESC) AS latest_absent
        FROM ${table} s WHERE s.kind='submission' AND s.data->>'assignmentId'=ANY($1::text[])
        AND s.data->>'status' NOT IN ('draft','returned') AND jsonb_typeof(s.data->'publishedGrade')='object'
      )
      SELECT assignment,person,data->'classIds' AS classes,
        COALESCE(data#>'{offlineEvidence,total}',initial.g#>'{scoreSources,original}',initial.g#>'{scoreSources,first}',initial.g->'total',
                 data#>'{publishedGrade,scoreSources,original}',data#>'{publishedGrade,scoreSources,first}',data#>'{publishedGrade,total}') AS score,
        COALESCE(data#>'{offlineEvidence,maxPoints}',initial.g->'maxPoints',data#>'{publishedGrade,maxPoints}') AS max
      FROM attempts LEFT JOIN LATERAL (
        SELECT g FROM jsonb_array_elements(COALESCE(NULLIF(data->'gradeHistory','null'),'[]')) WITH ORDINALITY AS h(g,n)
        WHERE jsonb_typeof(g->'total')='number' AND g->>'absent' IS DISTINCT FROM 'true' ORDER BY n LIMIT 1
      ) initial ON TRUE
      WHERE latest_absent<>'true' AND jsonb_typeof(data#>'{publishedGrade,total}')='number'
        AND data#>>'{publishedGrade,absent}' IS DISTINCT FROM 'true' ORDER BY stamp,id`,[ids]);
      return rows;
    },
    async reportAssignments(teacherId, studentId, classIds, submittedIds) {
      // Return assignment metadata and this student's snapshot only. Rubrics, files and class rosters can be large.
      const result = await pool.query(`SELECT jsonb_build_object(
          'id', a.id, 'title', data->'title', 'published', true, 'classIds', data->'classIds',
          'course', data->'course', 'libraryUnit', data->'libraryUnit', 'libraryCourse', data->'libraryCourse',
          'libraryUnits', data->'libraryUnits', 'librarySourceUnit', data->'librarySourceUnit',
          'offline', data->'offline', 'format', data->'format', 'assessmentType', data->'assessmentType', 'assessmentMode', data->'assessmentMode',
          'offlineType', data->'offlineType', 'libraryCollection', data->'libraryCollection', 'performanceTransfer', data->'performanceTransfer',
          'opensAt', data->'opensAt', 'createdAt', data->'createdAt', 'dueAt', data->'dueAt',
          'recipient', snapshot.person) AS work
        FROM ${table} a LEFT JOIN LATERAL (
          SELECT person FROM jsonb_array_elements(CASE WHEN jsonb_typeof(data#>'{recipients,students}')='array' THEN data#>'{recipients,students}' ELSE '[]'::jsonb END) person WHERE person->>'id'=$2 LIMIT 1
        ) snapshot ON true
        WHERE kind='assignment' AND ($1::text IS NULL OR data->>'teacherId'=$1) AND data->>'published'='true' AND data->>'deletedAt' IS NULL
          AND ((data->'classIds' ?| $3::text[] AND ${audienceSql('$5','$2')}) OR a.id=ANY($4::text[]) OR snapshot.person IS NOT NULL)`,
        [teacherId, studentId, classIds, submittedIds, [...new Set(classIds.map(id=>id.replace(/^bookself-class:/,'')))]]);
      return result.rows.map(row => row.work);
    },
    async submissionsForTeacherStudent(teacherId, studentId, client = pool) {
      const result=await client.query(`SELECT s.data FROM ${table} s
        JOIN ${table} a ON a.id=s.data->>'assignmentId' AND a.kind='assignment'
        WHERE s.kind='submission' AND s.data->>'studentId'=$1
        AND ($2::text IS NULL OR a.data->>'teacherId'=$2) AND a.data->>'published'='true'
        AND a.data->>'deletedAt' IS NULL AND s.data->>'status' IS DISTINCT FROM 'draft'
        ORDER BY s.created DESC`,[studentId,teacherId]);
      return result.rows.map(row=>row.data);
    },
    async list(kind, client = pool, unitId) {
      return (
        await client.query(
          `SELECT data FROM ${table} WHERE kind=$1 ${unitId ? "AND data->>'unitId'=$2" : ""} ORDER BY created DESC`,
          unitId ? [kind, unitId] : [kind],
        )
      ).rows.map((r) => r.data);
    },
    // Filter before transferring JSON (rubrics and paper snapshots can be large).
    async find(kind, filters, client = pool) {
      const allowed = new Set(['studentId','assignmentId','submissionId','owner','teacherId','unitId','version','status','threadKey','postId','classId']);
      const values = [kind], clauses = ['kind=$1'];
      for (const [field, value] of Object.entries(filters)) {
        if (!allowed.has(field)) throw new Error('Invalid record filter');
        values.push(Array.isArray(value) ? value.map(String) : String(value));
        clauses.push(`data->>'${field}' ${Array.isArray(value) ? '=ANY($'+values.length+'::text[])' : '=$'+values.length}`);
      }
      return (await client.query(`SELECT data FROM ${table} WHERE ${clauses.join(' AND ')} ORDER BY created DESC`, values)).rows.map(r=>r.data);
    },
    async put(kind, data, client = pool) {
      await client.query(
        `INSERT INTO ${table}(id,kind,data) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data WHERE ${table}.kind=EXCLUDED.kind`,
        [data.id, kind, data],
      );
      return data;
    },
    async remove(key, client = pool) {
      await client.query(`DELETE FROM ${table} WHERE id=$1`, [key]);
    },
    async tx(fn, scope) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        // Scoped student writes can run together. Existing global transactions
        // (publishing, regrading, deletion) still exclude ALL scoped writes.
        await client.query(scope ? 'SELECT pg_advisory_xact_lock_shared(hashtext($1))' : 'SELECT pg_advisory_xact_lock(hashtext($1))', [schema]);
        if (scope) await client.query('SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))', [schema, scope]);
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    },
    async init() {
      await query(
        `CREATE SCHEMA IF NOT EXISTS ${schema}; CREATE TABLE IF NOT EXISTS ${table}(id text PRIMARY KEY,kind text NOT NULL,data jsonb NOT NULL,created timestamptz NOT NULL DEFAULT now()); CREATE INDEX IF NOT EXISTS records_kind ON ${table}(kind); CREATE TABLE IF NOT EXISTS ${jobs}(id text PRIMARY KEY,kind text NOT NULL,target text NOT NULL,payload jsonb NOT NULL,status text NOT NULL DEFAULT 'queued',lease text,lease_until timestamptz,attempts integer NOT NULL DEFAULT 0,created timestamptz NOT NULL DEFAULT now(),finished timestamptz,result jsonb,error text); CREATE INDEX IF NOT EXISTS jobs_queue ON ${jobs}(status,created);`,
      );
      for (const field of ['studentId','assignmentId','owner','teacherId','unitId','threadKey','postId','classId']) {
        // CONCURRENTLY avoids blocking class saves during a rolling release.
        await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS records_scope_${field.toLowerCase()} ON ${table}(kind,(data->>'${field}'))`);
      }
      if (process.env.HOMEWORK_TEACHER_PASSWORD)
        await api.tx(async (c) => {
          if (!(await api.list("user", c)).some((u) => u.role === "teacher"))
            await api.put(
              "user",
              {
                id: id(),
                role: "teacher",
                username: "mike",
                name: "Mike",
                password: passwordHash(process.env.HOMEWORK_TEACHER_PASSWORD),
                createdAt: now(),
              },
              c,
            );
        });
      if (process.env.HOMEWORK_WORKER_SECRET && !(await api.get("device")))
        await api.put("device", {
          id: "device",
          name: "Mike 的 MacBook Pro",
          secretHash: hash(process.env.HOMEWORK_WORKER_SECRET),
          lastSeen: null,
          revoked: false,
        });
      if (!(await api.get("model-settings")))
        await api.put("settings", {
          id: "model-settings",
          provider: "ollama",
          baseUrl: "http://127.0.0.1:11434",
          model: "qwen3-vl:8b-instruct",
        });
    },
    async enqueue(kind, target, payload, c = pool) {
      const jobId = id();
      await c.query(
        `INSERT INTO ${jobs}(id,kind,target,payload) VALUES($1,$2,$3,$4)`,
        [jobId, kind, target, payload],
      );
      return jobId;
    },
    async audit(actor, action, target, c = pool) {
      await api.put("audit", { id: id(), actor, action, target, at: now() }, c);
    },
  };
  return api;
}
