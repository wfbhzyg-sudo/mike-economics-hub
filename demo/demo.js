
const $=id=>document.getElementById(id);
let role='teacher', coaching=true, teacherStep=0,studentStep=0,published=false,choice='',submitted='',fixed=false;
const priorExamples=[];
const storageKey='mike:guided-demo:v1';
try{
 const saved=JSON.parse(sessionStorage.getItem(storageKey)||'null');
 if(saved)({role,coaching,teacherStep,studentStep,published,choice,submitted,fixed}=saved);
}catch{}
const reason='茶价上涨，消费者改买咖啡。在相同咖啡价格下，咖啡的需求量增加。';
const score=()=>submitted==='B'||fixed?1:0;
function persist(){try{sessionStorage.setItem(storageKey,JSON.stringify({role,coaching,teacherStep,studentStep,published,choice,submitted,fixed}));}catch{}}
const tasks={
teacher:[['选择示例作业','从这份单题练习开始，体验给班级布置作业。'],['发布给演示班','点击发布后，切换到学生身份就能收到这份作业。'],['打开班级提交','先看已交与未交。切换到学生完成提交后，这里的名单会同步更新。'],['查看题目诊断','在这一题的答题分布里找到需要回讲的知识点。']],
student:[['打开待完成作业','可以直接做预置练习，也可以接着完成刚刚由演示教师发布的作业。'],['选择答案并交卷','选择后可以改选。只有点击交卷才会计分。'],['查看原题','展开完整题目，对照自己的答案和知识点。'],['完成回顾','答错时可提交推理，体验验收与补分。']]}
function render(focus=false){
 persist();
 const t=role==='teacher',i=t?teacherStep:studentStep;const info=tasks[role][Math.min(i,3)];
 $('student').setAttribute('aria-pressed',String(!t));$('teacher').setAttribute('aria-pressed',String(t));
 $('guide').hidden=!coaching;$('workspace').classList.toggle('quiet',!coaching);$('toggle').textContent=coaching?'收起指引':'继续指引';$('toggle').setAttribute('aria-expanded',String(coaching));
 $('step').textContent=i<4?'任务 '+(i+1)+' / 4':'已完成';$('guideTitle').textContent=i<4?info[0]:'这一轮体验已完成';$('tip').textContent=i<4?info[1]:'切换身份，可以看到同一份作业的另一端。';
 $('kicker').textContent=t?'演示班 · 教师工作台':'演示学生 01 · 我的学习';
 const title='需求变化 · 随堂练习';const row=(name,value)=>'<div class="row"><b>'+name+'</b><span>'+value+'</span></div>';
 const btn=(label,id,enabled=true)=>'<button class="primary '+(coaching&&enabled?'aim':'')+'" id="'+id+'" '+(enabled?'':'disabled')+'>'+label+'</button>';
 let body='',heading='';
 if(t){if(i===0){heading='从题库布置作业';body=row(title,'<span class="chip">AP 微观 · 2.1</span>')+btn('选择这份练习','advance');}
 else if(i===1){heading='确认发布';body=row('布置给','微观演示班')+row('题目','1 道选择题')+btn('发布作业','advance');}
 else if(i===2){heading='作业已发布';body=row(title,'微观演示班')+row('本次提交',submitted?'1 / 1':'0 / 1')+btn('查看提交','advance');}
 else if(i===3){heading='学生提交';body=row('演示学生 01',submitted?(submitted==='B'?'已交 · 1 / 1':'已交 · '+score()+' / 1'):'未交')+btn('查看题目诊断','advance');}
 else{heading='题目诊断';body=row('需求曲线移动',submitted?(submitted==='B'?'正确率 100%':'正确率 0%'):'暂无作答')+row('计入成绩',submitted?score()+' / 1':'—')+row('订正补回',fixed?'+1 分':'0 分')+(priorExamples.some(x=>x.submitted)?row('此前预置练习',priorExamples.at(-1).submitted==='B'?'1 / 1':'0 / 1'):'')+btn('进入学生演示','switch');}}
 else{if(i===0){heading='待完成';body=row(title,published?'演示教师刚刚发布':'预置练习')+btn('开始作答','advance');}
 else if(i===1){heading='第 1 题';body='<p class="sheet">咖啡和茶是替代品。其他条件不变，当茶的价格上涨，咖啡的需求曲线会怎样变化？</p><div class="opts">'+['A　向左移动','B　向右移动','C　沿原曲线移动'].map(v=>'<button data-choice="'+v[0]+'" aria-pressed="'+(choice===v[0])+'">'+v+'</button>').join('')+'</div>'+btn('交卷','advance',!!choice);}
 else if(i===2){heading='作业成绩';body='<div class="result">'+(submitted==='B'?'1':'0')+' / 1</div>'+row(title,submitted==='B'?'已答对':'待订正')+btn('展开原题','advance');}
 else if(i===3){heading='原题与知识点';body='<p class="sheet">茶和咖啡是替代品。假设咖啡自身价格不变，茶涨价后，咖啡的需求曲线怎样移动？</p>'+row('我的首次选择',submitted)
   +(submitted==='B'?btn('完成回顾','advance'):'<label for="reason">订正理由</label><textarea id="reason" rows="3" maxlength="500"></textarea><button id="fill" type="button">填入示例推理</button> '+btn('提交验收','advance')+'<p id="receipt" role="status"></p>');}
 else{heading=submitted==='B'?'回顾完成':'订正通过';body=row('首次得分',(submitted==='B'?'1':'0')+' / 1')+row('订正补回',fixed?'+1 分':'0 分')+row('计入成绩',score()+' / 1')+btn(published?'查看教师端记录':'进入教师演示','switch');}}

 $('heading').textContent=heading;$('content').innerHTML=body;
 if($('fill'))$('fill').onclick=()=>{$('reason').value=reason;$('reason').focus();};
 const next=$('advance');if(next){next.style.marginTop='15px';next.onclick=()=>{if(t){if(i===1&&!published){if(studentStep>0)priorExamples.push({submitted,choice,fixed});studentStep=0;choice='';submitted='';fixed=false;published=true;}teacherStep++;}else{if(i===1)submitted=choice;if(i===3&&submitted!=='B'){
   const typed=$('reason').value.trim();
   if(typed!==reason){$('receipt').textContent='示例验收需要完整因果。可以点「填入示例推理」体验通过。';return;}
   fixed=true;
  }studentStep++;}render(true);};}
 if($('switch'))$('switch').onclick=()=>{role=t?'student':'teacher';if(!t&&published)teacherStep=4;render(true);};
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{choice=b.dataset.choice;render();document.querySelector('[data-choice="'+choice+'"]').focus();});
 alignGuide();
 if(focus){$('heading').focus({preventScroll:true});$('status').textContent=heading;}
}
function alignGuide(){
 const area=$('workspace'),note=$('guide'),target=document.querySelector('.work .aim')||document.querySelector('.work .opts')||$('heading');
 if(note.hidden||innerWidth<=680)return;
 const bounds=area.getBoundingClientRect(),r=target.getBoundingClientRect();
 const y=Math.min(bounds.height-note.offsetHeight-16,Math.max(18,r.top+r.height/2-bounds.top-23));
 area.style.setProperty('--anchor',Math.max(16,y)+'px');
 area.style.setProperty('--anchor-x',Math.min(bounds.width-note.offsetWidth-16,r.right-bounds.left+18)+'px');
}
window.addEventListener('resize',alignGuide);
['student','teacher'].forEach(k=>$(k).onclick=()=>{role=k;render(true);});$('toggle').onclick=()=>{coaching=!coaching;render();};render();

$('restart').onclick=()=>{role='teacher';coaching=true;teacherStep=0;studentStep=0;published=false;choice='';submitted='';fixed=false;priorExamples.length=0;render(true);};
$('exit').onclick=e=>{
 if(new URLSearchParams(location.search).get('from')==='portal'&&history.length>1){e.preventDefault();history.back();}
};
for(const task of document.querySelectorAll('[data-extra]')){
 task.addEventListener('input',event=>{
   const target=event.target;
   if(!target.matches('textarea,input'))return;
   const key=storageKey+':'+task.dataset.extra;
   try{sessionStorage.setItem(key,target.value);}catch{}
 });
 task.addEventListener('click',event=>{
   const button=event.target.closest('button');if(!button)return;
   task.querySelector('[role=status]').textContent=button.dataset.result;
 });
 const field=task.querySelector('textarea,input');
 if(field)try{field.value=sessionStorage.getItem(storageKey+':'+task.dataset.extra)||'';}catch{}
}
