// Public curriculum metadata. IDs are permanent; labels may be renamed.
const economicsSkills = [
  { id:1, name:'原理与模型', english:'Principles and Models', choice:true, practice:'用自己的话说明原理，再换一个条件检验判断。' },
  { id:2, name:'解读', english:'Interpretation', choice:true, practice:'圈出发生变化的量，说明图表怎样支持你的判断。' },
  { id:3, name:'分析推演', english:'Manipulation', choice:true, practice:'写清变化的起点、中间环节和最后的结果。' },
  { id:4, name:'绘图', english:'Graphing and Visuals', choice:false, practice:'重画图形，依次核对轴名、曲线和均衡点。' }
];
export const subjects = [
  {id:'micro', bookself:'ap-microeconomics', label:'AP 微观', short:'微观', full:'AP 微观经济学', english:'AP Micro', aliases:['micro','微观'], units:6, skills:economicsSkills, family:'economics', apReference:true, tone:'blue'},
  {id:'macro', bookself:'ap-macroeconomics', label:'AP 宏观', short:'宏观', full:'AP 宏观经济学', english:'AP Macro', aliases:['macro','宏观'], units:6, skills:economicsSkills, family:'economics', apReference:true, tone:'green'}
];
