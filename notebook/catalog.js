import teacher from '../assets/notebook/teacher.svg';
import homework from '../assets/notebook/homework.svg';
import bookself from '../assets/notebook/bookself.svg';
import econquest from '../assets/notebook/econquest.svg';

function illustration(lines, fill, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 152"><path fill="${color}" d="${fill}"/><path fill="none" stroke="#22354a" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" d="${lines}"/></svg>`;
}

const archive=illustration('M35 67l8-26h42l10 11h63l-8 54H43z M44 70h121l-16 36H43z M54 62l3-46 65 6 3 27 M66 30l42 4 M66 37l36 4 M65 45l29 3 M66 83h62 M68 92h44 M61 110h76','M44 70h121l-16 36H43z','#bca580');
const trading=illustration('M33 21v100h137 M48 109l34-25 24 8 47-56 M136 35l18-2-1 17 M61 92V62 M55 70h12v14H55z M87 78V41 M81 50h12v17H81z M113 84V53 M107 63h12v13h-12z M139 63V23 M133 30h12v16h-12z','M55 70h12v14H55z M81 50h12v17H81z M107 63h12v13h-12z M133 30h12v16h-12z','#b96f5d');
const micro=illustration('M33 28v93h139 M50 101l102-63 M51 38l101 63 M103 69v51 M34 69h69 M89 59l14 10 13 10 M149 36l-3 5 7-2 M187 123v-7 M38 18v3','M43 33l8 5 102 63-5 4-104-67z','#8ca791');
const macro=illustration('M38 23v97h132 M56 116V92h20v24 M86 116V73h20v43 M116 116V58h20v58 M146 116V34h20v82 M56 79l26-15 24 1 43-37 M140 27l11-2-2 11','M56 116V92h20v24 M86 116V73h20v43 M116 116V58h20v58 M146 116V34h20v82','#8e99be');

const from=(id,title,category,description,tint,svg)=>({id,title,category,description,tint,svg});
export const chapters=[
  {name:'学习工作台',entries:[
    from('teacher','教师工作台','TEACHING','备课、班级与教学记录','#e2ad91',teacher),
    from('homework','电子作业工作台','ASSIGNMENTS','作答、提交与订正','#edd79a',homework),
    from('bookself','Bookself','READING','教材阅读与经济学模型','#b3cad9',bookself),
    from('econquest','EconQuest','FIELD QUEST','经济学闯关与探索','#bfcda8',econquest),
  ]},
  {name:'资源与活动',entries:[
    from('resources','资料库','ARCHIVE','考纲、真题与复习资源','#dfc59d',archive),
    from('nebs','NEBS 模拟股票大赛','TRADING','模拟投资与交易','#e0a792',trading),
    from('micro','AP 微观学习材料','AP MICRO','微观课程与复习资料','#b7cfba',micro),
    from('macro','AP 宏观学习材料','AP MACRO','宏观课程与复习资料','#bbc7e0',macro),
  ]},
];

const aliases = {teacher:'teacher-workspace',homework:'homework-submit',micro:'micro-materials',macro:'macro-materials'};

export function portalCatalog(apps){
  const byId=new Map(apps.map(app=>[app.id,app]));
  const used=new Set();
  const canonical=chapters.map((section,index)=>{
    const entries=section.entries.map(visual=>{
      const id=aliases[visual.id]||visual.id;
      const app=byId.get(id);
      if(!app)return null;
      used.add(id);
      return {...visual,href:app.href,id};
    });
    if(index===0){
      const [teacher,homework,reading,quest]=entries;
      const primary=teacher||homework;
      return {name:teacher?'教学与班级':homework?'作业与订正':section.name,entries:[primary,null,reading,quest]};
    }
    return {name:section.name,entries};
  });
  const additions=apps.filter(app=>!used.has(app.id));
  for(let i=0;i<additions.length;i+=4){
    canonical.push({name:'拓展资源',entries:additions.slice(i,i+4).map(app=>({
      ...app,category:'',title:app.name,tint:'#bbc7e0',svg:archive,
    }))});
  }
  canonical.push({kind:'end',name:'内容更新中。。。',entries:[]});
  return canonical;
}
export const sideName=(section,side,index)=>{
  if(index===0)return side===0?section.name:'阅读与探索';
  if(index===1)return side===0?'资料与竞赛':'AP 学习材料';
  return section.name;
};
