// Newest first. Roles determine which illustrated improvements each reader sees.
export const releases = [{
  id:'2026-11-20-classroom-workflow',date:'2026-11-20',title:'备课、作答与订正',
  items:[
    {audience:'teacher',art:'book',title:'选题可续，原题可查',text:'刷新后可继续上次选题。点开题目查看完整题图和共用材料，再决定是否加入。'},
    {audience:'student',art:'book',title:'边查重点，边做题',text:'打开学习重点后，键盘只操作资料。平板可直接切到上传作答，订正保存后可留在当前题。'},
    {audience:'all',art:'news',title:'键盘翻书也可折返',text:'翻页中按相反方向键可折返。更新日志加载失败时，可以在书签旁重试。'}
  ]
},{
  id:'2026-11-19-review-paper',date:'2026-11-19',title:'逐题复核线上作业',
  items:[{audience:'teacher',art:'book',title:'从总分打开原作答',text:'从班级提交名单打开已出分的线上作业，即可查看原题、逐题分数与作答。线下录入的成绩继续使用总分编辑。'}]
},{
  id:'2026-11-19-desk-index',date:'2026-11-19',title:'桌边目录与课堂回顾',
  items:[{audience:'all',art:'news',title:'桌边的纸签',text:'点右上角「目录」查看账户和经典视图。在手机上翻页时，反向滑动可以把正在翻动的书页拉回来。'},
    {audience:'teacher',art:'book',title:'核对后发布',text:'确认窗直接显示作业名称。逐项补齐必填内容时，错误计数同步减少。'},
    {audience:'student',art:'book',title:'回看整份作业',text:'可以一次展开各题。进入错题订正后再返回，继续查看原题的位置。'}]
},{
  id:'2026-11-19-classroom-motion',date:'2026-11-19',title:'课堂工作台与互动需求图',
  items:[{audience:'teacher',art:'book',title:'直接返回发布步骤',text:'核对答案和确认发布时可返回题纸。班级成绩矩阵支持悬停或键盘查看原始分数。'},
    {audience:'student',art:'book',title:'移动需求曲线',text:'在微观 Unit 2 的需求与均衡课中移动曲线，观察价格与数量。订正结果会同时标明保存状态。'}]
},{
  id:'2026-11-19-notebook-task-return',date:'2026-11-19',title:'办完待办，回到书桌原页',
  items:[{audience:'student',art:'book',title:'交卷后看下一份',text:'从书桌点进作业，交卷后点「返回书桌」就能看到下一份待交作业。全部完成后，纸面留白。'},
    {audience:'teacher',art:'book',title:'批阅进度同步到书桌',text:'从书桌进入批阅或复核，发布成绩后可继续处理同组提交，也可返回书桌查看最新数量。'}]
},{
  id:'2026-11-19-notebook-task-links',date:'2026-11-19',title:'从书桌直接处理待办',
  items:[{audience:'student',art:'book',title:'直达待交作业',text:'轻点书桌纸件上带下划线的作业名称，直接进入作答页。'},
    {audience:'teacher',art:'book',title:'分别查看批阅与复核',text:'点纸件上的待办可打开相应的学生提交列表。点纸件其他位置，仍会进入教师工作台。'}]
},{
  id:'2026-11-19-notebook-task-light',date:'2026-11-19',title:'书桌上的待办',
  items:[{audience:'student',art:'book',title:'下一份作业',text:'作业入口会写上最近待交的作业和截止时间。手机上的台灯已移到书页外。'},
    {audience:'teacher',art:'book',title:'待批阅与复核',text:'教师入口会显示需要你处理的提交数量。没有待办时，纸面留白。'}]
},{
  id:'2026-11-19-notebook-paper-goods',date:'2026-11-19',title:'书桌上的四份纸件',
  items:[{audience:'all',art:'book',title:'资料与竞赛',text:'翻到资料页，可从档案夹进入资料库，从行情单进入 NEBS 比赛。右页的供需方格纸和趋势图分别通往微观与宏观学习材料。'}]
},{
  id:'2026-11-19-notebook-rapid-swipe',date:'2026-11-19',title:'快速滑动也能继续翻页',
  items:[
    {audience:'all',art:'book',title:'连续滑动与反向翻页',text:'翻页动画还在进行时，可以继续滑动。笔记本翻完当前页后会接着处理下一次滑动。'}
  ]
},{
  id:'2026-11-19-notebook-motion',date:'2026-11-19',title:'换页时，书签留在纸页之间',
  items:[
    {audience:'all',art:'book',title:'手机翻页与合书',text:'横向滑动书页可翻页。在第一页向右滑动即可合上笔记本。'},
    {audience:'all',art:'news',title:'阅读更新后回到原页',text:'从书签打开更新日志，点「返回原页」回到阅读位置。发布新的更新时，便签上的红点会重新亮起。'}
  ]
},{
  id:'2026-11-19-notebook-journal',date:'2026-11-19',title:'夹在笔记本里的更新日志',
  items:[
    {audience:'all',art:'book',title:'从页角翻开与合上',text:'点封面右下角的箭头打开笔记本。在第一页再往前翻，就会合上封面。'},
    {audience:'all',art:'news',title:'最新变化',text:'点露在书边的便签查看本次更新。向右翻可读到以往的记录，再点便签可回到刚才的位置。'}
  ]
},{
  id:'2026-11-19-correction',date:'2026-11-19',title:'订正后即可核对答案',
  items:[
    {audience:'all',art:'book',title:'保留原成绩与订正记录',text:'选择题保存订正后显示本次对错及正确选项。简答题有参考答案时可对照，没有可靠答案时显示待核对。'},
    {audience:'teacher',art:'news',title:'两种布置方式',text:'新建作业时可直接选择在线作答或上传作答。'}
  ]
},{
  id:'2026-11-18-shared-question-view',date:'2026-11-18',title:'作业和模考使用同一套答题界面',
  items:[
    {audience:'all',art:'book',title:'书架与游戏大厅可直接返回一页通',text:'进入 Bookself 书架或 EconQuest 探险大厅后，可在首页点击「返回一页通」。'},
    {audience:'student',art:'news',title:'跨页材料、题号与答题结果',text:'作业和模考使用同一套题面工具。图片加载失败时可原地重试，交卷后用颜色和符号区分满分与失分。'},
    {audience:'student',art:'news',title:'模考可向 Mike 提问',text:'自主模考中可以使用 Mike，经济关键词会用中英双语呈现。'},
    {audience:'teacher',art:'roster',title:'查看模考次数与成绩趋势',text:'「自主模考统计」按名册显示交卷次数和最近成绩走势，点击数字可查看记录。章节方块的填充高度表示参与覆盖率，填充颜色表示正确率。'}
  ]
},{
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
  return {appearanceKey:profile.id,student:role==='student',points,level,equipped:profile.equipped||0,appearanceSource:profile.appearanceSource==='partner'?'partner':'quest',stages,editions,unread:editions.some(r=>!(profile.read||[]).includes(r.id))};
}
export function awardPoint(profile,at=new Date()){
  const day=new Date(at.getTime()+8*3600000).toISOString().slice(0,10);
  if(profile.day!==day){profile.day=day;profile.daily=0;}
  if((profile.daily||0)<5&&(profile.points||0)<100){profile.points=(profile.points||0)+1;profile.daily=(profile.daily||0)+1;}
}
