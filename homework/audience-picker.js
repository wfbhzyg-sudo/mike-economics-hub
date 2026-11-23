import {classKey} from './course-scope.js';
import {audienceCount} from './assignment-audience.js';

export function audiencePicker(classes, value, escape) {
  const selected = new Set((value.classIds || []).map(classKey));
  return `<fieldset class="audience-picker"><legend>布置给</legend>
    <div class="audience-classes">${classes.map(c => {
      const key=classKey(c.id);
      return `<label class="audience-chip"><input type="checkbox" data-audience-class value="${escape(key)}" ${selected.has(key)?'checked':''}><span>${escape(c.name)}</span></label>`;
    }).join('') || '<span>暂无可用班级</span>'}</div><div data-audience-groups></div></fieldset>`;
}

export function bindAudiencePicker(root, {classes, value, students, escape, change = () => {}}) {
  const byKey = new Map(classes.map(c => [classKey(c.id), c]));
  const chosen = new Map(Object.entries(value.individualRecipients || {}).map(([key, ids]) => [key, new Set(ids)]));
  const list = root.querySelector('[data-audience-groups]');
  const controls = [...root.querySelectorAll('[data-audience-class]')];
  const active = () => controls.filter(input => input.checked).map(input => input.value);
  const read = () => ({
    classIds: active().map(key => byKey.get(key).id),
    individualRecipients: Object.fromEntries(active().filter(key => chosen.has(key)).map(key => [key,[...chosen.get(key)]])),
  });
  const opened = new Set();
  let roster, pending, failed = false;
  function render() {
    list.innerHTML = active().map(key => {
      const ids = chosen.get(key), name = byKey.get(key).name;
      const members = (roster || []).filter(s => s.classIds.some(id => classKey(id) === key));
      const count = ids ? ids.size + ' 人' : '全班';
      return `<details class="audience-group" data-audience-group="${escape(key)}" ${opened.has(key)?'open':''}>
        <summary><span>${escape(name)}</span><span data-audience-count>${count}</span></summary>
        <label class="audience-mode">接收范围<select data-audience-mode aria-label="${escape(name)}的接收范围"><option value="all">全班</option><option value="some" ${ids?'selected':''}>指定学生</option></select></label>
        ${ids ? `<div class="audience-members">${roster ? members.map(s => `<label><input type="checkbox" data-audience-student value="${escape(s.id)}" ${ids.has(s.id)?'checked':''}><span>${escape(s.name)}</span></label>`).join('') || '<p>这个班级暂无学生</p>' : failed ? '<button type="button" data-audience-retry>重试加载名单</button>' : '<p role="status">正在加载名单…</p>'}</div>` : ''}
      </details>`;
    }).join('');
    for(const group of list.querySelectorAll('details')) group.ontoggle=()=>{
      if(group.open)opened.add(group.dataset.audienceGroup);
      else opened.delete(group.dataset.audienceGroup);
    };
  }
  async function load() {
    if(roster || pending)return;
    failed=false;
    pending=Promise.resolve().then(students).then(data=>{roster=data.students||[];}).catch(()=>{failed=true;});
    await pending;
    pending=null;
    render();
  }
  root.addEventListener('change', event => {
    const input = event.target;
    const group = input.closest('[data-audience-group]');
    const key = group?.dataset.audienceGroup;
    if(input.matches('[data-audience-mode]')){
      const specify=input.value==='some';
      if(specify){chosen.set(key,new Set());void load();}
      else chosen.delete(key);
      render();
      list.querySelector(`[data-audience-group="${CSS.escape(key)}"] select`)?.focus();
    }else if(input.matches('[data-audience-student]')){
      const ids=chosen.get(key);
      if(input.checked)ids.add(input.value);
      else ids.delete(input.value);
      group.querySelector('[data-audience-count]').textContent=ids.size+' 人';
    }else if(input.matches('[data-audience-class]'))render();
    else return;
    change(read());
  });
  root.addEventListener('click',event=>{if(event.target.matches('[data-audience-retry]'))void load();});
  render();
  if(chosen.size)void load();
  return read;
}

export function audienceLabel(classes, value) {
  return (value.classIds||[]).map(id => {
    const name=classes.find(c=>classKey(c.id)===classKey(id))?.name || '班级';
    const count=audienceCount(value,id);
    return count===undefined ? name : name+' · '+count+' 人';
  }).join('、') || '待选择接收对象';
}
