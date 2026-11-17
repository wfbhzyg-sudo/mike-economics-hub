import {assert} from './validation.mjs';
const ownerKey=value=>String(value||'').replace(/^bookself:/,'');
const titleKey=value=>String(value||'').replace(/^AP (?:Micro|Macro)\s*·\s*/i,'').replace(/\s*·\s*原始题卷$/,'').trim();
export async function resolveQuestionSource(db,user,question){
 const sources=(await db.list('library-source')).filter(s=>ownerKey(s.owner)===ownerKey(user.id));
 const exact=question.sourceId?sources.find(s=>s.id===question.sourceId):null;
 let candidates=exact?[exact]:sources.filter(s=>titleKey(s.title)===titleKey(question.source)&&(s.unitId===question.unitId||(s.collection==='exam'&&s.course===question.unitId.split('-')[0])));
 if(!candidates.length){
   const unit=await db.get(question.unitId);
   if(ownerKey(unit?.owner)===ownerKey(user.id)){
     candidates=(unit.resources||[]).filter(r=>r.kind==='bank-original'&&titleKey(r.title)===titleKey(question.source));
     const legacy=/^(micro|macro)-u([1-6])-bank-\d+$/.exec(question.id||'');
     if(!candidates.length&&legacy&&question.unitId===legacy[1]+'-unit-'+legacy[2]&&new RegExp('^'+legacy[1]+' MCQ Practice Unit '+legacy[2]+'$','i').test(question.source||'')){
       candidates=(unit.resources||[]).filter(r=>r.kind==='bank-original'&&new RegExp('^'+legacy[1]+' All Units MCQ(?:\\.pdf)?$','i').test(titleKey(r.title)));
     }
   }
 }
 const ids=[...new Set(candidates.map(s=>s.fileId).filter(Boolean))];
 // Identical titles can describe different editions. Never substitute another PDF.
 if(ids.length!==1)return null;
 const file=await db.get(ids[0]);if(!file||Number(file.pages||0)<Math.max(...(question.sourcePages||[1])))return null;
 return {source:candidates[0],file};
}
export function replaceQuestionSlice(question,{fileId,page,bbox,mode='replace',index=0,at}){
 assert(['replace','append'].includes(mode),'请选择替换切片或补充图表',400);
 const images=(question.questionImages||[]).slice();
 assert(mode==='append'||Number.isInteger(index)&&index>=0&&index<images.length,'当前切片已改变，请重新打开',409);
 const regions=images.map((_,i)=>question.regions?.[i]||{});
 if(mode==='append'){images.push(fileId);regions.push({page,bbox});}
 else{images[index]=fileId;regions[index]={...(regions[index]||{}),page,bbox};}
 return {...question,questionImages:images,regions,sourcePages:[...new Set([...(question.sourcePages||[]),page])].sort((a,b)=>a-b),version:Number(question.version||1)+1,updatedAt:at};
}
