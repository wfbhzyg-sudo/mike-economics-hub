if(!navigator.connection?.saveData){
  const warm=()=>{
    for(const href of ['/assets/notebook/scene-v1.js?v=20261119-desk2','/assets/notebook/paper.webp','/assets/notebook/leather.webp']){
      const asset=document.createElement('link');
      asset.rel='prefetch';asset.href=href;
      document.head.append(asset);
    }
  };
  if('requestIdleCallback' in window)requestIdleCallback(warm,{timeout:1200});else setTimeout(warm,400);
}
