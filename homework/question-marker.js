// Text marks use character offsets so they follow line wrapping. Image and PDF
// marks use fractions of the original page, independent of zoom and rotation.
export function questionMarker(toolbar, key, notify) {
  const storage = 'question-marks:1:' + key;
  let marks = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storage));
    if (Array.isArray(saved)) marks = saved;
  } catch {}
  const surfaces = new Map();
  let enabled = false;
  const pen = document.createElement('button'), undo = document.createElement('button');
  pen.type = undo.type = 'button';
  pen.className = 'question-pen';
  pen.textContent = '高亮';
  pen.title = '拖过文字或题图添加高亮，标注保存在此设备';
  pen.setAttribute('aria-pressed', 'false');
  undo.textContent = '撤销';
  undo.title = '撤销最近一次高亮';
  undo.setAttribute('aria-label', undo.title);
  undo.hidden = true;
  toolbar?.append(pen, undo);

  function update() {
    undo.hidden = !enabled || !marks.length;
    pen.setAttribute('aria-pressed', String(enabled));
    for (const surface of surfaces.values()) surface.mode(enabled);
  }
  function persist() {
    try { localStorage.setItem(storage, JSON.stringify(marks)); }
    catch { notify?.('此设备无法保存高亮，标注仅在当前页面有效'); }
    update();
  }
  function add(mark) {
    marks.push(mark);
    surfaces.get(mark.id).paint();
    persist();
  }
  undo.onclick = () => {
    const mark = marks.pop();
    if (mark) surfaces.get(mark.id)?.paint();
    persist();
  };
  pen.onclick = () => { enabled = !enabled; update(); };

  function attachText(el, id) {
    const original = el.textContent;
    if (!original) return;
    const paint = () => {
      const ranges = marks.filter(m => m.id === id && Number.isInteger(m.start))
        .sort((a,b) => a.start - b.start);
      let end = 0;
      const fragment = document.createDocumentFragment();
      for (const range of ranges) {
        if (range.end <= end) continue;
        fragment.append(original.slice(end, range.start));
        const tag = document.createElement('mark');
        tag.textContent = original.slice(Math.max(range.start, end), range.end);
        fragment.append(tag);
        end = range.end;
      }
      fragment.append(original.slice(end));
      el.replaceChildren(fragment);
    };
    function offset(x,y) {
      const pos = document.caretPositionFromPoint?.(x,y);
      const range = document.createRange();
      if (pos) range.setEnd(pos.offsetNode, pos.offset);
      else {
        const caret = document.caretRangeFromPoint?.(x,y);
        if (!caret) return null;
        range.setEnd(caret.startContainer, caret.startOffset);
      }
      if (!el.contains(range.endContainer)) return null;
      range.setStart(el, 0);
      return range.toString().length;
    }
    let start, end, pointer;
    el.onpointerdown = event => {
      if (!enabled || !event.isPrimary || event.button !== 0) return;
      start = end = offset(event.clientX,event.clientY);
      if (start == null) return;
      pointer = event.pointerId; el.setPointerCapture(pointer);
      event.preventDefault();
    };
    el.onpointermove = event => {
      if (event.pointerId !== pointer) return;
      const pos = offset(event.clientX,event.clientY);
      if (pos != null) end = pos;
      // Give immediate feedback using native selection while dragging.
      const selection = getSelection(), walker = document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      let node, at = 0, left, right;
      while ((node = walker.nextNode())) {
        if (!left && Math.min(start,end) <= at + node.length) left = [node,Math.min(start,end)-at];
        if (Math.max(start,end) <= at + node.length) {right = [node,Math.max(start,end)-at];break;}
        at += node.length;
      }
      if (left && right) {const r = document.createRange();r.setStart(...left);r.setEnd(...right);selection.removeAllRanges();selection.addRange(r);}
    };
    el.onpointerup = event => {
      if (pointer !== event.pointerId) return;
      pointer = undefined;
      end = offset(event.clientX,event.clientY) ?? end;
      if (end !== start) add({id,start:Math.min(start,end),end:Math.max(start,end)});
      getSelection()?.removeAllRanges();
    };
    el.onpointercancel = () => {pointer = undefined;getSelection()?.removeAllRanges();};
    surfaces.set(id,{paint,mode:active=>el.classList.toggle('mark-text-active',active)});
    paint();update();
  }

  function attachPage(host, id, rotation = () => 0) {
    const layer = document.createElement('div');
    layer.className = 'mark-layer';
    layer.setAttribute('aria-hidden','true');
    host.append(layer);
    const rotate = ([x,y], angle) => {
      for (let i=0;i<(angle+360)%360;i+=90) [x,y]=[1-y,x];
      return [x,y];
    };
    function box(node, a, b) {
      node.style.left = 100*Math.min(a[0],b[0])+'%';
      node.style.top = 100*Math.min(a[1],b[1])+'%';
      node.style.width = 100*Math.abs(a[0]-b[0])+'%';
      node.style.height = 100*Math.abs(a[1]-b[1])+'%';
    }
    function paint() {
      layer.replaceChildren();
      for (const mark of marks.filter(m=>m.id===id && m.a && m.b)) {
        const node = document.createElement('i');layer.append(node);
        box(node,rotate(mark.a,rotation()),rotate(mark.b,rotation()));
      }
    }
    const point = event => {
      const r=layer.getBoundingClientRect(),clamp=n=>Math.min(1,Math.max(0,n));
      return [clamp((event.clientX-r.left)/r.width),clamp((event.clientY-r.top)/r.height)];
    };
    let drag;
    layer.onpointerdown = event => {
      if (!enabled || !event.isPrimary || event.button!==0) return;
      event.preventDefault();event.stopPropagation();layer.setPointerCapture(event.pointerId);
      const node=document.createElement('i');layer.append(node);
      drag={id:event.pointerId,start:point(event),node};box(node,drag.start,drag.start);
    };
    layer.onpointermove = event => {if(drag?.id===event.pointerId)box(drag.node,drag.start,point(event));};
    layer.onpointercancel = () => {drag?.node.remove();drag=null;};
    layer.onpointerup = event => {
      if(drag?.id!==event.pointerId)return;
      const {start,node}=drag, end=point(event),r=layer.getBoundingClientRect();drag=null;node.remove();
      if(Math.abs(end[0]-start[0])*r.width<3)return;
      if(Math.abs(end[1]-start[1])*r.height<10) {
        end[1]=Math.min(1,start[1]+6/r.height);start[1]=Math.max(0,start[1]-6/r.height);
      }
      add({id,a:rotate(start,-rotation()),b:rotate(end,-rotation())});
    };
    surfaces.set(id,{paint,mode:active=>layer.classList.toggle('active',active)});
    paint();layer.classList.toggle('active',enabled);
  }
  function attachImages(root) {
    for (const [i,img] of [...root.querySelectorAll('img')].entries()) {
      const wrap=document.createElement('div');wrap.className='mark-image';
      img.before(wrap);wrap.append(img);attachPage(wrap,'image-'+i);
    }
  }
  return {attachText,attachPage,attachImages,repaint:()=>{for(const surface of surfaces.values())surface.paint();}};
}
