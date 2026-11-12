export function viewMemory(key){
 const id='mike-view:'+key;let data={};try{const value=JSON.parse(sessionStorage.getItem(id));if(value&&typeof value==='object'&&!Array.isArray(value))data=value;}catch{}
 return {get:(name,fallback)=>typeof data[name]===typeof fallback?data[name]:fallback,set(patch){data={...data,...patch};try{sessionStorage.setItem(id,JSON.stringify(data));}catch{}},reset(){data={};try{sessionStorage.removeItem(id);}catch{}}};
}
