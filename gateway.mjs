import http from 'node:http';
import https from 'node:https';
const upstream=new URL(process.env.GATEWAY_TARGET);
if(upstream.protocol!=='https:'&&process.env.NODE_ENV==='production')throw Error('Gateway requires HTTPS');
const hop=new Set(['connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','transfer-encoding','upgrade']);
const server=http.createServer((req,res)=>{
 if(req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end('{"ok":true,"mode":"preserved-url-gateway"}');return;}
 if(!req.url.startsWith('/')||req.url.startsWith('//')||req.url.includes('\\')){res.writeHead(400).end();return;}
 const headers=Object.fromEntries(Object.entries(req.headers).filter(([k])=>!hop.has(k.toLowerCase())));
 headers['x-mike-original-host']=req.headers.host;
 headers.host=upstream.host;
 const forward=(upstream.protocol==='https:'?https:http).request(new URL(req.url,upstream),{method:req.method,headers,timeout:120000},response=>{
  const returned=Object.fromEntries(Object.entries(response.headers).filter(([k])=>!hop.has(k.toLowerCase())));
  res.writeHead(response.statusCode,returned);response.on('error',()=>res.destroy());response.pipe(res);
 });
 forward.on('timeout',()=>forward.destroy());forward.on('error',()=>{if(!res.headersSent)res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}).end('暂时无法连接，请稍后重试。');else res.destroy();});
 req.on('aborted',()=>forward.destroy());res.on('close',()=>{if(!res.writableFinished)forward.destroy();});req.pipe(forward);
});
server.listen(Number(process.env.PORT||8080),'0.0.0.0');process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
