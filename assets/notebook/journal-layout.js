// Coordinates are in paper texture pixels (600 × 848), independent of the viewport.
export const styles = {
  date:{size:24,weight:400,color:'#625e50',height:38},
  title:{size:33,weight:650,color:'#223f3a',height:47},
  item:{size:28,weight:650,color:'#374b40',height:42},
  body:{size:26,weight:400,color:'#333a37',height:38}
};
export const font = kind => `${styles[kind].weight} ${styles[kind].size}px system-ui,sans-serif`;
export function paginate(editions,measure) {
  const pages=[];
  for(const edition of [...editions].sort((a,b)=>b.date.localeCompare(a.date))){
    let page,y;
    const fresh=()=>{page={lines:[],number:pages.length+1};pages.push(page);y=138;};
    fresh();
    function add(kind,content,gap=0){
      y+=gap;
      const write=value=>{
        if(y>718)fresh();
        page.lines.push({kind,text:value,y});y+=styles[kind].height;
      };
      for(const paragraph of String(content||'').split(/\r?\n/)){
        let line='';
        for(const char of paragraph){
          if(line && measure(kind,line+char)>486){write(line);line='';}
          line+=char;
        }
        if(line)write(line);
      }
    }
    add('date',edition.date);add('title',edition.title);
    for(const item of edition.items){add('item',item.title,14);add('body',item.text,3);}
  }
  return pages;
}
export function journalPages(editions) {
  const ctx=document.createElement('canvas').getContext('2d');
  return paginate(editions,(kind,value)=>{ctx.font=font(kind);return ctx.measureText(value).width;});
}
