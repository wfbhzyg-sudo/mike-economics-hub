if(process.env.GATEWAY_TARGET) await import('./gateway.mjs');
else if(process.env.UNIFIED_AUTH==='1') await import('./unified-server.mjs');
else await import('./legacy-server.mjs');
