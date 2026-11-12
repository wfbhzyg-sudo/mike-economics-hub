import {assignmentRecords,gradeSummary} from './learning-model.js';
export const rateOf=g=>g?.maxPoints>0&&Number.isFinite(g.total)?Math.round(g.total/g.maxPoints*1000)/10:null;
export const workDate=a=>a.dueAt||a.createdAt||'';
export function visibleAssignments(data){const used=new Set(data.submissions.filter(s=>s.status!=='draft').map(s=>s.assignmentId));return data.assignments.filter(a=>(a.published!==false&&!a.deletedAt)||used.has(a.id)).sort((a,b)=>workDate(a).localeCompare(workDate(b))||a.id.localeCompare(b.id));}
export function cellFor(a,student,record,time=Date.now()){
 const rate=rateOf(record?.grade),latest=record?.latest,required=a.audience?.required??a.audience?.students?.some(u=>u.id===student.id),inClass=student.classIds?.some(c=>a.classIds?.includes(c)),known=a.audience?.confirmedAt;
 let status,label;if(rate!==null){status='graded';label=rate+'%';}
 else if(latest){status=['needs_review','returned','failed'].includes(latest.status)?'attention':'pending';label=status==='attention'?'待处理':'待批阅';}
 else if(required){status=a.dueAt&&Date.parse(a.dueAt)<time?'missing':'todo';label=status==='missing'?'未交':'待完成';}
 else if(inClass&&!a.deletedAt){status='unconfirmed';label='待确认';}
 else{status='unassigned';label='—';}
 return {assignment:a,student,record,rate,status,label,required:Boolean(required),audienceKnown:Boolean(known),pendingUpdate:Boolean(record?.pendingUpdate),late:Boolean(latest?.late)};
}
export function cellsFor(data,student,assignments=visibleAssignments(data)){const map=new Map(assignmentRecords(data.submissions.filter(s=>s.studentId===student.id),data.assignments).map(r=>[r.assignmentId,r]));return assignments.map(a=>cellFor(a,student,map.get(a.id)));}
export function cellSummary(cells){return gradeSummary(cells.map(c=>c.record).filter(Boolean));}
export function progressChange(cells){const rates=cells.filter(c=>c.rate!==null).map(c=>c.rate);if(rates.length<6)return null;return Math.round((rates.slice(-3).reduce((a,b)=>a+b,0)-rates.slice(-6,-3).reduce((a,b)=>a+b,0))/3*10)/10;}
export function timeRange(mode,from='',to='',now=new Date()){
 const y=now.getFullYear(),m=now.getMonth()+1,iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 if(mode==='term')return m>=8?{from:`${y}-08-01`,to:`${y+1}-01-31`}:m===1?{from:`${y-1}-08-01`,to:`${y}-01-31`}:{from:`${y}-02-01`,to:`${y}-07-31`};
 if(mode==='month'){const d=new Date(now);d.setDate(d.getDate()-29);return {from:iso(d),to:iso(now)};}
 return mode==='custom'?{from,to}:{from:'',to:''};
}
export function inRange(a,range){const stamp=Date.parse(workDate(a));if(!Number.isFinite(stamp))return !range.from&&!range.to;return (!range.from||stamp>=Date.parse(range.from+'T00:00:00'))&&(!range.to||stamp<=Date.parse(range.to+'T23:59:59.999'));}
export function csvValue(v){let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function gradeCSV(rows,assignments,data){const header=['学号/账号','姓名','作业ID','作业','状态','得分','满分','得分率','课堂AP参考','成绩版本','发布时间'];const records=[header];for(const student of rows)for(const cell of cellsFor(data,student,assignments)){const g=cell.record?.grade;records.push([student.username||'',student.name,cell.assignment.id,cell.assignment.title,cell.status==='graded'?(cell.pendingUpdate?'已出分，新版本待更新':'已出分'):cell.label,g?.total??'',g?.maxPoints??'',cell.rate??'',cell.rate===null?'':Math.min(5,Math.floor(cell.rate/20)+1),g?(g.revision||1):'',g?.publishedAt||'']);}return '\uFEFF'+records.map(r=>r.map(csvValue).join(',')).join('\r\n');}
