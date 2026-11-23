import {courseLabel} from './course-scope.js';

export function mistakeNavigation(link, h, {current, subjects, subject}) {
  return `<div class="mistake-navigation">
    <nav class="mistake-views" aria-label="复习视图">
      ${link('mistakes','错题',current === 'mistakes' ? 'mistake-current' : '')}
      ${link('mistakes/bookmarks','我的书签',current === 'bookmarks' ? 'mistake-current' : '')}
    </nav>
    ${subjects.length > 1 ? `<label class="mistake-course"><span class="sr-only">学科</span>
      <select aria-label="学科" data-mistake-course>${subjects.map(c =>
        `<option value="${h(c)}"${c === subject ? ' selected' : ''}>${h(courseLabel(c))}</option>`).join('')}</select></label>` :
      `<span class="mistake-course-name">${h(courseLabel(subject))}</span>`}
  </div>`;
}

export function bindMistakeNavigation(root) {
  root.querySelector('.mistake-current')?.setAttribute('aria-current','page');
}

// The same bank question may be awaiting correction in one paper and already
// verified in another. Apply the user's filters to each occurrence.
export function matchingMistakes(groups, matches) {
  const visible = [];
  for (const group of groups) {
    const rows = [group, ...(group.occurrences || [])].filter(matches);
    if (!rows.length) continue;
    const [first, ...others] = rows;
    visible.push({...first, occurrences: others, mistakeCount: rows.length});
  }
  return visible;
}

// A unit is too broad to stand in for a topic, especially on Progress Checks.
export function mistakeTopic(row) {
  const reference = row.lessonReference;
  const topic = reference?.topic || row.topic;
  if (!/^[1-6]\.\d{1,2}$/.test(topic || '')) return '';
  const unit = reference?.unit || row.libraryUnit || '';
  return /^((micro|macro)-unit-)[1-6]$/.test(unit) && unit.at(-1) !== topic[0] ? '' : topic;
}

export function mistakeTopicOptions(scoped) {
  const topics = new Map();
  for (const group of scoped) {
    for (const row of [group, ...(group.occurrences || [])]) {
      const topic = mistakeTopic(row);
      const [prefix, title] = String(row.knowledge || '').split(/\s+·\s+/, 2);
      if (!topics.has(topic) || !topics.get(topic)) {
        topics.set(topic, topic && prefix === 'Topic ' + topic ? title || '' : '');
      }
    }
  }
  return [...topics.entries()].sort(([a], [b]) =>
    !a ? 1 : !b ? -1 : a.localeCompare(b, 'en', {numeric:true}));
}
