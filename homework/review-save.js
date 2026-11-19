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
 const question=submission.rubricSnapshot?.find(q=>q.id===questionId);
 const response=submission.responses?.[questionId];
 const choice=submission.choices?.[questionId];
 const original={source:'question',files:question?.questionImages||[],text:question?.questionImages?.length?'':question?.prompt||''};
 const legacy=!Object.keys(submission.responses||{}).length&&!Object.keys(submission.choices||{}).length;
 const answer={source:'answer',files:response?.files||(legacy?submission.files||[]:[]),text:response?.text||(choice?'学生选择 '+choice:legacy?submission.text||'':'')};
 const requested=source==='auto'?(question?.type==='choice'?'question':'answer'):source;
 const preferred=requested==='answer'?answer:original, alternative=requested==='answer'?original:answer;
 if(preferred.files.length||preferred.text) return preferred;
 if(alternative.files.length||alternative.text) return {...alternative,fallback:requested};
 return {...preferred,text:'本题暂无可查看的原题或作答。'};
}
