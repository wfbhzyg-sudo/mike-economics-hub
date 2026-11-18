// Newest first. Roles determine which illustrated improvements each reader sees.
export const releases = [{
  id:'2026-11-18-shared-teaching',date:'2026-11-18',title:'教师共用教学资源',
  items:[
    {audience:'teacher',art:'book',title:'教学包与题库对教师开放',text:'所有教师可查看共用教学资料、选题组卷，以及向自己的班级开放资料。'},
    {audience:'teacher',art:'roster',title:'线下作业显示录分状态',text:'作业管理和成绩名单按已录分与待录分显示，0 分计为已录分。'}
  ]
},{
  id:'2026-11-18-study-workflow', date:'2026-11-18', title:'逐题收藏、交流与复习',
  items:[
    {audience:'student',art:'book',title:'书签与模考错题',text:'作答时可逐题收藏。从错题本回看书签和正式作业、模考的失分记录。同一道题合并为一张卡片。'},
    {audience:'student',art:'news',title:'同伴思路',text:'在允许交流的作业里保存自己的尝试，再打开「同伴思路」，查看本班的解题方法。'},
    {audience:'teacher',art:'roster',title:'自主模考统计与学情报告',text:'查看独立的模考统计。在新版学情报告里核对依据、编辑文案并发布。'}
  ]
},{
  id:'2026-11-18-workspace-colors', date:'2026-11-18', title:'工作台换上了新的阅读配色',
  items:[
    {audience:'teacher',art:'roster',title:'导航与教学内容分区',text:'深蓝色区域用于导航，当前入口反白。作业、名单和报告使用白底，成绩分档与交未交仍沿用原来的颜色。'},
    {audience:'student',art:'book',title:'更容易看清当前选择',text:'从深蓝色导航切换课程与作业。答题时，选中的选项会变为深蓝底白字，排除项仍有删除线。'}
  ]
},{
  id:'2026-11-18-companion', date:'2026-11-18', title:'伙伴手册与班级提交',
  items:[
    {audience:'student',art:'book',title:'和 Mike 一起学经济',text:'每次完成经济学提问或相关追问可累积好感度。点聊天标题下的称号查看进度、换头像。'},
    {audience:'student',art:'subjects',title:'作业卡片标明学科',text:'绿色是 AP 宏观，蓝色是 AP 微观。离开不限时自主模考后，也可以继续向 Mike 学经济。'},
    {audience:'teacher',art:'roster',title:'按班级查看提交',text:'打开作业的学生提交页，选择班级。已交、未交、已出分人数与下方名单会一起更新。'},
    {audience:'all',art:'news',title:'随时回看更新',text:'在任意工作台点 Mike，再点「更新」。同一账号读过的更新在其他入口也会同步。'}
  ]
}];
export const stages=[
  {at:0,name:'初识',prop:'抱书挥手'}, {at:20,name:'好奇同桌',prop:'随身笔记本'},
  {at:40,name:'学习搭档',prop:'供需图'}, {at:65,name:'研究伙伴',prop:'放大镜'},
  {at:85,name:'经济学挚友',prop:'小黑板'}
];
export function profileView(profile={},role){
  const points=profile.points||0, level=stages.filter(s=>points>=s.at).length-1;
  const editions=releases.map(r=>({...r,items:r.items.filter(i=>i.audience==='all'||i.audience===role)})).filter(r=>r.items.length);
  return {student:role==='student',points,level,equipped:profile.equipped||0,stages,editions,unread:editions.some(r=>!(profile.read||[]).includes(r.id))};
}
export function awardPoint(profile,at=new Date()){
  const day=new Date(at.getTime()+8*3600000).toISOString().slice(0,10);
  if(profile.day!==day){profile.day=day;profile.daily=0;}
  if((profile.daily||0)<5&&(profile.points||0)<100){profile.points=(profile.points||0)+1;profile.daily=(profile.daily||0)+1;}
}
