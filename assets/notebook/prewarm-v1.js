// The library and its baked textures are public, static and content-versioned.
if(!navigator.connection?.saveData){
  const warm=()=>{
    const asset=document.createElement('link');
    asset.rel='prefetch';asset.href='/assets/notebook/scene-v1.js';
    document.head.append(asset);
  };
  if('requestIdleCallback' in window)requestIdleCallback(warm,{timeout:1800});else setTimeout(warm,600);
}
