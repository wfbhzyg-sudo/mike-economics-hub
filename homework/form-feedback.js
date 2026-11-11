// Keep validation in the form, with a reachable summary and the field it refers to.
let sequence = 0;
function reveal(field) {
  for (let el = field.parentElement; el; el = el.parentElement) {
    if (el.tagName === 'DETAILS') el.open = true;
  }
  field.scrollIntoView({block: 'center', behavior: 'instant'});
  field.focus({preventScroll: true});
}
function labelFor(field) {
  const label = field.labels?.[0]?.cloneNode(true);
  label?.querySelectorAll('.field-error').forEach(error => error.remove());
  return field.getAttribute('aria-label') || label?.querySelector('span')?.textContent.trim() || label?.textContent.trim().replace(/\s+/g, ' ').slice(0, 65) || '此项';
}
function messageFor(field) {
  const label = labelFor(field), v = field.validity;
  if (v.valueMissing) return field.type === 'checkbox' ? '请确认：' + label.replace(/^请确认[：:]?\s*/, '') : '请填写' + label;
  if (v.rangeUnderflow) return label + '不能小于 ' + field.min;
  if (v.rangeOverflow) return label + '不能大于 ' + field.max;
  if (v.tooShort) return label + '至少需要 ' + field.minLength + ' 个字符';
  if (v.tooLong) return label + '最多填写 ' + field.maxLength + ' 个字符';
  if (v.stepMismatch) return '请按 ' + field.step + ' 的间隔填写' + label;
  return '请检查' + label + '的格式';
}
export function prepareForm(form) {
  form.noValidate = true;
  if (form.dataset.validationReady) return;
  form.dataset.validationReady = 'true';
  const clear = event => {
    const field = event.target;
    if (!field.validity?.valid || !field.dataset.validationError) return;
    const errorId = field.dataset.validationError;
    document.getElementById(errorId)?.remove();
    field.removeAttribute('aria-invalid');
    const ids = (field.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== errorId);
    if (ids.length) field.setAttribute('aria-describedby', ids.join(' ')); else field.removeAttribute('aria-describedby');
    delete field.dataset.validationError;
    form.querySelector(`[data-error-for="${field.id}"]`)?.remove();
    const summary = form.querySelector('.form-validation');
    if (summary && !summary.querySelector('li')) summary.remove();
  };
  form.addEventListener('input', clear);
  form.addEventListener('change', clear);
}
export function validateForm(form) {
  prepareForm(form);
  const fields = [...form.elements].filter(field => field.willValidate && !field.validity.valid);
  form.querySelector('.form-validation')?.remove();
  if (!fields.length) return true;
  const summary = document.createElement('section');
  summary.className = 'form-validation'; summary.tabIndex = -1;
  summary.setAttribute('role', 'alert');
  const title = document.createElement('h3'); title.textContent = '还有 ' + fields.length + ' 项需要检查';
  const list = document.createElement('ul'); summary.append(title, list);
  for (const field of fields) {
    field.id ||= 'form-field-' + ++sequence;
    const message = messageFor(field), id = field.dataset.validationError || field.id + '-error';
    let error = document.getElementById(id);
    if (!error) {error = document.createElement('span'); error.id = id; error.className = 'field-error'; field.insertAdjacentElement('afterend', error);}
    error.textContent = message; field.dataset.validationError = id;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', [...new Set([...(field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean), id])].join(' '));
    const item = document.createElement('li'), link = document.createElement('button');
    item.dataset.errorFor = field.id; link.type = 'button'; link.textContent = message;
    link.onclick = () => reveal(field); item.append(link); list.append(item);
  }
  form.prepend(summary); reveal(summary);
  return false;
}
