const categories = {1:'Principles and Models', 2:'Interpretation', 3:'Manipulation'};
const skillActions = {
  '1.A':'Describe a concept', '1.B':'Recognize a concept in context', '1.C':'Identify a concept from data', '1.D':'Compare concepts or models',
  '2.A':'Explain an outcome', '2.B':'Explain interacting causes', '2.C':'Interpret numerical evidence',
  '3.A':'Predict an outcome', '3.B':'Trace effects across markets', '3.C':'Calculate the effect of a change'
};
const letter = index => 'ABCDE'[index];

function figure(key) {
  const market = key === 'market-surplus';
  if (!market && key !== 'output-gap') return '';
  const alt = market
    ? 'Linear supply starts at $2 and demand starts at $10. They intersect at quantity 8 and price $6.'
    : 'AD and SRAS intersect at real GDP 80. A vertical LRAS line crosses the GDP axis at 100.';
  return '<svg class="lf-figure" viewBox="0 0 324 180" role="img" aria-label="'+alt+'">' +
    '<g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M42 20V145H292"/>' +
    (market
      ? '<path stroke="#18645a" d="M42 121L234 25"/><path stroke="#244c79" d="M42 25L234 121"/><path stroke-dasharray="3 4" d="M42 73H138V145"/>'
      : '<path stroke="#18645a" d="M105 128L267 32"/><path stroke="#244c79" d="M105 32L267 128"/><path stroke="#91462f" d="M222 32V145"/><path stroke-dasharray="3 4" d="M186 80V145"/>') +
    '</g><g fill="currentColor" font-size="12" font-family="system-ui,sans-serif">' +
    (market
      ? '<text x="5" y="13">Price ($)</text><text x="20" y="29">10</text><text x="25" y="77">6</text><text x="25" y="125">2</text><text x="39" y="160">0</text><text x="135" y="160">8</text><text x="226" y="167">Quantity</text><text x="241" y="29">S</text><text x="241" y="125">D</text><circle cx="138" cy="73" r="3"/>'
      : '<text x="4" y="13">Price level</text><text x="179" y="160">80</text><text x="212" y="160">100</text><text x="208" y="20">LRAS</text><text x="270" y="34">SRAS</text><text x="270" y="132">AD</text><text x="213" y="178">Real GDP (bn)</text><circle cx="186" cy="80" r="3"/>') +
    '</g></svg>';
}

function stimulus(item, escape) {
  if (!item.table) return figure(item.figure);
  const {columns, rows} = item.table;
  return '<table class="lf-table"><thead><tr>' + columns.map(c=>'<th scope="col">'+escape(c)+'</th>').join('') +
    '</tr></thead><tbody>' + rows.map(row=>'<tr>'+row.map((v,i)=>i===0?'<th scope="row">'+escape(v)+'</th>':'<td>'+escape(v)+'</td>').join('')+'</tr>').join('') + '</tbody></table>';
}

export function exampleMarkup(items, escape) {
  if (!items?.length) return '';
  const cards = items.map((item,index) => {
    const skill = item.skill+' · '+skillActions[item.skill];
    return `<details class="lf-card" data-lf-card="${index}">
      <summary><span class="lf-term"><strong><u>${escape(item.term)}</u></strong> <span lang="zh-CN">${escape(item.translation)}</span></span>
        <span class="lf-skill" title="${escape(categories[item.skill[0]])}">${escape(skill)}</span></summary>
      <div class="lf-example"><p class="lf-rule">${escape(item.rule)}</p>
        <fieldset><legend>${escape(item.stem)}</legend>${stimulus(item,escape)}
        <div class="lf-options">${item.options.map((text,i)=>`<button type="button" data-lf-choice="${i}" aria-pressed="false"><b>${letter(i)}</b><span>${escape(text)}</span></button>`).join('')}</div></fieldset>
        <p class="lf-feedback" role="status" aria-live="polite"></p>
      </div></details>`;
  });
  return `<section class="lf-practice"><h2>MCQ focus</h2>${cards.join('')}</section>`;
}

export function bindExamples(host, items) {
  const section=host.querySelector('.lf-practice');
  if (!section || !items?.length) return;
  section.addEventListener('click',event=>{
    const button=event.target.closest('button[data-lf-choice]');
    if (!button || !section.contains(button)) return;
    const card=button.closest('[data-lf-card]');
    const item=items[Number(card.dataset.lfCard)];
    const chosen=Number(button.dataset.lfChoice);
    for (const option of card.querySelectorAll('button[data-lf-choice]')) {
      const index=Number(option.dataset.lfChoice);
      option.setAttribute('aria-pressed',String(index===chosen));
      option.dataset.mark=index===item.correct?'correct':index===chosen?'incorrect':'';
    }
    const feedback=card.querySelector('.lf-feedback');
    feedback.textContent=(chosen===item.correct?'Correct. ':'You chose '+letter(chosen)+'. Correct answer: '+letter(item.correct)+'. ')+item.explanation;
  });
}
