import {readBody} from './homework-server/files.mjs';
const allowed=new Map([
 ['teacher/workspace/routes',['GET']],
 ['teacher/workspace',['GET']],['teacher/workspace/class',['PATCH']],['teacher/workspace/questions',['GET']],['teacher/workspace/review-log',['GET']],['teacher/workspace/student',['GET']],['teacher/workspace/audit',['GET']],
 ['teacher/classes',['GET','POST','PATCH']],['teacher/students',['PATCH','DELETE']],['teacher/performance',['GET']],['teacher/inbox',['GET']],['teacher/feedback',['PATCH']],['teacher/question',['GET']],['teacher/reviews',['POST']],
 ['quest/content-review',['GET']],['quest/assignments',['POST']],['quest/learning/diagnostics',['GET']],['quest/learning/task-preview',['GET']],['quest/learning/assign',['POST']],['quest/learning/feedback',['PUT']],['quest/learning/cooperation',['GET','POST']],
]);
export const teacherRouteAllowed=(path,method)=>allowed.get(path)?.includes(method)===true;
export function createTeacherGateway(auth,env=process.env,request=fetch){
  const json=(res,status,data)=>res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(data));
  return async(req,res)=>{
    const u=new URL(req.url,'http://local');if(!u.pathname.startsWith('/api/teacher-portal/'))return false;
    try{
      auth.checkOrigin(req,auth.portalOrigin);
      const user=await auth.session(req);if(!user){json(res,401,{error:'请先登录'});return true;}
      if(user.role!=='teacher'){json(res,403,{error:'此功能仅供教师使用'});return true;}
      if(req.method!=='GET'&&req.headers['x-csrf-token']!==auth.csrf(req)){json(res,403,{error:'登录状态已更新，请刷新后重试'});return true;}
      const route=u.pathname.slice('/api/teacher-portal/core/'.length);
      if(!u.pathname.startsWith('/api/teacher-portal/core/')||!teacherRouteAllowed(route,req.method)){json(res,404,{error:'没有这个教师操作'});return true;}
      if(route==='quest/learning/cooperation'&&req.method==='GET')u.searchParams.set('readonly','1');
      const destination=new URL('/api/'+route+(u.searchParams.size?'?'+u.searchParams:''),env.CORE_INTERNAL_ORIGIN||auth.coreOrigin);
      const body=req.method==='GET'?undefined:await readBody(req,50000);
      const upstream=await request(destination,{method:req.method,headers:{'Content-Type':'application/json','X-Mike-Teacher-Workspace':'1','Host':new URL(auth.coreOrigin).host,'Origin':auth.coreOrigin,'Cookie':auth.cookieName+'='+auth.token(req),'X-Real-IP':String(req.headers['x-real-ip']||req.socket.remoteAddress||'')},body,redirect:'manual',signal:AbortSignal.timeout(20000)});
      if(!upstream.headers.get('content-type')?.includes('application/json'))throw Error('Invalid upstream response');
      const result=await upstream.json();json(res,upstream.status,result);
    }catch(e){json(res,e.status||503,{error:e.status?e.message:'教材与游戏服务暂时无法连接，请重试。已保存的教学记录不会丢失。'});}
    return true;
  };
}
