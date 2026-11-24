import {unitIdentity,topicUnitNumber} from './subject-catalog.js';
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
  if (!topicUnitNumber(topic)) return '';
  const unit = reference?.unit || row.libraryUnit || '';
  const identity=unitIdentity(unit);
  return identity && identity.number !== topicUnitNumber(topic) ? '' : topic;
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

export const needsCorrection = row => (row.progressStatus || row.status || 'todo') === 'todo';
const needsVerification = row => ['queued','running','manual'].includes(row.verification?.status);

// Count a bank question once per state. Its two assignment submissions can be at different stages.
export function topicWorkCounts(groups) {
  const counts=new Map();
  for(const group of groups){
    const pending=new Set(),waiting=new Set();
    for(const row of [group,...(group.occurrences||[])]){
      const topic=mistakeTopic(row)||'unknown';
      if(!counts.has(topic))counts.set(topic,{pending:0,waiting:0});
      if(needsCorrection(row))pending.add(topic);
      if(needsVerification(row))waiting.add(topic);
    }
    for(const topic of pending)counts.get(topic).pending++;
    for(const topic of waiting)counts.get(topic).waiting++;
  }
  return counts;
}
