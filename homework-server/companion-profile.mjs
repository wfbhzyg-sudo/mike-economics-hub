// Newest first. Roles determine which illustrated improvements each reader sees.
export const releases = [{
  id:'2026-11-18-paper-tools',date:'2026-11-18',title:'整份作业连续回看',
  items:[
    {audience:'all',art:'book',title:'原题和成绩排在一起',text:'在学生成绩里打开「作业回顾」，可以从第一题连续看到最后一题，也可以只看失分题。'},
    {audience:'student',art:'news',title:'在题面上做记号',text:'点「高亮」后拖过文字或题图，点「撤销」可移除最近一笔。标注保存在当前设备。同伴思路从右侧打开。'}
  ]
},{
  id:'2026-11-18-live-wardrobe',date:'2026-11-18',title:'伙伴手册与保存的穿搭',
  items:[
    {audience:'all',art:'book',title:'在原有菜单中返回一页通',text:'在 Bookself 的账号或阅读目录、EconQuest 的账号或闯关暂停菜单里，选择「返回经济一页通」。'},
    {audience:'student',art:'news',title:'同步你在 EconQuest 保存的穿搭',text:'打开 Mike 后，点聊天标题下的「伙伴手册」即可查看当前来源、好感度和其他装扮。'}
  ]
},{
  id:'2026-11-18-reader-quest',date:'2026-11-18',title:'书架、闯关与伙伴装扮',
  items:[
    {audience:'all',art:'book',title:'从书架和探险返回一页通',text:'在书架或探险首页点「← 一页通」。闯关中也可以暂停后返回。'},
    {audience:'student',art:'news',title:'Mike 的探险装扮',text:'在伙伴手册中换上 EconQuest 装扮。闯关时向 Mike 提问，聊天按键只用于对话。'}
  ]
},{
  id:'2026-11-18-peer-review',date:'2026-11-18',title:'同伴思路与对话工具更新',
  items:[
    {audience:'student',art:'book',title:'同伴思路先审核再发表',text:'分享或修改的正文经 DeepSeek 审核通过后，同班同学才会看到。退回后可以继续修改。'},
    {audience:'teacher',art:'roster',title:'题目诊断表更紧凑',text:'直接点题号查看原题，列表集中显示得分表现、样本与选项分布。'},
    {audience:'all',art:'news',title:'对话工具收进菜单',text:'在 Mike 的输入框旁添加截图或页面引用，在右上角对话菜单中查看历史。'}
  ]
},{
  id:'2026-11-18-class-scope',date:'2026-11-18',title:'按班查看教学数据',
  items:[
    {audience:'teacher',art:'subjects',title:'选班即可查看',text:'选择宏观班或微观班后，作业列表、模考统计与拓展学习记录自动使用该班范围。'},
    {audience:'teacher',art:'roster',title:'提交人数对应班级名单',text:'点多班作业的提交或录分人数，直接打开这个班的名单。班级报告和历史记录集中在「学情报告」。'}
  ]
},{
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
  {at:0,name:'初识',prop:'经典课堂'}, {at:20,name:'好奇同桌',prop:'图书馆学者'},
  {at:40,name:'学习搭档',prop:'峡谷探险家'}, {at:65,name:'研究伙伴',prop:'星空观测者'},
  {at:85,name:'经济学挚友',prop:'地底寻宝者'}
];
export function profileView(profile={},role){
  const points=profile.points||0, level=stages.filter(s=>points>=s.at).length-1;
  const editions=releases.map(r=>({...r,items:r.items.filter(i=>i.audience==='all'||i.audience===role)})).filter(r=>r.items.length);
  return {student:role==='student',points,level,equipped:profile.equipped||0,appearanceSource:profile.appearanceSource==='partner'?'partner':'quest',stages,editions,unread:editions.some(r=>!(profile.read||[]).includes(r.id))};
}
export function awardPoint(profile,at=new Date()){
  const day=new Date(at.getTime()+8*3600000).toISOString().slice(0,10);
  if(profile.day!==day){profile.day=day;profile.daily=0;}
  if((profile.daily||0)<5&&(profile.points||0)<100){profile.points=(profile.points||0)+1;profile.daily=(profile.daily||0)+1;}
}
