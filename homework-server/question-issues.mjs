import {hash,now} from './store.mjs';
import {assert,boundedText} from './validation.mjs';
import {classKey,singleClassCourse} from '../homework/course-scope.js';
import {audienceClasses} from '../homework/assignment-audience.js';
const kind='student-question-issue';
const reasons=['缺少图表','选项不完整','题干看不清','其他问题'];
const key=(...parts)=>hash(JSON.stringify(parts));
const receipt=r=>r?{status:r.status,reason:r.reason,note:r.note,reply:r.reply||'',reportedVersion:r.reportedVersion||r.version,updatedVersion:r.updatedVersion||null}:null;

export function questionIssues(db,question){
  return async ctx=>{
    const {user,method,route,req}=ctx;
    if(user.role==='teacher'){
      assert(method==='GET'||method==='POST'&&['resolve','inspect'].includes(route[1]),'操作无效',405);
      const [classes,students,reports]=await Promise.all([ctx.availableClasses(),ctx.availableStudents(),db.list(kind)]);
      const roster=new Map(students.map(s=>[s.id,s]));
      const visible=reports.filter(r=>{
        const student=roster.get(r.studentId);
        return student&&classes.some(c=>r.classIds.includes(classKey(c.id))&&student.classIds?.some(id=>classKey(id)===classKey(c.id)));
      });
      if(method==='POST'){
        const b=await ctx.body(req),reply=boundedText(b.reply,280,'处理说明').trim();if(route[1]==='resolve')assert(reply,'请填写处理说明');
        const group=visible.filter(r=>r.group===b.group);assert(group.length,'未找到反馈',404);
        await db.tx(async c=>{for(const item of group){const row=await db.get(item.id,c);if(row&&row.status!=='resolved'){const bank=row.bankId&&await db.get(row.bankId,c);const updatedVersion=Number(bank?.version)>Number(row.reportedVersion)?bank.version:null;
            await db.put(kind,{...row,status:route[1]==='inspect'?'checking':'resolved',reply:reply||row.reply||'',updatedVersion,updatedAt:now()},c);}}},'question-issue-group:'+b.group);
        return {handled:true};
      }
      const groups=new Map();
      for(const r of visible){const g=groups.get(r.group)||{key:r.group,title:r.title,label:r.label,bankId:r.bankId,reasons:[],sources:new Set(),notes:new Set(),people:new Set(),open:0,unchecked:0,lastReply:'',replyAt:''};
        if(r.reply&&String(r.updatedAt||'')>=g.replyAt){g.lastReply=r.reply;g.replyAt=String(r.updatedAt||'');}
        g.people.add(r.studentId);g.sources.add(r.title+' · '+r.label);if(r.note?.trim())g.notes.add(r.note.trim());if(r.status==='open')g.unchecked++;if(r.status!=='resolved')g.open++;if(!g.reasons.includes(r.reason))g.reasons.push(r.reason);groups.set(r.group,g);}
      return {groups:[...groups.values()].map(({people,sources,notes,replyAt,...g})=>({...g,sources:[...sources],notes:[...notes],count:people.size})).sort((a,b)=>b.open-a.open)};
    }
    assert(user.role==='student'&&['POST','GET'].includes(method)&&!route[1],'仅限学生反馈',403);
    const b=method==='POST'?await ctx.body(req):Object.fromEntries(new URL(req.url,'http://local').searchParams);
    const source=b.source,version=String(b.version||1);assert(['assignment','mock'].includes(source),'题目来源无效');
    const {a,q,title,course}=await question(user,source,b.assignmentId,b.questionId,version);
    const bankId=q.libraryQuestionId||(source==='mock'?q.id:'');
    const group=bankId?key('bank',bankId,q.libraryVersion||q.version||version):key(source,a.id,q.id,version);
    const ident=kind+':'+key(user.id,source,a.id,version,q.id);
    if(method==='GET'){
      const record=await db.get(ident),item=receipt(record);
      if(record?.updatedVersion&&record.status==='resolved'){
        const bank=await db.get(record.bankId);
        if(bank?.status==='ready'&&Number(bank.version)===Number(record.updatedVersion))item.revision={id:record.id,images:bank.questionImages||[],prompt:bank.prompt||''};
      }
      return {item};
    }
    assert(reasons.includes(b.reason),'请选择原因');const note=boundedText(b.note,400,'说明');
    const classes=source==='mock'?(await ctx.availableClasses()).filter(c=>user.classIds?.some(id=>classKey(id)===classKey(c.id))&&(!singleClassCourse(c)||singleClassCourse(c)===course)).map(c=>c.id):audienceClasses(a,user);
    const index=(a.questions||a.rubric||[]).findIndex(x=>x.id===q.id);
    const reportedVersion=q.libraryVersion||q.version||version;
    const record=await db.tx(async c=>{
      const old=await db.get(ident,c);if(old)return old;
      const row={id:ident,group,studentId:user.id,classIds:classes.map(classKey),bankId,reportedVersion,title,label:'第 '+(index+1)+' 题',source,version,assignmentId:a.id,questionId:q.id,reason:b.reason,note,status:'open',createdAt:now()};
      await db.put(kind,row,c);return row;
    },ident);
    return {item:receipt(record)};
  };
}
