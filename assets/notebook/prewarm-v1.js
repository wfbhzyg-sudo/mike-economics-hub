// The login sheet sits on the actual closed 3D book. Native inputs are usable immediately.
if(!navigator.connection?.saveData){
  const scene=import('/assets/notebook/scene-v1.js?v=folio4');
  window.notebookCover=scene.then(async book=>{
    await book.start([],false,()=>true,true);
    return book;
  }).catch(()=>null);
}
