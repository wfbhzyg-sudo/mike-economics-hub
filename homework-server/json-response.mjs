import {gzip} from 'node:zlib';
export function sendJSON(res,value,status=200){
 const bytes=Buffer.from(JSON.stringify(value));
 const accepts=String(res.req?.headers?.['accept-encoding']||'').split(',').some(part=>{const [coding,...params]=part.trim().split(';');return coding.toLowerCase()==='gzip'&&!params.some(p=>/^q\s*=\s*0(?:\.0*)?\s*$/i.test(p.trim()))});
 const end=(payload,compressed=false)=>{if(res.destroyed)return;res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Accept-Encoding','Content-Length':payload.length,...(compressed?{'Content-Encoding':'gzip'}:{})}).end(payload)};
 if(bytes.length>=2048&&accepts)gzip(bytes,{level:1},(error,result)=>end(error?bytes:result,!error));else end(bytes);
}
