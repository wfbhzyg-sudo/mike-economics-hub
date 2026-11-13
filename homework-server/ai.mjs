import {assert} from './validation.mjs';
export async function deepseek(db,decrypt,messages,{json=false,maxTokens=1800,signal,onToken}={}){
 const s=await db.get('model-settings');let valid=false;try{valid=new URL(s?.baseUrl).hostname==='api.deepseek.com'}catch{}
 assert(s?.cloudConsent&&s.apiKeyEncrypted&&valid,'请由教师在批改设置中启用 DeepSeek 并确认资料传送',409);
 const r=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+decrypt(s.apiKeyEncrypted)},body:JSON.stringify({model:'deepseek-flash',messages,max_tokens:maxTokens,thinking:{type:'disabled'},...(json?{response_format:{type:'json_object'}}:{}),...(onToken?{stream:true}:{})}),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(90000)]):AbortSignal.timeout(90000)});
 assert(r.ok,r.status===429?'AI 服务繁忙或额度不足，请稍后重试':'AI 服务暂时不可用，请检查批改设置',503);
 let content='',finish;
 if(onToken){let buffer='';const decoder=new TextDecoder();for await(const chunk of r.body){buffer+=decoder.decode(chunk,{stream:true});let end;while((end=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,end).trim();buffer=buffer.slice(end+1);if(!line.startsWith('data:')||line==='data: [DONE]')continue;const value=JSON.parse(line.slice(5)),c=value.choices?.[0];if(c?.delta?.content){content+=c.delta.content;await onToken(c.delta.content)}if(c?.finish_reason)finish=c.finish_reason;}}}
 else{const value=await r.json(),c=value.choices?.[0];content=c?.message?.content||'';finish=c?.finish_reason;}
 assert(finish!=='length','本批识别结果过长，请缩小范围后重试',422);assert(content.trim(),'AI 未返回有效内容，请重试',422);
 if(!json)return content;try{return JSON.parse(content)}catch{throw Object.assign(Error('识别格式不完整，请重试本页'),{status:422})}
}
