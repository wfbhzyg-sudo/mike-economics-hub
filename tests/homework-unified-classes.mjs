// Integration acceptance against the isolated two-database QA environment.
// Run: HOMEWORK_CLASS_QA_CONFIG=/absolute/private/config.json node tests/homework-unified-classes.mjs
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
const cfg=JSON.parse(await fs.readFile(process.env.HOMEWORK_CLASS_QA_CONFIG));
for(const url of [cfg.identity,cfg.homework])assert(new URL(url).searchParams.get('host')?.startsWith('/tmp/mike-hw-qa-'),'Only isolated QA databases are permitted');
for(const url of [cfg.portalOrigin,cfg.coreOrigin])assert(['localhost','127.0.0.1'].includes(new URL(url).hostname));
const saved=JSON.parse(await fs.readFile(cfg.qa+'/browser-sessions.json'));
const teachers=saved.clients.slice(0,2),identity=new pg.Pool({connectionString:cfg.identity}),hw=new pg.Pool({connectionString:cfg.homework});
const report={scope:'Synthetic registrations and real shared roster; no production data',checks:[]};
const outfile=process.env.HOMEWORK_CLASS_QA_REPORT||cfg.qa+'/shared-classes-report.json';
async function call(client,path,method='GET',body,expected=200,core=false){
 const r=await fetch((core?cfg.coreOrigin:cfg.portalOrigin)+path,{method,headers:{Cookie:client?.cookie||'',Origin:core?cfg.coreOrigin:cfg.portalOrigin,'X-CSRF-Token':client?.csrf||'','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await r.json();assert.equal(r.status,expected,path+' '+(data.error||''));
 return {data,cookie:r.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ')};
}
async function api(c,path,method='GET',body,status=200){return (await call(c,'/api/homework/'+path,method,body,status)).data;}
async function check(name,fn){await fn();report.checks.push({name,passed:true});console.log('PASS',name);}
async function fixtureClass(teacher,name,prefixes){
 const classes=(await call(teacher,'/api/teacher/classes','GET',undefined,200,true)).data.classes;
 const found=classes.find(c=>prefixes.some(prefix=>c.name.startsWith(prefix)));
 if(found)return (await call(teacher,'/api/teacher/classes','PATCH',{id:found.id,name},200,true)).data.classroom;
 return (await call(teacher,'/api/teacher/classes','POST',{name},201,true)).data.classroom;
}
const snapshot=()=>hw.query("SELECT id,kind,data FROM homework.records WHERE kind='class' ORDER BY id").then(r=>JSON.stringify(r.rows));
const legacyBefore=await snapshot(),suffix=randomUUID().slice(0,6);
let a,b,other,student,studentId,work,submission;
try{
 await check('Teachers see only their original Bookself classes, including same-name classes',async()=>{
  a=await fixtureClass(teachers[0],'共享测试 '+suffix,['共享测试 ','已更新班名 ']);
  b=await fixtureClass(teachers[0],'转班目标 '+suffix,['转班目标 ']);
  other=await fixtureClass(teachers[1],a.name,['共享测试 ']);
  const mine=(await api(teachers[0],'classes')).classes;
  assert(mine.some(c=>c.id==='bookself-class:'+a.id&&c.invite===a.code));
  assert(!mine.some(c=>c.id==='bookself-class:'+other.id));
 });
 await check('A real registration with a class code opens homework in that class without another join',async()=>{
  const registered=await call(null,'/api/portal/register','POST',{username:'classqa_'+suffix,name:'注册班级测试',password:cfg.password,classCode:a.code,consent:true},201);
  studentId=registered.data.user.id;student={cookie:registered.cookie};
  const me=await api(student,'me');student.csrf=me.csrf;
  assert.deepEqual(me.user.classIds,['bookself-class:'+a.id]);
  const classes=(await api(student,'classes')).classes;assert.deepEqual(classes,[{id:'bookself-class:'+a.id,name:a.name}]);
  await fs.writeFile(cfg.qa+'/shared-class-browser.json',JSON.stringify({student,teacher:teachers[0],a,b,studentId}),{mode:0o600});
 });
 await check('Duplicate homework create/join endpoints are blocked for unified accounts',async()=>{
  await api(teachers[0],'classes','POST',{name:'Must not create'},409);
  await api(student,'join','POST',{invite:a.code},409);
 });
 await check('An incorrect legacy credential does not invalidate the valid Bookself session',async()=>{
  await api(teachers[0],'link-account','POST',{username:'nonexistent_legacy_'+suffix,password:'incorrect-password'},403);
  assert.equal((await api(teachers[0],'me')).user.role,'teacher');
 });
 await check('Teacher publishes to the registered class; another teacher cannot target it',async()=>{
  await api(teachers[1],'assignments','POST',{title:'Wrong scope',classIds:['bookself-class:'+a.id]},400);
  work=(await api(teachers[0],'assignments','POST',{title:'注册后直接提交 '+suffix,classIds:['bookself-class:'+a.id]},201)).assignment;
  await api(teachers[0],'assignments/'+work.id+'/confirm','POST',{sourceRevision:0,questions:[{id:'1',prompt:'2+2?',answer:'4',criteria:'1 point for 4.',maxPoints:1}]});
  assert((await api(student,'assignments')).assignments.some(x=>x.id===work.id));
  await api(teachers[1],'assignments/'+work.id,'GET',undefined,403);
 });
 await check('Student submits directly and only their teacher can review the saved work',async()=>{
  submission=(await api(student,'submissions','POST',{assignmentId:work.id,clientId:'class-sync-'+suffix,text:'1. 4',files:[]},201)).submission;
  assert.equal((await api(teachers[0],'submissions/'+submission.id)).submission.text,'1. 4');
  await api(teachers[1],'submissions/'+submission.id,'GET',undefined,403);
 });
 await check('Renaming a class keeps its ID and assignments and is visible immediately',async()=>{
  await call(teachers[0],'/api/teacher/classes','PATCH',{id:a.id,name:'已更新班名 '+suffix},200,true);
  const c=(await api(student,'classes')).classes;assert.equal(c[0].name,'已更新班名 '+suffix);assert.equal(c[0].id,'bookself-class:'+a.id);
  assert((await api(student,'assignments')).assignments.some(x=>x.id===work.id));
 });
 await check('Transfer updates access without logging out and preserves original submission and learning state',async()=>{
  const progress=await identity.query('SELECT state,revision FROM econquest.account_progress WHERE user_id=$1',[studentId]);
  const before=JSON.stringify(progress.rows);
  await call(teachers[0],'/api/teacher/students','PATCH',{classId:a.id,studentId,targetClassId:b.id,confirm:true},200,true);
  assert.deepEqual((await api(student,'me')).user.classIds,['bookself-class:'+b.id]);
  assert(!(await api(student,'assignments')).assignments.some(x=>x.id===work.id));
  await api(student,'assignments/'+work.id,'GET',undefined,403);
  assert.equal((await api(student,'submissions/'+submission.id)).submission.text,'1. 4');
  assert.equal(JSON.stringify((await identity.query('SELECT state,revision FROM econquest.account_progress WHERE user_id=$1',[studentId])).rows),before);
 });
 await check('A removed membership does not retain old-class access; original homework classes remain unchanged',async()=>{
  await call(student,'/api/account/class','DELETE',undefined,200,true);
  assert.deepEqual((await api(student,'classes')).classes,[]);
  assert.deepEqual((await api(student,'me')).user.classIds,[]);
  assert.equal(await snapshot(),legacyBefore);
  // Restore only the synthetic student's original class for browser acceptance.
  await call(student,'/api/account/class','POST',{classCode:a.code,consent:true},200,true);
  const persisted=(await hw.query('SELECT data FROM homework.records WHERE id=$1',['bookself:'+studentId])).rows[0].data;
  assert.deepEqual(persisted.classIds,[],'Shared membership must not be copied into a stale local roster');
 });
 report.passed=true;
}catch(e){report.passed=false;report.error=e.message;process.exitCode=1;console.error(e.message);}
finally{await Promise.all([identity.end(),hw.end()]);await fs.writeFile(outfile,JSON.stringify(report,null,2));}
