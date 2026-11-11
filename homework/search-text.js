export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function highlightText(value,query='') {
  const source=String(value??''),term=query.trim();if(!term)return escapeHTML(source);
  const lower=source.toLocaleLowerCase(),needle=term.toLocaleLowerCase();let out='',last=0,index;
  while((index=lower.indexOf(needle,last))>=0){out+=escapeHTML(source.slice(last,index))+'<mark class="search-hit">'+escapeHTML(source.slice(index,index+term.length))+'</mark>';last=index+term.length;}
  return out+escapeHTML(source.slice(last));
}
// Map normalized search characters back to exact PDF text-item UTF-16 offsets.
export function textIndex(items){
  let text='',map=[],itemIndex=0;
  const append=(value,location)=>{for(const char of value.normalize('NFKC').toLocaleLowerCase()){
    const normalized=/\s/u.test(char)?' ':char;
    if(normalized===' '&&text.endsWith(' '))continue;
    text+=normalized;for(let n=0;n<normalized.length;n++)map.push(location);
  }};
  for(const item of items){if(typeof item.str!=='string')continue;let offset=0;
    for(const char of item.str){append(char,{item:itemIndex,start:offset,end:offset+char.length});offset+=char.length;}
    if(item.hasEOL){if(text.endsWith('-')){text=text.slice(0,-1);map.pop();}else if(!/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]$/u.test(text))append(' ',null);}
    itemIndex++;
  }
  return {text,map};
}
export function findText(index,query){
  const term=query.normalize('NFKC').toLocaleLowerCase().replace(/\s+/gu,' ').trim();if(!term)return [];
  const matches=[];let start=0,pos;
  while((pos=index.text.indexOf(term,start))!==-1){
    const ranges=[];
    for(const point of index.map.slice(pos,pos+term.length)){if(!point)continue;const last=ranges.at(-1);if(last?.item===point.item)last.end=Math.max(last.end,point.end);else ranges.push({...point});}
    matches.push({start:pos,end:pos+term.length,ranges,snippet:index.text.slice(Math.max(0,pos-28),Math.min(index.text.length,pos+term.length+52))});start=pos+term.length;
  }
  return matches;
}
