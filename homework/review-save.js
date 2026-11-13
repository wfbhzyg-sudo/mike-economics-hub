// One request at a time: quick edits never race the server's draft revision.
export function createReviewSaver({revision=0, save, onChange=()=>{}}) {
  const pending=new Map();let running=null,error=null;
  const snapshot=()=>({revision,pending:[...pending.values()],saving:!!running,error});
  const notify=()=>onChange(snapshot());
  return {
    set(id,score){pending.set(id,{id,score});error=null;notify();},
    snapshot,
    async flush(){
      if(running){await running;if(pending.size)return this.flush();return;}
      if(!pending.size)return;
      running=(async()=>{
        while(pending.size){
          const [id,item]=pending.entries().next().value;
          const result=await save({...item,checked:true},revision);
          revision=result.revision;
          if(pending.get(id)===item)pending.delete(id);
          notify();
        }
      })();notify();
      try{await running;error=null;}catch(e){error=e;throw e;}finally{running=null;notify();}
    },
  };
}

// Keep original questions separate from explicitly linked student evidence.
export function questionReviewEvidence(submission,questionId,source='auto'){
 const q=submission.rubricSnapshot?.find(q=>q.id===questionId),r=submission.responses?.[questionId],kind=source==='auto'?(q?.type==='choice'?'question':'answer'):source;
 if(kind==='question')return {source:kind,files:q?.questionImages||[],text:q?.questionImages?.length?'':q?.prompt||'未关联题面'};
 return {source:kind,files:r?.files?.length?r.files:r?[]:submission.files||[],text:r?.text||(!r?submission.text||'':!r.files?.length?'本题没有单独保存的文字或附件。':'')};
}
