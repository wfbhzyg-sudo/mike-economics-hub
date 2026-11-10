const menu=document.createElement('details');menu.className='portal-account';
const summary=document.createElement('summary');summary.textContent='账户';menu.append(summary);
const content=document.createElement('div');content.className='portal-account-menu';
const name=document.createElement('span');name.className='portal-user-name';content.append(name);
for(const [label,url] of [['修改密码','/?account=password'],['作业账户与班级','/homework/#account']]){const a=document.createElement('a');a.href=url;a.textContent=label;content.append(a);}
const logout=document.createElement('button');logout.type='button';logout.textContent='退出登录';content.append(logout);menu.append(content);document.body.append(menu);
const retry=document.createElement('button');retry.type='button';retry.textContent='重新连接';retry.hidden=true;content.append(retry);name.setAttribute('role','status');
let csrf='',checking=false;
async function check(){if(checking)return;checking=true;retry.disabled=true;retry.textContent='正在连接…';try{const r=await fetch('/api/portal/session',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const s=await r.json();if(!s.user){document.body.hidden=true;location.replace('/');return;}csrf=s.csrf;name.textContent=s.user.name;summary.textContent=s.user.name;summary.setAttribute('aria-label',s.user.name+'的账户');retry.hidden=true;logout.disabled=false;}catch{summary.textContent='账户';summary.setAttribute('aria-label','账户，连接暂不可用');menu.open=true;name.textContent='账号服务暂时不可用，请重新连接';retry.hidden=false;logout.disabled=true;}finally{checking=false;retry.disabled=false;retry.textContent='重新连接';}}
retry.onclick=check;
logout.onclick=async()=>{logout.disabled=true;try{const r=await fetch('/api/portal/logout',{method:'POST',headers:{'X-CSRF-Token':csrf}});if(!r.ok)throw Error();location.replace('/');}catch{name.textContent='退出失败，请重试';logout.disabled=false;}};
document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false;});document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;summary.focus();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});window.addEventListener('pageshow',e=>{if(e.persisted)check();});check();
